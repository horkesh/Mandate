import { describe, expect, it } from 'vitest';
import { createDerivedMapCache } from '../src/control-index/derived.ts';
import { sendMessages } from '../src/messages/transit.ts';
import { createState } from '../src/tick/setup.ts';
import { mapPhase } from '../src/tick/map.ts';
import { battleReports } from '../src/tick/battle-reports.ts';
import { tick } from '../src/tick/tick.ts';
import { knowledgeOf, reportsForView } from '../src/knowledge/knowledge.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { viewFor } from '../src/view/view.ts';
import { filterDecision } from '../src/reading/orders.ts';
import { traitsOf } from '../src/people/traits.ts';
import { ctxFor } from './support/tick-context.ts';
import { F, P, POST, R, indexedFixture } from './support/seats-fixture.ts';

// Drive the actual map/report phases, then the normal transit and delivery path.
describe('reports of control changes outside battle', () => {
  function change(before: number, delta: number, at = 'a_mid', vacant = false) {
    const world = indexedFixture();
    let start = createState(world, { seed: 1 });
    start = { ...start, regionControl: { ...start.regionControl, [R(at)]: { a: before, b: 1000 - before } } };
    if (vacant) start = { ...start, postStates: { ...start.postStates, [POST('a_reserve')]: { ...start.postStates[POST('a_reserve')]!, postHolder: null } } };
    const ctx = { ...ctxFor(world, start, 1), telemetry: undefined };
    ctx.controlDeltas.push({ region: R(at), faction: F('a'), deltaPermille: delta, cause: 'occupation' });
    const state = mapPhase(ctx, start, createDerivedMapCache()).state;
    battleReports(ctx, state, start.regionControl);
    return { world, start, state, ctx, reports: ctx.outbox.filter(m => m.msgReport?.reportClaims.some(c => c.claimKind === 'control')) };
  }

  it('reports an occupation holder change between thresholds to both affected principals', () => {
    const { reports, state, start, world } = change(490, 20);
    expect(state.regionControl[R('a_mid')]).toEqual({ a: 510, b: 490 });
    expect(viewFor(world, state, seatIdFor(P('a_lead'))).controlBeliefs).toEqual(viewFor(world, start, seatIdFor(P('a_lead'))).controlBeliefs);
    expect(reports).toHaveLength(2);
    expect(reports.map(m => m.msgReport!.reportAuthor).sort()).toEqual(['a_bold', 'b_min']);
    for (const m of reports) {
      expect(m.msgReport).toMatchObject({ reportType: 'wire-dispatch', reportDay: 1, reportSubjectKind: 'region', reportSubjectId: 'a_mid' });
      expect(Object.fromEntries(m.msgReport!.reportClaims.map(c => [c.claimToken, c.claimValue]))).toEqual({ a: 510, b: 490 });
      expect(m.msgTruth?.truthTerms.length).toBe(2);
    }
  });

  it('reports a retreat threshold without a holder change, once per side', () => {
    const { reports, ctx } = change(40, 20);
    expect(ctx.mapEvents.filter(e => e.event === 'threshold_crossed')).toHaveLength(1);
    expect(reports).toHaveLength(2);
  });

  it('uses the same department staff if the local command is vacant', () => {
    const { reports } = change(490, 20, 'a_mid', true);
    expect(reports.find(m => m.msgReport!.reportAuthor === P('a_sec'))?.msgReport!.reportAuthorPost).toBe('a_office');
  });

  it('lets a serving field superior sign for a vacant local post before the department office', () => {
    const world = indexedFixture();
    const initial = createState(world, { seed: 1 });
    const start = { ...initial,
      regionControl: { ...initial.regionControl, [R('a_mid')]: { a: 490, b: 510 } },
      postStates: { ...initial.postStates, [POST('a_reserve')]: { ...initial.postStates[POST('a_reserve')]!, postHolder: null, postParent: POST('a_army') } },
    };
    const ctx = { ...ctxFor(world, start, 1), telemetry: undefined };
    ctx.controlDeltas.push({ region: R('a_mid'), faction: F('a'), deltaPermille: 20, cause: 'occupation' });
    const state = mapPhase(ctx, start, createDerivedMapCache()).state;
    battleReports(ctx, state, start.regionControl);
    const report = ctx.outbox.find(m => m.msgReport?.reportClaims.some(c => c.claimKind === 'control') && m.msgReport.reportAuthor === P('a_gen'));
    expect(report?.msgReport).toMatchObject({ reportAuthor: 'a_gen', reportAuthorPost: 'a_army', reportSubjectId: 'a_mid' });
    expect(ctx.outbox.some(m => m.msgReport?.reportAuthor === P('a_sec'))).toBe(false);
  });

  it('writes nothing for an ordinary subthreshold increment or no change', () => {
    expect(change(100, 10).reports).toEqual([]);
    expect(change(1000, 10).reports).toEqual([]);
  });

  it('retains template latency and changes the map only after the report arrives', () => {
    const { world, state, ctx, reports } = change(490, 20, 'a_front');
    const report = reports.find(m => m.msgReport!.reportAuthor === P('a_gen'));
    expect(report).toBeDefined();
    expect(report!.msgArriveDay).toBeGreaterThan(1);
    const arrival = report!.msgArriveDay + (report!.msgRole === 'filter' ? filterDecision(world.rules.people, traitsOf(world, state, report!.msgTo), report!.msgToPost!).holdDays : 0);
    let running = sendMessages(state, ctx.outbox);
    for (let day = 2; day <= arrival; day++) {
      running = tick(world, { ...running, stateDay: day - 1 }, []).state;
      const received = reportsForView(knowledgeOf(running, seatIdFor(P('a_lead')))).some(r => r.id === report!.id);
      expect(received).toBe(day === arrival);
    }
    expect(viewFor(world, running, seatIdFor(P('a_lead'))).controlBeliefs[R('a_front')]).toMatchObject({ holder: 'a', contested: true, asOfDay: 1 });
  });
});
