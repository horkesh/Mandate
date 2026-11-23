import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { deliverReport, knowledgeOf, pruneKnowledge, unansweredAppointments } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import type { State } from '../src/root-state.ts';
import type { VerbCommand } from '../src/log/commands.ts';
import { applyVerb, arriveVerb } from '../src/tick/verbs.ts';
import { issueCall } from '../src/tick/recruitment.ts';
import { issueOrder } from '../src/tick/orders.ts';
import { senderFor } from '../src/seats/sender.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { R } from './support/seats-fixture.ts';
import { sendMessages } from '../src/messages/transit.ts';
import { deliverDue } from '../src/tick/deliver.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { fresh, report, claim } from './support/s25-fixture.ts';
import { F, P, POST } from './support/seats-fixture.ts';
import { ctxFor as makeContext } from './support/tick-context.ts';
import { TICK_MECHANICS } from '../src/tick/tick.ts';
import { MAP_MECHANICS } from '../src/tick/map.ts';
const ctxFor: typeof makeContext = (world,state,day) => makeContext(world,state,day,[...TICK_MECHANICS,...MAP_MECHANICS]);
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { createState } from '../src/tick/setup.ts';
import { order } from './support/test-seats.ts';

const letters: VerbCommand[] = [
  { cmd: 'inquire', to: POST('a_army'), subject: null, route: 'courier' },
  { cmd: 'relieve', post: POST('a_army'), mode: 'outright', to: null, route: 'courier' },
  { cmd: 'transfer', from: POST('a_army'), to: POST('a_reserve'), force: 'blocks', amount: 1, route: 'courier' },
];

it('reuses the current received view when sending, including after a new report or same-day reassignment', () => {
  const { world, state: opening, seat } = fresh();
  const state = { ...opening, stateDay: 10 };
  const cache = createViewCache();
  const warm = viewFor(world, state, seat, cache);
  expect(senderFor(world, state, seat, undefined, cache)?.view.reports).toBe(warm.reports);

  const heard = deliverReport(state, seat, report('m.received.loss', {
    reportDay: 9,
    reportSubjectKind: 'post',
    reportSubjectId: POST('a_army'),
    reportClaims: [claim('commander-lost', 1, 'captured')],
  }, 10), NO_TRUTH);
  const office = POST('a_office');
  const reassigned = {
    ...heard,
    postStates: { ...heard.postStates, [office]: { ...heard.postStates[office]!, postHolder: P('a_lead') } },
  };
  for (const current of [heard, reassigned, { ...state, stateDay: 8 }, heard, state]) {
    const reused = senderFor(world, current, seat, undefined, cache)!;
    const rebuilt = senderFor(world, current, seat)!;
    expect(reused.view).toEqual(rebuilt.view);
    expect(reused.chain(POST('a_army'))).toEqual(rebuilt.chain(POST('a_army')));
  }
});

it.each(letters)('S65: $cmd sends to the received holder despite hidden vacancy, replacement or side', command => {
  const { world, state: opening, seat } = fresh();
  const state = { ...opening, stateDay: 10 };
  for (const hidden of [
    { ...state, postStates: { ...state.postStates, [POST('a_army')]: { ...state.postStates[POST('a_army')]!, postHolder: null } } },
    { ...state, postStates: { ...state.postStates, [POST('a_army')]: { ...state.postStates[POST('a_army')]!, postHolder: P('a_spy') } } },
    { ...state, departmentFactions: { ...state.departmentFactions, [toId('department','a_war')]: F('b') } },
  ]) {
    const ctx = ctxFor(world, hidden, 11);
    expect(applyVerb(ctx, hidden, seat, command).reason).toBeNull();
    expect(ctx.outbox).toHaveLength(1);
    expect(ctx.outbox[0]!.msgTo).toBe(P('a_gen'));
  }
});
it('S65: a field goal is sent against belief and is returned only on arrival at a secretly vacant post', () => {
  const { world, state: opening, seat } = fresh();
  const state: State = { ...opening, stateDay: 10, postStates: { ...opening.postStates, [POST('a_army')]: { ...opening.postStates[POST('a_army')]!, postHolder: null } } };
  const ctx = ctxFor(world, state, 11);
  expect(issueOrder(ctx, state, seat, {...order('a_army','advance','b_front'),bypass:true})).toBeNull();
  const letter = ctx.outbox.splice(0)[0]!;
  expect(letter.msgTo).toBe(P('a_gen'));
  const next = deliverDue(ctxFor(world, state, letter.msgArriveDay), sendMessages(state, [letter]));
  expect(next.planRecords[POST('a_army')]).toBeUndefined();
  expect(knowledgeOf(next, seat).knownReports.some(r => r.knownBody.reportAnswers === letter.msgOrigin)).toBe(false);
  expect(next.messagesInTransit.some(m => m.msgReport?.reportAnswers === letter.msgOrigin && m.msgReport.reportClaims.some(c => c.claimKind === 'order-returned' && c.claimToken === 'vacant_post'))).toBe(true);
});
it.each(['held','gone','other_side'] as const)('S65: an appointment is dispatched from known vacancy; %s is a destination refusal', kind => {
  const { world, state: opening, seat } = fresh();
  const known = deliverReport({ ...opening, stateDay: 10 }, seat, report('m.vacancy', { reportAuthor: P('a_sec'), reportSubjectKind: 'post', reportSubjectId: 'a_army', reportDay: 5, reportClaims: [claim('commander-lost',1,'captured')] },10), NO_TRUTH);
  const state: State = { ...known, postStates: { ...known.postStates, [POST('a_army')]: { ...known.postStates[POST('a_army')]!, postHolder: kind === 'held' ? P('a_gen') : null } },
    ...(kind === 'gone' ? { personStatus: { ...known.personStatus, [P('a_spy')]: { statusKind: 'killed' as const, statusDay: 6 } } } : {}),
    ...(kind === 'other_side' ? { personService: { ...known.personService, [P('a_spy')]: { serviceFaction: F('b'), serviceBloc: null, serviceChoice: 'resign' as const, serviceDay: 6 } } } : {}),
  };
  const ctx = ctxFor(world, state, 11);
  expect(applyVerb(ctx, state, seat, { cmd:'appoint', post:POST('a_army'), person:P('a_spy'), rank:null, route:'courier' }).reason).toBeNull();
  const letter=ctx.outbox.splice(0)[0]!;
  const arrived=ctxFor(world,state,letter.msgArriveDay);
  const next=arriveVerb(arrived,state,letter);
  expect(next.postStates[POST('a_army')]!.postHolder).toBe(state.postStates[POST('a_army')]!.postHolder);
  expect(arrived.outbox.some(m=>m.msgReport?.reportAnswers===letter.msgOrigin && m.msgReport.reportClaims.some(c=>c.claimKind==='appointment-refused' && c.claimToken===(kind==='held'?'post_held':kind==='gone'?'not_serving':'other_side')))).toBe(true);
});
it('S65: the sender retains an unanswered appointment after the outgoing letter leaves transit, including save/resume', () => {
  const { world, state: opening, seat } = fresh();
  const state=deliverReport({ ...opening, stateDay:10, postStates:{...opening.postStates,[POST('a_army')]:{...opening.postStates[POST('a_army')]!,postHolder:null}} },seat,report('m.loss',{reportAuthor:P('a_sec'),reportSubjectKind:'post',reportSubjectId:'a_army',reportDay:5,reportClaims:[claim('commander-lost',1,'captured')]},10),NO_TRUTH);
  const ctx=ctxFor(world,state,11);
  expect(applyVerb(ctx,state,seat,{cmd:'appoint',post:POST('a_army'),person:P('a_spy'),rank:null,route:'courier'}).reason).toBeNull();
  const letter=ctx.outbox.splice(0)[0]!;
  const posted=sendMessages(state,[letter]);
  const outOfTransit: State=JSON.parse(JSON.stringify({...posted,messagesInTransit:[]}));
  const offered=(s:State)=>principalMenu(world,s,F('a'),morningGround(world,s,s.stateDay+1)).vacancies.find(v=>v.post===POST('a_army'));
  expect(offered(outOfTransit)?.appointing).toBe(true);
  const answer=report('m.answer',{reportAuthor:P('a_spy'),reportSubjectKind:'post',reportSubjectId:'a_army',reportDay:10,reportAnswers:letter.msgOrigin,reportClaims:[claim('appointment-refused',0,'post_held')]},10);
  expect(offered(deliverReport(outOfTransit,seat,answer,NO_TRUTH))).toBeUndefined();
  expect(principalMenu(world,outOfTransit,F('a'),morningGround(world,outOfTransit,11)).candidates.some(c=>c.person===P('a_spy'))).toBe(false);
});

it('S65: a known governor still receives a call despite a hidden vacancy or side change', () => {
  const {world:base,seat}=fresh();
  const map=indexWorld({...base.map.world,rules:{...base.map.world.rules,recruitment:{...base.map.world.rules.recruitment,raisingPostKinds:[base.start.posts.find(p=>p.id===POST('a_army'))!.kind]}}});
  const world=indexSeatsWorld(map,base.start);
  const state={...createState(world,{seed:17}),stateDay:10};
  const target=principalMenu(world,state,F('a'),morningGround(world,state,11)).raising[0]!;
  expect(target).toBeDefined();
  for (const hidden of [state,
    {...state,postStates:{...state.postStates,[target.post]:{...state.postStates[target.post]!,postHolder:null}}},
    {...state,departmentFactions:{...state.departmentFactions,[state.postStates[target.post]!.postDepartment]:F('b')}},
  ]) {
    const ctx=ctxFor(world,hidden,11);
    expect(issueCall(ctx,hidden,seat,{cmd:'call',to:target.post,regiments:1,termDays:null,route:'courier',bypass:true})).toBeNull();
    expect(ctx.outbox[0]!.msgTo).toBe(target.holder);
  }
});
it.each(['gone','other_side','service','deleted'] as const)('S65: a goal accepted against belief returns an explained %s destination failure', kind => {
  const {world,state:opening,seat}=fresh();
  const { [POST('a_army')]:_gone,...posts}=opening.postStates;
  const state:State={...opening,stateDay:10,
    ...(kind==='deleted'?{postStates:posts}:{}),
    ...(kind==='gone'?{personStatus:{...opening.personStatus,[P('a_gen')]:{statusKind:'captured',statusDay:5}}}:{}),
    ...(kind==='service'?{personService:{...opening.personService,[P('a_gen')]:{serviceFaction:F('b'),serviceBloc:null,serviceChoice:'resign',serviceDay:5}}}:{}),
    ...(kind==='other_side'?{departmentFactions:{...opening.departmentFactions,[opening.postStates[POST('a_army')]!.postDepartment]:F('b')}}:{}),
  };
  const ctx=ctxFor(world,state,11);
  expect(issueOrder(ctx,state,seat,{...order('a_army','advance','b_front'),bypass:true})).toBeNull();
  const letter=ctx.outbox.splice(0)[0]!;
  const arrival=ctxFor(world,state,letter.msgArriveDay);
  const next=deliverDue(arrival,sendMessages(state,[letter]));
  expect(next.planRecords[POST('a_army')]).toBeUndefined();
  const papers=[...next.messagesInTransit.map(m=>m.msgReport),...knowledgeOf(next,seat).knownReports.map(r=>r.knownBody)];
  expect(papers.some(p=>p?.reportAnswers===letter.msgOrigin && p.reportClaims.some(c=>c.claimKind==='order-returned' && c.claimToken===(kind==='gone'?'not_serving':kind==='deleted'?'vacant_post':'other_side')))).toBe(true);
});

it('S65: only a received answer closes an appointment, and pruning cannot resurrect it', () => {
  const {world,state:opening,seat}=fresh();
  const state=deliverReport({...opening,stateDay:10,postStates:{...opening.postStates,[POST('a_army')]:{...opening.postStates[POST('a_army')]!,postHolder:null}}},seat,report('m.loss.pending',{reportAuthor:P('a_sec'),reportSubjectKind:'post',reportSubjectId:'a_army',reportDay:5,reportClaims:[claim('commander-lost',1,'captured')]},10),NO_TRUTH);
  const cmd:VerbCommand={cmd:'appoint',post:POST('a_army'),person:P('a_spy'),rank:null,route:'courier'};
  const ctx=ctxFor(world,state,11);
  expect(applyVerb(ctx,state,seat,cmd).reason).toBeNull();
  expect(applyVerb(ctx,state,seat,cmd).reason).toBe('appointment_pending');
  const letter=ctx.outbox[0]!;
  const posted={...sendMessages(state,[letter]),messagesInTransit:[]};
  expect(applyVerb(ctxFor(world,posted,11),posted,seat,cmd).reason).toBe('appointment_pending');
  const early=deliverReport(posted,seat,report('m.future.answer',{reportAuthor:P('a_spy'),reportAnswers:letter.msgOrigin,reportDay:11},12),NO_TRUTH);
  expect(unansweredAppointments(early,P('a_lead'))).toHaveLength(1);
  expect(unansweredAppointments({...early,stateDay:11},P('a_lead'))).toHaveLength(1);
  expect(unansweredAppointments({...early,stateDay:12},P('a_lead'))).toHaveLength(0);
  const closed=pruneKnowledge({...early,stateDay:100},world.rules.templates,100,1000).state;
  expect(knowledgeOf(closed,seat).knownSentAppointments).toBeUndefined();
  expect(unansweredAppointments({...closed,knowledgeBySeat:{...closed.knowledgeBySeat,[seat]:{...knowledgeOf(closed,seat),knownReports:[]}}},P('a_lead'))).toHaveLength(0);
});
it('S65: own goal terms, rather than a hidden plan status, govern whether a go can be dispatched', () => {
  const {world,state:opening,seat}=fresh();
  const ctx=ctxFor(world,opening,1);
  const cmd={...order('a_army','advance','b_front'),bypass:true};
  expect(issueOrder(ctx,opening,seat,{...cmd,goal:{...cmd.goal,awaitWord:true}})).toBeNull();
  const sent={...sendMessages(opening,ctx.outbox.splice(0)),stateDay:2};
  const go={cmd:'go' as const,to:POST('a_army'),route:'courier' as const,bypass:true};
  // No plan exists yet: the principal nevertheless knows what word his own order reserved.
  expect(issueOrder(ctxFor(world,sent,3),sent,seat,go)).toBeNull();
  expect(issueOrder(ctxFor(world,opening,1),opening,seat,go)).toBe('no_plan');
});

it('S65: a received promise permits asking a neutral governor for these troops, without changing known government allegiance', () => {
  const {world:base,seat}=fresh();
  const dept=toId('department','neutral');
  const gov=POST('neutral_gov');
  const pattern=base.start.posts.find(p=>p.id===POST('a_army'))!;
  const map=indexWorld({...base.map.world,rules:{...base.map.world.rules,recruitment:{...base.map.world.rules.recruitment,raisingPostKinds:[pattern.kind]}},departments:[...base.map.world.departments,{...base.map.world.departments[0]!,id:dept,faction:null}],people:base.map.world.people.map(p=>p.id===P('a_spy')?{...p,faction:null}:p)});
  const world=indexSeatsWorld(map,{...base.start,posts:[...base.start.posts.map(p=>({...p,intelligenceChief:null})),{...pattern,id:gov,holder:P('a_spy'),department:dept,parent:null,intelligenceChief:null}]});
  const opening={...createState(world,{seed:17}),stateDay:10};
  // The government's named requisition may be sent to an unknown office, without a guessed recipient.
  const call={cmd:'call' as const,to:gov,regiments:2,termDays:null,route:'courier' as const,bypass:true};
  for (const hidden of [opening,{...opening,postStates:{...opening.postStates,[gov]:{...opening.postStates[gov]!,postHolder:null}}}]) {
    const ctx=ctxFor(world,hidden,11);
    expect(issueCall(ctx,hidden,seat,call,true)).toBeNull();
    expect(ctx.outbox[0]!.msgTo).toBe(P('a_lead'));
    expect(ctx.outbox[0]!.msgOfficeAddress).toBe(true);
    const letter=ctx.outbox.splice(0)[0]!;
    const arrived=deliverDue(ctxFor(world,hidden,letter.msgArriveDay),sendMessages(hidden,[letter]));
    const reply=arrived.messagesInTransit.find(m=>m.msgReport?.reportAnswers===letter.msgOrigin);
    expect(reply?.msgReport?.reportClaims.some(c=>c.claimKind===(hidden.postStates[gov]!.postHolder===null?'order-returned':'call-answer'))).toBe(true);

    expect(principalMenu(world,hidden,F('a'),morningGround(world,hidden,11)).raising.some(p=>p.post===gov)).toBe(false);
  }
  const command:VerbCommand={cmd:'transfer',from:gov,to:POST('a_reserve'),force:'blocks',amount:999,route:'courier'};
  expect(applyVerb(ctxFor(world,opening,11),opening,seat,command).reason).toBe('unknown_post');
  const receipt=report('m.promise',{reportAuthor:P('a_spy'),reportAuthorPost:gov,reportSubjectKind:'post',reportSubjectId:gov,reportAnswers:toId('message','m.2.a_lead.a_spy.call.neutral_gov'),reportDay:5,reportClaims:[claim('call-answer',2,'comply')]},10);
  const known=deliverReport(opening,seat,receipt,NO_TRUTH);
  for (const hidden of [known,{...known,departmentFactions:{...known.departmentFactions,[dept]:F('a')}},{...known,departmentFactions:{...known.departmentFactions,[dept]:F('b')}}]) {
    const ctx=ctxFor(world,hidden,11);
    expect(applyVerb(ctx,hidden,seat,command).reason).toBeNull();
    expect(ctx.outbox[0]!.msgTo).toBe(P('a_spy'));
  }
});

it('S65: a known own goal permits an audience letter despite a hidden absent plan; the failure is answered on arrival', () => {
  const {world,state:opening,seat}=fresh();
  const ctx=ctxFor(world,opening,1);
  expect(issueOrder(ctx,opening,seat,{...order('a_army','hold',null),bypass:true})).toBeNull();
  const known={...sendMessages(opening,ctx.outbox.splice(0)),stateDay:2,messagesInTransit:[]};
  const sender=ctxFor(world,known,3);
  expect(applyVerb(sender,known,seat,{cmd:'audience',to:POST('a_army'),counters:[]}).reason).toBeNull();
  const letter=sender.outbox[0]!;
  const arrival=ctxFor(world,known,letter.msgArriveDay);
  expect(arriveVerb(arrival,known,letter).audienceHeld).toEqual(known.audienceHeld);
  expect(arrival.outbox.some(m=>m.msgReport?.reportClaims.some(c=>c.claimToken==='audience:bad_counters'))).toBe(true);
});

it('S65: accepting an own declared appointment supplies its public parent without borrowing any live chain or holder', () => {
  const {world:base,seat}=fresh();
  const post=POST('new_command');
  const map=indexWorld({...base.map.world,vocabularies:{...base.map.world.vocabularies,postKinds:base.map.world.vocabularies.postKinds.map(k=>k.id==='expedition'?{...k,creatable:'appoint' as const}:k)}});
  const world=indexSeatsWorld(map,{...base.start,temporaryPosts:[{id:post,name:'post.new_command',kind:'expedition',department:toId('department','a_war'),parent:POST('a_office'),holder:null,region:R('a_cap'),operation:'new_operation'}]});
  const opening={...createState(world,{seed:17}),stateDay:5};
  const paper=report('m.new.accepted',{reportAuthor:P('a_spy'),reportAuthorPost:post,reportSubjectKind:'post',reportSubjectId:post,reportDay:4,reportClaims:[claim('verb-answered',1,'appoint:comply')]},5);
  const received=deliverReport(opening,seat,paper,NO_TRUTH);
  expect(senderFor(world,received,seat)!.chain(post)).toEqual([POST('a_office'),post]);
  expect(viewFor(world,received,seat).posts.find(p=>p.post===post)).toMatchObject({parent:'a_office',placementKnown:true,holder:'a_spy'});
  const changed={...received,postStates:{...received.postStates,[post]:{...received.postStates[POST('a_army')]!,postParent:POST('b_office'),postHolder:null}}};
  expect(senderFor(world,changed,seat)!.chain(post)).toEqual(senderFor(world,received,seat)!.chain(post));
  const unaccepted=deliverReport(opening,seat,report('m.new.mentioned',{reportAuthor:P('a_spy'),reportAuthorPost:post,reportSubjectKind:'post',reportSubjectId:post,reportDay:4},5),NO_TRUTH);
  expect(viewFor(world,unaccepted,seat).posts.find(p=>p.post===post)?.placementKnown).toBe(false);
});
it('S65: an institutional held-post refusal cannot fade and resurrect an older vacancy', () => {
  const {world,state:opening,seat}=fresh();
  const vacant=deliverReport({...opening,stateDay:10},seat,report('m.old.vacant',{reportAuthor:P('a_sec'),reportSubjectKind:'post',reportSubjectId:'a_army',reportDay:2,reportClaims:[claim('commander-lost',1,'captured')]},3),NO_TRUTH);
  const known=deliverReport(vacant,seat,report('m.held.refusal',{reportAuthor:P('a_spy'),reportSubjectKind:'post',reportSubjectId:'a_army',reportDay:5,reportClaims:[claim('appointment-refused',0,'post_held')]},6),NO_TRUTH);
  const later=pruneKnowledge({...known,stateDay:100},world.rules.templates,100,1000).state;
  expect(viewFor(world,later,seat).posts.find(p=>p.post===POST('a_army'))?.status).toBe('unknown');
});
