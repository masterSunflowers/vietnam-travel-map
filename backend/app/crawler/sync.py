"""
Sync service to coordinate scraping, resolving, and persisting official tourism statistics.
"""

import logging
from datetime import date
from typing import Any

from sqlmodel import Session, select

from app.crawler.resolver import resolve_to_database_locations
from app.crawler.vnat_client import fetch_latest_vnat_release
from app.models.domain import Statistic

logger = logging.getLogger("travel_view.crawler.sync")


def run_sync_pipeline(
    session: Session,
    target_date: date | None = None,
    apply_growth: bool = True,
) -> dict[str, Any]:
    """
    Executes the full tourism statistics synchronization pipeline:
    1. Fetches official release metadata from VNAT.
    2. Aggregates official 63 province datasets into the 34 merged provinces.
    3. Upserts records into the travel_view.statistic table.
    """
    if target_date is None:
        target_date = date.today()

    logger.info(f"Starting tourism data sync pipeline for date {target_date}...")

    # Step 1: Query VNAT live release
    vnat_info = fetch_latest_vnat_release()
    growth_rate = vnat_info.get("international_growth_rate", 0.0)

    # Calculate multiplier if growth rate detected (e.g. 13.8% -> 1.138)
    multiplier = 1.0
    if apply_growth and growth_rate > 0:
        multiplier = 1.0 + (growth_rate / 100.0)
        logger.info(f"Applying VNAT growth multiplier: x{multiplier:.4f} (+{growth_rate}%)")
    else:
        logger.info("Using baseline official metrics without scaling.")

    # Step 2: Resolve and aggregate to 34 merged provinces
    resolved = resolve_to_database_locations(session, growth_multiplier=multiplier)
    logger.info(f"Resolved {len(resolved)} merged provinces matching database locations.")

    # Step 3: Upsert into database
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
    logger.info(f"Sync complete. Created: {created_count}, Updated: {updated_count}")

    return {
        "status": "success",
        "target_date": target_date.isoformat(),
        "total_provinces": len(resolved),
        "created_records": created_count,
        "updated_records": updated_count,
        "vnat_source": vnat_info.get("source"),
        "vnat_status": vnat_info.get("status"),
        "latest_report_title": vnat_info.get("latest_report_title"),
        "latest_report_date": vnat_info.get("latest_report_date"),
        "growth_rate_applied": growth_rate if (apply_growth and growth_rate > 0) else None,
    }
