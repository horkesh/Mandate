/** Reports of changed holders and threshold crossings (0054). Truth events
 * select what staff must report; only ordinary message delivery informs a seat. */
import { strictCompare } from '../compare.ts';
import { presenceByRegion, sideCommand } from '../combat/battle.ts';
import { holdingOf } from '../control-index/control-index.ts';
import type { RegionControlTable } from '../control/vocabulary.ts';
import type { FactionId, ForceBlockId, PostId, RegionId } from '../ids.ts';
import { controlClaims } from '../knowledge/control-claims.ts';
import { term } from '../knowledge/truth.ts';
import type { State } from '../root-state.ts';
import { filterPostOf, isFieldPost, postFaction } from '../seats/posts.ts';
import { sendReport, type TickContext } from './context.ts';

/** The local commander, his department's chain if vacant, then its staff.
 * A side with no local command uses the department compiling its opening
 * picture, or the department of its filter/office in packs without a bulletin. */
function reportingPost(ctx: TickContext, state: State, faction: FactionId, blocks: readonly ForceBlockId[]): PostId | null {
  const local = sideCommand(state, blocks, ctx.world.map.forceTotalsCache);
  if (local.person !== null) return local.post;
  const posts = Object.keys(state.postStates).sort(strictCompare) as PostId[];
  const office = ctx.world.start.openingControl?.authors.find(a => a.faction === faction)?.post;
  const filter = filterPostOf(ctx.world, state, faction);
  const serving = (post: PostId) => {
    const p = state.postStates[post]!;
    return p.postHolder !== null && (state.personStatus[p.postHolder]?.statusKind ?? 'serving') === 'serving' && postFaction(ctx.world, state, post) === faction;
  };
  const offices = posts.filter(p => !isFieldPost(ctx.world, state, p) && p !== filter && serving(p));
  const department = state.postStates[local.post ?? office ?? filter ?? offices[0]!]?.postDepartment;
  for (let post = local.post; post !== null; post = state.postStates[post]?.postParent ?? null) {
    if (state.postStates[post]?.postDepartment !== department) break;
    if (serving(post)) return post;
  }
  const candidates = [...(office === undefined ? [] : [office]), ...offices, ...(filter === null ? [] : [filter])];
  return candidates.find(post => state.postStates[post]?.postDepartment === department && serving(post)) ?? null;
}

export function controlReports(ctx: TickContext, state: State, before: RegionControlTable): void {
  const threshold = ctx.world.map.world.rules.supplyControlPermille;
  const changed = new Set<RegionId>();
  const crossed = new Set<RegionId>();
  for (const event of ctx.mapEvents) {
    if (event.event === 'control_changed') changed.add(event.change.region);
    if (event.event === 'threshold_crossed') crossed.add(event.crossing.region);
  }
  const regions = [...changed].filter(region => crossed.has(region) || holdingOf(ctx.world.map, before, region, threshold).holder !== holdingOf(ctx.world.map, state.regionControl, region, threshold).holder).sort(strictCompare);
  if (regions.length === 0) return;
  const presence = presenceByRegion({ map: ctx.world.map }, state);
  const factions = ctx.world.map.world.factions.map(f => f.id);
  for (const region of regions) {
    const claims = controlClaims(region, state.regionControl[region] ?? {}, factions);
    const affected = new Set([...Object.keys(before[region] ?? {}), ...Object.keys(state.regionControl[region] ?? {})] as FactionId[]);
    for (const event of ctx.mapEvents) if (event.event === 'control_changed' && event.change.region === region) affected.add(event.change.faction);
    for (const faction of [...affected].sort(strictCompare)) {
      if (!ctx.world.factionIds.includes(faction)) continue;
      const principal = ctx.world.faction(faction).principal;
      // A commander's evening dispatch or governor's wire already reports
      // this snapshot to this principal; do not manufacture corroboration.
      if (ctx.outbox.some(m => (m.msgTo === principal || m.msgPending.some(h => h.hopPerson === principal)) && m.msgReport?.reportClaims.some(c => c.claimKind === 'control' && c.claimRegion === region))) continue;
      const blocks = presence.get(region)?.find(p => p.faction === faction)?.blocks ?? [];
      const post = reportingPost(ctx, state, faction, blocks);
      if (post === null) continue; // No serving commander or department staff can sign it.
      const author = state.postStates[post]!.postHolder!;
      sendReport(ctx, state, {
        body: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: author, reportAuthorPost: post,
          reportSubjectKind: 'region', reportSubjectId: region, reportClaims: claims, reportDay: ctx.day, reportHour: null, reportAdvice: null, reportAnswers: null },
        truth: { truthTerms: claims.map(c => term('observed', c.claimValue, { region, post, rule: `control:${c.claimToken}` })), truthTrimmed: [] },
        to: principal,
        tag: `control.${region}.${faction}`,
        ...(blocks.some(b => state.forceAssignments[b] === post) ? { fromRegion: region } : {}),
      });
    }
  }
}
