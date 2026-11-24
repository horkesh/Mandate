/** Received observations and attributed estimates; never a writer of force truth (0130). */
import type { PersonId, RegionId } from '../ids.ts';
import type { ReportClaim } from './report.ts';

export interface ObservedCount {
  readonly countKind: 'men' | 'formed_battalions' | 'companies' | 'regiments' | 'guns' | 'camps';
  readonly count: number;
  readonly compatible?: boolean;
}
export interface StrengthComponent {
  readonly componentId: string;
  readonly componentKind: 'count' | 'estimate';
  readonly componentLower: number;
  readonly componentUpper: number;
  readonly componentBasis: string;
}
export interface StrengthEstimate {
  readonly strengthObserver: PersonId;
  readonly strengthDay: number;
  readonly strengthScope: string;
  readonly strengthPresence: boolean;
  readonly strengthCoverage: 'complete' | 'partial' | 'unknown';
  readonly strengthUnknown: boolean;
  readonly strengthLower: number | null;
  readonly strengthUpper: number | null;
  readonly strengthCounts: readonly ObservedCount[];
  readonly strengthComponents: readonly StrengthComponent[];
  readonly strengthReaders: readonly PersonId[];
  readonly strengthConditions: string;
  /** Independent scoped accounts retain their own reading history when combined. */
  readonly strengthAccounts?: readonly StrengthEstimate[];
}
export interface StrengthObservation {
  readonly observer: PersonId;
  readonly region: RegionId;
  readonly day: number;
  readonly scope: string;
  readonly presence: boolean;
  readonly coverage: StrengthEstimate['strengthCoverage'];
  readonly counts: readonly ObservedCount[];
  readonly conditions: string;
  /** Affirmative scoped clearance, never inferred from an empty count. */
  readonly cleared?: boolean;
}

export function observeStrength(o: StrengthObservation): StrengthEstimate {
  const components: StrengthComponent[] = [];
  for (const [i,c] of o.counts.entries()) {
    if (!Number.isSafeInteger(c.count) || c.count < 0) throw new RangeError('observation count must be a nonnegative integer');
    if (c.count === 0) continue;
    if (c.countKind === 'men') components.push({ componentId: `${o.scope}:men:${i}`, componentKind: 'count', componentLower: c.count, componentUpper: c.count, componentBasis: 'observed men' });
    if (c.countKind === 'formed_battalions' && c.compatible === true) components.push({
      componentId: `${o.scope}:battalions:${i}`, componentKind: 'estimate', componentLower: c.count * 600, componentUpper: c.count * 700,
      componentBasis: '[I] Mahan p.28, para.164: 600-700 per compatible formed battalion',
    });
  }
  const quantified = components.length > 0 || o.cleared === true;
  const unknown = o.coverage !== 'complete' || !quantified || o.counts.some(c => c.count > 0 && c.countKind !== 'men' && (c.countKind !== 'formed_battalions' || c.compatible !== true));
  return { strengthObserver: o.observer, strengthDay: o.day, strengthScope: o.scope, strengthPresence: o.presence,
    strengthCoverage: unknown ? (quantified ? 'partial' : 'unknown') : 'complete', strengthUnknown: unknown,
    strengthLower: quantified ? components.reduce((n,c) => n+c.componentLower,0) : null,
    strengthUpper: quantified ? components.reduce((n,c) => n+c.componentUpper,0) : null,
    strengthCounts: o.counts, strengthComponents: components, strengthReaders: [], strengthConditions: o.conditions };
}

/** Outward-rounded intervals; retain the original observation and never reapply a quoted reader. */
export function biasStrength(s: StrengthEstimate, permille: number, reader: PersonId): StrengthEstimate {
  if(s.strengthAccounts!==undefined) {
    const accounts=s.strengthAccounts.map(a=>biasStrength(a,permille,reader));
    return {...s,strengthAccounts:accounts,
      strengthLower:accounts.some(a=>a.strengthLower!==null)?accounts.reduce((n,a)=>n+(a.strengthLower??0),0):null,
      strengthUpper:accounts.some(a=>a.strengthUpper!==null)?accounts.reduce((n,a)=>n+(a.strengthUpper??0),0):null,
      strengthReaders:accounts[0]?.strengthReaders.filter(p=>accounts.every(a=>a.strengthReaders.includes(p)))??[]};
  }
  if (s.strengthReaders.includes(reader)) return s;
  const point = s.strengthLower === s.strengthUpper;
  return { ...s, strengthReaders: [...s.strengthReaders,reader],
    strengthLower: s.strengthLower === null ? null : Math.floor(s.strengthLower * permille / 1000),
    strengthUpper: s.strengthUpper === null ? null : (point ? Math.trunc : Math.ceil)(s.strengthUpper * permille / 1000) };
}
export function completeUpper(s: StrengthEstimate): number | null {
  return !s.strengthUnknown && s.strengthCoverage === 'complete' ? s.strengthUpper : null;
}
export function strengthClaim(region: RegionId, s: StrengthEstimate, confidence: number): ReportClaim {
  const upper = completeUpper(s);
  return { claimKind: upper === null ? 'enemy-estimate-unknown' : 'enemy-strength', claimRegion: region,
    claimValue: upper ?? 0, claimToken: null, claimConfidence: confidence, claimStrength: s };
}
/** A quotation preserves the observed date and the people whose reading it already includes. */
export function beliefClaim(region: RegionId, b: {readonly value:number|null;readonly strength?:StrengthEstimate;readonly asOfDay:number}, author: PersonId, confidence:number):ReportClaim {
  const raw=b.strength??claimEstimate({claimKind:b.value===null?'enemy-estimate-unknown':'enemy-strength',claimRegion:region,claimValue:b.value??0,claimToken:null,claimConfidence:confidence},b.asOfDay,author);
  const quoted=raw.strengthReaders.includes(author)?raw:{...raw,strengthReaders:[...raw.strengthReaders,author]};
  return strengthClaim(region,quoted,confidence);
}
export function claimEstimate(c: ReportClaim, day: number, observer: PersonId): StrengthEstimate {
  if (c.claimStrength !== undefined) return c.claimStrength;
  return observeStrength({ observer, day, region: c.claimRegion!, scope: 'region', presence: c.claimKind === 'enemy-estimate-unknown' || c.claimValue > 0,
    coverage: c.claimKind === 'enemy-strength' ? 'complete' : 'unknown',
    counts: c.claimKind === 'enemy-strength' && c.claimValue > 0 ? [{countKind:'men',count:c.claimValue}] : [],
    cleared: c.claimKind === 'enemy-strength' && c.claimValue === 0, conditions: 'received legacy scoped account; not a new observation' });
}

export function strengthProblems(s: StrengthEstimate): string[] {
  const numeric = [s.strengthLower,s.strengthUpper].every(n => n === null || Number.isSafeInteger(n) && n >= 0);
  return numeric && (s.strengthLower === null) === (s.strengthUpper === null) &&
    (s.strengthLower === null || s.strengthUpper! >= s.strengthLower) &&
    (s.strengthUnknown || s.strengthCoverage === 'complete' && s.strengthUpper !== null) &&
    Number.isSafeInteger(s.strengthDay) && s.strengthDay >= 0 && s.strengthScope.trim() && s.strengthConditions.trim() &&
    new Set(s.strengthReaders).size === s.strengthReaders.length ? [] : ['invalid strength estimate, coverage or interval'];
}
