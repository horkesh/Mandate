import { canonicalHash } from '../serialize/hash.ts';
/** Transport/compliance coordinator: authority itself is written by command. */
import { activeMandate, commitAuthority, enactMandate, inSubtree, mandateAt, mayCommit } from '../command/authority.ts';
import { allCommandedBlocks, factionOfPost, heldPost } from '../command/command.ts';
import type { PersonId, SeatId } from '../ids.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import type { MandateCommand } from '../log/commands.ts';
import type { OrderBody, TransitMessage } from '../messages/transit.ts';
import { recordResponse, responseKey, responseOf } from '../proxy/responses.ts';
import { answerOrder, goalTerms } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import { availableMandatePapers, localOptions, mandateLetter, type LocalOption } from '../seats/local-actions.ts';
import { seatIdFor } from '../seats/seats.ts';
import { senderFor } from '../seats/sender.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { letterKey } from '../world/letters.ts';
import type { MandatePaper } from '../world/mandates.ts';
import { acknowledge, dispatchOrder } from './orders.ts';
import { setGoal, saveDraft } from '../plans/plans.ts';
import { ORDER_ROUTES } from '../messages/latency.ts';
import { mintMessageId } from '../messages/transit.ts';
import type { RejectionReason, TickContext } from './context.ts';

function mayGrant(world: SeatsWorld, state: State, person: PersonId, paper: MandatePaper, day: number): boolean {
  const g = paper.grant;
  if (g.mandateIssuer !== person || state.postStates[g.mandatePost]?.postHolder !== g.mandateHolder) return false;
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
    factionOfPost(world.map,state,g.mandatePost) === f.faction);
  // 0124 state-force roots: the pack's raising office, never a general's rank.
  const issuerPost = state.postStates[g.mandateIssuerPost];
  return issuerPost?.postHolder === person && world.map.world.rules.recruitment.raisingPostKinds.includes(issuerPost.postKind) &&
    factionOfPost(world.map,state,g.mandateIssuerPost) === factionOfPost(world.map,state,g.mandatePost) &&
    inSubtree(state,g.mandatePost,g.mandateIssuerPost);
}
export function issueMandate(ctx: TickContext, state: State, seat: SeatId, cmd: MandateCommand): RejectionReason | null {
  const person = state.seatAssignments[seat]?.seatPerson;
  if (person === undefined) return 'unknown_seat';
  if (!ORDER_ROUTES.includes(cmd.route)) return 'route_unavailable';
  const paper = availableMandatePapers(ctx.world,state,person,ctx.day).find(p => p.id === cmd.paper);
  if (paper === undefined || !mayGrant(ctx.world,state,person,paper,ctx.day)) return 'bad_selection';
  if (!ctx.latency || !senderFor(ctx.world,state,seat,undefined,ctx.senderViews,heldPost(state,person) ?? undefined)?.known(paper.grant.mandatePost)) return 'unknown_post';
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
    ...g.mandateActions.map(a => ({ clauseId: a, clauseSubject: 'course' as const })),
    { clauseId: 'onward', clauseSubject: 'authority' as const },
  ] };
  const answer = answerOrder(ctx.world,state,msg.msgTo,g.mandateIssuer,terms);
  let next = recordResponse(state,responseOf(answer,{ order: msg.msgOrigin, person: msg.msgTo, post: msg.msgToPost, role: 'addressee', day: ctx.day, kind: 'mandate' }));
  next = enactMandate(ctx.world.map,next,g,msg.msgOrigin,ctx.day,responseKey(msg.msgOrigin,msg.msgTo),answer.undertaking?.clauses ?? null,msg.msgOrder!.orderIssuedDay);
  acknowledge(ctx,next,msg,answer.declared,answer.undertaking !== null,answer);
  return next;
}
export function validateLocalOrder(ctx: TickContext, state: State, order: OrderBody): boolean {
  const basis = order.orderAuthority;
  if (basis === undefined || order.orderGoal === null) return false;
  const a = mandateAt(state,basis.basisPost,basis.basisKey);
  if (a === undefined || !activeMandate(ctx.world.map,state,a,ctx.day) || a.authorityGrant.mandateHolder !== order.orderIssuer) return false;
  const g = a.authorityGrant, goal = order.orderGoal;
  return (order.orderKind === 'approve' ? g.mandateActions.includes('approve') : g.mandateActions.includes(goal.goalPosture)) && goal.goalObjective !== null && g.mandateRegions.includes(goal.goalObjective) &&
    !goal.goalNeutral && goal.goalDiscretion === undefined && (!goal.goalRail || g.mandateModes.includes('rail')) &&
    (!goal.goalRiver || g.mandateModes.includes('river')) && (!goal.goalSea || g.mandateModes.includes('sea')) &&
    g.mandateRecipients.some(r => inSubtree(state,order.orderTarget,r)) &&
    mayCommit(ctx.world.map,state,a,order.orderTarget,goal.goalCommitted);
}
export function executeLocal(ctx: TickContext, state: State, person: PersonId, option: LocalOption): { state: State; reason: RejectionReason | null } {
  // Rebuild from execution state, not a caller-supplied candidate or the frozen menu.
  const fresh = localOptions(ctx.world,state,person,ctx.day).find(o => o.id === option.id);
  if (fresh === undefined) return { state, reason: 'bad_selection' };
  if (fresh.kind === 'grant') return { state, reason: issueMandate(ctx,state,seatIdFor(person),{ cmd: 'mandate', paper: fresh.paper.id, route: 'courier' }) };
  if (fresh.kind === 'review') {
    const paper = fresh.received.knownBody.reportPlan!;
    dispatchOrder(ctx,state,seatIdFor(person),person,paper.paperPost,'courier',false,{
      orderKind:'approve',orderGoal:paper.paperGoal,orderEdit:null,orderCall:null,orderPlan:fresh.received.knownBody.reportAnswers!,
      orderAuthority:{basisPost:fresh.authority.authorityGrant.mandatePost,basisKey:fresh.authority.authorityGrant.mandateKey},
    });
    return {state,reason:null};
  }
  if (fresh.target === heldPost(state,person)) {
    // A local decision has an identity, but never travels as a letter from the holder to himself.
    const id = mintMessageId(ctx.mint,ctx.day,person,person,`local.${fresh.id}`);
    const g = fresh.authority.authorityGrant;
    let next = setGoal(state,fresh.target,{id,issuer:g.mandateIssuer,goal:fresh.goal,viaChain:true,issuedDay:ctx.day,
      response:fresh.authority.authorityResponse,authority:{basisPost:g.mandatePost,basisKey:g.mandateKey}},ctx.day);
    next = saveDraft(next,fresh.target,{draftCommander:person,draftPost:fresh.target,draftFaction:ctx.world.person(person).faction!,
      draftDay:ctx.day,draftCandidates:[fresh.candidate],draftRejected:[],draftSearches:0,draftGenerated:1,draftDeduplicated:0});
    return {state:commitAuthority(next,fresh.authority,id,fresh.target,fresh.goal.goalCommitted),reason:null};
  }
  const id = dispatchOrder(ctx,state,seatIdFor(person),person,fresh.target,'courier',false,{
    orderKind: 'goal', orderGoal: fresh.goal, orderEdit: null, orderCall: null,
    orderAuthority: { basisPost: fresh.authority.authorityGrant.mandatePost, basisKey: fresh.authority.authorityGrant.mandateKey },
  });
  return { state: commitAuthority(state,fresh.authority,id,fresh.target,allCommandedBlocks(ctx.world.map,state,fresh.target)), reason: null };
}
