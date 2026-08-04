# Phase 6 — Walkable 3D Neighborhood

## Where we started

Despite the "2D scenes" shorthand, the game has been 3D (Three.js via @react-three/fiber)
since the beginning. What Phases 4–5 actually shipped were four **discrete, teleport-only
8×8 lots** (Home, Park, Office, Corner Shop) switched by `world.currentLocation`. Phase 6
is therefore not a 2D→3D migration — it is a migration from **discrete lots to a
contiguous, walkable exterior** that physically connects them.

## Architecture

### Rendering approach

- **Keep React Three Fiber.** No engine change. The neighborhood is one more location
  rendered through the existing `LocationView` switch, so every Phase 0–5 system
  (needs, props, NPCs, build mode, save) keeps working unmodified.
- The exterior is a new `street` location: a 22×14 lot with a road, sidewalks,
  placeholder facades for the four destinations, and street-level interactables.
- Interiors stay as separate scenes for now. Entering a facade door triggers the
  existing `travelToLocation` (fade + toast included for free). This keeps draw calls
  low on mobile and avoids loading all interiors at once.

### New systems introduced in Phase 6.1 (this slice)

| System | File | What it does |
|---|---|---|
| Per-location walk bounds | `src/game/locations.ts` (`LOCATION_BOUNDS`, `clampToLocation`) | Replaces the global 8×8 `clampToRoom`; the street is 22×14, interiors stay 8×8 |
| Lot portals | `src/game/locations.ts` (`STREET_PORTALS`, `getPortalNear`) | Walk-into trigger zones in front of each facade; checked after every tick while on the street |
| Street scene | `src/components/StreetScene.tsx` | Ground, road, sidewalks, facades, entrance pads, trees, fountain dressing |
| Camera follow rig | `src/components/GameCanvas.tsx` (`FollowCamera`) | Pans the orbit target + camera toward the sim on lots larger than one screen, preserving the user's orbit angle |
| Street interactables | `src/game/locationProps.ts` | `street_fountain` (watch), `street_bench` (sit) — reuse the existing walk-to-and-use `LocationProp` system untouched |

### How entering a lot works

1. Player taps a glowing entrance pad (or the ground near it) → standard `MOVE` action.
2. Sim walks there with the normal walking system.
3. On each `TICK`, if `currentLocation === 'street'`, `getPortalNear(sim.position)` is
   checked; inside a portal radius the reducer calls `travelToLocation`, which already
   handles spawn position, activity cancellation, and the travel fade/toast.

No new actions, no new sim states, no scene-graph teleport hacks.

## Files changed in the vertical slice

- `src/game/types.ts` — `'street'` added to `LocationId`; `WORLD_STATE_VERSION` 5 → 6
- `src/game/locations.ts` — labels/spawns/order entries, `LOCATION_BOUNDS`,
  `clampToLocation`, `isLocationId`, `STREET_PORTALS`, `getPortalNear`
- `src/game/constants.ts` — removed superseded `clampToRoom`
- `src/game/simLogic.ts` — `moveSimTo` is location-aware; migration validates
  `currentLocation` (unknown values fall back to `home`)
- `src/game/GameContext.tsx` — `MOVE` passes current location; `TICK` runs the portal check
- `src/game/locationProps.ts` — two street props
- `src/game/npcLogic.ts` — `street` entry in `NPC_POSITIONS` (empty for now)
- `src/game/locationAmbience.ts` — street ambience (city preset, extended fog)
- `src/components/StreetScene.tsx` — **new**
- `src/components/LocationView.tsx` — street branch
- `src/components/GameCanvas.tsx` — `FollowCamera`, wider contact shadows on street

## Save compatibility (Phase 5 unaffected)

- The change is purely **additive**: no fields were removed or renamed in `WorldState`.
- `WORLD_STATE_VERSION` bumped to 6; `migrateWorldState` keeps its merge-with-defaults
  approach and now also validates `currentLocation`, so a v5 save (or any save with an
  unknown location) loads cleanly and lands at Home.
- The Supabase schema stores the whole world as `jsonb` — no migration needed there.
- Conflict detection (`savesLikelySame`, timestamps) is untouched.
- Caveat shared with all previous versions: an **old client** loading a *new* save whose
  `currentLocation` is `street` would crash. This is a single-deployment web app, so
  clients update with the page; no action taken.

## Roadmap within Phase 6

- **6.1 (done — this slice):** walkable street lot, two interactables, walk-into portals
  to all four lots, follow camera.
- **6.2:** exit doors inside each lot leading back to the street (spawn beside the
  matching facade); NPCs commute along the street between schedule blocks; street props
  get bespoke meshes instead of generic boxes.
- **6.3 (art pass):** GLTF building/prop models, instanced trees and lamps, obstacle-aware
  pathfinding (grid A* over the street), optional merging of interiors into world space
  behind a single camera transition.
