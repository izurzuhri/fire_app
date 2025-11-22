import asyncio
import logging
from typing import List, Set, Union

from fastapi import WebSocket
import cv2

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
        self.logger = logging.getLogger(__name__)

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
        capture = None
        if camera.mode != "mock":
            source: Union[int, str] = (
                int(camera.source) if camera.mode == "webcam" and camera.source.isdigit() else camera.source
            )
            capture = cv2.VideoCapture(source)
            if not capture.isOpened():
                self.logger.warning("Camera %s failed to open source %s", camera.camera_id, camera.source)
                capture = None

        try:
            while not self._stop_event.is_set():
                frame_bytes: bytes = b""

                if capture:
                    loop = asyncio.get_running_loop()
                    ret, frame = await loop.run_in_executor(None, capture.read)
                    if not ret:
                        if camera.mode == "file":
                            capture.set(cv2.CAP_PROP_POS_FRAMES, 0)
                            continue
                        self.logger.warning("Camera %s stopped producing frames", camera.camera_id)
                        break
                    frame_bytes = frame.tobytes()

                event = await self.inference.generate_event(camera.camera_id, frame_bytes)
                if event.detections:
                    await self.broadcast(event)

                await asyncio.sleep(0.03 if capture else 1.0)
        finally:
            if capture:
                capture.release()
