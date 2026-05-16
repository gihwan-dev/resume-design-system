import type { Block } from '../types';
import type { SkillsData } from './types';
import { Field, IconBtn, RT_HINT, TextInput } from '../../app/Inspector/primitives';

export function SkillsForm({
  block,
  update,
}: {
  block: Block<'skills'> | Block<'education'>;
  update: (patch: Partial<SkillsData>) => void;
}) {
  const rows = (block.data as SkillsData).rows ?? [];
  const setRow = (i: number, patch: Partial<SkillsData['rows'][number]>) =>
    update({ rows: rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const removeRow = (i: number) => update({ rows: rows.filter((_, j) => j !== i) });
  const moveRow = (i: number, dir: -1 | 1) => {
    const next = [...rows];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j]!, next[i]!];
    update({ rows: next });
  };
  return (
    <div className="field-group">
      {rows.map((row, i) => (
        <div key={i} className="sub-card">
          <div className="sub-card-head">
            <div className="sub-card-title">Row {String(i + 1).padStart(2, '0')}</div>
            <div style={{ display: 'flex', gap: 2 }}>
              <IconBtn title="위로" onClick={() => moveRow(i, -1)} disabled={i === 0}>
                ↑
              </IconBtn>
              <IconBtn
                title="아래로"
                onClick={() => moveRow(i, 1)}
                disabled={i === rows.length - 1}
              >
                ↓
              </IconBtn>
              <IconBtn title="삭제" onClick={() => removeRow(i)} danger>
                ×
              </IconBtn>
            </div>
          </div>
          <Field label="키">
            <TextInput value={row.key} onChange={(v) => setRow(i, { key: v })} mono />
          </Field>
          <Field label="값" hint={RT_HINT}>
            <TextInput value={row.val} onChange={(v) => setRow(i, { val: v })} mono />
          </Field>
        </div>
      ))}
      <button
        type="button"
        className="btn"
        onClick={() => update({ rows: [...rows, { key: '카테고리', val: '항목 · 항목' }] })}
      >
        + 행 추가
      </button>
    </div>
  );
}
