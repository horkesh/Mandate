import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createStream, ids, phase0 } from '@mandate/kernel';
import { describe, expect, it } from 'vitest';

/**
 * Livermore's tables as a harness of named set-ups (lane 1.3; the combat note's finding 2 and its calibration targets).
 *
 * Each row of `livermore/livermore-1900.csv` is a battle re-entered from Livermore, *Numbers and Losses in the Civil War
 * in America, 1861–65* (1900, public domain; source key LIV, battle tables pp. 77–140, as the combat note read them in
 * its section 2.1): men engaged and killed and wounded (K+W) per side. Figures Livermore prints as approximate are
 * flagged in `approx`. The ODC-BY `acw-battle-data` CSV is a cross-check only and is not used here.
 *
 * The set-up is the model's, not a fact: the battle type, the attacker, the ground (a terrain of this pack) and each
 * side's dawn commit, which the combat note's type column and its 2.1 table suggest. Both commanders are of average
 * competence and nerve, so no competence term tips the scale, and resolute (a low demand), so each side stands for the
 * battle's days as both did; the day is resolved with this pack's combat rules on named streams over twenty seeds, one
 * battle-day after another for a battle of several days, until a side routs or surrenders.
 *
 * No single battle must match (the combat note): the assertions are the note's bands, over the set-ups.
 */
interface Row {
  readonly battle: string;
  readonly days: number;
  readonly type: phase0.BattleType;
  readonly attacker: 'union' | 'confederate' | 'both';
  readonly terrain: string;
  readonly commit: Readonly<Record<'union' | 'confederate', phase0.Commit>>;
  readonly engaged: Readonly<Record<'union' | 'confederate', number>>;
  readonly kw: Readonly<Record<'union' | 'confederate', number>>;
  readonly surprised: string;
}

const csv = readFileSync(fileURLToPath(new URL('./livermore/livermore-1900.csv', import.meta.url)), 'utf8').trim().split(/\r?\n/);
const header = csv[0]!.split(',');
const ROWS: readonly Row[] = csv.slice(1).map((line) => {
  const c = Object.fromEntries(line.split(',').map((v, i) => [header[i]!, v]));
  return {
    battle: c.battle!,
    days: Number(c.days),
    type: c.type as phase0.BattleType,
    attacker: c.attacker as Row['attacker'],
    terrain: c.terrain!,
    commit: { union: c.union_commit as phase0.Commit, confederate: c.confederate_commit as phase0.Commit },
    engaged: { union: Number(c.union_engaged), confederate: Number(c.confederate_engaged) },
    kw: { union: Number(c.union_kw), confederate: Number(c.confederate_kw) },
    surprised: c.surprised ?? '',
  };
});

const pack = JSON.parse(readFileSync(fileURLToPath(new URL('../data/world.json', import.meta.url)), 'utf8')) as { rules: { combat: phase0.CombatRules; people: { shadow: { unknownCentre: number } } } };
const RULES = pack.rules.combat;
const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const SIDES = ['union', 'confederate'] as const;
const per1000 = (kw: number, engaged: number) => Math.trunc((kw * 1000) / engaged);

/** One run of a set-up: K+W per side over its days, on its own named streams. */
function run(row: Row, seed: number): Readonly<Record<'union' | 'confederate', number>> & { readonly full: Readonly<Record<'union' | 'confederate', boolean>> } {
  const unknown = pack.rules.people.shadow.unknownCentre;
  // Resolute: he needs only six tenths of the enemy to stand, so the battle runs its historical days.
  const commander = { person: null, boldness: unknown, competence: unknown, nerve: unknown, perceptionPermille: 1000, demandPermille: 600 };
  const men = { union: row.engaged.union, confederate: row.engaged.confederate };
  const kw = { union: 0, confederate: 0 };
  const full = { union: false, confederate: false };
  const condition = { union: { m: RULES.morale.start, e: RULES.experience.start, q: RULES.equipment.start }, confederate: { m: RULES.morale.start, e: RULES.experience.start, q: RULES.equipment.start } };
  const terrain = RULES.terrain.find((t) => t.terrain === row.terrain) ?? RULES.otherTerrain;
  for (let d = 1; d <= row.days; d++) {
    const side = (f: 'union' | 'confederate'): phase0.SideInput => ({
      faction: ids.toId('faction', f),
      post: null,
      commander,
      commit: row.commit[f],
      commitTerms: [],
      blocks: [{ id: ids.toId('forceBlock', `${f}_army`), men: men[f], stragglers: 0, morale: condition[f].m, experience: condition[f].e, equipment: condition[f].q }],
      retreatTo: ids.toId('region', `${f}_rear`),
      breakingOut: false,
      surprised: row.surprised === f,
    });
    const input: phase0.DayInput = {
      day: d,
      dayNumber: d,
      type: row.type,
      attacker: row.attacker === 'both' ? null : ids.toId('faction', row.attacker),
      terrain: row.terrain,
      frontageMen: terrain.frontageMen,
      terrainLossPermille: terrain.lossPermille,
      sides: [side('confederate'), side('union')],
    };
    const out = phase0.resolveDay(RULES, input, createStream(seed, `combat/livermore:${row.battle}/${d}`));
    for (const s of out.day.bdaySides) {
      const f = s.bsideFaction as 'union' | 'confederate';
      // Fully engaged on its first day: every man present was in contact.
      if (d === 1) full[f] = out.day.bdayContact >= s.bsidePresent;
      kw[f] += s.bsideKw;
      men[f] -= s.bsideKw + s.bsideMissing + s.bsideCaptured;
    }
    for (const b of out.blocks) {
      const f = (b.block as string).startsWith('union') ? 'union' : 'confederate';
      condition[f] = { m: condition[f].m + b.moraleDelta, e: condition[f].e + b.experienceDelta, q: condition[f].q + b.equipmentDelta };
    }
    if (out.sides.some((s) => s.retreatTo !== null || s.surrendered)) break;
  }
  return { ...kw, full };
}

/** Each set-up's runs, and its mean K+W per 1000 engaged per side. */
const RESULTS = ROWS.map((row) => {
  const runs = SEEDS.map((seed) => run(row, seed));
  const mean = (f: 'union' | 'confederate') => Math.trunc(runs.reduce((a, r) => a + per1000(r[f], row.engaged[f]), 0) / runs.length);
  return { row, runs, model: { union: mean('union'), confederate: mean('confederate') }, livermore: { union: per1000(row.kw.union, row.engaged.union), confederate: per1000(row.kw.confederate, row.engaged.confederate) } };
});
const attackerOf = (row: Row) => (row.attacker === 'union' ? 'union' : 'confederate');
const defenderOf = (row: Row) => (row.attacker === 'union' ? 'confederate' : 'union');

describe('Livermore\'s tables as a harness of named set-ups (the combat note\'s calibration targets)', () => {
  it('reads every row: a known type, terrain and commit, and figures that are whole men', () => {
    expect(ROWS.length).toBeGreaterThanOrEqual(14);
    for (const r of ROWS) {
      expect(phase0.BATTLE_TYPES).toContain(r.type);
      for (const f of SIDES) {
        expect(phase0.COMMITS).toContain(r.commit[f]);
        expect(Number.isSafeInteger(r.engaged[f]) && r.engaged[f] > 0).toBe(true);
        expect(Number.isSafeInteger(r.kw[f]) && r.kw[f] > 0).toBe(true);
      }
    }
  });

  it('target 2: a side fully engaged for a single day of open battle loses 90–240 per 1000 (the note: Antietam, Perryville)', () => {
    // Every single-day open battle, Bull Run included; the band applies to each side all of whose men were in contact.
    const days = RESULTS.filter((x) => x.row.days === 1 && (x.row.type === 'attack_open' || x.row.type === 'meeting'));
    const sides = days.flatMap((x) => SIDES.filter((f) => x.runs.every((r) => r.full[f])).map((f) => ({ battle: x.row.battle, f, rate: x.model[f] })));
    // Antietam's and Perryville's defenders, and the smaller Union force that attacked at Wilson's Creek, were all in contact.
    expect(sides.map((s) => `${s.battle}:${s.f}`)).toEqual(expect.arrayContaining(['antietam:confederate', 'perryville:confederate']));
    for (const s of sides) {
      expect(s.rate, `${s.battle} ${s.f}`).toBeGreaterThanOrEqual(90);
      expect(s.rate, `${s.battle} ${s.f}`).toBeLessThanOrEqual(240);
    }
  });
  it('target 3: in open battles the sides\' absolute K+W stay within 0.5–1.5 of each other in at least 70% of runs', () => {
    const open = RESULTS.filter((x) => x.row.type === 'attack_open' || x.row.type === 'meeting');
    const runs = open.flatMap((x) => x.runs);
    const inBand = runs.filter((k) => k.confederate > 0 && k.union * 1000 >= k.confederate * 500 && k.union * 1000 <= k.confederate * 1500).length;
    expect(inBand * 1000).toBeGreaterThanOrEqual(runs.length * 700);
  });

  it('target 4: an assault on works costs the attacker 2–7 times the defender in at least 80% of runs; defender 10–100, attacker 40–220 per 1000', () => {
    const works = RESULTS.filter((x) => x.row.type === 'assault_works');
    expect(works.map((x) => x.row.battle)).toEqual(['fredericksburg', 'chickasaw_bayou', 'fort_wagner', 'franklin']);
    const runs = works.flatMap((x) => x.runs.map((k) => ({ a: k[attackerOf(x.row)], d: k[defenderOf(x.row)] })));
    const inBand = runs.filter((k) => k.a >= 2 * k.d && k.a <= 7 * k.d).length;
    expect(inBand * 1000).toBeGreaterThanOrEqual(runs.length * 800);
    for (const x of works) {
      expect(x.model[defenderOf(x.row)], `${x.row.battle} defender`).toBeGreaterThanOrEqual(10);
      expect(x.model[defenderOf(x.row)], `${x.row.battle} defender`).toBeLessThanOrEqual(100);
      expect(x.model[attackerOf(x.row)], `${x.row.battle} attacker`).toBeGreaterThanOrEqual(40);
      expect(x.model[attackerOf(x.row)], `${x.row.battle} attacker`).toBeLessThanOrEqual(220);
    }
  });

  it('target 1: over the open battles, Union K+W averages 100–160 and Confederate 120–200 per 1000 engaged (Livermore: 112 and 150)', () => {
    const open = RESULTS.filter((x) => x.row.type === 'attack_open' || x.row.type === 'meeting');
    const avg = (f: 'union' | 'confederate') => Math.trunc(open.reduce((a, x) => a + x.model[f], 0) / open.length);
    expect(avg('union')).toBeGreaterThanOrEqual(100);
    expect(avg('union')).toBeLessThanOrEqual(160);
    expect(avg('confederate')).toBeGreaterThanOrEqual(120);
    expect(avg('confederate')).toBeLessThanOrEqual(200);
  });

  it('no single battle must match, but most set-ups land within half to twice Livermore\'s figure for both sides', () => {
    const close = RESULTS.filter((x) => SIDES.every((f) => x.model[f] * 2 >= x.livermore[f] && x.model[f] <= x.livermore[f] * 2));
    expect(close.length * 1000).toBeGreaterThanOrEqual(RESULTS.length * 600);
  });
});

