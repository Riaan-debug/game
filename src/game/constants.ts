import type { InteractableDef } from './types';

export const ROOM_SIZE = 8;
export const ROOM_HALF = ROOM_SIZE / 2;
export const WALK_SPEED = 2.2;
export const ARRIVAL_THRESHOLD = 0.15;

export const HUNGER_DECAY_PER_SEC = 0.55;
export const ENERGY_DECAY_PER_SEC = 0.42;
export const HYGIENE_DECAY_PER_SEC = 0.35;
export const FUN_DECAY_PER_SEC = 0.48;
export const SOCIAL_DECAY_PER_SEC = 0.38;
export const SIM_MINUTES_PER_SEC = 1.2;

export const NEED_MIN = 0;
export const NEED_MAX = 100;
export const SKILL_MAX = 100;

export function clampNeed(value: number): number {
  return Math.max(NEED_MIN, Math.min(NEED_MAX, value));
}

export function clampSkill(value: number): number {
  return Math.max(0, Math.min(SKILL_MAX, value));
}

export function clampToRoom(x: number, z: number): [number, number] {
  const margin = 0.4;
  return [
    Math.max(-ROOM_HALF + margin, Math.min(ROOM_HALF - margin, x)),
    Math.max(-ROOM_HALF + margin, Math.min(ROOM_HALF - margin, z)),
  ];
}

export type { InteractableDef };
