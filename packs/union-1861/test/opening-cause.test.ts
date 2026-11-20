import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { seatsWorld, seatsMechanics } from '../../../packages/cli/src/seats-world.ts';
import { deliverReport } from '../../../packages/kernel/src/knowledge/knowledge.ts';
import { runSituations } from '../../../packages/kernel/src/tick/situations.ts';
import { ctxFor } from '../../../packages/kernel/test/support/tick-context.ts';
import { ConditionSchema } from '../../../packages/pack-format/src/situations.ts';

const { world, setup } = seatsWorld('union-1861');
const seat = phase0.seatIdFor(ids.toId('person', 'lincoln_abraham'));
const S = (id: string) => ids.toId('situation', id);
const opened = (state: phase0.State, day: number) => runSituations(ctxFor(world, state, day, seatsMechanics()), state);

function heard(state: phase0.State, received: number, kind: 'battle-phase' | 'fort-surrendered', subject = 'fort_sumter', written = received) {
  return deliverReport(state, seat, {
    id: ids.toId('message', `${kind}.${subject}.${received}`), knownReceivedDay: received, knownRoute: 'wire', knownVia: [],
    knownBody: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: ids.toId('person', 'anderson_robert'), reportAuthorPost: ids.toId('post', 'us_fort_sumter'), reportSubjectKind: 'region', reportSubjectId: subject,
      reportClaims: [{ claimKind: kind, claimRegion: ids.toId('region', subject), claimValue: 0, claimToken: kind === 'battle-phase' ? 'bombard' : 'evacuated_under_terms', claimConfidence: 1000 }],
      reportDay: written, reportHour: null, reportAdvice: null, reportAnswers: null },
  }, { truthTerms: [], truthTrimmed: [] });
}

describe('the opening follows received news', () => {
  it('requires any report deliberation interval to be a nonnegative whole number', () => {
    for (const forDays of [-1, 0.5]) expect(ConditionSchema.safeParse({ knows: { subjectId: 'fort_sumter' }, forDays }).success).toBe(false);
    expect(ConditionSchema.safeParse({ knows: { subjectId: 'fort_sumter' }, forDays: 2 }).success).toBe(true);
  });
  it('cannot tell Lincoln of fire from Davis’s authorization or unseen changes of control', () => {
    const start = phase0.createState(world, setup);
    const hidden = { ...start, situationFlags: { sumter_fired: 36 }, regionControl: { ...start.regionControl, [ids.toId('region', 'fort_sumter')]: { [ids.toId('faction', 'confederate')]: 1000 } } };
    for (const state of [start, hidden, heard(hidden, 38, 'battle-phase', 'charleston')]) {
      const out = opened(state, 38);
      expect(out.situationStates[S('sumter_fired_upon')]).toBeUndefined();
      expect(out.situationStates[S('call_for_troops')]?.sitSurfacedDay ?? null).toBeNull();
      expect(out.situationFlags.war_begun_union).toBeUndefined();
    }
  });

  it('surfaces the fallen-fort decision on receipt, then waits a day before issuing the call', () => {
    let state = heard(phase0.createState(world, setup), 38, 'battle-phase');
    state = opened(state, 38);
    expect(state.situationStates[S('sumter_fired_upon')]).toMatchObject({ sitFiredDay: 38, sitSurfacedDay: 38 });
    expect(state.situationStates[S('call_for_troops')]?.sitSurfacedDay).toBeNull();
    state = opened(heard(state, 40, 'fort-surrendered', 'fort_sumter', 39), 40);
    expect(state.situationStates[S('call_for_troops')]).toMatchObject({ sitSurfacedDay: 40, sitDecidedDay: null });
    expect(state.situationFlags.war_begun_union).toBeUndefined();
    expect(opened(state, 41).situationFlags.war_begun_union).toBe(41);
  });

  it('uses the received-news fallback while the fort still holds, even when the wire is late', () => {
    // The bombardment was on day 38, but he hears only on day 45. No surrender claim or evacuation notice exists.
    let state = heard(phase0.createState(world, setup), 45, 'battle-phase', 'fort_sumter', 38);
    const startControl = state.regionControl;
    state = opened(state, 45);
    expect(state.situationStates[S('sumter_fired_upon')]?.sitFiredDay).toBe(45);
    expect(state.situationStates[S('call_for_troops')]?.sitSurfacedDay).toBeNull();
    state = opened(state, 46);
    expect(state.situationStates[S('call_for_troops')]?.sitSurfacedDay).toBeNull();
    state = opened(state, 47);
    expect(state.situationStates[S('call_for_troops')]).toMatchObject({ sitSurfacedDay: 47, sitDecidedDay: null });
    expect(state.situationStates[S('sumter_evacuated')]).toBeUndefined();
    expect(state.regionControl).toEqual(startControl);
    expect(opened(state, 48).situationFlags.war_begun_union).toBe(48);
  });

  it('opens the Confederate option three days after its cause surfaces, including a late relief attempt', () => {
    let state: phase0.State = { ...phase0.createState(world, setup), situationFlags: { sumter_relief_ordered: 50 } };
    for (let day = 50; day <= 53; day++) {
      state = opened(state, day);
      expect(state.situationFlags.war_begun_confederate).toBe(day < 53 ? undefined : 53);
    }
  });
});
