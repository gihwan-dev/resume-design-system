import type { Block } from '../blocks';
import type { ThemeName } from '../theme/themes';

export interface Page {
  id: string;
  blocks: Block[];
}

export interface Snapshot {
  id: string;
  name: string;
  createdAt: number;
  pages: Page[];
}

export interface Resume {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  theme: ThemeName;
  pages: Page[];
  snapshots: Snapshot[];
}

export interface AppState {
  schemaVersion: number;
  currentResumeId: string;
  selectedBlockIds: string[];
  resumes: Record<string, Resume>;
}
