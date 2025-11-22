# Fire & Smoke Detection Dashboard (Starter)

Starter monorepo untuk dashboard deteksi api/asap berbasis YOLO. Backend FastAPI menyiapkan endpoint REST + WebSocket real-time, frontend React + Vite menampilkan grid kamera, log event, dan statistik sederhana.

## Arsitektur singkat (kenapa FastAPI + React?)
- **FastAPI**: ringan, async-friendly untuk streaming deteksi real-time via WebSocket; mudah mengganti fungsi inferensi ke model YOLO asli.
- **Background tasks**: satu loop per kamera, membaca frame (disimulasikan), menjalankan inferensi, lalu broadcast ke WebSocket.
- **React + Vite**: build cepat, state realtime sederhana dengan hook WebSocket; mudah diskalakan jadi UI produksi (Tailwind untuk styling cepat).
- **Pemisahan per layer**: `services/inference.py` bisa diganti YOLO nyata; `config/cameras.json` untuk menambah kamera tanpa ubah kode.

## Struktur folder
```
backend/
  app/main.py              # FastAPI app + WebSocket
  app/api/routes.py        # REST routes (health, cameras)
  app/models/dto.py        # Pydantic DTO
  app/services/inference.py# Mock inferensi (gantikan dengan YOLO nanti)
  app/services/camera_manager.py # Loop kamera & broadcast WS
  app/config.py            # Load config kamera
  config/cameras.json      # Daftar kamera
  requirements.txt
  Dockerfile
frontend/
  src/App.tsx              # Layout utama
  src/hooks/useDetections.ts# Hook WebSocket & agregasi
  src/components/*         # Grid, tile, log, stats
  vite.config.ts, tailwind.config.js, tsconfig*.json
  package.json, Dockerfile
```

## Cara menjalankan (Docker Compose)
1. Pastikan Docker & Docker Compose tersedia.
2. Jalankan di root repo:
   ```bash
   docker compose up --build
   ```
3. Akses frontend di `http://localhost:5173` (backend di `http://localhost:8000`).

> Jika repo Anda memiliki beberapa branch, gunakan branch `work` (branch aktif di starter ini) sebelum menjalankan perintah di atas:
> ```bash
> git checkout work
> ```

> Catatan: WebSocket dan REST frontend memakai hostname `backend` via Compose; untuk jalankan tanpa Compose, set env `VITE_API_BASE` dan `VITE_WS_URL` ke alamat backend lokal Anda.

## Konfigurasi kamera
Edit `backend/config/cameras.json` untuk memilih mode sumber:
```json
{
  "cameras": [
    {"camera_id": "cam_1", "name": "Webcam", "source": "0", "mode": "webcam"},
    {"camera_id": "cam_2", "name": "Video File", "source": "./sample_fire.mp4", "mode": "file"},
    {"camera_id": "cam_3", "name": "RTSP Cam", "source": "rtsp://...", "mode": "rtsp"},
    {"camera_id": "cam_4", "name": "Mock Stream", "source": "mock", "mode": "mock"}
  ]
}
```
- Tambah entri baru untuk kamera tambahan.
- `mode`:
  - `webcam`: gunakan index webcam lokal (mis. `0` atau `1`).
  - `file`: path video lokal; loop akan restart saat file selesai.
  - `rtsp`: URL RTSP langsung.
  - `mock`: tidak membuka sumber video, hanya kirim deteksi acak.
- `source`: isi sesuai mode di atas (index atau path/URL). Untuk webcam di Windows/WSL2, pastikan device dibagikan ke Linux/WSL.

## Menyambungkan model YOLO asli
- Buka `backend/app/services/inference.py`.
- Ganti isi `run_inference` dengan pemanggilan YOLO Anda (pastikan async atau bungkus sync di thread pool).
- Pertahankan signature: `async def run_inference(camera_id: str, frame: bytes) -> List[Detection]` agar integrasi lain tetap sama.

## Mode lokal tanpa Docker
Backend:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Frontend:
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
Set environment jika perlu:
```bash
export VITE_API_BASE=http://localhost:8000
export VITE_WS_URL=ws://localhost:8000/ws/detections
```

## Catatan pengembangan
- Loop inferensi saat ini mengirim deteksi acak tiap ~1 detik hanya ketika ada hasil (untuk mengurangi spam).
- `EventLog` menampilkan hingga 200 event terbaru; `StatsPanel` menjumlahkan per kamera per label.
- CORS diizinkan untuk semua origin agar frontend lokal mudah terhubung.

## Roadmap ringan
- Integrasi RTSP reader nyata (OpenCV/FFmpeg) dalam `CameraManager`.
- Tambah autentikasi sederhana untuk WS/REST.
- Persistensi event ke database lokal (SQLite/Postgres) untuk laporan historis.
