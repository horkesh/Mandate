/**
 * The Phase 0 liveness gate (FOUNDATION section 11.5; lane 0.8): every mechanic
 * the tick and the map declare has a plausible band in a reference run, and a
 * mechanic that never fires where its band says it should is a bug even when
 * the scores look good.
 *
 * The reference runs are deterministic, so a band is not a statistical bound:
 * it is a guard that a calibration change cannot silently turn a mechanic off
 * (or make it fire ten times as often) without someone moving the band and
 * saying why. Bands are about half to double what the run showed when they
 * were set (`around`).
 *
 * Every mechanic must fire in at least one reference run, or else it is in
 * `QUIET` with the reason it does not, and the kernel test that drives it. A
 * band of zero is never a shrug: it carries its reason (`why`), and the gate's
 * own test checks the named kernel test exists.
 *
 * The planner's scoring terms are counted over edits as well as drafts once the
 * planner moves into the kernel (0062, Phase 1), or `haste` reads as dead.
 */
import { checkLiveness, phase0, type LivenessBand, type LivenessFailure, type LivenessRow } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsMechanics } from './seats-world.ts';

export interface GateBand extends LivenessBand {
  /** Required when `minFires` is 0: why this mechanic is quiet in this run. */
  readonly why?: string;
}

/**
 * A reference run: the pack, how long it plays, who sits in the seats, and its bands.
 * A `full` run has a band for every mechanic. An `exercise` run changes the seats to make a mechanic fire that
 * the full runs leave quiet, and bands only that mechanic.
 */
export interface ReferenceRun {
  readonly name: string;
  readonly kind: 'full' | 'exercise';
  readonly pack: string;
  readonly days: number;
  /** Started at war by the labelled mechanics-run option (0064). */
  readonly atWar: boolean;
  readonly seats: SeatsName;
  readonly bands: Readonly<Record<string, GateBand>>;
}

/** `rules`: every seat on the rules model. `silent-commanders`: commanders leave their standing-goal requests unanswered. */
export type SeatsName = 'rules' | 'silent-commanders';

/** The seat table a reference run's `seats` names. */
export function seatsNamed(name: SeatsName): phase0.SeatTable {
  const rules = createRuleSeat();
  if (name === 'rules') return () => rules;
  const silent = Object.freeze({
    driver: 'rules' as const,
    respond: (request: Parameters<typeof rules.respond>[0]) => (request.menu.menuKind === 'standing-goal' ? { answerKind: 'commands' as const, commands: [] } : rules.respond(request)),
  });
  return () => silent;
}

/** Why a mechanic that fires in no reference run does not, and the kernel test that drives it. */
export interface QuietReason {
  readonly why: string;
  /** Repository-relative path of the kernel test that drives the mechanic. */
  readonly test: string;
  /** Text that test must contain, so a renamed or deleted test fails the gate's own check. */
  readonly needle: string;
}

/** Half to double what the run showed, never below one firing. */
function around(n: number): GateBand {
  if (n < 1) throw new RangeError('around() is for a mechanic that fires; use quiet()');
  return { minFires: Math.max(1, Math.floor(n / 2)), maxFires: Math.max(n * 2, n + 3) };
}

/** A mechanic that stays at zero in this run, with the reason. */
function quiet(why: string): GateBand {
  return { minFires: 0, maxFires: 0, why };
}

/** A mechanic that could fire in this run but does not here; it may start to without a band moving. */
function notHere(why: string): GateBand {
  return { minFires: 0, why };
}

const SITUATIONS_UNAUTHORED = 'union-1861 has no situations authored until the March 1861 authoring lane (0042, 0046); the testbed run exercises them';
const VALUES_EMPTY = 'quiet by design on v2 packs until Phase 1 gives people values and regard (0058); the kernel test drives it through explicit trait inputs';
const NO_PROPOSER = 'nothing proposes it yet: situations, raids and operations arrive in Phase 1; the kernel test drives it';

/** Mechanics that fire in neither reference run: the reason, and the kernel test that proves the mechanic is alive. */
export const QUIET: Readonly<Record<string, QuietReason>> = {
  'command.government_closed': { why: 'no pack situation closes a neutral government yet (the closing of a neutral government waits for authored situations)', test: 'packages/kernel/test/governments.test.ts', needle: 'takes the default "close" on day 2' },
  'command.government_reopened': { why: 'no pack situation reopens one yet', test: 'packages/kernel/test/governments.test.ts', needle: 'reopening and repeats are plain' },
  'command.proposal_refused': { why: 'a refusal needs a proposal that cannot be applied; honest situations propose none', test: 'packages/kernel/test/governments.test.ts', needle: 'refuses what it cannot be' },
  'commands.rejected': { why: 'rule seats send only commands the menu offers; a bad command is a seat bug', test: 'packages/kernel/test/seats-orders.test.ts', needle: 'rejects commands the kernel cannot carry' },
  'infrastructure.changed': { why: NO_PROPOSER, test: 'packages/kernel/test/infrastructure.test.ts', needle: 'damages and repairs edges and depots' },
  'map.pocket_lost': { why: 'a pocket is overrun only when a contest takes its ground; the reference runs close none that stays closed', test: 'packages/kernel/test/map-tick.test.ts', needle: 'reports an overrun pocket as lost' },
  'map.pocket_relieved': { why: 'a pocket is relieved when a repair or a closing reverses; nothing reverses one in these runs', test: 'packages/kernel/test/map-tick.test.ts', needle: 'then its opening' },
  'orders.bypassed': { why: 'the rule-seat principal goes around an office only when it objects, and nothing objects until values exist (0058)', test: 'packages/kernel/test/seats-orders.test.ts', needle: 'goes around the chain by special messenger' },
  'orders.conflict': { why: 'a conflict needs two issuers, a chain order and one sent around it; here only the principal orders', test: 'packages/kernel/test/seats-orders.test.ts', needle: 'conflicting orders: one down the chain, one around it' },
  'orders.relay_held': { why: VALUES_EMPTY, test: 'packages/kernel/test/seats-orders.test.ts', needle: 'relays a forwarded order with the relayer' },
  'orders.relay_objected': { why: VALUES_EMPTY, test: 'packages/kernel/test/seats-orders.test.ts', needle: 'relays through the office, whose holder objects' },
  'reports.filtered': { why: VALUES_EMPTY, test: 'packages/kernel/test/seats-orders.test.ts', needle: 'holds a wire for a day and cuts the losses from it' },
  'reports.trimmed': { why: VALUES_EMPTY, test: 'packages/kernel/test/seats-orders.test.ts', needle: 'holds a wire for a day and cuts the losses from it' },
  'situations.lapsed': { why: 'a lapse needs every option to expire unanswered; a rule-driven principal takes defaults at once (0057)', test: 'packages/kernel/test/situations.test.ts', needle: 'expires an option, resurfaces on its clock, and lapses' },
  'situations.options_changed': { why: 'an option changes only for a situation left open past an appearance or expiry; the rule-driven principal does not leave one open (0057)', test: 'packages/kernel/test/situations.test.ts', needle: 'a waiting option defers the decision until its condition holds' },
  'situations.resurfaced': { why: 'a resurfacing follows a wait or expiry the rule-driven principal does not choose (0057)', test: 'packages/kernel/test/situations.test.ts', needle: 'expires an option, resurfaces on its clock' },
  'situations.waiting': { why: 'waiting is an option a human takes; the rule-driven principal takes the historical default (0057)', test: 'packages/kernel/test/situations.test.ts', needle: 'waits for news to reach the principal' },
};

/** What a pack at peace never does: no order is given, so no force marches, no ground is contested. */
const PEACE_QUIET: readonly string[] = ['orders.relayed', 'orders.obeyed', 'plans.goal_reached', 'movement.leg_started', 'movement.arrived', 'combat.contest', 'combat.occupation', 'control.changed'];

/** The union-1861 reference run: 75 days from 5 March 1861, at war (the war gate's labelled option, 0064). */
const UNION_BANDS: Record<string, GateBand> = {
  'combat.contest': around(62),
  'combat.occupation': around(29),
  'combat.retreat': notHere('no side is pressed below the retreat threshold in 75 days; the testbed run fires it'),
  'combat.retreat_blocked': around(57),
  'control.changed': around(36),
  'control.threshold_crossed': around(6),
  'forces.stores_fell': around(7),
  'forces.stores_low': around(1),
  'forces.stores_refilled': notHere('most Union blocks have unknown stores (lane 0.3 data, lane 0.5 finding 3), so the few that fall do not refill in 75 days; the testbed run fires it'),
  'knowledge.pruned_age': around(2),
  'knowledge.pruned_superseded': around(73),
  'map.pocket_closed': notHere('no pocket closes in the first 75 days of the Union run; the testbed run fires it'),
  'map.recomputed': around(10),
  'messages.courier_delay': around(197),
  'messages.delivered': around(2681),
  'messages.sent': around(2820),
  'messages.special_messenger': notHere('the principal goes round an office only when it objects; the testbed run fires it'),
  'movement.arrived': around(36),
  'movement.leg_started': around(27),
  'orders.obeyed': around(2),
  'orders.relayed': around(3),
  'plans.goal_reached': around(2),
  'seats.choices': around(1),
  'seats.defaulted': notHere('every request is answered in this run; the silent-seats exercise run fires it'),
  'situations.decided': quiet(SITUATIONS_UNAUTHORED),
  'situations.delegated': quiet(SITUATIONS_UNAUTHORED),
  'situations.fired': quiet(SITUATIONS_UNAUTHORED),
  'situations.notice_reports': quiet(SITUATIONS_UNAUTHORED),
  'situations.noticed': quiet(SITUATIONS_UNAUTHORED),
  'situations.orders': quiet(SITUATIONS_UNAUTHORED),
  'situations.proposals': quiet(SITUATIONS_UNAUTHORED),
  'situations.staff_lines': quiet(SITUATIONS_UNAUTHORED),
  'situations.surfaced': quiet(SITUATIONS_UNAUTHORED),
};

/** The testbed reference run: 120 days from day 1, at war from the start (the testbed names no war chain). */
const TESTBED_BANDS: Record<string, GateBand> = {
  'combat.contest': around(14),
  'combat.occupation': around(6),
  'combat.retreat': around(2),
  'combat.retreat_blocked': notHere('retreats are blocked only where a contested side has nowhere to go; the Union run fires it'),
  'control.changed': around(20),
  'control.threshold_crossed': around(12),
  'forces.stores_fell': around(176),
  'forces.stores_low': around(7),
  'forces.stores_refilled': around(185),
  'knowledge.pruned_age': around(7),
  'knowledge.pruned_superseded': around(118),
  'map.pocket_closed': around(1),
  'map.recomputed': around(14),
  'messages.courier_delay': around(85),
  'messages.delivered': around(1812),
  'messages.sent': around(1829),
  'messages.special_messenger': around(1),
  'movement.arrived': around(18),
  'movement.leg_started': around(7),
  'orders.obeyed': around(3),
  'orders.relayed': around(3),
  'plans.goal_reached': around(2),
  'seats.choices': around(1),
  'seats.defaulted': notHere('every request is answered in this run; the silent-seats exercise run fires it'),
  'situations.decided': around(3),
  'situations.delegated': around(1),
  'situations.fired': around(6),
  'situations.notice_reports': around(3),
  'situations.noticed': around(3),
  'situations.orders': around(1),
  'situations.proposals': around(5),
  'situations.staff_lines': around(3),
  'situations.surfaced': around(6),
};

/** Mechanics that only a mechanic-specific run can fire: each band is the same in every run that does not. */
function withQuiet(bands: Record<string, GateBand>): Record<string, GateBand> {
  const out: Record<string, GateBand> = { ...bands };
  for (const [mechanic, reason] of Object.entries(QUIET)) {
    if (!(mechanic in out)) out[mechanic] = quiet(reason.why);
  }
  return out;
}

export const REFERENCE_RUNS: readonly ReferenceRun[] = [
  { name: 'union-1861 at war, 75 days', kind: 'full', pack: 'union-1861', days: 75, atWar: true, seats: 'rules', bands: withQuiet(UNION_BANDS) },
  { name: 'testbed, 120 days', kind: 'full', pack: 'testbed', days: 120, atWar: false, seats: 'rules', bands: withQuiet(TESTBED_BANDS) },
  { name: 'testbed, commanders silent, 120 days', kind: 'exercise', pack: 'testbed', days: 120, atWar: false, seats: 'silent-commanders', bands: { 'seats.defaulted': around(1) } },
  {
    name: 'union-1861 at peace, 75 days (the war gate, 0064)',
    kind: 'exercise',
    pack: 'union-1861',
    days: 75,
    atWar: false,
    seats: 'rules',
    bands: Object.fromEntries(PEACE_QUIET.map((m) => [m, quiet(`union-1861 keeps the peace until the war's opening situation, which is not authored yet (0064): the rule-seat principal orders nothing`)])),
  },
];

/** The full reference run a runner's options name, if any. */
export function referenceRunFor(pack: string, days: number, atWar: boolean): ReferenceRun | undefined {
  return REFERENCE_RUNS.find((r) => r.kind === 'full' && r.pack === pack && r.days === days && r.atWar === atWar);
}

/** The mechanics a run declares: the tick's and the map's. */
export function declaredMechanics(): readonly string[] {
  return seatsMechanics();
}

/** The gate: what is wrong with a run's liveness against its reference bands. Empty when healthy. */
export function gateFailures(run: ReferenceRun, liveness: readonly LivenessRow[]): LivenessFailure[] {
  // An exercise run answers only for the mechanic it exercises.
  const rows = run.kind === 'exercise' ? liveness.filter((r) => r.mechanic in run.bands) : liveness;
  return checkLiveness(rows, run.bands);
}

/**
 * Problems with the bands themselves, apart from any run: a mechanic with no band or a band for a mechanic
 * nobody declares, a zero band with no reason, and a mechanic that fires in no reference run and is not in
 * `QUIET` with its driving test. Empty when the table is sound.
 */
export function bandProblems(runs: readonly ReferenceRun[] = REFERENCE_RUNS): string[] {
  const declared = new Set(declaredMechanics());
  const problems: string[] = [];
  for (const run of runs) {
    if (run.kind === 'full') for (const m of declared) if (!(m in run.bands)) problems.push(`${run.name}: no band for ${m}`);
    for (const [m, band] of Object.entries(run.bands)) {
      if (!declared.has(m)) problems.push(`${run.name}: a band for ${m}, which nothing declares`);
      if (band.minFires === 0 && (band.why === undefined || band.why.trim().length < 20)) problems.push(`${run.name}: ${m} is banded at zero with no reason`);
      if (band.maxFires !== undefined && band.maxFires < band.minFires) problems.push(`${run.name}: ${m} has a maximum below its minimum`);
    }
  }
  for (const m of declared) {
    const alive = runs.some((r) => (r.bands[m]?.minFires ?? 0) >= 1);
    if (!alive && !(m in QUIET)) problems.push(`${m} fires in no reference run and has no quiet reason with a driving kernel test`);
    if (alive && m in QUIET) problems.push(`${m} fires in a reference run but is also listed as quiet`);
  }
  for (const m of Object.keys(QUIET)) if (!declared.has(m)) problems.push(`QUIET names ${m}, which nothing declares`);
  return problems;
}
