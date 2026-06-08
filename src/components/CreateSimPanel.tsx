import { useState } from 'react';
import {
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFITS,
  SKIN_TONES,
} from '../game/casCatalog';
import { useGame } from '../game/GameContext';

function SwatchButton({
  color,
  active,
  onClick,
  label,
}: {
  color: string;
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`h-9 w-9 rounded-full ring-2 transition ${
        active ? 'ring-amber-300 scale-110' : 'ring-white/10 hover:ring-white/30'
      }`}
      style={{ backgroundColor: color }}
    />
  );
}

export function CreateSimPanel() {
  const { world, setAppearance } = useGame();
  const [open, setOpen] = useState(false);
  const { appearance } = world.sim;

  if (world.mode === 'build' || world.currentLocation !== 'home' || world.isWorking) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pointer-events-auto absolute left-4 top-[max(1rem,env(safe-area-inset-top))] z-10 rounded-full border border-white/10 bg-stone-950/80 px-4 py-2 text-sm text-stone-100 shadow-lg backdrop-blur-md transition hover:bg-stone-900"
      >
        Create Sim
      </button>

      {open && (
        <div className="pointer-events-auto absolute inset-0 z-20 flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-stone-950/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Create-a-Sim</p>
                <p className="text-lg text-stone-100">Customize your Sim</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/10 px-3 py-1 text-sm text-stone-100"
              >
                Done
              </button>
            </div>

            <section className="mb-5">
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-stone-400">Skin tone</p>
              <div className="flex flex-wrap gap-2">
                {SKIN_TONES.map((tone) => (
                  <SwatchButton
                    key={tone.id}
                    color={tone.color}
                    label={tone.id}
                    active={appearance.skinToneId === tone.id}
                    onClick={() => setAppearance({ skinToneId: tone.id })}
                  />
                ))}
              </div>
            </section>

            <section className="mb-5">
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-stone-400">Hair style</p>
              <div className="grid grid-cols-2 gap-2">
                {HAIR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setAppearance({ hairStyleId: style.id })}
                    className={`rounded-xl border px-3 py-2 text-left text-sm ${
                      appearance.hairStyleId === style.id
                        ? 'border-amber-400/40 bg-amber-500/15 text-amber-50'
                        : 'border-white/10 bg-white/5 text-stone-200'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </section>

            <section className="mb-5">
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-stone-400">Hair color</p>
              <div className="flex flex-wrap gap-2">
                {HAIR_COLORS.map((color) => (
                  <SwatchButton
                    key={color.id}
                    color={color.color}
                    label={color.id}
                    active={appearance.hairColorId === color.id}
                    onClick={() => setAppearance({ hairColorId: color.id })}
                  />
                ))}
              </div>
            </section>

            <section>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-stone-400">Outfits</p>
              <div className="grid grid-cols-2 gap-2">
                {OUTFITS.map((outfit) => (
                  <button
                    key={outfit.id}
                    type="button"
                    onClick={() => setAppearance({ outfitId: outfit.id })}
                    className={`rounded-xl border px-3 py-3 text-left ${
                      appearance.outfitId === outfit.id
                        ? 'border-amber-400/40 bg-amber-500/15'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="mb-2 flex h-8 overflow-hidden rounded-md">
                      <div className="flex-1" style={{ backgroundColor: outfit.topColor }} />
                      <div className="flex-1" style={{ backgroundColor: outfit.bottomColor }} />
                    </div>
                    <p className="text-sm text-stone-100">{outfit.name}</p>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
