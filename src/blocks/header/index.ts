import { registerBlock } from '../registry';
import { HeaderBlock } from './Block';
import { HeaderForm } from './Form';
import type { HeaderData } from './types';
export type { HeaderData };

registerBlock<'header'>({
  type: 'header',
  label: 'Header',
  hint: '이름 · 역할 · 연락처',
  icon: 'H',
  Render: HeaderBlock,
  Form: HeaderForm,
  defaultData: (): HeaderData => ({
    name: '이름',
    role: 'Frontend Engineer',
    tagline: '한 줄 포지셔닝',
    contacts: ['email@example.com', '+82 10 0000 0000', 'github.com/handle'],
  }),
  shortLabel: (d) => (d.name ? `Header — ${d.name}` : 'Header'),
});
