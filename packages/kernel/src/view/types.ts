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
import type { FactionId, MessageId, PersonId, PostId, RegionId, SeatId, SituationId } from '../ids.ts';
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

/** An option as the seat sees it: its label key and who argued for it, in display order. */
export interface SituationOptionView {
  readonly id: string;
  readonly label: string;
  readonly proposedBy: readonly PersonId[] | 'inaction';
  readonly group: string | null;
}

/**
 * A situation as the seat sees it, once news of it has reached him: its text
 * keys, the options open now, who wrote the staff line (the advice itself is a
 * report in his knowledge), and whether it waits or was handed on. Never its
 * historical default (0040, gate B9).
 */
export interface SituationView {
  readonly id: SituationId;
  readonly kind: 'decision' | 'notice';
  readonly title: string;
  readonly text: string;
  readonly status: 'decided' | 'lapsed' | 'noticed' | 'open' | 'waiting';
  readonly surfacedDay: number;
  readonly options: readonly SituationOptionView[];
  readonly chosen: readonly string[];
  readonly delegatedTo: PersonId | null;
  readonly staffAuthor: PersonId | null;
}

export interface SeatView {
  /** The last completed day: the view is the morning after it. */
  readonly day: number;
  readonly seat: SeatId;
  readonly person: PersonId;
  /** His side; null for a man of no side (a neutral state's officer, a foreigner). */
  readonly faction: FactionId | null;
  readonly post: PostId | null;
  /** Where he is. */
  readonly region: RegionId;
  readonly goal: GoalView | null;
  /** In (received day, id) order. */
  readonly reports: readonly ReportView[];
  readonly enemyBeliefs: Readonly<Record<RegionId, BeliefView>>;
  /** Situations that have reached him (as principal, or as the holder one was handed to), in id order. */
  readonly situations: readonly SituationView[];
}
