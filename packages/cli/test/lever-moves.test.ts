import { phase0, type ids } from '@mandate/kernel';
import { toId } from '../../kernel/src/ids.ts';
import { describe, expect, it } from 'vitest';
import { sweepMoves } from '../src/lever-moves.ts';
import { indexedFixture, P, POST, F } from '../../kernel/test/support/seats-fixture.ts';

/**
 * The lever sweep reads a delegated gated decision as the delegate's pick (lane 1.5b; the gate review of lane 1.5, its
 * finding outside scope): handing the choice to a man who holds a value the watched option honours reaches that option,
 * and the sweep sees the move as watched. On the seats fixture: a_bold, at a_reserve, holds glory; a_sec, at the office,
 * holds caution.
 */
const S = (id: string) => toId('situation', id) as ids.SituationId;
const opt = (id: string, displayKey: number, honours: string[], watched = false): phase0.OptionDef => ({ id, label: `situation.crossers.option.${id}`, displayKey, proposedBy: [P('a_sec')], group: null, appearsWhen: null, expiresWhen: null, waitsOn: null, effects: [], lockedCosts: [], orders: [], honours, watched, policy: null, gate: null });

const CROSSERS: phase0.SituationDef = {
  id: S('crossers'),
  kind: 'decision',
  faction: F('a'),
  title: 'situation.crossers.title',
  text: 'situation.crossers.text',
  earliest: '1861-04-01',
  event: { dayAtLeast: 1 },
  knowledge: null,
  railroad: 'test fixture',
  chain: null,
  subjects: [],
  options: [opt('shelter', 1, ['caution']), opt('send_back', 2, ['glory'], true)],
  inaction: { text: 'situation.crossers.inaction', effects: [] },
  historicalDefault: { options: ['shelter'] },
  staffLine: { authors: [POST('a_office')], recommends: ['shelter'], reasons: [{ kind: 'momentum', weight: 600 }], confidence: 700 },
  delegableTo: [POST('a_office'), POST('a_reserve')],
  resurfaceOn: [],
  effects: [],
  report: null,
  gate: { none: 'test fixture' },
  gateReview: null,
  citations: [],
};

describe('the lever sweep’s moves (D6; lane 1.5b)', () => {
  it('resolves each delegation to the delegate’s own pick, so a delegation that reaches a watched option is a watched move', () => {
    const world = indexedFixture({}, [CROSSERS]);
    let state = phase0.createState(world, { seed: 1, drivers: { a_lead: 'human' } });
    state = phase0.tick(world, state, []).state;
    const moves = sweepMoves(world, state, S('crossers'));
    expect(moves.map((m) => [m.move.move === 'delegate' ? `delegate:${m.move.post}` : m.move.move, m.takes.join('+'), m.watched])).toEqual([
      ['decide', 'shelter', false],
      ['decide', 'send_back', true],
      // a_sec decides by caution: shelter. a_bold decides by glory: the watched option.
      [`delegate:${POST('a_office')}`, 'shelter', false],
      [`delegate:${POST('a_reserve')}`, 'send_back', true],
      ['inaction', '', false],
    ]);
  });

  it('offers nothing on a decision that is not open to its principal, and no delegation to a vacant post', () => {
    const world = indexedFixture({}, [CROSSERS]);
    const fresh = phase0.createState(world, { seed: 1, drivers: { a_lead: 'human' } });
    expect(sweepMoves(world, fresh, S('crossers'))).toEqual([]);
    const opened = phase0.tick(world, fresh, []).state;
    const vacant = { ...opened, postStates: { ...opened.postStates, [POST('a_reserve')]: { ...opened.postStates[POST('a_reserve')]!, postHolder: null } } } as phase0.State;
    expect(sweepMoves(world, vacant, S('crossers')).some((m) => m.move.move === 'delegate' && m.move.post === POST('a_reserve'))).toBe(false);
  });
});
