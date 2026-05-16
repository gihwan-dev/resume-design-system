export interface HeaderData {
  name: string;
  role: string;
  tagline: string;
  contacts: string[];
}

declare module '../types' {
  interface BlockDataMap {
    header: HeaderData;
  }
}
