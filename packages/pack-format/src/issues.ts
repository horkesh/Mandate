/**
 * Validation issues a modder can read (decision 0030): the file, the place in
 * it (a CSV row and column, or a JSON path), what is wrong and what is
 * expected. Every check reports a typed `kind`, so a report can be counted by
 * kind (the fit test) and a test can assert exactly which check fired.
 */

export type Severity = 'error' | 'warning';

export interface Issue {
  readonly severity: Severity;
  readonly kind: string;
  /** Pack-relative path, forward slashes. */
  readonly file: string;
  /** `row 12, column terrain`, or a JSON path such as `regions[3].terrain`; empty for the whole file. */
  readonly at: string;
  readonly message: string;
  readonly expected?: string;
}

export function formatIssue(i: Issue): string {
  const where = i.at ? `${i.file} (${i.at})` : i.file;
  const expected = i.expected ? ` Expected: ${i.expected}.` : '';
  return `${i.severity} [${i.kind}] ${where}: ${i.message}.${expected}`;
}

export function errorsOf(issues: readonly Issue[]): Issue[] {
  return issues.filter((i) => i.severity === 'error');
}

/** Counts by severity and kind, in a stable order: `error unknown-reference` -> 12. */
export function countByKind(issues: readonly Issue[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const i of issues) {
    const key = `${i.severity} ${i.kind}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
}

/** Collects issues for one file. */
export class IssueSink {
  readonly issues: Issue[] = [];

  error(kind: string, file: string, at: string, message: string, expected?: string): void {
    this.issues.push(expected === undefined ? { severity: 'error', kind, file, at, message } : { severity: 'error', kind, file, at, message, expected });
  }

  warn(kind: string, file: string, at: string, message: string, expected?: string): void {
    this.issues.push(expected === undefined ? { severity: 'warning', kind, file, at, message } : { severity: 'warning', kind, file, at, message, expected });
  }

  add(issues: readonly Issue[]): void {
    this.issues.push(...issues);
  }
}
