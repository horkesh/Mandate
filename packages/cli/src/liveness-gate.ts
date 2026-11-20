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
 * The planner's scoring terms are counted over edits as well as drafts (0062; lane 1.2): a term fires when dropping
 * it would change a draft's top pick, and when it falls under an edit. The editing exercise run counts `haste`, an
 * edit-only term, which drafts never exercise.
 */
import { checkLiveness, phase0, type LivenessBand, type LivenessFailure, type LivenessRow } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { seatsMechanics } from './seats-world.ts';

export interface GateBand extends LivenessBand {
  /** Required when `minFires` is 0: why this mechanic is quiet in this run. */
  readonly why?: string;
  /** For a `stalled` band: the kernel test that drives the mechanic live, since this run does not. */
  readonly driver?: { readonly test: string; readonly needle: string };
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

/**
 * `rules`: every seat on the rules model. `silent-commanders`: commanders leave their plan requests unanswered.
 * `editing-principal` (lane 1.2): the principal gives every goal "prepare, await my word" and asks to review its plan,
 * then edits the arrows of every plan with a moving main axis ("move now": no days to concentrate), approves the rest,
 * and gives the word when an operation waits for it. It drives edits through compliance, so the planner's scoring
 * terms are counted over edits as well as drafts (0062; lane 0.9: `haste` is an edit-only term).
 */
export type SeatsName = 'rules' | 'silent-commanders' | 'editing-principal';

/** The seat table a reference run's `seats` names. */
export function seatsNamed(name: SeatsName): phase0.SeatTable {
  const rules = createRuleSeat();
  if (name === 'rules') return () => rules;
  if (name === 'editing-principal') {
    const editing = Object.freeze({
      driver: 'rules' as const,
      respond: (request: Parameters<typeof rules.respond>[0]) => {
        const answer = rules.respond(request);
        const menu = request.menu;
        if (menu.menuKind !== 'principal' || answer.answerKind !== 'commands') return answer;
        const commands = answer.commands.map((c) => {
          if (c.cmd === 'order') return { ...c, goal: { ...c.goal, approveAsDrafted: false, awaitWord: true } };
          if (c.cmd !== 'review' || c.action !== 'approve') return c;
          const main = menu.reviews.find((r) => r.post === c.to)?.plan.axes.find((a) => a.name === 'main' && a.regions.length > 1);
          return main === undefined ? c : { ...c, action: 'edit' as const, edit: { kind: 'timing' as const, axis: 'main', region: null, via: [], concentration: 0 } };
        });
        return { answerKind: 'commands' as const, commands };
      },
    });
    return () => editing;
  }
  const silent = Object.freeze({
    driver: 'rules' as const,
    respond: (request: Parameters<typeof rules.respond>[0]) => (request.menu.menuKind === 'plan-selection' ? { answerKind: 'commands' as const, commands: [] } : rules.respond(request)),
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

/**
 * A mechanic that fires in this run only from a frozen stand-off (0072): no floor, so a run that ends the stand-off
 * still passes, and the ceiling of `around(n)`, so a flood still fails. The kernel test named drives it live.
 */
export function stalled(n: number, why: string, driver: { readonly test: string; readonly needle: string }): GateBand {
  return { minFires: 0, maxFires: around(n).maxFires, why, driver };
}

/** A mechanic that could fire in this run but does not here; it may start to without a band moving. */
function notHere(why: string): GateBand {
  return { minFires: 0, why };
}

const SITUATIONS_UNAUTHORED = 'union-1861 has no situations authored until the March 1861 authoring lane (0042, 0046); the testbed run exercises them';
const FILTER_EMPTY = 'both packs start with their filter posts (the wire offices) empty (0040: the filter post is empty in the March 1861 start), so no wire meets a filter; lane 1.1 made the filter read its holder’s values, and the kernel test drives it with a held post';
const NO_CANDID_RELAY = 'the testbed’s one relaying office (the war ministry) holds what it dislikes rather than objecting: its holder is not candid (lane 1.1); union-1861 fires it, and the kernel test drives it';
const VERBS_UNUSED = 'the rule-seat principal’s doctrine uses appoint, transfer, inquire and call (lane 1.12); consult waits for situations to consult on (lane 1.12 Part B), and audience, observer, promise, pressure, address and relieve have no doctrine yet (notes/lane-1.12-rule-seats.md); the kernel test drives it';
/** Lane 1.12: the Union run's one engagement in 148 days is the bombardment of Fort Sumter, fire only across water. */
const NO_UNION_BATTLE = 'the Union run fights no field battle in 148 days: its one engagement is the bombardment of Fort Sumter, fire only across water, with no crossing and no assault (lane 1.12); the testbed run fires it';
const PV = 'packages/kernel/test/people-verbs.test.ts';
const POL = 'packages/kernel/test/politics.test.ts';
const NO_PROPOSER = 'nothing proposes it yet: situations, raids and operations arrive in Phase 1; the kernel test drives it';
const FEW_BATTLE_DAYS = 'the reference runs fight only a few battle-days (two bombardment days in the Union run, four field-battle days in the testbed run)';

/** Mechanics that fire in neither reference run: the reason, and the kernel test that proves the mechanic is alive. */
export const QUIET: Readonly<Record<string, QuietReason>> = {
  // R73: doctrine retires the generic Washington attack; the editing exercise edits every reviewed plan.
  'operations.repulsed': { why: 'no reference operation meets a field battle that drives its axis back; the kernel test drives repeated repulses', test: 'packages/kernel/test/operations.test.ts', needle: 'driven back, an axis withdraws, pauses and tries again' },
  'plans.approved': { why: 'ordinary reference plans go ahead as drafted; the editing exercise edits every reviewed plan instead of approving it', test: 'packages/kernel/test/plans.test.ts', needle: 'asks to review: his pick goes to the issuer by dispatch, who approves it' },
  'command.government_reopened': { why: 'no pack situation reopens one yet', test: 'packages/kernel/test/governments.test.ts', needle: 'reopening and repeats are plain' },
  'command.proposal_refused': { why: 'a refusal needs a proposal that cannot be applied; honest situations propose none', test: 'packages/kernel/test/governments.test.ts', needle: 'refuses what it cannot be' },
  'commands.rejected': { why: 'rule seats send only commands the menu offers; a bad command is a seat bug', test: 'packages/kernel/test/seats-orders.test.ts', needle: 'rejects commands the kernel cannot carry' },
  'infrastructure.changed': { why: NO_PROPOSER, test: 'packages/kernel/test/infrastructure.test.ts', needle: 'damages and repairs edges and depots' },
  // Lane 1.4: operations and their reports.
  'combat.records_pruned': { why: 'a closed battle is pruned after the pack\'s battleDays (120), longer than either reference run', test: 'packages/kernel/test/operations.test.ts', needle: 'prunes ended operations, closed battles and old responses' },
  'operations.landed': { why: 'no plan the reference runs draft goes by water (no troops start aboard a ship the planner picks)', test: 'packages/kernel/test/detachments.test.ts', needle: 'lands its troops at the objective' },
  'operations.support_answered': { why: 'no plan the reference runs draft asks another holder for an axis (no pincer is drafted)', test: 'packages/kernel/test/operations.test.ts', needle: 'a willing holder complies, his axis marches' },
  'operations.support_refused': { why: 'no plan the reference runs draft asks another holder for an axis (no pincer is drafted)', test: 'packages/kernel/test/operations.test.ts', needle: 'a holder who will not move refuses the request' },
  'operations.support_sent': { why: 'no plan the reference runs draft asks another holder for an axis (no pincer is drafted)', test: 'packages/kernel/test/operations.test.ts', needle: 'a willing holder complies, his axis marches' },
  'combat.breakout': { why: `a cut-off force breaks out only when its commander believes it can fight free; ${FEW_BATTLE_DAYS}, and no force is cut off`, test: 'packages/kernel/test/combat.test.ts', needle: 'a cut-off force strong enough to fight breaks out' },
  'combat.destroyed': { why: `a force is destroyed only when the breakout its commander chose fails; ${FEW_BATTLE_DAYS}, and no force breaks out`, test: 'packages/kernel/test/combat.test.ts', needle: 'its breakout failed, and the force is destroyed' },
  // Lane 1.12: these fired only in the Union run's march on Washington, which the generic principal ordered and the
  // doctrine does not (the history has no such march); every testbed loser has a way back, and no testbed general is hit.
  'combat.cut_off': { why: 'a side is cut off only with no legal retreat (0019) in a field battle; every testbed loser has a way back, and the Union run fights no field battle in 148 days (Sumter is a bombardment, lane 1.12)', test: 'packages/kernel/test/combat.test.ts', needle: 'a trapped garrison with nowhere to go surrenders' },
  'combat.general_hit': { why: `a commander is hit on a low draw on his own stream; none of the testbed run’s battle-days draws one, and the Union run fights no field battle (lane 1.12)`, test: 'packages/kernel/test/combat.test.ts', needle: 'a general wounded leaves his post vacant' },
  'map.pocket_relieved': { why: 'a pocket is relieved when a repair or a closing reverses; nothing reverses one in these runs', test: 'packages/kernel/test/map-tick.test.ts', needle: 'then its opening' },
  // Lane 1.12: the Charleston commander's bombardment goes ahead as drafted (lane 1.12 retired the Washington garrison's reviewed hold),
  // and the editing exercise edits every reviewed plan rather than approving it.
  'movement.join_blocked': { why: 'every block a transfer hands over in the reference runs finds a route to its post’s seat; the kernel test drives the wait', test: 'packages/kernel/test/join.test.ts', needle: 'waits, typed no_route, when no route reaches the seat' },
  // R77 retains R74: a late fort fall captures; matching recorded terms have a named kernel driver.
  'reports.commander_lost': { why: 'Sumter evacuates under terms in the Union reference and no testbed commander is lost; the kernel test captures a commander through the shared reporting path', test: 'packages/kernel/test/believed-posts.test.ts', needle: 'a capture from any other phase is reported by the shared path' },
  'orders.returned': { why: 'no dispatch arrives at a vacant or changed post in either reference run; the kernel test sends one before the loss is reported and drives its return', test: 'packages/kernel/test/believed-posts.test.ts', needle: 'bounces on arrival as a returned dispatch, typed' },
  'orders.conflict': { why: 'a conflict needs two issuers, a chain order and one sent around it; here only the principal orders', test: 'packages/kernel/test/seats-orders.test.ts', needle: 'conflicting orders: one down the chain, one around it' },
  'reports.filtered': { why: FILTER_EMPTY, test: 'packages/kernel/test/seats-orders.test.ts', needle: 'holds a wire for a day and cuts the losses from it' },
  'reports.trimmed': { why: FILTER_EMPTY, test: 'packages/kernel/test/seats-orders.test.ts', needle: 'holds a wire for a day and cuts the losses from it' },
  'situations.lapsed': { why: 'a lapse needs every option to expire unanswered; a rule-driven principal takes defaults at once (0057)', test: 'packages/kernel/test/situations.test.ts', needle: 'expires an option, resurfaces on its clock, and lapses' },
  // Lane 1.7's recruitment: lane 1.12's doctrine calls for regiments, so the calls, answers and musters are banded in the
  // runs; a levy that waits on enemy ground or lapses waits for a governor's seat to fall, which neither run sees.
  'recruitment.muster_blocked': { why: 'no governor called in either run has his seat region in enemy hands when his levy falls due', test: 'packages/cli/test/men-regions.test.ts', needle: 'a levy due in an enemy-held region waits' },
  'recruitment.lapsed': { why: 'a levy lapses only after waiting on enemy ground past the pack’s days, and none waits in either run', test: 'packages/cli/test/men-regions.test.ts', needle: 'lapses past the pack’s days' },
  // Lane 1.2: the plan cycle's paths that no rule seat takes, each driven by its own kernel test.
  'plans.sent_back': { why: 'no rule seat sends a plan back: the rule-seat principal approves, the editing exercise edits', test: 'packages/kernel/test/plans.test.ts', needle: 'sends the plan back, and he drafts it again' },
  'planner.term.notes': { why: 'the reference principals send no notes; the send-back driver makes a timing note change the pick', test: 'packages/kernel/test/sendback-notes.test.ts', needle: 'a compliant commander reads a note' },
  'plans.draft_deferred': { why: 'no reference run asks for more plans in a day than the pack’s cap of three (0062)', test: 'packages/kernel/test/plans.test.ts', needle: 'defers drafts past the day’s cap' },
  'plans.edit_invalid': { why: 'the editing exercise edits only a moving axis’s timing, which can always be made', test: 'packages/kernel/test/plans.test.ts', needle: 'refuses an edit no route can make' },
  'plans.edit_shirked': { why: 'the testbed’s commanders answer the edits the exercise makes by complying or objecting, never covertly', test: 'packages/cli/test/planner.test.ts', needle: 'executes a covert rung’s concrete plan' },
  'planner.term.caution': { why: 'few drafts in the reference runs, and none where dropping caution alone changes the pick', test: 'packages/cli/test/planner.test.ts', needle: 'counts every scoring term live in some case' },
  'planner.term.coordination': { why: 'no reference run drafts a two-axis plan close enough to the best for coordination to decide it', test: 'packages/cli/test/planner.test.ts', needle: 'counts every scoring term live in some case' },
  'planner.term.exposure': { why: 'no reference run meets a perceived enemy on the way, and the editing exercise’s “move now” changes no exposure since lane 1.1’s perception', test: 'packages/cli/test/planner.test.ts', needle: 'counts every scoring term live in some case' },
  'planner.term.dependence': { why: 'no reference run drafts a support request close enough to the best for dependence to decide it', test: 'packages/cli/test/planner.test.ts', needle: 'counts every scoring term live in some case' },
  'planner.term.force_ratio': { why: 'the reference runs’ drafts are decided by supply and goal fit, never by the ratio alone', test: 'packages/cli/test/planner.test.ts', needle: 'counts every scoring term live in some case' },
  'planner.term.glory': { why: 'few drafts in the reference runs, and none where dropping glory alone changes the pick', test: 'packages/cli/test/planner.test.ts', needle: 'counts every scoring term live in some case' },
  'planner.term.time': { why: 'few drafts in the reference runs, and none where dropping time alone changes the pick', test: 'packages/cli/test/planner.test.ts', needle: 'counts every scoring term live in some case' },
  'situations.waiting': { why: 'waiting is an option a human takes; the rule-driven principal takes the historical default (0057)', test: 'packages/kernel/test/situations.test.ts', needle: 'waits for news to reach the principal' },
  // Lane 1.5: the people verbs no rule seat uses yet, each driven by its own kernel test (lane 1.12's doctrine drives
  // appoint, transfer and inquire, banded as verbs.answered and verbs.declined).
  'verbs.consulted': { why: VERBS_UNUSED, test: PV, needle: 'his answer becomes a stance on record' },
  'verbs.audience': { why: VERBS_UNUSED, test: PV, needle: 'during: held about an approved plan' },
  'verbs.in_washington': { why: VERBS_UNUSED, test: PV, needle: 'promise, pressure and address act in Washington' },
  'people.promise_kept': { why: VERBS_UNUSED, test: PV, needle: 'with a promise of advancement kept by it' },
  'people.promise_broken': { why: VERBS_UNUSED, test: PV, needle: 'a promise falls due and breaks' },
  'reports.observer_letter': { why: VERBS_UNUSED, test: PV, needle: 'send an observer: he watches' },
  // Lane 1.5b: a policy option applies its row's pushback; no pack option names a policy row yet (lane 1.11's S17 will).
  // Lane 1.5b: a floor cost the principal's standing cannot pay, recorded and never dropped. The gate reviewer's condition:
  // it never happens in a reference run (banded at zero in both), and the kernel test drives it.
  'situations.policy_unpaid': { why: 'a floor cost falls on the principal only when the floored row has no stakeholder or carrier of its own, and the chosen reference-run policy pays its floor through stakeholders; the gate reviewer requires it never to fire in one', test: 'packages/kernel/test/gate-wiring.test.ts', needle: 'with standing at 0 and no stakeholders, the whole floor cost is recorded unpaid' },
  'seats.attention_refused': { why: 'the rule-seat principal prices each command by the pack’s table and sends only what his week’s attention pays for (lane 1.12), so the kernel refuses him nothing; the kernel test drives it', test: PV, needle: 'refuses what it cannot pay' },
  // Lane 1.6: politics' paths that wait for authored situations (lane 1.11: S09's call, S20's ratification, the war's opening).
  'politics.refused': { why: 'a refusal needs a proposal politics cannot apply; honest situations propose none', test: POL, needle: 'refuses a call while one stands' },
  'politics.press_silent': { why: 'every paper’s editor serves on his paper’s side throughout both runs', test: POL, needle: 'a paper whose editor no longer serves prints nothing' },
  'forces.landing_refused': { why: 'the one situation landing in the reference runs is made', test: 'packages/cli/test/situation-landing.test.ts', needle: 'refuses a landing from a block that is not aboard' },
};

/** What a pack at peace never does: no order is given and no governor called, so no force marches, no ground is contested. */
const PEACE_QUIET: readonly string[] = ['orders.relayed', 'orders.obeyed', 'plans.goal_reached', 'movement.leg_started', 'movement.arrived', 'combat.battle_day', 'combat.occupation', 'control.changed', 'recruitment.called'];

/** What only the editing exercise run does (lane 1.2): edits and their answers, the word to go, and `haste`, an edit-only term. */
const EDITS_ONLY = 'only the editing exercise run reviews and edits plans; the rule-seat principal approves them as drafted';
const NO_DEPARTURE = 'every testbed commander picks a moving plan with no condition, so it goes ahead as drafted, unreviewed';

/** The plan cycle's bands in a full run where the rule-seat principal approves every plan (lane 1.2). */
function planBands(n: { readonly drafts: number; readonly reviewed: number; readonly wentAhead: number; readonly goalFit: number; readonly supply: number }): Record<string, GateBand> {
  return {
    'planner.candidates': around(n.drafts),
    'planner.searches': around(n.drafts),
    'plans.drafted': around(n.drafts),
    'plans.chosen': around(n.drafts),
    'plans.goal_set': around(n.drafts),
    'plans.went_ahead': around(n.wentAhead),
    'plans.approved': n.reviewed > 0 ? around(n.reviewed) : notHere(NO_DEPARTURE),
    'plans.submitted': n.reviewed > 0 ? around(n.reviewed) : notHere(NO_DEPARTURE),
    'planner.term.goal_fit': n.goalFit > 0 ? around(n.goalFit) : notHere('both opening drafts here have one moving plan and a holding action, which goal fit alone does not separate'),
    'planner.term.supply': around(n.supply),
    'planner.term.haste': quiet(`an edit-only term (lane 0.9: drafts always concentrate as long as he wants): ${EDITS_ONLY}`),
    'plans.edit_received': quiet(EDITS_ONLY),
    'plans.edit_answered': quiet(EDITS_ONLY),
    'plans.edit_objected': quiet(EDITS_ONLY),
    'plans.released': quiet('no goal here says "prepare, await my word"; the editing exercise run gives the word'),
  };
}

/**
 * The merged Union history reference: 5 March to 31 July (148 days), each side opening its own war.
 * R73 measured the R51/0097 people, lane 1.11 situations and lane 1.12 doctrine together. Sumter is a
 * bombardment, not the retired generic march on Washington. Concentrating levies march, consume stores
 * and refill at depots; the spring's decisions change governments and bring Congress into session.
 * Every positive centre below is the retained history run's count, with the usual half-to-double band.
 * runs/r73/band-reconciliation.json records each change and its cause. Historical checkpoint bands
 * (each pack's checkpoints.json) are independent and unchanged; these are mechanic liveness counts only.
 */
const UNION_BANDS: Record<string, GateBand> = {
  'people.resigned': around(7),
  // R82: an integrated government notice offers one officer his choice; he stays.
  'people.stayed': around(1),
  // The bombardment of Fort Sumter: two days of fire, then Anderson's surrender, evacuated under the record's terms.
  'combat.battle_closed': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'combat.battle_day': around(2),
  'combat.battle_opened': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'combat.captured': quiet('Sumter falls under Anderson on day 39, within the recorded offer window, so its garrison evacuates instead of being captured (R78)'),
  'combat.killed_wounded': notHere("Sumter's authored bombardment loss rate is zero and the 148-day run fights no field battle; the testbed run fires it"),
  'combat.missing': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'combat.occupation': around(18),
  'combat.pursuit_chosen': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'combat.surrendered': around(1),
  'combat.withdrew': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'control.changed': around(20),
  'control.threshold_crossed': around(10),
  'forces.stores_fell': around(587),
  'forces.stores_low': around(2),
  'forces.stores_refilled': around(704),
  'forces.stragglers_returned': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'combat.flank_broken': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'combat.routed': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'combat.works_stormed': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'operations.ended': around(1),
  'operations.opened': around(2),
  'operations.stage': around(7),
  'operations.works': around(3),
  'orders.responses_pruned': around(20),
  'reports.battle_dispatch': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'reports.casualty_return': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'reports.governor_wire': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'reports.pocket': notHere("no headquarters is cut off by a closing pocket in the 148-day Union run; the testbed run fires it"),
  'map.pocket_closed': notHere("no new pocket closes in the 148-day Union run; Sumter's opening pocket is lost, not newly closed; the testbed run fires it"),
  'knowledge.pruned_age': around(104),
  'knowledge.pruned_superseded': around(146),
  'map.recomputed': around(24),
  'messages.courier_delay': around(64),
  'messages.mail_delay': around(2682),
  'messages.delivered': around(10543),
  'messages.sent': around(11185),
  'messages.special_messenger': quiet('the one bypass uses the faster zero-day wire instead of a three-day messenger (R78)'),
  'orders.bypassed': around(4),
  'movement.arrived': around(123),
  'movement.leg_started': around(98),
  'orders.obeyed': around(3),
  'orders.relay_held': around(1),
  'orders.relay_objected': around(3),
  'orders.relayed': around(1),
  'plans.goal_reached': around(1),
  'politics.adjourned': around(1),
  'politics.front_page': around(63),
  'politics.support': around(16),
  'politics.opened': around(2),
  'regions.self_emancipation': around(3081),
  'regions.reached_lines': around(253),
  'seats.choices': around(2),
  'planner.candidates': around(2),
  'planner.searches': around(2),
  'plans.drafted': around(2),
  'plans.chosen': around(2),
  'plans.goal_set': around(3),
  'plans.went_ahead': around(2),
  'plans.approved': notHere("both chosen plans go ahead as drafted without review; the editing exercise drives plan review"),
  'plans.submitted': notHere("both chosen plans go ahead as drafted without review; the editing exercise drives plan review"),
  'planner.term.goal_fit': notHere("dropping goal fit never changes a draft's chosen plan in the merged history run; the testbed run fires it"),
  'planner.term.supply': around(1),
  'planner.term.haste': quiet("an edit-only term (lane 0.9: drafts always concentrate as long as he wants): only the editing exercise run reviews and edits plans; the rule-seat principal approves them as drafted"),
  'plans.edit_received': quiet("only the editing exercise run reviews and edits plans; the rule-seat principal approves them as drafted"),
  'plans.edit_answered': quiet("only the editing exercise run reviews and edits plans; the rule-seat principal approves them as drafted"),
  'plans.edit_objected': quiet("only the editing exercise run reviews and edits plans; the rule-seat principal approves them as drafted"),
  'plans.released': quiet("no goal here says \"prepare, await my word\"; the editing exercise run gives the word"),
  'seats.defaulted': notHere("every request is answered in this run; the silent-seats exercise run fires it"),
  'situations.decided': around(19),
  'situations.delegated': notHere("no authored Union situation in this window names a delegate as its historical default; the testbed run fires it"),
  'situations.fired': around(54),
  'situations.notice_reports': around(36),
  'situations.noticed': around(35),
  'situations.options_changed': around(4),
  'situations.orders': around(25),
  'situations.proposals': around(26),
  'command.side_changed': around(10),
  'command.government_established': around(1),
  'command.post_succeeded': around(1),
  'command.government_closed': around(2),
  'command.temporary_post_opened': around(2),
  'situations.resurfaced': around(2),
  'situations.staff_lines': around(18),
  'situations.surfaced': around(54),
  'recruitment.called': around(31),
  'recruitment.answered': around(19),
  'recruitment.slow_walked': around(15),
  'recruitment.refused': around(12),
  'recruitment.mustered': around(19),
  'recruitment.men': around(19),
  'recruitment.disbanded': around(15),
  'ladder.moved': around(10),
  'ladder.rival': notHere("no holder reaches a rival rung with the required standing in the merged 148-day history run; the testbed run fires it"),
  'people.grievances_faded': around(30),
  'seats.attention_refilled': around(21),
  'seats.attention_spent': around(29),
  'seats.initiative': { ...around(3), why: 'S16 dating holds remove two cabinet officers\' conciliation motives and their three initiatives each; the deferred secretary retains his memorandum and three cooldown firings. The threshold and historical assertions are unchanged. See runs/s16/initiative-cause.json and band-reconciliation.json.' },
  'operations.repulsed': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'forces.landed_by_situation': around(1),
  'politics.act': around(2),
  'politics.answered': around(2),
  'politics.called': around(1),
  'politics.framing': around(1),
  'politics.met': around(2),
  'situations.policy': around(1),
  'combat.bombardment': around(2),
  'reports.commander_lost': quiet('Anderson evacuates under terms on day 39 and keeps serving; no commander is lost (R78)'),
  'combat.evacuated': { minFires: 1, maxFires: 1 },
  'map.pocket_lost': around(1),
  'seats.battle_orders': notHere("the 148-day Union history run fights no field battle: its only combat is the two-day bombardment of Sumter; the testbed run fires it"),
  'movement.joined': around(17),
  'verbs.answered': around(49),
  'verbs.declined': notHere("every army asked in the merged history run answers; recruitment refusals are counted separately; the testbed run fires it"),
};

/** The testbed reference run: 120 days from day 1, at war from the start (the testbed names no war chain). */
const TESTBED_BANDS: Record<string, GateBand> = {
  'people.resigned': notHere('the testbed reference pack has no service-choice records; union-1861 fires it, and resignation.test.ts drives the government path'),
  'people.stayed': notHere('the testbed reference pack has no service-choice records; union-1861 fires it when an officer stays after his government joins'),
  // Lane 1.3, merged with lane 1.2's plans: battles of one day each, in which the defender withdraws or routs and the winner
  // chooses whether to pursue. Re-banded from lane 1.12's run (the doctrine's levies, inquiries and concentration): four battle-days.
  'combat.battle_closed': around(4),
  'combat.battle_day': around(4),
  'combat.battle_opened': around(4),
  'combat.captured': around(4),
  'combat.killed_wounded': around(8),
  'combat.missing': around(8),
  'combat.occupation': around(31),
  'combat.pursuit_chosen': around(1),
  'combat.withdrew': around(3),
  'control.changed': around(35),
  'control.threshold_crossed': around(13),
  'forces.stores_fell': around(187),
  'forces.stores_low': around(6),
  'forces.stores_refilled': around(238),
  // Lane 1.12: the doctrine's levies and transfers put more men in the field, and the battles leave more stragglers.
  'forces.stragglers_returned': around(108),
  // Lane 1.12: a flank breaks once; a transferred levy joins its army at its seat (Fix 1). No testbed fort lies across water.
  'combat.flank_broken': around(1),
  'movement.joined': around(1),
  'combat.bombardment': notHere('no testbed objective lies across water from a shore with guns; the Union run fires it'),
  'combat.evacuated': notHere('no testbed fort is bombarded; the Union reference evacuates Anderson within the recorded terms'),
  'reports.commander_lost': quiet('no commander is lost in this testbed run; the kernel test in QUIET drives the loss report'),
  'combat.surrendered': notHere('only a cut-off force surrenders, and no testbed force is cut off; the Union run fires it'),
  'map.pocket_lost': notHere('no testbed pocket is overrun; the Union run fires it (Sumter’s, when the fort falls)'),
  // Lane 1.4: three operations, their stages and works; the battles' hourly dispatches, returns, governors' wires and pocket reports.
  'combat.routed': around(1),
  'combat.works_stormed': around(1),
  'operations.ended': around(3),
  'operations.opened': around(3),
  'operations.stage': around(13),
  'operations.works': around(4),
  'orders.responses_pruned': around(16),
  'reports.battle_dispatch': around(32),
  'reports.casualty_return': around(16),
  'reports.governor_wire': around(4),
  'reports.pocket': around(3),
  'map.pocket_closed': around(1),
  'knowledge.pruned_age': around(41),
  'knowledge.pruned_superseded': around(118),
  'map.recomputed': around(20),
  // Lane 1.6: courier and mail counted apart (the northern gazette's front pages are the mail's bulk).
  'messages.courier_delay': around(49),
  'messages.mail_delay': around(107),
  'messages.delivered': around(2120),
  'messages.sent': around(2151),
  'messages.special_messenger': around(1),
  'movement.arrived': around(27),
  'movement.leg_started': around(16),
  'orders.bypassed': notHere('the principal goes around an office only when it objects, which the testbed’s does not (it holds instead); union-1861 fires it'),
  'orders.obeyed': around(3),
  // Lane 1.1: the war minister, not candid and cool toward his leader, slow-walks what he relays.
  'orders.relay_held': around(3),
  'orders.relay_objected': notHere(NO_CANDID_RELAY),
  'orders.relayed': around(3),
  'plans.goal_reached': around(2),
  // Lane 1.7: the fen folk's own act, every week from day 1, in each census region the North's protection flag does not cover (G-1.7a), the North's own western front among them.
  // Lane 1.6: the northern paper's weekly front page; the drift, the press and the ladder move the blocs; the Northern
  // Assembly's session of May and June.
  'politics.adjourned': around(1),
  'politics.front_page': around(17),
  'politics.opened': around(1),
  'politics.support': around(72),
  'regions.self_emancipation': around(90),
  'regions.reached_lines': around(36),
  'seats.choices': around(3),
  // Lane 1.12: a commander marching on a held region is asked for his orders the morning before he arrives.
  'seats.battle_orders': around(1),
  // Lane 1.12: each principal calls on his governor (the testbed's doctrine), whose levy musters and is concentrated at
  // his army; the northern levy's enlistment runs out inside the run. Each side asks its army weekly where it stands (the
  // southern army declines some), and the governors answer the transfers. The longer war drives one operation back and
  // relieves one pocket.
  'recruitment.called': around(2),
  'recruitment.answered': around(2),
  'recruitment.slow_walked': around(1),
  'recruitment.mustered': around(2),
  'recruitment.men': around(2),
  'recruitment.disbanded': around(1),
  'recruitment.refused': notHere('both testbed governors answer their calls; the Union run fires it'),
  'verbs.answered': around(36),
  'verbs.declined': around(17),
  'seats.defaulted': notHere('every request is answered in this run; the silent-seats exercise run fires it'),
  // Three goals (each side's opening, and the situation's order to press on): every plan moves and goes ahead as drafted.
  ...planBands({ drafts: 3, reviewed: 0, wentAhead: 3, goalFit: 2, supply: 2 }),
  'situations.decided': around(3),
  'situations.delegated': around(1),
  'situations.fired': around(6),
  'situations.notice_reports': around(3),
  'situations.noticed': around(3),
  'situations.orders': around(1),
  'situations.proposals': around(5),
  'situations.staff_lines': around(3),
  'situations.surfaced': around(6),
  // Lane 1.5: men cool toward their leader climb the ladder on regard alone, and a famous one becomes a rival; the generals write to the press on their cooldown.
  'ladder.moved': around(6),
  'ladder.rival': around(1),
  'people.grievances_faded': notHere('no testbed man holds a grievance at any week’s end in this run (nobody is overruled, and its office holds rather than objects, so it is never bypassed); its ladder moves come from cool regard alone; union-1861 fires it'),
  'seats.attention_refilled': around(17),
  'seats.attention_spent': around(6),
  'seats.initiative': around(15),
  'command.temporary_post_opened': notHere('no testbed situation declares or opens a temporary post; union-1861 fires it (the relief expedition)'),
  'command.government_closed': notHere('no testbed situation closes a neutral government in this run; union-1861 fires it (a border state’s neutrality)'),
  'command.side_changed': notHere('no testbed situation changes a government’s side in this run; union-1861 fires it'),
  'command.government_established': notHere('no testbed notice establishes a declared government; the Union reference does'),
  'command.post_succeeded': notHere('no testbed notice replaces an occupied post’s holder; the Union reference does'),
  'situations.options_changed': notHere('no testbed situation in this run has an option that appears or expires while it is open; union-1861 fires it'),
  'situations.resurfaced': notHere('no testbed situation in this run stays open to a resurface day; union-1861 fires it'),
  'combat.cut_off': notHere('a side is cut off only with no legal retreat (0019); every testbed loser has a way back; QUIET'),
  'combat.general_hit': notHere('a commander is hit on a low draw on his own stream; none of the testbed run\'s three battle-days draws one; QUIET'),
  'operations.repulsed': notHere('no testbed operation is driven back by a battle; the Union run fires it'),
  'forces.landed_by_situation': notHere('no testbed situation lands troops; the Union run fires it'),
  'forces.landing_refused': notHere('no testbed situation lands troops; QUIET'),
  'politics.act': notHere('no testbed situation acts on the legislature or frames the war; the Union run fires it'),
  'politics.answered': notHere('no testbed situation acts on the legislature or frames the war; the Union run fires it'),
  'politics.called': notHere('no testbed situation acts on the legislature or frames the war; the Union run fires it'),
  'politics.framing': notHere('no testbed situation acts on the legislature or frames the war; the Union run fires it'),
  'politics.met': notHere('no testbed situation acts on the legislature or frames the war; the Union run fires it'),
  'situations.policy': notHere('no testbed decision names a policy row in this run; the Union run fires it'),
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
  { name: 'union-1861, war by decision, 148 days', kind: 'full', pack: 'union-1861', days: 148, atWar: false, seats: 'rules', bands: withQuiet(UNION_BANDS) },
  { name: 'testbed, 120 days', kind: 'full', pack: 'testbed', days: 120, atWar: false, seats: 'rules', bands: withQuiet(TESTBED_BANDS) },
  { name: 'testbed, commanders silent, 120 days', kind: 'exercise', pack: 'testbed', days: 120, atWar: false, seats: 'silent-commanders', bands: { 'seats.defaulted': around(1) } },
  {
    name: 'testbed, the principal edits every plan, 120 days',
    kind: 'exercise',
    pack: 'testbed',
    days: 120,
    atWar: false,
    seats: 'editing-principal',
    // The principal's two goals come back for review and are edited ("move now"), each answered through compliance. Lane
    // 1.1's compliance: one man objects twice, keeping his plan under review, so it is edited three times in all; one
    // operation waits for his word and gets it. The situation's order goes ahead as drafted.
    bands: {
      'plans.submitted': around(2),
      'plans.edit_received': around(3),
      'plans.edit_answered': around(3),
      'plans.edit_objected': around(2),
      'plans.released': around(1),
      'planner.term.haste': around(2),
    },
  },
  {
    name: 'union-1861 before the opening decisions, 30 days (the war gate, 0064)',
    kind: 'exercise',
    pack: 'union-1861',
    days: 30,
    atWar: false,
    seats: 'rules',
    bands: Object.fromEntries(PEACE_QUIET.map((m) => [m, quiet(`union-1861 keeps the peace before either side's opening decision (0064): the rule-seat principal sends no doctrine`)])),
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
    // A stalled band (fires only from a stand-off) carries its own driving kernel test, as QUIET does.
    const driven = runs.some((r) => r.bands[m]?.driver !== undefined);
    if (!alive && !driven && !(m in QUIET)) problems.push(`${m} fires in no reference run and has no quiet reason with a driving kernel test`);
    if ((alive || driven) && m in QUIET) problems.push(`${m} fires in a reference run but is also listed as quiet`);
  }
  for (const run of runs) {
    for (const [m, band] of Object.entries(run.bands)) {
      if (band.driver !== undefined && band.maxFires === undefined) problems.push(`${run.name}: ${m} is stalled with no ceiling`);
    }
  }
  for (const m of Object.keys(QUIET)) if (!declared.has(m)) problems.push(`QUIET names ${m}, which nothing declares`);
  return problems;
}
