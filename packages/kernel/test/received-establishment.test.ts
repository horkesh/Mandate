import { expect, it } from 'vitest';
import { deliverReport, knowledgeOf, pruneKnowledge } from '../src/knowledge/knowledge.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { viewFor } from '../src/view/view.ts';
import { P, POST } from './support/seats-fixture.ts';
import { fresh, report } from './support/s25-fixture.ts';

it('keeps a received establishment after routine papers expire, without consulting the live post table', () => {
  const { world, state, seat } = fresh();
  const post = POST('new_command');
  const appointment = report('m.appointment', { reportAuthorPost: post, reportSubjectKind: 'post', reportSubjectId: post,
    reportClaims: [{ claimKind: 'verb-answered', claimToken: 'appoint:complied', claimValue: 1, claimRegion: null, claimConfidence: 1000 }] });
  const routine = report('m.routine');
  let held = deliverReport(deliverReport(state, seat, appointment, NO_TRUTH), seat, routine, NO_TRUTH);
  held = { ...held, stateDay: 200 };
  const pruned = pruneKnowledge(held, world.map.world.rules.reportTemplates, 200, 500).state;
  expect(knowledgeOf(pruned, seat).knownReports.map(r => r.id)).toContain(appointment.id);
  expect(knowledgeOf(pruned, seat).knownReports.map(r => r.id)).not.toContain(routine.id);
  expect(viewFor(world, pruned, seat).posts.find(p => p.post === post)).toMatchObject({ holder: P('a_gen'), status: 'held', source: appointment.id });
  expect(pruned.postStates[post]).toBeUndefined();
  expect(viewFor(world, JSON.parse(JSON.stringify(pruned)), seat).posts).toEqual(viewFor(world, pruned, seat).posts);
  const loss = report('m.loss', { reportAuthor: P('a_sec'), reportAuthorPost: POST('a_office'), reportSubjectKind: 'post', reportSubjectId: post,
    reportDay: 190, reportClaims: [{ claimKind: 'commander-lost', claimToken: 'captured', claimValue: 1, claimRegion: null, claimConfidence: 1000 }] }, 200);
  const told = deliverReport(pruned, seat, loss, NO_TRUTH);
  const later = pruneKnowledge({ ...told, stateDay: 400 }, world.map.world.rules.reportTemplates, 400, 500).state;
  expect(viewFor(world, later, seat).posts.find(p => p.post === post)).toMatchObject({ holder: null, status: 'vacant', source: loss.id });
});

it('keeps official notice receipts while ordinary situation advice expires', () => {
  const { world, state, seat } = fresh();
  const notice = report('m.notice', { reportSubjectKind: 'situation', reportSubjectId: 'government_joins' });
  const advice = report('m.advice', { reportType: 'advice', reportSubtype: 'requested', reportSubjectKind: 'situation', reportSubjectId: 'choice' });
  const held = deliverReport(deliverReport(state, seat, notice, NO_TRUTH), seat, advice, NO_TRUTH);
  const next = pruneKnowledge(held, world.map.world.rules.reportTemplates, 200, 500).state;
  expect(knowledgeOf(next, seat).knownReports.map(r => r.id)).toEqual([notice.id]);
});
