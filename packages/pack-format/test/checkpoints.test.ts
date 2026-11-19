import { describe, expect, it } from 'vitest';
import { CHECKPOINTS_FILE, errorsOf, loadPack, publishedSchemas } from '../src/index.ts';
import { testbedFiles } from './support/testbed.ts';

/**
 * A pack's done-check bands (`checkpoints.json`, lane 1.14): optional, shape-checked, and checked against the World
 * they name, so a band can never point at a department, region or faction the pack does not have. On the testbed's
 * fictional terms (decision 0003).
 */
const cite = 'a research note, its section and the pages it read';
type Loose = { checkpoints: Record<string, unknown>[]; pushback: Record<string, unknown>[]; victory: Record<string, unknown> };
const good: Loose = {
  checkpoints: [
    { id: 'southern_side', date: '1861-05-01', kind: 'side-set', faction: 'south', departmentKinds: ['province'], exactly: ['s_province'], cite },
    { id: 'shire_side', date: '1861-05-01', kind: 'government-side', name: 'the shire', departments: ['n_province'], side: 'north', cite },
    { id: 'held', date: '1861-05-01', kind: 'held', region: 'e_lowlands', faction: 'north', throughout: false, cite },
    { id: 'men_north', date: '1861-05-01', kind: 'men', faction: 'north', min: 1000, max: 9000, floorBinding: true, cite },
    { id: 'ops_south', date: '1861-05-01', kind: 'operations-fought', faction: 'south', min: 0, max: null, cite },
  ],
  pushback: [{ id: 'holds', name: 'relay holds', count: { mechanic: 'orders.relay_held' }, through: '1861-05-01', min: 0, max: 4, cite }],
  victory: { capital: 1000, government: 100, menShare: 1, groundShare: 1, mandate: 1, cite },
};
const load = (value: unknown) => loadPack(testbedFiles({ [CHECKPOINTS_FILE]: JSON.stringify(value) }));
const messages = (value: unknown) => errorsOf(load(value).issues).map((i) => `${i.at}: ${i.message}`);

describe('the done check’s bands (checkpoints.json)', () => {
  it('is optional, and a sound file loads onto the pack', () => {
    expect(loadPack(testbedFiles()).pack!.checkpoints).toBeNull();
    const loaded = load(good);
    expect(errorsOf(loaded.issues)).toEqual([]);
    expect(loaded.pack!.checkpoints!.checkpoints).toHaveLength(5);
  });

  it('refuses a department, region or faction the World lacks, a department of a kind the set does not count, and a band upside down', () => {
    const bad = structuredClone(good);
    bad.checkpoints[0] = { ...bad.checkpoints[0], exactly: ['s_province', 'n_war', 'nowhere'] };
    bad.checkpoints[1] = { ...bad.checkpoints[1], departments: ['no_such'], side: 'east' };
    bad.checkpoints[2] = { ...bad.checkpoints[2], region: 'atlantis' };
    bad.checkpoints[3] = { ...bad.checkpoints[3], min: 9000, max: 1000 };
    const m = messages(bad).join('\n');
    expect(m).toContain('checkpoints[0].exactly[1]: department "n_war" is of kind "war_ministry", which the set does not count');
    expect(m).toContain('checkpoints[0].exactly[2]: department "nowhere" is not in the World');
    expect(m).toContain('checkpoints[1].side: faction "east" is not in the World');
    expect(m).toContain('checkpoints[1].departments[0]: department "no_such" is not in the World');
    expect(m).toContain('checkpoints[2].region: region "atlantis" is not in the World');
    expect(m).toContain('checkpoints[3].max: the upper bound 1000 is below the lower 9000');
  });

  it('refuses a date before the start and a repeated id', () => {
    const bad = structuredClone(good);
    bad.checkpoints[4] = { ...bad.checkpoints[4], id: 'held', date: '1861-01-01' };
    const m = messages(bad).join('\n');
    expect(m).toContain('1861-01-01 is before the start (1861-04-01)');
    expect(m).toContain('"held" is used twice');
  });

  it('refuses, by its shape, a band with no citation and a rung that is not pushback', () => {
    const bad = structuredClone(good);
    bad.pushback.push({ id: 'obey', name: 'obeyed', count: { response: 'comply' }, through: '1861-05-01', min: 0, max: null, cite: '' });
    const m = messages(bad).join('\n');
    expect(m).toMatch(/pushback\[1\]\.count/);
    expect(m).toMatch(/pushback\[1\]\.cite/);
  });

  it('is published as a JSON Schema beside the pack’s other files', () => {
    expect([...publishedSchemas().keys()]).toContain('checkpoints.schema.json');
  });
});
