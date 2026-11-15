/**
 * Whether a pack's gate register covers the manpower and population fields for its self-governing governments (0070; the
 * gate review of the register tripwire). A register can only name what a pack knows, and the kernel's owners are built
 * after it, so coverage is tested by probing rather than by reading text: for each stem a probe field id containing it,
 * aimed at each self-governing department of the pack and at each region one governs at a start, must be refused by one of
 * that pack's own refused signatures. Another pack's signatures never count, and a pack with no self-governing department
 * has nothing to cover.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { signatureRefuses } from '@mandate/pack-format';
import type { PackData } from '@mandate/pack-format';

/** The words a nation's land must never be drawn on, each as a field id: recruitment, recruits, manpower, levy, draft, quota, enlistment, population. */
const FIELD_IDS: readonly { readonly stem: string; readonly field: string }[] = [
  { stem: 'recruit', field: 'recruitment' },
  { stem: 'manpower', field: 'manpower' },
  { stem: 'levy', field: 'levy' },
  { stem: 'draft', field: 'draft' },
  { stem: 'quota', field: 'quota' },
  { stem: 'enlist', field: 'enlistment' },
  { stem: 'population', field: 'population' },
];

/**
 * A probe field id for each stem, in the spellings a field can take: bare (`recruitment`), aimed at a region with a hyphen
 * (`region-recruitment`) and in the kernel's snake_case (`region_recruitment`), since an anchored `^recruit` passes the
 * first and misses the others (the gate review; the standing reviewer's T2).
 */
export const MANPOWER_PROBES: readonly { readonly stem: string; readonly field: string }[] = FIELD_IDS.flatMap((p) => [p, { stem: p.stem, field: `region-${p.field}` }, { stem: p.stem, field: `region_${p.field}` }]);

const KERNEL_SRC = fileURLToPath(new URL('../../kernel/src/', import.meta.url));

/**
 * Every proposal field id the modules in `dir` export: `export const X_FIELD = '<id>'` in any form (typed, single or double
 * quoted, `as const`). Comments and constants not named `*_FIELD` are not declarations.
 */
export function scanFieldIds(dir: string = KERNEL_SRC): string[] {
  const texts = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? texts(join(d, e.name)) : e.name.endsWith('.ts') ? [readFileSync(join(d, e.name), 'utf8')] : []));
  const ids = texts(dir).flatMap((t) => [...t.replace(/^\s*\/\/.*$/gm, '').matchAll(/export const \w+_FIELD\b[^=]*=\s*['"]([^'"]+)['"]/g)].map((m) => m[1]!));
  return [...new Set(ids)].sort();
}

/** The kernel's proposal field ids that carry one of the stems: probed as the kernel spells it. */
export function kernelFieldIds(dir: string = KERNEL_SRC): string[] {
  return scanFieldIds(dir).filter((id) => FIELD_IDS.some((p) => id.includes(p.stem)));
}

/** The pack's self-governing departments, and the regions one of them governs in any scenario start. */
export function selfGoverningSubjects(pack: Pick<PackData, 'world' | 'scenarios'>): { readonly departments: string[]; readonly regions: string[] } {
  const kinds = new Set(pack.world.vocabularies.departmentKinds.filter((k) => k.selfGoverning).map((k) => k.id as string));
  const departments = pack.world.departments.filter((d) => kinds.has(d.kind)).map((d) => d.id as string);
  const own = new Set(departments);
  const regions = [...new Set(pack.scenarios.flatMap((s) => s.governments.filter((g) => own.has(g.department as string)).map((g) => g.region as string)))].sort();
  return { departments: departments.sort(), regions };
}

export interface UncoveredProbe {
  readonly stem: string;
  readonly field: string;
  readonly subject: string;
}

/** The probes (stem, field, subject) no refused signature of the pack's own register refuses. Empty when covered, or when there is nothing to cover. */
export function uncoveredProbes(pack: Pick<PackData, 'world' | 'scenarios' | 'gate'>, kernelFields: readonly string[] = kernelFieldIds()): UncoveredProbe[] {
  const subjects = selfGoverningSubjects(pack);
  const probes = [...MANPOWER_PROBES, ...kernelFields.flatMap((field) => FIELD_IDS.filter((p) => field.includes(p.stem)).map((p) => ({ stem: p.stem, field })))];
  const signatures = (pack.gate?.register.topics ?? []).flatMap((t) => t.refused);
  return [...subjects.departments, ...subjects.regions].flatMap((subject) =>
    probes.filter((p) => !signatures.some((sig) => signatureRefuses(sig, p.field, subject))).map((p) => ({ stem: p.stem, field: p.field, subject })),
  );
}
