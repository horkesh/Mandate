import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { errorsOf, loadPack, type PackFiles } from '@mandate/pack-format';
import { parseCsv } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';

/**
 * Lane 0.3: the Union 1861 pack in world format v2. `packs.test.ts` in the
 * pack-format package already proves the sources generate, `data/` is fresh
 * and the committed files load; these tests pin what this import promised.
 */
const root = fileURLToPath(new URL('../', import.meta.url));
const read = (p: string): string | undefined => {
  const full = join(root, ...p.split('/'));
  return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined;
};
const files: PackFiles = {
  read,
  folders: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name),
  files: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name),
};
const { pack, issues } = loadPack(files);
const world = pack!.world;
const start = pack!.scenarios[0]!;
const draftIds = (file: string, column: string): string[] => {
  const t = parseCsv(read(`source/drafts/${file}`)!);
  const i = t.header.indexOf(column);
  return t.rows.map((r) => r.cells[i]!);
};
const controlOf = (region: string) => start.control.find((c) => c.region === region)?.shares ?? [];

describe('Union 1861 world v2', () => {
  it('loads with no errors, as a draft pack, with one start on 5 March 1861', () => {
    expect(errorsOf(issues)).toEqual([]);
    expect(pack!.manifest.status).toBe('draft');
    expect(pack!.scenarios.map((s) => [s.id, s.startDate])).toEqual([['march_1861', '1861-03-05']]);
  });

  it('loses nothing from the map and people drafts', () => {
    const regionIds = new Set(world.regions.map((r) => r.id as string));
    // The two Indian Territory boxes of the draft are split into one region per nation and the Leased District (0069, 0070).
    const split = new Set(['it_cherokee_creek', 'it_choctaw_chickasaw']);
    expect(draftIds('map/regions.csv', 'id').filter((id) => !regionIds.has(id) && !split.has(id))).toEqual([]);
    for (const id of ['it_cherokee', 'it_muscogee', 'it_seminole', 'it_choctaw', 'it_chickasaw', 'it_leased_district']) expect(regionIds.has(id), id).toBe(true);
    // The Mediterranean leg was added after review; the split replaced the box-to-box road with ten adjacencies (a net nine more edges).
    expect(world.edges.length).toBe(draftIds('map/edges.csv', 'from').length + 1 + 9);
    const people = new Set(world.people.map((p) => p.id as string));
    expect(draftIds('people/people.csv', 'id').filter((id) => !people.has(id))).toEqual([]);
  });

  it('turns draft flags into installations and every rail edge into a named line', () => {
    expect(world.installations.filter((i) => i.kind === 'fort').length).toBeGreaterThan(30);
    expect(world.regions.every((r) => !(r.flags as readonly string[]).some((f) => ['fort', 'arsenal', 'navy_yard', 'naval_base'].includes(f)))).toBe(true);
    const rail = world.edges.filter((e) => e.type === 'rail');
    expect(rail.length).toBe(173);
    expect(rail.every((e) => e.line !== null)).toBe(true);
    expect(world.railLines.length).toBe(88);
  });

  it('puts the Pickens truce on the post that holds the fort, dated 28 January 1861', () => {
    const post = start.posts.find((p) => p.id === 'us_fort_pickens')!;
    expect(post.standingOrders.map((o) => [o.id, o.kind, o.issuedOn, o.from])).toEqual([['pickens_truce', 'truce', '1861-01-28', null]]);
    expect(post.installation).toBe('fort_pickens');
  });

  it('holds the Union forts in the seceded states, and no one holds the uncommitted slave states', () => {
    for (const r of ['fort_sumter', 'fort_pickens', 'key_west', 'fort_monroe']) expect(controlOf(r)).toEqual([{ faction: 'union', permille: 1000 }]);
    expect(controlOf('charleston')).toEqual([{ faction: 'confederate', permille: 1000 }]);
    for (const r of ['richmond', 'nashville', 'raleigh', 'little_rock']) expect(controlOf(r)).toEqual([]);
    // Loyalty never stands in for control: the border states' proposals are not in the table (they wait for a loyalty field).
    for (const r of ['baltimore', 'bluegrass', 'st_louis', 'frederick_md']) expect(controlOf(r)).toEqual([]);
    // Delaware's government is the Union's from the start (lane 1.11a): its legislature declined Mississippi's commissioner on 3 January 1861 (AAC p.256).
    expect(controlOf('delaware')).toEqual([{ faction: 'union', permille: 1000 }]);
    expect(world.departments.find((d) => d.id === 'st_delaware')!.faction).toBe('union');
    const neutral = world.departments.filter((d) => d.faction === null && d.kind === 'state_government').map((d) => d.id as string).sort();
    expect(neutral).toEqual(['st_arkansas', 'st_kentucky', 'st_maryland', 'st_missouri', 'st_north_carolina', 'st_tennessee', 'st_virginia']);
    // The nations' governments hold no side either: each is its own nation's, with its own polity (0069, 0070).
    const nations = world.departments.filter((d) => d.faction === null && d.kind === 'nation_government').map((d) => d.id as string).sort();
    expect(nations).toEqual(['nation_cherokee', 'nation_chickasaw', 'nation_choctaw', 'nation_muscogee', 'nation_seminole']);
    // The two lists are every department that holds no side: a faction-null department of a third kind would fail here.
    expect(world.departments.filter((d) => d.faction === null).map((d) => d.id as string).sort()).toEqual([...neutral, ...nations].sort());
  });

  it('keeps the licence-unclear and unlicensed sources out of the registry', () => {
    const keys = pack!.provenance.sources.map((s) => s.key);
    expect(keys.some((k) => /^BATES|^WP1848/.test(k))).toBe(false);
    expect(pack!.provenance.sources.every((s) => ['public-domain', 'own-work'].includes(s.licence))).toBe(true);
    expect(pack!.provenance.sources.filter((s) => s.kind === 'pointer').every((s) => s.key.startsWith('NOTE-'))).toBe(true);
  });

  it('writes what no source gives as unknown, never as a value', () => {
    const unknownHolders = start.posts.filter((p) => p.unknowns.includes('holder')).map((p) => p.id as string);
    expect(unknownHolders).toContain('cs_navy_yard_pensacola'); // three candidates, none certain
    expect(unknownHolders).not.toContain('us_dept_texas'); // the draft's own rows order Twiggs and Waite (round 3)
    expect(start.posts.filter((p) => p.holder === null).every((p) => p.unknowns.includes('holder'))).toBe(true);
    expect(start.forceBlocks.filter((b) => b.strength === null).every((b) => b.unknowns.includes('strength'))).toBe(true);
    expect(world.people.filter((p) => p.born === null).every((p) => p.unknowns.includes('born'))).toBe(true);
  });

  it('holds the cabinet Lincoln has on 5 March, and leaves the Confederate commands formed later to the rule seat', () => {
    const holder = (id: string) => start.posts.find((p) => p.id === id)?.holder;
    expect(['us_secretary_state', 'us_secretary_war', 'us_secretary_treasury', 'us_secretary_navy', 'us_secretary_interior', 'us_attorney_general', 'us_postmaster_general'].map(holder)).toEqual([
      'seward_william_h', 'cameron_simon', 'chase_salmon_p', 'welles_gideon', 'smith_caleb_b', 'bates_edward', 'blair_montgomery',
    ]);
    expect(start.posts.some((p) => p.id === 'cs_cmd_pensacola' || p.id === 'cs_cmd_texas')).toBe(false);
    const creatable = (k: string) => world.vocabularies.postKinds.find((x) => x.id === k)?.creatable;
    expect([creatable('harbour_command'), creatable('temporary_command'), creatable('navy_squadron')]).toEqual(['directive', 'directive', 'directive']);
  });

  it('cites a primary source, not only a research note, for the five cabinet holders (0050, ruling S3)', () => {
    for (const id of ['us_secretary_state', 'us_secretary_treasury', 'us_secretary_interior', 'us_attorney_general', 'us_postmaster_general']) {
      const post = start.posts.find((p) => p.id === id)!;
      expect(JSON.stringify(post.provenance), id).toContain('NYT-1861-03-06');
      // The Senate Executive Journal, vol. XI, pp.289-290, is the primary source (verification lane, 2026-11-15).
      expect(JSON.stringify(post.provenance), id).toContain('SEJ-XI');
      expect(JSON.stringify(post.provenance), id).not.toContain('primary source not reached');
    }
  });

  it('has a private-secretary post held by Nicolay, with no engine role, from the Executive Journal and the Times (verification lane; lead ruling 2026-11-15)', () => {
    // role is null on purpose: a role-filter post sits on the wire (0040 leaves the March telegraph filter empty); caller-screening is a Phase 1 item.
    expect(world.vocabularies.postKinds.find((k) => k.id === 'private_secretary')?.role ?? null).toBeNull();
    expect(world.vocabularies.postKinds.filter((k) => k.role !== null)).toEqual([]); // no filter and no intelligence kind: no Union post had an intelligence chief on 5 March
    const post = start.posts.find((p) => p.id === 'us_president_secretary')!;
    expect(post.holder).toBe('nicolay_john_g');
    expect(post.intelligenceChief ?? null).toBeNull();
    expect(start.posts.every((p) => (p.intelligenceChief ?? null) === null)).toBe(true);
  });

  it('holds the Harpers Ferry armory by Barbour, whom the Executive Journal confirms (0050, needs-source cleared)', () => {
    expect(start.posts.find((p) => p.id === 'us_harpers_ferry_armory')!.holder).toBe('barbour_alfred_m');
  });

  it('gives each man the side of the post he holds on 5 March, else of his home state (0055, ruling S1)', () => {
    const person = (id: string) => world.people.find((p) => p.id === id)!;
    // US commissions on 5 March: Union, whatever they did in April.
    for (const id of ['lee_robert_e', 'stuart_james_e_b', 'longstreet_james', 'smith_edmund_k']) expect(person(id).faction, id).toBe('union');
    // A man from one of the eight no-faction states has no side; so does a man holding a state post there.
    for (const id of ['jackson_thomas_j', 'mason_james_m', 'vance_zebulon_b', 'breckinridge_john_c', 'forrest_nathan_b']) expect(person(id).faction, id).toBeNull();
    // Seceded home states start Confederate; a man whose home the draft does not name is unknown, not guessed.
    for (const id of ['bragg_braxton', 'slidell_john', 'semmes_raphael']) expect(person(id).faction, id).toBe('confederate');
    // Hardee and Van Dorn resigned on 31 January 1861, hold no commission on 5 March, and were born in and appointed from seceded states (Cullum 966, 1162).
    for (const id of ['hardee_william_j', 'van_dorn_earl']) expect(person(id).faction, id).toBe('confederate');
    // The only Confederate men with no post on 5 March are those the table ruled so from a seceded home state or office.
    const holders = new Set(start.posts.map((p) => p.holder).filter((h) => h !== null));
    const confederateNoPost = world.people.filter((p) => p.faction === 'confederate' && !holders.has(p.id)).map((p) => p.id as string).sort();
    expect(confederateNoPost).toEqual([
      'bragg_braxton', 'cobb_howell', 'hardee_william_j', 'mcculloch_ben', 'northrop_lucius_b', 'polk_leonidas', 'reagan_john_h', 'semmes_raphael', 'slidell_john', 'tattnall_josiah', 'twiggs_david_e', 'van_dorn_earl', 'wigfall_louis_t', 'yancey_william_l',
    ]);
  });

  it('holds Fort Pickens by Slemmer, who commanded the garrison; Vogdes stayed aboard (0055, ruling S2)', () => {
    expect(start.posts.find((p) => p.id === 'us_fort_pickens')!.holder).toBe('slemmer_adam_j');
    expect(world.people.some((p) => p.id === 'vogdes_israel')).toBe(true);
  });

  it('holds the Department of Texas by Waite, whom the oob draft puts in command from 19 February; Twiggs keeps a record (round 3)', () => {
    expect(start.posts.find((p) => p.id === 'us_dept_texas')!.holder).toBe('waite_carlos_a');
    expect(world.people.some((p) => p.id === 'twiggs_david_e')).toBe(true);
  });

  it('audits every man with no post against the starting-side rule: eight no-faction states give no side (round 3)', () => {
    const person = (id: string) => world.people.find((p) => p.id === id)!;
    for (const id of ['blair_francis_p', 'clay_cassius_m', 'crittenden_john_j', 'holt_joseph', 'johnson_andrew', 'sherman_william_t']) expect(person(id).faction, id).toBeNull();
    for (const id of ['grant_ulysses_s', 'farragut_david_g', 'thomas_george_h', 'nelson_william', 'seward_william_h']) expect(person(id).faction, id).toBe('union');
    // The fifteen men whose side was unknown are sourced by residence on 5 March, never by a later office (research lane, 2026-11-15; docs/research/2026-11-15-people-and-posts-1861.md).
    for (const id of ['burnside_ambrose_e', 'fremont_john_c', 'hooker_joseph', 'mcclellan_george_b', 'tod_david', 'wallace_lewis', 'lane_james_h', 'bulloch_james_d']) expect(person(id).faction, id).toBe('union');
    // Missouri, Virginia and North Carolina are no-faction states; Eckert was in North Carolina, not Ohio, until the war began.
    for (const id of ['hitchcock_ethan_a', 'sigel_franz', 'gamble_hamilton_r', 'pierpont_francis_h', 'eckert_thomas_t']) expect(person(id).faction, id).toBeNull();
    expect(world.people.filter((p) => p.unknowns.includes('faction')).map((p) => p.id)).toEqual([]);
    // 133 men with no post were ruled by name (the importer's tables); each is a roster man, so the count of roster men with no post and a Union
    // or Confederate side is exactly those the tables decided, with the unknowns and no-faction men set apart.
    const holders = new Set(start.posts.map((p) => p.holder).filter((h) => h !== null));
    const noPost = world.people.filter((p) => !holders.has(p.id));
    const count = (f: (p: (typeof noPost)[number]) => boolean) => noPost.filter(f).length;
    expect([count((p) => p.faction === 'union'), count((p) => p.faction === 'confederate')]).toEqual([83 + 1 + 8 - 1 + 3 + 1, 12 + 2]); // + Lamon (a Union man with no post, lane 1.11r3; Baldwin, Botts and Summers are Virginia men with no faction); + Vogdes, kept by ruling; + the eight sourced Union residences and the two sourced Confederate ones; - Nicolay, who now holds the secretary post (2026-11-15); + Mansfield, Paulding and Mervine, the three Union men lane 1.11a added from lane 1.9 (Carlile and Willey have no faction)
  });

  it('has supply sources for both sides, each in a region that side holds, and depots at the navy yards (0055)', () => {
    const sources = world.depots.filter((d) => d.kind === 'source');
    expect(sources.length).toBeGreaterThan(8);
    const holder = (region: string) => controlOf(region).find((s) => s.permille >= 250)?.faction;
    expect(sources.some((d) => holder(d.region) === 'union')).toBe(true);
    expect(sources.some((d) => holder(d.region) === 'confederate')).toBe(true);
    expect(sources.filter((d) => ['montgomery'].includes(d.region as string)).length).toBe(1);
    for (const id of ['depot_washington_navy_yard', 'depot_washington_arsenal', 'depot_gosport_navy_yard', 'depot_brooklyn_navy_yard']) expect(world.depots.some((d) => d.id === id), id).toBe(true);
    // Every figure is a design parameter and says so.
    expect(world.depots.every((d) => JSON.stringify(d.provenance).includes('LANE-0.3'))).toBe(true);
  });

  it('has a Mediterranean box for the squadron there, with one leg to the North Atlantic', () => {
    const box = world.regions.find((r) => r.id === 'mediterranean')!;
    expect([box.kind, box.offMapRole]).toEqual(['off_map', 'distant_theatre']);
    expect(world.edges.filter((e) => e.a === 'mediterranean' || e.b === 'mediterranean').map((e) => [e.id, e.lengthDays, e.capacity])).toEqual([['sea:mediterranean:north_atlantic', 15, 5]]);
    const ships = start.forceBlocks.filter((b) => b.post === 'us_navy_mediterranean_squadron').map((b) => b.region);
    expect(ships.length).toBeGreaterThan(0);
    expect(ships.every((r) => r === 'mediterranean')).toBe(true);
  });

  it('records the Sumter labourers beside its garrison', () => {
    const b = start.forceBlocks.find((x) => x.id === 'fb_us_sumter_garrison')!;
    expect([b.strength, b.nonCombatants, b.storesDays]).toEqual([85, 55, 7]);
  });

  it('gives each land region its state’s government from the map draft’s county lists, and leaves the rest unknown with a reason (0058)', () => {
    const land = world.regions.filter((r) => r.kind === 'land' || r.kind === 'key_point').map((r) => r.id as string).sort();
    expect(start.governments.map((g) => g.region as string).sort()).toEqual(land);
    // Every named government is either a state government, the one state its counties lie in, or a territorial or district government named in the statutes (research note 2026-11-15, section 2).
    const federal = new Map([['washington', 'us_district_columbia'], ['nebraska', 'tr_nebraska'], ['dakota', 'tr_dakota'], ['colorado', 'tr_colorado'], ['new_mexico', 'tr_new_mexico'], ['arizona', 'tr_new_mexico']]);
    // The Indian Territory nations: each region its own nation's government, a self-governing department with its own polity (0069, 0070).
    const nations = new Map([['it_cherokee', 'nation_cherokee'], ['it_muscogee', 'nation_muscogee'], ['it_seminole', 'nation_seminole'], ['it_choctaw', 'nation_choctaw'], ['it_chickasaw', 'nation_chickasaw']]);
    const column = (path: string, key: string, value: string) => {
      const t = parseCsv(read(path)!);
      const [k, v] = [t.header.indexOf(key), t.header.indexOf(value)];
      return new Map(t.rows.map((r) => [r.cells[k]!, r.cells[v] ?? '']));
    };
    const counties = column('source/drafts/map/regions.csv', 'id', 'counties_1861');
    const states = (region: string) => [...new Set(counties.get(region)!.split(';').filter(Boolean).map((c) => c.split(':')[0]!.trim()))];
    const dept = new Map(world.departments.map((d) => [d.id as string, d]));
    for (const g of start.governments.filter((x) => x.department !== 'unknown')) {
      if (federal.has(g.region as string)) {
        expect(g.department).toBe(federal.get(g.region as string));
        expect(['territorial_government', 'federal_district']).toContain(dept.get(g.department)!.kind);
        expect(dept.get(g.department)!.faction).toBe('union');
        continue;
      }
      if (nations.has(g.region as string)) {
        const d = dept.get(g.department)!;
        expect(g.department).toBe(nations.get(g.region as string));
        expect(d.kind).toBe('nation_government');
        expect(d.faction).toBeNull();
        expect(d.polity, g.department).toBe(String(g.department).replace('nation_', ''));
        continue;
      }
      expect(dept.get(g.department)!.kind).toBe('state_government');
      expect(states(g.region)).toHaveLength(1);
      expect(`st_${states(g.region)[0]!.toLowerCase().replace(/[^a-z]+/g, '_')}`).toBe(g.department);
    }
    // The unknowns: the Leased District (its peoples spoke through their own chiefs, 0069) and three regions across state lines.
    const unknown = start.governments.filter((g) => g.department === 'unknown').map((g) => g.region as string).sort();
    expect(unknown).toEqual(['eastern_shore', 'it_leased_district', 'michigan_wisconsin', 'new_england']);
    const notes = column('source/scenarios/march_1861/governments.csv', 'region', 'notes');
    for (const r of unknown) expect(notes.get(r), r).not.toBe('');
    expect(notes.get('it_leased_district')).toContain('No single government is sourced');
    // The peoples the split gives no region are named on the rows that would otherwise govern them (0070).
    expect(notes.get('it_cherokee')).toContain('Quapaw');
    expect(notes.get('kansas_east')).toContain('Osage');
    expect(notes.get('kansas_west')).toContain('Osage');
  });
});
