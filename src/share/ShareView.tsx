import { useEffect, useMemo } from 'react';
import { decodeShareData } from './shareCodec';
import { ReadOnlyCanvas } from './ReadOnlyCanvas';
import { ThemeProvider } from '../theme/ThemeProvider';
import type { ThemeName } from '../theme/themes';
import '../blocks';

/**
 * Standalone read-only viewer rendered when the URL hash is `#/share?d=...`.
 * Mounted from main.tsx in place of <App />, so the regular bootstrap
 * (useBootstrap → IndexedDB autosave) never runs and the viewer's own data
 * cannot pollute the recipient's local workspace.
 */
export function ShareView({ token }: { token: string }) {
  useEffect(() => {
    const previousMode = document.body.dataset.mode;
    document.body.dataset.mode = 'share';
    return () => {
      if (previousMode === undefined) delete document.body.dataset.mode;
      else document.body.dataset.mode = previousMode;
    };
  }, []);

  const data = useMemo(() => decodeShareData(token), [token]);

  if (!data) {
    return (
      <ThemeProvider themeName="default">
        <div className="share-error">
          <div className="share-error-card">
            <h2>공유 데이터를 읽을 수 없어요</h2>
            <p>
              링크가 메신저에서 잘렸거나, 일부 문자가 손상됐을 수 있어요. 보낸 사람에게
              다시 받아주세요.
            </p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  const themeName: ThemeName = data.theme;
  return (
    <ThemeProvider themeName={themeName}>
      <div className="app" data-preview="true" data-mode="share">
        <div className="app-body share-body">
          <ReadOnlyCanvas pages={data.pages} />
        </div>
      </div>
    </ThemeProvider>
  );
}
