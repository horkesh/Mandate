import { forceOptions } from './force-requests.ts';
import type { ForceOption } from './force-requests.ts';
/** Derived local menu. Its planner reads the acting person's picture only. */
import { activeMandate, currentMandates, inSubtree, mandateAt, mayCommit, type EnactedMandate } from '../command/authority.ts';
import { allCommandedBlocks, commandedBlocks, factionOfPost, heldPost } from '../command/command.ts';
import { strictCompare } from '../compare.ts';
import type { MessageId, PersonId, PostId } from '../ids.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import { hasRequiredPapers } from '../knowledge/papers.ts';
import { draft } from '../planner/draft.ts';
import { plannerInputFor } from '../planner/input.ts';
import type { PlanCandidate } from '../planner/types.ts';
import { POSTURES, type PlanGoal, type Posture } from '../plans/goal.ts';
import type { PlanRecord } from '../plans/plans.ts';
import type { State } from '../root-state.ts';
import { canonicalHash } from '../serialize/hash.ts';
import { optionView } from '../tick/plans.ts';
import { createViewCache, viewFor, type ViewCache } from '../view/view.ts';
import { daysFromCivil, parseIsoDate } from '../world/calendar.ts';
import { letterKey } from '../world/letters.ts';
import type { MandateGrant, MandatePaper } from '../world/mandates.ts';
import type { LocalActionMenu } from './api.ts';
import { seatIdFor } from './seats.ts';
import { authoredGoal, letterDependencies, orderedLetters } from '../world/doctrine.ts';
import type { DoctrineOffensive } from '../world/world.ts';
import { goalOf } from '../tick/orders.ts';
import type { SeatsWorld } from './world.ts';
import { warSince } from './requests.ts';
import { senderFor } from './sender.ts';
import { receivedPlanPapers } from './received.ts';
import type { KnownReport } from '../knowledge/knowledge.ts';
import { commandProjection } from '../view/people.ts';
import { assignmentOptions } from './onward-assignments.ts';
import { availableAllocations, allocationFulfilments } from './allocation.ts';
import type { AllocationInstrument } from '../world/allocation.ts';
import { localPlanningGround, type LocalPlanningGround } from './planning-ground.ts';

export function mandateLetter(paper: MandatePaper) {
  return { namespace: `authority.${paper.grant.mandateIssuer}`, key: paper.grant.mandateKey, revision: paper.grant.mandateRevision };
}
export function availableMandatePapers(world: SeatsWorld, state: State, person: PersonId, day: number, cache?: ViewCache): MandatePaper[] {
  const declared = (world.map.world.rules.mandates ?? []).filter(p => p.grant.mandateIssuer === person);
  if (declared.length === 0) return [];
  const knowledge = knowledgeOf(state,seatIdFor(person));
  // Dispatched or not-yet-due instruments cannot need a received address.
  // Keep the full declared address scope below: other papers can supply ancestors.
  const pending = declared.filter(p =>
    day >= daysFromCivil(parseIsoDate(p.fromDate)) - daysFromCivil(parseIsoDate(world.start.startDate)) &&
    !knowledge.knownDoctrineDispatches?.some(d => letterKey(d.dispatchLetter) === letterKey(mandateLetter(p))) &&
    hasRequiredPapers(p.requiresPapers,knowledge,state.stateDay,world.rules.templates));
  if (pending.length === 0) return [];
  const view = viewFor(world,state,seatIdFor(person),cache);
  const addresses = world.start.factions.some(f => f.principal === person) ? view.posts :
    commandProjection(world,person,view.faction,view.reports,state.stateDay,state.calendarStart,declared.map(p => p.grant.mandatePost)).posts;
  return pending.filter(p =>
    p.assignment !== undefined || addresses.some(a => a.post === p.grant.mandatePost && a.status === 'held' && a.holder === p.grant.mandateHolder))
    .sort((a,b) => strictCompare(a.fromDate,b.fromDate) || strictCompare(a.id,b.id));
}
export function goalWithin(g: MandateGrant, goal: PlanGoal): boolean {
  const regions = goal.goalPurpose === undefined ? [goal.goalObjective] :
    [...goal.goalPurpose.detDetentionArea, ...goal.goalPurpose.detActionArea];
  return g.mandateActions.includes(goal.goalPurpose?.detKind ?? goal.goalPosture!) &&
    regions.every(r => r !== null && g.mandateRegions.includes(r)) &&
    !goal.goalNeutral && goal.goalDiscretion === undefined &&
    (!goal.goalRail || g.mandateModes.includes('rail')) &&
    (!goal.goalRiver || g.mandateModes.includes('river')) &&
    (!goal.goalSea || g.mandateModes.includes('sea'));
}

export function candidateWithin(state: State, a: EnactedMandate, target: PostId, goal: PlanGoal, c: PlanCandidate): boolean {
  const g = a.authorityGrant;
  if (!goalWithin(g, goal) ||
    (target !== g.mandatePost && !g.mandateRecipients.some(r => inSubtree(state,target,r))) || !inSubtree(state,target,g.mandatePost)) return false;
  return c.candRequests.length === 0 && c.candAxes.length > 0 && c.candAxes.every(axis =>
    inSubtree(state,axis.axisPost,target) && g.mandateModes.includes(axis.axisMode) &&
    axis.axisBlocks.every(b => goal.goalCommitted.includes(b)) &&
    axis.axisRoute.routeLegs.every(l => l.legType !== 'rail' || g.mandateModes.includes('rail')) &&
    [axis.axisRoute, ...(c.candDetention?.means === 'demonstrate' ? [c.candDetention.recovery] : [])].every(route =>
      [route.routeFrom, ...route.routeLegs.map(l => l.legTo)].every(r => g.mandateRegions.includes(r)) &&
      route.routeLegs.every(l => l.legType !== 'rail' || g.mandateModes.includes('rail'))));
}
/** Delivery, plan selection and each execution boundary share the same scope check. */
export function planAuthorized(world: SeatsWorld, state: State, post: PostId, record: PlanRecord, day: number, candidate?: PlanCandidate): boolean {
  if (record.planDetentionEnd !== undefined) return false;
  const basis = record.planAuthority;
  if (basis === undefined) return true;
  const a = mandateAt(state,basis.basisPost,basis.basisKey);
  return a !== undefined && activeMandate(world.map,state,a,day) &&
    (post === a.authorityGrant.mandatePost ? a.authorityGrant.mandateIssuer : a.authorityGrant.mandateHolder) === record.planIssuer &&
    goalWithin(a.authorityGrant, record.planGoal) && mayCommit(world.map,state,a,post,record.planGoal.goalCommitted) &&
    (candidate === undefined || candidateWithin(state,a,post,record.planGoal,candidate));
}
export type LocalOption = ForceOption |
  { readonly id: string; readonly authority: EnactedMandate | null; readonly kind: 'allocation-fulfil'; readonly order: MessageId; readonly paper: AllocationInstrument } |
  { readonly id: string; readonly authority: EnactedMandate | null; readonly kind: 'allocation'; readonly paper: AllocationInstrument } |
  ReturnType<typeof assignmentOptions>[number] |
  { readonly id: string; readonly authority: EnactedMandate | null; readonly kind: 'grant'; readonly paper: MandatePaper } |
  { readonly id: string; readonly authority: EnactedMandate; readonly kind: 'letter'; readonly row: DoctrineOffensive; readonly goal: PlanGoal } |
  { readonly id: string; readonly authority: EnactedMandate; readonly kind: 'review'; readonly received: KnownReport } |
  { readonly id: string; readonly authority: EnactedMandate; readonly kind: 'goal'; readonly target: PostId; readonly goal: PlanGoal; readonly candidate: PlanCandidate };

export function localOptions(world: SeatsWorld, state: State, person: PersonId, day: number, cache: ViewCache = createViewCache(), ground: LocalPlanningGround = localPlanningGround(world,state,day)): readonly LocalOption[] {
  let morning = cache.localOptions.get(state);
  if (morning?.world !== world || morning.day !== day) {
    morning = { world, day, people: new Map() };
    cache.localOptions.set(state, morning);
  }
  const previous = morning.people.get(person);
  if (previous !== undefined) return previous;
  if (world.start.factions.some(f => f.principal === person)) {
    const post=heldPost(state,person);
    const selected = post===null?[]:forceOptions(world,state,person,post,day,ground,cache).filter(o=>o.kind==='force-answer');
    morning.people.set(person,selected);
    return selected;
  }
  const posts=Object.keys(state.postStates).filter(id=>state.postStates[id as PostId]!.postHolder===person).sort(strictCompare) as PostId[];
  const options=posts.flatMap(post=>localOptionsAt(world,state,person,day,post,cache,ground));
  const rank={'force-request':0,'force-answer':0,'allocation-fulfil':0,allocation:0,assignment:0,grant:0,review:1,letter:2,goal:3};
  const selected = [...new Map(options.map(o=>[o.id,o])).values()].sort((a,b)=>rank[a.kind]-rank[b.kind] || (a.kind==='goal' && b.kind==='goal'?b.candidate.candScore-a.candidate.candScore:0) || strictCompare(a.id,b.id)).slice(0,world.map.world.rules.planner.topN);
  morning.people.set(person, selected);
  return selected;
}
function localOptionsAt(world: SeatsWorld, state: State, person: PersonId, day: number, post: PostId, cache: ViewCache, ground: LocalPlanningGround): LocalOption[] {
  const active = currentMandates(state,post).filter(a => activeMandate(world.map,state,a,day));
  const out: LocalOption[] = assignmentOptions(world,state,person,day,cache).filter(o=>o.paper.from===post);
  out.push(...forceOptions(world,state,person,post,day,ground,cache));
  out.push(...allocationFulfilments(world,state,person,day).filter(o=>o.paper.from===post).map(o=>({id:`fulfil:${o.row.allocOrder}`,kind:'allocation-fulfil' as const,authority:null,order:o.row.allocOrder,paper:o.paper})));
  out.push(...availableAllocations(world,state,person,day).filter(p=>p.issuerPost===post && active.some(a=>a.authorityGrant.mandateKey===p.mandate && a.authorityGrant.mandateActions.includes('assign'))).map(p=>({id:`allocation:${p.id}`,kind:'allocation' as const,authority:null,paper:p})));
  for (const paper of availableMandatePapers(world,state,person,day,cache)) {
    if (paper.grant.mandateParent === null && paper.grant.mandateIssuerPost === post &&
      world.map.world.rules.recruitment.raisingPostKinds.includes(state.postStates[post]!.postKind)) {
      out.push({id:`grant:${paper.id}`,authority:null,kind:'grant',paper});
    }
  }
  if (active.length === 0) return out;
  for (const a of active) for (const paper of availableMandatePapers(world,state,person,day,cache)) {
    const parent = paper.grant.mandateParent;
    if (a.authorityGrant.mandateOnward && parent?.parentPost === post && parent.parentKey === a.authorityGrant.mandateKey &&
      a.authorityGrant.mandateRecipients.some(r => inSubtree(state,paper.grant.mandatePost,r))) {
      out.push({ id: `grant:${paper.id}`, authority: a, kind: 'grant', paper });
    }
  }
  for (const a of active) if (a.authorityGrant.mandateActions.includes('approve')) {
    for (const received of receivedPlanPapers(state,person)) {
      const p = received.knownBody.reportPlan!;
      if (candidateWithin(state,a,p.paperPost,p.paperGoal,p.paperChosen) &&
        !state.messagesInTransit.some(m => m.msgOrder?.orderIssuer === person && m.msgOrder.orderTarget === p.paperPost && m.msgOrder.orderKind === 'approve')) {
        out.push({ id: `approve:${a.authorityGrant.mandateKey}:${received.id}`, authority:a,kind:'review',received });
      }
    }
  }
  const side = factionOfPost(world.map, state, post);
  const doctrine = world.map.world.rules.ruleSeats.principals.find(r => r.faction === side);
  const declared = doctrine?.offensives.some(o => o.issuer === person);
  if (doctrine !== undefined && declared && state.calendarStart !== null) {
    const knowledge = knowledgeOf(state, seatIdFor(person));
    const dispatched = new Map((knowledge.knownDoctrineDispatches ?? []).map(d => [letterKey(d.dispatchLetter), d.dispatchOrigin]));
    const since = warSince(world, state, doctrine.faction);
    const start = daysFromCivil(parseIsoDate(state.calendarStart));
    const selected = new Set<PostId>();
    for (const row of orderedLetters(doctrine.offensives)) {
      if (row.issuer !== person || row.purpose === undefined || row.letter === undefined || row.post === post ||
        since === null || day <= since || day < daysFromCivil(parseIsoDate(row.fromDate)) - start ||
        selected.has(row.post) || dispatched.has(letterKey(row.letter)) ||
        !letterDependencies(row).every(d => dispatched.has(letterKey(d))) ||
        !hasRequiredPapers(row.requiresPapers, knowledge, state.stateDay, world.rules.templates) ||
        (row.requiresNotice !== undefined && !knowledge.knownReports.some(r => r.knownReceivedDay <= state.stateDay &&
          r.knownBody.reportSubjectKind === 'situation' && r.knownBody.reportSubjectId === row.requiresNotice))) continue;
      const sender = senderFor(world, state, seatIdFor(person), undefined, cache, post, row.post);
      if (sender?.holder(row.post) == null || sender.side(row.post) !== side) continue;
      const blocks = allCommandedBlocks(world.map, state, row.post);
      for (const authority of active) {
        const grant = authority.authorityGrant;
        const terms = authoredGoal(row, world.map.world.rules.plans.goalDefaults, false);
        const goal = goalOf({ ...terms, committed: blocks, rail: terms.rail && grant.mandateModes.includes('rail'),
          river: terms.river && grant.mandateModes.includes('river'), sea: terms.sea && grant.mandateModes.includes('sea') });
        if (!goalWithin(grant, goal) || !grant.mandateRecipients.some(r => inSubtree(state, row.post, r)) ||
          !mayCommit(world.map, state, authority, row.post, blocks)) continue;
        out.push({ id: `letter:${letterKey(row.letter)}:${authority.authorityOrigin}`, authority, kind: 'letter', row, goal });
        selected.add(row.post);
        break;
      }
    }
  }
    // A standing assignment permits local initiative; a superior's received goal supplies subordinate intent.
  const own = state.planRecords[post];
  const canInitiate = commandedBlocks(state,post).length > 0 && own === undefined;
  if (!canInitiate && (own === undefined || own.planGoal.goalObjective === null)) return out;
  // Many standing authorities have nothing left to plan. Derive the picture
  // and supply map only after the unchanged target/commitment guards need them.
  let view: ReturnType<typeof viewFor> | undefined;
  let sender: ReturnType<typeof senderFor> | undefined;
  let planning: ReturnType<LocalPlanningGround> | undefined;
  for (const a of active) for (const target of [...new Set([...(canInitiate ? [post] : []), ...a.authorityGrant.mandateRecipients])].sort(strictCompare)) {
    if (target === post && !canInitiate) continue;
    if (state.planRecords[target]?.planIssuer === person || state.messagesInTransit.some(m => m.msgOrder?.orderIssuer === person && m.msgOrder.orderTarget === target)) continue;
    if (target !== post && (sender ??= senderFor(world,state,seatIdFor(person),undefined,cache,post))?.holder(target) == null) continue;
    const blocks = allCommandedBlocks(world.map,state,target);
    if (!mayCommit(world.map,state,a,target,blocks)) continue;
    const picture = view ??= viewFor(world,state,seatIdFor(person),cache);
    const defaults = world.map.world.rules.plans.goalDefaults;
    const goals: PlanGoal[] = target !== post ? own === undefined ? [] : [{ ...own.planGoal, goalCommitted: blocks, goalApproveAsDrafted: false }] :
      a.authorityGrant.mandateRegions.filter(region => region === picture.region || picture.enemyBeliefs[region]?.strength?.strengthPresence === true || (picture.enemyBeliefs[region]?.value ?? 0) > 0)
      .flatMap(region => a.authorityGrant.mandateActions.filter((action): action is Posture => POSTURES.some(p => p === action) && (region !== picture.region || action === 'hold')).map(action => ({
        goalObjective:region,goalPosture:action,goalRisk:defaults.risk,goalDeadlineDays:defaults.deadlineDays,
        goalRail:a.authorityGrant.mandateModes.includes('rail'),goalRiver:a.authorityGrant.mandateModes.includes('river'),goalSea:a.authorityGrant.mandateModes.includes('sea'),
        goalNeutral:false,goalCommitted:blocks,goalAwaitWord:false,goalApproveAsDrafted:false,
      })));
    for (const goal of goals) {
    if (planning === undefined) {
      planning = ground();
    }
    const { month, network, derived, plannerCache } = planning;
    const input = plannerInputFor(world,state,derived,network,month,view,target,goal,day,plannerCache);
    // Score from the issuing commander's traits and reports, not the addressee's hidden judgement.
    const issuerInput = plannerInputFor(world,state,derived,network,month,view,post,goal,day,plannerCache);
    const set = draft({ ...input, profile: issuerInput.profile });
    for (const candidate of set.draftCandidates) if (candidateWithin(state,a,target,goal,candidate)) {
      out.push({ id: `goal:${canonicalHash({ origin: a.authorityOrigin, target, goal, candidate }).slice(0,24)}`,
        authority: a, kind: 'goal', target, goal, candidate });
    }
    }
  }
  const rank = { 'force-request':0,'force-answer':0,'allocation-fulfil':0,allocation:0,assignment:0,grant:0,review:1,letter:1,goal:2 };
  return out.sort((a,b) => rank[a.kind]-rank[b.kind] || (a.kind === 'goal' && b.kind === 'goal' ?
    b.candidate.candScore-a.candidate.candScore : 0) || strictCompare(a.id,b.id)).slice(0,world.map.world.rules.planner.topN);
}
export function localMenu(world: SeatsWorld, state: State, person: PersonId, day: number, cache?: ViewCache, ground?: LocalPlanningGround): LocalActionMenu | null {
  const options = localOptions(world,state,person,day,cache,ground);
  return options.length === 0 ? null : { menuKind: 'local-action', post: heldPost(state,person)!, options: options.map(o => ({
    optionId: o.id, mandate: o.authority?.authorityGrant.mandateKey ?? (o.kind === 'grant' ? o.paper.grant.mandateKey : ''),
    ...(o.kind === 'force-request' ? {to:o.to} : o.kind === 'force-answer' ? {paper:o.request,to:o.need.needPost} : o.kind === 'grant' ? { paper: o.paper.id } : o.kind === 'assignment' || o.kind === 'allocation' || o.kind === 'allocation-fulfil' ? {paper:o.paper.id,to:o.paper.to}
      : o.kind === 'review' ? { paper:o.received.id } : o.kind === 'letter' ? { paper: letterKey(o.row.letter!), to: o.row.post } : { to: o.target, plan: optionView(o.candidate) }),
  })) };
}
