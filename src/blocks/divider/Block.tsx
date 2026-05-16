import type { DividerData } from './types';

export function DividerBlock({ data }: { data: DividerData }) {
  const cls = data.variant === 'strong' ? 'rs-divider-strong' : 'rs-divider';
  return <hr className={cls} style={{ margin: '10px 0' }} />;
}
