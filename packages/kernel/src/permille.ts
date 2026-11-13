/**
 * Integer fixed-point arithmetic on the permille scale (decision 0002).
 *
 * All simulation math is integer. A `Permille` is an integer in 0..1000; a
 * `SignedPermille` is an integer in -1000..1000. There is exactly one rounding
 * rule: truncate toward zero.
 */

export type Permille = number;
export type SignedPermille = number;

export const PERMILLE_MAX = 1000;

export function clamp(value: number, lo: number, hi: number): number {
  return value < lo ? lo : value > hi ? hi : value;
}

export function clampPermille(value: number): Permille {
  return clamp(value, 0, PERMILLE_MAX);
}

export function clampSignedPermille(value: number): SignedPermille {
  return clamp(value, -PERMILLE_MAX, PERMILLE_MAX);
}

/** `value * weight / 1000`, truncated toward zero. */
export function scale(value: number, weight: Permille): number {
  return Math.trunc((value * weight) / PERMILLE_MAX);
}

export function isInteger(value: number): boolean {
  return Number.isSafeInteger(value);
}

export function assertPermille(value: number, label: string): void {
  if (!isInteger(value) || value < 0 || value > PERMILLE_MAX) {
    throw new RangeError(`${label} must be an integer permille in 0..1000, got ${value}`);
  }
}

export function assertSignedPermille(value: number, label: string): void {
  if (!isInteger(value) || value < -PERMILLE_MAX || value > PERMILLE_MAX) {
    throw new RangeError(`${label} must be an integer in -1000..1000, got ${value}`);
  }
}
