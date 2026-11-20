import { describe, expect, it } from 'vitest';
import { loadPack, type Issue } from '../src/index.ts';
import { editJson, testbedFiles, type Edits } from './support/testbed.ts';

/**
 * The lead's S18 ruling: a decision may go without a staff line only as a typed, cited absence (the research that found no
 * adviser), told by a plain report. Without one, it is refused as before. On the testbed's fiction.
 */
const issues = (edits: Edits): Issue[] => [...loadPack(testbedFiles(edits)).issues].filter((i) => i.severity === 'error');
const report = { authors: ['n_war_office'], reportType: 'wire-dispatch', subtype: null };
const noStaff = (extra: Record<string, unknown>): Edits =>
  editJson('situations/eastwatch_followup.json', (s) => {
    s.staffLine = null;
    Object.assign(s, extra);
  });
const staffIssues = (edits: Edits) => issues(edits).filter((i) => i.at === 'staffLine' || i.at === 'staffAbsence' || i.at === 'report');

describe('a decision with no staff recommendation (the lead’s S18 ruling)', () => {
  it('is refused with neither a staff line nor a typed absence', () => {
    expect(staffIssues(noStaff({}))).toEqual([expect.objectContaining({ kind: 'situation-missing', at: 'staffLine' })]);
  });

  it('is accepted with a cited absence and a plain report', () => {
    expect(staffIssues(noStaff({ staffAbsence: { none: 'no-adviser-on-record', cites: [{ source: 'TB-DESIGN', at: 'the research found none' }] }, report }))).toEqual([]);
  });

  it('refuses an absence with no report, or beside a staff line', () => {
    const noReport = staffIssues(noStaff({ staffAbsence: { none: 'no-adviser-on-record', cites: [{ source: 'TB-DESIGN', at: null }] } }));
    expect(noReport.length).toBeGreaterThan(0);
    expect(noReport.every((i) => i.at === 'report')).toBe(true);
    const both = editJson('situations/eastwatch_followup.json', (s) => {
      s.staffAbsence = { none: 'no-adviser-on-record', cites: [{ source: 'TB-DESIGN', at: null }] };
    });
    expect(staffIssues(both)).toContainEqual(expect.objectContaining({ at: 'staffAbsence', message: expect.stringContaining('both a staff line') }));
  });
});
