import { blocHash, blocSignOffProblems, type RowSignOff } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { v2Map } from '../../../packages/cli/src/seats-world.ts';

/**
 * The gate reviewer's sign-off on the Union pack's blocs (lane 1.6; the gate review of lane 1.6, item 4, as G-1.5e pins
 * the map's gated rows). `checkBlocs` refuses a bloc named for a protected group; a neutral name could still hide one
 * as its members, which only a reader of its cite can see. So each bloc is pinned here by its content hash (its rule and
 * its English name) and its reviewer: a new or edited bloc fails this test until the gate reviewer reads it and signs.
 */
const SIGNED: Readonly<Record<string, RowSignOff>> = {
  // The gate reviewer's sign-off of lane 1.6 (review-gate-1861.md), at each bloc's content.
  army: { reviewer: 'gate-reviewer', hash: '1d07b74babb36cd737424b1f33d3e748352e8cb9e604e0be13b36ce436919ff5' },
  border_unionists: { reviewer: 'gate-reviewer', hash: 'ce1a624688d2e4a747cd96edb2582558d21ed428b1747102116331d98a1895d3' },
  confederate: { reviewer: 'gate-reviewer', hash: '99b3606520312abc48b74875107a54bd4320a0e2b2bf3ac9720b0482d3b032f9' },
  moderates: { reviewer: 'gate-reviewer', hash: 'c14be952af998a733893025f4c17788bcdbf01a1a4f3958632b633bae47a2074' },
  peace_democrats: { reviewer: 'gate-reviewer', hash: '42124ecf220332e0d53db32d31435f37e3bfd7d8263cf21a8f68e6c5cc711611' },
  radicals: { reviewer: 'gate-reviewer', hash: '68f8d058025dde0fa2d824e89ae347d098e664b008f6439b80336b5349d0058b' },
  war_democrats: { reviewer: 'gate-reviewer', hash: 'd51244fea59940a6bf9a76ae435d70d29901716b63e1a366bc417ef8a97f42f2' },
};

const blocs = v2Map('union-1861')!.world.rules.politics.blocs;
const strings = JSON.parse(readFileSync(new URL('../strings/en.json', import.meta.url), 'utf8')) as Record<string, string>;
const names: Record<string, string> = Object.fromEntries(blocs.map((b) => [b.id, strings[`bloc.${b.id}`] ?? '']));
/** The gate reviewers the pack accepts (gate/reviewers.json): a sign-off must name one of them. */
const reviewers = (JSON.parse(readFileSync(new URL('../gate/reviewers.json', import.meta.url), 'utf8')) as { reviewers: string[] }).reviewers;

describe('the Union pack’s blocs, signed by the gate reviewer', () => {
  it('every bloc is signed off by a gate reviewer at its current content, and no sign-off is stale', () => {
    expect(reviewers).toEqual(['gate-reviewer']);
    expect(blocSignOffProblems(blocs, names, SIGNED, reviewers)).toEqual([]);
  });

  it('fails a new bloc, an edited bloc or name, a fixture’s sign-off, and a sign-off for a bloc that is gone', () => {
    const planted = { id: 'planted', faction: blocs[0]!.faction, voice: 0, rest: 0, values: [], victory: 0, defeat: 0, cite: 'none' };
    const all = [...blocs, planted];
    const named = { ...names, planted: 'Planted' };
    expect(blocSignOffProblems(all, named, SIGNED, null)).toContainEqual(expect.stringContaining('bloc planted has no sign-off'));
    const signed = { ...SIGNED, planted: { reviewer: 'gate-reviewer', hash: blocHash(planted, 'Planted') } };
    expect(blocSignOffProblems(all, named, signed, reviewers).filter((p) => p.includes('planted'))).toEqual([]);
    // An edit to its rule, or to its name, voids the sign-off.
    expect(blocSignOffProblems([...blocs, { ...planted, values: ['union'] }], named, signed, null)).toContainEqual(expect.stringContaining('bloc planted changed after its sign-off'));
    expect(blocSignOffProblems(all, { ...names, planted: 'Renamed' }, signed, null)).toContainEqual(expect.stringContaining('bloc planted changed after its sign-off'));
    expect(blocSignOffProblems(all, named, { ...signed, planted: { reviewer: 'fixture', hash: blocHash(planted, 'Planted') } }, null)).toContainEqual(expect.stringContaining('not a gate reviewer'));
    expect(blocSignOffProblems(all, named, signed, ['someone-else'])).toContainEqual(expect.stringContaining('not in gate/reviewers.json'));
    expect(blocSignOffProblems(blocs, names, signed, null)).toContainEqual('a sign-off names bloc planted, which the pack no longer has');
  });
});
