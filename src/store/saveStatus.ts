import { create } from 'zustand';

/**
 * Tiny side store that mirrors the IndexedDB persistence lifecycle.
 *
 * The main store already persists every change (debounced 250 ms), but the
 * user has no way to tell that it's working. This store emits `saving` the
 * moment a change is observed and flips to `saved` once the IndexedDB write
 * resolves — so the Topbar indicator can prove the autosave is alive.
 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusState {
  status: SaveStatus;
  lastSavedAt: number | null;
  markSaving: () => void;
  markSaved: () => void;
  markError: () => void;
}

export const useSaveStatus = create<SaveStatusState>((set) => ({
  status: 'idle',
  lastSavedAt: null,
  markSaving: () => set({ status: 'saving' }),
  markSaved: () => set({ status: 'saved', lastSavedAt: Date.now() }),
  markError: () => set({ status: 'error' }),
}));
