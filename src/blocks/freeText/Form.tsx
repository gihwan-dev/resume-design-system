import type { Block } from '../types';
import type { FreeTextData } from './types';
import { Field, RT_HINT, TextArea } from '../../app/Inspector/primitives';

export function FreeTextForm({
  block,
  update,
}: {
  block: Block<'freeText'>;
  update: (patch: Partial<FreeTextData>) => void;
}) {
  return (
    <div className="field-group">
      <Field label="자유 단락" hint={RT_HINT}>
        <TextArea rows={6} value={block.data.text} onChange={(v) => update({ text: v })} />
      </Field>
    </div>
  );
}
