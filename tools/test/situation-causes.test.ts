import { describe, expect, it } from 'vitest';
import { causeFindings } from '../rules/situation-causes.ts';

const item = (event: unknown, railroad?: string) => ({
  path: 'packs/fixture/situations/notice.json',
  value: { id: 'notice', event, railroad, citations: [{ source: 'RECORD', at: 'p. 4' }] },
});

describe('B2 cause ratchet', () => {
  it.each([
    [{ dayAtLeast: 98 }],
    [{ any: [{ flag: 'seceded' }, { dayAtLeast: 98 }] }],
    [{ all: [{ dayAtLeast: 98 }, { not: { flag: 'seceded' } }] }],
    [{ all: [{ dayAtLeast: 98 }, { flag: 'seceded' }] }, 'institutional act on its date'],
  ])('rejects a date fallback or a railroad even when a label sounds causal: %j', (event, railroad?: string) => {
    expect(causeFindings([item(event, railroad as string | undefined)], [])).toHaveLength(1);
  });
  it.each([
    { all: [{ dayAtLeast: 85 }, { flag: 'seceded' }] },
    { all: [{ dayAtLeast: 148 }, { callReceived: { post: 'governor', days: 0 } }] },
    { fired: 'previous_notice' },
  ])('accepts a mandatory State prerequisite: %j', event => {
    expect(causeFindings([item(event)], [])).toEqual([]);
  });
  it('requires an explicit cited exemption tied to the exact item', () => {
    const source = item({ dayAtLeast: 1 }, 'opening premise');
    const finding = causeFindings([source], [])[0]!;
    const exemption = { path: source.path, hash: finding.hash, kind: 'premise' as const, reason: 'The start already contains the garrison.', citation: 'docs/decisions/0042-premise.md, Decision' };
    expect(causeFindings([source], [exemption])).toEqual([]);
    expect(causeFindings([item({ dayAtLeast: 2 }, 'opening premise')], [exemption])).toHaveLength(1);
    expect(() => causeFindings([source], [{ ...exemption, citation: '' }])).toThrow(/citation/);
  });
  it('does not mistake a rail-dispatch report subtype for a railroad exemption', () => {
    expect(causeFindings([{ ...item({ flag: 'route_closed' }), value: { ...item({ flag: 'route_closed' }).value, report: { subtype: 'railroad-man' } } }], [])).toEqual([]);
  });
});
