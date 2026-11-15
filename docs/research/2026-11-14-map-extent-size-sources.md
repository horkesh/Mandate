# Research: map extent, size and licence-clean sources for the Civil War pack

Date: 2026-11-14. Status: research note (not canon).

**Conventions.**
- Citation keys in [brackets] resolve in the Sources list at the end.
- **(snippet)** = seen only in a search-result summary; the page itself refused automated fetches (HTTP 403) or was not opened. Verify before relying on it.
- **[gk]** = general knowledge, unverified. **[I]** = our interpretation.
- **[WP]** keys are Wikipedia pages. Only the first 100,000 characters of each long page were read. They are fine for orientation, but any figure that carries a design argument needs a better source first (LANES rule: facts come from a lane).
- Licence wording is quoted from the licence page itself wherever I could read it. Nothing here is legal advice.

**Settled model, not reopened.** Regions in the hundreds over an authored typed graph; control as permille; fronts and pockets derived; the staff map drawn procedurally from GeoJSON (0019, 0013, FOUNDATION section 4). **Nothing I found contradicts it.** The tick budget turned out not to be the binding limit on region count (section 2.4).

---

## 1. Extent: where the war was fought or decided, 1861-65

### 1.1 Theatres and their weight

| Area | Weight in the war | Source |
|---|---|---|
| **Eastern** (Virginia, West Virginia, Maryland, Pennsylvania, Washington, the Carolina coast) | Washington and Richmond are about 100 miles apart, so the fighting sat next to the newspapers and the politicians. It hosted the bloodiest battle (Gettysburg) and the bloodiest day (Antietam). The Shenandoah Valley was fought over in 1862, 1863 and 1864. Jackson's 1862 Valley army marched 646 miles in 48 days (about 13.5 miles a day). | [WP-East] |
| **Western** (Kentucky, Tennessee, Mississippi, Alabama, Georgia, Louisiana east of the river) | Often argued to be the more decisive theatre. The Mississippi, Tennessee and Cumberland rivers were the roads into the South. Forts Henry and Donelson (Feb 1862, 11,500 surrendered), Shiloh (almost 24,000 casualties, April 1862), Stones River, then Vicksburg and Chattanooga/Atlanta. Polk seized Columbus, Kentucky in September 1861 and Grant took Paducah two days later. Railways ran mostly north-south, which hurt Confederate east-west shifts. | [WP-West] |
| **The Mississippi and its tributaries** | Part of the Western theatre in the sources, but the war's main waterway in practice. Island No. 10 (April 1862) opened it nearly to Memphis; New Orleans fell in April 1862; Vicksburg surrendered on 4 July 1863 and by 8 July, with Port Hudson, the whole river was Union-held. It split the Confederacy and cut off the Trans-Mississippi. | [WP-West], [WP-TM] |
| **Coastal and blockade waters** | About 3,500 miles of coast and 12 major ports (180 possible ports of entry). Lincoln declared the blockade on 19 April 1861. Port Royal fell in Nov 1861, New Orleans in April 1862, Mobile Bay in Aug 1864, Fort Fisher in Jan 1865. About 8,000 runs were made against more than 20,000 voyages in the four prewar years; cotton exports fell about 95%; at least 600,000 arms reached the Confederacy. | [WP-Blk], [WP-LS] |
| **Trans-Mississippi** (Missouri, Arkansas, Kansas, Indian Territory, Texas, western Louisiana) | Wilson's Creek (1861), Pea Ridge (March 1862, which largely secured Missouri), later the Red River campaign and Price's Raid (both 1864). Missouri's guerrilla war cost about a third of its population and has been called the worst such conflict on American soil. After Vicksburg the department was cut off ("Kirby Smithdom"), but Texas stayed a back door for cotton. | [WP-TM] |
| **New Mexico and Arizona** | A small campaign (Feb-April 1862): Sibley's 2,515 Texans against 5,142 Union troops, Valverde and Glorieta Pass. The aim was Colorado's gold fields and then the California ports. A Confederate tactical victory and a Union strategic one. | [WP-NM] |
| **Indian Territory** | The Five Tribes signed Confederate treaties in 1861; at least 7,860 Native soldiers served the Confederacy. Opothleyahola's Union Creeks fled to Kansas in the winter of 1861-62; three Indian Home Guard regiments followed. Honey Springs (17 July 1863, about 3,000 against 3,000-6,000) was the territory's largest battle. | [WP-IT] |
| **Upper Midwest** | The Dakota War, 18 Aug-26 Sept 1862: 358 settlers and about 113 soldiers and militia killed. A commission sentenced 303 Dakota men to death; **Lincoln reviewed the cases personally** and let 38 go to the gallows (Mankato, 26 Dec 1862). Militarily small; politically it landed on the president's desk. | [WP-Dak] |
| **Pacific coast and the far West** | A secondary theatre. Southern California was strongly secessionist; plots to fit out a privateer in San Francisco Bay were foiled; the California Column went into Arizona and New Mexico in 1862. Pacific gold and silver moved through San Francisco and Panama with a warship kept at Panama City. The NPS lists only one major battle there (Bear River). | [WP-Pac] |
| **High seas** | CSS Alabama took or burned 65 ships between Aug 1862 and her sinking off Cherbourg on 19 June 1864, and never entered a Confederate port. She was built at Birkenhead; the Alabama Claims later paid the US $15.5 million. CSS Shenandoah fired the war's last shot in June 1865 and reached Liverpool in November. | [WP-Alabama], [WP-CSN] |
| **Foreign ports and capitals** | The Trent Affair: the envoys were seized on 8 Nov 1861; the news reached London on 27 Nov (19 days); the British dispatch left on 1 Dec and reached Washington on 18 Dec (17 days); Britain sent 11,000 troops to Canada in December. Blockade-running ran through Nassau (busiest), Bermuda and Havana, with Matamoros as the land route into Texas (snippet). | [WP-Trent], [BR-Hubs] |

Scale of fighting: the National Park Service's 1993 survey picked 384 principal battles out of roughly 10,500 armed conflicts (snippet) [CWSAC].

### 1.2 Three points that shape the extent

- **Theatre boundaries are conventions.** Wikipedia's Western theatre includes the Carolinas' interiors and its Eastern theatre includes the Carolina coast [WP-East], [WP-West]. AGEoD groups regions into States and States into Departments [games note 1.2]. Mandate's theatres should be the **departments of the pack** (posts that hold people), not a fixed geography.
- **The first slice already needs the edges of the map.** The 1861-62 scenario ends on 31 December 1862. That span contains the Trent crisis (Nov 1861), the New Mexico campaign (Feb-Apr 1862), the Dakota War (Aug-Dec 1862) and Opothleyahola's flight (winter 1861-62). A map that stops at the Mississippi and the Ohio drops three of Lincoln's real 1861-62 decisions.
- **Place matters at town scale in the border states.** The Columbus and Paducah moves of September 1861 were two separate decisions about Kentucky's neutrality. For the People, a point-to-point game, gives Cairo, Paducah, Columbus KY, New Madrid, Pittsburg Landing, Rolla, Ironton and Jefferson City their own spaces [FtP-R].

### 1.3 Recommended extent

**On the map, at full resolution:**
- the Eastern theatre, from southern Pennsylvania to the Carolinas' coast;
- the Western theatre, from the Ohio to the Gulf;
- Missouri, Arkansas and eastern Texas;
- the sea zones along the blockade coast (Chesapeake to the Rio Grande);
- the Mississippi, Ohio, Tennessee and Cumberland river reaches;
- a thin Northern rear (Ohio, Indiana, Illinois, Pennsylvania) so invasions and raids have somewhere to land.

**On the map, coarse (one to four regions each):**
- Kansas and Nebraska, Indian Territory, central and west Texas;
- New Mexico and Arizona, with Colorado;
- Minnesota and Dakota;
- the Florida peninsula.

**Off the map, as boxes with no geometry** (0013 already lets a region's geometry reference be optional):
- **The Pacific coast** as one box (the Department of the Pacific), linked to the map by long overland and Panama sea edges. It carries gold, California volunteers and secessionist flare-ups.
- **Britain and Canada** and **France and Mexico** as boxes linked by sea edges. Their edge length is message time: about 17-19 days to Europe, from the Trent record above [WP-Trent]. Diplomacy itself stays a track, not geography.
- **Atlantic entrepots** (Nassau, Bermuda, Havana) and **Matamoros** as port nodes linked to Confederate ports by sea edges. They feed blockade mechanics. They cannot be captured.
- **Two or three high-seas boxes** (North Atlantic, South Atlantic and Indian Ocean) for raiders. The player never commands a raider (0001); the Navy post does.

**Not mapped:** the Pacific and Indian Ocean whaling grounds, individual raids and tactical ground.

---

## 2. Size: how many regions, and why

### 2.1 What other games did

| Game | Map unit | Count and scale | Source |
|---|---|---|---|
| AGEoD Civil War II (2013) | irregular land regions, sea zones, river regions, 15-day turns | **More than 3,000 regions**, Eastern seaboard to the Rockies plus Mexico and the northern Caribbean. The commonest complaint is micromanagement. | [CW2-Matrix], [games note 1.1-1.2, 1.10] |
| Strategic Command: American Civil War (2022) | hexes | 66,000 hexes of 15 km | [games note section 4] |
| For the People (GMT) | point-to-point spaces, typed links | Space count not stated in the rules and not found elsewhere. Spaces are towns and passes. An army moves 6 spaces, a corps 8, a division 5, cavalry 10. | [FtP-R] |
| No Greater Glory (1991) | territories | "About half a medium-sized state", four-month turns | [games note section 3] |
| Grigsby's War Between the States (2008) | regions, monthly turns | Region count not found | [games note section 3] |
| Grand Tactician | continuous | no regions | [games note section 2] |

The two ends are instructive. Where the player commands armies (AGEoD, hex games) the map has thousands of cells. Where the player is the president (No Greater Glory, Grigsby) it has far fewer. Mandate's player commands nobody on the ground, so the AGEoD end is the wrong end [I].

### 2.2 What the operations of the period need

A region is the unit a proxy plans across. At Jackson's 13.5 miles a day [WP-East], a region 50 miles across is about four marching days. A day tick then sees an army cross a region in a few ticks and a campaign in weeks, which is the right pace for a leader who reads reports. [I]

Tests, with approximate straight-line distances from general-knowledge coordinates [gk]:

| Test | Needs | Answer |
|---|---|---|
| Shenandoah Valley against the Virginia Piedmont | a Lower Valley (Harpers Ferry, Winchester), an Upper Valley (Staunton), the Piedmont rail corridor (Manassas, Culpeper, Gordonsville) and the Blue Ridge gaps | Yes at 2,000-3,500 square miles per region. The 37-region M2 pack already does this with four regions. |
| Cairo against Paducah against Columbus, Kentucky | Cairo to Columbus is about 17 miles and Cairo to Paducah about 32. Fort Henry to Fort Donelson is about 12. | **No, not at area scale.** All three fall inside one 2,500-square-mile region. They need small **key-point regions**. The Tennessee and Cumberland river reaches can be thin river regions or typed river edges. |
| Approaches to Vicksburg | Vicksburg itself, the Yazoo Delta, the Louisiana west bank, the Grand Gulf crossing, Jackson on the rail line, Port Hudson, Memphis and Helena | About 7 to 9 regions between Memphis and New Orleans. |
| Washington and Richmond | fortified single-city regions as in M2 | Yes, key-point regions. |

**Rule for a key-point region [I]:** a place gets its own small region if a proxy's decision about it is a distinct strategic or political choice. Examples: Columbus and Paducah in September 1861, Harpers Ferry, Fort Monroe, Cairo, Chattanooga, Cumberland Gap, Vicksburg, Port Hudson. Expect 25 to 40. This is AGEoD's city region, without AGEoD's thousands of ordinary ones.

### 2.3 Region count for the recommended extent

Land area of the fifteen core states (Virginia and West Virginia counted separately; land square miles from [WP-Area]): 607,000. At typical region sizes:

| Region size | Across | Regions for the core |
|---|---|---|
| 5,000 sq mi | 71 miles | about 121 |
| 3,500 sq mi | 59 miles | about 174 |
| 2,500 sq mi | 50 miles | about 243 |

Small key-point regions are added on top; the Deep South interior and the Northern rear get larger-than-average regions.

**Recommended total: 220 to 280 regions, built to about 250.** Do not go past 350.

| Part | Regions | Notes |
|---|---|---|
| Eastern theatre | 55-70 | Densest along Washington-Richmond and the Valley. The Eastern core (VA, WV, MD, DE, south PA) is about 86,000 sq mi: 35 area regions plus 10-15 key points, plus 8-10 for North Carolina's coast and interior. |
| Western theatre and Ohio Valley rear | 90-110 | Kentucky, Tennessee and the Mississippi reaches are fine; Georgia, Florida and the Deep South interior are coarse. |
| Trans-Mississippi | 35-50 | Missouri 10-12, Arkansas 6-8, Texas 5-6, Indian Territory 3-4, Kansas and Nebraska 3, New Mexico, Arizona and Colorado 4, Minnesota and Dakota 2-3, western Louisiana 2-3. |
| Sea zones and river reaches | 25-40 | One sea zone per blockade-squadron sector plus bays and sounds (Chesapeake, Hampton Roads, Pamlico, Mobile, Galveston), and about 8-10 river reaches. |
| Off-map boxes | 8-12 | As in 1.3. |

The pack should also tag each region with a **department** (a group), as AGEoD does with States and Departments [games note 1.2]. The staff map can then zoom out to departments, which keeps a 250-region map readable.

### 2.4 Trade-offs: the day tick and micromanagement

- **The 40 ms budget (0017) does not limit this.** I timed a throwaway benchmark (not committed): a full recompute of supply reach (Dijkstra from 3 sources over edges with at least 250 permille control), pockets and fronts on a random sparse graph with four links per region, one faction, integer math, in Node:

  | Regions | Edges | Time per recompute |
  |---|---|---|
  | 300 | 600 | 0.10 ms |
  | 1,000 | 2,000 | 0.20 ms |
  | 3,000 | 6,000 | 0.63 ms |

  It excludes movement, combat and the planner, so it is a floor, not the budget. But the map is nowhere near the cost, and 0019 already recomputes only when control changes. [I]
- **Micromanagement and authoring limit the count.**
  - AGEoD's players blame the 3,000 regions [games note 1.10].
  - No Greater Glory's reassignment bookkeeping took 60-80% of play [games note section 9].
  - Mandate's attention budget (0025) is weekly, so more regions only help if the player's questions are about regions.
  - Each region also needs authored edges, terrain, starting control and a source for each.
  - About 250 regions is roughly 700-900 typed edges to author and cite. That is the real cost.

---

## 3. Sources and licences

### 3.1 Summary

| Source | Contains | Licence (from its page) | Commit to a public repo? | Use in a commercial release? | Attribution |
|---|---|---|---|---|---|
| **Newberry Atlas of Historical County Boundaries** | Every US county and state/territory polygon, 1629-2000, coded by date to the day; 1:100,000; WGS84 | "reused for any lawful purpose, commercial or non-commercial", "without licensing or permission fees to the library" [NEW-DL]. Old CC BY-NC-SA text still ships in the zips and "can be ignored" [NEW-US]. | **Yes, derived geometry only** (our dissolved regions, not the 503 MB file). Get the email in 3.2 first. | **Yes**, same wording; same email. | None required. Credit it anyway: "Atlas of Historical County Boundaries, The Newberry Library"; cite as "Siczewicz, Peter. U.S. Historical Counties. Dataset. Newberry Library, 2011" [NEW-MD]. |
| **NHGIS (IPUMS)** | Census boundaries from 1790 on, with TIGER lineage | Users "will not redistribute the data without permission" (snippet) [NHGIS-T]. The terms are described as legally binding (snippet). | **No.** | Not without written permission. | Citation required (snippet). |
| **Atack, Historical GIS of US Railroads** (Vanderbilt) | Railroad shapefiles for 1861 (and 1850-1911 in other years), built from map digitising | **No licence or terms stated** on the download page [ATACK-DL]. The 1861 layer comes from the Taylor & Neu (1956) April 1861 map; the 1863 layer from Lloyd's map [ATACK-PDF]. | **No.** No licence means all rights reserved. | Not without permission from Jeremy Atack. | Suggested citation given on the page. |
| **UNL "Railroads and the Making of Modern America"** | 1861 railroad system as a KML and shapefiles (no Maine); 1861 depots of the South | "published freely for educational and research use, subject to fair use regulations"; "(c) 2006-2017 All Rights Reserved William G. Thomas" [UNL-CR], [UNL-DL]. Commercial use is not addressed. | **No.** | No. Ask cdrh@unl.edu. | None stated. |
| **Library of Congress maps** (Civil War Maps, Railroad Maps 1828-1900, the Hotchkiss maps) | Scans of period maps | Digitised Geography and Map content is "free to use and reuse unless a Rights Advisory statement" says otherwise; suggested credit "Library of Congress, Geography and Map Division" (snippet) [LOC-CWM], [LOC-FREE]. The collection's older text says the maps were published before 1922 or by the US government. | Do not commit scans. Commit only our own traced vector lines. | Yes for the pre-1900 public-domain maps. | Credit line suggested, not required. |
| **David Rumsey Map Collection** | Scans, some georeferenced | CC BY-NC-SA 3.0. "Commercial use is selling reproductions of our images." Credit "David Rumsey Map Collection, David Rumsey Map Center, Stanford Libraries"; commercial use needs permission from carto@davidrumsey.com [DR-ABOUT]. | **No.** The ShareAlike term would also clash with PolyForm. | Not without permission. | Required, as above. |
| **Natural Earth** (1:10m land, ocean, lakes, rivers and lake centerlines with a North America supplement, shaded relief) | Modern physical vectors and rasters | "in the public domain"; free for "personal, educational, and commercial purposes"; "Crediting the authors is unnecessary" [NE-TERMS], [NE-10M]. | **Yes.** | **Yes.** | None. "Made with Natural Earth" if we wish. |
| **USGS** (NHD hydrography, 3DEP elevation) | High-resolution rivers, terrain | "USGS-authored or produced data and information are considered to be in the U.S. Public Domain"; some non-USGS material is not [USGS]. | **Yes.** | **Yes.** | Credit requested ("Credit: U.S. Geological Survey"). |
| **NPS American Battlefield Protection Program GIS** (384 battlefield study areas and core areas) | Battlefield polygons from the 1993 survey | Federal data; I could not read NPS's own terms. Mirrors credit NPS and state no licence (snippet) [ABPP]. | Probably yes, once the NPS page is read. | Probably yes. | Credit NPS ABPP. |
| **OpenHistoricalMap** | Crowd-mapped historical features | "dedicated to the public domain under a Creative Commons CC0 dedication", with per-feature exceptions [OHM]. | Only features with no `license` exception tag. | Same. | None for CC0. |
| **Wikimedia Commons scans of public-domain maps** | Scans of old maps | A faithful copy of a two-dimensional public-domain work "lacks originality" in US law (*Bridgeman v. Corel*) [COMMONS-PDART]. Other countries may differ. | Do not commit scans; commit our traces. | Yes in the US. | Per file page. |

### 3.2 The Newberry and NHGIS "conflict"

**Newberry: resolved enough to use, with one cheap belt-and-braces step.**
- The live download page grants reuse "for any lawful purpose, commercial or non-commercial", "without licensing or permission fees to the library", and says "some files may contain the original, out-of-date copyright license; these can be ignored" [NEW-DL]. The same wording is on the U.S. page [NEW-US] and in the library's Open Access Policy, which adds that use is "at the user's sole risk" and that US copyright law still applies [NEW-POL], [NEW-RR].
- The conflict is real but is the owner contradicting its own old notice. The nationwide dataset's metadata still says "Attribution-NonCommercial-ShareAlike Creative Commons License" [NEW-MD], and the zips still carry a copy of that licence [NEW-US]. The copyright holder is the one who wrote the newer, looser grant, so the newer grant governs [I].
- If the old licence did apply it would block a commercial release, and ShareAlike would clash with PolyForm as well. We should never rely on it.
- **Steps:**
  1. Email the Newberry (rightsandrepro@newberry.org, named in its take-down procedure [NEW-POL]) asking it to confirm in writing that the Atlas data may be used in a commercial video game and redistributed in derived form. Keep the reply in the pack's provenance folder.
  2. Save a dated archive copy of the download page and policy page.
  3. Commit only simplified, dissolved region geometry, never the raw files.

**NHGIS: not a conflict, a clear "no".** Its terms bar redistribution without permission (snippet) [NHGIS-T]. I could not read the page itself (HTTP 403). We do not need NHGIS, because the Newberry has the same boundaries with dates. Do not register for NHGIS, since the terms are described as a legally binding agreement. The README's "do not bundle" line stands.

### 3.3 Railways as of 1861

No rail dataset I found is licence-clean for a commercial game.
- Atack's 1861 layer (April 1861, from Taylor & Neu) is the best-built one but states no licence [ATACK-DL], [ATACK-PDF].
- UNL's 1861 layer is "all rights reserved" with educational and research use [UNL-CR].
- Harvard's "Civil War Southern States: Railroads, ca. 1864" is dated 1864 and its terms were not checked (snippet) [HARVARD-RR].
- The underlying facts (which company ran which line, where the junctions were) are not what a licence protects, and Mandate's graph is **hand-authored** (0019). We need only approximate polylines for the drawing.

Recommendation: **trace the rail lines ourselves from public-domain period maps** (Library of Congress railroad and Civil War maps, pre-1900 and so out of copyright) and use Atack's file only to sanity-check our tracing locally, never copying it. In parallel, ask Atack and cdrh@unl.edu for written permission. The cost is two emails; if either says yes, we save the tracing.

### 3.4 Rivers, coasts and terrain

- **Natural Earth 1:10m** (land, ocean, lakes, rivers with lake centerlines and the North America supplement) is public domain and at the right scale for a 250-region map [NE-10M].
- **USGS NHD and 3DEP** are public domain and much finer. They are useful for hand corrections and for relief [USGS].
- **Modern rivers are wrong in places.** In 1876 a flood cut the meander at Vicksburg so the Mississippi left the city; the Yazoo Diversion Canal brought water back only in 1903 [WP-VICKS]. Modern data will therefore misplace the river at the very place the war turned. The same risk applies at other Mississippi bends, and reservoirs have changed the Tennessee and Cumberland near Forts Henry and Donelson [gk]. The pack's map art needs a hand-edited river layer checked against 1860s maps, with each edit logged in provenance.
- For relief (0013's hachures or glyph mountains), bake ridge lines and shading offline from 3DEP or Natural Earth's shaded relief and commit the baked, simplified output. LANES already says Git LFS comes with "the first map art or image asset".

### 3.5 Period maps as tracing references

- **Library of Congress** is the primary reference source: the Civil War Maps, Railroad Maps 1828-1900 and Hotchkiss collections, all pre-1922 or federal (snippet) [LOC-CWM], [LOC-RR]. Credit "Library of Congress, Geography and Map Division".
- **David Rumsey is the one to avoid.** CC BY-NC-SA 3.0 with "not for commercial use" [DR-ABOUT]. Under *Bridgeman* a scan of a public-domain map should carry no new US copyright [COMMONS-PDART], but the site asks users to agree to its licence by downloading. Take the same public-domain map from the Library of Congress instead.
- The official 1891-95 *Military Atlas of the War of the Rebellion* is a federal publication, and LoC holds copies (snippet) [LOC-CWM].

---

## 4. Recommended pipeline

Aim: licence-clean sources in; regions, edges and geometry out, with provenance on every file.

1. **Author the graph by hand, first.** `regions.json` (id, name, kind: land / river / sea / offmap, department, terrain, sites: towns, forts, junctions and depots with lon/lat) and `edges.json` (endpoints, type, length in days, capacity, **a citation per edge**, e.g. "Orange & Alexandria RR, Manassas Junction"). This is the pack's real content; the geometry only draws it.
2. **Define each land region as a list of 1861 counties.** The Newberry file holds one polygon per county per date range (START_DATE and END_DATE fields [NEW-DL]). Select polygons live on 1 August 1861, assign counties to regions in a mapping file (the exact county-identifier field is to be confirmed from the shapefile's attribute table), and dissolve. Shared county borders mean regions fit with no slivers. Non-county areas (Indian Territory, the Dakotas, New Mexico) come from the Atlas's territory polygons.
3. **Draw sea, river and off-map regions by hand.** Sea zones are authored polygons clipped to Natural Earth's ocean. River reaches are thin polygons or edges. Off-map boxes have no geometry and a cartouche position.
4. **Simplify.** Use a topology-preserving simplifier, targeting a few hundred kilobytes of GeoJSON for the whole map. The Atlas offers generalised downloads (0.01 degrees is 9 MB for counties) [NEW-US]. Work from those, not the 503 MB file.
5. **Rails, rivers, coast.** Trace the rail polylines from LoC maps, take rivers and coast from Natural Earth, and hand-edit the Mississippi and others against 1860s maps. All of it is drawing; none of it defines an edge.
6. **Validate (a check, not a paragraph; rule 7).** A new `tools/` validator that runs in `npm run check` and fails if:
   - a file under a pack's map folder has no provenance entry;
   - an entry's licence is outside an allow-list (public-domain, CC0, Newberry open access, our own work), or is "unknown", "all rights reserved" or any CC BY-NC or SA value;
   - raw source files are committed (a size cap on the map folder);
   - a region has no geometry (unless `kind` is `offmap`) or an edge names a missing region;
   - the graph is disconnected;
   - a rail edge's two regions do not both touch the traced rail line. This **warns only**: geometry cross-checks the authored graph, it never derives it (0019).
7. **Keep raw downloads out of git.** Fetch scripts live in `tools/`, raw files in an ignored folder.

**Provenance file**, one per pack at `packs/<pack>/map/PROVENANCE.json`, one entry per source and per hand-made layer:

```json
{
  "id": "newberry-ahcb-1861",
  "name": "Atlas of Historical County Boundaries, US_AtlasHCB_Counties_Gen0.01",
  "url": "https://publications.newberry.org/ahcb/downloads/united_states.html",
  "retrieved": "2026-11-14",
  "licence": "newberry-open-access",
  "licenceQuote": "reused for any lawful purpose, commercial or non-commercial",
  "licenceEvidence": ["archive link", "email reply, filename"],
  "taken": "county polygons live on 1861-08-01",
  "transform": "dissolved by regions.json county lists; simplified",
  "outputs": ["regions.geojson"],
  "attribution": "Atlas of Historical County Boundaries, The Newberry Library"
}
```

Hand-traced layers use `"licence": "own-work"` and name the public-domain maps they were traced from.

---

## Recommendations

1. **Extent:** the war zone from southern Pennsylvania to the Gulf and from the Atlantic to eastern Texas at full resolution; Kansas, Indian Territory, New Mexico and Arizona, Minnesota and Dakota, and the Florida peninsula coarse; the Pacific coast, Britain and Canada, France and Mexico, the Atlantic entrepots, Matamoros and the high seas as off-map boxes with no geometry. The 1861-62 slice already contains the Trent crisis, the New Mexico campaign and the Dakota War, so the edges are needed from the start.
2. **Size:** 220-280 regions, built to about 250, with 25-40 small key-point regions among them, a `department` tag on every region, and a ceiling of 350. The tick budget is not the limit (about 0.6 ms for 3,000 regions); player attention and authoring cost are.
3. **Newberry:** treat it as usable under its live "any lawful purpose" grant, send the one confirmation email, archive the page, and commit derived geometry only. **NHGIS:** do not use.
4. **Rails:** trace from public-domain Library of Congress maps and ask Atack and UNL for written permission in parallel. Neither dataset is safe to commit as it stands.
5. **Rivers, coast, terrain:** Natural Earth 1:10m and USGS, both public domain, with a hand-edited Mississippi.
6. **Period maps:** Library of Congress, not David Rumsey.
7. **Pipeline:** hand-authored graph first, county lists dissolved into region geometry, a provenance file per pack, and a validator in `npm run check` that fails on unlicensed or unprovenanced map files.
8. **Update after the owner's go-ahead:** the licence notes in `packs/union-1861/README.md` and the "licences to be verified" line in decision 0013 can be replaced by the findings in section 3.2. I changed neither.

## Findings outside my scope

- **The M2 pack will have to be re-cut.** The 37 coarse regions (for example `deep_south`, `atlantic_coast`) and the calibration note ("the Union holds 27 of 37 regions") will not survive a roughly 250-region map. The scripted-leader calibration and `union-pack.test.ts` will need re-running after the migration.
- **Two decisions to put in the event system.** Lincoln's personal review of the 303 Dakota death sentences (Nov-Dec 1862) is a first-class "player is Lincoln" decision. The Trent Affair is a sourced 1861 crisis with real 17-19 day latency to Europe. Both fall inside the first slice.
- **Named sites inside regions.** The Columbus and Paducah decisions are about places smaller than a region. FOUNDATION already puts depots and sources on regions. The question is whether a region needs a list of named sites (towns, forts, junctions) that reports and directives can name without being nodes. I assumed yes; it needs a design call.
- **Decision 0013's other open licences are unverified.** I checked only the Newberry. Pleiades and the Ancient World Mapping Center (Rome), and geoBoundaries (Ukraine), still say "licences to be verified per pack".
- **Facts here rest on Wikipedia and snippets.** Wikipedia supplied the theatre and casualty figures, and several licence pages (NHGIS, Library of Congress, NPS) refused automated fetches. Before a figure drives design, the lead should have it sourced from a book or a primary page, and the three licence pages should be read in a browser.
- **Git LFS trigger.** LANES says LFS comes with the first map art asset. Baked relief textures will be that asset, so set up LFS in the same change as the relief bake.
- **County lists give political borders, not terrain.** 0019 says regions are "drawn to terrain", but a region built from whole 1861 counties will not follow the Blue Ridge, the Cumberland Plateau or a river. Where it matters (the Valley against the Piedmont, the Yazoo Delta against the Vicksburg bluffs) the pipeline needs a hand-split step: cut county polygons along ridge or river lines. That adds authoring work and breaks the "no slivers" property in those places. It needs a design call.
- **Source inconsistency.** The Dakota War article gives both 38 and 39 death sentences approved. I used 38 (the number hanged on 26 Dec 1862); confirm against a primary source before it drives an event.
- **Tooling note.** WebFetch returned 403 for nhgis.org, loc.gov, ipums.org and several Berkeley and ICPSR catalog pages. A browser pane would read them. `pdftotext` worked on the Atack PDF and the For the People rules (saved to the session's tool-results folder and scratchpad).

## Sources

**History and theatres**
- [WP-East] https://en.wikipedia.org/wiki/Eastern_Theater_of_the_American_Civil_War
- [WP-West] https://en.wikipedia.org/wiki/Western_Theater_of_the_American_Civil_War
- [WP-TM] https://en.wikipedia.org/wiki/Trans-Mississippi_Theater_of_the_American_Civil_War
- [WP-LS] https://en.wikipedia.org/wiki/Lower_Seaboard_Theater_of_the_American_Civil_War
- [WP-Pac] https://en.wikipedia.org/wiki/Pacific_Coast_Theater_of_the_American_Civil_War
- [WP-IT] https://en.wikipedia.org/wiki/Indian_Territory_in_the_American_Civil_War
- [WP-NM] https://en.wikipedia.org/wiki/New_Mexico_campaign
- [WP-Dak] https://en.wikipedia.org/wiki/Dakota_War_of_1862
- [WP-Blk] https://en.wikipedia.org/wiki/Union_blockade
- [WP-Alabama] https://en.wikipedia.org/wiki/CSS_Alabama
- [WP-CSN] https://en.wikipedia.org/wiki/Confederate_States_Navy
- [WP-Trent] https://en.wikipedia.org/wiki/Trent_Affair
- [WP-VICKS] https://en.wikipedia.org/wiki/Vicksburg,_Mississippi
- [WP-Area] https://en.wikipedia.org/wiki/List_of_U.S._states_and_territories_by_area
- [CWSAC] https://www.npshistory.com/publications/battlefield/cwsac/technical-v2.pdf (snippet)
- [BR-Hubs] https://www.scencyclopedia.org/sce/entries/blockade-running/ and https://www.battlefields.org/learn/articles/blockade-runners (snippet)

**Games**
- [games note] `docs/research/2026-11-14-civil-war-games.md`
- [CW2-Matrix] https://www.matrixgames.com/news/ageod-takes-you-back-to-the-civil-war-17-06-13
- [FtP-R] https://www.gmtgames.com/nnfp/FTP-rules-2014.pdf (read locally with `pdftotext`)

**Licences and data**
- [NEW-DL] https://publications.newberry.org/ahcb/downloads/
- [NEW-US] https://publications.newberry.org/ahcb/downloads/united_states.html
- [NEW-MD] https://publications.newberry.org/ahcb/documents/US_HistCounties_Metadata1.htm
- [NEW-POL] https://www.newberry.org/policies
- [NEW-RR] https://www.newberry.org/rights-and-reproductions
- [NHGIS-T] https://nhgis.org/ipums-nhgis-terms-use and https://www.ipums.org/about/terms (both returned 403; read as search summaries) (snippet)
- [ATACK-DL] https://my.vanderbilt.edu/jeremyatack/data-downloads/
- [ATACK-PDF] https://cdn.vanderbilt.edu/t2-my/my-prd/wp-content/uploads/sites/133/2021/02/Creating-Historical-Transportation-Shapefiles-RevisedFeb2021.pdf (read with `pdftotext`: snapshot years, the Taylor & Neu April 1861 map, Lloyd 1863)
- [UNL-DL] https://railroads.unl.edu/resources
- [UNL-CR] https://railroads.unl.edu/about/copyright.html
- [HARVARD-RR] https://geodata.libraries.mit.edu/record/gisogm:edu.harvard:0920e13c0f4c (snippet)
- [LOC-FREE] https://www.loc.gov/free-to-use/
- [LOC-CWM] https://www.loc.gov/collections/civil-war-maps/about-this-collection/rights-and-access/ (403; read as a search summary) (snippet)
- [LOC-RR] https://www.loc.gov/collections/railroad-maps-1828-to-1900/ (snippet, via an archived collection page)
- [DR-ABOUT] https://www.davidrumsey.com/about
- [NE-TERMS] https://www.naturalearthdata.com/about/terms-of-use/
- [NE-10M] https://www.naturalearthdata.com/downloads/10m-physical-vectors/
- [USGS] https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits
- [ABPP] https://vcris.dhr.virginia.gov/arcgis/rest/services/Static_Datasets/ABPP_Layers/MapServer (a Virginia mirror; NPS's own page not read) (snippet)
- [OHM] https://www.openhistoricalmap.org/copyright
- [COMMONS-PDART] https://commons.wikimedia.org/wiki/Commons:When_to_use_the_PD-Art_tag

## Update, 2026-11-15: Atack's permission

Jeremy Atack replied on 15 November 2026 to the owner's request of 14 November. He approved both uses the request named:
- checking our own tracing against his 1861 layer;
- including a simplified, derived version of the rail lines in the game and in the source repository.

The condition is that "credit is clearly given as described in the on-line documentation". He also asked for a copy of the game when it is done. The email is in the owner's Gmail.

What this changes:
- The 1861 layer (from Taylor & Neu's April 1861 map) can now be the source of the game's rail lines, licensed by written permission, so tracing every line ourselves is no longer needed.
- The credit must follow the suggested citation on Atack's download page [ATACK-DL], word for word. Whoever first uses the layer records that wording in the pack's `PROVENANCE.json` and in the game's credits.
- Still open: the Newberry (county boundaries) sent only an automatic reply, and UNL's railroad project (cdrh@unl.edu) has not replied. Region geometry, and so lane 0.10's re-measure, still waits on the Newberry.
