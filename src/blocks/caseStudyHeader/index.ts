import { registerBlock } from '../registry';
import { CaseStudyHeaderBlock } from './Block';
import { CaseStudyHeaderForm } from './Form';
import type { CaseStudyHeaderData } from './types';
export type { CaseStudyHeaderData, CaseStudyLink } from './types';

registerBlock<'caseStudyHeader'>({
  type: 'caseStudyHeader',
  label: 'Case Study — Header',
  hint: '제목 + 메타 + CONTEXT + 링크',
  icon: '✦',
  Render: CaseStudyHeaderBlock,
  Form: CaseStudyHeaderForm,
  defaultData: (): CaseStudyHeaderData => ({
    title: '프로젝트 이름',
    period: '2024.03 — 2024.06',
    stack: 'React, TypeScript',
    role: 'Solo · Full-stack',
    context: '왜 이 도구가 필요했는지 — 상황 · 문제 · 비어 있던 자리',
    links: [{ href: 'https://', alias: 'DEMO' }],
  }),
  shortLabel: (d) => (d.title ? `Case — ${d.title}` : 'Case Study'),
});
