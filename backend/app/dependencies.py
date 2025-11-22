from fastapi import Request

from app.config import Settings
from app.services.camera_manager import CameraManager


def get_settings(request: Request) -> Settings:
    return request.app.state.settings


def get_camera_manager(request: Request) -> CameraManager:
    return request.app.state.camera_manager
