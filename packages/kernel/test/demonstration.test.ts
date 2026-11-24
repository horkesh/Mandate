import { describe, expect, it } from 'vitest';
import type { GoalTerms } from '../src/log/commands.ts';
import type { LogEntry } from '../src/log/log.ts';
import { goalKindOf, goalProblems, purposeTerms, termsOfGoal } from '../src/plans/goal.ts';
import { goalOf } from '../src/tick/orders.ts';
import { draft } from '../src/planner/draft.ts';
import { plannerInputFor } from '../src/planner/input.ts';
import { deriveMap } from '../src/control-index/derived.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { passageOf } from '../src/tick/passage.ts';
import { createState } from '../src/tick/setup.ts';
import { tick as kernelTick, TICK_MECHANICS } from '../src/tick/tick.ts';
import { deliverDue } from '../src/tick/deliver.ts';
import { viewFor } from '../src/view/view.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { encodeSave, decodeSave } from '../src/serialize/save.ts';
import { worldHash } from '../src/world/index.ts';
import { detentionProblems, validDemonstrationPolicy } from '../src/plans/detention.ts';
import { goalTermsProblems } from '../src/log/log.ts';
import { localOptions } from '../src/seats/local-actions.ts';
import { enactMandate } from '../src/command/authority.ts';
import { sendMessages, type TransitMessage } from '../src/messages/transit.ts';
import { deliverReport, knowledgeOf } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { observeStrength, strengthClaim } from '../src/knowledge/strength.ts';
import { toId } from '../src/ids.ts';
import type { MandateGrant } from '../src/world/mandates.ts';
import type { PrincipalDoctrine } from '../src/world/world.ts';
import type { State } from '../src/root-state.ts';
import { indexWorld } from '../src/world/index.ts';
import { B, block, forcesStart, forcesWorld, P, PER, person, post } from './support/forces-fixture.ts';
import { edge, F, R, region } from './support/map-fixture.ts';
import { ctxFor, worldOf } from './support/tick-context.ts';

const purpose = {
  kind: 'attack_or_demonstrate', duty: 'detain', target: { kind: 'opposing_command', post: P('b_army') },
  detentionArea: [R('field')], actionArea: [R('camp'), R('field')], means: ['attack', 'demonstrate'],
} as const;
const terms = {
  purpose, risk: 1000, deadlineDays: 14, rail: false, river: false, sea: false, neutral: false,
  committed: [B('a_force')], awaitWord: false, approveAsDrafted: true,
} satisfies GoalTerms;
const policy = {
  detentionRegions: 2, actionRegions: 4, deploymentDays: [1, 2], reconnaissanceDays: 1,
  demonstrationCandidates: 12, totalCandidates: 16, reserveDays: 1,
} as const;

const grant: MandateGrant = {
  mandateKey: 'root', mandateRevision: 1, mandateIssuer: PER('a_lead'), mandateIssuerPost: null,
  mandateHolder: PER('a_gen2'), mandatePost: P('a_office'), mandateParent: null,
  mandateActions: ['attack_or_demonstrate'], mandateRecipients: [P('a_army')],
  mandateRegions: [R('camp'), R('field')], mandateModes: ['land'], mandateCeiling: { ceilingPost: P('a_office'), ceilingMen: null },
  mandateGuard: null, mandateExpires: null, mandateReports: ['orders'], mandateOnward: false, mandateRevoke: false,
};
const letter = { namespace: 'a_letters', key: 'detention', revision: 1 };
const doctrine: PrincipalDoctrine = {
  faction: F('a'), letterNamespace: letter.namespace, crossNeutral: false, concentrateAt: null,
  concentrateSource: null, calls: [], inquireEveryDays: 7, appointKinds: { land: [], naval: [] },
  offensives: [{ post: P('a_army'), issuer: PER('a_gen2'), letter, purpose, fromDate: '1900-06-02', source: 'Fictional letter' }],
};

// These positive execution controls explicitly declare the searched empty
// ground clear. The production observer's "nothing seen" is now unknown.
// The opposing force's number and attribution still come through reconnaissance.
function tick(...args: Parameters<typeof kernelTick>): ReturnType<typeof kernelTick> {
  const result=kernelTick(...args);
  const messagesInTransit=result.state.messagesInTransit.map(m=>{
    const b=m.msgReport;if(b?.reportType!=='enemy-estimate')return m;
    const reportClaims=b.reportClaims.map(c=>{
      if(c.claimKind!=='enemy-estimate-unknown' || c.claimRegion===null || c.claimStrength?.strengthPresence!==false)return c;
      return strengthClaim(c.claimRegion,observeStrength({observer:b.reportAuthor,region:c.claimRegion,day:b.reportDay,scope:'region',presence:false,
        coverage:'complete',counts:[],cleared:true,conditions:'Fictional positive-control observer explicitly cleared the searched region'}),c.claimConfidence);
    });
    return {...m,msgReport:{...b,reportClaims}};
  });
  return {...result,state:{...result.state,messagesInTransit}};
}

function fixture({ optIn = true, enemyStrength = 200, ownStrength = 1400, storesDays = 20, dayBA = 1, startDate = '1900-06-01',
  authored = false, commander = 'a_gen', resistant = false }: {
  optIn?: boolean; enemyStrength?: number; ownStrength?: number | null; storesDays?: number; dayBA?: number;
  startDate?: string; authored?: boolean; commander?: string; resistant?: boolean;
} = {}) {
  const base = forcesWorld({
    regions: ['camp', 'field', 'rear', 'edge_position', 'isolated'].map(r => region(r)),
    edges: [edge('camp', 'field', { daysBA: dayBA }), edge('field', 'rear'),
      edge('camp', 'edge_position'), edge('field', 'edge_position')],
    people: [
      person('a_lead', 'a'), person(commander, 'a', resistant ? { boldness: 'low', regard: 'low', candour: 'high', values: ['caution'] } : {}),
      person('a_gen2', 'a'), person('b_lead', 'b'), person('b_gen', 'b'),
      person('b_clerk', 'b', { candour: 'low', values: ['reputation'] }),
    ],
  });
  const world = worldOf(indexWorld({ ...base, vocabularies: { ...base.vocabularies,
    postKinds: [...base.vocabularies.postKinds, { id: 'filter', name: 'kind.filter', creatable: 'start_only', temporary: false, role: 'filter' }],
  }, rules: { ...base.rules,
    people: { ...base.rules.people, filter: { ...base.rules.people.filter,
      trimFor: [{ value: 'reputation', claimKinds: ['enemy-activity'] }] } },
    plans: { ...base.rules.plans, ...(optIn ? { demonstration: policy } : {}) },
    ...(authored ? { ruleSeats: { ...base.rules.ruleSeats, principals: [doctrine] },
      mandates: [{ id: 'root', fromDate: '1900-06-01', source: 'Fictional assignment', grant },
        { id: 'revocation', fromDate: '1900-06-02', source: 'Fictional revocation',
          grant: { ...grant, mandateRevision: 2, mandateRevoke: true } }] } : {}),
  } }), forcesStart({ camp: { a: 1000 }, field: { b: 1000 }, rear: { b: 1000 }, edge_position: { a: 1000 } }, [
    ...(authored ? [post('a_office', { kind: 'office', department: 'a_war', holder: PER('a_gen2'), region: R('edge_position') })] : []),
    post('a_army', { department: 'a_war', holder: PER(commander), region: R('camp'), parent: authored ? P('a_office') : null }),
    post('b_army', { department: 'b_war', holder: PER('b_gen'), region: R('field') }),
    post('b_filter', { kind: 'filter', department: 'b_war', holder: PER('b_clerk'), region: R('rear') }),
  ], [
    block('a_force', { department: 'a_war', post: P('a_army'), region: 'camp', strength: ownStrength, storesDays }),
    block('b_force', { department: 'b_war', post: P('b_army'), region: 'field', strength: enemyStrength }),
  ], { factions: [
    { faction: F('a'), principal: PER('a_lead'), capital: R('camp'), playable: true },
    { faction: F('b'), principal: PER('b_lead'), capital: R('rear'), playable: true },
  ], startDate }));
  let state=createState(world,{seed:17,people:'as-history'});
  // The positive fixture also supplies affirmative clearance of the remote
  // empty regions needed by the neighbor/recovery gates. No enemy identity is supplied.
  for(const p of world.map.world.people) {
    if(p.faction!=='a' && p.faction!=='b')continue;
    const enemy=p.faction==='a'?'field':'camp';
    state=deliverReport(state,seatIdFor(p.id),{id:toId('message',`fixture.remote.clear.${p.id}`),knownReceivedDay:0,knownRoute:'courier',knownVia:[],
      knownBody:{reportType:'enemy-estimate',reportSubtype:null,reportAuthor:p.id,reportAuthorPost:null,reportSubjectKind:'enemy',reportSubjectId:'fixture_remote',reportDay:0,reportHour:null,
        reportClaims:[...world.map.regions.keys()].filter(r=>r!==enemy).map(r=>({claimKind:'enemy-strength' as const,claimRegion:r,claimValue:0,claimToken:null,claimConfidence:1000})),reportAdvice:null,reportAnswers:null}},NO_TRUTH);
  }
  return {world,state};
}

function plannerInput(config?: Parameters<typeof fixture>[0], saw = true, goal: GoalTerms = terms) {
  const { world, state } = fixture(config);
  const morning = saw ? tick(world, tick(world, state, []).state, []).state : state;
  const network = passageOf(world.map, morning);
  const derived = deriveMap(world.map, { control: morning.regionControl, month: 6, network });
  const view = viewFor(world, morning, seatIdFor(PER(config?.commander ?? 'a_gen')));
  return plannerInputFor(world, morning, derived, network, 6, view, P('a_army'), goalOf(goal), morning.stateDay + 1);
}

const choices = (...args: Parameters<typeof plannerInput>) => draft(plannerInput(...args));

/** Stop after a real first full interval so each transport/control pair can reuse identical truth. */
function firstActivity(task: 'deployment' | 'reconnaissance_in_force') {
  const { world, state } = fixture();
  const goal: GoalTerms = task === 'deployment' ? { ...terms, purpose: { ...purpose, actionArea: [R('camp'), R('edge_position')] } } : terms;
  const variant = task === 'deployment' ? 'deployment.2.edge_position' : 'reconnaissance_in_force.1.camp';
  let current = tick(world, tick(world, state, []).state, []).state;
  const issued = tick(world, current, [{ day: current.stateDay + 1, seat: seatIdFor(PER('a_lead')),
    command: { cmd: 'order', to: P('a_army'), goal, route: 'courier', bypass: false } }]);
  expect(issued.rejections).toEqual([]);
  current = issued.state;
  for (let i = 0; i < 13; i++) {
    const day = current.stateDay + 1;
    const record = current.planRecords[P('a_army')];
    const option = record?.planDraft?.draftCandidates.find(c => c.candVariant === variant);
    const result = tick(world, current, option !== undefined && record?.planStatus === 'choosing' ? [{
      day, seat: seatIdFor(PER('a_gen')), command: { cmd: 'choose', request: `plan:a_army:${day}`, option: option.id },
    }] : []);
    expect(result.rejections).toEqual([]);
    current = result.state;
    const active = Object.values(current.operationRecords).find(o => o.opDemonstration?.demActions.length === 1);
    if (active !== undefined) return { world, state: current, operation: active };
  }
  throw new Error('fixture produced no first demonstration interval');
}

describe('attack or demonstrate', () => {
  it('round-trips its purpose and advance kind without a regional goal', () => {
    const goal = goalOf(terms);
    expect(purposeTerms(goal.goalPurpose!)).toEqual(purpose);
    expect(goalProblems(goal)).toEqual([]);
    expect(termsOfGoal(goal)).toEqual(terms);
    expect(goalKindOf(goal)).toBe('advance');
    expect(goalProblems({ ...goal, goalPosture: 'hold', goalObjective: null } as unknown as typeof goal)).not.toEqual([]);
  });

  it('weighs both means after ordinary attributed reconnaissance', () => {
    const set = choices();
    expect(new Set(set.draftCandidates.map(c => c.candDetention?.means))).toEqual(new Set(['attack', 'demonstrate']));
    expect(choices(undefined, false).draftCandidates).toEqual([]);
    expect(choices({ optIn: false }).draftCandidates).toEqual([]);
  });

  it('can demonstrate without attack superiority and closes on unknown men or stores', () => {
    const set = choices({ enemyStrength: 20_000 });
    expect(new Set(set.draftCandidates.map(c => c.candDetention?.means))).toEqual(new Set(['demonstrate']));
    expect(choices({ ownStrength: null }).draftCandidates).toEqual([]);
    expect(choices({ storesDays: 0 }).draftCandidates).toEqual([]);
  });

  it('validates bounded connected areas and exact command grammar', () => {
    const { world } = fixture();
    expect(goalTermsProblems(terms)).toEqual([]);
    expect(goalTermsProblems({ ...terms, posture: 'hold' })).not.toEqual([]);
    expect(goalTermsProblems({ ...terms, purpose: { ...purpose, detentionArea: [R('field'), R('field')] } })).not.toEqual([]);
    expect(detentionProblems(world.map, { ...purpose, detentionArea: [R('camp'), R('field')] })).toEqual([]);
    expect(detentionProblems(world.map, { ...purpose, detentionArea: [R('camp'), R('field'), R('rear')] })).not.toEqual([]);
    expect(detentionProblems(world.map, { ...purpose, detentionArea: [R('camp'), R('rear')] })).not.toEqual([]);
    expect(detentionProblems(world.map, { ...purpose, actionArea: [R('camp'), R('field'), R('rear'), R('edge_position')] })).toEqual([]);
    expect(detentionProblems(world.map, { ...purpose, actionArea: [R('camp'), R('field'), R('rear'), R('edge_position'), R('isolated')] })).not.toEqual([]);
    expect(detentionProblems(world.map, { ...purpose, actionArea: [R('camp'), R('isolated')] })).not.toEqual([]);
  });

  it('accepts only the two deployment intervals and the single reconnaissance interval', () => {
    expect(validDemonstrationPolicy(policy)).toBe(true);
    for (const wrong of [{ deploymentDays: [0, 2] }, { deploymentDays: [1, 3] },
      { reconnaissanceDays: 0 }, { reconnaissanceDays: 2 }]) {
      expect(validDemonstrationPolicy({ ...policy, ...wrong } as typeof policy)).toBe(false);
    }
  });

  it('keeps a deployment movement gate and charges asymmetric recovery days', () => {
    const short = choices();
    expect(short.draftRejected.filter(r => r.rejVariant.startsWith('deployment.') && r.rejVariant.endsWith('.camp')).flatMap(r => r.rejGates.map(g => g.gateKind)))
      .toEqual(['no_deployment_march', 'no_deployment_march']);
    expect(short.draftCandidates.some(c => c.candVariant === 'deployment.1.field')).toBe(true);
    const long = choices({ dayBA: 25 });
    expect(long.draftRejected.filter(r => r.rejVariant.startsWith('deployment.') && r.rejVariant.endsWith('.field'))
      .every(r => r.rejGates.some(g => g.gateKind === 'insufficient_stores'))).toBe(true);
    const offScope = choices(undefined, true, { ...terms, purpose: { ...purpose, actionArea: [R('field')] } });
    expect(offScope.draftCandidates).toEqual([]);
    expect(offScope.draftRejected[0]!.rejGates.some(g => g.gateKind === 'no_route')).toBe(true);
  });

  it('discloses candidate counts and retains content ids across calendar changes', () => {
    const start = choices();
    const sameSeason = choices({ startDate: '1900-06-17' });
    expect(sameSeason).toEqual(start);
    expect(choices({ commander: 'a_other' })).toEqual({ ...start, draftCommander: PER('a_other') });
    expect(start.draftGenerated).toBeLessThanOrEqual(policy.totalCandidates);
    expect(start.draftFeasible).toBe(start.draftCandidates.length + start.draftTruncated!);
    const four = choices(undefined, true, { ...terms, purpose: { ...purpose,
      actionArea: [R('camp'), R('field'), R('edge_position'), R('rear')] } });
    expect(four.draftGenerated).toBe(policy.totalCandidates);
    const known=plannerInput(undefined,true,{...terms,purpose:{...purpose,actionArea:[R('camp'),R('field'),R('edge_position'),R('rear')]}});
    const unknown=draft({...known,beliefs:new Map([...known.beliefs].map(([r,n])=>[r,r===R('rear')?null:n]))});
    expect(unknown.draftRejected.some(r => r.rejGates.some(g => g.gateKind === 'unknown_recovery'))).toBe(true);
    expect(four.draftSearches).toBeLessThanOrEqual(plannerInput().rules.maxSearches);
  });

  it('requires carried stores for the arrival boundary and full intervals before recovery', () => {
    const input = plannerInput();
    const set = (storesDays: number) => draft({ ...input, forces: input.forces.map(f => ({ ...f, storesDays })) });
    const preparing = input.profile.concentrationDays;
    for (const [variant, days] of [['reconnaissance_in_force.1.camp', 3], ['deployment.1.field', 5]] as const) {
      expect(set(preparing + days).draftRejected.some(r => r.rejVariant === variant)).toBe(false);
      expect(set(preparing + days - 1).draftRejected.find(r => r.rejVariant === variant)?.rejGates.map(g => g.gateKind))
        .toContain('insufficient_stores');
    }
  });

  it('authorizes a distinct local authored letter only through live in-scope received authority', () => {
    const { world, state } = fixture({ authored: true });
    const issuer = PER('a_gen2');
    const letterOptions = (position: typeof state) => localOptions(world, position, issuer, position.stateDay + 1).filter(o => o.kind === 'letter');
    const enact = (terms: MandateGrant) => enactMandate(world.map, state, terms, toId('message', 'paper.root'), 0, 'root.answer', [...terms.mandateActions]);
    expect(letterOptions(state)).toEqual([]);
    expect(letterOptions(enact({ ...grant, mandateRegions: [R('camp')] }))).toEqual([]);
    expect(letterOptions(enact({ ...grant, mandateExpires: 0 }))).toEqual([]);
    const active = enact(grant);
    const option = letterOptions(active)[0]!;
    expect(option?.row.letter).toEqual(letter);
    const result = tick(world, active, [{ day: 1, seat: seatIdFor(issuer),
      command: { cmd: 'choose', request: 'local:a_office:1', option: option.id } }]);
    expect(result.rejections).toEqual([]);
    expect(result.requestDispatches?.find(m => m.msgOrder?.orderLetter?.key === letter.key)?.msgOrder).toMatchObject({
      orderIssuer: issuer, orderTarget: P('a_army'), orderGoal: goalOf({ ...terms, ...world.map.world.rules.plans.goalDefaults, rail: false, river: false, sea: false }),
    });
    expect(letterOptions(result.state)).toEqual([]);
    const counterfeit = tick(world, active, [{ day: 1, seat: seatIdFor(PER('a_lead')),
      command: { cmd: 'order', to: P('a_army'), goal: { ...terms, ...world.map.world.rules.plans.goalDefaults, neutral: false, committed: [] },
        letter, route: 'courier', bypass: false } }]);
    expect(counterfeit.rejections.map(r => r.reason)).toEqual(['bad_goal']);
  });

  it('keeps authored dispatch correlations and candidate ids when an unrelated message is inserted', () => {
    const { world, state } = fixture({ authored: true });
    const issuer = PER('a_gen2');
    const active = enactMandate(world.map, state, grant, toId('message', 'paper.root'), 0, 'root.answer', [...grant.mandateActions]);
    const selected = localOptions(world, active, issuer, 1).find(o => o.kind === 'letter')!;
    const main: LogEntry = { day: 1, seat: seatIdFor(issuer), command: { cmd: 'choose', request: 'local:a_office:1', option: selected.id } };
    const unrelated: LogEntry = { day: 1, seat: seatIdFor(PER('b_lead')),
      command: { cmd: 'inquire', to: P('b_army'), subject: null, route: 'courier' } };
    function collect(entries: readonly LogEntry[]) {
      const sent = tick(world, active, entries);
      expect(sent.rejections).toEqual([]);
      const origin = sent.requestDispatches?.find(m => m.msgOrder?.orderLetter?.key === letter.key)?.msgOrigin;
      expect(origin).toBeDefined();
      let finished = sent.state;
      for (let i = 0; i < 7; i++) finished = tick(world, finished, []).state;
      const record = finished.planRecords[P('a_army')]!;
      expect(record.planOrder).toBe(origin);
      expect(record.planLetter).toEqual(letter);
      return { origin, draft: record.planDraft, answer: finished.orderResponses[record.planResponse] };
    }
    expect(collect([unrelated, main])).toEqual(collect([main]));
  });

  it('does not enact a refused detention order or one whose mandate is revoked before delivery', () => {
    const reluctant = fixture({ resistant: true });
    const issued = tick(reluctant.world, reluctant.state, [{ day: 1, seat: seatIdFor(PER('a_lead')),
      command: { cmd: 'order', to: P('a_army'), goal: terms, route: 'courier', bypass: false } }]);
    expect(issued.rejections).toEqual([]);
    let refused = issued.state;
    for (let i = 0; i < 4; i++) refused = tick(reluctant.world, refused, []).state;
    expect(Object.values(refused.orderResponses).some(r => r.respPost === P('a_army') && r.respUndertaking === null &&
      (r.respActual === 'object' || r.respActual === 'refuse'))).toBe(true);
    expect(refused.planRecords[P('a_army')]).toBeUndefined();
    expect(Object.values(refused.operationRecords)).toEqual([]);

    const { world, state } = fixture({ authored: true });
    const issuer = PER('a_gen2');
    const active = enactMandate(world.map, state, grant, toId('message', 'paper.root'), 0, 'root.answer', [...grant.mandateActions]);
    const option = localOptions(world, active, issuer, 1).find(o => o.kind === 'letter')!;
    const dispatched = tick(world, active, [{ day: 1, seat: seatIdFor(issuer),
      command: { cmd: 'choose', request: 'local:a_office:1', option: option.id } }]).state;
    const revocation: LogEntry = { day: 1, seat: seatIdFor(PER('a_lead')),
      command: { cmd: 'mandate', paper: 'revocation', route: 'special-messenger' } };
    const sent = tick(world, active, [revocation, { day: 1, seat: seatIdFor(issuer),
      command: { cmd: 'choose', request: 'local:a_office:1', option: option.id } }]);
    expect(sent.rejections).toEqual([]);
    expect(sent.requestDispatches?.some(m => m.msgOrder?.orderMandate?.mandateRevoke)).toBe(true);
    let accepted = dispatched;
    let barred = sent.state;
    for (let i = 0; i < 6; i++) {
      accepted = tick(world, accepted, []).state;
      barred = tick(world, barred, []).state;
    }
    expect(accepted.planRecords[P('a_army')]?.planLetter).toEqual(letter);
    expect(barred.authorityByPost?.[P('a_office')]?.some(row => row.authorityStatus === 'revoked')).toBe(true);
    expect(barred.planRecords[P('a_army')]).toBeUndefined();
    expect(Object.values(barred.operationRecords)).toEqual([]);
  });

  it('executes a regional reconnaissance interval, reports it by normal delivery, and permits departure', () => {
    const { world, state } = fixture();
    const morning = tick(world, tick(world, state, []).state, []).state;
    const issued = tick(world, morning, [{
      day: morning.stateDay + 1, seat: seatIdFor(PER('a_lead')),
      command: { cmd: 'order', to: P('a_army'), goal: terms, route: 'courier', bypass: false },
    }]);
    expect(issued.rejections).toEqual([]);
    let current = issued.state;
    let before: typeof state | undefined;
    let recovered: typeof state | undefined;
    const following: { readonly day: number; readonly entries: readonly LogEntry[] }[] = [];
    let observed = false;
    const reports = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const day = current.stateDay + 1;
      const draft = current.planRecords[P('a_army')]?.planDraft;
      const candidate = draft?.draftCandidates.find(c => c.candVariant === 'reconnaissance_in_force.1.camp');
      const choosing = before === undefined && candidate !== undefined && current.planRecords[P('a_army')]!.planStatus === 'choosing';
      if (choosing) before = current;
      const entries: LogEntry[] = choosing ? [{
        day, seat: seatIdFor(PER('a_gen')),
        command: { cmd: 'choose', request: `plan:a_army:${day}`, option: candidate.id },
      }] : [];
      if (before !== undefined) following.push({ day, entries });
      current = tick(world, current, entries).state;
      recovered ??= Object.values(current.operationRecords).some(o => o.opDemonstration?.demEvents.at(-1)?.devReason === 'recovered') ? current : undefined;
      for (const report of viewFor(world, current, seatIdFor(PER('a_lead'))).reports) {
        for (const claim of report.claims) if (claim.kind.startsWith('detention-')) reports.add(claim.kind);
      }
      observed ||= viewFor(world, current, seatIdFor(PER('b_gen'))).reports
        .some(r => r.claims.some(c => c.kind === 'enemy-activity' && c.token === P('a_army')));
    }
    const operation = Object.values(current.operationRecords).find(op => op.opPost === P('a_army'))!;
    expect(operation?.opDemonstration?.demEvents.map(e => e.devStage)).toEqual([
      'preparing', 'approaching', 'demonstrating', 'recovering', 'closed',
    ]);
    expect(operation.opDemonstration!.demActions.map(a => [a.dactRegion, a.dactBlocks, a.dactTask])).toEqual([
      [R('camp'), [B('a_force')], 'reconnaissance_in_force'],
    ]);
    expect(operation.opDemonstration!.demActions[0]!.dactDay).toBeGreaterThan(operation.opDemonstration!.demEvents[2]!.devDay);
    expect(operation.opOutcome).toBe('episode_closed');
    expect(current.planRecords[P('a_army')]?.planGoal.goalPurpose).toEqual(operation.opPurpose);
    expect(reports).toEqual(new Set(['detention-activity', 'detention-effect']));
    expect(observed).toBe(true);
    expect(before).toBeDefined();
    const save = decodeSave(encodeSave({ worldHash: worldHash(world.map.world), state: before!, log: [] }));
    let resumed = save.state as unknown as State;
    for (const { entries } of following) resumed = tick(world, resumed, entries, { freeze: true }).state;
    expect(canonicalHash(resumed)).toBe(canonicalHash(current));
    const fresh = current.planRecords[P('a_army')]!;
    expect(fresh.planStatus).toBe('choosing');
    expect(fresh.planDraft!.draftDay).toBeGreaterThan(operation.opEndDay!);
    expect(fresh.planDraft!.draftCandidates.some(c => c.id === operation.opPlan)).toBe(true);
    const actingSeat = seatIdFor(PER('a_gen'));
    const replayed = { ...current, planRecords: recovered!.planRecords,
      knowledgeBySeat: { ...current.knowledgeBySeat, [actingSeat]: knowledgeOf(recovered!, actingSeat) },
      messagesInTransit: current.messagesInTransit.filter(m => m.msgTo !== PER('a_gen')) };
    const noNewObservation = tick(world, replayed, []).state;
    // The recovered picture is now stale at this later morning. It cannot
    // reopen an episode or reuse a formerly numeric recovery certificate.
    expect(noNewObservation.planRecords[P('a_army')]!.planStatus).toBe('approved');
    expect(Object.values(noNewObservation.operationRecords).filter(o => o.opOrder === operation.opOrder)).toHaveLength(1);
    const oldReportChoiceDay = noNewObservation.stateDay + 1;
    const oldReportChoice = tick(world, noNewObservation, [{ day: oldReportChoiceDay, seat: actingSeat,
      command: { cmd: 'choose', request: `plan:a_army:${oldReportChoiceDay}`, option: operation.opPlan } }]);
    expect(oldReportChoice.rejections).not.toEqual([]);
    expect(Object.values(oldReportChoice.state.operationRecords).filter(o => o.opOrder === operation.opOrder)).toHaveLength(1);
    const newDay = current.stateDay + 1;
    const repeat = tick(world, current, [{ day: newDay, seat: seatIdFor(PER('a_gen')),
      command: { cmd: 'choose', request: `plan:a_army:${newDay}`, option: operation.opPlan } }]);
    expect(repeat.rejections).toEqual([]);
    expect(Object.values(repeat.state.operationRecords).filter(o => o.opOrder === operation.opOrder).map(o => o.opPlan))
      .toEqual([operation.opPlan, operation.opPlan]);
    const { purpose: _purpose, ...common } = terms;
    const after = tick(world, current, [{
      day: current.stateDay + 1, seat: seatIdFor(PER('b_lead')),
      command: { cmd: 'order', to: P('b_army'), goal: { ...common, posture: 'take',
        objective: R('rear'), committed: [B('b_force')] }, route: 'courier', bypass: false },
    }]);
    expect(after.rejections).toEqual([]);
    current = after.state;
    for (let i = 0; i < 9; i++) current = tick(world, current, []).state;
    expect(current.forceLocations[B('b_force')]!.locRegion).toBe(R('rear'));
  });

  it('starts the attack course through ordinary movement without certifying detention on arrival', () => {
    const { world, state } = fixture();
    const morning = tick(world, tick(world, state, []).state, []).state;
    const issued = tick(world, morning, [{
      day: morning.stateDay + 1, seat: seatIdFor(PER('a_lead')),
      command: { cmd: 'order', to: P('a_army'), goal: terms, route: 'courier', bypass: false },
    }]);
    expect(issued.rejections).toEqual([]);
    let current = issued.state;
    for (let i = 0; i < 10; i++) {
      const day = current.stateDay + 1;
      const attack = current.planRecords[P('a_army')]?.planDraft?.draftCandidates.find(c => c.candDetention?.means === 'attack');
      const choosing = attack !== undefined && current.planRecords[P('a_army')]!.planStatus === 'choosing';
      current = tick(world, current, choosing ? [{
        day, seat: seatIdFor(PER('a_gen')), command: { cmd: 'choose', request: `plan:a_army:${day}`, option: attack.id },
      }] : []).state;
    }
    const operation = Object.values(current.operationRecords).find(op => op.opPost === P('a_army'))!;
    expect(operation?.opPurpose?.detKind).toBe('attack_or_demonstrate');
    expect(operation.opAxes[0]!.oaxLog.some(e => e.axevStage === 'march')).toBe(true);
    expect(operation.opOutcome).not.toBe('objective_reached');
  });

  it('records a two-interval deployment only with real movement and leaves contact to battle', () => {
    function deploy(endpoint: string, intervals: 1 | 2): State {
      const { world, state } = fixture();
      const morning = tick(world, tick(world, state, []).state, []).state;
      const goal: GoalTerms = { ...terms, purpose: { ...purpose, actionArea: [R('camp'), R(endpoint)] } };
      const issued = tick(world, morning, [{ day: morning.stateDay + 1, seat: seatIdFor(PER('a_lead')),
        command: { cmd: 'order', to: P('a_army'), goal, route: 'courier', bypass: false } }]);
      expect(issued.rejections).toEqual([]);
      let current = issued.state;
      for (let i = 0; i < 11; i++) {
        const day = current.stateDay + 1;
        const record = current.planRecords[P('a_army')];
        const selected = record?.planDraft?.draftCandidates.find(c => c.candVariant === `deployment.${intervals}.${endpoint}`);
        current = tick(world, current, record?.planStatus === 'choosing' && selected !== undefined ? [{
          day, seat: seatIdFor(PER('a_gen')), command: { cmd: 'choose', request: `plan:a_army:${day}`, option: selected.id },
        }] : []).state;
      }
      return current;
    }
    const clear = deploy('edge_position', 2);
    const episode = Object.values(clear.operationRecords).find(op => op.opDemonstration?.demCourse.task === 'deployment')?.opDemonstration;
    expect(episode?.demActions.map(a => a.dactRegion)).toEqual([R('edge_position'), R('edge_position')]);
    expect(episode!.demActions[1]!.dactDay - episode!.demActions[0]!.dactDay).toBe(1);
    expect(clear.forceLocations[B('a_force')]!.locRegion).toBe(R('camp'));
    const contacted = deploy('field', 1);
    expect(Object.values(contacted.battleRecords).some(b => b.battleRegion === R('field'))).toBe(true);
    expect(Object.values(contacted.operationRecords).flatMap(o => o.opDemonstration?.demActions ?? [])).toEqual([]);
  });

  it('lets the opposing command move during the live deployment', () => {
    const { world, state } = fixture();
    const { purpose: _purpose, ...common } = terms;
    let current = tick(world, state, [{ day: 1, seat: seatIdFor(PER('b_lead')),
      command: { cmd: 'order', to: P('b_army'), goal: { ...common, posture: 'take', objective: R('rear'),
        committed: [B('b_force')], awaitWord: true }, route: 'courier', bypass: false } }]).state;
    for (let i = 0; i < 4; i++) current = tick(world, current, []).state;
    expect(current.planRecords[P('b_army')]?.planStatus).toBe('ready');
    const goal: GoalTerms = { ...terms, purpose: { ...purpose, actionArea: [R('camp'), R('edge_position')] } };
    current = tick(world, current, [{ day: current.stateDay + 1, seat: seatIdFor(PER('a_lead')),
      command: { cmd: 'order', to: P('a_army'), goal, route: 'courier', bypass: false } }]).state;
    let sent = false;
    let leftWhileLive = false;
    const observedDays = new Set<number>();
    for (let i = 0; i < 13; i++) {
      const day = current.stateDay + 1;
      const r = current.planRecords[P('a_army')];
      const pick = r?.planDraft?.draftCandidates.find(c => c.candVariant === 'deployment.2.edge_position');
      const op = Object.values(current.operationRecords).find(o => o.opDemonstration !== undefined);
      const orders = [];
      if (r?.planStatus === 'choosing' && pick !== undefined) orders.push({ day, seat: seatIdFor(PER('a_gen')),
        command: { cmd: 'choose' as const, request: `plan:a_army:${day}`, option: pick.id } });
      if (!sent && op?.opDemonstration?.demEvents.at(-1)?.devStage === 'approaching') {
        orders.push({ day, seat: seatIdFor(PER('b_lead')), command: { cmd: 'go' as const, to: P('b_army'), route: 'courier' as const, bypass: false } });
        sent = true;
      }
      const result = tick(world, current, orders);
      expect(result.rejections).toEqual([]);
      current = result.state;
      const active = Object.values(current.operationRecords).find(o => o.opDemonstration !== undefined && o.opEndDay === null);
      leftWhileLive ||= active?.opDemonstration?.demEvents.at(-1)?.devStage === 'demonstrating' && current.forceLocations[B('b_force')]!.locRegion === R('rear');
      for (const r of viewFor(world, current, seatIdFor(PER('b_gen'))).reports) {
        if (r.claims.some(c => c.kind === 'enemy-activity' && c.region === R('edge_position'))) observedDays.add(r.day);
      }
    }
    expect(sent).toBe(true);
    expect(leftWhileLive).toBe(true);
    const actions = Object.values(current.operationRecords).find(o => o.opDemonstration !== undefined)!.opDemonstration!.demActions;
    expect(actions).toHaveLength(2);
    expect(observedDays).toEqual(new Set([actions[0]!.dactDay]));
  });

  it('carries the same observed activity through delivered, lost, delayed and filtered journeys', () => {
    const { world, state } = firstActivity('reconnaissance_in_force');
    const sent = state.messagesInTransit.find(m => m.msgTo === PER('b_gen') &&
      m.msgReport?.reportClaims.some(c => c.claimKind === 'enemy-activity'))!;
    expect(sent).toBeDefined();
    const without = { ...state, messagesInTransit: state.messagesInTransit.filter(m => m.id !== sent.id) };
    const heard = (s: State) => viewFor(world, s, seatIdFor(PER('b_gen'))).reports.find(r => r.id === sent.msgOrigin);
    const day = state.stateDay + 1;
    const arrived = tick(world, state, []).state;
    expect(heard(arrived)?.claims.some(c => c.kind === 'enemy-activity')).toBe(true);
    expect(heard(tick(world, without, []).state)).toBeUndefined();
    const delayed = tick(world, sendMessages(without, [{ ...sent, msgArriveDay: day + 1 }]), []).state;
    expect(heard(delayed)).toBeUndefined();
    // A newer regular estimate can prune the delayed one at the end of its arrival day.
    expect(heard(deliverDue(ctxFor(world, delayed, day + 1, TICK_MECHANICS), delayed))?.claims.some(c => c.kind === 'enemy-activity')).toBe(true);
    const viaFilter: TransitMessage = { ...sent, msgTo: PER('b_clerk'), msgToPost: P('b_filter'), msgRoute: 'wire', msgRole: 'filter',
      msgPending: [{ hopPerson: PER('b_gen'), hopPost: P('b_army'), hopRole: 'addressee' }] };
    const entered = deliverDue(ctxFor(world, without, day, TICK_MECHANICS), sendMessages(without, [viaFilter]));
    const finalHop = entered.messagesInTransit.find(m => m.msgOrigin === sent.msgOrigin);
    const filtered = finalHop === undefined ? entered : deliverDue(ctxFor(world, entered, finalHop.msgArriveDay, TICK_MECHANICS), entered);
    expect(heard(filtered)?.via).toContain(P('b_filter'));
    expect(heard(filtered)?.claims.some(c => c.kind === 'enemy-command')).toBe(true);
    expect(heard(filtered)?.claims.some(c => c.kind === 'enemy-activity')).toBe(false);
  });

  it('ends a bounded duty only on the received departure paper and keeps one interval after interruption', () => {
    const { world, state, operation } = firstActivity('deployment');
    const scout = state.messagesInTransit.find(m => m.msgTo === PER('a_gen') &&
      m.msgReport?.reportType === 'enemy-estimate' && m.msgReport.reportDay === state.stateDay)!;
    expect(scout).toBeDefined();
    const falseId = toId('message', 'fixture.false.departure');
    const falseScout: TransitMessage = { ...scout, id: falseId, msgOrigin: falseId, msgArriveDay: state.stateDay,
      msgReport: { ...scout.msgReport!, reportClaims: [
        { claimKind: 'enemy-strength', claimRegion: R('field'), claimValue: 0, claimConfidence: 1000, claimToken: null },
        { claimKind: 'enemy-command', claimRegion: R('rear'), claimValue: 1, claimConfidence: 1000, claimToken: P('b_army') },
      ] } };
    // The paired report was already delivered by the end of the previous day; normal transport files it.
    const before = { ...state, messagesInTransit: [] };
    const delivered = deliverDue(ctxFor(world, before, state.stateDay, TICK_MECHANICS), sendMessages(before, [falseScout]));
    expect(delivered.planRecords[P('a_army')]!.planDetentionEnd).toBeUndefined();
    const ended = tick(world, delivered, []).state;
    const uncut = tick(world, before, []).state;
    expect(ended.forceLocations[B('b_force')]!.locRegion).toBe(R('field'));
    expect(ended.planRecords[P('a_army')]!.planDetentionEnd).toMatchObject({ dendReason: 'reported_departure', dendReport: falseId });
    expect(uncut.planRecords[P('a_army')]!.planDetentionEnd).toBeUndefined();
    const episode = (s: State) => Object.values(s.operationRecords).find(o => o.opOrder === operation.opOrder)!.opDemonstration!;
    expect(episode(ended).demActions).toHaveLength(1);
    expect(episode(ended).demEvents.some(e => e.devReason === 'reported_departure')).toBe(true);
    expect(episode(uncut).demActions).toHaveLength(2);
  });
});
