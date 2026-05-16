import { get, set, del } from 'idb-keyval';
import type { AppState } from './types';

const KEY = 'app-state';

export async function loadState(): Promise<AppState | null> {
  try {
    const v = await get(KEY);
    return (v as AppState | undefined) ?? null;
  } catch (e) {
    console.warn('[persistence] load failed:', e);
    return null;
  }
}

export async function saveState(state: AppState): Promise<void> {
  try {
    await set(KEY, state);
  } catch (e) {
    console.warn('[persistence] save failed:', e);
  }
}

export async function clearState(): Promise<void> {
  try {
    await del(KEY);
  } catch (e) {
    console.warn('[persistence] clear failed:', e);
  }
}
