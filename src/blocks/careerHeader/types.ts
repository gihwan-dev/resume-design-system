export interface CareerHeaderData {
  company: string;
  role: string;
  period: string;
  summary: string;
}

declare module '../types' {
  interface BlockDataMap {
    careerHeader: CareerHeaderData;
  }
}
