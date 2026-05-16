import { useSaveStatus } from '../store/saveStatus';

function formatTime(ts: number): string {
  const d = new Date(ts);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function SaveIndicator() {
  const { status, lastSavedAt } = useSaveStatus();

  if (status === 'saving') {
    return (
      <div className="save-indicator is-saving" title="IndexedDB에 저장 중">
        <span className="dot" />
        저장 중…
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="save-indicator is-error" title="저장 실패 — 콘솔 확인">
        <span className="dot" />
        저장 실패
      </div>
    );
  }
  return (
    <div className="save-indicator is-saved" title="IndexedDB에 자동 저장됨">
      <span className="dot" />
      저장됨{lastSavedAt ? ` · ${formatTime(lastSavedAt)}` : ''}
    </div>
  );
}
