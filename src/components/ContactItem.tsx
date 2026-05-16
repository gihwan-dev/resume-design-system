import { Mail, Phone } from 'lucide-react';
import { detectContact } from '../lib/contactDetect';
import { LinkChip } from './LinkChip';

/**
 * One row in the header `contacts` list.
 *
 * The raw string is classified by `detectContact` and rendered as the
 * right kind of chip:
 *   email → mailto: + Mail icon
 *   phone → tel:    + Phone icon
 *   url   → LinkChip (favicon + alias-from-host)
 *   text  → plain span (no icon, no link) — graceful fallback for any
 *           label the user writes that isn't recognisable.
 */
export function ContactItem({ raw }: { raw: string }) {
  const c = detectContact(raw);

  if (c.kind === 'url') {
    return <LinkChip href={c.href ?? c.raw} />;
  }

  if (c.kind === 'email') {
    return (
      <a className="rs-link-chip" href={c.href ?? '#'} title={c.raw}>
        <Mail className="rs-link-chip-icon" strokeWidth={1.75} aria-hidden="true" />
        <span className="rs-link-chip-label">{c.raw}</span>
      </a>
    );
  }

  if (c.kind === 'phone') {
    return (
      <a className="rs-link-chip" href={c.href ?? '#'} title={c.raw}>
        <Phone className="rs-link-chip-icon" strokeWidth={1.75} aria-hidden="true" />
        <span className="rs-link-chip-label">{c.raw}</span>
      </a>
    );
  }

  return <span className="rs-contact">{c.raw}</span>;
}
