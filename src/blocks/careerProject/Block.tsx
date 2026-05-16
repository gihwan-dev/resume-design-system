import { formatStack } from '../../lib/formatStack';
import type { CareerProjectData } from './types';

export function CareerProjectBlock({ data }: { data: CareerProjectData }) {
  const { title, period, stack } = data;
  return (
    <div className="rs-project rs-project--standalone">
      <div className="rs-project-top">
        <div className="rs-project-title">{title}</div>
        {period && <div className="rs-section-meta rs-project-period">{period}</div>}
      </div>
      {stack && <div className="rs-stack rs-project-stack">{formatStack(stack)}</div>}
    </div>
  );
}
