# Union 1861 map: draft regions and edges (interim format)

Status: draft, 2026-11-14, from the cloud map data lane. Not canon. It is input for lane 0.3, which imports it once lane 0.2 fixes the pack format. The map is as of 4 March 1861; the county lists are as of 1 March 1861, as the brief asked. It follows 0019 and 0031 (extent, size, sources), 0028 (March start, navy through people), 0029 (seasons, sieges), 0033 (public-domain data only) and 0040.

- `regions.csv`: 263 regions.
- `edges.csv`: 931 typed edges (527 road, 173 rail, 121 river, 110 sea).

Nothing here is geometry. County lists are data. No third-party geometry file is committed.

## Extent and counts

| Theatre | Land | Key points | Total |
|---|---|---|---|
| eastern (Va., W.Va. counties, Md., Del., D.C., Pa., N.J., N.Y., New England, N.C., S.C.) | 58 | 11 | 69 |
| western (Ga., Fla., Ala., Miss., La., Tenn., Ky., Ohio, Ind., Ill., Mich. and Wis.) | 77 | 24 | 101 |
| trans_mississippi (Mo., Ark., Texas, Kan., Iowa, Minn., the territories) | 40 | 5 | 45 |
| sea (zones and sounds) | | | 25 |
| river (navigable reaches) | | | 12 |
| off_map (boxes) | | | 11 |
| **Total** | | **40** | **263** |

This is inside 0031's target of 220–280 and below its 350 ceiling. A first pass reached 369 regions and 82 key points, so I merged regions back to the research note's per-theatre budgets. Nothing in the evidence contradicts 0031.

- **Full resolution:** southern Pennsylvania to the Gulf, the Atlantic to eastern Texas. Every county of Va. (including the W.Va. counties), Md., Del., D.C., N.C., S.C., Ga., Fla., Ala., Miss., La., Tenn., Ky. and Mo. is assigned. So are eastern Texas, eastern Kansas, and southern Ohio, Indiana and Illinois.
- **Coarse (one region, or a remainder):**
  - Kansas west, Nebraska, Dakota, Minnesota, Iowa, Colorado.
  - New Mexico and Arizona (two regions) and Indian Territory (two).
  - West Texas, the Florida peninsula (two).
  - Northern Pennsylvania, Ohio, Indiana and Illinois.
  - New Jersey, New York, New England, Michigan and Wisconsin.
- **Off-map boxes:**
  - The Pacific coast and Panama.
  - Britain and Canada, and France and Mexico (one box each, as 0031 has them).
  - The runners' ports: Nassau, Bermuda, Havana, Matamoros.
  - Three raider zones: north_atlantic, south_atlantic and eastern_seas.

The theatre column follows state lines (listed above). Theatres are conventions; the pack's departments will regroup them.

## Conventions

- **`id`**: snake_case and unique. `name` is the label for the staff map.
- **`counties_1861`**: semicolon list of `State:County`.
  - **Names** follow the 1860 census (Kennedy, 1864) and standard period spelling. They are meant to match the Newberry atlas's names on 1 March 1861, but have not been checked against Newberry (see open questions).
  - **`State:*`** means every county of that state or territory not named in another region. It is used for coarse regions (`PA:*`, `TX:*`, `KS:*`, the territories).
  - **`State:Name (part: …)`** means a region split from a county along a line still to be traced from a period map (0031 allows this). There are seven:
    - Fort Sumter (from Charleston), Fort Pickens (Santa Rosa), Ship Island (Harrison).
    - Port Hudson (East Baton Rouge, parish to confirm), Island No. 10 (Obion), Fort Henry (Stewart).
    - Indian Territory, which has no counties.
  - **The parent county keeps the rest.** The parent region lists the county again; the split takes only its part.
  - **Independent cities in Virginia** (Richmond, Petersburg, Norfolk, Portsmouth, Alexandria, Lynchburg and others) are not listed. Lane 0.3 absorbs each into the region of its surrounding county, which the notes name.
  - **Baltimore City** is its own region; Baltimore County is separate.
  - **Territories.** Dakota Territory was organised on 2 March 1861 and Colorado Territory on 28 February (to confirm; general knowledge). On 1 March the Dakota area east of the Missouri was unorganised. I used the 4 March territories for these coarse, county-less regions.
- **Reference points.** Each region's notes end with `[ref point lon,lat]`:
  - for key points and coarse territories, the main town or a chosen point;
  - for other land regions, a centroid computed locally (see "How it was checked").
  - Sea, river and off-map regions use a chosen point.
  - Lengths are computed from these points.
- **Flags.** `key_point_flags` may appear on any region, not only key points, so that a coarse region still says it holds a port or a capital.

## Vocabularies

**theatre**: eastern, western, trans_mississippi, sea, river, off_map.

**kind**: land, key_point, river, sea, off_map.

**terrain**: a short controlled list. The road multiplier is used for lengths (below).

| Value | Meaning | Road multiplier |
|---|---|---|
| plain | open farmland, coastal plain | 1.0 |
| rolling | piedmont and rolling farmland | 1.0 |
| prairie | open grassland | 1.0 |
| valley | broad intermontane valley (Shenandoah, East Tennessee) | 1.0 |
| urban | a city key point | 1.0 |
| tidewater | estuarine lowland cut by tidal rivers | 1.0 |
| hills | rough hill country, plateau edges | 1.2 |
| forest | thin pine and wiregrass country, few roads | 1.2 |
| desert | arid country | 1.2 |
| swamp | swamp and marsh (Dismal Swamp, Atchafalaya, Bootheel) | 1.4 |
| delta | alluvial bottom liable to flood (Yazoo Delta) | 1.4 |
| mountains | Appalachian ridges, Ozark and Ouachita mountains, Rockies | 1.5 |
| open_sea, coastal, sound, river | water regions only | n/a |

**key_point_flags**: fort, naval_base, rail_junction, river_junction, port, capital (state or national capital), arsenal (arsenal or armory), navy_yard.

**fort_mode** (forts on water only): `passage` if ships could run past, `reduction` if the fort had to be taken. The calls rest on the navy note's cases:
- **passage:** Forts Jackson and St. Philip; Fort Morgan at Mobile; Fort Henry, which fell to gunboats alone.
- **reduction:** Fort Donelson, Vicksburg, Port Hudson, Island No. 10, Charleston and Sumter, Columbus, Fort Monroe, Pulaski, Fort Macon and the Cape Fear forts, Pickens and Barrancas, Key West, Ship Island, Fort McHenry.
- **Judgement calls:** Pensacola, Fernandina and New Madrid are my calls; check them.
- The `fort_mode` column holds only these two values or is empty. Seven land rows once held a quoted "lon,lat" there by mistake; the PR-fixes lane blanked them and moved the point into the notes as "[town point …]". The three `passage` rows are `forts_jackson_st_philip`, `mobile` (Fort Morgan) and `fort_henry`.

**Edge `type`**: road, rail, river, sea.
- A ferry crossing is a road edge with capacity 1–2 and a note. River crossings without a ferry note have no road edge.
- A sea zone and a river reach meet by a river edge.
- A tributary is a river edge between two bank regions (the Arkansas, White, Yazoo, Red, Missouri, Alabama, Tombigbee, Chattahoochee, Savannah, Cape Fear and upper Cumberland).

**`capacity`** (relative, 1–5):

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| road | mountain track, swamp road, ferry | ordinary country roads | good roads or several parallel | macadamised turnpike (Valley Pike, National Road, Nashville pikes) | several turnpikes into a city |
| rail | light or unfinished line, or a ferry break | light single track | single-track main line | well-equipped trunk (B&O, Pennsylvania, L&N, Illinois Central) | two or more lines or double track |
| river | small boats in high water only | small steamboats most of the year | regular steamboat navigation | large steamboats most of the year | the Mississippi main stem |
| sea | inlet for light draught only | bar-limited harbour | bay or sound channel | deep harbour, coastal lane | open sea |

**`seasonal`**:
- **Roads:** `mud` where winter and spring mud mattered (every dirt road), `none` for macadamised turnpikes and arid routes.
- **River edges:** the months when low water limits draught, or a sourced statement.
- **Sea and rail:** `none`. Winter gales off Hatteras are a weather matter for 0029, not an edge field.
- **Unsourced months** are marked "to confirm". Where nothing is known the cell is empty and the notes carry "[seasonal: needs-source]" (12 river edges). About 60 river edges still hold free text (months, ice, falls); lane 0.3 normalises these when it fixes the format.

**`obstruction_1861`** (water edges only): batteries or works in hostile hands on 4 March 1861, or `none`. Works built later are noted in `notes` but are not obstructions. The obstructed edges:
- the Charleston bar and harbour;
- Fort Pulaski at Savannah;
- Fort Marion at St. Augustine, and the unfinished Fort Clinch at Fernandina;
- Pensacola, where Barrancas and McRee face Pickens;
- Forts Morgan and Gaines at Mobile;
- Forts Pike and Macomb on the New Orleans lakes;
- Forts Jackson and St. Philip;
- Vicksburg (unconfirmed).

The Cape Fear forts and Fort Macon were federal and unmanned, so their edges read `none` with a note.

## Length method (`length_days`, integer, minimum 1)

`d` is the straight-line distance between the two regions' reference points.

| Type | Distance | Rate | Days |
|---|---|---|---|
| road | `1.25 × d` (road winding), or a given mileage | 12 miles a day for a marching division, times the larger terrain multiplier of the two regions | `ceil(miles × terrain / 12)` |
| rail | `1.15 × d`, or the line's mileage where given | 100 miles a day for a division by rail, including loading | `ceil(miles / 100)` |
| river | `d ×` sinuosity (Mississippi 1.6, Ohio 1.3, Tennessee and Cumberland 1.4, others 1.5) | 80 miles a day, a steamer working upstream with landings | `ceil(miles / 80)` |
| sea | `1.15 × d` in nautical miles, or a given leg | 160 nautical miles a day (about 7 knots with coaling and weather) | `ceil(nmi / 160)` |

Each edge's notes end with the mileage used and the straight-line distance, so the numbers can be checked and recomputed.

- **The rates are design parameters, not sourced facts.** The 12 miles a day sits below the 13.5 miles a day of Jackson's Valley march in the map research note. The rail, river and sea rates still need checking against period movements (for example the 1863 rail transfer of the XI and XII Corps, and Lloyd's distance tables).
- **Given mileages:**
  - B&O sections (60, 21, 80, 100 and 100 miles), the Orange and Alexandria to Manassas (27) and the Northwestern Virginia (104): standard figures, still to check against the census table.
  - The two overland routes to the Pacific (900 and 1,700 miles).
  - The off-map sea legs. Washington to Britain comes to about 19 days, matching the Trent crisis's 17–19 days for despatches.
- **Coarse regions give long, notional lengths.** Centroid to centroid, for example Northern Ohio to Michigan and Wisconsin is 46 days.
- **Edges into and out of a river reach** run from the reach's midpoint to the bank region. They are approximate (see open questions).

## Key points (40) and why

Rule (map research note, section 2.2): a place gets its own small region if a decision about it is a distinct strategic or political choice.

- **Eastern (11):**
  - Washington (capital, navy yard, arsenal); Richmond (capital from May 1861, Tredegar, five railroads).
  - Manassas (O&A and Manassas Gap junction); Petersburg (five railroads).
  - Harpers Ferry (armory, B&O bridge, burned 18 April); Baltimore (the troops' route north; Fort McHenry).
  - Fort Monroe (Union foothold on Hampton Roads); Norfolk and Gosport (the navy yard lost 20 April).
  - Fort Sumter (the opening situation, held while Charleston was not); Charleston (the batteries).
  - Wilmington (rail hub and later the last open Atlantic port).
- **Western (24):**
  - Gulf and Atlantic ports and forts: Savannah (Pulaski); Pensacola and Fort Pickens (same split as Sumter); Key West (Union Gulf base); Mobile; Ship Island (staging base); New Orleans and Forts Jackson and St. Philip (passed, not reduced); Port Hudson.
  - The rivers: Vicksburg; Memphis; Island No. 10 with New Madrid; Fort Henry and Fort Donelson (12 miles apart, two decisions); Columbus, Paducah and Cairo (the September 1861 Kentucky decisions are town-scale).
  - Rail hubs: Corinth (M&C × M&O); Chattanooga; Atlanta; Nashville; Bowling Green (L&N and its Memphis branch; Johnston's 1861 line); Louisville (falls, L&N).
  - Cumberland Gap (the Kentucky–East Tennessee door).
- **Trans-Mississippi (5):**
  - St. Louis (arsenal, Camp Jackson, rail and river hub).
  - New Madrid (paired with Island No. 10).
  - Springfield (the Wilson's Creek decision).
  - Galveston (main Texas port).
  - Brownsville (opposite Matamoros, the Texas bypass).

Deliberately not key points; they are flags inside larger regions:
- capitals and rail hubs: Montgomery, Jackson (Miss.), Baton Rouge, Little Rock, Houston;
- rear cities: Harrisburg, Philadelphia, Cincinnati, Pittsburgh;
- smaller places: Gordonsville, Hanover Junction, Lynchburg, Weldon, Goldsboro, Fayetteville, Augusta, Macon, Columbus (Ga.), Meridian, Clarksville, Smithland, Rolla, Ironton, Helena, Fort Smith, Grafton.

Any of them can be split out later within the ceiling.

## Sources

Every source below is public domain. All were read as full text on archive.org; page images were not checked.

| Key | Source | Copy used | Licence and notes |
|---|---|---|---|
| CEN1860-POP | Joseph C. G. Kennedy, *Population of the United States in 1860* (Washington: GPO, 1864) | archive.org `populationofusin00kennrich` (University of California copy) | US government work, public domain. Used to check county names: the OCR is damaged, so only a fuzzy match was possible (see below). |
| CEN1860-RR | *Statistics of the United States (including mortality, property, &c.) in 1860* (GPO, 1866), Miscellaneous Statistics, "Railroads": comparative statement of lines completed, by state, pp. 324 ff. | archive.org `statisticsunite00goog` (Google-digitised) | US government work, public domain. The scan's Google front matter asks for "non-commercial" use and no automated querying. That is a request, not a copyright licence, and only facts are taken, but cite the census.gov PDF (federal) in the final pack. The southern tables' OCR is badly damaged, so line names were checked by eye where legible. |
| OR-I-1 | *War of the Rebellion: Official Records*, Series I, vol. 1 (GPO, 1880): the "Summary of principal events" for each chapter (Charleston, Georgia, Alabama and Mississippi, Florida, North Carolina, Louisiana, Texas, Arkansas and Indian Territory); Whiting's report of 7 January 1861 (p. 319); Ellis to Buchanan, 12 January 1861 | archive.org `warofrebellion01secrrich` | Public domain |
| OR-I-3 | *Official Records*, Series I, vol. 3 (GPO, 1881): Sweeny's report of 12 July 1861 ("Rolla, the terminus of the Southwest Branch"); autumn 1861 despatches placing the railhead near Georgetown and Sedalia | archive.org `warofrebellion03secrrich` | Public domain |
| LLOYD1856 | James T. Lloyd, *Lloyd's Steamboat Directory, and Disasters on the Western Waters* (Cincinnati, 1856): Ohio River chapter (Tennessee, Cumberland, the falls); sketch of the Mississippi and its tributaries (Arkansas, White, Red, Yazoo); Nashville sketch; distance table from Louisville | archive.org `lloydssteamboatd00lloy` (Library of Congress copy) | Published 1856, public domain. The distance tables' OCR is column-scrambled; only the Louisville–Cairo rows were legible. |
| MO-AR-1861 | Mobile and Ohio Railroad Co., Annual Report as of 1 April 1861 (President Milton Brown's report; Chief Engineer L. J. Fleming's letter of 6 May 1861), for the thirteenth annual meeting, 7 May 1861 | transcription on csa-railroads.com | 1861 company report, public domain; only facts are taken. Added by the PR-fixes lane, not the original map lane. |
| research note … | `docs/research/2026-11-14-map-extent-size-sources.md`, `-union-navy.md`, `-secession-winter-1861.md`, `-march-1861-facts.md` | this repository | Our own notes; they cite their sources |
| own-work (zone layout) | Sea zones, river reaches and their adjacency are authored here | | To be drawn from Natural Earth (public domain) per 0031 |

Not used: Wikipedia, Nafziger, copyrighted compendia, NHGIS, the Atack and UNL railroad datasets, David Rumsey. The Newberry atlas, census.gov, the Library of Congress and the Wayback Machine were unreachable from this session (network policy), so nothing here is taken from them.

## needs-source

- **Roads.** Every road edge's existence and capacity rests on county adjacency and general knowledge of the period roads; none is sourced to a period map. The candidate is the *Official Records Atlas* General Topographical Map. Turnpike names in the notes are general knowledge.
- **Counties created after the census and before 1 March 1861**: Clay, Mitchell and Transylvania (N.C.), Polk (Fla.), Worth (Mo.). Also the renaming notes (Cass to Bartow, Cass to Davis, New River to Bradford, Lykins to Miami) and the territorial dates.
- **Railheads and completion dates in March 1861:**
  - the Mobile and Ohio's last gap. The company's annual report of 1 April 1861 (MO-AR-1861) says the track stood complete from Mobile to Okolona and from Columbus, Ky. to two miles below Jackson, Tenn., and that the last spike closing the line was driven on 22 April 1861. So the gap lay between Okolona and Jackson, Tenn.; the report does not say where inside that stretch. The Okolona–Tupelo and Tupelo–Corinth edges carry capacity 1 and an "unbuilt in March 1861" note, and the other Mobile and Ohio edges in the stretch carry a note. The location is needs-source (the contemporary press, or the Chief Engineer's report, may place it);
  - the Southern Railroad to Meridian; the Mississippi and Tennessee to Grenada;
  - the Pacific Railroad to Sedalia and the Southwest Branch to Rolla (both in operation by mid-1861 per OR I-3; opening dates unconfirmed);
  - the Florida Railroad (about 1 March 1861) and the Pensacola and Georgia to Lake City;
  - the Savannah, Albany and Gulf beyond the Altamaha;
  - the Western North Carolina and the Wilmington, Charlotte and Rutherfordton railheads; the Alabama and Florida;
  - the Memphis and Little Rock sections; the New Orleans and Ohio to Union City;
  - the Texas and New Orleans, and the Buffalo Bayou, Brazos and Colorado to Alleyton;
  - the Quincy and Palmyra; the Nashville and Northwestern;
  - the Savannah River crossing at Hamburg–Augusta and the Chattahoochee crossing at Columbus–Girard.
- **Rail lines not checked in the census table**: New Jersey, New York, New England, Indiana and the lines into Chicago, Michigan, the Canadian lines.
- **River seasons**: low-water months on the Ohio, lower Tennessee, upper Mississippi and Missouri; all of the Alabama, Tombigbee, Chattahoochee, Apalachicola, Savannah, Cape Fear, Atchafalaya and Ouachita; the bar depths at the Mississippi passes and at each harbour (the sea capacities are relative guesses).
- **Places:**
  - the Vicksburg battery (January 1861) and whether it stood in March;
  - Galveston's defences in March 1861;
  - the fortification dates of Fort Henry, Island No. 10, Fort Pillow and Port Hudson (notes say "later");
  - the parish of the Port Hudson bluffs;
  - the county of the Memphis, Clarksville and Louisville's Tennessee River crossing at Danville (Stewart or Humphreys);
  - which county held Roanoke Island;
  - the Indian Territory nation boundaries (period map).

## Open questions for lane 0.3

1. **Newberry names.** Join every `State:County` against the Newberry attribute table for 1861-03-01. These names were checked against 1860 census OCR only. About fifteen were not found because of OCR damage: Cabarrus, Gaston, Kershaw, Barnwell, Screven, Muscogee, Ste. Genevieve, Pettis, Ralls, Van Zandt, Kaufman, Atascosa, Terrebonne, LaRue, and Transylvania (created after the census).
2. **The `*` remainder and `(part: …)` conventions** need support in the importer, or expansion into explicit lists. Splits need traced lines and provenance entries (0031).
3. **Independent cities in Virginia** and **Baltimore City**: confirm how Newberry represents them, and absorb them as the notes say.
4. **River reaches.** Should a reach be a through-route with landing-to-landing times from Lloyd's distance tables, rather than midpoint-to-bank edges? Should upstream and downstream lengths differ? These edges carry one undirected length at an upstream rate.
5. **Two lines between the same pair of regions** are merged into one edge with both named in the notes: Raleigh to the Goldsboro–Weldon region; Corinth to Grand Junction; Harpers Ferry to the lower Valley. The format may want parallel edges or a line name.
6. **Breaks of gauge and ferries** (Baltimore's horse-car link, the Susquehanna and Ohio ferries, Bristol, Hamburg, Columbus–Girard) are notes and low capacities. The format may want a transshipment field.
7. **Coarse regions' lengths are notional.** The 263 regions are within budget, so splitting Texas, northern Missouri or the Deep South interior is affordable if play needs it.
8. **Flags on non-key regions**: keep them, or move them to named sites inside regions (the map research note's open question on named sites)?

## How it was checked

- **County names**: compared with the 1860 census text (fuzzy, because of OCR damage); unmatched names are listed above.
- **Coverage and adjacency (a check, never a source):** I mapped the 1861 counties onto the Census Bureau's 2017 county boundaries from the npm package `us-atlas` 3.0.1, decoded locally and not committed. This confirmed:
  - every modern county in the full-resolution states falls in exactly one region (counties created after 1861 were assigned to a neighbour's region for the check);
  - every pair of regions that share a border has a road edge, unless the border is a major river or bay crossed only where a ferry or bridge is noted.

  The same data gave the land regions' centroids. Per 0019, edges were authored by hand and the geometry only checked them.
- **Graph**: connected from Washington; no duplicate edges; every water edge has `obstruction_1861`; every rail edge has a source. The only land regions without a road edge are Fort Sumter, Fort Pickens, Ship Island and Key West, which are reached by sea.
- **Drafting scripts**: they lived in the session's scratchpad and are not committed. The CSVs are the data of record for this draft.
