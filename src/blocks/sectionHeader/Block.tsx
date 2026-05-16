import type { SectionHeaderData } from './types';

export function SectionHeaderBlock({ data }: { data: SectionHeaderData }) {
  const variant = data.variant === 'secondary' ? 'secondary' : 'primary';
  return (
    <div className={`rs-section-header rs-section-header--${variant}`}>
      <div className="rs-section">{data.title}</div>
      {data.meta && <div className="rs-section-meta">{data.meta}</div>}
    </div>
  );
}
