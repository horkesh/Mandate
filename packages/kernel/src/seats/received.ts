/** Men and appointment availability as the principal has been told, never current service or force tables. */
import { strictCompare } from '../compare.ts';
import type { DepartmentId, FactionId, MessageId, PersonId, PostId } from '../ids.ts';
import { knowledgeOf, unansweredAppointments, type KnownSentOrder, type SeatKnowledge } from '../knowledge/knowledge.ts';
import type { KnownReport } from '../knowledge/records.ts';
import { ranksOn } from '../people/ranks.ts';
import { sameGoal, type Discretion, type PlanGoal } from '../plans/goal.ts';
import type { State } from '../root-state.ts';
import { peopleProjection } from '../view/people.ts';
import { createViewCache, viewFor } from '../view/view.ts';
import type { Candidate, CommandablePost } from './api.ts';
import type { SeatView } from '../view/types.ts';
import { seatIdFor } from './seats.ts';
import type { SeatsWorld } from './world.ts';
import { dateOfDay, formatIsoDate } from '../world/calendar.ts';
import { letterKey } from '../world/letters.ts';

/** A received answer names one of the seat's own authored dispatches, including compacted goal copies. */
export function authoredAnswer(knowledge: SeatKnowledge, report: KnownReport) {
  const { reportLetter, reportAnswers } = report.knownBody;
  if (reportLetter === undefined || reportAnswers === null) return undefined;
  return knowledge.knownDoctrineDispatches?.find(d => letterKey(d.dispatchLetter) === letterKey(reportLetter) &&
    [d.dispatchOrigin, d.dispatchLatest].includes(reportAnswers));
}

/** Readiness for an authored goal comes in a report answering its exact dispatch. */
export function receivedAuthoredGo(state: State, principal: PersonId, post: PostId, holder: PersonId | null): MessageId | undefined {
  const knowledge = knowledgeOf(state, seatIdFor(principal));
  const reports = knowledge.knownReports.filter(r => r.knownReceivedDay <= state.stateDay && r.knownBody.reportDay <= state.stateDay);
  const goal = latestSentGoal(knowledge.knownSentOrders ?? [], reports, post);
  if (goal?.sentLetter === undefined || goal.sentGoal?.goalAwaitWord !== true || holder === null) return undefined;
  const ready = reports.some(r => r.knownBody.reportAuthor === holder && r.knownBody.reportAuthorPost === post && r.knownBody.reportAnswers === goal.sentMessage &&
    authoredAnswer(knowledge, r) !== undefined && r.knownBody.reportClaims.some(c => c.claimKind === 'goal-status' && c.claimToken === 'ready'));
  if (!ready || (knowledge.knownSentOrders ?? []).some(o => o.sentKind === 'go' && o.sentPlan === goal.sentMessage && !dispatchFailed(reports, o.sentMessage))) return undefined;
  return goal.sentMessage;
}

/** Public opening sides, superseded only by matching government notices in this seat's received papers. */
export function receivedDepartmentSides(world: SeatsWorld, view: SeatView): ReadonlyMap<DepartmentId, FactionId | null> {
  const sides = new Map(world.map.world.departments.map(d => [d.id, d.faction]));
  const reports = view.reports.filter(r => r.day <= view.day && r.receivedDay <= view.day)
    .sort((a,b) => a.day - b.day || (a.hour ?? -1) - (b.hour ?? -1) || strictCompare(a.id,b.id));
  for (const report of reports) {
    if (report.subjectKind !== 'situation') continue;
    const notice = world.situations.find(s => s.id === report.subjectId);
    if (notice?.kind !== 'notice' || notice.report?.reportType !== report.type || notice.report.subtype !== report.subtype) continue;
    for (const effect of notice.effects) {
      if (!('propose' in effect)) continue;
      const p = effect.propose;
      if (p.owner === 'command' && p.field === 'department_side' && p.subject !== null && p.side !== null && p.delta > 0) sides.set(p.subject as DepartmentId, p.side);
    }
  }
  return sides;
}

/** A known post's public department, including labelled administrative schedules; never the live post table. */
export function receivedPostSide(world: SeatsWorld, view: SeatView, sides: ReadonlyMap<DepartmentId, FactionId | null>, post: PostId): FactionId | null {
  if (!view.posts.some(p => p.post === post && p.status === 'held' && p.holder !== null)) return null;
  const opening = world.start.posts.find(p => p.id === post);
  const declared = world.start.temporaryPosts.find(p => p.id === post);
  if (opening === undefined && declared === undefined) return null;
  const today = formatIsoDate(dateOfDay(world.start.startDate, view.day));
  const scheduled = [...(opening?.departmentChanges ?? [])].filter(c => c.on <= today).sort((a,b) => strictCompare(a.on,b.on));
  const department = scheduled.at(-1)?.department ?? opening?.department ?? declared!.department;
  return sides.get(department) ?? null;
}
export function receivedStrength(state: State, principal: PersonId, post: PostId): Pick<CommandablePost, 'men' | 'strengthReport'> {
  const reports = knowledgeOf(state, seatIdFor(principal)).knownReports
    .filter(r => r.knownBody.reportDay <= state.stateDay && r.knownReceivedDay <= state.stateDay && r.knownBody.reportSubjectKind === 'post' && r.knownBody.reportSubjectId === post)
    .sort((a,b) => b.knownBody.reportDay - a.knownBody.reportDay || b.knownReceivedDay - a.knownReceivedDay || strictCompare(b.id,a.id));
  for (const r of reports) {
    const claim = r.knownBody.reportClaims.find(c => c.claimKind === 'present-for-duty');
    if (claim !== undefined) return { men: claim.claimValue, strengthReport: { source: r.id, author: r.knownBody.reportAuthor, asOfDay: r.knownBody.reportDay } };
  }
  return { men: null, strengthReport: null };
}

/** Public roster, opening ranks and offices, followed by received service/loss papers. */
export function receivedCandidates(world: SeatsWorld, state: State, principal: PersonId, faction: FactionId, fromPost: PostId | null = null, picture?: SeatView): Candidate[] {
  const view = picture ?? viewFor(world, state, seatIdFor(principal), createViewCache());
  const promised = new Set(unansweredAppointments(state,principal).map(a => a.appointmentPerson));
  const held = new Map(view.posts.flatMap(p => p.holder === null ? [] : [[p.holder,p.post] as const]));
  const side = new Map(world.map.world.people.map(p => [p.id, p.faction]));
  const unavailable = new Map<PersonId, 'not_serving' | 'person_holds_post' | 'other_side'>();
  const reports = [...view.reports].filter(r => r.day <= state.stateDay && r.receivedDay <= state.stateDay)
    .sort((a,b) => a.day - b.day || (a.hour ?? -1) - (b.hour ?? -1) || strictCompare(a.id,b.id));
  for (const r of reports) {
    if (r.type === 'wire-dispatch' && r.subtype === null && r.subjectKind === 'person' && r.author === r.subjectId && r.claims.some(c => c.kind === 'service-choice' && c.token === 'resign' && c.value === 1)) {
      side.set(r.author, world.map.world.people.find(p => p.id === r.author)?.service?.toFaction ?? null);
      if (side.get(r.author) === faction && unavailable.get(r.author) === 'other_side') unavailable.delete(r.author);
    }
    for (const claim of r.claims) {
      if (claim.kind === 'appointment-refused' && (claim.token === 'not_serving' || claim.token === 'person_holds_post' || claim.token === 'other_side')) unavailable.set(r.author,claim.token);
      if (claim.kind === 'verb-answered' && claim.value === 1 && claim.token?.startsWith('relieve:') && unavailable.get(r.author) === 'person_holds_post') unavailable.delete(r.author);
    }
    if (r.subjectKind === 'post' && r.claims.some(c => c.kind === 'commander-lost')) {
      // Recover the holder just before this paper from the same opening/received projection, not the lost man's status.
      const earlier = peopleProjection(world, principal, faction, reports.filter(p => p !== r && (p.day < r.day || (p.day === r.day && strictCompare(p.id,r.id) < 0))), () => null, state.stateDay, state.calendarStart);
      const person = earlier.posts.find(p => p.post === r.subjectId)?.holder;
      if (person != null) unavailable.set(person,'not_serving');
    }
  }
  const ranks = new Map(world.map.world.vocabularies.ranks.map((r,i) => [r.id,i]));
  return world.map.world.people.filter(p => (p.requiresIntroduction!==true || view.people.some(known=>known.person===p.id)) && p.id !== principal && side.get(p.id) === faction && (held.get(p.id) ?? null) === fromPost && !unavailable.has(p.id) && !promised.has(p.id))
    .map(p => ({ person: p.id, kind: p.kind as string, seniority: Math.max(-1,...Object.values(ranksOn(world.map,p.ranks,world.start.startDate)).map(r => ranks.get(r.rankTerm) ?? -1)) }))
    .sort((a,b) => b.seniority - a.seniority || strictCompare(a.person,b.person));
}

/** Pending received submissions, retired only by received news or the sender's own recorded reply. */
export function receivedPlanPapers(state: State, principal: PersonId): KnownReport[] {
  const knowledge = knowledgeOf(state, seatIdFor(principal));
  const received = knowledge.knownReports.filter(r => r.knownReceivedDay <= state.stateDay && r.knownBody.reportDay <= state.stateDay);
  const latest = new Map<PostId, KnownReport>();
  for (const r of [...received].sort((a,b) => a.knownBody.reportDay - b.knownBody.reportDay || strictCompare(a.id,b.id))) {
    const paper = r.knownBody.reportPlan;
    if (paper !== undefined) latest.set(paper.paperPost,r);
  }
  return [...latest].filter(([post,r]) => {
    if (received.some(k => k.knownBody.reportSubjectKind === 'post' && k.knownBody.reportSubjectId === post && k.knownBody.reportDay >= r.knownBody.reportDay && k.knownBody.reportClaims.some(c => c.claimKind === 'commander-lost' || (c.claimKind === 'order-returned' && c.claimToken === 'vacant_post')))) return false;
    const sent = knowledge.knownSentOrders ?? [];
    if (sent.some(o => o.sentPost === post && o.sentGoal?.goalDiscretion !== undefined)) {
      const effective = receivedConditionalGoal(state, principal, post, r.knownBody.reportAuthor);
      if (effective !== undefined && r.knownBody.reportAnswers !== effective.order) return false;
    }
    if (r.knownBody.reportLetter !== undefined) {
      if (authoredAnswer(knowledge, r) === undefined && receivedConditionalGoal(state, principal, post, r.knownBody.reportAuthor)?.order !== r.knownBody.reportAnswers) return false;
    } else if (sent.some(o => o.sentPost === post && o.sentKind === 'goal' && o.sentDay >= r.knownBody.reportDay && o.sentMessage !== r.knownBody.reportAnswers)) return false;
    const answer = sent.find(o => o.sentPaper === r.id && o.sentKind !== 'goal');
    return answer === undefined || received.some(k => k.knownBody.reportAnswers === answer.sentMessage && k.knownBody.reportClaims.some(c => c.claimKind === 'order-objected' || c.claimKind === 'order-returned'));
  }).sort(([a],[b]) => strictCompare(a,b)).map(([,r]) => r);
}

/** Proposals answer one of the principal's own letters. Only its received paper can open a reply. */
export function receivedProposalPapers(state: State, principal: PersonId): KnownReport[] {
  const knowledge = knowledgeOf(state, seatIdFor(principal));
  const reports = knowledge.knownReports.filter(r => r.knownReceivedDay <= state.stateDay && r.knownBody.reportDay <= state.stateDay);
  const orders = knowledge.knownSentOrders ?? [];
  const latest = new Map<PostId, KnownReport>();
  for (const paper of reports) {
    const body = paper.knownBody;
    if (body.reportProposal === undefined || body.reportSubjectKind !== 'post' || body.reportAuthorPost !== body.reportSubjectId) continue;
    const ordered = latestSentGoal(orders, reports, body.reportAuthorPost);
    if (body.reportLetter === undefined ? ordered === undefined || !answersGoal(ordered, body.reportAnswers) : authoredAnswer(knowledge, paper) === undefined) continue;
    const prior = latest.get(body.reportAuthorPost);
    if (prior === undefined || prior.knownBody.reportDay < body.reportDay ||
      (prior.knownBody.reportDay === body.reportDay && body.reportAnswers === ordered?.sentMessage)) latest.set(body.reportAuthorPost, paper);
  }
  return [...latest.values()].filter(paper => {
    const reply = orders.find(o => o.sentProposal?.replyPaper === paper.id);
    return reply === undefined || (dispatchFailed(reports, reply.sentMessage) && !reports.some(r =>
      r.knownBody.reportAnswers === reply.sentMessage && r.knownBody.reportClaims.some(c => c.claimKind === 'order-obeyed' && c.claimToken === 'stale')));
  });
}

export function answersGoal(goal: KnownSentOrder, letter: MessageId | null): boolean {
  return goal.sentMessage === letter || goal.sentReaffirms === letter;
}

function dispatchFailed(reports: readonly KnownReport[], letter: MessageId): boolean {
  return reports.some(r => r.knownBody.reportAnswers === letter && r.knownBody.reportClaims.some(c =>
    c.claimKind === 'order-objected' || c.claimKind === 'order-returned' || (c.claimKind === 'order-obeyed' && c.claimValue === 0)));
}

/** An unreceived objection, return or refusal cannot retire the sender's own letter. */
export function latestSentGoal(orders: readonly KnownSentOrder[], reports: readonly KnownReport[], post: PostId): KnownSentOrder | undefined {
  return orders.filter(o => o.sentPost === post && o.sentKind === 'goal' &&
    (o.sentProposal === undefined || !dispatchFailed(reports, o.sentMessage))).at(-1);
}

/** Conditional plan replies read the effective authority and readiness only from correlated received papers. */
export function receivedConditionalGoal(state: State, principal: PersonId, post: PostId, holder: PersonId | null):
  { goal: PlanGoal; order: MessageId; ready: boolean } | undefined {
  const knowledge = knowledgeOf(state, seatIdFor(principal));
  const reports = knowledge.knownReports.filter(r => r.knownReceivedDay <= state.stateDay && r.knownBody.reportDay <= state.stateDay);
  const sent = latestSentGoal(knowledge.knownSentOrders ?? [], reports, post);
  if (sent?.sentGoal?.goalDiscretion === undefined || holder === null) return undefined;
  const papers = reports.filter(r => r.knownBody.reportAuthor === holder && r.knownBody.reportAuthorPost === post &&
    r.knownBody.reportSubjectKind === 'post' && r.knownBody.reportSubjectId === post);
  let goal = sent.sentGoal;
  let order = sent.sentReaffirms ?? sent.sentMessage;
  // A later switch can arrive before an earlier switch. Match the whole stated fallback goal against the grant.
  for (let grant: Discretion<PlanGoal> | undefined = goal.goalDiscretion; grant !== undefined; grant = grant.fallback.goalDiscretion) {
    const paper = papers.find(r => answersGoal(sent, r.knownBody.reportAnswers) &&
      r.knownBody.reportDiscretion?.switchCondition === grant!.condition && sameGoal(r.knownBody.reportDiscretion.switchGoal, grant!.fallback));
    if (paper === undefined) continue;
    goal = grant.fallback;
    order = paper.id;
  }
  const readiness = goal.goalAwaitWord ? papers.filter(r => (r.knownBody.reportAnswers === order ||
    (order === sent.sentReaffirms && r.knownBody.reportAnswers === sent.sentMessage)) &&
    r.knownBody.reportClaims.some(c => c.claimKind === 'goal-status' && c.claimToken === 'ready')).at(-1) : undefined;
  order = readiness?.knownBody.reportAnswers ?? order;
  const ready = readiness !== undefined &&
    !(knowledge.knownSentOrders ?? []).some(o => o.sentPost === post && o.sentKind === 'go' && o.sentPlan === order && !dispatchFailed(reports, o.sentMessage));
  return { goal, order, ready };
}
