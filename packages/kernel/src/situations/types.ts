/**
 * Situations as pack data (World; FOUNDATION section 7; decisions 0023, 0040,
 * 0041 and 0046). The kernel owns these types; `@mandate/pack-format` holds
 * the Zod schema whose output is exactly them, and the validator and gate
 * checks (lane 0.7).
 *
 * A situation is a historical pressure that arrives when its cause holds in
 * State, not on a date. It has two triggers (0046): an **event** condition
 * over the truth (when the thing happens, which starts its clock) and a
 * **knowledge** condition over what the deciding seat holds (when news of it
 * reaches him). It is a **decision** (options, a costed `inaction` outcome, a
 * historical default and an authored staff recommendation) or a **notice**
 * (effects and text, no options).
 *
 * Nothing here is setting-specific: conditions, effects and the gate tag are
 * a closed engine vocabulary, and every word a player reads is a string-table
 * key (0030). The historical default is World data the kernel reads only for
 * a rule-driven principal (a history run); the view layer never carries it
 * (0040; checked by `test/boundary.test.ts`).
 */
import type { DepartmentId, FactionId, ForceBlockId, PersonId, PostId, RegionId, SituationId } from '../ids.ts';
import type { ClaimKind, ReportType, SubjectKind } from '../knowledge/report.ts';
import type { RouteKind } from '../messages/latency.ts';
import type { Posture } from '../plans/goal.ts';
import type { ChamberStateKind } from '../politics/politics.ts';

export const SITUATION_KINDS = ['decision', 'notice'] as const;
export type SituationKind = (typeof SITUATION_KINDS)[number];

/** The gate's placements (SENSITIVE-HISTORY section 1): what a facet of a sensitive topic may be. */
export const PLACEMENTS = ['decision', 'derived', 'event', 'refused', 'text'] as const;
export type Placement = (typeof PLACEMENTS)[number];

/** A report pattern for a knowledge condition: every non-null field must match one report the seat holds. */
export interface KnowsPattern {
  readonly reportType: ReportType | null;
  readonly subtype: string | null;
  readonly subjectKind: SubjectKind | null;
  readonly subjectId: string | null;
  /** A claim of this kind must be in the report (and carry `token`, if given). */
  readonly claimKind: ClaimKind | null;
  readonly token: string | null;
}

/**
 * A condition over State (event conditions) or over a seat's knowledge
 * (`knows`). Closed: a pack cannot invent a predicate the kernel does not
 * evaluate. `dayAtLeast` alone is a date, allowed only for a labelled
 * railroad (0028, 0040; gate question B2).
 */
export type Condition =
  | { readonly all: readonly Condition[] }
  | { readonly any: readonly Condition[] }
  | { readonly not: Condition }
  | { readonly dayAtLeast: number }
  /** A situation flag is set (flags are situation chain state, set and cleared by effects). */
  | { readonly flag: string }
  | { readonly fired: SituationId }
  /** The situation was decided, with one of `options` among its choices (null: any decision). */
  | { readonly decided: SituationId; readonly options: readonly string[] | null }
  | { readonly knows: KnowsPattern }
  /**
   * A post holds a goal of this posture, ordered by its principal (lane 1.2: read from `plans`, no longer a standing
   * goal). A goal is the principal's own order, so an item that moves a self-governing government may not read it (0071).
   */
  | { readonly goal: { readonly post: PostId; readonly posture: Posture } }
  /** A post's headquarters stands in a region: derived from where its strongest block stands, never stored (0064, `seats/posts.ts`). */
  | { readonly headquartersAt: { readonly post: PostId; readonly region: RegionId } }
  /** Days since this situation surfaced to the principal (its clock; gate re-check N6): for `expiresWhen`, `appearsWhen` and `waitsOn`. */
  | { readonly clockAtLeast: number }
  /**
   * A call for regiments reached the holder of a post at least `days` ago (lane 1.11, the lead's ruling): the cause of a
   * state's act a pack-set delay after the call arrives. A STAND-IN until conventions and legislatures are modelled (1B):
   * a run where the call comes late moves the act with it.
   */
  | { readonly callReceived: { readonly post: PostId; readonly days: number } }
  /** The post's holder today is this person (lane 1.11: the post-holder check). */
  | { readonly holds: { readonly post: PostId; readonly person: PersonId } }
  /** The post's holder today carries this practice (lane 1.5b's cited practices): text that depends on his own conduct. */
  | { readonly holderPractice: { readonly post: PostId; readonly practice: string } }
  /** A chamber of the legislature is in this state today (lane 1.6, 0040): which options are legal. A public fact. */
  | { readonly chamber: { readonly id: string; readonly state: ChamberStateKind } }
  /**
   * The accountability ledger (lane 1.6, 0046): some act of `side` (this one, or any if null) stands `away` (taken while
   * the legislature was away, not yet met), `before` it (met, not answered) or `answered`. A public fact.
   */
  | { readonly ledger: { readonly side: FactionId; readonly act: string | null; readonly status: LedgerStatus } };

export const LEDGER_STATUSES = ['answered', 'away', 'before'] as const;
export type LedgerStatus = (typeof LEDGER_STATUSES)[number];

/**
 * An effect. Flags are the situations module's own chain state. Everything
 * else is a typed **proposal** to the module that owns the field (hard rule 5;
 * catalogue pressure P13): the owner applies it, so a pack can never invent a
 * writer. Until an owner is built, its proposals are reported, not applied.
 */
export type Effect =
  | { readonly setFlag: string }
  | { readonly clearFlag: string }
  | {
      readonly propose: {
        /** The kernel module that owns the field (`politics`, `regions`, ...). */
        readonly owner: string;
        /** The pack's field id (a bloc's support, a region's loyalty, a foreign clock). */
        readonly field: string;
        /** Which record (a bloc id, a region id), or null for a field with one value. */
        readonly subject: string | null;
        /** Signed permille. */
        readonly delta: number;
        /** A typed reason id, for explanations (hard rule 6). */
        readonly reason: string;
        /** The side whose measure this is, for the gate's sign rule (E7); null if no side's. */
        readonly side: FactionId | null;
      };
    }
  /**
   * A landing (lane 1.11, on lane 1.4b's detachment path): `men` of a block aboard ship go ashore in `region`, across an
   * edge from the ship. `forces` applies it, or refuses it with a typed reason, in phase 4c beside `command`'s proposals.
   */
  | { readonly landing: { readonly parent: ForceBlockId; readonly men: number; readonly region: RegionId } };

/**
 * An order an option issues: always in the principal's name, through the validated command path (0052). It names a
 * goal's posture and objective (null: hold where he stands); the goal's other terms are the pack's
 * (`WorldRules.plans.goalDefaults`), and it commits every block his post commands.
 */
export interface OptionOrder {
  readonly to: PostId;
  readonly posture: Posture;
  readonly objective: RegionId | null;
  readonly route: RouteKind;
}

/**
 * A call for regiments an option issues (lane 1.11): in the principal's name, through the validated call path, as a
 * goal goes through the order path (`dispatchOrder`). Each governor answers by his own compliance (lane 1.7).
 */
export interface OptionCall {
  readonly to: PostId;
  readonly regiments: number;
  readonly termDays: number;
  readonly route: RouteKind;
}

/**
 * The gate tag on an item (SENSITIVE-HISTORY section 5), or an explicit "not
 * gated" with its reason. `actingSide` is whose conduct the item is, which the
 * sign rule reads (E7: atrocity-class conduct never helps the side that acts).
 */
export type GateTag =
  | { readonly topics: readonly string[]; readonly placement: Placement; readonly risks: readonly string[]; readonly actingSide: FactionId | null }
  | { readonly none: string };

/** A gate sign-off (A7): a reviewer who is not the author, the question versions read, and the item's content hash. */
export interface GateReview {
  readonly author: string;
  readonly reviewer: string;
  readonly date: string;
  readonly questionVersions: Readonly<Record<string, number>>;
  readonly contentHash: string;
  /**
   * The reviewer's notes on wording the pack marks for review (section 5: a
   * `review` hit forces a note), keyed `<locale>|<string key>|<pattern>`: a
   * note on one language never covers a translation (gate re-check N9).
   */
  readonly notes: Readonly<Record<string, string>>;
}

/**
 * A proposal grounded in law and practice rather than a person (the lead's ruling on S17, a recorded exception): only an
 * option the gate keeps (the register lists it in `supersededOptions`, or marks it `watched`) may carry it, so no adviser
 * is invented for a policy the record shows was practised but nobody on the staff urged. The validator refuses it anywhere else.
 */
export interface ProposalBasis {
  readonly basis: 'law-and-practice';
  readonly cites: readonly SituationCitation[];
}

/** True for a proposal's basis in law and practice (not a list of persons, nor inaction). */
export function isProposalBasis(p: unknown): p is ProposalBasis {
  return typeof p === 'object' && p !== null && !Array.isArray(p) && (p as { basis?: unknown }).basis === 'law-and-practice';
}

/** A named man whose words or acts an item gives, and the post he must hold for it to fire (null: serving anywhere). */
export interface Speaker {
  readonly post: PostId | null;
  readonly person: PersonId;
}

export interface SituationCitation {
  readonly source: string;
  readonly at: string | null;
}

/** An option's policy row and who carries it out (lane 1.5b). */
export interface OptionPolicy {
  readonly row: string;
  readonly carriedBy: readonly PostId[];
}

export interface OptionDef {
  readonly id: string;
  readonly label: string;
  /** The neutral display order: the order advisers raised them, unrelated to the historical default (0041). */
  readonly displayKey: number;
  /** Who argued for it, in their own terms (C1): person ids, or `inaction`. */
  readonly proposedBy: readonly PersonId[] | 'inaction' | ProposalBasis;
  /** Options in different groups may be taken together; an option with no group is taken alone (catalogue P3). */
  readonly group: string | null;
  readonly appearsWhen: Condition | null;
  readonly expiresWhen: Condition | null;
  /** A waiting option ("hold it until ..."): choosing it defers the decision until this holds (0046). */
  readonly waitsOn: Condition | null;
  readonly effects: readonly Effect[];
  /** Costs that apply on every use, whatever follows (gate B5): no condition, no chance. */
  readonly lockedCosts: readonly Effect[];
  readonly orders: readonly OptionOrder[];
  /** Calls for regiments to governors' posts (lane 1.11). */
  readonly calls: readonly OptionCall[];
  /**
   * Values the option honours, which a delegate weighs when he decides by his values (0040). An option that names a
   * policy row honours exactly that row's values (the validator checks it), so the map and a delegate's choice agree.
   */
  readonly honours: readonly string[];
  /**
   * The policy this option is (lane 1.5b; 0074): a `policy:` row of the pack's order-to-value map, and the posts whose
   * holders carry it out (none: a policy no one post carries). Choosing it applies the row's pushback through its owners:
   * a grievance for every stakeholder, and each carrier's own answer through compliance. Null: not a policy.
   */
  readonly policy: OptionPolicy | null;
  /** The gate reviewer's mark for the lever sweep (D6): the historically worst conduct. */
  readonly watched: boolean;
  /** A tag of the option's own, when it differs from the situation's. */
  readonly gate: GateTag | null;
}

/** What ignoring a situation, or letting every option lapse, resolves to (0040): costed like an option (gate Q2). */
export interface Outcome {
  readonly text: string;
  readonly effects: readonly Effect[];
  /**
   * The policy inaction is (lane 1.5b; the gate review's G-1.5g): leaving a gated matter to each commander is itself a
   * policy, applied through the map like an option's, so it cannot come out cheaper than its floor. Null: not a policy.
   */
  readonly policy: OptionPolicy | null;
}

/** The historical default (0040): options taken, a delegation, or not yet sourced. Never shown to the player. */
export type HistoricalDefault =
  | { readonly options: readonly string[] }
  | { readonly delegate: PostId }
  | { readonly unsourced: string };

/** The staff recommendation, an `advice` report of the `requested` subtype (0040, 0046). */
export interface StaffLine {
  /** Ordered: the first post that is filled, by a holder who is not a subject, writes it. */
  readonly authors: readonly PostId[];
  readonly recommends: readonly string[];
  readonly reasons: readonly { readonly kind: string; readonly weight: number }[];
  /** Permille. */
  readonly confidence: number;
}

/**
 * How a notice reaches the principal: a report through the ordinary path, so
 * it has an author, a route and a delay (gate F1, review S10). The first
 * author post that is filled by a holder who is not a subject writes it.
 */
export interface NoticeReport {
  readonly authors: readonly PostId[];
  readonly reportType: ReportType;
  /** Required for the report types that take one (an informal source's kind). */
  readonly subtype: string | null;
}

export interface SituationChain {
  readonly id: string;
  readonly stage: number;
  /** The earlier stage this one follows, and the options there that lead here (null: any). */
  readonly follows: { readonly situation: SituationId; readonly options: readonly string[] | null } | null;
}

export interface SituationDef {
  readonly id: SituationId;
  readonly kind: SituationKind;
  /** The faction whose principal decides (or is told). */
  readonly faction: FactionId;
  readonly title: string;
  readonly text: string;
  /** The earliest in-game date it can concern (gate A4, C3, F6). */
  readonly earliest: string;
  readonly event: Condition;
  /** Null: it surfaces the day it fires. */
  readonly knowledge: Condition | null;
  /** A label, when the cause is a date alone: the one kind of railroad the design admits (0028, 0040). */
  readonly railroad: string | null;
  readonly chain: SituationChain | null;
  /** People the situation is about: none of them writes its staff line (0046). */
  readonly subjects: readonly PersonId[];
  /** In display order. Empty for a notice. */
  readonly options: readonly OptionDef[];
  /** Required for a decision; null for a notice. */
  readonly inaction: Outcome | null;
  readonly historicalDefault: HistoricalDefault | null;
  readonly staffLine: StaffLine | null;
  /**
   * For a notice that moves a self-governing department (0070): whose act it is. It must be the proposal's subject, so
   * a nation's act is the nation's own and never a side's. Absent for every other item.
   */
  readonly actingGovernment?: DepartmentId;
  readonly delegableTo: readonly PostId[];
  /** Clock days (since it surfaced) at which an open decision comes back to the seat and ends the turn (0040). */
  readonly resurfaceOn: readonly number[];
  /** A notice's effects, applied when it fires. Empty for a decision. */
  readonly effects: readonly Effect[];
  /** Required for a notice: the report that tells the principal. Null for a decision (its staff line is its report). */
  readonly report: NoticeReport | null;
  /**
   * The post-holder check (lane 1.11, the lead's rule): the named men whose words or acts the text gives, each in the post
   * he must hold that day (null: serving, in whatever post). The kernel fires the item only while every one of them
   * does, so it never quotes a man the player has removed. Absent or empty: the text gives no named man's words or acts.
   */
  readonly speakers?: readonly Speaker[];
  /** Why the text names a man without giving his words or acts (a treaty's signers, an appointment as the record states it). */
  readonly namedOnly?: string;
  readonly gate: GateTag;
  readonly gateReview: GateReview | null;
  readonly citations: readonly SituationCitation[];
}
