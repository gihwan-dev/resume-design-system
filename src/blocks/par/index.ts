import { registerBlock } from '../registry';
import { ParBlock } from './Block';
import { ParForm } from './Form';
import type { ParData } from './types';
export type { ParData };

registerBlock<'par'>({
  type: 'par',
  label: 'PAR',
  hint: 'Problem · Action · Result · Learning',
  icon: '▸',
  Render: ParBlock,
  Form: ParForm,
  defaultData: (): ParData => ({
    label: '',
    problem: '어떤 문제가 있었는지',
    action: '**무엇을 어떻게** 했는지',
    result: '결과: ==수치 변화==',
    learning: '이 일에서 남은 학습/기준',
  }),
  shortLabel: (d) => {
    const first = d.label || d.problem || '';
    const clipped = first.replace(/\s+/g, ' ').slice(0, 24);
    return clipped ? `PAR — ${clipped}` : 'PAR';
  },
});
