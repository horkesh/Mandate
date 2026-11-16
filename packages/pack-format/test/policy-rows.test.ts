import { describe, expect, it } from 'vitest';
import { IssueSink, loadPack, policyRows, validatePack, type GateData, type PackData } from '../src/index.ts';
import { testbedFiles } from './support/testbed.ts';

/**
 * The map from orders to values as gate content (lane 1.5b; the gate review's G-1.5a and G-1.5c; 0074): an option tagged
 * with a topic the map gates names its policy row; the row carries the topic; the option honours exactly the row's
 * values; a watched or superseded option's gated row has a floor, gated alike; every gate topic a row names is in the
 * register. And a person's practices (lane 1.5b): each one some row clashes with, each cited. Every check has its
 * positive control, against a clean case that raises nothing.
 */
const TOPIC = 'fen-flight';
type Row = { order: string; honours: string[]; gateTopics: string[]; notCheaperThan: string | null };
const row = (order: string, over: Partial<Row> = {}): Row => ({ order, honours: [], gateTopics: [TOPIC], notCheaperThan: null, ...over });
const ROWS: Row[] = [row('policy:shelter', { honours: ['duty'] }), row('policy:send_back', { notCheaperThan: 'policy:shelter' })];

function pack(rows: Row[] = ROWS): PackData {
  return { world: { rules: { people: { verbs: { orderValues: rows.map((r) => ({ boldness: 400, offends: [], clashes: [], ...r })) } } } }, scenarios: [{ posts: [{ id: 'p_army' }] }] } as unknown as PackData;
}
function gate(superseded: { situation: string; option: string }[] = []): GateData {
  return { register: { topics: [{ id: TOPIC, supersededOptions: superseded.map((s) => ({ ...s, law: 'a_law' })) }, { id: 'other', supersededOptions: [] }] } } as unknown as GateData;
}
type Opt = { id: string; policy?: { row: string; carriedBy: string[] } | null; honours?: string[]; watched?: boolean; gate?: unknown };
function item(options: Opt[], tag: unknown = { topics: [TOPIC], placement: 'decision', risks: [], actingSide: null }) {
  const def = { id: 'crossers', kind: 'decision', gate: tag, options: options.map((o) => ({ policy: null, honours: [], watched: false, gate: null, ...o })) };
  return { file: 'situations/crossers.json', def: def as never };
}
const shelter: Opt = { id: 'shelter', policy: { row: 'policy:shelter', carriedBy: ['p_army'] }, honours: ['duty'] };
const sendBack: Opt = { id: 'send_back', policy: { row: 'policy:send_back', carriedBy: ['p_army'] }, watched: true };

function raised(items: ReturnType<typeof item>[], p: PackData = pack(), g: GateData | null = gate()): string[] {
  const sink = new IssueSink();
  policyRows(items, p, g, sink);
  return sink.issues.map((i) => `${i.kind} ${i.at}`);
}

describe('policy rows (G-1.5a, G-1.5c)', () => {
  it('a gated decision whose options name gated rows, honour them exactly, and floor the watched one raises nothing', () => {
    expect(raised([item([shelter, sendBack])])).toEqual([]);
    // An ungated decision needs no policy rows.
    expect(raised([item([{ id: 'a' }, { id: 'b' }], { none: 'not gated' })])).toEqual([]);
  });

  it('an option of a gated decision that names no row is refused, even when only its own tag carries the topic', () => {
    expect(raised([item([shelter, { id: 'send_back', watched: true }])])).toEqual(['policy-missing options[1].policy']);
    expect(raised([item([{ id: 'x', gate: { topics: [TOPIC], placement: 'decision', risks: [], actingSide: null } }], { none: 'not gated' })])).toEqual(['policy-missing options[0].policy']);
  });

  it('an option must honour exactly its row’s values, so the map and a delegate’s choice cannot diverge', () => {
    expect(raised([item([{ ...shelter, honours: ['duty', 'glory'] }, sendBack])])).toEqual(['policy-honours options[0].honours']);
    expect(raised([item([{ ...shelter, honours: [] }, sendBack])])).toEqual(['policy-honours options[0].honours']);
  });

  it('the row an option names must carry the option’s gated topic', () => {
    const rows = [row('policy:shelter', { honours: ['duty'], gateTopics: ['other'] }), ROWS[1]!];
    // Shelter's row is then also an ungated floor for the watched option: both are refused.
    expect(raised([item([shelter, sendBack])], pack(rows))).toEqual(['policy-row-ungated options[0].policy.row', 'policy-floor-ungated options[1].policy.row']);
  });

  it('a watched option’s gated row names a floor (G-1.5c), and so does one the register supersedes', () => {
    const unfloored = [ROWS[0]!, row('policy:send_back')];
    expect(raised([item([shelter, sendBack])], pack(unfloored))).toEqual(['policy-floor-missing options[1].policy.row']);
    expect(raised([item([shelter, { ...sendBack, watched: false }])], pack(unfloored), gate([{ situation: 'crossers', option: 'send_back' }]))).toEqual(['policy-floor-missing options[1].policy.row']);
    // Neither watched nor superseded: no floor is required.
    expect(raised([item([shelter, { ...sendBack, watched: false }])], pack(unfloored))).toEqual([]);
  });

  it('the floor itself carries the same gate topics, so the reviewer signs it off too', () => {
    const rows = [row('policy:shelter', { honours: ['duty'], gateTopics: [] }), ROWS[1]!];
    // The shelter option is then ungated by its row too; only the floor's problem concerns us here.
    expect(raised([item([shelter, sendBack])], pack(rows))).toContain('policy-floor-ungated options[1].policy.row');
  });

  it('every gate topic a row names is a register topic, and a pack with gated rows and no register is refused', () => {
    const rows = [row('policy:shelter', { honours: ['duty'], gateTopics: [TOPIC, 'no-such-topic'] }), ROWS[1]!];
    expect(raised([], pack(rows))).toEqual(['gate-unknown-topic rules.people.verbs.orderValues[0].gateTopics[1]']);
    expect(raised([], pack(), null)).toEqual(['gate-unknown-topic rules.people.verbs.orderValues[0].gateTopics[0]', 'gate-unknown-topic rules.people.verbs.orderValues[1].gateTopics[0]']);
  });

  it('a row or a carrying post that does not exist is refused', () => {
    expect(raised([item([{ ...shelter, policy: { row: 'policy:nowhere', carriedBy: [] } }, sendBack])])).toEqual(['unknown-reference options[0].policy.row']);
    expect(raised([item([{ ...shelter, policy: { row: 'policy:shelter', carriedBy: ['no_post'] } }, sendBack])])).toEqual(['unknown-reference options[0].policy.carriedBy[0]']);
  });
});

describe('a person’s practices (lane 1.5b)', () => {
  const base = loadPack(testbedFiles()).pack!;
  const withPractice = (practice: string, cites: { source: string; at: string | null }[], clashes: string[]) => {
    const people = base.world.people.map((p, i) => (i === 0 ? { ...p, invented: false, practices: [{ practice, cites }] } : p));
    const verbs = base.world.rules.people.verbs;
    const orderValues = verbs.orderValues.map((r, i) => (i === 0 ? { ...r, clashes } : r));
    return { ...base, world: { ...base.world, people, rules: { ...base.world.rules, people: { ...base.world.rules.people, verbs: { ...verbs, orderValues } } } } } as PackData;
  };
  const kinds = (p: PackData) => validatePack(p).filter((i) => i.severity === 'error' && /practices/.test(i.at)).map((i) => i.kind);
  const cite = [{ source: base.provenance.sources.find((s) => s.kind !== 'pointer')!.key, at: null }];

  it('a cited practice that some row clashes with passes; one no row names, or one with no admissible citation, is refused', () => {
    expect(kinds(withPractice('keeps_crossers', cite, ['keeps_crossers']))).toEqual([]);
    expect(kinds(withPractice('keeps_crossers', cite, []))).toEqual(['unknown-reference']);
    expect(kinds(withPractice('keeps_crossers', [], ['keeps_crossers']))).toEqual(['value-without-citation']);
  });
});
