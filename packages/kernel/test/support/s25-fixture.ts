import { toId } from '../../src/ids.ts';
import type { KnownReport } from '../../src/knowledge/knowledge.ts';
import type { ReportBody, ReportClaim } from '../../src/knowledge/report.ts';
import { seatIdFor } from '../../src/seats/seats.ts';
import { createState } from '../../src/tick/setup.ts';
import { indexedFixture, P, R } from './seats-fixture.ts';

/** Fictional, deterministic inputs shared by the S25 boundary regressions. */
export function fresh() {
  const world = indexedFixture();
  return { world, state: createState(world, { seed: 17 }), seat: seatIdFor(P('a_lead')) };
}

export function claim(kind: ReportClaim['claimKind'], value: number, token: string | null = null): ReportClaim {
  return { claimKind: kind, claimRegion: R('a_front'), claimToken: token, claimValue: value, claimConfidence: 1000 };
}

export function report(id: string, over: Partial<ReportBody> = {}, received = 1): KnownReport {
  return {
    id: toId('message', id), knownReceivedDay: received, knownRoute: 'courier', knownVia: [],
    knownBody: {
      reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: P('a_gen'), reportAuthorPost: null,
      reportSubjectKind: 'region', reportSubjectId: R('a_front'), reportDay: 1, reportHour: null,
      reportClaims: [], reportAdvice: null, reportAnswers: null, ...over,
    },
  };
}
