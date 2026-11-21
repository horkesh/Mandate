import { expect, it } from 'vitest';
import { controlClaims } from '../src/knowledge/control-claims.ts';
import { controlEvidence } from '../src/knowledge/control-beliefs.ts';
import { deliverReport, knowledgeOf, pruneKnowledge } from '../src/knowledge/knowledge.ts';
import { reportProblems } from '../src/knowledge/report.ts';
import { NO_TRUTH } from '../src/knowledge/truth.ts';
import { claim, fresh, report } from './support/s25-fixture.ts';
import { F, R } from './support/seats-fixture.ts';

it('S25 knowledge-03: an unheld region explicitly reports zero shares for every side', () => {
  expect(controlClaims(R('a_front'), {}, [F('b'), F('a')])).toEqual([
    { claimKind: 'control', claimRegion: R('a_front'), claimValue: 0, claimToken: F('a'), claimConfidence: 1000 },
    { claimKind: 'control', claimRegion: R('a_front'), claimValue: 0, claimToken: F('b'), claimConfidence: 1000 },
  ]);
});

it.each([0, 23])('S25 knowledge-06: accepts the valid report hour %i', hour => {
  expect(reportProblems(report('s25.hour', { reportHour: hour }).knownBody)).toEqual([]);
});

it.each([-1, 24])('rejects the out-of-range report hour %i', hour => {
  expect(reportProblems(report('s25.hour', { reportHour: hour }).knownBody)).toContain('hour must be 0..23');
});

it('S25 knowledge-04: a report survives its maximum age and expires on the following day', () => {
  const { world, state, seat } = fresh();
  const paper = report('s25.age');
  const templates = world.map.world.rules.reportTemplates;
  const age = templates.find(t => t.templateType === 'wire-dispatch' && t.templateSubtype === null)!.maxAgeDays;
  const held = deliverReport(state, seat, paper, NO_TRUTH);
  const atLimit = pruneKnowledge(held, templates, paper.knownBody.reportDay + age, 500);
  expect(knowledgeOf(atLimit.state, seat).knownReports.map(r => r.id)).toContain(paper.id);
  expect(atLimit.counts).toEqual({ byAge: 0, bySupersession: 0 });
  const expired = pruneKnowledge(atLimit.state, templates, paper.knownBody.reportDay + age + 1, 500);
  expect(knowledgeOf(expired.state, seat).knownReports).toEqual([]);
  expect(expired.counts).toEqual({ byAge: 1, bySupersession: 0 });
  expect(expired.state.reportTruth[paper.id]).toBeUndefined();
});
