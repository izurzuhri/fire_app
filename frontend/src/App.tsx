import { useEffect, useMemo, useState } from "react";
import CameraGrid from "./components/CameraGrid";
import EventLog from "./components/EventLog";
import StatsPanel from "./components/StatsPanel";
import { useDetections } from "./hooks/useDetections";

export type Camera = {
  camera_id: string;
  name: string;
  source: string;
};

function App() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { events, latestByCamera, stats, status } = useDetections();

  const apiBase = useMemo(
    () => import.meta.env.VITE_API_BASE || "http://localhost:8000",
    []
  );

  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const res = await fetch(`${apiBase}/api/cameras`);
        if (!res.ok) throw new Error("Failed to load cameras");
        const data = await res.json();
        setCameras(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchCameras();
  }, [apiBase]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-400">Fire & Smoke</p>
            <h1 className="text-2xl font-semibold">Detection Dashboard</h1>
          </div>
          <div className="text-sm text-slate-300">
            <span
              className={`mr-2 inline-flex h-2 w-2 rounded-full ${
                status === "open"
                  ? "bg-emerald-400"
                  : status === "connecting"
                  ? "bg-amber-400"
                  : "bg-rose-500"
              }`}
            />
            WebSocket: {status}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-4 px-6 py-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Cameras</p>
              <h2 className="text-xl font-semibold text-slate-50">Live Grid</h2>
            </div>
            {loading && <span className="text-sm text-slate-400">Loading cameras...</span>}
            {error && <span className="text-sm text-rose-400">{error}</span>}
          </div>
          <CameraGrid cameras={cameras} latestByCamera={latestByCamera} />
        </section>

        <section className="space-y-4">
          <StatsPanel cameras={cameras} stats={stats} />
          <EventLog events={events} />
        </section>
      </main>
    </div>
  );
}

export default App;
