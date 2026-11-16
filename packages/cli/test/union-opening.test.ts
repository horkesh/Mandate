import { ids, phase0, world as w } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { describe, expect, it } from 'vitest';
import { seatsWorld, v2Map } from '../src/seats-world.ts';

/**
 * The opening of 1861 in union-1861, as lane 1.11 authored it, in a history run with no labelled option:
 * - the war opens by each side's own decision (0066), and S01's relief opens Fox's expedition command by effect (0040);
 * - S07 arises from the Secretary of State's own initiative, his memorandum to the president (lane 1.5's seat initiatives), not a date;
 * - each state's act follows the call's arrival at its governor by the pack's delay (STAND-IN until conventions, 1B).
 */
const rules = createRuleSeat();
const S = (id: string) => ids.toId('situation', id);
const play = (world: phase0.SeatsWorld, setup: Parameters<typeof phase0.createState>[1], days: number) => phase0.playDays(world, phase0.createState(world, setup), () => rules, days, { freeze: true });

describe('the opening of 1861 (lane 1.11)', () => {
  const { world, setup } = seatsWorld('union-1861');
  const run = play(world, setup, 148);

  it('opens the Sumter relief expedition by S01’s effect, with Fox, a man without a post, in command', () => {
    expect(run.state.situationStates[S('sumter_garrison')]!.sitChosen).toEqual(['provision_notice']);
    expect(run.state.postStates['us_sumter_relief_expedition' as never]).toMatchObject({ postKind: 'temporary_command', postHolder: 'fox_gustavus_v', postOperation: 'sumter_relief' });
  });

  it('fires each government’s act its delay after the call reaches the governor, never before the call', () => {
    const arrived = (post: string) => Object.values(run.state.orderResponses).find((r) => r.respKind === 'call' && r.respPost === post)!.respDay;
    expect(run.state.situationStates[S('maryland_legislature')]!.sitFiredDay).toBe(arrived('st_gov_maryland') + 14);
    expect(run.state.situationStates[S('kentucky_neutrality_proclaimed')]!.sitFiredDay).toBe(arrived('st_gov_kentucky') + 35);
    expect(run.state.departmentFactions['st_maryland' as never]).toBe('union');
  });

  it('raises S07 from the Secretary of State’s own initiative: with his researched values he takes it, and his memorandum raises the situation', () => {
    const map = v2Map('union-1861')!;
    const people = map.world.people.map((p) => (p.id === 'seward_william_h' ? { ...p, values: ['conciliation', 'union', 'reputation'].map((value) => ({ value, cites: [] })) } : p));
    const seward = phase0.indexSeatsWorld(w.indexWorld({ ...map.world, people } as w.World), map.start, { situations: world.situations });
    const s = play(seward, setup, 60).state;
    const took = s.seatInitiatives['seat:seward_william_h' as never]?.['bid_for_direction'];
    expect(took).toBeDefined();
    expect(s.situationStates[S('seward_memorandum')]!.sitFiredDay).toBeGreaterThan(took!);
    // Without his values entered, he takes no initiative, and the situation never arises on a date.
    expect(run.state.situationStates[S('seward_memorandum')]).toBeUndefined();
  });
});
