from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db

router = APIRouter()

@router.get("/")
def get_jamming(db: Session = Depends(get_db)):
    return {"message": "Jamming endpoint is working"} 