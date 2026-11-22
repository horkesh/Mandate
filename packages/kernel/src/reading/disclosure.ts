/** Originator disclosure is the reauthor's act, never an incoming-wire filter (0032; S37 N3-07). */
import type { PersonId } from '../ids.ts';
import type { ReportTemplate } from '../knowledge/templates.ts';
import type { PersonTraits } from '../people/traits.ts';

export function originatorDisclosure(holder: PersonTraits, known: PersonId | null, rule: ReportTemplate['templateDisclosure']): {
  readonly named: PersonId | null;
  readonly reason: 'unknown' | 'preserved' | 'candid' | 'value';
} {
  if (known === null) return { named: null, reason: 'unknown' };
  if (rule === undefined) return { named: known, reason: 'preserved' };
  if (holder.candour >= rule.candidAt) return { named: known, reason: 'candid' };
  return rule.concealFor.some(v => holder.values.includes(v)) ? { named: null, reason: 'value' } : { named: known, reason: 'preserved' };
}
