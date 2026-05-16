import type { Block } from '../blocks';
import type { Page, Resume } from '../store/types';
import type { ThemeName } from '../theme/themes';
import { THEMES } from '../theme/themes';
import { uid } from '../lib/uid';

export const EXPORT_VERSION = 1 as const;

export interface ResumeExportV1 {
  v: 1;
  name: string;
  theme: ThemeName;
  pages: Page[];
}

export function serializeResume(resume: Resume): ResumeExportV1 {
  return {
    v: EXPORT_VERSION,
    name: resume.name,
    theme: resume.theme,
    pages: JSON.parse(JSON.stringify(resume.pages)) as Page[],
  };
}

type DeserializeResult = { ok: true; data: ResumeExportV1 } | { ok: false; error: string };

function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

function validateBlock(b: unknown): b is Block {
  if (!isObject(b)) return false;
  if (typeof b.id !== 'string' || !b.id) return false;
  if (typeof b.type !== 'string' || !b.type) return false;
  if (!isObject(b.data)) return false;
  return true;
}

function validatePage(p: unknown): p is Page {
  if (!isObject(p)) return false;
  if (typeof p.id !== 'string' || !p.id) return false;
  if (!Array.isArray(p.blocks)) return false;
  return p.blocks.every(validateBlock);
}

/**
 * Validates the loosely-typed JSON. Unknown block.type values are preserved —
 * the BlockWrap renderer falls back to `null` for missing definitions, so an
 * older client can still round-trip a payload that includes a future block
 * type without losing data.
 */
export function deserializeResumeExport(raw: unknown): DeserializeResult {
  if (!isObject(raw)) return { ok: false, error: 'JSON 객체가 아닙니다.' };
  if (raw.v !== EXPORT_VERSION) {
    return { ok: false, error: `지원하지 않는 버전: v=${String(raw.v)}` };
  }
  if (typeof raw.name !== 'string') return { ok: false, error: 'name 필드가 없습니다.' };
  if (typeof raw.theme !== 'string') return { ok: false, error: 'theme 필드가 없습니다.' };
  if (!Array.isArray(raw.pages)) return { ok: false, error: 'pages가 배열이 아닙니다.' };
  if (!raw.pages.every(validatePage)) {
    return { ok: false, error: 'pages 안의 블록 구조가 올바르지 않습니다.' };
  }
  const theme = (raw.theme in THEMES ? raw.theme : 'default') as ThemeName;
  return {
    ok: true,
    data: {
      v: EXPORT_VERSION,
      name: raw.name,
      theme,
      pages: raw.pages,
    },
  };
}

/**
 * Build a fresh Resume from an export payload — re-issues every id so the
 * imported copy can coexist with the original in the same store without
 * collisions in selectBlock/move/duplicate logic.
 */
export function importAsNewResume(data: ResumeExportV1): Resume {
  const now = Date.now();
  const pages: Page[] = data.pages.map((p) => ({
    id: uid('p'),
    blocks: p.blocks.map((b) => {
      const cloned = JSON.parse(JSON.stringify(b)) as Block;
      cloned.id = uid('b');
      // Re-issue nested ids known to the career block so duplicate/edit flows
      // stay stable on the imported copy.
      if (cloned.type === 'career') {
        const cd = cloned.data as {
          projects?: { id?: string; pars?: { id?: string }[] }[];
        };
        if (Array.isArray(cd.projects)) {
          cd.projects = cd.projects.map((prj) => ({
            ...prj,
            id: uid('prj'),
            pars: Array.isArray(prj.pars)
              ? prj.pars.map((par) => ({ ...par, id: uid('par') }))
              : [],
          }));
        }
      }
      return cloned;
    }),
  }));

  return {
    id: uid('r'),
    name: data.name,
    createdAt: now,
    updatedAt: now,
    theme: data.theme,
    pages,
    snapshots: [],
  };
}
