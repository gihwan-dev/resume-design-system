import type { Block } from '../types';
import type { SectionHeaderData } from './types';
import { Field, SelectInput, TextInput } from '../../app/Inspector/primitives';

export function SectionHeaderForm({
  block,
  update,
}: {
  block: Block<'sectionHeader'>;
  update: (patch: Partial<SectionHeaderData>) => void;
}) {
  const d = block.data;
  return (
    <div className="field-group">
      <Field label="제목">
        <TextInput value={d.title} onChange={(v) => update({ title: v })} />
      </Field>
      <Field label="우측 메타">
        <TextInput
          value={d.meta}
          onChange={(v) => update({ meta: v })}
          placeholder="optional"
          mono
        />
      </Field>
      <Field label="강조">
        <SelectInput<'primary' | 'secondary'>
          value={d.variant ?? 'primary'}
          options={[
            { value: 'primary', label: 'Primary (굵은 상단선)' },
            { value: 'secondary', label: 'Secondary (얇은 상단선)' },
          ]}
          onChange={(v) => update({ variant: v })}
        />
      </Field>
    </div>
  );
}
