import { registerBlock } from '../registry';
import { CoreImpactBlock } from './Block';
import { CoreImpactForm } from './Form';
import type { CoreImpactData } from './types';
export type { CoreImpactData };

registerBlock<'coreImpact'>({
  type: 'coreImpact',
  label: 'Core Impact',
  hint: '번호 매겨진 핵심 성과 목록',
  icon: '01',
  Render: CoreImpactBlock,
  Form: CoreImpactForm,
  defaultData: (): CoreImpactData => ({
    items: [
      '첫 번째 핵심 성과 한 줄 요약',
      '두 번째 핵심 성과 한 줄 요약',
      '세 번째 핵심 성과 한 줄 요약',
    ],
  }),
  shortLabel: (d) => `Core Impact (${(d.items ?? []).length})`,
});
