import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useActions, useCurrentResume } from '../store/store';
import { deserializeResumeExport, serializeResume, type ResumeExportV1 } from './exportFormat';
import { buildShareUrl, encodeShareData } from './shareCodec';
import { copyText, readText } from './clipboard';

const URL_WARN_BYTES = 8 * 1024; // 8KB — see plan

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

export function ShareMenu() {
  const resume = useCurrentResume();
  const { importResume } = useActions();
  const [open, setOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  if (!resume) return null;

  const flashToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  };

  const handleCopyJson = async () => {
    const payload = serializeResume(resume);
    const text = JSON.stringify(payload, null, 2);
    const ok = await copyText(text);
    flashToast(ok ? 'JSON 복사됨' : '클립보드 복사 실패');
    setOpen(false);
  };

  const handleMakeShareLink = async () => {
    const payload = serializeResume(resume);
    const token = encodeShareData(payload);
    const url = buildShareUrl(token);
    const sizeBytes = new Blob([url]).size;
    if (sizeBytes > URL_WARN_BYTES) {
      const kb = (sizeBytes / 1024).toFixed(1);
      const ok = confirm(
        `공유 URL이 ${kb} KB로 매우 깁니다.\n` +
          `메신저나 일부 브라우저에서 잘릴 수 있어요.\n\n` +
          `그래도 복사할까요?`,
      );
      if (!ok) {
        setOpen(false);
        return;
      }
    }
    const copied = await copyText(url);
    flashToast(copied ? '공유 링크가 복사됐어요' : '복사 실패 — URL을 직접 선택해 주세요');
    setOpen(false);
  };

  const handleOpenPaste = () => {
    setPasteOpen(true);
    setOpen(false);
  };

  return (
    <>
      <ClickAway onClose={() => setOpen(false)}>
        <button className="btn" onClick={() => setOpen((v) => !v)}>
          공유 ▾
        </button>
        {open && (
          <div className="menu right" style={{ minWidth: 220 }}>
            <div className="menu-header">공유 / 가져오기</div>
            <div className="menu-item" onClick={handleCopyJson}>
              JSON 복사
            </div>
            <div className="menu-item" onClick={handleOpenPaste}>
              JSON 붙여넣기…
            </div>
            <div className="menu-sep" />
            <div className="menu-item" onClick={handleMakeShareLink}>
              공유 링크 만들기
            </div>
          </div>
        )}
      </ClickAway>
      {toast && <div className="share-toast">{toast}</div>}
      {pasteOpen && (
        <PasteJsonModal
          onClose={() => setPasteOpen(false)}
          onImport={(data) => {
            importResume(data);
            setPasteOpen(false);
            flashToast('새 이력서로 가져왔어요');
          }}
        />
      )}
    </>
  );
}

function PasteJsonModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (data: ResumeExportV1) => void;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ResumeExportV1 | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const validate = (raw: string) => {
    if (!raw.trim()) {
      setError(null);
      setPreview(null);
      return;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setError('JSON 형식이 올바르지 않습니다.');
      setPreview(null);
      return;
    }
    const result = deserializeResumeExport(parsed);
    if (!result.ok) {
      setError(result.error);
      setPreview(null);
      return;
    }
    setError(null);
    setPreview(result.data);
  };

  useEffect(() => {
    // 자동 붙여넣기 시도 — 권한 거부 시 사용자가 직접 paste.
    let cancelled = false;
    (async () => {
      const clipped = await readText();
      if (cancelled) return;
      if (clipped && clipped.trim().startsWith('{')) {
        setText(clipped);
        validate(clipped);
      } else {
        taRef.current?.focus();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (v: string) => {
    setText(v);
    validate(v);
  };

  const totalBlocks = preview?.pages.reduce((n, p) => n + p.blocks.length, 0) ?? 0;

  return (
    <div className="share-modal-backdrop" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal-header">JSON 붙여넣기</div>
        <div className="share-modal-body">
          <div className="share-modal-hint">
            다른 곳에서 복사한 이력서 JSON을 붙여넣으면 새 이력서로 추가됩니다.
          </div>
          <textarea
            ref={taRef}
            className="share-modal-textarea"
            placeholder='{ "v": 1, "name": "...", "theme": "default", "pages": [...] }'
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            spellCheck={false}
          />
          {error && <div className="share-modal-error">{error}</div>}
          {preview && (
            <div className="share-modal-preview">
              가져올 이력서: <b>{preview.name}</b> · {preview.pages.length}페이지 · {totalBlocks}
              블록
            </div>
          )}
        </div>
        <div className="share-modal-actions">
          <button className="btn" onClick={onClose}>
            취소
          </button>
          <button
            className="btn btn-primary"
            disabled={!preview}
            onClick={() => preview && onImport(preview)}
          >
            가져오기
          </button>
        </div>
      </div>
    </div>
  );
}
