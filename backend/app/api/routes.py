from fastapi import APIRouter, Depends

from app.config import Settings
from app.models.dto import CameraInfo
from app.main import get_settings, get_camera_manager

router = APIRouter(prefix="/api")


@router.get("/health")
def health(settings: Settings = Depends(get_settings)):
    return {"status": "ok", "version": settings.version}


@router.get("/cameras", response_model=list[CameraInfo])
def list_cameras(settings: Settings = Depends(get_settings)):
    return [CameraInfo(**cam.dict()) for cam in settings.cameras]
