import { readFileSync } from 'node:fs';
import { expect, it } from 'vitest';

it('keeps the CLI and browser press presenters byte-identical', () => {
  // The desk source server denies sibling packages. Sharing an import would widen
  // that boundary; keep this small presenter local and enforce equality instead.
  const root = new URL('../../', import.meta.url);
  expect(readFileSync(new URL('prototypes/desk/web/press.ts', root)))
    .toEqual(readFileSync(new URL('packages/cli/src/desk/press.ts', root)));
});
