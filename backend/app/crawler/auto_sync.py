"""
Automated Synchronization Engine.
Monitors online tourism releases (VNAT/GSO), compares against the latest
milestone in PostgreSQL (travel_view.statistic), and triggers automated
ingestion and upsert when newer data is published.
"""

import argparse
import logging
import time
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel
from sqlalchemy import func
from sqlmodel import Session, select

from app.crawler.online_checker import OnlineMilestoneInfo, fetch_online_latest_milestone
from app.crawler.resolver import resolve_to_database_locations
from app.db.database import engine
from app.models.domain import Statistic

logger = logging.getLogger("travel_view.crawler.auto_sync")


class SyncDeltaReport(BaseModel):
    """Evaluation result comparing local database vs online milestone."""

    has_update: bool
    db_latest_date: str | None
    online_latest_date: str
    target_year: int
    target_month: int
    online_title: str
    online_report_url: str
    online_source: str
    growth_rate: float
    difference_days: int
    checked_at: str


class AutoSyncResult(BaseModel):
    """Result of an auto-sync execution."""

    status: str  # "up_to_date" | "dry_run" | "success" | "error"
    action_taken: str  # "SKIPPED" | "WOULD_SYNC" | "SYNCED" | "FAILED"
    records_ingested: int = 0
    created_records: int = 0
    updated_records: int = 0
    target_record_date: str | None = None
    message: str = ""
    delta: SyncDeltaReport | None = None
    details: dict[str, Any] = {}


def get_db_latest_record_date(session: Session) -> date | None:
    """Queries the maximum record_date currently stored in travel_view.statistic."""
    statement = select(func.max(Statistic.record_date))
    result = session.exec(statement).first()
    if isinstance(result, date):
        return result
    return None


def evaluate_sync_delta(
    session: Session,
    db_date_override: date | None = None,
    online_info_override: OnlineMilestoneInfo | None = None,
) -> SyncDeltaReport:
    """
    Compares the latest date in the database with the latest milestone online.
    Returns a SyncDeltaReport indicating whether newer data is available online.
    """
    # 1. Determine DB latest date
    db_latest = db_date_override if db_date_override is not None else get_db_latest_record_date(session)

    # 2. Determine Online latest milestone
    online_info = (
        online_info_override
        if online_info_override is not None
        else fetch_online_latest_milestone()
    )

    # 3. Compare dates
    online_date = online_info.target_record_date
    has_update = False
    diff_days = 0

    if db_latest is None:
        has_update = True
    elif online_date > db_latest:
        has_update = True
        diff_days = (online_date - db_latest).days
    else:
        has_update = False
        diff_days = (online_date - db_latest).days

    return SyncDeltaReport(
        has_update=has_update,
        db_latest_date=db_latest.isoformat() if db_latest else None,
        online_latest_date=online_date.isoformat(),
        target_year=online_info.target_year,
        target_month=online_info.target_month,
        online_title=online_info.publication_title,
        online_report_url=online_info.report_url,
        online_source=online_info.source,
        growth_rate=online_info.international_growth_rate,
        difference_days=diff_days,
        checked_at=datetime.now().isoformat(),
    )


def execute_auto_sync(
    session: Session,
    db_date_override: date | None = None,
    online_info_override: OnlineMilestoneInfo | None = None,
    force: bool = False,
    dry_run: bool = False,
) -> AutoSyncResult:
    """
    Executes the sync pipeline if newer data is available or if forced.
    """
    # 1. Fetch milestone & evaluate delta
    online_info = (
        online_info_override
        if online_info_override is not None
        else fetch_online_latest_milestone()
    )
    delta = evaluate_sync_delta(
        session=session,
        db_date_override=db_date_override,
        online_info_override=online_info,
    )

    target_date = online_info.target_record_date
    target_date_str = target_date.isoformat()

    # 2. Check if sync is needed
    if not delta.has_update and not force:
        logger.info(
            f"Auto-sync skipped: DB ({delta.db_latest_date}) is up to date with online ({delta.online_latest_date})."
        )
        return AutoSyncResult(
            status="up_to_date",
            action_taken="SKIPPED",
            records_ingested=0,
            target_record_date=target_date_str,
            message=f"Database is up to date ({delta.db_latest_date}). No sync needed.",
            delta=delta,
        )

    # 3. Dry-run mode
    if dry_run:
        logger.info(f"Auto-sync dry-run: newer data available online ({target_date_str}).")
        return AutoSyncResult(
            status="dry_run",
            action_taken="WOULD_SYNC",
            records_ingested=0,
            target_record_date=target_date_str,
            message=f"Dry run: newer milestone available online ({target_date_str} vs DB {delta.db_latest_date}). Ingestion skipped.",
            delta=delta,
        )

    # 4. Perform live ingestion & upsert
    logger.info(
        f"Auto-sync executing: ingesting milestone {target_date_str} (force={force})..."
    )

    try:
        # Determine growth multiplier from online info
        growth_rate = online_info.international_growth_rate
        multiplier = 1.0
        if growth_rate > 0:
            multiplier = 1.0 + (growth_rate / 100.0)

        resolved = resolve_to_database_locations(session, growth_multiplier=multiplier)

        created_count = 0
        updated_count = 0

        for item in resolved:
            loc_id = item["location_id"]
            statement = select(Statistic).where(
                Statistic.location_id == loc_id,
                Statistic.record_date == target_date,
            )
            existing = session.exec(statement).first()

            if existing:
                existing.tourists_total = item["tourists_total"]
                existing.tourists_domestic = item["tourists_domestic"]
                existing.tourists_international = item["tourists_international"]
                existing.overnight_stays_total = item["overnight_stays_total"]
                existing.hotels_count = item["hotels_count"]
                existing.hotel_rooms_total = item["hotel_rooms_total"]
                session.add(existing)
                updated_count += 1
            else:
                new_stat = Statistic(
                    location_id=loc_id,
                    record_date=target_date,
                    tourists_total=item["tourists_total"],
                    tourists_domestic=item["tourists_domestic"],
                    tourists_international=item["tourists_international"],
                    overnight_stays_total=item["overnight_stays_total"],
                    hotels_count=item["hotels_count"],
                    hotel_rooms_total=item["hotel_rooms_total"],
                )
                session.add(new_stat)
                created_count += 1

        session.commit()
        total_ingested = created_count + updated_count

        logger.info(
            f"Auto-sync completed successfully: {total_ingested} records ({created_count} created, {updated_count} updated) for {target_date_str}."
        )

        return AutoSyncResult(
            status="success",
            action_taken="SYNCED",
            records_ingested=total_ingested,
            created_records=created_count,
            updated_records=updated_count,
            target_record_date=target_date_str,
            message=f"Successfully synced {total_ingested} records for {target_date_str}.",
            delta=delta,
            details={
                "growth_rate_applied": growth_rate if growth_rate > 0 else None,
                "online_publication": online_info.publication_title,
            },
        )
    except Exception as exc:
        session.rollback()
        logger.error(f"Auto-sync failed: {exc}", exc_info=True)
        return AutoSyncResult(
            status="error",
            action_taken="FAILED",
            records_ingested=0,
            target_record_date=target_date_str,
            message=f"Sync execution failed: {exc}",
            delta=delta,
        )


def run_sync_cycle(force: bool = False, dry_run: bool = False) -> AutoSyncResult:
    """Single standalone sync cycle creating its own database session."""
    with Session(engine) as session:
        return execute_auto_sync(session, force=force, dry_run=dry_run)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Travel View - Automated Tourism Data Synchronization Job"
    )
    parser.add_argument(
        "--run-once",
        action="store_true",
        help="Run synchronization check once and exit immediately.",
    )
    parser.add_argument(
        "--interval",
        type=int,
        default=21600,
        help="Loop interval in seconds when running continuously (default: 21600 = 6 hours).",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Force sync even if local database is already up to date.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Perform online check and comparison without persisting records to database.",
    )
    parser.add_argument(
        "--check-only",
        action="store_true",
        help="Only display comparison delta between DB and online sources, then exit.",
    )

    args = parser.parse_args()

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )

    print("==================================================================")
    print("   TRAVEL VIEW - AUTOMATED TOURISM DATA SYNC JOB                  ")
    print("==================================================================")

    if args.check_only:
        with Session(engine) as session:
            delta = evaluate_sync_delta(session)
            print(f"Latest in Database:    {delta.db_latest_date or 'No records'}")
            print(f"Latest Online Source:  {delta.online_latest_date} ({delta.online_title})")
            print(f"Source:                {delta.online_source}")
            print(f"Update Available:      {'YES - NEW DATA' if delta.has_update else 'NO - UP TO DATE'}")
            print(f"Difference (Days):     {delta.difference_days}")
            print(f"Checked at:            {delta.checked_at}")
        return

    if args.run_once:
        print(f"Executing single sync cycle (force={args.force}, dry_run={args.dry_run})...")
        res = run_sync_cycle(force=args.force, dry_run=args.dry_run)
        print(f"\nResult: {res.status.upper()} | Action: {res.action_taken}")
        print(f"Message: {res.message}")
        print(f"Records Ingested: {res.records_ingested} (Created: {res.created_records}, Updated: {res.updated_records})")
        return

    # Continuous loop mode
    print(f"Starting continuous sync daemon (interval: {args.interval}s, force={args.force}, dry_run={args.dry_run})...")
    print("Press Ctrl+C to terminate.")

    while True:
        try:
            print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Checking online milestone...")
            res = run_sync_cycle(force=args.force, dry_run=args.dry_run)
            print(f"Status: {res.status} | Action: {res.action_taken} | Ingested: {res.records_ingested}")
            print(f"Message: {res.message}")
        except Exception as err:
            logger.error(f"Error in sync daemon cycle: {err}")

        time.sleep(args.interval)


if __name__ == "__main__":
    main()
