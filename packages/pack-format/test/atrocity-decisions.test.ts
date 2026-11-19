import { describe, expect, it } from 'vitest';
import type { phase0 } from '@mandate/kernel';
import { atrocityDecisions, loadPack } from '../src/index.ts';
import { testbedFiles } from './support/testbed.ts';

/**
 * The decisions the lever sweep reads an inaction of as watched (0074; lane 1.14, G-1.14a). On the testbed's fictional
 * register: `fen_crossing` is a decision, and `harbour_burning` an atrocity-class notice (class `atrocities`) that fires
 * when it is decided. The forward route: a decision whose inaction fires an atrocity, directly or through a chain, such
 * as a sentence carried out unless the principal acts.
 */
const pack = loadPack(testbedFiles()).pack!;
const gate = pack.gate!;
const situations = pack.situations!;
const byId = (id: string) => situations.find((s) => s.id === id)!;
const withEvent = (id: string, event: phase0.Condition): phase0.SituationDef => ({ ...byId(id), event });
const replace = (...defs: phase0.SituationDef[]) => situations.map((s) => defs.find((d) => d.id === s.id) ?? s);
const middle = (event: phase0.Condition): phase0.SituationDef => ({ ...byId('fen_arrivals'), id: 'middle_notice' as phase0.SituationDef['id'], gate: { none: 'a test fixture: a plain notice in between' }, event });

describe('decisions about atrocity-class conduct (0074)', () => {
  it('finds a decision whose inaction fires an atrocity directly (the forward route), and no other', () => {
    expect([...atrocityDecisions(situations, gate)].sort()).toEqual(['fen_crossing']);
  });

  it('does not count a decision when only a named option fires the atrocity, since inaction takes none', () => {
    const named = replace(withEvent('harbour_burning', { decided: byId('fen_crossing').id, options: ['send_back'] }));
    expect(atrocityDecisions(named, gate).has('fen_crossing')).toBe(false);
  });

  it('counts a read that the decision was not taken with the option that stops it (left true by inaction)', () => {
    const unless = replace(withEvent('harbour_burning', { all: [{ dayAtLeast: 30 }, { not: { decided: byId('fen_crossing').id, options: ['shelter'] } }] }));
    expect(atrocityDecisions(unless, gate).has('fen_crossing')).toBe(true);
  });

  it('counts a flag the inaction outcome sets, and an atrocity reached through a plain notice in between', () => {
    const crossing = byId('fen_crossing');
    const flagged = replace({ ...crossing, inaction: { ...crossing.inaction!, effects: [...crossing.inaction!.effects, { setFlag: 'left_standing' }] } }, withEvent('harbour_burning', { flag: 'left_standing' }));
    expect(atrocityDecisions(flagged, gate).has('fen_crossing')).toBe(true);
    const chained = [...replace(withEvent('harbour_burning', { fired: 'middle_notice' as phase0.SituationDef['id'] })), middle({ decided: crossing.id, options: null })];
    expect(atrocityDecisions(chained, gate).has('fen_crossing')).toBe(true);
  });
});
