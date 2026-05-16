import { rt } from '../../rich-text/parse';
import type { LearningNoteData } from './types';

export function LearningNoteBlock({ data }: { data: LearningNoteData }) {
  const variant = data.variant ?? 'default';
  return (
    <div className={`rs-learning-note rs-learning-note--${variant}`}>
      {data.label && <div className="rs-learning-label">{data.label}</div>}
      <div className="rs-learning">{rt(data.text)}</div>
    </div>
  );
}
