import { expect, it } from 'vitest';
import { mintMessageId } from '../src/messages/transit.ts';
import { P } from './support/seats-fixture.ts';

it('S25 messages-02: a 110-character content key is preserved, and only longer keys are shortened', () => {
  const prefix = 'm.1.a_lead.a_gen.';
  const tag = 'x'.repeat(110 - prefix.length);
  const mint = new Set<string>();
  expect(mintMessageId(mint, 1, P('a_lead'), P('a_gen'), tag)).toBe(prefix + tag);
  expect(mintMessageId(mint, 1, P('a_lead'), P('a_gen'), tag)).toBe(prefix + tag + '.2');
  expect(mintMessageId(mint, 1, P('a_lead'), P('a_gen'), tag + 'x')).toMatch(/^m\.1\.[a-f0-9]{16}$/);
});
