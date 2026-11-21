import { describe, expect, it } from 'vitest';
import { gateContentHash, PROVENANCE_FILE, ProvenanceFileSchema, SituationSchema, type LocaleStrings } from '@mandate/pack-format';
import { readTestbed } from '../../packages/pack-format/test/support/testbed.ts';
import { signedFindings, signaturePresenceFindings } from '../rules/signed-situations.ts';

const provenance = ProvenanceFileSchema.parse(JSON.parse(readTestbed(PROVENANCE_FILE)));
const original = SituationSchema.parse(JSON.parse(readTestbed('situations/fen_arrivals.json')));
const strings: LocaleStrings = new Map([['en', new Map(Object.entries(JSON.parse(readTestbed('strings/en.json')) as Record<string, string>))]]);
// Synthetic fixture signature only; this never writes or signs a production item.
const signed = { ...original, gateReview: { author: 'fixture-author', reviewer: 'fixture-reviewer', date: '2026-11-20', contentHash: gateContentHash(original, strings, provenance), questionVersions: {}, notes: {} } };
const item = (value: unknown) => ({ path: 'packs/fixture/situations/fen_arrivals.json', value: value as Record<string, unknown> });

describe('every signed situation keeps its signed content', () => {
  it('accepts unchanged content', () => expect(signedFindings([item(signed)], strings, provenance)).toEqual([]));
  it.each([
    { ...signed, earliest: '1861-07-01' },
    { ...signed, event: { dayAtLeast: 100 } },
    { ...signed, gate: { none: 'removing the tag cannot evade the signed hash' } },
  ])('rejects content edits even after a gate tag is removed', value => {
    expect(signedFindings([item(value)], strings, provenance)).toHaveLength(1);
  });
  it('rejects edits to displayed strings in any locale', () => {
    const translated = new Map(strings);
    translated.set('fr', new Map([[original.text, 'A changed translation.']]));
    expect(signedFindings([item(signed)], translated, provenance)).toHaveLength(1);
    const changed = new Map(strings); changed.set('en', new Map([...strings.get('en')!, [original.text, 'A changed dispatch.']]));
    expect(signedFindings([item(signed)], changed, provenance)).toHaveLength(1);
  });
  it('rejects edits to a cited source row, but not an unrelated source', () => {
    const cited = new Set(original.citations.map(c => c.source));
    const changed = { ...provenance, sources: provenance.sources.map(s => cited.has(s.key) ? { ...s, title: `${s.title} changed` } : s) };
    expect(signedFindings([item(signed)], strings, changed)).toHaveLength(1);
    const unrelated = { ...provenance, sources: provenance.sources.filter(s => cited.has(s.key)) };
    expect(signedFindings([item(signed)], strings, unrelated)).toEqual([]);
  });
  it('checks signed drafts too and leaves unsigned drafts to the existing gate', () => {
    expect(signedFindings([{ ...item({ ...signed, earliest: '1861-07-01' }), path: 'packs/fixture/situations/drafts/fen_arrivals.json' }], strings, provenance)).toHaveLength(1);
    expect(signedFindings([item({ ...original, gateReview: null })], strings, provenance)).toEqual([]);
  });
  it('cannot evade the check by stripping the sign-off, deleting the file, or omitting a new signature from the inventory', () => {
    const path = item(signed).path;
    expect(signaturePresenceFindings([item(signed)], [path])).toEqual([]);
    expect(signaturePresenceFindings([item({ ...signed, gateReview: null })], [path])).toHaveLength(1);
    expect(signaturePresenceFindings([], [path])).toHaveLength(1);
    expect(signaturePresenceFindings([item(signed)], [])).toHaveLength(1);
  });
});
