import type { SpacerData } from './types';

export function SpacerBlock({ data }: { data: SpacerData }) {
  const h = Math.max(4, Math.min(120, Number(data.height) || 16));
  return <div aria-hidden="true" style={{ height: h }} />;
}
