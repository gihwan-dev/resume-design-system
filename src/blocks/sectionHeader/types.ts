export interface SectionHeaderData {
  title: string;
  meta: string;
  variant: 'primary' | 'secondary';
}
declare module '../types' {
  interface BlockDataMap {
    sectionHeader: SectionHeaderData;
  }
}
