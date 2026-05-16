import { useState, type ReactNode, type RefCallback } from 'react';
import { useStore, useActions } from '../../store/store';
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
  const selected = useStore((s) => s.selectedBlockId === blockId);
  const [hover, setHover] = useState(false);
  const { selectBlock, moveBlockBy } = useActions();
  const def = getBlock(blockType);
  return (
    <div
      ref={hostRef}
      className={'bb-wrap' + (selected ? ' is-selected' : '') + (hover ? ' is-hover' : '')}
      data-block-id={blockId}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={(e) => {
        e.stopPropagation();
        selectBlock(blockId);
      }}
    >
      <div className="bb-label" data-print="hide">
        {def?.label ?? blockType}
      </div>
      <div className="bb-actions" data-print="hide" onClick={(e) => e.stopPropagation()}>
        <button
          className="bb-action"
          title="위로"
          disabled={!canUp}
          onClick={() => moveBlockBy(blockId, -1)}
        >
          ↑
        </button>
        <button
          className="bb-action"
          title="아래로"
          disabled={!canDown}
          onClick={() => moveBlockBy(blockId, 1)}
        >
          ↓
        </button>
      </div>
      {children}
    </div>
  );
}
