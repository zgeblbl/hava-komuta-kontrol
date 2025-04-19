from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from sqlalchemy import text

from app.schemas.aircraft import AircraftCreate, AircraftUpdate, AircraftResponse
from app.models.aircraft import Aircraft
from app.auth.deps import get_db, get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=AircraftResponse, status_code=status.HTTP_201_CREATED)
def create_aircraft(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    aircraft_in: AircraftCreate
) -> Aircraft:
    """
    Create new aircraft with location, departure, and destination coordinates.
    """
    # Check if aircraft with this callsign exists
    if db.query(Aircraft).filter(Aircraft.callsign == aircraft_in.callsign).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Aircraft with this callsign already exists",
        )
    
    # Create location points
    location = None
    if aircraft_in.latitude is not None and aircraft_in.longitude is not None:
        location = text(f"POINT({aircraft_in.longitude} {aircraft_in.latitude})")
    
    departure_point = text(f"POINT({aircraft_in.departure.longitude} {aircraft_in.departure.latitude})")
    destination_point = text(f"POINT({aircraft_in.destination.longitude} {aircraft_in.destination.latitude})")
    
    aircraft = Aircraft(
        callsign=aircraft_in.callsign,
        type=aircraft_in.type,
        location=location,
        altitude=aircraft_in.altitude,
        speed=aircraft_in.speed,
        heading=aircraft_in.heading,
        departure_point=departure_point,
        destination_point=destination_point,
        departure_name=aircraft_in.departure.name,
        destination_name=aircraft_in.destination.name
    )
    db.add(aircraft)
    db.commit()
    db.refresh(aircraft)
    return aircraft

@router.get("/", response_model=List[AircraftResponse])
def get_aircrafts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
) -> List[Aircraft]:
    """
    Retrieve aircrafts with their current positions and operational data.
    """
    aircrafts = db.query(Aircraft).offset(skip).limit(limit).all()
    return aircrafts

@router.get("/{aircraft_id}", response_model=AircraftResponse)
def get_aircraft(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    aircraft_id: UUID,
) -> Aircraft:
    """
    Get aircraft by ID including location and operational data.
    """
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aircraft not found",
        )
    return aircraft

@router.put("/{aircraft_id}", response_model=AircraftResponse)
def update_aircraft(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    aircraft_id: UUID,
    aircraft_in: AircraftUpdate,
) -> Aircraft:
    """
    Update aircraft including location and flight plan coordinates.
    """
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aircraft not found",
        )
    
    update_data = aircraft_in.dict(exclude_unset=True)
    
    # Handle current location update
    if "latitude" in update_data or "longitude" in update_data:
        lat = update_data.pop("latitude", None)
        lon = update_data.pop("longitude", None)
        if lat is not None and lon is not None:
            aircraft.location = text(f"POINT({lon} {lat})")
    
    # Handle departure update
    if "departure" in update_data:
        departure = update_data.pop("departure")
        if departure:
            aircraft.departure_point = text(f"POINT({departure.longitude} {departure.latitude})")
            aircraft.departure_name = departure.name
    
    # Handle destination update
    if "destination" in update_data:
        destination = update_data.pop("destination")
        if destination:
            aircraft.destination_point = text(f"POINT({destination.longitude} {destination.latitude})")
            aircraft.destination_name = destination.name
    
    # Update other fields
    for field, value in update_data.items():
        setattr(aircraft, field, value)
    
    db.commit()
    db.refresh(aircraft)
    return aircraft

@router.delete("/{aircraft_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_aircraft(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    aircraft_id: UUID,
) -> None:
    """
    Delete aircraft.
    """
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aircraft not found",
        )
    
    db.delete(aircraft)
    db.commit() 