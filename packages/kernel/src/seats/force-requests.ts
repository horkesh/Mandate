/** A request is an offered local choice, derived from the holder's received mission and picture. */
import { activeMandate, currentMandates, inSubtree } from '../command/authority.ts';
import { rootModeAuthority } from '../command/root-modes.ts';
import { allocationAuthority, allocationSelection, legacyLotDeferral, reportedScopeMatches } from '../command/allocation.ts';
import type { ForceNeed, ForceRequest, RetentionShortfalls } from '../command/force-requests.ts';
import { allCommandedBlocks, commandedBlocks, factionOfPost } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import type { ForceBlockId, MessageId, PersonId, PostId } from '../ids.ts';
import { knowledgeOf, type SeatKnowledge } from '../knowledge/knowledge.ts';
import type { ForceRequestModeAuthority } from '../knowledge/force-need.ts';
import { templateFor } from '../knowledge/templates.ts';
import { holdingAxis } from '../planner/axes.ts';
import { makeCtx, type Ctx, type PlannerInput } from '../planner/context.ts';
import { draft } from '../planner/draft.ts';
import { plannerInputFor } from '../planner/input.ts';
import { scoreAxes } from '../planner/score.ts';
import type { PlannerForce } from '../planner/types.ts';
import type { PlanGoal } from '../plans/goal.ts';
import { callEstablishment } from '../recruitment/rules.ts';
import type { State } from '../root-state.ts';
import { canonicalHash } from '../serialize/hash.ts';
import { viewFor } from '../view/view.ts';
import type { AllocationInstrument } from '../world/allocation.ts';
import { localPlanningGround, type LocalPlanningGround } from './planning-ground.ts';
import { headquartersOf } from './posts.ts';
import { seatIdFor } from './seats.ts';
import type { SeatsWorld } from './world.ts';

export type ForceOption =
 {readonly id:string;readonly kind:'force-request';readonly authority:null;readonly to:PostId;readonly need:ForceNeed} |
 {readonly id:string;readonly kind:'force-answer';readonly authority:null;readonly request:MessageId;readonly need:ForceNeed;readonly post:PostId;readonly issuer:PersonId;
  readonly modeAuthority?:ForceRequestModeAuthority};
function inputFor(world:SeatsWorld,state:State,person:PersonId,post:PostId,goal:PlanGoal,day:number,ground:LocalPlanningGround) {
 const view=viewFor(world,state,seatIdFor(person));
 const {derived,network,month}=ground();
 return plannerInputFor(world,state,derived,network,month,view,post,goal,day);
}
function joinedMissionBlocks(world:SeatsWorld,state:State,post:PostId):ForceBlockId[] {
 return allCommandedBlocks(world.map,state,post).filter(b=>{
  const loc=state.forceLocations[b];
  return state.forceJoins[b]===undefined&&loc?.locMarch===null&&loc.locAboard===null&&state.forceBlockStates[b]?.fbSurrenderedDay===null;
 });
}
function receivedMissionOf(state:State,person:PersonId,post:PostId) {
 const mission=state.planRecords[post];
 if(!mission||mission.planProposalPending||mission.planDetentionEnd||mission.planGoal.goalObjective===null)return undefined;
 const response=state.orderResponses[mission.planResponse];
 if(response!==undefined&&response.respPerson!==person||mission.planDraft!==null&&mission.planDraft.draftCommander!==person)return undefined;
 return mission;
}
function missionForces(input:PlannerInput,blocks:readonly ForceBlockId[]):PlannerForce[] {
 const joined=new Set(blocks);
 return input.forces.filter(f=>joined.has(f.id)&&!f.naval);
}
function missionForceScore(ctx:Ctx,post:PostId,own:readonly PlannerForce[]) {
 return scoreAxes(ctx,'holding',[holdingAxis(ctx,post,own,'hold')],[]);
}
export function forceOptions(world:SeatsWorld,state:State,person:PersonId,post:PostId,day:number,ground:LocalPlanningGround=localPlanningGround(world,state,day)):ForceOption[] {
 const out:ForceOption[]=[];
 const knowledge=knowledgeOf(state,seatIdFor(person));
 for(const report of knowledge.knownReports) {
  const need=report.knownBody.reportForceNeed, request=report.knownBody.reportForceRequest;
  if(!need || !request || report.knownReceivedDay>=day)continue;
  const row=state.forceRequests?.[request];
  if(!row || row.freqAnswers.some(a=>a.fansPost===post) || state.postStates[post]?.postHolder!==person)continue;
  // The packet must actually address this superior; other seats cannot use the review ledger as knowledge.
  const author=report.knownBody.reportAuthor;
  const ask=row.freqAnswers.find(a=>a.fansAction==='ask_governor'&&a.fansTo===post&&a.fansPerson===author&&a.fansPost===report.knownBody.reportAuthorPost);
  const addressed=row.freqTo===post && need.needPerson===author || ask!==undefined || row.freqAnswers.some(a=>a.fansPerson===author &&
    a.fansAction==='relay'&&(a.fansTo??state.postStates[a.fansPost]?.postParent)===post);
  const stamped=report.knownBody.reportForceModeAuthority;
  const modeAuthority=ask!==undefined&&ask.fansModeAuthority!==undefined&&stamped!=null&&
    report.knownBody.reportAnswers===request&&canonicalHash(need)===canonicalHash(row.freqNeed)&&canonicalHash(stamped)===canonicalHash(ask.fansModeAuthority)?stamped:undefined;
  if(addressed)out.push({id:`force-answer:${request}:${post}`,kind:'force-answer',authority:null,request,need,post,issuer:author,...(modeAuthority===undefined?{}:{modeAuthority})});
 }
 const parent=state.postStates[post]?.postParent;
 if(parent==null||state.postStates[parent]?.postHolder==null)return out;
 const mission=receivedMissionOf(state,person,post);
 if(mission===undefined)return out;
 const blocks=joinedMissionBlocks(world,state,post);
 const goal={...mission.planGoal,goalCommitted:blocks};
 const input=inputFor(world,state,person,post,goal,day,ground), ctx=makeCtx(input);
 const own=missionForces(input,blocks);
 if(own.some(f=>f.unknownStrength))return out;
 const score=missionForceScore(ctx,post,own);
 const undetermined=score.perceived===null;
 // An unknown enemy permits the empty-command bootstrap only, never a target-force feedback loop.
 if(undetermined?own.length>0:score.shortfall===0)return out;
 const arm=world.map.world.rules.recruitment.arm;
 if(!world.map.world.vocabularies.arms.some(a=>a.id===arm&&!a.naval))return out;
 const establishment=callEstablishment(world.map.world.rules.recruitment,undefined,factionOfPost(world.map,state,post),arm)?.men??world.map.world.rules.recruitment.menPerRegiment??null;
 if(!undetermined && establishment===null)return out;
 const need:ForceNeed={needOrigin:'commander_choice',needMission:mission.planOrder,needPost:post,needPerson:person,
  needTask:goal.goalPurpose?.detKind??goal.goalPosture??'hold',needScope:{kind:'cohort',arm,minTermDays:1},
  needQuantity:undetermined?1:Math.max(1,Math.trunc((score.shortfall+establishment!-1)/establishment!)),
  needShortfall:undetermined?null:score.shortfall,needEstablishment:establishment,needReason:undetermined?'unknown_enemy_bootstrap':'lacks_resources',
  needDestination:headquartersOf(world,state,post),needGoal:goal,
  needEvidence:canonicalHash({mission:mission.planOrder,shortfall:undetermined?null:score.shortfall,blocks:blocks.map(b=>state.forceBlockStates[b]?.fbLots.map(l=>l.lotId)),enemy:score.perceived})};
 const prior=Object.values(state.forceRequests??{}).filter(r=>r.freqNeed.needMission===need.needMission&&r.freqNeed.needTask===need.needTask&&canonicalHash(r.freqNeed.needScope)===canonicalHash(need.needScope));
 // A pending grant stays outstanding until physical receipt or typed cancellation; answers alone are not troops.
 if(prior.some(r=>r.freqNeed.needEvidence===need.needEvidence||requestOutstanding(state,knowledge,r)))return out;
 out.push({id:`force-request:${canonicalHash(need).slice(0,24)}`,kind:'force-request',authority:null,to:parent,need});
 return out.sort((a,b)=>strictCompare(a.id,b.id));
}

function requestOutstanding(state:State,knowledge:SeatKnowledge,request:ForceRequest):boolean {
 const reports=knowledge.knownReports.filter(p=>p.knownBody.reportAnswers===request.freqId);
 const subordinate=request.freqAnswers.find(a=>a.fansAction==='order_subordinate')?.fansAssignment;
 if(subordinate!==undefined)return !reports.some(({knownBody:body})=>{
   if(body.reportClaims.some(c=>c.claimToken==='force:subordinate_received'))return true;
   if(!body.reportClaims.some(c=>c.claimToken==='force:subordinate_declined'))return false;
   // Older saves used the same token for an accepted deferral and a terminal decline.
   const reasons=body.reportClaims.filter(c=>c.claimKind==='allocation-shortfall');
   return !Object.values(state.allocationRecords??{}).some(r=>r.allocPaper===subordinate[0] && r.allocDay===body.reportDay &&
     r.allocSender===body.reportAuthor && body.reportAuthorPost===subordinate[3] && legacyLotDeferral(state,r,reasons.map(c=>c.claimToken)));
 });
 const claims=reports.flatMap(p=>p.knownBody.reportClaims);
 if(!claims.some(c=>c.claimKind==='allocation-selected'&&c.claimToken?.startsWith('force:')))return true;
 if(request.freqAnswers.some(a=>a.fansAction==='relay'||a.fansAction==='ask_governor')&&
   !request.freqAnswers.some(a=>['grant','partial','offer','refuse','defer','no_eligible_force'].includes(a.fansAction)))return true;
 return request.freqAnswers.some(a=>a.fansAssignment!==undefined && !Object.values(state.allocationRecords??{}).some(x=>x.allocPaper===a.fansAssignment![0]&&['received','refused','superseded'].includes(x.allocStatus)));
}

/** An order addresses a known holder in the superior's mandate, carrying only the mission's cohort. */
export function subordinateOrderForNeed(world:SeatsWorld,state:State,person:PersonId,post:PostId,request:ForceRequest,day:number) {
 const {freqNeed:need,freqId:id}=request;
 if(need.needScope.kind!=='cohort')return undefined;
 const mandates=currentMandates(state,post).filter(a=>a.authorityGrant.mandateActions.includes('assign')&&activeMandate(world.map,state,a,day))
   .sort((a,b)=>Number(b.authorityGrant.mandateModes.length>0)-Number(a.authorityGrant.mandateModes.length>0) ||
     strictCompare(a.authorityGrant.mandateKey,b.authorityGrant.mandateKey));
 if(!mandates.length)return undefined;
 const reports=knowledgeOf(state,seatIdFor(person)).knownReports.filter(r=>r.knownBody.reportCommandLots!==undefined && r.knownBody.reportType==='strength-return' &&
   r.knownReceivedDay<day && r.knownBody.reportDay<day && day-r.knownBody.reportDay<=templateFor(world.rules.templates,'strength-return',null).maxAgeDays)
   .sort((a,b)=>b.knownBody.reportDay-a.knownBody.reportDay || b.knownReceivedDay-a.knownReceivedDay || strictCompare(a.id,b.id));
 const seen=new Set<PostId>([post,need.needPost]);
 const candidates=reports.flatMap(r=>{
   const body=r.knownBody, from=body.reportAuthorPost;
   if(from===null || body.reportSubjectKind!=='post' || body.reportSubjectId!==from || seen.has(from))return [];
   seen.add(from);
   const count=body.reportCommandLots!.filter(l=>(l.availEndsDay===null || day<l.availEndsDay)&&reportedScopeMatches(l,need.needScope)).length;
   if(count===0)return [];
   const paperId=`force.${id}.${post}`;
   for(const {authorityGrant:grant} of mandates) {
     const paper:AllocationInstrument={id:paperId,source:'[I] 0134 logged subordinate force order',fromDate:'0001-01-01',kind:'assignment',subordinateOrder:true,
       issuer:person,issuerPost:post,mandate:grant.mandateKey,from,to:need.needPost,destination:need.needDestination,recipient:body.reportAuthor,scope:need.needScope,quantity:need.needQuantity,
       words:`${need.needTask}: ${need.needReason}`,letter:{namespace:'force-choice',key:paperId,revision:1},modes:grant.mandateModes};
     if(allocationAuthority(world,state,paper,day))return [{paper,count,evidence:r.id}];
   }
   return [];
 });
 return candidates.sort((a,b)=>Number(!!b.paper.modes?.length)-Number(!!a.paper.modes?.length)||b.count-a.count||strictCompare(a.paper.from,b.paper.from))[0];
}

/** The addressee's latest received return for each governor is the only basis for seeking that governor's help. */
export function governorForNeed(world:SeatsWorld, state:State, person:PersonId, post:PostId, request:ForceRequest, day:number) {
 const raising=world.map.world.rules.recruitment.raisingPostKinds;
 const offices=new Set([...world.start.posts,...world.start.temporaryPosts].filter(p=>raising.includes(p.kind)).map(p=>p.id));
 const reports=knowledgeOf(state,seatIdFor(person)).knownReports.filter(r=>r.knownBody.reportGovernorLots!==undefined &&
   r.knownReceivedDay<day && r.knownBody.reportDay<day && day-r.knownBody.reportDay<=templateFor(world.rules.templates,r.knownBody.reportType,r.knownBody.reportSubtype).maxAgeDays)
   .sort((a,b)=>b.knownBody.reportDay-a.knownBody.reportDay || (b.knownBody.reportHour??-1)-(a.knownBody.reportHour??-1) || b.knownReceivedDay-a.knownReceivedDay || strictCompare(a.id,b.id));
 const considered=new Set([post,request.freqNeed.needPost,...request.freqAnswers.flatMap(a=>a.fansTo===undefined?[a.fansPost]:[a.fansPost,a.fansTo])]);
 const candidates=reports.flatMap(r=>{
   const body=r.knownBody, office=body.reportAuthorPost;
   if(office===null || body.reportSubjectKind!=='post' || body.reportSubjectId!==office || !offices.has(office) || considered.has(office))return [];
   considered.add(office);
   const quantity=body.reportGovernorLots!.filter(l=>(l.availEndsDay===null || day<l.availEndsDay) && reportedScopeMatches(l,request.freqNeed.needScope)).length;
   return [{post:office,holder:body.reportAuthor,evidence:r.id,quantity}];
 });
 const governor=candidates.filter(c=>c.quantity>0).sort((a,b)=>b.quantity-a.quantity||strictCompare(a.post,b.post))[0];
 return {governor,reason:governor!==undefined?'governor_holdings_reported':candidates.length?'governor_scope_unavailable':'governor_holdings_unknown'} as const;
}

/** The asking office supplies the scope and transport permission for a voluntary sending. */
export function governorRequestAuthority(world:SeatsWorld,state:State,person:PersonId,post:PostId,need:ForceNeed,day:number):ForceRequestModeAuthority|undefined {
 const side=factionOfPost(world.map,state,need.needPost);
 if(side===null||factionOfPost(world.map,state,post)!==side)return undefined;
 if(world.start.factions.some(f=>f.principal===person&&f.faction===side))return rootModeAuthority(world,person);
 const mandate=currentMandates(state,post).filter(a=>{
   const g=a.authorityGrant;
   return activeMandate(world.map,state,a,day) && g.mandateHolder===person &&
     g.mandateActions.includes('assign') && g.mandateModes.length>0 && g.mandateRegions.includes(need.needDestination) &&
     inSubtree(state,need.needPost,post) && g.mandateRecipients.some(r=>inSubtree(state,need.needPost,r));
 }).sort((a,b)=>strictCompare(a.authorityGrant.mandateKey,b.authorityGrant.mandateKey))[0];
 return mandate===undefined?undefined:[mandate.authorityOrigin,mandate.authorityGrant.mandateModes];
}

/** Evaluate support and retention with the superior's own planner; unknown ratios remain unavailable. */
export function forceAnswer(world:SeatsWorld,state:State,person:PersonId,post:PostId,need:ForceNeed,request:MessageId,day:number,modeAuthority?:ForceRequestModeAuthority) {
 const governor=world.map.world.rules.recruitment.raisingPostKinds.includes(state.postStates[post]?.postKind??'');
 const base:AllocationInstrument={id:`force.${request}.${post}`,source:'[I] 0133 logged commander choice; no historical paper',fromDate:'0001-01-01',kind:'assignment',issuer:person,issuerPost:post,mandate:governor?'governor_root':'',...(governor?{voluntary:true as const}:{}),
  from:post,to:need.needPost,destination:need.needDestination,recipient:person,scope:need.needScope,quantity:need.needQuantity,
  words:`${need.needTask}: ${need.needReason}`,letter:{namespace:'force-choice',key:`force.${request}.${post}`,revision:1},modes:governor?modeAuthority?.[1]??[]:[]};
 const papers=governor?[base]:currentMandates(state,post)
   .filter(a=>activeMandate(world.map,state,a,day)&&a.authorityGrant.mandateActions.includes('assign'))
   .map(({authorityGrant:g})=>({...base,mandate:g.mandateKey,modes:g.mandateModes}))
   .sort((a,b)=>Number(b.modes.length>0)-Number(a.modes.length>0)||strictCompare(a.mandate,b.mandate));
 const scoped=papers.filter(p=>allocationAuthority(world,state,p,day));
 const noScores={retain:null,after:null,support:null};
 const unchecked={paper:scoped[0]??base,selection:null,scores:noScores,retention:undefined};
 if(!scoped.length)return {...unchecked,reasons:['authority_unavailable']};
 // A superior grants only what he holds directly; a subordinate answers his own scoped assignment separately.
 if(commandedBlocks(state,post).length===0)return {...unchecked,reasons:['no_eligible_force']};
 let paper=scoped[0]!;
 let selection=allocationSelection(world,state,paper,day,true,[],true);
 for(const alternative of scoped.slice(1)) {
   if(selection.blocks.length)break;
   const candidate=allocationSelection(world,state,alternative,day,true,[],true);
   if(candidate.blocks.length){paper=alternative;selection=candidate;}
 }
 if(!selection.blocks.length)return {...unchecked,reasons:selection.reasons.length?selection.reasons:['no_eligible_force']};
 // A governor sends for the received destination under his own civil authority. The national command plans its use.
 if(governor)return {...unchecked,paper,selection,reasons:selection.reasons};
 const ground=localPlanningGround(world,state,day);
 const supporting=inputFor(world,state,person,post,{...need.needGoal,goalCommitted:selection.blocks},day,ground);
 const best=draft(supporting).draftCandidates.find(c=>c.candMethod!=='holding'&&c.candAxes.length>0);
 if(!best)return {...unchecked,paper,reasons:['no_route_or_task_candidate']};
 const retention=forceRetention(world,state,person,post,selection.lots,day,ground);
 const scores={...noScores,support:best.candScore};
 if(retention?.reason==='retain_for_own_mission')return {...unchecked,paper,scores,retention,reasons:[retention.reason]};
 return {...unchecked,paper,selection,scores,retention,reasons:[...selection.reasons,
  ...(retention?.reason==null?[]:[retention.reason]),...(best.candUnavailableTerms?.length?['support_terms_unavailable']:[])]};
}

interface RetentionJudgement {
 readonly shortfalls: RetentionShortfalls;
 readonly reason: 'retain_for_own_mission' | 'retention_comparison_undetermined' | null;
}

/** Compare the same mission shortfall that prompts a request, before and after sending. */
export function forceRetention(world:SeatsWorld,state:State,person:PersonId,post:PostId,lots:readonly string[],day:number,ground=localPlanningGround(world,state,day)):RetentionJudgement|undefined {
 const ownMission=receivedMissionOf(state,person,post);
 if(ownMission===undefined)return undefined;
 const blocks=joinedMissionBlocks(world,state,post), goal={...ownMission.planGoal,goalCommitted:blocks};
 const input=inputFor(world,state,person,post,goal,day,ground);
 const own=missionForces(input,blocks), ctx=makeCtx(input);
 const keep=missionForceScore(ctx,post,own);
 if(keep.ratio===null)return {shortfalls:[null,null],reason:'retention_comparison_undetermined'};
 const selected=new Set(lots);
 // Only the selected lots leave. The mission and its received enemy picture stay fixed in both evaluations.
 const remaining=own.map(f=>({...f,strength:f.strength-state.forceBlockStates[f.id]!.fbLots.reduce((n,l)=>n+(selected.has(l.lotId)?l.lotMen??0:0),0)}));
 const send=missionForceScore(ctx,post,remaining);
 return {shortfalls:[keep.shortfall,send.shortfall],reason:send.shortfall>keep.shortfall?'retain_for_own_mission':null};
}
