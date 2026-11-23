import { enlistmentsOf } from '../forces/enlistment.ts';
import { forceTotals } from '../forces/lots.ts';
/**
 * Select an existing enlistment for a sourced voluntary remuster; never creates or divides a unit.
 * STAND-IN(unit-remuster-consent; owner: 1B, recruitment and service): a sourced collective remuster
 * retains the unit's modeled strength; individual consent and replacement decisions are not represented in 1A.
 */
import { strictCompare } from '../compare.ts';
import type { FactionId, ForceBlockId } from '../ids.ts';
import type { State } from '../root-state.ts';
import type { SeatsWorld } from '../seats/world.ts';
import type { EnlistmentRenewal } from '../situations/types.ts';
import { daysFromCivil, parseIsoDate } from '../world/calendar.ts';

export function renewableBlock(world: SeatsWorld, state: State, side: FactionId, r: EnlistmentRenewal, day: number): ForceBlockId | undefined {
  const post = state.postStates[r.post];
  const department = world.map.world.departments.find(d => d.id === post?.postDepartment);
  const kind = world.map.world.vocabularies.departmentKinds.find(k => k.id === department?.kind);
  if (post === undefined || post.postSeat === null || state.departmentFactions[post.postDepartment] !== side || kind?.selfGoverning === true ||
    !world.map.world.rules.recruitment.raisingPostKinds.includes(post.postKind) ||
    !world.map.world.vocabularies.arms.some(a => a.id === r.arm && !a.naval) ||
    !Number.isSafeInteger(r.regiments) || r.regiments < 1 || !Number.isSafeInteger(r.fromTermDays) || r.fromTermDays < 1 ||
    !Number.isSafeInteger(r.termDays) || r.termDays <= r.fromTermDays || r.termDays > world.map.world.rules.recruitment.maxTermDays || state.calendarStart === null) return undefined;
  let latest: number;
  try { latest = daysFromCivil(parseIsoDate(r.musteredBy)) - daysFromCivil(parseIsoDate(state.calendarStart)); } catch { return undefined; }
  const entries = enlistmentsOf(state, world.map.forceServiceCache);
  return (Object.keys(entries) as ForceBlockId[]).filter(id => {
    const e = entries[id]!;
    const b = state.forceBlockStates[id];
    return e.enlPost === r.post && e.enlRegiments === r.regiments && e.enlTermUnknown !== true &&
      e.enlMusterDay <= latest && e.enlMusterDay <= day && e.enlEndsDay !== null && e.enlEndsDay > day && e.enlEndsDay - e.enlMusterDay === r.fromTermDays &&
      b !== undefined && b.fbLots.every(l=>l.lotService?.enlRegiments===r.regiments&&l.lotService.enlCall===e.enlCall&&l.lotService.enlPost===r.post) && b.fbParent === null && b.fbArm === r.arm && b.fbSurrenderedDay === null && forceTotals(b, world.map.forceTotalsCache).fbStrength !== 0 && state.departmentFactions[b.fbDepartment] === side;
  }).sort((a, b) => entries[a]!.enlMusterDay - entries[b]!.enlMusterDay || strictCompare(a, b))[0];
}
