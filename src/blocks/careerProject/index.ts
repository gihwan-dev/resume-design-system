import { registerBlock } from '../registry';
import { CareerProjectBlock } from './Block';
import { CareerProjectForm } from './Form';
import type { CareerProjectData } from './types';
export type { CareerProjectData };

registerBlock<'careerProject'>({
  type: 'careerProject',
  label: 'Project',
  hint: '프로젝트 제목 + 기간 + 스택',
  icon: 'P',
  Render: CareerProjectBlock,
  Form: CareerProjectForm,
  defaultData: (): CareerProjectData => ({
    title: '프로젝트 제목',
    period: '',
    stack: 'React · TypeScript',
  }),
  shortLabel: (d) => (d.title ? `Project — ${d.title}` : 'Project'),
});
