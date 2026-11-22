from datetime import date
from enum import Enum
from typing import Optional

from sqlalchemy import Index
from sqlmodel import Field, Relationship, SQLModel


class LandmarkCategory(str, Enum):
    nature = "nature"
    culture = "culture"
    beach = "beach"
    city = "city"
    heritage = "heritage"
    other = "other"


class LocationBase(SQLModel):
    name: str = Field(index=True)
    code: str = Field(index=True, unique=True)
    slug: str | None = Field(default=None, index=True)
    level: str = Field(default="province", index=True)
    parent_id: int | None = Field(default=None, foreign_key="travel_view.location.id", index=True)

    # Post-2025 merger properties
    merged_from: str | None = Field(default=None)  # Comma-separated array of old provinces
    effective_date: date | None = Field(default=None)
    hc_key: str | None = Field(default=None, unique=True)
    area_km2: float | None = Field(default=None)
    population: int | None = Field(default=None)
    admin_center: str | None = Field(default=None)


class Location(LocationBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    __table_args__ = {"schema": "travel_view"}

    # Relationships
    landmarks: list["Landmark"] = Relationship(back_populates="location")
    statistics: list["Statistic"] = Relationship(back_populates="location")

    # Self-referencing relationship
    parent: Optional["Location"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs=dict(remote_side="Location.id"),
    )
    children: list["Location"] = Relationship(back_populates="parent")


class LandmarkBase(SQLModel):
    location_id: int = Field(foreign_key="travel_view.location.id", index=True)
    name: str
    category: LandmarkCategory
    description: str | None = Field(default=None)
    lat: float | None = Field(default=None)
    lng: float | None = Field(default=None)


class Landmark(LandmarkBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    __table_args__ = {"schema": "travel_view"}

    location: Location | None = Relationship(back_populates="landmarks")


class StatisticBase(SQLModel):
    location_id: int = Field(foreign_key="travel_view.location.id")
    record_date: date

    # The statistics data
    tourists_total: int | None = Field(default=0)
    tourists_domestic: int | None = Field(default=0)
    tourists_international: int | None = Field(default=0)

    overnight_stays_total: int | None = Field(default=0)
    overnight_stays_domestic: int | None = Field(default=0)
    overnight_stays_international: int | None = Field(default=0)

    hotels_count: int | None = Field(default=0)
    hotel_rooms_total: int | None = Field(default=0)
    hotel_guests: int | None = Field(default=0)
    hotel_overnight_stays: int | None = Field(default=0)
    hotel_rooms_available: int | None = Field(default=0)
    hotel_rooms_occupied: int | None = Field(default=0)


class Statistic(StatisticBase, table=True):
    id: int | None = Field(default=None, primary_key=True)

    location: Location | None = Relationship(back_populates="statistics")

    # Composite index for time-series geospatial query optimizations
    __table_args__ = (
        Index("ix_stat_loc_date", "location_id", "record_date"),
        {"schema": "travel_view"},
    )
