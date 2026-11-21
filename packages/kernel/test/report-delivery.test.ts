import { describe, expect, it } from 'vitest';
import { toId } from '../src/ids.ts';
import { deliverReport, deliverReports, knowledgeOf, type KnownReport } from '../src/knowledge/knowledge.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { createState } from '../src/tick/setup.ts';
import { deepFreeze } from '../src/tick/freeze.ts';
import { indexedFixture, P } from './support/seats-fixture.ts';

const a = seatIdFor(P('a_lead'));
const b = seatIdFor(P('b_lead'));
const truth = { truthTerms: [], truthTrimmed: [] };
const report = (id: string, day = 1): KnownReport => ({
  id: toId('message', id), knownReceivedDay: day, knownRoute: 'courier', knownVia: [],
  knownBody: { reportType: 'wire-dispatch', reportSubtype: null, reportAuthor: P('a_gen'), reportAuthorPost: null,
    reportSubjectKind: 'post', reportSubjectId: 'a_army', reportDay: day, reportHour: null,
    reportAdvice: null, reportAnswers: null, reportClaims: [] },
});

describe('report batches', () => {
  it('matches sequential delivery across seats, arrival ties, existing truth and frozen inputs', () => {
    const state = deepFreeze(createState(indexedFixture(), { seed: 1 }));
    const first = report('z', 3);
    const deliveries = [
      { seat: a, report: first, truth },
      { seat: b, report: first, truth: { ...truth, truthOpeningClaims: true as const } },
      { seat: a, report: report('a', 3), truth },
      { seat: a, report: report('early', 1), truth },
    ];
    const sequential = deliveries.reduce((s, d) => deliverReport(s, d.seat, d.report, d.truth), state);
    const batch = deliverReports(state, deliveries);
    expect(batch).toEqual(sequential);
    expect(batch.reportTruth[first.id]).toBe(truth);
    expect(knowledgeOf(batch, a).knownReports.map(r => r.id)).toEqual(['early', 'a', 'z']);
    expect(knowledgeOf(state, a).knownReports).toEqual([]);
    expect(deliverReports(state, [])).toBe(state);
  });

  it('rejects duplicates within the batch, in stored knowledge and in control archives', () => {
    const state = createState(indexedFixture(), { seed: 1 });
    const r = report('duplicate');
    const d = { seat: a, report: r, truth };
    expect(() => deliverReports(state, [d, d])).toThrow('already holds report');
    const held = deliverReport(state, a, r, truth);
    expect(() => deliverReports(held, [d])).toThrow('already holds report');
    const archived = { ...state, knowledgeBySeat: { ...state.knowledgeBySeat, [a]: { knownReports: [], knownControlReports: [r] } } };
    expect(() => deliverReports(archived, [d])).toThrow('already holds report');
    const opening = { ...state, knowledgeBySeat: { ...state.knowledgeBySeat, [a]: { knownReports: [], knownOpeningControl: r.id } } };
    expect(() => deliverReports(opening, [d])).toThrow('already holds report');
    expect(() => deliverReports(state, [{ ...d, seat: seatIdFor(P('absent')) }])).toThrow('unknown seat');
  });
});
