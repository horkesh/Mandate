import type { SituationOptionView, SituationView } from '@mandate/kernel/seat-api';
import { describe, expect, it } from 'vitest';
import { toId } from '../../kernel/src/ids.ts';
import { ConsoleGame } from '../src/console/game.ts';
import { situationLines } from '../src/desk/render.ts';

describe('the merged desk renders every proposal form', () => {
  const menu = new ConsoleGame({ pack: 'testbed' }).morning().menu;
  if (menu.menuKind !== 'principal') throw new Error('the testbed opens at its principal');

  const render = (proposedBy: SituationOptionView['proposedBy']) => {
    const situation: SituationView = {
      id: toId('situation', 'fen_crossing'), kind: 'decision', title: 'The crossing', text: 'A choice waits.',
      status: 'open', surfacedDay: 1, chosen: [], delegatedTo: null, staffAuthor: null,
      options: [{ id: 'shelter', label: 'Shelter', proposedBy, group: null }],
    };
    return situationLines([situation], menu, (key) => key);
  };

  it.each(['law-and-practice', 'principal-initiative'] as const)('renders a %s proposal without presenting its provenance as advice', (basis) => {
    expect(render({ basis, cites: [{ source: 'TB-DESIGN', at: 'the recorded basis' }] })).toContain('  - shelter: Shelter');
  });

  it('still names the people urging an option, and leaves inaction unadorned', () => {
    expect(render([toId('person', 'n_secretary')])).toContain('  - shelter: Shelter (urged by n_secretary)');
    expect(render('inaction')).toContain('  - shelter: Shelter');
  });
});
