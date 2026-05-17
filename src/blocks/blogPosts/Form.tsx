import type { Block } from '../types';
import type { BlogPostsData, BlogPostItem } from './types';
import { Field, IconBtn, TextInput } from '../../app/Inspector/primitives';

export function BlogPostsForm({
  block,
  update,
}: {
  block: Block<'blogPosts'>;
  update: (patch: Partial<BlogPostsData>) => void;
}) {
  const items = block.data.items ?? [];

  const setItem = (i: number, patch: Partial<BlogPostItem>) =>
    update({ items: items.map((it, j) => (j === i ? { ...it, ...patch } : it)) });
  const removeItem = (i: number) => update({ items: items.filter((_, j) => j !== i) });
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
            <div className="sub-card-title">Post {String(i + 1).padStart(2, '0')}</div>
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
          <Field label="URL">
            <TextInput value={it.href} onChange={(v) => setItem(i, { href: v })} mono />
          </Field>
          <Field label="제목">
            <TextInput
              value={it.title}
              onChange={(v) => setItem(i, { title: v })}
              placeholder="추상화란 무엇인가"
            />
          </Field>
          <Field label="설명" hint="어떤 글인지 한 줄 — 선택">
            <TextInput
              value={it.note}
              onChange={(v) => setItem(i, { note: v })}
              placeholder="설계 관점에서 본 추상화 정리"
            />
          </Field>
        </div>
      ))}
      <button
        type="button"
        className="btn"
        onClick={() => update({ items: [...items, { href: 'https://', title: '' }] })}
      >
        + 글 추가
      </button>
    </div>
  );
}
