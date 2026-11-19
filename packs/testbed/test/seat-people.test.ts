import { expect, it } from 'vitest';
import { ConsoleGame } from '../../../packages/cli/src/console/game.ts';
import { viewFor } from '../../../packages/kernel/src/view/view.ts';
import { deliverReport } from '../../../packages/kernel/src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../../../packages/kernel/src/knowledge/truth.ts';
import { toId } from '../../../packages/kernel/src/ids.ts';
import type { State } from '../../../packages/kernel/src/root-state.ts';

it('the testbed catalogue and people records do not change with unreported command or people truth', () => {
  const game = new ConsoleGame({ pack: 'testbed' });
  const request = game.morning(), before = request.view;
  const ownDepartments = new Set(game.world.map.world.departments.filter(d => d.faction === before.faction).map(d => d.id));
  const opening = game.world.start.posts.filter(p => ownDepartments.has(p.department));
  expect(before.posts.map(p => p.post)).toEqual(opening.map(p => p.id).sort());
  expect(opening.some(p => p.holder === null)).toBe(true);
  const commandable = request.menu.menuKind === 'principal' ? request.menu.commandable : [];
  expect(opening.some(p => !commandable.some(c => c.post === p.id))).toBe(true);
  const target = opening.find(p => p.holder !== null && p.holder !== before.person)!;
  const state = game.state;
  const hidden: State = {
    ...state, postStates: { ...state.postStates, [target.id]: { ...state.postStates[target.id]!, postHolder: null, postParent: null } },
    personTraits: {}, personGrievances: {}, personStances: {}, observerPostings: {}, orderResponses: {}, audienceHeld: {}, reportTruth: {},
  };
  const after = viewFor(game.world, hidden, game.seat);
  expect([after.posts, after.people]).toEqual([before.posts, before.people]);
  const told = deliverReport({ ...hidden, stateDay: 1 }, game.seat, {
    id: toId('message', 'm.test.loss'), knownReceivedDay: 1, knownRoute: 'courier', knownVia: [],
    knownBody: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: before.person, reportAuthorPost: null, reportSubjectKind: 'post', reportSubjectId: target.id, reportClaims: [{ claimKind: 'commander-lost', claimToken: 'captured', claimValue: 0, claimRegion: null, claimConfidence: 900 }], reportDay: 1, reportHour: null, reportAdvice: null, reportAnswers: null },
  }, NO_TRUTH);
  expect(viewFor(game.world, told, game.seat).posts.find(p => p.post === target.id)).toMatchObject({ holder: null, status: 'vacant', source: 'm.test.loss' });
});
