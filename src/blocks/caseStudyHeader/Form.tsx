import type { Block } from '../types';
import type { CaseStudyHeaderData, CaseStudyLink } from './types';
import { Field, IconBtn, RT_HINT, TextArea, TextInput } from '../../app/Inspector/primitives';
import { LinkChip } from '../../components/LinkChip';
import { inferAliasFromUrl } from '../../lib/linkAlias';

export function CaseStudyHeaderForm({
  block,
  update,
}: {
  block: Block<'caseStudyHeader'>;
  update: (patch: Partial<CaseStudyHeaderData>) => void;
}) {
  const d = block.data;
  const links = d.links ?? [];

  const setLink = (i: number, patch: Partial<CaseStudyLink>) =>
    update({ links: links.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const removeLink = (i: number) => update({ links: links.filter((_, j) => j !== i) });

  return (
    <div className="field-group">
      <Field label="제목">
        <TextInput value={d.title} onChange={(v) => update({ title: v })} />
      </Field>
      <Field label="기간">
        <TextInput
          value={d.period}
          onChange={(v) => update({ period: v })}
          placeholder="2024.03 — 2024.06"
          mono
        />
      </Field>
      <Field label="역할">
        <TextInput
          value={d.role}
          onChange={(v) => update({ role: v })}
          placeholder="Solo · Full-stack"
          mono
        />
      </Field>
      <Field label="스택" hint="쉼표(,)로 구분하면 · 로 표시돼요">
        <TextInput
          value={d.stack}
          onChange={(v) => update({ stack: v })}
          placeholder="React, TypeScript, Supabase"
          mono
        />
      </Field>
      <Field label="CONTEXT — 왜 만들었는가" hint={RT_HINT}>
        <TextArea
          rows={3}
          value={d.context}
          onChange={(v) => update({ context: v })}
          placeholder="어떤 상황·문제가 있었는지, 무엇이 빠져 있어 만들기로 했는지"
        />
      </Field>

      <div className="panel-section-title" style={{ marginTop: 8 }}>
        링크 (선택)
      </div>
      {links.map((l, i) => {
        const fallbackAlias = l.alias ?? l.label;
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
