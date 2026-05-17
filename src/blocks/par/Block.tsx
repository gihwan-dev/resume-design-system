import { rtBlock } from '../../rich-text/parse';
import type { ParData } from './types';

export function ParBlock({ data }: { data: ParData }) {
  const { label, problem, action, result, learning } = data;
  return (
    <div className="rs-par-block rs-par-block--standalone">
      {label && <div className="rs-par-label">{label}</div>}
      <dl className="rs-par">
        {problem && <dt className="rs-par-key">PROBLEM</dt>}
        {problem && <dd className="rs-par-val rs-body">{rtBlock(problem)}</dd>}
        {action && <dt className="rs-par-key">ACTION</dt>}
        {action && <dd className="rs-par-val rs-body">{rtBlock(action)}</dd>}
        {result && <dt className="rs-par-key">RESULT</dt>}
        {result && <dd className="rs-par-val rs-body">{rtBlock(result)}</dd>}
        {learning && <dt className="rs-par-key">LEARNING</dt>}
        {learning && <dd className="rs-par-val rs-learning">{rtBlock(learning)}</dd>}
      </dl>
    </div>
  );
}
