/** References and shape rules shared by world indexing and pack validation for conditional doctrine. */
import { isWellFormedId, type PersonId, type PostId, type RegionId } from '../ids.ts';
import { strictCompare } from '../compare.ts';
import type { GoalTerms } from '../log/commands.ts';
import { DISCRETION_CONDITIONS, MAX_FALLBACKS, type Discretion, type Posture } from '../plans/goal.ts';
import { daysFromCivil, parseIsoDate } from './calendar.ts';
import { isLetterIdentity, letterKey, sameLetterFamily, type LetterIdentity } from './letters.ts';
import { CLAIM_KINDS, SUBJECT_KINDS } from '../knowledge/report.ts';
import { REPORT_KINDS } from '../knowledge/templates.ts';
import type { DoctrineOffensive, PrincipalDoctrine } from './world.ts';
import type { PaperSelector } from './paper-selectors.ts';

export function letterDependencies(row: DoctrineOffensive): readonly LetterIdentity[] {
  return [...(row.dependsOn ?? []), ...(row.supersedes === undefined ? [] : [row.supersedes]), ...(row.repeats === undefined ? [] : [row.repeats]),
    ...(row.requiresPapers ?? []).flatMap(s => s.kind === 'report' && s.answers !== undefined ? [s.answers] : [])];
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
export function authoredGoal(row: DoctrineOffensive, defaults: Omit<GoalTerms, 'objective' | 'posture' | 'purpose' | 'committed' | 'discretion'>, crossNeutral: boolean): GoalTerms {
  const goal = (term: Fallback): GoalTerms => ({ ...defaults, neutral: defaults.neutral || crossNeutral,
    objective: term.objective, posture: term.posture, committed: [],
    ...(term.discretion === undefined ? {} : { discretion: { condition: term.discretion.condition, fallback: goal(term.discretion.fallback) } }),
  });
  return row.purpose === undefined ? goal({ ...row, posture: row.posture ?? 'take' }) :
    { ...defaults, purpose: row.purpose, committed: [], neutral: false };
}

interface Fallback {
  readonly objective: RegionId | null;
  readonly posture: Posture;
  readonly discretion?: Discretion<Fallback>;
}

interface PaperReferences {
  readonly hasPerson: (person: PersonId) => boolean;
  readonly hasPost?: (post: PostId) => boolean;
  readonly hasLetter?: (issuer: PersonId, letter: LetterIdentity) => boolean;
}

export function conditionalDoctrineProblems(row: PrincipalDoctrine, hasRegion: (id: RegionId) => boolean, references?: PaperReferences): { field: string; message: string }[] {
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
      if (o.supersedes !== undefined || o.repeats !== undefined || (o.dependsOn?.length ?? 0) > 0) add(field, 'letter references require an authored identity');
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
  const questionKeys = new Set<string>();
  for (const [i, q] of (row.consultations ?? []).entries()) {
    const field = `consultations[${i}]`;
    if (!isLetterIdentity(q.letter) || q.letter.namespace !== (row.consultationNamespace ?? row.letterNamespace) || q.letter.revision !== 1) add(field, 'a consultation needs a first-revision letter in its issuer namespace; a changed question is a new round');
    const key = letterKey(q.letter);
    if (questionKeys.has(key) || letters.has(key)) add(field, 'duplicate authored question identity');
    questionKeys.add(key);
    if (!q.question.trim() || !q.source.trim() || !isWellFormedId(q.subject) || !['policy','feasibility'].includes(q.kind)) add(field, 'a question needs its subject, kind, wording and source');
    try { parseIsoDate(q.fromDate); } catch { add(field, 'invalid consultation date'); }
    if (q.advisers.length === 0 || new Set(q.advisers.map(a => a.post)).size !== q.advisers.length || new Set(q.advisers.map(a => a.person)).size !== q.advisers.length ||
      q.advisers.some(a => !isWellFormedId(a.person) || !isWellFormedId(a.post) || references?.hasPerson(a.person) === false || references?.hasPost?.(a.post) === false)) add(field, 'question recipients must be distinct named people and posts');
    const courses = [...q.courses, ...(q.alternatives ?? [])];
    if (q.courses.length === 0 || new Set(courses.map(c => c.id)).size !== courses.length || courses.some(c => !isWellFormedId(c.id) ||
      new Set(c.resources).size !== c.resources.length || c.resources.some(r => !isWellFormedId(r)) ||
      c.honours.some(v => !isWellFormedId(v) || c.opposes.includes(v)) || c.opposes.some(v => !isWellFormedId(v)))) add(field, 'courses and resources must be distinct well-formed terms, with no value both honoured and opposed');
    if (q.kind === 'feasibility' && q.courses.some(c => c.resources.length === 0 || c.assumesPossible)) add(field, 'a feasibility inquiry must assess named resources without assuming success');
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
  const limit = row.maxPaperSelectors;
  if (limit !== undefined && (!Number.isSafeInteger(limit) || limit < 1)) add('maxPaperSelectors', 'the pack receipt selector limit must be a positive integer');
  const validPost = (id: PostId) => isWellFormedId(id) && (references?.hasPost?.(id) ?? true);
  const validPerson = (id: PersonId) => isWellFormedId(id) && (references?.hasPerson(id) ?? true);
  function checkPapers(selectors: readonly PaperSelector[] | undefined, id: string | undefined, field: string): void {
    if (selectors === undefined) return;
    if (id === undefined) add(field, 'requiresPapers belongs on an identified doctrine action');
    if (limit === undefined || selectors.length === 0 || selectors.length > limit) add(field, 'requiresPapers needs a nonempty conjunction within the pack selector limit');
    for (const [i, selector] of selectors.entries()) {
      const here = `${field}[${i}]`;
      if (selector.kind === 'letter') {
        if (!isLetterIdentity(selector.letter) || !validPost(selector.post) || !validPerson(selector.issuer) ||
          references?.hasLetter?.(selector.issuer, selector.letter) === false || (selector.role !== 'relay' && selector.role !== 'addressee')) {
          add(here, 'named paper must identify a declared letter, issuer, receiving post and receipt role');
        }
        continue;
      }
      if (selector.kind !== 'report') {
        add(here, 'requiresPapers permits only named letters and received reports');
        continue;
      }
      if (!validPerson(selector.author) || (selector.authorPost !== null && !validPost(selector.authorPost)) ||
        !SUBJECT_KINDS.includes(selector.subjectKind) || !isWellFormedId(selector.subjectId) ||
        !REPORT_KINDS.some(t => t.type === selector.reportType && t.subtype === selector.reportSubtype)) {
        add(here, 'received report selector must identify a declared author/post, subject and report template');
      }
      if (selector.subjectKind === 'region' && !hasRegion(selector.subjectId as RegionId)) add(here, 'report subject must name a known region');
      if (selector.subjectKind === 'post' && !validPost(selector.subjectId as PostId)) add(here, 'report subject must name a known post');
      if (selector.subjectKind === 'person' && !validPerson(selector.subjectId as PersonId)) add(here, 'report subject must name a known person');
      if (selector.answers !== undefined && (!isLetterIdentity(selector.answers) || (!letters.has(letterKey(selector.answers)) && !questionKeys.has(letterKey(selector.answers))))) add(here, 'correlated report must answer the acting principal’s own declared dispatch');
      if (selector.claims !== undefined && (limit === undefined || selector.claims.length > limit || selector.claims.length === 0)) add(here, 'claim conjunction must be nonempty and within the pack selector limit');
      for (const c of selector.claims ?? []) {
        if (!CLAIM_KINDS.includes(c.kind) || (c.region !== null && !hasRegion(c.region)) || (c.token !== null && !isWellFormedId(c.token))) add(here, 'claim must name a known claim kind, token and region');
        if ((c.min === undefined && c.max === undefined) || (c.min !== undefined && !Number.isSafeInteger(c.min)) ||
          (c.max !== undefined && !Number.isSafeInteger(c.max)) || (c.min !== undefined && c.max !== undefined && c.min > c.max)) add(here, 'claim needs a consistent integer bound');
      }
    }
  }
  for (const [i, o] of row.offensives.entries()) checkPapers(o.requiresPapers, o.letter === undefined ? o.id : letterKey(o.letter), `offensives[${i}].requiresPapers`);
  for (const [i, c] of (row.concentrations ?? []).entries()) {
    if (c.id !== undefined) reserve(c.id, `concentrations[${i}].id`);
    checkPapers(c.requiresPapers, c.id, `concentrations[${i}].requiresPapers`);
  }
  for (const [i, c] of row.calls.entries()) checkPapers(c.requiresPapers, c.id, `calls[${i}].requiresPapers`);
  if (problems.length === 0 && orderedLetters(row.offensives).length !== letters.size) add('offensives', 'cyclic authored letter dependencies');
  const answers = new Set<string>();
  for (const [i, a] of (row.proposalAnswers ?? []).entries()) {
    const field = `proposalAnswers[${i}]`;
    checkPapers(a.requiresPapers, a.id, `${field}.requiresPapers`);
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
