import type { LocationId } from './types';

export const LOCATION_LABELS: Record<LocationId, string> = {
  home: 'Home',
  park: 'Park',
  work: 'Office',
  shop: 'Corner Shop',
};

export const LOCATION_SPAWNS: Record<LocationId, [number, number, number]> = {
  home: [0, 0, 0],
  park: [0, 0, 1.5],
  work: [0, 0, 2],
  shop: [0, 0, 1],
};

export const WORK_SHIFT_MINUTES = 240;

export const LOCATION_ORDER: LocationId[] = ['home', 'park', 'work', 'shop'];

export function getSpawnForLocation(location: LocationId): [number, number, number] {
  return LOCATION_SPAWNS[location];
}
