import type { PersonId, PostId, RegionId } from '../ids.ts';
import type { LetterIdentity } from './letters.ts';
import { isLetterIdentity, letterKey } from './letters.ts';
import type { PaperSelector } from './paper-selectors.ts';
import { parseIsoDate } from './calendar.ts';
import type { World } from './world.ts';
import type { ScenarioStart } from './scenario.ts';

export type AllocationScope =
  | { readonly kind: 'named'; readonly regiments: readonly string[]; readonly calls?: readonly string[] }
  | { readonly kind: 'cohort'; readonly calls?: readonly string[]; readonly arm?: string; readonly minTermDays: number };

/** Read words constrain a commander's request; they never create a regiment or a receipt. */
export interface AllocationInstrument {
  readonly id: string;
  readonly source: string;
  readonly fromDate: string;
  readonly kind: 'request' | 'assignment';
  readonly issuer: PersonId;
  readonly issuerPost: PostId | null;
  readonly mandate: string | null;
  readonly from: PostId;
  readonly to: PostId;
  readonly destination: RegionId;
  readonly recipient?: PersonId;
  readonly letter: LetterIdentity;
  readonly scope: AllocationScope;
  readonly words: string;
  readonly quantity: number | 'all';
  /** Only when the read words direct successive arrivals/preparations, not an invented standing sweep. */
  readonly continuing?: boolean;
  readonly atRegion?: RegionId;
  readonly requiresPapers?: readonly PaperSelector[];
  readonly modes?: readonly ('land' | 'rail' | 'river' | 'sea')[];
}

export function allocationProblems(world: World, start: ScenarioStart): string[] {
  const problems: string[] = [], ids = new Set<string>(), letters = new Set<string>();
  const posts = new Set([...start.posts, ...start.temporaryPosts].map(p => p.id));
  for (const p of world.rules.allocationInstruments ?? []) {
    const at = `allocationInstruments.${p.id}`, s = p.scope;
    if (!p.id || ids.has(p.id) || !p.source?.trim() || !p.words?.trim() ||
      !isLetterIdentity(p.letter) || letters.has(letterKey(p.letter))) problems.push(`${at}: unique sourced paper and read scope words required`);
    ids.add(p.id); if(isLetterIdentity(p.letter))letters.add(letterKey(p.letter));
    try { parseIsoDate(p.fromDate); } catch { problems.push(`${at}: invalid earliest date`); }
    if (!['request','assignment'].includes(p.kind) || !posts.has(p.from) || !posts.has(p.to) ||
      !world.people.some(x => x.id === p.issuer) ||
      (p.issuerPost !== null && (!posts.has(p.issuerPost) || !p.mandate)) ||
      (p.issuerPost === null && p.mandate !== null) ||
      !world.regions.some(r => r.id === p.destination) ||
      (p.atRegion !== undefined && !world.regions.some(r => r.id === p.atRegion)) ||
      (p.recipient !== undefined && !world.people.some(x => x.id === p.recipient))) problems.push(`${at}: invalid command, authority or address`);
    if (p.quantity !== 'all' && (!Number.isSafeInteger(p.quantity) || p.quantity < 1)) problems.push(`${at}: finite positive quantity or explicit all required`);
    const unique = (xs: readonly string[] | undefined) => xs !== undefined && xs.length > 0 && new Set(xs).size === xs.length && xs.every(x => typeof x === 'string' && x.length > 0);
    if (!s || (s.kind === 'named' ? !unique(s.regiments) || s.regiments.some(id => !world.regimentCatalogue?.some(r => r.id === id)) || (s.calls !== undefined && !unique(s.calls)) :
      s.kind === 'cohort' ? (s.calls!==undefined && !unique(s.calls)) || (s.arm!==undefined && !world.vocabularies.arms.some(a => a.id === s.arm)) || !Number.isSafeInteger(s.minTermDays) || s.minTermDays < 1 || (s.calls===undefined && s.arm===undefined && s.minTermDays<=1) : true)) problems.push(`${at}: named identities or a call/service/arm cohort required; state alone is no scope`);
    if (p.modes !== undefined && (!unique(p.modes) || p.modes.some(m => !['land','rail','river','sea'].includes(m)))) problems.push(`${at}: invalid travel modes`);
  }
  return problems;
}
