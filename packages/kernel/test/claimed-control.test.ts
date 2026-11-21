import { describe, expect, it } from 'vitest';
import { applyControl } from '../src/control/control.ts';
import { toId } from '../src/ids.ts';
import { deliverReport, knowledgeOf, pruneKnowledge, reportsForView } from '../src/knowledge/knowledge.ts';
import type { ReportClaim } from '../src/knowledge/report.ts';
import { term, truthOf } from '../src/knowledge/truth.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { decodeSave, encodeSave } from '../src/serialize/save.ts';
import { createState } from '../src/tick/setup.ts';
import { createViewCache, viewFor } from '../src/view/view.ts';
import { F, P, POST, R, indexedFixture } from './support/seats-fixture.ts';

const seat = seatIdFor(P('a_lead'));
const region = R('a_mid');
const a = F('a');
const b = F('b');
const truth = { truthTerms: [], truthTrimmed: [] };
const control = (id: string, faction: string, value: number): ReportClaim => ({ claimKind: 'control', claimRegion: R(id), claimToken: faction, claimValue: value, claimConfidence: 1000 });

function world() {
  const base = indexedFixture();
  const authors = [{ faction: a, post: POST('a_office') }, { faction: b, post: POST('b_office') }];
  const table = base.start.control.map((row) => row.region === R('a_front') ? { ...row, shares: [{ faction: b, permille: 1000 }] } : row);
  return indexSeatsWorld(base.map, { ...base.start, openingControl: { authors, table } });
}

function tell(state: State, id: string, author: string, stamp: number, arrival: number, claims: readonly ReportClaim[]) {
  return deliverReport(state, seat, {
    id: toId('message', id), knownReceivedDay: arrival, knownRoute: 'courier', knownVia: [],
    knownBody: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: P(author), reportAuthorPost: null, reportSubjectKind: 'region', reportSubjectId: region,
      reportDay: stamp, reportHour: null, reportAdvice: null, reportAnswers: null, reportClaims: claims },
  }, truth);
}

describe('the seat’s claimed control', () => {
  it('reuses the opening view when other reports change, and invalidates both opening inputs', () => {
    const w = world();
    const state = createState(w, { seed: 1 });
    const cache = createViewCache();
    const original = viewFor(w, state, seat, cache).reports[0]!;
    const told = tell(state, 'new-paper', 'a_sec', 1, 2, []);
    const after = viewFor(w, told, seat, cache);
    expect(after.reports.find(r => r.id === original.id)).toBe(original);
    expect(after).toEqual(viewFor(w, told, seat));
    const changedClaims = { ...told, openingControlClaims: [control(region, a, 1000)] };
    const changed = viewFor(w, changedClaims, seat, cache);
    expect(changed.reports.find(r => r.id === original.id)).not.toBe(original);
    expect(changed).toEqual(viewFor(w, changedClaims, seat));
    const stored = changedClaims.openingControlReports![original.id]!;
    const changedReport = { ...changedClaims, openingControlReports: {
      ...changedClaims.openingControlReports, [original.id]: { ...stored, knownReceivedDay: 9 },
    } };
    expect(viewFor(w, changedReport, seat, cache)).toEqual(viewFor(w, changedReport, seat));
    // Returning to the old State must never keep the replacement's claims or stamp.
    expect(viewFor(w, state, seat, cache)).toEqual(viewFor(w, state, seat));
  });

  it('never fills a control-only opening override with government truth', () => {
    const base = indexedFixture();
    const governments = base.start.control.map(row => ({ region: row.region, department: toId('department', 'a_war'), provenance: [] }));
    const w = indexSeatsWorld(base.map, { ...base.start, governments, openingControl: { authors: [{ faction: a, post: POST('a_office') }, { faction: b, post: POST('b_office') }], table: base.start.control } });
    const state = createState(w, { seed: 1 });
    for (const id of Object.keys(state.seatAssignments) as (keyof State['seatAssignments'])[]) {
      expect(viewFor(w, state, id).reports.flatMap(r => r.claims).filter(c => c.kind === 'control-government')).toEqual([]);
    }
    expect(Object.values(state.regionGovernments).every(g => g === 'a_war')).toBe(true);
  });

  it('serializes the shared opening claims once and retains their complete assessment terms', () => {
    const w = world();
    const state = createState(w, { seed: 1 });
    const opening = viewFor(w, state, seat).reports[0]!;
    const text = encodeSave({ worldHash: '0'.repeat(64), state });
    expect(text.match(/"claimKind":"control"/g)).toHaveLength(opening.claims.filter(c => c.kind === 'control').length);
    expect(text.match(/"termKind":"observed"/g) ?? []).toHaveLength(0);
    for (const id of Object.keys(state.openingControlReports!) as (keyof State['reportTruth'])[]) {
      const expected = reportsForView(knowledgeOf(state, seat)).find(r => r.id === opening.id)!.knownBody.reportClaims.map(c => term('observed', c.claimValue, { region: c.claimRegion!, rule: `${c.claimKind}:${c.claimToken}` }));
      expect(truthOf(state, id)).toEqual({ truthTerms: expected, truthTrimmed: [] });
      expect(truthOf(decodeSave(text).state as unknown as State, id)).toEqual(truthOf(state, id));
    }
  });
  it('opens with one day-zero report from the named post and uses the override for the map alone', () => {
    const w = world();
    const s = createState(w, { seed: 1 });
    const view = viewFor(w, s, seat);
    expect(view.reports).toHaveLength(1);
    expect(view.reports[0]).toMatchObject({ author: 'a_sec', authorPost: 'a_office', day: 0 });
    expect(viewFor(w, s, seatIdFor(P('b_lead'))).reports[0]).toMatchObject({ author: 'b_min', authorPost: 'b_office', day: 0 });
    expect(s.regionControl[R('a_front')]).toEqual({ a: 100 });
    expect(view.controlBeliefs[R('a_front')]).toEqual({
      shares: { b: 1000 }, holder: b, contested: false, neutralGovernment: false, asOfDay: 0, mark: 'ink',
      sources: [{ report: view.reports[0]!.id, author: 'a_sec', authorPost: 'a_office', asOfDay: 0 }],
    });
    expect(view.claimedFronts).toEqual(expect.arrayContaining([expect.objectContaining({ own: region, faces: R('a_front'), faction: a, enemy: b, asOfDay: 0, mark: 'ink' })]));
  });

  it('writes each opening report body once and resolves the seat’s copy after a save round-trip', () => {
    const w = world();
    const state = createState(w, { seed: 1 });
    const aView = viewFor(w, state, seat);
    const other = seatIdFor(P('b_lead'));
    const bView = viewFor(w, state, other);
    expect(Object.keys(state.knowledgeBySeat).length).toBeGreaterThan(2);
    const text = encodeSave({ worldHash: '0'.repeat(64), state });
    const claims = aView.reports[0]!.claims.filter((c) => c.kind === 'control');
    expect(text.match(/"claimKind":"control"/g)).toHaveLength(claims.length);
    const saved = decodeSave(text).state as unknown as State;
    expect(reportsForView(knowledgeOf(saved, seat)).map((report) => report.id)).toEqual([aView.reports[0]!.id]);
    expect(viewFor(w, saved, seat)).toEqual(aView);
    expect(viewFor(w, saved, other)).toEqual(bView);
  });

  it('moves a front only when a report reaches the seat, with a complete new share vector', () => {
    const w = world();
    const s = createState(w, { seed: 1 });
    const cache = createViewCache();
    const before = viewFor(w, s, seat, cache);
    const moved = applyControl(w.map, s, [{ region, faction: b, deltaPermille: 1000, cause: 'occupation' }]).state;
    expect(viewFor(w, moved, seat)).toEqual(before);
    expect(viewFor(w, moved, seat, cache)).toBe(before);
    const told = tell(moved, 'told', 'a_sec', 2, 3, [control(region, b, 1000)]);
    const after = viewFor(w, told, seat, cache);
    expect(after.controlBeliefs[region]).toMatchObject({ shares: { b: 1000 }, holder: b, asOfDay: 2, mark: 'pencil' });
    expect(Object.keys(after.controlBeliefs[region]!.shares)).toEqual([b]);
    expect(after.claimedFronts).not.toEqual(before.claimedFronts);
    expect(after.claimedFronts).toEqual(expect.arrayContaining([expect.objectContaining({ own: R('a_cap'), faces: region, asOfDay: 0, mark: 'pencil' })]));
  });

  it('uses independent authors since the most recent holder change and stamps ties by arrival then id', () => {
    const w = world();
    const s = createState(w, { seed: 1 });
    const put = (state: State, id: string, author: string, stamp: number, arrival: number, other: number) => tell(state, id, author, stamp, arrival, [control(region, a, 1000 - other), control(region, b, other)]);
    const notices = [
      ['back-z', 'a_sec', 3, 6, 300],
      ['back-a', 'a_late', 3, 6, 200],
      ['loss', 'b_min', 2, 10, 1000],
      ['before', 'a_lead', 1, 11, 400],
      ['earlier-arrival', 'a_sec', 3, 5, 200],
    ] as const;
    const apply = (st: State, [id, author, stamp, arrival, other]: typeof notices[number]) => put(st, id, author, stamp, arrival, other);
    const told = notices.reduce(apply, s);
    const reversed = [...notices].reverse().reduce(apply, s);
    const latest = viewFor(w, told, seat).controlBeliefs[region];
    expect(viewFor(w, reversed, seat).controlBeliefs[region]).toEqual(latest);
    expect(latest).toMatchObject({ shares: { a: 700, b: 300 }, holder: a, contested: true, asOfDay: 3, mark: 'ink', sources: [{ report: 'back-z' }, { report: 'back-a' }] });
    const regained = put(put(put(s, 'before', 'a_lead', 1, 1, 400), 'loss', 'b_min', 2, 2, 1000), 'regained', 'a_sec', 3, 3, 0);
    expect(viewFor(w, regained, seat).controlBeliefs[region]).toMatchObject({ mark: 'pencil', sources: [{ report: 'regained' }] });
    const aged = pruneKnowledge(told, w.rules.templates, 200, w.map.world.rules.supplyControlPermille).state;
    expect(viewFor(w, aged, seat).controlBeliefs[region]).toEqual(latest);
  });

  it('keeps aged control evidence without allowing a stale battle dispatch to supply the enemy estimate', () => {
    const w = world();
    const start = createState(w, { seed: 1 });
    const told = tell(start, 'evening', 'a_sec', 3, 4, [control(region, b, 1000), { ...control(region, b, 900), claimKind: 'enemy-strength', claimToken: null }]);
    expect(viewFor(w, told, seat).enemyBeliefs[region]).toBeDefined();
    const aged = pruneKnowledge(told, w.rules.templates, 200, w.map.world.rules.supplyControlPermille).state;
    const view = viewFor(w, aged, seat);
    expect(view.enemyBeliefs[region]).toBeUndefined();
    expect(view.controlBeliefs[region]).toMatchObject({ holder: b, asOfDay: 3, sources: [{ report: 'evening' }] });
    expect(view.reports.find((r) => r.id === 'evening')?.claims.map((c) => c.kind)).toEqual(['control']);
  });

  it('does not let one author corroborate himself after the holder changes', () => {
    const w = world();
    let state = createState(w, { seed: 1 });
    state = tell(state, 'first-loss', 'a_sec', 2, 3, [control(region, b, 1000)]);
    state = tell(state, 'same-author', 'a_sec', 3, 4, [control(region, b, 900)]);
    const latest = viewFor(w, state, seat).controlBeliefs[region];
    expect(latest).toMatchObject({ holder: b, mark: 'pencil', sources: [{ report: 'same-author' }] });
    const aged = pruneKnowledge(state, w.rules.templates, 200, w.map.world.rules.supplyControlPermille).state;
    expect(viewFor(w, aged, seat).controlBeliefs[region]).toEqual(latest);
  });

  it('preserves the shared opening truth when another held report expires', () => {
    const w = world();
    const start = createState(w, { seed: 1 });
    const openingId = viewFor(w, start, seat).reports[0]!.id;
    const openingTruth = truthOf(start, openingId);
    expect(openingTruth?.truthTerms.length).toBeGreaterThan(0);
    const told = tell(start, 'expire-me', 'a_sec', 1, 2, [{ ...control(region, b, 2), claimKind: 'enemy-strength' }]);
    const pruned = pruneKnowledge(told, w.rules.templates, 200, w.map.world.rules.supplyControlPermille);
    expect(pruned.counts.byAge).toBeGreaterThan(0);
    expect(pruned.state.reportTruth[toId('message', 'expire-me')]).toBeUndefined();
    expect(truthOf(pruned.state, openingId)).toEqual(openingTruth);
    expect(viewFor(w, pruned.state, seat).controlBeliefs).toEqual(viewFor(w, start, seat).controlBeliefs);
    expect(viewFor(w, decodeSave(encodeSave({ worldHash: '0'.repeat(64), state: pruned.state })).state as unknown as State, seat).controlBeliefs).toEqual(viewFor(w, start, seat).controlBeliefs);
  });

  it('uses the explicit neutral report and shows its source alongside the control report', () => {
    const w = world();
    const start = createState(w, { seed: 1 });
    const neutral = tell(start, 'government', 'a_late', 3, 4, [{ ...control(region, 'neutral_department', 1), claimKind: 'control-government' }]);
    const view = viewFor(w, neutral, seat);
    expect(view.controlBeliefs[region]).toMatchObject({ neutralGovernment: true, mark: 'ink', sources: [{ author: 'a_sec' }, { report: 'government' }] });
    const aged = pruneKnowledge(neutral, w.rules.templates, 200, w.map.world.rules.supplyControlPermille).state;
    expect(viewFor(w, aged, seat).controlBeliefs[region]).toEqual(view.controlBeliefs[region]);
  });
});
