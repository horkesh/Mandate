import { migrateStrengthKinds } from '../forces/migrations.ts';
/**
 * Versioned saves (FOUNDATION section 11.2; AWWV lesson M4).
 *
 * A save is an envelope: a schema version, the hash of the World it runs on
 * (World data is never saved; a save references it by hash), the State
 * snapshot and the command log, each with its hash. Loading checks the
 * hashes, then runs the migrations registry from the save's version up to the
 * current one. Every schema version keeps a fixture save in
 * `test/fixtures/saves/`, and a test loads each one forever after.
 *
 * The kernel only encodes and decodes text. Writing files (atomically:
 * temporary file, then rename) is the CLI's job; the kernel has no I/O.
 */
import { strictCompare } from '../compare.ts';
import { canonicalJson, CanonicalError, type CanonicalValue } from './canonical.ts';
import { canonicalHash } from './hash.ts';

export const SAVE_FORMAT = 'mandate-save';

/** Bump this, and add a migration and a fixture, whenever the saved shape changes. */
export const CURRENT_SAVE_SCHEMA = 7;

export interface SaveEnvelope {
  readonly format: typeof SAVE_FORMAT;
  readonly schemaVersion: number;
  /** Hash of the World (pack data) this state runs on. */
  readonly worldHash: string;
  readonly state: CanonicalValue;
  readonly stateHash: string;
  /** The command log: the truth about what happened (decision 0015). */
  readonly log: readonly CanonicalValue[];
  readonly logHash: string;
}

/** What a caller provides to make a save; the hashes are computed, never supplied. */
export interface SaveContent {
  readonly worldHash: string;
  readonly state: unknown;
  readonly log?: readonly unknown[];
}

/**
 * One step in the migrations registry. `migrate` receives an envelope at
 * schema `from` (hashes already verified) and returns the state and log at
 * schema `to`; the loader recomputes the hashes.
 */
export interface SaveMigration {
  readonly from: number;
  readonly to: number;
  /** What changed, for the record. */
  readonly change: string;
  migrate(save: { readonly state: CanonicalValue; readonly log: readonly CanonicalValue[] }): {
    readonly state: unknown;
    readonly log: readonly unknown[];
  };
}

/** Append new steps. The absent receipt and dispatch collections are their canonical empty form. */
export const SAVE_MIGRATIONS: readonly SaveMigration[] = [{
  from: 1, to: 2,
  change: 'Introduce optional authored dispatch and receipt collections; older saves retain implicit empty collections and their original state hash.',
  migrate: save => save,
}, {
  from: 2, to: 3,
  change: 'Allow unknown lot stragglers and named transfer orders. Existing lot values and orders are preserved exactly.',
  migrate: save => save,
}, {
  from: 3, to: 4,
  change: 'Label model-raised lots as rule; historical quantities without saved provenance become unknown. Never invent a return.',
  migrate: ({state,log}) => ({state:migrateStrengthKinds(state),log}),
}, {
  from: 4, to: 5,
  change: 'Optional neutral governor offers, office call addresses and whole-block landings. Absent offers stay empty; never fabricate an undertaking or receipt for an old call.',
  migrate: save => save,
}, {
  from: 5, to: 6,
  change: 'Optional received assignments, onward journeys, course advice and consultation copies. Existing saves gain no grant, directive, receipt or judgment.',
  migrate: save => save,
}, {
  from: 6, to: 7,
  change: 'Optional operation tasks and ordinary task support references. Absent tasks retain empty unknown history; never invent an earlier allocation, release or receipt.',
  migrate: save => save,
}];

export type SaveProblem =
  | 'not_json'
  | 'not_canonical'
  | 'wrong_format'
  | 'bad_envelope'
  | 'newer_than_supported'
  | 'missing_migration'
  | 'hash_mismatch';

export class SaveError extends Error {
  constructor(
    readonly problem: SaveProblem,
    detail: string,
  ) {
    super(`save ${problem}: ${detail}`);
    this.name = 'SaveError';
  }
}

/** Build an envelope at the current schema. Throws `CanonicalError` if the state or log is not canonical. */
export function makeSave(content: SaveContent): SaveEnvelope {
  return envelopeAt(CURRENT_SAVE_SCHEMA, content.worldHash, content.state, content.log ?? []);
}

/** The save's text: canonical JSON of the envelope, so equal saves are equal bytes. */
export function encodeSave(content: SaveContent): string {
  return canonicalJson(makeSave(content));
}

/**
 * Parse a save, verify its hashes, and migrate it to the current schema.
 * `expectedWorldHash`, when given, must match the save's World.
 */
export function decodeSave(
  text: string,
  options: { readonly expectedWorldHash?: string; readonly migrations?: readonly SaveMigration[]; readonly currentSchema?: number } = {},
): SaveEnvelope {
  const migrations = options.migrations ?? SAVE_MIGRATIONS;
  const current = options.currentSchema ?? CURRENT_SAVE_SCHEMA;
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    throw new SaveError('not_json', (e as Error).message);
  }
  try {
    canonicalJson(raw);
  } catch (e) {
    if (e instanceof CanonicalError) throw new SaveError('not_canonical', e.message);
    throw e;
  }
  let save = checkEnvelope(raw);
  if (save.schemaVersion > current) {
    throw new SaveError('newer_than_supported', `save is schema ${save.schemaVersion}, this build reads up to ${current}`);
  }
  verifyHashes(save);
  if (options.expectedWorldHash !== undefined && save.worldHash !== options.expectedWorldHash) {
    throw new SaveError('hash_mismatch', `save runs on world ${save.worldHash}, expected ${options.expectedWorldHash}`);
  }
  while (save.schemaVersion < current) {
    const step = migrations.find((m) => m.from === save.schemaVersion);
    if (!step) throw new SaveError('missing_migration', `no migration from schema ${save.schemaVersion}`);
    const next = step.migrate({ state: save.state, log: save.log });
    save = envelopeAt(step.to, save.worldHash, next.state, next.log);
  }
  return save;
}

/**
 * Problems with a migrations registry: it must step 1 -> 2 -> ... -> current
 * with no gaps, repeats or jumps. Empty when the registry is sound.
 */
export function migrationProblems(migrations: readonly SaveMigration[], current: number): string[] {
  const problems: string[] = [];
  for (let version = 1; version < current; version++) {
    const steps = migrations.filter((m) => m.from === version);
    if (steps.length === 0) problems.push(`no migration from schema ${version}`);
    if (steps.length > 1) problems.push(`${steps.length} migrations from schema ${version}`);
  }
  for (const m of migrations) {
    if (m.to !== m.from + 1) problems.push(`migration ${m.from} -> ${m.to} must step by one`);
    if (m.from < 1 || m.to > current) problems.push(`migration ${m.from} -> ${m.to} is outside 1..${current}`);
  }
  return problems;
}

function envelopeAt(schemaVersion: number, worldHash: string, state: unknown, log: readonly unknown[]): SaveEnvelope {
  return {
    format: SAVE_FORMAT,
    schemaVersion,
    worldHash,
    state: state as CanonicalValue,
    stateHash: canonicalHash(state),
    log: log as readonly CanonicalValue[],
    logHash: canonicalHash(log),
  };
}

function checkEnvelope(raw: unknown): SaveEnvelope {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) throw new SaveError('bad_envelope', 'not an object');
  const r = raw as Record<string, unknown>;
  if (r.format !== SAVE_FORMAT) throw new SaveError('wrong_format', `format is ${JSON.stringify(r.format)}`);
  const expected = ['format', 'log', 'logHash', 'schemaVersion', 'state', 'stateHash', 'worldHash'];
  const keys = Object.keys(r).sort(strictCompare);
  if (keys.join() !== expected.join()) throw new SaveError('bad_envelope', `fields are [${keys.join(', ')}], expected [${expected.join(', ')}]`);
  if (typeof r.schemaVersion !== 'number' || !Number.isSafeInteger(r.schemaVersion) || r.schemaVersion < 1) {
    throw new SaveError('bad_envelope', 'schemaVersion must be a positive integer');
  }
  for (const field of ['worldHash', 'stateHash', 'logHash'] as const) {
    if (typeof r[field] !== 'string' || !/^[0-9a-f]{64}$/.test(r[field])) throw new SaveError('bad_envelope', `${field} must be 64 hex digits`);
  }
  if (!Array.isArray(r.log)) throw new SaveError('bad_envelope', 'log must be an array');
  return r as unknown as SaveEnvelope;
}

function verifyHashes(save: SaveEnvelope): void {
  const stateHash = canonicalHash(save.state);
  if (stateHash !== save.stateHash) throw new SaveError('hash_mismatch', `state hashes to ${stateHash}, envelope says ${save.stateHash}`);
  const logHash = canonicalHash(save.log);
  if (logHash !== save.logHash) throw new SaveError('hash_mismatch', `log hashes to ${logHash}, envelope says ${save.logHash}`);
}
