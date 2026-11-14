import { describe, expect, it } from 'vitest';
import { GameConsole } from '../src/console.ts';
import { loadScenario } from '../src/load.ts';

function session(lines: string[]): { game: GameConsole; out: string[] } {
  const game = new GameConsole(loadScenario('testbed'));
  const out = lines.flatMap((l) => game.handle(l));
  return { game, out };
}

describe('text console (M2)', () => {
  it('an audience shows stated reasons and the counters that answer them', () => {
    const { out } = session(['audience n_army_east attack s_east 800']);
    const text = out.join('\n');
    expect(text).toContain('He says: "refuse"');
    expect(text).toContain('answers values_offended(caution)');
    expect(text).toContain('answers lacks_resources(250)');
    expect(text).toContain('Nothing you can say today answers: shielded_by_standing');
  });

  it('counters change his answer, and committing queues the order', () => {
    const { out } = session([
      'audience n_army_east attack s_east 800',
      'adjust 300',
      'frame reputation',
      'commit',
    ]);
    const text = out.join('\n');
    expect(text).toContain('Queued: audience with n_army_east');
    expect(text).toMatch(/He says: "(comply|comply_with_reservations|object)"/);
  });

  it('impossible orders are refused before they cost attention', () => {
    const { out } = session(['order n_army_east attack n_capital 500']);
    expect(out.join('\n')).toContain('Not possible');
  });

  it('turns advance and the player sees only reports, never ground truth', () => {
    const { game, out } = session(['order n_army_west attack s_west 700', 'end', 'end', 'end']);
    const text = out.join('\n');
    expect(text).toContain('New reports:');
    expect(text).not.toContain('willingness');
    expect(text).not.toContain('reinterpret');
    expect(game.state.turn).toBe(3);
  });
});
