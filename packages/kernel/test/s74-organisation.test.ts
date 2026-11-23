import type { State } from '../src/root-state.ts';
import { describe, expect, it } from 'vitest';
import { applyMusters, enlistmentsOf } from '../src/forces/enlistment.ts';
import { forceTotals } from '../src/forces/lots.ts';
import { toId } from '../src/ids.ts';
import { createState } from '../src/tick/setup.ts';
import { forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { worldOf } from './support/tick-context.ts';

const B = (s: string) => toId('forceBlock', s);
const map = forcesIndex({ regions: [], edges: [] });
function fixture() {
  const state = createState(worldOf(map, forcesStart({}, [], [])), { seed: 1 });
  return applyMusters(map, state, [{ change: 'create', cause: 'recruitment', create: {
    block: B('batch'), name: 'batch', department: toId('department','a_war'), arm: 'infantry', strength: 5500, storesDays: 7,
    enlistment: { enlPost: toId('post','governor'), enlRaisedBy: null, enlCall: toId('message','call'), enlRegiments: 6, enlMusterDay: 3, enlEndsDay: 93 },
  } }]).state;
}

describe('S74 lots remain the quantities through organisation', () => {
  it('partitions a batch without copying identity, stores or service credit', async () => {
    const api = await import('../src/forces/regroup.ts');
    const state = fixture(), b = state.forceBlockStates[B('batch')]!;
    const groups = [{ block: B('first'), lots: b.fbLots.slice(0,4).map(l=>l.lotId), name:'first' },
      { block: B('second'), lots: b.fbLots.slice(4).map(l=>l.lotId), name:'second' }];
    const split = api.regroupForces(state, [B('batch')], groups);
    expect(Object.values(split.forceBlockStates).flatMap(b=>b.fbLots)).toEqual(b.fbLots);
    expect(Object.values(split.forceBlockStates).reduce((n,b)=>n+(b.fbStoresMilli??0)*((forceTotals(b).fbStrength??0)+b.fbNonCombatants),0)).toBe(b.fbStoresMilli!*5500);
    expect(Object.values(split.forceBlockStates).reduce((n,b)=>n+(forceTotals(b).fbStrength??0),0)).toBe(5500);
    const joined = api.regroupForces(split,[B('first'),B('second')],[{block:B('joined'),lots:b.fbLots.map(l=>l.lotId),name:'joined'}]);
    expect(joined.forceBlockStates[B('joined')]!.fbLots).toEqual(b.fbLots);
    expect(joined.forceBlockStates[B('joined')]!.fbStoresMilli).toBe(b.fbStoresMilli);
    expect(enlistmentsOf(joined)[B('joined')]!.enlMusterDay).toBe(3);
    expect(()=>api.regroupForces(state,[B('batch')],[{...groups[0]!,lots:[...groups[0]!.lots,...groups[0]!.lots]}])).toThrow();
  });
  it('discharges only expired lots from a mixed-term block', () => {
    const s=fixture(), b=s.forceBlockStates[B('batch')]!;
    const state={...s,forceBlockStates:{[B('batch')]:{...b,fbLots:b.fbLots.map((l,i)=>({...l,lotService:{...l.lotService!,enlEndsDay:i===0?10:100}}))}}};
    const r=applyMusters(map,state,[{change:'expire',block:B('batch'),day:10,cause:'recruitment'}]);
    expect(r.state.forceBlockStates[B('batch')]!.fbLots).toEqual(state.forceBlockStates[B('batch')]!.fbLots.slice(1));
    expect(r.state.forceBlockStates[B('batch')]!.fbStoresMilli).toBe(b.fbStoresMilli);
    expect(r.disbanded).toEqual([]);
    expect(r.state.forceRaisedIdentities).toEqual(state.forceRaisedIdentities);
  });
});

it('caps provisional model bundles at four regiments', async()=>{
 const {bundleRaised}=await import('../src/tick/organisation.ts');
 const state=fixture();
 const world=worldOf({...map,world:{...map.world,rules:{...map.world.rules,recruitment:{...map.world.rules.recruitment,planningRegiments:4}}}},forcesStart({},[],[]));
 // A fully placed and assigned raising batch.
 const placed={...state,forceLocations:{[B('batch')]:{locRegion:toId('region','assembly'),locAboard:null,locMarch:null,locSinceDay:3}},forceAssignments:{[B('batch')]:null}};
 const next=bundleRaised(world,placed,[B('batch')]);
 expect(Object.values(next.forceBlockStates).map(b=>b.fbLots.length)).toEqual([4,2]);
});

it('does not keep a departed historical commission active',async()=>{
 const {rankOn}=await import('../src/people/ranks.ts');
 const ranks=[{rank:'old',from:'1850-01-01',until:'1861-03-03'}];
 expect(rankOn(ranks,'1861-03-02')?.rankTerm).toBe('old');
 expect(rankOn(ranks,'1861-03-05')).toBeNull();
});

async function armyFixture(){
 const {fixtureMap,fixtureStart,POST}=await import('./support/seats-fixture.ts');
 const {indexWorld}=await import('../src/world/index.ts');
 const {indexSeatsWorld}=await import('../src/seats/world.ts');
 const template={id:'organisation',army:POST('a_army'),evidenceDate:'1861-07-08',sources:['fixture p1'],posts:[
 {id:POST('division'),name:'division',kind:'corps',parent:POST('a_army'),commander:toId('person','a_spy'),identityHeld:false},
 {id:POST('brigade'),name:'brigade',kind:'corps',parent:POST('division'),commander:null,identityHeld:true}],brigades:[{post:POST('brigade'),regiments:['present','never_raised']}]};
 const original=fixtureMap();
 const world=indexSeatsWorld(indexWorld({...original.world,organisationTemplates:[template]}),fixtureStart());
 const state=createState(world,{seed:1});
 const id=Object.keys(state.forceAssignments).find(id=>state.forceAssignments[id as keyof typeof state.forceAssignments]===POST('a_army'))! as ReturnType<typeof B>;
 const b=state.forceBlockStates[id]!;
 const current:State={...state,forceBlockStates:{...state.forceBlockStates,[id]:{...b,fbLots:b.fbLots.map(l=>({...l,lotRegiment:'present'}))}}};
 return {world,template,id,state:current};
}
it('organises only present troops, reports absence, leaves a held identity vacant, and persists after operations',async()=>{
 const {organise}=await import('../src/tick/organisation.ts');
 const {dissolveOperation}=await import('../src/command/command.ts');
 const {closeFormationPost}=await import('../src/command/organisation.ts');
 const {world,template,state}=await armyFixture();
 const r=organise(world,state,template);
 expect(r.problem).toBeNull();expect(r.absent).toEqual(['never_raised']);
 expect(r.state.postStates[toId('post','division')]!.postOperation).toBeNull();
 expect(r.state.postStates[toId('post','brigade')]!.postHolder).toBeNull();
 expect(dissolveOperation(r.state,'a_finished_operation').state).toBe(r.state);
 const closed=closeFormationPost(world.map,r.state,template.army,toId('post','division'));
 expect(closed.postStates[toId('post','division')]).toBeUndefined();
 expect(closed.postStates[toId('post','brigade')]!.postParent).toBe(template.army);
 expect(Object.values(closed.forceBlockStates).flatMap(b=>b.fbLots)).toHaveLength(Object.values(state.forceBlockStates).flatMap(b=>b.fbLots).length);
});
it('refuses to organise a regiment that still has a joining journey',async()=>{
 const {organise}=await import('../src/tick/organisation.ts');
 const {world,template,state,id}=await armyFixture();
 const waiting={...state,forceJoins:{[id]:{joinPost:template.army,joinRegion:state.forceLocations[id]!.locRegion,joinSinceDay:1,joinBlocked:'no_route' as const}}};
 const r=organise(world,waiting,template);expect(r.problem).toBe('no_present_lots');expect(r.state).toBe(waiting);
});
it('lets the sender choose regiments while conserving the unselected remainder',async()=>{
 const {transferLots}=await import('../src/tick/lot-transfer.ts');
 const {world,template,state,id}=await armyFixture();
 const source=state.forceBlockStates[id]!,lot=source.fbLots[0]!;
 const lots=[{...lot,lotId:'strong',lotRegiment:'strong',lotMen:800},{...lot,lotId:'weak',lotRegiment:'weak',lotMen:200}];
 const initial={...state,forceBlockStates:{...state.forceBlockStates,[id]:{...source,fbLots:lots}}};
 const r=transferLots(world.map,initial,template.army,toId('post','a_reserve'),200,'weakest_first',4);
 expect(r.menSent).toBe(200);expect(r.state.forceBlockStates[r.moved[0]!]!.fbLots.map(l=>l.lotId)).toEqual(['weak']);
 expect(r.state.forceBlockStates[id]!.fbLots.map(l=>l.lotId)).toEqual(['strong']);
 expect(r.state.forceLocations[r.moved[0]!]).toEqual(initial.forceLocations[id]);
});

it('S77: transfers a counted aggregate whole without requiring or inventing regiment identities',async()=>{
 const {transferLots}=await import('../src/tick/lot-transfer.ts');
 const {world,template,state,id}=await armyFixture();
 const from=toId('post','a_reserve'),source=state.forceBlockStates[id]!,lot=source.fbLots[0]!;
 const aggregate={...lot,lotId:'counted_return',lotRegiment:null,lotMen:2500,lotService:{enlPost:from,enlRaisedBy:null,enlCall:toId('message','call'),enlRegiments:2,enlMusterDay:3,enlEndsDay:93}};
 const current:State={...state,postStates:{...state.postStates,[from]:{...state.postStates[from]!,postKind:'governor'}},forceAssignments:{...state.forceAssignments,[id]:from},forceBlockStates:{...state.forceBlockStates,[id]:{...source,fbLots:[aggregate]}}};
 const map={...world.map,world:{...world.map.world,rules:{...world.map.world.rules,recruitment:{...world.map.world.rules.recruitment,raisingPostKinds:['governor']}}}};
 const result=transferLots(map,current,from,template.army,2000,'strongest_first',4);
 expect(result.menSent).toBe(2500);
 expect(result.state.forceBlockStates[result.moved[0]!]!.fbLots).toEqual([aggregate]);
 expect(result.state.forceRaisedIdentities).toEqual(current.forceRaisedIdentities);
 const unknown={...current,forceBlockStates:{...current.forceBlockStates,[id]:{...source,fbLots:[{...aggregate,lotService:{...aggregate.lotService,enlRegiments:null}}]}}};
 expect(transferLots(map,unknown,from,template.army,2000,'strongest_first',4).moved).toEqual([]);
});

it('lets an army plan with its persistent formation blocks',async()=>{
 const {organise}=await import('../src/tick/organisation.ts');
 const {blocksOf}=await import('../src/planner/context.ts');
 const {sideForces,sidePosts}=await import('../src/planner/input.ts');
 const {world,template,state}=await armyFixture();
 const organised=organise(world,state,template).state;
 const input={ground:{map:world.map},forces:sideForces(world,organised,toId('faction','a')),posts:sidePosts(world,organised,toId('faction','a'),toId('person','a_gen'))};
 expect(blocksOf(input,template.army).map(b=>b.id)).toEqual(Object.keys(organised.forceAssignments).filter(id=>organised.forceAssignments[id as keyof typeof organised.forceAssignments]===toId('post','brigade')));
});

it('clears old commissions only after the actual sourced departure',async()=>{
 const {advanceCommissions}=await import('../src/people/commissions.ts');
 const {indexWorld}=await import('../src/world/index.ts');
 const {world,state}=await armyFixture();const person=toId('person','a_spy');
 const map=indexWorld({...world.map.world,vocabularies:{...world.map.world.vocabularies,ranks:[{id:'grade',name:'rank.grade',kind:'regular',seniority:1}]},people:world.map.world.people.map(p=>p.id!==person?p:{...p,rankSchedule:true,ranks:[{rank:'grade',from:'1860-01-01'}],service:{government:null,toFaction:toId('faction','b'),toBloc:null,historicalOn:'1861-04-25',cites:[]}})});
 const before:State={...state,personRanks:{...state.personRanks,[person]:{regular:{rankTerm:'grade',rankSince:'1860-01-01'}}}};
 expect(advanceCommissions(map,before,'1861-04-25').personRanks[person]).toEqual(before.personRanks[person]);
 const resigned:State={...before,personService:{...before.personService,[person]:{serviceFaction:toId('faction','b'),serviceBloc:null,serviceChoice:'resign' as const,serviceDay:51}}};
 expect(advanceCommissions(map,resigned,'1861-04-25').personRanks[person]).toEqual({});
});

it('refuses to round away ration quantities in an unrepresentable merge',async()=>{
 const {regroupForces}=await import('../src/forces/regroup.ts');
 const state=fixture(),b=state.forceBlockStates[B('batch')]!;
 const split=regroupForces(state,[B('batch')],[{block:B('first'),lots:b.fbLots.slice(0,4).map(l=>l.lotId),name:'first'},{block:B('second'),lots:b.fbLots.slice(4).map(l=>l.lotId),name:'second'}]);
 const altered:State={...split,forceBlockStates:{...split.forceBlockStates,[B('second')]:{...split.forceBlockStates[B('second')]!,fbStoresMilli:7001}}};
 expect(()=>regroupForces(altered,[B('first'),B('second')],[{block:B('merged'),lots:b.fbLots.map(l=>l.lotId),name:'merged'}])).toThrow('not exactly representable');
 expect(altered.forceBlockStates[B('first')]!.fbLots).toHaveLength(4);
});
