import { useLayoutEffect, useRef, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Page } from '../../store/types';
import { useActions, useSelectionAnchorId, useSelectionMoveCaps } from '../../store/store';
import { getBlock } from '../../blocks';
import { BlockWrap } from './BlockWrap';

export function CanvasPage({
  page,
  pageIndex,
  total,
  onMeasure,
  hasNextPage,
  hasPrevPage,
}: {
  page: Page;
  pageIndex: number;
  total: number;
  onMeasure: (pageId: string, overflowIds: string[]) => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}) {
  const { addPage, removePage, movePage } = useActions();
  const anchorId = useSelectionAnchorId();
  const selectionCaps = useSelectionMoveCaps();
  const pageRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const blockRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [overflowY, setOverflowY] = useState<number | null>(null);

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: `page:${page.id}`,
    data: { kind: 'page', pageId: page.id },
  });

  useLayoutEffect(() => {
    const measure = () => {
      const pageEl = pageRef.current;
      if (!pageEl) return;
      const cs = getComputedStyle(pageEl);
      const padBottom = parseFloat(cs.paddingBottom) || 0;
      const pageHeight = pageEl.offsetHeight;
      const limit = pageHeight - padBottom;
      const overflowIds: string[] = [];
      let firstOverflowY: number | null = null;
      Object.entries(blockRefs.current).forEach(([id, el]) => {
        if (!el) return;
        const top = el.offsetTop;
        const bot = top + el.offsetHeight;
        if (bot > limit) {
          overflowIds.push(id);
          if (firstOverflowY == null || top < firstOverflowY) firstOverflowY = top;
        }
      });
      setOverflowY(overflowIds.length ? Math.max(firstOverflowY ?? 0, limit) : null);
      onMeasure(page.id, overflowIds);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (pageRef.current) ro.observe(pageRef.current);
    if (innerRef.current) ro.observe(innerRef.current);
    const t = setTimeout(measure, 300);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [page.blocks, page.id, onMeasure]);

  // Make the page element both the DnD target and the measured element.
  const setPageRef = (el: HTMLDivElement | null) => {
    pageRef.current = el;
    setDroppableRef(el);
  };

  const hasOverflow = overflowY != null;

  return (
    <div
      className={'canvas-page' + (hasOverflow ? ' is-overflow' : '')}
      style={{ position: 'relative' }}
    >
      <div className="canvas-page-tag" data-print="hide">
        Page {String(pageIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
      {hasOverflow && (
        <div className="canvas-overflow-banner" data-print="hide">
          <span className="dot" />
          A4 초과 — PDF에서 잘립니다
        </div>
      )}
      <div className="canvas-page-actions" data-print="hide">
        <button
          className="btn btn-ghost btn-icon"
          title="페이지 위로"
          disabled={pageIndex === 0}
          onClick={() => movePage(page.id, pageIndex - 1)}
        >
          ↑
        </button>
        <button
          className="btn btn-ghost btn-icon"
          title="페이지 아래로"
          disabled={pageIndex === total - 1}
          onClick={() => movePage(page.id, pageIndex + 1)}
        >
          ↓
        </button>
        <button
          className="btn btn-ghost btn-icon"
          title="페이지 추가"
          onClick={() => addPage(page.id)}
        >
          +
        </button>
        <button
          className="btn btn-ghost btn-icon btn-danger"
          title="페이지 삭제"
          disabled={total <= 1}
          onClick={() => {
            if (confirm('이 페이지를 삭제할까요?')) removePage(page.id);
          }}
        >
          ×
        </button>
      </div>

      <article
        ref={setPageRef}
        className={'rs-page rs-density-compact' + (isOver ? ' is-drop-target' : '')}
        data-screen-label={'Page ' + String(pageIndex + 1).padStart(2, '0')}
      >
        <div ref={innerRef}>
          {page.blocks.length === 0 ? (
            <div
              style={{
                padding: '40px 0',
                textAlign: 'center',
                color: 'var(--text-faint)',
                fontSize: 13,
              }}
              data-print="hide"
            >
              컴포넌트를 드래그해서 이 페이지에 추가하세요.
            </div>
          ) : (
            page.blocks.map((block, idx) => {
              const def = getBlock(block.type);
              if (!def) return null;
              const Render = def.Render;
              const isFirstOnPage = idx === 0;
              const isLastOnPage = idx === page.blocks.length - 1;
              // When multiple blocks are selected, the move buttons render only
              // on the anchor block and act on the whole group — so use the
              // group-wide caps there instead of this block's local position.
              const useGroupCaps = selectionCaps != null && anchorId === block.id;
              const canUp = useGroupCaps ? selectionCaps.canUp : !isFirstOnPage || hasPrevPage;
              const canDown = useGroupCaps ? selectionCaps.canDown : !isLastOnPage || hasNextPage;
              return (
                <BlockWrap
                  key={block.id}
                  blockId={block.id}
                  blockType={block.type}
                  canUp={canUp}
                  canDown={canDown}
                  hostRef={(el) => {
                    blockRefs.current[block.id] = el;
                  }}
                >
                  <Render data={block.data} />
                </BlockWrap>
              );
            })
          )}
        </div>

        {hasOverflow && (
          <div className="canvas-overflow" data-print="hide" style={{ top: overflowY ?? 0 }}>
            <div className="co-label">A4 경계 — 새 페이지로 분할하세요</div>
          </div>
        )}
      </article>
    </div>
  );
}
