import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_APPEARANCE } from './casCatalog';
import {
  ARRIVAL_THRESHOLD,
  clampNeed,
  clampSkill,
  clampToRoom,
  ENERGY_DECAY_PER_SEC,
  FUN_DECAY_PER_SEC,
  HUNGER_DECAY_PER_SEC,
  HYGIENE_DECAY_PER_SEC,
  SIM_MINUTES_PER_SEC,
  SOCIAL_DECAY_PER_SEC,
  WALK_SPEED,
} from './constants';
import { getInteractablesFromFurniture } from './buildLogic';
import { getLocationProp } from './locationProps';
import { clampFriendship, getActiveNpcs, getNpcDef } from './npcLogic';
import { getSpawnForLocation, WORK_SHIFT_MINUTES } from './locations';
import { computeMood, getTimeOfDay } from './moodLogic';
import type { InteractionKind, SimActivity, SimAppearance, SimSkills, SimState, WorldState } from './types';
import { WORLD_STATE_VERSION } from './types';

function defaultAppearance(): SimAppearance {
  return { ...DEFAULT_APPEARANCE };
}

function defaultSkills(): SimSkills {
  return { cooking: 8, fitness: 5 };
}

export function createInitialWorldState(): WorldState {
  return {
    version: WORLD_STATE_VERSION,
    currentLocation: 'home',
    relationships: { alex: 20, sam: 15, riley: 10 },
    isWorking: false,
    workEndsAtMinute: 0,
    simTimeMinutes: 8 * 60,
    mode: 'live',
    build: {
      selectedCatalogId: 'chair',
      selectedPlacedId: null,
      placementRotation: 0,
    },
    furniture: [
      { id: uuidv4(), catalogId: 'bed', position: [-2.5, 0, -2.5], rotation: 0 },
      { id: uuidv4(), catalogId: 'chair', position: [1.5, 0, -1.5], rotation: 0 },
      { id: uuidv4(), catalogId: 'fridge', position: [2.5, 0, 2.5], rotation: 0 },
      { id: uuidv4(), catalogId: 'kitchen_counter', position: [2.0, 0, 1.5], rotation: 0 },
      { id: uuidv4(), catalogId: 'toilet', position: [-2.5, 0, 2.5], rotation: 0 },
      { id: uuidv4(), catalogId: 'tv_stand', position: [0, 0, -2.8], rotation: 0 },
    ],
    sim: {
      id: uuidv4(),
      position: [0, 0, 0],
      rotation: 0,
      hunger: 72,
      energy: 80,
      hygiene: 76,
      fun: 65,
      social: 58,
      mood: 70,
      skills: defaultSkills(),
      activity: 'idle',
      target: null,
      pendingAction: null,
      targetFurnitureId: null,
      targetNpcId: null,
      targetPropId: null,
      actionElapsed: 0,
      appearance: defaultAppearance(),
    },
  };
}

export function normalizeSim(sim: SimState): SimState {
  const normalized: SimState = {
    ...sim,
    targetFurnitureId: sim.targetFurnitureId ?? null,
    targetNpcId: sim.targetNpcId ?? null,
    targetPropId: sim.targetPropId ?? null,
    actionElapsed: sim.actionElapsed ?? 0,
    appearance: sim.appearance ?? defaultAppearance(),
    hygiene: sim.hygiene ?? 76,
    fun: sim.fun ?? 65,
    social: sim.social ?? 58,
    skills: sim.skills ?? defaultSkills(),
    mood: sim.mood ?? 70,
  };
  return { ...normalized, mood: computeMood(normalized) };
}

export function migrateWorldState(state: WorldState): WorldState {
  const defaults = createInitialWorldState();
  if (!state.furniture || state.furniture.length === 0) {
    return {
      ...defaults,
      ...state,
      version: WORLD_STATE_VERSION,
      furniture: defaults.furniture,
      currentLocation: state.currentLocation ?? 'home',
      relationships: state.relationships ?? defaults.relationships,
      isWorking: false,
      workEndsAtMinute: 0,
      mode: state.mode ?? 'live',
      build: state.build ?? defaults.build,
      sim: normalizeSim({ ...defaults.sim, ...state.sim }),
    };
  }

  return {
    ...state,
    version: WORLD_STATE_VERSION,
    currentLocation: state.currentLocation ?? 'home',
    relationships: state.relationships ?? defaults.relationships,
    isWorking: state.isWorking ?? false,
    workEndsAtMinute: state.workEndsAtMinute ?? 0,
    mode: state.mode ?? 'live',
    build: state.build ?? defaults.build,
    sim: normalizeSim(state.sim),
  };
}

const ACTIVITY_MAP: Record<InteractionKind, SimActivity> = {
  sit: 'sitting',
  sleep: 'sleeping',
  eat: 'eating',
  shower: 'showering',
  watch: 'watching',
  read: 'reading',
};

function faceFurniture(sim: SimState, world: WorldState): number {
  if (!sim.targetFurnitureId) return sim.rotation;
  const placed = world.furniture.find((item) => item.id === sim.targetFurnitureId);
  if (!placed) return sim.rotation;
  const [px, , pz] = sim.position;
  const [fx, , fz] = placed.position;
  return Math.atan2(fx - px, fz - pz);
}

function applyArrivalAction(sim: SimState, world: WorldState): SimState {
  if (sim.targetNpcId) {
    const active = getActiveNpcs(world).find((npc) => npc.id === sim.targetNpcId);
    const [px, , pz] = sim.position;
    const lookX = active?.position[0] ?? px;
    const lookZ = active?.position[2] ?? pz;
    return {
      ...sim,
      target: null,
      rotation: Math.atan2(lookX - px, lookZ - pz),
      activity: 'chatting',
      actionElapsed: 0,
    };
  }

  if (!sim.pendingAction) {
    return {
      ...sim,
      activity: 'idle',
      target: null,
      targetFurnitureId: null,
      targetPropId: null,
      actionElapsed: 0,
    };
  }

  let rotation = faceFurniture(sim, world);
  if (sim.targetPropId) {
    const prop = getLocationProp(sim.targetPropId);
    if (prop) {
      const [px, , pz] = sim.position;
      const [fx, , fz] = prop.position;
      rotation = Math.atan2(fx - px, fz - pz);
    }
  }

  return {
    ...sim,
    target: null,
    rotation,
    activity: ACTIVITY_MAP[sim.pendingAction],
    actionElapsed: 0,
  };
}

function applyPassiveNeedDecay(sim: SimState, delta: number, timeOfDay: ReturnType<typeof getTimeOfDay>): SimState {
  const energyMultiplier = timeOfDay === 'night' ? 1.15 : 1;
  return {
    ...sim,
    hunger: clampNeed(sim.hunger - HUNGER_DECAY_PER_SEC * delta),
    energy: clampNeed(sim.energy - ENERGY_DECAY_PER_SEC * energyMultiplier * delta),
    hygiene: clampNeed(sim.hygiene - HYGIENE_DECAY_PER_SEC * delta),
    fun: clampNeed(sim.fun - FUN_DECAY_PER_SEC * delta),
    social: clampNeed(sim.social - SOCIAL_DECAY_PER_SEC * delta),
  };
}

function finishInteraction(sim: SimState): SimState {
  return {
    ...sim,
    activity: 'idle',
    pendingAction: null,
    targetFurnitureId: null,
    targetNpcId: null,
    targetPropId: null,
    actionElapsed: 0,
  };
}

export function moveSimTo(sim: SimState, x: number, z: number): SimState {
  const [cx, cz] = clampToRoom(x, z);
  return {
    ...sim,
    activity: 'walking',
    target: [cx, 0, cz],
    pendingAction: null,
    targetFurnitureId: null,
    targetNpcId: null,
    targetPropId: null,
    actionElapsed: 0,
  };
}

export function queueInteraction(
  sim: SimState,
  furnitureId: string,
  world: WorldState,
): SimState {
  const interactables = getInteractablesFromFurniture(world.furniture);
  const def = interactables.find((item) => item.id === furnitureId);
  if (!def) return sim;

  const [ax, , az] = def.approach;
  return {
    ...sim,
    activity: 'walking',
    target: [ax, 0, az],
    pendingAction: def.interaction,
    targetFurnitureId: furnitureId,
    targetNpcId: null,
    targetPropId: null,
    actionElapsed: 0,
  };
}

export function cancelActivity(sim: SimState): SimState {
  if (sim.activity === 'walking') return sim;
  return finishInteraction({ ...sim, activity: 'idle' });
}

export function getActivityLabel(sim: SimState, world: WorldState): string {
  if (world.isWorking) return 'On the job…';

  if (sim.activity === 'walking' && sim.targetNpcId) {
    const name = getNpcDef(sim.targetNpcId)?.name ?? 'neighbor';
    return `Going to talk to ${name}…`;
  }

  if (sim.activity === 'walking' && sim.pendingAction && sim.targetFurnitureId) {
    const interactables = getInteractablesFromFurniture(world.furniture);
    const def = interactables.find((item) => item.id === sim.targetFurnitureId);
    const name = def?.label ?? 'object';
    const verbs: Record<InteractionKind, string> = {
      eat: 'Getting food from',
      sleep: 'Going to',
      sit: 'Sitting on',
      shower: 'Heading to',
      watch: 'Going to watch',
      read: 'Going to read at',
    };
    return `${verbs[sim.pendingAction]} ${name}…`;
  }

  if (sim.activity === 'chatting') {
    const name = getNpcDef(sim.targetNpcId ?? '')?.name ?? 'neighbor';
    return `Chatting with ${name}`;
  }

  const labels: Record<SimActivity, string> = {
    idle: 'Idle',
    walking: 'Walking…',
    sitting: 'Relaxing',
    sleeping: 'Sleeping',
    eating: 'Eating',
    showering: 'Showering',
    watching: 'Watching TV',
    reading: 'Reading',
    chatting: 'Chatting',
  };
  return labels[sim.activity];
}

export function tickSim(sim: SimState, delta: number, world: WorldState): SimState {
  const timeOfDay = getTimeOfDay(world.simTimeMinutes);
  let next: SimState = { ...sim, actionElapsed: sim.actionElapsed + delta };

  if (next.activity === 'walking' && next.target) {
    const [tx, , tz] = next.target;
    const [x, , z] = next.position;
    const dx = tx - x;
    const dz = tz - z;
    const dist = Math.hypot(dx, dz);

    if (dist <= ARRIVAL_THRESHOLD) {
      next = applyArrivalAction({ ...next, position: [tx, 0, tz] }, world);
    } else {
      const step = WALK_SPEED * delta;
      const ratio = Math.min(1, step / dist);
      const nx = x + dx * ratio;
      const nz = z + dz * ratio;
      next = {
        ...next,
        position: [nx, 0, nz],
        rotation: Math.atan2(dx, dz),
        skills: {
          ...next.skills,
          fitness: clampSkill(next.skills.fitness + delta * 1.8),
        },
      };
    }
  }

  const passiveActivities: SimActivity[] = ['idle', 'walking', 'sitting'];
  if (passiveActivities.includes(next.activity)) {
    next = applyPassiveNeedDecay(next, delta, timeOfDay);
  }

  if (next.activity === 'sitting') {
    next = {
      ...next,
      energy: clampNeed(next.energy + 2.2 * delta),
      fun: clampNeed(next.fun + 4.5 * delta),
      social: clampNeed(next.social + 1.5 * delta),
    };
  }

  if (next.activity === 'sleeping') {
    const sleepBoost = timeOfDay === 'night' ? 14 : 10;
    next = {
      ...next,
      energy: clampNeed(next.energy + sleepBoost * delta),
      hunger: clampNeed(next.hunger - HUNGER_DECAY_PER_SEC * 0.3 * delta),
      hygiene: clampNeed(next.hygiene - HYGIENE_DECAY_PER_SEC * 0.2 * delta),
    };
  }

  if (next.activity === 'eating') {
    const cookingBonus = 1 + next.skills.cooking / 200;
    const eatRate = next.actionElapsed < 0.6 ? 0 : 20 * cookingBonus;
    next = {
      ...next,
      hunger: clampNeed(next.hunger + eatRate * delta),
      fun: clampNeed(next.fun + 1.5 * delta),
      skills: {
        ...next.skills,
        cooking: clampSkill(next.skills.cooking + delta * 2.5),
      },
    };

    if (next.actionElapsed >= 2.4 || next.hunger >= 96) {
      next = finishInteraction(next);
    }
  }

  if (next.activity === 'showering') {
    next = {
      ...next,
      hygiene: clampNeed(next.hygiene + 24 * delta),
      energy: clampNeed(next.energy - 0.08 * delta),
    };
    if (next.actionElapsed >= 2.8 || next.hygiene >= 98) {
      next = finishInteraction(next);
    }
  }

  if (next.activity === 'watching') {
    next = {
      ...next,
      fun: clampNeed(next.fun + 10 * delta),
      social: clampNeed(next.social + 0.5 * delta),
      energy: clampNeed(next.energy - ENERGY_DECAY_PER_SEC * 0.35 * delta),
    };
    if (next.fun >= 92) {
      next = finishInteraction(next);
    }
  }

  if (next.activity === 'reading') {
    next = {
      ...next,
      fun: clampNeed(next.fun + 6 * delta),
      social: clampNeed(next.social + 4 * delta),
      energy: clampNeed(next.energy - ENERGY_DECAY_PER_SEC * 0.25 * delta),
    };
    if (next.actionElapsed >= 3.5 || next.fun >= 88) {
      next = finishInteraction(next);
    }
  }

  if (next.activity === 'chatting') {
    next = {
      ...next,
      social: clampNeed(next.social + 9 * delta),
      fun: clampNeed(next.fun + 4 * delta),
      energy: clampNeed(next.energy - ENERGY_DECAY_PER_SEC * 0.2 * delta),
    };
    if (next.actionElapsed >= 3.2) {
      next = finishInteraction(next);
    }
  }

  return { ...next, mood: computeMood(next) };
}

function tickSimAtWork(sim: SimState, delta: number): SimState {
  const next = applyPassiveNeedDecay(sim, delta, 'day');
  return {
    ...next,
    hunger: clampNeed(next.hunger - HUNGER_DECAY_PER_SEC * 0.4 * delta),
    energy: clampNeed(next.energy - ENERGY_DECAY_PER_SEC * 0.35 * delta),
    social: clampNeed(next.social - SOCIAL_DECAY_PER_SEC * 0.6 * delta),
    mood: computeMood(next),
  };
}

export function getWorkShiftProgress(world: WorldState): number {
  if (!world.isWorking) return 0;
  const workStartedAt = world.workEndsAtMinute - WORK_SHIFT_MINUTES;
  const elapsed = Math.max(0, world.simTimeMinutes - workStartedAt);
  return Math.min(1, elapsed / WORK_SHIFT_MINUTES);
}

function completeWorkShift(world: WorldState, progress: number): WorldState {
  const share = Math.max(0.05, Math.min(1, progress));

  return {
    ...world,
    isWorking: false,
    workEndsAtMinute: 0,
    currentLocation: 'home',
    relationships: {
      ...world.relationships,
      sam: clampFriendship((world.relationships.sam ?? 15) + Math.round(10 * share)),
    },
    sim: normalizeSim({
      ...cancelActivity(world.sim),
      position: getSpawnForLocation('home'),
      energy: clampNeed(world.sim.energy - Math.round(8 + 12 * share)),
      social: clampNeed(world.sim.social + Math.round(14 * share)),
      fun: clampNeed(world.sim.fun - Math.round(6 * share)),
    }),
  };
}

export function finishWorkShift(world: WorldState): WorldState {
  return completeWorkShift(world, 1);
}

export function leaveWorkEarly(world: WorldState): WorldState {
  if (!world.isWorking) return world;
  return completeWorkShift(world, getWorkShiftProgress(world));
}

export function tickWorld(world: WorldState, delta: number): WorldState {
  if (world.mode !== 'live') return world;

  let next: WorldState = {
    ...world,
    simTimeMinutes: world.simTimeMinutes + SIM_MINUTES_PER_SEC * delta,
  };

  if (next.isWorking) {
    next = {
      ...next,
      sim: tickSimAtWork(next.sim, delta),
    };
    if (next.simTimeMinutes >= next.workEndsAtMinute) {
      return finishWorkShift(next);
    }
    return next;
  }

  const prevActivity = next.sim.activity;
  const prevNpcId = next.sim.targetNpcId;
  const nextSim = tickSim(next.sim, delta, next);

  let relationships = next.relationships;
  if (prevActivity === 'chatting' && nextSim.activity === 'idle' && prevNpcId) {
    relationships = {
      ...relationships,
      [prevNpcId]: clampFriendship((relationships[prevNpcId] ?? 15) + 6),
    };
  }

  return {
    ...next,
    relationships,
    sim: nextSim,
  };
}

export function formatSimTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = Math.floor(minutes % 60);
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function updateSimAppearance(sim: SimState, patch: Partial<SimAppearance>): SimState {
  return {
    ...sim,
    appearance: { ...sim.appearance, ...patch },
  };
}
