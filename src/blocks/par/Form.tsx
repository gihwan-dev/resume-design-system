import type { Block } from '../types';
import type { ParData } from './types';
import { Field, RT_HINT, TextArea, TextInput } from '../../app/Inspector/primitives';

export function ParForm({
  block,
  update,
}: {
  block: Block<'par'>;
  update: (patch: Partial<ParData>) => void;
}) {
  const d = block.data;
  return (
    <div className="field-group">
      <Field label="라벨 (선택)" hint="여러 PAR를 구분하고 싶을 때만">
        <TextInput value={d.label} onChange={(v) => update({ label: v })} />
      </Field>
      <Field label="PROBLEM" hint={RT_HINT}>
        <TextArea rows={3} value={d.problem} onChange={(v) => update({ problem: v })} />
      </Field>
      <Field label="ACTION" hint={RT_HINT}>
        <TextArea rows={3} value={d.action} onChange={(v) => update({ action: v })} />
      </Field>
      <Field label="RESULT" hint={RT_HINT}>
        <TextArea rows={3} value={d.result} onChange={(v) => update({ result: v })} />
      </Field>
      <Field label="LEARNING (선택)" hint={RT_HINT}>
        <TextArea rows={2} value={d.learning} onChange={(v) => update({ learning: v })} />
      </Field>
    </div>
  );
}
