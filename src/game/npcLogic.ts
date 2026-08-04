import { clampNeed } from './constants';
import { LOCATION_SPAWNS } from './locations';
import type { LocationId, NpcDef, WorldState } from './types';

export const NPCS: NpcDef[] = [
  {
    id: 'alex',
    name: 'Alex',
    skinToneId: 'light',
    hairColorId: 'brown',
    outfitId: 'casual_green',
    topColor: '#5f8f5a',
    schedule: [
      { location: 'home', startHour: 7, endHour: 11 },
      { location: 'park', startHour: 11, endHour: 18 },
      { location: 'home', startHour: 18, endHour: 23 },
    ],
  },
  {
    id: 'sam',
    name: 'Sam',
    skinToneId: 'tan',
    hairColorId: 'black',
    outfitId: 'office_neutral',
    topColor: '#d8d2c8',
    schedule: [
      { location: 'work', startHour: 8, endHour: 17 },
      { location: 'park', startHour: 17, endHour: 20 },
    ],
  },
  {
    id: 'riley',
    name: 'Riley',
    skinToneId: 'medium',
    hairColorId: 'auburn',
    outfitId: 'pastel_pink',
    topColor: '#e8b4b8',
    schedule: [{ location: 'shop', startHour: 9, endHour: 21 }],
  },
];

const NPC_POSITIONS: Record<LocationId, Record<string, [number, number, number]>> = {
  home: { alex: [-2, 0, -1] },
  park: { alex: [1.5, 0, -1], sam: [-1.5, 0, 0.5] },
  work: { sam: [0, 0, -1.5] },
  shop: { riley: [0.5, 0, -1] },
  street: {},
};

export function getNpcDef(id: string): NpcDef | undefined {
  return NPCS.find((npc) => npc.id === id);
}

function getSimHour(simTimeMinutes: number): number {
  return Math.floor(simTimeMinutes / 60) % 24;
}

function isHourInRange(hour: number, start: number, end: number): boolean {
  if (start <= end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

export function getNpcLocation(npc: NpcDef, simTimeMinutes: number): LocationId | null {
  const hour = getSimHour(simTimeMinutes);
  const block = npc.schedule.find((entry) => isHourInRange(hour, entry.startHour, entry.endHour));
  return block?.location ?? null;
}

export interface ActiveNpc {
  id: string;
  name: string;
  position: [number, number, number];
  approach: [number, number, number];
  topColor: string;
  skinToneId: string;
  hairColorId: string;
  friendship: number;
}

export function getActiveNpcs(world: WorldState): ActiveNpc[] {
  return NPCS.flatMap((npc) => {
    const location = getNpcLocation(npc, world.simTimeMinutes);
    if (location !== world.currentLocation) return [];
    const position = NPC_POSITIONS[location][npc.id];
    if (!position) return [];
    const [x, , z] = position;
    return [{
      id: npc.id,
      name: npc.name,
      position,
      approach: [x, 0, z + 0.7],
      topColor: npc.topColor,
      skinToneId: npc.skinToneId,
      hairColorId: npc.hairColorId,
      friendship: world.relationships[npc.id] ?? 15,
    }];
  });
}

export function getFriendshipLabel(value: number): string {
  if (value >= 80) return 'Best friend';
  if (value >= 60) return 'Good friend';
  if (value >= 40) return 'Friend';
  if (value >= 20) return 'Acquaintance';
  return 'Stranger';
}

export function clampFriendship(value: number): number {
  return clampNeed(value);
}

export function defaultRelationships(): Record<string, number> {
  return { alex: 20, sam: 15, riley: 10 };
}

export function getSpawnForLocation(location: LocationId): [number, number, number] {
  return LOCATION_SPAWNS[location];
}
