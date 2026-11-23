import { regroupAssignments } from '../command/organisation.ts';
import { strictCompare } from '../compare.ts';
import type { ForceBlockId } from '../ids.ts';
import type { TransitMessage } from '../messages/transit.ts';
import { endJoins, orderJoins, type AssignmentJourney } from '../movement/join.ts';
import { recordResponse, responseOf, type OrderResponse } from '../proxy/responses.ts';
import { answerOrder, verbDirective } from '../reading/orders.ts';
import type { State } from '../root-state.ts';
import { assignmentAuthority, assignmentLetter, receivedRegiment } from '../seats/onward-assignments.ts';
import type { EdgeLeg } from '../supply/supply.ts';
import { acknowledge, answerBody, destinationFailure } from './orders.ts';
import { fire, oversightOf, sendReport, whereIs, type TickContext } from './context.ts';
import { letterKey } from '../world/letters.ts';

function refuseAssignment(ctx: TickContext, state: State, msg: TransitMessage, reason: NonNullable<OrderResponse['respInstitutionalRefusal']>): State {
  const next = recordResponse(state,{
    respOrder:msg.msgOrigin,respPerson:msg.msgTo,respPost:msg.msgToPost,respRole:'addressee',respDay:ctx.day,
    respKind:'assignment',respInstitutionalRefusal:reason,respActual:'refuse',respDeclared:'refuse',respWillingness:0,
    respTerms:[],respReasons:[],respStated:[],respConditions:[],respUndertaking:null,respDeclaredUndertaking:null,
  });
  acknowledge(ctx,next,msg,reason,false);
  return next;
}

export function arriveAssignment(ctx: TickContext, state: State, msg: TransitMessage): State {
  const order = msg.msgOrder!;
  const enclosure = order.orderAssignment;
  const paper = ctx.world.map.world.rules.onwardAssignments?.find(p => p.id === enclosure?.paper);
  if (enclosure === undefined || paper === undefined || order.orderIssuer !== paper.issuer || order.orderTarget !== paper.to ||
    (paper.recipient!==undefined && msg.msgTo!==paper.recipient) ||
    msg.msgToPost !== paper.to || enclosure.destination !== paper.destination || order.orderLetter === undefined ||
    letterKey(order.orderLetter) !== letterKey(assignmentLetter(paper)) || order.orderAuthority?.basisPost !== paper.from ||
    order.orderAuthority.basisKey !== paper.mandate ||
    assignmentAuthority(ctx.world,state,paper,enclosure.block,ctx.day,msg.msgOrigin) === undefined) return refuseAssignment(ctx,state,msg,'authority_unavailable');
  const block = enclosure.block;
  const loc = state.forceLocations[block];
  if (!receivedRegiment(state,paper,block) || loc?.locMarch !== null || loc?.locAboard !== null ||
    state.forceJoins[block] !== undefined) return refuseAssignment(ctx,state,msg,'regiment_unavailable');
  const answer = answerOrder(ctx.world,state,msg.msgTo,paper.issuer,verbDirective(ctx.world.rules.people,'transfer'),
    {oversight:oversightOf(ctx,state,msg.msgTo,paper.issuer).value});
  const next = recordResponse(state,responseOf(answer,{order:msg.msgOrigin,person:msg.msgTo,post:paper.to,role:'addressee',day:ctx.day,kind:'assignment'}));
  const accepted = answer.undertaking !== null && answer.actual !== 'reinterpret' && answer.conditions.length === 0 &&
    ['destination','detail'].every(clause => answer.undertaking!.clauses.includes(clause));
  acknowledge(ctx,next,msg,answer.declared,accepted,answer);
  return accepted ? orderJoins(next,[block],paper.from,paper.destination,ctx.day,{
    assignmentPaper:paper.id,assignmentOrder:msg.msgOrigin,assignmentRecipient:msg.msgTo,
  }) : next;
}

function pendingScope(ctx: TickContext, state: State, block: ForceBlockId, journey: AssignmentJourney) {
  const paper = ctx.world.map.world.rules.onwardAssignments?.find(p => p.id === journey.assignmentPaper);
  if (paper === undefined || !receivedRegiment(state,paper,block) ||
    (paper.address!=='office' && destinationFailure(ctx,state,paper.to,journey.assignmentRecipient,paper.issuer) !== null)) return undefined;
  const authority = assignmentAuthority(ctx.world,state,paper,block,ctx.day,journey.assignmentOrder);
  return authority === undefined ? undefined : {paper,grant:authority.authorityGrant};
}

/** The ordinary join may use only passage covered by the current grant. */
export function assignmentPassage(ctx: TickContext, state: State, block: ForceBlockId, journey: AssignmentJourney): ((leg: EdgeLeg) => boolean) | null {
  const scope = pendingScope(ctx,state,block,journey);
  if (scope === undefined) return null;
  const grant = scope.grant;
  return leg => grant.mandateModes.includes(leg.type === 'road' ? 'land' : leg.type) &&
    (scope.paper.modes===undefined || scope.paper.modes.includes(leg.type==='road'?'land':leg.type)) &&
    grant.mandateRegions.includes(leg.from) && grant.mandateRegions.includes(leg.to);
}

/** The order's answer admits the journey. Only the receiving command's possession transfers assignment. */
export function receiveAssignments(ctx: TickContext, start: State): State {
  let state = start;
  for (const block of Object.keys(state.forceJoins).sort(strictCompare) as ForceBlockId[]) {
    const journey = state.forceJoins[block]?.joinAssignment;
    if (journey === undefined) continue;
    const scope = pendingScope(ctx,state,block,journey);
    if (scope === undefined) { state = endJoins(state,[block]); continue; }
    const {paper} = scope;
    const loc = state.forceLocations[block];
    if (loc?.locRegion !== paper.destination || loc.locMarch !== null || loc.locAboard !== null ||
      (paper.address==='office' ? state.postStates[paper.to]?.postHolder==null || whereIs(ctx,state,state.postStates[paper.to]!.postHolder!)!==paper.destination : whereIs(ctx,state,journey.assignmentRecipient) !== paper.destination)) continue;
    state = regroupAssignments(state,[],[{block,post:paper.to}]);
    state = endJoins(state,[block]);
    fire(ctx,'movement.joined');
    sendReport(ctx,state,{
      body:answerBody(paper.address==='office'?state.postStates[paper.to]!.postHolder!:journey.assignmentRecipient,paper.to,ctx.day,{
        reportType:'wire-dispatch',reportSubtype:null,reportAdvice:null,answers:journey.assignmentOrder,about:paper.to,
        reportClaims:[{claimKind:'arrived',claimRegion:paper.destination,claimValue:1,claimToken:'assignment_received',claimConfidence:1000}],
      }),
      truth:{truthTerms:[],truthTrimmed:[]},to:paper.issuer,tag:`assignment-received.${paper.id}`,
    });
  }
  return state;
}
