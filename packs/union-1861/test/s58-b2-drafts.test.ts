import { readFileSync, existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ids, phase0 } from '@mandate/kernel';
import { SituationSchema } from '@mandate/pack-format';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { causeFindings } from '../../../tools/rules/situation-causes.ts';

const treaties = ['muscogee_treaty', 'choctaw_treaty', 'chickasaw_treaty'];
const held = [...treaties, 'indian_territory_posts_given_up'];
const raw = (path: string) => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url), 'utf8'));
const S = (id: string) => ids.toId('situation', id);

describe('S58: unsigned treaty replacements preserve the nations and their news', () => {
  it.each(treaties)('%s is drafted without a signature or a date-only fallback', id => {
    const file = `situations/drafts/${id}.json`;
    expect(existsSync(new URL(`../${file}`, import.meta.url)), file).toBe(true);
    const item = raw(file);
    expect(item.gateReview).toBeUndefined();
    expect(item.railroad).toBeUndefined();
    expect(item.actingGovernment).toBe(raw(`situations/${id}.json`).actingGovernment);
    expect(item.effects).toEqual(raw(`situations/${id}.json`).effects);
    expect(causeFindings([{ path: `packs/union-1861/${file}`, value: item }], [])).toEqual([]);
  });
  it.each(treaties)('%s needs the public act, acts independently of the principal and surfaces only on its report', id => {
    const item = raw(`situations/drafts/${id}.json`);
    const def = SituationSchema.parse(item);
    const loaded = seatsWorld('union-1861');
    const world = { ...loaded.world, situations: [def] };
    const initial = phase0.createState(world, { ...loaded.setup, drivers: { lincoln_abraham: 'human', davis_jefferson: 'human' } });
    const start = { ...initial, stateDay: 149 };
    const absent = phase0.tick(world, start, [], { freeze: true });
    expect(absent.rejections).toEqual([]);
    expect(absent.state.situationStates[S(id)]).toBeUndefined();
    const caused = { ...start, situationFlags: { confederate_protection_act: 149 } };
    const event = phase0.tick(world, caused, [], { freeze: true });
    expect(event.rejections).toEqual([]);
    expect(event.state.situationStates[S(id)]?.sitFiredDay).toBe(150);
    expect(event.state.situationStates[S(id)]?.sitSurfacedDay).toBeNull();
    expect(event.state.departmentFactions[def.actingGovernment!]).toBe('confederate');
    expect(event.state.regionGovernments).toEqual(start.regionGovernments);
    // Neither presidential decision nor reading the report makes the nation's act.
    const withheld = { ...event.state, messagesInTransit: event.state.messagesInTransit.filter(m => m.msgReport?.reportSubjectId !== id) };
    const silent = phase0.tick(world, withheld, [], { freeze: true });
    expect(silent.state.situationStates[S(id)]?.sitSurfacedDay).toBeNull();
    expect(silent.state.departmentFactions[def.actingGovernment!]).toBe('confederate');
    const received = phase0.tick(world, event.state, [], { freeze: true });
    expect(received.state.situationStates[S(id)]?.sitSurfacedDay).toBe(151);
  });
  it('retains all four signed live findings pending a real replacement and gate review', () => {
    const baseline = JSON.parse(readFileSync(new URL('../../../tools/rules/existing-findings.json', import.meta.url), 'utf8'));
    const rows = baseline.filter((r: { rule: string }) => r.rule === 'situation-cause');
    expect(rows.map((r: { path: string }) => r.path.split('/').at(-1)?.replace('.json', '')).sort()).toEqual(held.sort());
    for (const id of held) {
      const live = raw(`situations/${id}.json`);
      expect(live.gateReview?.reviewer).toBe('gate-reviewer');
      expect(live.railroad).toBeTypeOf('string');
    }
  });
});
