import type { Block } from '../types';
import type { LearningNoteData } from './types';
import { Field, RT_HINT, SelectInput, TextArea, TextInput } from '../../app/Inspector/primitives';

export function LearningNoteForm({
  block,
  update,
}: {
  block: Block<'learningNote'>;
  update: (patch: Partial<LearningNoteData>) => void;
}) {
  const d = block.data;
  return (
    <div className="field-group">
      <Field label="라벨">
        <TextInput value={d.label} onChange={(v) => update({ label: v })} mono />
      </Field>
      <Field label="본문" hint={RT_HINT}>
        <TextArea rows={4} value={d.text} onChange={(v) => update({ text: v })} />
      </Field>
      <Field label="강조">
        <SelectInput<'default' | 'minimal'>
          value={d.variant ?? 'default'}
          options={[
            { value: 'default', label: 'Default (굵은 좌측 라인)' },
            { value: 'minimal', label: 'Minimal (얇은 좌측 라인)' },
          ]}
          onChange={(v) => update({ variant: v })}
        />
      </Field>
    </div>
  );
}
