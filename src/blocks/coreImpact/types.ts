export interface CoreImpactData {
  items: string[];
}
declare module '../types' {
  interface BlockDataMap {
    coreImpact: CoreImpactData;
  }
}
