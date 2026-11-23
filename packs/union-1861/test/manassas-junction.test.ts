import { expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { deliverReport } from '../../../packages/kernel/src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../../../packages/kernel/src/knowledge/truth.ts';
import { report } from '../../../packages/kernel/test/support/s25-fixture.ts';

const post = ids.toId('post', 'cs_cmd_harpers_ferry');
const principal = ids.toId('person', 'davis_jefferson');
const seat = phase0.seatIdFor(principal);

it('the junction doctrine waits for a received advance notice and remembers only its own sent order', () => {
  const { world, setup } = seatsWorld('union-1861');
  const initial = { ...phase0.createState(world, setup), stateDay: 140 };
  const projection = (state: typeof initial) => {
    const request = phase0.pendingRequests(world, state).find(r => r.requestSeat === seat)!;
    if (request.menu.menuKind !== 'principal') throw Error('principal required');
    return request.menu.doctrine.offensives.find(o => o.post === post && o.objective === 'manassas')!;
  };
  expect(projection(initial)).toMatchObject({ day: 134, ready: false, issued: false });
  const hidden = { ...initial, situationFlags: { ...initial.situationFlags, manassas_advance_received: 136 } };
  expect(projection(hidden)).toEqual(projection(initial));
  const paper = report('junction.news', { reportAuthor: ids.toId('person', 'walker_leroy_p'),
    reportAuthorPost: ids.toId('post', 'cs_secretary_war'), reportSubjectKind: 'situation',
    reportSubjectId: 'manassas_advance_received', reportDay: 136 }, 139);
  const received = deliverReport(initial, seat, paper, NO_TRUTH);
  expect(projection(received)).toMatchObject({ day: 134, ready: true, issued: false });
  const future = deliverReport(initial, seat, { ...paper, knownReceivedDay: 141 }, NO_TRUTH);
  expect(projection(future)).toEqual(projection(initial));
  const sent = { ...received, knowledgeBySeat: { ...received.knowledgeBySeat, [seat]: {
    ...received.knowledgeBySeat[seat]!, knownSentOrders: [{ sentPost: post, sentMessage: ids.toId('message', 'junction.order'),
      sentKind: 'goal' as const, sentDay: 140, sentPaper: null }],
  } } };
  expect(projection(sent)).toMatchObject({ ready: true, issued: true });
});

it('a calendar date and a private goal cannot generate the news or a junction', () => {
  const { world, setup } = seatsWorld('union-1861');
  const notice = world.situations.find(s => s.id === 'manassas_advance_received')!;
  expect(notice.railroad).toBeNull();
  expect(notice.event).toMatchObject({ all: expect.arrayContaining([{ advancingOn: { post: 'us_dept_northeastern_virginia', region: 'manassas' } }]) });
  const first = { ...phase0.createState(world, setup), stateDay: 149 };
  const tick = phase0.tick(world, first, [], { freeze: true });
  expect(tick.state.situationStates[notice.id]).toBeUndefined();
  expect(tick.state.messagesInTransit.some(m => m.msgReport?.reportSubjectId === notice.id)).toBe(false);
});
