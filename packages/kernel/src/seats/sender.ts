/** A principal's sending authority and address book, from his own office and received establishment (S65). */
import { strictCompare } from '../compare.ts';
import { commandedBlocks } from '../command/command.ts';
import type { PersonId, PostId, SeatId } from '../ids.ts';
import type { State } from '../root-state.ts';
import { viewFor, type ViewCache } from '../view/view.ts';
import type { SeatView } from '../view/types.ts';
import { dateOfDay, formatIsoDate } from '../world/calendar.ts';
import { receivedDepartmentSides } from './received.ts';
import type { SeatsWorld } from './world.ts';
import { activeMandate, currentMandates } from '../command/authority.ts';
import { commandProjection } from '../view/people.ts';

/** Public declared structure, including its labelled administrative schedule; never an actual holder. */
export function receivedPostDefinition(world: SeatsWorld, view: SeatView, id: PostId) {
  const opening = world.start.posts.find(p => p.id === id);
  const declared = opening ?? world.start.temporaryPosts.find(p => p.id === id);
  if (declared === undefined) return undefined;
  const today = formatIsoDate(dateOfDay(world.start.startDate, view.day));
  const schedule = opening?.departmentChanges.filter(c => c.on <= today).sort((a,b) => strictCompare(a.on,b.on)).at(-1);
  return { ...declared, department: schedule?.department ?? declared.department };
}

export function senderFor(world: SeatsWorld, state: State, seat: SeatId, requisition?: PostId, cache?: ViewCache, localPost?: PostId) {
  const person = state.seatAssignments[seat]?.seatPerson;
  const principalOffice = world.start.factions.find(f => f.principal === person);
  if (principalOffice !== undefined) localPost = undefined;
  const office = principalOffice ?? (localPost === undefined || person === undefined ? undefined : { principal: person, faction: state.departmentFactions[state.postStates[localPost]!.postDepartment]! });
  if (office === undefined || office.principal === null) return null;
  const principal = office.principal;
  const faction = office.faction;
  const baseView = viewFor(world, state, seat, cache);
  const scope = localPost === undefined ? [] : currentMandates(state,localPost)
    .filter(a => activeMandate(world.map,state,a,state.stateDay+1)).flatMap(a => a.authorityGrant.mandateRecipients).concat((world.map.world.rules.mandates ?? []).filter(p => p.grant.mandateIssuer === person && p.grant.mandateIssuerPost === localPost && p.grant.mandateParent === null).map(p => p.grant.mandatePost));
  const view = localPost === undefined ? baseView : { ...baseView,
    posts: commandProjection(world,person!,baseView.faction,baseView.reports,state.stateDay,state.calendarStart,scope).posts };
  const posts = new Map(view.posts.map(p => [p.post,p]));
  const sides = receivedDepartmentSides(world, view);
  const definition = (post: PostId) => receivedPostDefinition(world, view, post);
  // A chosen option's requisition explicitly names an opening office in the government's own outgoing list.
  // Only the office address is known. The envelope never invents a named holder.
  const addressed = requisition === undefined ? undefined : world.start.posts.find(p => p.id === requisition);
  const known = (post: PostId) => posts.has(post) || addressed?.id === post;
  const declaredSide = (post: PostId) => {
    const declared = definition(post);
    return declared === undefined ? undefined : sides.get(declared.department);
  };
  const side = (post: PostId) => {
    if (!known(post)) return undefined;
    const declared = definition(post);
    return declared === undefined ? undefined : sides.get(declared.department);
  };
  const holder = (post: PostId) => posts.get(post)?.status === 'held' ? posts.get(post)!.holder : null;
  const chain = (post: PostId) => {
    const up: PostId[] = [];
    for (let p: PostId | null | undefined = post; p != null && p !== view.post && !up.includes(p); p = posts.get(p)?.parent) up.push(p);
    return up.reverse();
  };
  const field = (post: PostId) => commandedBlocks(state,post).length > 0 ||
    (posts.get(post)?.status === 'held' && (world.start.forceBlocks.some(b => b.post === post) || world.map.world.organisationTemplates?.some(t=>t.army===post)===true));
  const mayEstablish = (post: PostId) => {
    const template = world.start.temporaryPosts.find(p => p.id === post);
    const kind = world.map.world.vocabularies.postKinds.find(k => k.id === template?.kind);
    return template !== undefined && !posts.has(post) && sides.get(template.department) === faction &&
      kind?.creatable === 'appoint' && kind.temporary &&
      (template.parent === null || (posts.has(template.parent) && side(template.parent) === faction));
  };
  // A neutral governor who answered this principal's requisition can be asked to hand over the promised troops.
  // This is a military request to that man, not evidence that his government has joined a side.
  const promisedTroops = (post: PostId) => side(post) === null && view.reports.some(r =>
    r.day <= state.stateDay && r.receivedDay <= state.stateDay && r.type === 'wire-dispatch' && r.subtype === null &&
    r.author === holder(post) && r.authorPost === post && r.subjectKind === 'post' && r.subjectId === post &&
    r.answers !== null && Number.isSafeInteger(Number(r.answers.split('.')[1])) && r.answers.startsWith(`m.${r.answers.split('.')[1]}.${principal}.`) &&
    r.claims.some(c => c.kind === 'call-answer' && c.value > 0));
  const personSide = (id: PersonId) => {
    let result = world.map.world.people.find(p => p.id === id)?.faction;
    for (const p of view.posts) if (p.holder === id && p.status === 'held') result = side(p.post) ?? null;
    for (const r of [...view.reports].filter(r => r.day <= view.day && r.receivedDay <= view.day)
      .sort((a,b) => a.day-b.day || (a.hour ?? -1)-(b.hour ?? -1) || strictCompare(a.id,b.id))) {
      if (r.type === 'wire-dispatch' && r.subtype === null && r.subjectKind === 'person' && r.author === id && r.subjectId === id &&
        r.claims.some(c => c.kind === 'service-choice' && c.token === 'resign' && c.value === 1)) {
        result = world.map.world.people.find(p => p.id === id)?.service?.toFaction ?? null;
      }
    }
    return result;
  };
  return { principal, faction, view, posts, known, definition, declaredSide, side, holder, chain, field, mayEstablish, promisedTroops, personSide };
}
