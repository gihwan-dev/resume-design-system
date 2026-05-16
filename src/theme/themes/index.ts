import type { Theme } from '../tokens';
import { defaultTheme } from './default';
import { monoTheme } from './mono';

export const THEMES: Record<string, Theme> = {
  default: defaultTheme,
  mono: monoTheme,
};

export type ThemeName = keyof typeof THEMES;

export { defaultTheme, monoTheme };
