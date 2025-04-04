from pydantic import BaseModel
from typing import Optional, List, Tuple

class Aircraft(BaseModel):
    id: int
    latitude: float
    longitude: float
    altitude: float
    speed: float
    heading: float
    target_latitude: Optional[float] = None
    target_longitude: Optional[float] = None
    track: Optional[List[Tuple[float, float]]] = []
