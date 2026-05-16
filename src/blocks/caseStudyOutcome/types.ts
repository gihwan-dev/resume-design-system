export interface CaseStudyOutcomeData {
  built: string;
  outcome: string;
  learning: string;
}

declare module '../types' {
  interface BlockDataMap {
    caseStudyOutcome: CaseStudyOutcomeData;
  }
}
