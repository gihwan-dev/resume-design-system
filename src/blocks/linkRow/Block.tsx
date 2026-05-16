import { LinkChip } from '../../components/LinkChip';
import type { LinkRowData } from './types';

export function LinkRowBlock({ data }: { data: LinkRowData }) {
  const links = data.links ?? [];
  return (
    <div className="rs-links">
      {links.map((l, i) => (
        <LinkChip key={i} href={l.href} alias={l.alias ?? l.text ?? l.label} />
      ))}
    </div>
  );
}
