import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { getBlock } from '../../src/blocks';
import '../../src/blocks';

const ALL_TYPES = [
  'header',
  'positioning',
  'sectionHeader',
  'coreImpact',
  'career',
  'caseStudy',
  'skills',
  'learningNote',
  'education',
  'linkRow',
  'freeText',
  'divider',
  'spacer',
];

describe('block registry', () => {
  it('registers every declared block type', () => {
    for (const t of ALL_TYPES) {
      expect(getBlock(t)).toBeDefined();
    }
  });

  it('every block has a default data factory and renderable JSX', () => {
    for (const t of ALL_TYPES) {
      const def = getBlock(t);
      expect(def).toBeDefined();
      if (!def) continue;
      const Render = def.Render;
      const data = def.defaultData();
      const { container } = render(<Render data={data} />);
      expect(container.firstChild).toBeTruthy();
    }
  });
});
