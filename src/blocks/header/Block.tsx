import type { HeaderData } from './types';
import { ContactItem } from '../../components/ContactItem';

export function HeaderBlock({ data }: { data: HeaderData }) {
  const { name, role, tagline, contacts = [] } = data;
  return (
    <header className="rs-header">
      {name && <h1 className="rs-name">{name}</h1>}
      {role && <div className="rs-role">{role}</div>}
      {tagline && <p className="rs-body rs-tagline">{tagline}</p>}
      {contacts.length > 0 && (
        <div className="rs-header-contacts">
          {contacts.map((c, i) => (
            <ContactItem key={i} raw={c} />
          ))}
        </div>
      )}
    </header>
  );
}
