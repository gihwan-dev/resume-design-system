export interface SkillsRow {
  key: string;
  val: string;
}
export interface SkillsData {
  rows: SkillsRow[];
}
declare module '../types' {
  interface BlockDataMap {
    skills: SkillsData;
  }
}
