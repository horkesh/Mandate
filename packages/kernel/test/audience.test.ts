import { describe, expect, it } from 'vitest';
import {
  advance,
  createGame,
  DEFAULT_KERNEL_RULES,
  holdAudience,
  type AudienceDraft,
  type GameState,
  type ScenarioData,
} from '../src/index.ts';
import { fixture } from './fixture.ts';

const rules = DEFAULT_KERNEL_RULES;

function game(edit?: (s: ReturnType<typeof fixture>) => void): GameState {
  const s = fixture();
  s.objectiveValues.attack = { honours: ['glory'], offends: ['caution'], frames: ['order', 'duty'] };
  edit?.(s);
  return createGame(s as ScenarioData);
}

// a_wary (caution, order; candid) holds a_army, facing b_front.
const attackDraft = (counters: AudienceDraft['counters'] = [], boldness = 800): AudienceDraft => ({
  postId: 'a_army',
  objective: { kind: 'attack', targetRegionId: 'b_front' },
  boldness,
  counters,
});

describe('the audience (P3)', () => {
  it('a candid proxy states his reasons, and only matching counters are offered', () => {
    const outcome = holdAudience(game(), 'a', attackDraft(), rules);
    expect(outcome.declared).toBe('object');
    expect(outcome.statedReasons.map((r) => r.kind)).toEqual(['values_offended', 'too_rash']);
    expect(outcome.options.map((o) => o.counter)).toEqual(['frame', 'adjust', 'threaten']);
    expect(outcome.frames).toEqual(['order', 'duty']);
  });

  it('answering his stated reasons moves him, but a cautious man must be met almost all the way', () => {
    const halfway = holdAudience(game(), 'a', attackDraft([{ kind: 'frame', value: 'order' }, { kind: 'adjust', boldness: 500 }]), rules);
    expect(halfway.problems).toEqual([]);
    expect(halfway.declared).toBe('object');
    const met = holdAudience(game(), 'a', attackDraft([{ kind: 'frame', value: 'order' }, { kind: 'adjust', boldness: 250 }]), rules);
    expect(met.declared).toBe('comply_with_reservations');
  });

  it('a preview never changes the game', () => {
    const s = game();
    const before = JSON.stringify(s);
    holdAudience(s, 'a', attackDraft([{ kind: 'threaten' }, { kind: 'frame', value: 'order' }]), rules);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('grievances are not interchangeable: reinforcements do not answer a man passed over', () => {
    const s = game();
    s.persons.a_wary!.grievances.push({ kind: 'passed_over', weight: 300, sinceDay: 0 });
    const outcome = holdAudience(s, 'a', attackDraft([], 200), rules);
    const grievance = outcome.statedReasons.find((r) => r.kind === 'holds_grievance');
    expect(grievance).toEqual({ kind: 'holds_grievance', grievance: 'passed_over', weight: 300 });
    const options = new Map(outcome.options.map((o) => [o.counter, o.answers]));
    expect(options.get('promise_advancement')).toEqual([grievance]);
    expect(options.has('reinforce')).toBe(false);
  });

  it('an uncandid man hides his grievance, so you are offered nothing to answer it', () => {
    const s = game((x) => {
      x.persons.find((p) => p.id === 'a_wary')!.candour = 200;
    });
    s.persons.a_wary!.grievances.push({ kind: 'passed_over', weight: 300, sinceDay: 0 });
    const outcome = holdAudience(s, 'a', attackDraft([], 200), rules);
    expect(outcome.statedReasons.some((r) => r.kind === 'holds_grievance')).toBe(false);
    expect(outcome.options.some((o) => o.counter === 'promise_advancement')).toBe(false);
  });

  it('a promise of advancement clears the grievance now, and is recorded as a promise to keep', () => {
    const s = game();
    s.persons.a_wary!.grievances.push({ kind: 'passed_over', weight: 300, sinceDay: 0 });
    const r = advance(s, [{ verb: 'audience', ...attackDraft([{ kind: 'promise_advancement' }], 200) }]);
    expect(r.rejections).toEqual([]);
    expect(r.state.factions.a!.record.map((x) => x.kind)).toContain('promise_made');
    expect(r.state.persons.a_wary!.grievances.some((g) => g.kind === 'passed_over')).toBe(false);
  });

  it('promised reinforcements are an order to another holder, and count only as far as promises are believed', () => {
    const s = game((x) => {
      x.posts[2]!.force = 900; // a much stronger enemy: a_army now lacks resources
    });
    const plain = holdAudience(s, 'a', attackDraft([{ kind: 'frame', value: 'order' }]), rules);
    expect(plain.statedReasons.some((r) => r.kind === 'lacks_resources')).toBe(true);
    const reinforced = holdAudience(s, 'a', attackDraft([{ kind: 'frame', value: 'order' }, { kind: 'reinforce', fromPostId: 'a_office', amount: 400 }]), rules);
    const shortfall = (o: typeof plain) => {
      const r = o.statedReasons.find((x) => x.kind === 'lacks_resources');
      return r && r.kind === 'lacks_resources' ? r.shortfall : 0;
    };
    expect(shortfall(reinforced)).toBeLessThan(shortfall(plain));

    // Committing it issues a transfer order to the office holder as well as the attack order.
    const r = advance(s, [{ verb: 'audience', ...attackDraft([{ kind: 'reinforce', fromPostId: 'a_office', amount: 400 }]) }]);
    const kinds = Object.values(r.state.directives).map((d) => d.objective.kind).sort();
    expect(kinds).toEqual(['attack', 'transfer']);
    expect(Object.values(r.state.directives).find((d) => d.objective.kind === 'attack')!.promisedForce).toBe(400);
  });

  it('counters are limited and validated, and a refused audience changes nothing', () => {
    const s = game();
    const before = JSON.stringify(s);
    const r = advance(s, [{ verb: 'audience', ...attackDraft([{ kind: 'frame', value: 'glory' }]) }]);
    expect(r.rejections[0]?.reason).toContain('cannot be framed as glory');
    expect(JSON.stringify(s)).toBe(before);
    const tooMany = holdAudience(s, 'a', attackDraft([{ kind: 'threaten' }, { kind: 'frame', value: 'order' }, { kind: 'adjust', boldness: 400 }]), rules);
    expect(tooMany.problems[0]).toContain('at most 2');
  });

  it('threats answer nothing and leave a grievance', () => {
    const r = advance(game(), [{ verb: 'audience', ...attackDraft([{ kind: 'threaten' }]) }]);
    expect(r.state.persons.a_wary!.grievances.map((g) => g.kind)).toContain('pressured');
  });
});
