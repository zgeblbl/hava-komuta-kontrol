from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.aircraft import Aircraft
from app.crud.aircraft import get_all_aircrafts, get_aircraft_by_id

router = APIRouter()

@router.get("/", response_model=List[Aircraft])
def get_aircrafts():
    return get_all_aircrafts()

@router.get("/{aircraft_id}", response_model=Aircraft)
def get_aircraft(aircraft_id: int):
    aircraft = get_aircraft_by_id(aircraft_id)
    if aircraft is None:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    return aircraft
