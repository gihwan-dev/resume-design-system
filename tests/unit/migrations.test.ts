import { describe, expect, it } from 'vitest';
import { migrateAppState } from '../../src/store/migrations';
import type { AppState } from '../../src/store/types';
import type { Block } from '../../src/blocks';

function legacy(blocks: Block[]): AppState {
  return {
    schemaVersion: 1,
    currentResumeId: 'r1',
    selectedBlockId: null,
    resumes: {
      r1: {
        id: 'r1',
        name: 'r',
        createdAt: 0,
        updatedAt: 0,
        theme: 'default',
        pages: [{ id: 'p1', blocks }],
        snapshots: [],
      },
    },
  };
}

describe('migrateAppState — linkRow absorption', () => {
  it('moves linkRow hrefs into the page header.contacts and drops the block', () => {
    const header = {
      id: 'b-h',
      type: 'header',
      data: { name: '', role: '', tagline: '', contacts: ['me@x.com'] },
    } as unknown as Block;
    const linkRow = {
      id: 'b-l',
      type: 'linkRow',
      data: {
        links: [
          { href: 'https://github.com/me' },
          { href: 'https://my-blog.dev' },
          { href: 'https://' }, // empty placeholder — ignored
        ],
      },
    } as unknown as Block;

    const migrated = migrateAppState(legacy([header, linkRow]));
    const page = migrated.resumes.r1!.pages[0]!;
    expect(page.blocks.find((b) => (b as { type: string }).type === 'linkRow')).toBeUndefined();
    const head = page.blocks.find((b) => b.type === 'header') as Block<'header'>;
    expect(head.data.contacts).toEqual([
      'me@x.com',
      'https://github.com/me',
      'https://my-blog.dev',
    ]);
  });

  it('falls back to the first header in the resume when the page has none', () => {
    const header = {
      id: 'b-h',
      type: 'header',
      data: { name: '', role: '', tagline: '', contacts: [] },
    } as unknown as Block;
    const linkRow = {
      id: 'b-l',
      type: 'linkRow',
      data: { links: [{ href: 'https://github.com/me' }] },
    } as unknown as Block;
    // header on page 1, linkRow on page 2
    const state: AppState = {
      schemaVersion: 1,
      currentResumeId: 'r1',
      selectedBlockId: null,
      resumes: {
        r1: {
          id: 'r1',
          name: 'r',
          createdAt: 0,
          updatedAt: 0,
          theme: 'default',
          pages: [
            { id: 'p1', blocks: [header] },
            { id: 'p2', blocks: [linkRow] },
          ],
          snapshots: [],
        },
      },
    };
    const migrated = migrateAppState(state);
    const head = migrated.resumes.r1!.pages[0]!.blocks[0] as Block<'header'>;
    expect(head.data.contacts).toContain('https://github.com/me');
    expect(migrated.resumes.r1!.pages[1]!.blocks).toHaveLength(0);
  });

  it('is a no-op when no linkRow blocks exist', () => {
    const header = {
      id: 'b-h',
      type: 'header',
      data: { name: 'X', role: '', tagline: '', contacts: ['a'] },
    } as unknown as Block;
    const before = legacy([header]);
    const after = migrateAppState(before);
    expect(after.resumes.r1!.pages[0]!.blocks).toHaveLength(1);
  });
});
