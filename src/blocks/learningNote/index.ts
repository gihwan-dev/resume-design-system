import { registerBlock } from '../registry';
import { LearningNoteBlock } from './Block';
import { LearningNoteForm } from './Form';
import type { LearningNoteData } from './types';
export type { LearningNoteData };

registerBlock<'learningNote'>({
  type: 'learningNote',
  label: 'Learning Note',
  hint: '한 단락의 러닝/관점',
  icon: 'L',
  Render: LearningNoteBlock,
  Form: LearningNoteForm,
  defaultData: (): LearningNoteData => ({
    label: 'LEARNING',
    text: '이 경험에서 남은 **기준과 관점**을 한 단락으로 적습니다.',
    variant: 'default',
  }),
});
