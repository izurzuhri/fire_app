import asyncio
from typing import Dict, List, Set
from fastapi import WebSocket

from app.config import CameraConfig
from app.models.dto import DetectionEvent, CameraInfo
from app.services.inference import InferenceService


class CameraManager:
    def __init__(self, cameras: List[CameraConfig], inference_service: InferenceService):
        self.cameras = cameras
        self.inference = inference_service
        self.connections: Set[WebSocket] = set()
        self.tasks: List[asyncio.Task] = []
        self._stop_event = asyncio.Event()

    def list_cameras(self) -> List[CameraInfo]:
        return [CameraInfo(**camera.dict()) for camera in self.cameras]

    async def start(self):
        self._stop_event.clear()
        for camera in self.cameras:
            task = asyncio.create_task(self._camera_loop(camera))
            self.tasks.append(task)

    async def stop(self):
        self._stop_event.set()
        for task in self.tasks:
            task.cancel()
        self.tasks = []

    async def register(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.add(websocket)

    async def unregister(self, websocket: WebSocket):
        self.connections.discard(websocket)

    async def broadcast(self, event: DetectionEvent):
        if not self.connections:
            return
        message = event.dict()
        stale: Set[WebSocket] = set()
        for ws in self.connections:
            try:
                await ws.send_json(message)
            except Exception:
                stale.add(ws)
        for ws in stale:
            await self.unregister(ws)

    async def _camera_loop(self, camera: CameraConfig):
        while not self._stop_event.is_set():
            event = await self.inference.generate_event(camera.camera_id)
            if event.detections:
                await self.broadcast(event)
            await asyncio.sleep(1.0)
