import { useState } from 'react';
import { useGame } from '../game/GameContext';
import { LOCATION_LABELS } from '../game/locations';
import { NPCS, getFriendshipLabel } from '../game/npcLogic';
import { exportWorldState } from '../game/saveStorage';
import { getMoodLabel, getTimeOfDayLabel, skillLevel } from '../game/moodLogic';
import { formatSimTime, getActivityLabel } from '../game/simLogic';

type NeedTone = 'amber' | 'sky' | 'cyan' | 'violet' | 'rose';

const NEED_TONES: Record<NeedTone, string> = {
  amber: 'bg-amber-400',
  sky: 'bg-sky-400',
  cyan: 'bg-cyan-400',
  violet: 'bg-violet-400',
  rose: 'bg-rose-400',
};

const NEEDS: { key: string; label: string; tone: NeedTone; get: (s: { hunger: number; energy: number; hygiene: number; fun: number; social: number }) => number }[] = [
  { key: 'hunger', label: 'Hunger', tone: 'amber', get: (s) => s.hunger },
  { key: 'energy', label: 'Energy', tone: 'sky', get: (s) => s.energy },
  { key: 'hygiene', label: 'Hygiene', tone: 'cyan', get: (s) => s.hygiene },
  { key: 'fun', label: 'Fun', tone: 'violet', get: (s) => s.fun },
  { key: 'social', label: 'Social', tone: 'rose', get: (s) => s.social },
];

function MiniNeedBar({ label, value, tone }: { label: string; value: number; tone: NeedTone }) {
  const low = value < 25;
  return (
    <div
      className="flex min-w-0 flex-1 flex-col items-center gap-0.5"
      title={`${label}: ${Math.round(value)}`}
    >
      <span className="text-[8px] font-medium uppercase tracking-wide text-stone-500">
        {label.slice(0, 1)}
      </span>
      <div
        className={`h-1.5 w-full overflow-hidden rounded-full bg-stone-800/80 ${low ? 'ring-1 ring-rose-400/60' : ''}`}
      >
        <div
          className={`h-full rounded-full transition-all ${NEED_TONES[tone]} ${low ? 'animate-pulse' : ''}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

function NeedBar({ label, value, tone }: { label: string; value: number; tone: NeedTone }) {
  const low = value < 25;
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-14 shrink-0 text-[10px] text-stone-400">{label}</span>
      <div className={`h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-stone-800/90 ${low ? 'animate-pulse ring-1 ring-rose-400/50' : ''}`}>
        <div
          className={`h-full rounded-full ${NEED_TONES[tone]}`}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="w-6 shrink-0 text-right font-mono text-[10px] text-stone-400">{Math.round(value)}</span>
    </div>
  );
}

export function NeedsHUD() {
  const { world, cancel, resetSave, syncStatus } = useGame();
  const syncHint =
    syncStatus === 'synced'
      ? 'Cloud synced'
      : syncStatus === 'syncing'
        ? 'Saving…'
        : syncStatus === 'error'
          ? 'Cloud sync failed'
          : 'Auto-saved locally';
  const { sim } = world;
  const isBuildMode = world.mode === 'build';
  const [expanded, setExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const locationHints: Record<typeof world.currentLocation, string> = {
    home: 'Tap furniture to interact',
    street: 'Walk to a glowing pad to enter a lot',
    park: 'Bench, pond, or NPCs',
    work: 'Clock in at the desk',
    shop: 'Buy coffee at the counter',
  };

  const activityLabel = isBuildMode
    ? 'Build: tap floor or furniture'
    : sim.activity === 'idle'
      ? locationHints[world.currentLocation]
      : getActivityLabel(sim, world);

  const showStop =
    !isBuildMode && sim.activity !== 'idle' && sim.activity !== 'walking';

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div
        className={`pointer-events-auto w-full max-w-lg rounded-xl border border-white/10 bg-stone-950/80 shadow-lg backdrop-blur-sm transition-all ${
          expanded ? 'px-3 py-2.5' : 'px-2.5 py-2'
        }`}
      >
        {/* Compact row — always visible */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse status panel' : 'Expand status panel'}
          >
            <div className="shrink-0 rounded-lg bg-white/5 px-2 py-1">
              <p className="text-[9px] uppercase tracking-wide text-stone-500">
                {getTimeOfDayLabel(world.simTimeMinutes)}
              </p>
              <p className="font-mono text-xs leading-tight text-stone-100">
                {formatSimTime(world.simTimeMinutes)}
              </p>
            </div>

            {!isBuildMode && (
              <div className="flex min-w-0 max-w-[9rem] shrink gap-1 sm:max-w-[11rem]">
                {NEEDS.map((need) => (
                  <MiniNeedBar
                    key={need.key}
                    label={need.label}
                    value={need.get(sim)}
                    tone={need.tone}
                  />
                ))}
              </div>
            )}

            <div className="min-w-0 flex-1 sm:max-w-[40%]">
              <p className="truncate text-[10px] text-stone-500">
                {LOCATION_LABELS[world.currentLocation]}
                {isBuildMode ? ' · Build' : ''}
              </p>
              <p className="truncate text-xs text-stone-100">{activityLabel}</p>
              {!isBuildMode && !expanded && (
                <p className="truncate text-[10px] text-amber-200/90">
                  {getMoodLabel(sim.mood)} · {Math.round(sim.mood)}
                </p>
              )}
            </div>
          </button>

          {showStop && (
            <button
              type="button"
              onClick={cancel}
              className="shrink-0 rounded-lg bg-amber-500/20 px-2.5 py-1.5 text-xs text-amber-100 ring-1 ring-amber-400/30"
            >
              Stop
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="shrink-0 rounded-lg p-1.5 text-stone-400 transition hover:bg-white/10 hover:text-stone-200"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="currentColor"
            >
              <path d="M5.5 7.5 10 12l4.5-4.5H5.5z" />
            </svg>
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-2 space-y-2 border-t border-white/10 pt-2">
            {!isBuildMode && (
              <>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-stone-300">
                    Mood: <span className="text-stone-100">{getMoodLabel(sim.mood)}</span>
                  </span>
                  <span className="font-mono text-amber-200">{Math.round(sim.mood)}</span>
                  <span className="text-[10px] text-stone-500">
                    Cook L{skillLevel(sim.skills.cooking)} · Fit L{skillLevel(sim.skills.fitness)}
                  </span>
                </div>

                <div className="space-y-1">
                  {NEEDS.map((need) => (
                    <NeedBar key={need.key} label={need.label} value={need.get(sim)} tone={need.tone} />
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {NPCS.map((npc) => {
                    const friendship = world.relationships[npc.id] ?? 15;
                    return (
                      <span
                        key={npc.id}
                        className="rounded-md bg-white/5 px-1.5 py-0.5 text-[9px] text-stone-400"
                      >
                        {npc.name} {Math.round(friendship)} · {getFriendshipLabel(friendship)}
                      </span>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowActions((v) => !v)}
                className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-stone-400 hover:bg-white/10"
              >
                {showActions ? 'Less' : 'Save & options'}
              </button>
              {showActions && (
                <>
                  <button
                    type="button"
                    onClick={() => void exportWorldState(world)}
                    className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-stone-300 hover:bg-white/10"
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    onClick={resetSave}
                    className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-stone-300 hover:bg-white/10"
                  >
                    Reset
                  </button>
                  <span className="text-[9px] text-stone-600">{syncHint}</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
