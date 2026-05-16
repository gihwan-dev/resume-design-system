import { rt } from '../../rich-text/parse';
import { formatStack } from '../../lib/formatStack';
import type { CareerData, Project, PAR } from './types';

function PARView({ par }: { par: PAR }) {
  return (
    <div className="rs-par-block">
      {par.label && <div className="rs-par-label">{par.label}</div>}
      <dl className="rs-par">
        {par.problem && <dt className="rs-par-key">PROBLEM</dt>}
        {par.problem && <dd className="rs-par-val rs-body">{rt(par.problem)}</dd>}
        {par.action && <dt className="rs-par-key">ACTION</dt>}
        {par.action && <dd className="rs-par-val rs-body">{rt(par.action)}</dd>}
        {par.result && <dt className="rs-par-key">RESULT</dt>}
        {par.result && <dd className="rs-par-val rs-body">{rt(par.result)}</dd>}
        {par.learning && <dt className="rs-par-key">LEARNING</dt>}
        {par.learning && <dd className="rs-par-val rs-learning">{rt(par.learning)}</dd>}
      </dl>
    </div>
  );
}

function ProjectView({ project }: { project: Project }) {
  const { title, period, stack, pars = [] } = project;
  return (
    <div className="rs-project">
      <div className="rs-project-top">
        <div className="rs-project-title">{title}</div>
        {period && <div className="rs-section-meta rs-project-period">{period}</div>}
      </div>
      {stack && <div className="rs-stack rs-project-stack">{formatStack(stack)}</div>}
      {pars.length > 0 && (
        <div className="rs-project-pars">
          {pars.map((par) => (
            <PARView key={par.id} par={par} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CareerBlock({ data }: { data: CareerData }) {
  const { company, role, period, summary, projects = [] } = data;
  return (
    <div className="rs-career">
      <div className="rs-career-top">
        <div className="rs-career-title">
          <span className="rs-career-company">{company}</span>
          {role && <span className="rs-career-sep">·</span>}
          {role && <span className="rs-career-role">{role}</span>}
        </div>
        {period && <div className="rs-section-meta rs-career-period">{period}</div>}
      </div>
      {summary && <p className="rs-body rs-career-summary">{rt(summary)}</p>}
      {projects.length > 0 && (
        <div className="rs-career-projects">
          {projects.map((prj) => (
            <ProjectView key={prj.id} project={prj} />
          ))}
        </div>
      )}
    </div>
  );
}
