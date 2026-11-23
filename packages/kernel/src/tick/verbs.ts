import { transferLots } from './lot-transfer.ts';
import { formationPost } from '../command/organisation.ts';
/**
 * The people verbs in the day tick (lane 1.5; FOUNDATION section 5; 0040). Each is an order to a person, answered through
 * his compliance with the pack's order-to-value map (`verb:<verb>` rows), and every answer is recorded by `proxy` with
 * its rungs and reasons.
 *
 * - **Letters** (appoint, relieve, transfer, inquire, consult, observer, audience) travel as messages (`msgVerb`) straight to the
 *   man they concern, and act when they arrive, by his answer.
 * - **In Washington** (promise, pressure, address) act at once: the principal speaks to the man, or to the public.
 *
 * Nothing here moves a division or names a place outside an order to a person (hard rule 1): a transfer names two posts
 * and an amount, and the sending commander picks the blocks (0033).
 */
import { strictCompare } from '../compare.ts';
import { appointHolder, CommandError, createTemporaryPost, declaredAppointment, heldPost, relieveHolder, sideOfPerson, transferForce } from '../command/command.ts';
import { noteLetter, postObserver, recallObserver } from '../command/observers.ts';
import type { ComplianceRung, DirectiveResponse } from '../directive.ts';
import type { MessageId, PersonId, PostId, RegionId, SeatId } from '../ids.ts';
import { enemyBeliefs } from '../knowledge/beliefs.ts';
import { knowledgeOf, unansweredAppointments } from '../knowledge/knowledge.ts';
import type { ReportBody, ReportClaim, StatedReason } from '../knowledge/report.ts';
import { term } from '../knowledge/truth.ts';
import type { VerbCommand } from '../log/commands.ts';
import { mintMessageId, type TransitMessage, type VerbBody, type VerbKind } from '../messages/transit.ts';
import { orderJoins } from '../movement/join.ts';
import { applyPeopleChanges, type PeopleChange } from '../people/people.ts';
import { traitsOf } from '../people/traits.ts';
import { recordResponse, responseOf } from '../proxy/responses.ts';
import { answerOrder, orderTerms } from '../reading/orders.ts';
import { previewAudience, recordAudience } from '../audience/audience.ts';
import { planReading } from './audience-plan.ts';
import type { State } from '../root-state.ts';
import { dateOfDay, formatIsoDate } from '../world/calendar.ts';
import { headquartersOf, isFieldPost } from '../seats/posts.ts';
import { believedHolder } from '../seats/believed.ts';
import { addressRegion, destinationFailure, returnDispatch } from './orders.ts';
import type { CounterTerms } from '../audience/counters.ts';
import { situationChoice } from '../seats/requests.ts';
import { seatIdFor } from '../seats/seats.ts';
import { receivedCandidates } from '../seats/received.ts';
import { senderFor } from '../seats/sender.ts';
import type { AppointmentRefusal } from '../knowledge/report.ts';
import { fire, hop, oversightOf, sendReport, whereIs, type RejectionReason, type TickContext } from './context.ts';

/** Every mechanic the people verbs count (FOUNDATION section 11.5). */
export const VERB_MECHANICS = ['verbs.answered', 'verbs.audience', 'verbs.consulted', 'verbs.declined', 'verbs.in_washington', 'people.promise_kept', 'reports.observer_letter'] as const;

const WILLING: ReadonlySet<ComplianceRung> = new Set(['exceed', 'comply', 'comply_with_reservations']);
const DECLINES: ReadonlySet<ComplianceRung> = new Set(['object', 'refuse']);

const sameSide = (ctx: TickContext, state: State, person: PersonId, principal: PersonId) => sideOfPerson(ctx.world.map, state, person) === sideOfPerson(ctx.world.map, state, principal);
const knownPerson = (ctx: TickContext, person: PersonId) => ctx.world.personIds.includes(person);

/** Send a verb's letter straight to `to` (no relays: it is a letter to one man). */
function sendVerb(ctx: TickContext, state: State, issuer: PersonId, to: PersonId, toPost: PostId | null, route: TransitMessage['msgRoute'], body: Omit<VerbBody, 'verbIssuer' | 'verbIssuedDay'>): MessageId {
  const subject = body.verbKind === 'consult' ? `${body.verbSubject}.${body.verbPost}` : body.verbPost ?? body.verbSubject ?? to;
  const id = mintMessageId(ctx.mint, ctx.day, issuer, to, `verb.${body.verbKind}.${subject}`);
  const leg = hop(ctx, state, route, issuer, whereIs(ctx, state, issuer), (toPost !== null ? addressRegion(ctx, state, toPost, issuer) : body.verbKind === 'observer' ? addressRegion(ctx, state, body.verbPost!, issuer) : whereIs(ctx, state, to)), id);
  ctx.outbox.push({
    id,
    msgOrigin: id,
    msgFrom: issuer,
    msgTo: to,
    msgToPost: toPost,
    msgRole: 'addressee',
    msgRoute: leg.route,
    msgSentDay: ctx.day,
    msgArriveDay: leg.arrive,
    msgVia: [],
    msgPending: [],
    msgOrder: null,
    msgVerb: { ...body, verbIssuer: issuer, verbIssuedDay: ctx.day },
    msgReport: null,
    msgTruth: null,
  });
  fire(ctx, 'messages.sent');
  if (route === 'special-messenger') {
    fire(ctx, 'messages.special_messenger');
    ctx.prices.push({ seat: seatIdFor(issuer), attention: ctx.world.rules.latency.specialMessengerPrice, why: 'special-messenger' });
  }
  return id;
}

const body = (kind: VerbKind, over: Partial<Omit<VerbBody, 'verbKind' | 'verbIssuer' | 'verbIssuedDay'>>): Omit<VerbBody, 'verbIssuer' | 'verbIssuedDay'> => ({
  verbKind: kind,
  verbPost: over.verbPost ?? null,
  verbTo: over.verbTo ?? null,
  verbMode: over.verbMode ?? null,
  verbAmount: over.verbAmount ?? null,
  verbRank: over.verbRank ?? null,
  verbSubject: over.verbSubject ?? null,
});

/**
 * Validate and apply a people verb. Letters go into the outbox; Washington verbs change State now. Returns the reason
 * for a rejection, or null. Only a principal sends them (review F3).
 */
export function applyVerb(ctx: TickContext, start: State, seat: SeatId, c: VerbCommand): { readonly state: State; readonly reason: RejectionReason | null } {
  const reject = (reason: RejectionReason) => ({ state: start, reason });
  const sender = senderFor(ctx.world, start, seat, undefined, ctx.senderViews);
  if (sender === null) return reject('not_a_principal');
  const principal = sender.principal;
  const knownPostOnSide = (post: PostId) => sender.side(post) === sender.faction;
  const knownOwnPerson = (person: PersonId) => sender.personSide(person) === sender.faction;
  const world = ctx.world;
  const rules = world.map.world.rules.people;
  const holderOf = sender.holder;
  switch (c.cmd) {
    case 'appoint': {
      if(formationPost(world.map,c.post))return reject('unknown_post');
      const side = sender.faction;
      if (unansweredAppointments(start, principal).some(a => a.appointmentPost === c.post) || ctx.outbox.some(m => m.msgVerb?.verbIssuer === principal && m.msgVerb.verbKind === 'appoint' && m.msgVerb.verbPost === c.post)) return reject('appointment_pending');
      if (unansweredAppointments(start,principal).some(a => a.appointmentPerson === c.person) || ctx.outbox.some(m => m.msgVerb?.verbIssuer === principal && m.msgVerb.verbKind === 'appoint' && m.msgTo === c.person)) return reject('person_holds_post');
      const template = sender.mayEstablish(c.post) ? world.start.temporaryPosts.find(p => p.id === c.post) : undefined;
      const expected = world.start.temporaryPosts.find(p => p.id === c.post)?.holder;
      if (template !== undefined && expected !== null && expected !== undefined && expected !== c.person) return reject('unknown_post');
      if (template === undefined && !knownPostOnSide(c.post)) return reject('unknown_post');
      if (template === undefined && holderOf(c.post) !== null) return reject('post_held');
      if (template === undefined && sender.posts.get(c.post)?.status !== 'vacant') return reject('unknown_post');
      if (!knownPerson(ctx, c.person) || c.person === principal) return reject('unknown_person');
      const picture = sender.view;
      const held = picture.posts.find(p => p.holder === c.person)?.post ?? null;
      if (held === null && !receivedCandidates(world, start, principal, side, null, picture).some(p => p.person === c.person)) return reject('unknown_person');
      if (c.from === undefined ? held !== null : held !== c.from || c.from === c.post || !knownPostOnSide(c.from)) return reject('person_holds_post');
      if (c.rank !== null && !world.map.world.vocabularies.ranks.some((r) => r.id === c.rank)) return reject('unknown_rank');
      sendVerb(ctx, start, principal, c.person, null, c.route, body('appoint', { verbPost: c.post, verbRank: c.rank, verbTo: c.from ?? null }));
      return { state: start, reason: null };
    }
    case 'relieve': {
      if (!knownPostOnSide(c.post)) return reject('unknown_post');
      const holder = holderOf(c.post);
      if (holder === null) return reject('vacant_post');
      if (c.to !== null && (!knownPostOnSide(c.to) || holderOf(c.to) !== null || c.to === c.post)) return reject('unknown_post');
      sendVerb(ctx, start, principal, holder, c.post, c.route, body('relieve', { verbPost: c.post, verbTo: c.to, verbMode: c.mode }));
      return { state: start, reason: null };
    }
    case 'transfer': {
      if ((!knownPostOnSide(c.from) && !sender.promisedTroops(c.from)) || !knownPostOnSide(c.to) || c.from === c.to) return reject('unknown_post');
      const donor = holderOf(c.from);
      if (donor === null) return reject('vacant_post');
      sendVerb(ctx, start, principal, donor, c.from, c.route, body('transfer', { verbPost: c.from, verbTo: c.to, verbMode: c.force, verbAmount: c.amount }));
      return { state: start, reason: null };
    }
    case 'inquire': {
      if (!knownPostOnSide(c.to)) return reject('unknown_post');
      const holder = holderOf(c.to);
      if (holder === null) return reject('vacant_post');
      if (c.subject !== null && !world.regionIds.includes(c.subject)) return reject('unknown_region');
      sendVerb(ctx, start, principal, holder, c.to, c.route, body('inquire', { verbPost: c.to, verbSubject: c.subject }));
      return { state: start, reason: null };
    }
    case 'consult': {
      const record = start.situationStates[c.situation];
      if (record === undefined || record.sitStatus !== 'open') return reject('situation_not_open');
      for (const post of c.posts) if (!knownPostOnSide(post) || holderOf(post) === null) return reject('vacant_post');
      for (const post of [...c.posts].sort(strictCompare)) sendVerb(ctx, start, principal, holderOf(post)!, post, 'courier', body('consult', { verbPost: post, verbSubject: c.situation }));
      return { state: start, reason: null };
    }
    case 'observer': {
      if (!knownPostOnSide(c.to) || holderOf(c.to) === null) return reject('unknown_post');
      if (!knownPerson(ctx, c.person) || !knownOwnPerson(c.person) || c.person === principal || holderOf(c.to) === c.person) return reject('unknown_person');
      if (start.observerPostings[c.person] !== undefined) return reject('person_holds_post');
      sendVerb(ctx, start, principal, c.person, null, c.route, { ...body('observer', { verbPost: c.to }), verbHost: holderOf(c.to)! });
      return { state: start, reason: null };
    }
    case 'audience': {
      const holder = holderOf(c.to);
      if (!knownPostOnSide(c.to) || holder === null) return reject('unknown_post');
      const last = start.audienceHeld[holder];
      if (last !== undefined && ctx.day - last.audDay < rules.verbs.audience.cooldownDays) return reject('too_soon');
      const knowledge = knowledgeOf(start,seat);
      const subjectKnown = knowledge.knownSentOrders?.some(o => o.sentPost === c.to && o.sentKind === 'goal') === true ||
        knowledge.knownReports.some(r => r.knownReceivedDay <= start.stateDay && r.knownBody.reportDay <= start.stateDay && r.knownBody.reportPlan?.paperPost === c.to);
      if (!subjectKnown || c.counters.length > rules.verbs.audience.maxCounters || new Set(c.counters.map(k => k.kind)).size !== c.counters.length) return reject('bad_counters');
      const frames = world.map.world.people.find(p => p.id === holder)!.values.map(v => v.value).filter(v => !world.map.world.vocabularies.values.find(row => row.id === v)?.costOnly);
      for (const k of c.counters) {
        if (k.kind === 'frame' && (k.value === null || !frames.includes(k.value))) return reject('bad_counters');
        if (k.kind === 'adjust' && (k.boldness === null || !Number.isSafeInteger(k.boldness) || k.boldness < 0 || k.boldness > 1000)) return reject('bad_counters');
        if (k.kind === 'reinforce' && (k.from === null || !knownPostOnSide(k.from as PostId) || holderOf(k.from as PostId) === null || k.from === c.to || k.men === null || !Number.isSafeInteger(k.men) || k.men < 1)) return reject('bad_counters');
      }
      // Whether those counters still answer his actual plan or grievances is checked with him, on arrival.
      sendVerb(ctx, start, principal, holder, c.to, 'in-person', { ...body('audience', { verbPost: c.to }), verbCounters: c.counters.map((k) => [k.kind, k.value, k.boldness, k.from, k.men] as const) });
      return { state: start, reason: null };
    }
    case 'promise': {
      if (!knownPerson(ctx, c.person) || !knownOwnPerson(c.person) || c.person === principal) return reject('unknown_person');
      if ((start.personPromises[c.person] ?? []).some((p) => p.promiseKind === 'advancement')) return reject('already_promised');
      fire(ctx, 'verbs.in_washington');
      return { state: applyPeopleChanges(start, [{ change: 'promise', person: c.person, kind: 'advancement', due: ctx.day + rules.verbs.promise.dueDays }, { change: 'clear_grievances', person: c.person, kinds: ['passed_over'] }], ctx.day, rules, world.map.world.vocabularies.ranks), reason: null };
    }
    case 'pressure': {
      if (!knownPerson(ctx, c.person) || !knownOwnPerson(c.person) || c.person === principal) return reject('unknown_person');
      fire(ctx, 'verbs.in_washington');
      return { state: applyPeopleChanges(start, [{ change: 'grievance', person: c.person, kind: 'pressured', weight: rules.verbs.pressure.weight, against: principal, cause: 'pressure' }], ctx.day, rules, world.map.world.vocabularies.ranks), reason: null };
    }
    case 'address': {
      if (!world.map.world.vocabularies.blocs.some((b) => b.id === c.bloc)) return reject('unknown_bloc');
      // Blocs are `politics`' (lane 1.6): a typed proposal, counted and not applied until that owner exists.
      ctx.proposals.push({ proposal: 'address', bloc: c.bloc, by: principal, side: sender.faction });
      fire(ctx, 'verbs.in_washington');
      return { state: start, reason: null };
    }
  }
}

type Subject = ReportBody['reportSubjectKind'];
type Advice = ReportBody['reportAdvice'];
type Kind = ReportBody['reportType'];

function answerBody(author: PersonId, authorPost: PostId | null, day: number, answers: MessageId, about: { kind: Subject; id: string }, claims: readonly ReportClaim[], advice: Advice, type: Kind = 'wire-dispatch', subtype: string | null = null): ReportBody {
  return {
    reportType: type,
    reportSubtype: subtype,
    reportAuthor: author,
    reportAuthorPost: authorPost,
    reportSubjectKind: about.kind,
    reportSubjectId: about.id,
    reportClaims: claims,
    reportDay: day,
    reportHour: null,
    reportAdvice: advice,
    reportAnswers: answers,
  };
}

const stated = (r: DirectiveResponse): StatedReason[] => r.statedReasons.map((x) => ({ reasonKind: x.kind, reasonWeight: 'gap' in x ? x.gap : 'weight' in x ? Math.min(1000, x.weight) : 1000 }));

/**
 * A verb's letter reaches its man: he answers through his compliance, `proxy` records the answer, and what he does
 * follows from what he actually decided. He reports what he chooses to say to whoever sent it.
 */
export function arriveVerb(ctx: TickContext, start: State, msg: TransitMessage): State {
  const world = ctx.world;
  const rules = world.map.world.rules.people;
  const v = msg.msgVerb!;
  const me = msg.msgTo;
  const target = v.verbPost;
  const expected = v.verbKind === 'observer' ? v.verbHost : msg.msgTo;
  if (target !== null && v.verbKind !== 'appoint' && expected !== undefined) {
    const failure = destinationFailure(ctx,start,target,expected,v.verbIssuer);
    if (failure !== null) return returnDispatch(ctx,start,msg,failure);
  }
  if (v.verbKind === 'audience') return holdAudience(ctx, start, msg);

  // Lane 1.4's oversight: a verb is an order to a person, read where he stands; an observer's or pressure's `watched` terms stack on top.
  const answer = answerOrder(world, start, me, v.verbIssuer, orderTerms(rules, `verb:${v.verbKind}`), { oversight: oversightOf(ctx, start, me, v.verbIssuer).value });
  const establishment = v.verbKind === 'appoint' && world.start.temporaryPosts.some(p => p.id === v.verbPost);
  let state = recordResponse(start, responseOf(answer, { order: msg.msgOrigin, person: me, post: establishment ? v.verbPost : msg.msgToPost, role: 'addressee', day: ctx.day, kind: `verb:${v.verbKind}` }));
  fire(ctx, 'verbs.answered');
  const changes: PeopleChange[] = [];
  let done = !DECLINES.has(answer.actual);
  let appointmentRefusal: AppointmentRefusal | null = null;
  const myPost = heldPost(state, me);
  const reportTo = (claims: readonly ReportClaim[], advice: Advice = null, type: Kind = 'wire-dispatch', subtype: string | null = null) =>
    sendReport(ctx, state, {
      body: answerBody(me, myPost, ctx.day, msg.msgOrigin, { kind: v.verbPost === null ? 'person' : 'post', id: v.verbPost ?? me }, claims, advice, type, subtype),
      truth: { truthTerms: answer.contributions.map((k) => term('relay_term', k.amount, { person: me, rule: k.term })), truthTrimmed: [] },
      to: v.verbIssuer,
      tag: `answer.${v.verbKind}.${v.verbPost ?? me}`,
    });
  const answered = (carried: boolean) => ({ claimKind: 'verb-answered' as const, claimRegion: null, claimValue: carried ? 1 : 0, claimToken: `${v.verbKind}:${answer.declared}`, claimConfidence: 1000 });
  const vocab = world.map.world.vocabularies.ranks;
  switch (v.verbKind) {
    case 'appoint': {
      const post = v.verbPost!;
      // The post may have filled, or he may have taken another, while the letter travelled: then he cannot take it.
      if ((state.personStatus[me]?.statusKind ?? 'serving') !== 'serving') appointmentRefusal = 'not_serving';
      else if (!sameSide(ctx, state, me, v.verbIssuer)) appointmentRefusal = 'other_side';
      else if ((state.postStates[post]?.postHolder ?? null) !== null) appointmentRefusal = 'post_held';
      else if (heldPost(state, me) !== v.verbTo) appointmentRefusal = 'person_holds_post';
      if (appointmentRefusal !== null) done = false;
      if (done) {
        try {
          const openingPost = state.postStates[post] === undefined;
          let next = v.verbTo === null ? state : relieveHolder(state, v.verbTo);
          if (next.postStates[post] === undefined) {
            const spec = declaredAppointment(world.map, next, world.start.temporaryPosts, post, sideOfPerson(world.map, next, v.verbIssuer)!);
            if (spec === undefined || (world.start.temporaryPosts.find(p => p.id === post)?.holder ?? me) !== me) throw new CommandError(['no appointment-created command is declared']);
            next = createTemporaryPost(world.map, next, { ...spec, holder: null });
          }
          // Keep both holder changes atomic: a failed destination guard leaves the old command intact.
          state = appointHolder(world.map, next, post, me);
          if (openingPost) fire(ctx, 'command.temporary_post_opened');
        } catch (e) {
          if (!(e instanceof CommandError)) throw e;
          done = false;
          appointmentRefusal = 'undeclared_post';
        }
      }
      if (done) {
        if (v.verbRank !== null) {
          const kind = vocab.find((r) => r.id === v.verbRank)!.kind;
          changes.push({ change: 'rank', person: me, kind, rank: v.verbRank, since: dateOf(state, ctx.day) });
        }
        if ((state.personPromises[me] ?? []).some((p) => p.promiseKind === 'advancement')) {
          changes.push({ change: 'promise_settled', person: me, kind: 'advancement' });
          fire(ctx, 'people.promise_kept');
        }
      }
      break;
    }
    case 'relieve': {
      const post = v.verbPost!;
      // Relief is the principal's authority: it happens whatever he says. "At his own request" needs his request;
      // a man who will not ask is relieved outright, and says so.
      let mode = v.verbMode as 'quiet_department' | 'own_request' | 'outright';
      if (mode === 'own_request' && DECLINES.has(answer.actual)) mode = 'outright';
      if (state.postStates[post]?.postHolder === me) {
        state = relieveHolder(state, post);
        if (mode === 'quiet_department' && v.verbTo !== null && state.postStates[v.verbTo]?.postHolder === null) {
          try {
            state = appointHolder(world.map, state, v.verbTo, me);
          } catch (e) {
            if (!(e instanceof CommandError)) throw e;
            mode = 'outright';
          }
        }
        const r = rules.verbs.relief.find((x) => x.mode === mode)!;
        changes.push({ change: 'grievance', person: me, kind: 'relieved', weight: r.grievanceWeight, against: v.verbIssuer, cause: mode });
        if (r.regardDelta !== 0) changes.push({ change: 'regard', person: me, toward: v.verbIssuer, delta: r.regardDelta });
        if (r.standingDelta !== 0) changes.push({ change: 'standing', person: me, delta: r.standingDelta });
        done = true;
      } else done = false;
      break;
    }
    case 'transfer': {
      const from = v.verbPost!;
      if (done && state.postStates[from]?.postHolder === me && state.postStates[v.verbTo!] !== undefined) {
        // He picks the blocks (0033), by his own answer: a willing man sends what was asked from his best; a man who
        // drags his feet sends his worst; one who reinterprets sends half.
        const amount = answer.actual === 'reinterpret' ? Math.max(1, Math.trunc((v.verbAmount ?? 0) / 2)) : (v.verbAmount ?? 0);
        const pick = WILLING.has(answer.actual) ? 'strongest_first' : 'weakest_first';
        try {
          const lotRequest = v.verbMode === 'men' || (world.map.world.organisationTemplates?.some(t=>t.army===v.verbTo)===true && world.map.world.rules.recruitment.raisingPostKinds.includes(state.postStates[from]!.postKind));
          const requestedMen = v.verbMode === 'men' ? amount : amount * (world.map.world.rules.recruitment.planningRegiments??1) * world.map.world.rules.recruitment.menPerRegiment;
          const result = lotRequest ? transferLots(world.map,state,from,v.verbTo!,requestedMen,pick,ctx.day) : transferForce(world.map,state,from,v.verbTo!,{force:'blocks',count:amount},pick);
          state = result.state;
          done = result.moved.length > 0;
          // A transfer concentrates (lane 1.12, the lead's Fix 1): what was handed over is ordered to join the receiving
          // post at its seat (its home region in pack data), and marches there by movement's own routes.
          const seat = state.postStates[v.verbTo!]!.postSeat;
          if (seat !== null) state = orderJoins(state, result.moved, v.verbTo!, seat, ctx.day);
        } catch (e) {
          if (!(e instanceof CommandError)) throw e;
          done = false;
        }
      } else done = false;
      break;
    }
    case 'inquire': {
      // His patience (0040): past the week's free inquiries, each one adds a grievance.
      const asked = (state.personInquiries[me] ?? []).filter((d) => ctx.day - d < rules.verbs.weekDays).length;
      changes.push({ change: 'inquiry', person: me, keepDays: rules.verbs.weekDays });
      if (asked >= rules.verbs.inquiry.freePerWeek) changes.push({ change: 'grievance', person: me, kind: 'pestered', weight: rules.verbs.inquiry.pesteredWeight, against: v.verbIssuer, cause: 'inquiry' });
      if (done) {
        // His report, shaded by him: where he stands, and the enemy as he believes it (0008).
        const claims: ReportClaim[] = [];
        if (myPost !== null && isFieldPost(world, state, myPost)) claims.push({ claimKind: 'position', claimRegion: headquartersOf(world, state, myPost), claimValue: 0, claimToken: null, claimConfidence: 1000 });
        const subject = v.verbSubject as RegionId | null;
        if (subject !== null) {
          const belief = enemyBeliefs(state, world.rules.traits, traitsOf(world, state, me), knowledgeOf(state, seatIdFor(me))).get(subject);
          if (belief !== undefined) claims.push({ claimKind: 'enemy-strength', claimRegion: subject, claimValue: belief.value, claimToken: null, claimConfidence: ctx.world.map.world.rules.reportConfidence.inquiryEnemyStrength });
        }
        claims.push(answered(true));
        state = applyPeopleChanges(state, changes, ctx.day, rules, vocab);
        reportTo(claims);
        return state;
      }
      break;
    }
    case 'consult': {
      const sit = v.verbSubject!;
      const record = state.situationStates[sit as never];
      if (done && record !== undefined && record.sitStatus === 'open') {
        // He recommends by his values (0040: as a delegate decides), and his answer becomes a stance on record.
        const def = world.situation(sit as never);
        const choice = situationChoice(def, record.sitOpenOptions, [], traitsOf(world, state, me).values);
        const best = [...choice.options].sort((a, b) => b.score - a.score || strictCompare(a.optionId, b.optionId))[0];
        if (best !== undefined) {
          const confidence = Math.max(ctx.world.map.world.rules.reportConfidence.consultMinimum, best.score);
          changes.push({ change: 'stance', person: me, subject: sit, recommends: best.optionId, confidence });
          state = applyPeopleChanges(state, changes, ctx.day, rules, vocab);
          reportTo([answered(true)], { adviceRecommends: best.optionId, adviceReasons: stated(answer), adviceConfidence: confidence }, 'advice', 'requested');
          fire(ctx, 'verbs.consulted');
          return state;
        }
      }
      done = false;
      break;
    }
    case 'observer': {
      const post = v.verbPost!;
      const watched = state.postStates[post]?.postHolder ?? null;
      if (done && watched !== null) {
        state = postObserver(state, me, post, v.verbIssuer, ctx.day);
        changes.push({ change: 'grievance', person: watched, kind: 'monitored', weight: rules.verbs.observer.monitoredWeight, against: v.verbIssuer, cause: 'observer' });
      } else done = false;
      break;
    }
  }
  state = applyPeopleChanges(state, changes, ctx.day, rules, vocab);
  if (!done) {
    fire(ctx, 'verbs.declined');
    ctx.events.push({ event: 'objected', person: me, post: msg.msgToPost, message: msg.msgOrigin, terms: [term('relay_objection', answer.willingness, { person: me, rule: answer.actual })] });
  }
  if (appointmentRefusal !== null) {
    reportTo([answered(false), { claimKind: 'appointment-refused', claimRegion: null, claimValue: 0, claimToken: appointmentRefusal, claimConfidence: 1000 }]);
  } else if (!done && DECLINES.has(answer.actual)) {
    reportTo([answered(false)], { adviceRecommends: 'withdraw-order', adviceReasons: stated(answer), adviceConfidence: ctx.world.map.world.rules.reportConfidence.verbObjection }, 'advice', 'memorandum');
  } else reportTo([answered(done)]);
  return state;
}

/** The ISO date of a day (rank dates are dates, 0050); the day's number without a calendar. */
function dateOf(state: State, day: number): string {
  return state.calendarStart === null ? String(day) : formatIsoDate(dateOfDay(state.calendarStart, day));
}

/** Observer letters on their cadence (0040): each observer writes to his sender what he sees at the headquarters. */
export function observerLetters(ctx: TickContext, start: State): State {
  const rules = ctx.world.map.world.rules.people;
  let state = start;
  for (const o of Object.keys(start.observerPostings).sort(strictCompare) as PersonId[]) {
    const p = start.observerPostings[o]!;
    if (ctx.day - p.obsLastLetter < rules.verbs.observer.letterEveryDays) continue;
    const holder = state.postStates[p.obsPost]?.postHolder ?? null;
    const claims: ReportClaim[] = [];
    if (isFieldPost(ctx.world, state, p.obsPost)) claims.push({ claimKind: 'position', claimRegion: headquartersOf(ctx.world, state, p.obsPost), claimValue: 0, claimToken: null, claimConfidence: 1000 });
    if (holder !== null) claims.push({ claimKind: 'goal-status', claimRegion: null, claimValue: 0, claimToken: (state.planRecords[p.obsPost]?.planStatus ?? 'holding') as string, claimConfidence: ctx.world.map.world.rules.reportConfidence.observerGoalStatus });
    sendReport(ctx, state, {
      body: answerBody(o, null, ctx.day, `m.${p.obsSince}.observer.${o}` as MessageId, { kind: 'post', id: p.obsPost }, claims, null, 'observer-letter'),
      truth: { truthTerms: [], truthTrimmed: [] },
      to: p.obsSender,
      tag: `observer.${o}`,
      ...(isFieldPost(ctx.world, state, p.obsPost) ? { fromRegion: headquartersOf(ctx.world, state, p.obsPost) } : {}),
    });
    state = noteLetter(state, o, ctx.day);
    fire(ctx, 'reports.observer_letter');
  }
  return state;
}

/** An audience reaches the commander; its counters take effect only now. */
function holdAudience(ctx: TickContext, start: State, msg: TransitMessage): State {
  const world = ctx.world;
  const rules = world.rules.people;
  const principal = msg.msgVerb!.verbIssuer;
  const post = msg.msgVerb!.verbPost!;
  const counters: readonly CounterTerms[] = (msg.msgVerb!.verbCounters ?? []).map(([kind, value, boldness, from, men]) => ({ kind, value, boldness, from, men }));
  const holder = msg.msgTo;
  const last = start.audienceHeld[holder];
  const outcome = previewAudience(world, start, principal, post, counters, ctx.day, null, planReading(world, start, post, ctx.day), oversightOf(ctx, start, holder, principal).value);
  const unavailable = last !== undefined && ctx.day - last.audDay < rules.verbs.audience.cooldownDays ? 'too_soon' : typeof outcome === 'string' || outcome.problems.length > 0 ? 'bad_counters' : null;
  if (unavailable !== null || typeof outcome === 'string') {
    sendReport(ctx, start, {
      body: answerBody(holder, post, ctx.day, msg.msgOrigin, { kind: 'post', id: post }, [{ claimKind: 'verb-answered', claimRegion: null, claimValue: 0, claimToken: `audience:${unavailable}`, claimConfidence: 1000 }], null),
      truth: { truthTerms: [term('observed', 0, { person: holder, post, rule: unavailable ?? 'bad_counters' })], truthTrimmed: [] },
      to: principal, tag: `answer.audience.${post}`,
    });
    return start;
  }
  let state = applyPeopleChanges(start, outcome.changes, ctx.day, rules, world.map.world.vocabularies.ranks);
  for (const o of outcome.recall) state = recallObserver(state, o);
  state = recordAudience(state, holder, { audDay: ctx.day, audAbout: outcome.about, audCounters: counters.map((k) => k.kind) });
  const key = msg.msgOrigin;
  state = recordResponse(state, responseOf(outcome.response, { order: key, person: holder, post: post, role: 'addressee', day: ctx.day, kind: 'verb:audience' }));
  // File what the visitor said through received knowledge, never his private
  // response. The existing seat view and both desks can read this answer.
  sendReport(ctx, state, {
    body: answerBody(holder, post, ctx.day, key, { kind: 'post', id: post }, [
      { claimKind: 'verb-answered', claimRegion: null, claimValue: 1, claimToken: `audience:${outcome.declared}`, claimConfidence: 1000 },
    ], { adviceRecommends: outcome.declared, adviceReasons: stated(outcome.response), adviceConfidence: 1000 }),
    truth: { truthTerms: outcome.response.contributions.map(k => term('relay_term', k.amount, { person: holder, post, rule: k.term })), truthTrimmed: [] },
    to: principal, tag: `answer.audience.${post}`, route: 'in-person',
  });
  // A promised reinforcement is itself an order, to another holder who may drag his feet (P1).
  if (outcome.reinforce !== null) {
    const sender = believedHolder(state, principal, outcome.reinforce.from);
    if (sender !== null) sendVerb(ctx, state, principal, sender, outcome.reinforce.from, 'courier', body('transfer', { verbPost: outcome.reinforce.from, verbTo: post, verbMode: 'men', verbAmount: outcome.reinforce.men }));
  }
  fire(ctx, 'verbs.audience');
  ctx.events.push({ event: 'audience', person: holder, post: post, message: null, terms: outcome.response.contributions.map((k) => term('relay_term', k.amount, { person: holder, post: post, rule: k.term })) });
  return state;
}
