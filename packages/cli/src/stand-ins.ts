/**
 * The stand-ins criterion of 1A's done check (FOUNDATION section 12; lane 1.14): the eight stand-ins Phase 0 labelled
 * for Phase 1 are gone, and any stand-in left in the code is labelled and owned by a 1B lane (risk 3).
 *
 * It reads the code's labels. A label is written `STAND-IN(<key>; owner: <lane>; <decision>...)`: the key names one of
 * Phase 0's eight when it is one (any other stand-in has none), and the owner is the lane that replaces it. The check:
 * - every label in `packages/<pkg>/src` names an owner, and that owner is a 1B lane;
 * - each of the eight is gone (no label names it, and the code that betrayed it, where there is a tell, is absent) or
 *   labelled, and then its owner must be a 1B lane like any other.
 * A stand-in left unlabelled is the one thing a label check cannot see; the tells catch the ones that had a name.
 *
 * Pack values carried from M2 (a rule group's `cite` saying "M2's") are listed beside it, for calibration (lane 1.6's
 * standing review, item 5). They are data, not code, so they are evidence here, never a problem.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('../../../', import.meta.url));

export interface PhaseZeroStandIn {
  readonly key: string;
  readonly name: string;
  /** What retired it (a lane and its decision), or null while it is still meant to be in the code. */
  readonly retiredBy: string | null;
  /** Code that would betray it back, unlabelled: absent from every source file once it is gone. */
  readonly tell: RegExp | null;
}

/** FOUNDATION section 12's eight, with what retired each and the names it went by. */
export const PHASE0_STAND_INS: readonly PhaseZeroStandIn[] = [
  { key: 'standing-goals', name: 'standing goals', retiredBy: 'lane 1.4’s operations (4a64082)', tell: /\bStandingMenu\b|\bstandingGoal\w*\(/ },
  { key: 'consistency-judgement', name: 'the consistency judgement', retiredBy: 'lane 1.2’s planner (0062)', tell: /\bconsistencyJudg\w*|\bjudgeConsistency\b/ },
  { key: 'trait-adapter', name: 'the trait adapter', retiredBy: 'lane 1.1’s people recast (`standin/traits.ts` deleted)', tell: /from '\.{1,2}\/(?:\.\.\/)*standin\// },
  { key: 'weakest-first', name: 'weakest-first transfers', retiredBy: 'lane 1.5’s people verbs (0079: the sender’s answer picks the blocks)', tell: null },
  { key: 'conflicts-by-department', name: 'conflicts resolved by department', retiredBy: 'lane 1.1’s compliance (`resolveConflict`)', tell: null },
  { key: 'simple-contest', name: 'the simple contest', retiredBy: 'lane 1.3’s battle model (0076)', tell: /\bcontestPermille\b|combat\/contest\.ts/ },
  { key: 'generic-principal', name: 'the generic rule-seat principal', retiredBy: null, tell: null },
  { key: 'capital-objective', name: 'the capital as objective', retiredBy: null, tell: null },
];

export interface StandInLabel {
  readonly file: string;
  readonly line: number;
  readonly key: string | null;
  readonly owner: string | null;
  readonly text: string;
}

/** This checker, which spells the label and the tells out, and so is never scanned. */
export const STAND_IN_CHECKER = 'packages/cli/src/stand-ins.ts';

/** Every `.ts` file under each `packages/<pkg>/src`, repository-relative, but the checker's own. */
export function sourceFiles(root: string = REPO): string[] {
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith('.ts')) out.push(relative(root, full).split('\\').join('/'));
    }
  };
  const packages = join(root, 'packages');
  if (!existsSync(packages)) return out;
  for (const pkg of readdirSync(packages, { withFileTypes: true })) {
    const src = join(packages, pkg.name, 'src');
    if (pkg.isDirectory() && existsSync(src)) walk(src);
  }
  return out.filter((f) => f !== STAND_IN_CHECKER).sort();
}

const KEYS = new Set(PHASE0_STAND_INS.map((s) => s.key));

/** The labels in one file's text. */
export function labelsIn(file: string, text: string): StandInLabel[] {
  const out: StandInLabel[] = [];
  text.split('\n').forEach((lineText, i) => {
    for (const m of lineText.matchAll(/STAND-IN(?:\(([^)]*)\))?/g)) {
      const parts = (m[1] ?? '').split(';').map((p) => p.trim()).filter((p) => p.length > 0);
      const owner = parts.find((p) => p.startsWith('owner:'))?.slice('owner:'.length).trim() ?? null;
      const key = parts.find((p) => KEYS.has(p)) ?? null;
      out.push({ file, line: i + 1, key, owner, text: lineText.trim() });
    }
  });
  return out;
}

/** An owner is a 1B lane when it names 1B. */
export const ownedBy1B = (owner: string | null): boolean => owner !== null && /\b1B\b/.test(owner);

export interface StandInReport {
  readonly problems: readonly string[];
  readonly evidence: readonly string[];
}

/** The criterion over the code at `root`, and the pack rules' cites read for values carried from M2. */
export function standInReport(root: string = REPO, m2Values: readonly string[] = []): StandInReport {
  const problems: string[] = [];
  const evidence: string[] = [];
  const files = sourceFiles(root);
  const labels: StandInLabel[] = [];
  const texts = new Map<string, string>();
  for (const f of files) {
    const text = readFileSync(join(root, f), 'utf8');
    texts.set(f, text);
    labels.push(...labelsIn(f, text));
  }
  for (const l of labels) {
    const where = `${l.file}:${l.line}`;
    if (l.owner === null) problems.push(`${where}: a stand-in with no owner (write STAND-IN(<key>; owner: <lane>))`);
    else if (!ownedBy1B(l.owner)) problems.push(`${where}: a stand-in owned by ${l.owner}, not a 1B lane${l.key === null ? '' : ` (${PHASE0_STAND_INS.find((s) => s.key === l.key)!.name})`}`);
  }
  for (const s of PHASE0_STAND_INS) {
    const labelled = labels.filter((l) => l.key === s.key);
    const tells: string[] = [];
    if (s.tell !== null) {
      for (const [f, text] of texts) {
        text.split('\n').forEach((line, i) => {
          if (s.tell!.test(line) && !line.includes('STAND-IN')) tells.push(`${f}:${i + 1}`);
        });
      }
    }
    if (tells.length > 0) problems.push(`${s.name} is back, unlabelled, at ${tells.join(', ')}`);
    if (labelled.length > 0) {
      const owners = [...new Set(labelled.map((l) => l.owner ?? 'no owner'))].join(', ');
      evidence.push(`${s.name}: still in the code, labelled at ${labelled.map((l) => `${l.file}:${l.line}`).join(', ')} (owner ${owners})`);
    } else if (s.retiredBy === null) {
      evidence.push(`${s.name}: no label names it, so it is gone`);
    } else {
      evidence.push(`${s.name}: gone (${s.retiredBy})`);
    }
  }
  const others = labels.filter((l) => l.key === null);
  if (others.length > 0) evidence.push(`other stand-ins: ${others.map((l) => `${l.file}:${l.line} (owner ${l.owner ?? 'none'})`).join(', ')}`);
  if (m2Values.length > 0) evidence.push(`pack values carried from M2, for calibration: ${m2Values.join(', ')}`);
  return { problems, evidence };
}

/** Pack rule groups whose `cite` says the values were carried from M2: their paths in the pack's rules. */
export function m2CarriedValues(rules: unknown, path = 'rules'): string[] {
  if (rules === null || typeof rules !== 'object') return [];
  if (Array.isArray(rules)) return rules.flatMap((r, i) => m2CarriedValues(r, `${path}[${i}]`));
  const out: string[] = [];
  for (const [k, v] of Object.entries(rules)) {
    if (k === 'cite' && typeof v === 'string' && /\bM2['’]s\b/.test(v)) out.push(path);
    else out.push(...m2CarriedValues(v, `${path}.${k}`));
  }
  return out;
}
