import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { C2_MINIMUM, checkGate, errorsOf, formatIssue, gateContentHash, GATE_QUESTIONS_PARTIAL, GATE_QUESTIONS_TESTED, IssueSink, loadPack, proximityHit, publishedSchemas, readGate, readSituations, releaseProblems, triggerMatches, type Issue } from '../src/index.ts';
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

  it('0041: options in ascending display order, each with its own key', () => {
    fires(editJson(sit('eastwatch_stalls'), (s) => (s.options[2].displayKey = 1)), 'situation-display-order');
    fires(editJson(sit('eastwatch_stalls'), (s) => s.options.reverse()), 'situation-display-order');
  });

  it('C1: every option names its proponents, people the World holds, or inaction', () => {
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[0].proposedBy = [])), 'shape/too_small', { at: 'options[0].proposedBy', message: 'gate C1' });
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[0].proposedBy = ['nobody'])), 'unknown-reference', { at: 'options[0].proposedBy[0]' });
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
    firesAt(editJson(decision, (s) => (s.options[0].orders[0].region = null)), 'situation-order', { at: 'options[0].orders[0]' });
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

  it('the lead’s ruling on S10: option conditions follow what the principal knows, never State', () => {
    for (const atom of [{ flag: 'fen_arrivals' }, { fired: 'fen_arrivals' }, { goal: { post: 'n_army_east', kind: 'hold' } }, { headquartersAt: { post: 'n_army_east', region: 'n_capital' } }]) {
      firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[0].appearsWhen = { not: atom })), 'situation-option-truth', { at: 'options[0].appearsWhen' });
    }
    firesAt(editJson(sit('eastwatch_stalls'), (s) => (s.options[2].waitsOn = { flag: 'fen_arrivals' })), 'situation-option-truth', { at: 'options[2].waitsOn' });
    const known = editJson(sit('eastwatch_stalls'), (s) => (s.options[0].expiresWhen = { any: [{ knows: { subjectKind: 'situation', subjectId: 'fen_arrivals' } }, { decided: 'fen_crossing' }, { clockAtLeast: 9 }, { dayAtLeast: 300 }] }));
    expect(issues(known).filter((i) => i.kind === 'situation-option-truth')).toEqual([]);
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
    const refuseOrder = editJson('gate/register.json', (r) => r.topics[1].refused.push({ orderPattern: '^advance:n_army_east:s_capital$', reason: 'a test signature' }));
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

  it('B10: an option a later law forbids expires with it', () => {
    fires(editJson(sit('fen_crossing'), (s) => (s.options[2].expiresWhen = null)), 'gate-no-expiry');
  });

  it('E7: atrocity-class conduct never helps the side that acted, and names that side', () => {
    fires(editJson(sit('harbour_burning'), (s) => (s.effects[0].propose.delta = 10)), 'gate-sign-rule');
    fires(editJson(sit('harbour_burning'), (s) => (s.gate.actingSide = null)), 'gate-acting-side');
    // Review S5: an effect with no side cannot slip past the sign rule.
    firesAt(editJson(sit('harbour_burning'), (s) => ((s.effects[0].propose.side = null), (s.effects[0].propose.delta = 10))), 'gate-acting-side', { at: 'effects[0].propose.side' });
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
    expect(issues(cost).filter((i) => i.kind === 'gate-atrocity-benefit')).toEqual([]);
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
    const noted = merge(reviewEdit, editJson(sit('fen_crossing'), (s) => (s.gateReview.notes = { 'situation.fen_crossing.text|\\bmasters?\\b': 'Spoken of the holders as the fen folk name them; kept.' })));
    expect(issues(noted).filter((i) => i.kind === 'gate-review-note-missing')).toEqual([]);
    expect(proximityHit('the fen folk were counted as stock', ['stock'], ['fen folk'], 5)).toBe('"stock" near "fen folk"');
    // Review S9: phrases and inflections match, and every string in the table is checked, not only situations'.
    expect(proximityHit('the fen folk as a labour force', ['labour force'], ['fen folk'], 5)).toBe('"labour force" near "fen folk"');
    expect(proximityHit('the fen folk were counted', ['count(?:s|ed|ing)?'], ['fen folk'], 5)).toBe('"counted" near "fen folk"');
    firesAt(editJson('strings/en.json', (t) => (t['terrain.swamp'] = 'swamp of the loyal fen folk')), 'gate-forbidden-wording', { file: 'strings/en.json', at: 'terrain.swamp' });
    firesAt(editJson('strings/en.json', (t) => (t['terrain.swamp'] = 'the fen folk counted in the swamps')), 'gate-forbidden-wording', { file: 'strings/en.json', at: 'terrain.swamp', message: 'resource wording' });
    firesAt(editJson('strings/en.json', (t) => (t['terrain.swamp'] = 'the masters of the swamp')), 'gate-review-wording', { file: 'strings/en.json', at: 'terrain.swamp', severity: 'warning' });
    expect(proximityHit('fen folk crossed the river and the mill kept its old stock of grain', ['stock'], ['fen folk'], 5)).toBeNull();
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
      'situations/fen_arrivals.json: signed off by a fixture (fixture-signoff), not a gate reviewer',
      'situations/fen_crossing.json: signed off by a fixture (fixture-signoff), not a gate reviewer',
      'situations/harbour_burning.json: signed off by a fixture (fixture-signoff), not a gate reviewer',
      'situations/sanctuary_act.json: signed off by a fixture (fixture-signoff), not a gate reviewer',
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

  it('lists the questions it tests, and each one listed is named by a test here or in the kernel (review S11)', () => {
    expect(GATE_QUESTIONS_TESTED).toEqual(['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'B1', 'B2', 'B3', 'B4', 'B5', 'B7', 'B9', 'B10', 'C1', 'C2', 'C3', 'C4', 'D4', 'D5', 'E7', 'F1', 'F2', 'F5', 'F6', 'H5']);
    expect(GATE_QUESTIONS_PARTIAL).toEqual(['D3', 'E3']);
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
