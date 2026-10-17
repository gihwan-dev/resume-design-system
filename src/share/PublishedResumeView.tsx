import { useEffect, useState } from 'react';
import { Global, css } from '@emotion/react';
import { deserializeResumeExport, type ResumeExportV1 } from './exportFormat';
import { ReadOnlyCanvas } from './ReadOnlyCanvas';
import { ThemeProvider } from '../theme/ThemeProvider';
import '../blocks';

// A public document never mounts App/useBootstrap or writes to the editor's store.
export function PublishedResumeView() {
  const [data, setData] = useState<ResumeExportV1 | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/resumes/tossplace-platform.json', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Document unavailable');
        return response.json() as Promise<unknown>;
      })
      .then((raw) => {
        const parsed = deserializeResumeExport(raw);
        if (!parsed.ok) throw new Error(parsed.error);
        setData(parsed.data);
        document.title = '최기환 | Frontend Engineer';
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <ThemeProvider themeName={data?.theme ?? 'default'}>
      <Global styles={publishedStyles} />
      <main className="published-resume">
        <header className="published-nav" data-print="hide">
          <div>
            <strong>최기환</strong>
            <span>Platform용 첫 버전</span>
          </div>
          <a href="/resumes/tossplace-platform.pdf">PDF 보기</a>
        </header>
        {data ? (
          <ReadOnlyCanvas pages={data.pages} />
        ) : (
          <p role="status">
            {error
              ? '이력서를 불러오지 못했습니다. 잠시 후 다시 열어 주세요.'
              : '이력서를 불러오는 중입니다.'}
          </p>
        )}
      </main>
    </ThemeProvider>
  );
}

const publishedStyles = css`
  .published-resume {
    width: 100%;
    min-height: 100%;
    background: #f2f1ed;
  }
  .published-nav {
    max-width: 842px;
    margin: 0 auto;
    padding: 18px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    font-size: 14px;
  }
  .published-nav div {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: baseline;
  }
  .published-nav span {
    color: #54545b;
    font-size: 12px;
  }
  .published-nav a {
    color: #18306e;
    white-space: nowrap;
  }
  .published-resume .canvas-wrap {
    height: auto;
    overflow: visible;
  }
  .published-resume .canvas-inner {
    padding-bottom: 32px;
  }
  .published-resume .block-wrap + .block-wrap {
    margin-top: 10px;
  }
  @media screen and (max-width: 842px) {
    .published-nav {
      padding: 16px 22px;
    }
    .published-resume .canvas-wrap {
      padding: 0;
    }
    .published-resume .canvas-inner {
      width: 100%;
      min-width: 0;
      gap: 16px;
    }
    .published-resume .canvas-page {
      width: 100%;
      min-width: 0;
    }
    .published-resume .rs-page {
      width: 100%;
      height: auto;
      min-height: 0;
      padding: 28px 22px;
      box-shadow: none;
      overflow-wrap: anywhere;
    }
    .published-resume .rs-career-top {
      flex-wrap: wrap;
      gap: 6px;
    }
    .published-resume .rs-section-header {
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 6px 12px;
    }
    .published-resume .rs-section {
      flex-shrink: 0;
      white-space: nowrap;
    }
    .published-resume .rs-section-meta {
      max-width: 100%;
      white-space: normal;
    }
    .published-resume .rs-header-contacts {
      gap: 8px 12px;
    }
    .published-resume .rs-project-meta {
      white-space: normal;
    }
    .published-resume .rs-skills {
      grid-template-columns: minmax(74px, auto) minmax(0, 1fr);
    }
  }
  @media print {
    .published-resume {
      background: white;
    }
    .published-nav {
      display: none;
    }
  }
`;
