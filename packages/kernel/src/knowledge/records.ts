import type { MessageId, PostId } from '../ids.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { ReportBody } from './report.ts';

/** A report as a seat holds it: what it says, and how and when it came. */
export interface KnownReport {
  /** The report's id (its first message's id). */
  readonly id: MessageId;
  readonly knownReceivedDay: number;
  readonly knownRoute: RouteKind;
  readonly knownVia: readonly PostId[];
  readonly knownBody: ReportBody;
  /** Derived when resolving the shared opening bulletin, never inferred from a date or author. */
  readonly knownPublicOpening?: true;
}
