/** References and shape rules shared by world indexing and pack validation for conditional doctrine. */
import type { RegionId } from '../ids.ts';
import { strictCompare } from '../compare.ts';
import type { GoalTerms } from '../log/commands.ts';
import { DISCRETION_CONDITIONS, MAX_FALLBACKS, type Discretion, type Posture } from '../plans/goal.ts';
import { daysFromCivil, parseIsoDate } from './calendar.ts';
import { isLetterIdentity, letterKey, sameLetterFamily, type LetterIdentity } from './letters.ts';
import type { DoctrineOffensive, PrincipalDoctrine } from './world.ts';

export function letterDependencies(row: DoctrineOffensive): readonly LetterIdentity[] {
  return [...(row.dependsOn ?? []), ...(row.supersedes === undefined ? [] : [row.supersedes]), ...(row.repeats === undefined ? [] : [row.repeats])];
}

/** Topological order, with the earliest source date and stable key breaking ties among independent papers. */
export function orderedLetters(rows: readonly DoctrineOffensive[]): DoctrineOffensive[] {
  const pending = rows.filter(o => o.letter !== undefined).sort((a, b) => strictCompare(a.fromDate, b.fromDate) || strictCompare(letterKey(a.letter!), letterKey(b.letter!)));
  const ordered: DoctrineOffensive[] = [];
  const emitted = new Set<string>();
  while (pending.length > 0) {
    const next = pending.findIndex(o => letterDependencies(o).every(d => emitted.has(letterKey(d))));
    if (next < 0) break;
    const [row] = pending.splice(next, 1);
    ordered.push(row!);
    emitted.add(letterKey(row!.letter!));
  }
  return ordered;
}

/** The enclosure the declaration authorizes, including all pack defaults and recursive fallback terms. */
export function authoredGoal(row: DoctrineOffensive, defaults: Omit<GoalTerms, 'objective' | 'posture' | 'committed' | 'discretion'>, crossNeutral: boolean): GoalTerms {
  const goal = (term: Fallback): GoalTerms => ({ ...defaults, neutral: defaults.neutral || crossNeutral,
    objective: term.objective, posture: term.posture, committed: [],
    ...(term.discretion === undefined ? {} : { discretion: { condition: term.discretion.condition, fallback: goal(term.discretion.fallback) } }),
  });
  return goal({ ...row, posture: row.posture ?? 'take' });
}

interface Fallback {
  readonly objective: RegionId | null;
  readonly posture: Posture;
  readonly discretion?: Discretion<Fallback>;
}

export function conditionalDoctrineProblems(row: PrincipalDoctrine, hasRegion: (id: RegionId) => boolean): { field: string; message: string }[] {
  const problems: { field: string; message: string }[] = [];
  const add = (field: string, message: string) => problems.push({ field, message });
  const ids = new Set<string>();
  function reserve(id: string, field: string): void {
    if (ids.has(id)) add(field, `duplicate doctrine letter id ${id}`);
    ids.add(id);
  }
  function checkGoal(goal: Fallback, field: string, depth: number): void {
    if (goal.objective === null ? goal.posture !== 'hold' : !hasRegion(goal.objective)) add(field, 'objective must be a known region or null for a hold');
    const grant = goal.discretion;
    if (grant === undefined) return;
    if (depth >= MAX_FALLBACKS) add(field, `at most ${MAX_FALLBACKS} fallbacks`);
    else {
      if (!DISCRETION_CONDITIONS.includes(grant.condition)) add(`${field}.discretion`, 'unknown discretion condition');
      checkGoal(grant.fallback, `${field}.discretion.fallback`, depth + 1);
    }
  }
  for (const [i, o] of row.offensives.entries()) {
    if (o.id !== undefined) reserve(o.id, `offensives[${i}].id`);
    if (o.discretion !== undefined) checkGoal({ ...o, posture: o.posture ?? 'take' }, `offensives[${i}]`, 0);
  }
  const letters = new Map<string, DoctrineOffensive>();
  for (const [i, o] of row.offensives.entries()) {
    const field = `offensives[${i}]`;
    if (o.letter === undefined) {
      if (letterDependencies(o).length > 0) add(field, 'letter references require an authored identity');
      continue;
    }
    if (!isLetterIdentity(o.letter)) {
      add(`${field}.letter`, 'invalid authored letter identity');
      continue;
    }
    if (o.letter.namespace !== row.letterNamespace) add(`${field}.letter`, 'letter namespace must match the issuer doctrine namespace');
    if (o.id !== undefined) add(`${field}.id`, 'an authored letter uses its identity without a legacy id');
    if (!o.source.trim()) add(`${field}.source`, 'an authored letter needs a source');
    const key = letterKey(o.letter);
    if (letters.has(key)) add(`${field}.letter`, `duplicate authored letter ${key}`);
    letters.set(key, o);
  }
  for (const [i, o] of row.offensives.entries()) {
    if (!isLetterIdentity(o.letter)) continue;
    const field = `offensives[${i}]`;
    const rev = o.supersedes === undefined ? undefined : letters.get(letterKey(o.supersedes));
    if (o.letter.revision === 1 ? o.supersedes !== undefined : rev?.letter === undefined || rev.post !== o.post ||
      !sameLetterFamily(o.letter, rev.letter) || rev.letter.revision !== o.letter.revision - 1 || rev.fromDate > o.fromDate) {
      add(`${field}.supersedes`, 'a revision must supersede its immediately preceding revision to the same post');
    }
    if (o.repeats !== undefined) {
      const earlier = letters.get(letterKey(o.repeats));
      if (earlier?.letter === undefined || earlier.post !== o.post || earlier.fromDate > o.fromDate || sameLetterFamily(o.letter, earlier.letter)) {
        add(`${field}.repeats`, 'a sourced repeat must name a different earlier letter to the same post');
      }
    }
    for (const d of o.dependsOn ?? []) if (!isLetterIdentity(d) || !letters.has(letterKey(d))) add(`${field}.dependsOn`, 'missing authored dependency');
  }
  if (problems.length === 0 && orderedLetters(row.offensives).length !== letters.size) add('offensives', 'cyclic authored letter dependencies');
  const answers = new Set<string>();
  for (const [i, a] of (row.proposalAnswers ?? []).entries()) {
    const field = `proposalAnswers[${i}]`;
    reserve(a.id, `${field}.id`);
    if (!a.source.trim()) add(`${field}.source`, 'a sourced reply needs a citation');
    if (answers.has(a.answers)) add(`${field}.answers`, 'one sourced answer may name this letter');
    answers.add(a.answers);
    const ordered = row.offensives.find(o => o.id === a.answers && o.post === a.post);
    if (ordered === undefined) add(`${field}.answers`, 'must name an identified goal to this post');
    else {
      try {
        if (daysFromCivil(parseIsoDate(a.fromDate)) < daysFromCivil(parseIsoDate(ordered.fromDate))) add(`${field}.fromDate`, 'a reply cannot precede the goal it answers');
      } catch {
        add(`${field}.fromDate`, 'invalid date in the correspondence');
      }
    }
    if (a.action !== 'discretion') continue;
    if ((a.objective === undefined) !== (a.posture === undefined)) add(field, 'a replacement primary goal needs both an objective and a posture');
    checkGoal({ objective: a.objective === undefined ? ordered?.objective ?? null : a.objective,
      posture: a.posture ?? ordered?.posture ?? (ordered === undefined ? 'hold' : 'take'), discretion: a.discretion }, field, 0);
  }
  return problems;
}
