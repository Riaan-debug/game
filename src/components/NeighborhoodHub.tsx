import { LOCATION_LABELS, LOCATION_ORDER } from '../game/locations';
import { useGame } from '../game/GameContext';
export function NeighborhoodHub() {
  const { world, travel } = useGame();

  if (world.mode === 'build') return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-14 z-10 flex justify-center px-4 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="pointer-events-auto flex w-full max-w-lg flex-wrap justify-center gap-2 rounded-2xl border border-white/10 bg-stone-950/85 p-2 shadow-xl backdrop-blur-md">
        {LOCATION_ORDER.map((location) => (
          <button
            key={location}
            type="button"
            disabled={world.isWorking}
            onClick={() => travel(location)}
            className={`rounded-xl px-3 py-2 text-sm transition ${
              world.currentLocation === location
                ? 'bg-amber-500/25 text-amber-100 ring-1 ring-amber-400/50'
                : 'bg-white/5 text-stone-200 hover:bg-white/10 disabled:opacity-40'
            }`}
          >
            {LOCATION_LABELS[location]}
          </button>
        ))}
      </div>
    </div>
  );
}
