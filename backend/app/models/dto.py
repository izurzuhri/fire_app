from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class Detection(BaseModel):
    label: str
    confidence: float
    bbox: Optional[List[float]] = Field(
        default=None, description="[x1, y1, x2, y2] pixel coordinates"
    )


class DetectionEvent(BaseModel):
    camera_id: str
    timestamp: datetime
    detections: List[Detection]


class CameraInfo(BaseModel):
    camera_id: str
    name: str
    source: str
