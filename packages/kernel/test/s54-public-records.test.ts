import { expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { politicsProjection } from '../src/view/politics.ts';
import { promiseProjection } from '../src/view/promises.ts';
import type { ReportView } from '../src/view/types.ts';
import { indexWorld } from '../src/world/index.ts';
import { F, indexedFixture, P, R } from './support/seats-fixture.ts';
const own = P('a_lead'), person = P('a_gen');
function paper(id: string, changes: Partial<ReportView> = {}): ReportView {
  return { id: toId('message', id), type: 'wire-dispatch', subtype: null, author: person, authorPost: null,
    subjectKind: 'person', subjectId: person, claims: [], day: 1, hour: null, advice: null, answers: null,
    receivedDay: 1, route: 'in-person', via: [], ...changes };
}
const claim = (kind: 'promise-made' | 'promise-kept' | 'promise-broken', due = 31) => ({ kind, region: null, value: due, token: 'advancement', confidence: 1000 });
const made = paper('made', { author: own, claims: [claim('promise-made')] });
it('projects a frozen own commitment with the exact recorded date, due date and source', () => {
  const before = JSON.stringify(made);
  const result = promiseProjection(own, 1, [made]);
  expect(result).toEqual([{ person, kind: 'advancement', day: 1, dueDay: 31, source: made.id, status: 'pending', settledDay: null, settlement: null }]);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result[0])).toBe(true);
  expect(JSON.stringify(made)).toBe(before);
});
it('waits for receipt and for the written date before projecting terms or settlement', () => {
  const broken = paper('broken', { day: 35, receivedDay: 37, claims: [claim('promise-broken')] });
  expect(promiseProjection(own, 36, [made, broken])[0]!.status).toBe('pending');
  expect(promiseProjection(own, 37, [made, broken])[0]).toMatchObject({ status: 'expired', settledDay: 35, settlement: broken.id });
  expect(promiseProjection(own, 1, [{ ...made, day: 2 }])).toEqual([]);
  expect(promiseProjection(own, 1, [{ ...made, receivedDay: 2 }])).toEqual([]);
});
it('matches a settlement by recipient, kind and exact due date instead of applying a later promise to an old one', () => {
  const renewed = paper('renewed', { author: own, day: 40, receivedDay: 40, claims: [claim('promise-made', 70)] });
  const wrong = paper('wrong', { author: P('a_bold'), day: 45, receivedDay: 45, claims: [claim('promise-kept', 70)] });
  const kept = paper('kept', { day: 46, receivedDay: 46, claims: [claim('promise-kept', 70)] });
  expect(promiseProjection(own, 46, [made, renewed, wrong]).map(p => p.status)).toEqual(['pending', 'pending']);
  expect(promiseProjection(own, 46, [made, renewed, kept]).map(p => p.status)).toEqual(['pending', 'kept']);
  expect(promiseProjection(own, 46, [kept])).toEqual([]);
});
it('takes an audience commitment from the visitor account without substituting the post identity', () => {
  const audience = paper('audience', { type: 'advice', subtype: 'requested', subjectKind: 'post', subjectId: 'a_army', claims: [claim('promise-made')] });
  expect(promiseProjection(own, 1, [audience])[0]!.person).toBe(person);
});
function publicWorld() {
 const base = indexedFixture(), map = base.map.world;
 const blocs = [{ id: 'a_public', faction: F('a'), voice: 1000, rest: -300, values: ['duty'], victory: 20, defeat: -20, cite: 'fixture' },
   { id: 'b_public', faction: F('b'), voice: 1000, rest: 500, values: ['duty'], victory: 20, defeat: -20, cite: 'fixture' }];
 return indexSeatsWorld(indexWorld({ ...map, vocabularies: { ...map.vocabularies, blocs: blocs.map(b => ({ id: b.id, name: `bloc.${b.id}` })) }, rules: { ...map.rules, politics: { ...map.rules.politics, blocs,
   press: { ...map.rules.politics.press, papers: [{ id: 'page', faction: F('a'), editor: P('a_sec'), region: R('a_cap'), reachPermille: 1000, cite: 'fixture' }] } } } }), base.start);
}
it('offers public own-side names without support, rest, voice, values or enemy audiences', () => {
 const world = publicWorld();
 const result = politicsProjection(world, own, 0, []);
 expect(result).toEqual({ blocs: [{ id: 'a_public', name: 'bloc.a_public' }], evidence: [] });
 expect(Object.isFrozen(result.blocs[0])).toBe(true);
 expect(politicsProjection(world, person, 0, [])).toEqual({ blocs: [], evidence: [] });
});
it('keeps received press claims attributed and does not invent evidence from an unreceived or unrelated paper', () => {
 const world = publicWorld(), report = paper('page', { author: P('a_sec'), type: 'press', day: 2, receivedDay: 4,
   claims: [{ kind: 'framing', region: null, value: 123, token: null, confidence: 600 }] });
 expect(politicsProjection(world, own, 3, [report]).evidence).toEqual([]);
 expect(politicsProjection(world, own, 4, [report]).evidence).toEqual([{ source: report.id, author: report.author, day: 2, receivedDay: 4, kind: 'framing', value: 123, confidence: 600 }]);
 expect(politicsProjection(world, own, 4, [{ ...report, author: P('b_gen') }]).evidence).toEqual([]);
});
