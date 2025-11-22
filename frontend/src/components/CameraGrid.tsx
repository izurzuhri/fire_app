import CameraTile from "./CameraTile";
import { Camera } from "../App";
import { DetectionEvent } from "../hooks/useDetections";

type Props = {
  cameras: Camera[];
  latestByCamera: Record<string, DetectionEvent | null>;
};

export default function CameraGrid({ cameras, latestByCamera }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {cameras.map((cam) => (
        <CameraTile key={cam.camera_id} camera={cam} latest={latestByCamera[cam.camera_id]} />
      ))}
      {cameras.length === 0 && (
        <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/50 p-6 text-center text-slate-400">
          No cameras configured yet.
        </div>
      )}
    </div>
  );
}
