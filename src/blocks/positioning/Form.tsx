import type { Block } from '../types';
import type { PositioningData } from './types';
import { Field, RT_HINT, TextArea } from '../../app/Inspector/primitives';

export function PositioningForm({
  block,
  update,
}: {
  block: Block<'positioning'>;
  update: (patch: Partial<PositioningData>) => void;
}) {
  return (
    <div className="field-group">
      <Field label="포지셔닝 단락" hint={RT_HINT}>
        <TextArea rows={6} value={block.data.text} onChange={(v) => update({ text: v })} />
      </Field>
    </div>
  );
}
