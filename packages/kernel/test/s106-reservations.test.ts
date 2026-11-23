import { describe, expect, it } from 'vitest';
import { resolveDirective } from '../src/compliance.ts';
import type { CommandContext, DirectiveTerms } from '../src/directive.ts';
import { callDirective } from '../src/recruitment/rules.ts';
import { relayAction } from '../src/reading/orders.ts';
import { FIXTURE_PEOPLE_RULES, FIXTURE_RULES } from './support/map-fixture.ts';

const proxy = { id: 'reader', boldness: 500, candour: 1000, standing: 0, regard: 0, values: ['duty'] };
const context: CommandContext = { available: 1000, oversight: 0, leaderCredibility: 0 };
const terms: DirectiveTerms = { boldness: 500, honours: [], offends: [], required: 0 };
const protest = { ...terms, offends: ['duty'] };

describe('0118 undertaking and reservations', () => {
  it('carries the same undertaking and protest at 7 and 67', () => {
    const reply = (willingness: number) => resolveDirective(proxy, protest, { ...context, disposition: 200 + willingness });
    const low = reply(7), high = reply(67);
    expect([low.willingness, high.willingness]).toEqual([7, 67]);
    expect([low.actual, high.actual]).toEqual(['comply_with_reservations', 'comply_with_reservations']);
    expect(low.undertaking).toEqual(high.undertaking);
    expect(low.reservations).toEqual(high.reservations);
    expect(low.reservations).toEqual([expect.objectContaining({
      clause: 'course', subject: 'course', grounds: { groundKind: 'offended_value', groundReference: 'duty' }, effect: 'statement',
    })]);
  });

  it('undertakes a positive request with no protest and keeps unknown boldness out of its grounds', () => {
    const response = resolveDirective({ ...proxy, evidence: { boldness: false, candour: false, standing: false } }, { ...terms, boldness: 1000 }, { ...context, disposition: 7 });
    expect(response).toMatchObject({ actual: 'comply', willingness: 7, undertaking: { undertakingKind: 'original' }, reservations: [] });
  });

  it('keeps the negative rung when no admissible concrete undertaking exists', () => {
    const response = resolveDirective(proxy, protest, context);
    expect(response).toMatchObject({ actual: 'object', undertaking: null, reservations: [] });
  });

  it('keeps a reserve with no arms requirement free of an arms gate', () => {
    const call = {
      callRegiments: 1, callTermDays: 30, callReadiness: true,
      callProfile: {
        id: 'reserve', sourceProfile: 'reserve', honours: [], offends: [], callProvenance: [{ source: 'paper', page: 4 }],
        conditions: [], materialDemand: [{
          resource: 'arms' as const, obligation: 'not_required' as const, provider: 'unspecified' as const, quantity: null, demandText: 'No arms required.',
        }],
        rationale: 'A reserve.', limits: 'No inventory statement.',
      },
    };
    const directive = callDirective(FIXTURE_RULES.recruitment, call);
    const response = resolveDirective(proxy, directive, { ...context, disposition: 7 });
    expect(response.clauses).toContainEqual(expect.objectContaining({ clauseSubject: 'arms_equipment', clauseObligation: 'not_required' }));
    expect(response).toMatchObject({ actual: 'comply', reservations: [], reservationGaps: [], conditions: [] });
  });

  it('records a war-term proposal without consent as an offer gap and preserves the negative rung', () => {
    const original = { ...protest, clauses: [{ clauseId: 'service_term', clauseSubject: 'service_term' as const }] };
    const response = resolveDirective(proxy, original, context, undefined, [{
      id: 'changed-service', terms, changedClauses: ['service_term'], authority: 'consent_required',
      mechanism: 'enlistment consent and acceptance', acceptanceBy: 'issuing-office',
    }]);
    expect(response).toMatchObject({ willingness: -200, actual: 'object', undertaking: null, reservations: [] });
    expect(response.reservationGaps).toContainEqual(expect.objectContaining({
      effect: 'offer', clause: 'service_term', subject: 'service_term', mechanism: 'enlistment consent and acceptance', gapAcceptanceBy: 'issuing-office',
    }));
  });

  it('selects a concrete admissible alternative while retaining the original score', () => {
    const response = resolveDirective(proxy, protest, context, undefined, [{
      id: 'permitted-course', terms, changedClauses: ['course'], authority: 'authorized',
    }]);
    expect(response).toMatchObject({
      willingness: -200, actual: 'comply_with_reservations',
      undertaking: { undertakingKind: 'alternative', candidate: 'permitted-course', candidateWillingness: 0 },
      reservations: [{ effect: 'statement', treatment: 'propose_amendment', clause: 'course' }],
    });
  });

  it('keeps an unstated protest private and never turns it into a relay hold', () => {
    const response = resolveDirective({ ...proxy, candour: 0 }, protest, { ...context, disposition: 267 });
    expect(response).toMatchObject({ actual: 'comply_with_reservations', declared: 'comply', declaredReservations: [] });
    const rules = { ...FIXTURE_PEOPLE_RULES, relay: { ...FIXTURE_PEOPLE_RULES.relay, reservationsHoldDays: 9 } };
    expect(relayAction(rules, response, 'reader' as never, 'office' as never)).toMatchObject({ action: 'forward', holdDays: 0 });
  });

  it('asks about a named clause and uses a resource report only after receipt', () => {
    const support = { ...terms, clauses: [{ clauseId: 'support', clauseSubject: 'support' as const }] };
    const read = (receivedDay: number) => resolveDirective(proxy, support, {
      ...context, receivedDay, qualifications: [
        { clause: 'support', evidence: 'information_request', reference: 'receiving post', treatment: 'clarify' },
        { clause: 'support', evidence: 'resource_report', reference: 'stores-wire', reportedDay: 2, receivedDay: 4, treatment: 'request_support' },
      ],
    });
    expect(read(3).reservations.map(r => r.treatment)).toEqual(['clarify']);
    expect(read(4)).toMatchObject({ actual: 'comply_with_reservations', conditions: [], reservationGaps: [] });
    expect(read(4).reservations).toEqual([
      expect.objectContaining({ effect: 'request', treatment: 'clarify' }),
      expect.objectContaining({ effect: 'request', treatment: 'request_support', reservationProvenance: 'stores-wire' }),
    ]);
  });

  it('identifies the stage and prerequisite of an unsupported gate', () => {
    const response = resolveDirective(proxy, terms, {
      ...context, qualifications: [{
        clause: 'course', evidence: 'structural_condition', treatment: 'request_support',
        reference: 'readiness-dispatch', stage: 'muster', prerequisite: 'received_camp_assignment', mechanism: 'camp acceptance',
      }],
    });
    expect(response.reservations).toEqual([]);
    expect(response.reservationGaps).toEqual([expect.objectContaining({
      effect: 'gate', mechanism: 'camp acceptance', gapStage: 'muster', gapPrerequisite: 'received_camp_assignment',
    })]);
  });
});
