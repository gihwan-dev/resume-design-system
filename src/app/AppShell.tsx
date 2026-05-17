import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Topbar } from './Topbar';
import { SidebarLeft } from './SidebarLeft';
import { Canvas } from './Canvas/Canvas';
import { Inspector } from './Inspector/Inspector';
import { useActions, useCurrentResume, useStore } from '../store/store';
import { ThemeProvider } from '../theme/ThemeProvider';
import type { BlockType } from '../blocks';

export function AppShell() {
  const [preview, setPreview] = useState(false);
  const resume = useCurrentResume();
  const themeName = resume?.theme ?? 'default';
  const { addBlock, moveBlock, removeSelectedBlocks } = useActions();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && preview) setPreview(false);
      if (e.key === 'Backspace' || e.key === 'Delete') {
        const t = e.target as HTMLElement | null;
        const tag = t?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable) {
          return;
        }
        const ids = useStore.getState().selectedBlockIds;
        if (ids.length === 0) return;
        e.preventDefault();
        removeSelectedBlocks();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview, removeSelectedBlocks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = useMemo(
    () => (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over) return;
      const a = active.data.current as { kind: string; blockType?: string; blockId?: string };
      const o = over.data.current as { kind: string; pageId?: string; index?: number };
      if (!o.pageId) return;

      if (o.kind === 'slot') {
        if (a.kind === 'palette' && a.blockType) {
          addBlock({
            pageId: o.pageId,
            blockType: a.blockType as BlockType,
            index: o.index,
          });
        } else if (a.kind === 'block' && a.blockId) {
          moveBlock({ blockId: a.blockId, toPageId: o.pageId, toIndex: o.index });
        }
        return;
      }

      if (o.kind === 'page') {
        if (a.kind === 'palette' && a.blockType) {
          addBlock({ pageId: o.pageId, blockType: a.blockType as BlockType });
        } else if (a.kind === 'block' && a.blockId) {
          moveBlock({ blockId: a.blockId, toPageId: o.pageId });
        }
      }
    },
    [addBlock, moveBlock],
  );

  return (
    <ThemeProvider themeName={themeName}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="app" data-preview={preview ? 'true' : 'false'}>
          <Topbar preview={preview} setPreview={setPreview} />
          <div className="app-body">
            {!preview && <SidebarLeft />}
            <Canvas />
            {!preview && (
              <div className="panel panel-right" data-print="hide">
                <div className="panel-tabs">
                  <div className="panel-tab is-active">Inspector</div>
                </div>
                <div className="panel-body">
                  <Inspector />
                </div>
              </div>
            )}
          </div>
        </div>
      </DndContext>
    </ThemeProvider>
  );
}
