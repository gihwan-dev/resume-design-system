import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { getBlock } from '../../src/blocks';
import '../../src/blocks';

describe('block registry', () => {
  it('registers all 12 block types', () => {
    for (const t of [
      'header',
      'positioning',
      'sectionHeader',
      'coreImpact',
      'career',
      'skills',
      'learningNote',
      'education',
      'linkRow',
      'freeText',
      'divider',
      'spacer',
    ]) {
      expect(getBlock(t)).toBeDefined();
    }
  });

  it('every block has a default data factory and renderable JSX', () => {
    const types = [
      'header',
      'positioning',
      'sectionHeader',
      'coreImpact',
      'career',
      'skills',
      'learningNote',
      'education',
      'linkRow',
      'freeText',
      'divider',
      'spacer',
    ];
    for (const t of types) {
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
