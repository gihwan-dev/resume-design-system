/// <reference types="node" />
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import {
  blockShapes,
  themeNames,
  validateResume,
} from '../../skills/company-resume/scripts/resume-schema';
import { listBlockTypes, getBlock } from '../../src/blocks';
import { THEMES } from '../../src/theme/themes';
import {
  deserializeResumeExport,
  importAsNewResume,
  serializeResume,
} from '../../src/share/exportFormat';
import { seedAppState } from '../../src/seed/sampleResume';
import { useStore } from '../../src/store/store';

const fixture = JSON.parse(
  readFileSync('skills/company-resume/tests/fixtures/synthetic.json', 'utf8'),
);

describe('shared schema and actual application import/export', () => {
  it('accepts an AI-authored first draft without any previous export or patch plan', () => {
    const fresh = {
      v: 1,
      name: '가상 회사 Platform 첫 버전',
      theme: 'default',
      pages: [
        {
          id: 'p_fresh_ai',
          blocks: [
            {
              id: 'b_fresh_header',
              type: 'header',
              data: {
                name: '가상 지원자',
                role: 'Frontend Engineer',
                tagline: '첫 원고',
                contacts: [],
              },
            },
            {
              id: 'b_fresh_intro',
              type: 'positioning',
              data: { text: '가상 경력 자료에서 AI가 먼저 작성한 완결된 소개입니다.' },
            },
            {
              id: 'b_fresh_project',
              type: 'careerProject',
              data: { title: '가상 공통 UI', period: '', stack: 'React' },
            },
            {
              id: 'b_fresh_body',
              type: 'freeText',
              data: {
                text: '기존 동작을 테스트로 고정하고 공통 컴포넌트의 확장 지점을 정리했습니다.',
              },
            },
          ],
        },
      ],
    };
    const checked = deserializeResumeExport(fresh);
    if (!checked.ok) throw new Error(checked.error);
    useStore.getState().actions.loadState(seedAppState());
    const prior = structuredClone(useStore.getState().resumes);
    const id = useStore.getState().actions.importResume(checked.data);
    const state = useStore.getState();
    for (const [oldId, resume] of Object.entries(prior))
      expect(state.resumes[oldId]).toEqual(resume);
    const exported = serializeResume(state.resumes[id]!);
    expect(exported.name).toBe(fresh.name);
    expect(exported.pages[0]!.id).not.toBe(fresh.pages[0]!.id);
    expect(exported.pages[0]!.blocks.map((b) => b.data)).toEqual(
      fresh.pages[0]!.blocks.map((b) => b.data),
    );
  });

  it('matches actual registry, defaults and theme keys, and rejects corrupt fields for every block', () => {
    expect(Object.keys(blockShapes).sort()).toEqual(listBlockTypes().sort());
    expect([...themeNames].sort()).toEqual(Object.keys(THEMES).sort());
    for (const type of Object.keys(blockShapes)) {
      const data = getBlock(type)!.defaultData() as Record<string, unknown>;
      const doc = {
        v: 1,
        name: '',
        theme: 'default',
        pages: [{ id: 'p', blocks: [{ id: 'b', type, data }] }],
      };
      expect(validateResume(doc), type).toEqual([]);
      for (const key of Object.keys(data)) {
        expect(
          validateResume({
            ...doc,
            pages: [{ id: 'p', blocks: [{ id: 'b', type, data: { ...data, [key]: null } }] }],
          }).length,
          `${type}.${key}`,
        ).toBeGreaterThan(0);
      }
    }
    const state = seedAppState();
    expect(validateResume(serializeResume(state.resumes[state.currentResumeId]!))).toEqual([]);
  });

  it('rejects unsupported blocks/fields/themes rather than silently hiding or replacing them', () => {
    for (const data of [
      { ...fixture, theme: 'future' },
      { ...fixture, pages: [{ id: 'p', blocks: [{ id: 'b', type: 'career', data: {} }] }] },
      {
        ...fixture,
        pages: [{ id: 'p', blocks: [{ id: 'b', type: 'freeText', data: { text: 42 } }] }],
      },
    ])
      expect(deserializeResumeExport(data).ok).toBe(false);
  });

  it('imports into actual store, reissues ids, exports manual edits and patches those new ids', () => {
    const checked = deserializeResumeExport(fixture);
    if (!checked.ok) throw new Error(checked.error);
    useStore.getState().actions.loadState(seedAppState());
    const id = useStore.getState().actions.importResume(checked.data);
    const imported = useStore.getState().resumes[id]!;
    const firstPage = imported.pages[0]!;
    expect(firstPage.id).not.toBe(fixture.pages[0].id);
    imported.pages.forEach((page, p) =>
      page.blocks.forEach((block, b) => {
        expect(block.id).not.toBe(fixture.pages[p].blocks[b].id);
        expect(block.data).toEqual(fixture.pages[p].blocks[b].data);
      }),
    );
    const intro = firstPage.blocks.find((b) => b.type === 'positioning')!;
    const last = imported.pages[1]!.blocks[0]!;
    useStore.getState().actions.updateBlock(intro.id, { text: '사용자 최신 소개. 두 번째 문장.' });
    useStore.getState().actions.updateBlock(last.id, { text: '사용자가 직접 고친 마지막 문장' });
    const latest = serializeResume(useStore.getState().resumes[id]!);
    const dir = mkdtempSync(join(tmpdir(), 'resume-roundtrip-'));
    const input = join(dir, 'latest.json');
    const bytes = JSON.stringify(latest, null, 2);
    writeFileSync(input, bytes);
    const target = { pageId: firstPage.id, blockId: intro.id, path: '/text' };
    const scope = { request: '소개 두 번째 문장만 표현 수정', targets: [target] };
    const plan = {
      baseHash: createHash('sha256').update(bytes).digest('hex'),
      operations: [
        {
          ...target,
          expected: '사용자 최신 소개. 두 번째 문장.',
          value: '사용자 최신 소개. 다듬은 문장.',
          reason: '사용자 요청',
          evidence: ['user-request:표현 수정'],
        },
      ],
    };
    writeFileSync(join(dir, 'scope.json'), JSON.stringify(scope));
    writeFileSync(join(dir, 'plan.json'), JSON.stringify(plan));
    execFileSync(process.execPath, [
      'skills/company-resume/scripts/resume-tool.mjs',
      'propose',
      input,
      join(dir, 'scope.json'),
      join(dir, 'plan.json'),
      join(dir, 'out'),
    ]);
    const candidate = JSON.parse(readFileSync(join(dir, 'out/candidate.json'), 'utf8'));
    const expected = structuredClone(latest);
    (expected.pages[0]!.blocks.find((b) => b.id === intro.id)!.data as { text: string }).text =
      '사용자 최신 소개. 다듬은 문장.';
    expect(candidate).toEqual(expected);
    const parsed = deserializeResumeExport(candidate);
    if (!parsed.ok) throw new Error(parsed.error);
    const roundtrip = serializeResume(importAsNewResume(parsed.data));
    const withoutIds = (doc: typeof latest) =>
      doc.pages.map((p) => p.blocks.map((b) => ({ type: b.type, data: b.data })));
    expect(withoutIds(roundtrip)).toEqual(withoutIds(candidate));
    expect(roundtrip.theme).toBe(latest.theme);
    expect(roundtrip.pages[0]!.id).not.toBe(latest.pages[0]!.id);
    expect(readFileSync(input, 'utf8')).toBe(bytes);
  });
});
