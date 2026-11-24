import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canonicalHash } from '../src/serialize/hash.ts';
import {
  CURRENT_SAVE_SCHEMA,
  decodeSave,
  encodeSave,
  makeSave,
  migrationProblems,
  SAVE_MIGRATIONS,
  SaveError,
  type SaveMigration,
} from '../src/serialize/save.ts';

const fixture = (version: number) => new URL(`./fixtures/saves/v${version}.json`, import.meta.url);

const WORLD = canonicalHash({ world: 'fixture' });
const content = { worldHash: WORLD, state: { day: 12, seed: 1861, regions: { r1: { controller: 'f1' } } }, log: [{ day: 3, seat: 's1', command: { verb: 'hold' } }] };

function problemOf(f: () => unknown): string {
  try {
    f();
  } catch (e) {
    if (e instanceof SaveError) return e.problem;
    throw e;
  }
  return 'none';
}

describe('versioned saves', () => {
  it('round-trips state and log, with hashes, as canonical text', () => {
    const text = encodeSave(content);
    expect(text).toBe(encodeSave({ ...content, state: { regions: { r1: { controller: 'f1' } }, seed: 1861, day: 12 } }));
    const save = decodeSave(text, { expectedWorldHash: WORLD });
    expect(save.schemaVersion).toBe(CURRENT_SAVE_SCHEMA);
    expect(save.state).toEqual(content.state);
    expect(save.log).toEqual(content.log);
    expect(save.stateHash).toBe(canonicalHash(content.state));
    expect(save.logHash).toBe(canonicalHash(content.log));
  });

  it('refuses non-canonical state at save time', () => {
    expect(() => makeSave({ worldHash: WORLD, state: { loyalty: 0.5 } })).toThrow('not canonical at $.loyalty');
  });

  it('detects tampering, the wrong world, a newer schema and garbage', () => {
    const save = JSON.parse(encodeSave(content)) as Record<string, unknown>;
    expect(problemOf(() => decodeSave(JSON.stringify({ ...save, state: { day: 13 } })))).toBe('hash_mismatch');
    expect(problemOf(() => decodeSave(JSON.stringify({ ...save, log: [] })))).toBe('hash_mismatch');
    expect(problemOf(() => decodeSave(encodeSave(content), { expectedWorldHash: canonicalHash('other') }))).toBe('hash_mismatch');
    expect(problemOf(() => decodeSave(JSON.stringify({ ...save, schemaVersion: CURRENT_SAVE_SCHEMA + 1 })))).toBe('newer_than_supported');
    expect(problemOf(() => decodeSave(JSON.stringify({ ...save, format: 'awwv-save' })))).toBe('wrong_format');
    expect(problemOf(() => decodeSave(JSON.stringify({ ...save, extra: 1 })))).toBe('bad_envelope');
    expect(problemOf(() => decodeSave('{"format":'))).toBe('not_json');
    expect(problemOf(() => decodeSave(JSON.stringify({ ...save, state: { x: 1.5 } })))).toBe('not_canonical');
  });
});

describe('the migrations registry', () => {
  it('steps contiguously from schema 1 to the current schema', () => {
    expect(migrationProblems(SAVE_MIGRATIONS, CURRENT_SAVE_SCHEMA)).toEqual([]);
  });

  it('keeps a fixture save for every schema version, and loads each one (save compatibility)', () => {
    for (let version = 1; version <= CURRENT_SAVE_SCHEMA; version++) {
      expect(existsSync(fixture(version)), `test/fixtures/saves/v${version}.json`).toBe(true);
      const save = decodeSave(readFileSync(fixture(version), 'utf8'));
      expect(save.schemaVersion).toBe(CURRENT_SAVE_SCHEMA);
    }
  });

  it('the current fixture is exactly what this build writes for the same content', () => {
    expect(readFileSync(fixture(CURRENT_SAVE_SCHEMA), 'utf8').trimEnd()).toBe(encodeSave(content));
  });

  it('loads pre-task and task-era saves without inventing allocations, releases or receipts', () => {
    const state = { operationRecords: { mission: { opPost: 'field', opStartDay: 4, opEndDay: null,
      opAxes: [{ oaxBlocks: ['block'], oaxStage: 'march' }], opRequests: [] } },
      dispatches: {}, receipts: {}, forceAssignments: { block: 'field' } };
    for (const schemaVersion of [6, 7]) {
      const old = { ...makeSave({ worldHash: WORLD, state, log: content.log }), schemaVersion };
      const loaded = decodeSave(JSON.stringify(old));
      expect(loaded).toEqual({ ...old, schemaVersion: CURRENT_SAVE_SCHEMA });
      expect(loaded.state).toEqual(state);
    }
  });

  it('preserves older hashes and round-trips unknown stragglers in schema 3', () => {
    const original = JSON.parse(readFileSync(fixture(2), 'utf8'));
    expect(decodeSave(JSON.stringify(original))).toMatchObject({ schemaVersion: CURRENT_SAVE_SCHEMA, stateHash: original.stateHash, logHash: original.logHash });
    const state = { forceBlockStates: { sample: { fbLots: [{ lotId: 'unknown', lotMen: null, lotStragglers: null }] } } };
    expect(decodeSave(encodeSave({ worldHash: WORLD, state })).state).toEqual(state);
  });

  it('runs migrations in order and recomputes hashes (a hypothetical schema 3)', () => {
    const toV2: SaveMigration = {
      from: 1,
      to: 2,
      change: 'rename regions.*.controller to holder',
      migrate: ({ state, log }) => {
        const s = state as { regions: Record<string, { controller: string }> };
        const regions = Object.fromEntries(Object.entries(s.regions).map(([id, r]) => [id, { holder: r.controller }]));
        return { state: { ...s, regions }, log };
      },
    };
    const toV3: SaveMigration = { from: 2, to: 3, change: 'add a turn counter', migrate: ({ state, log }) => ({ state: { ...(state as object), turn: 0 }, log }) };
    const registry = [toV2, toV3];
    expect(migrationProblems(registry, 3)).toEqual([]);
    const save = decodeSave(readFileSync(fixture(1), 'utf8'), { migrations: registry, currentSchema: 3 });
    expect(save.schemaVersion).toBe(3);
    expect(save.state).toEqual({ day: 12, seed: 1861, regions: { r1: { holder: 'f1' } }, turn: 0 });
    expect(save.stateHash).toBe(canonicalHash(save.state));
    expect(problemOf(() => decodeSave(readFileSync(fixture(1), 'utf8'), { migrations: [toV3], currentSchema: 3 }))).toBe('missing_migration');
  });

  it('reports gaps, repeats and jumps in a registry', () => {
    const step = (from: number, to: number): SaveMigration => ({ from, to, change: '', migrate: (s) => s });
    expect(migrationProblems([step(1, 2)], 3)).toEqual(['no migration from schema 2']);
    expect(migrationProblems([step(1, 2), step(1, 2), step(2, 3)], 3)).toEqual(['2 migrations from schema 1']);
    expect(migrationProblems([step(1, 3)], 3)).toEqual(['no migration from schema 2', 'migration 1 -> 3 must step by one']);
  });
});
