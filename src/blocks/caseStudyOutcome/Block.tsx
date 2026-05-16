import { rt } from '../../rich-text/parse';
import type { CaseStudyOutcomeData } from './types';

export function CaseStudyOutcomeBlock({ data }: { data: CaseStudyOutcomeData }) {
  const { built, outcome, learning } = data;
  return (
    <div className="rs-par-block rs-par-block--standalone">
      <dl className="rs-par">
        {built && <dt className="rs-par-key">BUILT</dt>}
        {built && <dd className="rs-par-val rs-body">{rt(built)}</dd>}
        {outcome && <dt className="rs-par-key">OUTCOME</dt>}
        {outcome && <dd className="rs-par-val rs-body">{rt(outcome)}</dd>}
        {learning && <dt className="rs-par-key">LEARNING</dt>}
        {learning && <dd className="rs-par-val rs-learning">{rt(learning)}</dd>}
      </dl>
    </div>
  );
}
