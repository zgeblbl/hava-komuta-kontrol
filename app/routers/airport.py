from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from app.schemas.airport import AirportCreate, AirportUpdate, AirportResponse
from app.models.airport import Airport
from app.database import get_db
from app.auth.deps import get_current_user
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=AirportResponse, status_code=status.HTTP_201_CREATED)
def create_airport(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    airport_in: AirportCreate
) -> Airport:
    """
    Create new airport.
    """
    # Check if airport with this ICAO code exists
    if db.query(Airport).filter(Airport.icao_code == airport_in.icao_code).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Airport with this ICAO code already exists",
        )
    
    # Check if airport with this IATA code exists (if provided)
    if airport_in.iata_code and db.query(Airport).filter(Airport.iata_code == airport_in.iata_code).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Airport with this IATA code already exists",
        )
    
    airport = Airport(**airport_in.dict())
    db.add(airport)
    db.commit()
    db.refresh(airport)
    return airport

@router.get("/", response_model=List[AirportResponse])
def get_airports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100
) -> List[Airport]:
    """
    Retrieve airports.
    """
    airports = db.query(Airport).offset(skip).limit(limit).all()
    return airports

@router.get("/{airport_id}", response_model=AirportResponse)
def get_airport(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    airport_id: UUID,
) -> Airport:
    """
    Get airport by ID.
    """
    airport = db.query(Airport).filter(Airport.id == airport_id).first()
    if not airport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Airport not found",
        )
    return airport

@router.put("/{airport_id}", response_model=AirportResponse)
def update_airport(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    airport_id: UUID,
    airport_in: AirportUpdate,
) -> Airport:
    """
    Update airport.
    """
    airport = db.query(Airport).filter(Airport.id == airport_id).first()
    if not airport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Airport not found",
        )
    
    update_data = airport_in.dict(exclude_unset=True)
    
    # Check ICAO code uniqueness if being updated
    if "icao_code" in update_data:
        existing = db.query(Airport).filter(
            Airport.icao_code == update_data["icao_code"],
            Airport.id != airport_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Airport with this ICAO code already exists",
            )
    
    # Check IATA code uniqueness if being updated
    if "iata_code" in update_data and update_data["iata_code"]:
        existing = db.query(Airport).filter(
            Airport.iata_code == update_data["iata_code"],
            Airport.id != airport_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Airport with this IATA code already exists",
            )
    
    for field, value in update_data.items():
        setattr(airport, field, value)
    
    db.commit()
    db.refresh(airport)
    return airport

@router.delete("/{airport_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_airport(
    *,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    airport_id: UUID,
) -> None:
    """
    Delete airport.
    """
    airport = db.query(Airport).filter(Airport.id == airport_id).first()
    if not airport:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Airport not found",
        )
    
    # Check if airport has any associated flights
    if airport.departing_flights or airport.arriving_flights:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete airport with associated flights",
        )
    
    db.delete(airport)
    db.commit() 