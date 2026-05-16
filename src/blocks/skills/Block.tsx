import { Fragment } from 'react';
import { rt } from '../../rich-text/parse';
import type { SkillsData } from './types';

export function SkillsBlock({ data }: { data: SkillsData }) {
  const rows = data.rows ?? [];
  return (
    <div className="rs-skills">
      {rows.map((row, i) => (
        <Fragment key={i}>
          <div className="rs-skills-key">{row.key}</div>
          <div className="rs-stack rs-skills-val">{rt(row.val)}</div>
        </Fragment>
      ))}
    </div>
  );
}
