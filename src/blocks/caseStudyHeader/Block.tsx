import { rt } from '../../rich-text/parse';
import { formatStack } from '../../lib/formatStack';
import { LinkChip } from '../../components/LinkChip';
import type { CaseStudyHeaderData } from './types';

export function CaseStudyHeaderBlock({ data }: { data: CaseStudyHeaderData }) {
  const { title, period, stack, role, context, links = [] } = data;
  return (
    <div className="rs-project rs-project--standalone rs-case-header">
      <div className="rs-project-top">
        <div className="rs-project-title">{title}</div>
        {period && <div className="rs-section-meta rs-project-period">{period}</div>}
      </div>
      {(stack || role) && (
        <div className="rs-stack rs-project-stack">
          {role && <span>{role}</span>}
          {role && stack && <span className="rs-case-meta-sep">·</span>}
          {stack && <span>{formatStack(stack)}</span>}
        </div>
      )}
      {context && (
        <div className="rs-par-block rs-par-block--standalone">
          <dl className="rs-par">
            <dt className="rs-par-key">CONTEXT</dt>
            <dd className="rs-par-val rs-body">{rt(context)}</dd>
          </dl>
        </div>
      )}
      {links.length > 0 && (
        <div className="rs-link-chips rs-case-links">
          {links.map((l, i) => (
            <LinkChip key={i} href={l.href} alias={l.alias ?? l.label} />
          ))}
        </div>
      )}
    </div>
  );
}
