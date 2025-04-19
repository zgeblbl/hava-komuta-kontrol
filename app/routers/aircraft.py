from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.aircraft import Aircraft
from app.schemas.aircraft import AircraftCreate, AircraftResponse

router = APIRouter()

@router.get("/", response_model=List[AircraftResponse])
def get_aircrafts(db: Session = Depends(get_db)):
    return db.query(Aircraft).all()

@router.post("/", response_model=AircraftResponse)
def create_aircraft(aircraft: AircraftCreate, db: Session = Depends(get_db)):
    db_aircraft = Aircraft(**aircraft.dict())
    db.add(db_aircraft)
    db.commit()
    db.refresh(db_aircraft)
    return db_aircraft

@router.get("/{aircraft_id}", response_model=AircraftResponse)
def get_aircraft(aircraft_id: str, db: Session = Depends(get_db)):
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    return aircraft

@router.put("/{aircraft_id}", response_model=AircraftResponse)
def update_aircraft(aircraft_id: str, aircraft: AircraftCreate, db: Session = Depends(get_db)):
    db_aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not db_aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    
    for key, value in aircraft.dict().items():
        setattr(db_aircraft, key, value)
    
    db.commit()
    db.refresh(db_aircraft)
    return db_aircraft

@router.delete("/{aircraft_id}")
def delete_aircraft(aircraft_id: str, db: Session = Depends(get_db)):
    aircraft = db.query(Aircraft).filter(Aircraft.id == aircraft_id).first()
    if not aircraft:
        raise HTTPException(status_code=404, detail="Aircraft not found")
    
    db.delete(aircraft)
    db.commit()
    return {"message": "Aircraft deleted successfully"} 