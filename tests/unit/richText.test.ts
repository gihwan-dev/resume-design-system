import { describe, expect, it } from 'vitest';
import { rt } from '../../src/rich-text/parse';
import { isValidElement } from 'react';

describe('rt — rich-text parser', () => {
  it('returns null for empty input', () => {
    expect(rt('')).toBeNull();
    expect(rt(undefined)).toBeNull();
    expect(rt(null)).toBeNull();
  });

  it('wraps **text** in an rs-emphasis span', () => {
    const out = rt('plain **bold** rest');
    expect(Array.isArray(out)).toBe(true);
    const nodes = out as ReturnType<typeof rt> as React.ReactNode[];
    const emphasis = nodes.find(
      (n) => isValidElement(n) && (n.props as { className?: string }).className === 'rs-emphasis',
    );
    expect(emphasis).toBeDefined();
  });

  it('wraps ==metric== in an rs-num span', () => {
    const out = rt('A ==42==') as React.ReactNode[];
    const metric = out.find(
      (n) => isValidElement(n) && (n.props as { className?: string }).className === 'rs-num',
    );
    expect(metric).toBeDefined();
  });

  it('wraps `code` in an rs-stack code element', () => {
    const out = rt('use `React`') as React.ReactNode[];
    const code = out.find(
      (n) => isValidElement(n) && (n.props as { className?: string }).className === 'rs-stack',
    );
    expect(code).toBeDefined();
  });

  it('processes code → metric → emphasis without nesting', () => {
    const out = rt('`React` ==99%== **fast**') as React.ReactNode[];
    const classes = out
      .filter(isValidElement)
      .map((n) => (n.props as { className?: string }).className);
    expect(classes).toEqual(expect.arrayContaining(['rs-stack', 'rs-num', 'rs-emphasis']));
  });
});

describe('rtTree — nested bullets', () => {
  it('nests bullets by two-space indentation and keeps plain lines', async () => {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { createElement, Fragment } = await import('react');
    const { rtTree, hasBulletLines } = await import('../../src/rich-text/parse');
    const text = '**제목**\n- 항목\n  - 이유\n  - 결과\n- 다음';
    expect(hasBulletLines(text)).toBe(true);
    expect(hasBulletLines('평범한 문장')).toBe(false);
    const html = renderToStaticMarkup(createElement(Fragment, null, rtTree(text)));
    expect(html).toContain('<div class="rs-tree-line"><span class="rs-emphasis">제목</span></div>');
    expect(html).toContain(
      '<ul class="rs-tree rs-tree--d0"><li class="rs-tree-item">항목<ul class="rs-tree rs-tree--d1"><li class="rs-tree-item">이유</li><li class="rs-tree-item">결과</li></ul></li><li class="rs-tree-item">다음</li></ul>',
    );
  });
});
