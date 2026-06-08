const LOCAL_UPDATED_KEY = 'life-sim-local-updated-at';

export function setLocalSaveUpdatedAt(ms: number): void {
  try {
    localStorage.setItem(LOCAL_UPDATED_KEY, String(ms));
  } catch {
    /* ignore quota errors */
  }
}

export function getLocalSaveUpdatedAt(): number | null {
  try {
    const raw = localStorage.getItem(LOCAL_UPDATED_KEY);
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

export function clearLocalSaveUpdatedAt(): void {
  try {
    localStorage.removeItem(LOCAL_UPDATED_KEY);
  } catch {
    /* ignore */
  }
}
