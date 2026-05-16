import { registerBlock } from '../registry';
import { PositioningBlock } from './Block';
import { PositioningForm } from './Form';
import type { PositioningData } from './types';
export type { PositioningData };

registerBlock<'positioning'>({
  type: 'positioning',
  label: 'Positioning',
  hint: '한 단락 포지셔닝 문장',
  icon: 'P',
  Render: PositioningBlock,
  Form: PositioningForm,
  defaultData: (): PositioningData => ({
    text: '이력서 첫 화면에 들어갈 한 단락의 포지셔닝 문장을 작성합니다.',
  }),
});
