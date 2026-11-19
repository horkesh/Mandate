import { expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConsoleGame } from '../../../packages/cli/src/console/game.ts';
import { buildOrgBoard } from '../web/people.ts';
import { AudienceScene, PostDetails } from '../web/People.tsx';
import type { SeatRequest } from '@mandate/kernel/seat-api';

function fixture() {
  const request = structuredClone(new ConsoleGame({ pack: 'testbed' }).morning());
  Object.assign(request.view, { posts: [{ post: 'internal', parent: null, placementKnown: true, holder: 'known', status: 'held', vacantSince: null, source: null, asOfDay: 0, observerReports: ['m.observer'] }], people: [{ person: 'known', standing: 720, stances: [{ subjectKind: 'post', subjectId: 'internal', recommends: 'wait', confidence: 700, day: 0, source: 'm.consult' }], assessments: ['m.assessment'] }], reports: [
    { id: 'm.consult', author: 'known', authorPost: 'internal', subjectKind: 'post', subjectId: 'internal', type: 'advice', subtype: 'requested', advice: { recommends: 'wait', confidence: 700, reasons: [] } },
    { id: 'm.assessment', author: 'staff', authorPost: null, subjectKind: 'person', subjectId: 'known', type: 'advice', subtype: 'memorandum', advice: { recommends: 'retain', confidence: 400, reasons: [] } },
    { id: 'm.observer', author: 'watcher', authorPost: null, subjectKind: 'post', subjectId: 'internal', type: 'observer-letter', subtype: null, advice: null },
  ].map(r => ({ ...r, day: 0, receivedDay: 0, hour: null, route: 'courier', via: [], claims: [], answers: null })) });
  Object.assign(request.menu, { commandable: [], raising: [], vacancies: [] });
  return request;
}
it('uses the complete catalogue even when the field command menu is empty', () => {
  const request = fixture(), before = JSON.stringify(request);
  expect(buildOrgBoard(request).nodes.map(n => [n.post, n.holder, n.placed])).toEqual([['internal', 'known', true]]);
  expect(JSON.stringify(request)).toBe(before);
});
it('renders received people evidence and public standing in the post and audience cards', () => {
  const request = fixture();
  const common = { request, strings: { 'person.known.name': 'Known visitor', wait: 'Wait for supplies', retain: 'Retain this officer' }, post: 'internal', openPaper: () => {}, order: () => {}, openAudience: () => {} };
  const post = renderToStaticMarkup(createElement(PostDetails, common));
  expect(post).toContain('720'); expect(post).toContain('Wait for supplies'); expect(post).toContain('Retain this officer');
  expect(post).toContain('m.observer'); expect(post).toContain('m.consult'); expect(post).toContain('m.assessment');
  const audience = renderToStaticMarkup(createElement(AudienceScene, { ...common, busy: false, queue: [], execute: async () => {} }));
  expect(audience).toContain('Known visitor'); expect(audience).toContain('720'); expect(audience).toContain('Retain this officer');
});
it('shows empty received records without substituting private fields or the command menu holder', () => {
  const request = fixture(); Object.assign(request.view, { people: [], reports: [] });
  Object.assign(request.menu, { commandable: [{ post: 'internal', holder: 'truth-decoy', relays: [], routes: [] }] });
  const html = renderToStaticMarkup(createElement(PostDetails, { request: request as SeatRequest, strings: {}, post: 'internal', openPaper: () => {}, order: () => {}, openAudience: () => {} }));
  expect(html).not.toContain('truth-decoy'); expect(html).toContain('No assessment'); expect(html).toContain('No public standing');
});
