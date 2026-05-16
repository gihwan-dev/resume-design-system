import { registerBlock } from '../registry';
import { CaseStudyOutcomeBlock } from './Block';
import { CaseStudyOutcomeForm } from './Form';
import type { CaseStudyOutcomeData } from './types';
export type { CaseStudyOutcomeData };

registerBlock<'caseStudyOutcome'>({
  type: 'caseStudyOutcome',
  label: 'Case Study — Outcome',
  hint: 'BUILT · OUTCOME · LEARNING',
  icon: '◆',
  Render: CaseStudyOutcomeBlock,
  Form: CaseStudyOutcomeForm,
  defaultData: (): CaseStudyOutcomeData => ({
    built: '핵심 기능과 의사결정 — **모델·구조·트레이드오프**',
    outcome: '결과: ==수치 변화== 또는 정성적 효과',
    learning: '이 프로젝트에서 남은 기준 / 다음 작업에 적용한 원칙',
  }),
  shortLabel: (d) => {
    const first = (d.outcome || d.built || '').replace(/\s+/g, ' ').slice(0, 24);
    return first ? `Case 본문 — ${first}` : 'Case 본문';
  },
});
