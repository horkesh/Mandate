/**
 * STAND-IN: build the seats layer's World from an M2 scenario file, so the
 * testbed pack (and any M2 pack) runs on the new seats, knowledge and log
 * before lane 0.2's World format exists. Lane 0.2 replaces this adapter with
 * its pack loader.
 *
 * Mapping, stated so it can be checked:
 * - each region keeps its neighbours; a link takes 1 day, except a link
 *   between a faction's capital and a region whose post has `linkDays` above 1,
 *   which takes `linkDays` (M2's days for a message between them);
 * - the wire reaches every capital and every region whose posts have `linkDays` of 1 or less;
 * - each field post answers to its faction's first office post (by id), and
 *   offices answer to the principal;
 * - each faction gets an empty filter post at its capital (an empty filter
 *   post is how the March 1861 start begins, decision 0040);
 * - a faction's objective is the other side's capital when there are exactly two factions;
 * - strengths are M2's post `force`; people keep boldness, regard and values,
 *   with no intelligence bias.
 */
import { strictCompare } from '../compare.ts';
import { toId, type PostId, type RegionId } from '../ids.ts';
import type { ScenarioData } from '../scenario.ts';
import { DEFAULT_COMMS_RULES, type CommsLink, type CommsPost, type CommsRules, type CommsWorld } from './world.ts';

export function commsWorldFromScenario(data: ScenarioData, rules: CommsRules = DEFAULT_COMMS_RULES): CommsWorld {
  const capitals = new Set(data.factions.map((f) => f.capitalRegionId));
  const slow = new Map<string, number>();
  for (const p of data.posts) slow.set(p.regionId, Math.max(slow.get(p.regionId) ?? 0, p.linkDays));
  const linkDays = (a: string, b: string): number => {
    if (capitals.has(a) && (slow.get(b) ?? 0) > 1) return slow.get(b)!;
    if (capitals.has(b) && (slow.get(a) ?? 0) > 1) return slow.get(a)!;
    return 1;
  };
  const regions = data.regions.map((r) => ({
    id: toId('region', r.id),
    neighbours: [...r.neighbours].sort(strictCompare).map((n): CommsLink => ({ to: toId('region', n), days: linkDays(r.id, n) })),
    wired: capitals.has(r.id) || data.posts.some((p) => p.regionId === r.id && p.linkDays <= 1),
  }));
  const officeOf = new Map<string, PostId>();
  for (const p of [...data.posts].sort((a, b) => strictCompare(a.id, b.id))) {
    if (p.kind === 'office' && !officeOf.has(p.factionId)) officeOf.set(p.factionId, toId('post', p.id));
  }
  const posts: CommsPost[] = data.posts.map((p) => ({
    id: toId('post', p.id),
    faction: toId('faction', p.factionId),
    kind: p.kind,
    region: toId('region', p.regionId),
    holder: p.holderId === null ? null : toId('person', p.holderId),
    superior: p.kind === 'field' ? officeOf.get(p.factionId) ?? null : null,
    strength: p.force,
    intelligenceChief: null,
  }));
  for (const f of data.factions) {
    posts.push({
      id: toId('post', `${f.id}_wire_filter`),
      faction: toId('faction', f.id),
      kind: 'filter',
      region: toId('region', f.capitalRegionId),
      holder: null,
      superior: null,
      strength: 0,
      intelligenceChief: null,
    });
  }
  const objective = (factionId: string): RegionId | null => {
    if (data.factions.length !== 2) return null;
    const other = data.factions.find((f) => f.id !== factionId)!;
    return toId('region', other.capitalRegionId);
  };
  return {
    regions,
    factions: data.factions.map((f) => ({
      id: toId('faction', f.id),
      principal: toId('person', f.principalId),
      seatRegion: toId('region', f.capitalRegionId),
      objective: objective(f.id),
    })),
    posts: posts.sort((a, b) => strictCompare(a.id, b.id)),
    persons: data.persons.map((p) => ({
      id: toId('person', p.id),
      faction: toId('faction', p.factionId),
      boldness: p.boldness,
      regard: p.regard,
      values: [...p.values],
      intelligenceBias: 1000,
    })),
    rules,
  };
}
