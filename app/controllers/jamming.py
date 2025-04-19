from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.jamming import JammingZone
from app.crud.jamming import get_all_zones, add_zone, delete_zone

router = APIRouter()

@router.get("/map", response_model=List[JammingZone])
def get_jamming_map():
    return get_all_zones()

@router.post("/zone", response_model=JammingZone)
def create_jamming_zone(zone: JammingZone):
    return add_zone(zone)

@router.delete("/zone/{zone_id}")
def remove_jamming_zone(zone_id: int):
    deleted = delete_zone(zone_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Zone not found")
    return {"message": f"Zone {zone_id} deleted"}
