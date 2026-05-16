import { parseHostname } from './linkAlias';

/**
 * Classify a single contact line into one of four shapes so the header
 * can render the appropriate chip:
 *   email → mailto:  + Mail icon
 *   phone → tel:     + Phone icon
 *   url   → http(s): + favicon
 *   text  → plain span (fallback)
 *
 * The detector is deliberately conservative: a string is only labelled
 * `phone` when it could plausibly *be* a phone number, otherwise the
 * generic `text` chip is used and the user sees their input verbatim.
 */

export type ContactKind = 'email' | 'phone' | 'url' | 'text';

export interface DetectedContact {
  kind: ContactKind;
  raw: string;
  /** href to put on the anchor (or null for `text`) */
  href: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function detectContactKind(input: string | undefined | null): ContactKind {
  if (!input) return 'text';
  const v = input.trim();
  if (!v) return 'text';

  if (EMAIL_RE.test(v)) return 'email';

  // URL detection delegates to parseHostname so that "github.com",
  // "https://github.com/me", and "www.github.com" all classify the same.
  if (parseHostname(v)) return 'url';

  // Phone: only digits, spaces, hyphens, parens, dots, or a leading `+`
  // are allowed — and there must be at least 7 digits in total.
  const digits = v.replace(/\D/g, '');
  if (digits.length >= 7 && /^[+\d\s().-]+$/.test(v)) return 'phone';

  return 'text';
}

export function normalizePhoneHref(raw: string): string {
  // tel: URIs accept `+` and digits; strip everything else so dialers
  // don't choke on punctuation.
  const cleaned = raw.replace(/[^\d+]/g, '');
  return `tel:${cleaned}`;
}

export function detectContact(input: string): DetectedContact {
  const kind = detectContactKind(input);
  const raw = input.trim();
  switch (kind) {
    case 'email':
      return { kind, raw, href: `mailto:${raw}` };
    case 'phone':
      return { kind, raw, href: normalizePhoneHref(raw) };
    case 'url':
      // parseHostname handled scheme-less input; LinkChip will do the same
      // when this gets passed downstream.
      return { kind, raw, href: /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}` };
    case 'text':
    default:
      return { kind: 'text', raw, href: null };
  }
}
