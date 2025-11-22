from pathlib import Path
from typing import List
import json
from pydantic import BaseModel, Field


CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "cameras.json"


class CameraConfig(BaseModel):
    camera_id: str = Field(..., description="Unique camera identifier")
    name: str = Field(..., description="Friendly camera name")
    source: str = Field(..., description="RTSP URL, webcam index, or file path")
    mode: str = Field(
        "mock",
        description=(
            "One of: mock (simulated frames), webcam (local webcam index), "
            "file (video file), rtsp (RTSP URL)"
        ),
    )


class Settings(BaseModel):
    app_name: str = "Fire & Smoke Detection"
    version: str = "0.1.0"
    cameras: List[CameraConfig] = Field(default_factory=list)


def load_settings() -> Settings:
    if not CONFIG_PATH.exists():
        raise FileNotFoundError(f"Camera config not found at {CONFIG_PATH}")

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    cameras = [CameraConfig(**item) for item in data.get("cameras", [])]
    return Settings(cameras=cameras)
