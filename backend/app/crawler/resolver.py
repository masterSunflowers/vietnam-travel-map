"""
Resolver module for Travel View.
Aggregates official statistics from 63 traditional provinces into the 34 merged provinces.
"""

from collections import defaultdict
from typing import Any

from sqlmodel import Session, select

from app.crawler.official_dataset import OFFICIAL_PROVINCE_STATS
from app.crawler.province_mapping import MERGED_PROVINCES, resolve_merged_code
from app.models.domain import Location


def aggregate_province_statistics(
    growth_multiplier: float = 1.0,
) -> dict[str, dict[str, int]]:
    """
    Aggregates statistics from 63 traditional provinces into 34 merged provinces.
    Returns a dictionary keyed by merged province code (e.g. 'HN', 'HCM', 'DN').
    """
    aggregated: dict[str, dict[str, int]] = defaultdict(
        lambda: {
            "tourists_total": 0,
            "tourists_domestic": 0,
            "tourists_international": 0,
            "overnight_stays_total": 0,
            "hotels_count": 0,
            "hotel_rooms_total": 0,
        }
    )

    for prov_name, stats in OFFICIAL_PROVINCE_STATS.items():
        merged_code = resolve_merged_code(prov_name)
        if not merged_code:
            continue

        target = aggregated[merged_code]
        target["tourists_total"] += int(stats["tourists_total"] * growth_multiplier)
        target["tourists_domestic"] += int(stats["tourists_domestic"] * growth_multiplier)
        target["tourists_international"] += int(stats["tourists_international"] * growth_multiplier)
        target["overnight_stays_total"] += int(stats["overnight_stays_total"] * growth_multiplier)
        target["hotels_count"] += int(stats["hotels_count"])
        target["hotel_rooms_total"] += int(stats["hotel_rooms_total"])

    return dict(aggregated)


def resolve_to_database_locations(
    session: Session,
    growth_multiplier: float = 1.0,
) -> list[dict[str, Any]]:
    """
    Maps aggregated statistics to actual database Location IDs.
    Returns a list of dicts with 'location_id', 'code', 'name', and statistic metrics.
    """
    # Fetch all province locations from travel_view.location
    statement = select(Location).where(Location.level == "province")
    locations = session.exec(statement).all()
    loc_by_code: dict[str, Location] = {loc.code: loc for loc in locations if loc.code}

    aggregated = aggregate_province_statistics(growth_multiplier=growth_multiplier)
    resolved_records: list[dict[str, Any]] = []

    for code, metrics in aggregated.items():
        loc = loc_by_code.get(code)
        if not loc or loc.id is None:
            continue

        sub_list = MERGED_PROVINCES.get(code, {}).get("sub_provinces", [])
        merged_str = ", ".join(sub_list) if sub_list else None
        if merged_str and loc.merged_from != merged_str:
            loc.merged_from = merged_str
            session.add(loc)

        record = {
            "location_id": loc.id,
            "code": code,
            "name": loc.name,
            "merged_from": merged_str,
            **metrics,
        }
        resolved_records.append(record)

    return resolved_records
