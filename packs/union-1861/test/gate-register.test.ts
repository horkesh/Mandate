import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPack, signatureRefuses, triggerMatches, type GateData, type Issue, type PackFiles } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';
import { readTestbed, testbedFiles } from '../../../packages/pack-format/test/support/testbed.ts';

/**
 * Lane 1.8: the Union register's refused signatures, probed (FOUNDATION section 12 row 1.8; 0073). Every pattern of
 * every refused signature has a planted case that fires and a legal case that passes, as the standing reviewer probed the
 * Indian Territory topic (review-gate-register-it). The probes run twice: through the matchers `checkGate` uses, against
 * every signature in the register (so a legal case is clean pack-wide), and end to end through `checkGate` itself, with the
 * Union register laid over the fictional testbed and one testbed situation edited per case. A signature added without
 * probes fails the coverage test.
 */
const root = fileURLToPath(new URL('../', import.meta.url));
const files: PackFiles = {
  read: (p) => {
    const full = join(root, ...p.split('/'));
    return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined;
  },
  folders: (p) => (existsSync(join(root, ...p.split('/'))) ? readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []),
  files: (p) => (existsSync(join(root, ...p.split('/'))) ? readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name) : []),
};
const loaded = loadPack(files);
const gate = loaded.pack!.gate as GateData;
const topics = gate.register.topics;
type Signature = (typeof topics)[number]['refused'][number];

interface Field { readonly field: string; readonly subject: string | null }
interface Probe {
  readonly field?: { readonly fires: readonly Field[]; readonly passes: readonly Field[] };
  readonly option?: { readonly fires: readonly string[]; readonly passes: readonly string[] };
  readonly label?: { readonly fires: readonly string[]; readonly passes: readonly string[] };
}

/** Keyed `topic#index` of the signature in the topic's `refused`. */
const PROBES: Record<string, Probe> = {
  'indian-territory-1861#0': {
    field: { fires: [{ field: 'nation-recruits', subject: null }, { field: 'native_manpower', subject: null }], passes: [{ field: 'department_side', subject: 'nation_cherokee' }] },
  },
  'indian-territory-1861#1': {
    field: { fires: [{ field: 'recruitment', subject: 'nation_cherokee' }, { field: 'region_population', subject: 'it_leased_district' }], passes: [{ field: 'recruitment', subject: 'st_kansas' }, { field: 'loyalty', subject: 'it_cherokee' }] },
  },
  'indian-territory-1861#2': {
    option: { fires: ['raise_cherokee_regiments'], passes: ['raise_ohio_regiments'] },
    label: { fires: ['Raise two regiments among the Cherokees'], passes: ['Raise two regiments in Ohio'] },
  },
  'indian-territory-1861#3': {
    option: { fires: ['annex_indian_territory'], passes: ['consult_the_council'] },
    label: { fires: ['Take possession of the Cherokee country'], passes: ['Send an agent to the Cherokee council'] },
  },
  'cause-of-secession#0': {
    option: { fires: ['defend_states_rights'], passes: ['defend_the_capital'] },
    label: { fires: ["Defend the states' rights of Virginia", 'Answer the War Between the States'], passes: ['Defend the capital'] },
  },
  'inaugural-slavery-passage#0': {
    option: { fires: ['soften_inaugural_tone'], passes: ['deliver_the_address'] },
    label: { fires: ['Soften the inaugural on slavery'], passes: ['Address the special session'] },
  },
  'corwin-amendment#0': {
    option: { fires: ['offer_corwin_amendment'], passes: ['offer_terms'] },
    label: { fires: ['Offer the Corwin amendment as a peace term'], passes: ['Offer terms through the governors'] },
  },
  'lost-cause-traps#0': {
    field: { fires: [{ field: 'black_soldiers', subject: 'cs_army' }, { field: 'strength_colored', subject: null }], passes: [{ field: 'strength', subject: 'cs_army' }] },
  },
  'lost-cause-traps#1': {
    field: { fires: [{ field: 'enslaved_loyalty', subject: null }, { field: 'servants_fidelity', subject: null }], passes: [{ field: 'loyalty', subject: 'maryland' }] },
    option: { fires: ['trust_loyal_slaves'], passes: ['trust_loyal_unionists'] },
    label: { fires: ['Rely on the faithful servants at home'], passes: ['Rely on the loyal Unionists'] },
  },
  'self-emancipation#0': {
    field: {
      fires: [{ field: 'enslaved_population', subject: 'va_tidewater' }, { field: 'fugitive_arrivals', subject: null }, { field: 'contraband-labour', subject: null }, { field: 'labour_pool_black', subject: null }],
      passes: [{ field: 'fugitive_policy', subject: null }, { field: 'population', subject: 'va_tidewater' }],
    },
  },
  'self-emancipation#1': {
    option: { fires: ['encourage_slave_escapes', 'recapture_fugitives', 'prevent_escapes'], passes: ['approve_holding', 'no_instruction'] },
    label: {
      fires: ['Encourage the enslaved to come into our lines', 'Count the fugitives at the fort', 'Prevent escapes along the river'],
      passes: ["Approve the general's course: do not surrender them, employ them and keep account, final status reserved", 'Countermand the order'],
    },
  },
  'self-emancipation#2': {
    option: { fires: ['suppress_slave_insurrection'], passes: ['suppress_the_rebellion'] },
    label: { fires: ['Guard against a servile insurrection in the Tidewater'], passes: ['Call the militia to suppress the insurrection'] },
  },
  'fugitive-policy#0': {
    option: { fires: ['restore_property', 'return_to_owners'], passes: ['return'] },
    label: {
      fires: [
        'Order them returned under the 1850 law',
        'Restore the fugitives to their owners',
        'Deliver the escaped people to the claimants',
        // S3: "property" and "owners" refuse only where the label names people.
        'Restore the men as property',
        'Return the men to their owners',
        // S2: send, turn or drive them back, away or out, or keep them from the lines (Q6).
        'Send the fugitives back across the river',
        'Turn the fugitives away from the lines',
        'Exclude fugitives from the lines',
      ],
      passes: [
        'Return them to slavery',
        'Do not surrender the fugitives; employ them and keep account',
        'Give no instruction',
        // S3: Butler's railroad seizures are not fugitive policy.
        'Return the railroad to its owners',
        'Restore the seized railroad property',
        // S2's legal cases.
        'Send them back to slavery under the 1850 law',
        'Do not send the fugitives back',
        'Send the regiments back to their states',
      ],
    },
  },
  'union-freedpeople-camps#0': {
    option: { fires: ['assign_contrabands_to_quartermaster'], passes: ['approve_holding'] },
    label: { fires: ["Assign the freedpeople to the quartermaster's gangs", 'Put the fugitives to work on the forts'], passes: ['Approve holding them'] },
  },
  'confederate-enslaved-labour#0': {
    option: { fires: ['impress_slaves_for_works'], passes: ['impress_wagons'] },
    label: { fires: ["Impress enslaved men for the Sewell's Point works"], passes: ['Impress wagons for the works'] },
  },
  'slavery-as-wealth#0': {
    field: { fires: [{ field: 'slave_value', subject: null }, { field: 'collateral_enslaved', subject: null }], passes: [{ field: 'cotton_value', subject: null }] },
  },
  'black-enlistment-1861-offers#0': {
    option: { fires: ['recruit_black_regiments'], passes: ['ask_congress'] },
    // S4: unanchored, so word order no longer bypasses it; the Congress route and a refusal pass.
    label: { fires: ['Raise two regiments of Black volunteers', 'Tell Cameron to enlist Black volunteers'], passes: ['Ask Congress for authority to enlist Black volunteers', 'Decline the Black volunteers under the militia law'] },
  },
  'black-enlistment-1861-offers#1': {
    option: { fires: ['accept_black_companies'], passes: ['decline', 'refer_governors'] },
    label: { fires: ['Accept the Black companies from Philadelphia', 'Have the War Department accept the Black companies'], passes: ['Decline under the militia law', 'Leave it to the governors'] },
  },
  'press-suppression#0': {
    option: { fires: ['incite_mob_against_papers'], passes: ['ban_from_the_mails'] },
    label: { fires: ['Encourage the crowds against the papers'], passes: ['Send troops to disperse the mob'] },
  },
  'civilian-deaths-1861#0': {
    option: { fires: ['fire_on_the_crowd'], passes: ['disperse_the_crowd'] },
    label: { fires: ['Order the troops to fire on the crowd'], passes: ['Bring troops around Baltimore by Annapolis'] },
  },
  'guerrilla-war-west#0': {
    option: { fires: ['burn_the_towns', 'reprisal_on_civilians'], passes: ['guard_the_railroad'] },
    label: { fires: ['Burn the farms of known secessionists'], passes: ['Guard the railroad bridges'] },
  },
  // B1: killing irregulars, hostages, spies or parole-breakers, refused for ever (rule 1).
  'guerrilla-war-west#1': {
    option: { fires: ['hang_bushwhackers', 'shoot_hostages', 'execute_parole_breakers', 'kill_bridge_burners'], passes: ['hang_back', 'shoot_for_the_ford'] },
    label: { fires: ['Hang the bushwhackers', 'Shoot the bridge-burners on sight', 'Execute the spies at dawn'], passes: ['Hang back and wait for Patterson', 'Shot and shell for the batteries'] },
  },
  'capture-in-battle#0': {
    field: { fires: [{ field: 'captured_slaves', subject: null }, { field: 'enslaved-seized', subject: null }], passes: [{ field: 'region_control', subject: null }] },
    option: { fires: ['seize_the_slaves'], passes: ['seize_the_arsenal'] },
    label: { fires: ['Seize the slaves working on the batteries', 'Capture the servants of the rebel officers'], passes: ['Seize the arsenal', 'Sign the Confiscation Act'] },
  },
  'capture-in-battle#1': {
    option: { fires: ['no_quarter', 'shoot_the_prisoners'], passes: ['pursue'] },
    label: { fires: ['Give no quarter', 'Hang the captives as an example'], passes: ['Pursue the beaten enemy'] },
  },
  // N2: an arrest count as a score.
  'union-habeas-and-arrests#0': {
    field: { fires: [{ field: 'arrests_count', subject: null }, { field: 'arrested-total', subject: null }], passes: [{ field: 'habeas_suspended', subject: null }] },
  },
  'prisoners-and-exchange#0': {
    // S5: a captor-side count is refused; a strength effect (the surrender's own loss) passes.
    field: {
      fires: [{ field: 'prisoners', subject: null }, { field: 'region_prisoners_held', subject: null }, { field: 'hostages', subject: null }, { field: 'captured_men', subject: null }, { field: 'surrendered_total', subject: null }, { field: 'taken_count', subject: null }],
      passes: [{ field: 'casualties', subject: null }, { field: 'strength', subject: null }],
    },
  },
  'prisoners-and-exchange#1': {
    option: { fires: ['exchange_prisoners', 'propose_cartel', 'choose_hostage_by_lot', 'retaliate'], passes: ['protest_to_richmond', 'comply'] },
    // B1: parole in paraphrase is held too.
    label: {
      fires: ['Propose an exchange of prisoners', 'Choose a hostage by lot', 'Release them on parole', 'Let the captured men go home on their word', 'Release the prisoners', 'Send the surrendered garrison home'],
      passes: ['Produce the prisoner', 'Decline the writ and defend it to Congress', 'Let the ninety-day men go home'],
    },
  },
};

const signatures: { key: string; topic: string; sig: Signature }[] = topics.flatMap((t) => t.refused.map((sig, i) => ({ key: `${t.id}#${i}`, topic: t.id, sig })));
const optionRefused = (sig: Signature, id: string) => sig.optionPattern !== null && new RegExp(sig.optionPattern, 'u').test(id);
const labelRefused = (sig: Signature, text: string) => sig.labelPattern !== null && new RegExp(sig.labelPattern, 'iu').test(text);

describe('the Union register loads and every refused signature is probed', () => {
  it('loads with no errors', () => {
    expect(loaded.issues.filter((i) => i.severity === 'error')).toEqual([]);
  });

  it('every pattern of every signature has a probe that fires and one that passes, and no probe names a missing signature', () => {
    for (const { key, sig } of signatures) {
      const p = PROBES[key];
      expect(p, `probes for ${key}`).toBeDefined();
      const kinds: [keyof Probe, string | null][] = [['field', sig.fieldPattern ?? sig.subjectPattern], ['option', sig.optionPattern], ['label', sig.labelPattern]];
      for (const [kind, pattern] of kinds) {
        if (pattern === null) expect(p![kind], `${key} has no ${kind} pattern, so no ${kind} probe`).toBeUndefined();
        else {
          expect(p![kind]?.fires.length ?? 0, `${key}: a ${kind} probe that fires`).toBeGreaterThan(0);
          expect(p![kind]?.passes.length ?? 0, `${key}: a ${kind} probe that passes`).toBeGreaterThan(0);
        }
      }
    }
    expect(Object.keys(PROBES).sort()).toEqual(signatures.map((s) => s.key).sort());
  });
});

describe('probes through the matchers checkGate uses', () => {
  for (const { key, sig } of signatures) {
    const p = PROBES[key]!;
    it(`${key}: fires on its planted cases; its legal cases pass every signature in the register`, () => {
      for (const f of p.field?.fires ?? []) expect(signatureRefuses(sig, f.field, f.subject), `${key} refuses ${f.field} -> ${f.subject}`).toBe(true);
      for (const o of p.option?.fires ?? []) expect(optionRefused(sig, o), `${key} refuses option ${o}`).toBe(true);
      for (const l of p.label?.fires ?? []) expect(labelRefused(sig, l), `${key} refuses label "${l}"`).toBe(true);
      for (const { key: other, sig: s } of signatures) {
        for (const f of p.field?.passes ?? []) expect(signatureRefuses(s, f.field, f.subject), `${other} must not refuse ${f.field} -> ${f.subject}`).toBe(false);
        for (const o of p.option?.passes ?? []) expect(optionRefused(s, o), `${other} must not refuse option ${o}`).toBe(false);
        for (const l of p.label?.passes ?? []) expect(labelRefused(s, l), `${other} must not refuse label "${l}"`).toBe(false);
      }
    });
  }
});

/**
 * End to end: the Union register and classes laid over the testbed's (so the testbed's own topics still resolve), and one
 * edit to `eastwatch_stalls`'s second option per case. Only `gate-refused` at the edited place is read.
 */
const SIT = 'situations/eastwatch_stalls.json';
const LABEL_KEY = 'situation.eastwatch_stalls.option.send_the_fighter';
function overlay(): Record<string, string> {
  const register = JSON.parse(readTestbed('gate/register.json')) as { topics: unknown[] };
  const classes = JSON.parse(readTestbed('gate/classes.json')) as { classes: { id: string }[] };
  const ids = new Set(classes.classes.map((c) => c.id));
  return {
    'gate/register.json': JSON.stringify({ topics: [...register.topics, ...topics] }),
    'gate/classes.json': JSON.stringify({ classes: [...classes.classes, ...gate.classes.classes.filter((c) => !ids.has(c.id))] }),
  };
}
/** The testbed's triggers with the Union's after them, so the testbed's own topics still route. */
function overlayTriggers(): string {
  const t = JSON.parse(readTestbed('gate/triggers.json')) as { terms: unknown[]; allow?: string[] };
  return JSON.stringify({ terms: [...t.terms, ...gate.triggers.terms], allow: [...(t.allow ?? []), ...gate.triggers.allow] });
}
/** The testbed's forbidden patterns with the Union's after them. */
function overlayForbidden(): string {
  const f = JSON.parse(readTestbed('gate/forbidden.json')) as { patterns: unknown[] } & Record<string, unknown>;
  return JSON.stringify({ ...f, patterns: [...f.patterns, ...gate.forbidden.patterns] });
}
function refusedAt(edits: Record<string, string>, at: string): Issue[] {
  return loadPack(testbedFiles({ ...overlay(), ...edits })).issues.filter((i) => i.kind === 'gate-refused' && i.file === SIT && i.at === at);
}
function situation(edit: (s: Record<string, any>) => void): Record<string, string> {
  const s = JSON.parse(readTestbed(SIT)) as Record<string, any>;
  edit(s);
  return { [SIT]: JSON.stringify(s) };
}
const plantField = (f: Field) => situation((s) => s.options[1].effects.push({ propose: { owner: 'regions', field: f.field, subject: f.subject, delta: 5, reason: 'a-probe', side: 'north' } }));
const plantOption = (id: string) => situation((s) => (s.options[1].id = id));
function plantLabel(text: string): Record<string, string> {
  const table = JSON.parse(readTestbed('strings/en.json')) as Record<string, string>;
  return { 'strings/en.json': JSON.stringify({ ...table, [LABEL_KEY]: text }) };
}

describe('probes end to end through checkGate, the Union register over the testbed', () => {
  it('the overlay alone refuses nothing in the testbed', () => {
    expect(loadPack(testbedFiles(overlay())).issues.filter((i) => i.kind === 'gate-refused')).toEqual([]);
  });
  for (const { key } of signatures) {
    const p = PROBES[key]!;
    it(`${key}`, () => {
      for (const f of p.field?.fires ?? []) expect(refusedAt(plantField(f), 'options[1].effects[1]').length, `${key} refuses ${f.field} -> ${f.subject}`).toBeGreaterThan(0);
      for (const f of p.field?.passes ?? []) expect(refusedAt(plantField(f), 'options[1].effects[1]'), `${f.field} -> ${f.subject} passes`).toEqual([]);
      for (const o of p.option?.fires ?? []) expect(refusedAt(plantOption(o), 'options[1].id').length, `${key} refuses option ${o}`).toBeGreaterThan(0);
      for (const o of p.option?.passes ?? []) expect(refusedAt(plantOption(o), 'options[1].id'), `option ${o} passes`).toEqual([]);
      for (const l of p.label?.fires ?? []) expect(refusedAt(plantLabel(l), 'options[1].label').length, `${key} refuses label "${l}"`).toBeGreaterThan(0);
      for (const l of p.label?.passes ?? []) expect(refusedAt(plantLabel(l), 'options[1].label'), `label "${l}" passes`).toEqual([]);
    });
  }

  it('a protected field is refused as a target: the census enslaved population and arrivals at Union lines are read only by derivations', () => {
    for (const field of ['enslaved_population', 'region_reached_union_lines']) {
      const issues = loadPack(testbedFiles({ ...overlay(), ...plantField({ field, subject: null }) })).issues;
      expect(issues.some((i) => i.kind === 'gate-protected-target' && i.file === SIT), field).toBe(true);
    }
  });
});

describe('the triggers route every killing, reprisal and capture to a reviewer (gate review B1)', () => {
  const hit = (text: string) => triggerMatches(text, gate.triggers);
  it('each new trigger fires on its planted case', () => {
    const planted: Record<string, string> = {
      'hang|hangs|hung': 'Hang the bushwhackers',
      'bushwhack\\w*': 'The bushwhackers came at night',
      'jayhawk\\w*': 'Jayhawkers crossed from Kansas',
      'partisans?': 'Partisans cut the wire',
      'bridge[- ]burn\\w*': 'Bridge-burners on the line',
      'reprisals?': 'A reprisal followed',
      'retaliat\\w*': 'They threatened to retaliate',
      'lynch\\w*': 'The crowd lynched him',
      captured: 'Let the captured men go home on their word',
      'surrender(?:ed|s)?': 'The garrison surrendered at dawn',
    };
    for (const [term, text] of Object.entries(planted)) {
      expect(gate.triggers.terms.some((t) => t.term === term), term).toBe(true);
      expect(hit(text).length, `${term}: "${text}"`).toBeGreaterThan(0);
    }
    // The two labels the gate reviewer found passing every layer now need a tag.
    expect(hit('Let the captured men go home on their word')).toContain('captured');
    expect(hit('Hang the bushwhackers').length).toBeGreaterThan(0);
  });

  it('passes words that only share a stem, and the allowed place names', () => {
    for (const text of ['Wait at Hanging Rock', 'Change the partisanship of the press', 'Send Colonel Rook to stiffen him', 'Capture the ford']) expect(hit(text), text).toEqual([]);
  });

  it('end to end: an untagged option labelled with a trigger is refused for want of a tag', () => {
    const untagged = (label: string) => ({ ...plantLabel(label), ...situation((s) => { s.gateReview = null; }) });
    const tagless = (label: string) => loadPack(testbedFiles({ ...overlay(), 'gate/triggers.json': overlayTriggers(), ...untagged(label) })).issues.filter((i) => i.kind === 'gate-untagged' && i.file === SIT);
    expect(tagless('Hang the bushwhackers').length).toBeGreaterThan(0);
    expect(tagless('Let the captured men go home on their word').length).toBeGreaterThan(0);
    expect(tagless('Send Colonel Rook to stiffen him')).toEqual([]);
  });
});

describe('narrator rules while each hold stands (gate review S1; standing review S2)', () => {
  const TEXT_KEY = 'situation.eastwatch_stalls.text';
  const at = (text: string) => {
    const table = JSON.parse(readTestbed('strings/en.json')) as Record<string, string>;
    const edits = { ...overlay(), 'gate/forbidden.json': overlayForbidden(), 'strings/en.json': JSON.stringify({ ...table, [TEXT_KEY]: text }) };
    return loadPack(testbedFiles(edits)).issues.filter((i) => i.file === SIT && i.at === 'text' && (i.kind === 'gate-forbidden-wording' || i.kind === 'gate-review-note-missing')).map((i) => i.kind);
  };
  it('every new rule names its hold first, so whoever lifts the hold drops the rule', () => {
    const held = gate.forbidden.patterns.filter((p) => /^(?:held until R4|held until R6|needs-source)/.test(p.reason));
    expect(held.length).toBe(11);
    expect(held.every((p) => p.scope === 'narrator')).toBe(true);
    // Parole is review, not fail: a capture notice may state a surrender's cited terms (0074).
    expect(held.find((p) => p.pattern.startsWith('\\bparol'))!.severity).toBe('review');
  });

  it('refuses held content as notice text under any tag', () => {
    for (const text of [
      'The two commanders agreed to exchange prisoners man for man.',
      'Richmond chose hostages by lot from the Union officers held there.',
      'Federal troops burned the farms of known secessionists in the county in reprisal for the guerrillas.',
      "Jennison's men burned forty-two houses.",
      'They hanged the bushwhackers at the crossroads.',
      'The contraband camp at Hampton grew through the summer.',
    ]) expect(at(text), text).toContain('gate-forbidden-wording');
  });

  it('sends parole and the passive voice of camp labour to the reviewer, not to a refusal', () => {
    for (const text of ['General Butler released the prisoners on parole.', 'The freedpeople were set to work on the forts under the quartermaster.']) {
      const kinds = at(text);
      expect(kinds, text).toContain('gate-review-note-missing');
      expect(kinds, text).not.toContain('gate-forbidden-wording');
    }
  });

  it('passes what open topics must be able to say', () => {
    for (const text of ['Confederates burned the bridges in Baltimore County.', "Lyon's troops shot into the crowd at Camp Jackson.", 'The garrison surrendered; six hundred men were taken prisoner.']) expect(at(text), text).toEqual([]);
  });
});

describe('the reasons say what the hold is (gate review S6, B1)', () => {
  const reasons = (id: string) => topics.find((t) => t.id === id)!.refused.map((r) => r.reason);
  it('a permanent refusal on a held topic says so, so R6 cannot drop it', () => {
    const [reprisal, killing] = reasons('guerrilla-war-west');
    expect(reprisal!.startsWith('refused for ever (rule 1; 0029); not lifted by R6')).toBe(true);
    expect(killing!.startsWith('refused for ever (rule 1)')).toBe(true);
    expect(killing).not.toMatch(/\bheld\b/);
  });
});

describe('the source policy: the two memoirs are banned as evidence, the research-note pointers are weak (A6; the lead’s ruling)', () => {
  const policy = JSON.parse(files.read('gate/source-policy.json')!) as { banned: string[]; weak: string[] };
  const provenance = new Set((JSON.parse(files.read('PROVENANCE.json')!) as { sources: { key: string }[] }).sources.map((s) => s.key));
  const withPolicy = (citations: string[]) => ({
    ...overlay(),
    'gate/source-policy.json': files.read('gate/source-policy.json')!,
    ...situation((s) => (s.citations = citations.map((source) => ({ source, at: 'a probe' })))),
  });
  const kindsAt = (citations: string[]) => loadPack(testbedFiles(withPolicy(citations))).issues.filter((i) => i.file === SIT && (i.kind === 'gate-banned-source' || i.kind === 'gate-weak-sources'));

  it('bans exactly Rise and Fall and the Narrative, and every key it names is a pack source', () => {
    expect([...policy.banned].sort()).toEqual(['DAVIS-RF', 'JOHNSTON-1874']);
    for (const key of [...policy.banned, ...policy.weak]) expect(provenance.has(key), key).toBe(true);
    expect(policy.weak.every((k) => k.startsWith('NOTE-')), 'only the research-note pointers are weak').toBe(true);
    expect(policy.weak.some((k) => policy.banned.includes(k))).toBe(false);
  });

  it('a memoir cited as evidence is refused, even beside a primary source', () => {
    for (const memoir of ['DAVIS-RF', 'JOHNSTON-1874']) {
      expect(kindsAt([memoir, 'OR']).map((i) => `${i.kind} ${i.at}`), memoir).toEqual(['gate-banned-source citations[0].source']);
    }
  });

  it('a banned memoir cited anywhere in the pack is reported, people included: the six Union rows lane 1.11 re-sources (a warning until then)', () => {
    const hits = loaded.issues.filter((i) => i.kind === 'banned-source-cited');
    // A WARNING for now: this test pins the rows, and the check becomes an error in the merge where lane 1.11 re-sources them.
    expect(hits.every((i) => i.severity === 'warning')).toBe(true);
    const people = loaded.pack!.world.people;
    const rows = hits.map((i) => {
      const m = /^people\[(\d+)\]/.exec(i.at);
      return m === null ? `${i.file} ${i.at}` : people[Number(m[1])]!.id;
    });
    // The lead's brief named davis_jefferson; on disk his row cites neither memoir, and Lee's cites Johnston's Narrative.
    expect(rows.sort()).toEqual(['benjamin_judah_p', 'johnston_joseph_e', 'lee_robert_e', 'mallory_stephen_r', 'memminger_christopher_g', 'reagan_john_h']);
    for (const h of hits) expect(h.message).toMatch(/"(?:DAVIS-RF|JOHNSTON-1874)"/);
  });

  it('a research-note pointer alone is refused as weak, and passes beside a primary source', () => {
    expect(kindsAt(['NOTE-secession-winter-1861']).map((i) => i.kind)).toEqual(['gate-weak-sources']);
    expect(kindsAt(['NOTE-secession-winter-1861', 'OR'])).toEqual([]);
    expect(kindsAt(['OR'])).toEqual([]);
  });
});

describe('the register is consistent with the situations it names', () => {
  it('every Union situation tagged fugitive-policy that offers `return` lists it as superseded, so it expires with the Second Confiscation Act (B10)', () => {
    const superseded = new Set(topics.flatMap((t) => t.supersededOptions.map((s) => `${s.situation}/${s.option}`)));
    const tagged = (loaded.pack!.situations ?? []).filter((s) => {
      const t = s.gate as { topics?: readonly string[] };
      return (t.topics ?? []).includes('fugitive-policy') || s.options.some((o) => ((o.gate ?? {}) as { topics?: readonly string[] }).topics?.includes('fugitive-policy'));
    });
    for (const s of tagged) for (const o of s.options.filter((x) => x.id === 'return')) expect(superseded.has(`${s.id}/${o.id}`), `${s.id}/${o.id}`).toBe(true);
  });

  it('the held topics are exactly those SENSITIVE-HISTORY holds for 1A: prisoners-and-exchange (R4), guerrilla-war-west (R6), union-freedpeople-camps (needs-source)', () => {
    const held = topics.filter((t) => t.status === 'record' || t.needsSource).map((t) => t.id).sort();
    expect(held).toEqual(['guerrilla-war-west', 'prisoners-and-exchange', 'union-freedpeople-camps']);
  });
});
