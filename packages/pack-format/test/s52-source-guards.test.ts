import { expect, it } from 'vitest';
import { loadPack } from '../src/index.ts';
import { editJson, testbedFiles } from './support/testbed.ts';
const relevant = new Set(['unknown-reference', 'situation-advance', 'situation-offensive']);
function advance(post = 'n_army_west', region = 's_capital', decision = false) {
  return loadPack(testbedFiles(editJson(decision ? 'situations/eastwatch_stalls.json' : 'situations/fen_arrivals.json', s => {
    s.event = { advancingOn: { post, region } };
  }))).issues.filter(i => i.severity === 'error' && relevant.has(i.kind));
}
function offensive(requiresNotice: string) {
  const edits = Object.assign({}, ...['pack.json', 'data/world.json'].map(path => editJson(path, p => {
    p.rules.ruleSeats.principals[0].offensives[0].requiresNotice = requiresNotice;
  })));
  return loadPack(testbedFiles(edits)).issues.filter(i => i.severity === 'error' && relevant.has(i.kind));
}
it('accepts an advance event with known references on an autonomous notice', () => expect(advance()).toEqual([]));
it('rejects an unknown observed command', () => expect(advance('missing').some(i => i.kind === 'unknown-reference')).toBe(true));
it('rejects an unknown observed region', () => expect(advance('n_army_west', 'missing').some(i => i.kind === 'unknown-reference')).toBe(true));
it('rejects advance observation on a principal decision', () => expect(advance('n_army_west', 's_capital', true).some(i => i.kind === 'situation-advance')).toBe(true));
it('accepts a doctrine prerequisite naming this side\'s notice', () => expect(offensive('fen_arrivals')).toEqual([]));
it('rejects an unknown doctrine notice', () => expect(offensive('missing').some(i => i.kind === 'unknown-reference')).toBe(true));
it('rejects a doctrine prerequisite naming a decision', () => expect(offensive('eastwatch_stalls').some(i => i.kind === 'situation-offensive')).toBe(true));
