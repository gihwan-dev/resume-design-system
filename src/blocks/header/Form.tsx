import { useState } from 'react';
import type { Block } from '../types';
import type { HeaderData } from './types';
import { Field, TextArea, TextInput } from '../../app/Inspector/primitives';

export function HeaderForm({
  block,
  update,
}: {
  block: Block<'header'>;
  update: (patch: Partial<HeaderData>) => void;
}) {
  const d = block.data;
  const [draft, setDraft] = useState('');

  const addContact = () => {
    if (!draft.trim()) return;
    update({ contacts: [...(d.contacts ?? []), draft.trim()] });
    setDraft('');
  };
  const removeContact = (i: number) => {
    const next = [...(d.contacts ?? [])];
    next.splice(i, 1);
    update({ contacts: next });
  };

  return (
    <div className="field-group">
      <Field label="이름">
        <TextInput value={d.name} onChange={(v) => update({ name: v })} />
      </Field>
      <Field label="역할">
        <TextInput
          value={d.role}
          onChange={(v) => update({ role: v })}
          placeholder="Frontend Engineer"
        />
      </Field>
      <Field label="포지셔닝 한 줄">
        <TextArea rows={2} value={d.tagline} onChange={(v) => update({ tagline: v })} />
      </Field>
      <Field
        label="연락처 · 링크"
        hint="이메일, 전화번호, 홈페이지/GitHub 같은 URL을 한 줄씩 추가하세요. 자동으로 알맞은 아이콘과 링크가 붙습니다."
      >
        <div className="tag-list">
          {(d.contacts ?? []).map((c, i) => (
            <span key={i} className="tag">
              {c}
              <span className="x" onClick={() => removeContact(i)} title="제거">
                ×
              </span>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <TextInput
            value={draft}
            onChange={setDraft}
            placeholder="email · +82 10 0000 0000 · github.com/handle"
            mono
          />
          <button type="button" className="btn" onClick={addContact}>
            추가
          </button>
        </div>
      </Field>
    </div>
  );
}
