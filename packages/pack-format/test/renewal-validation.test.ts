import { describe, expect, it } from 'vitest';
import { loadPack } from '../src/index.ts';
import { editJson, testbedFiles } from './support/testbed.ts';
const renewal = { post: 'n_brenmark_governor', arm: 'infantry', regiments: 1, fromTermDays: 90, termDays: 1095, musteredBy: '1861-05-11' };
const proposal = { owner: 'recruitment', field: 'renew_enlistment', subject: renewal.post, delta: 1, side: 'north', reason: 'voluntary-remuster', renewal };
function check(patch = {}, event: unknown = { renewableEnlistment: renewal }, decision = false) {
  const file = decision ? 'situations/eastwatch_stalls.json' : 'situations/fen_arrivals.json';
  return loadPack(testbedFiles(editJson(file, s => {
    s.event = event;
    const effect = { propose: { ...proposal, ...patch } };
    if (decision) s.options[1].effects.push(effect); else s.effects.push(effect);
  }))).issues.filter(i => i.severity === 'error' && !['missing-string', 'gate-stale-review'].includes(i.kind));
}

describe('whole-unit renewal requires its sourced autonomous notice', () => {
  it('accepts the identical eligibility guard in a required event conjunction', () => {
    expect(check()).toEqual([]);
    expect(check({}, { all: [{ dayAtLeast: 20 }, { renewableEnlistment: renewal }] })).toEqual([]);
  });
  it.each([{ owner: 'politics' }, { field: 'other' }, { subject: 'n_army_west' }, { side: 'south' }, { delta: -1 },
    { renewal: { ...renewal, termDays: 90 } }, { renewal: { ...renewal, arm: 'missing' } },
    { renewal: { ...renewal, regiments: 0 } }, { renewal: { ...renewal, musteredBy: '1861-02-30' } },
  ])('rejects invalid payload or target: %j', patch => expect(check(patch).length).toBeGreaterThan(0));
  it.each([{ dayAtLeast: 20 }, { not: { renewableEnlistment: renewal } }, { any: [{ dayAtLeast: 20 }, { renewableEnlistment: renewal }] },
    { renewableEnlistment: { ...renewal, regiments: 2 } },
  ])('rejects an event that does not require the same qualifying unit: %j', event => expect(check({}, event).length).toBeGreaterThan(0));
  it('rejects a principal decision and truth-dependent option availability', () => {
    expect(check({}, { renewableEnlistment: renewal }, true).some(i => i.message.includes('notice'))).toBe(true);
    const result = loadPack(testbedFiles(editJson('situations/eastwatch_stalls.json', s => { s.options[1].appearsWhen = { renewableEnlistment: renewal }; })));
    expect(result.issues.some(i => i.severity === 'error' && i.kind === 'situation-option-truth')).toBe(true);
  });
});
