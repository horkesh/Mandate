/**
 * The generated files' layout: canonical JSON (sorted keys, integers only;
 * decision 0044), broken into lines so a diff shows which record changed. The
 * top object has one key per line, a table has one record per line, and each
 * record is a canonical JSON line. Parsing a file and hashing it gives the
 * same hash as hashing the value it was written from.
 */
import { canonicalJson } from '@mandate/kernel';

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function layout(value: unknown, depth: number): string {
  if (Array.isArray(value) && value.length > 0 && depth < 3 && value.every(isPlainObject)) {
    return `[\n${value.map((v) => canonicalJson(v)).join(',\n')}\n]`;
  }
  if (isPlainObject(value) && depth < 2 && Object.keys(value).length > 0) {
    const keys = Object.keys(value).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    return `{\n${keys.map((k) => `${JSON.stringify(k)}: ${layout(value[k], depth + 1)}`).join(',\n')}\n}`;
  }
  return canonicalJson(value);
}

export function formatGenerated(value: unknown): string {
  return `${layout(value, 0)}\n`;
}
