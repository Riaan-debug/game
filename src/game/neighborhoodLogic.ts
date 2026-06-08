import { getPropInteractable, getLocationProp } from './locationProps';
import { WORK_SHIFT_MINUTES, getSpawnForLocation } from './locations';
import { clampFriendship, getNpcDef } from './npcLogic';
import { clampNeed } from './constants';
import { computeMood } from './moodLogic';
import { cancelActivity } from './simLogic';
import type { LocationId, SimState, WorldState } from './types';

export function travelToLocation(world: WorldState, location: LocationId): WorldState {
  if (world.isWorking) return world;
  if (world.currentLocation === location) return world;

  const spawn = getSpawnForLocation(location);
  const sim = cancelActivity({
    ...world.sim,
    position: spawn,
    target: null,
    targetFurnitureId: null,
    targetNpcId: null,
    targetPropId: null,
    pendingAction: null,
    actionElapsed: 0,
  });

  return {
    ...world,
    currentLocation: location,
    mode: location === 'home' ? world.mode : 'live',
    sim,
  };
}

export function clockInToWork(world: WorldState): WorldState {
  if (world.currentLocation !== 'work' || world.isWorking) return world;

  return {
    ...world,
    isWorking: true,
    workEndsAtMinute: world.simTimeMinutes + WORK_SHIFT_MINUTES,
    sim: {
      ...cancelActivity(world.sim),
      position: [0, 0, -1.4],
      rotation: Math.PI,
    },
  };
}

export function buySnack(world: WorldState): WorldState {
  if (world.currentLocation !== 'shop') return world;

  return {
    ...world,
    relationships: {
      ...world.relationships,
      riley: clampFriendship((world.relationships.riley ?? 10) + 2),
    },
    sim: (() => {
      const sim = {
        ...world.sim,
        hunger: clampNeed(world.sim.hunger + 28),
        fun: clampNeed(world.sim.fun + 12),
        social: clampNeed(world.sim.social + 5),
      };
      return { ...sim, mood: computeMood(sim) };
    })(),
  };
}

export function queueNpcTalk(sim: SimState, npcId: string, approach: [number, number, number]): SimState {
  const [ax, , az] = approach;
  return {
    ...sim,
    activity: 'walking',
    target: [ax, 0, az],
    pendingAction: null,
    targetFurnitureId: null,
    targetPropId: null,
    targetNpcId: npcId,
    actionElapsed: 0,
  };
}

export function queuePropInteraction(sim: SimState, propId: string): SimState | null {
  const prop = getLocationProp(propId);
  if (!prop?.interaction) return null;

  const interactable = getPropInteractable(prop);
  if (!interactable) return null;

  const [ax, , az] = interactable.approach;
  return {
    ...sim,
    activity: 'walking',
    target: [ax, 0, az],
    pendingAction: interactable.interaction,
    targetFurnitureId: null,
    targetNpcId: null,
    targetPropId: propId,
    actionElapsed: 0,
  };
}

export function faceTarget(sim: SimState, target: [number, number, number]): number {
  const [px, , pz] = sim.position;
  const [tx, , tz] = target;
  return Math.atan2(tx - px, tz - pz);
}

export function getNpcName(npcId: string): string {
  return getNpcDef(npcId)?.name ?? 'Someone';
}
