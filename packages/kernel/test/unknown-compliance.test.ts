import { describe, expect, it } from 'vitest';
import { resolveDirective } from '../src/compliance.ts';
import type { CommandContext, DirectiveTerms } from '../src/directive.ts';
import { toId } from '../src/ids.ts';
import { profileOf, answerOrder } from '../src/reading/orders.ts';
import { createState } from '../src/tick/setup.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { indexWorld } from '../src/world/index.ts';
import { forcesStart, forcesWorld, person } from './support/forces-fixture.ts';
import { edge, region } from './support/map-fixture.ts';

const id = toId('person', 'reader');
const issuer = toId('person', 'issuer');
const context: CommandContext = { available: 980, oversight: 1000, leaderCredibility: 1000 };
const terms: DirectiveTerms = { boldness: 1000, honours: [], offends: [], required: 1000 };

function fixture(known: boolean, faction = 'a') {
  const reader = person('reader', faction, known ? { boldness: 'low', candour: 'low', reputation: 'high' } : {});
  const map = indexWorld(forcesWorld({ regions: [region('a1'), region('a2')], edges: [edge('a1', 'a2')], people: [reader, person('issuer', faction)] }));
  return indexSeatsWorld(map, forcesStart({ a1: { a: 1000 }, a2: { a: 1000 } }, [], []));
}

describe('0113: evidence follows the World through the profile, without changing the draw', () => {
  it.each(['a', 'b'])('uses no unsupported temperament or standing shield on side %s', (side) => {
    const known = fixture(true, side);
    const unknown = fixture(false, side);
    // Exactly the same State and numeric profile; only the cast evidence differs.
    const state = createState(known, { seed: 1 });
    const sourced = resolveDirective(profileOf(known, state, id, issuer), terms, context);
    const unsourced = resolveDirective(profileOf(unknown, state, id, issuer), terms, context);
    expect(sourced.actual).toBe('reinterpret');
    expect(unsourced.actual).toBe('comply');
    expect(unsourced.contributions.some(c => c.term === 'temperament')).toBe(false);
    expect(unsourced.contributions).toContainEqual({ term: 'deterrence', amount: 250 });
    expect(unsourced.reasons).not.toContainEqual({ kind: 'shielded_by_standing' });
    expect(state.personTrue[id]!.trueBoldness).toBe(200);
    expect(state.personStanding[id]).toBe(800);
  });

  it.each([-100, -500])('unknown candour declares the actual response openly at regard %s', (regard) => {
    const world = fixture(false);
    const state = createState(world, { seed: 1 });
    const profile = { ...profileOf(world, state, id, issuer), candour: 0, standing: 1000, regard };
    const response = resolveDirective(profile, { ...terms, required: 1000 }, { ...context, available: 0, oversight: 0 });
    expect(response.actual).toBe('refuse');
    expect(response.declared).toBe(response.actual);
    expect(response.statedReasons).toEqual(response.reasons);
    expect(response.reasons.some(r => r.kind === 'shielded_by_standing')).toBe(false);
  });

  it('unknown candour also declares reservations openly', () => {
    const world = fixture(false);
    const state = createState(world, { seed: 1 });
    const response = resolveDirective({ ...profileOf(world, state, id, issuer), candour: 0 }, { ...terms, required: 0 }, { ...context, oversight: 0 });
    expect(response.actual).toBe('comply_with_reservations');
    expect(response.declared).toBe(response.actual);
  });

  it('does not turn unknown standing alone into protection, and unknown candour objects openly', () => {
    const world = fixture(false);
    const state = createState(world, { seed: 1 });
    const response = resolveDirective({ ...profileOf(world, state, id, issuer), candour: 0, standing: 1000, regard: -1000 }, terms, { ...context, available: 0 });
    expect(response.actual).toBe('object');
    expect(response.declared).toBe('object');
    expect(response.counterProposal).toEqual({ boldness: terms.boldness, required: 0 });
  });

  it('changing only unknown draws leaves the whole response unchanged, including proposals and resource conditions', () => {
    const world = fixture(false);
    const initial = createState(world, { seed: 1 });
    const changed = { ...initial, personTrue: { ...initial.personTrue, [id]: { ...initial.personTrue[id]!, trueBoldness: 1000, trueCandour: 0 } }, personStanding: { ...initial.personStanding, [id]: 1000 } };
    const first = profileOf(world, initial, id, issuer);
    const second = profileOf(world, changed, id, issuer);
    for (const regard of [0, -1000]) {
      expect(resolveDirective({ ...second, regard }, terms, context)).toEqual(resolveDirective({ ...first, regard }, terms, context));
      expect(resolveDirective({ ...second, regard }, { ...terms, ownBest: 200 }, context)).toEqual(resolveDirective({ ...first, regard }, { ...terms, ownBest: 200 }, context));
    }
    expect(answerOrder(world, changed, id, issuer, terms)).toEqual(answerOrder(world, initial, id, issuer, terms));
  });

  it('known profiles retain the complete existing response and still react to changed sourced draws', () => {
    const world = fixture(true);
    const state = createState(world, { seed: 1 });
    const profile = profileOf(world, state, id, issuer);
    const numeric = { id: profile.id, values: profile.values, boldness: profile.boldness, candour: profile.candour, standing: profile.standing, regard: profile.regard };
    const response = resolveDirective(profile, terms, context);
    // Frozen numeric result from the pre-0113 resolver: this control is independent of the optional mask path.
    expect(response).toEqual({
      actual: 'reinterpret', declared: 'comply', willingness: -200,
      contributions: [
        { term: 'values', amount: 0 }, { term: 'temperament', amount: -320 }, { term: 'regard', amount: 0 },
        { term: 'deterrence', amount: 130 }, { term: 'capacity', amount: -10 }, { term: 'disposition', amount: 0 },
        { term: 'grievances', amount: 0 },
      ],
      reasons: [{ kind: 'too_rash', gap: 800 }, { kind: 'fears_sanction' }, { kind: 'shielded_by_standing' }, { kind: 'lacks_resources', shortfall: 20 }],
      statedReasons: [], counterProposal: null, conditions: [{ kind: 'when_reinforced', shortfall: 20 }],
    });
    expect(response).toEqual(resolveDirective(numeric, terms, context));
    expect(resolveDirective({ ...profile, boldness: 1000 }, terms, context)).not.toEqual(response);
  });

  it.each(['boldness', 'candour', 'standing'] as const)('a direction with no citation is still unknown for %s', (field) => {
    const world = fixture(true);
    const source = world.map.world;
    const people = source.people.map(p => p.id !== id ? p : field === 'standing'
      ? { ...p, centres: { ...p.centres, reputation: { ...p.centres.reputation, cites: [] } } }
      : { ...p, temperament: { ...p.temperament, [field]: { ...p.temperament[field], cites: [] } } });
    const uncited = indexSeatsWorld(indexWorld({ ...source, people }), world.start);
    const profile = profileOf(uncited, createState(world, { seed: 1 }), id, issuer);
    expect(profile).toHaveProperty(`evidence.${field}`, false);
  });
});
