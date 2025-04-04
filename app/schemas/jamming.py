from pydantic import BaseModel
from typing import Optional

class JammingZone(BaseModel):
    id: int
    latitude: float
    longitude: float
    radius_km: float
    description: Optional[str] = None
