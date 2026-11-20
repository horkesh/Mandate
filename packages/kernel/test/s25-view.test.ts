import { expect, it } from 'vitest';
import { claimedControlView } from '../src/view/claimed-control.ts';
import { toId } from '../src/ids.ts';
import { deliverReport } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import type { SituationDef } from '../src/situations/types.ts';
import { viewFor } from '../src/view/view.ts';
import { indexWorld } from '../src/world/index.ts';
import { claim, fresh, report } from './support/s25-fixture.ts';
import { F, P, POST, R, indexedFixture } from './support/seats-fixture.ts';

it('S25 view-07: received control of a key point appears on the staff map', () => {
  const { world } = fresh();
  const map = indexWorld({
    ...world.map.world,
    regions: world.map.world.regions.map(r => r.id === R('a_front') ? { ...r, kind: 'key_point' as const } : r),
  });
  const paper = report('s25.key-point', { reportClaims: [claim('control', 1000, F('a'))] });
  expect(claimedControlView(map, [paper]).controlBeliefs[R('a_front')]).toMatchObject({
    holder: F('a'), shares: { a: 1000 }, mark: 'pencil', sources: [{ report: paper.id }],
  });
});

it.each([
  { owner: 'politics', field: 'department_side' },
  { owner: 'command', field: 'unimplemented_measure' },
])('S25 view-10: an unrelated notice proposal does not announce a change of government (%j)', proposal => {
  const notice: SituationDef = {
    id: toId('situation', 's25.notice'), kind: 'notice', faction: F('a'), title: 'notice.title', text: 'notice.text',
    earliest: '1900-06-01', event: { dayAtLeast: 1 }, knowledge: null, railroad: 'test fixture', chain: null,
    subjects: [], options: [], inaction: null, historicalDefault: null, staffLine: null, delegableTo: [], resurfaceOn: [],
    effects: [{ propose: { ...proposal, subject: 'a_war', side: F('b'), delta: 1, reason: 'fixture' } }],
    report: { authors: [POST('a_office')], reportType: 'wire-dispatch', subtype: null },
    gate: { none: 'test fixture' }, gateReview: null, citations: [],
  };
  const { state, seat } = fresh();
  const world = indexedFixture({}, [notice]);
  const held = deliverReport({ ...state, stateDay: 1 }, seat,
    report('s25.notice-paper', { reportSubjectKind: 'situation', reportSubjectId: notice.id, reportAuthor: P('a_sec') }), NO_TRUTH);
  expect(viewFor(world, held, seat).people.find(p => p.person === P('a_gen'))!.standing).toBe(state.personStanding[P('a_gen')]);
});
