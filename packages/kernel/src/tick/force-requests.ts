/** Logged choice coordinator. No dispatch is an arrival, and no answer is an automatic grant. */
import { governorHoldings } from '../command/allocation.ts';
import { commandedBlocks, factionOfPost } from '../command/command.ts';
import { putForceRequest, assignmentPacket, FORCE_MODES_UNAVAILABLE, reserveUndeterminedRetention } from '../command/force-requests.ts';
import type { ForceAnswer, ForceAction } from '../command/force-requests.ts';
import { forceAnswer, governorForNeed, governorRequestAuthority, subordinateOrderForNeed } from '../seats/force-requests.ts';
import type { ForceOption } from '../seats/force-requests.ts';
import { seatIdFor } from '../seats/seats.ts';
import { recordResponse, responseOf } from '../proxy/responses.ts';
import { answerOrder, verbDirective } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import type { PersonId, PostId } from '../ids.ts';
import { reportQualificationOf } from '../knowledge/report.ts';
import type { ReportType } from '../knowledge/report.ts';
import { answerBody, dispatchOrder } from './orders.ts';
import { sendReport } from './context.ts';
import type { TickContext } from './context.ts';

/** Muster notices and periodic returns put the governor's own report on ordinary routes. */
export function reportGovernorHoldings(ctx:TickContext,state:State,post:PostId,type:ReportType,callers:readonly PersonId[]=[]):void {
 const office=state.postStates[post];
 if(office?.postHolder==null || !ctx.world.map.world.rules.recruitment.raisingPostKinds.includes(office.postKind))return;
 if(!commandedBlocks(state,post).some(b=>state.forceBlockStates[b]?.fbLots.some(l=>l.lotService!==null || l.lotRegiment!==null)))return;
 const side=factionOfPost(ctx.world.map,state,post);
 const parent=office.postParent===null?null:state.postStates[office.postParent]?.postHolder;
 const principal=side===null?null:ctx.world.start.factions.find(f=>f.faction===side)?.principal;
 const to=[...new Set([...callers,parent,principal])].filter((p):p is PersonId=>p!=null && p!==office.postHolder);
 if(!to.length)return;
 const body={reportType:type,reportSubtype:null,reportAuthor:office.postHolder,reportAuthorPost:post,reportSubjectKind:'post' as const,reportSubjectId:post,
   reportDay:ctx.day,reportHour:null,reportAdvice:null,reportAnswers:null,reportClaims:[],reportGovernorLots:governorHoldings(state,post,ctx.day)};
 for(const recipient of to)sendReport(ctx,state,{body,truth:{truthTerms:[],truthTrimmed:[]},to:recipient,tag:`governor-holdings.${post}`});
}

export function executeForceOption(ctx:TickContext,start:State,person:PersonId,option:ForceOption):State {
 const need=option.need;
 if(start.postStates[need.needPost]?.postHolder!==need.needPerson || start.planRecords[need.needPost]?.planOrder!==need.needMission)return start;
 if(option.kind==='force-request') {
  const recipient=start.postStates[option.to]?.postHolder;
  if(recipient==null)return start;
  const body={...answerBody(person,need.needPost,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers:need.needMission,about:need.needPost,
    reportClaims:[{claimKind:'allocation-shortfall' as const,claimRegion:need.needDestination,claimValue:need.needQuantity,claimToken:need.needReason,claimConfidence:1000}]}),reportForceNeed:need};
  const id=sendReport(ctx,start,{body,truth:{truthTerms:[],truthTrimmed:[]},to:recipient,tag:option.id});
  // The request ID is the report's original content key, preserved through relays.
  const sent=ctx.outbox.find(m=>m.msgOrigin===id)!;
  ctx.outbox[ctx.outbox.indexOf(sent)]={...sent,msgReport:{...body,reportForceRequest:id}};
  return putForceRequest(start,{freqId:id,freqNeed:need,freqDay:ctx.day,freqTo:option.to,freqAnswers:[]});
 }
 const row=start.forceRequests?.[option.request];
 if(!row || row.freqAnswers.some(a=>a.fansPost===option.post))return start;
 const judgement=forceAnswer(ctx.world,start,person,option.post,need,row.freqId,ctx.day,option.modeAuthority);
 const reading=answerOrder(ctx.world,start,person,option.issuer,verbDirective(ctx.world.rules.people,'transfer'));
 const governorAnswer=judgement.paper.voluntary===true;
 const delays=governorAnswer && (reading.actual==='slow_walk' || reading.conditions.length>0);
 const accepts=!delays && reading.undertaking!==null && reading.actual!=='reinterpret' && reading.conditions.length===0 && ['destination','detail'].every(c=>reading.undertaking!.clauses.includes(c));
 const undertaking=accepts?judgement.selection:null;
 const answer=undertaking!==null&&judgement.retention?.reason==='retention_comparison_undetermined'?reserveUndeterminedRetention(reading):reading;
 let state=recordResponse(start,responseOf(answer,{order:row.freqId,person,post:option.post,role:'addressee',day:ctx.day,kind:'allocation'}));
 const parent=state.postStates[option.post]?.postParent, up=parent==null?null:state.postStates[parent]?.postHolder;
 const subordinate=!governorAnswer && accepts && undertaking===null ? subordinateOrderForNeed(ctx.world,state,person,option.post,row,ctx.day):undefined;
 const search=!governorAnswer && accepts && undertaking===null && subordinate===undefined ? governorForNeed(ctx.world,state,person,option.post,row,ctx.day):undefined;
 const governor=search?.governor;
 const proposed=subordinate?.paper??(undertaking===null?undefined:judgement.paper);
 const missingSendingModes=proposed!==undefined&&!proposed.modes?.length;
 const modesUnavailable=missingSendingModes||governorAnswer&&!option.modeAuthority?.[1].length;
 const action:ForceAction=missingSendingModes?'defer':undertaking?(governorAnswer?'offer':undertaking.shortfall>0?'partial':'grant'):
   delays?'defer':!accepts?'refuse':subordinate?'order_subordinate':governor?'ask_governor':!governorAnswer&&up!=null?'relay':
   judgement.reasons.some(r=>r==='no_eligible_force' || r==='scope_unavailable')?'no_eligible_force':'defer';
 const forward=action==='order_subordinate'?subordinate?.paper.from:action==='ask_governor'?governor?.post:action==='relay'?parent:undefined;
 const evidence=subordinate?.evidence??governor?.evidence;
 const sending=modesUnavailable?undefined:proposed;
 const modeAuthority=action==='ask_governor'?governorRequestAuthority(ctx.world,state,person,option.post,need,ctx.day):
   action==='offer'?option.modeAuthority:undefined;
 const record:ForceAnswer={fansDay:ctx.day,fansPerson:person,fansPost:option.post,fansIssuer:option.issuer,fansAction:action,
  ...(forward==null?{}:{fansTo:forward}),...(evidence===undefined?{}:{fansEvidence:evidence}),
  fansReasons:[`compliance:${answer.actual}`,...judgement.reasons,...(subordinate!==undefined?['subordinate_holdings_reported']:search===undefined?[]:[search.reason]),
    ...(modesUnavailable?[FORCE_MODES_UNAVAILABLE]:[])],fansScore:[judgement.scores.retain,judgement.scores.after,judgement.scores.support],
  ...(judgement.retention===undefined?{}:{fansRetention:judgement.retention.shortfalls}),
  ...(sending===undefined?{}:{fansAssignment:assignmentPacket(sending)}),
  ...(modeAuthority===undefined?{}:{fansModeAuthority:modeAuthority})};
 state=putForceRequest(state,{...row,freqAnswers:[...row.freqAnswers,record]});
 sendReport(ctx,state,{body:answerBody(person,option.post,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers:row.freqId,about:need.needPost,
  ...reportQualificationOf(answer),
  reportClaims:[{claimKind:'allocation-selected',claimRegion:need.needDestination,claimValue:sending===undefined?0:undertaking?.lots.length??0,claimToken:`force:${action}`,claimConfidence:1000},
    ...(modesUnavailable?[{claimKind:'allocation-shortfall' as const,claimRegion:need.needDestination,claimValue:need.needQuantity,claimToken:FORCE_MODES_UNAVAILABLE,claimConfidence:1000}]:[])]}),truth:{truthTerms:[],truthTrimmed:[]},to:need.needPerson,tag:`force-answer.${row.freqId}`});
 if(action==='ask_governor')sendReport(ctx,state,{body:{...answerBody(person,option.post,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers:row.freqId,about:need.needPost,reportClaims:[]}),reportForceNeed:need,reportForceRequest:row.freqId,reportForceModeAuthority:modeAuthority??null},truth:{truthTerms:[],truthTrimmed:[]},to:governor!.holder!,tag:`force-governor.${row.freqId}`});
 if(action==='relay')sendReport(ctx,state,{body:{...answerBody(person,option.post,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers:row.freqId,about:need.needPost,reportClaims:[]}),reportForceNeed:need,reportForceRequest:row.freqId},truth:{truthTerms:[],truthTrimmed:[]},to:up!,tag:`force-relay.${row.freqId}`});
 if(sending!==undefined)dispatchOrder(ctx,state,seatIdFor(person),person,sending.from,'courier',false,{orderKind:'allocation',orderAllocation:sending.id,orderLetter:sending.letter,orderGoal:null,orderEdit:null,orderCall:null});
 return state;
}
