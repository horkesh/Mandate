import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import type { world as kernelWorld } from '@mandate/kernel';

const world = JSON.parse(readFileSync(new URL('../data/world.json', import.meta.url), 'utf8')) as kernelWorld.World;
const cabinet = {
  seward_william_h: { union: 'S131-SEWARD-481', conciliation: 'S131-SEWARD-481' },
  chase_salmon_p: { union: 'S131-CHASE-293-295', duty: 'S131-CHASE-293-295', order: 'S131-CHASE-293-295', conciliation: 'S131-CHASE-293-295' },
  cameron_simon: {},
  welles_gideon: { union: 'S131-WELLES-FOGG-1' },
  smith_caleb_b: {},
  bates_edward: { order: 'S131-SAVAGE-43-44', conciliation: 'S131-SAVAGE-43-44', caution: 'S131-SAVAGE-41' },
  blair_montgomery: { union: 'S131-FOX-I-2-4', order: 'S131-FOX-I-2-4', conciliation: 'S131-FOX-I-2-4' },
};
const auditedValues = new Set(['union', 'duty', 'order', 'conciliation', 'caution', 'party', 'reputation']);

it('enters exactly the thirteen independently cited starting values among the forty-nine audited cabinet cells', () => {
  for (const [person, evidence] of Object.entries(cabinet)) {
    const actor = world.people.find(p => p.id === person)!;
    const values = actor.values.filter(v => auditedValues.has(v.value));
    expect(values.map(v => v.value).sort(), person).toEqual(Object.keys(evidence).sort());
    for (const [value, source] of Object.entries(evidence)) {
      expect(values.find(v => v.value === value)?.cites, `${person} ${value}`).toContainEqual({
        source, at: expect.stringMatching(/^(?:p\d|manuscript page 1)/),
      });
    }
  }
});

it('keeps forecast-only offences out of every Sumter provisioning and relief round', () => {
  const questions = world.rules.ruleSeats.principals.find(p => p.faction === 'union')!.consultations!;
  const courses = questions.flatMap(q => q.courses).filter(c => c.id === 'provisioning' || c.id === 'relief');
  expect(courses.map(c => c.id)).toEqual(['relief', 'relief', 'provisioning', 'relief']);
  for (const course of courses) {
    expect(course.honours, course.id).toEqual(['union', 'duty']);
    expect(course.opposes, course.id).toEqual([]);
  }
});

it('distinguishes bare withdrawal from Scott’s expressed two-fort proposal', () => {
  const questions = world.rules.ruleSeats.principals.find(p => p.faction === 'union')!.consultations!;
  const courses = questions.flatMap(q => [...q.courses, ...(q.alternatives ?? [])]);
  const abandonment = courses.filter(c => c.id === 'abandonment');
  expect(abandonment).toHaveLength(3);
  for (const course of abandonment) expect(course).toMatchObject({ honours: [], opposes: [] });
  const twoForts = courses.filter(c => c.id === 'evacuate_both');
  expect(twoForts).toHaveLength(2);
  for (const course of twoForts) expect(course).toMatchObject({ honours: ['union', 'conciliation'], opposes: ['duty'] });
});

it('uses the same stated purposes in legacy Sumter option metadata', () => {
  const situation = JSON.parse(readFileSync(new URL('../situations/sumter_garrison.json', import.meta.url), 'utf8'));
  expect(situation.options.map((option: { id: string; honours: string[] }) => [option.id, option.honours])).toEqual([
    ['give_up_both', ['union', 'conciliation']],
    ['provision_notice', ['union', 'duty']],
    ['withdraw', []],
  ]);
});
