export interface DividerData {
  variant: 'subtle' | 'strong';
}
declare module '../types' {
  interface BlockDataMap {
    divider: DividerData;
  }
}
