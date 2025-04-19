from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.base import get_db

router = APIRouter()

@router.get("/")
def get_defense(db: Session = Depends(get_db)):
    return {"message": "Defense endpoint is working"} 