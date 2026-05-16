import { Fragment, createElement, type ReactNode } from 'react';

/**
 * Tiny inline markup parser shared by every block renderer.
 *
 *   **text**   → <span class="rs-emphasis">…</span>   (semibold primary)
 *   ==text==   → <span class="rs-num">…</span>        (accent mono — metric)
 *   `text`     → <code class="rs-stack">…</code>      (mono inline stack)
 *
 * Markers do NOT nest. Order: code → metric → emphasis.
 */

type Token = { kind: 'text'; value: string } | { kind: 'node'; node: ReactNode };

function splitBy(
  text: string,
  re: RegExp,
  makeNode: (content: string, i: number) => ReactNode,
): Token[] {
  const out: Token[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  re.lastIndex = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) out.push({ kind: 'text', value: text.slice(last, match.index) });
    out.push({ kind: 'node', node: makeNode(match[1] ?? '', out.length) });
    last = match.index + match[0].length;
  }
  if (last < text.length) out.push({ kind: 'text', value: text.slice(last) });
  return out;
}

function renderFragment(text: string, keyPrefix: string): ReactNode[] {
  const codeParts = splitBy(text, /`([^`\n]+)`/g, (content, i) =>
    createElement('code', { key: `${keyPrefix}c${i}`, className: 'rs-stack' }, content),
  );

  const withMetric: Token[] = [];
  codeParts.forEach((p, idx) => {
    if (p.kind === 'node') {
      withMetric.push(p);
      return;
    }
    const subs = splitBy(p.value, /==([^=\n]+)==/g, (content, i) =>
      createElement('span', { key: `${keyPrefix}m${idx}_${i}`, className: 'rs-num' }, content),
    );
    subs.forEach((s) => withMetric.push(s));
  });

  const withEm: Token[] = [];
  withMetric.forEach((p, idx) => {
    if (p.kind === 'node') {
      withEm.push(p);
      return;
    }
    const subs = splitBy(p.value, /\*\*([^*\n]+)\*\*/g, (content, i) =>
      createElement('span', { key: `${keyPrefix}e${idx}_${i}`, className: 'rs-emphasis' }, content),
    );
    subs.forEach((s) => withEm.push(s));
  });

  return withEm.map((p, i) =>
    p.kind === 'node' ? p.node : createElement(Fragment, { key: `${keyPrefix}t${i}` }, p.value),
  );
}

export function rt(text: string | undefined | null): ReactNode {
  if (!text) return null;
  return renderFragment(text, 'rt_');
}
