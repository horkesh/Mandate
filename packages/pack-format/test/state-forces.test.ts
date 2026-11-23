import { describe, expect, it } from 'vitest';
import { loadPack } from '../src/index.ts';
import { editJson, testbedFiles } from './support/testbed.ts';
const proposal = { owner: 'recruitment', field: 'state_forces', subject: 'n_brenmark_governor', delta: 1, side: 'north', reason: 'assembly-transfer',
  stateForces: { id: 'shire_infantry', regiments: 2, men: 2000, arm: 'infantry', termDays: 90 } };
function check(patch = {}, decision = false) {
  const file = decision ? 'situations/eastwatch_stalls.json' : 'situations/fen_arrivals.json';
  return loadPack(testbedFiles(editJson(file, s => {
    const e = { propose: { ...proposal, ...patch } };
    if (decision) s.options[1].effects.push(e); else s.effects.push(e);
  }))).issues.filter(i => i.severity === 'error' && !['missing-string', 'gate-stale-review'].includes(i.kind));
}
describe('state-force proposals are notice-only and validated', () => {
  it('accepts an institutional notice', () => expect(check()).toEqual([]));
  it.each([{ owner: 'politics' }, { field: 'other' }, { subject: 'missing' }, { subject: 'n_army_west' }, { side: 'south' }, { delta: -1 },
    { stateForces: { ...proposal.stateForces, arm: 'missing' } }, { stateForces: { ...proposal.stateForces, men: -1 } },
    { stateForces: { ...proposal.stateForces, post: 'missing' } },
    { stateForces: { ...proposal.stateForces, region: 'missing' } },
    { stateForces: { ...proposal.stateForces, transferTo: 's_war' } },
    { stateForces: { ...proposal.stateForces, release: true } },
  ])('rejects invalid payload or target: %j', patch => expect(check(patch).length).toBeGreaterThan(0));
  it('rejects principal decisions', () => expect(check({}, true).some(i => i.message.includes('notice'))).toBe(true));
});
