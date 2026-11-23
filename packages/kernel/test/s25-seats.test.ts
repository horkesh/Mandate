import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { term } from '../src/knowledge/truth.ts';
import type { TransitMessage } from '../src/messages/transit.ts';
import { believedHolder } from '../src/seats/believed.ts';
import { isFieldPost } from '../src/seats/posts.ts';
import { morningGround, principalMenu } from '../src/seats/requests.ts';
import { claim, fresh, report } from './support/s25-fixture.ts';
import { F, P, POST } from './support/seats-fixture.ts';

it('S25 seats-03: an office without directly commanded blocks is not a field command', () => {
  const { world, state } = fresh();
  expect(isFieldPost(world, state, POST('a_office'))).toBe(false);
  expect(isFieldPost(world, state, POST('a_army'))).toBe(true);
});

it('S25 seats-04: the field-command vacancy menu excludes empty offices', () => {
  const { world, state, seat } = fresh();
  const vacant = { ...state, postStates: { ...state.postStates,
    [POST('a_office')]: { ...state.postStates[POST('a_office')]!, postHolder: null },
    [POST('a_army')]: { ...state.postStates[POST('a_army')]!, postHolder: null },
  } };
  let heard = { ...vacant, stateDay: 1 };
  for (const post of ['a_office', 'a_army']) heard = deliverReport(heard, seat, report(`m.vacant.${post}`, {
    reportSubjectKind: 'post', reportSubjectId: post, reportClaims: [claim('commander-lost', 1, 'captured')],
  }), NO_TRUTH);
  const menu = principalMenu(world, heard, F('a'), morningGround(world, heard, 2));
  expect(menu!.vacancies.map(v => v.post)).toEqual([POST('a_army')]);
});

it('S25 seats-02: simultaneous loss reports break ties by origin id, regardless of transit order', () => {
  const { state } = fresh();
  const post = POST('a_army');
  const loss = (id: string, person: string, arrive: number): TransitMessage => ({
    id: toId('message', id), msgOrigin: toId('message', id), msgFrom: P('a_sec'), msgTo: P('a_lead'),
    msgToPost: null, msgRole: 'addressee', msgRoute: 'courier', msgSentDay: 1, msgArriveDay: arrive,
    msgVia: [], msgPending: [], msgOrder: null, msgVerb: null,
    msgReport: report(id, { reportSubjectKind: 'post', reportSubjectId: post,
      reportClaims: [{ ...claim('commander-lost', 1, 'captured'), claimRegion: null }] }).knownBody,
    msgTruth: { truthTerms: [term('observed', 0, { person: P(person), post })], truthTrimmed: [] },
  });
  const a = loss('s25.loss.a', 'a_gen', 4);
  const z = loss('s25.loss.z', 'a_bold', 3);
  // The lower id can arrive later; arrival order is not authorship order.
  for (const messagesInTransit of [[z, a], [a, z]]) {
    expect(believedHolder({ ...state, messagesInTransit }, P('a_lead'), post)).toBe(P('a_bold'));
  }
});
