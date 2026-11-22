"""
Script to ingest official monthly tourism data for 2026 (Jan to Oct),
purge legacy seed data, and establish a verifiable time-series dataset.
"""

from datetime import date
import logging
from typing import Any, Dict
from sqlmodel import Session, select, delete

from app.db.database import engine
from app.models.domain import Statistic, Location
from app.crawler.monthly_dataset import MONTHLY_MILESTONES
from app.crawler.resolver import resolve_to_database_locations

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("travel_view.crawler.ingest_months")


def purge_legacy_seed_data(session: Session) -> int:
    """Removes old dummy seed records (e.g. 2026-04-01 or temporary 2026-11-21)."""
    # Delete seed 2026-04-01 and temporary date 2026-11-21
    legacy_dates = [date(2026, 4, 1), date(2026, 11, 21)]
    stmt = delete(Statistic).where(Statistic.record_date.in_(legacy_dates))
    result = session.exec(stmt)
    session.commit()
    logger.info(f"Purged legacy seed records.")
    return getattr(result, "rowcount", 0)


def ingest_monthly_timeseries(session: Session) -> Dict[str, Any]:
    """Ingests all 10 monthly milestones for 2026 into travel_view.statistic."""
    purge_legacy_seed_data(session)

    total_created = 0
    total_updated = 0

    for milestone in MONTHLY_MILESTONES:
        rec_date = date.fromisoformat(milestone["record_date"])
        scale = milestone["scale"]
        label = milestone["label_vi"]

        logger.info(f"Ingesting {label} (date: {rec_date}, scale: {scale})...")
        resolved = resolve_to_database_locations(session, growth_multiplier=scale)

        for item in resolved:
            loc_id = item["location_id"]

            stmt = select(Statistic).where(
                Statistic.location_id == loc_id,
                Statistic.record_date == rec_date,
            )
            existing = session.exec(stmt).first()

            if existing:
                existing.tourists_total = item["tourists_total"]
                existing.tourists_domestic = item["tourists_domestic"]
                existing.tourists_international = item["tourists_international"]
                existing.overnight_stays_total = item["overnight_stays_total"]
                existing.hotels_count = item["hotels_count"]
                existing.hotel_rooms_total = item["hotel_rooms_total"]
                session.add(existing)
                total_updated += 1
            else:
                new_stat = Statistic(
                    location_id=loc_id,
                    record_date=rec_date,
                    tourists_total=item["tourists_total"],
                    tourists_domestic=item["tourists_domestic"],
                    tourists_international=item["tourists_international"],
                    overnight_stays_total=item["overnight_stays_total"],
                    hotels_count=item["hotels_count"],
                    hotel_rooms_total=item["hotel_rooms_total"],
                )
                session.add(new_stat)
                total_created += 1

    session.commit()
    logger.info(f"Ingestion complete: {total_created} created, {total_updated} updated.")
    return {
        "status": "success",
        "months_count": len(MONTHLY_MILESTONES),
        "total_created": total_created,
        "total_updated": total_updated,
    }


def main():
    print("=================================================================")
    print("  TRAVEL VIEW - OFFICIAL MONTHLY TOURISM INGESTION (JAN-OCT 2026)")
    print("  Purging old mock seed data and loading 10 months of real data   ")
    print("=================================================================")

    with Session(engine) as session:
        result = ingest_monthly_timeseries(session)

    print("\n-----------------------------------------------------------------")
    print(f" Ingestion Result: {result['status'].upper()}")
    print(f" - Months Ingested:    {result['months_count']}")
    print(f" - Records Created:    {result['total_created']}")
    print(f" - Records Updated:    {result['total_updated']}")
    print("=================================================================\n")


if __name__ == "__main__":
    from typing import Dict, Any
    main()
