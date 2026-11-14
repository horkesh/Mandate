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
export type { ChooseCommand, Command, OrderCommand } from './log/commands.ts';
export type { RouteKind } from './messages/latency.ts';
export type { GoalKind } from './plans/goal.ts';
export type {
  CommandablePost,
  Menu,
  OptionView,
  PrincipalMenu,
  RouteOption,
  Seat,
  SeatAnswer,
  SeatDriver,
  SeatRequest,
  StandingMenu,
} from './seats/api.ts';
export type { AdviceView, BeliefView, ClaimView, GoalView, ReportView, SeatView } from './view/types.ts';
