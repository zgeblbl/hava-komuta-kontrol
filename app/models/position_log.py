from sqlalchemy import Column, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class PositionLog(Base):
    __tablename__ = "position_logs"

    id = Column(UUID(as_uuid=True), primary_key=True)
    aircraft_id = Column(UUID(as_uuid=True), ForeignKey("aircrafts.id"), index=True)
    latitude = Column(Float)  # in degrees
    longitude = Column(Float)  # in degrees
    altitude = Column(Float)  # in meters
    speed = Column(Float)     # in knots
    heading = Column(Float)   # in degrees (0-360)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    aircraft = relationship("Aircraft", back_populates="position_logs") 