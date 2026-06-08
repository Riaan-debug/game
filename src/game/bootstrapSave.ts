import { fetchCloudSave, type CloudSaveRow } from './cloudSave';
import { loadWorldState } from './saveStorage';
import { getLocalSaveUpdatedAt, setLocalSaveUpdatedAt } from './syncMeta';
import { migrateWorldState } from './simLogic';
import type { WorldState } from './types';

export interface SaveConflict {
  local: WorldState;
  localUpdatedAt: number;
  cloud: CloudSaveRow;
}

export type BootstrapResult =
  | { kind: 'state'; state: WorldState }
  | { kind: 'conflict'; conflict: SaveConflict }
  | { kind: 'empty' };

function cloudUpdatedMs(cloud: CloudSaveRow): number {
  return new Date(cloud.updated_at).getTime();
}

function savesLikelySame(local: WorldState, cloud: WorldState): boolean {
  return (
    local.simTimeMinutes === cloud.simTimeMinutes &&
    local.furniture.length === cloud.furniture.length &&
    local.currentLocation === cloud.currentLocation
  );
}

export async function bootstrapWorldState(userId: string | null): Promise<BootstrapResult> {
  const localRaw = await loadWorldState();
  const local = localRaw ? migrateWorldState(localRaw) : null;
  let localUpdatedAt = getLocalSaveUpdatedAt();
  if (local && localUpdatedAt === null) {
    localUpdatedAt = Date.now();
    setLocalSaveUpdatedAt(localUpdatedAt);
  }

  if (!userId) {
    if (local) return { kind: 'state', state: local };
    return { kind: 'empty' };
  }

  let cloud: CloudSaveRow | null = null;
  try {
    cloud = await fetchCloudSave(userId);
  } catch {
    if (local) return { kind: 'state', state: local };
    return { kind: 'empty' };
  }

  if (!cloud && local) return { kind: 'state', state: local };
  if (cloud && !local) return { kind: 'state', state: cloud.world_json };
  if (!cloud && !local) return { kind: 'empty' };

  if (!cloud || !local || localUpdatedAt === null) {
    return { kind: 'empty' };
  }

  const cloudMs = cloudUpdatedMs(cloud);
  const drift = Math.abs(cloudMs - localUpdatedAt);

  if (drift < 3000 || savesLikelySame(local, cloud.world_json)) {
    if (cloudMs >= localUpdatedAt) {
      return { kind: 'state', state: cloud.world_json };
    }
    return { kind: 'state', state: local };
  }

  return {
    kind: 'conflict',
    conflict: {
      local,
      localUpdatedAt,
      cloud,
    },
  };
}
