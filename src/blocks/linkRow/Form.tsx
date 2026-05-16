import type { Block } from '../types';
import type { LinkItem, LinkRowData } from './types';
import { Field, IconBtn, TextInput } from '../../app/Inspector/primitives';
import { LinkChip } from '../../components/LinkChip';
import { inferAliasFromUrl } from '../../lib/linkAlias';

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
      {links.map((l, i) => {
        const fallbackAlias = l.alias ?? l.text ?? l.label;
        const aliasPlaceholder = inferAliasFromUrl(l.href) || '자동 추론';
        return (
          <div key={i} className="sub-card">
            <div className="sub-card-head">
              <div className="sub-card-title">Link {String(i + 1).padStart(2, '0')}</div>
              <IconBtn title="삭제" onClick={() => removeLink(i)} danger>
                ×
              </IconBtn>
            </div>
            <Field label="URL">
              <TextInput value={l.href} onChange={(v) => setLink(i, { href: v })} mono />
            </Field>
            <Field label="Alias" hint="비워두면 도메인에서 자동 추론됩니다.">
              <TextInput
                value={l.alias}
                onChange={(v) => setLink(i, { alias: v })}
                placeholder={aliasPlaceholder}
                mono
              />
            </Field>
            {l.href && (
              <div className="sub-card-preview">
                <LinkChip href={l.href} alias={fallbackAlias} />
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        className="btn"
        onClick={() => update({ links: [...links, { href: 'https://' }] })}
      >
        + 링크 추가
      </button>
    </div>
  );
}
