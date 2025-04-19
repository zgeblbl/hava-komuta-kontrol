from sqlalchemy import Column, String, Enum, DateTime, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.db.base import Base

class Aircraft(Base):
    __tablename__ = "aircrafts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    callsign = Column(String, unique=True, nullable=False)
    type = Column(String, nullable=True)
    status = Column(Enum("active", "destroyed", "jammed", name="aircraft_status"), default="active")
    
    # Current Position
    latitude = Column(Float, nullable=True)    # latitude in decimal degrees
    longitude = Column(Float, nullable=True)   # longitude in decimal degrees
    altitude = Column(Float, nullable=True)    # altitude in meters
    speed = Column(Float, nullable=True)       # speed in knots
    heading = Column(Float, nullable=True)     # heading in degrees (0-360)

    # Flight Plan Information
    departure_airport_id = Column(UUID(as_uuid=True), ForeignKey("airports.id"), nullable=False)
    destination_airport_id = Column(UUID(as_uuid=True), ForeignKey("airports.id"), nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    departure_airport = relationship("Airport", foreign_keys=[departure_airport_id], back_populates="departing_flights")
    destination_airport = relationship("Airport", foreign_keys=[destination_airport_id], back_populates="arriving_flights")
    position_logs = relationship("PositionLog", back_populates="aircraft", cascade="all, delete-orphan")
    missile_launches = relationship("MissileLaunch", back_populates="aircraft", cascade="all, delete-orphan")
