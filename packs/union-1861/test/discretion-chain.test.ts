import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

const manifest = () => JSON.parse(readFileSync(new URL('../pack.json', import.meta.url), 'utf8'));
const doctrine = () => manifest().rules.ruleSeats.principals.find((d: { faction: string }) => d.faction === 'confederate');

it('Johnston receives a hold and Cooper answers his own received proposal with conditional valley authority', () => {
  const d = doctrine();
  expect(d.offensives).toContainEqual(expect.objectContaining({ id: 'johnston_harpers_hold', post: 'cs_cmd_harpers_ferry', objective: 'harpers_ferry', posture: 'hold' }));
  expect(d.proposalAnswers).toContainEqual(expect.objectContaining({ id: 'johnston_valley_discretion', post: 'cs_cmd_harpers_ferry', answers: 'johnston_harpers_hold', action: 'discretion', fromDate: '1861-06-13',
    discretion: { condition: 'turned', fallback: { objective: 'lower_valley', posture: 'hold', discretion: { condition: 'outmatched', fallback: { objective: 'middle_valley', posture: 'hold' } } } } }));
  // The commander authors his alternative through the planner, never a dated proposal row.
  expect(JSON.stringify(d)).not.toContain('proposalDate');
});

it('the July junction carries if-practicable authority and retains the received advance-news gate', () => {
  const row = doctrine().offensives.find((o: { id: string }) => o.id === 'johnston_junction');
  expect(row).toMatchObject({ fromDate: '1861-07-17', requiresNotice: 'manassas_advance_received', posture: 'relieve', discretion: { condition: 'outmatched', fallback: { objective: null, posture: 'hold' } } });
  expect(row.source).toContain('p.478');
});

it('keeps the landing condition as a gap and binds the demonstration matters after S130', () => {
  const read = (side: string) => JSON.parse(readFileSync(new URL(`../pushback-${side}.json`, import.meta.url), 'utf8'));
  expect(read('confederate').rows.find((r: {id: string}) => r.id === 'C15').match).toEqual({ kind: 'goal-proposal', objective: 'harpers_ferry', posture: 'hold', actual: 'propose' });
  expect(read('confederate').rows.find((r: {id: string}) => r.id === 'C16').gap.reason).toContain('0114');
  for (const [id, detentionEvidence, keys] of [
    ['U33', 'course_challenge', ['scott_patterson_jul13']],
    ['U34', 'actual_deferral', ['scott_patterson_jul17', 'scott_patterson_jul18']],
  ] as const) {
    const row = read('union').rows.find((r: {id: string}) => r.id === id);
    expect(row.gap).toBeUndefined();
    expect(row.match).toEqual({ kind: 'goal', purpose: 'attack_or_demonstrate', target: 'cs_cmd_harpers_ferry',
      letters: keys.map(key => ({ namespace: 'us_army_orders', key, revision: 1 })), detentionEvidence });
  }
});
