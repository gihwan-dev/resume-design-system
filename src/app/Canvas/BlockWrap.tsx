import { useState, type ReactNode, type RefCallback } from 'react';
import { useStore, useActions } from '../../store/store';
import { getBlock } from '../../blocks';

export function BlockWrap({
  blockId,
  blockType,
  hostRef,
  children,
}: {
  blockId: string;
  blockType: string;
  hostRef: RefCallback<HTMLDivElement>;
  children: ReactNode;
}) {
  const selected = useStore((s) => s.selectedBlockId === blockId);
  const [hover, setHover] = useState(false);
  const { selectBlock } = useActions();
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
      {children}
    </div>
  );
}
