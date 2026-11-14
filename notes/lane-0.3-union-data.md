# Lane 0.3: Union 1861 data, hand-over

Branch `phase0-union-data` (on main 3028889), for the standing reviewer (0047) and then the steward (0045). Built from `packs/union-1861/source/drafts/{map,oob,people}` and the research notes only (0033); nothing from memory. Written so the choices can go into a decision record: each says what it rejected.

## What was built

| Piece | Where |
|---|---|
| The pack in world format v2: manifest (draft status, its own vocabularies and rules), 66 registered sources, strings | `packs/union-1861/{pack.json,PROVENANCE.json,strings/en.json}` |
| The World's tables: 264 regions (the draft's 263 and a Mediterranean box), 932 edges (527 road, 173 rail on 88 named lines, 121 river, 111 sea), 65 installations, 15 ministries and 34 state governments as departments, 246 people | `source/world/*.csv` |
| One start, 5 March 1861: 215 control rows (108 no one's), 135 posts with tenures (110 holders), 84 force blocks, 12 water obstructions, one standing agreement | `source/scenarios/march_1861/` |
| Generated data, checked for staleness by the existing pack test | `data/` |
| The one-time importer and its mapping tables (re-running overwrites hand edits) | `source/import/` (`import-drafts.mjs`, `import-people-oob.mjs`, `registry.mjs`, `vocab.mjs`, `places.mjs`) |
| Pack-specific tests: nothing lost from the drafts, forts and lines, control anchors, unknowns written as unknown, no unlicensed source | `packs/union-1861/test/world-v2.test.ts` |
| One format change, with controls: a sea edge may join two key points on one harbour | `packages/pack-format/src/validate.ts` |

M2's `union-1861` files (`scenario.json`, `source/generate.mjs`, `test/union-pack.test.ts`) are untouched and pass. No geometry is committed. The first commit containing `pack.json` generated and validated with no errors.

## The fit test's counts, before and after

Before: lane 0.2's run over the drafts as they stood (adapter scaffold): 4,344 errors and 156 warnings. After: `npm run pack:validate -- union-1861`: **0 errors, 728 warnings** (before the post-review rulings it was 739).

| Before | Kind | How it was resolved |
|---:|---|---|
| 2,757 | unknown-source | Keys split and registered: `OR I-4-p296` is source `OR`, place `I-4-p296`; 66 sources, each with the drafts' own licence basis and copy used |
| 582 | centre-without-citation | Each direction now carries the keys from people-sources Part 3 (`above:KEY+KEY`); 570 kept |
| 362 | shape/invalid_format | Free-text places and departments became ids: `places.mjs` (county lookup in the map draft's own lists, then station rules) and 49 departments |
| 173 | rail-without-line | 88 named lines, each edge on one |
| 169 | bad-cell | Ranks parsed into 43 ranks with dates; river seasons mapped, 20 distinct texts |
| 165 | control-missing | The start's control table (below) |
| 63 | shape/invalid_value | Region flags fort, naval_base, navy_yard, arsenal became 65 installations (0050) |
| 27 | unlisted-null | Empty birth and death dates written `unknown` |
| 12 | duplicate-holder | One holder per post, by the tenure rule below |
| 12, 9, 4, 3, 2, 2, 2, 1, 1, 1 | the rest | Columns renamed or moved to notes; off-map roles; no-faction people; the missing tables written; Bates's diary dropped |
| 156 (warnings) | unknown-value, tenure-outside-start | Kept as unknown (draft pack); tenures outside the start are not written |

Warnings now: 707 unknown-value (people nerve 120, reputation 114, competence 102, experience 78, born 82, died 81; blocks' stores 80, strength 23, return date 2; holders 25), 20 rank-demotion, 1 ship-ashore.

## Rules and judgements, with what each rejected

0. **The start is 5 March 1861** (lead ruling after the first review request): Lincoln's cabinet is confirmed that day and 0042 starts the situations on it. Everything below is as of 5 March.
1. **State governments on 5 March (a modelling rule; accepted by the lead).** The seven states the research notes call "the seven states" (South Carolina, Mississippi, Florida, Alabama, Georgia, Louisiana, Texas) are Confederate departments. The eight slave states that had not left the Union (Delaware, Maryland, Virginia, North Carolina, Tennessee, Kentucky, Missouri, Arkansas) are departments with **no faction** (F6, 0050): their side is a situation's work. The other 19 are Union. *Rejected:* Union for the eight (it makes Letcher's Virginia a Union government on 5 March); a pack-wide "neutral" label for Kentucky alone (the same evidence covers all eight).
2. **Control (lead ruling: loyalty never stands in for control).** The format has no unknown for control, so the table writes: Confederate 1000 in the seven states; Union 1000 in free states, territories and the District; Union 1000 at Fort Sumter, Fort Pickens, Key West and Fort Monroe (the drafts' own notes and posts); and **no one's** (the state government's, which has no faction) in all eight uncommitted states and the Indian Territory nations, the reason in each row. Federal installations in those states stay with their Union posts (the St. Louis arsenal, Harpers Ferry), not with region control. *Rejected:* Union 1000 in the eight (an overclaim); the research note's loyalty shares as control (removed from the five states that used them); the note's two Virginia proposals (they split at the Blue Ridge, which the draft's regions do not mark).
   **Loyalty proposals kept for a loyalty field** (the research note secession-winter, "Border states: starting control and loyalty", all [I] proposals; union / confederate / neutral-contested, summing to 1000, as of 4 March): Maryland (rest) 350/250/400, Baltimore 150/400/450, Delaware 650/80/270, Kentucky 330/250/420, Missouri 450/200/350, Virginia east of the Blue Ridge 350/300/350, northwest Virginia 650/100/250. Each border-state row's note in `control.csv` carries its own numbers.
3. **People's faction at the start** is the faction of the department of the post he holds on 5 March; for a man with no post at the start it is the draft's side (union or confederate; foreign and border: none). That is exact only for post-holders: Lee, for instance, reads Confederate here though he served the Union on 5 March. Eight post-holders differ from the draft's side (Cooper, both Johnstons, Franklin Buchanan: Union by post; Letcher, Harris, Jackson, Hicks: no faction). *Rejected:* `unknown` for all 150 men without a post (it throws away the sourced eventual side).
4. **Tenures.** A tenure counts when it certainly covers 5 March: its start is on or before it (or empty and unflagged) and its end is after it (or empty and unflagged); `to` equal to the start means the man has left (Holt's and Toucey's tenures end on 5 March, the day their successors begin). A later explicit start orders two tenures. 110 posts have a holder, **all seven of Lincoln's cabinet among them** (Seward, Chase, Cameron, Welles, Smith, Bates, Blair); 25 are `unknown`, with the candidates in the row: Confederate bureaus and commands whose start is needs-source or later (Baton Rouge and Mount Vernon arsenals, Morris Island, Fort Morgan, the Charleston naval command, the Pensacola navy yard with three candidates, the Adjutant and Inspector General and three other bureaus); state posts (Ohio's adjutant general, the Texas governorship with Houston and Clark, Jackson and St. Philip, two Texas bodies); the Department of Texas (Twiggs and Waite, no way to order them); and Union posts with no usable tenure (Utah, Harpers Ferry, Sackets Harbor, the Revenue Marine, the St. Louis arsenal, three ships' commanders and the Richmond's). Tenures outside the start are not written; they stay in `drafts/oob/people_in_posts.csv`.
5. **Posts and blocks formed after the start are not in it.** Eight posts: the Confederate Pensacola command (7 March), Texas command (11 April), Department of Florida, Department of Washington, the two relief expeditions, Water Witch (an April commissioning), and the Pensacola navy yard under the Union (abolished January). Twelve blocks go with them or have no usable place: the Pensacola force (1,045, 31 March), the Texas riflemen, both expeditions' troops, and four blocks with no place (Harriet Lane, John Adams, Release: needs-source; Levant: lost at sea). The Pickens expedition and the Sumter relief are situations' work (temporary posts, 0040). **No scheduled Confederate commands (lead ruling):** Pensacola and Texas stay out; the Confederate rule seat creates such commands in play, and a history run reproduces them through the historical default. So the post kinds `harbour_command` and `temporary_command` are now creatable by directive (with `navy_squadron` and `army_department`), where they were by appointment.
6. **Strengths are the draft's nearest return, dated** (answering the oob draft's question 6): 11 blocks carry a return dated after 5 March, with the date in `strength_date`. *Rejected:* a bring-forward rule now (no attrition rule exists yet); dropping the 11 (the draft chose them as the nearest return).
7. **Installations.** One record per flag, named from the region's notes ("Forts Barrancas and McRee" is one record where the notes group two forts). Two flags are not installations: `lowcountry` naval_base (Port Royal, Union from November 1861; a naval base must be a key point) and `britain_canada` naval_base (a foreign station). Port Hudson's fort_mode has no fort flag, so no fort. 21 forts on water carry the draft's passage or reduction mode and **command the water edges touching their region** (a default rule, since the draft names only obstructed edges). Posts link to their installation (20 do).
8. **Obstructions.** 12 water edges are obstructed at the start, each by a named installation. Not entered: the Cape Fear and Fort Macon edges (federal and unmanned in March, as the map README says) and Vicksburg (the draft marks it unconfirmed).
9. **Rail lines.** The first line the census parenthesis names is the edge's line; 30 edges name several (only the first is used; the notes keep the rest). Fifteen edges name no census line: the line is the first one their notes name; two are **composite lines** ("Lines from Indiana into Chicago", "Lines from Chicago into Wisconsin and round the lake") because the draft names none. 31 edges are breaks of bulk (ferries, horse cars, a break of gauge), found by keywords in the notes, not by the draft's own flag.

10. **River seasons.** Months from the draft's text (`Aug–Oct (low water)` is low water, months 8-10). "High water only" texts (3 edges) are written as the complementary closed months, marked inferred in the row. Texts with no months are left without a window, the text kept in the notes.
11. **Ships on foreign stations** go in the off-map box nearest their station (the draft's open question 8): Africa, Brazil and the River Plate and Cape Town: `south_atlantic`; China: `eastern_seas`; the Mediterranean: the new `mediterranean` box (lead ruling: the draft has none; role `distant_theatre`, one sea leg to `north_atlantic` of 15 days at capacity 5, a design parameter equal to the draft's transatlantic legs, since no source gives the route); Panama: `panama`; the rest of the Pacific squadron and Mare Island: `pacific_coast`; Vera Cruz: `france_mexico`. Troops afloat are `aboard` their ship (Vogdes's company aboard Brooklyn).
12. **People's evidence.** Stat evidence comes from people-sources Part 3; a direction with no admissible citation became unknown (12 cases, listed in the importer report). Pointers (research notes) never count; Bates's diary (licence unconfirmed, 35 citations) and the `WP1848` key (7, no entry in the map draft's source table) are dropped. 68 men who hold a post at the start but are not in the roster are people records too, with unknown centres, a kind taken from their post, and the tenure's sources; three roster/oob id pairs are one man each (`beauregard`, `toombs`, `morton`).
13. **Fields the format lacks stay in notes.** `posts_1861_62`, `west_point_class` and `prewar` are in each person's CSV note and in the drafts. Edges have no unknown marker, so the draft's wholesale "road existence needs-source" is in the `MAP-LANE` source's title and the 12 river edges with no seasonal text say so in their notes.
14. **Format change.** A sea edge may join two key points on one harbour (Charleston to Fort Sumter, Pickens to Pensacola); two ordinary land regions still fail. *Rejected:* dropping the two edges (authored data), or retyping them (they carry obstructions).

## Design parameters, not sourced facts

The season effects and default months in `pack.json` (mud 1500 length and 600 capacity, low water 1300 and 500, flood 1200 and 800, ice 2000 and 300); `creatable` per post kind (squadrons, departments, harbour commands and temporary commands by directive; ships' commands and fort commands by appointment; the rest at a start only); the Mediterranean leg (15 days, capacity 5); the rank seniority tiers (a brevet is one below its grade); the terrain road multipliers (the map README's, themselves design parameters); the trait gate flags (the people README's). All are in `vocab.mjs`.

## Not done

- **The map tripwire re-measure (0043) is pending.** It needs licence-clean geometry as GeoJSON, and none is committed here. The Newberry and census licences are still unconfirmed, and census.gov blocks this machine.
- No label hints, depots, fortification levels, edge conditions or weather zones: the drafts give none.
- No prior order for Captain Adams (the notes name it but give no date or text).
- No tenure history beyond the start, and no people's careers as data.
- The M2 pack still plays; nothing here changes it.

## Findings outside my scope

- The research note's "starting control" proposals are loyalty shares (it says so). They are no longer used as control (lead ruling); they are listed under rule 2 for the loyalty field the lead has filed for the format.
- The people draft cites `HAY-L1908-intro`, a key its Part 1 does not list (it is read as the Hay diary).
- Several oob draft rows still read "needs-source" in a place cell (two ships); the format has no unknown for a block's region, so those blocks are out.
