import type { MandatePaper } from '../src/world/mandates.ts';
import { describe, expect, it } from 'vitest';
import { createState } from '../src/tick/setup.ts';
import { tick } from '../src/tick/tick.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { indexWorld } from '../src/world/index.ts';
import { fixtureMap, fixtureStart, P, POST, R } from './support/seats-fixture.ts';
import { activeMandate, enactMandate, intersectMandate, mandateAt, mayCommit, commitAuthority } from '../src/command/authority.ts';
import { availableMandatePapers, localOptions, planAuthorized } from '../src/seats/local-actions.ts';
import { setGoal } from '../src/plans/plans.ts';
import { goalOf } from '../src/tick/orders.ts';
import { goalTerms, scriptedSeats } from './support/test-seats.ts';
import { toId } from '../src/ids.ts';
import { encodeSave, decodeSave } from '../src/serialize/save.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { playDays, replay } from '../src/log/session.ts';
import { mandateProblems, type MandateGrant } from '../src/world/mandates.ts';
import type { State } from '../src/root-state.ts';
import { knowledgeOf } from '../src/knowledge/knowledge.ts';

const origin = (s: string) => toId('message',s);
const grant = (more: Partial<MandateGrant> = {}): MandateGrant => ({
  mandateKey: 'root', mandateRevision: 1, mandateIssuer: P('a_lead'), mandateIssuerPost: null,
  mandateHolder: P('a_sec'), mandatePost: POST('a_office'), mandateParent: null,
  mandateActions: ['hold','relieve','take'], mandateRecipients: [POST('a_army'),POST('a_reserve')],
  mandateRegions: [R('a_cap'),R('a_mid'),R('a_front')], mandateModes: ['land'],
  mandateCeiling: { ceilingPost: POST('a_office'), ceilingMen: 1000 }, mandateGuard: null,
  mandateExpires: null, mandateReports: ['orders'], mandateOnward: true, mandateRevoke: false, ...more,
});
function fixture(g = grant(), nested = false) {
  const map = fixtureMap();
  const paper: MandatePaper = { id: 'root', fromDate: '1900-06-01', source: 'Fictional assignment, p.1', grant: g };
  const startSpec = fixtureStart();
  const world = indexSeatsWorld(indexWorld({ ...map.world,rules:{ ...map.world.rules,mandates:[paper] } }),{ ...startSpec,posts:startSpec.posts.map(p => nested && p.id===POST('a_reserve') ? {...p,parent:POST('a_army')} : p) });
  const start = createState(world,{ seed:17 });
  const active = enactMandate(world.map,start,g,origin('grant.root'),0,'fixture-answer',[...g.mandateActions,'onward']);
  return { world,start,active,g };
}

describe('S123 received authority', () => {
  it('C1: a root instrument travels and is enacted only after its holder answers', () => {
    const map = fixtureMap();
    const paper: MandatePaper = {
      id: 'root', fromDate: '1900-06-01', source: 'Fictional assignment, p.1',
      grant: { mandateKey: 'field', mandateRevision: 1, mandateIssuer: P('a_lead'), mandateIssuerPost: null,
        mandateHolder: P('a_bold'), mandatePost: POST('a_reserve'), mandateParent: null,
        mandateActions: ['hold', 'take', 'relieve'], mandateRecipients: [POST('a_army'), POST('a_reserve')],
        mandateRegions: [R('a_cap'), R('a_mid'), R('a_front')], mandateModes: ['land'],
        mandateCeiling: { ceilingPost: POST('a_office'), ceilingMen: null }, mandateGuard: null,
        mandateExpires: null, mandateReports: ['orders'], mandateOnward: true, mandateRevoke: false },
    };
    const world = indexSeatsWorld(indexWorld({ ...map.world, rules: { ...map.world.rules, mandates: [paper] } }), fixtureStart());
    const start = createState(world, { seed: 17 });
    expect(start.authorityByPost ?? {}).toEqual({});
    const sent = tick(world, start, [{ day: 1, seat: seatIdFor(P('a_lead')), command: { cmd: 'mandate', paper: 'root', route: 'courier' } }]);
    expect(sent.rejections).toEqual([]);
    expect(sent.state.authorityByPost ?? {}).toEqual({});
    let state = sent.state;
    for (let day = 2; day <= 5; day++) state = tick(world, state, []).state;
    expect(state.authorityByPost?.[POST('a_reserve')]?.[0]).toMatchObject({
      authorityGrant: { mandateKey: 'field', mandateHolder: P('a_bold') }, authorityStatus: 'active',
    });
  });
  it('C1: refusal, missing actions and expiry fail closed; qualified answers retain only accepted clauses', () => {
    const { world,start,g } = fixture();
    const refused = enactMandate(world.map,start,g,origin('refused'),1,'answer',null);
    expect(localOptions(world,refused,P('a_sec'),2)).toEqual([]);
    const limited = enactMandate(world.map,start,g,origin('qualified'),1,'answer',['hold']);
    expect(mandateAt(limited,g.mandatePost,g.mandateKey)?.authorityGrant).toMatchObject({ mandateActions:['hold'],mandateOnward:false });
    const expired = enactMandate(world.map,start,{ ...g,mandateExpires:1 },origin('expired'),1,'answer',['hold']);
    expect(activeMandate(world.map,expired,mandateAt(expired,g.mandatePost,g.mandateKey)!,2)).toBe(false);
  });
  it('C1: an assignment waits for a known holder and never invents one at a vacant post', () => {
    const map=fixtureMap(), spec=fixtureStart();
    const g=grant({mandateHolder:P('a_bold'),mandatePost:POST('a_reserve')});
    const world=indexSeatsWorld(indexWorld({...map.world,rules:{...map.world.rules,mandates:[{id:'root',fromDate:'1900-06-01',source:'Fictional p.1',grant:g}]}}),
      {...spec,posts:spec.posts.map(p => p.id===POST('a_reserve') ? {...p,holder:null} : p)});
    const state=createState(world,{seed:17});
    expect(availableMandatePapers(world,state,P('a_lead'),1)).toEqual([]);
  });
  it('C1: a principal holding his own office retains the principal address path', () => {
    const map=fixtureMap(), spec=fixtureStart();
    const g=grant({mandateHolder:P('a_bold'),mandatePost:POST('a_reserve')});
    const principalPost={...spec.posts.find(p => p.id===POST('a_office'))!,id:POST('a_principal'),holder:P('a_lead')};
    const world=indexSeatsWorld(indexWorld({...map.world,rules:{...map.world.rules,mandates:[{id:'root',fromDate:'1900-06-01',source:'Fictional p.1',grant:g}]}}),
      {...spec,posts:[principalPost,...spec.posts.map(p => p.id===POST('a_office')?{...p,parent:POST('a_principal')}:p)]});
    const state=createState(world,{seed:17});
    const result=tick(world,state,[{day:1,seat:seatIdFor(P('a_lead')),command:{cmd:'mandate',paper:'root',route:'courier'}}]);
    expect(result.rejections).toEqual([]);
    expect(result.requestDispatches?.find(m => m.msgOrder?.orderMandate!==undefined)?.msgTo).toBe(P('a_sec'));
  });
  it('C1: dispatching a mandate preserves the sender’s earlier plan review memory', () => {
    const {world,start}=fixture();
    const seat=seatIdFor(P('a_lead'));
    const earlier={sentPost:POST('a_office'),sentMessage:origin('earlier.approval'),sentKind:'approve' as const,sentDay:0,sentPaper:origin('plan.paper')};
    const ready={...start,knowledgeBySeat:{...start.knowledgeBySeat,[seat]:{...knowledgeOf(start,seat),knownSentOrders:[earlier]}}};
    const result=tick(world,ready,[{day:1,seat,command:{cmd:'mandate',paper:'root',route:'courier'}}]);
    expect(result.rejections).toEqual([]);
    expect(knowledgeOf(result.state,seat).knownSentOrders).toContainEqual(earlier);
  });
  it('C2: child permissions intersect geography, recipients, modes, expiry, ceiling and delegation', () => {
    const { active,g } = fixture(grant({ mandateExpires:10,mandateGuard:100,mandateOnward:false }));
    const child = intersectMandate(active,grant({ mandatePost:POST('a_army'), mandateRecipients:[POST('a_army'),POST('b_army')],
      mandateRegions:[R('a_mid'),R('b_cap')],mandateModes:['land','sea'],mandateExpires:50,
      mandateCeiling:{ ceilingPost:POST('a_army'),ceilingMen:5000 },mandateGuard:10 }),g);
    expect(child).toMatchObject({ mandateRecipients:[POST('a_army')],mandateRegions:[R('a_mid')],mandateModes:['land'],
      mandateExpires:10,mandateGuard:100,mandateCeiling:{ ceilingMen:1000 },mandateOnward:false });
  });
  it('C2: a replacement, a broken chain and a different side cannot use the former holder’s grant', () => {
    const { world,active,g } = fixture();
    const row = mandateAt(active,g.mandatePost,g.mandateKey)!;
    const changed = { ...active,postStates:{ ...active.postStates,[g.mandatePost]:{ ...active.postStates[g.mandatePost]!,postHolder:P('a_bold') } } };
    expect(activeMandate(world.map,changed,row,1)).toBe(false);
    const child = grant({ mandateKey:'child',mandateIssuer:P('a_sec'),mandateIssuerPost:POST('a_office'),
      mandateHolder:P('a_gen'),mandatePost:POST('a_army'),mandateParent:{ parentPost:POST('a_office'),parentKey:'root' } });
    const next = enactMandate(world.map,active,child,origin('child'),1,'answer',['hold','onward']);
    const c = mandateAt(next,POST('a_army'),'child')!;
    expect(activeMandate(world.map,next,c,2)).toBe(true);
    for (const patch of [{ postParent:null },{ postDepartment:toId('department','b_war') }]) {
      const broken = { ...next,postStates:{ ...next.postStates,[POST('a_army')]:{ ...next.postStates[POST('a_army')]!,...patch } } };
      expect(activeMandate(world.map,broken,c,2)).toBe(false);
    }
  });
  it('C2: siblings share their parent’s ceiling and cannot commit overlapping forces', () => {
    const { world,active,g } = fixture();
    const row = mandateAt(active,g.mandatePost,g.mandateKey)!;
    const reserve = toId('forceBlock','a_reserve_1');
    const army = toId('forceBlock','a_army_1');
    expect(mayCommit(world.map,active,row,POST('a_reserve'),[reserve])).toBe(true);
    const used = commitAuthority(active,row,origin('use'),POST('a_reserve'),[reserve]);
    const live = { ...used,planRecords:{ ...used.planRecords,[POST('a_reserve')]:{ ...setGoal(used,POST('a_reserve'),{
      id:origin('use'),issuer:P('a_sec'),goal:goalOf(goalTerms('hold','a_mid')),viaChain:true,issuedDay:1,response:'answer' },1).planRecords[POST('a_reserve')]! } } };
    expect(mayCommit(world.map,live,mandateAt(live,g.mandatePost,g.mandateKey)!,POST('a_army'),[army])).toBe(false);
    expect(mayCommit(world.map,live,mandateAt(live,g.mandatePost,g.mandateKey)!,POST('a_office'),[reserve])).toBe(false);
  });
  it('C2: independently enacted sibling grants draw from one parent commitment balance', () => {
    const {world,active}=fixture();
    const child=(post: 'a_army'|'a_reserve',holder: 'a_gen'|'a_bold') => grant({mandateKey:post,mandateIssuer:P('a_sec'),
      mandateIssuerPost:POST('a_office'),mandateHolder:P(holder),mandatePost:POST(post),mandateRecipients:[POST(post)],
      mandateParent:{parentPost:POST('a_office'),parentKey:'root'},mandateCeiling:{ceilingPost:POST(post),ceilingMen:1000}});
    let state=enactMandate(world.map,active,child('a_army','a_gen'),origin('child.army'),1,'answer',['hold']);
    state=enactMandate(world.map,state,child('a_reserve','a_bold'),origin('child.reserve'),1,'answer',['hold']);
    const first=mandateAt(state,POST('a_reserve'),'a_reserve')!;
    const block=toId('forceBlock','a_reserve_1');
    expect(mayCommit(world.map,state,first,POST('a_reserve'),[block])).toBe(true);
    state=commitAuthority(state,first,origin('sibling.use'),POST('a_reserve'),[block]);
    state=setGoal(state,POST('a_reserve'),{id:origin('sibling.use'),issuer:P('a_sec'),goal:goalOf(goalTerms('hold','a_mid')),
      viaChain:true,issuedDay:1,response:'answer'},1);
    expect(mayCommit(world.map,state,mandateAt(state,POST('a_army'),'a_army')!,POST('a_army'),[toId('forceBlock','a_army_1')])).toBe(false);
  });
  it('C7: revocation changes authority on receipt; a late older grant never restores it', () => {
    const { world,active,g } = fixture();
    expect(activeMandate(world.map,active,mandateAt(active,g.mandatePost,g.mandateKey)!,2)).toBe(true);
    const revoked = enactMandate(world.map,active,{ ...g,mandateRevision:2,mandateRevoke:true },origin('revoke'),3,'answer',['hold']);
    expect(activeMandate(world.map,revoked,mandateAt(revoked,g.mandatePost,g.mandateKey)!,3)).toBe(false);
    expect(enactMandate(world.map,revoked,g,origin('late'),4,'answer',['hold'])).toBe(revoked);
  });
  it('C7: a revocation received by the parent is not a revocation received by the child', () => {
    const {world,active,g}=fixture();
    const child=grant({mandateKey:'child',mandateIssuer:P('a_sec'),mandateIssuerPost:POST('a_office'),
      mandateHolder:P('a_gen'),mandatePost:POST('a_army'),mandateParent:{parentPost:POST('a_office'),parentKey:'root'}});
    const received=enactMandate(world.map,active,child,origin('child'),1,'answer',['hold']);
    const rootRevoked=enactMandate(world.map,received,{...g,mandateRevision:2,mandateRevoke:true},origin('root.revoked'),2,'answer',null);
    expect(activeMandate(world.map,rootRevoked,mandateAt(rootRevoked,POST('a_army'),'child')!,3)).toBe(true);
    const locallyRevoked=enactMandate(world.map,rootRevoked,{...child,mandateRevision:2,mandateRevoke:true},origin('child.revoked'),4,'answer',null);
    expect(activeMandate(world.map,locallyRevoked,mandateAt(locallyRevoked,POST('a_army'),'child')!,4)).toBe(false);
  });
  it('C8: raw orders, invented choices and undeclared instruments do not borrow authority', () => {
    const { world,active } = fixture();
    for (const command of [
      { cmd:'order' as const,to:POST('a_reserve'),route:'courier' as const,bypass:false,goal:goalTerms('hold','a_mid') },
      { cmd:'choose' as const,request:'local:a_office:1',option:'invented' },
      { cmd:'mandate' as const,paper:'invented',route:'courier' as const },
      { cmd:'appoint' as const,post:POST('a_army'),person:P('a_bold'),rank:null,route:'courier' as const },
    ]) expect(tick(world,active,[{day:1,seat:seatIdFor(P('a_sec')),command}]).rejections).toHaveLength(1);
    expect(mandateProblems({ ...world.map.world,rules:{...world.map.world.rules,mandates:[{id:'fake',fromDate:'1900-06-01',source:'Fictional p.1',grant:grant({mandateIssuer:P('a_sec')})}]} },world.start)).toContain('mandates.fake: root requires a principal');
  });
  it('C8: two granting issuers cannot collide on a post’s mandate family key', () => {
    const {world}=fixture();
    const papers=[{id:'first',fromDate:'1900-06-01',source:'Fictional p.1',grant:grant()},
      {id:'second',fromDate:'1900-06-01',source:'Fictional p.2',grant:grant({mandateIssuer:P('b_lead'),mandateRevision:2})}];
    expect(mandateProblems({...world.map.world,rules:{...world.map.world.rules,mandates:papers}},world.start))
      .toContain('mandates.second: a mandate family cannot change granting issuer');
  });
  it('C8: authority survives save and deterministic replay; old states remain empty', () => {
    const { world,start,active } = fixture();
    const restored = decodeSave(encodeSave({worldHash:'0'.repeat(64),state:active})).state as unknown as State;
    expect(restored.authorityByPost).toEqual(active.authorityByPost);
    expect((decodeSave(encodeSave({worldHash:'0'.repeat(64),state:start})).state as unknown as State).authorityByPost ?? {}).toEqual({});
    const played = playDays(world,start,scriptedSeats({a:{1:[{cmd:'mandate',paper:'root',route:'courier'}]}}),6);
    expect(canonicalHash(replay(world,start,played.log,6).state)).toBe(canonicalHash(played.state));
  });
  it('C3/C8: a logged planner choice sends the actual commander’s order through a real relay, with a later answer', () => {
    const { world,active } = fixture(grant({mandateCeiling:{ceilingPost:POST('a_office'),ceilingMen:2000}}),true);
    // A fictional received superior goal supplies intent to the office; it is not an incoming self-letter.
    const prepared = setGoal(active,POST('a_office'),{ id:origin('superior.goal'),issuer:P('a_lead'),
      goal:goalOf(goalTerms('hold','a_mid',{rail:false,approveAsDrafted:false})),viaChain:true,issuedDay:0,response:'fixture-answer' },0);
    const options = localOptions(world,prepared,P('a_sec'),1);
    expect(options.length).toBeGreaterThan(0);
    const option = options.find(o => o.kind === 'goal' && o.target === POST('a_reserve'))!;
    expect(option).toBeDefined();
    const result = tick(world,prepared,[{day:1,seat:seatIdFor(P('a_sec')),command:{cmd:'choose',request:'local:a_office:1',option:option.id}}]);
    expect(result.rejections).toEqual([]);
    const sent = result.requestDispatches!.find(m => m.msgOrder?.orderAuthority !== undefined)!;
    expect(sent.msgOrder?.orderIssuer).toBe(P('a_sec'));
    expect(sent.msgToPost).toBe(POST('a_army'));
    expect(sent.msgPending.at(-1)?.hopPost).toBe(POST('a_reserve'));
    expect(sent.msgOrder?.orderBypass).toBe(false);
    let state = result.state;
    const responses = [...Object.values(state.orderResponses)];
    for (let day=2;day<=8;day++) { state=tick(world,state,[]).state; responses.push(...Object.values(state.orderResponses)); }
    expect(responses.some(r => r.respOrder===sent.msgOrigin && r.respPerson===P('a_bold'))).toBe(true);
    const played = playDays(world,prepared,scriptedSeats(),8);
    expect(replay(world,prepared,played.log,8).hashes).toEqual(played.hashes);
  });
  it('C3: own initiative has a logged planner candidate, waits for review, and sends no self-letter', () => {
    const { world,active } = fixture(grant({mandateHolder:P('a_bold'),mandatePost:POST('a_reserve'),
      mandateRecipients:[],mandateActions:['hold'],mandateRegions:[R('a_mid')],
      mandateCeiling:{ceilingPost:POST('a_reserve'),ceilingMen:null}}));
    const options = localOptions(world,active,P('a_bold'),1);
    expect(options.length).toBeGreaterThan(0);
    const result=tick(world,active,[{day:1,seat:seatIdFor(P('a_bold')),command:{cmd:'choose',request:'local:a_reserve:1',option:options[0]!.id}}]);
    expect(result.rejections).toEqual([]);
    expect(result.requestDispatches?.some(m => m.msgOrder !== null && m.msgFrom===P('a_bold') && m.msgTo===P('a_bold'))).toBe(false);
    const record=result.state.planRecords[POST('a_reserve')]!;
    expect(record.planIssuer).toBe(P('a_lead'));
    expect(record.planGoal.goalApproveAsDrafted).toBe(false);
    expect(planAuthorized(world,result.state,POST('a_reserve'),record,1,record.planDraft!.draftCandidates[0])).toBe(true);
    const revoked=enactMandate(world.map,result.state,{...active.authorityByPost![POST('a_reserve')]![0]!.authorityGrant,
      mandateRevision:2,mandateRevoke:true},origin('revoke'),1,'answer',null);
    expect(planAuthorized(world,revoked,POST('a_reserve'),record,2,record.planDraft!.draftCandidates[0])).toBe(false);
  });
  it('C8: changing hidden enemy strength without a received report cannot change the menu', () => {
    const {world,active}=fixture(grant({mandateHolder:P('a_bold'),mandatePost:POST('a_reserve'),mandateRecipients:[],
      mandateActions:['hold'],mandateRegions:[R('a_mid')],mandateCeiling:{ceilingPost:POST('a_reserve'),ceilingMen:null}}));
    const enemy=toId('forceBlock','b_army_1');
    const changed={...active,forceBlockStates:{...active.forceBlockStates,[enemy]:{...active.forceBlockStates[enemy]!,
      fbLots:active.forceBlockStates[enemy]!.fbLots.map(l => ({...l,lotMen:90000}))}}};
    expect(localOptions(world,changed,P('a_bold'),1)).toEqual(localOptions(world,active,P('a_bold'),1));
  });
  it('C3: a broad standing scope alone does not invent distant offensive objectives', () => {
    const {world,active}=fixture(grant({mandateHolder:P('a_bold'),mandatePost:POST('a_reserve'),mandateRecipients:[],
      mandateActions:['take'],mandateRegions:[R('a_mid'),R('a_front')],mandateCeiling:{ceilingPost:POST('a_reserve'),ceilingMen:null}}));
    expect(localOptions(world,active,P('a_bold'),1)).toEqual([]);
  });
  it('C1: an unrelated officer without a known public position is not asked for a mandate view', () => {
    const map=fixtureMap(), spec=fixtureStart();
    const world=indexSeatsWorld(indexWorld({...map.world,people:map.world.people.map(p => p.id===P('a_bold')?{...p,faction:null}:p),
      rules:{...map.world.rules,mandates:[{id:'root',fromDate:'1900-06-01',source:'Fictional p.1',grant:grant()}]}}),spec);
    const state=createState(world,{seed:17});
    expect(localOptions(world,state,P('a_bold'),1)).toEqual([]);
  });
});
