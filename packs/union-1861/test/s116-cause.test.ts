import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { seatsWorld } from '../../../packages/cli/src/seats-world.ts';
import { callDirective, callValueLinkProblems } from '../../../packages/kernel/src/recruitment/rules.ts';
import { DEFAULT_COMPLIANCE_RULES, resolveDirective } from '../../../packages/kernel/src/compliance.ts';

const world = seatsWorld('union-1861').world.map.world;
const rules = world.rules.recruitment;
const profiles = rules.callProfiles!;
const cause = 'confederate_independence';

it('applies the same troop-call purpose rule to every kind on either side, including silent papers', () => {
  expect(profiles).toHaveLength(100);
  for (const p of profiles) {
    expect(p.honours, p.id).toContain(p.sourceProfile.startsWith('CS-') ? cause : 'union');
    expect(callValueLinkProblems(p), p.id).toEqual([]);
    expect(p.valueClauseLinks!.map(l => l.linkValue), p.id).toContain(p.sourceProfile.startsWith('CS-') ? cause : 'union');
    // The documentary CS-J12 demand retains its inherited unlinked autonomy offence.
    if (p.sourceProfile !== 'CS-J12') expect(p.valueClauseLinks!.map(l => l.linkValue), p.id).toEqual(expect.arrayContaining([...p.honours, ...p.offends]));
  }
  const suppression = new Set(['US-A15', 'US-M03', 'US-M15', 'US-M15-KNM', 'US-IN11']);
  for (const p of profiles.filter(p => p.sourceProfile.startsWith('US-'))) {
    expect(p.offends.includes(cause), p.id).toBe(suppression.has(p.sourceProfile));
    if (suppression.has(p.sourceProfile)) expect(p.valueClauseLinks!.find(l => l.linkValue === cause)!.linkCites.length).toBeGreaterThan(0);
  }
});

it('pairs the same reserve governor holding the cause and with that cause unknown, retaining his appointment cost', () => {
  const brown = world.people.find(p => p.id === 'brown_joseph_e')!;
  const terms = callDirective(rules, { callRegiments: 1, callTermDays: 365, callProfile: profiles.find(p => p.id === 'cs_jun30_reserve_georgia')! });
  const governor = { id: brown.id, values: brown.values.map(v => v.value), boldness: 500, candour: 1000, standing: 0, regard: 0 };
  const context = { available: 1000, oversight: 0, leaderCredibility: 0, disposition: 22, costOnly: world.vocabularies.values.filter(v => v.costOnly).map(v => v.id) };
  const held = resolveDirective(governor, terms, context);
  const unknown = resolveDirective({ ...governor, values: governor.values.filter(v => v !== cause) }, terms, context);
  expect(held.willingness - unknown.willingness).toBe(DEFAULT_COMPLIANCE_RULES.valueWeight);
  expect(held.reasons).toContainEqual({ kind: 'values_honoured', value: cause });
  expect(unknown.reasons.some(r => 'value' in r && r.value === cause)).toBe(false);
  for (const answer of [held, unknown]) expect(answer.reasons).toContainEqual({ kind: 'values_offended', value: 'state_autonomy' });
  expect(held.actual).toBe('comply_with_reservations');
  expect(unknown.actual).toBe('object');
  expect(world.people.find(p => p.id === 'moore_thomas_o')!.values.some(v => v.value === cause)).toBe(false);
});

it('applies accepted starting cells without inventing traits, absence terms or slavery rewards', () => {
  expect(world.people.filter(p => p.values.some(v => v.value === cause))).toHaveLength(12);
  const letcher = world.people.find(p => p.id === 'letcher_john')!;
  expect(letcher.values.map(v => v.value)).toEqual(expect.arrayContaining(['union', 'duty', 'order', 'conciliation', 'caution', 'state_autonomy', 'slavery_defence', 'slavery_noninterference', 'native_state']));
  expect(letcher.values).toHaveLength(9);
  expect(letcher.values.every(v => v.cites.every(c => c.source.startsWith('S116-LET-') && c.at?.includes('dated 1861-01-07')))).toBe(true);
  for (const value of ['slavery_defence', 'slavery_noninterference']) expect(world.vocabularies.values.find(v => v.id === value)!.costOnly).toBe(true);
  expect(letcher.temperament.boldness.direction).toBeNull();
  expect(letcher.regard.direction).toBeNull();
});

it('keeps the April destinations and Tennessee distribution faithful to the printed calls', () => {
  for (const [state, destination] of [['georgia', 'Richmond'], ['louisiana', 'Richmond'], ['kentucky', 'Harpers Ferry'], ['north_carolina', 'Richmond']]) {
    const p = profiles.find(p => p.id === `cs_apr22_absolute_${state}`)!;
    expect(p.conditions.find(c => c.kind === 'destination')!.clauseText, state).toContain(destination);
  }
  expect(profiles.find(p => p.id === 'cs_apr22_absolute_tennessee')!.conditions.find(c => c.kind === 'organisation')!.clauseText).toMatch(/three|3/);
  const pack = JSON.parse(readFileSync('packs/union-1861/pack.json', 'utf8'));
  expect(pack.vocabularies.values.some((v: { id: string }) => v.id === cause)).toBe(true);
});
