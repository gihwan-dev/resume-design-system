import { hasBulletLines, rt, rtTree } from '../../rich-text/parse';
import type { FreeTextData } from './types';

export function FreeTextBlock({ data }: { data: FreeTextData }) {
  if (hasBulletLines(data.text)) {
    return <div className="rs-body rs-tree-wrap">{rtTree(data.text)}</div>;
  }
  return (
    <p className="rs-body" style={{ margin: 0 }}>
      {rt(data.text)}
    </p>
  );
}
