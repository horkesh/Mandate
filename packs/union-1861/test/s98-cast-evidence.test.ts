import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const world = JSON.parse(readFileSync(new URL('../data/world.json', import.meta.url), 'utf8'));
const person = (id: string) => world.people.find((p: any) => p.id === id);

describe('S98 accepted cast evidence under 0085/0087', () => {
  it('holds starting temperament and personal regard without substituting averages', () => {
    for (const id of ['harris_isham_g', 'letcher_john', 'johnston_joseph_e', 'scott_winfield']) {
      const p = person(id);
      expect(p.temperament.boldness.direction, id).toBeNull();
      expect(p.regard.direction, id).toBeNull();
    }
    expect(person('harris_isham_g').temperament.candour.direction).toBeNull();
    expect(person('johnston_joseph_e').regardOthers).toEqual([]);
  });

  it('keeps the distinct innate window and removes late Johnston traits', () => {
    expect(person('harris_isham_g').centres.nerve.direction).toBe('above');
    expect(person('letcher_john').centres.nerve.direction).toBe('above');
    expect(person('johnston_joseph_e').traits.map((t: any) => t.trait)).toEqual(['rank_proud']);
    expect(person('johnston_joseph_e').centres.competence.direction).toBeNull();
  });

  it('enters the seven early additions and five alternative citation chains', () => {
    const blair = person('blair_montgomery');
    expect(blair.values.map((v: any) => v.value)).toEqual(expect.arrayContaining(['union', 'order']));
    expect(blair.temperament.boldness.direction).toBe('above');
    expect(person('brown_joseph_e').centres.reputation.direction).toBe('above');
    expect(person('moore_thomas_o').traits.map((t: any) => t.trait)).toContain('makes_policy');
    expect(person('harris_isham_g').values.map((v: any) => v.value)).toContain('state_autonomy');
    expect(person('pickens_francis_w').temperament.boldness.direction).toBe('above');
    for (const [id, values] of [
      ['scott_winfield', ['caution']], ['seward_william_h', ['union', 'conciliation']],
      ['hicks_thomas_h', ['union', 'state_autonomy']],
    ] as const) for (const value of values) {
      const cell = person(id).values.find((v: any) => v.value === value);
      expect(cell.cites.every((c: any) => c.source.startsWith('S98-')), `${id}/${value}`).toBe(true);
      expect(cell.cites.every((c: any) => c.at.includes('dated ') && c.at.includes('p')), `${id}/${value}`).toBe(true);
    }
  });
});
