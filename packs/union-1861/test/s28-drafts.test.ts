import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { beforeAll, describe, expect, it } from 'vitest';
import { phase0, ids } from '@mandate/kernel';
import { OptionSchema, SituationSchema } from '../../../packages/pack-format/src/situations.ts';
import { checkGate, localeStrings } from '../../../packages/pack-format/src/gate.ts';
import { context, gate, index, live, loadDraft, rawDraft, validateDraft } from '../situations/drafts/s28/validate.ts';

it('accounts for the exact seventeen S13 held candidates', () => {
  const prior = JSON.parse(readFileSync(new URL('../situations/drafts/s13/candidate-options.json', import.meta.url), 'utf8'));
  const file = new URL('../situations/drafts/s28/advocate-search.json', import.meta.url);
  const result = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { items: [] };
  const keys = (rows: { situation: string; option: { id: string } }[]) => rows.map((r) => `${r.situation}/${r.option.id}`).sort();
  expect(result.items).toHaveLength(17);
  expect(keys(result.items)).toEqual(keys(prior.items));
});

describe('S28 source and authoring boundaries', () => {
  const ledger = JSON.parse(readFileSync(new URL('../situations/drafts/s28/advocate-search.json', import.meta.url), 'utf8'));

  it('retains precise searches and reasons for every held advocate', () => {
    expect(ledger.items.filter((r: { contemporaryAdvocate: boolean }) => r.contemporaryAdvocate)).toHaveLength(16);
    for (const row of ledger.items) {
      expect(row.searched.length).toBeGreaterThan(0);
      expect(row.result.length).toBeGreaterThan(50);
      expect(row.holds.length).toBeGreaterThan(0);
      if (!row.contemporaryAdvocate) {
        expect(row.status).toMatch(/^HOLD:/);
        expect(row.draft).toBeNull();
      } else {
        const def = SituationSchema.parse(rawDraft(row.draft));
        expect(def.options.some((o) => o.id === row.option.id)).toBe(true);
        expect(row.citations.every((c: { at: string }) => /pp?\./.test(c.at))).toBe(true);
      }
    }
    expect(ledger.items.filter((r: { contemporaryAdvocate: boolean }) => !r.contemporaryAdvocate).map((r: { option: { id: string } }) => r.option.id).sort()).toEqual(['wait-for-victory']);
  });

  it('keeps the complete delivery outside the live loader', () => {
    expect(live.situations!.some((s) => s.id.startsWith('s28_'))).toBe(false);
    expect(live.provenance.sources.some((s) => s.key.startsWith('S28-'))).toBe(false);
    expect([...live.strings.values()].flatMap((tables) => tables.flatMap((t) => Object.keys(t.table))).some((k) => k.startsWith('situation.s28_'))).toBe(false);
    const files = new URL('../situations/drafts/s28/', import.meta.url);
    expect(existsSync(files)).toBe(true);
    expect(readdirSync(files).filter((f) => /^s28_.*\.json$/.test(f)).map((f) => f.slice(0, -5)).sort()).toEqual(index.items.map((i) => i.id).sort());
  });

  it.each(index.items)('$id has page evidence and no fabricated effects', (entry) => {
    const def = SituationSchema.parse(rawDraft(entry.id));
    expect(def.id).toBe(entry.id);
    expect(def.gateReview).toBeNull();
    expect(def.faction).toBe(entry.faction);
    expect(entry.gateTopic.length).toBeGreaterThan(0);
    expect(entry.needs.every((n) => n.length > 0)).toBe(true);
    expect(entry.inferences.every((n) => n.startsWith('[I]'))).toBe(true);
    expect(def.effects).toEqual([]);
    expect(def.citations.length).toBeGreaterThan(0);
    for (const c of def.citations) {
      expect(context.provenance.sources.some((s) => s.key === c.source)).toBe(true);
      expect(c.at).toMatch(/pp?\./);
    }
    for (const option of def.options) {
      expect(OptionSchema.safeParse(option).success).toBe(true);
      expect(entry.optionEvidence[option.id]?.length).toBeGreaterThan(0);
      expect(entry.acts[option.id]?.length).toBeGreaterThan(40);
      expect(option.effects).toEqual([]);
      expect(option.orders).toEqual([]);
      expect(option.calls).toEqual([]);
      expect(option.lockedCosts).toEqual([]);
      expect(option.proposedBy).not.toBe('inaction');
    }
    if (def.inaction) expect(def.inaction.effects).toEqual([]);
  });

  it.each(index.items)('$id has exactly its declared validator blockers', (entry) => {
    const result = validateDraft(rawDraft(entry.id));
    const kinds = [...new Set(result.errors.map((e) => 'kind' in e ? e.kind : 'schema-error'))].sort();
    expect(kinds).toEqual([...entry.expectedBlockers].sort());
  });
});

describe('S28 real loader probes', () => {
  const results = new Map<string, ReturnType<typeof loadDraft>>();
  beforeAll(() => {
    for (const entry of index.items) results.set(entry.id, loadDraft(rawDraft(entry.id)));
  });
  it.each(index.items)('$id is independently loaded or refused by its real blockers', (entry) => {
    const result = results.get(entry.id)!;
    const errors = result.issues.filter((i) => i.severity === 'error');
    expect([...new Set(errors.map((i) => i.kind))].sort()).toEqual([...entry.expectedBlockers].sort());
    if (entry.expectedBlockers.length > 0) expect(result.pack).toBeNull();
    else expect(result.pack!.situations!.some((s) => s.id === entry.id)).toBe(true);
  });
});

describe('S28 receipt and interim-rule guards', () => {
  it.each(index.items)('$id needs the right paper after the date guard', (entry) => {
    const def = SituationSchema.parse(rawDraft(entry.id));
    const day = 'all' in def.event && 'dayAtLeast' in def.event.all[0]! ? def.event.all[0].dayAtLeast : -1;
    expect(day).toBeGreaterThan(1);
    const report = {
      id: ids.toId('message', 's28.test.receipt'), knownReceivedDay: day,
      knownRoute: 'wire' as const, knownVia: [],
      knownBody: {
        reportType: 'informal' as const, reportSubtype: 'cabinet-word',
        reportAuthor: ids.toId('person', entry.faction === 'union' ? 'lincoln_abraham' : 'davis_jefferson'),
        reportAuthorPost: ids.toId('post', entry.faction === 'union' ? 'us_president' : 'cs_president'),
        reportSubjectKind: 'situation' as const, reportSubjectId: entry.receipt,
        reportClaims: [], reportDay: day, reportHour: null, reportAdvice: null, reportAnswers: null,
      },
    };
    const ctx = { state: phase0.emptyState(), day, situation: null, knowledge: { knownReports: [report] }, since: null };
    expect(phase0.holds(def.event, ctx)).toBe(true);
    expect(phase0.holds(def.knowledge!, ctx)).toBe(true);
    expect(phase0.holds(def.event, { ...ctx, knowledge: { knownReports: [] } })).toBe(false);
    expect(phase0.holds(def.event, { ...ctx, day: day - 1 })).toBe(false);
    expect(phase0.holds(def.event, { ...ctx, knowledge: { knownReports: [{ ...report, knownReceivedDay: day + 1 }] } })).toBe(false);
    const unrelated = { ...ctx, knowledge: { knownReports: [{ ...report, knownBody: { ...report.knownBody, reportSubjectId: 's28_document_unrelated' } }] } };
    expect(phase0.holds(def.event, unrelated)).toBe(false);
    expect(phase0.holds(def.knowledge!, unrelated)).toBe(false);
  });

  it('places the October law on protected people as an event without options', () => {
    const def = SituationSchema.parse(rawDraft('s28_cs_october_exemption_act'));
    expect(def.kind).toBe('notice');
    expect(def.options).toEqual([]);
    expect(def.gate).toMatchObject({ topics: ['twenty-slave-law'], placement: 'event', actingSide: 'confederate' });
    const impossible = SituationSchema.parse({ ...def, kind: 'decision', gate: { ...def.gate, placement: 'decision' }, options: [{ id: 'adopt-law', label: def.title, displayKey: 10, proposedBy: ['davis_jefferson'] }], inaction: { text: def.text }, historicalDefault: { options: ['adopt-law'] }, staffAbsence: { none: 'no-adviser-on-record', cites: [{ source: 'S28-READING', at: 'interim-rule negative control' }] } });
    const issues = checkGate([{ file: 'situations/probe.json', def: impossible }], gate, localeStrings(context.strings), context.provenance);
    expect(issues).toContainEqual(expect.objectContaining({ kind: 'gate-placement' }));
  });

  it('keeps the conscription and habeas costs binding', () => {
    for (const id of ['s28_cs_conscription_proposal', 's28_cs_richmond_habeas']) {
      expect(validateDraft(rawDraft(id)).errors).toContainEqual(expect.objectContaining({ kind: 'gate-no-locked-cost' }));
      expect(validateDraft(rawDraft(id)).errors).toContainEqual(expect.objectContaining({ kind: 'gate-unsigned' }));
    }
  });

  it('still rejects unknown citations, bare dates, missing strings and protected-policy choices', () => {
    const raw = rawDraft('s28_cs_kentucky_neutrality');
    expect(validateDraft({ ...raw, citations: [{ source: 'S28-NOT-READ', at: 'p. 1' }] }).errors).toContainEqual(expect.objectContaining({ kind: 'unknown-reference' }));
    expect(validateDraft({ ...raw, event: { dayAtLeast: 500 } }).errors).toContainEqual(expect.objectContaining({ kind: 'situation-date-cause' }));
    expect(validateDraft({ ...raw, title: 'situation.s28_missing' }).errors).toContainEqual(expect.objectContaining({ kind: 'missing-string' }));
  });
});

it('delivers the named Confederate subjects as unsigned drafts', () => {
  const file = new URL('../situations/drafts/s28/index.json', import.meta.url);
  const result = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { items: [] };
  for (const topic of ['conscription', 'exemptions', 'mississippi', 'kentucky', 'september-offensive', 'recognition']) {
    expect(result.items.some((r: { faction: string; subject: string }) => r.faction === 'confederate' && r.subject === topic), topic).toBe(true);
  }
});
