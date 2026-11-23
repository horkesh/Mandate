/** Public opening knowledge and received evidence only, including which side a known man serves (R76). */
import { strictCompare } from '../compare.ts';
import type { DepartmentId, FactionId, PersonId, PostId } from '../ids.ts';
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
  standingFor: (person: PersonId) => number | null, day: number, calendar: string | null,
): PeopleProjection {
  if (faction === null || !world.factionIds.includes(faction) || world.faction(faction).principal !== principal) {
    return Object.freeze({ posts: Object.freeze([]), people: Object.freeze([]) });
  }
  const departments = new Set(world.map.world.departments.filter(d => d.faction === faction).map(d => d.id));
  const posts = new Map<PostId, KnownPostView>();
  const knownSides = new Map<DepartmentId, FactionId>();
  const serviceSides = new Map<PersonId, FactionId | null>();
  const postDepartments = new Map<PostId, DepartmentId>();
  const people = new Set<PersonId>([principal]);
  const today = calendar === null ? null : formatIsoDate(dateOfDay(calendar, day));
  // The principal knows his own opening establishment, including unfilled offices. A foreign report reveals only
  // the post it names: the foreign start's holder and chain are not read to fill that gap.
  for (const p of world.start.posts) {
    if (!departments.has(p.department)) continue;
    const scheduled = today === null ? [] : [...p.departmentChanges].filter(c => c.on <= today).sort((a, b) => strictCompare(a.on, b.on));
    postDepartments.set(p.id, scheduled.length === 0 ? p.department : scheduled[scheduled.length - 1]!.department);
    const parent = scheduled.length === 0 ? p.parent : scheduled[scheduled.length - 1]!.parent;
    posts.set(p.id, { post: p.id, parent, placementKnown: true, holder: p.holder, status: p.holder === null ? 'vacant' : 'held', vacantSince: null, source: null, asOfDay: 0, observerReports: [] });
    if (p.holder !== null) people.add(p.holder);
  }
  const received = reports.filter(r => r.day <= day && r.receivedDay <= day);
  const chronological = [...received].sort((a, b) => a.day - b.day || (a.hour ?? -1) - (b.hour ?? -1) || strictCompare(a.id, b.id));
  const ensure = (id: PostId): KnownPostView => {
    const old = posts.get(id);
    if (old !== undefined) return old;
    // Once a paper names a post, its public department can identify a government notice.
    // Its opening holder and parent still supply no evidence about who holds it now.
    const opening = world.start.posts.find(p => p.id === id);
    if (opening !== undefined) postDepartments.set(id, opening.department);
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
    // A notice's received paper identifies the public act. Never inspect whether its event fired in State,
    // and never interpret a decision's possible effects as an announcement that they happened.
    if (r.subjectKind === 'situation') {
      const notice = world.situations.find(s => s.id === r.subjectId);
      if (notice?.kind === 'notice' && notice.report?.reportType === r.type && notice.report.subtype === r.subtype) {
        for (const effect of notice.effects) {
          if (!('propose' in effect)) continue;
          const p = effect.propose;
          if (p.owner === 'command' && p.field === 'department_side' && p.subject !== null && p.side !== null && p.delta > 0) knownSides.set(p.subject as DepartmentId, p.side);
          if (p.owner === 'command' && p.field === 'post_succession' && p.subject !== null && p.succession !== undefined && p.succession !== null && p.delta > 0) {
            const old = ensure(p.subject as PostId);
            if (old.status === 'unknown' || old.holder === p.succession.from) tell(p.subject as PostId, p.succession.to, p.succession.to === null ? 'vacant' : 'held', r);
          }
        }
      }
    }
    for (const via of r.via) ensure(via);
    people.add(r.author);
    if (r.subjectKind === 'person') people.add(r.subjectId as PersonId);
    const resigned = r.type === 'wire-dispatch' && r.subtype === null && r.subjectKind === 'person' && r.subjectId === r.author
      && r.claims.some(c => c.kind === 'service-choice' && c.token === 'resign' && c.value === 1);
    if (resigned) {
      // The letter supplies the act; the public service row supplies its destination, never hidden personService.
      serviceSides.set(r.author, world.map.world.people.find(p => p.id === r.author)?.service?.toFaction ?? null);
      if (r.authorPost !== null) {
        const old = ensure(r.authorPost);
        if (old.holder === null && old.status === 'unknown') tell(r.authorPost, null, 'vacant', r);
      }
      for (const post of posts.values()) if (post.holder === r.author) tell(post.post, null, 'vacant', r);
    } else if (r.authorPost !== null) tell(r.authorPost, r.author, 'held', r);
    if (r.subjectKind !== 'post') continue;
    const post = r.subjectId as PostId;
    ensure(post);
    if (r.type === 'observer-letter') {
      const old = ensure(post);
      posts.set(post, { ...old, observerReports: [...old.observerReports, r.id] });
    }
    for (const c of r.claims) {
      if(c.kind==='organisation-post'){
        const template=(world.map.world.organisationTemplates??[]).find(t=>t.posts.some(p=>p.id===post));
        const spec=template?.posts.find(p=>p.id===post);
        const army=world.start.posts.find(p=>p.id===template?.army)??world.start.temporaryPosts.find(p=>p.id===template?.army);
        if(spec!==undefined&&army!==undefined&&r.authorPost===template!.army&&(departments.has(army.department)||knownSides.get(army.department)===faction)){
          postDepartments.set(post,army.department);posts.set(post,{...ensure(post),parent:c.token as PostId,placementKnown:true});
          tell(post,c.commander??null,c.commander==null?'vacant':'held',r);
        }
      }
      else if (c.kind === 'commander-lost' || (c.kind === 'order-returned' && c.token === 'vacant_post') || (c.kind === 'verb-answered' && c.token?.startsWith('relieve:') && c.value === 1)) tell(post, null, 'vacant', r);
      else if (c.kind === 'appointment-refused' && c.token === 'post_held') tell(post, null, 'unknown', r);
      else if (c.kind === 'order-returned' && ['holder_changed','not_serving','other_side','not_raising_post'].includes(c.token ?? '')) tell(post, null, 'unknown', r);
      else if (c.kind === 'verb-answered' && c.token?.startsWith('appoint:') && c.value === 1) {
        // A received acceptance of our declared establishment identifies its public parent, never a live chain.
        const declared = world.start.temporaryPosts.find(p => p.id === post);
        if (declared !== undefined && (departments.has(declared.department) || knownSides.get(declared.department) === faction)) {
          postDepartments.set(post,declared.department);
          posts.set(post,{ ...ensure(post), parent:declared.parent, placementKnown:true });
        }
        tell(post, r.author, 'held', r);
      }
    }
  }
  const personViews: KnownPersonView[] = [...people].sort(strictCompare).map(person => {
    let side = world.personIds.includes(person) ? world.person(person).faction : null;
    for (const post of posts.values()) {
      if (post.holder !== person) continue;
      const department = postDepartments.get(post.post);
      if (department !== undefined && knownSides.has(department)) side = knownSides.get(department)!;
    }
    // An explicit service choice supersedes the side inferred from a government's posts (0101, R76).
    if (serviceSides.has(person)) side = serviceSides.get(person)!;
    const stances: KnownStanceView[] = [];
    const assessments: KnownPersonView['assessments'][number][] = [];
    for (const r of chronological) {
      if (r.author === person && r.type === 'advice' && r.subtype === 'requested' && r.advice !== null && r.claims.some(c => c.kind === 'verb-answered' && c.token?.startsWith('consult:') && c.value === 1)) {
        stances.push(Object.freeze({ subjectKind: r.subjectKind, subjectId: r.subjectId, recommends: r.advice.recommends, confidence: r.advice.confidence, day: r.day, source: r.id }));
      }
      if (r.author !== person && r.subjectKind === 'person' && r.subjectId === person && r.type === 'advice' && r.advice !== null) assessments.push(r.id);
    }
    return Object.freeze({ person, standing: side === faction ? standingFor(person) : null, stances: Object.freeze(stances), assessments: Object.freeze(assessments) });
  });
  return Object.freeze({
    posts: Object.freeze([...posts.values()].sort((a, b) => strictCompare(a.post, b.post)).map(p => Object.freeze({ ...p, observerReports: Object.freeze([...p.observerReports]) }))),
    people: Object.freeze(personViews),
  });
}
