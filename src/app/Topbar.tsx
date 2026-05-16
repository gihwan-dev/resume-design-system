import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useActions, useCurrentResume, useStore } from '../store/store';
import { printResume } from '../pdf/printResume';
import { SaveIndicator } from './SaveIndicator';

function ClickAway({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  return (
    <div ref={ref} className="menu-anchor">
      {children}
    </div>
  );
}

function ResumePicker() {
  const resumesById = useStore((s) => s.resumes);
  const resumes = Object.values(resumesById);
  const currentResumeId = useStore((s) => s.currentResumeId);
  const { selectResume, createResume, duplicateResume, renameResume, deleteResume } = useActions();
  const resume = resumes.find((r) => r.id === currentResumeId);
  const [open, setOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState('');

  if (!resume) return null;
  const sorted = [...resumes].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      <ClickAway onClose={() => setOpen(false)}>
        <button className="resume-picker" onClick={() => setOpen((v) => !v)}>
          <span className="name">{resume.name}</span>
          <span className="caret">▾</span>
        </button>
        {open && (
          <div className="menu" style={{ minWidth: 280 }}>
            <div className="menu-header">이력서</div>
            {sorted.map((r) => (
              <div
                key={r.id}
                className={'menu-item' + (r.id === currentResumeId ? ' is-current' : '')}
                onClick={() => {
                  selectResume(r.id);
                  setOpen(false);
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {r.name}
                </span>
                <span className="meta">
                  {r.pages.length}p · {new Date(r.updatedAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            ))}
            <div className="menu-sep" />
            <div
              className="menu-item"
              onClick={() => {
                createResume({ name: '새 이력서', empty: false });
                setOpen(false);
              }}
            >
              + 새 이력서 만들기
            </div>
            <div
              className="menu-item"
              onClick={() => {
                createResume({ name: '빈 이력서', empty: true });
                setOpen(false);
              }}
            >
              + 빈 이력서로 시작
            </div>
            <div
              className="menu-item"
              onClick={() => {
                duplicateResume(currentResumeId);
                setOpen(false);
              }}
            >
              현재 이력서 복제
            </div>
            <div className="menu-sep" />
            <div
              className="menu-item"
              onClick={() => {
                setDraftName(resume.name);
                setRenaming(true);
                setOpen(false);
              }}
            >
              이름 변경…
            </div>
            <div
              className="menu-item"
              style={{ color: 'var(--chrome-danger)' }}
              onClick={() => {
                if (confirm(`"${resume.name}" 이력서를 삭제할까요? (스냅샷까지 모두 삭제)`)) {
                  deleteResume(currentResumeId);
                  setOpen(false);
                }
              }}
            >
              현재 이력서 삭제
            </div>
          </div>
        )}
      </ClickAway>
      {renaming && (
        <div
          className="menu"
          style={{ minWidth: 240, top: 'auto', position: 'fixed', left: 16, marginTop: 4 }}
        >
          <div className="menu-header">이름 변경</div>
          <div style={{ padding: 6 }}>
            <input
              autoFocus
              className="field-input"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  renameResume(currentResumeId, draftName.trim() || resume.name);
                  setRenaming(false);
                } else if (e.key === 'Escape') {
                  setRenaming(false);
                }
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 4, padding: '0 6px 6px 6px' }}>
            <button
              className="btn btn-primary"
              onClick={() => {
                renameResume(currentResumeId, draftName.trim() || resume.name);
                setRenaming(false);
              }}
            >
              저장
            </button>
            <button className="btn" onClick={() => setRenaming(false)}>
              취소
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function SnapshotsButton() {
  const resume = useCurrentResume();
  const { snapshotCreate, snapshotRestore, snapshotDelete } = useActions();
  const [open, setOpen] = useState(false);
  if (!resume) return null;
  return (
    <ClickAway onClose={() => setOpen(false)}>
      <button className="btn" onClick={() => setOpen((v) => !v)}>
        스냅샷 · {resume.snapshots.length}
      </button>
      {open && (
        <div className="menu right" style={{ minWidth: 320 }}>
          <div className="menu-header">스냅샷</div>
          <div
            className="menu-item"
            onClick={() => {
              snapshotCreate();
              setOpen(false);
            }}
          >
            + 현재 상태로 스냅샷 만들기
          </div>
          <div className="menu-sep" />
          {resume.snapshots.length === 0 ? (
            <div className="empty-state">아직 스냅샷이 없어요</div>
          ) : (
            <div className="snap-list">
              {resume.snapshots.map((s) => (
                <div key={s.id} className="snap-row">
                  <div style={{ flex: 1 }}>
                    <div>{s.name}</div>
                    <div className="meta">{new Date(s.createdAt).toLocaleString('ko-KR')}</div>
                  </div>
                  <div className="snap-actions">
                    <button
                      className="btn"
                      onClick={() => {
                        if (confirm('이 스냅샷으로 복원할까요? 현재 상태는 자동 저장됩니다.')) {
                          snapshotRestore(s.id);
                          setOpen(false);
                        }
                      }}
                    >
                      복원
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        if (confirm('이 스냅샷을 삭제할까요?')) snapshotDelete(s.id);
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ClickAway>
  );
}

export function Topbar({
  preview,
  setPreview,
}: {
  preview: boolean;
  setPreview: (v: boolean) => void;
}) {
  return (
    <div className="topbar app-chrome" data-print="hide">
      <div className="topbar-section">
        <div className="topbar-brand">RESUME DS</div>
        <ResumePicker />
        <SaveIndicator />
      </div>
      <div className="topbar-section">
        <SnapshotsButton />
        <button className="btn" onClick={() => setPreview(!preview)}>
          {preview ? 'Preview ON' : 'Preview'}
        </button>
        <button className="btn btn-primary" onClick={() => printResume()}>
          Export PDF
        </button>
      </div>
    </div>
  );
}
