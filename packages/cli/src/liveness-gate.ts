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
const VERBS_UNUSED = 'no rule seat uses the people verbs yet (lane 1.5 builds them; the generic principal orders, reviews and decides only); the kernel test drives it';
const PV = 'packages/kernel/test/people-verbs.test.ts';
const NO_PROPOSER = 'nothing proposes it yet: situations, raids and operations arrive in Phase 1; the kernel test drives it';
const FEW_BATTLE_DAYS = 'the reference runs fight only a few battle-days (one in the Union run, two in the testbed run; lane 1.3)';

/** Mechanics that fire in neither reference run: the reason, and the kernel test that proves the mechanic is alive. */
export const QUIET: Readonly<Record<string, QuietReason>> = {
  'command.government_closed': { why: 'no pack situation closes a neutral government yet (the closing of a neutral government waits for authored situations)', test: 'packages/kernel/test/governments.test.ts', needle: 'takes the default "close" on day 2' },
  'command.government_reopened': { why: 'no pack situation reopens one yet', test: 'packages/kernel/test/governments.test.ts', needle: 'reopening and repeats are plain' },
  'command.side_changed': { why: 'a neutral government changes side only by a situation, and none is authored yet (0065, 0067)', test: 'packages/kernel/test/department-sides.test.ts', needle: 'end to end through the tick: on day 2 its land stops being neutral ground' },
  'command.proposal_refused': { why: 'a refusal needs a proposal that cannot be applied; honest situations propose none', test: 'packages/kernel/test/governments.test.ts', needle: 'refuses what it cannot be' },
  'commands.rejected': { why: 'rule seats send only commands the menu offers; a bad command is a seat bug', test: 'packages/kernel/test/seats-orders.test.ts', needle: 'rejects commands the kernel cannot carry' },
  'infrastructure.changed': { why: NO_PROPOSER, test: 'packages/kernel/test/infrastructure.test.ts', needle: 'damages and repairs edges and depots' },
  // Lane 1.4: operations and their reports.
  'combat.records_pruned': { why: 'a closed battle is pruned after the pack\'s battleDays (120), longer than either reference run', test: 'packages/kernel/test/operations.test.ts', needle: 'prunes ended operations, closed battles and old responses' },
  'operations.repulsed': { why: 'no operation in either reference run is driven back by a battle: each attacker carries its objective or holds', test: 'packages/kernel/test/operations.test.ts', needle: 'driven back, an axis withdraws, pauses and tries again' },
  'operations.support_answered': { why: 'no plan the reference runs draft asks another holder for an axis (no pincer is drafted)', test: 'packages/kernel/test/operations.test.ts', needle: 'a willing holder complies, his axis marches' },
  'operations.support_refused': { why: 'no plan the reference runs draft asks another holder for an axis (no pincer is drafted)', test: 'packages/kernel/test/operations.test.ts', needle: 'a holder who will not move refuses the request' },
  'operations.support_sent': { why: 'no plan the reference runs draft asks another holder for an axis (no pincer is drafted)', test: 'packages/kernel/test/operations.test.ts', needle: 'a willing holder complies, his axis marches' },
  'map.pocket_lost': { why: 'a pocket is overrun only when a battle or an occupation takes its ground; the reference runs close none', test: 'packages/kernel/test/map-tick.test.ts', needle: 'reports an overrun pocket as lost' },
  'combat.breakout': { why: `a cut-off force breaks out only when its commander believes it can fight free; ${FEW_BATTLE_DAYS}, and the one force cut off (the Union run's trapped garrison) is too weak, so it surrenders`, test: 'packages/kernel/test/combat.test.ts', needle: 'a cut-off force strong enough to fight breaks out' },
  'combat.destroyed': { why: `a force is destroyed only when the breakout its commander chose fails; ${FEW_BATTLE_DAYS}, and no force breaks out`, test: 'packages/kernel/test/combat.test.ts', needle: 'its breakout failed, and the force is destroyed' },
  'map.pocket_relieved': { why: 'a pocket is relieved when a repair or a closing reverses; nothing reverses one in these runs', test: 'packages/kernel/test/map-tick.test.ts', needle: 'then its opening' },
  'orders.conflict': { why: 'a conflict needs two issuers, a chain order and one sent around it; here only the principal orders', test: 'packages/kernel/test/seats-orders.test.ts', needle: 'conflicting orders: one down the chain, one around it' },
  'reports.filtered': { why: FILTER_EMPTY, test: 'packages/kernel/test/seats-orders.test.ts', needle: 'holds a wire for a day and cuts the losses from it' },
  'reports.trimmed': { why: FILTER_EMPTY, test: 'packages/kernel/test/seats-orders.test.ts', needle: 'holds a wire for a day and cuts the losses from it' },
  'situations.lapsed': { why: 'a lapse needs every option to expire unanswered; a rule-driven principal takes defaults at once (0057)', test: 'packages/kernel/test/situations.test.ts', needle: 'expires an option, resurfaces on its clock, and lapses' },
  // Lane 1.7: no rule seat calls for regiments yet (lane 1.12's rule-seat principals will), so recruitment fires in no reference run.
  'recruitment.called': { why: 'no rule seat calls for regiments until lane 1.12', test: 'packages/cli/test/men-regions.test.ts', needle: 'the northern governor answers the call' },
  'recruitment.answered': { why: 'no rule seat calls for regiments until lane 1.12', test: 'packages/cli/test/men-regions.test.ts', needle: 'the northern governor answers the call' },
  'recruitment.slow_walked': { why: 'no rule seat calls for regiments until lane 1.12', test: 'packages/cli/test/men-regions.test.ts', needle: 'slow-walks the call' },
  'recruitment.refused': { why: 'no rule seat calls for regiments until lane 1.12; a governor who raises nothing is driven by the kernel rule that a rung not listed raises none', test: 'packages/cli/test/men-regions.test.ts', needle: "regimentsRaised(rules, 10, 'refuse', 900)" },
  'recruitment.mustered': { why: 'no rule seat calls for regiments until lane 1.12', test: 'packages/cli/test/men-regions.test.ts', needle: 'musters the levy into a new block' },
  'recruitment.men': { why: 'no rule seat calls for regiments until lane 1.12', test: 'packages/cli/test/men-regions.test.ts', needle: 'musters the levy into a new block' },
  'recruitment.muster_blocked': { why: 'no rule seat calls for regiments until lane 1.12, so no levy waits on a region in enemy hands', test: 'packages/cli/test/men-regions.test.ts', needle: 'a levy due in an enemy-held region waits' },
  'recruitment.lapsed': { why: 'no rule seat calls for regiments until lane 1.12, so no levy lapses', test: 'packages/cli/test/men-regions.test.ts', needle: 'lapses past the pack’s days' },
  'recruitment.disbanded': { why: 'no rule seat calls for regiments until lane 1.12, so no enlistment runs out', test: 'packages/cli/test/men-regions.test.ts', needle: 'then disbands it when its ninety days end' },  // Lane 1.2: the plan cycle's paths that no rule seat takes, each driven by its own kernel test.
  'plans.sent_back': { why: 'no rule seat sends a plan back: the generic principal approves, the editing exercise edits', test: 'packages/kernel/test/plans.test.ts', needle: 'sends the plan back, and he drafts it again' },
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
  'situations.options_changed': { why: 'an option changes only for a situation left open past an appearance or expiry; the rule-driven principal does not leave one open (0057)', test: 'packages/kernel/test/situations.test.ts', needle: 'a waiting option defers the decision until its condition holds' },
  'situations.resurfaced': { why: 'a resurfacing follows a wait or expiry the rule-driven principal does not choose (0057)', test: 'packages/kernel/test/situations.test.ts', needle: 'expires an option, resurfaces on its clock' },
  'situations.waiting': { why: 'waiting is an option a human takes; the rule-driven principal takes the historical default (0057)', test: 'packages/kernel/test/situations.test.ts', needle: 'waits for news to reach the principal' },
  // Lane 1.5: the people verbs, which no rule seat uses yet, each driven by its own kernel test.
  'verbs.answered': { why: VERBS_UNUSED, test: PV, needle: 'relieve outright, then appoint: each answered through his compliance' },
  'verbs.declined': { why: VERBS_UNUSED, test: PV, needle: 'or declines and says why' },
  'verbs.consulted': { why: VERBS_UNUSED, test: PV, needle: 'his answer becomes a stance on record' },
  'verbs.audience': { why: VERBS_UNUSED, test: PV, needle: 'during: held about an approved plan' },
  'verbs.in_washington': { why: VERBS_UNUSED, test: PV, needle: 'promise, pressure and address act in Washington' },
  'people.promise_kept': { why: VERBS_UNUSED, test: PV, needle: 'with a promise of advancement kept by it' },
  'people.promise_broken': { why: VERBS_UNUSED, test: PV, needle: 'a promise falls due and breaks' },
  'reports.observer_letter': { why: VERBS_UNUSED, test: PV, needle: 'send an observer: he watches' },
  'seats.attention_refused': { why: 'the generic principal spends a few points a week of a budget of twelve, so nothing is refused for want of attention; the kernel test drives it', test: PV, needle: 'refuses what it cannot pay' },
};

/** What a pack at peace never does: no order is given, so no force marches, no ground is contested. */
const PEACE_QUIET: readonly string[] = ['orders.relayed', 'orders.obeyed', 'plans.goal_reached', 'movement.leg_started', 'movement.arrived', 'combat.battle_day', 'combat.occupation', 'control.changed'];

/** What only the editing exercise run does (lane 1.2): edits and their answers, the word to go, and `haste`, an edit-only term. */
const EDITS_ONLY = 'only the editing exercise run reviews and edits plans; the generic principal approves them as drafted';
const NO_DEPARTURE = 'every testbed commander picks a moving plan with no condition, so it goes ahead as drafted, unreviewed';

/** The plan cycle's bands in a full run where the generic principal approves every plan (lane 1.2). */
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

/** The union-1861 reference run: 75 days from 5 March 1861, at war (the war gate's labelled option, 0064). */
const UNION_BANDS: Record<string, GateBand> = {
  // Lanes 1.2 and 1.3: the Charleston command's plan marches on Washington, whose garrison now holds (lane 1.2), and the
  // battle model fights it out (lane 1.3). Re-banded from the merged run.
  'combat.battle_closed': around(1),
  'combat.battle_day': around(1),
  'combat.battle_opened': around(1),
  'combat.captured': around(1),
  'combat.cut_off': around(1),
  'combat.general_hit': around(1),
  'combat.killed_wounded': around(2),
  'combat.missing': around(1),
  'combat.occupation': around(14),
  'combat.pursuit_chosen': notHere('the winner chooses a pursuit only after the other side withdraws or routs; the Union run\'s one loser surrenders; the testbed run fires it'),
  'combat.surrendered': around(1),
  'combat.withdrew': around(1),
  'control.changed': around(15),
  'control.threshold_crossed': around(6),
  // Lane 1.4: the Home Squadron's ships take the pack's assumed one-month norm (lane 1.10), and eat it where no supply reaches.
  'forces.stores_fell': around(37),
  'forces.stores_low': around(1),
  'forces.stores_refilled': notHere('most Union blocks have unknown stores (lane 0.3 data, lane 0.5 finding 3), so the few that fall do not refill in 75 days; the testbed run fires it'),
  // Lane 1.11a: with the people data entered (the cast's temperament, values and regard), the merged run's one battle-day leaves more stragglers, who return: 32 fires (it was 10 before). Re-banded from the merged run; flank_broken, routed and withdrew stay inside lane 1.4's bands.
  'forces.stragglers_returned': around(32),
  // Lane 1.4: the Charleston command's operation on Washington: one opened, its stages, works dug after it holds; the
  // battle's dispatches by the hour and both sides' returns, first and full.
  'combat.flank_broken': notHere('the one battle-day draws no break; the testbed run fires it'),
  'combat.routed': notHere('the garrison surrenders before it routs; the testbed run fires it'),
  'combat.works_stormed': notHere('the one battle is in ground with no works; the testbed run fires it'),
  'operations.ended': around(1),
  'operations.opened': around(1),
  'operations.stage': around(20),
  'operations.works': around(6),
  'orders.responses_pruned': around(4),
  'reports.battle_dispatch': around(8),
  'reports.casualty_return': around(4),
  'reports.governor_wire': notHere('the one battle\'s ground belongs to no government whose head post is on a side that fought there; the testbed run fires it'),
  'reports.pocket': notHere('no headquarters is cut off in 75 days; the testbed run fires it'),
  'map.pocket_closed': notHere('no pocket closes in the first 75 days of the merged Union run; the testbed run fires it'),
  'knowledge.pruned_age': around(8),
  'knowledge.pruned_superseded': around(73),
  'map.recomputed': around(10),
  'messages.courier_delay': around(197),
  'messages.delivered': around(2681),
  'messages.sent': around(2820),
  // The War Department withholds the principal's approval of the Washington garrison's plan; he sends it around.
  'messages.special_messenger': around(2),
  'orders.bypassed': around(4),
  'movement.arrived': around(19),
  'movement.leg_started': around(10),
  'orders.obeyed': around(2),
  'orders.relay_held': around(1),
  'orders.relay_objected': around(1),
  'orders.relayed': around(3),
  'plans.goal_reached': around(1),
  'regions.self_emancipation': notHere('the Union pack has no census rows until lane 1.10 sources them, so the term has nowhere to run; the testbed run fires it'),
  'regions.reached_lines': notHere('the Union pack has no census rows until lane 1.10 sources them; the testbed run fires it'),
  'seats.choices': around(2),
  // The two opening goals: the Charleston command's plan goes ahead; the Washington garrison's holds, so it is reviewed and approved.
  ...planBands({ drafts: 2, reviewed: 1, wentAhead: 1, goalFit: 0, supply: 2 }),
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
  // Lane 1.5: grievances from overruled and bypassed men climb the ladder and fade week by week; attention is spent on
  // the opening orders and refilled each week. The Union pack authors no seat initiative and no man here is famous enough to be a rival.
  'ladder.moved': around(4),
  'ladder.rival': notHere('nobody on a Union ladder rung of lobbying or above has the standing of a rival in 75 days; the testbed run fires it'),
  'people.grievances_faded': around(20),
  'seats.attention_refilled': around(10),
  'seats.attention_spent': around(4),
  'seats.initiative': quiet('the Union pack authors no seat initiative yet (lane 1.5 builds the mechanism; the cast’s initiatives are 1B data); the testbed run fires it'),
};

/** The testbed reference run: 120 days from day 1, at war from the start (the testbed names no war chain). */
const TESTBED_BANDS: Record<string, GateBand> = {
  // Lane 1.3, merged with lane 1.2's plans: three battles, each one day: the defender withdraws, and the winner chooses
  // whether to pursue.
  'combat.battle_closed': around(3),
  'combat.battle_day': around(3),
  'combat.battle_opened': around(3),
  'combat.captured': around(3),
  'combat.cut_off': notHere('a side is cut off only with no legal retreat (0019); every testbed loser has a way back; the Union run fires it'),
  'combat.general_hit': notHere('a commander is hit on a low draw on his own stream; none of the testbed run\'s three battle-days draws one; the Union run fires it'),
  'combat.killed_wounded': around(6),
  'combat.missing': around(6),
  'combat.occupation': around(20),
  'combat.pursuit_chosen': around(1),
  'combat.surrendered': notHere('only a cut-off force surrenders, and no testbed force is cut off; the Union run fires it'),
  'combat.withdrew': around(3),
  'control.changed': around(23),
  'control.threshold_crossed': around(11),
  'forces.stores_fell': around(183),
  'forces.stores_low': around(6),
  'forces.stores_refilled': around(193),
  'forces.stragglers_returned': around(87),
  // Lane 1.4: three operations, their stages and works; the battles' hourly dispatches, returns, governors' wires and pocket reports.
  'combat.flank_broken': around(2),
  'combat.routed': around(2),
  'combat.works_stormed': around(1),
  'operations.ended': around(3),
  'operations.opened': around(3),
  'operations.stage': around(13),
  'operations.works': around(4),
  'orders.responses_pruned': around(3),
  'reports.battle_dispatch': around(24),
  'reports.casualty_return': around(12),
  'reports.governor_wire': around(3),
  'reports.pocket': around(3),
  'map.pocket_closed': around(1),
  'knowledge.pruned_age': around(15),
  'knowledge.pruned_superseded': around(118),
  'map.recomputed': around(14),
  'messages.courier_delay': around(85),
  'messages.delivered': around(1812),
  'messages.sent': around(1829),
  'messages.special_messenger': around(1),
  'movement.arrived': around(18),
  'movement.leg_started': around(7),
  'orders.bypassed': notHere('the principal goes around an office only when it objects, which the testbed’s does not (it holds instead); union-1861 fires it'),
  'orders.obeyed': around(3),
  // Lane 1.1: the war minister, not candid and cool toward his leader, slow-walks what he relays.
  'orders.relay_held': around(3),
  'orders.relay_objected': notHere(NO_CANDID_RELAY),
  'orders.relayed': around(3),
  'plans.goal_reached': around(2),
  // Lane 1.7: the fen folk's own act, every week from day 1, in each census region the North's protection flag does not cover (G-1.7a), the North's own western front among them.
  'regions.self_emancipation': around(72),
  'regions.reached_lines': around(36),
  'seats.choices': around(3),
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
  'seats.attention_spent': around(2),
  'seats.initiative': around(15),
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
