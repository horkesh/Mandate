/**
 * World format v2, a scenario start (decision 0030: a scenario is world data
 * plus a starting state; a pack may have several starts).
 *
 * A start is still pack data, immutable and hashed with its World. At setup it
 * becomes State, each part copied once into the field its owner writes from
 * then on (FOUNDATION section 10; the mapping is in `START_OWNERS` below and in
 * `ownership.ts`). Nothing reads a start after setup, so a save never depends
 * on it except through the world and scenario hashes.
 */
import type {
  DepartmentId,
  DepotId,
  EdgeId,
  FactionId,
  ForceBlockId,
  InstallationId,
  PersonId,
  PostId,
  RailLineId,
  RegionId,
  ScenarioId,
} from '../ids.ts';
import type { Citation, Provenance, StringKey } from './graph.ts';

export interface FactionStart {
  readonly faction: FactionId;
  /** The person whose seat leads the faction; null if the office is empty. */
  readonly principal: PersonId | null;
  readonly capital: RegionId | null;
  /** Whether a human may take this faction's seat in this start (0029: a side may exist and not yet be playable). */
  readonly playable: boolean;
}

export interface ControlShare {
  readonly faction: FactionId;
  readonly permille: number;
}

/** Control of one region: shares sum to at most 1000; the rest is no one's (0019). */
export interface RegionControlStart {
  readonly region: RegionId;
  readonly shares: readonly ControlShare[];
}

/** The faction offices that issue the opening map, and an optional report-only control table. */
export interface OpeningControlStart {
  readonly authors: readonly { readonly faction: FactionId; readonly post: PostId }[];
  readonly table?: readonly RegionControlStart[];
}

/** A region's loyalty at the start (lane 1.7): each faction's share, permille, summing to at most 1000. Never a stand-in for control. */
export interface LoyaltyStart {
  readonly region: RegionId;
  readonly shares: readonly { readonly faction: FactionId; readonly permille: number }[];
}

export interface FortificationStart {
  readonly region: RegionId;
  readonly levelPermille: number;
}

/** An edge not at full condition at the start (1000 = intact). Unlisted edges start intact. */
export interface EdgeConditionStart {
  readonly edge: EdgeId;
  readonly conditionPermille: number;
}

/** A water edge obstructed at the start, by an installation's works or batteries, or by works not modelled as one. */
export interface ObstructionStart {
  readonly edge: EdgeId;
  readonly by: InstallationId | null;
  readonly provenance: Provenance;
}

/** A depot not at full condition at the start. */
export interface DepotConditionStart {
  readonly depot: DepotId;
  readonly conditionPermille: number;
}

/** A link between posts that is not a chain of command (the drafts' open questions). */
export const POST_LINK_KINDS = ['requisition', 'joint', 'liaison'] as const;
export type PostLinkKind = (typeof POST_LINK_KINDS)[number];

export interface PostLink {
  readonly kind: PostLinkKind;
  readonly post: PostId;
}

/**
 * A post's department changing on a date (a flotilla moved from one ministry
 * to another). Applied by `command`.
 *
 * LABELLED SCHEDULED CHANGE (FOUNDATION section 11: a railroad we cannot
 * avoid is labelled in code and docs). It moves an administrative line on a
 * fixed date and decides no outcome; it can never move a post to another side
 * (the validator refuses that). Where play should decide the date, author it
 * as a situation instead and leave this list empty.
 */
export interface DepartmentChange {
  readonly on: string;
  readonly department: DepartmentId;
  /** The post it answers to from that date; null keeps none. */
  readonly parent: PostId | null;
  readonly provenance: Provenance;
}

/** A standing agreement or prior order on a post (0040), read by its holder's compliance. */
export interface StandingOrder {
  readonly id: string;
  readonly kind: string;
  /** The post that issued it, or null for an agreement with no issuing post (a truce, a status quo). */
  readonly from: PostId | null;
  readonly issuedOn: string;
  readonly summary: StringKey;
  readonly cites: readonly Citation[];
}

export interface TemporaryPost {
  /** Groups the posts of one expedition (a joint one has a post per department). */
  readonly operation: string;
}

export interface PostStart {
  readonly id: PostId;
  readonly name: StringKey;
  readonly kind: string;
  readonly department: DepartmentId;
  /** The next post up the chain an order relays through; null at the top, or for a governor answering by requisition. */
  readonly parent: PostId | null;
  readonly holder: PersonId | null;
  readonly acting: boolean;
  /** The person who runs the post's intelligence (0058), on the post's side; null when it has none, or none is sourced. */
  readonly intelligenceChief: PersonId | null;
  /** Where its headquarters sits, if anywhere. */
  readonly region: RegionId | null;
  /** Set for a temporary post (an expedition command), which dissolves with its operation. */
  readonly temporary: TemporaryPost | null;
  /** The installation it commands, which may lie in a region another department's post commands. */
  readonly installation: InstallationId | null;
  /** The rail line whose president holds it. */
  readonly railLine: RailLineId | null;
  readonly links: readonly PostLink[];
  readonly departmentChanges: readonly DepartmentChange[];
  readonly standingOrders: readonly StandingOrder[];
  readonly unknowns: readonly string[];
  readonly provenance: Provenance;
}

/** A region whose civil government is not known: not neutral ground, so control alone decides passage (0054, 0058). */
export const UNKNOWN_GOVERNMENT = 'unknown' as const;

/**
 * A land region's civil government on the start date (0058): jurisdiction, not control, which stays with
 * `control` (0050). It becomes State written by `command`; situations change it through proposals (a restored
 * state government, rival governments in one state).
 */
export interface GovernmentStart {
  readonly region: RegionId;
  /** A department whose kind the pack marks as a government, or `unknown`. */
  readonly department: DepartmentId | typeof UNKNOWN_GOVERNMENT;
  readonly provenance: Provenance;
}

export const FORCE_BLOCK_KINDS = ['block', 'detachment'] as const;
export type ForceBlockKind = (typeof FORCE_BLOCK_KINDS)[number];

/**
 * A force block or a detachment of one (0033, 0040). `department` is whose
 * forces they are (who raised them and may recall them); `post` is who commands
 * them. They differ for a state's troops serving under another government's
 * general.
 */
export interface ForceBlockStart {
  readonly id: ForceBlockId;
  readonly name: StringKey;
  readonly kind: ForceBlockKind;
  /** The block a detachment belongs to; null for a block. */
  readonly parent: ForceBlockId | null;
  readonly department: DepartmentId;
  readonly post: PostId | null;
  readonly region: RegionId;
  /** The naval block carrying it, for troops afloat. */
  readonly aboard: ForceBlockId | null;
  readonly arm: string;
  /** Men present; null when unknown (listed in `unknowns`). */
  readonly strength: number | null;
  /** The return the strength comes from: ISO, year-month or year. */
  readonly strengthDate: string | null;
  /** Labourers and other non-combatants who eat the block's rations. */
  readonly nonCombatants: number;
  /** Days of supply on hand (0040); null when unknown. */
  readonly storesDays: number | null;
  /**
   * The date the stores figure is as of (0065): ISO, year-month or year, as `strengthDate` is for strength. Given
   * whenever stores are. Informational in Phase 0: no rule brings a figure forward to the start until Phase 1's
   * attrition, so `forces` does not read it.
   */
  readonly storesDate: string | null;
  readonly unknowns: readonly string[];
  readonly provenance: Provenance;
}

export interface ScenarioStart {
  readonly id: ScenarioId;
  readonly name: StringKey;
  /** ISO date of day 0. */
  readonly startDate: string;
  /** The root of the start's named seeded streams. */
  readonly seed: number;
  readonly factions: readonly FactionStart[];
  readonly control: readonly RegionControlStart[];
  readonly openingControl?: OpeningControlStart;
  readonly fortification: readonly FortificationStart[];
  /** Region loyalty at the start (lane 1.7; `regions`). Rows only where a source gives it. */
  readonly loyalty: readonly LoyaltyStart[];
  readonly edgeConditions: readonly EdgeConditionStart[];
  readonly obstructions: readonly ObstructionStart[];
  readonly depotConditions: readonly DepotConditionStart[];
  readonly posts: readonly PostStart[];
  readonly forceBlocks: readonly ForceBlockStart[];
  /** One row per land region and key point (0058); none for water or off-map regions. */
  readonly governments: readonly GovernmentStart[];
}

/**
 * Which State owner takes each part of a start at setup (hard rule 5). Kept as
 * data so the hand-over and the setup code read the same table.
 */
export const START_OWNERS: Readonly<Record<string, string>> = Object.freeze({
  'factions.capital': 'command',
  control: 'control',
  openingControl: 'knowledge',
  fortification: 'regions',
  loyalty: 'regions',
  edgeConditions: 'infrastructure',
  obstructions: 'infrastructure',
  depotConditions: 'infrastructure',
  'posts (holders, temporary posts, links, departments, department changes)': 'command',
  'posts.standingOrders': 'command',
  'forceBlocks.region': 'movement',
  'forceBlocks (strength, stores, detachments, non-combatants)': 'forces',
  'forceBlocks.post': 'command',
  governments: 'command',
  'people ranks at the start date': 'people',
  'weather (reserved: nothing at a start yet)': 'weather',
});
