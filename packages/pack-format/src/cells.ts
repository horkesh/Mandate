/**
 * Cell grammars for pack source tables. Each parser returns a value or a
 * problem in words; the table reader turns problems into issues with the row
 * and column. Lists use `;`. The word `unknown` (or `needs-source`) marks a
 * value no source gives, in the columns that allow it.
 */
import { ids, world as w } from '@mandate/kernel';

export type Cell<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly problem: string; readonly expected: string };

const ok = <T>(value: T): Cell<T> => ({ ok: true, value });
const bad = <T>(problem: string, expected: string): Cell<T> => ({ ok: false, problem, expected });

export const UNKNOWN_MARKERS = ['unknown', 'needs-source'] as const;
export function isUnknownMarker(raw: string): boolean {
  return (UNKNOWN_MARKERS as readonly string[]).includes(raw.trim().toLowerCase());
}

export function list(raw: string, separator = ';'): string[] {
  return raw
    .split(separator)
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

export function parseId(raw: string): Cell<string> {
  const s = raw.trim();
  return ids.isWellFormedId(s) ? ok(s) : bad(`"${s}" is not a well-formed id`, 'a letter or digit, then letters, digits and _ . : / - (no spaces)');
}

export function parseInt10(raw: string): Cell<number> {
  const s = raw.trim().replace(/_/g, '');
  if (!/^-?\d+$/.test(s)) return bad(`"${raw.trim()}" is not a whole number`, 'digits only, such as 12');
  const n = Number(s);
  return Number.isSafeInteger(n) ? ok(n) : bad(`"${raw.trim()}" is too large`, 'a whole number below 2^53');
}

export function parseBool(raw: string): Cell<boolean> {
  const s = raw.trim().toLowerCase();
  if (s === '' || s === 'no' || s === 'false') return ok(false);
  if (s === 'yes' || s === 'true') return ok(true);
  return bad(`"${raw.trim()}" is not yes or no`, 'yes, no or empty');
}

/** A decimal degree with up to six places, as integer microdegrees, without floating point. */
export function parseDegrees(raw: string): Cell<number> {
  const m = /^(-?)(\d{1,3})(?:\.(\d{1,6}))?$/.exec(raw.trim());
  if (!m) return bad(`"${raw.trim()}" is not a decimal degree`, 'a number such as -77.03, at most six decimal places');
  const value = Number(m[2]) * 1_000_000 + Number((m[3] ?? '').padEnd(6, '0'));
  return ok(m[1] === '-' ? -value : value);
}

/** `lon lat` or `lon,lat`, in decimal degrees. */
export function parsePoint(raw: string): Cell<w.GeoPoint> {
  const parts = raw.trim().split(/[\s,]+/).filter((p) => p !== '');
  if (parts.length !== 2) return bad(`"${raw.trim()}" is not a point`, 'longitude and latitude, such as "-77.03 38.90"');
  const lon = parseDegrees(parts[0]!);
  const lat = parseDegrees(parts[1]!);
  if (!lon.ok) return lon;
  if (!lat.ok) return lat;
  return ok({ lonE6: lon.value, latE6: lat.value });
}

/** Months as `4-9` (a range, which may wrap: `12-3`), `6+7+8`, or a mix; returned ascending. */
export function parseMonths(raw: string): Cell<number[]> {
  const out = new Set<number>();
  for (const part of raw.split('+').map((s) => s.trim())) {
    const range = /^(\d{1,2})-(\d{1,2})$/.exec(part);
    const single = /^(\d{1,2})$/.exec(part);
    if (range) {
      const a = Number(range[1]);
      const b = Number(range[2]);
      if (a < 1 || a > 12 || b < 1 || b > 12) return bad(`"${part}" is not a month range`, 'months 1 to 12');
      for (let m = a; ; m = (m % 12) + 1) {
        out.add(m);
        if (m === b) break;
      }
    } else if (single) {
      const m = Number(single[1]);
      if (m < 1 || m > 12) return bad(`"${part}" is not a month`, 'months 1 to 12');
      out.add(m);
    } else return bad(`"${part}" is not a month or range`, 'months such as 7-10, 12-3 or 6+7+8');
  }
  return ok([...out].sort((x, y) => x - y));
}

/**
 * The `seasonal` cell: `reason[:months[:depthFeet]]` items, or `none`. Without
 * months the pack's default months for the reason apply.
 */
export function parseSeasons(raw: string, rules: w.WorldRules): Cell<w.SeasonWindow[]> {
  const items = list(raw);
  if (items.length === 1 && items[0]!.toLowerCase() === 'none') return ok([]);
  const out: w.SeasonWindow[] = [];
  for (const item of items) {
    const [reason, months, depth, ...extra] = item.split(':').map((s) => s.trim());
    if (extra.length > 0 || !(w.SEASON_REASONS as readonly string[]).includes(reason ?? '')) {
      return bad(`"${item}" is not a season entry`, `reason[:months[:depth]] with reason one of ${w.SEASON_REASONS.join(', ')}, or none`);
    }
    const r = reason as w.SeasonReason;
    let ms: number[];
    if (months === undefined || months === '') {
      const effect = rules.seasons.find((s) => s.reason === r);
      if (!effect) return bad(`"${r}" has no default months in the pack's rules`, 'months, or a season effect for it in pack.json');
      ms = [...effect.defaultMonths];
    } else {
      const parsed = parseMonths(months);
      if (!parsed.ok) return parsed;
      ms = parsed.value;
    }
    let depthFeet: number | null = null;
    if (depth !== undefined && depth !== '') {
      const d = parseInt10(depth);
      if (!d.ok) return d;
      depthFeet = d.value;
    }
    out.push({ reason: r, months: ms, depthFeet });
  }
  return ok(out);
}

/**
 * One citation: the longest source key in PROVENANCE.json that starts the
 * text, then the place in the source. `OR I-1 p.489` cites `OR I-1` at
 * `p.489`. Text matching no key is kept whole as the key, so the validator can
 * report it as an unknown source.
 */
export function parseCitation(raw: string, sourceKeys: readonly string[]): w.Citation {
  const s = raw.trim();
  let best = '';
  for (const key of sourceKeys) {
    if (key.length > best.length && s.startsWith(key) && (s.length === key.length || /[\s,;(]/.test(s[key.length]!))) best = key;
  }
  if (best === '') return { source: s, at: null };
  const at = s
    .slice(best.length)
    .replace(/^[\s,]+/, '')
    .trim();
  return { source: best, at: at === '' ? null : at };
}

/** Split on a separator that is not inside parentheses: `KEY (a; b); KEY2` is two citations. */
export function splitOutsideParens(raw: string, separator: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of raw) {
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    if (ch === separator && depth === 0) {
      out.push(cur);
      cur = '';
    } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter((s) => s !== '');
}

export function parseCitations(raw: string, sourceKeys: readonly string[], separator = ';'): w.Citation[] {
  return splitOutsideParens(raw, separator).map((c) => parseCitation(c, sourceKeys));
}

/** A stat centre: `direction[:citation+citation]`, or `unknown`. */
export function parseCentre(raw: string, sourceKeys: readonly string[]): Cell<w.StatCentre> {
  const s = raw.trim();
  if (s === '' || isUnknownMarker(s)) return ok({ direction: null, cites: [] });
  const colon = s.indexOf(':');
  const direction = (colon === -1 ? s : s.slice(0, colon)).trim();
  if (!(w.STAT_DIRECTIONS as readonly string[]).includes(direction)) {
    return bad(`"${direction}" is not a direction`, `${w.STAT_DIRECTIONS.join(', ')} or unknown, then :citations joined by +`);
  }
  const cites = colon === -1 ? [] : parseCitations(s.slice(colon + 1), sourceKeys, '+');
  return ok({ direction: direction as w.StatDirection, cites });
}

/** Traits: `trait:citation+citation` items. */
export function parseTraits(raw: string, sourceKeys: readonly string[]): Cell<w.TraitEvidence[]> {
  const out: w.TraitEvidence[] = [];
  for (const item of list(raw)) {
    const colon = item.indexOf(':');
    const trait = (colon === -1 ? item : item.slice(0, colon)).trim();
    if (!ids.isWellFormedId(trait)) return bad(`"${trait}" is not a trait id`, 'trait:citation+citation');
    out.push({ trait, cites: colon === -1 ? [] : parseCitations(item.slice(colon + 1), sourceKeys, '+') });
  }
  return ok(out);
}

/** Values (lane 1.1): `value:citation+citation` items, as traits are written. */
export function parseValues(raw: string, sourceKeys: readonly string[]): Cell<w.ValueEvidence[]> {
  const out: w.ValueEvidence[] = [];
  for (const item of list(raw)) {
    const colon = item.indexOf(':');
    const value = (colon === -1 ? item : item.slice(0, colon)).trim();
    if (!ids.isWellFormedId(value)) return bad(`"${value}" is not a value id`, 'value:citation+citation');
    out.push({ value, cites: colon === -1 ? [] : parseCitations(item.slice(colon + 1), sourceKeys, '+') });
  }
  return ok(out);
}

/** His own practices (lane 1.5b): `practice:citation+citation` items. */
export function parsePractices(raw: string, sourceKeys: readonly string[]): Cell<w.PersonRecord['practices'][number][]> {
  const out: w.PersonRecord['practices'][number][] = [];
  for (const item of list(raw)) {
    const colon = item.indexOf(':');
    const practice = (colon === -1 ? item : item.slice(0, colon)).trim();
    if (!ids.isWellFormedId(practice)) return bad(`"${practice}" is not a practice id`, 'practice:citation+citation');
    out.push({ practice, cites: colon === -1 ? [] : parseCitations(item.slice(colon + 1), sourceKeys, '+') });
  }
  return ok(out);
}

/** Regard for others (lane 1.5): `person:direction:citation+citation` items. */
export function parseRegardOthers(raw: string, sourceKeys: readonly string[]): Cell<w.PersonRecord['regardOthers'][number][]> {
  const out: w.PersonRecord['regardOthers'][number][] = [];
  for (const item of list(raw)) {
    const m = /^([^:\s]+)\s*:\s*([a-z]+)(?:\s*:(.*))?$/.exec(item);
    if (m === null || !ids.isWellFormedId(m[1]!)) return bad(`"${item}" is not a regard entry`, 'person:direction:citation+citation');
    if (!(w.STAT_DIRECTIONS as readonly string[]).includes(m[2]!)) return bad(`"${m[2]}" is not a direction`, w.STAT_DIRECTIONS.join(', '));
    out.push({ toward: m[1]! as never, direction: m[2]! as w.StatDirection, cites: m[3] === undefined ? [] : parseCitations(m[3], sourceKeys, '+') });
  }
  return ok(out);
}

/** Ranks: `rank:date` items, in date order. */
export function parseRanks(raw: string): Cell<w.RankHeld[]> {
  const out: w.RankHeld[] = [];
  for (const item of list(raw)) {
    const m = /^([^:\s]+)\s*:\s*(\S+)$/.exec(item);
    if (!m) return bad(`"${item}" is not a rank entry`, 'rank:YYYY-MM-DD (or YYYY-MM, YYYY)');
    out.push({ rank: m[1]!, from: m[2]! });
  }
  return ok(out);
}

/** Control shares: `faction:permille` items. */
export function parseShares(raw: string): Cell<w.ControlShare[]> {
  const out: w.ControlShare[] = [];
  for (const item of list(raw)) {
    const m = /^([^:\s]+)\s*:\s*(\d+)$/.exec(item);
    if (!m) return bad(`"${item}" is not a control share`, 'faction:permille, such as north:1000');
    out.push({ faction: m[1]! as w.ControlShare['faction'], permille: Number(m[2]) });
  }
  return ok(out);
}
