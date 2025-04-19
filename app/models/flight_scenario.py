from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class FlightScenario(Base):
    __tablename__ = "flight_scenarios"

    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String)
    description = Column(Text)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User") 