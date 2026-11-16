import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { BattleDay } from '../src/combat/records.ts';
import { toId, type MessageId } from '../src/ids.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';
import type { OperationRecord } from '../src/operations/operations.ts';
import type { PlanAxis, PlanCandidate, PlanLeg, PlanRequest } from '../src/planner/types.ts';
import type { PlanGoal } from '../src/plans/goal.ts';
import type { PlanRecord } from '../src/plans/plans.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { createState } from '../src/tick/setup.ts';
import { tick, type TickResult } from '../src/tick/tick.ts';
import type { ForceBlockStart, PostStart } from '../src/world/scenario.ts';
import { indexWorld, type WorldIndex } from '../src/world/index.ts';
import { worldOf } from './support/tick-context.ts';
import { B, block, forcesStart, forcesWorld, P, PER, person, post } from './support/forces-fixture.ts';
import { depot, edge, F, R, region } from './support/map-fixture.ts';
import type { StatDirection } from '../src/world/people.ts';

/**
 * Operations (lane 1.4; FOUNDATION section 12's row 1.4), on fictional ground:
 *
 *   a_cap ==rail== a2 --road-- mid --road-- b2 ==rail== b_cap
 *     \                      /
 *      ---- flank ----------
 *
 * a's army (a_gen, or a bold or timid man) stands at a2; a partner army (a_partner) at flank; b's army holds mid.
 * Each test sets an approved plan as the planner would draft it, and lets the tick execute it.
 */
interface Cast {
  readonly gen?: { readonly boldness?: StatDirection; readonly values?: readonly string[] };
  readonly partner?: { readonly boldness?: StatDirection; readonly candour?: StatDirection; readonly values?: readonly string[] };
}

function mapOf(cast: Cast): WorldIndex {
  const base = forcesWorld({
    regions: ['a_cap', 'a2', 'mid', 'b2', 'b_cap', 'flank'].map((r) => region(r)),
    edges: [edge('a_cap', 'a2', { type: 'rail', line: 'a_line' }), edge('a2', 'mid'), edge('mid', 'b2'), edge('b2', 'b_cap', { type: 'rail', line: 'b_line' }), edge('a_cap', 'flank'), edge('flank', 'mid')],
    depots: [depot('a_src', 'a_cap'), depot('b_src', 'b_cap')],
    people: [
      person('a_lead', 'a'),
      person('a_gen', 'a', cast.gen ?? { boldness: 'high' }),
      person('a_partner', 'a', cast.partner ?? {}),
      person('b_lead', 'b'),
      person('b_min', 'b'),
      person('b_gen', 'b'),
    ],
  });
  // No commander is hit in these tests (the combat suite tests hits): a vacant post would send no reports.
  return indexWorld({ ...base, rules: { ...base.rules, combat: { ...base.rules.combat, leaders: { killedPermille: 0, woundedPermille: 0, capturedPermille: 0 } } } });
}

const CONTROL = { a_cap: { a: 1000 }, a2: { a: 1000 }, flank: { a: 1000 }, mid: { b: 1000 }, b2: { b: 1000 }, b_cap: { b: 1000 } };
const POSTS: readonly PostStart[] = [
  post('a_army', { department: 'a_war', holder: PER('a_gen'), region: R('a2') }),
  post('a_flank', { department: 'a_war', holder: PER('a_partner'), region: R('flank') }),
  post('b_office', { kind: 'office', department: 'b_war', holder: PER('b_min'), region: R('b_cap') }),
  post('b_army', { department: 'b_war', parent: P('b_office'), holder: PER('b_gen'), region: R('mid') }),
];

function game(cast: Cast, blocks: readonly ForceBlockStart[], o: { readonly control?: typeof CONTROL; readonly fortification?: number } = {}) {
  const start = forcesStart(o.control ?? CONTROL, POSTS, blocks, {
    factions: [
      { faction: F('a'), principal: PER('a_lead'), capital: R('a_cap'), playable: true },
      { faction: F('b'), principal: PER('b_lead'), capital: R('b_cap'), playable: true },
    ],
    fortification: o.fortification === undefined ? [] : [{ region: R('mid'), levelPermille: o.fortification }],
  });
  const world = worldOf(mapOf(cast), start);
  return { world, state: createState(world, { seed: 1, people: 'as-history' }) };
}

const leg = (from: string, to: string, edgeId: string): PlanLeg => ({ legEdge: toId('edge', edgeId), legFrom: R(from), legTo: R(to), legType: 'road', legDays: 1000, legThreat: 0, legSupply: 0, legObstacleDays: 0, legObstacle: null, legHeld: to === 'mid' });
const axis = (name: string, postId: string, blocks: readonly string[], legs: readonly PlanLeg[], concentrate = 1000): PlanAxis => ({
  axisName: name,
  axisPost: P(postId),
  axisMode: 'land',
  axisRoute: { routeFrom: legs[0]!.legFrom, routeTo: legs[legs.length - 1]!.legTo, routeLegs: legs, routeCost: 0, routeDays: legs.length * 1000 },
  axisBlocks: blocks.map(B),
  axisStrength: 0,
  axisPhases: [{ phaseKind: 'concentrate', phaseStart: 0, phaseDays: concentrate, phaseRegion: legs[0]!.legFrom }],
  axisArrival: 0,
  axisOutOfSupply: 0,
  axisStoresDays: 10,
  axisStoresAssumed: false,
});
const GOAL: PlanGoal = { goalObjective: R('mid'), goalPosture: 'take', goalRisk: 500, goalDeadlineDays: 30, goalRail: true, goalRiver: false, goalSea: false, goalNeutral: false, goalCommitted: [], goalAwaitWord: false, goalApproveAsDrafted: true };

/** The plan record `plans` would hold after the principal approved this candidate (the planner's work is lane 1.2's, tested there). */
function approved(state: State, postId: string, candidate: PlanCandidate): State {
  const record: PlanRecord = {
    planGoal: GOAL,
    planIssuer: PER('a_lead'),
    planViaChain: true,
    planSetDay: 0,
    planIssuedDay: 0,
    planOrder: 'order:test' as MessageId,
    planResponse: 'order:test|a_gen',
    planStatus: 'approved',
    planDraft: null,
    planChosen: candidate.id,
    planApproved: candidate,
    planSubmitted: null,
    planCounters: [],
    planPending: null,
  };
  return { ...state, planRecords: { ...state.planRecords, [P(postId)]: record } };
}
const plan = (id: string, method: PlanCandidate['candMethod'], axes: readonly PlanAxis[], requests: readonly PlanRequest[] = []): PlanCandidate => ({
  id,
  candMethod: method,
  candVariant: 'test',
  candAxes: axes,
  candRequests: requests,
  candConditions: [],
  candTerms: [],
  candScore: 0,
  candPerceived: 0,
  candRatio: 0,
});

function play(world: ReturnType<typeof game>['world'], start: State, days: number): TickResult[] {
  const out: TickResult[] = [];
  let state = start;
  for (let d = 0; d < days; d++) {
    const r = tick(world, state, [], { freeze: true });
    out.push(r);
    state = r.state;
  }
  return out;
}
const opOf = (s: State, postId: string): OperationRecord => Object.values(s.operationRecords).find((o) => o.opPost === P(postId))!;
const stages = (op: OperationRecord, i = 0) => op.opAxes[i]!.oaxLog.map((e) => e.axevStage);

describe('an operation executes an approved plan, axis by axis (lane 1.4)', () => {
  const DIRECT = plan('direct:a2-mid', 'direct', [axis('main', 'a_army', ['a_1'], [leg('a2', 'mid', 'road:a2:mid')])]);

  it('runs its whole lifecycle: assemble, march, assault, pursue, march, works, end with the objective held', () => {
    const g = game({ gen: { boldness: 'high' } }, [block('a_1', { department: 'a_war', region: 'a2', strength: 9000, post: P('a_army') }), block('b_1', { department: 'b_war', region: 'mid', strength: 2000, post: P('b_army') })]);
    const results = play(g.world, approved(g.state, 'a_army', DIRECT), 25);
    const final = results.at(-1)!.state;
    const op = opOf(final, 'a_army');
    expect(op.opOutcome).toBe('objective_reached');
    expect(stages(op)).toEqual(expect.arrayContaining(['assemble', 'march', 'assault', 'pursue', 'works', 'end']));
    // Each stage has its typed reason, in order: assemble first, end last.
    expect(op.opAxes[0]!.oaxLog[0]).toMatchObject({ axevStage: 'assemble', axevReason: 'opened' });
    expect(op.opAxes[0]!.oaxLog.at(-1)).toMatchObject({ axevStage: 'end', axevReason: 'objective_held' });
    // The pursuit is the commander's own choice, from the battle record (lane 1.3), never a draw.
    const fought = Object.values(final.battleRecords).flatMap((r) => r.battleDays);
    expect(fought.some((d) => d.bdaySides.some((s) => s.bsideFaction === 'a' && (s.bsidePursue === 'follow' || s.bsidePursue === 'press')))).toBe(true);
    // Holding the objective, he dug in: works the region did not have.
    expect(final.regionFortification[R('mid')] ?? 0).toBeGreaterThan(0);
    // And he wired that he arrived: a decision point for his principal.
    expect(results.flatMap((r) => r.decisionPoints).map((d) => d.point)).toContain('objective-reached');
  });

  it('driven back, an axis withdraws, pauses and tries again, until it has been driven back too often and fails', () => {
    const g = game({ gen: { boldness: 'high' } }, [block('a_1', { department: 'a_war', region: 'a2', strength: 6000, post: P('a_army') }), block('b_1', { department: 'b_war', region: 'mid', strength: 6000, post: P('b_army') })], { fortification: 800 });
    const results = play(g.world, approved(g.state, 'a_army', DIRECT), 40);
    const op = opOf(results.at(-1)!.state, 'a_army');
    expect(stages(op)).toEqual(expect.arrayContaining(['assault', 'withdraw', 'pause']));
    expect(op.opAxes[0]!.oaxLog.filter((e) => e.axevStage === 'withdraw').length).toBeGreaterThanOrEqual(1);
    if (op.opOutcome !== null) expect(op.opOutcome).toBe('failed');
  });

  it('a change of plan ends the operation as superseded, and one operation runs per goal and plan', () => {
    const g = game({}, [block('a_1', { department: 'a_war', region: 'a2', strength: 9000, post: P('a_army') })]);
    const first = play(g.world, approved(g.state, 'a_army', DIRECT), 2).at(-1)!.state;
    const changed = approved(first, 'a_army', plan('direct:a2-mid:2', 'direct', DIRECT.candAxes));
    const after = play(g.world, changed, 1).at(-1)!.state;
    const ops = Object.values(after.operationRecords).filter((o) => o.opPost === P('a_army'));
    expect(ops.map((o) => o.opOutcome)).toEqual(['superseded', null]);
  });
});

describe('support requests and encirclements: two commanders\' arrows meeting, which fail for human reasons (FOUNDATION section 5)', () => {
  const PINCER = plan(
    'pincer:mid',
    'pincer',
    [axis('main', 'a_army', ['a_1'], [leg('a2', 'mid', 'road:a2:mid')], 2000), axis('partner', 'a_flank', ['f_1'], [leg('flank', 'mid', 'road:flank:mid')], 2000)],
    [{ reqKind: 'cooperating_axis', reqPost: P('a_flank'), reqHolder: PER('a_partner'), reqMen: 0, reqFrom: R('flank'), reqObjective: R('mid'), reqArriveFrom: 0, reqArriveTo: 6000, reqCarrier: null, reqEdges: [] }],
  );
  const blocks = [block('a_1', { department: 'a_war', region: 'a2', strength: 6000, post: P('a_army') }), block('f_1', { department: 'a_war', region: 'flank', strength: 4000, post: P('a_flank') }), block('b_1', { department: 'b_war', region: 'mid', strength: 1500, post: P('b_army') })];

  it('a holder who will not move refuses the request by his own compliance; the partner axis never marches; the encirclement fails for that reason', () => {
    const g = game({ partner: { boldness: 'low', candour: 'high', values: ['caution'] } }, blocks);
    const results = play(g.world, approved(g.state, 'a_army', PINCER), 12);
    const final = results.at(-1)!.state;
    const op = opOf(final, 'a_army');
    const req = op.opRequests[0]!;
    expect(req.oreqAnswer).toBe('refused');
    expect(['object', 'refuse']).toContain(req.oreqRung);
    // His response is proxy's; the operation keeps only its key (0073).
    expect(final.orderResponses[req.oreqResponse!]!.respActual).toBe(req.oreqRung);
    expect(op.opAxes.find((a) => a.oaxName === 'partner')!.oaxLog.at(-1)).toMatchObject({ axevStage: 'end', axevReason: 'support_refused' });
    expect(final.forceLocations[B('f_1')]!.locRegion).toBe('flank');
    expect([op.opEncirclement, op.opEncirclementWhy]).toEqual(['failed_human', 'partner_refused']);
    // The man who asked hears the declared answer, never the true one.
    const answer = knowledgeOf(final, seatIdFor(PER('a_gen'))).knownReports.find((r) => r.knownBody.reportClaims.some((c) => c.claimKind === 'support-answer'))!;
    expect(answer.knownBody.reportClaims[0]!.claimToken).toBe(final.orderResponses[req.oreqResponse!]!.respDeclared);
  });

  it('a willing holder complies, his axis marches, and the arrows meet (positive control)', () => {
    const g = game({ partner: { boldness: 'high', values: ['glory'] } }, blocks);
    const final = play(g.world, approved(g.state, 'a_army', PINCER), 14).at(-1)!.state;
    const op = opOf(final, 'a_army');
    expect(op.opRequests[0]!.oreqAnswer).toBe('complied');
    expect(op.opAxes.find((a) => a.oaxName === 'partner')!.oaxArrived).not.toBeNull();
    expect(op.opEncirclement).toBe('met');
  });
});

describe('battle reports: the night of the battle, hour by hour, and the returns (section 9; 0074, 0076)', () => {
  const DIRECT = plan('direct:a2-mid', 'direct', [axis('main', 'a_army', ['a_1'], [leg('a2', 'mid', 'road:a2:mid')])]);
  // b's garrison is trapped: b2 is a's, so b in mid has nowhere to go, and surrenders.
  const TRAPPED = { ...CONTROL, b2: { a: 1000 }, mid: { a: 600, b: 400 } };
  const fight = (boldness: StatDirection = 'high') => {
    const g = game({ gen: { boldness } }, [block('a_1', { department: 'a_war', region: 'a2', strength: 9000, post: P('a_army') }), block('b_1', { department: 'b_war', region: 'mid', strength: 700, post: P('b_army') })], { control: TRAPPED as unknown as typeof CONTROL });
    const results = play(g.world, approved(g.state, 'a_army', DIRECT), 16);
    const battle = Object.values(results.at(-1)!.state.battleRecords)[0]!;
    // Everything each principal was told, day by day (knowledge prunes superseded dispatches after a few days).
    const told = (person: string) => {
      const seen = new Map<string, { id: string; knownBody: ReturnType<typeof knowledgeOf>['knownReports'][number]['knownBody'] }>();
      for (const r of results) for (const k of knowledgeOf(r.state, seatIdFor(PER(person))).knownReports) seen.set(k.id, k);
      return [...seen.values()].sort((x, y) => x.knownBody.reportDay - y.knownBody.reportDay || (x.knownBody.reportHour ?? 0) - (y.knownBody.reportHour ?? 0));
    };
    const truth = (id: string) => results.map((r) => r.state.reportTruth[id as MessageId]).find((t) => t !== undefined)!;
    return { results, battle, told, truth, day: battle.battleDays[0]! as BattleDay, final: results.at(-1)!.state };
  };

  it('each commander wires the day phase by phase, stamped with the phase\'s hour, and says nothing of his losses', () => {
    const { told, truth, day } = fight();
    const a = told('a_lead').filter((r) => r.knownBody.reportClaims.some((c) => c.claimKind === 'battle-phase'));
    expect(a.map((r) => [r.knownBody.reportDay, r.knownBody.reportHour, r.knownBody.reportClaims[0]!.claimToken])).toEqual([
      [day.bdayDay, 8, 'dawn'],
      [day.bdayDay, 12, 'morning'],
      [day.bdayDay, 17, 'afternoon'],
      [day.bdayDay, 21, 'evening'],
    ]);
    expect(a.every((r) => !r.knownBody.reportClaims.some((c) => c.claimKind === 'own-losses'))).toBe(true);
    // What he left out is in the truth beside it (hard rule 6; the view layer cannot import it, 0052).
    expect(truth(a[2]!.id).truthTerms.some((t) => t.termRule === 'afternoon:killed_wounded_unsaid')).toBe(true);
  });

  it('the first return runs low and counts the captured as missing; the full return, days later, sets the captured apart', () => {
    const { told, truth, day, results } = fight();
    const b = day.bdaySides.find((s) => s.bsideFaction === 'b')!;
    expect(b.bsideCutOff).toBe('surrender');
    expect(b.bsideCaptured).toBeGreaterThan(0);
    const returns = told('b_lead').filter((r) => r.knownBody.reportType === 'casualty-return');
    const first = returns.find((r) => r.knownBody.reportClaims.some((c) => c.claimToken === 'first'))!;
    const full = returns.find((r) => r.knownBody.reportClaims.some((c) => c.claimToken === 'full'))!;
    const value = (r: typeof first, kind: string) => r.knownBody.reportClaims.find((c) => c.claimKind === kind)?.claimValue;
    // The first: killed and wounded below the truth by the pack's share; every man captured counted among the missing; no captured figure.
    expect(value(first, 'own-losses')).toBe(Math.trunc((b.bsideKw * 800) / 1000));
    expect(value(first, 'missing')).toBe(b.bsideMissing + b.bsideCaptured);
    expect(value(first, 'captured')).toBeUndefined();
    // Shaded beside the truth: the terms say by how much, and why.
    expect(truth(first.id).truthTerms.filter((t) => t.termKind === 'return_understated').map((t) => [t.termRule, t.termValue])).toEqual([
      ['first_return', b.bsideKw - Math.trunc((b.bsideKw * 800) / 1000)],
      ['captured_as_missing', b.bsideCaptured],
    ]);
    // The full return: killed and wounded as they were, the missing and the captured apart. Never "killed" for the taken.
    expect([value(full, 'own-losses'), value(full, 'missing'), value(full, 'captured')]).toEqual([b.bsideKw, b.bsideMissing, b.bsideCaptured]);
    expect(full.knownBody.reportDay).toBe(day.bdayDay + 7);
    // The first return is a decision point for each principal.
    expect(results.flatMap((r) => r.decisionPoints).filter((d) => d.point === 'battle-report').length).toBeGreaterThanOrEqual(1);
  });

  it('a commander claims the enemy\'s losses as he sees them: a bold one as they were, a timid one inflated by his perception', () => {
    const timid = fight('low');
    const tr = timid.told('a_lead').find((r) => r.knownBody.reportType === 'casualty-return' && r.knownBody.reportClaims.some((c) => c.claimToken === 'first'));
    expect(tr).toBeDefined();
    const kw = timid.day.bdaySides.find((s) => s.bsideFaction === 'b')!.bsideKw;
    expect(tr!.knownBody.reportClaims.find((c) => c.claimKind === 'casualties')!.claimValue).toBeGreaterThan(kw);
    expect(timid.truth(tr!.id).truthTerms.find((t) => t.termKind === 'claim_inflated')!.termValue).toBeGreaterThan(0);
    const { told, truth, day } = fight();
    const a = told('a_lead').find((r) => r.knownBody.reportType === 'casualty-return' && r.knownBody.reportClaims.some((c) => c.claimToken === 'first'))!;
    const enemy = day.bdaySides.find((s) => s.bsideFaction === 'b')!;
    const claimed = a.knownBody.reportClaims.find((c) => c.claimKind === 'casualties')!.claimValue;
    expect(claimed).toBe(enemy.bsideKw);
    expect(truth(a.id).truthTerms.find((t) => t.termKind === 'claim_inflated')!.termValue).toBe(0);
  });
});

describe('works, pursuit, oversight, assumed stores and pruning (lane 1.4\'s filed items)', () => {
  it('works dug in are lost when the defender is driven from them; a commander pursuing with cavalry takes stragglers', async () => {
    const { combatDay } = await import('../src/combat/battle.ts');
    const { buildControlIndex } = await import('../src/control-index/control-index.ts');
    const { passageOf } = await import('../src/tick/passage.ts');
    const g = game({ gen: { boldness: 'high' } }, [block('a_1', { department: 'a_war', region: 'mid', strength: 12000, post: P('a_army') }), block('b_1', { department: 'b_war', region: 'mid', strength: 1500, post: P('b_army') })], { fortification: 300 });
    const s = { ...g.state, forceLocations: { ...g.state.forceLocations, [B('a_1')]: { ...g.state.forceLocations[B('a_1')]!, locSinceDay: 1 } } };
    const ground = { map: g.world.map, index: buildControlIndex(g.world.map, s.regionControl), network: passageOf(g.world.map, s), month: 6 };
    const r = combatDay(g.world, ground, s, 2);
    const b = r.fought[0]!.day.bdaySides.find((x) => x.bsideFaction === 'b')!;
    expect(r.fought[0]!.day.bdayType).toBe('attack_hasty');
    expect(b.bsideRetreatTo).not.toBeNull();
    expect(r.fortification).toEqual([{ region: R('mid'), deltaPermille: -150, cause: 'combat' }]);
  });

  it('pursuit takes a share of the pursued side\'s stragglers, more with cavalry, a typed capture in the record', async () => {
    const { resolveDay } = await import('../src/combat/resolve.ts');
    const { createStream } = await import('../src/rng.ts');
    const { FIXTURE_COMBAT_RULES } = await import('./support/map-fixture.ts');
    const side = (f: string, men: number, stragglers: number, pursued: number) => ({
      faction: F(f), post: null, commander: { person: null, boldness: 500, competence: 500, nerve: 500, perceptionPermille: 1000, demandPermille: 1000 },
      commit: (f === 'a' ? 'main' : 'defend') as 'main' | 'defend', commitTerms: [], blocks: [{ id: B(`${f}_1`), men, stragglers, morale: 900, experience: 500, equipment: 600 }],
      retreatTo: R(f === 'a' ? 'a2' : 'b_cap'), breakingOut: false, surprised: false, pursuedPermille: pursued,
    });
    const day = (pursued: number) => resolveDay(FIXTURE_COMBAT_RULES, { day: 3, dayNumber: 1, type: 'rearguard', attacker: F('a'), terrain: 'plain', frontageMen: 60000, terrainLossPermille: 0, sides: [side('a', 8000, 0, 0), side('b', 3000, 1000, pursued)] }, createStream(1, 'combat/x/3')).day.bdaySides[1]!;
    const none = day(0);
    const pressed = day(450);
    expect(none.bsideCapturedParts.find((t) => t.btermKind === 'in_pursuit')).toBeUndefined();
    expect(pressed.bsideCapturedParts.find((t) => t.btermKind === 'in_pursuit')!.btermValue).toBe(450);
    expect(pressed.bsideLosses[0]!.blossStragglersCaptured).toBe(450);
  });

  it('oversight falls with courier days from the principal and rises on the wire (no longer one constant)', async () => {
    const { oversightOf } = await import('../src/tick/context.ts');
    const { ctxFor } = await import('./support/tick-context.ts');
    const g = game({}, [block('a_1', { department: 'a_war', region: 'a2', strength: 1000, post: P('a_army') }), block('f_1', { department: 'a_war', region: 'mid', strength: 1000, post: P('a_flank') })], { control: { ...CONTROL, mid: { a: 1000 } } as unknown as typeof CONTROL });
    const ctx = ctxFor(g.world, g.state, 1);
    const near = oversightOf(ctx, g.state, PER('a_gen'), PER('a_lead'));
    const far = oversightOf(ctx, g.state, PER('a_partner'), PER('a_lead'));
    const rules = g.world.rules.people.context;
    expect(near).toBeGreaterThanOrEqual(rules.oversightMin);
    expect(far).toBeLessThanOrEqual(near);
    expect(oversightOf(ctx, g.state, PER('a_lead'), PER('a_lead'))).toBe(rules.oversight);
  });

  it('a block whose stores no source gives takes the pack\'s norm, flagged assumed; a block no norm covers stays unknown', () => {
    const base = mapOf({});
    const normed = indexWorld({ ...base.world, rules: { ...base.world.rules, stores: { ...base.world.rules.stores, norms: [{ post: null, postKind: null, arm: 'cavalry', faction: null, days: 4, cite: 'FIXTURE p. 1' }] } } });
    const start = forcesStart(CONTROL, POSTS, [block('horse', { department: 'a_war', region: 'a2', arm: 'cavalry', storesDays: null, post: P('a_army') }), block('foot', { department: 'a_war', region: 'a2', storesDays: null, post: P('a_army') }), block('sourced', { department: 'a_war', region: 'a2', arm: 'cavalry', storesDays: 9, post: P('a_army') })], {
      factions: [{ faction: F('a'), principal: PER('a_lead'), capital: R('a_cap'), playable: true }, { faction: F('b'), principal: PER('b_lead'), capital: R('b_cap'), playable: true }],
    });
    const s = createState(worldOf(normed, start), { seed: 1 });
    expect(s.forceBlockStates[B('horse')]).toMatchObject({ fbStoresMilli: 4000, fbStoresAssumed: true });
    expect(s.forceBlockStates[B('foot')]).toMatchObject({ fbStoresMilli: null, fbStoresAssumed: false });
    expect(s.forceBlockStates[B('sourced')]).toMatchObject({ fbStoresMilli: 9000, fbStoresAssumed: false });
  });

  it('prunes ended operations, closed battles and old responses after the pack\'s days, keeping what a plan still names and each post\'s latest operation', async () => {
    const { pruneOperations } = await import('../src/operations/operations.ts');
    const { pruneBattles } = await import('../src/combat/records.ts');
    const { pruneResponses } = await import('../src/proxy/responses.ts');
    const g = game({ gen: { boldness: 'high' } }, [block('a_1', { department: 'a_war', region: 'a2', strength: 9000, post: P('a_army') }), block('b_1', { department: 'b_war', region: 'mid', strength: 2000, post: P('b_army') })]);
    const s = play(g.world, approved(g.state, 'a_army', plan('direct:a2-mid', 'direct', [axis('main', 'a_army', ['a_1'], [leg('a2', 'mid', 'road:a2:mid')])])), 12).at(-1)!.state;
    expect(Object.keys(s.battleRecords).length).toBeGreaterThan(0);
    expect(pruneBattles(s, 400, 120).state.battleRecords).toEqual({});
    expect(pruneBattles(s, 13, 120).pruned).toBe(0);
    // The post's only operation is its latest: kept however old.
    expect(Object.keys(pruneOperations(s, 400, 60).operationRecords)).toEqual(Object.keys(s.operationRecords));
    const withOld = { ...s, orderResponses: { ...s.orderResponses, 'old|a_partner': { ...Object.values(s.orderResponses)[0]!, respDay: 1, respOrder: 'old' as MessageId, respPerson: PER('a_partner') } } };
    expect(Object.keys(pruneResponses(withOld, 400, 60).state.orderResponses)).not.toContain('old|a_partner');
  });
});

describe('the standing-goal path is gone (lane 1.4 retires lane 1.2\'s stand-in)', () => {
  const root = fileURLToPath(new URL('../src/', import.meta.url));
  const files = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? files(join(dir, n)) : n.endsWith('.ts') ? [join(dir, n)] : []));

  it('no State field, adapter or movement path for standing goals remains in the kernel', () => {
    expect(existsSync(join(root, 'plans', 'execute.ts'))).toBe(false);
    expect(existsSync(join(root, 'tick', 'standing.ts'))).toBe(false);
    const hits = files(root).filter((f) => /standingGoals|StandingGoal\b|GoalSpec\b|applyStanding/.test(readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
    const g = game({}, []);
    expect(Object.keys(g.state)).not.toContain('standingGoals');
    expect(Object.keys(g.state)).toContain('operationRecords');
  });
});

