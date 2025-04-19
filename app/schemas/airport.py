from pydantic import BaseModel, constr, confloat
from typing import Optional
from uuid import UUID
from datetime import datetime

class AirportBase(BaseModel):
    icao_code: constr(min_length=4, max_length=4)  # ICAO code (e.g., LTBA)
    iata_code: Optional[constr(min_length=3, max_length=3)] = None  # IATA code (e.g., IST)
    name: str
    city: str
    country: str
    latitude: confloat(ge=-90, le=90)  # Latitude in decimal degrees
    longitude: confloat(ge=-180, le=180)  # Longitude in decimal degrees
    elevation: Optional[float] = None  # Elevation in meters

class AirportCreate(AirportBase):
    pass

class AirportUpdate(BaseModel):
    icao_code: Optional[constr(min_length=4, max_length=4)] = None
    iata_code: Optional[constr(min_length=3, max_length=3)] = None
    name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[confloat(ge=-90, le=90)] = None
    longitude: Optional[confloat(ge=-180, le=180)] = None
    elevation: Optional[float] = None

class AirportResponse(AirportBase):
    id: UUID

    class Config:
        from_attributes = True 