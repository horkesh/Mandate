#!/usr/bin/env node
/**
 * Write the real mid-run save fixture (lane 0.6; the lane 0.1 reviewer's
 * request): the testbed, every seat on the rules model, saved after day 40.
 *
 *   npx tsx tools/make-save-fixture.ts
 *
 * `packages/cli/test/seats-run.test.ts` loads it and checks that its log
 * replays to its State and that play resumed from it ends on the continuous
 * run's hash. When that test fails because State's shape or a mechanic
 * changed: before any public build, regenerate the fixture with this script
 * and say so in the commit; after one, bump CURRENT_SAVE_SCHEMA, add a
 * migration, and keep the old fixture loading.
 */
import { fileURLToPath } from 'node:url';
import { writeFileAtomic } from '../packages/cli/src/io/atomic.ts';
import { seatsSave } from '../packages/cli/src/seats-run.ts';

export const FIXTURE_PACK = 'testbed';
export const FIXTURE_DAY = 40;
export const FIXTURE_PATH = fileURLToPath(new URL('../packages/cli/test/fixtures/saves/testbed-seats-day40.json', import.meta.url));

writeFileAtomic(FIXTURE_PATH, `${seatsSave(FIXTURE_PACK, FIXTURE_DAY)}\n`);
console.log(`wrote ${FIXTURE_PATH}`);
