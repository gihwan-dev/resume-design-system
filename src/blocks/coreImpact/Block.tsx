import { rt } from '../../rich-text/parse';
import type { CoreImpactData } from './types';

export function CoreImpactBlock({ data }: { data: CoreImpactData }) {
  const items = data.items ?? [];
  return (
    <ul className="rs-impact">
      {items.map((node, i) => (
        <li key={i} className="rs-impact-item">
          <span className="rs-impact-num">{String(i + 1).padStart(2, '0')}</span>
          <span className="rs-bullet">{rt(node)}</span>
        </li>
      ))}
    </ul>
  );
}
