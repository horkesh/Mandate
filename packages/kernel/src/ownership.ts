/**
 * One owner per truth, as data (CLAUDE.md rule 5; FOUNDATION sections 10 and
 * 11.4; AWWV lesson M2).
 *
 * `KERNEL_MODULES` is FOUNDATION's module map. `OWNED_FIELDS` is its
 * field-to-writer table: every State field has exactly one writer module;
 * other modules propose typed deltas and the writer applies them.
 * `packages/kernel/test/one-writer.test.ts` reads both and fails when:
 * - a property of a State record (an interface named `...State` in any
 *   package's `src`) is not classified here, either as owned or as immutable;
 * - code outside a field's writer assigns, increments, deletes, mutates
 *   (push, splice, set, ...) or spread-updates that field's key;
 * - an owned key is claimed twice, or a writer is not a State module.
 *
 * When a lane builds a field, it fills in `code` with the record type and
 * property key. Owned keys are reserved names across the whole codebase:
 * don't assign to a property of that name anywhere else, even on a local
 * object; rename the local instead. That is what lets a type-blind source
 * scan be exact.
 */

export type Layer = 'World' | 'State' | 'Derived' | 'writer' | 'pure' | 'infrastructure';

export interface KernelModule {
  /** Path under `packages/kernel/src/` without `.ts`: the module is that file or that folder. */
  readonly name: string;
  readonly layer: Layer;
  readonly owns: string;
}

export const KERNEL_MODULES: readonly KernelModule[] = [
  { name: 'world/graph', layer: 'World', owns: 'regions, typed edges, capacities, depots, terrain' },
  { name: 'control', layer: 'State', owns: 'the control map; the only writer of control changes' },
  { name: 'control-index', layer: 'Derived', owns: 'holders, contact edges, fronts, components, wire owners (0054)' },
  { name: 'supply', layer: 'Derived', owns: 'supply paths with capacity from sources and forward depots; pockets with their cut; allocation in priority order (0054)' },
  { name: 'regions', layer: 'State', owns: 'region population, loyalty, supply value, fortification' },
  { name: 'forces', layer: 'State', owns: 'force blocks and detachments, with stores on hand' },
  { name: 'command', layer: 'State', owns: 'posts and the people in them; assignments; standing agreements and prior orders; each region’s civil government and closed governments (0058); each department’s side (0065)' },
  { name: 'plans', layer: 'State', owns: 'goals, drafts, approvals, edits as counter-orders' },
  { name: 'operations', layer: 'State', owns: 'approved plans in execution, per-axis lifecycles' },
  { name: 'movement', layer: 'writer', owns: 'the only writer of location' },
  { name: 'combat', layer: 'writer', owns: 'battle resolution and battle records' },
  { name: 'people', layer: 'State', owns: "people's stats, traits, standing, grievances, regard, stances" },
  { name: 'compliance', layer: 'pure', owns: 'responses to orders, computed; writes nothing' },
  { name: 'reading', layer: 'pure', owns: 'how an order is read, computed; writes nothing' },
  { name: 'audience', layer: 'State', owns: 'audience state' },
  { name: 'proxy', layer: 'State', owns: 'responses to orders' },
  { name: 'ladder', layer: 'State', owns: 'ladder rungs and rivals' },
  { name: 'knowledge', layer: 'State', owns: 'per-seat reports with latency' },
  { name: 'messages', layer: 'State', owns: 'messages in transit' },
  { name: 'view', layer: 'Derived', owns: 'viewFor(state, seatId)' },
  { name: 'seats', layer: 'State', owns: 'who drives each person; command validation' },
  { name: 'economy', layer: 'State', owns: 'money, men, munitions, rail capacity at their holders' },
  { name: 'situations', layer: 'State', owns: 'cause predicates, offers, live situations and clocks, decisions' },
  { name: 'politics', layer: 'State', owns: 'blocs, mandate, elections, verdict, chambers of Congress, framing' },
  { name: 'planner', layer: 'pure', owns: 'candidate plans for a goal, on request' },
  { name: 'infrastructure', layer: 'State', owns: 'edge condition (damage and repair), water obstructions, depot condition' },
  { name: 'weather', layer: 'State', owns: "today's weather per zone, drawn from a named seeded stream (0029)" },
  { name: 'tick', layer: 'writer', owns: 'the fixed day order and the decision-point signal; the only writer of the day counter' },
  { name: 'log', layer: 'infrastructure', owns: 'command log, snapshots, replay' },
  { name: 'serialize', layer: 'infrastructure', owns: 'canonical JSON, state hash, versioned saves' },
  { name: 'invariants', layer: 'infrastructure', owns: 'post-tick assertions with typed failures' },
];

/** Where a field lives in code: the State record type and its property key. */
export interface FieldLocation {
  readonly record: string;
  readonly key: string;
}

export interface OwnedField {
  /** The field as FOUNDATION section 10 names it. */
  readonly field: string;
  /** The only module that writes it. */
  readonly writer: string;
  /** Who proposes changes (typed deltas) for the writer to apply. */
  readonly proposedBy: readonly string[];
  /** Its record types and keys once a lane builds it; empty until then. */
  readonly code: readonly FieldLocation[];
}

const field = (f: string, writer: string, proposedBy: readonly string[], code: readonly FieldLocation[] = []): OwnedField => ({ field: f, writer, proposedBy, code });
const at = (record: string, key: string): FieldLocation => ({ record, key });

export const OWNED_FIELDS: readonly OwnedField[] = [
  field('each faction\'s current capital', 'command', ['scenario start', 'situations'], [at('State', 'factionCapitals')]),
  // Lane 0.4: control, set from the scenario start (0050) and changed only through `applyControl`.
  field('region control', 'control', ['combat', 'occupation'], [at('State', 'regionControl')]),
  // 0058: jurisdiction beside control. Lane 0.5 writes the passage rule that reads them.
  field("each land region's civil government (a department, or unknown)", 'command', ['situations'], [at('State', 'regionGovernments')]),
  field('neutral governments closed to passage, with the day each closed', 'command', ['situations'], [at('State', 'closedGovernments')]),
  // 0065: a department's side, copied from the World at the start; a situation moves a government to a side.
  field("each department's side (a faction, or none for a neutral government)", 'command', ['situations'], [at('State', 'departmentFactions')]),
  field('region population, loyalty, supply value', 'regions', ['economy', 'situations', 'occupation'], [at('State', 'regionLoyalty')]),
  // Lane 0.5: from the start (0050), changed only through `applyInfrastructure`.
  field('edge condition', 'infrastructure', ['combat', 'raids', 'repair orders'], [at('State', 'infraEdgeCondition')]),
  // Lane 0.5: a block's region (or the ship it is aboard), from the start (0050).
  field('division location', 'movement', ['operations', 'recruitment (a new block placed, a disbanded one removed)'], [at('State', 'forceLocations')]),
  // Lane 1.12: a transfer orders the blocks it hands over to join the receiving post at its seat.
  field("a block's order to join its post at the post's seat", 'movement', ['verbs (a transfer)', 'operations (the day\'s legs)'], [at('State', 'forceJoins')]),
  // Lane 0.5: one record per block or detachment carries strength, stores and
  // non-combatants (`forces/forces.ts`), so the three `forces` rows below share it.
  // Lane 1.3: morale, experience, equipment, stragglers, and the days a block routed or surrendered join the same record.
  field('division strength, morale, experience, equipment', 'forces', ['combat', 'attrition', 'economy', 'recruitment'], [at('State', 'forceBlockStates')]),
  field("a force block's stores on hand", 'forces', ['supply (daily)', 'operations (a sea delivery)']),
  // Lane 1.4b: a detachment is a `forceBlockStates` record of kind `detachment` (its row shares that record); one proposal
  // makes, rejoins or frees it across `forces`, `movement` and `command` (`tick/detachments.ts`).
  field('detachments below the force block (garrisons, landings)', 'forces', ['command', 'operations']),
  // Lane 1.3: on the block's own record (`fbStragglers`, beside `forceBlockStates` above).
  field('stragglers: men absent from a force block who rejoin over days', 'forces', ['combat', 'attrition']),
  // Lane 1.3: each battle with its days and breakdowns (`combat/records.ts`); written only by `combat`.
  field('battle records', 'combat', [], [at('State', 'battleRecords')]),
  // Close-out (0072): copied from the scenario start at setup (0050); nothing changes it in Phase 0.
  field('fortification and entrenchment', 'regions', ['operations', 'combat'], [at('State', 'regionFortification')]),
  // Lane 0.5: which post commands each block; transfers name a force (0033).
  field('division-to-post assignment', 'command', ['transfers', "the army commander's assignments", 'combat (a surrendered block is released, lane 1.3)', 'recruitment (a new block to its governor, a disbanded one away)'], [at('State', 'forceAssignments')]),
  // Lane 0.5: one record per post carries its holder, chain, department, temporary operation,
  // links, scheduled changes and standing orders (`command/command.ts`), so the `command`
  // rows for standing orders and a post's department below share it.
  field('people in posts; temporary posts', 'command', ['appoint', 'relieve', 'promotion lists', "an operation's end", 'combat (a commander killed, wounded or captured leaves his post vacant, lane 1.3)'], [at('State', 'postStates')]),
  field('standing agreements and prior orders on a post', 'command', ['verbs', 'situations', "orders from the holder's own department", "a call a governor answered (his levy in hand)"], [at('State', 'postLevies')]),
  // Lane 1.1: people as State. True stats and temperament are drawn at setup by history's shadow; the rest start from the World.
  field("a person's stats, traits, standing, grievances, regard", 'people', ['combat results', 'the press', 'verbs', 'ladder', 'a bypassed relay'], [
    at('State', 'personTrue'),
    at('State', 'personTraits'),
    at('State', 'personStanding'),
    at('State', 'personGrievances'),
    at('State', 'personRegard'),
  ]),
  field("a person's stances on record (from Consult)", 'people', ['Consult answers'], [at('State', 'personStances')]),
  field("a person's status (serving, wounded, killed, captured) and its date", 'people', ['combat'], [at('State', 'personStatus')]),
  // Lane 1.5: the ladder and rivals, the audience, promises, inquiries, observers, attention and initiatives.
  field("a person's ladder rung and rivals", 'ladder', ['weekly people step'], [at('State', 'personRungs'), at('State', 'personRivals')]),
  field('promises made to a person (kind, day made, day due)', 'people', ['promise', 'audience'], [at('State', 'personPromises')]),
  field('inquiries a person received this week (his patience)', 'people', ['inquire'], [at('State', 'personInquiries')]),
  field('observers: a person at a commander\'s headquarters reporting to his sender', 'command', ['the observer verb', 'audience (recall)'], [at('State', 'observerPostings')]),
  field("the president's attention this week", 'seats', ['command validation (spending)', 'the weekly refill'], [at('State', 'seatAttention')]),
  field('seat initiative state (each initiative\'s last firing day)', 'seats', ['the weekly people step'], [at('State', 'seatInitiatives')]),
  // Lane 1.1: a man's answer to an order that reached him, as a relay or its addressee; plans holds only its key (0073).
  field('responses to orders (declared and actual rungs, reasons)', 'proxy', ['message arrival'], [at('State', 'orderResponses')]),
  field('audience state', 'audience', ['the audience verb'], [at('State', 'audienceHeld')]),
  // Lane 1.2: each post's goal and plan record (`plans/plans.ts`): its draft set, saved on the request day, the seat's
  // pick, approval or send-back, and edits as counter-orders. Lane 1.4 retired the standing-goal execution adapter.
  field('goals, plans, approvals, edits', 'plans', ['verbs', 'seat selections', 'order arrival', 'the planner (draft sets, on request)'], [at('State', 'planRecords')]),
  // Lane 1.4: approved plans in execution, each axis's stage, its support requests and its outcome.
  field('operations and their lifecycles', 'operations', ['plan approval', 'movement and combat outcomes', 'a support request answered'], [at('State', 'operationRecords')]),
  field('knowledge (reports per seat)', 'knowledge', ['opening bulletins', 'message delivery', 'pruning'], [at('State', 'knowledgeBySeat'), at('State', 'openingControlReports'), at('State', 'openingControlClaims'), at('State', 'reportTruth')]),
  field('messages in transit', 'messages', ['commands', 'reports', 'relay links forwarding an order', "the kernel's latency rules"], [at('State', 'messagesInTransit')]),
  field('economy stocks', 'economy', ['weekly step', 'verbs']),
  field('situations fired, live (open options, clocks) and decided', 'situations', ['cause evaluation', 'decisions', "delegated seats' choices"], [at('State', 'situationStates')]),
  // Lane 1.6 (`politics/politics.ts`): bloc support (the mandate is derived from it, never stored; elections are 1B's).
  field('blocs, mandate, election results', 'politics', ['the weekly step (drift, the ladder)', 'the press', 'address', 'situations'], [at('State', 'blocSupport')]),
  field("each chamber of Congress's state (sitting, adjourned, special session called)", 'politics', ['situations (a call)', "the pack's session calendar, daily"], [at('State', 'chamberStates')]),
  field('the framing term (who the public believes began the war)', 'politics', ["the war's opening situations", 'the press'], [at('State', 'warFraming')]),
  field('the Congress accountability ledger: acts taken while Congress was away', 'politics', ['situations (an act owed an answer; an answer)', 'the chambers meeting'], [at('State', 'congressLedger')]),
  field('people who have reached Union lines', 'regions', ['the derived self-emancipation term (0046); never a lever'], [at('State', 'regionReachedUnionLines')]),
  field("a raised block's enlistment: who raised it on whose call, and when its men's term ends", 'forces', ['recruitment'], [at('State', 'forceEnlistments')]),
  field('seat assignments', 'seats', ['setup', "the player's settings"], [at('State', 'seatAssignments')]),
  // Reserved by world format v2 (lane 0.2): State that starts from a scenario
  // start or a World rule, with its owner named before the mechanic is built.
  field('water edge obstructions (works or batteries in hostile hands; cleared)', 'infrastructure', ['combat', 'operations (a siege, a clearing)', 'situations'], [at('State', 'infraObstructions')]),
  field('depot condition (struck by raids, repaired)', 'infrastructure', ['raids', 'combat', 'repair orders'], [at('State', 'infraDepotCondition')]),
  field("a post's department (changed on a scheduled date or by a situation)", 'command', ['scheduled department changes in the scenario start', 'situations']),
  // Close-out (0072), lane 1.1 (0073): a rank per kind at the start date, copied at setup (0050); appointments and lists propose changes.
  field("a person's ranks, one per kind (regular, volunteer, brevet) held at once, each with its date", 'people', ['promotion lists', 'appoint'], [at('State', 'personRanks')]),
  field("today's weather per weather zone", 'weather', ['the day tick, from its named seeded stream (0029)']),
  // Guerrilla pressure (0029) is not here on purpose: the gate register
  // (SENSITIVE-HISTORY section 3.6, accepted by 0046) places it as derived,
  // computed with typed reasons and never stored, and no option may target it.
  // Lane 0.6: the day counter.
  field('the current day', 'tick', ['the day tick'], [at('State', 'stateDay')]),
  // Lane 0.7 (0046): situation chain and wait state. The wait itself is a status on the situation's record above.
  field('situation chain and wait state', 'situations', ['situation effects (flags set and cleared)'], [at('State', 'situationFlags')]),
];

/**
 * Immutable records (decision 0052). State is copy-on-write: every record below
 * the root is an immutable value, replaced whole by the writer of the root
 * field that holds it, so no key of such a record is ever assigned after the
 * record is built. A record is declared here by its type name, and the
 * one-writer scan reads its keys from the type itself: a new nested record is
 * one line here, not one line per key. Every record reachable from `State`
 * must be declared (or own its keys in `OWNED_FIELDS`), which the
 * classification test enforces.
 *
 * The scan matches a key by name, so the keys of declared records must be
 * unique across them and distinct from every owned key (the classification test
 * checks both); that is why they carry a prefix (`msgOrigin`, `hopRole`, ...),
 * as decision 0044 asks. Rename a local rather than reuse such a key.
 */
export const IMMUTABLE_RECORDS: readonly string[] = [
  // Seats
  'SeatAssignment',
  // Messages in transit
  'TransitMessage',
  'Hop',
  'OrderBody',
  'VerbBody',
  // Plans (lane 1.2): goals, edits, plan records and the draft sets saved in them, each replaced whole by `plans`
  'PlanGoal',
  'EditSpec',
  'PlanRecord',
  'Enlistment',
  // Lane 1.12: a block's order to join its post, replaced whole by `movement`.
  'ForceJoin',
  'Levy',
  'CallSpec',
  'PlanCounter',
  'CounterDrop',
  'PendingCounter',
  'DraftSet',
  'PlanCandidate',
  'PlanAxis',
  'PlanRoute',
  'PlanLeg',
  'PlanPhase',
  'PlanRequest',
  'PlanGate',
  'PlanTerm',
  'PlanRejected',
  // Lane 1.4: operations (each replaced whole by `operations`)
  'OperationRecord',
  'OpAxis',
  'AxisEvent',
  'OpRequest',
  // Reports and knowledge
  'ReportBody',
  'ReportClaim',
  'AdviceBody',
  'StatedReason',
  'ReportTruth',
  'BiasTerm',
  'KnownReport',
  'SeatKnowledge',
  // Situations (lane 0.7: the live record of one situation, replaced whole by `situations`)
  'SituationRecord',
  // Lane 0.5: forces, movement and command (each replaced whole by its writer)
  'ForceBlockState',
  'ForceLocation',
  'PostState',
  'ScheduledChangeState',
  'StandingOrderState',
  'PostLinkState',
  'ObstructionState',
  'MarchLeg',
  // Close-out (0072): a person's rank, replaced whole by `people`
  'PersonRank',
  // Lane 1.1: people (each replaced whole by `people`) and responses to orders (by `proxy`)
  'PersonTrue',
  'PersonGrievance',
  'Stance',
  'PersonStatus',
  // Lane 1.5
  'PersonPromise',
  'AttentionState',
  'AudienceRecord',
  'ObserverPosting',
  'OrderResponse',
  'ResponseTerm',
  // Lane 1.3: battle records (each replaced whole by `combat`)
  'BattleRecord',
  'BattleDay',
  'BattleSide',
  'BattleTerm',
  'BlockLoss',
  // Lane 1.6: the chambers and the ledger (each replaced whole by `politics`)
  'ChamberState',
  'CongressAct',
];

/** State's own root fields that are set once at setup and never written after (the game's seed, the calendar's day 0). */
export const IMMUTABLE_ROOT_FIELDS: readonly string[] = ['gameSeed', 'calendarStart'];

/**
 * Keys that are never assigned after a record is built, wherever they appear,
 * because the thing they name is minted once (decision 0044; AWWV lesson M10:
 * unstable identity). They are exempt from the uniqueness check above, since
 * every record with an identity has one.
 */
export const NEVER_REASSIGNED_KEYS: readonly string[] = ['id'];

/**
 * State records the classification check skips, because the M2 kernel that
 * declared them was being replaced. The test fails if an entry names a file or
 * interface that no longer exists, so this list only shrinks. Empty since M2's
 * `GameState` retired with M2 (lane 1.13).
 */
export const LEGACY_STATE_RECORDS: readonly { readonly file: string; readonly record: string; readonly reason: string }[] = [];

/**
 * Lane 0.6 (review F6). State is copy-on-write, so building a new object
 * literal that carries an owned key is a write too: only the key's writer may
 * do it. These modules are the named exceptions, the constructors that build a
 * whole new State at setup, and nothing else.
 */
export const STATE_CONSTRUCTORS: readonly string[] = ['tick/setup'];
