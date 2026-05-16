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

  it('passes newlines through to the DOM text content so CSS pre-line can render them', () => {
    // The .rs-intro / .rs-body / .rs-bullet / .rs-learning rules use
    // `white-space: pre-line`, which only takes effect if the DOM actually
    // contains the \n character. This is the contract we lock in here.
    const positioning = getBlock('positioning');
    expect(positioning).toBeDefined();
    if (!positioning) return;
    const Render = positioning.Render;
    const { container } = render(<Render data={{ text: '첫째 줄\n둘째 줄' }} />);
    expect(container.textContent).toContain('첫째 줄\n둘째 줄');

    const freeText = getBlock('freeText');
    if (freeText) {
      const FT = freeText.Render;
      const out = render(<FT data={{ text: 'line1\nline2' }} />);
      expect(out.container.textContent).toContain('line1\nline2');
    }
  });

  it('linkRow chip absorbs pre-migration { label, text, href } as alias', () => {
    const def = getBlock('linkRow');
    expect(def).toBeDefined();
    if (!def) return;
    const Render = def.Render;
    const { container } = render(
      <Render
        data={{
          links: [
            { href: 'https://github.com/me', label: 'OLD_LABEL', text: 'old-text' },
            { href: 'https://my-blog.dev', alias: 'My Blog' },
          ],
        }}
      />,
    );
    // alias absent → falls back to text (old data shape), then label.
    expect(container.textContent).toContain('old-text');
    // explicit alias wins.
    expect(container.textContent).toContain('My Blog');
  });

  it('caseStudy links chip absorbs pre-migration { label, href } as alias', () => {
    const def = getBlock('caseStudy');
    expect(def).toBeDefined();
    if (!def) return;
    const Render = def.Render;
    const { container } = render(
      <Render
        data={{
          title: 'X',
          period: '',
          stack: '',
          role: '',
          context: '',
          built: '',
          outcome: '',
          learning: '',
          links: [{ href: 'https://demo.app', label: 'DEMO' }],
        }}
      />,
    );
    expect(container.textContent).toContain('DEMO');
  });
});
