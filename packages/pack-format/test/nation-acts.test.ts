import { describe, expect, it } from 'vitest';
import { atrocityTaint, IssueSink, loadPack, nationActs, type PackData } from '../src/index.ts';
import { editJson, testbedFiles } from './support/testbed.ts';

/**
 * A nation's act is its own, and stays with its own people (0070). The checks for a notice that moves a
 * self-governing department: it names whose act it is, carries a gate tag and a sign-off, depends on no principal's
 * decision by any route (the flag laundered through a notice is one), and has a reviewer's note on each event or news
 * route it does depend on. Dependence is checked on small graphs of situations, each probe with its positive control;
 * `polity` is checked on the testbed pack with in-memory edits.
 */
const NATION = 'nation_x';
const PACK = {
  world: {
    vocabularies: { departmentKinds: [{ id: 'nation', government: true, selfGoverning: true }, { id: 'state', government: true, selfGoverning: false }] },
    departments: [
      { id: NATION, kind: 'nation', polity: 'xfolk' },
      { id: 'nation_y', kind: 'nation', polity: 'yfolk' },
      { id: 'side_gov', kind: 'state' },
    ],
  },
} as unknown as PackData;

type Effect = Record<string, unknown>;
const move = (subject: string, field = 'department_side'): Effect => ({ propose: { owner: 'command', field, subject, delta: 1, reason: 'x', side: field === 'department_side' ? 'north' : null } });
const setFlag = (flag: string): Effect => ({ setFlag: flag });
const clearFlag = (flag: string): Effect => ({ clearFlag: flag });

interface Over {
  readonly kind?: 'decision' | 'notice';
  readonly event?: unknown;
  readonly knowledge?: unknown;
  readonly effects?: Effect[];
  readonly options?: { id: string; effects?: Effect[]; lockedCosts?: Effect[] }[];
  readonly inaction?: Effect[];
  readonly chain?: unknown;
  readonly acting?: string | undefined;
  readonly gate?: unknown;
  readonly review?: { notes: Record<string, string> } | null;
  readonly report?: unknown;
}
/** An item as far as the checks read it. A notice by default; a decision with options when `kind` says so. */
function item(id: string, o: Over = {}) {
  const kind = o.kind ?? 'notice';
  const def = {
    id,
    kind,
    event: o.event ?? { dayAtLeast: 1 },
    knowledge: o.knowledge ?? null,
    chain: o.chain ?? null,
    options: (o.options ?? []).map((x) => ({ id: x.id, effects: x.effects ?? [], lockedCosts: x.lockedCosts ?? [], appearsWhen: null, expiresWhen: null, waitsOn: null })),
    inaction: kind === 'decision' ? { effects: o.inaction ?? [] } : null,
    effects: kind === 'notice' ? (o.effects ?? []) : [],
    report: o.report ?? (kind === 'notice' ? { authors: ['p'], reportType: 'informal', subtype: null } : null),
    gate: o.gate ?? { topics: ['nations'], placement: 'event', risks: [], actingSide: null },
    gateReview: o.review === undefined ? { notes: {} } : o.review,
    ...(o.acting === undefined ? {} : { actingGovernment: o.acting }),
  };
  return { file: `situations/${id}.json`, def: def as never };
}
/** The issues the check raises for these items, as `kind` (and the file when given). */
function raised(items: ReturnType<typeof item>[]): string[] {
  const sink = new IssueSink();
  nationActs(items, PACK, sink);
  return sink.issues.map((i) => `${i.severity} ${i.kind} ${i.file.replace('situations/', '').replace('.json', '')}`);
}
const decision = (flagOnOption?: string, inactionFlag?: string) => item('treaty_choice', { kind: 'decision', options: [{ id: 'sign', effects: flagOnOption ? [setFlag(flagOnOption)] : [] }, { id: 'refuse' }], inaction: inactionFlag ? [setFlag(inactionFlag)] : [] });
/** A notice that moves the nation, whose act it is, correctly tagged and signed. */
const nationNotice = (id: string, over: Over = {}) => item(id, { effects: [move(NATION)], acting: NATION, ...over });

describe('whose act it is (0070)', () => {
  it('a notice that names the nation it moves, with a tag and a sign-off, is clean (positive control)', () => {
    expect(raised([nationNotice('council')])).toEqual([]);
    expect(raised([nationNotice('closing', { effects: [move(NATION, 'government_closed')] })])).toEqual([]);
  });

  it('refuses a notice that moves a nation and names no acting government (an act of one side authored as a notice)', () => {
    expect(raised([item('side_act', { effects: [move(NATION)] })])).toEqual(['error acting-government-missing side_act']);
  });

  it('refuses a notice whose acting government is not the one it moves', () => {
    expect(raised([item('side_act', { effects: [move(NATION)], acting: 'side_gov' })])).toEqual(['error acting-government-mismatch side_act']);
    // Two nations in one notice: each must be the acting government, so the second is refused.
    expect(raised([item('two', { effects: [move(NATION), move('nation_y')], acting: NATION })])).toEqual(['error acting-government-mismatch two']);
  });

  it('requires a gate topic and a sign-off', () => {
    expect(raised([nationNotice('untagged', { gate: { none: 'no gate' } })])).toEqual(['error self-governing-gate untagged']);
    expect(raised([nationNotice('unsigned', { review: null })])).toEqual(['error self-governing-gate unsigned']);
    expect(raised([nationNotice('both', { gate: { topics: [], placement: 'event', risks: [], actingSide: null }, review: null })])).toEqual(['error self-governing-gate both', 'error self-governing-gate both']);
  });

  it('leaves a notice that moves an ordinary government, or nothing, alone', () => {
    expect(raised([item('ordinary', { effects: [move('side_gov')] }), item('quiet', { effects: [setFlag('x')] })])).toEqual([]);
  });
});

describe('no principal’s choice moves a nation, by any route (0070)', () => {
  it('refuses a notice that reads a flag an option sets', () => {
    const laundered = nationNotice('council', { event: { flag: 'signed' } });
    expect(raised([decision('signed'), laundered])).toEqual(['error self-governing-choice council']);
    // Positive control: with no option setting the flag the notice reads, nothing depends on the choice.
    expect(raised([decision('other'), laundered])).toEqual([]);
  });

  it('refuses a flag laundered through a notice: an option sets F, a notice reads F and sets G, the nation notice reads G', () => {
    const wash = item('wash', { event: { flag: 'signed' }, effects: [setFlag('word_is_out')] });
    const nation = nationNotice('council', { event: { flag: 'word_is_out' } });
    const problems = raised([decision('signed'), wash, nation]);
    expect(problems).toEqual(['error self-governing-choice council']);
    // The message names the route through the notice.
    const sink = new IssueSink();
    nationActs([decision('signed'), wash, nation], PACK, sink);
    expect(sink.issues[0]!.message).toContain('depends on the principal\'s decision "treaty_choice", through "wash"');
    // Positive control: with the wash notice reading a flag nothing sets from a choice, nothing is refused for choice.
    expect(raised([decision('signed'), item('wash', { event: { flag: 'rumour' }, effects: [setFlag('word_is_out')] }), nation]).filter((k) => k.includes('choice'))).toEqual([]);
  });

  it('refuses reading the decision, an inaction flag, a chain stage after it, and the firing of a tainted notice', () => {
    expect(raised([decision('signed'), nationNotice('read', { event: { decided: 'treaty_choice', options: null } })])).toEqual(['error self-governing-choice read']);
    expect(raised([decision('signed'), nationNotice('named', { event: { decided: 'treaty_choice', options: ['sign'] } })])).toEqual(['error self-governing-choice named']);
    expect(raised([decision(undefined, 'ignored'), nationNotice('lapse', { event: { flag: 'ignored' } })])).toEqual(['error self-governing-choice lapse']);
    expect(raised([decision('signed'), nationNotice('stage', { chain: { id: 'c', stage: 2, follows: { situation: 'treaty_choice', options: null } } })])).toEqual(['error self-governing-choice stage']);
    const wash = item('wash', { event: { flag: 'signed' } });
    expect(raised([decision('signed'), wash, nationNotice('after', { event: { fired: 'wash' } })])).toEqual(['error self-governing-choice after']);
  });

  it('an option of the decision or its locked cost setting the flag counts too', () => {
    const lockedCost = item('treaty_choice', { kind: 'decision', options: [{ id: 'sign', lockedCosts: [setFlag('paid')] }] });
    expect(raised([lockedCost, nationNotice('council', { event: { flag: 'paid' } })])).toEqual(['error self-governing-choice council']);
  });
});

describe('every route a choice can take (gate re-check R1, R2, N4)', () => {
  it('clearing a flag is a route: an option clears F, and a notice reads that F is not set', () => {
    const clears = item('treaty_choice', { kind: 'decision', options: [{ id: 'sign', effects: [clearFlag('forts_held')] }, { id: 'refuse' }] });
    const nation = nationNotice('council', { event: { not: { flag: 'forts_held' } } });
    expect(raised([clears, nation])).toEqual(['error self-governing-choice council']);
    // Positive control: a flag nothing writes carries no choice.
    expect(raised([clears, nationNotice('council', { event: { not: { flag: 'other_flag' } } })])).toEqual([]);
    // A flag cleared by a notice carries the taint on, as a set one does.
    const wash = item('wash', { event: { flag: 'signed' }, effects: [clearFlag('quiet')] });
    expect(raised([decision('signed'), wash, nationNotice('council', { event: { not: { flag: 'quiet' } } })])).toEqual(['error self-governing-choice council']);
  });

  it('clearing a flag is a route in 0060’s atrocity taint too', () => {
    const atrocity = item('burning', { effects: [clearFlag('order_held')] }).def;
    const later = item('later', { event: { not: { flag: 'order_held' } } }).def;
    const unrelated = item('elsewhere', { event: { not: { flag: 'something_else' } } }).def;
    const taint = atrocityTaint([{ def: atrocity }, { def: later }, { def: unrelated }], [{ id: 'burning', actingSide: 'north' }]);
    expect(taint.get('later')).toEqual([{ option: null, atrocity: 'burning', actingSide: 'north', via: [] }]);
    expect(taint.get('elsewhere')).toBeUndefined();
  });

  it('refuses a nation notice that reads a standing goal, the principal’s own order', () => {
    const goal = { goal: { post: 'army_x', kind: 'advance' } };
    expect(raised([nationNotice('council', { event: { all: [{ dayAtLeast: 1 }, goal] } })])).toEqual(['error self-governing-goal council']);
    expect(raised([nationNotice('council', { knowledge: { not: goal } })])).toEqual(['error self-governing-goal council']);
  });

  it('a goal read laundered through a middle notice is still the principal’s order (gate re-check R3)', () => {
    const goal = { goal: { post: 'army_x', kind: 'advance' } };
    const middle = item('a_middle', { event: goal, effects: [setFlag('ordered')] });
    const nation = nationNotice('b_council', { event: { flag: 'ordered' } });
    expect(raised([middle, nation])).toEqual(['error self-governing-choice b_council']);
    // The message names what it depends on: the standing goal of the post, not a decision (the standing reviewer's N6).
    const sink = new IssueSink();
    nationActs([middle, nation], PACK, sink);
    expect(sink.issues[0]!.message).toContain('depends on the standing goal of post "army_x", through "a_middle"');
    expect(sink.issues[0]!.message).not.toContain('decision');
    // With a note on the route through the middle notice it is still refused: 0070 refuses choices outright, notes cover only news.
    expect(raised([middle, { ...nation, def: { ...(nation.def as object), gateReview: { notes: { 'route|a_middle': 'The nation answers it.' } } } as never }])).toEqual(['error self-governing-choice b_council']);
    // Positive control: a middle notice reading no goal is only an event route, needing its note.
    expect(raised([item('a_middle', { event: { dayAtLeast: 1 }, effects: [setFlag('ordered')] }), nation])).toEqual(['error self-governing-route-note b_council']);
    // A headquarters through a middle item stays news: a note covers it.
    const hq = item('a_middle', { event: { headquartersAt: { post: 'army_x', region: 'n1' } }, effects: [setFlag('ordered')] });
    expect(raised([hq, { ...nation, def: { ...(nation.def as object), gateReview: { notes: { 'route|a_middle': 'The nation answers the army standing on its land.' } } } as never }])).toEqual([]);
  });

  it('a headquarters is a consequence: it needs a route note naming the post and the region', () => {
    const at = { headquartersAt: { post: 'army_x', region: 'n1' } };
    expect(raised([nationNotice('council', { event: at })])).toEqual(['error self-governing-route-note council']);
    expect(raised([nationNotice('council', { event: at, review: { notes: { 'route|state:headquartersAt:army_x:n1': 'The nation answers the army standing on its land.' } } })])).toEqual([]);
    // A note on another post or region does not cover it.
    expect(raised([nationNotice('council', { event: at, review: { notes: { 'route|state:headquartersAt:army_x:n2': 'x' } } })])).toEqual(['error self-governing-route-note council']);
  });

  it('follows a choice through two notices, whatever order the items are read in (a one-pass fixed point would miss it)', () => {
    // The ids sort so that the nation notice is read first and the washes after it, in the order that defeats one pass.
    const first = item('c_wash', { event: { flag: 'signed' }, effects: [setFlag('g')] });
    const second = item('b_wash', { event: { flag: 'g' }, effects: [setFlag('h')] });
    const nation = nationNotice('a_council', { event: { flag: 'h' } });
    expect(raised([decision('signed'), first, second, nation])).toEqual(['error self-governing-choice a_council']);
    const sink = new IssueSink();
    nationActs([decision('signed'), first, second, nation], PACK, sink);
    expect(sink.issues[0]!.message).toContain('through "c_wash" then "b_wash"');
    // Positive control: break the middle link and it is no longer a choice, only an event (a flag a notice sets) that needs its route note.
    expect(raised([decision('signed'), first, item('b_wash', { event: { flag: 'unrelated' }, effects: [setFlag('h')] }), nation])).toEqual(['error self-governing-route-note a_council']);
  });
});

describe('events and news are allowed, with the reviewer’s note on the route (0070)', () => {
  const event = { fired: 'treaty_choice' };
  const news = { knows: { subjectKind: 'situation', subjectId: 'fort_taken', reportType: null, subtype: null, claimKind: null, token: null } };
  const noted = (dep: string) => ({ notes: { [`route|${dep}`]: 'The nation answers the fort taken, not the president\'s choice.' } });

  it('a notice that depends on a decision only by its firing needs a note on that route', () => {
    expect(raised([decision(), nationNotice('council', { event })])).toEqual(['error self-governing-route-note council']);
    expect(raised([decision(), nationNotice('council', { event, review: noted('treaty_choice') })])).toEqual([]);
  });

  it('news of another item needs a note on it, and a note on another route does not cover it', () => {
    const fort = item('fort_taken', { effects: [setFlag('fort_gone')] });
    expect(raised([fort, nationNotice('council', { event: { dayAtLeast: 1 }, knowledge: news })])).toEqual(['error self-governing-route-note council']);
    expect(raised([fort, nationNotice('council', { event: { dayAtLeast: 1 }, knowledge: news, review: noted('fort_taken') })])).toEqual([]);
    expect(raised([fort, nationNotice('council', { event: { dayAtLeast: 1 }, knowledge: news, review: noted('somewhere_else') })])).toEqual(['error self-governing-route-note council']);
    // A flag a notice sets is an event too.
    expect(raised([fort, nationNotice('council', { event: { flag: 'fort_gone' } })])).toEqual(['error self-governing-route-note council']);
  });

  it('a blank note does not count, and a notice that depends on nothing needs none', () => {
    expect(raised([decision(), nationNotice('council', { event, review: { notes: { 'route|treaty_choice': '  ' } } })])).toEqual(['error self-governing-route-note council']);
    expect(raised([decision(), nationNotice('council')])).toEqual([]);
  });

  it('a decision that moves a nation is left to the decision refusal (0069)', () => {
    expect(raised([item('rash', { kind: 'decision', options: [{ id: 'go', effects: [move(NATION)] }] })])).toEqual([]);
  });
});

describe('polity keeps a nation’s land with its own people (0070)', () => {
  const edit = (change: (m: Record<string, any>) => void) => editJson('data/world.json', change);
  const markProvince = (m: Record<string, any>) => void (m.vocabularies.departmentKinds.find((k: { id: string }) => k.id === 'province').selfGoverning = true);
  const kinds = (edits: Record<string, string | null>, kind: string) => loadPack(testbedFiles(edits)).issues.filter((i) => i.kind === kind).map((i) => `${i.severity} ${i.at}`);

  it('refuses a self-governing department with no polity, and accepts one with it (positive control)', () => {
    const without = edit(markProvince);
    expect(kinds(without, 'self-governing-no-polity')).toHaveLength(1);
    const withPolity = edit((m) => {
      markProvince(m);
      for (const d of m.departments.filter((x: { kind: string }) => x.kind === 'province')) d.polity = 'provincials';
    });
    expect(kinds(withPolity, 'self-governing-no-polity')).toEqual([]);
  });

  it('refuses a region held by a polity in one start and by a department of no polity in another', () => {
    const split = {
      ...edit((m) => {
        markProvince(m);
        for (const d of m.departments.filter((x: { kind: string }) => x.kind === 'province')) d.polity = 'provincials';
      }),
      ...editJson('data/scenarios/summer_front.json', (sc) => {
        // s_coast_east passes, in the second start, to a department that names no polity (an ordinary government).
        for (const g of sc.governments) if (g.department === 's_province') g.department = 'n_executive';
      }),
    };
    const found = kinds(split, 'polity-shared-region');
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((f) => f.startsWith('error'))).toBe(true);
  });

  it('refuses two polities governing one region in different starts', () => {
    const split = {
      ...edit((m) => {
        markProvince(m);
        const province = m.departments.find((d: { kind: string }) => d.kind === 'province');
        province.polity = 'provincials';
        m.departments.push({ ...province, id: 's_rival', polity: 'rivals' });
      }),
      ...editJson('data/scenarios/summer_front.json', (s) => {
        for (const g of s.governments) if (g.department === 's_province') g.department = 's_rival';
      }),
    };
    const found = kinds(split, 'polity-shared-region');
    expect(found.length).toBeGreaterThan(0);
    expect(found.every((f) => f.startsWith('error'))).toBe(true);
    // Positive control: the same rival, of the same polity, is the nation's own rival government.
    const sameFolk = {
      ...edit((m) => {
        markProvince(m);
        const province = m.departments.find((d: { kind: string }) => d.kind === 'province');
        province.polity = 'provincials';
        m.departments.push({ ...province, id: 's_rival', polity: 'provincials' });
      }),
      ...editJson('data/scenarios/summer_front.json', (s) => {
        for (const g of s.governments) if (g.department === 's_province') g.department = 's_rival';
      }),
    };
    expect(kinds(sameFolk, 'polity-shared-region')).toEqual([]);
  });
});
