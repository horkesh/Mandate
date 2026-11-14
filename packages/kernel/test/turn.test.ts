import { describe, expect, it } from 'vitest';
import {
  advance,
  botDecisions,
  createGame,
  DEFAULT_KERNEL_RULES,
  ScenarioError,
  viewFor,
  type Decision,
  type GameState,
  type ScenarioData,
} from '../src/index.ts';
import { fixture } from './fixture.ts';

const rules = DEFAULT_KERNEL_RULES;
const attack: Decision = { verb: 'direct', postId: 'a_army', objective: { kind: 'attack', targetRegionId: 'b_front' }, boldness: 800 };

function game(edit?: (s: ReturnType<typeof fixture>) => void): GameState {
  const s = fixture();
  edit?.(s);
  return createGame(s as ScenarioData);
}

function untilDay(state: GameState, day: number): GameState {
  let s = state;
  while (s.day < day && !s.verdict) s = advance(s, []).state;
  return s;
}

const ledger = (s: GameState, kind: string) => s.ledger.filter((e) => e.kind === kind);

describe('scenario loading', () => {
  it('reports every problem at once', () => {
    expect(() =>
      game((s) => {
        s.posts[0]!.holderId = 'nobody';
        s.blocs[0]!.weight = 400;
        s.regions[0]!.neighbours = ['b_cap'];
      }),
    ).toThrow(ScenarioError);
    try {
      game((s) => {
        s.posts[0]!.holderId = 'nobody';
        s.blocs[0]!.weight = 400;
      });
    } catch (e) {
      expect((e as ScenarioError).problems.length).toBeGreaterThanOrEqual(2);
    }
  });
});

describe('orders and reports travel (P8)', () => {
  it('a directive arrives after the link delay and the answer takes as long again', () => {
    const r = advance(game(), [attack]);
    const read = ledger(r.state, 'directive_read');
    expect(read).toHaveLength(1);
    expect(read[0]!.day).toBe(3);
    const answer = r.state.claims.find((c) => c.body.kind === 'response');
    expect(answer?.knownDay).toBe(6);
    expect(r.toDay).toBe(6);
    expect(r.stoppedBecause).toBe('object from a_wary');
  });
});

describe('the audience: objections and answers (P3, P9)', () => {
  it('accepting a counter-proposal makes it the proxy\'s own plan, which he carries out', () => {
    const first = advance(game(), [attack]).state;
    const directiveId = Object.keys(first.directives)[0]!;
    const second = advance(first, [{ verb: 'accept_counter', directiveId }]).state;
    const read = ledger(second, 'directive_read').at(-1)!;
    expect(read.detail.ownPlan).toBe(true);
    expect(read.detail.actual).toBe('comply');
    expect(ledger(second, 'operation_planned').length).toBeGreaterThan(0);
  });

  it('insisting is recorded, wounds the proxy, and he can no longer object', () => {
    const first = advance(game(), [attack]).state;
    const directiveId = Object.keys(first.directives)[0]!;
    const second = advance(first, [{ verb: 'insist', directiveId }]).state;
    expect(second.factions.a!.record.map((r) => r.kind)).toContain('override');
    expect(second.persons.a_wary!.grievances.map((g) => g.kind)).toContain('overruled');
    const read = ledger(second, 'directive_read').at(-1)!;
    expect(read.detail.insisted).toBe(true);
    expect(read.detail.actual).toBe('comply_with_reservations');
  });

  it('an unanswered objection is settled by the proxy after grace plus the courier round trip', () => {
    const first = advance(game(), [attack]).state;
    const later = untilDay(first, 25);
    const settled = ledger(later, 'delegated_by_default');
    expect(settled).toHaveLength(1);
    // Read on day 3; grace 10 + 2 x 3 link days = day 19.
    expect(settled[0]!.day).toBe(19);
  });

  it('you cannot answer an objection you have not yet heard', () => {
    const s = game();
    const r = advance(s, [attack, { verb: 'insist', directiveId: 'dir-1' }]);
    expect(r.rejections.map((x) => x.reason)).toContain('no objection pending on that directive');
  });

  it('attention is finite', () => {
    const r = advance(game((s) => { s.factions[0]!.attentionPerTurn = 1; }), [attack, { verb: 'honour', personId: 'a_bold' }]);
    expect(r.rejections).toHaveLength(1);
    expect(r.rejections[0]!.reason).toBe('no attention left this turn');
  });
});

describe('promises and the record (P7)', () => {
  it('a promise not kept in time is broken, recorded, and resented', () => {
    const s = untilDay(advance(game(), [{ verb: 'promise', personId: 'a_spare' }]).state, 61);
    expect(s.factions.a!.record.map((r) => r.kind)).toEqual(['promise_made', 'promise_broken']);
    expect(s.persons.a_spare!.grievances.map((g) => g.kind)).toContain('promise_broken');
  });

  it('appointing the man you promised keeps the promise; the senior man passed over resents it', () => {
    const s = advance(game(), [
      { verb: 'promise', personId: 'a_spare' },
      { verb: 'dismiss', personId: 'a_wary' },
      { verb: 'appoint', postId: 'a_army', personId: 'a_spare' },
    ]).state;
    expect(s.factions.a!.record.map((r) => r.kind)).toEqual(['promise_made', 'dismissal', 'promise_kept']);
    expect(s.persons.a_bold!.grievances.map((g) => g.kind)).toContain('passed_over');
  });
});

describe('the insubordination ladder (P5) and rivals (P6)', () => {
  const aggrieved = (standing: number) =>
    game((s) => {
      const p = s.persons.find((x) => x.id === 'a_wary')!;
      p.standing = standing;
      p.regard = -200;
    });

  function withGrievance(state: GameState, weight: number): GameState {
    const s = structuredClone(state);
    s.persons.a_wary!.grievances.push({ kind: 'blamed', weight, sinceDay: 0 });
    return s;
  }

  it('discontent moves a man one rung a week, and lobbying becomes public', () => {
    const s = untilDay(withGrievance(aggrieved(400), 1200), 29);
    const moves = ledger(s, 'ladder_moved').filter((e) => e.actors[0] === 'a_wary');
    expect(moves.map((m) => [m.day, m.detail.to])).toEqual([
      [7, 'reserved'],
      [14, 'foot_dragging'],
      [21, 'freelancing'],
      [28, 'lobbying'],
    ]);
    const signal = s.claims.find((c) => c.body.kind === 'signal' && c.author.kind === 'public');
    expect(signal?.body).toEqual({ kind: 'signal', personId: 'a_wary', rung: 'lobbying' });
    expect(s.persons.a_wary!.rival).toBe(false);
  });

  it('a famous man who reaches lobbying becomes a rival', () => {
    const s = untilDay(withGrievance(aggrieved(800), 1200), 29);
    expect(s.persons.a_wary!.rival).toBe(true);
    expect(ledger(s, 'rival_emerged')).toHaveLength(1);
  });

  it('a bold man on the freelancing rung starts an unordered offensive', () => {
    let s = game((x) => {
      x.posts[0]!.holderId = 'a_bold';
    });
    s = withGrievanceFor(s, 'a_bold', 900);
    s = untilDay(s, 29);
    const unordered = Object.values(s.operations).filter((op) => op.directiveId === null && op.holderId === 'a_bold');
    expect(unordered.length).toBeGreaterThan(0);
  });

  function withGrievanceFor(state: GameState, id: string, weight: number): GameState {
    const s = structuredClone(state);
    s.persons[id]!.grievances.push({ kind: 'blamed', weight, sinceDay: 0 });
    return s;
  }
});

describe('assets belong to posts (P1)', () => {
  it('a transfer is an order to the holder, and the force travels', () => {
    const r = advance(game(), [{ verb: 'allocate', fromPostId: 'a_office', toPostId: 'a_army', amount: 200 }]);
    const arrived = ledger(r.state, 'transfer_arrived');
    expect(arrived).toHaveLength(1);
    expect(arrived[0]!.day).toBe(4);
    expect(r.state.posts.a_army!.force).toBe(800);
    expect(r.state.posts.a_office!.force).toBe(200);
  });
});

describe('verdicts (P10)', () => {
  it('a failed mandate test ends the game', () => {
    const s = advance(game((x) => { x.checkpoints.push({ day: 5, factionId: 'a', kind: 'mandate_test', threshold: 900, label: 'vote' }); }), []).state;
    expect(s.verdict?.kind).toBe('mandate_lost');
    expect(s.verdict?.day).toBe(5);
  });

  it('losing the capital ends the game', () => {
    const s = game();
    s.regions.b_cap!.controllerId = 'a';
    expect(advance(s, []).state.verdict?.kind).toBe('capital_fallen');
  });
});

describe('purity, determinism and the view boundary', () => {
  it('advance never mutates its input', () => {
    const s = game();
    const before = JSON.stringify(s);
    advance(s, [attack]);
    expect(JSON.stringify(s)).toBe(before);
  });

  it('a JSON round trip mid-game changes nothing', () => {
    const s = advance(game(), [attack]).state;
    const restored = JSON.parse(JSON.stringify(s)) as GameState;
    expect(JSON.stringify(untilDay(restored, 60))).toBe(JSON.stringify(untilDay(s, 60)));
  });

  it('a principal\'s view never contains hidden truths (0008, 0011)', () => {
    const s = untilDay(advance(game(), [attack]).state, 40);
    const json = JSON.stringify(viewFor(s, 'a', rules));
    for (const secret of ['"actual"', '"candour"', '"regard"', '"grievances"', '"ladder"', '"willingness"', '"contributions"']) {
      expect(json).not.toContain(secret);
    }
    expect(json).toContain('"told"');
  });

  it('the bot principal acts from its view (L6: wired, not dark)', () => {
    const s = game((x) => {
      x.factions[1]!.attentionPerTurn = 3;
      x.posts[2]!.force = 2000;
    });
    const decisions = botDecisions(viewFor(s, 'b', rules), rules);
    expect(decisions).toContainEqual({ verb: 'direct', postId: 'b_army', objective: { kind: 'attack', targetRegionId: 'a_front' }, boldness: 700 });
  });
});
