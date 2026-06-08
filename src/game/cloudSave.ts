import { getSupabase } from '../lib/supabase';
import { migrateWorldState } from './simLogic';
import type { WorldState } from './types';
import { WORLD_STATE_VERSION } from './types';

export interface CloudSaveRow {
  user_id: string;
  world_json: WorldState;
  version: number;
  updated_at: string;
}

export async function fetchCloudSave(userId: string): Promise<CloudSaveRow | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('saves')
    .select('user_id, world_json, version, updated_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('fetchCloudSave', error);
    throw new Error(error.message);
  }

  if (!data) return null;

  return {
    user_id: data.user_id,
    world_json: migrateWorldState(data.world_json as WorldState),
    version: data.version,
    updated_at: data.updated_at,
  };
}

export async function upsertCloudSave(userId: string, state: WorldState): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Cloud sync is not configured');

  const payload = {
    user_id: userId,
    world_json: migrateWorldState(state),
    version: WORLD_STATE_VERSION,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('saves')
    .upsert(payload, { onConflict: 'user_id' })
    .select('updated_at')
    .single();

  if (error) {
    console.error('upsertCloudSave', error);
    throw new Error(error.message);
  }

  return data.updated_at as string;
}
