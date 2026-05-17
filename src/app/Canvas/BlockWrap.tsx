import { useState, type ReactNode, type RefCallback } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  useActions,
  useIsBlockSelected,
  useSelectionAnchorId,
  useSelectionCount,
} from '../../store/store';
import { getBlock } from '../../blocks';

export function BlockWrap({
  blockId,
  blockType,
  hostRef,
  canUp,
  canDown,
  children,
}: {
  blockId: string;
  blockType: string;
  hostRef: RefCallback<HTMLDivElement>;
  canUp: boolean;
  canDown: boolean;
  children: ReactNode;
}) {
  const selected = useIsBlockSelected(blockId);
  const anchorId = useSelectionAnchorId();
  const selectionCount = useSelectionCount();
  const isAnchor = anchorId === blockId;
  const isMulti = selectionCount > 1;
  const [hover, setHover] = useState(false);
  const {
    selectBlock,
    toggleBlockSelection,
    selectBlockRange,
    moveBlockBy,
    moveBlocksBy,
    removeBlock,
    removeSelectedBlocks,
  } = useActions();
  const def = getBlock(blockType);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `canvas-block:${blockId}`,
    data: { kind: 'block', blockId },
  });

  const handleMove = (delta: -1 | 1) => {
    if (isMulti) moveBlocksBy(delta);
    else moveBlockBy(blockId, delta);
  };

  const handleRef = (el: HTMLDivElement | null) => {
    setNodeRef(el);
    hostRef(el);
  };

  return (
    <div
      ref={handleRef}
      className={
        'bb-wrap' +
        (selected ? ' is-selected' : '') +
        (hover ? ' is-hover' : '') +
        (isDragging ? ' is-dragging' : '')
      }
      data-block-id={blockId}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        if (e.shiftKey) selectBlockRange(blockId);
        else if (e.metaKey || e.ctrlKey) toggleBlockSelection(blockId);
        else selectBlock(blockId);
      }}
      {...listeners}
      {...attributes}
    >
      <div className="bb-label" data-print="hide">
        {def?.label ?? blockType}
        {isMulti && isAnchor ? ` · ${selectionCount}개 선택됨` : ''}
      </div>
      {(!isMulti || isAnchor) && (
        <div className="bb-actions" data-print="hide" onClick={(e) => e.stopPropagation()}>
          <button
            className="bb-action"
            title={isMulti ? '선택 블록 위로' : '위로'}
            disabled={!canUp}
            onClick={() => handleMove(-1)}
          >
            ↑
          </button>
          <button
            className="bb-action"
            title={isMulti ? '선택 블록 아래로' : '아래로'}
            disabled={!canDown}
            onClick={() => handleMove(1)}
          >
            ↓
          </button>
          <button
            className="bb-action bb-action-danger"
            title={isMulti ? `선택된 ${selectionCount}개 삭제` : '삭제'}
            onClick={() => {
              if (isMulti) removeSelectedBlocks();
              else removeBlock(blockId);
            }}
          >
            ×
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
