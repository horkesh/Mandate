import type { SituationOptionView, SituationView } from '@mandate/kernel/seat-api';
import { describe, expect, it } from 'vitest';
import { toId } from '../../kernel/src/ids.ts';
import { ConsoleGame } from '../src/console/game.ts';
import { situationLines } from '../src/desk/render.ts';
import { deskStrings } from '../src/pack-text.ts';
import { readFileSync, readdirSync } from 'node:fs';
import { lexSource } from '../../kernel/test/support/source.ts';

describe('the merged desk renders every proposal form', () => {
  const game = new ConsoleGame({ pack: 'testbed' });
  const t = deskStrings(game.strings, game.locale);
  const menu = game.morning().menu;
  if (menu.menuKind !== 'principal') throw new Error('the testbed opens at its principal');

  const render = (proposedBy: SituationOptionView['proposedBy']) => {
    const situation: SituationView = {
      id: toId('situation', 'fen_crossing'), kind: 'decision', title: 'The crossing', text: 'A choice waits.',
      status: 'open', surfacedDay: 1, chosen: [], delegatedTo: null, staffAuthor: null,
      options: [{ id: 'shelter', label: 'Shelter', proposedBy, group: null }],
    };
    return situationLines([situation], menu, t);
  };

  it.each(['law-and-practice', 'principal-initiative'] as const)('renders a %s proposal without presenting its provenance as advice', (basis) => {
    expect(render({ basis, cites: [{ source: 'TB-DESIGN', at: 'the recorded basis' }] })).toContain('  - shelter: Shelter');
  });

  it('still names the people urging an option, and leaves inaction unadorned', () => {
    expect(render([toId('person', 'n_secretary')])).toContain('  - shelter: Shelter (urged by n_secretary)');
    expect(render('inaction')).toContain('  - shelter: Shelter');
  });

  it('renders a typed staff absence in plain words', () => {
    const situation = {
      id: toId('situation', 'fen_crossing'), kind: 'decision', title: 'The crossing', text: 'A choice waits.',
      status: 'open', surfacedDay: 1, chosen: [], delegatedTo: null, staffAuthor: null,
      staffAbsence: 'no-adviser-on-record', options: [],
    } as SituationView;
    expect(situationLines([situation], menu, t)).toContain('  No recommendation from the staff');
    expect(situationLines([{ ...situation, staffAbsence: undefined }], menu, t)).not.toContain('  No recommendation from the staff');
  });

  it('never inspects a proposal basis or its citations to choose its presentation', () => {
    const opaque = new Proxy({ basis: 'principal-initiative', cites: [] }, {
      get: () => { throw new Error('the desk read proposal provenance'); },
      ownKeys: () => { throw new Error('the desk enumerated proposal provenance'); },
    }) as SituationOptionView['proposedBy'];
    expect(render(opaque)).toContain('  - shelter: Shelter');
  });

  it('keeps proposal provenance out of every desk source file (architecture)', () => {
    const folder = new URL('../src/desk/', import.meta.url);
    const files = readdirSync(folder).filter((file) => file.endsWith('.ts'));
    expect(files.length).toBeGreaterThan(1);
    for (const file of files) {
      const source = readFileSync(new URL(file, folder), 'utf8');
      expect(lexSource(source).code, file).not.toMatch(/\b(?:basis|cites)\b/);
      // Computed property reads and discriminating on a basis literal are equally forbidden.
      expect(source, file).not.toMatch(/["'](?:basis|cites|law-and-practice|principal-initiative)["']/);
    }
  });
});
