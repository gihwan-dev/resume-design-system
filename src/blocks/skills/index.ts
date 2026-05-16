import { registerBlock } from '../registry';
import { SkillsBlock } from './Block';
import { SkillsForm } from './Form';
import type { SkillsData } from './types';
export type { SkillsData, SkillsRow } from './types';

registerBlock<'skills'>({
  type: 'skills',
  label: 'Skills',
  hint: '분류별 기술/도구 스택',
  icon: 'S',
  Render: SkillsBlock,
  Form: SkillsForm,
  defaultData: (): SkillsData => ({
    rows: [
      { key: 'UI Architecture', val: 'Headless UI · Compound Component' },
      { key: 'Performance', val: 'Memoization · Virtualization · INP' },
    ],
  }),
});
