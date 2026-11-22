import { describe, expect, it } from 'vitest';
import { toId, type MessageId } from '../src/ids.ts';
import { deliverReport, knowledgeOf, type KnownReport } from '../src/knowledge/knowledge.ts';
import type { ReportBody } from '../src/knowledge/report.ts';
import { canonicalHash } from '../src/serialize/hash.ts';
import { encodeSave, decodeSave } from '../src/serialize/save.ts';
import type { State } from '../src/root-state.ts';
import { seatIdFor } from '../src/seats/seats.ts';
import { createState } from '../src/tick/setup.ts';
import { sendReport } from '../src/tick/context.ts';
import { sendMessages } from '../src/messages/transit.ts';
import { deliverDue } from '../src/tick/deliver.ts';
import { deepFreeze } from '../src/tick/freeze.ts';
import { viewFor } from '../src/view/view.ts';
import { fixtureMap, fixtureStart, P, POST } from './support/seats-fixture.ts';
import { indexWorld } from '../src/world/index.ts';
import { indexSeatsWorld } from '../src/seats/world.ts';
import { ctxFor } from './support/tick-context.ts';
import { SEATS_MECHANICS } from '../src/tick/tick.ts';

const source = toId('message', 'm.1.a_spy.a_sec.original');
const author = P('a_sec');
const recipient = P('a_lead');
const body: ReportBody = { reportType: 'informal', reportSubtype: 'cabinet-word', reportAuthor: P('a_spy'), reportAuthorPost: null,
  reportSubjectKind: 'region', reportSubjectId: 'a_front', reportClaims: [{ claimKind: "position", claimRegion: null, claimValue: 1, claimToken: null, claimConfidence: 1000 }], reportDay: 1, reportHour: null, reportAdvice: null, reportAnswers: null };
function fixture(candour: 'low' | 'high' = 'low', concealFor: string[] = ['caution']) {
  const map = fixtureMap({ persons: { a_sec: { candour, values: ['caution'] } } });
  const world = indexSeatsWorld(indexWorld({ ...map.world, rules: { ...map.world.rules,
    reportTemplates: map.world.rules.reportTemplates.map(t => t.templateType === body.reportType && t.templateSubtype === body.reportSubtype
      ? { ...t, templateDisclosure: { candidAt: 500, concealFor } } : t),
  } }), fixtureStart());
  const known: KnownReport = { id: source, knownBody: body, knownReceivedDay: 1, knownRoute: 'courier', knownVia: [] };
  const state = deliverReport(createState(world, { seed: 3 }), seatIdFor(author), known, { truthTerms: [], truthTrimmed: [] });
  return { world, state };
}
function forward(world: ReturnType<typeof fixture>['world'], state: State, by = author, id: MessageId = source) {
  const ctx = ctxFor(world, state, 2, SEATS_MECHANICS);
  const forwarded = sendReport(ctx, deepFreeze(state), { body: { ...body, reportAuthor: by, reportAuthorPost: POST('a_office') },
    truth: { truthTerms: [], truthTrimmed: [] }, to: recipient, tag: 'paper.forwarded', route: 'courier', relayOf: id });
  return { ctx, forwarded, message: ctx.outbox[0]! };
}
describe('S53 originator disclosure', () => {
  it('an uncandid author may omit a received paper\'s originator without cutting its claims in transit', () => {
    const { world, state } = fixture();
    const { ctx, message } = forward(world, state);
    expect(message.msgReport?.reportAuthor).toBe(author);
    expect(message.msgReport?.reportClaims.find(c => c.claimKind === 'originator')).toMatchObject({ claimValue: 0, claimToken: null });
    expect(message.msgReport?.reportClaims.filter(c => c.claimKind !== 'originator')).toEqual(body.reportClaims);
    expect(message.msgTruth?.truthOriginator).toBe(P('a_spy'));
    expect(message.msgTruth?.truthSource).toBe(source);
    expect(ctx.telemetry!.mechanics['reports.trimmed']!.fires).toBe(0);
    expect(ctx.telemetry!.mechanics['reports.filtered']!.fires).toBe(0);
    expect(JSON.stringify(message.msgReport)).not.toContain(source);
  });
  it.each([['high', ['caution']], ['low', []]] as const)('names the source when candour or the stated value rule permits it (%s)', (candour, values) => {
    const { world, state } = fixture(candour, [...values]);
    expect(forward(world, state).message.msgReport?.reportClaims.find(c => c.claimKind === 'originator')?.claimToken).toBe(P('a_spy'));
  });
  it('requires the forwarding author to have received the source paper', () => {
    const { world, state } = fixture();
    expect(() => forward(world, state, P('a_gen'))).toThrow('received');
  });
  it('cannot recover an unnamed originator from private truth on a later relay (paired States)', () => {
    const { world, state } = fixture('high');
    const base: ReportBody = { ...body, reportAuthor: P('a_gen'), reportClaims: [...body.reportClaims, { claimKind: 'originator', claimRegion: null, claimValue: 0, claimToken: null, claimConfidence: 1000 }] };
    const a = deliverReport(createState(world, { seed: 3 }), seatIdFor(author),
      { id: source, knownBody: base, knownReceivedDay: 1, knownRoute: 'courier', knownVia: [] }, { truthTerms: [], truthTrimmed: [], truthOriginator: P('a_spy') });
    const b = { ...a, reportTruth: { ...a.reportTruth, [source]: { ...a.reportTruth[source]!, truthOriginator: P('a_bold') } } };
    const first = forward(world, a);
    const second = forward(world, b);
    expect(first.message.msgReport).toEqual(second.message.msgReport);
    expect(first.message.msgReport!.reportClaims.find(c => c.claimKind === 'originator')?.claimToken).toBeNull();
    const deliver = (start: State, sent: ReturnType<typeof forward>) => deliverDue(sent.ctx, sendMessages(start, sent.ctx.outbox.splice(0)));
    const sa = deliver(a, first), sb = deliver(b, second);
    expect(viewFor(world, sa, seatIdFor(recipient))).toEqual(viewFor(world, sb, seatIdFor(recipient)));
    const publicReport = viewFor(world, sa, seatIdFor(recipient)).reports.find(r => r.id === first.forwarded)!;
    expect(publicReport.claims.find(c => c.kind === 'originator')?.token).toBeNull();
    expect(JSON.stringify(publicReport)).not.toContain('a_spy');
  });
  it('projects only the named origin and preserves the paper and private provenance across a save', () => {
    const { world, state } = fixture('high');
    const sent = forward(world, state);
    const next = deliverDue(sent.ctx, sendMessages(state, sent.ctx.outbox.splice(0)));
    const loaded = decodeSave(encodeSave({ worldHash: canonicalHash(world.map.world), state: next })).state as unknown as State;
    expect(viewFor(world, loaded, seatIdFor(recipient))).toEqual(viewFor(world, next, seatIdFor(recipient)));
    expect(knowledgeOf(loaded, seatIdFor(recipient)).knownReports.find(r => r.id === sent.forwarded)!.knownBody.reportClaims.find(c => c.claimKind === 'originator')?.claimToken).toBe(P('a_spy'));
    expect(viewFor(world, loaded, seatIdFor(recipient)).reports.find(r => r.id === sent.forwarded)!.claims.find(c => c.kind === 'originator')?.token).toBe(P('a_spy'));
  });
  it('keeps private audit provenance when the reauthored paper subsequently passes a wire filter', () => {
    const { world, state } = fixture('high');
    const ctx = ctxFor(world, state, 2, SEATS_MECHANICS);
    const id = sendReport(ctx, state, { body: { ...body, reportAuthor: author }, truth: { truthTerms: [], truthTrimmed: [] },
      to: recipient, tag: 'paper.filtered', route: 'wire', relayOf: source });
    const held = deliverDue(ctx, sendMessages(state, ctx.outbox.splice(0)));
    const next = deliverDue(ctxFor(world, held, 10, SEATS_MECHANICS), held);
    expect(knowledgeOf(next, seatIdFor(recipient)).knownReports.find(r => r.id === id)).toBeDefined();
    expect(next.reportTruth[id]?.truthSource).toBe(source);
    expect(next.reportTruth[id]?.truthOriginator).toBe(P('a_spy'));
  });
});
