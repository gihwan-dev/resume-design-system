import { registerBlock } from '../registry';
import { DividerBlock } from './Block';
import { DividerForm } from './Form';
import type { DividerData } from './types';
export type { DividerData };

registerBlock<'divider'>({
  type: 'divider',
  label: 'Divider',
  hint: '얇은 가로 구분선',
  icon: '—',
  Render: DividerBlock,
  Form: DividerForm,
  defaultData: (): DividerData => ({ variant: 'subtle' }),
});
