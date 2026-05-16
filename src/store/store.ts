import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AppState, Page, Resume, Snapshot } from './types';
import type { Block, BlockType } from '../blocks';
import { getBlock } from '../blocks';
import { uid } from '../lib/uid';

const SCHEMA_VERSION = 1;

export interface Actions {
  loadState: (state: AppState) => void;

  selectBlock: (id: string | null) => void;
  selectResume: (id: string) => void;

  createResume: (opts: { name?: string; empty?: boolean }) => void;
  renameResume: (id: string, name: string) => void;
  duplicateResume: (id: string) => void;
  deleteResume: (id: string) => void;
  setResumeTheme: (id: string, theme: string) => void;

  addPage: (afterPageId?: string) => void;
  removePage: (pageId: string) => void;
  movePage: (pageId: string, toIndex: number) => void;

  addBlock: (opts: { pageId?: string; blockType: BlockType; index?: number }) => string;
  removeBlock: (blockId: string) => void;
  duplicateBlock: (blockId: string) => void;
  updateBlock: (blockId: string, data: Record<string, unknown>) => void;
  moveBlock: (opts: { blockId: string; toPageId: string; toIndex?: number }) => void;
  /** Move a block one slot up (-1) or down (+1). Crosses page boundaries: from the
   *  first block of a page, ↑ lands at the end of the previous page; from the last
   *  block of a page, ↓ lands at the start of the next page. */
  moveBlockBy: (blockId: string, delta: -1 | 1) => void;

  snapshotCreate: (name?: string) => void;
  snapshotDelete: (id: string) => void;
  snapshotRestore: (id: string) => void;
  snapshotRename: (id: string, name: string) => void;
}

export type Store = AppState & { actions: Actions };

function findBlockLocation(
  resume: Resume,
  blockId: string,
): { page: Page; index: number; block: Block } | null {
  for (const p of resume.pages) {
    const idx = p.blocks.findIndex((b) => b.id === blockId);
    if (idx !== -1) {
      const block = p.blocks[idx]!;
      return { page: p, index: idx, block };
    }
  }
  return null;
}

function makeBlock(blockType: BlockType): Block | null {
  const def = getBlock(blockType);
  if (!def) return null;
  return { id: uid('b'), type: blockType, data: def.defaultData() } as Block;
}

function emptyState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    currentResumeId: '',
    selectedBlockId: null,
    resumes: {},
  };
}

export const useStore = create<Store>()(
  immer((set) => ({
    ...emptyState(),
    actions: {
      loadState: (state) =>
        set((s) => {
          // Filter out blocks whose type is no longer registered (e.g. legacy
          // `career` / `caseStudy` from before the v2 decomposition). Without
          // this guard, persisted state from an older schema would still load
          // those blocks; render is null-safe but duplicate/move/inspector
          // paths can surprise the user. Drop them so the resume opens clean.
          for (const r of Object.values(state.resumes ?? {})) {
            r.pages = r.pages.map((p) => ({
              ...p,
              blocks: p.blocks.filter((b) => getBlock(b.type) != null),
            }));
          }
          Object.assign(s, state);
        }),

      selectBlock: (id) =>
        set((s) => {
          s.selectedBlockId = id;
        }),
      selectResume: (id) =>
        set((s) => {
          s.currentResumeId = id;
          s.selectedBlockId = null;
        }),

      createResume: ({ name, empty }) =>
        set((s) => {
          const id = uid('r');
          const now = Date.now();
          const pages: Page[] = empty
            ? [{ id: uid('p'), blocks: [] }]
            : [
                {
                  id: uid('p'),
                  blocks: [
                    makeBlock('header')!,
                    makeBlock('positioning')!,
                    {
                      id: uid('b'),
                      type: 'sectionHeader',
                      data: { title: 'Career', meta: '', variant: 'primary' },
                    },
                    makeBlock('careerHeader')!,
                    makeBlock('careerProject')!,
                    makeBlock('par')!,
                  ],
                },
              ];
          s.resumes[id] = {
            id,
            name: name ?? '새 이력서',
            createdAt: now,
            updatedAt: now,
            theme: 'default',
            pages,
            snapshots: [],
          };
          s.currentResumeId = id;
          s.selectedBlockId = null;
        }),

      renameResume: (id, name) =>
        set((s) => {
          const r = s.resumes[id];
          if (!r) return;
          r.name = name;
          r.updatedAt = Date.now();
        }),

      duplicateResume: (id) =>
        set((s) => {
          const src = s.resumes[id];
          if (!src) return;
          const newId = uid('r');
          const dup: Resume = {
            ...JSON.parse(JSON.stringify(src)),
            id: newId,
            name: src.name + ' 사본',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            snapshots: [],
          };
          s.resumes[newId] = dup;
          s.currentResumeId = newId;
          s.selectedBlockId = null;
        }),

      deleteResume: (id) =>
        set((s) => {
          delete s.resumes[id];
          const remaining = Object.keys(s.resumes);
          if (s.currentResumeId === id) {
            if (remaining.length === 0) {
              const newId = uid('r');
              s.resumes[newId] = {
                id: newId,
                name: '새 이력서',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                theme: 'default',
                pages: [{ id: uid('p'), blocks: [] }],
                snapshots: [],
              };
              s.currentResumeId = newId;
            } else {
              s.currentResumeId = remaining[0]!;
            }
            s.selectedBlockId = null;
          }
        }),

      setResumeTheme: (id, theme) =>
        set((s) => {
          const r = s.resumes[id];
          if (!r) return;
          r.theme = theme as Resume['theme'];
          r.updatedAt = Date.now();
        }),

      addPage: (afterPageId) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          const insertAt = afterPageId
            ? r.pages.findIndex((p) => p.id === afterPageId) + 1
            : r.pages.length;
          r.pages.splice(insertAt, 0, { id: uid('p'), blocks: [] });
          r.updatedAt = Date.now();
        }),

      removePage: (pageId) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          if (r.pages.length <= 1) return;
          r.pages = r.pages.filter((p) => p.id !== pageId);
          if (s.selectedBlockId && !findBlockLocation(r, s.selectedBlockId)) {
            s.selectedBlockId = null;
          }
          r.updatedAt = Date.now();
        }),

      movePage: (pageId, toIndex) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          const from = r.pages.findIndex((p) => p.id === pageId);
          if (from < 0) return;
          const [pg] = r.pages.splice(from, 1);
          const to = Math.max(0, Math.min(r.pages.length, toIndex));
          r.pages.splice(to, 0, pg!);
          r.updatedAt = Date.now();
        }),

      addBlock: ({ pageId, blockType, index }) => {
        let newId = '';
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          const page =
            (pageId && r.pages.find((p) => p.id === pageId)) || r.pages[r.pages.length - 1];
          if (!page) return;
          const def = getBlock(blockType);
          if (!def) return;
          const newBlock: Block = {
            id: uid('b'),
            type: blockType,
            data: def.defaultData(),
          } as Block;
          const at = index == null ? page.blocks.length : index;
          page.blocks.splice(at, 0, newBlock);
          s.selectedBlockId = newBlock.id;
          newId = newBlock.id;
          r.updatedAt = Date.now();
        });
        return newId;
      },

      removeBlock: (blockId) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          for (const p of r.pages) {
            const idx = p.blocks.findIndex((b) => b.id === blockId);
            if (idx !== -1) {
              p.blocks.splice(idx, 1);
              break;
            }
          }
          if (s.selectedBlockId === blockId) s.selectedBlockId = null;
          r.updatedAt = Date.now();
        }),

      duplicateBlock: (blockId) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          for (const p of r.pages) {
            const idx = p.blocks.findIndex((b) => b.id === blockId);
            if (idx !== -1) {
              const src = p.blocks[idx]!;
              const dup: Block = JSON.parse(JSON.stringify(src));
              dup.id = uid('b');
              p.blocks.splice(idx + 1, 0, dup);
              s.selectedBlockId = dup.id;
              break;
            }
          }
          r.updatedAt = Date.now();
        }),

      updateBlock: (blockId, data) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          const loc = findBlockLocation(r, blockId);
          if (!loc) return;
          loc.block.data = { ...loc.block.data, ...data } as Block['data'];
          r.updatedAt = Date.now();
        }),

      moveBlock: ({ blockId, toPageId, toIndex }) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          const loc = findBlockLocation(r, blockId);
          if (!loc) return;
          const [removed] = loc.page.blocks.splice(loc.index, 1);
          const target = r.pages.find((p) => p.id === toPageId) ?? loc.page;
          let to = toIndex == null ? target.blocks.length : toIndex;
          if (target === loc.page && to > loc.index) to -= 1;
          to = Math.max(0, Math.min(target.blocks.length, to));
          target.blocks.splice(to, 0, removed!);
          r.updatedAt = Date.now();
        }),

      moveBlockBy: (blockId, delta) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          const pageIdx = r.pages.findIndex((p) => p.blocks.some((b) => b.id === blockId));
          if (pageIdx < 0) return;
          const page = r.pages[pageIdx]!;
          const blockIdx = page.blocks.findIndex((b) => b.id === blockId);
          if (blockIdx < 0) return;

          const within = blockIdx + delta;
          // Same-page neighbour swap
          if (within >= 0 && within < page.blocks.length) {
            const a = page.blocks[blockIdx]!;
            const b = page.blocks[within]!;
            page.blocks[blockIdx] = b;
            page.blocks[within] = a;
            r.updatedAt = Date.now();
            return;
          }
          // Cross-page hop
          const neighbourPageIdx = pageIdx + delta;
          const neighbour = r.pages[neighbourPageIdx];
          if (!neighbour) return; // already at the very top or bottom of the resume
          const [moved] = page.blocks.splice(blockIdx, 1);
          if (!moved) return;
          if (delta < 0) {
            // moving ↑: land at the end of the previous page
            neighbour.blocks.push(moved);
          } else {
            // moving ↓: land at the start of the next page
            neighbour.blocks.unshift(moved);
          }
          r.updatedAt = Date.now();
        }),

      snapshotCreate: (name) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          const snap: Snapshot = {
            id: uid('snap'),
            name: name ?? `Snapshot ${new Date().toLocaleString('ko-KR')}`,
            createdAt: Date.now(),
            pages: JSON.parse(JSON.stringify(r.pages)) as Page[],
          };
          r.snapshots = [snap, ...(r.snapshots ?? [])];
          r.updatedAt = Date.now();
        }),

      snapshotDelete: (id) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          r.snapshots = (r.snapshots ?? []).filter((sn) => sn.id !== id);
          r.updatedAt = Date.now();
        }),

      snapshotRestore: (id) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          const snap = (r.snapshots ?? []).find((sn) => sn.id === id);
          if (!snap) return;
          const autoSnap: Snapshot = {
            id: uid('snap'),
            name: '복원 직전 자동 저장 — ' + new Date().toLocaleString('ko-KR'),
            createdAt: Date.now(),
            pages: JSON.parse(JSON.stringify(r.pages)) as Page[],
          };
          r.snapshots = [autoSnap, ...r.snapshots];
          r.pages = JSON.parse(JSON.stringify(snap.pages)) as Page[];
          s.selectedBlockId = null;
          r.updatedAt = Date.now();
        }),

      snapshotRename: (id, name) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          r.snapshots = (r.snapshots ?? []).map((sn) => (sn.id === id ? { ...sn, name } : sn));
        }),
    },
  })),
);

export function getStateSnapshot(): AppState {
  const s = useStore.getState();
  return {
    schemaVersion: s.schemaVersion,
    currentResumeId: s.currentResumeId,
    selectedBlockId: s.selectedBlockId,
    resumes: s.resumes,
  };
}

export const useActions = () => useStore((s) => s.actions);
export const useCurrentResume = () => useStore((s) => s.resumes[s.currentResumeId]);
export const useSelectedBlock = () => {
  const selectedBlockId = useStore((s) => s.selectedBlockId);
  const resume = useCurrentResume();
  if (!selectedBlockId || !resume) return null;
  for (const p of resume.pages) {
    const b = p.blocks.find((x) => x.id === selectedBlockId);
    if (b) return { block: b, pageId: p.id };
  }
  return null;
};
