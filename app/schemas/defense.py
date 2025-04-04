from pydantic import BaseModel

class LaunchRequest(BaseModel):
    aircraft_id: int
    fired_by: str

class LaunchResponse(BaseModel):
    message: str
    destroyed: bool
