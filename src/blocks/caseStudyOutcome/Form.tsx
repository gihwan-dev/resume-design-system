import type { Block } from '../types';
import type { CaseStudyOutcomeData } from './types';
import { Field, RT_HINT, TextArea } from '../../app/Inspector/primitives';

export function CaseStudyOutcomeForm({
  block,
  update,
}: {
  block: Block<'caseStudyOutcome'>;
  update: (patch: Partial<CaseStudyOutcomeData>) => void;
}) {
  const d = block.data;
  return (
    <div className="field-group">
      <Field label="BUILT — 무엇을 어떻게 만들었는가" hint={RT_HINT}>
        <TextArea
          rows={4}
          value={d.built}
          onChange={(v) => update({ built: v })}
          placeholder="핵심 기능과 의사결정 — 모델·구조·트레이드오프"
        />
      </Field>
      <Field label="OUTCOME — 어떤 변화가 있었는가" hint={RT_HINT}>
        <TextArea
          rows={4}
          value={d.outcome}
          onChange={(v) => update({ outcome: v })}
          placeholder="사용 규모·시간 절감·정성적 변화 등 (가능하면 ==수치==)"
        />
      </Field>
      <Field label="LEARNING (선택)" hint={RT_HINT}>
        <TextArea
          rows={3}
          value={d.learning}
          onChange={(v) => update({ learning: v })}
          placeholder="이 프로젝트에서 남은 기준 / 다음 작업에 적용한 원칙"
        />
      </Field>
    </div>
  );
}
