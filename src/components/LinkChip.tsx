import { useState } from 'react';
import { Globe } from 'lucide-react';
import { inferAliasFromUrl, parseHostname } from '../lib/linkAlias';

/**
 * Single visual contract for every external link in the resume.
 *
 *   <LinkChip href="https://github.com/me" />          → [● GitHub]
 *   <LinkChip href="https://blog.dev" alias="My Blog"/>→ [● My Blog]
 *
 * The icon is the host's favicon, served via Google's `s2/favicons` endpoint
 * with `<img src>` directly — we tried fetching the bytes for a data-URI
 * cache, but the endpoint sends no CORS headers, so `fetch()` is blocked.
 * The pragmatic route is the browser's own HTTP image cache: every chip
 * pointing to the same host shares one cached raster, the network hit is
 * one-time, and once decoded the image survives `window.print()`. On
 * load failure (offline, blocked, unknown host) we fall back to a
 * lucide `Globe` SVG so the chip never looks broken.
 */

function faviconUrl(href: string): string | null {
  const host = parseHostname(href);
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

export function LinkChip({ href, alias }: { href: string; alias?: string }) {
  const display = (alias && alias.trim()) || inferAliasFromUrl(href) || href;
  const src = faviconUrl(href);
  const [failed, setFailed] = useState(false);

  return (
    <a
      className="rs-link-chip"
      href={href || '#'}
      target="_blank"
      rel="noreferrer"
      title={href}
    >
      {src && !failed ? (
        <img
          className="rs-link-chip-icon"
          src={src}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <Globe className="rs-link-chip-icon" strokeWidth={1.75} aria-hidden="true" />
      )}
      <span className="rs-link-chip-label">{display}</span>
    </a>
  );
}
