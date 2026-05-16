import type { Block } from '../types';
import type { LinkItem, LinkRowData } from './types';
import { Field, IconBtn, TextInput } from '../../app/Inspector/primitives';

export function LinkRowForm({
  block,
  update,
}: {
  block: Block<'linkRow'>;
  update: (patch: Partial<LinkRowData>) => void;
}) {
  const links = block.data.links ?? [];
  const setLink = (i: number, patch: Partial<LinkItem>) =>
    update({ links: links.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const removeLink = (i: number) => update({ links: links.filter((_, j) => j !== i) });
  return (
    <div className="field-group">
      {links.map((l, i) => (
        <div key={i} className="sub-card">
          <div className="sub-card-head">
            <div className="sub-card-title">Link {String(i + 1).padStart(2, '0')}</div>
            <IconBtn title="삭제" onClick={() => removeLink(i)} danger>
              ×
            </IconBtn>
          </div>
          <Field label="라벨">
            <TextInput value={l.label} onChange={(v) => setLink(i, { label: v })} mono />
          </Field>
          <Field label="텍스트">
            <TextInput value={l.text} onChange={(v) => setLink(i, { text: v })} mono />
          </Field>
          <Field label="URL">
            <TextInput value={l.href} onChange={(v) => setLink(i, { href: v })} mono />
          </Field>
        </div>
      ))}
      <button
        type="button"
        className="btn"
        onClick={() =>
          update({
            links: [...links, { label: 'Label', text: 'site.dev', href: 'https://' }],
          })
        }
      >
        + 링크 추가
      </button>
    </div>
  );
}
