import { describe, expect, it } from 'vitest';
import { loadPack, type Issue } from '../src/index.ts';
import { editJson, testbedFiles, type Edits } from './support/testbed.ts';

/**
 * The lead's ruling on S17 (a recorded exception): an option may name a basis in law and practice instead of a person
 * only where the gate keeps it, a gated option the register supersedes or marks watched. On the testbed: `send_back` is
 * superseded by the sanctuary act and watched; `shelter` is neither.
 */
const issues = (edits: Edits): Issue[] => [...loadPack(testbedFiles(edits)).issues];
const basis = { basis: 'law-and-practice', cites: [{ source: 'TB-DESIGN', at: 'the fen law and the wardens who kept it' }] };
const withBasis = (option: string): Edits => editJson('situations/fen_crossing.json', (s) => {
  const o = s.options.find((x: { id: string }) => x.id === option);
  o.proposedBy = basis;
});
const basisIssues = (edits: Edits) => issues(edits).filter((i) => i.kind === 'proposal-basis');

describe('a proposal grounded in law and practice (the lead’s S17 ruling)', () => {
  it('accepts it on the gate-kept option the register supersedes and marks watched', () => {
    expect(basisIssues(withBasis('send_back'))).toEqual([]);
  });

  it('refuses it on any other option, which needs the persons who argued for it (C1)', () => {
    expect(basisIssues(withBasis('shelter'))).toEqual([expect.objectContaining({ at: 'options[1].proposedBy', file: 'situations/fen_crossing.json' })]);
  });

  it('accepts the principal’s own initiative, on record within the topic’s window, on a gated option (the lead’s S12 ruling)', () => {
    const initiative = (author: string, dated: string, extra: (s: Record<string, any>) => void = () => {}): Edits =>
      editJson('situations/fen_crossing.json', (s) => {
        s.options.find((x: { id: string }) => x.id === 'shelter').proposedBy = { basis: 'principal-initiative', author, dated, cites: [{ source: 'TB-DESIGN', at: 'his own letter' }] };
        extra(s);
      });
    expect(basisIssues(initiative('n_leader', '1861-03-01'))).toEqual([]);
    // Refused: another man's document.
    expect(basisIssues(initiative('n_secretary', '1861-03-01')).map((i) => i.at)).toEqual(['options[1].proposedBy.author']);
    // A document dated after the situation's earliest date was not on record before the decision.
    expect(basisIssues(initiative('n_leader', '1899-01-01')).map((i) => i.at)).toEqual(['options[1].proposedBy.dated']);
  });

  it('refuses the principal’s initiative on an ungated option', () => {
    const ungated = editJson('situations/eastwatch_followup.json', (s) => {
      s.options[0].proposedBy = { basis: 'principal-initiative', author: 'n_leader', dated: '1861-03-01', cites: [{ source: 'TB-DESIGN', at: null }] };
    });
    expect(basisIssues(ungated).map((i) => i.at)).toEqual(['options[0].proposedBy']);
  });

  it('resolves its cites against PROVENANCE.json', () => {
    const bad = editJson('situations/fen_crossing.json', (s) => {
      s.options.find((x: { id: string }) => x.id === 'send_back').proposedBy = { basis: 'law-and-practice', cites: [{ source: 'NO-SUCH-SOURCE', at: null }] };
    });
    expect(issues(bad).filter((i) => i.at === 'options[2].proposedBy.cites[0].source').map((i) => i.kind)).toEqual(['unknown-reference']);
  });
});
