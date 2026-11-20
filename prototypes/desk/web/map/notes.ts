/** The same held marks have two send paths. This path asks for reconsideration, without an edit. */
import type { OptionView } from '@mandate/kernel/seat-api';
import type { MapEditKind } from './model.ts';

export interface HeldMark {
  readonly kind: MapEditKind;
  readonly axis: string;
  readonly region?: string;
}

export function sendbackLine(post: string, marks: readonly HeldMark[], plan: OptionView): string {
  const encode = (value: string) => encodeURIComponent(value);
  const tokens = marks.map(mark => {
    const kind = mark.kind === 'objective' ? 'focus' : mark.kind === 'waypoints' ? 'via' : 'avoid';
    const region = mark.region ?? plan.axes.find(a => a.name === mark.axis)?.regions.at(-1);
    if (!region) throw new Error('The mark has no named place.');
    return `${kind}:${encode(mark.axis)}:${mark.kind === 'waypoints' ? region.split(',').map(encode).join(',') : encode(region)}`;
  });
  return [`sendback ${post}`, ...tokens].join(' ');
}
