import type { LinkRowData } from './types';

export function LinkRowBlock({ data }: { data: LinkRowData }) {
  const links = data.links ?? [];
  return (
    <div className="rs-links">
      {links.map((l, i) => (
        <div key={i} className="rs-link-cell">
          <div className="rs-link-label">{l.label}</div>
          <a className="rs-link" href={l.href || '#'} target="_blank" rel="noreferrer">
            {l.text}
          </a>
        </div>
      ))}
    </div>
  );
}
