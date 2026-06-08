import { useMemo, useState } from 'react';
import {
  FURNITURE_CATEGORIES,
  getCatalogByCategory,
  getCatalogItem,
} from '../game/furnitureCatalog';
import { useGame } from '../game/GameContext';
import type { FurnitureCategory } from '../game/types';

function ToolButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-2 text-sm transition ${
        active
          ? 'bg-amber-500/20 text-amber-100 ring-1 ring-amber-400/40'
          : 'bg-white/5 text-stone-200 hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

export function BuildToolbar() {
  const {
    world,
    setMode,
    selectCatalog,
    selectPlaced,
    rotatePlacement,
    rotateSelected,
    deleteSelected,
  } = useGame();
  const [category, setCategory] = useState<FurnitureCategory>('bedroom');

  const categoryItems = useMemo(() => getCatalogByCategory(category), [category]);
  const selectedCatalog = getCatalogItem(world.build.selectedCatalogId);
  const isBuildMode = world.mode === 'build';

  if (!isBuildMode) {
    if (world.currentLocation !== 'home' || world.isWorking) return null;
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-end p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => setMode('build')}
          className="pointer-events-auto rounded-full border border-white/10 bg-stone-950/80 px-4 py-2 text-sm text-stone-100 shadow-lg backdrop-blur-md transition hover:bg-stone-900"
        >
          Build Mode
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-between gap-3 p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto rounded-2xl border border-white/10 bg-stone-950/85 px-3 py-2 shadow-xl backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Build Mode</p>
          <p className="text-sm text-stone-100">
            {world.build.selectedPlacedId ? 'Move selected piece' : `Placing ${selectedCatalog?.name ?? 'item'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            selectPlaced(null);
            setMode('live');
          }}
          className="pointer-events-auto rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-2 text-sm text-emerald-100 shadow-lg backdrop-blur-md transition hover:bg-emerald-500/25"
        >
          Live Mode
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-24 z-10 hidden md:block md:max-w-xs md:pl-4">
        <div className="pointer-events-auto max-h-[calc(100vh-12rem)] overflow-y-auto rounded-2xl border border-white/10 bg-stone-950/85 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex flex-wrap gap-2">
            {FURNITURE_CATEGORIES.map((entry) => (
              <ToolButton
                key={entry.id}
                active={category === entry.id}
                onClick={() => setCategory(entry.id)}
              >
                {entry.label}
              </ToolButton>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {categoryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  selectPlaced(null);
                  selectCatalog(item.id);
                }}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  world.build.selectedCatalogId === item.id && !world.build.selectedPlacedId
                    ? 'border-amber-400/40 bg-amber-500/15'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="mb-2 h-8 rounded-md" style={{ backgroundColor: item.color }} />
                <p className="text-sm text-stone-100">{item.name}</p>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3">
            <ToolButton onClick={rotatePlacement}>Rotate New</ToolButton>
            <ToolButton onClick={rotateSelected}>Rotate Selected</ToolButton>
            <ToolButton onClick={deleteSelected}>Delete</ToolButton>
            <ToolButton
              onClick={() => selectPlaced(null)}
              active={!world.build.selectedPlacedId}
            >
              Place New
            </ToolButton>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-28 z-10 md:hidden">
        <div className="pointer-events-auto mx-4 rounded-2xl border border-white/10 bg-stone-950/90 p-3 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {FURNITURE_CATEGORIES.map((entry) => (
              <ToolButton
                key={entry.id}
                active={category === entry.id}
                onClick={() => setCategory(entry.id)}
              >
                {entry.label}
              </ToolButton>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  selectPlaced(null);
                  selectCatalog(item.id);
                }}
                className={`min-w-[88px] shrink-0 rounded-xl border px-2 py-2 text-left ${
                  world.build.selectedCatalogId === item.id && !world.build.selectedPlacedId
                    ? 'border-amber-400/40 bg-amber-500/15'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="mb-1 h-6 rounded-md" style={{ backgroundColor: item.color }} />
                <p className="text-xs text-stone-100">{item.name}</p>
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <ToolButton onClick={rotatePlacement}>Rotate</ToolButton>
            <ToolButton onClick={rotateSelected}>Turn</ToolButton>
            <ToolButton onClick={deleteSelected}>Delete</ToolButton>
          </div>
        </div>
      </div>
    </>
  );
}
