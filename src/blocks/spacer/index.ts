import { registerBlock } from '../registry';
import { SpacerBlock } from './Block';
import { SpacerForm } from './Form';
import type { SpacerData } from './types';
export type { SpacerData };

registerBlock<'spacer'>({
  type: 'spacer',
  label: 'Spacer',
  hint: '수직 빈 공간',
  icon: '↕',
  Render: SpacerBlock,
  Form: SpacerForm,
  defaultData: (): SpacerData => ({ height: 16 }),
  shortLabel: (d) => `Spacer ${d.height || 16}px`,
});
