import type { ComplianceRung, Contribution, Reason } from './directive.ts';
import type { PersonId, ValueId } from './people.ts';
import type { Permille, SignedPermille } from './permille.ts';
import type { RngStream } from './rng.ts';

/**
 * Game state (M1). Plain, JSON-serializable data. Every field has exactly one
 * writer (CLAUDE.md rule 5); derived values (mandate, credibility, oversight,
 * views) are recomputed by `derive.ts` and `view.ts` and never stored.
 */

export type FactionId = string;
export type PostId = string;
export type RegionId = string;
export type BlocId = string;
export type DirectiveId = string;
export type OperationId = string;
export type ClaimId = string;

// ---------------------------------------------------------------------------
// People

/** The insubordination ladder (P5), from best to worst for the principal. */
export const LADDER = [
  'loyal',
  'reserved',
  'foot_dragging',
  'freelancing',
  'lobbying',
  'going_over_head',
  'public_defiance',
  'armed_defiance',
] as const;
export type LadderRung = (typeof LADDER)[number];

/** Typed, non-interchangeable grievances. Each is repaired by specific verbs, not by any currency. */
export type GrievanceKind =
  | 'overruled'
  | 'monitored'
  | 'pressured'
  | 'passed_over'
  | 'promise_broken'
  | 'blamed';

export interface Grievance {
  readonly kind: GrievanceKind;
  weight: number;
  readonly sinceDay: number;
}

export interface Person {
  readonly id: PersonId;
  readonly factionId: FactionId;
  readonly values: readonly ValueId[];
  readonly boldness: Permille;
  readonly candour: Permille;
  readonly competence: Permille;
  standing: Permille;
  regard: SignedPermille;
  status: 'active' | 'dismissed';
  grievances: Grievance[];
  ladder: LadderRung;
  overseen: boolean;
  /** Day until which the principal's pressure applies; -1 when none. */
  pressuredUntil: number;
  rival: boolean;
  lastFreelanceDay: number;
}

// ---------------------------------------------------------------------------
// Structure

/** An office. Assets belong to posts, not factions (P1). */
export interface Post {
  readonly id: PostId;
  readonly factionId: FactionId;
  readonly kind: 'field' | 'office';
  regionId: RegionId;
  holderId: PersonId | null;
  /** Integer force held by this post. */
  force: number;
  /** Message latency in days between the principal and this post (P8). */
  readonly linkDays: number;
  /** Force this post raises each week while held (governors, war offices). It stays in the post until transferred (P1). */
  readonly recruitPerWeek: number;
}

export interface Region {
  readonly id: RegionId;
  controllerId: FactionId;
  readonly neighbours: readonly RegionId[];
  /** Static local defenders that belong to whoever controls the region. */
  readonly garrison: number;
}

/** A constituency whose support makes up the principal's mandate (P10). */
export interface Bloc {
  readonly id: BlocId;
  readonly factionId: FactionId;
  /** Share of the faction's selectorate. A faction's bloc weights sum to 1000. */
  readonly weight: Permille;
  readonly values: readonly ValueId[];
  support: SignedPermille;
  /** The bloc's settled disposition: support drifts back toward it as events fade. */
  readonly baseline: SignedPermille;
}

export interface RecordEntry {
  readonly day: number;
  readonly kind: 'dismissal' | 'override' | 'promise_made' | 'promise_kept' | 'promise_broken';
  readonly personId: PersonId;
}

export interface PendingPromise {
  readonly personId: PersonId;
  readonly dueDay: number;
}

export interface Faction {
  readonly id: FactionId;
  readonly principalId: PersonId;
  readonly capitalRegionId: RegionId;
  readonly isPlayer: boolean;
  readonly attentionPerTurn: number;
  attentionLeft: number;
  /** Oversight the principal has over a proxy at zero distance. */
  readonly baseOversight: Permille;
  /** Oversight lost per day of message latency. */
  readonly oversightLossPerLinkDay: number;
  /** The leader's dated record. Credibility is derived from it (P7). */
  record: RecordEntry[];
  promises: PendingPromise[];
}

// ---------------------------------------------------------------------------
// Orders, operations, information

export type Objective =
  | { readonly kind: 'attack'; readonly targetRegionId: RegionId }
  | { readonly kind: 'hold' }
  | { readonly kind: 'transfer'; readonly toPostId: PostId; readonly amount: number };

export type ObjectiveKind = Objective['kind'];

export interface ResponseRecord {
  readonly day: number;
  readonly holderId: PersonId;
  readonly actual: ComplianceRung;
  readonly declared: ComplianceRung;
  readonly willingness: number;
  readonly contributions: readonly Contribution[];
  readonly reasons: readonly Reason[];
  readonly statedReasons: readonly Reason[];
  readonly counterBoldness: Permille | null;
}

export interface Directive {
  readonly id: DirectiveId;
  readonly factionId: FactionId;
  readonly postId: PostId;
  readonly issuedDay: number;
  readonly objective: Objective;
  readonly boldness: Permille;
  readonly insisted: boolean;
  /** Set when this directive is the principal accepting the holder's own counter-proposal. */
  readonly counterOf: DirectiveId | null;
  /** A value the principal framed the order in, during an audience (P3). */
  readonly framing: ValueId | null;
  /** Reinforcements the principal promised in an audience; the holder counts on them as far as he believes promises. */
  readonly promisedForce: number;
  status: 'in_transit' | 'awaiting_answer' | 'executing' | 'done' | 'refused' | 'superseded';
  response: ResponseRecord | null;
}

export interface Operation {
  readonly id: OperationId;
  readonly factionId: FactionId;
  readonly postId: PostId;
  readonly holderId: PersonId;
  readonly directiveId: DirectiveId | null;
  readonly targetRegionId: RegionId;
  readonly commitment: Permille;
  readonly mode: 'assault' | 'demonstration';
  readonly startDay: number;
  readonly resolveDay: number;
  status: 'pending' | 'resolved' | 'cancelled';
}

/** Who authored a claim: a person, an oversight channel attached to a person, or the public record. */
export type Author =
  | { readonly kind: 'person'; readonly personId: PersonId }
  | { readonly kind: 'overseer'; readonly watchingId: PersonId }
  | { readonly kind: 'public' };

export type ClaimBody =
  | {
      readonly kind: 'response';
      readonly directiveId: DirectiveId;
      readonly personId: PersonId;
      readonly declared: ComplianceRung;
      readonly statedReasons: readonly Reason[];
      readonly counterBoldness: Permille | null;
    }
  | {
      readonly kind: 'op_result';
      readonly operationId: OperationId;
      readonly regionId: RegionId;
      readonly outcome: 'taken' | 'repulsed' | 'held' | 'lost';
      readonly reportedEnemyForce: number;
      readonly reportedOwnLosses: number;
    }
  | { readonly kind: 'signal'; readonly personId: PersonId; readonly rung: LadderRung }
  | { readonly kind: 'enemy_strength'; readonly regionId: RegionId; readonly force: number };

/** Something a faction has been told (P4). Knowledge is scoped per faction (0011). */
export interface Claim {
  readonly id: ClaimId;
  readonly factionId: FactionId;
  readonly author: Author;
  /** Day the claimed thing happened. */
  readonly aboutDay: number;
  /** Day the faction learned it. */
  readonly knownDay: number;
  readonly body: ClaimBody;
}

export type MessagePayload =
  | { readonly kind: 'directive'; readonly directiveId: DirectiveId }
  | { readonly kind: 'claim'; readonly claim: Omit<Claim, 'id' | 'knownDay'> }
  | { readonly kind: 'transfer'; readonly fromPostId: PostId; readonly toPostId: PostId; readonly amount: number };

/** Every order and report travels with latency (P8). */
export interface Message {
  readonly id: string;
  readonly sentDay: number;
  readonly deliverDay: number;
  readonly payload: MessagePayload;
}

/** The dated record of what actually happened, with causes. Ground truth, never shown raw to a principal. */
export interface LedgerEntry {
  readonly day: number;
  readonly kind: string;
  readonly factionId: FactionId | null;
  readonly actors: readonly string[];
  readonly reasons: readonly Reason[];
  readonly causes: readonly string[];
  readonly detail: Readonly<Record<string, number | string | boolean | null>>;
}

export interface Checkpoint {
  readonly day: number;
  readonly factionId: FactionId;
  readonly kind: 'mandate_test';
  readonly threshold: SignedPermille;
  readonly label: string;
}

export interface Verdict {
  readonly day: number;
  readonly kind: 'mandate_lost' | 'capital_fallen' | 'mutiny' | 'time';
  readonly factionId: FactionId | null;
  readonly causes: readonly string[];
}

export interface ObjectiveValues {
  readonly honours: readonly ValueId[];
  readonly offends: readonly ValueId[];
  /** Values the principal may plausibly frame this kind of order in, in an audience. */
  readonly frames?: readonly ValueId[];
}

export interface GameState {
  readonly schemaVersion: 1;
  readonly scenarioId: string;
  readonly seed: number;
  day: number;
  turn: number;
  readonly minTurnDays: number;
  readonly maxTurnDays: number;
  readonly endDay: number;
  /** Pack-defined mapping from objective kinds to the values they honour and offend (0003). */
  readonly objectiveValues: Readonly<Record<ObjectiveKind, ObjectiveValues>>;
  factions: Record<FactionId, Faction>;
  persons: Record<PersonId, Person>;
  posts: Record<PostId, Post>;
  regions: Record<RegionId, Region>;
  blocs: Record<BlocId, Bloc>;
  directives: Record<DirectiveId, Directive>;
  operations: Record<OperationId, Operation>;
  messages: Message[];
  claims: Claim[];
  ledger: LedgerEntry[];
  checkpoints: Checkpoint[];
  rng: Record<string, RngStream>;
  nextId: number;
  verdict: Verdict | null;
}

/** A deterministic id: `<prefix>-<counter>`. */
export function newId(state: GameState, prefix: string): string {
  const id = `${prefix}-${state.nextId}`;
  state.nextId += 1;
  return id;
}
