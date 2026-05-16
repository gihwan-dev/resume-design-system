import { rt } from '../../rich-text/parse';
import type { FreeTextData } from './types';

export function FreeTextBlock({ data }: { data: FreeTextData }) {
  return (
    <p className="rs-body" style={{ margin: 0 }}>
      {rt(data.text)}
    </p>
  );
}
