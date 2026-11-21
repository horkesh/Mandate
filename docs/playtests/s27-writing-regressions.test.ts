import { beforeAll, describe, expect, it } from 'vitest';
import { ConsoleGame } from '../../packages/cli/src/console/game.ts';
import { ConsoleSession } from '../../packages/cli/src/console/session.ts';

const bug = process.env.S27_ASSERT_FIXED === '1' ? it : it.fails;

describe('S27 literal standing writing rule', () => {
  let offeredLabel: string;
  beforeAll(() => {
    const session = new ConsoleSession(new ConsoleGame({ pack: 'union-1861' }));
    session.start();
    for (let turn = 0; turn < 6; turn++) {
      session.handle('end');
      const lines = session.handle('situations').lines;
      const label = lines.find(line => line.startsWith('  - hold_and_talk: '));
      if (label) { offeredLabel = label; break; }
    }
    expect(offeredLabel).toMatch(/^  - hold_and_talk: /);
  });

  bug('S27-B09: an offered label avoids a triad of short imperatives', () => {
    // The three acts are substantive. S27 reports the literal wording-rule
    // conflict; it changes neither their policy nor their signed text.
    expect(offeredLabel).not.toMatch(/File a refusal, hold back its delivery, and keep /);
  });
});
