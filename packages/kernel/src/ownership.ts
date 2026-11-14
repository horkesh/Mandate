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
  { name: 'control-index', layer: 'Derived', owns: 'contact edges, fronts, pockets, components' },
  { name: 'supply', layer: 'Derived', owns: 'supply paths with capacity from sources' },
  { name: 'regions', layer: 'State', owns: 'region population, loyalty, supply value, fortification' },
  { name: 'forces', layer: 'State', owns: 'force blocks and detachments, with stores on hand' },
  { name: 'command', layer: 'State', owns: 'posts and the people in them; assignments; standing agreements and prior orders' },
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
  // Lane 0.4: control, set from the scenario start (0050) and changed only through `applyControl`.
  field('region control', 'control', ['combat', 'occupation'], [at('State', 'regionControl')]),
  field('region population, loyalty, supply value', 'regions', ['economy', 'situations', 'occupation']),
  field('edge condition', 'infrastructure', ['combat', 'raids', 'repair orders']),
  field('division location', 'movement', ['operations']),
  field('division strength, morale, experience, equipment', 'forces', ['combat', 'attrition', 'economy', 'recruitment']),
  field("a force block's stores on hand", 'forces', ['supply (daily)', 'operations (a sea delivery)']),
  field('detachments below the force block (garrisons, landings)', 'forces', ['command', 'operations']),
  field('stragglers: men absent from a force block who rejoin over days', 'forces', ['combat', 'attrition']),
  field('battle records', 'combat', []),
  field('fortification and entrenchment', 'regions', ['operations', 'combat']),
  field('division-to-post assignment', 'command', ['transfers', "the army commander's assignments"]),
  field('people in posts; temporary posts', 'command', ['appoint', 'relieve', 'promotion lists', "an operation's end"]),
  field('standing agreements and prior orders on a post', 'command', ['verbs', 'situations', "orders from the holder's own department"]),
  field("a person's stats, traits, standing, grievances, regard", 'people', ['combat results', 'the press', 'verbs', 'ladder']),
  field("a person's stances on record (from Consult)", 'people', ['Consult answers']),
  field("a person's ladder rung and rivals", 'ladder', ['weekly people step']),
  field('responses to orders (declared and actual rungs, reasons)', 'proxy', ['message arrival']),
  field('audience state', 'audience', ['the audience verb']),
  // Lane 0.6 builds only the stand-in standing goals (hold, or advance to a region).
  field('goals, plans, approvals, edits', 'plans', ['verbs', 'seat selections', 'order arrival'], [at('State', 'standingGoals')]),
  field('operations and their lifecycles', 'operations', ['plan approval', 'movement and combat outcomes']),
  field('knowledge (reports per seat)', 'knowledge', ['message delivery', 'pruning'], [at('State', 'knowledgeBySeat'), at('State', 'reportTruth')]),
  field('messages in transit', 'messages', ['commands', 'reports', 'relay links forwarding an order', "the kernel's latency rules"], [at('State', 'messagesInTransit')]),
  field('economy stocks', 'economy', ['weekly step', 'verbs']),
  field('situations fired, live (open options, clocks) and decided', 'situations', ['cause evaluation', 'decisions', "delegated seats' choices"], [at('State', 'situationStates')]),
  field('blocs, mandate, election results', 'politics', ['weekly step', 'battles', 'the press', 'checkpoints']),
  field("each chamber of Congress's state (sitting, adjourned, special session called)", 'politics', ['situations', 'the weekly step']),
  field('the framing term (who the public believes began the war)', 'politics', ["the war's opening situations", 'the press']),
  field('seat assignments', 'seats', ['setup', "the player's settings"], [at('State', 'seatAssignments')]),
  // Reserved by world format v2 (lane 0.2): State that starts from a scenario
  // start or a World rule, with its owner named before the mechanic is built.
  field('water edge obstructions (works or batteries in hostile hands; cleared)', 'infrastructure', ['combat', 'operations (a siege, a clearing)', 'situations']),
  field('depot condition (struck by raids, repaired)', 'infrastructure', ['raids', 'combat', 'repair orders']),
  field("a post's department (changed on a scheduled date or by a situation)", 'command', ['scheduled department changes in the scenario start', 'situations']),
  field("a person's rank and its date (seniority)", 'people', ['promotion lists', 'appoint']),
  field("today's weather per weather zone", 'weather', ['the day tick, from its named seeded stream (0029)']),
  // Guerrilla pressure (0029) is not here on purpose: the gate register
  // (SENSITIVE-HISTORY section 3.6, accepted by 0046) places it as derived,
  // computed with typed reasons and never stored, and no option may target it.
  // Lane 0.6: the day counter, and a stand-in that lane 0.5's forces and movement replace.
  field('the current day', 'tick', ['the day tick'], [at('State', 'stateDay')]),
  field("a post's headquarters region (stand-in until force blocks)", 'movement', ['standing-goal steps (stand-in operations)'], [at('State', 'headquarters')]),
  // Lane 0.7 (0046): situation chain and wait state. The wait itself is a status on the situation's record above.
  field('situation chain and wait state', 'situations', ['situation effects (flags set and cleared)'], [at('State', 'situationFlags')]),
];

/**
 * Keys a State record may carry that are set once, when the record is
 * created, and never written after: any assignment to them anywhere fails.
 */
export const IMMUTABLE_STATE_KEYS: readonly string[] = [
  'id',
  // Lane 0.6. State is copy-on-write: below the root, records are immutable values,
  // replaced whole by the writer of the root field that holds them.
  'gameSeed',
  // Lane 0.4: the calendar's day 0, from the scenario start.
  'calendarStart',
  // SeatAssignment
  'seatPerson',
  'seatDriver',
  // TransitMessage, Hop, OrderBody
  'msgOrigin',
  'msgFrom',
  'msgTo',
  'msgToPost',
  'msgRole',
  'msgRoute',
  'msgSentDay',
  'msgArriveDay',
  'msgVia',
  'msgPending',
  'msgOrder',
  'msgReport',
  'msgTruth',
  'hopPerson',
  'hopPost',
  'hopRole',
  'orderIssuer',
  'orderTarget',
  'orderGoal',
  'orderBypass',
  'orderIssuedDay',
  // GoalSpec, StandingGoal
  'goalSpecKind',
  'goalSpecRegion',
  'standingSpec',
  'standingIssuer',
  'standingViaChain',
  'standingSetDay',
  'standingOrder',
  // ReportBody, ReportClaim, AdviceBody, StatedReason
  'reportType',
  'reportSubtype',
  'reportAuthor',
  'reportAuthorPost',
  'reportSubjectKind',
  'reportSubjectId',
  'reportClaims',
  'reportDay',
  'reportHour',
  'reportAdvice',
  'reportAnswers',
  'claimKind',
  'claimRegion',
  'claimValue',
  'claimToken',
  'claimConfidence',
  'adviceRecommends',
  'adviceReasons',
  'adviceConfidence',
  'reasonKind',
  'reasonWeight',
  // ReportTruth, BiasTerm
  'truthTerms',
  'truthTrimmed',
  'termKind',
  'termPerson',
  'termPost',
  'termRegion',
  'termValue',
  'termRule',
  // SeatKnowledge, KnownReport
  'knownReports',
  'knownReceivedDay',
  'knownRoute',
  'knownVia',
  'knownBody',
  // Headquarters (stand-in)
  'hqRegion',
  'hqSinceDay',
  // Lane 0.7: SituationRecord (replaced whole by `situations`)
  'sitStatus',
  'sitFiredDay',
  'sitSurfacedDay',
  'sitOpenOptions',
  'sitResurfaced',
  'sitDecidedDay',
  'sitChosen',
  'sitDecidedBy',
  'sitDelegate',
  'sitWaitingOn',
  'sitStaffAuthor',
];

/**
 * State records the classification check skips, because the M2 kernel that
 * declares them is being replaced in Phase 0. The test fails if an entry
 * names a file or interface that no longer exists, so this list only shrinks.
 */
export const LEGACY_STATE_RECORDS: readonly { readonly file: string; readonly record: string; readonly reason: string }[] = [
  { file: 'packages/kernel/src/state.ts', record: 'GameState', reason: 'M2 state; replaced by the new State in Phase 0' },
];

/**
 * Lane 0.6 (review F6). State is copy-on-write, so building a new object
 * literal that carries an owned key is a write too: only the key's writer may
 * do it. These modules are the named exceptions, the constructors that build a
 * whole new State at setup, and nothing else.
 */
export const STATE_CONSTRUCTORS: readonly string[] = ['tick/setup'];
