import { Camera } from "../App";
import { Stats } from "../hooks/useDetections";

type Props = {
  cameras: Camera[];
  stats: Stats;
};

export default function StatsPanel({ cameras, stats }: Props) {
  const totalEvents = Object.values(stats).reduce(
    (sum, cameraStats) =>
      sum + Object.values(cameraStats).reduce((acc, count) => acc + count, 0),
    0
  );

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Statistics</p>
          <h3 className="text-lg font-semibold text-slate-100">Session overview</h3>
        </div>
        <span className="text-xs text-slate-500">{totalEvents} total events</span>
      </div>
      <div className="space-y-3">
        {cameras.map((cam) => {
          const cameraStats = stats[cam.camera_id] || {};
          const fireCount = cameraStats["fire"] || 0;
          const smokeCount = cameraStats["smoke"] || 0;
          return (
            <div
              key={cam.camera_id}
              className="rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">{cam.camera_id}</p>
                  <p className="text-base font-semibold text-slate-100">{cam.name}</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="rounded-full bg-rose-500/10 px-3 py-1 text-rose-300">
                    Fire: {fireCount}
                  </span>
                  <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-300">
                    Smoke: {smokeCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {cameras.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-500">
            Configure cameras to see stats.
          </div>
        )}
      </div>
    </div>
  );
}
