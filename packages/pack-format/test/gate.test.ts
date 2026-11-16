import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { C2_MINIMUM, checkBlocs, checkGate, errorsOf, formatIssue, gateContentHash, GATE_QUESTIONS_PARTIAL, GATE_QUESTIONS_TESTED, IssueSink, loadPack, proximityHit, publishedSchemas, readGate, readSituations, releaseProblems, signatureRefuses, triggerMatches, type Issue } from '../src/index.ts';
import { editJson, readTestbed, testbedFiles, type Edits } from './support/testbed.ts';

/**
 * Lane 0.7: situations in the pack format, and the sensitive-history gate's
 * mechanical questions (SENSITIVE-HISTORY section 2.2, mapped by section 5).
 * Every check has a positive control: one edit to the fictional testbed, and
 * the one check that fires.
 */

function issues(edits: Edits = {}): Issue[] {
  return [...loadPack(testbedFiles(edits)).issues];
}
function kinds(edits: Edits): string[] {
  return issues(edits).map((i) => `${i.severity} ${i.kind} ${i.file}`);
}
function fires(edits: Edits, kind: string, file?: string): void {
  const found = issues(edits).filter((i) => i.kind === kind && (file === undefined || i.file === file));
  expect(found.length, `${kind} in ${file ?? 'any file'}; got:\n${issues(edits).map(formatIssue).join('\n')}`).toBeGreaterThan(0);
}
/** The check fires at exactly this place (or with this message): each control pins one check site. */
function firesAt(edits: Edits, kind: string, where: { at?: string; message?: string; file?: string; severity?: 'error' | 'warning' }): void {
  const all = issues(edits);
  const found = all.filter(
    (i) =>
      i.kind === kind &&
      (where.at === undefined || i.at === where.at) &&
      (where.message === undefined || i.message.includes(where.message)) &&
      (where.file === undefined || i.file === where.file) &&
      (where.severity === undefined || i.severity === where.severity),
  );
  expect(found.length, `${kind} at ${JSON.stringify(where)}; got:\n${all.map(formatIssue).join('\n')}`).toBeGreaterThan(0);
}
const sit = (id: string) => `situations/${id}.json`;
const merge = (...edits: Edits[]): Edits => Object.assign({}, ...edits);

describe('the testbed’s situations and gate', () => {
  it('load clean, with every situation and the gate', () => {
    const loaded = loadPack(testbedFiles());
    expect(errorsOf(loaded.issues).map(formatIssue)).toEqual([]);
    expect(loaded.pack!.situations!.map((s) => s.id)).toEqual(['eastwatch_followup', 'eastwatch_stalls', 'fen_arrivals', 'fen_crossing', 'harbour_burning', 'sanctuary_act']);
    expect(loaded.pack!.gate!.register.topics.map((t) => t.id)).toEqual(['fen-flight', 'harbour-burning', 'press-closures', 'old-oath']);
  });

  it('cover the register section 5 asks for: one topic per placement, a held topic with an interim placement, an atrocity class, an agency class', () => {
    const gate = loadPack(testbedFiles()).pack!.gate!;
    const placements = new Set(gate.register.topics.flatMap((t) => t.placements));
    expect([...placements].sort()).toEqual(['decision', 'derived', 'event', 'text']);
    expect(gate.register.topics.some((t) => t.refused.length > 0)).toBe(true);
    expect(gate.register.topics.find((t) => t.status === 'record')?.interim).toBe('text');
    expect(gate.classes.classes.some((c) => c.atrocity)).toBe(true);
    expect(gate.classes.classes.some((c) => c.requiresAgencyReason)).toBe(true);
  });
});

describe('situations in the pack format', () => {
  it('B1: a decision needs options, inaction, a historical default and a staff line', () => {
    fires(editJson(sit('eastwatch_stalls'), (s) => delete s.inaction), 'situation-missing', sit('eastwatch_stalls'));
    fires(editJson(sit('eastwatch_stalls'), (s) => delete s.historicalDefault), 'situation-missing');
    fires(editJson(sit('eastwatch_stalls'), (s) => delete s.staffLine), 'situation-missing');
  });

  it('a notice carries no options; a decision no effects of its own', () => {
    fires(editJson(sit('sanctuary_act'), (s) => (s.inaction = { text: 'situation.sanctuary_act.text' })), 'situation-notice-field');
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.effects = [{ setFlag: 'x' }])), 'situation-decision-effects');
  });

  it('B2: a cause in State, or a labelled railroad', () => {
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.event = { dayAtLeast: 30 })), 'situation-date-cause');
    expect(kinds(editJson(sit('eastwatch_stalls'), (s) => ((s.event = { dayAtLeast: 30 }), (s.railroad = 'the testbed opening'))))).not.toContainEqual(expect.stringContaining('situation-date-cause'));
    // Review S6: a date hidden inside `any`, and a cause true from the first day, are caught too.
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.event = { any: [{ dayAtLeast: 40 }, { flag: 'fen_arrivals' }] })), 'situation-date-cause');
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.event = { not: { flag: 'fen_arrivals' } })), 'situation-date-cause');
    // A date joined to a real cause by `all` is fine.
    expect(kinds(editJson(sit('eastwatch_stalls'), (s) => (s.event = { all: [{ dayAtLeast: 40 }, { flag: 'fen_arrivals' }] })))).not.toContainEqual(expect.stringContaining('situation-date-cause'));
  });

  it('a proposed field and an option id are lowercase, so the gate’s signatures see every word (standing review of lane 1.8, S1)', () => {
    // camelCase passes every field and option signature, because they find words by their separators.
    firesAt(editJson(sit('eastwatch_stalls'), (s) => s.options[1].effects.push({ propose: { owner: 'regions', field: 'blackSoldiers', subject: null, delta: 5, reason: 'a-probe', side: 'north' } })), 'shape/invalid_format', { at: 'options[1].effects[1].propose.field', message: 'no camelCase' });
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[1].lockedCosts ??= []).push({ propose: { owner: 'regions', field: 'PrisonersHeld', subject: null, delta: -5, reason: 'a-probe', side: 'north' } })), 'shape/invalid_format', { at: 'options[1].lockedCosts[0].propose.field', message: 'no camelCase' });
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[1].id = 'exchangePrisoners')), 'shape/invalid_format', { at: 'options[1].id', message: 'no camelCase' });
    // The controls: the same ids in lowercase raise no shape error.
    const shapes = (edits: Edits) => issues(edits).filter((i) => i.kind.startsWith('shape/') && i.file === sit('eastwatch_stalls'));
    expect(shapes(editJson(sit('eastwatch_stalls'), (s) => s.options[1].effects.push({ propose: { owner: 'regions', field: 'black_soldiers', subject: null, delta: 5, reason: 'a-probe', side: 'north' } })))).toEqual([]);
    expect(shapes(editJson(sit('eastwatch_stalls'), (s) => (s.options[1].id = 'exchange_prisoners')))).toEqual([]);
  });

  it('0041: options in ascending display order, each with its own key', () => {
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.options[2].displayKey = 1)), 'situation-display-order');
    fires(editJson(sit('eastwatch_stalls'), (s) => s.options.reverse()), 'situation-display-order');
  });

  it('C1: every option names its proponents, people the World holds, or inaction', () => {
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[0].proposedBy = [])), 'shape/too_small', { at: 'options[0].proposedBy', message: 'gate C1' });
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[0].proposedBy = ['nobody'])), 'unknown-reference', { at: 'options[0].proposedBy[0]' });
  });

  it('standing review S6: every post a situation names is its own side’s', () => {
    // Probe G5: the other side's war office as delegate, delegated default and staff author on a northern decision.
    const theirs = editJson(sit('eastwatch_stalls'), (s) => ((s.delegableTo = ['s_war_office']), (s.historicalDefault = { delegate: 's_war_office' }), (s.staffLine.authors = ['s_war_office'])));
    firesAt(theirs, 'situation-side', { at: 'delegableTo[0]', message: 's_war_office' });
    firesAt(theirs, 'situation-side', { at: 'staffLine.authors[0]' });
    firesAt(editJson(sit('fen_arrivals'), (s) => (s.report.authors = ['s_war_office'])), 'situation-side', { at: 'report.authors[0]' });
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[0].orders[0].to = 's_war_office')), 'situation-side', { at: 'options[0].orders[0].to' });
    // The control: the unedited testbed names only its own side's posts.
    expect(issues().filter((i) => i.kind === 'situation-side')).toEqual([]);
  });

  it('references resolve: people, posts, regions, routes, situations and options', () => {
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.options[0].proposedBy = ['nobody'])), 'unknown-reference');
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.options[0].orders[0].to = 'no_post')), 'unknown-reference');
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.options[0].orders[0].route = 'mail')), 'situation-route');
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.historicalDefault = { options: ['nope'] })), 'unknown-reference');
    fires(editJson(sit('eastwatch_followup'), (s) => (s.event = { decided: 'eastwatch_stalls', options: ['nope'] })), 'unknown-reference');
  });

  it('chains follow an earlier stage of the same chain; the clock is not read before it starts', () => {
    fires(editJson(sit('eastwatch_followup'), (s) => (s.chain.stage = 1)), 'situation-chain');
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.knowledge = { clockAtLeast: 2 })), 'situation-clock');
  });

  it('every string a situation shows has text in the default locale', () => {
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.title = 'situation.nowhere.title')), 'missing-string');
  });

  it('a file is named for its situation; strays are reported; drafts are never loaded', () => {
    fires({ 'situations/wrong_name.json': readTestbed(sit('eastwatch_stalls')) }, 'situation-file-name');
    fires({ 'situations/notes.txt': 'x' }, 'unknown-table');
    fires({ 'situations/old/x.json': '{}' }, 'unknown-table');
    expect(errorsOf(issues({ 'situations/drafts/broken.json': '{ not json' }))).toEqual([]);
  });

  it('each semantic check fires at its own place (one control per check site)', () => {
    const decision = sit('eastwatch_stalls');
    firesAt({ 'situations/copy.json': readTestbed(decision) }, 'duplicate-id', { at: 'id', message: 'defined more than once' });
    firesAt(editJson(decision, (s) => ((s.options = []), (s.historicalDefault = { unsourced: 'x' }), (s.staffLine = null))), 'situation-missing', { at: 'options' });
    firesAt(editJson(decision, (s) => (s.options[2].displayKey = 2)), 'situation-display-order', { message: 'share a display key' });
    firesAt(editJson(decision, (s) => (s.options[2].id = 'press_on')), 'duplicate-id', { at: 'options' });
    firesAt(editJson(decision, (s) => (s.historicalDefault = { options: ['press_on', 'send_the_fighter'] })), 'situation-selection', { at: 'historicalDefault.options' });
    firesAt(editJson(decision, (s) => (s.historicalDefault = { delegate: 'n_army_west' })), 'unknown-reference', { at: 'historicalDefault.delegate' });
    firesAt(editJson(decision, (s) => (s.staffLine.recommends = ['nope'])), 'unknown-reference', { at: 'staffLine.recommends[0]' });
    firesAt(editJson(decision, (s) => (s.options[0].orders[0].objective = null)), 'situation-order', { at: 'options[0].orders[0]' });
    firesAt(editJson(sit('eastwatch_followup'), (s) => (s.chain.follows.situation = 'nowhere')), 'unknown-reference', { at: 'chain.follows.situation' });
    firesAt(editJson(sit('eastwatch_followup'), (s) => (s.chain.follows.options = ['nope'])), 'unknown-reference', { at: 'chain.follows.options[0]' });
    firesAt(editJson(sit('fen_arrivals'), (s) => (s.event = { fired: 'nowhere' })), 'unknown-reference', { at: 'event', message: 'is not a situation' });
    firesAt(editJson(decision, (s) => (s.knowledge = { flag: 'never_set' })), 'situation-flag-unset', { at: 'knowledge', severity: 'warning' });
  });

  it('each gate register check fires at its own place', () => {
    firesAt(editJson('gate/register.json', (r) => (r.topics[2].class = 'nope')), 'gate-register', { at: 'topics[2].class', file: 'gate/register.json' });
    firesAt(editJson('gate/register.json', (r) => (r.topics[2].interim = 'text')), 'gate-register', { at: 'topics[2].interim', severity: 'warning' });
    firesAt(editJson(sit('fen_arrivals'), (s) => (s.gate.topics = ['nope'])), 'gate-unknown-topic', { at: 'gate' });
    firesAt(editJson('gate/register.json', (r) => (r.topics[0].supersededOptions[0].option = 'nope')), 'unknown-reference', { at: 'options', file: sit('fen_crossing') });
  });

  it('review S10: a notice reaches the principal as a report with an author and a route (F1)', () => {
    firesAt(editJson(sit('fen_arrivals'), (s) => delete s.report), 'situation-missing', { at: 'report' });
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.report = { authors: ['n_war_office'], reportType: 'wire-dispatch' })), 'situation-decision-report', { at: 'report' });
    firesAt(editJson(sit('fen_arrivals'), (s) => (s.report.reportType = 'informal')), 'situation-report', { at: 'report' });
    firesAt(editJson(sit('fen_arrivals'), (s) => (s.report.authors = ['no_post'])), 'unknown-reference', { at: 'report.authors[0]' });
  });

  it('the lead’s rulings on S10 and S2: each condition the principal must know reads only its allow-list', () => {
    // Options: knows, the clock and dates. Any truth read, or a decision (even his own side's), is refused.
    for (const atom of [{ flag: 'fen_arrivals' }, { fired: 'fen_arrivals' }, { decided: 'fen_crossing' }, { goal: { post: 'n_army_east', posture: 'hold' } }, { headquartersAt: { post: 'n_army_east', region: 'n_capital' } }]) {
      firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[0].appearsWhen = { not: atom })), 'situation-option-truth', { at: 'options[0].appearsWhen', message: Object.keys(atom)[0] });
    }
    // Waits: knows and the clock, not dates.
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[2].waitsOn = { flag: 'fen_arrivals' })), 'situation-option-truth', { at: 'options[2].waitsOn' });
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[2].waitsOn = { any: [{ clockAtLeast: 5 }, { dayAtLeast: 90 }] })), 'situation-option-truth', { at: 'options[2].waitsOn', message: 'dayAtLeast' });
    // The knowledge trigger: knows alone, under all, any and not.
    firesAt(editJson(sit('fen_crossing'), (s) => (s.knowledge = { any: [s.knowledge, { fired: 'fen_arrivals' }] })), 'situation-knowledge-truth', { at: 'knowledge', message: '"fired"' });
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.knowledge = { flag: 'fen_arrivals' })), 'situation-knowledge-truth', { at: 'knowledge', message: '"flag"' });
    firesAt(editJson(sit('fen_crossing'), (s) => (s.knowledge = { all: [s.knowledge, { dayAtLeast: 90 }] })), 'situation-knowledge-truth', { at: 'knowledge', message: '"dayAtLeast"' });
    // The controls: each place's allow-list passes.
    const known = merge(
      editJson(sit('eastwatch_stalls'), (s) => ((s.options[0].expiresWhen = { any: [{ knows: { subjectKind: 'situation', subjectId: 'fen_arrivals' } }, { clockAtLeast: 9 }, { not: { dayAtLeast: 300 } }] }), (s.options[2].waitsOn = { all: [{ clockAtLeast: 5 }, { knows: { reportType: 'wire-dispatch' } }] }))),
      editJson(sit('fen_crossing'), (s) => (s.knowledge = { all: [s.knowledge, { not: { knows: { subjectKind: 'situation', subjectId: 'sanctuary_act' } } }] })),
    );
    expect(issues(known).filter((i) => i.kind === 'situation-option-truth' || i.kind === 'situation-knowledge-truth').map(formatIssue)).toEqual([]);
  });

  it('a pack with no situations/ or gate/ folder loads, even through an adapter that throws for a missing folder (standing re-check)', () => {
    const base = testbedFiles();
    const missing = (dir: string) => (p: string) => {
      if (p === 'situations' || p === 'gate' || p.startsWith('situations/') || p.startsWith('gate/')) throw Object.assign(new Error(`ENOENT: no such file or directory, scandir '${p}'`), { code: 'ENOENT' });
      return dir === 'files' ? base.files(p) : base.folders(p);
    };
    const throwing = { read: (p: string) => (p.startsWith('situations/') || p.startsWith('gate/') ? undefined : base.read(p)), files: missing('files'), folders: missing('folders') };
    const loaded = loadPack(throwing);
    expect(errorsOf(loaded.issues).map(formatIssue)).toEqual([]);
    expect([loaded.pack!.situations, loaded.pack!.gate]).toEqual([[], null]);
    // The control: an error that is not a missing folder is not swallowed.
    const broken = { ...throwing, files: (p: string) => (p === 'situations' ? (() => { throw Object.assign(new Error('EACCES'), { code: 'EACCES' }); })() : base.files(p)) };
    expect(() => loadPack(broken)).toThrow(/EACCES/);
  });

  it('a pack with situations must carry its gate', () => {
    fires({ 'gate/register.json': null }, 'missing-file', 'gate/register.json');
  });
});

describe('the gate’s mechanical questions (SENSITIVE-HISTORY 2.2)', () => {
  it('A1: a trigger match needs a tag, after the allowlist', () => {
    fires(editJson('strings/en.json', (t) => (t['situation.eastwatch_stalls.text'] = 'The salt fens are quiet.')), 'gate-untagged', sit('eastwatch_stalls'));
    expect(kinds(editJson('strings/en.json', (t) => (t['situation.eastwatch_stalls.text'] = 'He waits below the Burning Hills.')))).not.toContainEqual(expect.stringContaining('gate-untagged'));
    expect(triggerMatches('People burned the mill', loadPack(testbedFiles()).pack!.gate!.triggers)).toEqual(['burned']);
  });

  it('review S2: reason text is player-facing, so it is required, scanned, wording-checked and hashed', () => {
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.inaction.effects[0].propose.reason = 'unwritten')), 'missing-string', { at: 'inaction.effects[0].propose.reason' });
    firesAt(editJson('strings/en.json', (t) => (t['reason.the-army-sits'] = 'the salt fens empty')), 'gate-untagged', { file: sit('eastwatch_stalls') });
    firesAt(editJson('strings/en.json', (t) => (t['reason.supply'] = 'a quota of fen folk')), 'gate-forbidden-wording', { at: 'staffLine.reasons[0].kind' });
    firesAt(editJson('strings/en.json', (t) => (t['reason.return-to-the-fens'] = 'a change of policy')), 'gate-stale-review', { file: sit('fen_crossing'), at: 'gateReview.contentHash' });
  });

  it('A1, B3 and D3 in part: an effect on a protected field needs a tag, and is refused', () => {
    const edit = editJson(sit('eastwatch_stalls'), (s) => s.options[1].effects.push({ propose: { owner: 'regions', field: 'fenfolk-population', subject: null, delta: 5, reason: 'x', side: 'north' } }));
    fires(edit, 'gate-untagged');
    fires(edit, 'gate-protected-target');
    fires(edit, 'gate-refused');
  });

  it('a refused signature can see what a proposal is aimed at: subjectPattern (0070, the register review S1)', () => {
    const recruit = (subject: string | null) =>
      editJson(sit('eastwatch_stalls'), (s) => s.options[1].effects.push({ propose: { owner: 'regions', field: 'recruitment', subject, delta: 5, reason: 'x', side: 'north' } }));
    const refuse = (signature: Record<string, string>) => editJson('gate/register.json', (r) => r.topics[1].refused.push({ ...signature, reason: 'a test signature' }));
    // The field alone cannot tell a nation from a department: there is no way to refuse recruitment aimed at one and not the other.
    const fieldOnly = refuse({ fieldPattern: '^recruitment$' });
    firesAt(merge(recruit('s_province'), fieldOnly), 'gate-refused', { file: sit('eastwatch_stalls'), at: 'options[1].effects[1]' });
    firesAt(merge(recruit('n_war'), fieldOnly), 'gate-refused', { file: sit('eastwatch_stalls'), at: 'options[1].effects[1]' });
    // With a subject pattern, ANDed with the field: the field aimed at the nation is refused, aimed at an ordinary department it passes.
    const both = refuse({ fieldPattern: '^recruitment$', subjectPattern: '^s_province$' });
    firesAt(merge(recruit('s_province'), both), 'gate-refused', { file: sit('eastwatch_stalls'), at: 'options[1].effects[1]' });
    expect(issues(merge(recruit('n_war'), both)).filter((i) => i.kind === 'gate-refused')).toEqual([]);
    // A proposal aimed at no one never matches a subject pattern, and a different field aimed at the nation passes the AND.
    expect(issues(merge(recruit(null), both)).filter((i) => i.kind === 'gate-refused')).toEqual([]);
    const other = editJson(sit('eastwatch_stalls'), (s) => s.options[1].effects.push({ propose: { owner: 'regions', field: 'loyalty', subject: 's_province', delta: 5, reason: 'x', side: 'north' } }));
    expect(issues(merge(other, both)).filter((i) => i.kind === 'gate-refused')).toEqual([]);
    // A subject pattern alone refuses any proposal aimed at the subject, whatever the field.
    const subjectOnly = refuse({ subjectPattern: '^s_province$' });
    firesAt(merge(other, subjectOnly), 'gate-refused', { file: sit('eastwatch_stalls'), at: 'options[1].effects[1]' });
    expect(issues(merge(recruit('n_war'), subjectOnly)).filter((i) => i.kind === 'gate-refused')).toEqual([]);
  });

  it('a refused signature’s patterns are compiled exactly as written, never lower-cased, so escapes keep their meaning (0070 review N2)', () => {
    // `\D` is "not a digit": lower-cased it would be `\d`, "a digit", and refuse the opposite set.
    const sig = { fieldPattern: String.raw`^\D+$`, subjectPattern: String.raw`^\W*Nation\W*$` };
    expect(signatureRefuses(sig, 'levy', 'Nation')).toBe(true);
    expect(signatureRefuses(sig, 'levy2', 'Nation')).toBe(false);
    // The subject pattern is case-sensitive as written: `Nation` is not `nation`.
    expect(signatureRefuses(sig, 'levy', 'nation')).toBe(false);
    expect(signatureRefuses({ fieldPattern: null, subjectPattern: String.raw`^\D$` }, 'any', '7')).toBe(false);
    expect(signatureRefuses({ fieldPattern: null, subjectPattern: String.raw`^\D$` }, 'any', 'x')).toBe(true);
  });

  it('A2: the placement is one the register allows', () => {
    fires(editJson(sit('harbour_burning'), (s) => (s.gate.placement = 'decision')), 'gate-placement');
  });

  it('A2 and B5 (review S1): the placement matches the kind, so no gated decision skips its locked costs', () => {
    firesAt(editJson(sit('fen_crossing'), (s) => (s.gate.placement = 'event')), 'gate-placement-kind', { at: 'gate.placement', message: 'a gated decision' });
    firesAt(editJson(sit('fen_arrivals'), (s) => (s.gate.placement = 'decision')), 'gate-placement-kind', { at: 'gate.placement', message: 'a notice is placed decision' });
    firesAt(editJson(sit('fen_arrivals'), (s) => (s.gate.placement = 'text')), 'gate-placement-kind', { at: 'gate.placement', message: 'a text item carries effects' });
    firesAt(editJson(sit('fen_arrivals'), (s) => (s.gate.placement = 'derived')), 'gate-placement-kind', { at: 'gate.placement', message: 'cannot be placed' });
    firesAt(editJson(sit('fen_crossing'), (s) => (s.options[0].gate = { topics: ['fen-flight'], placement: 'event' })), 'gate-placement-kind', { at: 'options[0].gate.placement' });
    // An event-placed decision with an uncosted option is still caught by B5.
    firesAt(editJson(sit('fen_crossing'), (s) => ((s.gate.placement = 'event'), (s.options[0].lockedCosts = []))), 'gate-no-locked-cost', { at: 'options[0].lockedCosts' });
  });

  it('A3: a held topic admits only a cited, text-only item', () => {
    fires(editJson(sit('fen_arrivals'), (s) => (s.gate.topics = ['old-oath'])), 'gate-held-topic');
    const textOnly = editJson(sit('fen_arrivals'), (s) => ((s.gate = { topics: ['old-oath'], placement: 'text', risks: [] }), (s.effects = []), (s.earliest = '1861-06-01')));
    expect(kinds(textOnly).filter((k) => k.includes('gate-held-topic'))).toEqual([]);
  });

  it('A4: the item falls inside its topic’s window', () => {
    fires(editJson(sit('fen_arrivals'), (s) => (s.earliest = '1861-01-01')), 'gate-window');
  });

  it('A5 and A6: citations resolve, and none is banned or all weak', () => {
    fires(editJson(sit('fen_arrivals'), (s) => (s.citations = [])), 'gate-citation');
    fires(editJson(sit('fen_arrivals'), (s) => (s.citations = [{ source: 'NOWHERE', at: null }])), 'unknown-reference');
    fires(editJson('gate/source-policy.json', (p) => (p.banned = ['TB-DESIGN'])), 'gate-banned-source');
    fires(editJson('gate/source-policy.json', (p) => (p.weak = ['TB-DESIGN'])), 'gate-weak-sources');
  });

  it('A7: a sign-off by someone else, against current question versions and the current content', () => {
    fires(editJson(sit('fen_crossing'), (s) => (s.gateReview.reviewer = s.gateReview.author)), 'gate-self-signed');
    fires(editJson(sit('fen_crossing'), (s) => (s.gateReview = null)), 'gate-unsigned');
    fires(editJson('gate/checklist.json', (c) => (c.questions.find((q: { id: string }) => q.id === 'B5').version = 2)), 'gate-stale-review', sit('fen_crossing'));
    // Review S8: string-only questions (Q9, Q10, the F-questions) are part of a situation's sign-off.
    firesAt(editJson('gate/checklist.json', (c) => (c.questions.find((q: { id: string }) => q.id === 'Q9').version = 2)), 'gate-stale-review', { file: sit('fen_crossing'), at: 'gateReview.questionVersions.Q9' });
    // Editing a string the item shows voids its sign-off: the hash covers resolved text.
    fires(editJson('strings/en.json', (t) => (t['situation.fen_crossing.option.shelter'] = 'Let them stay')), 'gate-stale-review', sit('fen_crossing'));
    // Changing only the review (here its reviewer) does not: the hash excludes the sign-off itself.
    expect(kinds(editJson(sit('fen_crossing'), (s) => (s.gateReview.reviewer = 'gate-reviewer')))).toEqual([]);
  });

  it('B4 and D4: no option, for any seat, carries an atrocity-class topic; refused option shapes are refused', () => {
    fires(editJson(sit('fen_crossing'), (s) => (s.options[0].gate = { topics: ['harbour-burning'], placement: 'event', risks: [] })), 'gate-atrocity-lever');
    fires(editJson(sit('fen_crossing'), (s) => (s.options[0].id = 'burn_the_crossing')), 'gate-refused');
  });

  it('review N1: a refused shape is refused by its label in every locale and by the orders it issues, not only its id', () => {
    // Renamed past the id pattern, the option still says what it does.
    firesAt(editJson('strings/en.json', (t) => (t['situation.fen_crossing.option.send_back'] = 'Hunt them down in the reeds')), 'gate-refused', { file: sit('fen_crossing'), at: 'options[2].label' });
    firesAt(editJson('strings/en.json', (t) => (t['situation.fen_crossing.option.shelter'] = 'Burn the crossing behind them')), 'gate-refused', { file: sit('fen_crossing'), at: 'options[1].label' });
    const refuseOrder = editJson('gate/register.json', (r) => r.topics[1].refused.push({ orderPattern: '^take:n_army_east:s_capital$', reason: 'a test signature' }));
    firesAt(refuseOrder, 'gate-refused', { file: sit('eastwatch_stalls'), at: 'options[0].orders[0]' });
  });

  it('review N3, E3 in part: an agency reason is one the register lists for an agency-class topic the item names', () => {
    const reason = (r: string) => editJson(sit('fen_crossing'), (s) => (s.options[1].effects = [{ propose: { owner: 'politics', field: 'bloc-support', subject: 'n_moderates', delta: 10, reason: r, side: 'north' } }]));
    firesAt(reason('agency:invented'), 'gate-agency-reason', { file: sit('fen_crossing'), at: 'options[1].effects[0].propose.reason' });
    // The listed reason passes E3 (its string is missing, and the sign-off is stale, but no agency issue fires).
    expect(kinds(reason('agency:fen-flight')).filter((k) => k.includes('gate-agency-reason'))).toEqual([]);
    // Listed, but on an item whose topics carry no agency class.
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.inaction.effects[0].propose.reason = 'agency:fen-flight')), 'gate-agency-reason', { file: sit('eastwatch_stalls'), at: 'inaction.effects[0].propose.reason' });
  });

  it('review N4: every locale is scanned and hashed, not only the default', () => {
    const en = JSON.parse(readTestbed('strings/en.json')) as Record<string, string>;
    const second = (edit: (t: Record<string, string>) => void) => {
      const xx = { ...en };
      edit(xx);
      return merge(editJson('pack.json', (m) => (m.locales = ['en', 'xx'])), { 'strings/xx.json': JSON.stringify(xx) });
    };
    // A faithful second table voids every gated sign-off: the hash covers each locale's text.
    firesAt(second(() => {}), 'gate-stale-review', { file: sit('fen_crossing'), at: 'gateReview.contentHash' });
    firesAt(second((t) => (t['terrain.swamp'] = 'the fen folk counted in the swamps')), 'gate-forbidden-wording', { file: 'strings/xx.json', at: 'terrain.swamp' });
    firesAt(second((t) => (t['situation.fen_crossing.option.send_back'] = 'Hunt them down')), 'gate-refused', { file: sit('fen_crossing'), at: 'options[2].label' });
  });

  it('standing review S5: an option’s own tag gates the item (A5, A7, B5), and an atrocity tag on a decision fails whatever its options carry', () => {
    // Probe G3: the situation stays `none`, one option is tagged, and the citations go.
    const optionOnly = editJson(sit('eastwatch_followup'), (s) => ((s.options[2].gate = { topics: ['fen-flight'], placement: 'decision' }), (s.citations = [])));
    firesAt(optionOnly, 'gate-citation', { file: sit('eastwatch_followup'), at: 'citations' });
    firesAt(optionOnly, 'gate-unsigned', { file: sit('eastwatch_followup'), at: 'gateReview' });
    // B5 per option: the tagged option needs locked costs; its untagged siblings, under a `none` situation, do not.
    firesAt(optionOnly, 'gate-no-locked-cost', { file: sit('eastwatch_followup'), at: 'options[2].lockedCosts' });
    expect(issues(optionOnly).filter((i) => i.kind === 'gate-no-locked-cost' && i.at !== 'options[2].lockedCosts')).toEqual([]);
    // Probe G4: an atrocity-class decision whose options carry their own tags.
    const atrocity = editJson(sit('fen_crossing'), (s) => {
      s.gate = { topics: ['harbour-burning'], placement: 'event', risks: [], actingSide: 'south' };
      for (const o of s.options) o.gate = { topics: ['fen-flight'], placement: 'decision' };
    });
    firesAt(atrocity, 'gate-atrocity-lever', { file: sit('fen_crossing'), at: 'gate' });
  });

  it('B5: every option of a gated decision carries locked costs, and nothing cancels them', () => {
    fires(editJson(sit('fen_crossing'), (s) => (s.options[2].lockedCosts = [])), 'gate-no-locked-cost');
    const cancel = editJson(sit('sanctuary_act'), (s) => {
      s.event = { all: [{ decided: 'fen_crossing', options: ['send_back'] }, { dayAtLeast: 40 }] };
      s.effects.push({ propose: { owner: 'politics', field: 'foreign-patience', subject: null, delta: 20, reason: 'forgiven', side: 'north' } });
    });
    fires(cancel, 'gate-cancelled-cost', sit('sanctuary_act'));
  });

  it('review S3: an option’s tag adds to the situation’s, and a decision itself carries no atrocity topic', () => {
    const edit = editJson(sit('fen_crossing'), (s) => {
      s.gate.topics = ['fen-flight', 'harbour-burning'];
      for (const o of s.options) o.gate = { topics: ['press-closures'], placement: 'decision' };
    });
    firesAt(edit, 'gate-atrocity-lever', { at: 'gate' });
    firesAt(edit, 'gate-atrocity-lever', { at: 'options[0]' });
  });

  it('review S4: B5 catches a locked cost cancelled inside the item, or by an effect on the situation firing', () => {
    firesAt(
      editJson(sit('fen_crossing'), (s) => (s.options[1].effects ??= []).push({ propose: { owner: 'politics', field: 'bloc-support', subject: 'n_machine', delta: 30, reason: 'return-to-the-fens', side: 'north' } })),
      'gate-cancelled-cost',
      { at: 'options[1].effects[0]' },
    );
    const together = editJson(sit('fen_crossing'), (s) => {
      s.options[1].group = 'a';
      s.options[0].group = 'b';
      s.options[0].effects = [{ propose: { owner: 'politics', field: 'bloc-support', subject: 'n_machine', delta: 30, reason: 'return-to-the-fens', side: 'north' } }];
    });
    firesAt(together, 'gate-cancelled-cost', { at: 'options[0]' });
    const onFiring = editJson(sit('sanctuary_act'), (s) => {
      s.event = { fired: 'fen_crossing' };
      s.effects.push({ propose: { owner: 'politics', field: 'foreign-patience', subject: null, delta: 20, reason: 'return-to-the-fens', side: 'north' } });
    });
    firesAt(onFiring, 'gate-cancelled-cost', { file: sit('sanctuary_act') });
  });

  it('gate G4: D5 follows news of an atrocity and any chain of items to a fixed point', () => {
    const raise = { propose: { owner: 'politics', field: 'national-will', subject: 'north', delta: 15, reason: 'a-harbour-burned', side: 'north' } };
    const news = { knows: { subjectKind: 'situation', subjectId: 'harbour_burning' } };
    const d5 = (edits: Edits, file: string) => issues(edits).filter((i) => i.file === file && (i.kind === 'gate-atrocity-benefit' || (i.kind === 'gate-acting-side' && i.message.includes('conditioned'))));
    // News, in a knowledge trigger: the whole item depends on the atrocity.
    const trigger = editJson(sit('sanctuary_act'), (s) => ((s.knowledge = news), s.effects.push(raise)));
    firesAt(trigger, 'gate-atrocity-benefit', { file: sit('sanctuary_act'), at: 'effects[1]', message: 'raises another side' });
    // News, in one option's appear condition: only that option's effects depend on it.
    const appear = editJson(sit('fen_crossing'), (s) => ((s.options[1].appearsWhen = news), (s.options[1].effects ??= []).push(raise)));
    firesAt(appear, 'gate-atrocity-benefit', { file: sit('fen_crossing'), message: 'option "shelter" depends on it' });
    expect(d5(appear, sit('fen_crossing')).filter((i) => !i.at.startsWith('options[1].'))).toEqual([]);
    // One hop: a middle item that only sets a flag passes the dependence on.
    const middle = editJson(sit('sanctuary_act'), (s) => (s.event = { fired: 'harbour_burning' }));
    const hop = merge(middle, editJson(sit('eastwatch_followup'), (s) => ((s.event = { flag: 'sanctuary_act' }), (s.chain = null))));
    firesAt(hop, 'gate-atrocity-benefit', { file: sit('eastwatch_followup'), at: 'options[0].effects[0]', message: 'through "sanctuary_act"' });
    // Two hops: atrocity, then sanctuary_act's flag, then fen_arrivals' flag.
    const twoHops = merge(
      middle,
      editJson(sit('fen_arrivals'), (s) => (s.event = { flag: 'sanctuary_act' })),
      editJson(sit('eastwatch_followup'), (s) => ((s.event = { flag: 'fen_arrivals' }), (s.chain = null))),
    );
    firesAt(twoHops, 'gate-atrocity-benefit', { file: sit('eastwatch_followup'), at: 'options[0].effects[0]', message: 'through "sanctuary_act" then "fen_arrivals"' });
    // The controls: the unedited testbed has nothing depending on the atrocity, and a chain that never reaches it is no D5 matter.
    expect(issues().filter((i) => i.kind === 'gate-atrocity-benefit')).toEqual([]);
    expect(d5(editJson(sit('eastwatch_followup'), (s) => ((s.event = { flag: 'fen_arrivals' }), (s.chain = null))), sit('eastwatch_followup'))).toEqual([]);
  });

  it('gate G5 (0060): a decision responding to an atrocity can be decided honestly, at its own cost; a notice cannot lower the victim', () => {
    const news = { knows: { subjectKind: 'situation', subjectId: 'harbour_burning' } };
    const d5 = (edits: Edits, file: string) => issues(edits).filter((i) => i.file === file && i.kind === 'gate-atrocity-benefit');
    // fen_crossing on news of the burning: every locked cost and the inaction cost fall on the North, the decider. They pass.
    const responds = editJson(sit('fen_crossing'), (s) => (s.knowledge = { all: [s.knowledge, news] }));
    expect(d5(responds, sit('fen_crossing'))).toEqual([]);
    expect(issues(responds).filter((i) => i.kind === 'gate-cost-not-own')).toEqual([]);
    // A fake cost that lowers the enemy passes D5 (the enemy is the actor) but is no cost: B5 refuses it.
    const fake = editJson(sit('fen_crossing'), (s) => ((s.knowledge = { all: [s.knowledge, news] }), (s.options[0].lockedCosts = [{ propose: { owner: 'politics', field: 'national-will', subject: 'south', delta: -10, reason: 'no-word-from-the-capital', side: 'south' } }])));
    firesAt(fake, 'gate-cost-not-own', { file: sit('fen_crossing'), at: 'options[0].lockedCosts' });
    // A rise in a dependent decision still fails, on any side.
    const rise = editJson(sit('fen_crossing'), (s) => ((s.knowledge = { all: [s.knowledge, news] }), (s.options[1].effects ??= []).push({ propose: { owner: 'politics', field: 'national-will', subject: 'north', delta: 15, reason: 'a-harbour-burned', side: 'north' } })));
    firesAt(rise, 'gate-atrocity-benefit', { file: sit('fen_crossing'), message: 'raises another side' });
    // A notice keeps the strict rule: the North's own fall, conditioned on the burning, still fails.
    const notice = editJson(sit('sanctuary_act'), (s) => ((s.knowledge = news), s.effects.push({ propose: { owner: 'politics', field: 'national-will', subject: 'north', delta: -15, reason: 'a-harbour-burned', side: 'north' } })));
    firesAt(notice, 'gate-atrocity-benefit', { file: sit('sanctuary_act'), at: 'effects[1]', message: 'lowers another side' });
  });

  it('gate G6 (0060): a knows pattern with no subject that could match the atrocity’s own report counts as news of it', () => {
    const raise = { propose: { owner: 'politics', field: 'national-will', subject: 'north', delta: 15, reason: 'a-harbour-burned', side: 'north' } };
    const asking = (knows: Record<string, string>) => editJson(sit('sanctuary_act'), (s) => ((s.knowledge = { knows }), s.effects.push(raise)));
    const d5 = (edits: Edits) => issues(edits).filter((i) => i.file === sit('sanctuary_act') && i.kind === 'gate-atrocity-benefit');
    // The gate reviewer's probe: harbour_burning's report is informal / cabinet-word, so asking for that type and subtype is news of it.
    firesAt(asking({ reportType: 'informal', subtype: 'cabinet-word' }), 'gate-atrocity-benefit', { file: sit('sanctuary_act'), at: 'effects[1]', message: 'raises another side' });
    firesAt(asking({ reportType: 'informal' }), 'gate-atrocity-benefit', { file: sit('sanctuary_act'), at: 'effects[1]' });
    // The controls: a pattern the report cannot match (another subtype, another subject kind, or a claim it has none of) is not.
    expect(d5(asking({ reportType: 'informal', subtype: 'press-word' }))).toEqual([]);
    expect(d5(asking({ reportType: 'informal', subjectKind: 'post' }))).toEqual([]);
    expect(d5(asking({ reportType: 'informal', subtype: 'cabinet-word', claimKind: 'goal-status' }))).toEqual([]);
  });

  it('gate G7 (N10): in a decision depending on an atrocity, an option lowering the actor is watched, so the lever sweep reads it', () => {
    const news = { knows: { subjectKind: 'situation', subjectId: 'harbour_burning' } };
    const lowerActor = { propose: { owner: 'politics', field: 'national-will', subject: 'south', delta: -10, reason: 'a-harbour-burned', side: 'south' } };
    const lever = (watched: boolean) =>
      editJson(sit('fen_crossing'), (s) => ((s.knowledge = { all: [s.knowledge, news] }), (s.options[1].effects ??= []).push(lowerActor), (s.options[1].watched = watched)));
    firesAt(lever(false), 'gate-unwatched-lever', { file: sit('fen_crossing'), at: 'options[1].watched', message: 'shelter' });
    // The controls: marked watched, it passes; and with no dependence on an atrocity, no mark is needed.
    expect(issues(lever(true)).filter((i) => i.kind === 'gate-unwatched-lever')).toEqual([]);
    expect(issues(editJson(sit('fen_crossing'), (s) => (s.options[1].effects ??= []).push(lowerActor))).filter((i) => i.kind === 'gate-unwatched-lever')).toEqual([]);
    // N12, precision: when only one option depends on the atrocity, through its own condition, only that option needs the
    // mark. Its untainted sibling lowering the actor needs none.
    const scoped = editJson(sit('fen_crossing'), (s) => {
      s.options[0].appearsWhen = news;
      for (const o of [s.options[0], s.options[1]]) ((o.watched = false), (o.effects ??= []).push(lowerActor));
    });
    firesAt(scoped, 'gate-unwatched-lever', { file: sit('fen_crossing'), at: 'options[0].watched', message: 'no_instruction' });
    expect(issues(scoped).filter((i) => i.kind === 'gate-unwatched-lever' && i.at !== 'options[0].watched')).toEqual([]);
  });

  it('B10: an option a later law forbids expires with it', () => {
    fires(editJson(sit('fen_crossing'), (s) => (s.options[2].expiresWhen = null)), 'gate-no-expiry');
  });

  it('E7: atrocity-class conduct never helps the side that acted, and names that side', () => {
    fires(editJson(sit('harbour_burning'), (s) => (s.effects[0].propose.delta = 10)), 'gate-sign-rule');
    fires(editJson(sit('harbour_burning'), (s) => (s.gate.actingSide = null)), 'gate-acting-side');
    // Review S5: an effect with no side cannot slip past the sign rule.
    firesAt(editJson(sit('harbour_burning'), (s) => ((s.effects[0].propose.side = null), (s.effects[0].propose.delta = 10))), 'gate-acting-side', { at: 'effects[0].propose.side' });
    // Probe G6, the lead's ruling on N2: lowering the victim side's will helps the actor and fails.
    firesAt(editJson(sit('harbour_burning'), (s) => (s.effects[0].propose.side = s.effects[0].propose.subject = 'north')), 'gate-sign-rule', { at: 'effects[0]', message: 'lowers another side' });
    // Gate re-check G1: raising it fails too. Outrage would make exposing people to an atrocity a lever (0046, D5).
    const outrage = editJson(sit('harbour_burning'), (s) => ((s.effects[0].propose.side = s.effects[0].propose.subject = 'north'), (s.effects[0].propose.delta = 50)));
    firesAt(outrage, 'gate-sign-rule', { at: 'effects[0]', message: 'raises another side' });
    // The control: the unedited item lowers only the acting side's measures.
    expect(issues().filter((i) => i.kind === 'gate-sign-rule')).toEqual([]);
  });

  it('D5 (review S5): no effect conditioned on atrocity-class conduct helps the side that acted', () => {
    const benefit = editJson(sit('sanctuary_act'), (s) => {
      s.event = { all: [{ fired: 'harbour_burning' }, { decided: 'fen_crossing' }] };
      s.effects.push({ propose: { owner: 'politics', field: 'national-will', subject: 'south', delta: 15, reason: 'a-harbour-burned', side: 'south' } });
    });
    firesAt(benefit, 'gate-atrocity-benefit', { file: sit('sanctuary_act'), at: 'effects[1]' });
    // A cost to the acting side, conditioned the same way, is allowed.
    const cost = editJson(sit('sanctuary_act'), (s) => {
      s.event = { all: [{ fired: 'harbour_burning' }, { decided: 'fen_crossing' }] };
      s.effects.push({ propose: { owner: 'politics', field: 'national-will', subject: 'south', delta: -15, reason: 'a-harbour-burned', side: 'south' } });
    });
    expect(issues(cost).filter((i) => i.kind === 'gate-atrocity-benefit' && i.file === sit('sanctuary_act'))).toEqual([]);
    // Gate G4: fen_crossing's send_back expires on news of sanctuary_act, which now depends on the atrocity, so its costs do too;
    // they are the North's own falls in a decision, the price of its choice, so they pass (0060, gate G5).
    expect(issues(cost).filter((i) => i.kind === 'gate-atrocity-benefit' && i.file === sit('fen_crossing'))).toEqual([]);
    // The lead's ruling on N2: lowering the victim's measure, conditioned the same way, helps the actor too.
    const harm = editJson(sit('sanctuary_act'), (s) => {
      s.event = { all: [{ fired: 'harbour_burning' }, { decided: 'fen_crossing' }] };
      s.effects.push({ propose: { owner: 'politics', field: 'national-will', subject: 'north', delta: -15, reason: 'a-harbour-burned', side: 'north' } });
    });
    firesAt(harm, 'gate-atrocity-benefit', { file: sit('sanctuary_act'), at: 'effects[1]', message: 'lowers another side' });
    // Gate re-check G1: a gain for the victim side, conditioned the same way, is refused as well.
    const gain = editJson(sit('sanctuary_act'), (s) => {
      s.event = { all: [{ fired: 'harbour_burning' }, { decided: 'fen_crossing' }] };
      s.effects.push({ propose: { owner: 'politics', field: 'national-will', subject: 'north', delta: 15, reason: 'a-harbour-burned', side: 'north' } });
    });
    firesAt(gain, 'gate-atrocity-benefit', { file: sit('sanctuary_act'), at: 'effects[1]', message: 'raises another side' });
    // Gate G3: a sideless raise, conditioned the same way, cannot slip past D5: it is rejected for naming no side.
    const sideless = editJson(sit('sanctuary_act'), (s) => {
      s.event = { all: [{ fired: 'harbour_burning' }, { decided: 'fen_crossing' }] };
      s.effects.push({ propose: { owner: 'politics', field: 'foreign-patience', subject: null, delta: 15, reason: 'a-harbour-burned', side: null } });
    });
    firesAt(sideless, 'gate-acting-side', { file: sit('sanctuary_act'), at: 'effects[1].propose.side', message: 'harbour_burning' });
    // The control: the same sideless effect with no atrocity in its conditions is no D5 matter.
    const unconditioned = editJson(sit('sanctuary_act'), (s) => s.effects.push({ propose: { owner: 'politics', field: 'foreign-patience', subject: null, delta: 15, reason: 'a-harbour-burned', side: null } }));
    expect(issues(unconditioned).filter((i) => i.kind === 'gate-acting-side' || i.kind === 'gate-atrocity-benefit')).toEqual([]);
  });

  it('C3/F6, C4/F5, F2: anachronisms, forbidden wording by scope, and the proximity rule', () => {
    fires(editJson('strings/en.json', (t) => (t['situation.fen_crossing.text'] = 'The Sanctuary Act is debated.')), 'gate-anachronism');
    fires(editJson('strings/en.json', (t) => (t['situation.fen_crossing.option.shelter'] = 'Do the right thing')), 'gate-forbidden-wording');
    // A label-only pattern does not apply to narrator text.
    expect(kinds(editJson('strings/en.json', (t) => (t['situation.eastwatch_stalls.text'] = 'He thinks it noble to wait.')))).not.toContainEqual(expect.stringContaining('gate-forbidden-wording'));
    fires(editJson('strings/en.json', (t) => (t['situation.fen_arrivals.text'] = 'A quota of fen folk was taken.')), 'gate-forbidden-wording');
    // Review S8: a review-severity hit needs the reviewer's note in the sign-off.
    const reviewEdit = editJson('strings/en.json', (t) => (t['situation.fen_crossing.text'] = 'Their masters want them back.'));
    firesAt(reviewEdit, 'gate-review-note-missing', { at: 'text', file: sit('fen_crossing') });
    const note = { 'en|situation.fen_crossing.text|\\bmasters?\\b': 'Spoken of the holders as the fen folk name them; kept.' };
    const noted = merge(reviewEdit, editJson(sit('fen_crossing'), (s) => (s.gateReview.notes = note)));
    expect(issues(noted).filter((i) => i.kind === 'gate-review-note-missing')).toEqual([]);
    // Gate re-check N9: notes are keyed by language, so the English note does not cover the same hit in a translation.
    const en = JSON.parse(readTestbed('strings/en.json')) as Record<string, string>;
    const translated = merge(noted, editJson('pack.json', (m) => (m.locales = ['en', 'xx'])), { 'strings/xx.json': JSON.stringify({ ...en, 'situation.fen_crossing.text': 'Their masters want them back.' }) });
    firesAt(translated, 'gate-review-note-missing', { file: sit('fen_crossing'), at: 'text', message: '(xx)' });
    expect(issues(translated).filter((i) => i.kind === 'gate-review-note-missing' && i.message.includes('(en)'))).toEqual([]);
    expect(proximityHit('the fen folk were counted as stock', ['stock'], ['fen folk'], 5)).toBe('"stock" near "fen folk"');
    // Review S9: phrases and inflections match, and every string in the table is checked, not only situations'.
    expect(proximityHit('the fen folk as a labour force', ['labour force'], ['fen folk'], 5)).toBe('"labour force" near "fen folk"');
    expect(proximityHit('the fen folk were counted', ['count(?:s|ed|ing)?'], ['fen folk'], 5)).toBe('"counted" near "fen folk"');
    firesAt(editJson('strings/en.json', (t) => (t['terrain.swamp'] = 'swamp of the loyal fen folk')), 'gate-forbidden-wording', { file: 'strings/en.json', at: 'terrain.swamp' });
    firesAt(editJson('strings/en.json', (t) => (t['terrain.swamp'] = 'the fen folk counted in the swamps')), 'gate-forbidden-wording', { file: 'strings/en.json', at: 'terrain.swamp', message: 'resource wording' });
    firesAt(editJson('strings/en.json', (t) => (t['terrain.swamp'] = 'the masters of the swamp')), 'gate-review-wording', { file: 'strings/en.json', at: 'terrain.swamp', severity: 'warning' });
    expect(proximityHit('fen folk crossed the river and the mill kept its old stock of grain', ['stock'], ['fen folk'], 5)).toBeNull();
  });

  it('lane 1.6: no bloc is made of a protected group, by its id or its name in any locale', () => {
    const files = testbedFiles();
    const gate = readGate(files, new IssueSink())!;
    const strings = new Map([['en', new Map<string, string>([...Object.entries(JSON.parse(readTestbed('strings/en.json')) as Record<string, string>), ['bloc.fen_bloc', 'the Fen folk vote']])]]);
    // The testbed's own blocs pass, and so does a bloc that only shares letters with a group term.
    expect(checkBlocs([{ id: 'n_hawks', name: 'bloc.n_hawks' }, { id: 'n_fenfolkish', name: 'bloc.n_hawks' }], gate, strings)).toEqual([]);
    const refused = checkBlocs([{ id: 'fenfolk', name: 'bloc.n_hawks' }, { id: 'n_rural', name: 'bloc.fen_bloc' }], gate, strings);
    expect(refused.map((i) => [i.kind, i.at])).toEqual([
      ['gate-protected-bloc', 'vocabularies.blocs[0] (fenfolk)'],
      ['gate-protected-bloc', 'vocabularies.blocs[1] (n_rural)'],
    ]);
    // The loader runs it over the pack's whole bloc vocabulary beside the situations' gate (`situation-layer.ts`).
    expect(loadPack(files).issues.filter((i) => i.kind === 'gate-protected-bloc')).toEqual([]);
  });

  it('C2: no display position holds the default in more than half of the gated decisions with three or more options', () => {
    const files = testbedFiles();
    const pack = loadPack(files).pack!;
    const strings = new Map([['en', new Map<string, string>(Object.entries(JSON.parse(readTestbed('strings/en.json')) as Record<string, string>))]]);
    const gate = readGate(files, new IssueSink())!;
    const base = readSituations(files, new IssueSink()).find((x) => x.def.id === 'fen_crossing')!;
    const copies = (positions: number[]) =>
      positions.map((p, i) => {
        const def = { ...base.def, id: `copy_${i}` as never, historicalDefault: { options: [base.def.options[p]!.id] } };
        return { file: `situations/copy_${i}.json`, def: { ...def, gateReview: { ...base.def.gateReview!, contentHash: gateContentHash(def, strings, pack.provenance) } } };
      });
    const c2 = (positions: number[]) => checkGate(copies(positions), gate, strings, pack.provenance).filter((i) => i.kind === 'gate-default-position');
    expect(c2([1, 1, 1])).toHaveLength(1);
    expect(c2([0, 1, 2])).toEqual([]);
    expect(c2([1, 1])).toEqual([]);
    expect(C2_MINIMUM).toBe(3);
  });

  it('A8, the ship rule: a held topic overlapping a shipped scenario, or a fixture sign-off, blocks a release', () => {
    const files = testbedFiles();
    const gate = readGate(files, new IssueSink())!;
    const items = readSituations(files, new IssueSink());
    const shipped = ['opening', 'summer_front'];
    expect(releaseProblems(items, gate, shipped)).toEqual([
      'scenario opening (1861-04-01 to 1862-12-31) overlaps held topic old-oath (awaiting its record, 1861-03-04 to 1861-12-31)',
      // The gate reviewer signed three of the four (gate re-check); harbour_burning stays a fixture, so it blocks.
      'situations/harbour_burning.json: signed off by a fixture (fixture-signoff), not a gate reviewer',
    ]);
    // Shipping only the later scenario, with real reviewers' sign-offs, passes.
    const later = { ...gate, release: { scenarios: [gate.release!.scenarios[1]!] } };
    const signed = items.map((x) => ({ ...x, def: { ...x.def, gateReview: x.def.gateReview === null ? null : { ...x.def.gateReview, reviewer: 'gate-reviewer' } } }));
    expect(releaseProblems(signed, later, ['summer_front'])).toEqual([]);
    // Review N2: a reviewer the pack does not list, or no list at all, blocks the release.
    const stranger = signed.map((x) => (x.def.gateReview === null ? x : { ...x, def: { ...x.def, gateReview: { ...x.def.gateReview, reviewer: 'someone-else' } } }));
    expect(releaseProblems(stranger, later, ['summer_front'])).toContain('situations/fen_crossing.json: signed off by someone-else, who is not in gate/reviewers.json');
    expect(releaseProblems(signed, { ...later, reviewers: null }, ['summer_front'])).toEqual(['gate/reviewers.json is missing: list the gate reviewers whose sign-offs a release accepts']);
    // Review S7: a missing release.json, or a shipped scenario with no window, blocks the release.
    expect(releaseProblems(signed, { ...later, release: null }, ['summer_front'])).toEqual([
      'gate/release.json is missing: list every scenario the pack ships, with its window',
      'scenario summer_front ships but has no window in gate/release.json',
    ]);
    expect(releaseProblems(signed, later, ['opening', 'summer_front'])).toEqual(['scenario opening ships but has no window in gate/release.json']);
  });

  it('H5: the situation schema has no virtue, morality or karma field to grade the player with', () => {
    const graded = (schema: unknown): string[] => {
      const out: string[] = [];
      const walk = (v: unknown) => {
        if (Array.isArray(v)) v.forEach(walk);
        else if (v !== null && typeof v === 'object') {
          for (const [k, x] of Object.entries(v)) {
            if (k === 'properties' && x !== null && typeof x === 'object') out.push(...Object.keys(x).filter((p) => /virtue|moral|karma|righteous|honou?r ?score/i.test(p)));
            walk(x);
          }
        }
      };
      walk(schema);
      return out;
    };
    expect(graded(JSON.parse(publishedSchemas().get('situation.schema.json')!))).toEqual([]);
    expect(graded(z.toJSONSchema(z.strictObject({ karma: z.int() })))).toEqual(['karma']);
  });

  it('gate re-check N7: the published schema states the convention the sign rule relies on, on propose.delta and propose.side', () => {
    const described: string[] = [];
    const walk = (v: unknown) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v !== null && typeof v === 'object') {
        const o = v as Record<string, unknown>;
        const props = o.properties as Record<string, { description?: string }> | undefined;
        if (props?.delta !== undefined && props.reason !== undefined) for (const k of ['delta', 'side']) if (/higher-is-better for (its own|that) side/.test(props[k]?.description ?? '')) described.push(k);
        Object.values(o).forEach(walk);
      }
    };
    walk(JSON.parse(publishedSchemas().get('situation.schema.json')!));
    expect(new Set(described)).toEqual(new Set(['delta', 'side']));
  });

  it('lists the questions it tests, and each one listed is named by a test here or in the kernel (review S11)', () => {
    expect(GATE_QUESTIONS_TESTED).toEqual(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'B9', 'B10', 'C1', 'C2', 'C3', 'C4', 'E7', 'F2', 'F5', 'F6', 'H5']);
    expect(GATE_QUESTIONS_PARTIAL).toEqual(['D3', 'D4', 'D5', 'E3', 'F1']);
    // Gate re-check G2: no question is both.
    expect(GATE_QUESTIONS_TESTED.filter((id) => (GATE_QUESTIONS_PARTIAL as readonly string[]).includes(id))).toEqual([]);
    // Every test text except this one, whose own lists would name every id.
    const self = /\n  it\('lists the questions it tests[\s\S]*?\n  \}\);\n/u;
    const tests = ['../../pack-format/test/gate.test.ts', '../../kernel/test/situations.test.ts'].map((p) => readFileSync(fileURLToPath(new URL(p, import.meta.url)), 'utf8').replace(/\r\n/gu, '\n').replace(self, '\n')).join('\n');
    const doc = readFileSync(fileURLToPath(new URL('../../../docs/design/SENSITIVE-HISTORY.md', import.meta.url)), 'utf8');
    const unnamed = (ids: readonly string[]) => ids.filter((id) => !new RegExp(`\\b${id}\\b`, 'u').test(tests));
    expect(unnamed([...GATE_QUESTIONS_TESTED, ...GATE_QUESTIONS_PARTIAL])).toEqual([]);
    // Every id is a real question of section 2.2.
    expect([...GATE_QUESTIONS_TESTED, ...GATE_QUESTIONS_PARTIAL].filter((id) => !doc.includes(`| ${id} |`))).toEqual([]);
    // The control: an id no test names, or no question, is reported.
    expect(unnamed(['Z9'])).toEqual(['Z9']);
  });

  it('positive control for the controls: an unedited testbed fires none of them', () => {
    expect(merge({}, {})).toEqual({});
    expect(kinds({})).toEqual([]);
  });
});
