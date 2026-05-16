import { registerBlock } from '../registry';
import { SectionHeaderBlock } from './Block';
import { SectionHeaderForm } from './Form';
import type { SectionHeaderData } from './types';
export type { SectionHeaderData };

registerBlock<'sectionHeader'>({
  type: 'sectionHeader',
  label: 'Section Header',
  hint: 'Career · Skills · Links 등',
  icon: '§',
  Render: SectionHeaderBlock,
  Form: SectionHeaderForm,
  defaultData: (): SectionHeaderData => ({ title: 'Section', meta: '', variant: 'primary' }),
  shortLabel: (d) => (d.title ? `§ ${d.title}` : '§ Section'),
});
