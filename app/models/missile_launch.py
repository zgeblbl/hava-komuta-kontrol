from sqlalchemy import Column, String, Float, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class MissileLaunch(Base):
    __tablename__ = "missile_launches"

    id = Column(UUID(as_uuid=True), primary_key=True)
    aircraft_id = Column(UUID(as_uuid=True), ForeignKey("aircrafts.id"), index=True)
    missile_type = Column(String, nullable=False)
    launch_latitude = Column(Float)  # in degrees
    launch_longitude = Column(Float)  # in degrees
    launch_altitude = Column(Float)  # in meters
    target_latitude = Column(Float)  # in degrees
    target_longitude = Column(Float)  # in degrees
    launch_time = Column(DateTime, default=datetime.utcnow, index=True)
    result = Column(Enum('hit', 'miss', 'unknown', name='missile_result'))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    # Relationships
    aircraft = relationship("Aircraft", back_populates="missile_launches")
    user = relationship("User") 