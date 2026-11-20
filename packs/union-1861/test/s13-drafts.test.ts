import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { phase0, ids } from '@mandate/kernel';
import { checkGate, localeStrings } from '../../../packages/pack-format/src/gate.ts';
import { context, gate, index, live, rawDraft, validateDraft } from '../situations/drafts/s13/validate.ts';
import { OptionSchema, SituationSchema } from '../../../packages/pack-format/src/situations.ts';

// Pack content tests belong with the pack (0003). This list pins the requested
// catalogue window independently of the delivery index and its stage count.
const catalogue = ['S16', 'S19', ...Array.from({ length: 36 }, (_, i) => `S${22 + i}`)];
const { toId } = ids;
const indexFile = new URL('../situations/drafts/s13/index.json', import.meta.url);

describe('S13 catalogue coverage', () => {
  it('delivers every August 1861–November 1862 catalogue entry', () => {
    const index = existsSync(indexFile) ? JSON.parse(readFileSync(indexFile, 'utf8')) : { items: [] };
    expect([...new Set(index.items.map((x: { catalogue: string }) => x.catalogue))].sort()).toEqual(catalogue);
  });
});

describe('S13 drafts in isolation', () => {
  it('includes sourced decision facets rather than only document notices', () => {
    for (const slug of ['fremont_department', 'general_in_chief_1861', 'trent_affair', 'arms_and_contracts', 'grant_rumour', 'war_orders_march_1862', 'washington_cover', 'peninsula_withdrawal', 'cabinet_remonstrance', 'buell_east_tennessee']) {
      expect(index.items.some((x) => x.id === `s13_${slug}_decision`), slug).toBe(true);
    }
  });

  it.each(index.items)('$catalogue: $id passes the authoring validator', (entry) => {
    const raw = rawDraft(entry.id);
    expect(raw.id).toBe(entry.id);
    expect(raw.gateReview ?? null).toBeNull();
    expect(validateDraft(raw).errors).toEqual([]);
    expect(raw.earliest >= '1861-08-01' && raw.earliest <= '1862-11-30').toBe(true);
    expect(entry.needs.length).toBeGreaterThan(0);
  });

  it('keeps every draft outside the live loader, strings and provenance', () => {
    expect(live.situations!.some((s) => s.id.startsWith('s13_'))).toBe(false);
    expect(live.provenance.sources.some((s) => s.key.startsWith('S13-'))).toBe(false);
    expect([...live.strings.values()].flatMap((tables) => tables.flatMap((t) => Object.keys(t.table))).some((k) => k.startsWith('situation.s13_'))).toBe(false);
  });

  it.each(index.items)('$id never fires from the date alone', (entry) => {
    const def = SituationSchema.parse(rawDraft(entry.id));
    const ctx = { state: phase0.emptyState(), day: 999, situation: null, knowledge: { knownReports: [] }, since: null };
    expect(phase0.holds(def.event, ctx)).toBe(false);
    expect(phase0.holds(def.knowledge!, ctx)).toBe(false);
  });

  it.each(index.items)('$id requires the correct received paper and its date guard', (entry) => {
    const def = SituationSchema.parse(rawDraft(entry.id));
    const origin = entry.id.replace(/_decision$/, '').replace(/^s13_/, '');
    const report = {
      id: toId('message', 's13.test.receipt'), knownReceivedDay: 999,
      knownRoute: 'wire' as const, knownVia: [],
      knownBody: {
        reportType: 'informal' as const, reportSubtype: 'cabinet-word',
        reportAuthor: toId('person', 'lincoln_abraham'), reportAuthorPost: toId('post', 'us_president'),
        reportSubjectKind: 'situation' as const, reportSubjectId: `s13_document_${origin}`,
        reportClaims: [], reportDay: 1, reportHour: null, reportAdvice: null, reportAnswers: null,
      },
    };
    const ctx = { state: phase0.emptyState(), day: 999, situation: null, knowledge: { knownReports: [report] }, since: null };
    expect(phase0.holds(def.event, ctx)).toBe(true);
    expect(phase0.holds(def.knowledge!, ctx)).toBe(true);
    expect(phase0.holds(def.event, { ...ctx, day: 1, knowledge: { knownReports: [{ ...report, knownReceivedDay: 1 }] } })).toBe(false);
    expect(phase0.holds(def.event, { ...ctx, knowledge: { knownReports: [{ ...report, knownReceivedDay: 1000 }] } })).toBe(false);
    expect(phase0.holds(def.event, { ...ctx, knowledge: { knownReports: [{ ...report, knownBody: { ...report.knownBody, reportSubjectId: 's13_document_unrelated' } }] } })).toBe(false);
  });

  it('records page evidence and missing act owners for every offered choice', () => {
    for (const entry of index.items) {
      const def = SituationSchema.parse(rawDraft(entry.id));
      if (def.kind !== 'decision') continue;
      expect(def.options.length).toBeGreaterThan(0);
      for (const option of def.options) {
        expect(entry.optionEvidence[option.id]?.length, `${entry.id}/${option.id}`).toBeGreaterThan(0);
        expect(entry.acts[option.id]?.length, `${entry.id}/${option.id}`).toBeGreaterThan(0);
        expect(option.effects).toEqual([]);
        expect(option.orders).toEqual([]);
        expect(option.calls).toEqual([]);
      }
    }
  });

  it('still refuses missing text, invented people and bare dates', () => {
    const raw = rawDraft(index.items[0]!.id);
    const missing = validateDraft({ ...raw, title: 'situation.no_such_key.title' });
    expect(missing.errors).toContainEqual(expect.objectContaining({ kind: 'missing-string' }));
    const invented = validateDraft({ ...raw, speakers: [{ post: null, person: 'invented_person' }] });
    expect(invented.errors).toContainEqual(expect.objectContaining({ kind: 'unknown-reference' }));
    const date = validateDraft({ ...raw, event: { dayAtLeast: 999 } });
    expect(date.errors).toContainEqual(expect.objectContaining({ kind: 'situation-date-cause' }));
  });

  it('still refuses missing sources and anachronisms', () => {
    const raw = rawDraft('s13_fremont_proclamation');
    const bad = validateDraft({ ...raw, citations: [{ source: 'S13-NOT-READ', at: 'p. 1' }] });
    expect(bad.errors).toContainEqual(expect.objectContaining({ kind: 'unknown-reference' }));
    // The register matches the full phrase, "Militia Act of 1862". A fixture
    // saying only "Militia Act" is no positive control for that exact rule.
    const def = SituationSchema.parse({ ...raw, earliest: '1861-08-01', text: 'test.s13.anachronism' });
    const strings = localeStrings(context.strings);
    const resolved = new Map(strings);
    resolved.set('en', new Map([...strings.get('en')!, ['test.s13.anachronism', 'The Militia Act of 1862.']]));
    const issues = checkGate([{ file: 'situations/probe.json', def }], gate, resolved, context.provenance);
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'gate-anachronism' }));
  });

  it('preserves the existing weak classification of Welles’s retrospective opening', () => {
    const raw = rawDraft('s13_hampton_roads_scare');
    expect(raw.citations).toEqual([expect.objectContaining({ source: 'S13-CW2' })]);
    const weakOnly = validateDraft({ ...raw, citations: [{ source: 'WELLES-D1-RETRO', at: 'pp. 61–63' }] });
    expect(weakOnly.errors).toContainEqual(expect.objectContaining({ kind: 'gate-weak-sources' }));
  });

  it('retains the production gate’s unsigned refusal', () => {
    const def = SituationSchema.parse(rawDraft('s13_fremont_proclamation'));
    const issues = checkGate([{ file: `situations/${def.id}.json`, def }], gate, localeStrings(context.strings), context.provenance);
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'gate-unsigned', severity: 'error' }));
    expect(validateDraft(def).review).toContainEqual(expect.objectContaining({ kind: 'gate-unsigned' }));
  });

  it('keeps sourced policy candidates separate and refuses promotion without costs', () => {
    const cards = JSON.parse(readFileSync(new URL('../situations/drafts/s13/candidate-options.json', import.meta.url), 'utf8'));
    expect(cards.items.length).toBeGreaterThan(0);
    const sources = new Set(context.provenance.sources.map((s) => s.key));
    for (const card of cards.items) {
      const option = OptionSchema.parse(card.option);
      expect(card.status).toBe('held candidate; not a SituationDef option');
      expect(card.holds.length).toBeGreaterThan(0);
      expect(option.lockedCosts).toEqual([]);
      expect(card.citations.length).toBeGreaterThan(0);
      for (const cite of card.citations) {
        expect(sources.has(cite.source)).toBe(true);
        expect(cite.at).toMatch(/pp?\./);
      }
      const notice = rawDraft(card.situation);
      expect(notice.kind).toBe('notice');
      expect(notice.options ?? []).toEqual([]);
    }
    const card = cards.items.find((c: { situation: string }) => c.situation === 's13_compensated_emancipation');
    const notice = rawDraft(card.situation);
    const promoted = validateDraft({
      ...notice, kind: 'decision', options: [card.option],
      inaction: { text: notice.text, effects: [] }, historicalDefault: { options: [card.option.id] },
      gate: { ...notice.gate, placement: 'decision' },
    });
    expect(promoted.errors).toContainEqual(expect.objectContaining({ kind: 'gate-no-locked-cost' }));
  });
});
