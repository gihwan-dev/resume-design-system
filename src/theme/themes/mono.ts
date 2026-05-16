import { defaultTheme } from './default';
import type { Theme } from '../tokens';

/**
 * Mono theme — a slightly more typographic, grayscale-leaning variant.
 * Demonstrates how to extend a theme: spread defaultTheme then override.
 */
export const monoTheme: Theme = {
  ...defaultTheme,
  name: 'mono',
  colors: {
    ...defaultTheme.colors,
    accent: {
      primary: '#18181B',
      soft: '#EDECE7',
      on: '#FFFFFF',
    },
    border: {
      subtle: '#E0DFDB',
      strong: '#18181B',
      accent: '#18181B',
    },
  },
  fonts: {
    sans: '"Pretendard Variable", "Pretendard", "Apple SD Gothic Neo", system-ui, -apple-system, sans-serif',
    mono: '"JetBrains Mono", "SF Mono", ui-monospace, Menlo, Consolas, monospace',
  },
};
