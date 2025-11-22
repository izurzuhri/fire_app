import { useEffect, useMemo, useRef, useState } from "react";

export type Detection = {
  label: string;
  confidence: number;
  bbox?: number[];
};

export type DetectionEvent = {
  camera_id: string;
  timestamp: string;
  detections: Detection[];
};

export type Stats = Record<string, Record<string, number>>;

export function useDetections() {
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const [latestByCamera, setLatestByCamera] = useState<Record<string, DetectionEvent | null>>({});
  const [stats, setStats] = useState<Stats>({});
  const [status, setStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const wsRef = useRef<WebSocket | null>(null);

  const wsUrl = useMemo(
    () => import.meta.env.VITE_WS_URL || "ws://localhost:8000/ws/detections",
    []
  );

  useEffect(() => {
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setStatus("connecting");

    ws.onopen = () => setStatus("open");
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("closed");

    ws.onmessage = (event) => {
      try {
        const data: DetectionEvent = JSON.parse(event.data);
        setLatestByCamera((prev) => ({ ...prev, [data.camera_id]: data }));
        if (data.detections && data.detections.length > 0) {
          setEvents((prev) => [data, ...prev].slice(0, 200));
          setStats((prev) => {
            const cameraStats = prev[data.camera_id] || {};
            const updated = { ...cameraStats } as Record<string, number>;
            data.detections.forEach((d) => {
              updated[d.label] = (updated[d.label] || 0) + 1;
            });
            return { ...prev, [data.camera_id]: updated };
          });
        }
      } catch (err) {
        console.error("Failed to parse message", err);
      }
    };

    return () => {
      ws.close();
    };
  }, [wsUrl]);

  return { events, latestByCamera, stats, status };
}
