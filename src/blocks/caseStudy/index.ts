import { registerBlock } from '../registry';
import { CaseStudyBlock } from './Block';
import { CaseStudyForm } from './Form';
import type { CaseStudyData } from './types';
export type { CaseStudyData, CaseStudyLink } from './types';

registerBlock<'caseStudy'>({
  type: 'caseStudy',
  label: 'Case Study',
  hint: '앱·도구 자체가 해법인 프로젝트',
  icon: '✦',
  Render: CaseStudyBlock,
  Form: CaseStudyForm,
  defaultData: (): CaseStudyData => ({
    title: '프로젝트 이름',
    period: '2024.03 — 2024.06',
    stack: 'React, TypeScript',
    role: 'Solo · Full-stack',
    context:
      '팀에서 ==월 평균 50건==의 경비 신청이 종이 양식으로 처리되어 승인까지 평균 ==3일==이 걸렸습니다.',
    built:
      '영수증 사진 1장으로 항목·금액·세금을 OCR로 채우고, **Slack 승인 플로우**까지 연결한 단일 페이지 앱.',
    outcome:
      '신청 입력 시간 ==12분 → 90초==, 승인 대기 ==3일 → 같은 날==. 회계팀의 수기 검토 부담도 줄어듦.',
    learning:
      '“입력을 줄이는 가치”가 “기능 수”보다 크다는 걸 보여준 사례. 다음 도구도 같은 기준으로 설계.',
    links: [{ label: 'DEMO', href: 'https://' }],
  }),
  shortLabel: (d) => (d.title ? `Case — ${d.title}` : 'Case Study'),
});
