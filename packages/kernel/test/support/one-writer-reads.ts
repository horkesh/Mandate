import { createHash } from 'node:crypto';
import type { SourceFile, WriteViolation } from './one-writer.ts';

interface ReadSite {
  readonly line: number;
  readonly keys: readonly [string, ...string[]];
  readonly form: string;
  readonly reason: string;
}

export interface SourceReadClassifications {
  readonly path: string;
  readonly hash: string;
  readonly sites: readonly ReadSite[];
}

/** A classification applies only to the reviewed file contents, including alias origins and uses. */
export function sourceHash(code: string): string {
  return createHash('sha256').update(code.replaceAll('\r\n', '\n')).digest('hex');
}

type DiagnosticSite = Pick<WriteViolation, 'line' | 'key' | 'form'>;

function sameSite(a: DiagnosticSite, b: DiagnosticSite): boolean {
  return a.line === b.line && a.key === b.key && a.form === b.form;
}

/** Classify reviewed reads after the raw scan. Invalid entries keep their diagnostics visible and fail the audit. */
export function classifyReads(
  files: readonly SourceFile[],
  raw: readonly WriteViolation[],
  registry: readonly SourceReadClassifications[],
): { violations: WriteViolation[]; problems: string[] } {
  const reviewed = new Set<WriteViolation>();
  const problems: string[] = [];
  for (const { path, hash, sites } of registry) {
    if (registry.filter((entry) => entry.path === path).length !== 1) {
      problems.push(`${path}: duplicate reviewed source file`);
      continue;
    }
    const sources = files.filter((file) => file.path === path);
    if (sources.length !== 1) {
      problems.push(`${path}: expected one reviewed source file, found ${sources.length}`);
      continue;
    }
    if (sourceHash(sources[0]!.code) !== hash) {
      problems.push(`${path}: reviewed-read source hash changed`);
      continue;
    }
    if (sites.length === 0) problems.push(`${path}: no reviewed diagnostics`);
    const selected = sites.flatMap(({ keys, ...site }) => keys.map((key) => ({ ...site, key })));
    for (const site of selected) {
      const label = `${path}:${site.line}: ${site.form} of "${site.key}"`;
      if (!site.reason.trim() || /[\r\n\u2028\u2029]/u.test(site.reason)) {
        problems.push(`${label}: reviewed read requires a one-line reason`);
        continue;
      }
      if (selected.filter((other) => sameSite(site, other)).length !== 1) {
        problems.push(`${label}: duplicate reviewed diagnostic`);
        continue;
      }
      const matches = raw.filter((v) => v.path === path && sameSite(site, v));
      if (matches.length !== 1) {
        problems.push(`${label}: expected one raw diagnostic, found ${matches.length}`);
        continue;
      }
      reviewed.add(matches[0]!);
    }
  }
  return { violations: raw.filter((v) => !reviewed.has(v)), problems };
}

/** The S150 reads reviewed against the exact sources scanned by the real-source audit. */
export const REVIEWED_READS: readonly SourceReadClassifications[] = [
  {
    path: 'packages/kernel/src/command/allocation.ts',
    hash: '7888bd1a021e89dab1ce474c2438d588c77987ada338ed906f48f95702202ccc',
    sites: [{
      line: 139, keys: ['enlEndsDay', 'lotService'], form: 'assignment',
      reason: 'The service end date is compared with null and the current day.',
    }],
  },
  {
    path: 'packages/kernel/src/seats/force-requests.ts',
    hash: 'ca7a978cfc5af23774aa5ed7157e45679c0929c16e95dc502267c4426e9699d6',
    sites: [{
      line: 71, keys: ['knownBody', 'knownReports', 'reportForceModeAuthority'], form: 'write through a local alias',
      reason: 'The local stamp from the received report is compared with null before its identity is checked.',
    }],
  },
  {
    path: 'packages/kernel/src/tick/allocation.ts',
    hash: 'ee4df7517a0abf88eb28285f54e5282a1cb007a253a830c4ac0169f8b7d372fc',
    sites: [
      {
        line: 135, keys: ['allocStatus'], form: 'bracket assignment',
        reason: 'The indexed access describes the type of the callback parameter with a default value.',
      },
      {
        line: 159, keys: ['respUndertaking'], form: 'assignment',
        reason: 'The undertaking is checked for presence before its clauses are read.',
      },
      {
        line: 310, keys: ['enlEndsDay', 'lotService'], form: 'assignment',
        reason: 'The service end date is read to decide whether the lot is still fit for passage.',
      },
      {
        line: 315, keys: ['authorityGrant', 'ceilingMen', 'mandateCeiling'], form: 'assignment',
        reason: 'The mandate manpower ceiling is checked for presence.',
      },
      {
        line: 369, keys: ['postStates', 'postHolder'], form: 'write through a local alias',
        reason: 'The local receiver holds a post holder id that is checked for presence before reporting.',
      },
    ],
  },
  {
    path: 'packages/kernel/src/tick/generate.ts',
    hash: 'c815455b7e64fd3fdf86a671235eaab9a22107194d2d4fc2f61e8a373c905385',
    sites: [{
      line: 228, keys: ['postStates'], form: 'write through a parenthesised target',
      reason: 'The sort operates on a fresh array of post ids returned by Object.keys.',
    }],
  },
];
