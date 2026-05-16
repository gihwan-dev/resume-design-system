import { useEffect, useRef, useState } from 'react';
import { useStore, getStateSnapshot } from './store';
import { loadState, saveState } from './persistence';
import { useSaveStatus } from './saveStatus';
import { seedAppState } from '../seed/sampleResume';
import { debounce } from '../lib/debounce';
import { migrateAppState } from './migrations';

/**
 * Bootstrap hook — loads persisted state once on mount, then
 * persists every store change (debounced 250ms). Emits saving/saved
 * lifecycle events to saveStatus so the Topbar indicator can prove
 * the autosave is alive without prompting users to take snapshots.
 */
export function useBootstrap(): { ready: boolean } {
  const [ready, setReady] = useState(false);
  const debouncedRef = useRef<((s: ReturnType<typeof getStateSnapshot>) => void) | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const persisted = await loadState();
      if (cancelled) return;
      if (persisted && Object.keys(persisted.resumes ?? {}).length > 0) {
        useStore.getState().actions.loadState(migrateAppState(persisted));
      } else {
        useStore.getState().actions.loadState(seedAppState());
      }
      // First snapshot of the boot — treat as "already saved" so the
      // indicator doesn't sit at "저장 중…" forever before any edits happen.
      useSaveStatus.getState().markSaved();
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    debouncedRef.current = debounce(async (snapshot) => {
      try {
        await saveState(snapshot);
        useSaveStatus.getState().markSaved();
      } catch {
        useSaveStatus.getState().markError();
      }
    }, 250);
    const unsub = useStore.subscribe(() => {
      useSaveStatus.getState().markSaving();
      debouncedRef.current?.(getStateSnapshot());
    });
    return () => {
      unsub();
    };
  }, [ready]);

  return { ready };
}
