import { createTelemetry, ids, phase0 } from '@mandate/kernel';
import { createRuleSeat } from '@mandate/rule-seats';
import { describe, expect, it } from 'vitest';
import { seatsWorld } from '../src/seats-world.ts';
import { observeRun, operationsFought, operationScore, unknownStrengthScore } from '../src/history-run.ts';

describe('the sourced opening of the bombardment (R78)', () => {
  it('issues the 10 April authorization once, wires the bypass, and evacuates Anderson on 13 April', () => {
    const { world, setup } = seatsWorld('union-1861');
    const rules = createRuleSeat();
    const telemetry = createTelemetry([...phase0.TICK_MECHANICS, ...phase0.MAP_MECHANICS]);
    let state = phase0.createState(world, setup);
    const observer = observeRun(null, '1861-03-05');
    const days: { day: number; state: typeof state }[] = [];
    const log = [];
    for (let day = 1; day <= 55; day++) {
      const run = phase0.playDays(world, state, () => rules, 1, { telemetry, freeze: true, onDay: r => observer.onTick(world, r) });
      state = run.state;
      days.push({ day, state });
      log.push(...run.log);
    }
    const opening = ids.toId('situation', 'confederate_opening');
    const command = ids.toId('post', 'cs_cmd_charleston');
    const garrison = ids.toId('forceBlock', 'fb_us_sumter_garrison');
    expect(state.situationStates[opening]?.sitDecidedDay).toBe(36);
    const confederate = ids.toId('faction', 'confederate');
    const doctrine = world.map.world.rules.ruleSeats.principals.find((d) => d.faction === confederate)!;
    const seat = phase0.seatIdFor(world.faction(confederate).principal);
    // S68: S52 declares a later offensive. None may activate through Anderson's evacuation on 13 April.
    for (const { day, state: early } of days.filter((d) => d.day <= 39)) {
      for (const offensive of doctrine.offensives) {
        expect(offensive.requiresNotice, `day ${day}: offensive requires a notice`).toBeDefined();
        expect(world.situations.find((s) => s.id === offensive.requiresNotice)).toMatchObject({ kind: 'notice', faction: confederate });
        expect(phase0.knowledgeOf(early, seat).knownReports.some((r) => r.knownBody.reportSubjectKind === 'situation'
          && r.knownBody.reportSubjectId === offensive.requiresNotice && r.knownReceivedDay <= day), `day ${day}: notice unreceived`).toBe(false);
        expect(Object.values(early.operationRecords).some((o) => o.opPost === offensive.post), `day ${day}: no active offensive`).toBe(false);
      }
    }
    expect(log.filter((e) => e.day <= 39 && e.seat === seat && e.command.cmd === 'order'
      && doctrine.offensives.map((o) => o.post).includes(e.command.to))).toEqual([]);
    const orders = log.filter((e) => e.command.cmd === 'order' && e.command.to === command);
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({ day: 37, command: { bypass: true, route: 'wire' } });
    const op = Object.values(state.operationRecords).find((o) => o.opPost === command)!;
    expect(op.opAxes[0]!.oaxRoute.routeFrom).toBe(ids.toId('region', 'charleston'));
    expect(op.opAxes[0]!.oaxLog.map((e) => e.axevReason)).toEqual(['opened', 'bombarding', 'garrison_surrendered', 'objective_held']);
    expect(op.opCommander).toBe(ids.toId('person', 'beauregard_pierre_g_t'));
    expect(op.opAxes[0]!.oaxLog.find((e) => e.axevReason === 'bombarding')?.axevDay).toBe(38);
    expect(op.opAxes[0]!.oaxLog.find((e) => e.axevReason === 'garrison_surrendered')?.axevDay).toBe(39);
    expect(days.find((d) => d.day === 38)!.state.postStates[ids.toId('post', 'us_fort_sumter')]?.postHolder).toBe(ids.toId('person', 'anderson_robert'));
    expect(days.find((d) => d.state.forceBlockStates[garrison] === undefined)?.day).toBe(39);
    expect(state.personStatus[ids.toId('person', 'anderson_robert')]?.statusKind ?? 'serving').toBe('serving');
    expect(telemetry.mechanics['combat.evacuated']!.fires).toBe(1);
    expect(telemetry.mechanics['combat.captured']!.fires).toBe(0);
    const observed = observer.observations();
    const fought = operationsFought(observed, 55).filter(o => o.op.faction === 'confederate');
    expect(fought).toHaveLength(1);
    expect(fought[0]!.op.record.opMethod).toBe('bombard');
    const battle = observed.battles.get(fought[0]!.battle)!;
    expect(battle.battleCauses).toEqual([command]);
    expect(battle.battleStartDay).toBe(38);
    expect(battle.battleEndDay).toBe(39);
    expect(battle.battleDays.map(d => d.bdayDay)).toEqual([38, 39]);
    expect(battle.battleDays.every(d => d.bdaySides.every(s => s.bsideKw === 0 && s.bsideCaptured === 0))).toBe(true);
    expect(operationScore(observed).problems).toEqual([]);
    expect(unknownStrengthScore([{ name: 'opening', battles: observed.battles }]).problems).toEqual([]);
    expect(state.situationStates[ids.toId('situation', 'sumter_evacuated')]?.sitStatus).toBe('noticed');
    const principal = phase0.seatIdFor(world.faction(ids.toId('faction', 'union')).principal);
    expect(phase0.knowledgeOf(state, principal).knownReports.some((r) => r.knownBody.reportClaims.some((c) => c.claimKind === 'fort-surrendered' && c.claimToken === 'evacuated_under_terms'))).toBe(true);
  });
});
