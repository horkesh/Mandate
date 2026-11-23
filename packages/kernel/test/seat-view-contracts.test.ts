import { expect, it } from 'vitest';
import { toId, type PersonId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import type { ReportBody } from '../src/knowledge/report.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { fireSituation, surfaceSituation } from '../src/situations/situations.ts';
import { isProposalBasis, type ProposalBasis, type SituationDef } from '../src/situations/types.ts';
import { createState } from '../src/tick/setup.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { F, indexedFixture, P, POST } from './support/seats-fixture.ts';

const principal = P('a_lead');
const seat = seatIdFor(principal);
const office = POST('a_office');

function situation(id: string, overrides: Partial<SituationDef>): SituationDef {
  return {
    id: toId('situation', id), kind: 'notice', faction: F('a'), title: 'title', text: 'text',
    earliest: '1900-06-01', event: { dayAtLeast: 1 }, knowledge: null, railroad: 'test fixture',
    chain: null, subjects: [], options: [], inaction: null, historicalDefault: null, staffLine: null,
    delegableTo: [], resurfaceOn: [], effects: [], report: null, gate: { none: 'test fixture' },
    gateReview: null, citations: [], ...overrides,
  };
}

it.each(['law-and-practice', 'principal-initiative'] as const)('copies and deeply freezes %s provenance in the view', (basis) => {
  const cites = [{ source: 'record', at: 'p. 4' }];
  const proposedBy: ProposalBasis = basis === 'law-and-practice'
    ? { basis, cites }
    : { basis, author: principal, dated: '1900-05-31', cites };
  const decision = situation('decide', {
    kind: 'decision',
    options: [{
      id: 'accept', label: 'accept', displayKey: 1, proposedBy, group: null, appearsWhen: null,
      expiresWhen: null, waitsOn: null, effects: [], lockedCosts: [], orders: [], calls: [], honours: [],
      watched: true, policy: null, gate: null,
    }],
    inaction: { text: 'wait', effects: [], policy: null },
    historicalDefault: { options: ['accept'] },
    ...(basis === 'law-and-practice'
      ? { staffLine: { authors: [office], recommends: ['accept'], reasons: [], confidence: 700 } }
      : { report: { authors: [office], reportType: 'wire-dispatch', subtype: null } }),
  });
  const world = indexedFixture({}, [decision]);
  const opening = createState(world, { seed: 1 });
  const fired = fireSituation(opening, decision.id, 1, 'decision', ['accept']);
  const state = surfaceSituation({ ...fired, stateDay: 1 }, decision.id, 1, null);
  const exposed = viewFor(world, state, seat).situations[0]!.options[0]!.proposedBy;
  expect(isProposalBasis(exposed)).toBe(true);
  if (!isProposalBasis(exposed)) throw new Error('missing proposal provenance');
  expect(exposed).toEqual(proposedBy);
  for (const [viewNode, authoredNode] of [[exposed, proposedBy], [exposed.cites, cites], [exposed.cites[0], cites[0]]]) {
    expect(viewNode).not.toBe(authoredNode);
    expect(Object.isFrozen(viewNode)).toBe(true);
  }
  cites[0]!.at = 'p. 8';
  expect(exposed.cites[0]!.at).toBe('p. 4');
});

it('refreshes the principal’s cached post on a received appointment when location and goal stay the same', () => {
  const world = indexedFixture();
  const state = createState(world, { seed: 1 });
  const hidden = {
    ...state, postStates: { ...state.postStates, [office]: { ...state.postStates[office]!, postHolder: principal } },
  };
  const appointed = deliverReport(hidden, seat, {
    id: toId('message', 'own-appointment'), knownReceivedDay: 0, knownRoute: 'in-person', knownVia: [],
    knownBody: {
      reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: principal, reportAuthorPost: office,
      reportSubjectKind: 'post', reportSubjectId: office, reportDay: 0, reportHour: null,
      reportClaims: [{ claimKind: 'verb-answered', claimRegion: null, claimValue: 1, claimToken: 'appoint:accepted', claimConfidence: 1000 }],
      reportAdvice: null, reportAnswers: null,
    },
  }, NO_TRUTH);
  const cache = createViewCache();
  const before = viewFor(world, state, seat, cache);
  expect(viewFor(world, hidden, seat, cache)).toEqual(before);
  const fresh = viewFor(world, appointed, seat);
  expect([before.post, fresh.post]).toEqual([null, office]);
  expect([fresh.region, fresh.goal]).toEqual([before.region, before.goal]);
  expect(viewFor(world, appointed, seat, cache)).toEqual(fresh);
});

const succession = (id: string, from: PersonId, to: PersonId): SituationDef => situation(id, {
  report: { authors: [office], reportType: 'informal', subtype: 'cabinet-word' },
  effects: [{
    propose: { owner: 'command', field: 'post_succession', subject: POST('a_army'), delta: 1,
      reason: 'succession', side: F('a'), succession: { from, to } },
  }],
});

function receive(state: State, id: string, subject: SituationDef, written: number, delivered: number, overrides: Partial<ReportBody> = {}): State {
  return deliverReport(state, seat, {
    id: toId('message', id), knownReceivedDay: delivered, knownRoute: 'courier', knownVia: [],
    knownBody: {
      reportType: 'informal', reportSubtype: 'cabinet-word', reportAuthor: P('a_sec'), reportAuthorPost: office,
      reportSubjectKind: 'situation', reportSubjectId: subject.id, reportDay: written, reportHour: null,
      reportClaims: [], reportAdvice: null, reportAnswers: null, ...overrides,
    },
  }, NO_TRUTH);
}

it('projects received succession notices in written order without reading the live office', () => {
  const target = POST('a_army');
  const initial = P('a_gen'), successor = P('a_bold'), latest = P('a_spy');
  const first = succession('first_successor', initial, successor);
  const second = succession('second_successor', successor, latest);
  const world = indexedFixture({}, [first, second]);
  const state = { ...createState(world, { seed: 1 }), stateDay: 10 };
  const hidden = { ...state, postStates: { ...state.postStates, [target]: { ...state.postStates[target]!, postHolder: latest } } };
  const cache = createViewCache();
  const projected = (s: State) => viewFor(world, s, seat, cache).posts.find((p) => p.post === target);
  const opening = { holder: initial, source: null, asOfDay: 0 };
  expect(projected(state)).toMatchObject(opening);
  expect(projected(hidden)).toMatchObject(opening);
  for (const overrides of [{ reportType: 'wire-dispatch', reportSubtype: null }, { reportSubjectKind: 'post' }] as const) {
    expect(projected(receive(hidden, 'unrelated', first, 4, 10, overrides))).toMatchObject(opening);
  }
  expect(projected(receive(hidden, 'future', first, 11, 10))).toMatchObject(opening);
  const pending = receive(hidden, 'first', first, 4, 11);
  expect(projected(pending)).toMatchObject(opening);
  const firstReport = { holder: successor, source: 'first', asOfDay: 4 };
  expect(projected({ ...pending, stateDay: 11 })).toMatchObject(firstReport);
  expect(projected(receive(state, 'first', first, 4, 10))).toMatchObject(firstReport);
  const heardSecond = receive(hidden, 'second', second, 8, 9);
  expect(projected(heardSecond)).toMatchObject(opening);
  const heardBoth = receive(heardSecond, 'first', first, 4, 10);
  expect(projected(heardBoth)).toMatchObject({ holder: latest, source: 'second', asOfDay: 8 });
});
