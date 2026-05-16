import type { AppState, Page, Resume } from '../store/types';
import type { Block } from '../blocks';
import { uid } from '../lib/uid';

/**
 * First-run seed — a complete sample resume so the user lands on
 * something realistic instead of an empty canvas. Personal details
 * are placeholders only.
 */

function b<T extends string>(type: T, data: unknown): Block {
  return { id: uid('b'), type: type as Block['type'], data: data as Block['data'] };
}

function page(blocks: Block[]): Page {
  return { id: uid('p'), blocks };
}

export function seedAppState(): AppState {
  const resumeId = uid('r');
  const now = Date.now();

  const p1 = page([
    b('header', {
      name: '홍길동',
      role: 'Frontend Engineer',
      tagline: '확장 가능한 구조를 설계하는 프론트엔드 개발자',
      contacts: ['email@example.com', '+82 10 0000 0000', 'github.com/handle'],
    }),
    b('positioning', {
      text: '복잡한 운영 UI와 대규모 데이터 화면을 **상태 모델, 렌더링 경계, 테스트 가능한 계약**으로 정리합니다. 기능이 늘어날 때 복잡도가 폭증하는 지점을 먼저 찾고, 구조와 품질 기준을 함께 설계해 제품과 팀이 계속 확장될 수 있는 기반을 만듭니다.',
    }),
    b('sectionHeader', { title: 'Core Impact', meta: '', variant: 'primary' }),
    b('coreImpact', {
      items: [
        '대시보드 응답성을 ==INP 320ms → 110ms==로 단축, 운영 화면 체감 속도 개선',
        '공용 `Data Grid` 컴포넌트로 5개 제품의 그리드 코드 ==약 6,000 LOC==를 한 모듈로 통합',
        '디자인 시스템 토큰화로 테마 추가 시 PR ==1개== 안에 색·폰트·간격을 모두 교체',
      ],
    }),
    b('sectionHeader', { title: 'Career', meta: '', variant: 'primary' }),
    b('career', {
      company: '주식회사 예시컴퍼니',
      role: 'Frontend Engineer',
      period: '2024.01 — 현재',
      summary:
        '제품군의 React 대시보드, 공용 데이터 그리드, 디자인 시스템을 개발하며 상태 모델·렌더링 경계·테스트 기준으로 구조를 정리합니다.',
      projects: [
        {
          id: uid('prj'),
          title: '운영 대시보드 React 19 마이그레이션',
          period: '2025.02 — 2025.05',
          stack: 'React 19 · TanStack Query · Zustand · Vite',
          pars: [
            {
              id: uid('par'),
              label: '',
              problem:
                'CRA 기반 5개 제품에서 빌드 시간 ==평균 90s==, 신규 기능 추가 시 회귀 빈도 높음.',
              action:
                'Vite 전환 + 공용 데이터 그리드 추출 + 상태 모델을 `Zustand + Immer` 슬라이스로 정리.',
              result: '빌드 시간 ==90s → 12s==, 첫 페인트 ==1.8s → 0.7s==, 회귀 PR 4건 → 0건.',
              learning:
                '대규모 리팩토링은 “스토어 모양”을 먼저 합의해야 화면 코드가 따라 단순해진다.',
            },
          ],
        },
      ],
    }),
  ]);

  const p2 = page([
    b('sectionHeader', { title: 'Skills', meta: '', variant: 'primary' }),
    b('skills', {
      rows: [
        { key: 'UI Architecture', val: 'Headless UI · Compound Component · Render Props' },
        { key: 'State', val: 'Zustand · TanStack Query · XState' },
        { key: 'Performance', val: 'Memoization · Virtualization · INP · Lighthouse' },
        { key: 'Tooling', val: 'Vite · Vitest · Playwright · pnpm · Turborepo' },
      ],
    }),
    b('sectionHeader', { title: 'Education', meta: '', variant: 'primary' }),
    b('education', {
      rows: [{ key: '학사', val: '학교명 · 컴퓨터공학 · 2020' }],
    }),
    b('sectionHeader', { title: 'Links', meta: '', variant: 'primary' }),
    b('linkRow', {
      links: [
        { label: 'Portfolio', text: 'site.dev', href: 'https://example.dev' },
        { label: 'GitHub', text: 'github.com/handle', href: 'https://github.com/' },
        { label: 'Blog', text: 'blog.example.dev', href: 'https://example.dev' },
      ],
    }),
  ]);

  const resume: Resume = {
    id: resumeId,
    name: '예시 이력서',
    createdAt: now,
    updatedAt: now,
    theme: 'default',
    pages: [p1, p2],
    snapshots: [],
  };

  return {
    schemaVersion: 1,
    currentResumeId: resumeId,
    selectedBlockId: null,
    resumes: { [resumeId]: resume },
  };
}
