import { useState } from 'react';
import { Globe } from 'lucide-react';
import { parseHostname } from '../../lib/linkAlias';
import type { BlogPostsData, BlogPostItem } from './types';

function faviconUrl(href: string): string | null {
  const host = parseHostname(href);
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

function BlogRow({ href, title, note }: BlogPostItem) {
  const src = faviconUrl(href);
  const [failed, setFailed] = useState(false);
  const display = title?.trim() || href || '';
  return (
    <a
      className="rs-blog-row"
      href={href || '#'}
      target="_blank"
      rel="noreferrer"
      title={href || undefined}
    >
      <span className="rs-blog-icon" aria-hidden="true">
        {src && !failed ? (
          <img src={src} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} />
        ) : (
          <Globe strokeWidth={1.75} />
        )}
      </span>
      <span className="rs-blog-body">
        <span className="rs-blog-title">{display}</span>
        {note && note.trim() && <span className="rs-blog-note">{note}</span>}
      </span>
    </a>
  );
}

export function BlogPostsBlock({ data }: { data: BlogPostsData }) {
  const items = data.items ?? [];
  if (items.length === 0) return null;
  return (
    <div className="rs-blog-list">
      {items.map((it, i) => (
        <BlogRow key={i} href={it.href} title={it.title} note={it.note} />
      ))}
    </div>
  );
}
