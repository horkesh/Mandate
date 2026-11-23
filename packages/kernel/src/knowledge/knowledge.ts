/**
 * Knowledge per seat (writer: `knowledge`; FOUNDATION section 8; decision 0015).
 *
 * Each seat stores the reports that reached it, when and by what route.
 * Beliefs are derived on read (`beliefs.ts`), never stored. Faded reports are
 * pruned by the templates' age and supersession rules. The map keeps bounded
 * excerpts of expired reports for its dated marks. The truth behind each
 * held report is kept beside it and dropped when no seat holds it.
 */
import { strictCompare } from '../compare.ts';
import type { MessageId, PersonId, PostId, SeatId } from '../ids.ts';
import type { TransitMessage } from '../messages/transit.ts';
import { seatIdFor } from '../seats/seats.ts';
import type { PlanGoal } from '../plans/goal.ts';
import type { State } from '../root-state.ts';
import { controlEvidence } from './control-beliefs.ts';
import type { KnownReport } from './records.ts';
import { templateKey, type ReportBody, type ReportClaim } from './report.ts';
import { templateFor, type ReportTemplate } from './templates.ts';
import type { ReportTruth } from './truth.ts';
import { sameGoal } from '../plans/goal.ts';
import { letterKey, type LetterIdentity } from '../world/letters.ts';
import type { PrincipalDoctrine } from '../world/world.ts';
import { keepLatestReportWitness, reportWitness, stillReferenced, type ReceivedPaperReport } from './papers.ts';

export type { KnownReport } from './records.ts';
export { paperReadiness } from './papers.ts';

export interface KnownSentAppointment {
  readonly appointmentPost: PostId;
  readonly appointmentPerson: PersonId;
  readonly appointmentMessage: MessageId;
  readonly appointmentDay: number;
}

export interface SeatKnowledge {
  /** The sender's unanswered appointment copies; never reconstructed from a private response. */
  readonly knownSentAppointments?: readonly KnownSentAppointment[];
  /** At most the last independent goal, goal-proposal answer and plan-review reply per post, and one copy per named concentration. */
  readonly knownSentOrders?: readonly KnownSentOrder[];
  /** One entry per declared authored letter, with its first and latest dispatch. */
  readonly knownDoctrineDispatches?: readonly KnownDoctrineDispatch[];
  /** Named letters and selected final report deliveries, independent of ordinary report retention. */
  readonly knownPaperReceipts?: readonly KnownPaperReceipt[];
  /** In (received day, id) order. */
  readonly knownReports: readonly KnownReport[];
  /** Control excerpts of expired reports still supporting the map, in the same order. */
  readonly knownControlReports?: readonly KnownReport[];
  /** A shared day-zero bulletin. Its body lives in the opening report table. */
  readonly knownOpeningControl?: MessageId;
}

export interface KnownDoctrineDispatch {
  readonly dispatchLetter: LetterIdentity;
  readonly dispatchOrigin: MessageId;
  readonly dispatchDay: number;
  readonly dispatchLatest?: MessageId;
}

export interface KnownPaperReceipt {
  readonly receiptOrigin: MessageId;
  readonly receiptPerson: PersonId;
  readonly receiptPost: PostId | null;
  readonly receiptRole: 'relay' | 'addressee';
  readonly receiptDay: number;
  readonly receiptLetter?: LetterIdentity;
  readonly receiptIssuer?: PersonId;
  readonly receiptReport?: ReceivedPaperReport;
}

/** Record the first actual arrival for a named paper, person, post and role. */
export function rememberLetterReceipt(state: State, message: TransitMessage, day: number): State {
  const letter = message.msgOrder?.orderLetter;
  if (letter === undefined || message.msgRole === 'filter') return state;
  const seat = seatIdFor(message.msgTo);
  const held = storedKnowledgeOf(state, seat);
  const receipts = held.knownPaperReceipts ?? [];
  if (receipts.some(r => r.receiptLetter !== undefined && r.receiptRole === message.msgRole && r.receiptPost === message.msgToPost &&
    r.receiptIssuer === message.msgOrder!.orderIssuer && letterKey(r.receiptLetter) === letterKey(letter))) return state;
  const receipt: KnownPaperReceipt = { receiptOrigin: message.msgOrigin, receiptPerson: message.msgTo, receiptPost: message.msgToPost,
    receiptRole: message.msgRole, receiptDay: day, receiptLetter: letter, receiptIssuer: message.msgOrder!.orderIssuer };
  return { ...state, knowledgeBySeat: { ...state.knowledgeBySeat, [seat]: { ...held, knownPaperReceipts: [...receipts, receipt] } } };
}

export interface KnownSentOrder {
  readonly sentPost: PostId;
  readonly sentMessage: MessageId;
  readonly sentKind: 'mandate' | 'goal' | 'approve' | 'send_back' | 'edit' | 'decline_proposal' | 'go' | 'transfer';
  readonly sentDoctrine?: string;
  readonly sentLetter?: LetterIdentity;
  readonly sentProposal?: NonNullable<TransitMessage['msgOrder']>['orderProposal'];
  readonly sentPlan?: MessageId;
  readonly sentReaffirms?: MessageId;
  readonly sentDay: number;
  readonly sentPaper: MessageId | null;
  /** The principal's own goal terms, copied at sending; never a live commander plan. */
  readonly sentGoal?: PlanGoal;
}

/** Knowledge owns the sender's copy, filed when a message first enters transit, never when its private answer changes. */
export function rememberSentOrders(start: State, messages: readonly TransitMessage[]): State {
  let state = start;
  for (const message of messages) {
    const verb = message.msgVerb;
    if (verb?.verbKind === 'transfer' && verb.verbPost !== null && verb.verbRegiments !== undefined && verb.verbSubject !== null &&
      message.msgFrom === verb.verbIssuer && message.msgSentDay === verb.verbIssuedDay) {
      const seat = seatIdFor(verb.verbIssuer);
      const held = storedKnowledgeOf(state, seat);
      const old = held.knownSentOrders ?? [];
      if (state.seatAssignments[seat] !== undefined && !old.some(o => o.sentKind === 'transfer' && o.sentDoctrine === verb.verbSubject)) {
        const row: KnownSentOrder = { sentKind: 'transfer', sentPost: verb.verbPost, sentMessage: message.msgOrigin,
          sentDay: verb.verbIssuedDay, sentDoctrine: verb.verbSubject, sentPaper: null };
        state = { ...state, knowledgeBySeat: { ...state.knowledgeBySeat, [seat]: { ...held, knownSentOrders: [...old, row] } } };
      }
    }
    if (verb?.verbKind === 'appoint' && verb.verbPost !== null && message.msgFrom === verb.verbIssuer && message.msgSentDay === verb.verbIssuedDay) {
      const seat = seatIdFor(verb.verbIssuer);
      if (state.seatAssignments[seat] !== undefined) {
        const held = storedKnowledgeOf(state, seat);
        const old = held.knownSentAppointments ?? [];
        if (!old.some(a => a.appointmentMessage === message.msgOrigin)) {
          const row: KnownSentAppointment = { appointmentPost: verb.verbPost, appointmentPerson: message.msgTo, appointmentMessage: message.msgOrigin, appointmentDay: verb.verbIssuedDay };
          state = { ...state, knowledgeBySeat: { ...state.knowledgeBySeat, [seat]: { ...held, knownSentAppointments: [...old.filter(a => a.appointmentPost !== row.appointmentPost),row].sort((a,b) => strictCompare(a.appointmentPost,b.appointmentPost)) } } };
        }
      }
    }
    const order = message.msgOrder;
    if (order === null || message.msgFrom !== order.orderIssuer || message.msgSentDay !== order.orderIssuedDay ||
      (!(['mandate','goal','approve','send_back','edit','decline_proposal'] as const).some(k => k === order.orderKind) && !(order.orderKind === 'go' && order.orderPlan !== undefined))) continue;
    const seat = seatIdFor(order.orderIssuer);
    if (state.seatAssignments[seat] === undefined) continue;
    const held = storedKnowledgeOf(state, seat);
    const old = held.knownSentOrders ?? [];
    if (old.some(o => o.sentMessage === message.msgOrigin)) continue;
    const paper = [...held.knownReports].filter(r => r.knownBody.reportPlan?.paperPost === order.orderTarget).sort((a,b) => b.knownBody.reportDay - a.knownBody.reportDay || strictCompare(b.id,a.id))[0];
    const previous = old.filter(o => o.sentPost === order.orderTarget && o.sentKind === 'goal').at(-1);
    const sameInstruction = order.orderLetter === undefined ? previous?.sentLetter === undefined : previous?.sentLetter !== undefined &&
      order.orderPriorDispatch === previous.sentMessage && letterKey(order.orderLetter) === letterKey(previous.sentLetter);
    const reaffirms = sameInstruction && order.orderKind === 'goal' && order.orderProposal === undefined && order.orderGoal !== null &&
      previous?.sentGoal !== undefined && sameGoal(previous.sentGoal, order.orderGoal) ? previous.sentReaffirms ?? previous.sentMessage : undefined;
    const doctrine = order.orderDoctrine ?? (reaffirms === undefined ? undefined : previous?.sentDoctrine);
    const row: KnownSentOrder = { sentPost: order.orderTarget, sentMessage: message.msgOrigin, sentKind: order.orderKind as KnownSentOrder['sentKind'], sentDay: order.orderIssuedDay,
      sentPaper: order.orderProposal === undefined ? paper?.id ?? null : null,
      ...(order.orderGoal === null ? {} : { sentGoal: order.orderGoal }),
      ...(doctrine === undefined ? {} : { sentDoctrine: doctrine }),
      ...(order.orderLetter === undefined ? {} : { sentLetter: order.orderLetter }),
      ...(order.orderProposal === undefined ? {} : { sentProposal: order.orderProposal }),
      ...(order.orderPlan === undefined ? {} : { sentPlan: order.orderPlan }),
      ...(reaffirms === undefined ? {} : { sentReaffirms: reaffirms }),
    };
    const kept = old.filter(o => {
      if (o.sentPost !== row.sentPost || o.sentKind === 'transfer') return true;
      if (row.sentKind === 'goal') {
        if (o.sentKind === 'goal') return row.sentProposal !== undefined &&
          (row.sentProposal.replyOrder === o.sentMessage || row.sentProposal.replyOrder === o.sentReaffirms);
        return o.sentKind !== 'decline_proposal' || reaffirms !== undefined;
      }
      if (row.sentKind === 'decline_proposal' || row.sentKind === 'go') return o.sentKind !== row.sentKind;
      return o.sentKind === 'goal' || o.sentKind === 'decline_proposal' || o.sentKind === 'go';
    });
    let dispatches = held.knownDoctrineDispatches;
    if (order.orderLetter !== undefined && message.id === message.msgOrigin) {
      const key = letterKey(order.orderLetter);
      const previous = dispatches?.find(d => letterKey(d.dispatchLetter) === key);
      if (previous === undefined || (order.orderPriorDispatch === (previous.dispatchLatest ?? previous.dispatchOrigin) && previous.dispatchOrigin !== message.msgOrigin)) {
        const dispatch = previous === undefined ? { dispatchLetter: order.orderLetter, dispatchOrigin: message.msgOrigin, dispatchDay: order.orderIssuedDay }
          : { ...previous, dispatchLatest: message.msgOrigin };
        dispatches = [...(dispatches ?? []).filter(d => d !== previous), dispatch].sort((a, b) => strictCompare(letterKey(a.dispatchLetter), letterKey(b.dispatchLetter)));
      }
    }
    state = { ...state, knowledgeBySeat: { ...state.knowledgeBySeat, [seat]: { ...held, knownSentOrders: [...kept,row].sort((a,b) => strictCompare(a.sentPost,b.sentPost) || strictCompare(a.sentKind,b.sentKind)),
      ...(dispatches === undefined ? {} : { knownDoctrineDispatches: dispatches }) } } };
  }
  return state;
}

/** Only a received answer closes the sender's letter; hidden arrival/response tables cannot do so. */
export function unansweredAppointments(state: State, principal: PersonId): readonly KnownSentAppointment[] {
  const held = knowledgeOf(state, seatIdFor(principal));
  const answers = new Set(held.knownReports.filter(r => r.knownReceivedDay <= state.stateDay && r.knownBody.reportDay <= state.stateDay).map(r => r.knownBody.reportAnswers));
  return (held.knownSentAppointments ?? []).filter(a => !answers.has(a.appointmentMessage));
}

function retireAppointments(held: SeatKnowledge, day: number): SeatKnowledge {
  if (held.knownSentAppointments === undefined) return held;
  const answers = new Set(held.knownReports.filter(r => r.knownReceivedDay <= day && r.knownBody.reportDay <= day).map(r => r.knownBody.reportAnswers));
  const pending = held.knownSentAppointments.filter(a => !answers.has(a.appointmentMessage));
  if (pending.length === held.knownSentAppointments.length) return held;
  const { knownSentAppointments: _answered, ...rest } = held;
  return pending.length === 0 ? rest : { ...held, knownSentAppointments: pending };
}

export const EMPTY_KNOWLEDGE: SeatKnowledge = Object.freeze({ knownReports: Object.freeze([]) });

function storedKnowledgeOf(state: State, seat: SeatId): SeatKnowledge {
  if (state.seatAssignments[seat] === undefined) throw new RangeError(`unknown seat id "${seat}"`);
  return state.knowledgeBySeat[seat] ?? EMPTY_KNOWLEDGE;
}

function openingReportOf(state: State, id: MessageId): KnownReport {
  const report = state.openingControlReports?.[id];
  if (report === undefined) throw new RangeError(`missing opening control report ${id}`);
  return state.openingControlClaims === undefined ? report : { ...report, knownBody: { ...report.knownBody, reportClaims: state.openingControlClaims } };
}

export type KnowledgeCache = WeakMap<SeatKnowledge, { readonly opening: KnownReport; readonly claims: readonly ReportClaim[] | undefined; readonly knowledge: SeatKnowledge }>;
/** Resolved public bulletins survive replacement of a seat's ordinary report list. */
export type OpeningReportCache = WeakMap<KnownReport, { readonly claims: readonly ReportClaim[] | undefined; readonly report: KnownReport }>;

/** What the seat holds, resolving its opening bulletin for the map without copying it into saved knowledge. */
export function knowledgeOf(state: State, seat: SeatId, cache?: KnowledgeCache, openings?: OpeningReportCache): SeatKnowledge {
  const held = storedKnowledgeOf(state, seat);
  if (held.knownOpeningControl === undefined) return held;
  const stored = state.openingControlReports?.[held.knownOpeningControl];
  const previous = cache?.get(held);
  if (previous !== undefined && previous.opening === stored && previous.claims === state.openingControlClaims) return previous.knowledge;
  let opening = stored === undefined ? undefined : openings?.get(stored);
  if (opening === undefined || opening.claims !== state.openingControlClaims) {
    opening = { claims: state.openingControlClaims, report: { ...openingReportOf(state, held.knownOpeningControl), knownPublicOpening: true } };
    openings?.set(stored!, opening);
  }
  const knowledge = { ...held, knownControlReports: [opening.report, ...(held.knownControlReports ?? [])] };
  cache?.set(held, { opening: stored!, claims: state.openingControlClaims, knowledge });
  return knowledge;
}

/** Give each seat its opening bulletin by reference and store each original report and its truth once. */
export function fileOpeningReports(state: State, copies: ReadonlyMap<SeatId, KnownReport>, claims: readonly ReportClaim[]): State {
  const knowledge = new Map<SeatId, SeatKnowledge>();
  const reports = new Map<MessageId, KnownReport>();
  for (const [seat, report] of copies) {
    knowledge.set(seat, { ...storedKnowledgeOf(state, seat), knownOpeningControl: report.id });
    reports.set(report.id, { ...report, knownBody: { ...report.knownBody, reportClaims: [] } });
  }
  return {
    ...state,
    knowledgeBySeat: { ...state.knowledgeBySeat, ...Object.fromEntries(knowledge) },
    openingControlReports: Object.fromEntries(reports),
    openingControlClaims: claims,
    reportTruth: { ...state.reportTruth, ...Object.fromEntries([...reports.keys()].map((id) => [id, { truthTerms: [], truthTrimmed: [], truthOpeningClaims: true as const }])) },
  };
}

function reportOrder(a: KnownReport, b: KnownReport): number {
  return a.knownReceivedDay - b.knownReceivedDay || strictCompare(a.id, b.id);
}

/** Reports and map excerpts that a seat may read, in (received day, id) order. */
export function reportsForView(knowledge: SeatKnowledge): readonly KnownReport[] {
  const archived = knowledge.knownControlReports;
  return archived === undefined ? knowledge.knownReports : [...knowledge.knownReports, ...archived].sort(reportOrder);
}

/** Store a delivered report in a seat's knowledge, and its truth beside it. */
export function deliverReport(state: State, seat: SeatId, report: KnownReport, truth: ReportTruth): State {
  const held = storedKnowledgeOf(state, seat);
  if (held.knownOpeningControl === report.id || held.knownReports.some((r) => r.id === report.id) || held.knownControlReports?.some((r) => r.id === report.id)) {
    throw new RangeError(`seat ${seat} already holds report ${report.id}`);
  }
  const knownReports = [...held.knownReports, report].sort(reportOrder);
  return {
    ...state,
    knowledgeBySeat: { ...state.knowledgeBySeat, [seat]: { ...held, knownReports } },
    reportTruth: state.reportTruth[report.id] === undefined ? { ...state.reportTruth, [report.id]: truth } : state.reportTruth,
  };
}

export interface ReportDelivery {
  readonly seat: SeatId;
  readonly report: KnownReport;
  readonly truth: ReportTruth;
  readonly paper?: { readonly doctrine: PrincipalDoctrine; readonly person: PersonId; readonly post: PostId | null };
}

/** Consecutive arrivals, with no intervening reader: copy each table and each seat's list only once. */
export function deliverReports(state: State, deliveries: readonly ReportDelivery[]): State {
  if (deliveries.length === 0) return state;
  const knowledge = { ...state.knowledgeBySeat };
  let truth: Record<MessageId, ReportTruth> | undefined;
  const lists = new Map<SeatId, KnownReport[]>();
  const ids = new Map<SeatId, Set<MessageId>>();
  const paperLists = new Map<SeatId, readonly KnownPaperReceipt[]>();
  for (const d of deliveries) {
    let reports = lists.get(d.seat);
    if (reports === undefined) {
      const held = storedKnowledgeOf(state, d.seat);
      reports = [...held.knownReports];
      lists.set(d.seat, reports);
      ids.set(d.seat, new Set([
        ...held.knownReports.map(r => r.id), ...(held.knownControlReports ?? []).map(r => r.id),
        ...(held.knownOpeningControl === undefined ? [] : [held.knownOpeningControl]),
      ]));
    }
    const seen = ids.get(d.seat)!;
    if (seen.has(d.report.id)) {
      if (d.paper !== undefined) continue;
      throw new RangeError(`seat ${d.seat} already holds report ${d.report.id}`);
    }
    seen.add(d.report.id);
    reports.push(d.report);
    if (d.paper !== undefined && d.report.knownBody.reportDay <= d.report.knownReceivedDay) {
      const held = storedKnowledgeOf(state, d.seat);
      const paper = reportWitness(d.paper.doctrine, held, d.report.knownBody);
      if (paper !== undefined) {
        const prior = paperLists.get(d.seat) ?? held.knownPaperReceipts ?? [];
        const receipt: KnownPaperReceipt = { receiptOrigin: d.report.id, receiptPerson: d.paper.person, receiptPost: d.paper.post,
          receiptDay: d.report.knownReceivedDay, receiptRole: 'addressee', receiptReport: paper };
        paperLists.set(d.seat, keepLatestReportWitness(prior, receipt));
      }
    }
    if ((truth ?? state.reportTruth)[d.report.id] === undefined) {
      truth ??= { ...state.reportTruth };
      truth[d.report.id] = d.truth;
    }
  }
  for (const [seat, reports] of lists) {
    const papers = paperLists.get(seat);
    knowledge[seat] = { ...storedKnowledgeOf(state, seat), knownReports: reports.sort(reportOrder),
      ...(papers === undefined ? {} : { knownPaperReceipts: papers }) };
  }
  return { ...state, knowledgeBySeat: knowledge, reportTruth: truth ?? state.reportTruth };
}

/**
 * The supersession key: a newer report with the same template, author and
 * subject replaces an older one. A report answering an order is about that
 * order, so it is superseded only by a later answer to the same order, never
 * by the author's routine reports.
 */
export function supersessionKey(body: ReportBody): string {
  const condition = body.reportStateCondition;
  const evidence = condition === undefined ? '' : `|condition:${condition.conditionSubject}:${condition.conditionFact}`;
  return `${templateKey(body.reportType, body.reportSubtype)}|${body.reportAuthor}|${body.reportSubjectKind}:${body.reportSubjectId}|${body.reportAnswers ?? ''}${evidence}`;
}

export interface PruneCounts {
  readonly byAge: number;
  readonly bySupersession: number;
}

/**
 * Drop reports older than their template's `maxAgeDays`, and reports
 * superseded by a newer one with the same key once older than
 * `keepSupersededDays`. Age runs from the report's stamp, not its arrival:
 * a stale report is stale however late it came. Truth no seat holds is dropped.
 */
export function pruneKnowledge(state: State, templates: readonly ReportTemplate[], day: number, controlThreshold: number,
  paperDoctrines?: ReadonlyMap<SeatId, PrincipalDoctrine>): { readonly state: State; readonly counts: PruneCounts } {
  let byAge = 0;
  let bySupersession = 0;
  let changed = false;
  const next: Record<SeatId, SeatKnowledge> = {};
  for (const seat of Object.keys(state.knowledgeBySeat).sort(strictCompare) as SeatId[]) {
    const original = state.knowledgeBySeat[seat]!;
    let held = retireAppointments(original, day);
    if (held.knownPaperReceipts?.some(r => r.receiptReport !== undefined)) {
      const kept = held.knownPaperReceipts.filter(r => stillReferenced(r, paperDoctrines?.get(seat), held));
      if (held.knownPaperReceipts.length !== kept.length) {
        const { knownPaperReceipts: _before, ...rest } = held;
        held = kept.length === 0 ? rest : { ...rest, knownPaperReceipts: kept };
      }
    }
    if (held !== original) changed = true;
    if (held.knownReports.length === 0) {
      next[seat] = held;
      continue;
    }
    const newest = new Map<string, number>();
    for (const r of held.knownReports) {
      const k = supersessionKey(r.knownBody);
      newest.set(k, Math.max(newest.get(k) ?? -1, stampOrder(r)));
    }
    const expiredControl: KnownReport[] = [];
    // Received institutional acts remain evidence after ordinary dispatches fade.
    // Keep the latest appointment and vacancy paper per post, service choice per
    // person, and official notice per subject. Never rebuild them from live posts.
    const institutional = new Map<string, KnownReport>();
    for (const r of held.knownReports) {
      const b = r.knownBody;
      if (b.reportDay > day || r.knownReceivedDay > day) continue;
      const keys: string[] = [];
      if (b.reportSubjectKind === 'situation' && b.reportType === 'wire-dispatch' && b.reportSubtype === null) keys.push(`notice:${b.reportSubjectId}`);
      // Promise terms and settlement are received contract evidence, kept independently of routine dispatch aging.
      for (const c of b.reportClaims) if (c.claimKind === 'promise-made' || c.claimKind === 'promise-kept' || c.claimKind === 'promise-broken') {
        keys.push(`promise:${b.reportAuthor}:${b.reportSubjectKind}:${b.reportSubjectId}:${c.claimToken}:${c.claimValue}:${c.claimKind}`);
      }
      if (b.reportSubjectKind === 'person' && b.reportSubjectId === b.reportAuthor && b.reportClaims.some(c => c.claimKind === 'service-choice')) keys.push(`service:${b.reportAuthor}`);
      if (b.reportSubjectKind === 'post') {
        if (b.reportClaims.some(c => c.claimKind === 'verb-answered' && c.claimValue === 1 && c.claimToken?.startsWith('appoint:'))) keys.push(`appointment:${b.reportSubjectId}`);
        if (b.reportClaims.some(c => (c.claimKind === 'appointment-refused' && c.claimToken === 'post_held') || c.claimKind === 'commander-lost' || (c.claimKind === 'order-returned' && (c.claimToken === 'vacant_post' || ['holder_changed','not_serving','other_side','not_raising_post'].includes(c.claimToken ?? ''))) || (c.claimKind === 'verb-answered' && c.claimValue === 1 && c.claimToken?.startsWith('relieve:')))) keys.push(`vacancy:${b.reportSubjectId}`);
      }
      for (const key of keys) {
        const prior = institutional.get(key);
        if (prior === undefined || stampOrder(r) > stampOrder(prior) || (stampOrder(r) === stampOrder(prior) && strictCompare(r.id, prior.id) > 0)) institutional.set(key, r);
      }
    }
    const institutionalPapers = new Set(institutional.values());
    const pendingPapers = new Map<string, KnownReport>();
    for (const r of held.knownReports) if (r.knownBody.reportPlan !== undefined) {
      const post = r.knownBody.reportPlan.paperPost;
      const prior = pendingPapers.get(post);
      if (prior === undefined || stampOrder(r) > stampOrder(prior)) pendingPapers.set(post,r);
    }
    const sent = new Set((held.knownSentOrders ?? []).filter(o => o.sentKind === 'goal').flatMap(o =>
      o.sentReaffirms === undefined ? [o.sentMessage] : [o.sentMessage, o.sentReaffirms]));
    const proposals = new Map<MessageId, KnownReport>();
    const switches = new Map<MessageId, KnownReport>();
    const keepLatest = (byLetter: Map<MessageId, KnownReport>, letter: MessageId, paper: KnownReport): void => {
      const prior = byLetter.get(letter);
      if (prior === undefined || stampOrder(paper) > stampOrder(prior) ||
        (stampOrder(paper) === stampOrder(prior) && strictCompare(paper.id, prior.id) > 0)) byLetter.set(letter, paper);
    };
    for (const r of held.knownReports) {
      const b = r.knownBody;
      if (b.reportAnswers === null || !sent.has(b.reportAnswers)) continue;
      if (b.reportProposal !== undefined) keepLatest(proposals, b.reportAnswers, r);
      if (b.reportDiscretion !== undefined) keepLatest(switches, b.reportAnswers, r);
    }
    const readyFor = new Set([...sent, ...[...switches.values()].map(r => r.id)]);
    const readiness = new Map<MessageId, KnownReport>();
    const failureFor = new Set((held.knownSentOrders ?? []).filter(o => o.sentProposal !== undefined || o.sentKind === 'go').map(o => o.sentMessage));
    const failures = new Map<MessageId, KnownReport>();
    for (const r of held.knownReports) {
      const letter = r.knownBody.reportAnswers;
      if (letter === null) continue;
      if (readyFor.has(letter) && r.knownBody.reportClaims.some(c => c.claimKind === 'goal-status' && c.claimToken === 'ready')) keepLatest(readiness, letter, r);
      if (failureFor.has(letter) && r.knownBody.reportClaims.some(c => c.claimKind === 'order-returned' || c.claimKind === 'order-objected' ||
        (c.claimKind === 'order-obeyed' && c.claimValue === 0))) keepLatest(failures, letter, r);
    }
    const goalPapers = new Set([...proposals.values(), ...switches.values(), ...readiness.values(), ...failures.values()]);
    const kept = held.knownReports.filter((r) => {
      if (institutionalPapers.has(r)) return true;
      // Keep only the latest enclosure per post beyond ordinary dispatch pruning. A late refusal can reopen it;
      // the sender's bounded order copies still prevent an answered paper from becoming actionable again.
      if (r.knownBody.reportPlan !== undefined && pendingPapers.get(r.knownBody.reportPlan.paperPost) === r) return true;
      if (goalPapers.has(r)) return true;
      const tpl = templateFor(templates, r.knownBody.reportType, r.knownBody.reportSubtype);
      const age = day - r.knownBody.reportDay;
      const aged = age > tpl.maxAgeDays;
      const superseded = age > tpl.keepSupersededDays && stampOrder(r) < newest.get(supersessionKey(r.knownBody))!;
      if (!aged && !superseded) return true;
      const claims = r.knownBody.reportClaims.filter(isControlClaim);
      if (claims.length > 0) {
        const body = r.knownBody;
        expiredControl.push(claims.length === body.reportClaims.length && body.reportAdvice === null
          ? r
          : { ...r, knownBody: { ...body, reportClaims: claims, reportAdvice: null } });
      }
      if (aged) byAge++;
      else bySupersession++;
      return false;
    });
    if (kept.length === held.knownReports.length) {
      next[seat] = held;
      continue;
    }
    changed = true;
    let archive = held.knownControlReports;
    if (expiredControl.length > 0) {
      const candidates = [...(archive ?? []), ...expiredControl];
      const opening = held.knownOpeningControl === undefined ? [] : [openingReportOf(state, held.knownOpeningControl)];
      const sources = retainedControlSources([...opening, ...kept, ...candidates], controlThreshold);
      archive = candidates.filter((r) => sources.has(r.id)).sort(reportOrder);
    }
    next[seat] = {
      ...held,
      knownReports: kept,
      ...(archive === undefined || archive.length === 0 ? {} : { knownControlReports: archive }),
      ...(held.knownOpeningControl === undefined ? {} : { knownOpeningControl: held.knownOpeningControl }),
    };
  }
  if (!changed) return { state, counts: { byAge, bySupersession } };
  const live = new Set<string>();
  for (const k of Object.values(next)) {
    if (k.knownOpeningControl !== undefined) live.add(k.knownOpeningControl);
    for (const r of k.knownReports) live.add(r.id);
    for (const r of k.knownControlReports ?? []) live.add(r.id);
  }
  const truth: Record<MessageId, ReportTruth> = {};
  for (const id of Object.keys(state.reportTruth).sort(strictCompare) as MessageId[]) if (live.has(id)) truth[id] = state.reportTruth[id]!;
  return { state: { ...state, knowledgeBySeat: next, reportTruth: truth }, counts: { byAge, bySupersession } };
}

function isControlClaim(claim: ReportClaim): boolean {
  return claim.claimKind === 'control' || claim.claimKind === 'control-government';
}

/** Keep the map's evidence when its marks fade. At most four reports per region survive normal pruning this way. */
function retainedControlSources(reports: readonly KnownReport[], threshold: number): ReadonlySet<MessageId> {
  const retained = new Set<MessageId>();
  for (const { latest, corroboration, precedingChange, government } of controlEvidence(reports, threshold).values()) {
    retained.add(latest.report.id);
    if (corroboration !== undefined) retained.add(corroboration.id);
    if (precedingChange !== undefined) retained.add(precedingChange.id);
    if (government !== undefined) retained.add(government.report.id);
  }
  return retained;
}

/**
 * A report's place in time for supersession: its stamp day, then the day it
 * arrived (a report written the same day but received later is the newer copy).
 */
function stampOrder(r: KnownReport): number {
  return r.knownBody.reportDay * 100_000 + r.knownReceivedDay;
}
