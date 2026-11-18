/**
 * Battle reports (lane 1.4; FOUNDATION section 9's night of the battle; 0032; 0074 and 0076 on what returns may say).
 * Written at the end of the day from the battle records the day made, each with its truth terms beside it, so the
 * reckoning can set what the president was told against what happened:
 *
 * - **Hour-stamped dispatches.** Each side's commander wires his principal at the end of each of the day's four phases
 *   (`combat/shape.ts`), stamped with the phase's hour. He is optimistic and silent on his losses: he says the day goes
 *   well unless his flank broke in that phase or he leaves the field that evening, and gives the enemy as he sees him (his
 *   perception bias). The messages carry their hour; the kernel stays daily (0027).
 * - **The casualty return.** The evening's first return, by courier, puts his killed and wounded below the truth by the
 *   pack's share (the first figure runs low: Fredericksburg's "ten thousand"), and counts the day's captured among the
 *   missing (0074, 0076: the player's first return reports the captured as missing). It claims the enemy's losses as he
 *   sees them, inflated by his perception. A later return, the pack's days after, gives the full figures, the captured
 *   apart. A force destroyed in a failed breakout is never reported as killed: its men are captured, and so reported.
 * - **The governor's wire.** A battle in a state's ground reaches the principal by its governor's wire too: what he
 *   hears, that a battle was fought and who held the field, with no figures. Never from a self-governing nation's head
 *   (0069, 0070), who is no side's governor.
 * - **A pocket closed.** A commander whose headquarters a closing pocket takes wires that he is cut off.
 *
 * The author of a side's reports is the holder of its post today (the commander, or whoever took the post after he was
 * hit); a post left vacant sends none. No report draws from a stream (0007): every number is a function of the record,
 * the man and the pack's rules.
 */
import { strictCompare } from '../compare.ts';
import { battleVerdict, dayShape } from '../combat/shape.ts';
import type { BattleDay, BattleSide } from '../combat/records.ts';
import { holdingOf } from '../control-index/control-index.ts';
import type { RegionControlTable } from '../control/vocabulary.ts';
import type { FactionId, PersonId, PostId, RegionId } from '../ids.ts';
import { controlClaims } from '../knowledge/control-claims.ts';
import type { ReportBody, ReportClaim } from '../knowledge/report.ts';
import { term, type BiasTerm } from '../knowledge/truth.ts';
import { isSelfGoverning } from '../command/command.ts';
import { perceptionBias, traitsOf } from '../people/traits.ts';
import type { State } from '../root-state.ts';
import { headquartersOf, fieldPosts, postFaction } from '../seats/posts.ts';
import { fire, sendReport, type TickContext } from './context.ts';

const claim = (kind: ReportClaim['claimKind'], region: RegionId | null, value: number, token: string | null, confidence: number): ReportClaim => ({
  claimKind: kind,
  claimRegion: region,
  claimValue: value,
  claimToken: token,
  claimConfidence: confidence,
});

function body(author: PersonId, post: PostId | null, day: number, hour: number | null, type: ReportBody['reportType'], subtype: string | null, region: RegionId, claims: readonly ReportClaim[]): ReportBody {
  return { reportType: type, reportSubtype: subtype, reportAuthor: author, reportAuthorPost: post, reportSubjectKind: 'region', reportSubjectId: region, reportClaims: claims, reportDay: day, reportHour: hour, reportAdvice: null, reportAnswers: null };
}

/** Who writes a side's reports today: the holder of its post, or of the post above it, or nobody. */
function authorOf(state: State, side: BattleSide): { readonly person: PersonId; readonly post: PostId } | null {
  for (let post = side.bsidePost; post !== null; post = state.postStates[post]?.postParent ?? null) {
    const holder = state.postStates[post]?.postHolder ?? null;
    if (holder !== null && (state.personStatus[holder]?.statusKind ?? 'serving') === 'serving') return { person: holder, post };
  }
  return null;
}

/** The side's men captured and missing, as a first return counts them (the captured among the missing) and as the truth splits them. */
export function firstReturnFigures(side: BattleSide, lowPermille: number): { readonly kw: number; readonly missing: number; readonly terms: readonly BiasTerm[] } {
  const kw = Math.trunc((side.bsideKw * (1000 - lowPermille)) / 1000);
  const missing = side.bsideMissing + side.bsideCaptured;
  return {
    kw,
    missing,
    terms: [term('observed', side.bsideKw, { rule: 'killed_wounded' }), term('return_understated', side.bsideKw - kw, { rule: 'first_return' }), term('return_understated', side.bsideCaptured, { rule: 'captured_as_missing' })],
  };
}

/** The day's battle reports (end of day, before cyclic reports). */
export function battleReports(ctx: TickContext, state: State, controlBefore: RegionControlTable): void {
  const { world, day } = ctx;
  const rules = world.map.world.rules;
  const returns = rules.operations.returns;
  for (const id of Object.keys(state.battleRecords).sort(strictCompare)) {
    const record = state.battleRecords[id]!;
    const region = record.battleRegion;
    for (const bday of record.battleDays) {
      if (bday.bdayDay === day) {
        const { field } = battleVerdict(record);
        const threshold = rules.supplyControlPermille;
        const changedHands = field !== null && holdingOf(world.map, controlBefore, region, threshold).holder !== field && holdingOf(world.map, state.regionControl, region, threshold).holder === field;
        const control = changedHands ? controlClaims(region, state.regionControl[region]!, world.map.world.factions.map((f) => f.id)) : [];
        dispatches(ctx, state, region, bday, control);
        firstReturns(ctx, state, region, bday, returns.firstLowPermille);
        governorWire(ctx, state, region, bday, field, control);
      }
      if (bday.bdayDay === day - returns.revealDays) fullReturns(ctx, state, region, bday);
    }
  }
  pocketReports(ctx, state);
}

/** Each commander's wires at the end of each phase, stamped with its hour. */
function dispatches(ctx: TickContext, state: State, region: RegionId, bday: BattleDay, control: readonly ReportClaim[]): void {
  const shape = dayShape(ctx.world.map.world.rules.combat, bday);
  bday.bdaySides.forEach((side, i) => {
    const author = authorOf(state, side);
    if (author === null) return;
    const enemy = bday.bdaySides[1 - i]!;
    const bias = perceptionBias(ctx.world.rules.traits, traitsOf(ctx.world, state, author.person));
    const seen = Math.trunc((enemy.bsidePresent * bias.permille) / 1000);
    for (const phase of shape.phases) {
      const mine = phase.sides[i]!;
      const well = mine.flankBreaks || mine.leaves || mine.surrenders || mine.destroyed ? 0 : 1;
      const field = phase === shape.phases.at(-1) ? control : [];
      sendReport(ctx, state, {
        body: body(author.person, author.post, ctx.day, phase.toHour, 'wire-dispatch', null, region, [claim('battle-phase', region, well, phase.phase, 600), claim('enemy-strength', region, seen, null, 500), ...field]),
        truth: { truthTerms: [term('observed', enemy.bsidePresent, { region }), ...bias.terms, term('observed', mine.killedWounded, { region, rule: `${phase.phase}:killed_wounded_unsaid` }), ...observedControl(region, field)], truthTrimmed: [] },
        to: ctx.world.faction(side.bsideFaction).principal,
        tag: `battle.${phase.phase}.${side.bsideFaction}`,
      });
      fire(ctx, 'reports.battle_dispatch');
    }
  });
}

/** The evening's first casualty return: his losses low, the captured among the missing, the enemy's as he sees them. */
function firstReturns(ctx: TickContext, state: State, region: RegionId, bday: BattleDay, lowPermille: number): void {
  bday.bdaySides.forEach((side, i) => {
    const author = authorOf(state, side);
    if (author === null) return;
    const enemy = bday.bdaySides[1 - i]!;
    const own = firstReturnFigures(side, lowPermille);
    const bias = perceptionBias(ctx.world.rules.traits, traitsOf(ctx.world, state, author.person));
    const claimed = Math.trunc((enemy.bsideKw * bias.permille) / 1000);
    sendReport(ctx, state, {
      body: body(author.person, author.post, ctx.day, null, 'casualty-return', null, region, [
        claim('own-losses', region, own.kw, 'first', 600),
        claim('missing', region, own.missing, 'first', 500),
        claim('casualties', region, claimed, 'enemy', 400),
      ]),
      truth: { truthTerms: [...own.terms, term('observed', enemy.bsideKw, { region, rule: 'enemy_killed_wounded' }), term('claim_inflated', claimed - enemy.bsideKw, { person: author.person, region }), ...bias.terms], truthTrimmed: [] },
      to: ctx.world.faction(side.bsideFaction).principal,
      tag: `return.first.${side.bsideFaction}`,
    });
    fire(ctx, 'reports.casualty_return');
  });
}

/** The later return: the full figures, killed and wounded apart, the missing and the captured apart (0074). */
function fullReturns(ctx: TickContext, state: State, region: RegionId, bday: BattleDay): void {
  for (const side of bday.bdaySides) {
    const author = authorOf(state, side);
    if (author === null) continue;
    sendReport(ctx, state, {
      body: body(author.person, author.post, ctx.day, null, 'casualty-return', null, region, [
        claim('own-losses', region, side.bsideKw, 'full', 900),
        claim('missing', region, side.bsideMissing, 'full', 800),
        claim('captured', region, side.bsideCaptured, 'full', 800),
      ]),
      truth: { truthTerms: [term('observed', side.bsideKilled, { region, rule: 'killed' }), term('observed', side.bsideWounded, { region, rule: 'wounded' })], truthTrimmed: [] },
      to: ctx.world.faction(side.bsideFaction).principal,
      tag: `return.full.${side.bsideFaction}`,
    });
    fire(ctx, 'reports.casualty_return');
  }
}

/** A governor whose state's ground saw a battle wires his principal that it was fought, and who held the field. */
function governorWire(ctx: TickContext, state: State, region: RegionId, bday: BattleDay, field: FactionId | null, control: readonly ReportClaim[]): void {
  const government = state.regionGovernments[region];
  if (government === undefined || government === 'unknown') return;
  // A self-governing nation's head is never a side's subordinate governor (0069, 0070; gate review G-1.4a), as lane 1.7's recruitment skips him.
  if (isSelfGoverning(ctx.world.map, government)) return;
  for (const post of Object.keys(state.postStates).sort(strictCompare) as PostId[]) {
    const p = state.postStates[post]!;
    if (p.postDepartment !== government || p.postHolder === null || p.postParent !== null) continue;
    const side = postFaction(ctx.world, state, post);
    if (side === null || !ctx.world.factionIds.includes(side) || !bday.bdaySides.some((s) => s.bsideFaction === side)) continue;
    sendReport(ctx, state, {
      body: body(p.postHolder, post, ctx.day, null, 'informal', 'governor-wire', region, [claim('operation', region, field === side ? 1 : 0, 'battle', 400), ...control]),
      truth: { truthTerms: observedControl(region, control), truthTrimmed: [] },
      to: ctx.world.faction(side).principal,
      tag: `governor.battle.${post}`,
    });
    fire(ctx, 'reports.governor_wire');
  }
}

function observedControl(region: RegionId, claims: readonly ReportClaim[]): BiasTerm[] {
  return claims.map((c) => term('observed', c.claimValue, { region, rule: `control:${c.claimToken}` }));
}

/** Commanders a pocket closed on today wire that they are cut off (0054: the report, not the event, is the decision point). */
function pocketReports(ctx: TickContext, state: State): void {
  for (const e of ctx.mapEvents) {
    if (e.event !== 'pocket_closed') continue;
    for (const post of fieldPosts(ctx.world, state)) {
      if (postFaction(ctx.world, state, post) !== e.faction) continue;
      const holder = state.postStates[post]!.postHolder;
      const hq = headquartersOf(ctx.world, state, post);
      if (holder === null || !e.regions.includes(hq) || !ctx.world.factionIds.includes(e.faction)) continue;
      sendReport(ctx, state, {
        body: body(holder, post, ctx.day, null, 'wire-dispatch', null, hq, [claim('pocket', hq, 1, null, 900)]),
        truth: { truthTerms: [], truthTrimmed: [] },
        to: ctx.world.faction(e.faction).principal,
        tag: `pocket.${post}`,
      });
      fire(ctx, 'reports.pocket');
    }
  }
}

/** Every mechanic battle reports count. */
export const BATTLE_REPORT_MECHANICS = ['reports.battle_dispatch', 'reports.casualty_return', 'reports.governor_wire', 'reports.pocket'] as const;
