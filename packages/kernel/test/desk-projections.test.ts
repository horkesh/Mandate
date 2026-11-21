import {expect, it} from 'vitest';
import {toId, type MessageId} from '../src/ids.ts';
import {deliverReport} from '../src/knowledge/knowledge.ts';
import {NO_TRUTH} from '../src/knowledge/truth.ts';
import {seatIdFor} from '../src/seats/seats.ts';
import {createState} from '../src/tick/setup.ts';
import {spendAttention, refillAttention} from '../src/seats/attention.ts';
import {createViewCache, viewFor} from '../src/view/view.ts';
import {indexedFixture, P, POST, F} from './support/seats-fixture.ts';
import type {State} from '../src/root-state.ts';
import type {TransitMessage} from '../src/messages/transit.ts';
import {indexWorld} from '../src/world/index.ts';
import {indexSeatsWorld} from '../src/seats/world.ts';
import {fireSituation,surfaceSituation,recordDecision} from '../src/situations/situations.ts';
import type {SituationDef} from '../src/situations/types.ts';

const world=indexedFixture(), seat=seatIdFor(P('a_lead'));
function receipt(state:State,id:string,token:string,value=1,day=state.stateDay,received=state.stateDay):State {
 return deliverReport(state,seat,{id:id as MessageId,knownReceivedDay:received,knownRoute:'in-person',knownVia:[],knownBody:{
  reportType:'advice',reportSubtype:'requested',reportAuthor:P('a_gen'),reportAuthorPost:POST('a_army'),
  reportSubjectKind:'post',reportSubjectId:'a_army',reportDay:day,reportHour:null,reportAnswers:null,
  reportClaims:[{claimKind:token==='request'?'audience-request':'verb-answered',claimRegion:null,claimValue:value,claimToken:token==='request'?null:`audience:${token}`,claimConfidence:1000}],
  reportAdvice:{adviceRecommends:'wait',adviceConfidence:700,adviceReasons:[{reasonKind:'too_rash',reasonWeight:20}]},
 }},NO_TRUTH);
}
function invitation(issuer='a_lead'):TransitMessage {
 return {id:'m.invitation' as MessageId,msgOrigin:'m.invitation' as MessageId,msgFrom:P(issuer),msgTo:P('a_gen'),msgToPost:POST('a_army'),msgRole:'addressee',msgRoute:'in-person',msgSentDay:1,msgArriveDay:7,msgVia:[],msgPending:[],msgOrder:null,msgReport:null,msgTruth:null,
  msgVerb:{verbKind:'audience',verbIssuer:P(issuer),verbPost:POST('a_army'),verbTo:null,verbMode:null,verbAmount:null,verbRank:null,verbSubject:null,verbIssuedDay:1,verbCounters:[['adjust',null,300,null,null]]}};
}
it('projects the principal’s exact current allowance, spending and refill without changing State',()=>{
 const start=createState(world,{seed:1}), rules=world.rules.people.attention, state=spendAttention(start,seat,2), hash=JSON.stringify(state);
 const budget=viewFor(world,state,seat).attentionBudget;
 expect(budget).toEqual({allowance:rules.cap,spent:2,left:rules.cap-2,refilledDay:0,nextRefillDay:rules.refillDays});
 expect(JSON.stringify(state)).toBe(hash);
 const refilled=refillAttention(state,rules,rules.refillDays).state;
 expect(viewFor(world,refilled,seat).attentionBudget).toMatchObject({spent:0,left:rules.cap,nextRefillDay:rules.refillDays*2});
 expect(viewFor(world,state,seatIdFor(P('a_gen'))).attentionBudget).toBeNull();
});
it('projects received audience requests, own invitations and filed answers without private cases or transit timing',()=>{
 let state:State={...createState(world,{seed:1}),stateDay:2,messagesInTransit:[invitation()]};
 state=receipt(state,'m.request','request');
 let view=viewFor(world,state,seat);
 expect(view.audiences).toEqual([
  {id:'m.invitation',status:'granted',person:'a_gen',post:'a_army',day:1,source:null,answers:null,counters:[{kind:'adjust',value:null,boldness:300,from:null,men:null}],declared:null},
  {id:'m.request',status:'requested',person:'a_gen',post:'a_army',day:2,source:'m.request',answers:null,counters:[],declared:null},
 ]);
 state=receipt(state,'m.answer','comply');
 view=viewFor(world,state,seat);
 expect(view.audiences?.find(a=>a.id==='m.answer')).toMatchObject({status:'filed',declared:'comply',source:'m.answer'});
 expect(viewFor(world,{...state,messagesInTransit:[invitation('b_lead')]},seat).audiences?.some(a=>a.status==='granted')).toBe(false);
 expect(JSON.stringify(view.audiences)).not.toContain('msgArriveDay');
 expect(Object.isFrozen(view.audiences?.[0]?.counters)).toBe(true);
});
it('ignores future audience correspondence until receipt and never labels a failed audience as held',()=>{
 const start:State={...createState(world,{seed:1}),stateDay:2}, cache=createViewCache();
 const future=receipt(start,'m.future','request',1,2,3);
 expect(viewFor(world,future,seat,cache).audiences).toEqual([]);
 expect(viewFor(world,{...future,stateDay:3},seat,cache).audiences).toHaveLength(1);
 expect(viewFor(world,receipt(start,'m.failed','bad_counters',0),seat).audiences?.[0]).toMatchObject({status:'declined',declared:'bad_counters'});
});
it('keeps all four desk projections unchanged across different hidden truth, using fresh and shared caches',()=>{
 const state:State={...createState(world,{seed:1}),stateDay:2,messagesInTransit:[invitation()]};
 const hidden:State={...state,personTrue:{...state.personTrue,[P('a_gen')]:state.personTrue[P('a_lead')]!},personGrievances:{},personRegard:{},personPromises:{},audienceHeld:{},orderResponses:{},battleRecords:{},reportTruth:{},personService:{},
  postStates:{...state.postStates,[POST('a_army')]:{...state.postStates[POST('a_army')]!,postHolder:null}},departmentFactions:{...state.departmentFactions,[toId('department','a_war')]:F('b')},
  congressLedger:[{ledgerAct:'secret',ledgerSide:F('a'),ledgerDay:1,ledgerSituation:null,ledgerOption:null,ledgerMetDay:1,ledgerAnsweredDay:2}]};
 for(const cache of [undefined,createViewCache()]){
  const before=viewFor(world,state,seat,cache),after=viewFor(world,hidden,seat,cache);
  expect(after.attentionBudget).toEqual(before.attentionBudget);
  expect(after.congress).toEqual(before.congress);
  expect(after.audiences).toEqual(before.audiences);
 }
 expect(viewFor(world,state,seat).congress).toEqual({chambers:[],sessions:[],ledger:[]});
});
it('shows public chambers and sessions, but only ledger acts the principal took or received as notices',()=>{
 const id=toId('situation','public_act');
 const effect={propose:{owner:'politics',field:'ledger-act',subject:'public_act',side:F('a'),delta:1,reason:'fixture'}};
 const def:SituationDef={id,kind:'notice',faction:F('a'),title:'title',text:'text',earliest:'1900-06-01',event:{dayAtLeast:1},knowledge:null,railroad:'fixture',chain:null,subjects:[],options:[],inaction:null,historicalDefault:null,staffLine:null,delegableTo:[],resurfaceOn:[],effects:[effect],report:{authors:[POST('a_office')],reportType:'wire-dispatch',subtype:null},gate:{none:'fixture'},gateReview:null,citations:[]};
 const map=world.map.world;
 const w=indexSeatsWorld(indexWorld({...map,rules:{...map.rules,politics:{...map.rules.politics,chambers:[{id:'a_house',name:'house',faction:F('a'),cite:'fixture'}],sessions:[{id:'regular',chambers:['a_house'],callable:false,opens:'1900-06-02',closes:'1900-06-09',afterCallDays:null,sitsDays:null,cite:'fixture'}]}}}),world.start,{situations:[def]});
 let state:State={...createState(w,{seed:1}),stateDay:2,congressLedger:[{ledgerAct:'public_act',ledgerSide:F('a'),ledgerDay:1,ledgerSituation:id,ledgerOption:null,ledgerMetDay:1,ledgerAnsweredDay:2}]};
 state=surfaceSituation(fireSituation(state,id,1,'notice',[]),id,1,P('a_sec'));
 expect(viewFor(w,state,seat).congress?.ledger).toEqual([]);
 const known=deliverReport(state,seat,{id:'m.act' as MessageId,knownReceivedDay:2,knownRoute:'courier',knownVia:[],knownBody:{reportType:'wire-dispatch',reportSubtype:null,reportAuthor:P('a_sec'),reportAuthorPost:POST('a_office'),reportSubjectKind:'situation',reportSubjectId:id,reportClaims:[],reportDay:1,reportHour:null,reportAdvice:null,reportAnswers:null}},NO_TRUTH);
 const congress=viewFor(w,known,seat).congress!;
 expect(congress.chambers).toMatchObject([{id:'a_house',name:'house'}]);
 expect(congress.sessions).toMatchObject([{id:'regular',opens:'1900-06-02'}]);
 expect(congress.ledger).toEqual([{act:'public_act',day:1,situation:id,option:null,metDay:1,answeredDay:null,source:'m.act'}]);
 // A hidden ratification day does not certify that Congress answered the known act.
 expect(viewFor(w,{...known,congressLedger:known.congressLedger.map(e=>({...e,ledgerAnsweredDay:null}))},seat).congress).toEqual(congress);
 const decision:SituationDef={...def,kind:'decision',report:null,effects:[],inaction:{text:'inaction',effects:[],policy:null},historicalDefault:{options:['take']},staffLine:{authors:[POST('a_office')],recommends:['take'],reasons:[],confidence:700},options:[{id:'take',label:'take',displayKey:1,proposedBy:[P('a_sec')],group:null,appearsWhen:null,expiresWhen:null,waitsOn:null,effects:[effect],lockedCosts:[],orders:[],calls:[],policy:null,honours:[],watched:false,gate:null}]};
 const dw=indexSeatsWorld(w.map,w.start,{situations:[decision]});
 const own=recordDecision(surfaceSituation(fireSituation({...state,situationStates:{}},id,1,'decision',['take']),id,1,P('a_sec')),id,2,['take'],'principal',null);
 expect(viewFor(dw,{...own,congressLedger:own.congressLedger.map(e=>({...e,ledgerOption:'take'}))},seat).congress?.ledger).toHaveLength(1);
});
it('projects the latest dated public chamber composition, never a future table or political support',()=>{
 const map=world.map.world;
 const w=indexSeatsWorld(indexWorld({...map,rules:{...map.rules,politics:{...map.rules.politics,chambers:[{id:'a_house',name:'house',faction:F('a'),cite:'fixture',composition:[
  {on:'1900-06-01',groups:[{name:'party.one',seats:7},{name:'party.two',seats:3}],cite:'fixture p1'},
  {on:'1900-06-05',groups:[{name:'party.one',seats:6},{name:'party.two',seats:4}],cite:'fixture p2'},
 ]}]}}}),world.start);
 const state=createState(w,{seed:1});
 expect(viewFor(w,state,seat).congress?.chambers[0]?.composition).toEqual({on:'1900-06-01',groups:[{name:'party.one',seats:7},{name:'party.two',seats:3}],cite:'fixture p1'});
 expect(viewFor(w,{...state,stateDay:4,blocSupport:{}},seat).congress?.chambers[0]?.composition?.on).toBe('1900-06-05');
});
