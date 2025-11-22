from fastapi import Depends, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.config import Settings, load_settings
from app.services.camera_manager import CameraManager
from app.services.inference import InferenceService


def get_settings() -> Settings:
    return app.state.settings


def get_camera_manager() -> CameraManager:
    return app.state.camera_manager


app = FastAPI(title="Fire & Smoke Dashboard")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.on_event("startup")
async def startup_event():
    settings = load_settings()
    inference = InferenceService()
    manager = CameraManager(settings.cameras, inference)

    app.state.settings = settings
    app.state.camera_manager = manager

    await manager.start()


@app.on_event("shutdown")
async def shutdown_event():
    await app.state.camera_manager.stop()


@app.websocket("/ws/detections")
async def websocket_endpoint(websocket: WebSocket):
    manager: CameraManager = app.state.camera_manager
    await manager.register(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await manager.unregister(websocket)
    except Exception:
        await manager.unregister(websocket)


@app.get("/")
def root(settings: Settings = Depends(get_settings)):
    return {"message": settings.app_name, "version": settings.version}
