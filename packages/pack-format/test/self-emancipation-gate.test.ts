import { describe, expect, it } from 'vitest';
import { loadPack } from '../src/index.ts';
import { editJson, testbedFiles } from './support/testbed.ts';

/**
 * The derived self-emancipation term's agency reasons are each one of the pack's gate register agency types
 * (SENSITIVE-HISTORY E3; lane 1.7, the standing review's control). The testbed's register lists `agency:fen-flight`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const refused = (edit: (m: Record<string, any>) => void) =>
  loadPack(testbedFiles(editJson('data/world.json', edit)))
    .issues.filter((i) => i.kind === 'gate-agency-reason')
    .map((i) => i.at);

describe('the term’s agency reasons against the gate register (lane 1.7)', () => {
  it('accepts the testbed’s listed type, and refuses a cause’s or a pressure flag’s type the register does not list', () => {
    expect(refused(() => undefined)).toEqual([]);
    expect(refused((m) => void (m.rules.selfEmancipation.agencyReasons.flightToLines = 'agency:not-listed'))).toEqual(['rules.selfEmancipation.agencyReasons.flightToLines']);
    expect(refused((m) => void (m.rules.selfEmancipation.pressureFlags = [{ flag: 'fen_levy', permille: 100, agency: 'agency:not-listed' }]))).toEqual(['rules.selfEmancipation.pressureFlags.fen_levy.agency']);
  });
});
