import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { AppState, Page, Resume, Snapshot } from './types';
import type { Block, BlockType } from '../blocks';
import { getBlock } from '../blocks';
import { uid } from '../lib/uid';
import { importAsNewResume, type ResumeExportV1 } from '../share/exportFormat';

const SCHEMA_VERSION = 1;

export interface Actions {
  loadState: (state: AppState) => void;

  selectBlock: (id: string | null) => void;
  toggleBlockSelection: (id: string) => void;
  selectBlockRange: (toId: string) => void;
  selectResume: (id: string) => void;

  createResume: (opts: { name?: string; empty?: boolean }) => void;
  renameResume: (id: string, name: string) => void;
  duplicateResume: (id: string) => void;
  deleteResume: (id: string) => void;
  importResume: (data: ResumeExportV1) => string;
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
  /** Move every currently-selected block one slot in the given direction. Members
   *  of the same selection group are treated as cohesive: an adjacent block that
   *  is also selected is skipped over rather than swapped with, so relative
   *  ordering inside the group is preserved. */
  moveBlocksBy: (delta: -1 | 1) => void;

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

/** Flat traversal order across all pages: [{ pageIdx, blockIdx, id }, ...]. */
function flattenBlocks(resume: Resume): Array<{ pageIdx: number; blockIdx: number; id: string }> {
  const out: Array<{ pageIdx: number; blockIdx: number; id: string }> = [];
  resume.pages.forEach((p, pageIdx) =>
    p.blocks.forEach((b, blockIdx) => out.push({ pageIdx, blockIdx, id: b.id })),
  );
  return out;
}

/** Move a single block one slot, skipping over neighbours that are members of
 *  the same selection group so the group stays cohesive. Returns true if the
 *  block actually moved. */
function moveOneByWithSkip(
  resume: Resume,
  blockId: string,
  delta: -1 | 1,
  skipSet: Set<string>,
): boolean {
  const pageIdx = resume.pages.findIndex((p) => p.blocks.some((b) => b.id === blockId));
  if (pageIdx < 0) return false;
  const page = resume.pages[pageIdx]!;
  const blockIdx = page.blocks.findIndex((b) => b.id === blockId);
  if (blockIdx < 0) return false;

  let withinIdx = blockIdx + delta;
  while (
    withinIdx >= 0 &&
    withinIdx < page.blocks.length &&
    skipSet.has(page.blocks[withinIdx]!.id)
  ) {
    withinIdx += delta;
  }

  if (withinIdx >= 0 && withinIdx < page.blocks.length) {
    const a = page.blocks[blockIdx]!;
    const b = page.blocks[withinIdx]!;
    page.blocks[blockIdx] = b;
    page.blocks[withinIdx] = a;
    return true;
  }

  // Cross-page hop
  const neighbourPageIdx = pageIdx + delta;
  const neighbour = resume.pages[neighbourPageIdx];
  if (!neighbour) return false;
  const [moved] = page.blocks.splice(blockIdx, 1);
  if (!moved) return false;
  if (delta < 0) {
    neighbour.blocks.push(moved);
  } else {
    neighbour.blocks.unshift(moved);
  }
  return true;
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
    selectedBlockIds: [],
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
          // Migrate legacy single-selection field if present in persisted state.
          const incomingIds = (state as unknown as { selectedBlockIds?: unknown }).selectedBlockIds;
          const incomingSingle = (state as unknown as { selectedBlockId?: unknown })
            .selectedBlockId;
          const ids: string[] = Array.isArray(incomingIds)
            ? (incomingIds as string[])
            : typeof incomingSingle === 'string'
              ? [incomingSingle]
              : [];
          Object.assign(s, state);
          s.selectedBlockIds = ids;
          delete (s as unknown as { selectedBlockId?: unknown }).selectedBlockId;
        }),

      selectBlock: (id) =>
        set((s) => {
          s.selectedBlockIds = id ? [id] : [];
        }),
      toggleBlockSelection: (id) =>
        set((s) => {
          const i = s.selectedBlockIds.indexOf(id);
          if (i === -1) {
            s.selectedBlockIds.push(id);
          } else {
            s.selectedBlockIds.splice(i, 1);
          }
        }),
      selectBlockRange: (toId) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          const anchor = s.selectedBlockIds.at(-1);
          if (!anchor) {
            s.selectedBlockIds = [toId];
            return;
          }
          const flat = flattenBlocks(r);
          const ai = flat.findIndex((x) => x.id === anchor);
          const bi = flat.findIndex((x) => x.id === toId);
          if (ai < 0 || bi < 0) {
            s.selectedBlockIds = [toId];
            return;
          }
          const [from, to] = ai <= bi ? [ai, bi] : [bi, ai];
          const range = flat.slice(from, to + 1).map((x) => x.id);
          // Keep anchor as the last entry so Shift+Click extensions continue
          // to use the original anchor as the pivot.
          const ordered = range.filter((id) => id !== anchor);
          ordered.push(anchor);
          s.selectedBlockIds = ordered;
        }),
      selectResume: (id) =>
        set((s) => {
          s.currentResumeId = id;
          s.selectedBlockIds = [];
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
          s.selectedBlockIds = [];
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
          s.selectedBlockIds = [];
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
            s.selectedBlockIds = [];
          }
        }),

      importResume: (data) => {
        let newId = '';
        set((s) => {
          const resume = importAsNewResume(data);
          // 같은 이름이 이미 있으면 충돌 회피용 접미사. 비교는 trim 기준.
          const trimmed = resume.name.trim();
          const existingNames = new Set(Object.values(s.resumes).map((r) => r.name.trim()));
          if (existingNames.has(trimmed)) {
            resume.name = `${trimmed} (가져옴)`;
          }
          s.resumes[resume.id] = resume;
          s.currentResumeId = resume.id;
          s.selectedBlockIds = [];
          newId = resume.id;
        });
        return newId;
      },

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
          s.selectedBlockIds = s.selectedBlockIds.filter((id) => findBlockLocation(r, id));
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
          s.selectedBlockIds = [newBlock.id];
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
          s.selectedBlockIds = s.selectedBlockIds.filter((id) => id !== blockId);
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
              s.selectedBlockIds = [dup.id];
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
          if (moveOneByWithSkip(r, blockId, delta, new Set([blockId]))) {
            r.updatedAt = Date.now();
          }
        }),

      moveBlocksBy: (delta) =>
        set((s) => {
          const r = s.resumes[s.currentResumeId];
          if (!r) return;
          if (s.selectedBlockIds.length === 0) return;
          const skip = new Set(s.selectedBlockIds);
          // Sort selected blocks in resume traversal order.
          const ordered = flattenBlocks(r)
            .filter((x) => skip.has(x.id))
            .map((x) => x.id);
          const seq = delta < 0 ? ordered : [...ordered].reverse();
          let moved = false;
          for (const id of seq) {
            if (moveOneByWithSkip(r, id, delta, skip)) moved = true;
          }
          if (moved) r.updatedAt = Date.now();
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
          s.selectedBlockIds = [];
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
    selectedBlockIds: s.selectedBlockIds,
    resumes: s.resumes,
  };
}

export const useActions = () => useStore((s) => s.actions);
export const useCurrentResume = () => useStore((s) => s.resumes[s.currentResumeId]);
export const useSelectedBlock = () => {
  const selectedBlockIds = useStore((s) => s.selectedBlockIds);
  const resume = useCurrentResume();
  if (selectedBlockIds.length !== 1 || !resume) return null;
  const id = selectedBlockIds[0]!;
  for (const p of resume.pages) {
    const b = p.blocks.find((x) => x.id === id);
    if (b) return { block: b, pageId: p.id };
  }
  return null;
};
export const useIsBlockSelected = (id: string) => useStore((s) => s.selectedBlockIds.includes(id));
export const useSelectionCount = () => useStore((s) => s.selectedBlockIds.length);
export const useSelectionAnchorId = () => useStore((s) => s.selectedBlockIds.at(-1) ?? null);
/** Whether the current multi-selection can move up/down as a cohesive group.
 *  Returns `null` when fewer than 2 blocks are selected — callers should fall
 *  back to their existing per-block canUp/canDown calculation in that case. */
export const useSelectionMoveCaps = (): { canUp: boolean; canDown: boolean } | null => {
  const ids = useStore((s) => s.selectedBlockIds);
  const resume = useCurrentResume();
  if (ids.length < 2 || !resume) return null;
  const flat = flattenBlocks(resume);
  const set = new Set(ids);
  const positions = flat.map((x, i) => ({ ...x, flatIdx: i })).filter((x) => set.has(x.id));
  if (positions.length === 0) return { canUp: false, canDown: false };
  const first = positions[0]!;
  const last = positions[positions.length - 1]!;
  return {
    canUp: !(first.pageIdx === 0 && first.blockIdx === 0),
    canDown: !(
      last.pageIdx === resume.pages.length - 1 &&
      last.blockIdx === resume.pages[last.pageIdx]!.blocks.length - 1
    ),
  };
};
