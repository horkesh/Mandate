import { describe, expect, it } from 'vitest';
import { runPack } from '../src/run.ts';
import { testbedScript } from '../src/testbed-script.ts';

/**
 * M1 done-criterion: a scripted headless run of the testbed in which every
 * outcome traces to caused, typed reasons.
 */
describe('testbed headless run (M1)', () => {
  const run = runPack('testbed', testbedScript, 20);
  const ledger = run.final.ledger;

  it('runs until a verdict or 20 turns', () => {
    expect(run.turns.length).toBeGreaterThan(5);
    expect(run.final.verdict !== null || run.turns.length === 20).toBe(true);
  });

  it('is deterministic', () => {
    expect(runPack('testbed', testbedScript, 20).lines).toEqual(run.lines);
  });

  it('every directive reading carries its contributions, and they sum to the willingness', () => {
    const reads = ledger.filter((e) => e.kind === 'directive_read');
    expect(reads.length).toBeGreaterThan(0);
    for (const e of reads) {
      const sum = e.causes.map((c) => Number(c.split(' ').at(-1))).reduce((a, b) => a + b, 0);
      expect(sum).toBe(e.detail.willingness);
    }
  });

  it('every battle, ladder move, delegation and verdict names its causes', () => {
    const caused = ledger.filter((e) => ['operation_resolved', 'operation_planned', 'ladder_moved', 'delegated_by_default', 'checkpoint'].includes(e.kind));
    expect(caused.length).toBeGreaterThan(0);
    for (const e of caused) expect(e.causes.length).toBeGreaterThan(0);
  });

  it('exercises the premise: a refusal, a covert shirk, an overseer contradiction, and the bot acting', () => {
    const player = Object.values(run.final.directives).filter((d) => d.factionId === 'north' && d.response);
    expect(player.some((d) => d.response!.actual === 'refuse')).toBe(true);
    expect(player.some((d) => d.response!.declared !== d.response!.actual)).toBe(true);
    expect(run.final.claims.some((c) => c.author.kind === 'overseer' && c.body.kind === 'op_result')).toBe(true);
    expect(run.turns.some((t) => (t.botDecisions.south ?? []).length > 0)).toBe(true);
  });
});
