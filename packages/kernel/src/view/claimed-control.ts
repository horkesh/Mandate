import { frontSegmentsOf, type ControlMap } from '../control-index/control-index.ts';
import type { RegionId } from '../ids.ts';
import { controlEvidence } from '../knowledge/control-beliefs.ts';
import type { KnownReport } from '../knowledge/records.ts';
import type { ClaimedFrontView, ControlBeliefSource, ControlBeliefView, SeatView } from './types.ts';

function source({ id, knownBody: body }: KnownReport): ControlBeliefSource {
  return Object.freeze({ report: id, author: body.reportAuthor, authorPost: body.reportAuthorPost, asOfDay: body.reportDay });
}

/** Project the seat's reports onto the static map, without reading State. */
export function claimedControlView(map: ControlMap, reports: readonly KnownReport[]): Pick<SeatView, 'controlBeliefs' | 'claimedFronts'> {
  const beliefs = new Map<RegionId, ControlBeliefView>();
  const evidence = controlEvidence(reports, map.world.rules.supplyControlPermille);
  for (const [region, { latest, holder, contested, corroboration, government }] of evidence) {
    const kind = map.regions.get(region)?.kind;
    if (kind !== 'land' && kind !== 'key_point') continue;
    const sources = [source(latest.report)];
    if (corroboration !== undefined) sources.push(source(corroboration));
    if (government !== undefined && government.report.id !== latest.report.id && government.report.id !== corroboration?.id) sources.push(source(government.report));
    beliefs.set(region, Object.freeze({
      shares: latest.shares,
      holder,
      contested,
      neutralGovernment: government?.neutral ?? false,
      asOfDay: latest.report.knownBody.reportDay,
      mark: latest.report.knownPublicOpening === true || corroboration !== undefined ? 'ink' : 'pencil',
      sources: Object.freeze(sources),
    }));
  }
  const claimedFronts = frontSegmentsOf(map, beliefs).map((segment): ClaimedFrontView => {
    const own = beliefs.get(segment.own)!;
    const other = beliefs.get(segment.faces)!;
    return Object.freeze({ ...segment, asOfDay: Math.min(own.asOfDay, other.asOfDay), mark: own.mark === 'ink' && other.mark === 'ink' ? 'ink' : 'pencil' });
  });
  return { controlBeliefs: Object.freeze(Object.fromEntries(beliefs)), claimedFronts: Object.freeze(claimedFronts) };
}
