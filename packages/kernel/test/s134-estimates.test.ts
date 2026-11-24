import { describe, expect, it } from 'vitest';
import { observeStrength, biasStrength, completeUpper, strengthClaim } from '../src/knowledge/strength.ts';
import { latestEnemyClaims } from '../src/knowledge/beliefs.ts';
import { deliverReport, knowledgeOf } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { viewFor } from '../src/view/view.ts';
import { viewGround, plannerInputFor } from '../src/planner/input.ts';
import { makeCtx } from '../src/planner/context.ts';
import { draft, liveTerms } from '../src/planner/draft.ts';
import { discretionAssessment } from '../src/planner/discretion.ts';
import { deriveMap } from '../src/control-index/derived.ts';
import { passageOf } from '../src/tick/passage.ts';
import { goalOf } from '../src/tick/orders.ts';
import { encodeSave, decodeSave } from '../src/serialize/save.ts';
import { fresh, report } from './support/s25-fixture.ts';
import { P, POST, R } from './support/seats-fixture.ts';
import { goalTerms } from './support/test-seats.ts';
import { beliefClaim } from '../src/knowledge/strength.ts';
import { commonTerms, makeCandidate } from '../src/planner/score.ts';
import { buildAxis, holdingAxis } from '../src/planner/axes.ts';
import { directRoute, own } from '../src/planner/methods.ts';
import { enclosePlan, inputFromPaper } from '../src/planner/paper.ts';

const frame = (over: Partial<Parameters<typeof observeStrength>[0]> = {}) => ({
  observer: P('a_gen'), region: R('a_front'), day: 1, scope: 'region', presence: true,
  coverage: 'complete' as const, counts: [{ countKind: 'formed_battalions' as const, count: 2, compatible: true }],
  conditions: 'Fictional exposed formation, unobstructed observation', ...over,
});
const estimate = (over: Parameters<typeof frame>[0] = {}) => observeStrength(frame(over));
function input() {
  const { world, state, seat } = fresh(); const network = passageOf(world.map, state);
  const ground = deriveMap(world.map, { control: state.regionControl, month: 6, network });
  return plannerInputFor(world, state, ground, network, 6, viewFor(world, state, seat), POST('a_army'), goalOf(goalTerms('take', 'b_front')), 1);
}

describe('S134 /0130: eight fictional acceptance groups', () => {
  it('G1: estimates use the same visible formation independently of hidden quantities', () => {
    const observed = frame();
    const worlds = [{ hiddenMen: 40, observed }, { hiddenMen: 9000, observed }];
    expect(worlds.map(w => observeStrength(w.observed))).toEqual([estimate(), estimate()]);
    expect(estimate({ counts: [{ countKind: 'formed_battalions', count: 3, compatible: true }] }).strengthLower).toBe(1800);
    expect(estimate({ counts: [] }).strengthUnknown).toBe(true);
  });

  it('G2: discloses the sole interval conversion and keeps unsupported objects as objects', () => {
    const b = estimate();
    expect([b.strengthLower, b.strengthUpper]).toEqual([1200, 1400]);
    expect(b.strengthComponents[0]).toMatchObject({ componentKind: 'estimate', componentBasis: '[I] Mahan p.28, para.164: 600-700 per compatible formed battalion' });
    for (const kind of ['companies', 'regiments', 'guns', 'camps'] as const) {
      const x = estimate({ counts: [{ countKind: kind, count: 9 }] });
      expect(completeUpper(x)).toBeNull(); expect(x.strengthCounts[0]!.count).toBe(9);
    }
    expect(completeUpper(estimate({ presence: false, counts: [] }))).toBeNull();
    expect(completeUpper(estimate({ presence: false, counts: [], cleared: true }))).toBe(0);
  });

  it('G3: source and recipient bias apply once, outward rounding and quotation retain provenance', () => {
    const source = biasStrength(estimate(), 1101, P('a_chief'));
    expect([source.strengthLower, source.strengthUpper]).toEqual([1321, 1542]);
    const reader = biasStrength(source, 1201, P('a_gen'));
    expect(biasStrength(reader, 1201, P('a_gen'))).toEqual(reader);
    expect(reader.strengthReaders).toEqual([P('a_chief'), P('a_gen')]);
    expect(reader.strengthComponents).toEqual(estimate().strengthComponents);
    const { world, state, seat } = fresh();
    const held = deliverReport(state, seat, report('s134.quote', { reportClaims: [strengthClaim(R('a_front'), source, 700)] }), NO_TRUTH);
    const saved = decodeSave(encodeSave({ worldHash: '0'.repeat(64), state: held })).state as unknown as typeof held;
    expect(viewFor(world, saved, seat).enemyBeliefs).toEqual(viewFor(world, held, seat).enemyBeliefs);
  });

  it('G4: newer unknown supersedes numeric completeness and partial components survive projection', () => {
    const { world, state, seat } = fresh();
    const old = report('s134.old', { reportDay: 1, reportClaims: [{ claimKind: 'enemy-strength', claimRegion: R('a_front'), claimValue: 700, claimToken: null, claimConfidence: 700 }] });
    const newer = report('s134.new', { reportDay: 2, reportClaims: [strengthClaim(R('a_front'), estimate({ day: 2, coverage: 'partial' }), 700)] }, 2);
    const held = deliverReport(deliverReport(state, seat, old, NO_TRUTH), seat, newer, NO_TRUTH);
    const k = knowledgeOf(held, seat); expect(k.knownReports).toHaveLength(2);
    const b = latestEnemyClaims(k).get(R('a_front'))!;
    expect(b.value).toBeNull(); expect(b.strength!.strengthComponents).toHaveLength(1);
    const v = viewFor(world, held, seat); expect(v.enemyBeliefs[R('a_front')]!.value).toBeNull();
    expect(viewGround(v).beliefs.get(R('a_front'))).toBeNull();
    const ctx = makeCtx({ ...input(), beliefs: new Map([[R('a_front'), null]]) });
    expect(ctx.threat.get(R('b_front'))).toBeNull();
    expect(latestEnemyClaims({ knownReports: [newer, newer] }).get(R('a_front'))).toEqual(latestEnemyClaims({ knownReports: [newer] }).get(R('a_front')));
  });

  it('G4: independent counted components combine, stale accounts and overlapping alternatives do not certify a total', () => {
    const one=estimate({scope:'left',counts:[{countKind:'men',count:100}],coverage:'partial'});
    const two=estimate({scope:'right',counts:[{countKind:'men',count:200}],coverage:'partial'});
    const a=report('m.left',{reportClaims:[strengthClaim(R('a_front'),one,700)]});
    const b=report('m.right',{reportClaims:[strengthClaim(R('a_front'),two,700)]});
    const held={knownReports:[a,b,a]};const mixed=latestEnemyClaims(held).get(R('a_front'))!;
    expect(mixed.value).toBeNull();expect(mixed.strength!.strengthLower).toBe(300);
    expect(mixed.strength!.strengthComponents).toHaveLength(2);
    const partiallyRead=latestEnemyClaims({knownReports:[
      report('m.left.read',{reportClaims:[strengthClaim(R('a_front'),biasStrength(one,1200,P('a_gen')),700)]}),b,
    ]}).get(R('a_front'))!.strength!;
    const readBoth=biasStrength(partiallyRead,1200,P('a_gen'));
    expect(readBoth.strengthLower).toBe(360);
    expect(biasStrength(readBoth,1200,P('a_gen'))).toEqual(readBoth);
    const numeric=report('m.full',{reportClaims:[strengthClaim(R('a_front'),estimate(),700)]});
    expect(latestEnemyClaims({knownReports:[numeric]},{day:20,maxAge:()=>3}).get(R('a_front'))!.value).toBeNull();
    const quote=beliefClaim(R('a_front'),{value:null,strength:one,asOfDay:1},P('a_gen'),700);
    expect(quote.claimStrength!.strengthDay).toBe(1);
    expect(quote.claimKind).toBe('enemy-estimate-unknown');
  });

  it('G5: ordinary attack and hold survive on common terms without a guessed ratio or reinforcement demand', () => {
    const base = input(); const beliefs = new Map([...base.ground.map.regions.keys()].map(r => [r, null]));
    const set = draft({ ...base, beliefs });
    expect(set.draftCandidates.some(c => c.candMethod === 'holding')).toBe(true);
    expect(set.draftCandidates.some(c => c.candMethod !== 'holding')).toBe(true);
    for (const c of set.draftCandidates) {
      expect(c.candRatio).toBeNull(); expect(c.candPerceived).toBeNull();
      expect(c.candTerms.some(t => t.contribTerm === 'force_ratio')).toBe(false);
      expect(c.candRequests.some(r => r.reqKind === 'reinforcement')).toBe(false);
      expect(c.candUnavailableTerms?.some(t => t.term === 'force_ratio' && t.reason === 'unknown_strength')).toBe(true);
      expect(c.candTerms.some(t => t.contribTerm === 'time')).toBe(true);
      expect(c.candTerms.some(t => t.contribTerm === 'goal_fit')).toBe(true);
      expect(c.candScore).toBe(c.candTerms.reduce((n,t) => n+t.contribAmount,0));
    }
    const restored=inputFromPaper(fresh().world,enclosePlan({...base,beliefs},set,set.draftCandidates[0]!));
    expect(restored.beliefs).toEqual(beliefs);
    expect(draft(restored).draftCandidates).toEqual(set.draftCandidates);
  });

  it('G5: time and goal fit each have an unknown-strength fictional driver with the existing weights', () => {
    const base=input();const beliefs=new Map([...base.ground.map.regions.keys()].map(r=>[r,null]));
    const live=new Set<string>();
    // Bounded fictional journeys, independent of any historical winner or name.
    for(const arrival of [1000,5000,10000,20000])for(const outside of [0,1000,5000,10000])for(const deadline of [1,5,10,20]) {
      const ctx=makeCtx({...base,beliefs,goal:{...base.goal,goalDeadlineDays:deadline}});
      const route=directRoute(ctx);if(route===null)continue;
      const axis={...buildAxis(ctx,{name:'main',post:base.post,mode:'land',route,blocks:own(ctx),depotSteps:false}),axisArrival:arrival,axisOutOfSupply:outside};
      const cs=commonTerms([makeCandidate(ctx,'direct','fixture',[axis],[]),makeCandidate(ctx,'holding','fixture',[holdingAxis(ctx,base.post,own(ctx),'hold')],[])]).sort((a,b)=>b.candScore-a.candScore||(a.id<b.id?-1:1));
      const set={draftCommander:base.profile.person,draftPost:base.post,draftFaction:base.faction,draftDay:1,draftCandidates:cs,draftRejected:[],draftSearches:0,draftGenerated:2,draftDeduplicated:0};
      for(const t of liveTerms(set))live.add(t);
    }
    expect(live.has('time')).toBe(true);expect(live.has('goal_fit')).toBe(true);
  });

  it('G6: complete finite intervals use the upper endpoint, while partial/unknown gates remain closed', () => {
    expect(completeUpper(estimate())).toBe(1400);
    expect(completeUpper(estimate({ coverage: 'partial' }))).toBeNull();
    expect(completeUpper(estimate({ counts: [] }))).toBeNull();
    const base = input();
    const purpose = { detKind: 'attack_or_demonstrate' as const, detDuty: 'detain' as const,
      detTargetKind: 'opposing_command' as const, detTargetPost: POST('b_army'), detDetentionArea: [R('b_front')], detActionArea: [R('a_front'), R('b_front')], detMeans: ['attack','demonstrate'] as const };
    const set = draft({ ...base, goal: { ...base.goal, goalPosture: undefined, goalObjective: undefined, goalDiscretion: undefined, goalPurpose: purpose }, beliefs: new Map([[R('b_front'), null]]),
      detentionPicture: { targetRegions: new Set([R('b_front')]), freshEstimates: new Set([R('b_front')]), unavailable: new Set() } });
    expect(set.draftCandidates.filter(c => c.candDetention?.means === 'attack')).toEqual([]);
  });

  it('G7: unknown outmatched is undetermined and estimation never writes force truth', () => {
    const base = input(); const { state } = fresh(); const before = JSON.stringify(state.forceBlockStates);
    expect(discretionAssessment({ ...base, beliefs: new Map([[R('a_front'), null]]) }, R('a_front'), { condition: 'outmatched', fallback: base.goal }).status).toBe('undetermined');
    estimate(); biasStrength(estimate(), 1400, P('a_reader'));
    expect(JSON.stringify(state.forceBlockStates)).toBe(before);
  });

  it('G8: renamed observers and shifted dates change attribution, not the estimate or unknown comparison', () => {
    const a = estimate(), b = estimate({ observer: P('renamed_observer'), day: 81 });
    expect([a.strengthLower,a.strengthUpper,a.strengthUnknown]).toEqual([b.strengthLower,b.strengthUpper,b.strengthUnknown]);
    expect(a.strengthCounts).toEqual(b.strengthCounts);
    expect(b.strengthObserver).toBe(P('renamed_observer'));
  });
});
