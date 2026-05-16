import type { SkillsRow } from '../skills/types';
export interface EducationData {
  rows: SkillsRow[];
}
declare module '../types' {
  interface BlockDataMap {
    education: EducationData;
  }
}
