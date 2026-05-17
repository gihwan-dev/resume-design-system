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

const BULLET_RE = /^\s*[-*]\s+(.*)$/;

/**
 * Block-aware rich-text renderer. Detects line-leading `- ` / `* ` markers
 * and wraps consecutive bullet lines into a <ul>. Non-bullet lines are
 * grouped into a single block that relies on the parent's `white-space:
 * pre-line` to preserve newlines.
 *
 * Inline markers from rt() (`**bold**`, `==metric==`, `` `mono` ``) still
 * apply within each line.
 */
export function rtBlock(text: string | undefined | null): ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  const groups: Array<{ kind: 'bullet' | 'text'; lines: string[] }> = [];
  for (const line of lines) {
    const isBullet = BULLET_RE.test(line);
    const last = groups[groups.length - 1];
    if (last && ((isBullet && last.kind === 'bullet') || (!isBullet && last.kind === 'text'))) {
      last.lines.push(line);
    } else {
      groups.push({ kind: isBullet ? 'bullet' : 'text', lines: [line] });
    }
  }

  const out: ReactNode[] = [];
  groups.forEach((g, gi) => {
    if (g.kind === 'bullet') {
      out.push(
        createElement(
          'ul',
          { key: `rtb_u${gi}`, className: 'rs-rt-bullets' },
          g.lines.map((l, li) => {
            const m = l.match(BULLET_RE);
            const content = m ? m[1] ?? '' : l;
            return createElement(
              'li',
              { key: `rtb_u${gi}_${li}`, className: 'rs-rt-bullet-item' },
              renderFragment(content, `rtb_u${gi}_${li}_`),
            );
          }),
        ),
      );
    } else {
      // Collapse leading/trailing empty lines around bullet groups so the
      // user's newline before "- foo" doesn't produce an awkward gap.
      const trimmed =
        gi === 0 || gi === groups.length - 1
          ? g.lines.filter((l, idx, arr) => !(l.trim() === '' && (idx === 0 || idx === arr.length - 1)))
          : g.lines;
      if (trimmed.length === 0) return;
      const joined = trimmed.join('\n');
      out.push(
        createElement(Fragment, { key: `rtb_t${gi}` }, renderFragment(joined, `rtb_t${gi}_`)),
      );
    }
  });

  return out;
}
