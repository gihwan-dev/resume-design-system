# Resume Design System

A4 이력서를 빠르게 만들고 PDF로 출력하기 위한 블록 기반 빌더 + 디자인 시스템.
TypeScript · React 19 · Vite · Zustand · Emotion · @dnd-kit · IndexedDB.

> 디자인 시스템과 빌더가 같은 코드 경로를 공유하기 때문에 **A4 미리보기와 PDF 출력
> 결과가 동일**합니다. `window.print()` + `@media print`로 출력하므로 별도의
> PDF 렌더러를 두지 않습니다.

## 주요 기능

- 12개의 이력서 컴포넌트(Header / Positioning / Section Header / Core Impact / Career → Project → PAR / Skills / Education / Learning Note / Link Row / Free Text / Divider / Spacer).
- 좌측 팔레트에서 드래그 → A4 페이지로 드롭하여 블록 추가.
- 우측 인스펙터에서 텍스트·옵션 즉시 편집(controlled inputs).
- 이력서 여러 버전 관리 + 스냅샷(저장/복원/자동 백업).
- 페이지(A4 한 장) 추가·삭제·순서 변경, 페이지 내 오버플로우 시각화.
- 디자인 토큰 기반 테마 — `default`, `mono` 동봉. 폰트·색·간격 단번에 교체.
- IndexedDB 영속화(디바운스 250 ms). 로컬 환경 안에서만 동작 — 외부 서버 없음.
- `Cmd/Ctrl+P` 또는 “Export PDF” 클릭으로 즉시 PDF 출력.

## 빠른 시작

```bash
pnpm install
pnpm dev          # http://localhost:5173
```

빌드 / 검증:

```bash
pnpm typecheck    # tsc -b --noEmit
pnpm lint         # eslint
pnpm format       # prettier --write
pnpm test:run     # vitest run
pnpm build        # tsc -b && vite build
pnpm preview      # 빌드 산출물 미리보기 (http://localhost:4173)
pnpm e2e          # Playwright smoke (preview 서버 자동 기동)
```

## 디렉토리 구조

```
src/
├─ app/                      # Builder chrome (Topbar, Sidebar, Canvas, Inspector)
├─ blocks/                   # 블록 12개 — 각 폴더가 자가 등록
│  ├─ registry.ts            # 확장 지점
│  ├─ types.ts               # BlockDataMap discriminated union
│  └─ <name>/{types,Block,Form,index}.ts(x)
├─ store/                    # Zustand + Immer + IndexedDB
├─ theme/                    # Theme contract + themes (default, mono)
├─ styles/                   # 글로벌 CSS (resume / chrome / print)
├─ rich-text/                # **emphasis** · ==metric== · `mono` 인라인 파서
├─ pdf/printResume.ts        # window.print() 래퍼
├─ seed/sampleResume.ts      # 초기 시드 이력서
└─ lib/{uid,debounce}.ts
```

## 새 블록 추가하기

각 블록은 자기 폴더 안에서 자가 등록됩니다. 새 블록 추가는 **변경 3 ~ 4곳**으로 끝나도록 설계되어 있습니다.

1. `src/blocks/<name>/types.ts` — `<Name>Data` 인터페이스 선언 + `BlockDataMap` 모듈 augmentation.
2. `Block.tsx` — `.rs-*` 클래스를 활용한 렌더러.
3. `Form.tsx` — 인스펙터 폼(공용 `Field/TextInput/TextArea/IconBtn` 사용).
4. `index.ts` — `registerBlock({ ... })` 호출.
5. `src/blocks/index.ts`에 `import './<name>';` 한 줄 추가.

예시 (`src/blocks/note/index.ts`):

```ts
import { registerBlock } from '../registry';
import { NoteBlock } from './Block';
import { NoteForm } from './Form';
import type { NoteData } from './types';

registerBlock<'note'>({
  type: 'note',
  label: 'Note',
  hint: '단순 메모',
  icon: 'N',
  Render: NoteBlock,
  Form: NoteForm,
  defaultData: (): NoteData => ({ text: '' }),
});
```

## 새 테마 추가하기

1. `src/theme/themes/<name>.ts`에서 `defaultTheme`을 스프레드한 뒤 필요한 토큰만 덮어쓴다.
2. `src/theme/themes/index.ts`의 `THEMES`에 등록.
3. 인스펙터의 “테마” 드롭다운에서 즉시 선택 가능.

토큰은 한 번 더 CSS 변수(`--text-primary`, `--font-sans`, `--fs-body`, …)로 노출되어
`.rs-*` 글로벌 룰이 그대로 사용합니다. 그래서 테마 토글이 **A4 화면과 PDF 출력 모두에서**
동일하게 반영됩니다.

## PDF 출력 동작

`Export PDF` 버튼은 `pdf/printResume.ts`를 호출합니다.

1. `body[data-preview="print"]`를 설정 — `print.global.ts`의 `@media print` 룰이 켜집니다.
2. 두 번의 `requestAnimationFrame` 이후 `window.print()` 호출.
3. 브라우저의 `afterprint` 이벤트에서 원래 preview 모드를 복원.

`@page { size: A4; margin: 0; }`로 페이지 마진을 제거하고 `.rs-page`가 정확히 1 A4가
되도록 강제합니다. 따라서 화면에 보이는 페이지와 출력물이 픽셀-아닌-구조 단위로 일치합니다.

## 데이터 모델

전체 상태는 단일 JSON blob으로 IndexedDB에 저장됩니다.

```ts
type AppState = {
  schemaVersion: number;
  currentResumeId: string;
  selectedBlockId: string | null;
  resumes: Record<string, Resume>;
};

type Resume = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  theme: 'default' | 'mono' | string;
  pages: { id: string; blocks: Block[] }[];
  snapshots: { id: string; name: string; createdAt: number; pages: Page[] }[];
};

type Block = { id: string; type: BlockType; data: BlockDataMap[BlockType] };
```

`Career` 블록은 `projects → PARs`를 자기 `data`에 중첩으로 보관합니다.

## CI / 배포

- GitHub Actions: `verify`(typecheck/lint/format/test/build) + `e2e`(Playwright smoke). `.github/workflows/ci.yml`.
- Vercel: Vite 프리셋 자동 인식. `main` 브랜치 푸시 → Production, PR → Preview URL.

## 한계 / 향후 작업

- 페이지 자동 분할은 아직 없음. 오버플로우는 시각적으로만 표시.
- 한국어 이외 언어 폰트 self-host는 도입 미정 (지금은 Pretendard / JetBrains Mono CDN).
- 다중 디바이스 동기화는 별도 PR로 분리(현재는 단일 브라우저 IndexedDB).

## 참고

이 저장소의 디자인 토큰과 컴포넌트 구조는 Claude Design 세션에서 도출한
참고 이력서 빌더(React UMD + Babel standalone)의 데이터 모델·CSS 시스템을
TypeScript 친화적으로 재정리한 것입니다.
