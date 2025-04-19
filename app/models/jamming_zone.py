from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class JammingZone(Base):
    __tablename__ = "jamming_zones"

    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    coordinates = Column(JSON)  # Store polygon coordinates as JSON array
    created_at = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)

    # Relationships
    user = relationship("User", back_populates="jamming_zones") 