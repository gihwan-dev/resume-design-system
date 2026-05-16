import { rt } from '../../rich-text/parse';
import type { CareerHeaderData } from './types';

export function CareerHeaderBlock({ data }: { data: CareerHeaderData }) {
  const { company, role, period, summary } = data;
  return (
    <div className="rs-career-header">
      <div className="rs-career-top">
        <div className="rs-career-title">
          <span className="rs-career-company">{company}</span>
          {role && <span className="rs-career-sep">·</span>}
          {role && <span className="rs-career-role">{role}</span>}
        </div>
        {period && <div className="rs-section-meta rs-career-period">{period}</div>}
      </div>
      {summary && <p className="rs-body rs-career-summary">{rt(summary)}</p>}
    </div>
  );
}
