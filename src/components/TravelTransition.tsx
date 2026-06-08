import { useEffect, useRef, useState } from 'react';
import { LOCATION_LABELS } from '../game/locations';
import { useGame } from '../game/GameContext';
import type { LocationId } from '../game/types';

type Phase = 'idle' | 'out' | 'in';

export function TravelTransition() {
  const { world } = useGame();
  const prevLocation = useRef<LocationId>(world.currentLocation);
  const [phase, setPhase] = useState<Phase>('idle');
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (prevLocation.current === world.currentLocation) return;

    const destination = LOCATION_LABELS[world.currentLocation];
    setLabel(destination);
    setPhase('out');

    const revealTimer = window.setTimeout(() => setPhase('in'), 220);
    const idleTimer = window.setTimeout(() => {
      setPhase('idle');
      setLabel('');
    }, 700);

    prevLocation.current = world.currentLocation;

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(idleTimer);
    };
  }, [world.currentLocation]);

  if (phase === 'idle' && !label) return null;

  const overlayOpacity = phase === 'out' ? 0.55 : phase === 'in' ? 0 : 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <div
        className="absolute inset-0 bg-[#0f0d14] transition-opacity duration-300 ease-out"
        style={{ opacity: overlayOpacity }}
      />
      {label && (
        <div className="absolute inset-x-0 top-1/3 flex justify-center px-6">
          <p
            className={`rounded-2xl border border-white/15 bg-stone-950/90 px-5 py-3 text-center text-sm text-stone-100 shadow-2xl backdrop-blur-md transition-all duration-300 ${
              phase === 'out' ? 'scale-95 opacity-100' : 'scale-100 opacity-90'
            }`}
          >
            <span className="block text-[10px] uppercase tracking-[0.2em] text-amber-300/90">
              {phase === 'out' ? 'Traveling to' : 'Arrived at'}
            </span>
            <span className="mt-1 block text-lg font-medium">{label}</span>
          </p>
        </div>
      )}
    </div>
  );
}
