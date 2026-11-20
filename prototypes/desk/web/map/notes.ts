/** The same held marks have two send paths. This path asks for reconsideration, without an edit. */
import type { OptionView } from '@mandate/kernel/seat-api';
import type { MapEditKind } from './model.ts';

export interface HeldMark {
  readonly kind: MapEditKind;
  readonly axis: string;
  readonly region?: string;
}
export interface WaitNote {readonly axis:string;readonly days:number}

export function sendbackLine(post: string, marks: readonly HeldMark[], plan: OptionView, waits:readonly WaitNote[]=[]): string {
  const encode = (value: string) => encodeURIComponent(value);
  const tokens = marks.map(mark => {
    const kind = mark.kind === 'objective' ? 'focus' : mark.kind === 'waypoints' ? 'via' : 'avoid';
    const region = mark.region ?? plan.axes.find(a => a.name === mark.axis)?.regions.at(-1);
    if (!region) throw new Error('The mark has no named place.');
    return `${kind}:${encode(mark.axis)}:${mark.kind === 'waypoints' ? region.split(',').map(encode).join(',') : encode(region)}`;
  });
  const waitTokens=waits.map(w=>{
    if(!w.axis||!Number.isSafeInteger(w.days)||w.days<0)throw Error('A wait note needs an axis and whole nonnegative days.');
    return `wait:${encode(w.axis)}:${w.days}`;
  });
  return [`sendback ${post}`, ...tokens,...waitTokens].join(' ');
}
