# Life Sim — Phase 6 (in progress)

Web-first life sim with a **walkable street**, cloud save sync, neighborhood travel, NPC friendships, work shifts, and everything from Phases 0–5.

## Phase 6.1 — Walkable neighborhood (vertical slice)

A new **Street** lot connects the four destinations. Walk onto a glowing entrance pad
(or tap it) to enter Home, Park, Office, or Corner Shop on foot — no more teleport-only
travel. The street has its own interactables (fountain, bench) and a camera that follows
your Sim across the larger lot. The travel bar still works everywhere.

### GLTF art pass (initial)

- KayKit CC0 furniture models for bed, chair, couch, and desk (box fallback for other items)
- Textured street trees, facades, and fountain props
- Animated `RobotExpressive` GLB for the player and NPCs (idle / walk / sit clips)
- Asset paths and preload registry: [`src/game/modelPaths.ts`](src/game/modelPaths.ts)

Attribution: [`public/models/ATTRIBUTION.md`](public/models/ATTRIBUTION.md)

Architecture and migration plan: **[docs/PHASE6_NEIGHBORHOOD.md](docs/PHASE6_NEIGHBORHOOD.md)**

### Recent polish (pre–Phase 5)
- Travel fade + “Traveling to / Arrived at” toast when changing lots
- Per-lot lighting and environment presets (home, park, office, shop)
- Named lot signs and clearer landmarks outdoors

## Phase 4 features

### Four locations
Use the **neighborhood bar** at the top to travel between:
- **Home** — your furnished room; Build Mode and furniture interactions work here only
- **Park** — bench (sit), pond (watch)
- **Office** — clock in at the desk for a work shift (rabbit-hole: Sim stays at desk until shift ends)
- **Corner Shop** — buy coffee for hunger, fun, and a small friendship bump with Riley

### NPCs and schedules
Three neighbors appear based on sim time:
| NPC | Typical spots |
|-----|----------------|
| Alex | Home mornings, Park afternoons |
| Sam | Office during work hours, Park evenings |
| Riley | Shop most of the day |

Tap an NPC when they are present to walk over and chat. Friendship meters show in the HUD and increase after conversations.

### Work shift
1. Travel to **Office**
2. Tap **Clock In** at the desk
3. Shift runs on accelerated sim time (~4 in-game hours); needs decay slowly while working
4. When the shift ends, you return **Home** with energy cost, social boost, and +friendship with Sam

Travel and most interactions are disabled while on shift.

## Earlier phases (still included)

### Five needs + mood
Hunger, Energy, Hygiene, Fun, Social — mood from needs, day/night lighting, Cooking and Fitness skills.

### Home furniture
Eat, sleep, sit, shower, TV, read — same as Phase 3.

## Run locally

```bash
npm install
npm run dev
```

Open on your phone via the LAN URL Vite prints (`--host` is enabled).

## Phase 5 — Cloud save sync

Requires Supabase (free tier is fine). Full setup: **[docs/PHASE5_CLOUD_SYNC.md](docs/PHASE5_CLOUD_SYNC.md)**

1. Copy `.env.example` → `.env` and add your Supabase URL + anon key.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Use **Sign in** (top right) for a magic-link email.
4. Play — status shows **Synced** when cloud upload succeeds.

Guest play still works without signing in (local save only). If device and cloud both have saves, you pick which to keep.

## Roadmap

- **Phase 6.2** — Exit doors back to the street from every lot, NPC street commutes
- **Phase 6.3** — 3D art pass (GLTF models, pathfinding)
- **Phase 7+** — Async social / multiplayer exploration
