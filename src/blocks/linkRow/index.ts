import { registerBlock } from '../registry';
import { LinkRowBlock } from './Block';
import { LinkRowForm } from './Form';
import type { LinkRowData } from './types';
export type { LinkRowData, LinkItem } from './types';

registerBlock<'linkRow'>({
  type: 'linkRow',
  label: 'Link Row',
  hint: 'Portfolio · GitHub · Blog',
  icon: '→',
  Render: LinkRowBlock,
  Form: LinkRowForm,
  defaultData: (): LinkRowData => ({
    links: [
      { label: 'Portfolio', text: 'site.dev', href: '#' },
      { label: 'GitHub', text: 'github.com/handle', href: '#' },
    ],
  }),
});
