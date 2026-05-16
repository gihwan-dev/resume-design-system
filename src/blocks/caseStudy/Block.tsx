import { rt } from '../../rich-text/parse';
import type { CaseStudyData } from './types';

/**
 * Reuses the .rs-project / .rs-par-block / .rs-par DOM so it sits on
 * the same vertical rhythm as Career→Project→PAR. Only the dt labels
 * differ. The block is intentionally a peer of `career`, not a child:
 * use it for standalone products (side-projects, internal tools) that
 * don't belong inside a single company section.
 */
export function CaseStudyBlock({ data }: { data: CaseStudyData }) {
  const { title, period, stack, role, context, built, outcome, learning, links = [] } = data;
  return (
    <div className="rs-project">
      <div className="rs-project-top">
        <div className="rs-project-title">{title}</div>
        {period && <div className="rs-section-meta rs-project-period">{period}</div>}
      </div>
      {(stack || role) && (
        <div className="rs-stack rs-project-stack">
          {role && <span>{role}</span>}
          {role && stack && <span style={{ margin: '0 6px', color: 'var(--text-faint)' }}>·</span>}
          {stack && <span>{stack}</span>}
        </div>
      )}

      <div className="rs-par-block">
        <dl className="rs-par">
          {context && <dt className="rs-par-key">CONTEXT</dt>}
          {context && <dd className="rs-par-val rs-body">{rt(context)}</dd>}
          {built && <dt className="rs-par-key">BUILT</dt>}
          {built && <dd className="rs-par-val rs-body">{rt(built)}</dd>}
          {outcome && <dt className="rs-par-key">OUTCOME</dt>}
          {outcome && <dd className="rs-par-val rs-body">{rt(outcome)}</dd>}
          {learning && <dt className="rs-par-key">LEARNING</dt>}
          {learning && <dd className="rs-par-val rs-learning">{rt(learning)}</dd>}
        </dl>
      </div>

      {links.length > 0 && (
        <div className="rs-links" style={{ marginTop: 8 }}>
          {links.map((l, i) => (
            <div key={i} className="rs-link-cell">
              <div className="rs-link-label">{l.label || 'LINK'}</div>
              <a className="rs-link" href={l.href || '#'} target="_blank" rel="noreferrer">
                {l.href}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
