import { ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { causeFindings } from '../../../tools/rules/situation-causes.ts';

const S = (s: string) => ids.toId('situation', s);
const P = (s: string) => ids.toId('person', s);
const M = (s: string) => ids.toId('message', s);
const POST = (s: string) => ids.toId('post', s);
const raw = (id: string) => JSON.parse(readFileSync(new URL(`../situations/${id}.json`, import.meta.url), 'utf8'));
const civic = ['wheeling_convention', 'wheeling_ordinance', 'pierpont_elected', 'pierpont_aid_requested', 'wheeling_recognition_letter', 'wheeling_legislature'];
const record = (day: number): phase0.SituationRecord => ({
  sitStatus: 'noticed', sitFiredDay: day, sitSurfacedDay: null,
  sitOpenOptions: [], sitResurfaced: [], sitDecidedDay: null, sitChosen: [],
  sitDecidedBy: null, sitDelegate: null, sitWaitingOn: null, sitStaffAuthor: null,
});
function setup(ids: string[], day: number) {
  const loaded = seatsWorld('union-1861');
  const world = { ...loaded.world, situations: loaded.world.situations.filter(s => ids.includes(s.id)) };
  const state = { ...phase0.createState(world, { ...loaded.setup, drivers: { lincoln_abraham: 'human', davis_jefferson: 'human' } }), stateDay: day };
  return { world, state };
}
function advance(world: phase0.SeatsWorld, start: phase0.State, end: number) {
  let state = start;
  const days: phase0.State[] = [];
  while (state.stateDay < end) {
    const next = phase0.tick(world, state, [], { freeze: true });
    expect(next.rejections).toEqual([]);
    state = next.state;
    days.push(state);
  }
  return { state, days };
}
function heard(state: phase0.State, situation: string, day: number) {
  return phase0.deliverReport(state, phase0.seatIdFor(P('lincoln_abraham')), {
    id: M(`s58.${situation}`), knownReceivedDay: day, knownRoute: 'courier', knownVia: [],
    knownBody: {
      reportType: 'informal', reportSubtype: 'cabinet-word', reportAuthor: P('cameron_simon'),
      reportAuthorPost: POST('us_secretary_war'), reportSubjectKind: 'situation', reportSubjectId: situation,
      reportClaims: [], reportDay: day, reportHour: null, reportAdvice: null, reportAnswers: null,
    },
  }, { truthTerms: [], truthTrimmed: [] });
}

describe('S58: the civic causes and their news', () => {
  const cases = [
    ['wheeling_ordinance', 'wheeling_convention', 106, 98, 8],
    ['pierpont_elected', 'wheeling_ordinance', 107, 106, 1],
    ['wheeling_legislature', 'wheeling_ordinance', 118, 106, 12],
    ['wheeling_recognition_letter', 'pierpont_aid_requested', 112, 108, 4],
  ] as const;
  it.each(cases)('%s needs its cause, retains the dated boundary and waits if the cause is late', (id, parent, day, causeDay, interval) => {
    const { world, state } = setup([id], day - 1);
    const run = (s: phase0.State, end: number) => advance(world, s, end).state;
    expect(run(state, day + 2).situationStates[S(id)]).toBeUndefined();
    const caused = { ...state, situationStates: { [parent]: record(causeDay) } };
    const known = id === 'wheeling_recognition_letter' ? heard(caused, parent, causeDay + 1) : caused;
    expect(run(known, day).situationStates[S(id)]?.sitFiredDay).toBe(day);
    const late = { ...state, stateDay: 150, situationStates: { [parent]: record(150) } };
    const lateKnown = id === 'wheeling_recognition_letter' ? heard(late, parent, 150) : late;
    expect(run(lateKnown, 150 + interval - 1).situationStates[S(id)]).toBeUndefined();
    const event = run(lateKnown, 150 + interval);
    expect(event.situationStates[S(id)]?.sitFiredDay).toBe(150 + interval);
    expect(event.situationStates[S(id)]?.sitSurfacedDay).toBeNull();
    expect(run(event, 151 + interval).situationStates[S(id)]?.sitSurfacedDay).toBe(151 + interval);
  });
  it('Cameron cannot answer an application that has not reached the President', () => {
    const { world, state } = setup(['wheeling_recognition_letter'], 111);
    const caused = { ...state, situationStates: { pierpont_aid_requested: record(108) } };
    expect(advance(world, caused, 114).state.situationStates[S('wheeling_recognition_letter')]).toBeUndefined();
    expect(advance(world, heard({ ...caused, stateDay: 114 }, 'pierpont_aid_requested', 115), 115).state.situationStates[S('wheeling_recognition_letter')]?.sitFiredDay).toBe(115);
  });
  it('preserves the dated civic chain, with a received application before the letter', () => {
    const { world, state } = setup(civic, 96);
    const run = advance(world, { ...state, situationFlags: { virginia_seceded: 43 } }, 120);
    for (const [id, day] of [['wheeling_convention', 98], ['wheeling_ordinance', 106], ['pierpont_elected', 107], ['pierpont_aid_requested', 108], ['wheeling_recognition_letter', 112], ['wheeling_legislature', 118]] as const) {
      expect(run.state.situationStates[S(id)]?.sitFiredDay).toBe(day);
      expect(run.state.situationStates[S(id)]?.sitSurfacedDay).toBe(day + 1);
    }
  });
  it('does not elect before the ordinance when the convention comes after every nominal date', () => {
    const { world, state } = setup(civic, 130);
    const run = advance(world, { ...state, situationFlags: { virginia_seceded: 130 } }, 153);
    expect(run.state.situationStates[S('wheeling_convention')]?.sitFiredDay).toBe(131);
    expect(run.state.situationStates[S('wheeling_ordinance')]?.sitFiredDay).toBe(139);
    expect(run.state.situationStates[S('pierpont_elected')]?.sitFiredDay).toBe(140);
    expect(run.state.situationStates[S('wheeling_legislature')]?.sitFiredDay).toBe(151);
  });
});

describe('S58: Texas succession and the Pickens receipt', () => {
  it('does not remove Houston on a date alone or when another holder is in office', () => {
    const { world, state } = setup(['texas_governor_changed'], 10);
    expect(advance(world, state, 13).state.postStates[POST('st_gov_texas')]?.postHolder).toBe('houston_samuel');
    const caused = { ...state, situationStates: { houston_confederate_obligations: record(8) } };
    expect(advance(world, caused, 11).state.postStates[POST('st_gov_texas')]?.postHolder).toBe('clark_edward');
    const other = { ...caused, postStates: { ...caused.postStates, st_gov_texas: { ...caused.postStates[POST('st_gov_texas')]!, postHolder: P('clark_edward') } } };
    expect(advance(world, other, 12).state.situationStates[S('texas_governor_changed')]).toBeUndefined();
    const late = { ...caused, stateDay: 20, situationStates: { houston_confederate_obligations: record(20) } };
    expect(advance(world, late, 22).state.situationStates[S('texas_governor_changed')]).toBeUndefined();
    expect(advance(world, late, 23).state.situationStates[S('texas_governor_changed')]?.sitFiredDay).toBe(23);
  });
  it('waits for a landing choice, the refusal interval and the received Navy report', () => {
    const { world, state } = setup(['pickens_refusal_received', 'pickens_refused'], 31);
    const decision = { ...record(1), sitStatus: 'decided' as const, sitDecidedDay: 1, sitChosen: ['land_company'], sitDecidedBy: 'principal' as const };
    const caused = { ...state, situationStates: { pickens_reinforcement: decision } };
    expect(advance(world, state, 34).state.situationStates[S('pickens_refused')]).toBeUndefined();
    const fired = advance(world, caused, 32).state;
    expect(fired.situationStates[S('pickens_refusal_received')]?.sitFiredDay).toBe(32);
    expect(fired.situationStates[S('pickens_refused')]?.sitSurfacedDay).toBeNull();
    const arrival = fired.messagesInTransit.find(m => m.msgReport?.reportSubjectId === 'pickens_refusal_received')!.msgArriveDay;
    expect(arrival).toBeGreaterThan(32);
    expect(advance(world, fired, arrival - 1).state.situationStates[S('pickens_refused')]?.sitSurfacedDay).toBeNull();
    expect(advance(world, fired, arrival).state.situationStates[S('pickens_refused')]?.sitSurfacedDay).toBe(arrival);
    const withheld = { ...fired, messagesInTransit: fired.messagesInTransit.filter(m => m.msgReport?.reportSubjectId !== 'pickens_refusal_received') };
    expect(advance(world, withheld, arrival + 1).state.situationStates[S('pickens_refused')]?.sitSurfacedDay).toBeNull();
    const wrong = { ...caused, situationStates: { pickens_reinforcement: { ...decision, sitChosen: [] } } };
    expect(advance(world, wrong, 34).state.situationStates[S('pickens_refused')]).toBeUndefined();
    const late = { ...caused, stateDay: 60, situationStates: { pickens_reinforcement: { ...decision, sitDecidedDay: 30 } } };
    const lateFired = advance(world, late, 61).state;
    expect(lateFired.situationStates[S('pickens_refused')]?.sitSurfacedDay).toBeNull();
    const lateArrival = lateFired.messagesInTransit.find(m => m.msgReport?.reportSubjectId === 'pickens_refusal_received')!.msgArriveDay;
    expect(lateArrival).toBeGreaterThan(61);
    expect(advance(world, lateFired, lateArrival).state.situationStates[S('pickens_refused')]?.sitSurfacedDay).toBe(lateArrival);
  });
});

it.each(['wheeling_ordinance', 'pierpont_elected', 'wheeling_legislature', 'wheeling_recognition_letter', 'texas_governor_changed', 'pickens_refused'])('retires only the repaired live B2 finding: %s', id => {
  const path = `packs/union-1861/situations/${id}.json`;
  expect(causeFindings([{ path, value: raw(id) }], [])).toEqual([]);
  const baseline = JSON.parse(readFileSync(new URL('../../../tools/rules/existing-findings.json', import.meta.url), 'utf8'));
  expect(baseline.some((r: { path: string }) => r.path === path)).toBe(false);
});
