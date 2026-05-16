export interface LinkItem {
  href: string;
  alias?: string;
  // Kept temporarily so resumes saved before the alias migration still load.
  // Renderers read `alias ?? text ?? label`. Remove in a follow-up PR after
  // an explicit migration pass.
  label?: string;
  text?: string;
}
export interface LinkRowData {
  links: LinkItem[];
}
declare module '../types' {
  interface BlockDataMap {
    linkRow: LinkRowData;
  }
}
