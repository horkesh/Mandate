import { canonicalHash, world as w } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';
import { errorsOf, formatGenerated, generatePack, icuLiteral, loadPack, staleFiles, Strings, WORLD_FILE } from '../src/index.ts';
import { filesOf, fixture, replaceOnce, withFile } from './support/fixture.ts';

describe('the generator', () => {
  it('is deterministic, and blind to the order of source rows', () => {
    const a = generatePack(filesOf(fixture()));
    const b = generatePack(filesOf(fixture()));
    expect([...a.outputs]).toEqual([...b.outputs]);
    const shuffled = withFile('source/world/edges.csv', (t) => {
      const [head, ...rows] = t.split('\n');
      return [head, ...rows.reverse()].join('\n');
    });
    expect([...generatePack(filesOf(shuffled)).outputs]).toEqual([...a.outputs]);
  });

  it('writes canonical JSON: the file hashes like the World it came from', () => {
    const { outputs, pack } = generatePack(filesOf(fixture()));
    const text = outputs.get(WORLD_FILE)!;
    expect(canonicalHash(JSON.parse(text))).toBe(w.worldHash(pack!.world));
    expect(formatGenerated(JSON.parse(text))).toBe(text);
    expect(text.includes('\r')).toBe(false);
  });

  it('orders edge ends, ids and lengths consistently whichever way the source wrote them', () => {
    const { pack } = generatePack(filesOf(fixture()));
    const river = pack!.world.edges.find((e) => e.type === 'river')!;
    expect(river).toMatchObject({ id: 'river:beta:stream', a: 'beta', b: 'stream', lengthDays: 1, lengthDaysBA: 2 });
    const flipped = withFile('source/world/edges.csv', replaceOnce(',beta,stream,river,,1,2,', ',stream,beta,river,,2,1,'));
    const again = generatePack(filesOf(flipped)).pack!.world.edges.find((e) => e.type === 'river')!;
    expect(again).toEqual(river);
    expect(w.edgeDays(river, 'beta' as never)).toBe(1);
    expect(w.edgeDays(river, 'stream' as never)).toBe(2);
  });

  it('writes nothing while an error stands', () => {
    const broken = withFile('source/world/depots.csv', replaceOnce(',alpha,source,', ',gamma,source,'));
    const result = generatePack(filesOf(broken));
    expect(errorsOf(result.issues).length).toBeGreaterThan(0);
    expect(result.outputs.size).toBe(0);
  });

  it('turns names into string-table entries escaped for ICU', () => {
    expect(icuLiteral("St. Ann's {Fort}")).toBe("St. Ann''s '{'Fort'}'");
    const named = withFile('source/world/rail_lines.csv', replaceOnce('Main Line', "Ann's {Main} Line"));
    const { pack } = generatePack(filesOf(named));
    const strings = new Strings(pack!.strings, 'en');
    expect(strings.format('rail_line.main_line.name')).toBe("Ann's {Main} Line");
  });

  it('round-trips: the committed files load and validate without the sources', () => {
    const { outputs } = generatePack(filesOf(fixture()));
    const committed = new Map([...fixture()].filter(([p]) => !p.startsWith('source/')));
    for (const [p, t] of outputs) committed.set(p, t);
    const loaded = loadPack(filesOf(committed));
    expect(errorsOf(loaded.issues)).toEqual([]);
    expect(w.worldHash(loaded.pack!.world)).toBe(w.worldHash(generatePack(filesOf(fixture())).pack!.world));
  });
});

describe('tenures', () => {
  it("cite the post they fill: a holder row's citations join the post's provenance, without repeats", () => {
    const files = withFile('source/scenarios/start/holders.csv', replaceOnce('red_top,red_chief,no,1890,,DESIGN,', 'red_top,red_chief,no,1890,,REG A p.7;DESIGN,'));
    const post = generatePack(filesOf(files)).pack!.scenarios[0]!.posts.find((p) => p.id === 'red_top')!;
    expect(post.provenance).toEqual([{ source: 'DESIGN', at: null }, { source: 'REG A', at: 'p.7' }]);
  });
});

describe('text as people save it', () => {
  it('reads a table saved with a byte-order mark ("CSV UTF-8" from a spreadsheet) exactly as one without (review N3)', () => {
    const withBom = withFile('source/world/regions.csv', (t) => `﻿${t}`);
    const plain = generatePack(filesOf(fixture()));
    const bom = generatePack(filesOf(withBom));
    expect(errorsOf(bom.issues)).toEqual([]);
    expect([...bom.outputs]).toEqual([...plain.outputs]);
  });

  it('refuses committed data that is not NFC when loading without sources', () => {
    const { outputs } = generatePack(filesOf(fixture()));
    const committed = new Map([...fixture()].filter(([p]) => !p.startsWith('source/')));
    for (const [p, t] of outputs) committed.set(p, t);
    committed.set('data/strings/en.json', committed.get('data/strings/en.json')!.replace('"Alpha"', '"Alpha Café"'));
    const loaded = loadPack(filesOf(committed));
    expect(loaded.issues.filter((i) => i.kind === 'not-nfc').map((i) => i.file)).toEqual(['data/strings/en.json']);
  });
});

describe('the staleness check (FOUNDATION 11.7)', () => {
  const outputs = new Map([
    ['data/world.json', '{}\n'],
    ['data/strings/en.json', '{}\n'],
  ]);

  it('passes when the files match', () => {
    expect(staleFiles(outputs, new Map(outputs))).toEqual([]);
  });

  it('finds a stale, a missing and an extra file (positive control)', () => {
    const disk = new Map([
      ['data/world.json', '{"edited":1}\n'],
      ['data/old.json', '{}\n'],
    ]);
    expect(staleFiles(outputs, disk)).toEqual([
      { path: 'data/old.json', problem: 'extra' },
      { path: 'data/strings/en.json', problem: 'missing' },
      { path: 'data/world.json', problem: 'stale' },
    ]);
  });
});
