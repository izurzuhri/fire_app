import { Camera } from "../App";
import { DetectionEvent } from "../hooks/useDetections";

function formatTime(timestamp?: string) {
  if (!timestamp) return "--";
  return new Date(timestamp).toLocaleTimeString();
}

type Props = {
  camera: Camera;
  latest?: DetectionEvent | null;
};

export default function CameraTile({ camera, latest }: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 shadow-md shadow-black/20">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{camera.camera_id}</p>
          <h3 className="text-lg font-semibold text-slate-100">{camera.name}</h3>
        </div>
        <span className="text-xs text-emerald-400">● online</span>
      </div>

      <div className="relative mb-4 h-48 rounded-lg border border-slate-800 bg-slate-950/70">
        <div className="absolute inset-0 flex items-center justify-center text-slate-700">
          Live Feed ({camera.camera_id})
        </div>
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
          <span>Recent Detections</span>
          <span className="text-xs text-slate-500">{formatTime(latest?.timestamp)}</span>
        </div>
        {latest && latest.detections.length > 0 ? (
          <ul className="divide-y divide-slate-800 rounded-lg border border-slate-800 bg-slate-900/60">
            {latest.detections.map((det, idx) => (
              <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="font-medium capitalize text-slate-100">{det.label}</span>
                <span className="text-xs text-slate-400">{Math.round(det.confidence * 100)}%</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-500">
            No detections yet.
          </div>
        )}
      </div>
    </div>
  );
}
