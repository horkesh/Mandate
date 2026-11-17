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

/**
 * The pack's evidence-date rule (0085), read from `gate/source-policy.json`'s `evidence` block. Each cell of a person has a
 * class, and a citation dated after its class's boundary is weak:
 * - an *innate* cell (the stats named in `innateStats`, the traits in `innateTraits`) shows what the man was, so evidence up to
 *   `innateThrough` (the end of the first scenario's window) counts;
 * - every other cell is true at the start, so only evidence dated before `startBefore` counts.
 * The block is the pack's: the boundaries and the class mapping are data, and a pack without it has no date rule.
 */
export interface EvidencePolicy {
  readonly innateThrough: string;
  readonly startBefore: string;
  readonly innateStats: readonly string[];
  readonly innateTraits: readonly string[];
  /** Traits that are facts (an office held, a service), not judgments: they need no contemporary leg (0087). */
  readonly factTraits: readonly string[];
  /**
   * The pack's later reference works (a biographical directory, a register, a list of officers): they state facts (a rank, an
   * office, a service, a date) and are not a contemporary leg for any judgment or bloc (0087). A fact may still rest on them.
   */
  readonly referenceWorks: readonly string[];
  /** Blocs that are facts (a service held, a side joined), not factions: they need no contemporary leg and may rest on a register (0087). */
  readonly factBlocs: readonly string[];
}
export type EvidenceClass = 'innate' | 'start';

export function readEvidencePolicy(files: PackFiles): EvidencePolicy | null {
  const text = files.read(SOURCE_POLICY_FILE);
  if (text === undefined) return null;
  try {
    const p = (JSON.parse(text.replace(/^﻿/, '')) as { evidence?: Partial<EvidencePolicy> }).evidence;
    if (p === undefined || typeof p.innateThrough !== 'string' || typeof p.startBefore !== 'string') return null;
    const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((s): s is string => typeof s === 'string') : []);
    return { innateThrough: p.innateThrough, startBefore: p.startBefore, innateStats: list(p.innateStats), innateTraits: list(p.innateTraits), factTraits: list(p.factTraits), referenceWorks: list(p.referenceWorks), factBlocs: list(p.factBlocs) };
  } catch {
    return null;
  }
}

/**
 * A citation's place may state the date of the evidence it cites: `dated YYYY-MM-DD` anywhere in the locator. The first such
 * date counts. A citation with no date is undated: the date rule cannot judge it, and only the other weak tests apply.
 */
export function evidenceDate(at: string | null): string | null {
  if (at === null) return null;
  const m = /\bdated[: ]\s*(\d{4}-\d{2}-\d{2})\b/i.exec(at);
  return m === null ? null : m[1]!;
}

/** True when the citation states a date and the date is past the boundary of its cell's class (0085). */
export function datedAfterBoundary(at: string | null, cls: EvidenceClass, policy: EvidencePolicy | null): boolean {
  if (policy === null) return false;
  const d = evidenceDate(at);
  if (d === null) return false;
  return cls === 'innate' ? d > policy.innateThrough : d >= policy.startBefore;
}

/** Every citation (an object with a string `source`) inside a record, with its field path. */
export function citationsIn(value: unknown, path = ''): { readonly path: string; readonly source: string }[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => citationsIn(v, `${path}[${i}]`));
  if (value === null || typeof value !== 'object') return [];
  const record = value as Record<string, unknown>;
  if (typeof record.source === 'string' && 'at' in record) return [{ path, source: record.source }];
  return Object.keys(record).flatMap((k) => citationsIn(record[k], path === '' ? k : `${path}.${k}`));
}
