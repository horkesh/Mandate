import { createTelemetry, ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';

/**
 * The attacking principal's order of 12 April leads to the Charleston commander's bombardment and Anderson's choice (lane 1.12; the lead's ruling on
 * Sumter). The doctrine's offensive goes to the Charleston command; no land route reaches the fort, so the commander's plan
 * is to bombard it from Charleston, where his batteries stand. Anderson, cut off with his stores out, chooses by his
 * traits. This branch's doctrine falls late (day 46), outside the recorded 11–13 April offer window, so the existing
 * capture rules apply (R74). The historical case is checked separately in the pack's record-terms.test.ts.
 */
const rules = createRuleSeat();
const { world, setup } = seatsWorld('union-1861');
const R = (s: string) => ids.toId('region', s);
const P = (s: string) => ids.toId('post', s);

describe('Fort Sumter in the union-1861 run at war', () => {
  it('the delayed bombardment captures the garrison outside the recorded offer window', () => {
    const telemetry = createTelemetry([...phase0.TICK_MECHANICS, ...phase0.MAP_MECHANICS]);
    const run = phase0.playDays(world, phase0.createState(world, { ...setup, atWar: true }), () => rules, 75, { freeze: true, telemetry });
    // The order: the attacking principal's, on 12 April (day 38).
    expect(run.log.some((e) => e.day === 38 && e.command.cmd === 'order' && (e.command as unknown as { readonly to: string }).to === 'cs_cmd_charleston')).toBe(true);
    // The plan: a bombardment from Charleston, approved; the operation fired, then held its objective.
    const plan = run.state.planRecords[P('cs_cmd_charleston')]!;
    expect(plan.planApproved?.candMethod).toBe('bombard');
    expect(plan.planApproved?.candAxes[0]!.axisRoute.routeFrom).toBe(R('charleston'));
    const op = Object.values(run.state.operationRecords).find((o) => o.opPost === P('cs_cmd_charleston'))!;
    expect(op.opAxes[0]!.oaxLog.map((e) => e.axevReason)).toEqual(['opened', 'bombarding', 'garrison_surrendered', 'objective_held']);
    expect(telemetry.mechanics['combat.bombardment']!.fires).toBeGreaterThanOrEqual(1);
    // Anderson still chooses to surrender; a late fall cannot borrow the historical offer's terms.
    expect(telemetry.mechanics['combat.evacuated']!.fires).toBe(0);
    expect(run.state.forceBlockStates[ids.toId('forceBlock', 'fb_us_sumter_garrison')]).toMatchObject({ fbStrength: 0, fbSurrenderedDay: 46 });
    const anderson = run.state.postStates[P('us_fort_sumter')]!;
    expect(anderson.postHolder).toBeNull();
    expect(run.state.personStatus[ids.toId('person', 'anderson_robert')]?.statusKind).toBe('captured');
    expect(run.state.regionControl[R('fort_sumter')]).toEqual({ confederate: 1000 });
    // The defending principal receives the ordinary captured report, so the evacuation notice cannot fire.
    const lincoln = phase0.seatIdFor(world.faction(ids.toId('faction', 'union')).principal);
    const told = phase0.knowledgeOf(run.state, lincoln).knownReports.flatMap((r) => r.knownBody.reportClaims).find((c) => c.claimKind === 'fort-surrendered');
    expect(told?.claimToken).toBe('captured');
    expect(run.state.situationStates[ids.toId('situation', 'sumter_evacuated')]).toBeUndefined();
  });
});
