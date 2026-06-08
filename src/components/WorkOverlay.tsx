import { useGame } from '../game/GameContext';
import { WORK_SHIFT_MINUTES } from '../game/locations';
import { formatSimTime, getWorkShiftProgress } from '../game/simLogic';

export function WorkOverlay() {
  const { world, leaveWork } = useGame();
  if (!world.isWorking) return null;

  const remaining = Math.max(0, world.workEndsAtMinute - world.simTimeMinutes);
  const progress = getWorkShiftProgress(world);
  const progressPct = Math.round(progress * 100);

  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 z-10 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-sky-400/30 bg-stone-950/90 px-4 py-3 text-center shadow-xl backdrop-blur-md">
        <p className="text-[11px] uppercase tracking-[0.16em] text-sky-300">At work</p>
        <p className="mt-1 text-sm text-stone-100">
          Shift ends around {formatSimTime(world.workEndsAtMinute)}
        </p>
        <p className="mt-0.5 text-[11px] text-stone-500">
          {progressPct}% complete · {Math.round(remaining)} sim min left
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-800">
          <div className="h-full bg-sky-400 transition-all" style={{ width: `${progress * 100}%` }} />
        </div>
        <button
          type="button"
          onClick={leaveWork}
          className="mt-3 w-full rounded-xl bg-white/10 px-3 py-2 text-xs text-stone-200 transition hover:bg-white/15"
        >
          Leave early
        </button>
        <p className="mt-1.5 text-[10px] text-stone-500">
          Rewards scale with time worked ({WORK_SHIFT_MINUTES} min full shift)
        </p>
      </div>
    </div>
  );
}
