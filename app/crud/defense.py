from app.schemas.defense import LaunchRequest, LaunchResponse
from app.crud.aircraft import remove_aircraft

def launch_missile(req: LaunchRequest) -> LaunchResponse:
    destroyed = remove_aircraft(req.aircraft_id)
    if destroyed:
        return LaunchResponse(message=f"Missile from {req.fired_by} destroyed Aircraft #{req.aircraft_id}.", destroyed=True)
    else:
        return LaunchResponse(message=f"Missile from {req.fired_by} failed. Aircraft #{req.aircraft_id} not found.", destroyed=False)
