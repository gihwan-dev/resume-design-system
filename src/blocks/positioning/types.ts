export interface PositioningData {
  text: string;
}
declare module '../types' {
  interface BlockDataMap {
    positioning: PositioningData;
  }
}
