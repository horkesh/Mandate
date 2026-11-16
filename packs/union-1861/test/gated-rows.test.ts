import { gatedRowHash, gatedRowProblems, type RowSignOff } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { v2Map } from '../../../packages/cli/src/seats-world.ts';

/**
 * The gate reviewer's sign-off on the Union pack's gated rows of the map from orders to values (lane 1.5b; the gate
 * review's G-1.5e; 0074). Every row tagged with a gate topic is pinned here by its content hash and its reviewer: an edit
 * to a row fails this test until the reviewer reads it again and signs the new hash.
 *
 * Lane 1.11 enters the first `fugitive-policy` rows (S17). Until the gate reviewer signs them, they fail here.
 */
const SIGNED: Readonly<Record<string, RowSignOff>> = {};

const rows = v2Map('union-1861')!.world.rules.people.verbs.orderValues;
/** The gate reviewers the pack accepts (gate/reviewers.json): a sign-off must name one of them. */
const reviewers = (JSON.parse(readFileSync(new URL('../gate/reviewers.json', import.meta.url), 'utf8')) as { reviewers: string[] }).reviewers;

describe('the Union pack’s gated rows of the map (G-1.5e)', () => {
  it('every gated row is signed off by a gate reviewer at its current content, and no sign-off is stale', () => {
    expect(reviewers).toEqual(['gate-reviewer']);
    expect(gatedRowProblems(rows, SIGNED, reviewers)).toEqual([]);
  });

  it('fails a gated row with no sign-off, an edited row, a fixture’s sign-off, and a sign-off for a row that is gone', () => {
    const planted = { order: 'policy:planted', boldness: 400, honours: [], offends: ['fugitive_defence'], gateTopics: ['fugitive-policy'], notCheaperThan: null, clashes: [] };
    expect(gatedRowProblems([...rows, planted], SIGNED, null)).toEqual([expect.stringContaining('policy:planted is tagged fugitive-policy but has no sign-off')]);
    const signed = { 'policy:planted': { reviewer: 'gate-reviewer', hash: gatedRowHash(planted) } };
    expect(gatedRowProblems([...rows, planted], signed, reviewers)).toEqual([]);
    expect(gatedRowProblems([...rows, { ...planted, offends: [] }], signed, null)).toEqual([expect.stringContaining('policy:planted changed after its sign-off by gate-reviewer')]);
    expect(gatedRowProblems([...rows, planted], { 'policy:planted': { reviewer: 'fixture', hash: gatedRowHash(planted) } }, null)).toEqual([expect.stringContaining('not a gate reviewer')]);
    expect(gatedRowProblems([...rows, planted], signed, ['someone-else'])).toEqual([expect.stringContaining('not in gate/reviewers.json')]);
    expect(gatedRowProblems(rows, signed, null)).toEqual(['a sign-off names policy:planted, which is not a gated row of the map']);
  });
});
