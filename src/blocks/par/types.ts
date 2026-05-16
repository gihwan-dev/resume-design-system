export interface ParData {
  label: string;
  problem: string;
  action: string;
  result: string;
  learning: string;
}

declare module '../types' {
  interface BlockDataMap {
    par: ParData;
  }
}
