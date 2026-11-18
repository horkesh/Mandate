import { expect, it } from 'vitest';
import { dispatchLog } from '../src/desk/dispatches.ts';
import { deliverReport } from '../../kernel/src/knowledge/knowledge.ts';
import { toId } from '../../kernel/src/ids.ts';
import { createState } from '../../kernel/src/tick/setup.ts';
import { viewFor } from '../../kernel/src/view/view.ts';
import { seatIdFor } from '../../kernel/src/seats/seats.ts';
import { F, P, R, indexedFixture } from '../../kernel/test/support/seats-fixture.ts';

it('words each report’s own holder and contested status without showing control shares', () => {
  const world = indexedFixture();
  const seat = seatIdFor(P('a_lead'));
  let state = createState(world, { seed: 1 });
  for (const [id, day, a, b] of [['contested', 1, 600, 400], ['lost', 2, 0, 1000], ['empty', 3, 0, 0]] as const) {
    state = deliverReport(state, seat, {
      id: toId('message', id), knownReceivedDay: day, knownRoute: 'courier', knownVia: [],
      knownBody: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: P('a_sec'), reportAuthorPost: null,
        reportSubjectKind: 'region', reportSubjectId: R('a_mid'), reportDay: day, reportHour: null, reportAdvice: null, reportAnswers: null,
        reportClaims: [{ claimKind: 'control', claimRegion: R('a_mid'), claimToken: F('a'), claimValue: a, claimConfidence: 1000 }, { claimKind: 'control', claimRegion: R('a_mid'), claimToken: F('b'), claimValue: b, claimConfidence: 1000 }] },
    }, { truthTerms: [], truthTrimmed: [] });
  }
  const lines = dispatchLog(viewFor(world, state, seat));
  expect(lines[0]).toContain('a holds a_mid; contested ground');
  expect(lines[1]).toContain('b holds a_mid');
  expect(lines[2]).toContain('no holder reported at a_mid');
  expect(lines.join('\n')).not.toMatch(/600|400|1000|‰|permille/);
});
