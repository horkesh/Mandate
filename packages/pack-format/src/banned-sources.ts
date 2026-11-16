/**
 * The gate's banned sources (A6, `gate/source-policy.json`), read before the World is validated so that every citation
 * in the pack is checked, not only those on situations (lane 1.8b; the lead's ruling on the two memoirs). The gate reads
 * and shape-checks the same file in full (`gate.ts`); this reads only the banned list, and a file it cannot read gives
 * none, so the gate's own report of a malformed file is the one that counts.
 */
import type { PackFiles } from './generate.ts';

export const SOURCE_POLICY_FILE = 'gate/source-policy.json';

export function readBannedSources(files: PackFiles): string[] {
  const text = files.read(SOURCE_POLICY_FILE);
  if (text === undefined) return [];
  try {
    const parsed = JSON.parse(text.replace(/^﻿/, '')) as { banned?: unknown };
    return Array.isArray(parsed.banned) ? parsed.banned.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * The gate's weak sources (A6): memoirs, self-reports and pointers that may support a claim only beside a stronger source.
 * Read the same way as the banned list. People's cells are checked against it (lane 1.11a, hard rule 7): a cell whose every
 * admissible citation is weak is refused.
 */
export function readWeakSources(files: PackFiles): string[] {
  const text = files.read(SOURCE_POLICY_FILE);
  if (text === undefined) return [];
  try {
    const parsed = JSON.parse(text.replace(/^﻿/, '')) as { weak?: unknown };
    return Array.isArray(parsed.weak) ? parsed.weak.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * A citation's place may carry a marker that makes that one citation weak, whatever its source: `snippet` (seen only in
 * a search summary), `self-report` (the person's own later account) or `after-start` (evidence dated after the start
 * date the cell is for). Matched at the start of the locator, case-insensitively, as a whole word.
 */
export const WEAK_LOCATOR_MARKERS = ['snippet', 'self-report', 'after-start'] as const;
export function hasWeakMarker(at: string | null): boolean {
  if (at === null) return false;
  const head = at.trim().toLowerCase();
  return WEAK_LOCATOR_MARKERS.some((m) => head === m || head.startsWith(`${m} `) || head.startsWith(`${m}:`) || head.startsWith(`${m},`) || head.startsWith(`[${m}`));
}

/** Every citation (an object with a string `source`) inside a record, with its field path. */
export function citationsIn(value: unknown, path = ''): { readonly path: string; readonly source: string }[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => citationsIn(v, `${path}[${i}]`));
  if (value === null || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  if (typeof record.source === 'string' && 'at' in record) return [{ path, source: record.source }];
  return Object.keys(record).flatMap((k) => citationsIn(record[k], path === '' ? k : `${path}.${k}`));
}
