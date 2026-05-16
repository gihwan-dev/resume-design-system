import { registerBlock } from '../registry';
import { SkillsBlock } from '../skills/Block';
import { SkillsForm } from '../skills/Form';
import type { EducationData } from './types';
export type { EducationData };

registerBlock<'education'>({
  type: 'education',
  label: 'Education',
  hint: '학사/석사 · 학교/전공',
  icon: 'E',
  Render: SkillsBlock,
  Form: SkillsForm,
  defaultData: (): EducationData => ({
    rows: [{ key: '학사', val: '학교명 · 전공 · 졸업 연도' }],
  }),
});
