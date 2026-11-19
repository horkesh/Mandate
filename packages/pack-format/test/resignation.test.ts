import { describe, expect, it } from 'vitest';
import { errorsOf, generatePack, PersonSchema } from '../src/index.ts';
import { filesOf, withFile } from './support/fixture.ts';

function pack(government = 'b_war', on = '1900-06-09', side = 'blue', cites = 'DESIGN p1') {
  return generatePack(filesOf(withFile('source/world/people.csv', text => text.split('\n').map((line, i) =>
    line + (i === 0 ? ',service_government,resigned_on,resignation_side,resignation_bloc,resignation_cites'
      : line.startsWith('red_captain,') ? `,${government},${on},${side},,${cites}` : ',,,,,')).join('\n'))));
}

describe('sourced service choices in world format v2', () => {
  it('decodes optional service fields and keeps old people records valid', () => {
    const result = pack('r_war');
    expect(errorsOf(result.issues)).toEqual([]);
    expect(result.pack?.world.people.find(p => p.id === 'red_captain')?.service).toMatchObject({
      government: 'r_war', historicalOn: '1900-06-09', toFaction: 'blue', toBloc: null,
    });
    expect(result.pack?.world.people.find(p => p.id === 'red_chief')?.service).toBeUndefined();
  });
  it('rejects unknown governments and the officer’s present side', () => {
    expect(errorsOf(pack('missing').issues).some(i => i.kind === 'unknown-reference')).toBe(true);
    expect(errorsOf(pack('r_war', '1900-06-09', 'red').issues).some(i => i.kind === 'service-side')).toBe(true);
  });
  it('requires a real calendar date and a citation for a recorded departure', () => {
    expect(errorsOf(pack('r_war', '1900-02-30').issues).length).toBeGreaterThan(0);
    expect(errorsOf(pack('r_war', '1900-06-09', 'blue', '').issues).length).toBeGreaterThan(0);
    expect(PersonSchema.shape.service).toBeDefined();
  });
});
