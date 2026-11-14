/**
 * Canonical JSON (FOUNDATION sections 10 and 11.1; decision 0035).
 *
 * One value has exactly one canonical text, on every engine and platform:
 * - object keys in strict code-unit order (decision 0002), never insertion order;
 * - numbers must be safe integers (state is integer permille; no floats, NaN or
 *   infinities); `-0` is written as `0`;
 * - no `undefined` anywhere, including as an object property value: an absent
 *   field is absent, not undefined;
 * - only plain objects, arrays, strings, booleans and `null`. Maps, Sets,
 *   class instances, functions, symbols and bigints are rejected, so derived
 *   caches and helpers cannot slip into a save or a hash;
 * - no cycles; no whitespace.
 *
 * The state hash is computed over this text, never over compressed bytes.
 */
import { strictCompare } from '../compare.ts';

export type CanonicalValue =
  | null
  | boolean
  | number
  | string
  | readonly CanonicalValue[]
  | { readonly [key: string]: CanonicalValue };

/** Thrown when a value cannot be written canonically. `path` points at the bad part, e.g. `$.regions.r1.loyalty`. */
export class CanonicalError extends Error {
  constructor(
    readonly path: string,
    readonly problem: string,
  ) {
    super(`not canonical at ${path}: ${problem}`);
    this.name = 'CanonicalError';
  }
}

/** The canonical JSON text of `value`. Throws `CanonicalError` on anything non-canonical. */
export function canonicalJson(value: unknown): string {
  const out: string[] = [];
  write(value, '$', out, []);
  return out.join('');
}

/**
 * Parse JSON text and check that every value in it can be written
 * canonically (integers only, plain data). Returns the parsed value.
 */
export function parseCanonical(text: string): CanonicalValue {
  const value: unknown = JSON.parse(text);
  canonicalJson(value);
  return value as CanonicalValue;
}

/** Whether `text` is exactly the canonical form of what it encodes. */
export function isCanonicalText(text: string): boolean {
  try {
    return canonicalJson(JSON.parse(text)) === text;
  } catch {
    return false;
  }
}

function write(value: unknown, path: string, out: string[], ancestors: object[]): void {
  if (value === null) {
    out.push('null');
    return;
  }
  switch (typeof value) {
    case 'boolean':
      out.push(value ? 'true' : 'false');
      return;
    case 'string':
      out.push(JSON.stringify(value));
      return;
    case 'number':
      if (!Number.isSafeInteger(value)) {
        throw new CanonicalError(path, `number ${String(value)} is not a safe integer`);
      }
      out.push(value === 0 ? '0' : String(value));
      return;
    case 'undefined':
      throw new CanonicalError(path, 'undefined (omit the field instead)');
    case 'bigint':
    case 'symbol':
    case 'function':
      throw new CanonicalError(path, `${typeof value} is not serializable`);
    case 'object':
      break;
    default:
      throw new CanonicalError(path, `unsupported type ${typeof value}`);
  }

  const obj = value as object;
  if (ancestors.includes(obj)) throw new CanonicalError(path, 'cycle');
  ancestors.push(obj);

  if (Object.getOwnPropertySymbols(obj).length > 0) throw new CanonicalError(path, 'symbol keys');
  // Every own property is written, so nothing may be hidden from the text:
  // no non-enumerable properties, no extra array properties, and no getters
  // or setters on objects (which would run code, or silently drop a value).
  const names = Object.getOwnPropertyNames(obj);

  if (Array.isArray(obj)) {
    // An intact array's own names are its indices plus `length`. Anything
    // else is a hole or a non-index property. (An accessor on an index needs
    // Object.defineProperty, which deterministic packages may not call.)
    if (names.length !== obj.length + 1) {
      for (let i = 0; i < obj.length; i++) {
        if (!Object.prototype.hasOwnProperty.call(obj, i)) throw new CanonicalError(`${path}[${i}]`, 'hole in array');
      }
      const extra = names.find((n) => n !== 'length' && !/^(0|[1-9]\d*)$/.test(n));
      throw new CanonicalError(path, `array has a non-index property "${extra ?? '?'}"`);
    }
    out.push('[');
    for (let i = 0; i < obj.length; i++) {
      if (i > 0) out.push(',');
      write(obj[i], `${path}[${i}]`, out, ancestors);
    }
    out.push(']');
  } else {
    const proto: unknown = Object.getPrototypeOf(obj);
    if (proto !== Object.prototype && proto !== null) {
      const name = (obj as { constructor?: { name?: string } }).constructor?.name ?? 'unknown';
      throw new CanonicalError(path, `${name} is not a plain object`);
    }
    const record = obj as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length !== names.length) {
      const hidden = names.find((n) => !Object.prototype.propertyIsEnumerable.call(record, n));
      throw new CanonicalError(`${path}.${hidden ?? '?'}`, 'non-enumerable property');
    }
    keys.sort(strictCompare);
    out.push('{');
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]!;
      const d = Object.getOwnPropertyDescriptor(record, key)!;
      if (d.get || d.set) throw new CanonicalError(`${path}.${key}`, 'accessor property');
      if (i > 0) out.push(',');
      out.push(JSON.stringify(key), ':');
      write(d.value, `${path}.${key}`, out, ancestors);
    }
    out.push('}');
  }

  ancestors.pop();
}
