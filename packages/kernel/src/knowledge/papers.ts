/** The receipt evidence a doctrine selector can read. Every result is derived from the acting seat's papers. */
import { strictCompare } from '../compare.ts';
import type { MessageId, PersonId, PostId } from '../ids.ts';
import { letterKey, type LetterIdentity } from '../world/letters.ts';
import type { PrincipalDoctrine } from '../world/world.ts';
import type { PaperClaimSelector, PaperDecision, PaperSelector, ReceivedPaperClaim, ReportPaperSelector } from '../world/paper-selectors.ts';
import type { KnownPaperReceipt, SeatKnowledge } from './knowledge.ts';
import type { ReportBody, ReportClaim, ReportType, SubjectKind } from './report.ts';
import { templateFor, type ReportTemplate } from './templates.ts';

export interface ReceivedPaperReport {
  readonly receiptAuthor: PersonId;
  readonly receiptAuthorPost: PostId | null;
  readonly receiptSubjectKind: SubjectKind;
  readonly receiptSubjectId: string;
  readonly receiptType: ReportType;
  readonly receiptSubtype: string | null;
  readonly receiptAnswers: MessageId | null;
  readonly receiptWrittenDay: number;
  readonly receiptClaims: readonly ReceivedPaperClaim[];
}

function ownOrigin(knowledge: SeatKnowledge, identity: LetterIdentity, post: PostId | null = null): MessageId | undefined {
  return knowledge.knownDoctrineDispatches?.find(d => letterKey(d.dispatchLetter) === letterKey(identity))?.dispatchOrigin ??
    knowledge.knownConsultationDispatches?.find(d => d.questionPost === post && letterKey(d.questionLetter) === letterKey(identity))?.questionOrigin;
}

function receivedMatches(selector: ReportPaperSelector, paper: ReceivedPaperReport, origin: MessageId | null | undefined): boolean {
  return origin !== undefined && paper.receiptAnswers === origin && paper.receiptAuthor === selector.author && paper.receiptAuthorPost === selector.authorPost &&
    paper.receiptSubjectKind === selector.subjectKind && paper.receiptSubjectId === selector.subjectId && paper.receiptType === selector.reportType &&
    paper.receiptSubtype === selector.reportSubtype;
}

function originFor(selector: ReportPaperSelector, knowledge: SeatKnowledge): MessageId | null | undefined {
  return selector.answers === undefined ? null : ownOrigin(knowledge, selector.answers, selector.authorPost);
}

function compareWitnesses(a: KnownPaperReceipt, b: KnownPaperReceipt): number {
  return a.receiptReport!.receiptWrittenDay - b.receiptReport!.receiptWrittenDay || a.receiptDay - b.receiptDay || strictCompare(a.receiptOrigin, b.receiptOrigin);
}

export function paperReadiness(selectors: readonly PaperSelector[], knowledge: SeatKnowledge, day: number, templates: readonly ReportTemplate[]): PaperDecision[] {
  const receipts = knowledge.knownPaperReceipts ?? [];
  return selectors.map((selector): PaperDecision => {
    if (selector.kind === 'letter') {
      const receipt = receipts.find(r => r.receiptLetter !== undefined && r.receiptDay <= day && r.receiptRole === selector.role &&
        r.receiptPost === selector.post && r.receiptIssuer === selector.issuer && letterKey(r.receiptLetter) === letterKey(selector.letter));
      return receipt === undefined ? { status: 'missing', reason: 'no_receipt' } : { status: 'received', origin: receipt.receiptOrigin, receivedDay: receipt.receiptDay };
    }
    const origin = originFor(selector, knowledge);
    if (origin === undefined) return { status: 'missing', reason: 'no_dispatch' };
    const latest = receipts.filter(r => r.receiptDay <= day && r.receiptReport !== undefined && r.receiptReport.receiptWrittenDay <= day &&
      receivedMatches(selector, r.receiptReport, origin)).sort(compareWitnesses).at(-1);
    if (latest === undefined) return { status: 'missing', reason: 'no_receipt' };
    const paper = latest.receiptReport!;
    const claims: ReceivedPaperClaim[] = [];
    const bound = selector.claims ?? [];
    const maxAge = templateFor(templates, selector.reportType, selector.reportSubtype).maxAgeDays;
    if ((bound.length > 0 || origin === null) && day - paper.receiptWrittenDay > maxAge) return { status: 'missing', reason: 'stale', origin: latest.receiptOrigin };
    for (const claim of bound) {
      const found = paper.receiptClaims.find(c => c.receiptClaimKind === claim.kind && c.receiptClaimRegion === claim.region && c.receiptClaimToken === claim.token);
      if (found === undefined) return { status: 'missing', reason: 'missing_claim', origin: latest.receiptOrigin, claim };
      if ((claim.min !== undefined && found.receiptClaimValue < claim.min) || (claim.max !== undefined && found.receiptClaimValue > claim.max)) {
        return { status: 'missing', reason: 'claim_bound', origin: latest.receiptOrigin, claim };
      }
      claims.push(found);
    }
    return { status: 'received', origin: latest.receiptOrigin, receivedDay: latest.receiptDay, ...(claims.length === 0 ? {} : { claims }) };
  });
}

export function hasRequiredPapers(selectors: readonly PaperSelector[] | undefined, knowledge: SeatKnowledge, day: number, templates: readonly ReportTemplate[]): boolean {
  return selectors === undefined || paperReadiness(selectors, knowledge, day, templates).every(r => r.status === 'received');
}

/** Authored field goals release their report references after the first dispatch. */
function liveReportSelectors(doctrine: PrincipalDoctrine, held: SeatKnowledge): ReportPaperSelector[] {
  return [...doctrine.offensives.filter(o => o.letter === undefined || ownOrigin(held, o.letter) === undefined),
    ...(doctrine.concentrations ?? []), ...doctrine.calls, ...(doctrine.proposalAnswers ?? [])]
    .flatMap(o => o.requiresPapers ?? []).filter(s => s.kind === 'report');
}

function matchingSelectors(paper: ReceivedPaperReport, doctrine: PrincipalDoctrine, held: SeatKnowledge): ReportPaperSelector[] {
  return liveReportSelectors(doctrine, held).filter(s => receivedMatches(s, paper, originFor(s, held)));
}

function claimMatches(c: ReportClaim, pick: PaperClaimSelector): boolean {
  return c.claimKind === pick.kind && c.claimRegion === pick.region && c.claimToken === pick.token;
}

/** Only exact selector details and delivered claim values enter a witness. `msgTruth` is unavailable here. */
export function reportWitness(doctrine: PrincipalDoctrine, held: SeatKnowledge, body: ReportBody): ReceivedPaperReport | undefined {
  const paper: ReceivedPaperReport = { receiptAuthor: body.reportAuthor, receiptAuthorPost: body.reportAuthorPost, receiptSubjectKind: body.reportSubjectKind,
    receiptSubjectId: body.reportSubjectId, receiptType: body.reportType, receiptSubtype: body.reportSubtype,
    receiptAnswers: body.reportAnswers, receiptWrittenDay: body.reportDay, receiptClaims: [] };
  const selectors = matchingSelectors(paper, doctrine, held);
  if (selectors.length === 0) return undefined;
  const claims = selectors.flatMap(s => s.claims ?? []);
  return { ...paper, receiptClaims: body.reportClaims.filter(c => Number.isSafeInteger(c.claimValue) && claims.some(pick => claimMatches(c, pick)))
    .map(c => ({ receiptClaimKind: c.claimKind, receiptClaimRegion: c.claimRegion, receiptClaimToken: c.claimToken, receiptClaimValue: c.claimValue })) };
}

export function keepLatestReportWitness(receipts: readonly KnownPaperReceipt[], witness: KnownPaperReceipt): readonly KnownPaperReceipt[] {
  const paper = witness.receiptReport!;
  const prior = receipts.find(r => r.receiptReport !== undefined && sameReportGroup(r.receiptReport, paper));
  if (prior !== undefined && compareWitnesses(prior, witness) >= 0) return receipts;
  return [...receipts.filter(r => r !== prior), witness];
}

function sameReportGroup(a: ReceivedPaperReport, b: ReceivedPaperReport): boolean {
  return a.receiptAnswers === b.receiptAnswers && a.receiptAuthor === b.receiptAuthor && a.receiptAuthorPost === b.receiptAuthorPost &&
    a.receiptSubjectKind === b.receiptSubjectKind && a.receiptSubjectId === b.receiptSubjectId && a.receiptType === b.receiptType && a.receiptSubtype === b.receiptSubtype;
}

export function stillReferenced(receipt: KnownPaperReceipt, doctrine: PrincipalDoctrine | undefined, held: SeatKnowledge): boolean {
  if (receipt.receiptReport === undefined) return true;
  return doctrine !== undefined && matchingSelectors(receipt.receiptReport, doctrine, held).length > 0;
}
