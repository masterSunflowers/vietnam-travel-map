from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import date as dt_date
from typing import Any

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.config import settings
from app.core.scheduler import get_scheduler_status, start_scheduler, stop_scheduler
from app.crawler.auto_sync import (
    AutoSyncResult,
    SyncDeltaReport,
    evaluate_sync_delta,
    execute_auto_sync,
)
from app.crawler.monthly_dataset import MONTHLY_MILESTONES
from app.crawler.province_mapping import MERGED_PROVINCES
from app.crawler.sync import run_sync_pipeline
from app.db.database import get_session
from app.models.domain import Landmark, Location, Statistic


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="Travel View API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Welcome to Travel View API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


class ProvinceLandmarkResponse(BaseModel):
    name: str
    type: str
    description: str


class DateOptionResponse(BaseModel):
    date: str
    label_vi: str
    label_short_vi: str | None = None
    label_monthly_vi: str | None = None
    label_en: str
    label_short_en: str | None = None
    label_monthly_en: str | None = None
    is_latest: bool
    source: str
    source_url: str
    publication_title: str
    publication_date: str
    report_url: str


class ProvinceStatsResponse(BaseModel):
    id: str
    hcKeys: list[str]
    name: str
    region: str
    merged_from: str | None = None
    record_date: str | None = None
    citation_url: str | None = None
    tourists_total: int
    tourists_domestic: int
    tourists_international: int
    overnight_stays_total: int
    hotels_count: int
    hotel_rooms_total: int
    landmarks: list[ProvinceLandmarkResponse]


def parse_hc_keys(value: str | None) -> list[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


@app.get("/provinces/stats/dates", response_model=list[DateOptionResponse])
def get_available_dates(session: Session = Depends(get_session)):
    """
    Get all available record dates in database with publication metadata.
    """
    dates = session.exec(
        select(Statistic.record_date).distinct().order_by(Statistic.record_date.desc())
    ).all()

    if not dates:
        return []

    latest_date = dates[0]
    milestone_by_date = {m["record_date"]: m for m in MONTHLY_MILESTONES}
    result: list[DateOptionResponse] = []

    for d in dates:
        d_str = d.isoformat()
        is_latest = d == latest_date
        meta = milestone_by_date.get(d_str)

        if meta:
            result.append(
                DateOptionResponse(
                    date=d_str,
                    label_vi=meta["label_vi"],
                    label_short_vi=meta.get("label_short_vi", meta["label_vi"]),
                    label_monthly_vi=meta.get("label_monthly_vi", meta["label_vi"]),
                    label_en=meta["label_en"],
                    label_short_en=meta.get("label_short_en", meta["label_en"]),
                    label_monthly_en=meta.get("label_monthly_en", meta["label_en"]),
                    is_latest=is_latest,
                    source=meta["source"],
                    source_url=meta["source_url"],
                    publication_title=meta["publication_title"],
                    publication_date=meta["publication_date"],
                    report_url=meta["report_url"],
                )
            )
        else:
            result.append(
                DateOptionResponse(
                    date=d_str,
                    label_vi=f"Kỳ {d.strftime('%m/%Y')} (Lũy kế)",
                    label_short_vi=f"Tháng {d.strftime('%m/%Y')}",
                    label_monthly_vi=f"Tháng {d.strftime('%m/%Y')}",
                    label_en=f"Period {d.strftime('%m/%Y')} (Cumulative)",
                    label_short_en=d.strftime("%b %Y"),
                    label_monthly_en=f"Month {d.strftime('%m/%Y')}",
                    is_latest=is_latest,
                    source="Cục Du lịch Quốc gia Việt Nam (VNAT)",
                    source_url="https://vietnamtourism.gov.vn/statistic",
                    publication_title=f"Số liệu thống kê du lịch {d.strftime('%m/%Y')}",
                    publication_date=d_str,
                    report_url="https://vietnamtourism.gov.vn/statistic",
                )
            )

    return result


@app.get("/provinces/stats/latest", response_model=list[ProvinceStatsResponse])
def get_latest_province_stats(
    date: str | None = Query(
        default=None, description="Filter statistics by record date (YYYY-MM-DD)"
    ),
    view_mode: str = Query(
        default="cumulative",
        description="Perspective: 'cumulative' (YTD) or 'monthly' (single month)",
    ),
    session: Session = Depends(get_session),
):
    all_dates = session.exec(
        select(Statistic.record_date).distinct().order_by(Statistic.record_date.desc())
    ).all()

    if not all_dates:
        return []

    target_date = None
    if date:
        try:
            target_date = dt_date.fromisoformat(date)
        except ValueError:
            target_date = None
    if not target_date or target_date not in all_dates:
        target_date = all_dates[0]

    prev_date = None
    if view_mode == "monthly":
        try:
            curr_idx = all_dates.index(target_date)
            if curr_idx + 1 < len(all_dates):
                prev_date = all_dates[curr_idx + 1]
        except ValueError:
            pass

    locations = session.exec(
        select(Location).where(Location.level == "province").order_by(Location.name)
    ).all()
    location_ids = [loc.id for loc in locations if loc.id is not None]

    stats_curr_rows = session.exec(
        select(Statistic).where(
            Statistic.record_date == target_date,
            Statistic.location_id.in_(location_ids),
        )
    ).all()
    stats_curr = {s.location_id: s for s in stats_curr_rows}

    stats_prev = {}
    if prev_date:
        stats_prev_rows = session.exec(
            select(Statistic).where(
                Statistic.record_date == prev_date,
                Statistic.location_id.in_(location_ids),
            )
        ).all()
        stats_prev = {s.location_id: s for s in stats_prev_rows}

    landmark_rows: list[Landmark] = []
    if location_ids:
        landmark_rows = list(
            session.exec(select(Landmark).where(Landmark.location_id.in_(location_ids))).all()
        )

    landmarks_by_location: dict[int, list[Landmark]] = defaultdict(list)
    for lm in landmark_rows:
        landmarks_by_location[lm.location_id].append(lm)

    milestone_by_date = {m["record_date"]: m for m in MONTHLY_MILESTONES}
    rec_date_str = target_date.isoformat()
    month_meta = milestone_by_date.get(rec_date_str)
    resolved_citation = (
        month_meta.get("report_url")
        if month_meta and month_meta.get("report_url")
        else "https://vietnamtourism.gov.vn/statistic"
    )

    response: list[ProvinceStatsResponse] = []
    for location in locations:
        if location.id is None:
            continue

        region = "Chua cap nhat"
        if location.parent:
            region = location.parent.name

        sub_provinces = MERGED_PROVINCES.get(location.code, {}).get("sub_provinces", [])
        resolved_merged_from = location.merged_from or (
            ", ".join(sub_provinces) if sub_provinces else None
        )

        stat_c = stats_curr.get(location.id)
        stat_p = stats_prev.get(location.id) if prev_date else None

        if view_mode == "monthly" and prev_date and stat_c and stat_p:
            t_total = max(0, (stat_c.tourists_total or 0) - (stat_p.tourists_total or 0))
            t_dom = max(0, (stat_c.tourists_domestic or 0) - (stat_p.tourists_domestic or 0))
            t_intl = max(
                0,
                (stat_c.tourists_international or 0) - (stat_p.tourists_international or 0),
            )
            t_overnight = max(
                0,
                (stat_c.overnight_stays_total or 0) - (stat_p.overnight_stays_total or 0),
            )
        elif stat_c:
            t_total = stat_c.tourists_total or 0
            t_dom = stat_c.tourists_domestic or 0
            t_intl = stat_c.tourists_international or 0
            t_overnight = stat_c.overnight_stays_total or 0
        else:
            t_total = 0
            t_dom = 0
            t_intl = 0
            t_overnight = 0

        h_count = stat_c.hotels_count or 0 if stat_c else 0
        h_rooms = stat_c.hotel_rooms_total or 0 if stat_c else 0

        response.append(
            ProvinceStatsResponse(
                id=location.slug or location.code.lower(),
                hcKeys=parse_hc_keys(location.hc_key),
                name=location.name,
                region=region,
                merged_from=resolved_merged_from,
                record_date=rec_date_str,
                citation_url=resolved_citation,
                tourists_total=t_total,
                tourists_domestic=t_dom,
                tourists_international=t_intl,
                overnight_stays_total=t_overnight,
                hotels_count=h_count,
                hotel_rooms_total=h_rooms,
                landmarks=[
                    ProvinceLandmarkResponse(
                        name=lm.name,
                        type=lm.category.value,
                        description=lm.description or "",
                    )
                    for lm in landmarks_by_location[location.id]
                ],
            )
        )

    return response


class SyncResponse(BaseModel):
    status: str
    target_date: str
    total_provinces: int
    created_records: int
    updated_records: int
    vnat_source: str | None = None
    vnat_status: str | None = None
    latest_report_title: str | None = None
    latest_report_date: str | None = None
    growth_rate_applied: float | None = None


@app.post("/admin/sync-stats", response_model=SyncResponse)
def trigger_sync_stats(
    session: Session = Depends(get_session),
    no_growth: bool = False,
):
    """
    Trigger real-time / on-demand tourism statistics synchronization.
    Crawls latest official reports from VNAT and updates the 34 merged provinces.
    """
    return run_sync_pipeline(
        session=session,
        apply_growth=not no_growth,
    )


class AdminSyncStatusResponse(BaseModel):
    delta: SyncDeltaReport
    scheduler: dict[str, Any]


@app.get("/admin/sync/status", response_model=AdminSyncStatusResponse)
def get_admin_sync_status(session: Session = Depends(get_session)):
    """
    Check sync status: compares latest milestone in DB vs latest available online,
    and reports scheduler status.
    """
    delta = evaluate_sync_delta(session=session)
    sched = get_scheduler_status()
    return AdminSyncStatusResponse(delta=delta, scheduler=sched)


@app.post("/admin/sync/auto", response_model=AutoSyncResult)
def trigger_admin_auto_sync(
    force: bool = Query(default=False, description="Force sync even if up to date"),
    dry_run: bool = Query(default=False, description="Simulate without writing to DB"),
    session: Session = Depends(get_session),
):
    """
    Trigger smart automated synchronization: only crawls and writes to database
    if online source has newer data (or if force=True).
    """
    return execute_auto_sync(session=session, force=force, dry_run=dry_run)

