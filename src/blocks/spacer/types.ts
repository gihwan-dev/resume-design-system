export interface SpacerData {
  height: number;
}
declare module '../types' {
  interface BlockDataMap {
    spacer: SpacerData;
  }
}
