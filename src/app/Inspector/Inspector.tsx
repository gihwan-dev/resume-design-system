import { useActions, useCurrentResume, useSelectedBlock, useStore } from '../../store/store';
import { getBlock } from '../../blocks';
import { THEMES, type ThemeName } from '../../theme/themes';

export function Inspector() {
  const sel = useSelectedBlock();
  const resume = useCurrentResume();
  const { updateBlock, removeBlock, duplicateBlock, setResumeTheme } = useActions();
  const currentResumeId = useStore((s) => s.currentResumeId);

  if (!sel) {
    return (
      <div>
        <div className="panel-section-title">이력서 설정</div>
        <div className="field-group">
          <div className="field">
            <label className="field-label">테마</label>
            <select
              className="field-input"
              value={resume?.theme ?? 'default'}
              onChange={(e) => setResumeTheme(currentResumeId, e.target.value as ThemeName)}
            >
              {Object.keys(THEMES).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <div className="field-hint">테마 토큰은 색 · 폰트 · 간격을 한 번에 바꿉니다.</div>
          </div>
        </div>
        <div className="empty-state" style={{ marginTop: 24 }}>
          캔버스에서 블록을 클릭하면
          <br />
          여기서 편집할 수 있어요.
        </div>
      </div>
    );
  }

  const def = getBlock(sel.block.type);
  if (!def) return null;
  const Form = def.Form;

  return (
    <div>
      <div className="panel-section-title">
        <span style={{ color: 'var(--text-primary)' }}>{def.label}</span>
        <span style={{ marginLeft: 6 }}>blocks</span>
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <button className="btn" onClick={() => duplicateBlock(sel.block.id)} title="블록 복제">
          복제
        </button>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm('이 블록을 삭제할까요?')) removeBlock(sel.block.id);
          }}
        >
          삭제
        </button>
      </div>
      <Form
        block={sel.block}
        update={(patch) => updateBlock(sel.block.id, patch as Record<string, unknown>)}
      />
    </div>
  );
}
