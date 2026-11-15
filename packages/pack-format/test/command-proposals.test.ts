import { describe, expect, it } from 'vitest';
import { formatIssue, loadPack, type Issue } from '../src/index.ts';
import { editJson, testbedFiles } from './support/testbed.ts';

/**
 * The proposals a situation makes to `command` (0058, 0065), checked in the pack as the kernel would refuse them in
 * play: the subject is a government department; a change of side names a real side with delta +1; a closing's delta
 * is +1 or -1. Each check has its positive control: one edit to a testbed situation, and the one check that fires.
 *
 * In the testbed, s_province is a government (kind province) and n_war is not (a war ministry).
 */
const FILE = 'situations/eastwatch_stalls.json';
const KINDS = new Set(['situation-command-proposal', 'not-a-government', 'unknown-reference']);

/** The command-proposal issues one added effect raises, as `kind at: message`. */
function raised(propose: { field: string; subject: string | null; delta: number; side: string | null }): string[] {
  const edits = editJson(FILE, (s) => void s.options[1].effects.push({ propose: { owner: 'command', reason: 'x', ...propose } }));
  const issues: readonly Issue[] = loadPack(testbedFiles(edits)).issues;
  return issues.filter((i) => i.file === FILE && KINDS.has(i.kind) && i.at.includes('.propose.')).map((i) => `${i.kind} ${i.at.slice(i.at.indexOf('.propose.') + '.propose.'.length)}: ${i.message}`);
}

describe('proposals to command in situation files (0058, 0065)', () => {
  it('a change of side and a closing of a government load clean (positive controls)', () => {
    expect(raised({ field: 'department_side', subject: 's_province', delta: 1, side: 'north' })).toEqual([]);
    expect(raised({ field: 'government_closed', subject: 's_province', delta: 1, side: null })).toEqual([]);
    expect(raised({ field: 'government_closed', subject: 's_province', delta: -1, side: null })).toEqual([]);
  });

  it('the subject is a government department', () => {
    expect(raised({ field: 'department_side', subject: 'n_war', delta: 1, side: 'south' })).toEqual(['not-a-government subject: department "n_war" is not a government; only a government changes side']);
    expect(raised({ field: 'government_closed', subject: 'n_war', delta: 1, side: null })).toEqual(['not-a-government subject: department "n_war" is not a government; only a government closes its territory']);
    expect(raised({ field: 'department_side', subject: 'nowhere', delta: 1, side: 'north' })).toEqual(['unknown-reference subject: "nowhere" is not a department']);
    expect(raised({ field: 'government_closed', subject: null, delta: 1, side: null })).toEqual(['situation-command-proposal subject: a "government_closed" proposal names no department']);
  });

  it('a change of side names a real side, with delta +1', () => {
    expect(raised({ field: 'department_side', subject: 's_province', delta: 1, side: null })).toEqual(['situation-command-proposal side: a change of side names no side to join']);
    expect(raised({ field: 'department_side', subject: 's_province', delta: 1, side: 'east' })).toEqual(['unknown-reference side: "east" is not a faction']);
    expect(raised({ field: 'department_side', subject: 's_province', delta: -1, side: 'north' })).toEqual(["situation-command-proposal delta: a change of side's delta is -1"]);
    expect(raised({ field: 'department_side', subject: 's_province', delta: 2, side: 'north' })).toEqual(["situation-command-proposal delta: a change of side's delta is 2"]);
  });

  it("a closing's delta is +1 or -1", () => {
    expect(raised({ field: 'government_closed', subject: 's_province', delta: 0, side: null })).toEqual(["situation-command-proposal delta: a closing's delta is 0"]);
    expect(raised({ field: 'government_closed', subject: 's_province', delta: 5, side: null })).toEqual(["situation-command-proposal delta: a closing's delta is 5"]);
  });

  it('command owns no other field', () => {
    expect(raised({ field: 'loyalty', subject: 's_province', delta: 1, side: null })).toEqual(['situation-command-proposal field: command owns no field "loyalty"']);
  });

  it('reports at the effect, in the situation file', () => {
    const edits = editJson(FILE, (s) => void s.options[1].effects.push({ propose: { owner: 'command', field: 'department_side', subject: 'n_war', delta: 1, reason: 'x', side: 'south' } }));
    const hit = loadPack(testbedFiles(edits)).issues.filter((i) => i.kind === 'not-a-government');
    expect(hit.map((i) => [i.severity, i.file]), hit.map(formatIssue).join('\n')).toEqual([['error', FILE]]);
    expect(hit[0]!.at).toMatch(/^options\[1\]\.effects\[\d+\]\.propose\.subject$/);
  });
});

/**
 * A self-governing government (0069) is moved only by a notice, its own act. The testbed has no such kind (no pack
 * data changes with this rule), so each control marks its `province` kind self-governing in memory, then adds one
 * proposal where a decision's option, inaction or locked cost, or a notice's effects, would put it.
 */
describe('a self-governing government is moved only by a notice (0069)', () => {
  const NOTICE = 'situations/fen_arrivals.json';
  const markProvince = () =>
    editJson('data/world.json', (m) => {
      m.vocabularies.departmentKinds.find((k: { id: string }) => k.id === 'province').selfGoverning = true;
      // A self-governing department names its polity (0070), or the World itself is refused before any situation is read.
      for (const d of m.departments.filter((x: { kind: string }) => x.kind === 'province')) d.polity = 'provincials';
    });
  const selfGoverning = (file: string, put: (s: Record<string, any>, effect: unknown) => void, propose: { field: string; delta?: number; side?: string | null }): string[] => {
    const effect = { propose: { owner: 'command', reason: 'x', subject: 's_province', delta: 1, side: propose.field === 'department_side' ? 'north' : null, ...propose } };
    const edits = { ...markProvince(), ...editJson(file, (s) => put(s, effect)) };
    return loadPack(testbedFiles(edits)).issues.filter((i) => i.kind === 'self-governing-decision').map((i) => `${i.severity} ${i.file} ${i.at}`);
  };
  const inOption = (s: Record<string, any>, e: unknown) => void s.options[1].effects.push(e);
  const inInaction = (s: Record<string, any>, e: unknown) => void s.inaction.effects.push(e);
  const inLockedCost = (s: Record<string, any>, e: unknown) => void (s.options[1].lockedCosts = [e]);
  const inNotice = (s: Record<string, any>, e: unknown) => void (s.effects = [...(s.effects ?? []), e]);

  it('refuses a change of side and a closing from a decision option, inaction and a locked cost', () => {
    for (const field of ['department_side', 'government_closed']) {
      expect(selfGoverning(FILE, inOption, { field })).toEqual([`error ${FILE} options[1].effects[1].propose.subject`]);
      expect(selfGoverning(FILE, inInaction, { field })).toEqual([`error ${FILE} inaction.effects[1].propose.subject`]);
      expect(selfGoverning(FILE, inLockedCost, { field })).toEqual([`error ${FILE} options[1].lockedCosts[0].propose.subject`]);
    }
    expect(selfGoverning(FILE, inOption, { field: 'government_closed', delta: -1 })).toHaveLength(1);
  });

  it('passes the same proposals from a notice, the nation’s own act (positive control)', () => {
    expect(selfGoverning(NOTICE, inNotice, { field: 'department_side' })).toEqual([]);
    expect(selfGoverning(NOTICE, inNotice, { field: 'government_closed' })).toEqual([]);
    expect(selfGoverning(NOTICE, inNotice, { field: 'government_closed', delta: -1 })).toEqual([]);
  });

  it('leaves an ordinary government to a decision: without the flag nothing fires', () => {
    const effect = { propose: { owner: 'command', reason: 'x', subject: 's_province', delta: 1, side: 'north', field: 'department_side' } };
    const edits = editJson(FILE, (s) => inOption(s, effect));
    expect(loadPack(testbedFiles(edits)).issues.filter((i) => i.kind === 'self-governing-decision')).toEqual([]);
  });

  it('only a government can govern itself', () => {
    const edits = editJson('data/world.json', (m) => void (m.vocabularies.departmentKinds.find((k: { id: string }) => k.id === 'war_ministry').selfGoverning = true));
    const found = loadPack(testbedFiles(edits)).issues.filter((i) => i.kind === 'self-governing-not-government');
    expect(found.map((i) => [i.severity, i.message])).toEqual([['error', 'department kind "war_ministry" is self-governing but not a government']]);
  });
});
