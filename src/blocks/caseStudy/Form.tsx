import type { Block } from '../types';
import type { CaseStudyData, CaseStudyLink } from './types';
import { Field, IconBtn, RT_HINT, TextArea, TextInput } from '../../app/Inspector/primitives';

export function CaseStudyForm({
  block,
  update,
}: {
  block: Block<'caseStudy'>;
  update: (patch: Partial<CaseStudyData>) => void;
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
      <Field label="스택" hint="쉼표(,)로 구분해서 적으면 · 로 표시돼요">
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
      <Field label="BUILT — 무엇을 어떻게 만들었는가" hint={RT_HINT}>
        <TextArea
          rows={3}
          value={d.built}
          onChange={(v) => update({ built: v })}
          placeholder="핵심 기능과 의사결정 — 모델·구조·트레이드오프"
        />
      </Field>
      <Field label="OUTCOME — 어떤 변화가 있었는가" hint={RT_HINT}>
        <TextArea
          rows={3}
          value={d.outcome}
          onChange={(v) => update({ outcome: v })}
          placeholder="사용 규모·시간 절감·정성적 변화 등 (가능하면 ==수치==)"
        />
      </Field>
      <Field label="LEARNING (선택)" hint={RT_HINT}>
        <TextArea
          rows={2}
          value={d.learning}
          onChange={(v) => update({ learning: v })}
          placeholder="이 프로젝트에서 남은 기준 / 다음 작업에 적용한 원칙"
        />
      </Field>

      <div className="panel-section-title" style={{ marginTop: 8 }}>
        링크 (선택)
      </div>
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
          <Field label="URL">
            <TextInput value={l.href} onChange={(v) => setLink(i, { href: v })} mono />
          </Field>
        </div>
      ))}
      <button
        type="button"
        className="btn"
        onClick={() => update({ links: [...links, { label: 'DEMO', href: 'https://' }] })}
      >
        + 링크 추가
      </button>
    </div>
  );
}
