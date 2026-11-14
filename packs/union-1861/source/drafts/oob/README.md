# Order of battle draft: posts, forces and holders, 4 March to 15 April 1861

Interim data for lane 0.3, drafted before lane 0.2 fixes the pack format. Three CSV files and this note. Nothing here is read by code yet; lane 0.3 converts it.

| File | One row per |
|---|---|
| `posts.csv` | post (an office, command, squadron, yard, ship command or governorship) |
| `force_blocks.csv` | force block or detachment (a garrison, a regiment's companies, a ship) |
| `people_in_posts.csv` | tenure of one person in one post inside the window |

## Conventions

**Ids.**
- People: lowercase ASCII snake_case of surname, first given name, then the initials of other given names (`lee_robert_e`, `scott_winfield`). Shared with the people lane.
- Posts: prefix `us_` (federal), `cs_` (Confederate) or `st_` (a state's own office or forces).
- Force blocks: `fb_` plus side plus name.

**Locations** are free text, "place, county, state" (Virginia counties as in 1861; South Carolina had districts, not counties). Lane 0.3 maps them to region ids.

**Dates** are ISO. A year-month (`1861-01`) means the day is not in the source.
- In `people_in_posts.csv`, an empty `from` means the person held the post before 4 March 1861, and an empty `to` means he still held it on 15 April 1861.
- In `posts.csv`, `established` and `abolished` are filled only when the event falls inside the window, or when it bounds a post that matters to it (the Department of the Pacific, formed 15 January 1861).

**`needs-source`** marks any value no public-domain source in hand gives. It is never a guess. It never appears in a date or numeric cell (`established`, `abolished`, `strength`, `strength_date`, `stores_days`, `from`, `to`, `acting`): that cell is left empty and the row's `notes` ends with a flag such as `[strength: needs-source]`. An empty `from` or `to` with such a flag means unknown, not "before the window" or "still in office"; lane 0.3 should turn the flags into an explicit unknown marker. `location`, `units` and `sources` may still hold the word.

**Cabinet start dates.** For every Lincoln cabinet member, `from` is the Senate confirmation date, 5 March 1861 (House Divided, secondary; the Senate Executive Journal could not be reached, so this stays unresolved against a primary source). Oath dates are not used. Cameron's 5 March also matches the OR III-1 p.964 roster. Callahan p.1 prints 7 March 1861 for Welles's appointment; the Welles row keeps it in `notes` as a conflict, and Toucey's `to` is 5 March to match. The five Navy bureaus' 1842 `established` dates (Act of 31 August 1842) are creation dates, outside the window; they are kept as each post's origin.

**Vocabularies.**

| Column | Values |
|---|---|
| `side` | `union` (federal), `confederate` (the provisional government and its forces), `state` (a governor, or forces still under a state's own authority) |
| `posts.kind` | `president`, `vice_president`, `cabinet`, `bureau` (a War or Navy Department bureau, the Revenue Marine), `general_in_chief`, `army_department` (geographical department), `fort_command`, `arsenal` (arsenals and armories), `navy_squadron`, `navy_yard` (including the Sackett's Harbor station), `ship_command`, `marine_corps`, `governor`, `harbour_command` (a Confederate or state command at a port), `state_military` (a state adjutant general, a state's forces, or the District militia), `temporary_command` (an expedition that dissolves with its operation, 0040) |
| `posts.department` | the federal or Confederate executive department the post belongs to (`war`, `navy`, `state`, `treasury`, `interior`, `justice`, `post_office`, `executive`), or the state's name for a governor and state forces. This is what decides relay (0040): an Army order does not override a Navy officer's orders. |
| `posts.parent_post` | the next post up the chain an order relays through. Governors have none: requisitions reached them from a Secretary of War, so the link is in `notes`. |
| `force_blocks.kind` | `block`, or `detachment` (a part of a block on its own, such as a regiment's companies at one post: 0040) |
| `force_blocks.arm` | `infantry`, `artillery`, `cavalry`, `mixed`, `naval`, `marines`, `engineers`, `ordnance` |
| `acting` | `yes` or `no` |

## Snapshot method

- **Snapshot date.** Strengths are as near 4 March 1861 as a dated return allows. `strength_date` gives the return's date; several garrisons are only counted in January 1861, and a few figures fall just after the window (marked in `notes`).
- **What `strength` counts.** Men present: officers and enlisted men for the Army; complement or crew for ships, with the choice stated in `notes`. Civilian labourers, servants and laundresses are left out and stated in `notes`. Where I derived a figure (the Texas regiments: row total less servants and laundresses), the arithmetic is in `notes`.
- **Stores.** `stores_days` is filled only where a source states supply in days or a ration period. Its date is in `notes`.
- **Conflicts.** Where two sources disagree, both values stay in `notes` and the row says which one it used.
- **OCR.** Every source was read as OCR text. Garbled tables were repaired from a second scan where one existed (OR I-1); a number that could not be read is `needs-source` with "OCR unclear".

## Sources and why each is public domain

All sources were read as OCR text from scans on the Internet Archive. Row citations use the short keys below with page numbers. Two kinds of public domain apply:
- **US government works** (17 U.S.C. 105): everything printed by the Government Printing Office or by order of Congress.
- **Publications before 1931**, which are public domain in the United States by age.

| Key | Work | Basis |
|---|---|---|
| OR I-1 | *War of the Rebellion: Official Records of the Union and Confederate Armies*, Series I vol. 1 (GPO, 1880): Charleston harbour, the seizures, Florida, Texas and New Mexico | US government work |
| OR I-50 | the same, Series I vol. 50 part 1 (Pacific coast) | US government work |
| OR III-1 | the same, Series III vol. 1 (1899): the 15 April call and quota table, the governors' replies, the War Department roster (p.964) | US government work |
| OR IV-1 | the same, Series IV vol. 1 (1900): Confederate correspondence and requisitions | US government work |
| ORN I-1, ORN I-4, ORN II-1 | *Official Records of the Union and Confederate Navies*, Series I vols. 1 and 4, Series II vol. 1 (GPO, 1894–1921). ORN I-1 pp.xiii–xvi lists ships in commission on 4 March 1861 with stations | US government work |
| NavyReg1861 | *Register of the Commissioned and Warrant Officers of the Navy*, corrected to 1 January 1861 (GPO) | US government work |
| SecNav1860 | Report of the Secretary of the Navy (Toucey), December 1860, in the House's printing of the President's message, 36th Cong. 2nd sess. (Bowman, printer to the House, 1860) | US government work |
| SecNav1861 / msg_jul1861 | Lincoln's message of 4 July 1861 with the reports of the Secretaries of War and the Navy (Welles's report of 4 July 1861: the 4 March snapshot), 37th Cong. 1st sess. | US government work |
| Dyer | Frederick H. Dyer, *A Compendium of the War of the Rebellion* (Des Moines, 1908), departments at p.254 | published before 1931 |
| Heitman | Francis B. Heitman, *Historical Register and Dictionary of the United States Army* (GPO, 1903), vols. 1–2 | US government work |
| JCCS | *Journal of the Congress of the Confederate States of America*, vol. 1 (Senate Doc. 234, GPO, 1904) | US government work |
| Callahan | Edward W. Callahan, *List of Officers of the Navy of the United States and of the Marine Corps, 1775–1900* (1901) | published before 1931 |

**Also cited, as pointers, not data of record.** Where no public-domain text was reachable, a row cites the repository's research notes (`docs/research/2026-11-14-*.md`) and says so in `notes`. These rows are:
- Lincoln's cabinet start dates (House Divided, a secondary source);
- the Washington garrison and District militia figures (National Park Service, *Civil War Defenses of Washington*, a federal and so public-domain work, but reached here only through the note);
- the Sumter expedition's sailing dates.

Rows resting on a research note alone carry "[source: research note only; primary source not reached, unresolved]" in `notes`. They are: posts `us_attorney_general`, `us_dc_militia`, `us_harpers_ferry_armory`, `us_postmaster_general`, `us_secretary_state`, `us_secretary_treasury`; force block `fb_us_dc_militia`; and the tenures of `bates_edward`, `stone_charles_p`, `blair_montgomery`, `buchanan_james`, `smith_caleb_b`, `seward_william_h`, `chase_salmon_p`. The PR-fixes lane tried and could not reach a primary text for any of them (the Senate Executive Journal for 5 March 1861, OR III-1 p.964 covers only the Secretary of War); the candidates are the Senate Executive Journal, Heitman (Stone) and Callahan.

They need a verification pass before the pack treats them as of record. Wikipedia, Nafziger, Eicher and Warner were not used. Cullum's Register and the September 1861 Army Register were fetched but not needed.

**Network access.** The cloud environment allowed none of these hosts at first. I added `archive.org`, `ebooks.library.cornell.edu`, `babel.hathitrust.org`, `www.history.navy.mil` and `penelope.uchicago.edu` to the session's personal environment, which the owner approved on a prompt; only archive.org was used. Cornell's Making of America now redirects to `collections.library.cornell.edu`, which is still blocked.

## Coverage

| | Posts | Force blocks | Tenures |
|---|---|---|---|
| Union | 77: president, 7 cabinet, 16 bureaus (10 War, 5 Navy, Revenue Marine), general-in-chief, 8 Army departments, 5 forts, 2 arsenals, District militia, 6 squadrons, 9 navy yards and stations, Marine Corps, 18 ship commands, 2 temporary expeditions | 66: 44 ships (the 42 in commission on 4 March, Water Witch commissioned 10 April, and the Treasury cutter Harriet Lane), 3 Marine detachments, 19 Army garrisons, regiments and expeditions (5 of them Texas detachments) | 90 |
| Confederate | 21: president, vice president, 6 cabinet, 4 War Department bureaus, the commands at Charleston (with a temporary Morris Island sub-command) and Pensacola (with the navy yard under it), a temporary Texas command (Van Dorn), Fort Morgan, 2 arsenals, the Charleston naval command | 9 | 26 |
| State | 45: 34 governors, 3 state adjutants general, 8 state commands (South Carolina army and volunteer division, Louisiana forts, Texas committee, adjutant general, Rio Grande, north-west frontier, Galveston) | 21 (South Carolina units at Charleston, Fort Morgan, the Louisiana forts, Texas) | 47 |
| **Total** | **143** | **96** | **163** (159 people) |

42 tenures begin or end inside the window: Buchanan's cabinet giving way to Lincoln's, Cooper to Thomas, Fauntleroy to Loring, Houston to Clark, Cunningham's death at Mare Island, and the Confederate bureau appointments.

**Priorities.**
- **Sumter.** Garrison (85 soldiers, 55 labourers), stores (about 7 days on 1 April), mail route, relief expedition.
- **Pickens.** Slemmer's garrison; Vogdes's company afloat with three months' provisions from 23 January; the ships off Pensacola; the Brown–Meigs expedition and its units; Bragg's force (1,045 present for duty on 31 March).
- **Washington's defence.** Regulars and District militia, flagged as second-hand.
- **The navy's ready ships.** All 42 ships in commission on 4 March, by squadron and station. The Home Squadron is 12 ships, 187 guns, 1,981 men, of which 4 were in northern ports.
- **The governors who raised the first regiments.** All 34 governors, with each state's quota under the 15 April call and its answer.

**Thin coverage.** Department of the West troops, New Mexico, the Pacific, Utah, Fort Monroe's strength, and Confederate forts away from Charleston and Pensacola. Most have a post and holder but `needs-source` for strength.

## Every `needs-source`

**Posts.**
- `us_dept_utah`: whether it existed in March 1861, and its commander.
- `us_revenue_marine`: its head.
- `us_secretary_interior`: when it fell vacant.
- `us_dept_east`: headquarters location.
- `us_fort_monroe`: which department it belonged to.
- `us_harpers_ferry_armory`: superintendent and guard.
- `cs_secretary_navy`: Mallory's full given name (the sources print "S. R.").
- `cs_navy_yard_pensacola`: the roles of Farrand and Randolph.
- `st_gov_texas`: the date Houston was removed.
- `established` dates for 15 Confederate and state posts.

**Force-block strengths.**
- Union: New Mexico, the Pacific (the June 1861 table is unreadable OCR), Fort Monroe, the Saint Louis Arsenal troops, Vogdes's company, the Pickens expedition, the troops on the Baltic, and the Marine guards at Washington and Philadelphia.
- Ships: Harriet Lane, Release, Michigan and Anacostia.
- Confederate and state: 8 South Carolina units at Charleston (Kershaw's: a 300–500 range only), the Charleston guard steamers, Fort Morgan, Forts Jackson and St. Philip, and all Texas forces.

**Stores.** For Pickens, Key West and Tortugas.

**Locations.** Release and John Adams on 4 March.

**Tenure dates.**
- Federal: the last day in office of Black, Dix, Stanton and King; Fauntleroy as Loring's predecessor in New Mexico (no public-domain source in hand at all); McDougal at Mare Island (date, and whether acting); Foote at the New York yard; the new ship commanders Rowan (Pawnee), Strong (Mohawk), Craven (Crusader), Mullany (Wyandotte) and Ronckendorff (Water Witch); Maffitt leaving Crusader.
- State: Donnelly acting in Minnesota; Carrington in Ohio; Clark's start in Texas.
- Confederate: the start dates of Deas, Gregg, Hartstene, Ingraham, Hardee, Booth and Duncan; whether Ellett served as Postmaster General.

`notes` on each row says what was searched.

## Conflicts between sources (both values kept in the rows)

1. **Anderson's force estimate of 28 February.** Holt's letter of 5 March quotes him as "twenty thousand" men (OR I-1 p.197). The March facts note found 70,000 in Epperson's print of the same letter. The OR text is what Lincoln's War Department wrote down.
2. **Lorenzo Thomas.** Adjutant General from 7 March per OR III-1 p.964 and Heitman, but field letters of 17–23 March still address him as Assistant Adjutant General at Headquarters of the Army, New York (OR I-1 pp.360, 599). The official roster makes him appointed, not acting, so the March facts note's "Thomas, acting" is not supported.
3. **Lincoln's cabinet.** Confirmed 5 March per House Divided; a snippet gives Treasury from 7 March.
4. **The 15 April quota table.** OR III-1 pp.68–69 prints 94 regiments and 73,391 men; the governors agent rebuilt the garbled rows and they add up to it. The secession-winter note's 93 regiments, 72,540 summed and 73,910 stated (from Wikipedia) are wrong. Pennsylvania: 16 regiments cut to 14 in the table, against "14 instead of 10" in Cameron's letter of 16 April.
5. **Texas, 26 February statement.** The regiment rows sum to 2,450 soldiers against the table's 2,445 (OCR or the table itself).
6. **The Ordnance and Hydrography bureau.** The Navy Register's department page names D. N. Ingraham, but its captains' list (Ingraham "commanding Richmond") and Callahan p.4 give George A. Magruder from 24 September 1860. The rows use Magruder.
7. **Ships in commission on 4 March.** ORN I-1's list has 39 ships against Welles's 42. Release, Michigan and Anacostia were added by inference from Welles's class and gun totals, and labelled so. Crews total 6,440 in the ORN list against Welles's "about 7,600". Gun counts differ between sources for Pawnee, Mohawk, Saratoga, St. Mary's, Seminole, Richmond, San Jacinto and Harriet Lane.
8. **Powhatan.** Reached New York on 13 March (Foote) or 18 March (Mercer).
9. **Buchanan of the Washington yard.** Dismissed 22 April (Welles) or 22 May (Callahan); both after the window.
10. **Beauregard.** Took command 3 March (the OR's summary and a South Carolina order), but his General Orders No. 1 is dated 6 March. Ripley's artillery strength was 242 men and 63 Vigilant Rifles on 5 March, against 290 and 53 on 6 March.
11. **Pensacola, 31 March.** 1,045 present for duty and 1,116 in the last column, whose heading is illegible in both scans: aggregate present, or present and absent.
12. **Texas governorship.** "Governor Clark" is in office by 26 March and Houston "deposed" (OR I-1 pp.611–616). Yet Houston writes of "my official functions" on 29 March and a federal colonel calls him "Governor Houston" on 1 April. The often-quoted 16 March is in none of these sources.
13. **Confederate staff.** Hamilton appears as an artillery captain and signs as a Confederate Navy lieutenant. Northrop reportedly declined a commission on 15 March and is acting Commissary General on 27 March.

## Open questions for lane 0.3

1. **Ships.** Each ship is a force block under its squadron's post, and only Home Squadron ships and flagships have `ship_command` posts. Should every ship be a post with a holder, given that Adams of the Sabine refused an Army order?
2. **Governors have no `parent_post`.** Requisitions came from a Secretary of War. The format needs a "requisition" link that is not a chain of command.
3. **Authority and command differ at Charleston.** South Carolina troops served under a Confederate general while still state forces (`side: state`, post `cs_cmd_charleston`). The format may need a separate "authority" field.
4. **Joint and cross-department posts.** The Sumter relief expedition had troops under War and ships under Navy orders; here it hangs under `us_secretary_war`. Vogdes "assumed command of the forces on the station" while aboard a Navy ship. Relay (0040) needs a post with two departments, or two posts.
5. **No department above some forts.** The Florida forts and Sumter answer to the general-in-chief direct until the Department of Florida forms on 13 April. Fort Monroe's department is unsourced.
6. **Strength dates run from January to mid-April.** Use them as 4 March starting values, or have a supply or attrition rule bring them forward?
7. **Ids built from initials** because the sources give no first name: `dunovant_r_g_m`, `mullany_j_r_m`, `nicholas_j_s`, `read_j_m`, `sherman_s`. `beauregard_peter_g_t` follows Heitman's "Peter Gustavus Toutant"; the people lane may use "pierre". Reconcile with the people roster.
8. **Off-map stations.** Squadrons on foreign stations (Mediterranean, Brazil, Africa, East India, Pacific) sit in 0031's off-map boxes. The Mediterranean and Brazil squadrons were recalled on 8–11 April, before Sumter fell.
9. **Texas.** The evacuation of the Department of Texas continues past the window, with captures from 23 April to 9 May. It needs a scripted outcome or a situation.
10. **Labourers and civilians are not soldiers.** Sumter's 55 labourers eat the garrison's rations, and the stores model has to count them.
