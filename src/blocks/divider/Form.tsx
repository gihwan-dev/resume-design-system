import type { Block } from '../types';
import type { DividerData } from './types';
import { Field, SelectInput } from '../../app/Inspector/primitives';

export function DividerForm({
  block,
  update,
}: {
  block: Block<'divider'>;
  update: (patch: Partial<DividerData>) => void;
}) {
  return (
    <div className="field-group">
      <Field label="강조">
        <SelectInput<'subtle' | 'strong'>
          value={block.data.variant ?? 'subtle'}
          options={[
            { value: 'subtle', label: 'Subtle (얇은 회색)' },
            { value: 'strong', label: 'Strong (검정)' },
          ]}
          onChange={(v) => update({ variant: v })}
        />
      </Field>
    </div>
  );
}
