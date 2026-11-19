import { sideOfPerson } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import { initialControl } from '../control/control.ts';
import type { FactionId, SeatId } from '../ids.ts';
import { createIdMint, mintMessageId } from '../messages/transit.ts';
import type { State } from '../root-state.ts';
import { seatIds } from '../seats/seats.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { controlClaims } from './control-claims.ts';
import { fileOpeningReports, type KnownReport } from './knowledge.ts';
import type { ReportClaim } from './report.ts';

/** File the authors' day-zero copies of the opening picture with each seat. */
export function fileOpeningControl(world: SeatsWorld, startState: State): State {
  const { start, map } = world;
  const opening = start.openingControl;
  if (opening === undefined) return startState;
  const rows = opening.table ?? start.control;
  const table = opening.table === undefined ? startState.regionControl : initialControl(map, { ...start, control: opening.table });
  const factions = map.world.factions.map((f) => f.id);
  const claims = [...rows].sort((a, b) => strictCompare(a.region, b.region)).flatMap((row) => {
    const { region } = row;
    const shares = Object.hasOwn(table, region) ? table[region]! : {};
    const out = controlClaims(region, shares, factions);
    const government = opening.table === undefined
      ? (Object.hasOwn(startState.regionGovernments, region) ? startState.regionGovernments[region] : undefined)
      : undefined; // A control-only override supplies no government claim.
    if (government !== undefined && government !== 'unknown') {
      const neutral = startState.departmentFactions[government] === null;
      const claim: ReportClaim = { claimKind: 'control-government', claimRegion: region, claimValue: neutral ? 1 : 0, claimToken: government, claimConfidence: 1000 };
      out.push(claim);
    }
    return out;
  });
  const reports = new Map<FactionId, KnownReport>();
  const mint = createIdMint(startState);
  for (const row of [...opening.authors].sort((a, b) => strictCompare(a.faction, b.faction))) {
    const post = Object.hasOwn(startState.postStates, row.post) ? startState.postStates[row.post] : undefined;
    if (post?.postHolder === undefined || post.postHolder === null || startState.departmentFactions[post.postDepartment] !== row.faction) {
      throw new RangeError(`opening control author ${row.post} must be a filled post of ${row.faction}`);
    }
    if (reports.has(row.faction)) throw new RangeError(`two opening control authors for ${row.faction}`);
    reports.set(row.faction, {
      id: mintMessageId(mint, 0, post.postHolder, post.postHolder, 'opening-control'),
      knownReceivedDay: 0,
      knownRoute: 'in-person',
      knownVia: [],
      knownBody: {
        reportType: 'informal', reportSubtype: 'cabinet-word', reportAuthor: post.postHolder, reportAuthorPost: row.post,
        reportSubjectKind: 'post', reportSubjectId: row.post, reportClaims: claims,
        reportDay: 0, reportHour: null, reportAdvice: null, reportAnswers: null,
      },
    });
  }
  for (const { faction } of start.factions) {
    if (!reports.has(faction)) throw new RangeError(`opening control has no report author for ${faction}`);
  }
  // An unaffiliated seat gets the same country picture from the first playable office by faction id.
  const publicFaction = start.factions.filter((f) => f.playable).map((f) => f.faction).sort(strictCompare)[0];
  const publicReport = (publicFaction === undefined ? undefined : reports.get(publicFaction)) ?? reports.values().next().value;
  if (publicReport === undefined) return startState;
  const copies = new Map<SeatId, KnownReport>();
  for (const seat of seatIds(startState)) {
    const side = sideOfPerson(map, startState, startState.seatAssignments[seat]!.seatPerson);
    copies.set(seat, (side === null ? undefined : reports.get(side)) ?? publicReport);
  }
  return fileOpeningReports(startState, copies, claims);
}
