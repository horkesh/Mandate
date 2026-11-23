import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { WorldSchema } from '../../../packages/pack-format/src/schemas.ts';

const { world } = seatsWorld('union-1861');
const profiles = world.map.world.rules.recruitment.callProfiles!;
const profile = (id: string) => profiles.find(p => p.id === id)!;

it('keeps reserve, cavalry, extra infantry and the later brigade demand distinct', () => {
  expect(profile('cs_jun30_reserve_georgia')).toMatchObject({ honours: ['caution', 'order', 'confederate_independence'], offends: ['state_autonomy'] });
  expect(profile('cs_jun30_reserve_georgia').materialDemand).toContainEqual(expect.objectContaining({ resource: 'arms', obligation: 'not_required', quantity: null }));
  expect(profile('cs_jun30_cavalry_georgia').offends).toEqual([]);
  expect(profile('cs_jun30_cavalry_georgia').materialDemand).toContainEqual(expect.objectContaining({ resource: 'arms', obligation: 'required', quantity: null }));
  expect(profile('cs_jul01_extra_georgia')).toMatchObject({ honours: ['state_autonomy', 'confederate_independence'], offends: [] });
  expect(profile('cs_jul12_brigade_demand')).toMatchObject({ honours: ['confederate_independence'], offends: ['state_autonomy'], callProvenance: [{ source: 'OR-IV-I', page: 466 }] });
  expect(world.map.world.rules.ruleSeats.principals.flatMap(p => p.calls).some(c => c.termsId === 'cs_jul12_brigade_demand')).toBe(false);
});

it('assigns every doctrine and April option call, retains textual offences, and never honours Union or duty on Confederate calls', () => {
  const calls = world.map.world.rules.ruleSeats.principals.flatMap(p => p.calls);
  expect(calls).toHaveLength(73);
  for (const c of calls) expect(profile(c.termsId!).id).toBe(c.id);
  const situation = JSON.parse(readFileSync(new URL('../situations/call_for_troops.json', import.meta.url), 'utf8'));
  for (const option of situation.options) for (const c of option.calls) expect(profile(c.termsId).sourceProfile).toBe('US-A15');
  for (const p of profiles.filter(p => p.sourceProfile.startsWith('CS-'))) {
    expect(p.honours).not.toContain('union');
    expect(p.honours).not.toContain('duty');
  }
  // 0122: troop-call purpose is by kind even when the acceptance is silent.
  expect(profile('us_may03_accepted_new_york')).toMatchObject({ honours: ['union'], offends: [] });
  expect(profile('us_may03_accepted_new_york').conditions).toContainEqual(expect.objectContaining({ kind: 'service_term', clauseText: expect.stringContaining('Two years') }));
});

it('validates categorical conditions and material data without accepting an invented numeric inventory', () => {
  const raw = JSON.parse(readFileSync(new URL('../data/world.json', import.meta.url), 'utf8'));
  expect(WorldSchema.safeParse(raw).success).toBe(true);
  raw.rules.recruitment.callProfiles[0].available = 500;
  expect(WorldSchema.safeParse(raw).success).toBe(false);
  delete raw.rules.recruitment.callProfiles[0].available;
  raw.rules.recruitment.callProfiles[0].conditions[0].kind = 'unknown_clause';
  expect(WorldSchema.safeParse(raw).success).toBe(false);
});
