/**
 * The seats layer's World for a pack (lanes 0.5 to 0.8): the v2 World, the first
 * scenario start and the pack's situations, indexed once, with the mechanics a
 * run of it counts. The runners (`phase0-run.ts`, `seats-run.ts`) share this
 * and nothing else about how a World is built.
 */
import { canonicalHash, encodeSave, phase0, world as w } from '@mandate/kernel';
import { errorsOf, formatIssue, loadPack } from '@mandate/pack-format';
import { createRuleSeat } from '@mandate/rule-seats';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { packFilesAt, packRoot, v2Packs } from './pack-files.ts';

export interface SeatsWorld {
  readonly world: phase0.SeatsWorld;
  readonly worldHash: string;
  readonly seed: number;
  /** What `createState` takes: the seed (the start is the World's). */
  readonly setup: phase0.SetupOptions;
}

/** Lane 0.2's World and the first scenario start of a v2 pack, or null for a pack without a manifest. */
export function v2Map(pack: string): { readonly world: w.World; readonly start: w.ScenarioStart } | null {
  const root = packRoot(pack);
  if (!existsSync(join(root, 'pack.json'))) return null;
  const { pack: data, issues } = loadPack(packFilesAt(root));
  if (data === null) throw new Error(`pack ${pack} does not load:\n${errorsOf(issues).map(formatIssue).join('\n')}`);
  const start = data.scenarios[0];
  if (start === undefined) throw new Error(`pack ${pack} has no scenario start`);
  return { world: data.world, start };
}

/**
 * The seats layer's World for a v2 pack: its World, its first scenario start and its situations (lane 0.5:
 * the stand-in comms World built from an M2 scenario file is gone). The seed is the start's.
 */
export function seatsWorld(pack: string): SeatsWorld {
  const map = v2Map(pack);
  if (map === null) throw new Error(`pack ${pack} has no v2 manifest (pack.json); the seats layer runs only on world format v2`);
  const situations = packSituations(pack);
  return {
    world: phase0.indexSeatsWorld(w.indexWorld(map.world), map.start, { situations }),
    worldHash: canonicalHash({ map: w.worldHash(map.world), start: w.scenarioHash(map.start), situations: canonicalHash(situations) }),
    seed: map.start.seed,
    setup: { seed: map.start.seed },
  };
}

/** Every mechanic a run counts: the tick's (the seats layer's, movement's and the situations phase's) and the map's. */
export function seatsMechanics(): readonly string[] {
  return [...phase0.TICK_MECHANICS, ...phase0.MAP_MECHANICS];
}

/** The pack's strings in its default locale, merged into one table (lane 1.13: the console shows titles and labels). */
export function packStrings(pack: string): Readonly<Record<string, string>> {
  return packPresentation(pack).table;
}

export function packPresentation(pack: string): { table: Readonly<Record<string, string>>; locale: string } {
  const { pack: data } = loadPack(packFilesAt(packRoot(pack)));
  if (data === null) return { table: {}, locale: 'en' };
  const locale = data.manifest.defaultLocale;
  const table: Record<string, string> = {};
  for (const file of data.strings.get(locale) ?? []) Object.assign(table, file.table);
  return { table, locale };
}

/**
 * The pack's situations (lane 0.7), loaded and gate-checked through the pack
 * format when the pack has a v2 manifest; none otherwise. A pack whose
 * situations or gate fail validation does not run.
 */
function packSituations(pack: string): readonly phase0.SituationDef[] {
  if (!v2Packs().includes(pack)) return [];
  const { pack: loaded, issues } = loadPack(packFilesAt(packRoot(pack)));
  if (loaded === null) throw new Error(`packs/${pack} does not validate:\n${errorsOf(issues).map(formatIssue).join('\n')}`);
  return loaded.situations ?? [];
}

/**
 * A real mid-run save: every seat on the rules model for `day` days, then the
 * State and the log in a save envelope. The fixture in
 * `packages/cli/test/fixtures/saves/` is one of these (`tools/make-save-fixture.ts`).
 */
export function seatsSave(pack: string, day: number): string {
  const { world, worldHash, setup } = seatsWorld(pack);
  const seat = createRuleSeat();
  const run = phase0.playDays(world, phase0.createState(world, setup), () => seat, day, { freeze: true, deepChecks: true });
  return encodeSave({ worldHash, state: run.state, log: run.log });
}
