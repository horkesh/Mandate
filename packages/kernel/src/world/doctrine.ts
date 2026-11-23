/** References and shape rules shared by world indexing and pack validation for conditional doctrine. */
import type { RegionId } from '../ids.ts';
import { DISCRETION_CONDITIONS, MAX_FALLBACKS, type Discretion, type Posture } from '../plans/goal.ts';
import { daysFromCivil, parseIsoDate } from './calendar.ts';
import type { PrincipalDoctrine } from './world.ts';

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
