from collections import defaultdict
from typing import List

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import and_, func
from sqlmodel import Session, select

from app.core.config import settings
from app.db.database import get_session
from app.models.domain import Location, Landmark, Statistic

app = FastAPI(title="Travel View API", version="1.0.0")

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


class ProvinceStatsResponse(BaseModel):
    id: str
    hcKeys: List[str]
    name: str
    region: str
    tourists_total: int
    tourists_domestic: int
    tourists_international: int
    overnight_stays_total: int
    hotels_count: int
    hotel_rooms_total: int
    landmarks: List[ProvinceLandmarkResponse]


def parse_hc_keys(value: str | None) -> List[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


@app.get("/provinces/stats/latest", response_model=List[ProvinceStatsResponse])
def get_latest_province_stats(session: Session = Depends(get_session)):
    latest_per_location = (
        select(
            Statistic.location_id.label("location_id"),
            func.max(Statistic.record_date).label("latest_date"),
        )
        .group_by(Statistic.location_id)
        .subquery()
    )

    statement = (
        select(Location, Statistic)
        .outerjoin(
            latest_per_location,
            latest_per_location.c.location_id == Location.id,
        )
        .outerjoin(
            Statistic,
            and_(
                Statistic.location_id == latest_per_location.c.location_id,
                Statistic.record_date == latest_per_location.c.latest_date,
            ),
        )
        .where(Location.level == "province")
        .order_by(Location.name)
    )

    rows = session.exec(statement).all()
    locations = [loc for loc, _stat in rows]
    location_ids = [loc.id for loc in locations if loc.id is not None]

    landmark_rows = []
    if location_ids:
        landmark_rows = session.exec(
            select(Landmark).where(Landmark.location_id.in_(location_ids))
        ).all()

    landmarks_by_location: dict[int, list[Landmark]] = defaultdict(list)
    for lm in landmark_rows:
        landmarks_by_location[lm.location_id].append(lm)

    response: List[ProvinceStatsResponse] = []
    for location, stat in rows:
        if location.id is None:
            continue

        region = "Chua cap nhat"
        if location.parent:
            region = location.parent.name

        response.append(
            ProvinceStatsResponse(
                id=location.slug or location.code.lower(),
                hcKeys=parse_hc_keys(location.hc_key),
                name=location.name,
                region=region,
                tourists_total=stat.tourists_total or 0 if stat else 0,
                tourists_domestic=stat.tourists_domestic or 0 if stat else 0,
                tourists_international=stat.tourists_international or 0 if stat else 0,
                overnight_stays_total=stat.overnight_stays_total or 0 if stat else 0,
                hotels_count=stat.hotels_count or 0 if stat else 0,
                hotel_rooms_total=stat.hotel_rooms_total or 0 if stat else 0,
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
