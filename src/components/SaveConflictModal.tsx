import { formatSimTime } from '../game/simLogic';
import type { SaveConflict } from '../game/bootstrapSave';
import { LOCATION_LABELS } from '../game/locations';

interface SaveConflictModalProps {
  conflict: SaveConflict;
  onChoose: (choice: 'local' | 'cloud') => void;
}

export function SaveConflictModal({ conflict, onChoose }: SaveConflictModalProps) {
  const { local, cloud } = conflict;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-stone-950 p-5 shadow-2xl">
        <h2 className="text-lg font-medium text-stone-100">Two saves found</h2>
        <p className="mt-2 text-sm text-stone-400">
          Your device and cloud both have progress. Pick which save to keep. The other copy will be
          replaced when you play next.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onChoose('local')}
            className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-left transition hover:bg-amber-500/20"
          >
            <p className="text-xs uppercase tracking-wide text-amber-300">This device</p>
            <p className="mt-1 text-sm text-stone-100">
              {LOCATION_LABELS[local.currentLocation]} · {formatSimTime(local.simTimeMinutes)}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">
              {local.furniture.length} furniture · mood {Math.round(local.sim.mood)}
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChoose('cloud')}
            className="rounded-xl border border-sky-400/40 bg-sky-500/10 p-3 text-left transition hover:bg-sky-500/20"
          >
            <p className="text-xs uppercase tracking-wide text-sky-300">Cloud</p>
            <p className="mt-1 text-sm text-stone-100">
              {LOCATION_LABELS[cloud.world_json.currentLocation]} ·{' '}
              {formatSimTime(cloud.world_json.simTimeMinutes)}
            </p>
            <p className="mt-1 text-[11px] text-stone-500">
              {cloud.world_json.furniture.length} furniture · mood{' '}
              {Math.round(cloud.world_json.sim.mood)}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
