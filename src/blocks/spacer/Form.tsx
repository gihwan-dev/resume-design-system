import type { Block } from '../types';
import type { SpacerData } from './types';
import { Field, NumberInput } from '../../app/Inspector/primitives';

export function SpacerForm({
  block,
  update,
}: {
  block: Block<'spacer'>;
  update: (patch: Partial<SpacerData>) => void;
}) {
  return (
    <div className="field-group">
      <Field label="높이 (px)" hint="4 — 120">
        <NumberInput
          value={block.data.height}
          min={4}
          max={120}
          step={2}
          onChange={(n) => update({ height: n })}
        />
      </Field>
    </div>
  );
}
