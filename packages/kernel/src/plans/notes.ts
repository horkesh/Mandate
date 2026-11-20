/** Nonbinding marks addressed to the holder whose plan is returned (0016, 0026, R56). */
import { isWellFormedId, type RegionId } from '../ids.ts';

export const NOTE_KINDS = ['focus', 'via', 'wait', 'avoid'] as const;
export type NoteKind = (typeof NOTE_KINDS)[number];

/** Flat, closed grammar. Fields a mark does not use are null or empty. */
export interface PlanNote {
  readonly markKind: NoteKind;
  readonly markAxis: string;
  readonly markRegion: RegionId | null;
  readonly markVia: readonly RegionId[];
  readonly markDays: number | null;
}

/** Shape validation also used at the untrusted command-log boundary. */
export function noteProblems(raw: unknown): string[] {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return ['note must be an object'];
  const n = raw as PlanNote;
  if (Object.keys(n).sort().join() !== 'markAxis,markDays,markKind,markRegion,markVia') return ['note fields must be axis, days, kind, region, via'];
  if (!(NOTE_KINDS as readonly unknown[]).includes(n.markKind)) return ['unknown note kind'];
  if (typeof n.markAxis !== 'string' || n.markAxis.length === 0) return ['note needs an axis'];
  if (!Array.isArray(n.markVia) || !n.markVia.every(r => typeof r === 'string' && isWellFormedId(r))) return ['note waypoints must be region ids'];
  const place = n.markKind === 'focus' || n.markKind === 'avoid';
  if (place ? typeof n.markRegion !== 'string' || !isWellFormedId(n.markRegion) : n.markRegion !== null) return ['note region is required only for focus or avoid'];
  if (n.markKind === 'via' ? n.markVia.length === 0 : n.markVia.length !== 0) return ['waypoints are required only for via'];
  if (n.markKind === 'wait' ? !Number.isSafeInteger(n.markDays) || n.markDays! < 0 : n.markDays !== null) return ['whole nonnegative days are required only for wait'];
  return [];
}

/** Copy only the grammar's fields, keeping seat objects out of the log. */
export function copyNote(n: PlanNote): PlanNote {
  return { markKind: n.markKind, markAxis: n.markAxis, markRegion: n.markRegion, markVia: [...n.markVia], markDays: n.markDays };
}
