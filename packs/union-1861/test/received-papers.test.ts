import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';
import { triggerMatches, type GateData } from '@mandate/pack-format';

it('S42: the sourced place name Lynchburg is a proper noun; lynching remains gated', () => {
  const triggers = JSON.parse(readFileSync(new URL('../gate/triggers.json', import.meta.url), 'utf8')) as GateData['triggers'];
  expect(triggerMatches('Reinforcements through Lynchburg.', triggers)).toEqual([]);
  expect(triggerMatches('A lynching at Lynchburg.', triggers)).toContain('lynching');
});
