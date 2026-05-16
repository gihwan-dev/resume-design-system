/**
 * Block self-registration entry point.
 *
 * Each side-effect import below triggers a `registerBlock(...)` call.
 * That's the only place the order is meaningful — palette/outline UI
 * also use this order as the default.
 *
 * To add a new block, add `import './<name>';` here.
 */
import './header';
import './positioning';
import './sectionHeader';
import './coreImpact';
import './career';
import './skills';
import './learningNote';
import './education';
import './linkRow';
import './freeText';
import './divider';
import './spacer';

export { getBlock, listBlockTypes, shortLabelFor, registerBlock } from './registry';
export type { Block, BlockDefinition, BlockType, BlockDataMap, AnyBlockDefinition } from './types';
