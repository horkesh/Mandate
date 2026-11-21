import { beforeAll, describe, expect, it } from 'vitest';
import { ConsoleGame } from '../../packages/cli/src/console/game.ts';
import { ConsoleSession } from '../../packages/cli/src/console/session.ts';
import { packStrings } from '../../packages/cli/src/seats-world.ts';
import { writingCandidates } from './writing-screen.mjs';

describe('S27 writing screen under the S35 ruling', () => {
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

  it('S27-B09: flags a slogan-form triad and leaves concrete policy labels alone', () => {
    const strings = packStrings('union-1861');
    const hold = strings['situation.confederate_commissioners.option.hold_and_talk']!;
    const approve = strings['situation.fort_monroe_arrivals.option.approve_holding']!;
    expect(offeredLabel).toContain(hold);
    expect(approve).toBe('Do not give them up: employ them and keep account, their final status reserved');
    expect(writingCandidates(['Hold. Press. Prevail.', offeredLabel, approve])).toEqual(['Hold. Press. Prevail.']);
  });
});
