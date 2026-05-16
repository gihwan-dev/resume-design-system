export interface CaseStudyLink {
  href: string;
  alias?: string;
  // Kept temporarily for resumes saved before the alias migration.
  label?: string;
}

/**
 * Case Study — for projects where the artifact itself is the solution.
 *
 * Unlike a PAR(L), a case study doesn't have an external problem the author
 * happened to encounter; it's a self-contained product/tool the author built
 * to solve a class of problems. The label set reflects that:
 *
 *   CONTEXT   — why this exists at all (the situation/opportunity)
 *   BUILT     — what was built, with what shape/decisions
 *   OUTCOME   — the change the artifact produced
 *   LEARNING  — (optional) the principle that survives the project
 */
export interface CaseStudyData {
  title: string;
  period: string;
  stack: string;
  role: string;
  context: string;
  built: string;
  outcome: string;
  learning: string;
  links: CaseStudyLink[];
}

declare module '../types' {
  interface BlockDataMap {
    caseStudy: CaseStudyData;
  }
}
