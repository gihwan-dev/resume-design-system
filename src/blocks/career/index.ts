import { registerBlock } from '../registry';
import { uid } from '../../lib/uid';
import { CareerBlock } from './Block';
import { CareerForm } from './Form';
import type { CareerData } from './types';
export type { CareerData, Project, PAR } from './types';

registerBlock<'career'>({
  type: 'career',
  label: 'Career',
  hint: '회사 → 프로젝트 → PAR',
  icon: 'C',
  Render: CareerBlock,
  Form: CareerForm,
  defaultData: (): CareerData => ({
    company: '회사명',
    role: 'Frontend Engineer',
    period: '2024.01 — 현재',
    summary: '',
    projects: [
      {
        id: uid('prj'),
        title: '프로젝트 제목',
        period: '2024.06 — 현재',
        stack: 'React · TypeScript',
        pars: [
          {
            id: uid('par'),
            label: '',
            problem: '어떤 문제가 있었는지',
            action: '**무엇을 어떻게** 했는지',
            result: '결과: ==수치 변화==',
            learning: '이 일에서 남은 학습/기준',
          },
        ],
      },
    ],
  }),
  shortLabel: (d) => (d.company ? `Career — ${d.company}` : 'Career'),
});
