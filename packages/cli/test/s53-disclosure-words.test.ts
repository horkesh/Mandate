import { expect, it } from 'vitest';
import type { ReportView } from '@mandate/kernel/seat-api';
import { reportBody } from '../src/desk/dispatches.ts';
import { deskStrings } from '../src/pack-text.ts';
import { packStrings } from '../src/seats-world.ts';

it('S53 prints only the originator named by the received paper', () => {
  const t = deskStrings({ ...packStrings('testbed'), 'person.source.name': 'The messenger' });
  const report = { id: 'forwarded', type: 'informal', subtype: 'cabinet-word', author: 'relayer', authorPost: null,
    subjectKind: 'region', subjectId: 'front', claims: [], day: 2, hour: null, receivedDay: 2, route: 'courier', via: [], advice: null, answers: null } as unknown as ReportView;
  const original = reportBody(report, t);
  expect(reportBody({ ...report, claims: [{ kind: 'originator', value: 0, token: null, region: null, confidence: 1000 }] }, t)).toContain('The originator is not named.');
  expect(reportBody({ ...report, claims: [{ kind: 'originator', value: 1, token: 'source', region: null, confidence: 1000 }] }, t)).toContain('Originator: The messenger.');
  expect(original).not.toContain('originator');
});
