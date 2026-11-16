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
export { ADVICE_SUBTYPES, CLAIM_KINDS, INFORMAL_SUBTYPES, REPORT_TYPES } from './knowledge/report.ts';
export type { ChooseCommand, Command, DecideCommand, DelegateCommand, EditTerms, GoCommand, GoalTerms, OrderCommand, ReviewAction, ReviewCommand, SeatCommand } from './log/commands.ts';
export { REVIEW_ACTIONS } from './log/commands.ts';
// Lane 1.13: the people verbs as a console sends them, and the audience's counters (both plain vocabulary, no State).
export type { AddressCommand, AppointCommand, AudienceCommand, CallCommand, ConsultCommand, InquireCommand, ObserverCommand, PressureCommand, PromiseCommand, ReliefMode, RelieveCommand, TransferCommand, VerbCommand } from './log/commands.ts';
export { COMMAND_KINDS, RELIEF_MODES } from './log/commands.ts';
export type { CounterKind, CounterTerms } from './audience/counters.ts';
export { COUNTER_KINDS } from './audience/counters.ts';
export type { RouteKind } from './messages/latency.ts';
export type { EditKind, PlanStatus, Posture } from './plans/goal.ts';
export { EDIT_KINDS, PLAN_STATUSES, POSTURES } from './plans/goal.ts';
export type {
  AxisView,
  CommandablePost,
  DelegatedMenu,
  Menu,
  OptionView,
  PlanMenu,
  PlanReview,
  PrincipalMenu,
  RouteOption,
  Seat,
  SeatAnswer,
  SeatDriver,
  SeatRequest,
  SituationChoice,
  SituationOptionChoice,
} from './seats/api.ts';
export type { AdviceView, BeliefView, ClaimView, GoalView, ObstructionView, ReportView, SeatView, SituationOptionView, SituationView, WorksView } from './view/types.ts';
export type { SituationId } from './ids.ts';
