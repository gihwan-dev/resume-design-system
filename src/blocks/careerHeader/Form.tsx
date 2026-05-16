import type { Block } from '../types';
import type { CareerHeaderData } from './types';
import { Field, RT_HINT, TextArea, TextInput } from '../../app/Inspector/primitives';

export function CareerHeaderForm({
  block,
  update,
}: {
  block: Block<'careerHeader'>;
  update: (patch: Partial<CareerHeaderData>) => void;
}) {
  const d = block.data;
  return (
    <div className="field-group">
      <Field label="회사">
        <TextInput value={d.company} onChange={(v) => update({ company: v })} />
      </Field>
      <Field label="역할">
        <TextInput value={d.role} onChange={(v) => update({ role: v })} />
      </Field>
      <Field label="기간">
        <TextInput
          value={d.period}
          onChange={(v) => update({ period: v })}
          placeholder="2024.01 — 현재"
          mono
        />
      </Field>
      <Field label="회사 요약 (선택)" hint={RT_HINT}>
        <TextArea rows={3} value={d.summary} onChange={(v) => update({ summary: v })} />
      </Field>
    </div>
  );
}
