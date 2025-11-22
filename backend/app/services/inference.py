import random
from typing import List
from datetime import datetime

from app.models.dto import Detection, DetectionEvent

LABELS = ["fire", "smoke"]


class InferenceService:
    """Mockable inference service. Replace `run_inference` with real YOLO logic later."""

    async def run_inference(self, camera_id: str, frame: bytes) -> List[Detection]:
        # Randomly decide how many detections appear
        detections = []
        if random.random() > 0.6:
            for _ in range(random.randint(1, 3)):
                label = random.choice(LABELS)
                detections.append(
                    Detection(
                        label=label,
                        confidence=round(random.uniform(0.6, 0.99), 2),
                        bbox=[
                            random.randint(0, 300),
                            random.randint(0, 300),
                            random.randint(300, 640),
                            random.randint(300, 480),
                        ],
                    )
                )
        return detections

    async def generate_event(self, camera_id: str) -> DetectionEvent:
        detections = await self.run_inference(camera_id=camera_id, frame=b"")
        return DetectionEvent(
            camera_id=camera_id,
            timestamp=datetime.utcnow(),
            detections=detections,
        )
