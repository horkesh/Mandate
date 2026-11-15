import { loadPack, type GateData, type PackData } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';
import { packFilesAt, packRoot, v2Packs } from '../src/pack-files.ts';
import { MANPOWER_PROBES, selfGoverningSubjects, uncoveredProbes } from '../src/register-coverage.ts';

/**
 * The gate register covers a nation's land (0070; the gate review of the register tripwire). A pack with self-governing
 * departments must refuse, by its own signatures, manpower and population fields aimed at each of them and at each region
 * one governs: tested by probing a field id for every stem, not by reading the register's text (a fictional pack's
 * "fenfolk-population" once masked the check). A pack with no self-governing department has nothing to cover; the
 * first that has one (the Union pack, after the Indian Territory split) is held to it.
 */
const refused = (fieldPattern: string | null, subjectPattern: string | null) => ({ fieldPattern, subjectPattern, optionPattern: null, labelPattern: null, orderPattern: null, reason: 'a test signature' });
/** A pack as far as the check reads it: one nation, governing region r1 in one start, and the register's refused signatures. */
function pack(signatures: ReturnType<typeof refused>[], over: { nationKind?: boolean; extraRegion?: boolean } = {}): Pick<PackData, 'world' | 'scenarios' | 'gate'> {
  return {
    world: {
      vocabularies: { departmentKinds: [{ id: 'nation', government: true, selfGoverning: over.nationKind !== false }, { id: 'state', government: true, selfGoverning: false }] },
      departments: [
        { id: 'nation_x', kind: 'nation', polity: 'xfolk' },
        { id: 'a_state', kind: 'state' },
      ],
    },
    scenarios: [{ governments: [{ region: 'r1', department: 'nation_x' }, { region: 'r2', department: 'a_state' }, ...(over.extraRegion ? [{ region: 'r3', department: 'nation_x' }] : [])] }],
    gate: { register: { topics: [{ refused: signatures }] } },
  } as unknown as Pick<PackData, 'world' | 'scenarios' | 'gate'>;
}
const ALL = '^(region-)?(recruit|manpower|levy|draft|quota|enlist|population)';

describe('every pack that has self-governing governments covers them', () => {
  for (const id of v2Packs()) {
    it(`${id}: no manpower or population probe aimed at a nation or its land goes unrefused`, () => {
      const { pack: loaded } = loadPack(packFilesAt(packRoot(id)));
      expect(loaded, `${id} loads`).not.toBeNull();
      const gate = loaded!.gate as GateData | undefined;
      const subjects = selfGoverningSubjects(loaded!);
      const missing = uncoveredProbes({ world: loaded!.world, scenarios: loaded!.scenarios, gate });
      expect(missing, `${id} has self-governing departments ${subjects.departments.join(', ')} (regions ${subjects.regions.join(', ')}); add refused signatures with a fieldPattern and a subjectPattern to its gate register for: ${missing.map((m) => `${m.field} -> ${m.subject}`).join('; ')}`).toEqual([]);
    });
  }
});

describe('positive controls: the probe finds what a register leaves open', () => {
  it('a pack with a nation and no signatures leaves every stem open, against the department and its region', () => {
    const open = uncoveredProbes(pack([]));
    expect(open).toHaveLength(MANPOWER_PROBES.length * 2);
    expect(new Set(open.map((o) => o.subject))).toEqual(new Set(['nation_x', 'r1']));
  });

  it('a signature covering every stem, aimed at the nation and its region, covers it', () => {
    expect(uncoveredProbes(pack([refused(ALL, '^(nation_x|r1)$')]))).toEqual([]);
  });

  it('a signature aimed only at the department leaves its land open (the text of a pattern is not coverage)', () => {
    const open = uncoveredProbes(pack([refused(ALL, '^nation_')]));
    expect(open.map((o) => o.subject)).toEqual(Array(MANPOWER_PROBES.length).fill('r1'));
  });

  it('a signature for some stems only, or aimed at other subjects, leaves the rest open', () => {
    const some = uncoveredProbes(pack([refused('^(region-)?recruit', '^(nation_x|r1)$')]));
    expect(new Set(some.map((o) => o.stem))).toEqual(new Set(MANPOWER_PROBES.map((p) => p.stem).filter((s) => s !== 'recruit')));
    const elsewhere = uncoveredProbes(pack([refused(ALL, '^other_')]));
    expect(elsewhere).toHaveLength(MANPOWER_PROBES.length * 2);
    // A signature on the field alone is the old gap, covered here only because it refuses regardless of subject.
    expect(uncoveredProbes(pack([refused(ALL, null)]))).toEqual([]);
  });

  it('one spelling is not enough: an anchored ^recruit covers recruitment and misses region-recruitment (the gate review)', () => {
    const open = uncoveredProbes(pack([refused('^(recruit|manpower|levy|draft|quota|enlist|population)', '^(nation_x|r1)$')]));
    expect(new Set(open.map((o) => o.field))).toEqual(new Set(MANPOWER_PROBES.filter((p) => p.field.startsWith('region-')).map((p) => p.field)));
    expect(MANPOWER_PROBES.map((p) => p.field)).toEqual(expect.arrayContaining(['recruitment', 'region-recruitment', 'population', 'region-population']));
  });

  it('a second region the nation governs in another start must be covered too', () => {
    const open = uncoveredProbes(pack([refused(ALL, '^(nation_x|r1)$')], { extraRegion: true }));
    expect(open.every((o) => o.subject === 'r3')).toBe(true);
    expect(open).toHaveLength(MANPOWER_PROBES.length);
  });

  it('another pack’s signatures never count, and a pack with no self-governing department has nothing to cover', () => {
    // The check takes one pack’s own register: coverage in a neighbour is invisible to it.
    expect(uncoveredProbes({ ...pack([]), gate: undefined })).toHaveLength(MANPOWER_PROBES.length * 2);
    expect(uncoveredProbes(pack([], { nationKind: false }))).toEqual([]);
    expect(selfGoverningSubjects(pack([], { nationKind: false }))).toEqual({ departments: [], regions: [] });
  });
});
