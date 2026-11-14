/**
 * What a seat sees (FOUNDATION section 8: the player-visible boundary).
 *
 * These types are the whole of what crosses from the kernel to a seat, the
 * console or (later) the interface and the AI caller. They are built only
 * from what the person may know: the reports that reached him, his goal,
 * where he stands, and beliefs derived from those reports. No truth term, no
 * trait, no message in transit, no other seat's knowledge.
 *
 * This file imports only plain vocabulary (ids, report and route words), and
 * `test/boundary.test.ts` proves its import closure never reaches State or
 * the truth layer.
 */
import type { FactionId, MessageId, PersonId, PostId, RegionId, SeatId } from '../ids.ts';
import type { ClaimKind, ReportType, SubjectKind } from '../knowledge/report.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { GoalKind } from '../plans/goal.ts';

export interface ClaimView {
  readonly kind: ClaimKind;
  readonly region: RegionId | null;
  readonly value: number;
  readonly token: string | null;
  readonly confidence: number;
}

export interface AdviceView {
  readonly recommends: string;
  readonly reasons: readonly { readonly kind: string; readonly weight: number }[];
  readonly confidence: number;
}

export interface ReportView {
  readonly id: MessageId;
  readonly type: ReportType;
  readonly subtype: string | null;
  readonly author: PersonId;
  readonly authorPost: PostId | null;
  readonly subjectKind: SubjectKind;
  readonly subjectId: string;
  readonly claims: readonly ClaimView[];
  readonly day: number;
  readonly hour: number | null;
  readonly advice: AdviceView | null;
  readonly answers: MessageId | null;
  readonly receivedDay: number;
  readonly route: RouteKind;
  /** The posts it passed on the way (a relay, a filter). What they did to it is not shown. */
  readonly via: readonly PostId[];
}

/** What he believes of the enemy in one region, and which report it rests on. */
export interface BeliefView {
  readonly value: number;
  readonly asOfDay: number;
  readonly source: MessageId;
}

export interface GoalView {
  readonly kind: GoalKind;
  readonly region: RegionId | null;
  readonly issuer: PersonId | null;
  readonly viaChain: boolean;
  readonly setDay: number;
}

export interface SeatView {
  /** The last completed day: the view is the morning after it. */
  readonly day: number;
  readonly seat: SeatId;
  readonly person: PersonId;
  readonly faction: FactionId;
  readonly post: PostId | null;
  /** Where he is. */
  readonly region: RegionId;
  readonly goal: GoalView | null;
  /** In (received day, id) order. */
  readonly reports: readonly ReportView[];
  readonly enemyBeliefs: Readonly<Record<RegionId, BeliefView>>;
}
