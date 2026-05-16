export interface PAR {
  id: string;
  label: string;
  problem: string;
  action: string;
  result: string;
  learning: string;
}

export interface Project {
  id: string;
  title: string;
  period: string;
  stack: string;
  pars: PAR[];
}

export interface CareerData {
  company: string;
  role: string;
  period: string;
  summary: string;
  projects: Project[];
}

declare module '../types' {
  interface BlockDataMap {
    career: CareerData;
  }
}
