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
import type { EdgeId, FactionId, ForceBlockId, MessageId, PersonId, PostId, RegionId, SeatId, SituationId } from '../ids.ts';
import type { ControlShares, FrontSegment } from '../control/vocabulary.ts';
import type { ClaimKind, ReportType, SubjectKind } from '../knowledge/report.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { PlanStatus, Posture } from '../plans/goal.ts';

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
  /** Qualitative holdings in this report, derived with the pack's threshold. */
  readonly reportedControl?: readonly { readonly region: RegionId; readonly holder: FactionId | null; readonly contested: boolean }[];
  /** The public opening picture; preserved by presentation playback. */
  readonly openingControl?: true;
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

/** What he has been told of works in one region (lane 1.2): fortification, permille, and the report it rests on. */
export interface WorksView {
  readonly value: number;
  readonly asOfDay: number;
  readonly source: MessageId;
}

/** What he has been told of one water edge (lane 1.2): closed to his side or clear, and the works' region (null: a boom). */
export interface ObstructionView {
  readonly closed: boolean;
  readonly by: RegionId | null;
  readonly asOfDay: number;
  readonly source: MessageId;
}

export interface ControlBeliefSource {
  readonly report: MessageId;
  readonly author: PersonId;
  readonly authorPost: PostId | null;
  readonly asOfDay: number;
}

export interface ControlBeliefView {
  readonly shares: ControlShares;
  readonly holder: FactionId | null;
  /** Two or more factions trace the region, including a tie for the largest share. */
  readonly contested: boolean;
  readonly neutralGovernment: boolean;
  readonly asOfDay: number;
  readonly mark: 'ink' | 'pencil';
  /** Latest control report, independent corroboration if held, then the distinct government source if any. */
  readonly sources: readonly ControlBeliefSource[];
}

export interface ClaimedFrontView extends FrontSegment {
  /** The older of the two claims at its ends. */
  readonly asOfDay: number;
  /** Ink only where both ends are corroborated. */
  readonly mark: ControlBeliefView['mark'];
}

/** The goal he was given (lane 1.2: the full goal, FOUNDATION section 5), and where its plan stands. */
export interface GoalView {
  readonly posture: Posture;
  readonly objective: RegionId | null;
  readonly risk: number;
  readonly deadlineDays: number;
  readonly permissions: { readonly rail: boolean; readonly river: boolean; readonly sea: boolean; readonly neutral: boolean };
  readonly committed: readonly ForceBlockId[];
  readonly awaitWord: boolean;
  readonly approveAsDrafted: boolean;
  readonly issuer: PersonId;
  readonly viaChain: boolean;
  readonly setDay: number;
  readonly status: PlanStatus;
}

/** An option as the seat sees it: its label key and who argued for it, in display order. */
export interface SituationOptionView {
  readonly id: string;
  readonly label: string;
  /** Persons, inaction, or a basis in law and practice (a gate-kept option; the view keeps its own copy of the shape). */
  readonly proposedBy: readonly PersonId[] | 'inaction' | { readonly basis: 'law-and-practice' | 'principal-initiative'; readonly cites: readonly { readonly source: string; readonly at: string | null }[] };
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
  /** Works he has been told of, per region (the latest works claim he holds). */
  readonly worksBeliefs: Readonly<Record<RegionId, WorksView>>;
  /** Water edges he has been told of, closed or clear (the latest obstruction claim he holds per edge). */
  readonly obstructionBeliefs: Readonly<Record<EdgeId, ObstructionView>>;
  readonly controlBeliefs: Readonly<Record<RegionId, ControlBeliefView>>;
  readonly claimedFronts: readonly ClaimedFrontView[];
  /** Situations that have reached him (as principal, or as the holder one was handed to), in id order. */
  readonly situations: readonly SituationView[];
  /** What is left of his week's attention (0025, lane 1.13): his own budget, which he always knows; null for a seat that keeps none. */
  readonly attention: number | null;
}
