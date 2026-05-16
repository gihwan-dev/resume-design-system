import { beforeEach, describe, expect, it } from 'vitest';
import { useStore } from '../../src/store/store';
import '../../src/blocks';
import { seedAppState } from '../../src/seed/sampleResume';

function loadFreshState() {
  useStore.getState().actions.loadState(seedAppState());
}

describe('store — resume CRUD', () => {
  beforeEach(() => loadFreshState());

  it('creates a new resume and selects it', () => {
    const before = Object.keys(useStore.getState().resumes).length;
    useStore.getState().actions.createResume({ name: '두 번째', empty: true });
    const after = useStore.getState();
    expect(Object.keys(after.resumes).length).toBe(before + 1);
    expect(after.resumes[after.currentResumeId]?.name).toBe('두 번째');
  });

  it('duplicates the current resume', () => {
    const id = useStore.getState().currentResumeId;
    useStore.getState().actions.duplicateResume(id);
    const after = useStore.getState();
    const newId = after.currentResumeId;
    expect(newId).not.toBe(id);
    expect(after.resumes[newId]?.name).toContain('사본');
  });

  it('renames a resume', () => {
    const id = useStore.getState().currentResumeId;
    useStore.getState().actions.renameResume(id, 'renamed');
    expect(useStore.getState().resumes[id]?.name).toBe('renamed');
  });

  it('deletes a resume and falls back to another', () => {
    useStore.getState().actions.createResume({ name: 'aux', empty: true });
    const target = useStore.getState().currentResumeId;
    useStore.getState().actions.deleteResume(target);
    expect(useStore.getState().resumes[target]).toBeUndefined();
  });
});

describe('store — pages & blocks', () => {
  beforeEach(() => loadFreshState());

  it('adds a page', () => {
    const before = useStore.getState().resumes[useStore.getState().currentResumeId]!.pages.length;
    useStore.getState().actions.addPage();
    const after = useStore.getState().resumes[useStore.getState().currentResumeId]!.pages.length;
    expect(after).toBe(before + 1);
  });

  it('adds a block to a page', () => {
    const s = useStore.getState();
    const pageId = s.resumes[s.currentResumeId]!.pages[0]!.id;
    const before = s.resumes[s.currentResumeId]!.pages[0]!.blocks.length;
    s.actions.addBlock({ pageId, blockType: 'freeText' });
    const after = useStore.getState();
    expect(after.resumes[after.currentResumeId]!.pages[0]!.blocks.length).toBe(before + 1);
  });

  it('updates block data', () => {
    const s = useStore.getState();
    const block = s.resumes[s.currentResumeId]!.pages[0]!.blocks[0]!;
    s.actions.updateBlock(block.id, { name: '변경된 이름' });
    const updated = useStore
      .getState()
      .resumes[useStore.getState().currentResumeId]!.pages[0]!.blocks.find(
        (b) => b.id === block.id,
      )!;
    expect((updated.data as { name?: string }).name).toBe('변경된 이름');
  });

  it('removes a block', () => {
    const s = useStore.getState();
    const block = s.resumes[s.currentResumeId]!.pages[0]!.blocks[0]!;
    s.actions.removeBlock(block.id);
    const after = useStore.getState();
    const exists = after.resumes[after.currentResumeId]!.pages[0]!.blocks.some(
      (b) => b.id === block.id,
    );
    expect(exists).toBe(false);
  });

  it('moves a block to another page', () => {
    const s = useStore.getState();
    s.actions.addPage();
    const resume = useStore.getState().resumes[useStore.getState().currentResumeId]!;
    const fromPage = resume.pages[0]!;
    const toPage = resume.pages[resume.pages.length - 1]!;
    const block = fromPage.blocks[0]!;
    useStore.getState().actions.moveBlock({ blockId: block.id, toPageId: toPage.id });
    const after = useStore.getState().resumes[useStore.getState().currentResumeId]!;
    expect(after.pages.find((p) => p.id === toPage.id)!.blocks.some((b) => b.id === block.id)).toBe(
      true,
    );
  });

  it('reorders blocks within a page via moveBlockBy(±1)', () => {
    const s = useStore.getState();
    const page = s.resumes[s.currentResumeId]!.pages[0]!;
    const first = page.blocks[0]!;
    const second = page.blocks[1]!;
    s.actions.moveBlockBy(first.id, 1);
    const after = useStore.getState().resumes[useStore.getState().currentResumeId]!.pages[0]!;
    expect(after.blocks[0]!.id).toBe(second.id);
    expect(after.blocks[1]!.id).toBe(first.id);
    useStore.getState().actions.moveBlockBy(first.id, -1);
    const back = useStore.getState().resumes[useStore.getState().currentResumeId]!.pages[0]!;
    expect(back.blocks[0]!.id).toBe(first.id);
  });

  it('moves a block across page boundaries via moveBlockBy', () => {
    const s = useStore.getState();
    const r = s.resumes[s.currentResumeId]!;
    const page0 = r.pages[0]!;
    const lastBlockOfPage0 = page0.blocks[page0.blocks.length - 1]!;
    s.actions.moveBlockBy(lastBlockOfPage0.id, 1);
    const after = useStore.getState().resumes[useStore.getState().currentResumeId]!;
    expect(after.pages[1]!.blocks[0]!.id).toBe(lastBlockOfPage0.id);
  });
});

describe('store — snapshots', () => {
  beforeEach(() => loadFreshState());

  it('creates and restores a snapshot, auto-snapshotting the current state', () => {
    const s = useStore.getState();
    s.actions.snapshotCreate('v1');
    // mutate
    const block = useStore.getState().resumes[useStore.getState().currentResumeId]!.pages[0]!
      .blocks[0]!;
    useStore.getState().actions.updateBlock(block.id, { name: 'mutated' });
    // restore
    const snapId = useStore.getState().resumes[useStore.getState().currentResumeId]!.snapshots[0]!
      .id;
    useStore.getState().actions.snapshotRestore(snapId);
    const after = useStore.getState();
    expect(after.resumes[after.currentResumeId]!.snapshots.length).toBeGreaterThanOrEqual(2);
  });
});
