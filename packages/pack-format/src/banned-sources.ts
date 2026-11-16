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

/** Every citation (an object with a string `source`) inside a record, with its field path. */
export function citationsIn(value: unknown, path = ''): { readonly path: string; readonly source: string }[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => citationsIn(v, `${path}[${i}]`));
  if (value === null || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  if (typeof record.source === 'string' && 'at' in record) return [{ path, source: record.source }];
  return Object.keys(record).flatMap((k) => citationsIn(record[k], path === '' ? k : `${path}.${k}`));
}
