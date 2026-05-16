import type { AppState, Page, Resume } from './types';
import type { Block } from '../blocks';

/**
 * One-shot data migrations applied at boot time, before the persisted
 * state ever reaches the store. Each migration is idempotent and
 * conservative: when in doubt we keep the user's data rather than
 * dropping it.
 *
 * Current passes:
 *   - linkRow → header.contacts: the `linkRow` block was retired after
 *     `header.contacts` started auto-detecting URLs. Old resumes still
 *     have linkRow blocks in their pages; we move their hrefs into the
 *     same page's first header block (or the resume's first header)
 *     and drop the block.
 */
export function migrateAppState(state: AppState): AppState {
  return {
    ...state,
    resumes: Object.fromEntries(
      Object.entries(state.resumes ?? {}).map(([id, resume]) => [id, migrateResume(resume)]),
    ),
  };
}

function migrateResume(resume: Resume): Resume {
  return { ...resume, pages: absorbLinkRows(resume.pages) };
}

interface LegacyLinkRowItem {
  href?: string;
}

interface LegacyLinkRowData {
  links?: LegacyLinkRowItem[];
}

function isLinkRowBlock(b: Block): boolean {
  return (b as { type: string }).type === 'linkRow';
}

function readLinkRowHrefs(b: Block): string[] {
  const data = (b as unknown as { data?: LegacyLinkRowData }).data;
  const links = data?.links ?? [];
  return links
    .map((l) => l.href?.trim())
    .filter((href): href is string => Boolean(href && href !== 'https://'));
}

function isHeader(b: Block): b is Block<'header'> {
  return b.type === 'header';
}

function absorbLinkRows(pages: Page[]): Page[] {
  // Find a global fallback header in case a page has linkRows but no header
  // (this happens when the user dragged linkRow onto a continuation page).
  let fallbackHeader: Block<'header'> | null = null;
  for (const p of pages) {
    const h = p.blocks.find(isHeader);
    if (h) {
      fallbackHeader = h;
      break;
    }
  }

  return pages.map((page) => {
    const linkRows = page.blocks.filter(isLinkRowBlock);
    if (linkRows.length === 0) return page;

    const pageHeader = page.blocks.find(isHeader) ?? fallbackHeader;
    if (pageHeader) {
      const incoming = linkRows.flatMap(readLinkRowHrefs);
      const existing = pageHeader.data.contacts ?? [];
      const merged = [...existing];
      for (const href of incoming) {
        if (!merged.includes(href)) merged.push(href);
      }
      pageHeader.data = { ...pageHeader.data, contacts: merged };
    }

    return { ...page, blocks: page.blocks.filter((b) => !isLinkRowBlock(b)) };
  });
}
