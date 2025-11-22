import { DetectionEvent } from "../hooks/useDetections";

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString();
}

type Props = {
  events: DetectionEvent[];
};

export default function EventLog({ events }: Props) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Event Log</p>
          <h3 className="text-lg font-semibold text-slate-100">Real-time detections</h3>
        </div>
        <span className="text-xs text-slate-500">{events.length} events</span>
      </div>
      <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/70 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-3 py-2">Time</th>
              <th className="px-3 py-2">Camera</th>
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2 text-right">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, idx) =>
              event.detections.map((det, detIdx) => (
                <tr
                  key={`${idx}-${detIdx}`}
                  className="border-t border-slate-800/80 bg-slate-900/40 hover:bg-slate-900/70"
                >
                  <td className="px-3 py-2 text-slate-200">{formatTime(event.timestamp)}</td>
                  <td className="px-3 py-2 text-slate-300">{event.camera_id}</td>
                  <td className="px-3 py-2 text-slate-100 capitalize">{det.label}</td>
                  <td className="px-3 py-2 text-right text-slate-300">{Math.round(det.confidence * 100)}%</td>
                </tr>
              ))
            )}
            {events.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-3 py-4 text-center text-sm text-slate-500"
                >
                  Waiting for detections...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
