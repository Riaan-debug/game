import type { InteractionKind, LocationId, LocationProp } from './types';

export const LOCATION_PROPS: LocationProp[] = [
  {
    id: 'park_bench',
    location: 'park',
    label: 'Park Bench',
    position: [-1.5, 0, -2],
    approach: [-1.5, 0, -1.2],
    interaction: 'sit',
    color: '#8b6340',
    size: [1.2, 0.45, 0.55],
  },
  {
    id: 'park_pond',
    location: 'park',
    label: 'Pond',
    position: [2, 0, 2],
    approach: [1.2, 0, 1.2],
    interaction: 'watch',
    color: '#6b8cce',
    size: [1.8, 0.08, 1.8],
  },
  {
    id: 'work_desk',
    location: 'work',
    label: 'Clock In',
    position: [0, 0, -2.2],
    approach: [0, 0, -1.4],
    action: 'clock_in',
    color: '#7a6048',
    size: [1.4, 0.78, 0.7],
  },
  {
    id: 'shop_counter',
    location: 'shop',
    label: 'Buy Coffee',
    position: [0, 0, -2],
    approach: [0, 0, -1.2],
    action: 'buy_snack',
    color: '#d8d2c8',
    size: [2, 0.95, 0.6],
  },
];

export function getPropsForLocation(location: LocationId): LocationProp[] {
  return LOCATION_PROPS.filter((prop) => prop.location === location);
}

export function getLocationProp(id: string): LocationProp | undefined {
  return LOCATION_PROPS.find((prop) => prop.id === id);
}

export function getPropInteractable(prop: LocationProp) {
  if (!prop.interaction) return null;
  return {
    id: prop.id,
    label: prop.label,
    position: prop.position,
    approach: prop.approach,
    color: prop.color,
    interaction: prop.interaction as InteractionKind,
  };
}
