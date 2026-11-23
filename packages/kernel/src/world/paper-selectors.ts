/** Pack receipt selectors and their public, derived explanations. */
import type { MessageId, PersonId, PostId, RegionId } from '../ids.ts';
import type { ClaimKind, ReportType, SubjectKind } from '../knowledge/report.ts';
import type { LetterIdentity } from './letters.ts';

export interface PaperClaimSelector {
  readonly kind: ClaimKind;
  readonly region: RegionId | null;
  readonly token: string | null;
  readonly min?: number;
  readonly max?: number;
}

export interface ReportPaperSelector {
  readonly kind: 'report';
  readonly author: PersonId;
  readonly authorPost: PostId | null;
  readonly subjectKind: SubjectKind;
  readonly subjectId: string;
  readonly reportType: ReportType;
  readonly reportSubtype: string | null;
  /** The acting seat's first dispatch of this letter; omission selects an uncorrelated report. */
  readonly answers?: LetterIdentity;
  readonly claims?: readonly PaperClaimSelector[];
}

export type PaperSelector = ReportPaperSelector | {
  readonly kind: 'letter';
  readonly issuer: PersonId;
  readonly letter: LetterIdentity;
  readonly post: PostId;
  readonly role: 'relay' | 'addressee';
};

export interface ReceivedPaperClaim {
  readonly receiptClaimKind: ClaimKind;
  readonly receiptClaimRegion: RegionId | null;
  readonly receiptClaimToken: string | null;
  readonly receiptClaimValue: number;
}

export type PaperDecision =
  | { readonly status: 'received'; readonly origin: MessageId; readonly receivedDay: number; readonly claims?: readonly ReceivedPaperClaim[] }
  | { readonly status: 'missing'; readonly reason: 'no_dispatch' | 'no_receipt' | 'stale' | 'missing_claim' | 'claim_bound'; readonly origin?: MessageId; readonly claim?: PaperClaimSelector };
