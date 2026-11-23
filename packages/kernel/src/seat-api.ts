/**
 * The player-visible boundary (FOUNDATION section 8; decision 0015).
 *
 * This is the only part of the kernel a seat, the console, the interface or
 * the AI caller may import: `@mandate/kernel/seat-api`. It carries the seat
 * interface, the view a seat is given and the commands it may send, and
 * nothing else: no State, no truth terms, no traits, no messages in transit.
 * `test/boundary.test.ts` proves that this file's import closure never
 * reaches State or the truth layer, and that player-facing code imports the
 * kernel only through here.
 */
export type { FactionId, MessageId, PersonId, PostId, RegionId, SeatId } from './ids.ts';
export type { ClaimKind, ReportType, SubjectKind } from './knowledge/report.ts';
export type { NoteAccount } from './knowledge/report.ts';
export { ADVICE_SUBTYPES, CLAIM_KINDS, INFORMAL_SUBTYPES, REPORT_TYPES } from './knowledge/report.ts';
export type { AnswerProposalCommand, BattleCommand, CallCommand, ChooseCommand, Command, DecideCommand, DelegateCommand, EditTerms, GoCommand, GoalTerms, OrderCommand, ProposalAction, ReviewAction, ReviewCommand, SeatCommand } from './log/commands.ts';
export { PROPOSAL_ACTIONS, REVIEW_ACTIONS } from './log/commands.ts';
export { NOTE_KINDS } from './plans/notes.ts';
export type { PlanNote, NoteKind } from './plans/notes.ts';
export type { BattleOrders, CutOffChoice, NightChoice, Pursuit } from './combat/order-kinds.ts';
export { ALL_JUDGE, BATTLE_ORDER_OPTIONS, JUDGE } from './combat/order-kinds.ts';
// Lane 1.13: the people verbs as a console sends them, and the audience's counters (both plain vocabulary, no State).
export type { AddressCommand, AppointCommand, AudienceCommand, ConsultCommand, InquireCommand, ObserverCommand, PressureCommand, PromiseCommand, ReliefMode, RelieveCommand, TransferCommand, VerbCommand } from './log/commands.ts';
export { COMMAND_KINDS, RELIEF_MODES } from './log/commands.ts';
export type { CounterKind, CounterTerms } from './audience/counters.ts';
export { COUNTER_KINDS } from './audience/counters.ts';
export type { RouteKind } from './messages/latency.ts';
export type { Discretion, EditKind, PlanStatus, Posture } from './plans/goal.ts';
export { DISCRETION_CONDITIONS, EDIT_KINDS, MAX_FALLBACKS, PLAN_STATUSES, POSTURES } from './plans/goal.ts';
export type {
  AxisView,
  BattleMenu,
  Candidate,
  CommandablePost,
  DoctrineView,
  RaisingPost,
  Vacancy,
  DelegatedMenu,
  Menu,
  OptionView,
  PlanMenu,
  PlanReview,
  PrincipalMenu,
  ProposalOffer,
  RouteOption,
  Seat,
  SeatAnswer,
  SeatDriver,
  SeatRequest,
  SituationChoice,
  SituationOptionChoice,
} from './seats/api.ts';
export type { AdviceView, BeliefView, ClaimedFrontView, ClaimView, ControlBeliefSource, ControlBeliefView, GoalView, KnownPersonView, KnownPostView, KnownStanceView, ObstructionView, ReportView, SeatView, SituationOptionView, SituationView, WorksView } from './view/types.ts';
export type { SituationId } from './ids.ts';
export { TURN_STOP_POINTS } from './seats/turn-stops.ts';
export type { TurnStopPoint, TurnStopsView } from './seats/turn-stops.ts';
export type { AttentionBudgetView, CongressView, AudienceView } from './view/types.ts';
