import type { Page } from '../store/types';
import { getBlock } from '../blocks';

/**
 * Pure presentational A4 page list. No store access, no DnD, no
 * inspectors. Reuses the editor's `.canvas-*` and `.rs-*` CSS so the
 * shared view matches the print/preview output exactly.
 */
export function ReadOnlyCanvas({ pages }: { pages: Page[] }) {
  return (
    <div className="canvas-wrap is-share">
      <div className="canvas-inner">
        {pages.map((page) => (
          <ReadOnlyPage key={page.id} page={page} />
        ))}
      </div>
    </div>
  );
}

function ReadOnlyPage({ page }: { page: Page }) {
  return (
    <div className="canvas-page">
      <article className="rs-page rs-density-compact">
        <div>
          {page.blocks.map((block) => {
            const def = getBlock(block.type);
            if (!def) return null;
            const Render = def.Render;
            return (
              <div className="block-wrap is-readonly" key={block.id}>
                <Render data={block.data} />
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
