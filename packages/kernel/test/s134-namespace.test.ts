import { expect, it } from 'vitest';
import { conditionalDoctrineProblems } from '../src/world/doctrine.ts';
import type { PrincipalDoctrine } from '../src/world/world.ts';
import { toId } from '../src/ids.ts';

it('keeps independently authored question and command namespaces together without changing either identity', () => {
  const row = { faction: toId('faction', 'a'), letterNamespace: 'a_orders', consultationNamespace: 'a_questions',
    crossNeutral: false, concentrateAt: null, concentrateSource: null, calls: [], offensives: [],
    inquireEveryDays: 7, appointKinds: { land: [], naval: [] }, consultations: [{
      letter: { namespace: 'a_questions', key: 'first', revision: 1 }, subject: toId('situation', 'harbour'),
      fromDate: '1900-06-02', question: 'What means are available?', kind: 'feasibility',
      courses: [{ id: 'relief', honours: [], opposes: [], resources: ['men'], assumesPossible: false }],
      advisers: [{ person: toId('person', 'a_sec'), post: toId('post', 'a_office') }], source: 'Fictional question book p.1',
    }] } as PrincipalDoctrine;
  expect(conditionalDoctrineProblems(row, () => true)).toEqual([]);
  expect(conditionalDoctrineProblems({ ...row, consultationNamespace: 'other' }, () => true)).not.toEqual([]);
});
