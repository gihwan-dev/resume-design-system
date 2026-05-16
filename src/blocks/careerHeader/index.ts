import { registerBlock } from '../registry';
import { CareerHeaderBlock } from './Block';
import { CareerHeaderForm } from './Form';
import type { CareerHeaderData } from './types';
export type { CareerHeaderData };

registerBlock<'careerHeader'>({
  type: 'careerHeader',
  label: 'Career — Header',
  hint: '회사 + 역할 + 기간 + 요약',
  icon: 'C',
  Render: CareerHeaderBlock,
  Form: CareerHeaderForm,
  defaultData: (): CareerHeaderData => ({
    company: '회사명',
    role: 'Frontend Engineer',
    period: '2024.01 — 현재',
    summary: '',
  }),
  shortLabel: (d) => (d.company ? `Career — ${d.company}` : 'Career'),
});
