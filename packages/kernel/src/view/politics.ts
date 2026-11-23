/** Public political audiences (0084) and received front-page claims (0103). */
import { strictCompare } from '../compare.ts';
import type { FactionId, PersonId } from '../ids.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { PoliticsView, ReportView } from './types.ts';

export function politicsProjection(world: SeatsWorld, person: PersonId, day: number, reports: readonly ReportView[], faction: FactionId | null = world.start.factions.find(f => f.principal === person)?.faction ?? null): PoliticsView {
  if (faction === null || !world.start.factions.some(f => f.principal === person && f.faction === faction)) return EMPTY;
  const vocab = world.map.world.vocabularies.blocs;
  const blocs = world.map.world.rules.politics.blocs.filter(b => b.faction === faction)
    .sort((a, b) => strictCompare(a.id, b.id))
    .map(b => Object.freeze({ id: b.id, name: vocab.find(v => v.id === b.id)!.name }));
  const evidence = reports.filter(r => r.type === 'press' && r.day <= day && r.receivedDay <= day
      && world.map.world.rules.politics.press.papers.some(p => p.faction === faction && p.editor === r.author))
    .flatMap(r => r.claims.filter(c => c.kind === 'framing').map(c => Object.freeze({
      source: r.id, author: r.author, day: r.day, receivedDay: r.receivedDay,
      kind: 'framing' as const, value: c.value, confidence: c.confidence,
    })));
  return Object.freeze({ blocs: Object.freeze(blocs), evidence: Object.freeze(evidence) });
}
const EMPTY: PoliticsView = Object.freeze({ blocs: Object.freeze([]), evidence: Object.freeze([]) });
