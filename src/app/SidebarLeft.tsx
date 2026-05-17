import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { getBlock, listBlockTypes, shortLabelFor } from '../blocks';
import {
  useActions,
  useCurrentResume,
  useIsBlockSelected,
  useSelectionAnchorId,
  useSelectionCount,
  useSelectionMoveCaps,
} from '../store/store';

function PaletteItem({ type }: { type: string }) {
  const def = getBlock(type);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { kind: 'palette', blockType: type },
  });
  if (!def) return null;
  return (
    <div
      ref={setNodeRef}
      className="palette-item"
      style={{ opacity: isDragging ? 0.4 : 1 }}
      {...listeners}
      {...attributes}
    >
      <div className="pi-icon">{def.icon}</div>
      <div className="pi-body">
        <div className="pi-name">{def.label}</div>
        <div className="pi-hint">{def.hint}</div>
      </div>
    </div>
  );
}

function Palette() {
  return (
    <div className="palette">
      <div className="panel-section-title">컴포넌트 — 드래그해서 추가</div>
      {listBlockTypes().map((t) => (
        <PaletteItem key={t} type={t} />
      ))}
    </div>
  );
}

function OutlineRow({
  blockId,
  blockType,
  data,
  ord,
  canUp,
  canDown,
}: {
  blockId: string;
  blockType: string;
  data: unknown;
  ord: number;
  canUp: boolean;
  canDown: boolean;
}) {
  const selected = useIsBlockSelected(blockId);
  const anchorId = useSelectionAnchorId();
  const selectionCount = useSelectionCount();
  const selectionCaps = useSelectionMoveCaps();
  const isAnchor = anchorId === blockId;
  const isMulti = selectionCount > 1;
  const showMoveButtons = !isMulti || isAnchor;
  const effectiveCanUp = isMulti && isAnchor && selectionCaps ? selectionCaps.canUp : canUp;
  const effectiveCanDown =
    isMulti && isAnchor && selectionCaps ? selectionCaps.canDown : canDown;
  const {
    selectBlock,
    toggleBlockSelection,
    selectBlockRange,
    removeBlock,
    duplicateBlock,
    moveBlockBy,
    moveBlocksBy,
  } = useActions();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `block:${blockId}`,
    data: { kind: 'block', blockId },
  });
  const handleMove = (delta: -1 | 1) => {
    if (isMulti) moveBlocksBy(delta);
    else moveBlockBy(blockId, delta);
  };
  return (
    <div
      ref={setNodeRef}
      className={'outline-row' + (selected ? ' is-selected' : '')}
      style={{ opacity: isDragging ? 0.4 : 1 }}
      onClick={(e) => {
        if (e.shiftKey) selectBlockRange(blockId);
        else if (e.metaKey || e.ctrlKey) toggleBlockSelection(blockId);
        else selectBlock(blockId);
      }}
      {...listeners}
      {...attributes}
    >
      <span className="ord">{String(ord + 1).padStart(2, '0')}</span>
      <span className="label">{shortLabelFor(blockType, data)}</span>
      {showMoveButtons && (
        <>
          <button
            className="icon-btn"
            title={isMulti ? '선택 블록 위로' : '위로'}
            disabled={!effectiveCanUp}
            onClick={(e) => {
              e.stopPropagation();
              handleMove(-1);
            }}
          >
            ↑
          </button>
          <button
            className="icon-btn"
            title={isMulti ? '선택 블록 아래로' : '아래로'}
            disabled={!effectiveCanDown}
            onClick={(e) => {
              e.stopPropagation();
              handleMove(1);
            }}
          >
            ↓
          </button>
        </>
      )}
      <button
        className="icon-btn"
        title="복제"
        onClick={(e) => {
          e.stopPropagation();
          duplicateBlock(blockId);
        }}
      >
        ⎘
      </button>
      <button
        className="icon-btn danger"
        title="삭제"
        onClick={(e) => {
          e.stopPropagation();
          if (confirm('이 블록을 삭제할까요?')) removeBlock(blockId);
        }}
      >
        ×
      </button>
    </div>
  );
}

function Outline() {
  const resume = useCurrentResume();
  if (!resume) return null;
  const totalPages = resume.pages.length;
  return (
    <div className="outline">
      {resume.pages.map((page, i) => (
        <div key={page.id} className="outline-page">
          <div className="outline-page-title">
            <span>Page {String(i + 1).padStart(2, '0')}</span>
            <span>{page.blocks.length} blocks</span>
          </div>
          {page.blocks.length === 0 ? (
            <div className="empty-state">비어있음</div>
          ) : (
            page.blocks.map((b, idx) => {
              const isFirstOnPage = idx === 0;
              const isLastOnPage = idx === page.blocks.length - 1;
              return (
                <OutlineRow
                  key={b.id}
                  blockId={b.id}
                  blockType={b.type}
                  data={b.data}
                  ord={idx}
                  canUp={!isFirstOnPage || i > 0}
                  canDown={!isLastOnPage || i < totalPages - 1}
                />
              );
            })
          )}
        </div>
      ))}
    </div>
  );
}

export function SidebarLeft() {
  const [tab, setTab] = useState<'palette' | 'outline'>('palette');
  return (
    <div className="panel panel-left" data-print="hide">
      <div className="panel-tabs">
        <div
          className={'panel-tab' + (tab === 'palette' ? ' is-active' : '')}
          onClick={() => setTab('palette')}
        >
          Components
        </div>
        <div
          className={'panel-tab' + (tab === 'outline' ? ' is-active' : '')}
          onClick={() => setTab('outline')}
        >
          Outline
        </div>
      </div>
      <div className="panel-body">{tab === 'palette' ? <Palette /> : <Outline />}</div>
    </div>
  );
}
