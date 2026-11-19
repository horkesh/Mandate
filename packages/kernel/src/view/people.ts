/** R70: public opening knowledge and received evidence only. Never reads current posts, traits, stances or responses. */
import { strictCompare } from '../compare.ts';
import type { FactionId, PersonId, PostId } from '../ids.ts';
import type { SeatsWorld } from '../seats/world.ts';
import { dateOfDay, daysFromCivil, formatIsoDate, parseIsoDate } from '../world/calendar.ts';
import type { KnownPersonView, KnownPostView, KnownStanceView, ReportView } from './types.ts';

export interface PeopleProjection {
  readonly posts: readonly KnownPostView[];
  readonly people: readonly KnownPersonView[];
}

/** The next public schedule or future-stamped receipt that can change this projection without replacing a record. */
export function nextPeopleChange(world: SeatsWorld, reports: readonly ReportView[], day: number, calendar: string | null): number | null {
  let next: number | null = null;
  const consider = (on: number) => { if (on > day && (next === null || on < next)) next = on; };
  for (const r of reports) consider(Math.max(r.day, r.receivedDay));
  if (calendar !== null) {
    const start = daysFromCivil(parseIsoDate(calendar));
    for (const p of world.start.posts) for (const c of p.departmentChanges) consider(daysFromCivil(parseIsoDate(c.on)) - start);
  }
  return next;
}

export function peopleProjection(
  world: SeatsWorld, principal: PersonId, faction: FactionId | null, reports: readonly ReportView[],
  standing: Readonly<Record<PersonId, number>>, day: number, calendar: string | null,
): PeopleProjection {
  if (faction === null || !world.factionIds.includes(faction) || world.faction(faction).principal !== principal) {
    return Object.freeze({ posts: Object.freeze([]), people: Object.freeze([]) });
  }
  const departments = new Set(world.map.world.departments.filter(d => d.faction === faction).map(d => d.id));
  const posts = new Map<PostId, KnownPostView>();
  const people = new Set<PersonId>([principal]);
  const today = calendar === null ? null : formatIsoDate(dateOfDay(calendar, day));
  // The principal knows his own opening establishment, including unfilled offices. A foreign report reveals only
  // the post it names: the foreign start's holder and chain are not read to fill that gap.
  for (const p of world.start.posts) {
    if (!departments.has(p.department)) continue;
    const scheduled = today === null ? [] : [...p.departmentChanges].filter(c => c.on <= today).sort((a, b) => strictCompare(a.on, b.on));
    const parent = scheduled.length === 0 ? p.parent : scheduled[scheduled.length - 1]!.parent;
    posts.set(p.id, { post: p.id, parent, placementKnown: true, holder: p.holder, status: p.holder === null ? 'vacant' : 'held', vacantSince: null, source: null, asOfDay: 0, observerReports: [] });
    if (p.holder !== null) people.add(p.holder);
  }
  const received = reports.filter(r => r.day <= day && r.receivedDay <= day);
  const chronological = [...received].sort((a, b) => a.day - b.day || (a.hour ?? -1) - (b.hour ?? -1) || strictCompare(a.id, b.id));
  const ensure = (id: PostId): KnownPostView => {
    const old = posts.get(id);
    if (old !== undefined) return old;
    const unknown: KnownPostView = { post: id, parent: null, placementKnown: false, holder: null, status: 'unknown', vacantSince: null, source: null, asOfDay: 0, observerReports: [] };
    posts.set(id, unknown);
    return unknown;
  };
  const tell = (id: PostId, holder: PersonId | null, status: KnownPostView['status'], r: ReportView) => {
    const old = ensure(id);
    posts.set(id, { ...old, holder, status, vacantSince: status === 'vacant' ? r.day : null, source: r.id, asOfDay: r.day });
    if (holder !== null) people.add(holder);
  };
  for (const r of chronological) {
    for (const via of r.via) ensure(via);
    people.add(r.author);
    if (r.subjectKind === 'person') people.add(r.subjectId as PersonId);
    if (r.authorPost !== null) tell(r.authorPost, r.author, 'held', r);
    if (r.subjectKind !== 'post') continue;
    const post = r.subjectId as PostId;
    ensure(post);
    if (r.type === 'observer-letter') {
      const old = ensure(post);
      posts.set(post, { ...old, observerReports: [...old.observerReports, r.id] });
    }
    for (const c of r.claims) {
      if (c.kind === 'commander-lost' || (c.kind === 'order-returned' && c.token === 'vacant_post') || (c.kind === 'verb-answered' && c.token?.startsWith('relieve:') && c.value === 1)) tell(post, null, 'vacant', r);
      else if (c.kind === 'order-returned' && c.token === 'holder_changed') tell(post, null, 'unknown', r);
      else if (c.kind === 'verb-answered' && c.token?.startsWith('appoint:') && c.value === 1) tell(post, r.author, 'held', r);
    }
  }
  const personViews: KnownPersonView[] = [...people].sort(strictCompare).map(person => {
    const stances: KnownStanceView[] = [];
    const assessments: KnownPersonView['assessments'][number][] = [];
    for (const r of chronological) {
      if (r.author === person && r.type === 'advice' && r.subtype === 'requested' && r.advice !== null && r.claims.some(c => c.kind === 'verb-answered' && c.token?.startsWith('consult:') && c.value === 1)) {
        stances.push(Object.freeze({ subjectKind: r.subjectKind, subjectId: r.subjectId, recommends: r.advice.recommends, confidence: r.advice.confidence, day: r.day, source: r.id }));
      }
      if (r.author !== person && r.subjectKind === 'person' && r.subjectId === person && r.type === 'advice' && r.advice !== null) assessments.push(r.id);
    }
    return Object.freeze({ person, standing: standing[person] ?? null, stances: Object.freeze(stances), assessments: Object.freeze(assessments) });
  });
  return Object.freeze({
    posts: Object.freeze([...posts.values()].sort((a, b) => strictCompare(a.post, b.post)).map(p => Object.freeze({ ...p, observerReports: Object.freeze([...p.observerReports]) }))),
    people: Object.freeze(personViews),
  });
}
