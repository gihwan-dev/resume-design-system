export interface LinkItem {
  label: string;
  text: string;
  href: string;
}
export interface LinkRowData {
  links: LinkItem[];
}
declare module '../types' {
  interface BlockDataMap {
    linkRow: LinkRowData;
  }
}
