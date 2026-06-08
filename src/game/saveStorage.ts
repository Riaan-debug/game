import type { WorldState } from './types';
import { WORLD_STATE_VERSION } from './types';
import { setLocalSaveUpdatedAt } from './syncMeta';

const DB_NAME = 'life-sim';
const STORE_NAME = 'saves';
const SAVE_KEY = 'world';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadWorldState(): Promise<WorldState | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(SAVE_KEY);
      request.onsuccess = () => {
        const value = request.result as WorldState | undefined;
        resolve(value ?? null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function saveWorldState(state: WorldState): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(state, SAVE_KEY);
    tx.oncomplete = () => {
      setLocalSaveUpdatedAt(Date.now());
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function exportWorldState(state: WorldState): Promise<void> {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `life-sim-save-v${WORLD_STATE_VERSION}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
