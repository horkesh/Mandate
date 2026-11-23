import { withinCommand } from '../command/command.ts';
import { forceTotals, type ForceTotalsCache } from '../forces/lots.ts';
/**
 * Day-tick phase 3 (FOUNDATION section 10; lane 1.4): operations, then movement. It replaces Phase 0's standing-goal
 * path (`tick/standing.ts` and `plans/execute.ts`, retired here).
 *
 * 1. **Operations follow plans.** An approved plan (or one assembled and awaiting the word) opens an operation; a
 *    change of goal or plan ends the old one as superseded. Opening sends each support request to its holder as a
 *    directive (FOUNDATION section 5), which he answers on arrival by his own compliance (`tick/support.ts`).
 * 2. **Each axis moves through its stages** (`operations/operations.ts`), reading the plan and what the battle model
 *    did yesterday:
 *    - `assemble`: until the plan's concentration ends, the word to go comes, and a partner axis's holder agrees;
 *    - `bombard`: guns already at the firing shore use the pack's battery preparation, then fire without a march
 *      or a works phase; guns displaced from that shore must march back before they fire;
 *    - `march`: along the plan's own route, leg by leg (rerouting by the quickest legs where a leg is barred), with a
 *      pause at each depot step;
 *    - `assault`: where the enemy stands in its way; the battle model fights it (phase 3b);
 *    - `works`: holding its objective, digging in each night, until its side holds the objective's control;
 *    - `withdraw`, then `pause`: driven back by the battle model (it withdrew or routed), it pauses, then tries again,
 *      until it has been driven back too often;
 *    - `pursue`: the commander's own pursuit choice after a battle (lane 1.3, `bsidePursue`), for the pack's days;
 *    - `end`: its objective held, superseded, failed, or its force gone.
 * 3. **Every march gains a day** (movement), after the day's legs start.
 *
 * Commanders' choices here are their plans' and the battle model's: no dice (0007), and never the player's (hard rule 1).
 */
import { strictCompare } from '../compare.ts';
import { factionOfBlock, isNaval } from '../forces/forces.ts';
import type { FactionId, ForceBlockId, PostId, RegionId } from '../ids.ts';
import { endJoins, markJoins } from '../movement/join.ts';
import { BOMBARD_MECHANICS, bombardFort } from './bombard.ts';
import { advanceMarches, marchBar, marchSteps, startLeg, type MarchGround } from '../movement/march.ts';
import { enter, openOperationOf, openOperations, operationId, putOperations, type OpAxis, type OperationRecord, type OpRequest, type StageReason } from '../operations/operations.ts';
import type { PlanCandidate } from '../planner/types.ts';
import { applyFortification, type FortificationDelta } from '../regions/regions.ts';
import { otherEnd } from '../world/index.ts';
import { applyDetachmentProposals, type DetachmentProposal } from './detachments.ts';
import type { State } from '../root-state.ts';
import { postFaction } from '../seats/posts.ts';
import { morningGround } from '../seats/requests.ts';
import { edgeLeg } from '../supply/supply.ts';
import { fire, sendReport, type TickContext } from './context.ts';
import { sendSupportRequest } from './support.ts';

/** Every mechanic this phase counts. */
export const OPERATIONS_MECHANICS = [
  'movement.arrived',
  'movement.join_blocked',
  'movement.joined',
  'movement.leg_started',
  'operations.ended',
  'operations.landed',
  'operations.opened',
  'operations.repulsed',
  'operations.stage',
  'operations.support_answered',
  'operations.support_refused',
  'operations.support_sent',
  'operations.works',
  'plans.goal_reached',
  ...BOMBARD_MECHANICS,
] as const;

/** Blocks of an axis still in it: they exist, its post commands them, and they have not surrendered. */
export function liveBlocks(state: State, axis: OpAxis): ForceBlockId[] {
  return axis.oaxBlocks.filter((b) => {
    const f = state.forceBlockStates[b];
    return f !== undefined && f.fbSurrenderedDay === null && withinCommand(state,state.forceAssignments[b]??null,axis.oaxPost) && state.forceLocations[b] !== undefined;
  });
}

/** Where an axis's force stands: the region of its strongest block (known men, ties by id), who stands there, and whether any is on a leg. */
export function axisGroup(state: State, blocks: readonly ForceBlockId[], cache?: ForceTotalsCache): { readonly region: RegionId; readonly standing: readonly ForceBlockId[]; readonly marching: boolean } | null {
  if (blocks.length === 0) return null;
  const lead = [...blocks].sort((a, b) => (forceTotals(state.forceBlockStates[b]!, cache).fbStrength ?? 0) - (forceTotals(state.forceBlockStates[a]!, cache).fbStrength ?? 0) || strictCompare(a, b))[0]!;
  const loc = state.forceLocations[lead]!;
  const region = loc.locMarch !== null ? loc.locMarch.marchFrom : loc.locRegion;
  const standing = blocks.filter((b) => {
    const l = state.forceLocations[b]!;
    return l.locRegion === region && l.locMarch === null && l.locAboard === null;
  });
  return { region, standing: [...standing].sort(strictCompare), marching: blocks.some((b) => state.forceLocations[b]!.locMarch !== null) };
}

/** Whether another side's land force stands (not marching, not surrendered) in a region. */
export function enemyIn(ctx: TickContext, state: State, region: RegionId, side: FactionId): boolean {
  return (Object.keys(state.forceLocations) as ForceBlockId[]).some((b) => {
    const l = state.forceLocations[b]!;
    if (l.locRegion !== region || l.locMarch !== null || l.locAboard !== null) return false;
    if (state.forceBlockStates[b]!.fbSurrenderedDay !== null || isNaval(ctx.world.map, state, b)) return false;
    const f = factionOfBlock(ctx.world.map, state, b);
    return f !== null && f !== side;
  });
}

/** Yesterday's battle-day that touched this axis's blocks, with its side and the other. */
function yesterdaysBattle(state: State, blocks: readonly ForceBlockId[], side: FactionId, day: number) {
  for (const id of Object.keys(state.battleRecords).sort(strictCompare)) {
    const r = state.battleRecords[id]!;
    const d = r.battleDays[r.battleDays.length - 1];
    if (d === undefined || d.bdayDay !== day - 1) continue;
    const mine = d.bdaySides.find((s) => s.bsideFaction === side);
    if (mine === undefined || !mine.bsideBlocks.some((b) => blocks.includes(b))) continue;
    return { region: r.battleRegion, mine, theirs: d.bdaySides.find((s) => s.bsideFaction !== side)! };
  }
  return null;
}

/** Days, rounded up, of a permille-days span. */
const days = (milli: number): number => Math.ceil(milli / 1000);

/** A new operation for an approved plan: one axis per plan axis, each assembling; its requests not yet sent. */
function opened(post: PostId, holder: OperationRecord['opCommander'], record: State['planRecords'][PostId], plan: PlanCandidate, day: number): OperationRecord {
  const concentrate = (name: string) => {
    const axis = plan.candAxes.find((a) => a.axisName === name)!;
    const c = axis.axisPhases.find((p) => p.phaseKind === 'concentrate');
    return c === undefined ? day : day + days(c.phaseDays);
  };
  const axes: OpAxis[] = plan.candAxes
    .filter((a) => a.axisRoute.routeLegs.length > 0 || a.axisRoute.routeFrom !== a.axisRoute.routeTo || a.axisName === 'main')
    .map((a) =>
      enter(
        { oaxName: a.axisName, oaxPost: a.axisPost, oaxBlocks: a.axisBlocks, oaxRoute: a.axisRoute, oaxPhases: a.axisPhases, oaxObjective: a.axisRoute.routeTo, oaxStage: 'assemble', oaxSince: day, oaxUntil: null, oaxRepulses: 0, oaxPursuit: null, oaxSteps: [], oaxArrived: null, oaxLog: [] },
        'assemble',
        'opened',
        day,
        a.axisRoute.routeFrom,
        concentrate(a.axisName),
      ),
    );
  const partner = plan.candAxes.some((a) => a.axisPost !== post);
  return {
    opPost: post,
    opCommander: holder,
    opOrder: record!.planOrder,
    opPlan: plan.id,
    opMethod: plan.candMethod,
    opPosture: record!.planGoal.goalPosture,
    opObjective: record!.planGoal.goalObjective,
    opStartDay: day,
    opEndDay: null,
    opOutcome: null,
    opAxes: axes,
    opRequests: [],
    opEncirclement: plan.candMethod === 'pincer' && partner ? 'pending' : null,
    opEncirclementWhy: null,
  };
}

/** End an operation and every axis still running, with the outcome and the reason. */
function ended(op: OperationRecord, outcome: NonNullable<OperationRecord['opOutcome']>, reason: StageReason, day: number): OperationRecord {
  return { ...op, opEndDay: day, opOutcome: outcome, opAxes: op.opAxes.map((a) => (a.oaxStage === 'end' ? a : enter(a, 'end', reason, day, a.oaxObjective))) };
}

/**
 * Whether a pincer's arrows met (FOUNDATION section 5: an encirclement is two commanders' arrows meeting), and why not:
 * the partner's holder refused, slow-walked past the window, or the post was vacant (human reasons), or no route
 * reached the objective (the ground).
 */
function encirclement(op: OperationRecord, plan: PlanCandidate): Pick<OperationRecord, 'opEncirclement' | 'opEncirclementWhy'> {
  if (op.opEncirclement === null || op.opEncirclement !== 'pending') return { opEncirclement: op.opEncirclement, opEncirclementWhy: op.opEncirclementWhy };
  const partner = op.opAxes.find((a) => a.oaxPost !== op.opPost);
  const main = op.opAxes.find((a) => a.oaxPost === op.opPost);
  const request = op.opRequests.find((r) => r.oreqKind === 'cooperating_axis');
  if (partner === undefined || main === undefined) return { opEncirclement: 'failed_human', opEncirclementWhy: 'partner_vacant' };
  if (request?.oreqAnswer === 'refused') return { opEncirclement: 'failed_human', opEncirclementWhy: 'partner_refused' };
  if (request?.oreqAnswer === 'vacant') return { opEncirclement: 'failed_human', opEncirclementWhy: 'partner_vacant' };
  const window = plan.candRequests.find((r) => r.reqKind === 'cooperating_axis');
  const lateAfter = op.opStartDay + days(window?.reqArriveTo ?? 0);
  const lastReason = partner.oaxLog[partner.oaxLog.length - 1]?.axevReason;
  if (partner.oaxStage === 'end' && partner.oaxArrived === null) return { opEncirclement: lastReason === 'no_route' ? 'failed_ground' : 'failed_human', opEncirclementWhy: lastReason === 'no_route' ? 'no_route' : 'partner_late' };
  if (partner.oaxArrived !== null && partner.oaxArrived > lateAfter) return { opEncirclement: 'failed_human', opEncirclementWhy: 'partner_late' };
  if (partner.oaxArrived !== null && main.oaxArrived !== null) return { opEncirclement: 'met', opEncirclementWhy: null };
  return { opEncirclement: 'pending', opEncirclementWhy: null };
}

/** Phase 3: operations follow their plans, each axis takes its day's stage, then every march gains a day. */
export function operationsPhase(ctx: TickContext, start: State): State {
  let state = start;
  const { world, day } = ctx;
  const ground = morningGround(world, state, day).march;

  // 1. Operations follow plans: open one for each plan executing or assembling, end one whose plan changed.
  const planned = Object.keys(state.planRecords) as PostId[];
  for (const post of planned.sort(strictCompare)) {
    const r = state.planRecords[post]!;
    const plan = r.planApproved;
    const executing = (r.planStatus === 'approved' || r.planStatus === 'ready') && plan !== null && plan.candMethod !== 'holding';
    const open = openOperationOf(state, post);
    const current = open === null ? null : state.operationRecords[open]!;
    const same = current !== null && executing && current.opOrder === r.planOrder && current.opPlan === plan!.id;
    if (current !== null && !same) {
      state = putOperations(state, [{ id: open!, record: ended(current, 'superseded', 'superseded', day) }]);
      fire(ctx, 'operations.ended');
    }
    // One operation per goal and plan: once it has run (held, failed), the plan stays approved but nothing reopens it.
    const ran = executing && Object.values(state.operationRecords).some((o) => o.opPost === post && o.opOrder === r.planOrder && o.opPlan === plan!.id);
    if (executing && !same && !ran && state.operationRecords[operationId(post, day)] === undefined) {
      const holder = state.postStates[post]?.postHolder ?? null;
      let op = opened(post, holder, r, plan!, day);
      const requests: OpRequest[] = plan!.candRequests.map((q) => {
        const axis = q.reqKind === 'cooperating_axis' ? (plan!.candAxes.find((a) => a.axisPost === q.reqPost && a.axisPost !== post)?.axisName ?? null) : q.reqKind === 'naval_support' ? (plan!.candAxes.find((a) => a.axisMode !== 'land')?.axisName ?? null) : null;
        const base: OpRequest = { oreqKind: q.reqKind, oreqPost: q.reqPost, oreqHolder: q.reqHolder, oreqAxis: axis, oreqMessage: null, oreqSentDay: day, oreqAnswer: 'pending', oreqRung: null, oreqResponse: null, oreqAnswerDay: null, oreqFrom: null };
        if (q.reqKind === 'reinforcement') return { ...base, oreqAnswer: 'to_principal' };
        const target = q.reqPost === null ? null : (state.postStates[q.reqPost]?.postHolder ?? null);
        if (holder === null || target === null || q.reqPost === null) return { ...base, oreqAnswer: 'vacant', oreqAnswerDay: day };
        const goal = { ...r.planGoal, goalObjective: q.reqObjective ?? r.planGoal.goalObjective, goalCommitted: [], goalAwaitWord: false, goalApproveAsDrafted: true };
        const message = sendSupportRequest(ctx, state, holder, post, q.reqPost, goal);
        return { ...base, oreqMessage: message, oreqHolder: target };
      });
      op = { ...op, opRequests: requests };
      state = putOperations(state, [{ id: operationId(post, day), record: op }]);
      fire(ctx, 'operations.opened');
    }
  }

  // 2. Each open operation's axes take the day's stage.
  const works: FortificationDelta[] = [];
  for (const id of openOperations(state)) {
    let op = state.operationRecords[id]!;
    const record = state.planRecords[op.opPost];
    const plan = record?.planApproved ?? null;
    const axes: OpAxis[] = [];
    for (const axis of op.opAxes) {
      const stepped = stepAxis(ctx, state, ground, op, axis, record?.planStatus === 'ready', works);
      state = stepped.state;
      axes.push(stepped.axis);
    }
    op = { ...op, opAxes: axes };
    if (plan !== null) op = { ...op, ...encirclement(op, plan) };
    // The operation ends with its own main axis (the first axis of its own post).
    const main = axes.find((a) => a.oaxPost === op.opPost) ?? axes[0];
    if (main !== undefined && main.oaxStage === 'end') {
      const why = main.oaxLog[main.oaxLog.length - 1]!.axevReason;
      const outcome = why === 'objective_held' ? 'objective_reached' : why === 'superseded' ? 'superseded' : 'failed';
      op = ended(op, outcome, why, day);
      fire(ctx, 'operations.ended');
    }
    state = putOperations(state, [{ id, record: op }]);
  }
  if (works.length > 0) {
    const applied = applyFortification(state, works);
    state = applied.state;
    for (const c of applied.changes) fire(ctx, 'operations.works', c.after - c.before);
  }

  // 2b. Blocks under orders to join their post march toward its seat (lane 1.12: a transfer concentrates).
  state = joinStep(ctx, state, ground);

  // 3. Every march gains a day.
  const marched = advanceMarches(state, day);
  state = marched.state;
  for (const a of marched.arrivals) fire(ctx, 'movement.arrived', 1 + a.carried.length);
  return state;
}

/**
 * The day's legs for blocks ordered to join their post at its seat (lane 1.12; `movement/join.ts`). A block standing
 * (not on a leg, not aboard) takes the first leg of a quickest route to the seat, by movement's own rules, so by rail
 * where its side traces the line; blocks standing together going to the same seat march together. A block with no route
 * waits, typed `no_route`, and is tried again tomorrow. The order ends when the block stands at the seat
 * (`movement.joined`), or when it is no longer the post's, has surrendered, is gone, or is in one of the post's
 * operations, which moves it from then on.
 */
function joinStep(ctx: TickContext, start: State, ground: MarchGround): State {
  let state = start;
  const ids = Object.keys(state.forceJoins).sort(strictCompare) as ForceBlockId[];
  if (ids.length === 0) return state;
  const inOperation = new Set(openOperations(state).flatMap((id) => state.operationRecords[id]!.opAxes.filter((a) => a.oaxStage !== 'end').flatMap((a) => a.oaxBlocks)));
  const ended: ForceBlockId[] = [];
  const groups = new Map<string, { readonly from: RegionId; readonly to: RegionId; readonly naval: boolean; readonly blocks: ForceBlockId[] }>();
  for (const b of ids) {
    const j = state.forceJoins[b]!;
    const loc = state.forceLocations[b];
    const f = state.forceBlockStates[b];
    if (loc === undefined || f === undefined || f.fbSurrenderedDay !== null || state.forceAssignments[b] !== j.joinPost || inOperation.has(b)) {
      ended.push(b);
      continue;
    }
    if (loc.locMarch !== null || loc.locAboard !== null) continue;
    if (loc.locRegion === j.joinRegion) {
      ended.push(b);
      fire(ctx, 'movement.joined');
      continue;
    }
    const naval = isNaval(ctx.world.map, state, b);
    const key = `${loc.locRegion}|${j.joinRegion}|${naval ? 'n' : 'l'}`;
    const g = groups.get(key) ?? { from: loc.locRegion, to: j.joinRegion, naval, blocks: [] };
    g.blocks.push(b);
    groups.set(key, g);
  }
  for (const key of [...groups.keys()].sort(strictCompare)) {
    const g = groups.get(key)!;
    const side = factionOfBlock(ctx.world.map, state, g.blocks[0]!);
    const leg = side === null ? null : (marchSteps(ground, g.from, g.to, side, g.naval)[0]?.leg ?? null);
    if (side === null || leg === null) {
      state = markJoins(state, g.blocks, 'no_route');
      fire(ctx, 'movement.join_blocked', g.blocks.length);
      continue;
    }
    state = markJoins(state, g.blocks, null);
    fire(ctx, 'movement.leg_started');
    state = startLeg(ground, state, g.blocks, leg, side, g.naval, ctx.day);
  }
  return endJoins(state, ended);
}

/** One axis's day: the stage it takes, the legs it starts, the works it digs. */
function stepAxis(ctx: TickContext, start: State, ground: MarchGround, op: OperationRecord, given: OpAxis, awaitingWord: boolean, works: FortificationDelta[]): { readonly state: State; readonly axis: OpAxis } {
  let axis = given;
  let state = start;
  const { world, day } = ctx;
  const rules = world.map.world.rules.operations;
  if (axis.oaxStage === 'end') return { state, axis };
  const blocks = liveBlocks(state, axis);
  const side = postFaction(world, state, axis.oaxPost);
  const group = axisGroup(state, blocks, ctx.world.map.forceTotalsCache);
  const move = (a: OpAxis, stage: OpAxis['oaxStage'], reason: StageReason, region: RegionId | null, until: number | null = null): OpAxis => {
    fire(ctx, 'operations.stage');
    return enter(a, stage, reason, day, region, until);
  };
  if (group === null || side === null) {
    const taken = axis.oaxBlocks.some((b) => state.forceBlockStates[b]?.fbSurrenderedDay !== null && state.forceBlockStates[b] !== undefined);
    return { state, axis: move(axis, 'end', taken ? 'force_taken' : 'no_forces', axis.oaxObjective) };
  }
  const naval = group.standing.length > 0 && group.standing.every((b) => isNaval(world.map, state, b));
  const here = group.region;
  /** Start the group's next leg toward `to`: the plan's own leg where it is open, else the quickest step. */
  const legToward = (a: OpAxis, to: RegionId): { readonly state: State; readonly axis: OpAxis } => {
    if (group.marching || group.standing.length === 0 || here === to) return { state, axis: a };
    const planned = a.oaxRoute.routeLegs.find((l) => l.legFrom === here && to === a.oaxObjective);
    let leg = null;
    let rerouted = false;
    if (planned !== undefined) {
      const edge = world.map.edges.get(planned.legEdge);
      const candidate = edge === undefined ? null : edgeLeg(world.map, edge, here, ground.month, ground.network);
      if (candidate !== null && marchBar(ground, candidate, side, naval) === null) leg = candidate;
    }
    if (leg === null) {
      leg = marchSteps(ground, here, to, side, naval)[0]?.leg ?? null;
      rerouted = leg !== null && planned !== undefined;
    }
    if (leg === null) return { state, axis: a };
    fire(ctx, 'movement.leg_started');
    const next = startLeg(ground, state, group.standing, leg, side, naval, day);
    const last = a.oaxLog[a.oaxLog.length - 1];
    const logged = rerouted && last?.axevReason !== 'rerouted' ? move(a, a.oaxStage, 'rerouted', here) : a;
    return { state: next, axis: logged };
  };

  // At sea (lane 1.4b): an axis whose troops are all aboard sails its carrier along the plan's water legs; beside its
  // objective, they go ashore as a landing, a detachment of each block's men, and the axis goes on as a land axis.
  const aboard = blocks.filter((b) => state.forceLocations[b]!.locAboard !== null);
  if (axis.oaxStage === 'march' && aboard.length > 0 && aboard.length === blocks.length) {
    const carrier = state.forceLocations[aboard[0]!]!.locAboard!;
    const cloc = state.forceLocations[carrier];
    if (cloc === undefined || cloc.locMarch !== null) return { state, axis };
    const at = cloc.locRegion;
    const objective = world.map.regions.get(axis.oaxObjective);
    const beside = (world.map.edgesAt.get(at) ?? []).some((e) => otherEnd(e, at) === axis.oaxObjective);
    if (beside && objective !== undefined && (objective.kind === 'land' || objective.kind === 'key_point')) {
      const proposals: DetachmentProposal[] = aboard
        .filter((b) => (forceTotals(state.forceBlockStates[b]!, ctx.world.map.forceTotalsCache).fbStrength ?? 0) > 0)
        .map((b) => ({ kind: 'landing', parent: b, men: forceTotals(state.forceBlockStates[b]!, ctx.world.map.forceTotalsCache).fbStrength!, region: axis.oaxObjective, post: axis.oaxPost, cause: 'operations' }));
      const landed = applyDetachmentProposals(world.map, state, proposals, day);
      for (const r of landed.refused) ctx.mapEvents.push({ event: 'proposal_refused', owner: 'forces', reason: r.reason, why: r.why });
      if (landed.made.length === 0) return { state, axis: move(axis, 'end', 'no_forces', at) };
      fire(ctx, 'operations.landed', landed.made.length);
      return { state: landed.state, axis: move({ ...axis, oaxBlocks: landed.made }, 'march', 'landed', axis.oaxObjective) };
    }
    const planned = axis.oaxRoute.routeLegs.find((l) => l.legFrom === at);
    const edge = planned === undefined ? undefined : world.map.edges.get(planned.legEdge);
    const leg = edge === undefined ? null : edgeLeg(world.map, edge, at, ground.month, ground.network);
    if (leg === null || marchBar(ground, leg, side, true) !== null) return { state, axis: axis.oaxLog.at(-1)?.axevReason === 'no_route' ? axis : move(axis, 'march', 'no_route', at) };
    fire(ctx, 'movement.leg_started');
    return { state: startLeg(ground, state, [carrier], leg, side, true, day), axis };
  }

  // Driven back yesterday (the battle model withdrew or routed it): withdraw, then pause, or fail.
  const battle = yesterdaysBattle(state, blocks, side, day);
  if (battle !== null && battle.mine.bsideRetreatTo !== null && axis.oaxStage !== 'withdraw' && axis.oaxStage !== 'pause') {
    const repulses = axis.oaxRepulses + 1;
    fire(ctx, 'operations.repulsed');
    const a = { ...axis, oaxRepulses: repulses };
    if (repulses >= rules.maxRepulses) return { state, axis: move(a, 'end', 'repulsed_too_often', here) };
    return { state, axis: move(a, 'withdraw', battle.mine.bsideResult === 'routed' ? 'routed' : 'repulsed', here) };
  }

  // A battle it fought yesterday where it stands and held its ground (it arrived and fought the same day): the assault is on record.
  if (battle !== null && battle.region === here && (axis.oaxStage === 'march' || axis.oaxStage === 'works')) axis = move(axis, 'assault', 'enemy_ahead', here);

  switch (axis.oaxStage) {
    case 'assemble': {
      if (awaitingWord) return { state, axis: axis.oaxLog[axis.oaxLog.length - 1]?.axevReason === 'awaiting_word' ? axis : move(axis, 'assemble', 'awaiting_word', here, axis.oaxUntil) };
      // A partner's axis, or one carried by another post's ship (lane 1.4b), moves only on its holder's answer.
      const asked = op.opRequests.find((r) => r.oreqAxis === axis.oaxName);
      if (axis.oaxPost !== op.opPost || asked !== undefined) {
        const req = asked;
        if (req === undefined || req.oreqAnswer === 'refused' || req.oreqAnswer === 'vacant') return { state, axis: move(axis, 'end', 'support_refused', here) };
        if (req.oreqAnswer === 'pending') return { state, axis: axis.oaxLog[axis.oaxLog.length - 1]?.axevReason === 'awaiting_support' ? axis : move(axis, 'assemble', 'awaiting_support', here, axis.oaxUntil) };
        if (req.oreqAnswer === 'delayed' && req.oreqFrom !== null && day < req.oreqFrom) return { state, axis: axis.oaxLog[axis.oaxLog.length - 1]?.axevReason === 'support_delayed' ? axis : move(axis, 'assemble', 'support_delayed', here, req.oreqFrom) };
      }
      // A plan's firing position is not the fort. If its guns have moved since drafting, get them back first.
      if (op.opMethod === 'bombard' && (here !== axis.oaxRoute.routeFrom || group.marching)) {
        return legToward(move(axis, 'march', 'on_route', here), axis.oaxRoute.routeFrom);
      }
      if (axis.oaxUntil !== null && day < axis.oaxUntil) return { state, axis };
      // Ready batteries open now, without spending another day merely changing stages.
      if (op.opMethod === 'bombard') return stepAxis(ctx, state, ground, op, move(axis, 'bombard', 'bombarding', here), awaitingWord, works);
      const a = move(axis, 'march', 'concentrated', here);
      return legToward(a, a.oaxObjective);
    }
    case 'bombard': {
      // The fort is the side's once the garrison has gone and its control has passed: the goal is reached.
      if ((state.regionControl[axis.oaxObjective]?.[side] ?? 0) >= rules.holdControlPermille) {
        fire(ctx, 'plans.goal_reached');
        return { state, axis: move(axis, 'end', 'objective_held', axis.oaxObjective) };
      }
      if (group.marching || group.standing.length === 0) return { state, axis };
      if (here !== axis.oaxRoute.routeFrom) return legToward(move(axis, 'march', 'on_route', here), axis.oaxRoute.routeFrom);
      const batteries = world.map.world.rules.combat.bombardment;
      const inRange = (world.map.edgesAt.get(here) ?? []).some((e) => (e.type === 'sea' || e.type === 'river') && otherEnd(e, here) === axis.oaxObjective && e.lengthDays * 1000 <= batteries.rangeMaxDaysPermille);
      if (!inRange || !group.standing.some((b) => batteries.gunArms.includes(state.forceBlockStates[b]!.fbArm) && (forceTotals(state.forceBlockStates[b]!, ctx.world.map.forceTotalsCache).fbStrength ?? 0) > 0)) return { state, axis: move(axis, 'end', 'no_forces', here) };
      const fired = bombardFort(ctx, state, axis.oaxPost, group.standing, axis.oaxObjective, side, works);
      if (fired.fort?.surrendered !== null && fired.fort?.surrendered !== undefined) return { state: fired.state, axis: move({ ...axis, oaxArrived: axis.oaxArrived ?? day }, 'bombard', 'garrison_surrendered', axis.oaxObjective) };
      return { state: fired.state, axis };
    }
    case 'march': {
      if (group.marching) return { state, axis };
      if (op.opMethod === 'bombard') {
        if (here !== axis.oaxRoute.routeFrom) return legToward(axis, axis.oaxRoute.routeFrom);
        if (axis.oaxUntil !== null && day < axis.oaxUntil) return { state, axis };
        return stepAxis(ctx, state, ground, op, move(axis, 'bombard', 'bombarding', here), awaitingWord, works);
      }
      if (enemyIn(ctx, state, here, side)) return { state, axis: move(axis, 'assault', 'enemy_ahead', here) };
      if (here === axis.oaxObjective) {
        const a = move({ ...axis, oaxArrived: axis.oaxArrived ?? day }, 'works', 'objective_reached', here);
        reportArrival(ctx, state, op, a, here);
        return { state, axis: a };
      }
      const step = depotStepAt(axis, here);
      if (step !== null && !axis.oaxSteps.includes(here)) return { state, axis: move({ ...axis, oaxSteps: [...axis.oaxSteps, here] }, 'pause', 'depot_step', here, day + days(step)) };
      const moved = legToward(axis, axis.oaxObjective);
      if (moved.state === state && !group.marching && marchSteps(ground, here, axis.oaxObjective, side, naval).length === 0) return { state, axis: move(axis, 'end', 'no_route', here) };
      return moved;
    }
    case 'assault': {
      if (group.marching) return { state, axis };
      if (enemyIn(ctx, state, here, side)) {
        // The battle goes on (phase 3b fights it). A pursuit is chosen only once the other side has left.
        return { state, axis };
      }
      const pursue = battle?.mine.bsidePursue ?? null;
      if (battle !== null && (pursue === 'follow' || pursue === 'press') && battle.theirs.bsideRetreatTo !== null) {
        const until = day + (pursue === 'press' ? rules.pursuitDays.press : rules.pursuitDays.follow);
        const a = move({ ...axis, oaxPursuit: battle.theirs.bsideRetreatTo }, 'pursue', 'pursuing', here, until);
        return legToward(a, battle.theirs.bsideRetreatTo);
      }
      if (here === axis.oaxObjective) {
        const a = move({ ...axis, oaxArrived: axis.oaxArrived ?? day }, 'works', 'enemy_gone', here);
        reportArrival(ctx, state, op, a, here);
        return { state, axis: a };
      }
      const a = move(axis, 'march', 'enemy_gone', here);
      return legToward(a, a.oaxObjective);
    }
    case 'pursue': {
      if (group.marching) return { state, axis };
      const target = axis.oaxPursuit ?? axis.oaxObjective;
      if ((axis.oaxUntil !== null && day >= axis.oaxUntil) || (here === target && !enemyIn(ctx, state, here, side))) {
        const a = move({ ...axis, oaxPursuit: null }, 'march', 'pursuit_over', here);
        return legToward(a, a.oaxObjective);
      }
      if (enemyIn(ctx, state, here, side)) return { state, axis };
      return legToward(axis, target);
    }
    case 'withdraw':
      return { state, axis: move(axis, 'pause', 'repulsed', here, day + rules.pauseDays) };
    case 'pause': {
      if (axis.oaxUntil !== null && day < axis.oaxUntil) return { state, axis };
      const a = move(axis, 'march', 'pause_over', here);
      return legToward(a, a.oaxObjective);
    }
    case 'works': {
      if (here !== axis.oaxObjective) return legToward(move(axis, 'march', 'on_route', here), axis.oaxObjective);
      if (enemyIn(ctx, state, here, side)) return { state, axis: move(axis, 'assault', 'enemy_ahead', here) };
      const level = state.regionFortification[here] ?? 0;
      if (rules.works.perNightPermille > 0 && level < rules.works.capPermille) works.push({ region: here, deltaPermille: Math.min(rules.works.perNightPermille, rules.works.capPermille - level), cause: 'operations' });
      if ((state.regionControl[here]?.[side] ?? 0) >= rules.holdControlPermille) {
        fire(ctx, 'plans.goal_reached');
        return { state, axis: move(axis, 'end', 'objective_held', here) };
      }
      return { state, axis };
    }
  }
  return { state, axis };
}

/** The plan's depot step at a region on this axis, in permille days, or null (the planner's phases, kept on the axis). */
function depotStepAt(axis: OpAxis, region: RegionId): number | null {
  const p = axis.oaxPhases.find((x) => x.phaseKind === 'depot_step' && x.phaseRegion === region);
  return p === undefined ? null : p.phaseDays;
}

/** He wires his principal that his axis stands at its objective (the arrival the standing path reported, lane 0.6). */
function reportArrival(ctx: TickContext, state: State, op: OperationRecord, axis: OpAxis, region: RegionId): void {
  if (axis.oaxPost !== op.opPost) return;
  const holder = state.postStates[op.opPost]?.postHolder ?? null;
  const side = postFaction(ctx.world, state, op.opPost);
  if (holder === null || side === null) return;
  sendReport(ctx, state, {
    body: {
      reportType: 'wire-dispatch',
      reportSubtype: null,
      reportAuthor: holder,
      reportAuthorPost: op.opPost,
      reportSubjectKind: 'post',
      reportSubjectId: op.opPost,
      reportClaims: [{ claimKind: 'arrived', claimRegion: region, claimValue: 1, claimToken: null, claimConfidence: 1000 }],
      reportDay: ctx.day,
      reportHour: null,
      reportAdvice: null,
      reportAnswers: op.opOrder,
    },
    truth: { truthTerms: [], truthTrimmed: [] },
    to: ctx.world.faction(side).principal,
    tag: `arrived.${op.opPost}`,
  });
}
