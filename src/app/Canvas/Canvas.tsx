import { useRef } from 'react';
import { useActions, useCurrentResume } from '../../store/store';
import { CanvasPage } from './CanvasPage';

export function Canvas() {
  const resume = useCurrentResume();
  const { addPage, selectBlock } = useActions();
  const overflowAcc = useRef<Record<string, string[]>>({});

  if (!resume) return null;

  const handleMeasure = (pageId: string, overflowIds: string[]) => {
    overflowAcc.current[pageId] = overflowIds;
  };

  return (
    <div className="canvas-wrap" onClick={() => selectBlock(null)}>
      <div className="canvas-inner">
        {resume.pages.map((page, i) => (
          <CanvasPage
            key={page.id}
            page={page}
            pageIndex={i}
            total={resume.pages.length}
            hasPrevPage={i > 0}
            hasNextPage={i < resume.pages.length - 1}
            onMeasure={handleMeasure}
          />
        ))}
        <button
          type="button"
          className="canvas-add-page"
          data-print="hide"
          onClick={() => addPage()}
        >
          + Add A4 Page
        </button>
      </div>
    </div>
  );
}
