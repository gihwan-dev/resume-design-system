import { useEffect, useRef, useState } from 'react';
import { useStore, getStateSnapshot } from './store';
import { loadState, saveState } from './persistence';
import { seedAppState } from '../seed/sampleResume';
import { debounce } from '../lib/debounce';

/**
 * Bootstrap hook — loads persisted state once on mount, then
 * persists every store change (debounced 250ms).
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
        useStore.getState().actions.loadState(persisted);
      } else {
        useStore.getState().actions.loadState(seedAppState());
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    debouncedRef.current = debounce((snapshot) => {
      void saveState(snapshot);
    }, 250);
    const unsub = useStore.subscribe(() => {
      debouncedRef.current?.(getStateSnapshot());
    });
    return () => {
      unsub();
    };
  }, [ready]);

  return { ready };
}
