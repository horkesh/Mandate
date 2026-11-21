/** Men and appointment availability as the principal has been told, never current service or force tables. */
import { strictCompare } from '../compare.ts';
import type { FactionId, PersonId, PostId } from '../ids.ts';
import { knowledgeOf } from '../knowledge/knowledge.ts';
import type { KnownReport } from '../knowledge/records.ts';
import { ranksOn } from '../people/ranks.ts';
import type { State } from '../root-state.ts';
import { peopleProjection } from '../view/people.ts';
import { createViewCache, viewFor } from '../view/view.ts';
import type { Candidate, CommandablePost } from './api.ts';
import { seatIdFor } from './seats.ts';
import type { SeatsWorld } from './world.ts';

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
export function receivedCandidates(world: SeatsWorld, state: State, principal: PersonId, faction: FactionId): Candidate[] {
  const view = viewFor(world, state, seatIdFor(principal), createViewCache());
  const held = new Set(view.posts.flatMap(p => p.holder === null ? [] : [p.holder]));
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
  return world.map.world.people.filter(p => p.id !== principal && side.get(p.id) === faction && !held.has(p.id) && !unavailable.has(p.id))
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
    if (sent.some(o => o.sentPost === post && o.sentKind === 'goal' && o.sentDay >= r.knownBody.reportDay && o.sentMessage !== r.knownBody.reportAnswers)) return false;
    const answer = sent.find(o => o.sentPaper === r.id && o.sentKind !== 'goal');
    return answer === undefined || received.some(k => k.knownBody.reportAnswers === answer.sentMessage && k.knownBody.reportClaims.some(c => c.claimKind === 'order-objected' || c.claimKind === 'order-returned'));
  }).sort(([a],[b]) => strictCompare(a,b)).map(([,r]) => r);
}
