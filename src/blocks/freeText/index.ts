import { registerBlock } from '../registry';
import { FreeTextBlock } from './Block';
import { FreeTextForm } from './Form';
import type { FreeTextData } from './types';
export type { FreeTextData };

registerBlock<'freeText'>({
  type: 'freeText',
  label: 'Free Text',
  hint: '자유 단락 (rich text)',
  icon: '¶',
  Render: FreeTextBlock,
  Form: FreeTextForm,
  defaultData: (): FreeTextData => ({ text: '자유롭게 쓸 수 있는 단락입니다.' }),
});
