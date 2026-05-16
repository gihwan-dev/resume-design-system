import type { ComponentType, ReactNode } from 'react';

/**
 * Block discriminated union — every block has a unique `type`.
 * New block types are added by augmenting `BlockDataMap` in the
 * block's own folder (see e.g. blocks/header/types.ts).
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- augmented by each block module
export interface BlockDataMap {}
export type BlockType = keyof BlockDataMap & string;

export type Block<T extends BlockType = BlockType> = {
  id: string;
  type: T;
  data: BlockDataMap[T];
};

export interface BlockDefinition<T extends BlockType> {
  type: T;
  label: string;
  hint: string;
  icon: ReactNode;
  Render: ComponentType<{ data: BlockDataMap[T] }>;
  Form: ComponentType<{
    block: Block<T>;
    update: (patch: Partial<BlockDataMap[T]>) => void;
  }>;
  defaultData: () => BlockDataMap[T];
  shortLabel?: (data: BlockDataMap[T]) => string;
}

export interface AnyBlockDefinition {
  type: string;
  label: string;
  hint: string;
  icon: ReactNode;
  Render: ComponentType<{ data: unknown }>;
  Form: ComponentType<{ block: Block; update: (patch: Record<string, unknown>) => void }>;
  defaultData: () => unknown;
  shortLabel?: (data: unknown) => string;
}
