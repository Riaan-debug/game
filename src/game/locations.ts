import type { LocationId } from './types';

export const LOCATION_LABELS: Record<LocationId, string> = {
  home: 'Home',
  park: 'Park',
  work: 'Office',
  shop: 'Corner Shop',
  street: 'Street',
};

export const LOCATION_SPAWNS: Record<LocationId, [number, number, number]> = {
  home: [0, 0, 0],
  park: [0, 0, 1.5],
  work: [0, 0, 2],
  shop: [0, 0, 1],
  street: [0, 0, 0.9],
};

/** Walkable area per location as [width, depth] centered on the origin. */
export const LOCATION_BOUNDS: Record<LocationId, [number, number]> = {
  home: [8, 8],
  park: [8, 8],
  work: [8, 8],
  shop: [8, 8],
  street: [22, 14],
};

export const WORK_SHIFT_MINUTES = 240;

export const LOCATION_ORDER: LocationId[] = ['home', 'street', 'park', 'work', 'shop'];

export function getSpawnForLocation(location: LocationId): [number, number, number] {
  return LOCATION_SPAWNS[location];
}

export function isLocationId(value: unknown): value is LocationId {
  return typeof value === 'string' && value in LOCATION_LABELS;
}

export function clampToLocation(location: LocationId, x: number, z: number): [number, number] {
  const [width, depth] = LOCATION_BOUNDS[location];
  const margin = 0.4;
  return [
    Math.max(-width / 2 + margin, Math.min(width / 2 - margin, x)),
    Math.max(-depth / 2 + margin, Math.min(depth / 2 - margin, z)),
  ];
}

/** Walk-into trigger zones on the street that lead into a lot. */
export interface LotPortal {
  location: LocationId;
  /** Door pad position on the street, in world space. */
  position: [number, number, number];
  radius: number;
}

export const STREET_PORTALS: LotPortal[] = [
  { location: 'home', position: [-7.5, 0, -4.3], radius: 0.9 },
  { location: 'park', position: [7.5, 0, -4.3], radius: 0.9 },
  { location: 'work', position: [-7.5, 0, 4.3], radius: 0.9 },
  { location: 'shop', position: [7.5, 0, 4.3], radius: 0.9 },
];

export function getPortalNear(position: [number, number, number]): LotPortal | null {
  const [x, , z] = position;
  for (const portal of STREET_PORTALS) {
    const [px, , pz] = portal.position;
    if (Math.hypot(px - x, pz - z) <= portal.radius) return portal;
  }
  return null;
}
