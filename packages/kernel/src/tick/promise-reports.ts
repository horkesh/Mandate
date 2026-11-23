/** A principal's own spoken commitment is knowledge at issue, not a private reaction (0079). */
import { heldPost } from '../command/command.ts';
import type { PersonId } from '../ids.ts';
import { deliverReport } from '../knowledge/knowledge.ts';
import { NO_TRUTH } from '../knowledge/truth.ts';
import { mintMessageId } from '../messages/transit.ts';
import { seatIdFor } from '../seats/seats.ts';
import type { State } from '../root-state.ts';
import type { TickContext } from './context.ts';

export function fileSpokenPromise(ctx: TickContext, state: State, principal: PersonId, person: PersonId, kind: string, due: number): State {
  return deliverReport(state, seatIdFor(principal), {
    id: mintMessageId(ctx.mint, ctx.day, principal, principal, `promise.${person}.${kind}`),
    knownReceivedDay: ctx.day, knownRoute: 'in-person', knownVia: [],
    knownBody: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: principal, reportAuthorPost: heldPost(state, principal),
      reportSubjectKind: 'person', reportSubjectId: person, reportDay: ctx.day, reportHour: null, reportAdvice: null, reportAnswers: null,
      reportClaims: [{ claimKind: 'promise-made', claimRegion: null, claimToken: kind, claimValue: due, claimConfidence: 1000 }] },
  }, NO_TRUTH);
}
