import { describe, expect, it } from 'vitest';
import { loadPack } from '../src/index.ts';
import { editJson, testbedFiles } from './support/testbed.ts';

const file = 'situations/fen_arrivals.json';
const proposal = { owner: 'command', field: 'post_succession', subject: 'n_war_office', delta: 1, side: null, reason: 'x', succession: { from: 'n_secretary', to: 'n_governor' } };
const check = (patch: Record<string, unknown> = {}, decision = false) => {
  const target = decision ? 'situations/eastwatch_stalls.json' : file;
  const edits = editJson(target, s => {
    const effect = { propose: { ...proposal, ...patch } };
    if (decision) s.options[1].effects.push(effect);
    else s.effects.push(effect);
  });
  return loadPack(testbedFiles(edits)).issues.filter(i => i.file === target && i.severity === 'error' && ['situation-command-proposal', 'unknown-reference'].includes(i.kind));
};

describe('a typed institutional succession proposal', () => {
  it('accepts the named incumbent and successor in a notice', () => {
    expect(check()).toEqual([]);
  });
  it.each([
    { subject: 'missing' }, { delta: 2 }, { side: 'north' },
    { succession: undefined }, { succession: { from: 'n_secretary', to: 'n_secretary' } },
    { succession: { from: 'missing', to: 'n_governor' } },
    { owner: 'politics' }, { field: 'temporary_post' },
  ])('rejects malformed or misplaced proposals: %j', patch => {
    expect(check(patch).length).toBeGreaterThan(0);
  });
  it('refuses to turn a principal decision into institutional succession', () => {
    expect(check({}, true).some(i => i.message.includes('notice'))).toBe(true);
  });
});
