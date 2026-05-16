/**
 * Link alias derivation. Every link in the resume can be displayed as a
 * short chip like "GitHub" or "my-blog.dev"; this module owns the rules
 * that turn a raw URL into that chip text.
 *
 *   inferAliasFromUrl('https://github.com/foo')   → 'GitHub'
 *   inferAliasFromUrl('https://my-blog.dev/x')    → 'my-blog.dev'
 *   inferAliasFromUrl('not-a-url')                → ''
 *
 * Favicons are NOT handled here — that lives in faviconCache.ts so this
 * module stays sync and easy to unit-test.
 */

const KNOWN_ALIASES: Record<string, string> = {
  'github.com': 'GitHub',
  'gitlab.com': 'GitLab',
  'bitbucket.org': 'Bitbucket',
  'linkedin.com': 'LinkedIn',
  'x.com': 'X',
  'twitter.com': 'X',
  'notion.so': 'Notion',
  'notion.site': 'Notion',
  'medium.com': 'Medium',
  'velog.io': 'Velog',
  'tistory.com': 'Tistory',
  'brunch.co.kr': 'Brunch',
  'figma.com': 'Figma',
  'youtube.com': 'YouTube',
  'youtu.be': 'YouTube',
  'instagram.com': 'Instagram',
  'facebook.com': 'Facebook',
  'dribbble.com': 'Dribbble',
  'behance.net': 'Behance',
  'stackoverflow.com': 'Stack Overflow',
  'npmjs.com': 'npm',
  'dev.to': 'DEV',
};

export function parseHostname(href: string | undefined | null): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (!trimmed) return null;
  // A bare integer like "1234" is parsed by URL() as an IPv4 form
  // (0.0.4.210), which we don't want — require at least one letter or
  // explicit dot before even trying.
  if (!/[a-zA-Z]/.test(trimmed) && !/\./.test(trimmed)) return null;
  // URL() throws on relative-looking inputs; prepend http:// when needed.
  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : 'http://' + trimmed;
  try {
    const u = new URL(candidate);
    const host = u.hostname.toLowerCase();
    if (!host || !host.includes('.')) return null;
    return host.startsWith('www.') ? host.slice(4) : host;
  } catch {
    return null;
  }
}

export function inferAliasFromUrl(href: string | undefined | null): string {
  const host = parseHostname(href);
  if (!host) return '';
  const known = KNOWN_ALIASES[host];
  if (known) return known;
  // Unknown host: keep the hostname as-is — preserves brand casing/punctuation
  // the user typed (e.g. "my-blog.dev"). Capitalizing arbitrary domains tends
  // to look worse than leaving them alone.
  return host;
}
