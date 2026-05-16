import type { AnyBlockDefinition, BlockDefinition, BlockType } from './types';

/**
 * Block registry — the single extension point for new blocks.
 *
 * To add a new block:
 *   1. Create `src/blocks/<name>/{types,Block,Form,index}.ts(x)`.
 *   2. In `index.ts`, call `registerBlock(definition)`.
 *   3. Add `import './<name>'` to `src/blocks/index.ts`.
 *
 * Every consumer (canvas, palette, outline, inspector) goes through
 * `getBlock(type)` so they never know about specific block types.
 */
const _registry = new Map<string, AnyBlockDefinition>();
const _order: string[] = [];

export function registerBlock<T extends BlockType>(def: BlockDefinition<T>): void {
  if (_registry.has(def.type)) {
    // Hot-reload friendly: replace silently.
    _registry.set(def.type, def as unknown as AnyBlockDefinition);
    return;
  }
  _registry.set(def.type, def as unknown as AnyBlockDefinition);
  _order.push(def.type);
}

export function getBlock(type: string): AnyBlockDefinition | undefined {
  return _registry.get(type);
}

export function listBlockTypes(): string[] {
  return [..._order];
}

export function shortLabelFor(type: string, data: unknown): string {
  const def = _registry.get(type);
  if (!def) return type;
  return def.shortLabel ? def.shortLabel(data) : def.label;
}
