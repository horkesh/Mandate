import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { SituationOptionView, SituationView } from '@mandate/kernel/seat-api';
import { toId } from '../../../packages/kernel/src/ids.ts';
import { ConsoleGame } from '../../../packages/cli/src/console/game.ts';
import { Situation } from '../web/App.tsx';

vi.mock('../web/map/StaffMap.tsx', () => ({ MapReview: () => null }));

describe('the browser decision keeps proposal provenance opaque', () => {
  const menu = new ConsoleGame({ pack: 'testbed' }).morning().menu;
  if (menu.menuKind !== 'principal') throw Error('expected principal');
  const render = (proposedBy: SituationOptionView['proposedBy'], absence: boolean) => {
    const situation: SituationView = {
      id: toId('situation', 'fen_crossing'), kind: 'decision', title: 'A choice', text: 'A decision waits.',
      status: 'open', surfacedDay: 1, chosen: [], delegatedTo: null, staffAuthor: null,
      ...(absence ? { staffAbsence: 'no-adviser-on-record' } : {}),
      options: [{ id: 'shelter', label: 'The course', proposedBy, group: null }],
    };
    return renderToStaticMarkup(createElement(Situation, { situation, menu: { ...menu, situations: [{ situation: situation.id, options: [{ optionId: 'shelter', group: null, score: 0 }], delegableTo: [] }] }, t: (key: string) => key, execute: async () => {}, order: () => {}, busy: false }));
  };

  it('shows the typed absence once per decision, independently of proposal provenance', () => {
    const opaque = new Proxy({}, { get: () => { throw Error('read provenance'); }, ownKeys: () => { throw Error('enumerated provenance'); } }) as SituationOptionView['proposedBy'];
    expect(render(opaque, true).match(/No recommendation from the staff/g)).toHaveLength(1);
    expect(render(opaque, false)).not.toContain('No recommendation from the staff');
    expect(render(['n_secretary' as never], false)).toContain('n_secretary');
  });

  it('forbids basis and citation inspection in App.tsx (the CLI architecture rule)', () => {
    const source = readFileSync(new URL('../web/App.tsx', import.meta.url), 'utf8');
    // The CLI lexer handles TypeScript, not JSX. Checking all text is stricter here, including comments and strings.
    expect(source).not.toMatch(/\b(?:basis|cites)\b/);
    expect(source).not.toMatch(/["'](?:basis|cites|law-and-practice|principal-initiative)["']/);
  });
});
