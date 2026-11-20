import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * A tripwire for the region writer (0070, hard rule 7). No proposal moves a region's government in Phase 0, so nothing
 * calls `regionMoveProblem` (the 0069 guard that keeps a nation's land with its own people) and a test cannot find an
 * unwritten field. This fails the day any kernel code writes `regionGovernments` outside setup, so whoever writes it
 * first must call the guard, and add the field to the pack validator's list of command fields.
 */
const SRC = fileURLToPath(new URL('../src/', import.meta.url));
/** Where the field is declared (the State type) and copied from the scenario start (setup, with the empty State). */
const ALLOWED = new Set(['root-state.ts', 'tick/setup.ts']);
/**
 * Lane 1.11: command's government_established (a declared government takes its regions) writes the field, after
 * `regionMoveProblem`, refusing `self_governing_region`; the validator holds it to a notice's effects (0069).
 */
const GUARDED = new Set(['command/command.ts']);

function sources(dir: string, prefix = ''): { readonly path: string; readonly text: string }[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? sources(join(dir, e.name), `${prefix}${e.name}/`) : e.name.endsWith('.ts') ? [{ path: `${prefix}${e.name}`, text: readFileSync(join(dir, e.name), 'utf8') }] : []));
}

/** Lines that write the field: a property in an object literal or spread target, an assignment, or an index write. Reads (`state.regionGovernments[region]`, `Object.keys(...)`) are not. */
export function regionGovernmentWrites(text: string): string[] {
  const writes: string[] = [];
  text.split('\n').forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '').replace(/^\s*\*.*$/, '');
    if (/\bregionGovernments\s*:/.test(code) || /\bregionGovernments\s*=(?!=)/.test(code) || /\bregionGovernments\s*\[[^\]]*\]\s*=(?!=)/.test(code) || /\[\s*['"`]regionGovernments['"`]\s*\]\s*=(?!=)/.test(code)) writes.push(`${i + 1}: ${line.trim()}`);
  });
  return writes;
}

const WHY =
  'command (or another module) now writes State.regionGovernments outside setup. A region held by a self-governing government moves only to a department of the same kind and polity (0069, 0070), so the writer must call `regionMoveProblem` (packages/kernel/src/command/command.ts) before it moves a region, refuse with the reason `self_governing_region`, and add its field to the pack validator\'s list of command fields (`commandProposal` in packages/pack-format/src/situations.ts) with the same notice-only rule. Then add that call and field to this test\'s allowance, with their tests.';

describe('the region writer tripwire (0070)', () => {
  it('no kernel code writes regionGovernments outside setup', () => {
    const found = sources(SRC)
      .filter((f) => !ALLOWED.has(f.path) && !GUARDED.has(f.path))
      .flatMap((f) => regionGovernmentWrites(f.text).map((w) => `${f.path}:${w}`));
    expect(found, WHY).toEqual([]);
  });

  it('the guarded writer calls the guard before it writes, and refuses with its reason', () => {
    for (const path of GUARDED) {
      const text = sources(SRC).find((f) => f.path === path)!.text;
      const guard = text.indexOf('regionMoveProblem(map, state.regionGovernments');
      const write = text.indexOf('regionGovernments: governments');
      expect(guard, path).toBeGreaterThan(0);
      expect(write, path).toBeGreaterThan(guard);
      expect(text.slice(guard, write)).toContain("refuse('self_governing_region'");
    }
  });

  it('setup and the State type do declare and copy it (the allowance is real, not stale)', () => {
    const files = sources(SRC);
    for (const path of ALLOWED) expect(regionGovernmentWrites(files.find((f) => f.path === path)!.text).length, path).toBeGreaterThan(0);
  });

  it('positive controls: a write is found in every form, a read is not', () => {
    expect(regionGovernmentWrites('const next = { ...state, regionGovernments: { ...state.regionGovernments, [r]: d } };')).toHaveLength(1);
    expect(regionGovernmentWrites('state.regionGovernments = other;')).toHaveLength(1);
    expect(regionGovernmentWrites('draft.regionGovernments[region] = dept;')).toHaveLength(1);
    expect(regionGovernmentWrites("draft['regionGovernments'] = other;")).toHaveLength(1);
    expect(regionGovernmentWrites('const dept = state.regionGovernments[region]!;')).toEqual([]);
    expect(regionGovernmentWrites('for (const r of Object.keys(state.regionGovernments)) {}')).toEqual([]);
    expect(regionGovernmentWrites('// regionGovernments: only a comment')).toEqual([]);
    expect(regionGovernmentWrites('if (state.regionGovernments[r] === d) {}')).toEqual([]);
  });

  it('the failure message names the guard and the validator field list', () => {
    expect(WHY).toContain('regionMoveProblem');
    expect(WHY).toContain("pack validator's list of command fields");
  });
});
