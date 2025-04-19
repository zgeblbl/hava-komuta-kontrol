from pydantic import BaseModel, Field, confloat
from typing import Optional
from uuid import UUID
from datetime import datetime

class LocationPoint(BaseModel):
    latitude: confloat(ge=-90, le=90)
    longitude: confloat(ge=-180, le=180)
    name: Optional[str] = None

class AircraftBase(BaseModel):
    callsign: str
    type: Optional[str] = None
    status: str = "active"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    altitude: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[float] = None
    departure_airport_id: UUID
    destination_airport_id: UUID

class AircraftCreate(AircraftBase):
    pass

class AircraftUpdate(BaseModel):
    type: Optional[str] = None
    status: Optional[str] = None
    latitude: Optional[confloat(ge=-90, le=90)] = None
    longitude: Optional[confloat(ge=-180, le=180)] = None
    altitude: Optional[float] = None
    speed: Optional[float] = None
    heading: Optional[confloat(ge=0, le=360)] = None
    departure: Optional[LocationPoint] = None
    destination: Optional[LocationPoint] = None

class AircraftResponse(AircraftBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True 