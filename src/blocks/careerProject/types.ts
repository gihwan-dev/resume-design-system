export interface CareerProjectData {
  title: string;
  period: string;
  stack: string;
}

declare module '../types' {
  interface BlockDataMap {
    careerProject: CareerProjectData;
  }
}
