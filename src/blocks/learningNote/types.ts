export interface LearningNoteData {
  label: string;
  text: string;
  variant: 'default' | 'minimal';
}
declare module '../types' {
  interface BlockDataMap {
    learningNote: LearningNoteData;
  }
}
