import { ids, phase0, world as w } from '@mandate/kernel';
import { loadPack, type Issue } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';
import { v2Map } from '../src/seats-world.ts';
import { editJson, testbedFiles, type Edits } from '../../pack-format/test/support/testbed.ts';

/**
 * The post-holder check (lane 1.11, the lead's rule; rule 7). A notice that quotes a named man, or gives an act of his as
 * holder of a post, declares him in `speakers` and fires only while he holds that post (null: while he serves). One that
 * only names a man (a treaty's signers, an appointment as the record states it) says so in `namedOnly`. A place named for a
 * man names no man. On the testbed: Ambrose Pell holds the war office.
 */
const POST = (id: string) => ids.toId('post', id);
const P = (id: string) => ids.toId('person', id);

function quoteNotice(speaker: { post: string | null; person: string }): phase0.SituationDef {
  return {
    id: ids.toId('situation', 'pell_letter'), kind: 'notice', faction: ids.toId('faction', 'north'), title: 'situation.pell_letter.title', text: 'situation.pell_letter.text',
    earliest: '1861-03-01', event: { dayAtLeast: 1 }, knowledge: null, railroad: 'a test notice on day 1', chain: null, subjects: [], options: [],
    inaction: null, historicalDefault: null, staffLine: null, delegableTo: [], resurfaceOn: [], effects: [{ setFlag: 'pell_wrote' }],
    report: { authors: [POST('n_war_office')], reportType: 'wire-dispatch', subtype: null },
    speakers: [{ post: speaker.post === null ? null : POST(speaker.post), person: P(speaker.person) }],
    gate: { none: 'a test notice' }, gateReview: null, citations: [],
  };
}

function fired(def: phase0.SituationDef): boolean {
  const map = v2Map('testbed')!;
  const world = phase0.indexSeatsWorld(w.indexWorld(map.world), map.start, { situations: [def] });
  let state = phase0.createState(world, { seed: map.start.seed, people: 'as-history' });
  for (let d = 1; d <= 3; d++) state = phase0.tick(world, state, [], { freeze: true }).state;
  return state.situationFlags['pell_wrote'] !== undefined;
}

describe('a notice quoting a holder fires only while he holds his post', () => {
  it('fires while the named man holds the post it declares, and stays silent when another man holds it', () => {
    expect(fired(quoteNotice({ post: 'n_war_office', person: 'n_secretary' }))).toBe(true);
    expect(fired(quoteNotice({ post: 'n_war_office', person: 'n_governor' }))).toBe(false);
  });

  it('with no post declared, fires while the man serves', () => {
    expect(fired(quoteNotice({ post: null, person: 'n_secretary' }))).toBe(true);
  });
});

describe('the validator refuses a notice that names a man without declaring him', () => {
  const issues = (edits: Edits): Issue[] => [...loadPack(testbedFiles(edits)).issues].filter((i) => i.kind === 'post-holder-check');
  const withText = (text: string, extra: Record<string, unknown> = {}): Edits => ({
    ...editJson('strings/en.json', (s) => { s['situation.harbour_burning.text'] = text; }),
    ...editJson('situations/harbour_burning.json', (s) => Object.assign(s, extra)),
  });

  it('refuses a man named in the text with neither speakers nor namedOnly', () => {
    expect(issues(withText('Secretary Pell writes that the harbour town burned.'))).toEqual([expect.objectContaining({ file: 'situations/harbour_burning.json', at: 'speakers' })]);
  });

  it('accepts him declared as a speaker, or the naming explained, and ignores a place named for a man', () => {
    expect(issues(withText('Secretary Pell writes that the harbour town burned.', { speakers: [{ post: 'n_war_office', person: 'n_secretary' }] }))).toEqual([]);
    expect(issues(withText('Secretary Pell writes that the harbour town burned.', { namedOnly: 'a test: the name alone' }))).toEqual([]);
    expect(issues(withText('The garrison at Fort Pell reports the harbour town burned.'))).toEqual([]);
  });
});
