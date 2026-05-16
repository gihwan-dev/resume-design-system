import type { Block } from '../types';
import type { CareerProjectData } from './types';
import { Field, TextInput } from '../../app/Inspector/primitives';

export function CareerProjectForm({
  block,
  update,
}: {
  block: Block<'careerProject'>;
  update: (patch: Partial<CareerProjectData>) => void;
}) {
  const d = block.data;
  return (
    <div className="field-group">
      <Field label="제목">
        <TextInput value={d.title} onChange={(v) => update({ title: v })} />
      </Field>
      <Field label="기간">
        <TextInput
          value={d.period}
          onChange={(v) => update({ period: v })}
          placeholder="2024.06 — 현재"
          mono
        />
      </Field>
      <Field label="스택" hint="쉼표(,)로 구분하면 · 로 표시돼요">
        <TextInput
          value={d.stack}
          onChange={(v) => update({ stack: v })}
          placeholder="React, TypeScript, Vite"
          mono
        />
      </Field>
    </div>
  );
}
