import type { LocationId } from './types';

export type EnvironmentPreset = 'apartment' | 'park' | 'city' | 'warehouse';

export interface LocationAmbience {
  environment: EnvironmentPreset;
  accentColor: string;
  accentIntensity: number;
  fogFarOffset: number;
}

export const LOCATION_AMBIENCE: Record<LocationId, LocationAmbience> = {
  home: {
    environment: 'apartment',
    accentColor: '#fff4e6',
    accentIntensity: 0.12,
    fogFarOffset: 0,
  },
  park: {
    environment: 'park',
    accentColor: '#c8f0b8',
    accentIntensity: 0.22,
    fogFarOffset: 2,
  },
  work: {
    environment: 'city',
    accentColor: '#d4e4ff',
    accentIntensity: 0.18,
    fogFarOffset: 0,
  },
  shop: {
    environment: 'warehouse',
    accentColor: '#ffe8c8',
    accentIntensity: 0.2,
    fogFarOffset: -1,
  },
};

export function getLocationAmbience(location: LocationId): LocationAmbience {
  return LOCATION_AMBIENCE[location];
}
