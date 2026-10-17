import type { Block } from '../blocks';
import type { Page, Resume } from '../store/types';
import type { ThemeName } from '../theme/themes';
import { validateResume } from '../../skills/company-resume/scripts/resume-schema';
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

/** Reject unsupported data before a renderer can silently omit it. No coercion. */
export function deserializeResumeExport(raw: unknown): DeserializeResult {
  const errors = validateResume(raw);
  if (errors.length) return { ok: false, error: `이력서 형식을 확인해 주세요. ${errors[0]}` };
  return { ok: true, data: structuredClone(raw) as ResumeExportV1 };
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
      const blockType: string = cloned.type;
      if (blockType === 'career') {
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
