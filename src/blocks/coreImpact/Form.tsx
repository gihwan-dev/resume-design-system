import type { Block } from '../types';
import type { CoreImpactData } from './types';
import { Field, IconBtn, RT_HINT, TextArea } from '../../app/Inspector/primitives';

export function CoreImpactForm({
  block,
  update,
}: {
  block: Block<'coreImpact'>;
  update: (patch: Partial<CoreImpactData>) => void;
}) {
  const items = block.data.items ?? [];
  const setItem = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    update({ items: next });
  };
  const removeItem = (i: number) => {
    const next = [...items];
    next.splice(i, 1);
    update({ items: next });
  };
  const moveItem = (i: number, dir: -1 | 1) => {
    const next = [...items];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    update({ items: next });
  };
  return (
    <div className="field-group">
      {items.map((it, i) => (
        <div key={i} className="sub-card">
          <div className="sub-card-head">
            <div className="sub-card-title">Item {String(i + 1).padStart(2, '0')}</div>
            <div style={{ display: 'flex', gap: 2 }}>
              <IconBtn title="위로" onClick={() => moveItem(i, -1)} disabled={i === 0}>
                ↑
              </IconBtn>
              <IconBtn
                title="아래로"
                onClick={() => moveItem(i, 1)}
                disabled={i === items.length - 1}
              >
                ↓
              </IconBtn>
              <IconBtn title="삭제" onClick={() => removeItem(i)} danger>
                ×
              </IconBtn>
            </div>
          </div>
          <Field hint={RT_HINT}>
            <TextArea rows={2} value={it} onChange={(v) => setItem(i, v)} />
          </Field>
        </div>
      ))}
      <button
        type="button"
        className="btn"
        onClick={() => update({ items: [...items, '새 핵심 성과'] })}
      >
        + 항목 추가
      </button>
    </div>
  );
}
