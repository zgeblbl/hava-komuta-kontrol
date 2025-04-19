from sqlalchemy import Column, String, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base

class Airport(Base):
    __tablename__ = "airports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    icao_code = Column(String(4), unique=True, nullable=False)  # ICAO code (e.g., LTBA)
    iata_code = Column(String(3), unique=True, nullable=True)   # IATA code (e.g., IST)
    name = Column(String, nullable=False)                       # Airport name
    city = Column(String, nullable=False)                       # City
    country = Column(String, nullable=False)                    # Country
    
    # Location
    latitude = Column(Float, nullable=False)                    # Latitude in decimal degrees
    longitude = Column(Float, nullable=False)                   # Longitude in decimal degrees
    elevation = Column(Float, nullable=True)                    # Elevation in meters

    # Relationships
    departing_flights = relationship("Aircraft", foreign_keys="[Aircraft.departure_airport_id]", back_populates="departure_airport")
    arriving_flights = relationship("Aircraft", foreign_keys="[Aircraft.destination_airport_id]", back_populates="destination_airport") 