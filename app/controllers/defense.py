from fastapi import APIRouter
from app.schemas.defense import LaunchRequest, LaunchResponse
from app.crud.defense import launch_missile

router = APIRouter()

@router.post("/launch", response_model=LaunchResponse)
def fire_missile(request: LaunchRequest):
    return launch_missile(request)
