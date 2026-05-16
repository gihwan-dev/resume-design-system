export interface CaseStudyLink {
  href: string;
  alias?: string;
  /** Pre-migration field name. Kept so persisted state from older versions
   *  still renders a chip — Form / Block fall back to `label` when `alias`
   *  is empty. New writes use `alias`. */
  label?: string;
}

export interface CaseStudyHeaderData {
  title: string;
  period: string;
  stack: string;
  role: string;
  context: string;
  links: CaseStudyLink[];
}

declare module '../types' {
  interface BlockDataMap {
    caseStudyHeader: CaseStudyHeaderData;
  }
}
