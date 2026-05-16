export interface FreeTextData {
  text: string;
}
declare module '../types' {
  interface BlockDataMap {
    freeText: FreeTextData;
  }
}
