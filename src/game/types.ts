export const WORLD_STATE_VERSION = 6;

export type LocationId = 'home' | 'park' | 'work' | 'shop' | 'street';

export type SimActivity =
  | 'idle'
  | 'walking'
  | 'sitting'
  | 'sleeping'
  | 'eating'
  | 'showering'
  | 'watching'
  | 'reading'
  | 'chatting';

export type InteractionKind = 'sit' | 'sleep' | 'eat' | 'shower' | 'watch' | 'read';
export type LocationPropAction = 'clock_in' | 'buy_snack';
export type GameMode = 'live' | 'build';
export type FurnitureCategory = 'bedroom' | 'seating' | 'kitchen' | 'tables' | 'decor';
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export interface SimSkills {
  cooking: number;
  fitness: number;
}

export interface SimAppearance {
  skinToneId: string;
  hairStyleId: string;
  hairColorId: string;
  outfitId: string;
}

export interface SimState {
  id: string;
  position: [number, number, number];
  rotation: number;
  hunger: number;
  energy: number;
  hygiene: number;
  fun: number;
  social: number;
  mood: number;
  skills: SimSkills;
  activity: SimActivity;
  target: [number, number, number] | null;
  pendingAction: InteractionKind | null;
  targetFurnitureId: string | null;
  targetNpcId: string | null;
  targetPropId: string | null;
  actionElapsed: number;
  appearance: SimAppearance;
}

export interface PlacedFurniture {
  id: string;
  catalogId: string;
  position: [number, number, number];
  rotation: number;
}

export interface BuildState {
  selectedCatalogId: string;
  selectedPlacedId: string | null;
  placementRotation: number;
}

export interface NpcScheduleBlock {
  location: LocationId;
  startHour: number;
  endHour: number;
}

export interface NpcDef {
  id: string;
  name: string;
  skinToneId: string;
  hairColorId: string;
  outfitId: string;
  topColor: string;
  schedule: NpcScheduleBlock[];
}

export interface LocationProp {
  id: string;
  location: LocationId;
  label: string;
  position: [number, number, number];
  approach: [number, number, number];
  interaction?: InteractionKind;
  action?: LocationPropAction;
  color: string;
  size: [number, number, number];
}

export interface WorldState {
  version: number;
  currentLocation: LocationId;
  sim: SimState;
  simTimeMinutes: number;
  furniture: PlacedFurniture[];
  relationships: Record<string, number>;
  isWorking: boolean;
  workEndsAtMinute: number;
  mode: GameMode;
  build: BuildState;
}

export interface FurnitureCatalogItem {
  id: string;
  name: string;
  category: FurnitureCategory;
  footprint: [number, number];
  height: number;
  color: string;
  flat?: boolean;
  interaction?: InteractionKind;
  approachOffset?: [number, number];
  modelPath?: string;
}

export interface InteractableDef {
  id: string;
  label: string;
  position: [number, number, number];
  approach: [number, number, number];
  color: string;
  interaction: InteractionKind;
}
