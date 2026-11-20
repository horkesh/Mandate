import { ConditionSchema, holdsOnNothing } from '@mandate/pack-format';
import { fingerprint, type Finding, type JsonItem } from './common.ts';

export interface CauseExemption {
  path: string; hash: string; kind: 'premise' | 'outside-model'; reason: string; citation: string;
}
/** Strict by default: authoring a date-only branch or railroad requires a reviewed, cited exception.
 * A free-text label cannot prove there is no cause in State (B2, R57/R69/R94).
 * The schema's evaluator includes negations and disjunctions; searching for any positive flag is insufficient.
 */
export function causeFindings(items: readonly JsonItem[], exemptions: readonly CauseExemption[]): Finding[] {
  for (const e of exemptions) {
    if (!e.citation.trim() || !e.reason.trim() || !['premise', 'outside-model'].includes(e.kind) || !/^[a-f0-9]{64}$/.test(e.hash)) throw new Error(`invalid cause exemption/citation: ${e.path}`);
  }
  const paths = new Set(exemptions.map(e => e.path));
  if (paths.size !== exemptions.length) throw new Error('duplicate cause exemption');
  return items.flatMap(({ path, value }) => {
    const event = ConditionSchema.parse(value.event);
    const bare = holdsOnNothing(event);
    const railroad = typeof value.railroad === 'string' && value.railroad.length > 0;
    if (!bare && !railroad) return [];
    const hash = fingerprint(value);
    if (exemptions.some(e => e.path === path && e.hash === hash)) return [];
    return [{ rule: 'situation-cause', path, hash, detail: [bare ? 'event can hold with no positive cause in State' : '', railroad ? 'railroad label requires a cited premise/outside-model exemption' : ''].filter(Boolean).join('; ') }];
  });
}
