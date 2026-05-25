from typing import Optional, List
from sqlmodel import Field, SQLModel, Relationship
from datetime import date
from sqlalchemy import Index
from enum import Enum

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
    slug: Optional[str] = Field(default=None, index=True)
    level: str = Field(default="province", index=True)
    parent_id: Optional[int] = Field(default=None, foreign_key="travel_view.location.id", index=True)
    
    # Post-2025 merger properties
    merged_from: Optional[str] = Field(default=None) # Comma-separated array of old provinces
    effective_date: Optional[date] = Field(default=None)
    hc_key: Optional[str] = Field(default=None, unique=True)
    area_km2: Optional[float] = Field(default=None)
    population: Optional[int] = Field(default=None)
    admin_center: Optional[str] = Field(default=None)

class Location(LocationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    __table_args__ = {"schema": "travel_view"}
    
    # Relationships
    landmarks: List["Landmark"] = Relationship(back_populates="location")
    statistics: List["Statistic"] = Relationship(back_populates="location")
    
    # Self-referencing relationship
    parent: Optional["Location"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs=dict(remote_side="Location.id")
    )
    children: List["Location"] = Relationship(back_populates="parent")

class LandmarkBase(SQLModel):
    location_id: int = Field(foreign_key="travel_view.location.id", index=True)
    name: str
    category: LandmarkCategory
    description: Optional[str] = Field(default=None)
    lat: Optional[float] = Field(default=None)
    lng: Optional[float] = Field(default=None)

class Landmark(LandmarkBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    __table_args__ = {"schema": "travel_view"}
    
    location: Optional[Location] = Relationship(back_populates="landmarks")

class StatisticBase(SQLModel):
    location_id: int = Field(foreign_key="travel_view.location.id")
    record_date: date
    
    # The statistics data
    tourists_total: Optional[int] = Field(default=0)
    tourists_domestic: Optional[int] = Field(default=0)
    tourists_international: Optional[int] = Field(default=0)
    
    overnight_stays_total: Optional[int] = Field(default=0)
    overnight_stays_domestic: Optional[int] = Field(default=0)
    overnight_stays_international: Optional[int] = Field(default=0)
    
    hotels_count: Optional[int] = Field(default=0)
    hotel_rooms_total: Optional[int] = Field(default=0)
    hotel_guests: Optional[int] = Field(default=0)
    hotel_overnight_stays: Optional[int] = Field(default=0)
    hotel_rooms_available: Optional[int] = Field(default=0)
    hotel_rooms_occupied: Optional[int] = Field(default=0)

class Statistic(StatisticBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    
    location: Optional[Location] = Relationship(back_populates="statistics")

    # Composite index for time-series geospatial query optimizations
    __table_args__ = (
        Index("ix_stat_loc_date", "location_id", "record_date"),
        {"schema": "travel_view"}
    )
