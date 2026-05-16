import { rt } from '../../rich-text/parse';
import type { PositioningData } from './types';

export function PositioningBlock({ data }: { data: PositioningData }) {
  return (
    <section className="rs-positioning">
      <p className="rs-intro">{rt(data.text)}</p>
    </section>
  );
}
