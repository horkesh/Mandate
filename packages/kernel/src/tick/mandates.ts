import { executeForceOption } from './force-requests.ts';
import { canonicalHash } from '../serialize/hash.ts';
/** Transport/compliance coordinator: authority itself is written by command. */
import { activeMandate, commitAuthority, enactMandate, inSubtree, mandateAt, mayCommit } from '../command/authority.ts';
import { allCommandedBlocks, factionOfPost, heldPost, sideOfPerson } from '../command/command.ts';
import type { PersonId, SeatId } from '../ids.ts';
import { deliverReport, knowledgeOf } from '../knowledge/knowledge.ts';
import type { MandateCommand } from '../log/commands.ts';
import type { OrderBody, TransitMessage } from '../messages/transit.ts';
import { recordResponse, responseKey, responseOf } from '../proxy/responses.ts';
import { answerOrder, goalTerms } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import { availableMandatePapers, goalWithin, localOptions, mandateLetter, type LocalOption } from '../seats/local-actions.ts';
import { assignmentLetter } from '../seats/onward-assignments.ts';
import { issueAllocation, fulfilAllocation } from './allocation.ts';
import { seatIdFor } from '../seats/seats.ts';
import { senderFor } from '../seats/sender.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { letterKey } from '../world/letters.ts';
import type { MandatePaper } from '../world/mandates.ts';
import { acknowledge, answerBody, dispatchOrder } from './orders.ts';
import { setGoal, saveDraft } from '../plans/plans.ts';
import { ORDER_ROUTES } from '../messages/latency.ts';
import { mintMessageId } from '../messages/transit.ts';
import { canReceiveCommand, receiveCommand, commandIntake } from '../command/command-assignment.ts';
import { repartition } from './organisation.ts';
import { toId } from '../ids.ts';
import type { RejectionReason, TickContext } from './context.ts';

function mayGrant(world: SeatsWorld, state: State, person: PersonId, paper: MandatePaper, day: number): boolean {
  const g = paper.grant;
  if (g.mandateIssuer !== person || (paper.assignment === undefined && state.postStates[g.mandatePost]?.postHolder !== g.mandateHolder)) return false;
  if (g.mandateRevoke) {
    const old = mandateAt(state,g.mandatePost,g.mandateKey);
    if (old !== undefined) return old.authorityGrant.mandateIssuer === person;
  }
  if (g.mandateParent !== null) {
    const a = mandateAt(state,g.mandateParent.parentPost,g.mandateParent.parentKey,day);
    return a !== undefined && activeMandate(world.map,state,a,day) && a.authorityGrant.mandateHolder === person &&
      a.authorityGrant.mandateOnward && a.authorityGrant.mandateRecipients.some(r => inSubtree(state,g.mandatePost,r));
  }
  if (g.mandateIssuerPost === null) return world.start.factions.some(f => f.principal === person &&
    (state.postStates[g.mandatePost]===undefined ? state.departmentFactions[world.start.temporaryPosts.find(p=>p.id===g.mandatePost)!.department] : factionOfPost(world.map,state,g.mandatePost)) === f.faction);
  // 0124 state-force roots: the pack's raising office, never a general's rank.
  const issuerPost = state.postStates[g.mandateIssuerPost];
  const targetSide=state.postStates[g.mandatePost]===undefined ? state.departmentFactions[world.start.temporaryPosts.find(p=>p.id===g.mandatePost)!.department] : factionOfPost(world.map,state,g.mandatePost);
  return issuerPost?.postHolder === person && world.map.world.rules.recruitment.raisingPostKinds.includes(issuerPost.postKind) &&
    factionOfPost(world.map,state,g.mandateIssuerPost) === targetSide &&
    (state.postStates[g.mandatePost]===undefined ? world.start.temporaryPosts.find(p=>p.id===g.mandatePost)?.parent===g.mandateIssuerPost : inSubtree(state,g.mandatePost,g.mandateIssuerPost));
}
export function issueMandate(ctx: TickContext, state: State, seat: SeatId, cmd: MandateCommand): RejectionReason | null {
  const person = state.seatAssignments[seat]?.seatPerson;
  if (person === undefined) return 'unknown_seat';
  if (!ORDER_ROUTES.includes(cmd.route)) return 'route_unavailable';
  const paper = availableMandatePapers(ctx.world,state,person,ctx.day).find(p => p.id === cmd.paper);
  if (paper === undefined || !mayGrant(ctx.world,state,person,paper,ctx.day)) return 'bad_selection';
  if (!ctx.latency || (paper.assignment===undefined && !senderFor(ctx.world,state,seat,undefined,ctx.senderViews,heldPost(state,person) ?? undefined)?.known(paper.grant.mandatePost))) return 'unknown_post';
  if (ctx.outbox.some(m => m.msgOrder?.orderLetter !== undefined && letterKey(m.msgOrder.orderLetter) === letterKey(mandateLetter(paper)))) return 'duplicate_choice';
  dispatchOrder(ctx,state,seat,person,paper.grant.mandatePost,cmd.route,false,{
    orderKind: 'mandate', orderMandate: paper.grant, orderLetter: mandateLetter(paper), orderGoal: null, orderEdit: null, orderCall: null,
  });
  return null;
}
export function arriveMandate(ctx: TickContext, state: State, msg: TransitMessage): State {
  const g = msg.msgOrder!.orderMandate;
  const paper = ctx.world.map.world.rules.mandates?.find(p => g !== undefined && letterKey(mandateLetter(p)) === letterKey(msg.msgOrder!.orderLetter!));
  if (g === undefined || paper === undefined || canonicalHash(g) !== canonicalHash(paper.grant) || !mayGrant(ctx.world,state,g.mandateIssuer,paper,msg.msgOrder!.orderIssuedDay)) return state;
  const terms = { ...goalTerms(ctx.world.rules.people,'hold'), boldness: null, clauses: [
    ...(paper.assignment===undefined?[]:[{clauseId:'command',clauseSubject:'authority' as const}]),
    ...g.mandateActions.map(a => ({ clauseId: a, clauseSubject: 'course' as const })),
    { clauseId: 'onward', clauseSubject: 'authority' as const },
  ] };
  const answer = answerOrder(ctx.world,state,msg.msgTo,g.mandateIssuer,terms);
  const response=responseOf(answer,{ order: msg.msgOrigin, person: msg.msgTo, post: msg.msgToPost, role: 'addressee', day: ctx.day, kind: 'mandate' });
  if(paper.assignment!==undefined && !canReceiveCommand(ctx.world,state,paper)) {
    const refused=recordResponse(state,{...response,respActual:'refuse',respDeclared:'refuse',respUndertaking:null,respDeclaredUndertaking:null,respInstitutionalRefusal:'authority_unavailable'});
    acknowledge(ctx,refused,msg,'authority_unavailable',false);
    return refused;
  }
  let next = recordResponse(state,response);
  const obsolete=(mandateAt(state,g.mandatePost,g.mandateKey)?.authorityRevisionSeen??0)>=g.mandateRevision;
  const commandAccepted=paper.assignment!==undefined && !obsolete && answer.undertaking?.clauses.includes('command')===true && canReceiveCommand(ctx.world,next,paper);
  if(commandAccepted)next=receiveCommand(ctx.world,next,paper);
  next = enactMandate(ctx.world.map,next,g,msg.msgOrigin,ctx.day,responseKey(msg.msgOrigin,msg.msgTo),answer.undertaking?.clauses ?? null,msg.msgOrder!.orderIssuedDay);
  next=commandIntake(ctx.world,next,ctx.day);
  const assigned=commandAccepted && next.postStates[g.mandatePost]?.postHolder===g.mandateHolder;
  const ownService=state.personService?.[g.mandateHolder];
  if(assigned && ownService!==undefined)next=deliverReport(next,seatIdFor(g.mandateHolder),{
    id:toId('message',`${msg.msgOrigin}.own-service`),knownReceivedDay:ctx.day,knownRoute:'in-person',knownVia:[],
    knownBody:{reportType:'wire-dispatch',reportSubtype:null,reportAuthor:g.mandateHolder,reportAuthorPost:null,
      reportSubjectKind:'person',reportSubjectId:g.mandateHolder,reportDay:ownService.serviceDay,reportHour:null,
      reportAdvice:null,reportAnswers:null,reportClaims:[{claimKind:'service-choice',claimToken:ownService.serviceChoice,claimRegion:null,claimValue:1,claimConfidence:1000}]},
  },{truthTerms:[],truthTrimmed:[]});
  if(assigned)next=deliverReport(next,seatIdFor(g.mandateHolder),{
    id:msg.msgOrigin,knownReceivedDay:ctx.day,knownRoute:msg.msgRoute,knownVia:msg.msgVia,
    knownBody:answerBody(g.mandateHolder,g.mandatePost,ctx.day,{reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers:msg.msgOrigin,about:g.mandatePost,
      reportClaims:[{claimKind:'command-assigned',claimRegion:null,claimValue:1,claimToken:paper.id,claimConfidence:1000}]}),
  },{truthTerms:[],truthTrimmed:[]});
  acknowledge(ctx,next,msg,answer.declared,paper.assignment===undefined?answer.undertaking!==null:assigned,answer,assigned?paper.id:undefined);
  return next;
}
export function validateLocalOrder(ctx: TickContext, state: State, order: OrderBody): boolean {
  const basis = order.orderAuthority;
  if (basis === undefined || order.orderGoal === null) return false;
  const a = mandateAt(state,basis.basisPost,basis.basisKey);
  if (a === undefined || !activeMandate(ctx.world.map,state,a,ctx.day) || a.authorityGrant.mandateHolder !== order.orderIssuer) return false;
  const g = a.authorityGrant, goal = order.orderGoal;
  return (order.orderKind !== 'approve' || g.mandateActions.includes('approve')) && goalWithin(g, goal) &&
    g.mandateRecipients.some(r => inSubtree(state,order.orderTarget,r)) &&
    mayCommit(ctx.world.map,state,a,order.orderTarget,goal.goalCommitted);
}
export function executeLocal(ctx: TickContext, state: State, person: PersonId, option: LocalOption): { state: State; reason: RejectionReason | null } {
  // Rebuild from execution state, not a caller-supplied candidate or the frozen menu.
  const fresh = localOptions(ctx.world,state,person,ctx.day,ctx.senderViews).find(o => o.id === option.id);
  if (fresh === undefined) return { state, reason: 'bad_selection' };
  if (fresh.kind === 'force-request' || fresh.kind === 'force-answer') return {state:executeForceOption(ctx,state,person,fresh),reason:null};
  if (fresh.kind === 'grant') return { state, reason: issueMandate(ctx,state,seatIdFor(person),{ cmd: 'mandate', paper: fresh.paper.id, route: 'courier' }) };
  if (fresh.kind === 'allocation') return {state,reason:issueAllocation(ctx,state,seatIdFor(person),{cmd:'allocation',paper:fresh.paper.id,route:'courier'})};
  if (fresh.kind === 'allocation-fulfil') return {state:fulfilAllocation(ctx,state,fresh.order),reason:null};
  if (fresh.kind === 'assignment') {
    const {paper} = fresh;
    let block=fresh.block;
    if ([...state.messagesInTransit,...ctx.outbox].some(m => m.msgOrder?.orderAssignment?.block === block)) return {state,reason:'duplicate_choice'};
    const force=state.forceBlockStates[block]!;
    const selected=force.fbLots.filter(l=>!l.lotGenerated && l.lotRegiment===paper.regiment && l.lotService?.enlCallId===paper.call);
    if(selected.length!==force.fbLots.length) {
      const split=toId('forceBlock',`${block}.assignment.${paper.id}`);
      if(state.forceBlockStates[split]!==undefined || Object.values(state.forceBlockStates).some(b=>b.fbParent===block))return {state,reason:'bad_selection'};
      state=repartition(state,[block],[{block,lots:force.fbLots.filter(l=>!selected.includes(l)).map(l=>l.lotId),name:force.fbName},{block:split,lots:selected.map(l=>l.lotId),name:force.fbName}],[paper.from,paper.from]);
      block=split;
    }
    const order = dispatchOrder(ctx,state,seatIdFor(person),person,paper.to,'courier',false,{
      orderKind:'assignment',orderAssignment:{paper:paper.id,block,destination:paper.destination},orderLetter:assignmentLetter(paper),
      orderGoal:null,orderEdit:null,orderCall:null,orderAuthority:{basisPost:paper.from,basisKey:paper.mandate},
    },paper.address==='office'?paper.to:undefined,paper.address==='office');
    return {state:commitAuthority(state,fresh.authority,order,paper.from,[block],true),reason:null};
  }
  if (fresh.kind === 'review') {
    const paper = fresh.received.knownBody.reportPlan!;
    dispatchOrder(ctx,state,seatIdFor(person),person,paper.paperPost,'courier',false,{
      orderKind:'approve',orderGoal:paper.paperGoal,orderEdit:null,orderCall:null,orderPlan:fresh.received.knownBody.reportAnswers!,
      orderAuthority:{basisPost:fresh.authority.authorityGrant.mandatePost,basisKey:fresh.authority.authorityGrant.mandateKey},
    });
    return {state,reason:null};
  }
  if (fresh.kind === 'letter') {
    const row = fresh.row;
    if (ctx.outbox.some(m => m.msgOrder?.orderKind === 'goal' && m.msgOrder.orderTarget === row.post && m.msgOrder.orderIssuer === person)) {
      return { state, reason: 'duplicate_choice' };
    }
    const prior = row.repeats === undefined ? undefined : knowledgeOf(state, seatIdFor(person)).knownDoctrineDispatches
      ?.find(d => letterKey(d.dispatchLetter) === letterKey(row.repeats!))?.dispatchOrigin;
    const id = dispatchOrder(ctx, state, seatIdFor(person), person, row.post, 'courier', false, {
      orderKind: 'goal', orderGoal: fresh.goal, orderEdit: null, orderCall: null, orderLetter: row.letter!,
      ...(row.supersedes === undefined ? {} : { orderSupersedes: row.supersedes }),
      ...(prior === undefined ? {} : { orderPriorDispatch: prior }),
      orderAuthority: { basisPost: fresh.authority.authorityGrant.mandatePost, basisKey: fresh.authority.authorityGrant.mandateKey },
    });
    return { state: commitAuthority(state, fresh.authority, id, row.post, fresh.goal.goalCommitted), reason: null };
  }
  if (state.postStates[fresh.target]?.postHolder === person) {
    // A local decision has an identity, but never travels as a letter from the holder to himself.
    const id = mintMessageId(ctx.mint,ctx.day,person,person,`local.${fresh.id}`);
    const g = fresh.authority.authorityGrant;
    let next = setGoal(state,fresh.target,{id,issuer:g.mandateIssuer,goal:fresh.goal,viaChain:true,issuedDay:ctx.day,
      response:fresh.authority.authorityResponse,authority:{basisPost:g.mandatePost,basisKey:g.mandateKey}},ctx.day);
    next = saveDraft(next,fresh.target,{draftCommander:person,draftPost:fresh.target,draftFaction:sideOfPerson(ctx.world.map,state,person)!,
      draftDay:ctx.day,draftCandidates:[fresh.candidate],draftRejected:[],draftSearches:0,draftGenerated:1,draftDeduplicated:0});
    return {state:commitAuthority(next,fresh.authority,id,fresh.target,fresh.goal.goalCommitted),reason:null};
  }
  const id = dispatchOrder(ctx,state,seatIdFor(person),person,fresh.target,'courier',false,{
    orderKind: 'goal', orderGoal: fresh.goal, orderEdit: null, orderCall: null,
    orderAuthority: { basisPost: fresh.authority.authorityGrant.mandatePost, basisKey: fresh.authority.authorityGrant.mandateKey },
  });
  return { state: commitAuthority(state,fresh.authority,id,fresh.target,allCommandedBlocks(ctx.world.map,state,fresh.target)), reason: null };
}
