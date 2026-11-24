import { describe, expect, it } from 'vitest';
import { writeViolations } from './support/one-writer.ts';
import { classifyReads, sourceHash, type SourceReadClassifications } from './support/one-writer-reads.ts';

const path = 'packages/kernel/src/tick/fixture.ts';
const code = 'const holder = state.controller;\nif (holder!=null) report(holder);\n';
const file = { path, code };
const owned = [{ key: 'controller', writer: 'control' }];
const raw = writeViolations([file], owned, []);
const site = {
  line: 2,
  keys: ['controller'] as const,
  form: 'write through a local alias',
  reason: 'The holder is checked for presence before reporting.',
};
const registry: SourceReadClassifications = { path, hash: sourceHash(code), sites: [site] };

describe('reviewed reads in the real-source one-writer audit', () => {
  it('classifies the exact read while retaining the raw diagnostic and normalizing CRLF', () => {
    expect(raw).toHaveLength(1);
    expect(classifyReads([{ path, code: code.replaceAll('\n', '\r\n') }], raw, [registry])).toEqual({
      violations: [], problems: [],
    });
  });

  it.each([
    ['replacing the read with an in-place write', 'const holder = state.controller;\nholder.value = next;\n'],
    ['adding a write through the alias after the reviewed line', `${code}holder.value = next;\n`],
  ])('leaves diagnostics unclassified after %s', (_change, newCode) => {
    const changed = { path, code: newCode };
    const diagnostics = writeViolations([changed], owned, []);
    expect(diagnostics.some((v) => v.form === site.form)).toBe(true);
    expect(classifyReads([changed], diagnostics, [registry])).toEqual({
      violations: diagnostics, problems: [`${path}: reviewed-read source hash changed`],
    });
  });

  it('leaves a new diagnostic in the same file visible even with a current source hash', () => {
    const changed = { path, code: `${code}holder.value = next;\n` };
    const diagnostics = writeViolations([changed], owned, []);
    const result = classifyReads([changed], diagnostics, [{ ...registry, hash: sourceHash(changed.code) }]);
    expect(result.problems).toEqual([]);
    expect(result.violations).toEqual([expect.objectContaining({ key: 'controller', line: 3 })]);
  });

  it.each(['', ' \t ', 'First line.\nSecond line.'])('requires a one-line reason (%j)', (reason) => {
    const result = classifyReads([file], raw, [{ ...registry, sites: [{ ...site, reason }] }]);
    expect(result.violations).toEqual(raw);
    expect(result.problems[0]).toContain('requires a one-line reason');
  });

  it('finds entries for files or diagnostics that are no longer present', () => {
    expect(classifyReads([], [], [registry]).problems).toEqual([`${path}: expected one reviewed source file, found 0`]);
    expect(classifyReads([file], [], [registry]).problems[0]).toContain('expected one raw diagnostic, found 0');
  });

  it('rejects ambiguous source files, raw diagnostics and registry entries', () => {
    expect(classifyReads([file, file], raw, [registry]).problems).toEqual([`${path}: expected one reviewed source file, found 2`]);
    expect(classifyReads([file], [...raw, ...raw], [registry]).problems[0]).toContain('expected one raw diagnostic, found 2');
    expect(classifyReads([file], raw, [registry, registry]).problems[0]).toContain('duplicate reviewed source file');
    const duplicate = classifyReads([file], raw, [{ ...registry, sites: [site, site] }]);
    expect(duplicate.violations).toEqual(raw);
    expect(duplicate.problems[0]).toContain('duplicate reviewed diagnostic');
  });
});
