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

  it('lands the Pickens company from its ship by the Navy Department’s order (S06), through the detachment path (lane 1.4b)', () => {
    expect(run.state.situationFlags['pickens_landed']).toBeDefined();
    const landed = Object.entries(run.state.forceLocations).filter(([id]) => id.startsWith('fb_us_pickens_vogdes_co_a.det.'));
    expect(landed.length).toBe(1);
    expect(landed[0]![1].locAboard).toBeNull();
  });

  it('S17: the Fort Monroe command opens before the question, its holder carries both rows, and the history run holds the men', () => {
    const fortCommand = run.state.postStates['us_dept_virginia' as never] as { postHolder: string | null } | undefined;
    expect(fortCommand?.postHolder).toBe('butler_benjamin_f');
    const opened = run.state.situationStates[S('butler_at_fort_monroe')]!.sitFiredDay!;
    const question = run.state.situationStates[S('fort_monroe_arrivals')]!;
    expect(opened).toBeLessThan(question.sitFiredDay!);
    // His practice is to hold them, so the escape notice that prints his refusal is the one that fires.
    expect(run.state.situationStates[S('fort_monroe_escape')]).toBeDefined();
    expect(run.state.situationStates[S('fort_monroe_escape_asked')]).toBeUndefined();
    expect(question.sitChosen).toEqual(['approve_holding']);
  });

  it('suspends the writ on the military line in the history run, entering it on the ledger for the special session to answer', () => {
    expect(run.state.situationStates[S('habeas_on_the_line')]!.sitChosen).toEqual(['suspend_on_line']);
    const act = run.state.congressLedger.find((e) => e.ledgerAct === 'habeas_suspension_1861')!;
    expect(act).toBeDefined();
    expect(act.ledgerAnsweredDay).not.toBeNull();
  });

  it('the opening order gives the Charleston command its goal against the fort, for lane 1.12’s bombardment stage', () => {
    const plan = run.state.planRecords['cs_cmd_charleston' as never] as { planGoal: { goalPosture: string; goalObjective: string | null } } | undefined;
    expect(run.state.situationStates[S('confederate_opening')]!.sitChosen).toEqual(['reduce_sumter']);
    expect(plan?.planGoal.goalPosture).toBe('take');
  });

  it('fires each government’s act its delay after the call reaches the governor, never before the call', () => {
    const arrived = (post: string) => Object.values(run.state.orderResponses).find((r) => r.respKind === 'call' && r.respPost === post)!.respDay;
    expect(run.state.situationStates[S('maryland_legislature')]!.sitFiredDay).toBe(arrived('st_gov_maryland') + 14);
    expect(run.state.situationStates[S('kentucky_neutrality_proclaimed')]!.sitFiredDay).toBe(arrived('st_gov_kentucky') + 35);
    expect(run.state.departmentFactions['st_maryland' as never]).toBe('union');
    // The upper South's acts: each a delay after the call reaches its government, each proposing its government's side.
    for (const [sit, post, delay, dept] of [['virginia_secedes', 'st_gov_virginia', 2, 'st_virginia'], ['tennessee_secedes', 'st_gov_tennessee', 21, 'st_tennessee']] as const) {
      expect(run.state.situationStates[S(sit)]!.sitFiredDay).toBe(arrived(post) + delay);
      expect(run.state.departmentFactions[dept as never]).toBe('confederate');
    }
  });

  it('closes the route through the border city on its cause, and the capital-cut-off decision reads the closure in State (0074)', () => {
    const arrived = Object.values(run.state.orderResponses).find((r) => r.respKind === 'call' && r.respPost === 'st_gov_massachusetts')!.respDay;
    expect(run.state.situationStates[S('baltimore_route_closed')]!.sitFiredDay).toBe(arrived + 4);
    const cutOff = run.state.situationStates[S('washington_cut_off')]!;
    expect(cutOff.sitFiredDay).toBeGreaterThanOrEqual(arrived + 4);
    expect(cutOff.sitChosen).toEqual(['around_baltimore']);
  });

  it('takes the spring’s other decisions in a history run: the arsenal, the western counties (both groups), the special session', () => {
    expect(run.state.situationStates[S('missouri_arsenal')]!.sitChosen).toEqual(['back_lyon']);
    // March and April's back channels: the assurance of notice (S05) and the offer to the convention's Unionist (S08).
    expect(run.state.situationStates[S('lamon_promise')]!.sitChosen).toEqual(['assure_notice']);
    expect(run.state.situationStates[S('virginia_unionists')]!.sitChosen).toEqual(['offer_fort']);
    // The border state's neutrality decision follows its proclamation; arms go quietly and no troops go in (two groups, taken together).
    const ky = run.state.situationStates[S('kentucky_neutrality')]!;
    expect(ky.sitFiredDay).toBeGreaterThanOrEqual(run.state.situationStates[S('kentucky_neutrality_proclaimed')]!.sitFiredDay!);
    expect([...ky.sitChosen].sort()).toEqual(['arm_quietly', 'wait']);
    expect(run.state.situationStates[S('mcdowell_advance')]!.sitChosen).toEqual(['advance_now']);
    // The navy yard arises from the state's secession notice, never on a date; the order to hold it goes down the chain.
    const yard = run.state.situationStates[S('gosport_yard')]!;
    expect(yard.sitFiredDay).toBeGreaterThanOrEqual(run.state.situationStates[S('virginia_secedes')]!.sitFiredDay!);
    expect(yard.sitChosen).toEqual(['defend']);
    expect([...run.state.situationStates[S('western_virginia')]!.sitChosen].sort()).toEqual(['cross_river', 'recognise']);
    const session = run.state.situationStates[S('special_session')]!;
    expect(session.sitFiredDay).toBeGreaterThanOrEqual(121);
    expect(session.sitChosen).toEqual(['ask_war_footing']);
    // Lane 1.6: the call was entered on the ledger while Congress was away, met when the House sat, and answered by the message.
    const act = run.state.congressLedger.find((e) => e.ledgerAct === 'militia_call_1861')!;
    // Met on 4 July when the House sits; the situation reads the chamber the next morning (the situations phase runs first).
    expect(act.ledgerMetDay).toBe(121);
    expect(session.sitFiredDay).toBe(122);
    expect(act.ledgerAnsweredDay).not.toBeNull();
  });

  it('raises S07 from the Secretary of State’s own initiative: with his researched values (lane 1.11a) he takes it, and his memorandum raises the situation', () => {
    const took = run.state.seatInitiatives['seat:seward_william_h' as never]?.['bid_for_direction'];
    // `took` is the day he last took it (it recurs on its cooldown); the memorandum raised the situation on his first.
    expect(took).toBeDefined();
    expect(run.state.situationStates[S('seward_memorandum')]!.sitFiredDay).toBeGreaterThan(0);
    // The control: with his values taken away, he takes no initiative, and the situation never arises on a date.
    const map = v2Map('union-1861')!;
    const people = map.world.people.map((p) => (p.id === 'seward_william_h' ? { ...p, values: [] } : p));
    const valueless = phase0.indexSeatsWorld(w.indexWorld({ ...map.world, people } as w.World), map.start, { situations: world.situations });
    const s = play(valueless, setup, 60).state;
    expect(s.seatInitiatives['seat:seward_william_h' as never]?.['bid_for_direction']).toBeUndefined();
    expect(s.situationStates[S('seward_memorandum')]).toBeUndefined();
  });
});
