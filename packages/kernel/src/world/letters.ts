/** An authored instruction's identity, independent of any courier journey. */
export interface LetterIdentity {
  readonly namespace: string;
  readonly key: string;
  readonly revision: number;
}

export function letterKey(letter: LetterIdentity): string {
  return `${letter.namespace}.${letter.key}.${letter.revision}`;
}

export function sameLetterFamily(a: LetterIdentity, b: LetterIdentity): boolean {
  return a.namespace === b.namespace && a.key === b.key;
}

export function isLetterIdentity(value: unknown): value is LetterIdentity {
  if (typeof value !== 'object' || value === null) return false;
  const letter = value as Partial<LetterIdentity>;
  const token = /^[a-z][a-z0-9_]*$/;
  return Object.keys(letter).length === 3 && typeof letter.namespace === 'string' && token.test(letter.namespace) &&
    typeof letter.key === 'string' && token.test(letter.key) && typeof letter.revision === 'number' &&
    Number.isSafeInteger(letter.revision) && letter.revision >= 1;
}
