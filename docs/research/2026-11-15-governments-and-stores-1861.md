# Who governed the Indian Territory, the territories and the District on 5 March 1861, and what stores the force blocks held (Mandate research)

Status: first pass complete (2026-11-15), lane `research-governments-stores`, for the Union pack (`packs/union-1861`, start 5 March 1861, decision 0056) and the government rows of 0058 and 0061. It answers three questions: the Indian Territory nations' governments and their dated choices; the territories' and the District's governments; the stores any source gives for the force blocks. **It records facts and places nothing in the game**: the nations' data patch (section 1.6) is a proposal for the gate reviewer, not applied. Native nations fall under the sensitive-history gate's open record R3 (`docs/design/SENSITIVE-HISTORY.md`, 3.7).

Conventions as in `2026-11-14-gate-and-catalogue-facts.md`: **H** = primary text read, or two reputable sources agree; **M** = one reputable source read; **L** = a search-result snippet only, a mirror, or a conflict. **(snippet)** = seen only in a search summary, page not read. **[I]** = our inference. **Design parameter** = a modelling choice, never a fact. Citation keys in [brackets] resolve in the table at the end. Machine limits: loc.gov and census.gov were never touched; two scanned Chronicles of Oklahoma PDFs and the Statutes pages were read as extracted text (pypdf), so their OCR is imperfect.

**Corrections this note makes to what the project already says:**
1. The region note for `it_choctaw_chickasaw` says "The Choctaw Nation declared for the South on 7 February 1861". **It did not.** The General Council's resolutions of that day are conditional: if the Union permanently dissolves, the Choctaw "shall be left to follow the natural affections ... and interests of our people" tied to the Southern states. They declare no secession, alliance or neutrality (1.2). **Applied after review:** the sentence is corrected in `world/regions.csv` and in the two Indian Territory rows of `control.csv`. The new wording, for the gate reviewer: "The Choctaw General Council's five resolutions of 7 February 1861 were conditional: the third says that if the Union is permanently dissolved the Choctaw will follow the interests of the Southern states (OR I-1 p.682)". The map draft (`source/drafts/map/regions.csv`) and the importer script still carry the old sentence; neither was touched (0056).
2. The Union pack's `regions.csv` calls the Indian Territory "Cherokee and Creek Nations" and "Choctaw and Chickasaw Nations", but each region holds **one** government slot while each box holds **two or three nations with separate governments and different 1861 choices**. See 1.5.
3. The blog-snippet reading that Slemmer had "three months' supply" at Fort Pickens on 18 March is wrong: on OR I-1 p.362 it is a debt to an unnamed supplier for cattle, not stores (3.2).

## 1. The Indian Territory nations

### 1.1 What each nation's government was

| Nation | Head, March 1861 | Structure | Basis |
|---|---|---|---|
| **Cherokee** | John Ross, Principal Chief; signs "JNO. ROSS, Principal Chief Cherokee Nation", executive office at Park Hill, 17 May 1861 | Constitution of 1839: a National Committee and a National Council, an executive Principal Chief, seat of government Tahlequah **(snippet** of the Cherokee Nation's own code, page not read) | **H** for Ross and title [OR13-490]; **L** for structure [CHER-CODE] |
| **Choctaw** | George Hudson, listed Principal Chief 1860–62 by the Nation itself; he signs a proclamation as "Principal Chief Choctaw Nation" at Doaksville on 14 June 1861, with L. P. Pitchlynn as National Secretary | Skullyville Constitution (January 1857) abolished the three district chiefs and made a Governor, capital Boggy Depot [HUDSON-1934]; Doaksville Constitution (January 1860) made a Principal Chief and added a fourth district (Hotubbee, the Leased District) [CHOC-ITI]; a General Council legislates | **H** for Hudson in June [OR3-594] and the Nation's list [CHOC-CHIEFS]; **M** for the structure; his election date is not stated anywhere read |
| **Chickasaw** | Cyrus Harris, Governor: elected first in 1856, terms 1856–58, 1860–62 (Chickasaw Hall of Fame, which does not itself say he held office on 5 March) | Constitution of 1856 (Tishomingo): a Governor elected for two years, a legislature of House and Senate, supreme, circuit and county courts; separate from the Choctaw Nation again by treaty of 22 June 1855 | **M** [OHS-CHICK; CHICK-HOF; CHICK-TL]; Harris in office on 5 March is **[I]** from the term list |
| **Muscogee (Creek)** | The Confederate treaty of 10 July 1861 names "Motey Kinnaird (Principal Chief)" and "Icho Hacho (Principal Chief Upper Creeks)" among its signers | Not sourced. The treaty speaks of a "General Council" and "the national council"; Opothleyahola led the Upper Creeks (Bahos, from documents) | **L**: the names come from a *summary* of the signature block, not the verbatim text; the structure is open |
| **Seminole** | John Jumper, "Principal Chief of the Seminole Nation" in the same summarised signature block | "Chiefs, head men and warriors, in General Council assembled", a National Council | **L** (summary and Wikipedia pointer) |

### 1.2 What each nation had done by 5 March 1861

- **Cherokee: nothing declared.** Arkansas's governor, Rector, wrote Ross on 29 January 1861 that "Our people and yours are natural allies in war and friends in peace" [OR13-490, inclosure 6, **H**]. Ross replied on 22 February from Tahlequah (OR XIII pp. 491–492; the project's earlier note reads it as: treaties bound them to the United States though their institutions and sympathies lay with the slaveholding states) [GCF 2.2; **H**; the letter itself not re-read here].
- **Choctaw: a conditional statement, 7 February 1861.** "Resolutions expressing the feelings and sentiments of the General Council of the Choctaw Nation" (OR I-1 p. 682; the Nation's own site republishes the text). Five resolutions: regret at the dispute; hope it is "honorably and speedily adjusted"; **if** "a permanent dissolution of the American Union takes place, our many relations with the General Government must cease" and the Choctaw follow their ties to the Southern states; assurance to Arkansas and Texas of "amicable relations"; the principal chief to send copies to the Southern governors. **H** [OR1-682; CHOC-1861]. It is not a declaration for the South, nor for neutrality. A Wikipedia sentence (uncited) says Choctaw officials in Washington assured Unionists in April that the nation would stay neutral. **L** [WP-CHOC]. No formal Choctaw neutrality act appears in any source read.
- **Chickasaw: nothing found for January–March 1861.** The Chickasaw Nation's own page says "At first, the Chickasaws didn't know which side to choose or if they should remain neutral" (undated) [CHICK-TV].
- **Creek and Seminole: nothing found for January–March 1861.**

### 1.3 Dated choices after the start (for situation authors)

| Date, 1861 | Nation | Act | Basis |
|---|---|---|---|
| 17 May | Cherokee | Ross's proclamation from Park Hill: "observe in good faith strict neutrality between the States threatening civil war"; "unswerving neutrality"; no declaration of war yet; avoid acts that would make the country "a scene of military operations" | **H** [OR13-490] |
| 25 May | Chickasaw | "approved Chickasaw secession from the Union" (Governor Harris, per the Nation's own pages); the timeline says the Nation "declared independence from the United States and supported the Confederacy". Which body acted (Governor, or Legislature) is not stated | **M**; wording conflict kept [CHICK-TV; CHICK-HOF; CHICK-TL] |
| 10 June | Choctaw | The special session of Council at Doaksville "decided on June 10 to send a delegation" to treat with the Confederacy; Pitchlynn and Hudson withheld a prepared speech "that called for neutrality" | **M** [CHOC-ITI] |
| 14 June | Choctaw | Hudson's proclamation at Doaksville calling out a mounted Choctaw and Chickasaw regiment "called for by the Confederate States" under Cooper, and home guards | **H** [OR3-594] |
| 1 July | Muscogee, Seminole, Choctaw, Chickasaw | "Articles of Confederation ... at North Fork in the country of the Muscogee": the four are "free and independent", retain "sovereignty, freedom and independence", and form a Grand Council of the United Nations of the Indian Territory; a rider grants the Confederate forces right of way | **H** [CHOC-1861] |
| 10 July | Muscogee | Treaty with Pike at North Fork Village | **H** for date [UNL-CSA] |
| 12 July | Choctaw and Chickasaw | Treaty with Pike, North Fork Village; ratified by the Confederate Congress 20 December 1861 | **H** [UNL-CSA] |
| 1 August | Seminole | Treaty with Pike, Seminole Council House | **H** [UNL-CSA] |
| 17 May – 21 August | Cherokee | Ross: "I had taken a neutral position and would maintain it honestly" (an undated fragment); McCulloch and Pike urged him to reconsider (reported 25 June); the national meeting of 21 August approved neutrality and left alliance to the authorities | **M** [OR13-497; EVSTAR; GCF 2.2] |
| 7 October | Cherokee | Treaty with Pike, "Tahlequah" per a summary of the UNL page, Park Hill per the project's earlier note: conflict kept | **M** [UNL-CSA; GCF 2.2] |

**The Creek were split.** Opothleyahola, "leader of the Upper Creeks", opposed "this strong Southern flow", set up camp at North Fork Town after the war began and by about 1 August was on the North Canadian; more than 7,000 had joined him by the count in Kansas [BAHOS pp. 60–61]. A council of delegates of the two Creek factions at Camp Porter on 22 October reached no agreement (same, p. 63). That Opothleyahola's party *declared neutrality* appears only in a search summary **(snippet, L)**; no source read says so. The Seminole were split too: Jumper's treaty, and John Chupco's refusal and flight with Opothleyahola **(snippet, L)**. The Cherokee were divided inside: full-bloods' "pro-Union sentiment" slowed Drew's Confederate regiment [BAHOS p. 61, **M**].

### 1.4 Recommendation: how the pack should model them

**Model each nation's own government as a department with no faction, and let situations close it** (the 0055/0058 neutral-ground machinery), rather than leaving the regions `unknown`. Reasons:

1. **It states the true 5 March position.** No nation had chosen: the Cherokee were treaty-bound and unaligned; the Choctaw had a conditional resolution; the others had said nothing found. No faction is the honest value. `unknown` means "no known government", which the pack reads as *not* neutral ground, closed to every side's passage and supply (0058, 0064): that would seal Indian Territory off from Texas and Kansas alike on day one, which no source supports. [I]
2. **Each nation's decision becomes an event with a name and a date**, owned by the nation: Cherokee neutrality (17 May), Chickasaw independence (25 May), Choctaw council and proclamation (10 and 14 June), the four-nation Articles (1 July), the treaties (10 July to 7 October). The closing flag (`closedGovernments`, a department mapped to a day) fits neutrality and the closing of passage; the dates above are the sourced days.
3. **Names, not possessions** (the gate's presentation rule): each department carries the nation's own name, none is folded under either side, and the lands "carry their own names".

**What the model cannot yet do, and the choice it forces** [I]: a department's faction is World data and cannot change in play. After the treaties the Choctaw, Chickasaw, Creek, Seminole and (from 7 October) Cherokee governments allied with the Confederacy, but `regionGovernments` can only *re-point a region to another department*, not give a department a faction. Phase 0 can close a nation's land to the Union (a closing flag) but cannot make it "Confederate"; that needs either a format change (a faction held in State, written by `command`) or a second, Confederate-aligned department per nation for situations to re-point to. I recommend the first and record it in "For the lead". Either way it is a 0058 amendment, so the patch below stops at the start position.

**Rejected:**
- **Leaving `unknown`.** See 1 above.
- **One department, "the Indian Territory".** It folds nations with separate governments and opposite choices into one voice, the thing the gate forbids.
- **Giving the nations a faction (Confederate) from the start.** It is hindsight: on 5 March no nation had allied.
- **Marking the Choctaw "declared for the South" on 7 February.** It misreads a conditional resolution.

### 1.5 The region problem (a map-lane item; not done here)

Each box lumps nations that must be separate for the model to be true: `it_cherokee_creek` holds the Cherokee, Creek and Seminole (per its own counties text), `it_choctaw_chickasaw` the Choctaw and Chickasaw and the Leased District. One government slot per region means one department per box. **Recommend the map lane split them into at least Cherokee, Muscogee and Seminole, Choctaw, and Chickasaw** (the Leased District's people are not those nations'). Until then the proposed patch below gives each box the department of the nation named first and marks the other nation unrepresented. Splitting regions was out of this brief's bounds.

### 1.6 Proposed patch (NOT applied; waits for the gate reviewer)

**Manifest kind** in `packs/union-1861/pack.json` `departmentKinds`, with its string `department_kind.nation_government` ("Nation government") in `strings/en.json`:
```json
{ "id": "nation_government", "name": "department_kind.nation_government", "government": true }
```
**departments.csv** (faction left empty, as the uncommitted states have it):
```
id,name,faction,kind,sources,notes
nation_cherokee,Cherokee Nation government,,nation_government,OR I-13 p.490; NOTE-governments-stores-1861 s.1,"Principal Chief John Ross; neutral on 5 March 1861; proclaimed neutrality 17 May; treaty with the Confederacy 7 October."
nation_choctaw,Choctaw Nation government,,nation_government,OR I-1 p.682; OR I-3 p.594; NOTE-governments-stores-1861 s.1,"Principal Chief George Hudson (1860-62); the General Council's conditional resolutions of 7 February 1861; treaty 12 July."
nation_chickasaw,Chickasaw Nation government,,nation_government,NOTE-governments-stores-1861 s.1,"Governor Cyrus Harris [inferred from his terms]; independence 25 May 1861; treaty 12 July. Add when the map splits the Choctaw and Chickasaw."
nation_muscogee,Muscogee (Creek) Nation government,,nation_government,NOTE-governments-stores-1861 s.1,"Divided: Upper Creeks under Opothleyahola against the treaty signers of 10 July 1861. Add when the map splits the Cherokee and Creek."
nation_seminole,Seminole Nation government,,nation_government,NOTE-governments-stores-1861 s.1,"John Jumper's treaty of 1 August 1861; John Chupco refused. Add when the map splits the boxes."
```
(Add `nation_chickasaw`, `nation_muscogee` and `nation_seminole` only once the regions exist; a department no region holds is harmless but untested.)

**governments.csv**, interim, replacing the two `unknown` rows:
```
it_cherokee_creek,nation_cherokee,OR I-13 p.490; NOTE-governments-stores-1861 s.1,"The Cherokee Nation's government; the Creek and Seminole nations in this box are not represented until the map splits it."
it_choctaw_chickasaw,nation_choctaw,OR I-1 p.682; OR I-3 p.594; NOTE-governments-stores-1861 s.1,"The Choctaw Nation's government; the Chickasaw Nation is not represented until the map splits this box."
```
**regions.csv**: the correction of the `it_choctaw_chickasaw` note is already applied (see the corrections list above); it is not part of this patch.

**Questions for the gate reviewer** (the facts do not answer them):
1. Does "passable to every side's movement and supply" read, for a nation's land, as treating it as a corridor? The pack would say a *neutral government* governs it; the nation's own act closes it. Is that wording acceptable, or does R3 require a different term?
2. Who may close a nation's land: only the nation's own event (its council, proclamation or treaty), never a Union or Confederate order? The sourced dates are all the nations' own acts, but the Union's own acts (the 5 July 1862 law of suspension and abrogation, [GCF 2.5]) belong to a later slice.
3. The 1 July Articles carry a rider that grants right of way "to repel the invading forces of Abraham Lincoln". It is the nations' own document; the note gives it as written.

### 1.7 Voices

Read here from the nations' own side: the Choctaw Nation's own republication of the 1861 texts and its list of chiefs, a history article from the Choctaw Nation's *Iti Fabvssa*, the Chickasaw Nation's own pages (a television history, a timeline, the Hall of Fame), Ross's own proclamation as printed in the OR, and an account of the Choctaw chiefs by P. J. Hudson (1934, whose own identity the page does not state). Not reached: the Muscogee (Creek) Nation's own pages (the search returned only its modern administration), the Seminole Nation's, the Cherokee Nation's history of 1861 beyond a search summary, and the verbatim Cherokee–Arkansas letters. Opothleyahola's own letter of 14 September 1861 to Ross is cited in [BAHOS] (n. 8, Gilcrease Institute) and was not read; no document in his own words was read at all.

## 2. The territories and the District of Columbia

### 2.1 What the statutes say (primary, read as extracted text)

- **Colorado**: "An Act to provide a temporary Government for the Territory of Colorado", approved 28 February 1861, 12 Stat. 172, ch. 59. Governor and secretary each four years "unless sooner removed by the President" (secs 2, 3); governor, secretary, judges, attorney and marshal "nominated and, by and with the advice and consent of the Senate, appointed by the President" (sec. 11); the Secretary acts as governor in a vacancy (sec. 3). Boundaries: the 37th to 41st parallels, 25th to 32nd meridians west of Washington. Indian lands under treaty are excepted until the tribe assents. **H** [STAT].
- **Dakota**: "An Act to provide a temporary Government for the Territory of Dakota, and to create the Office of Surveyor General therein", approved 2 March 1861, 12 Stat. 239, ch. 86; the same clauses (secs 2, 3, 11); boundaries along Minnesota, Iowa, the Missouri and the Nebraska line to the 43rd parallel and the Washington Territory line; the same exception of treaty Indian lands. **H** [STAT].
- **Nebraska**: Kansas–Nebraska Act, approved 30 May 1854, 10 Stat. 277, ch. 59: governor four years unless removed by the President (sec. 2), appointment by the President with the Senate's consent (sec. 12). **H** [STAT].
- **New Mexico**: the Act of 9 September 1850, 9 Stat. 446: executive power in a governor of four years, removable by the President (sec. 3); appointment as above (sec. 12). **H** [STAT]. That Arizona lay inside New Mexico Territory until an act of 24 February 1863 comes from Wikipedia **(snippet-level pointer, L)**.
- **District of Columbia**: the Constitution gives Congress "exclusive Legislation in all Cases whatsoever, over such District", Art. I, sec. 8, cl. 17 **H** [USCONST]; the Act of 27 February 1801 (2 Stat. 103) is the act "concerning the District of Columbia", and the annotation to it says the laws of Maryland continued in the part ceded by Maryland **M** (the annotation's text layer was fragmentary) [STAT]. Washington City had its own elected corporation: James G. Berret was mayor from 14 June 1858 to 26 August 1861, when Seward had him jailed over an oath law **M** (Wikipedia, which cites period sources) [WP-BERRET]; the Levy Court of Washington County was made of the county's justices of the peace "appointed by the President", reorganised in 1863 and 1871 **M** (Wikipedia) [WP-WASHCO]. Georgetown's mayor in 1861: **not found**.

### 2.2 On 5 March 1861

| Region | Government | State on 5 March | Basis |
|---|---|---|---|
| `nebraska` | Territory of Nebraska | Governor Samuel W. Black, a Buchanan appointee, resigned on 24 February 1861 to take a regiment; who acted until Alvin Saunders (appointed under Lincoln, sworn 15 May) is **in conflict**: J. Sterling Morton acting from 24 February (Andreas's history), against Secretary Algernon Paddock acting from 6 March (Wikipedia) | **L** for the people; **H** that the Secretary acts in a vacancy (the Nebraska act's clause is not read; the Colorado and Dakota acts' is) |
| `dakota` | Territory of Dakota | Created 2 March 1861, three days before the start. No governor: William Jayne was nominated 23 March, confirmed 27 March, and reached Yankton on 17 May, "late May" or 8 June (three sources); news of the act reached Yankton on 13 March | **H** for the act; **M** for Jayne (the State Historical Society of North Dakota, with a conflict kept) |
| `colorado` | Territory of Colorado | Created 28 February 1861. William Gilpin was appointed after 4 March (term "from 25 March" in Wikipedia's infobox) and reached Denver on 29 May (21 May in a 1926 article). A rival, unauthorised "Jefferson Territory" government yielded on 6 June 1861 (Wikipedia, pointer) | **H** for the act; **M** for Gilpin; **L** for Jefferson |
| `new_mexico`, `arizona` | Territory of New Mexico | Abraham Rencher, Buchanan's governor, in office; Lincoln did not reappoint him and Henry Connelly was named on 4 September 1861 (snippet; other sources give Rencher's end as 24 May or late August) | **M** for Rencher; **L** for dates |
| `washington` | the District, under Congress | See 2.1 | **H** for Congress; **M** for the corporations |

### 2.3 Recommendation (applied)

**One government-kind department per territory, and one for the District, all faction `union`**, as `source/world/departments.csv` now has them, with two new manifest kinds, `territorial_government` and `federal_district`, both `government: true`. The six `unknown` rows in `governments.csv` now name them. **Faction union is a design parameter.** The reading is that a territorial government is the federal government's own creature: its head is a presidential appointee, and the statutes hold it under Congress. A no-faction department would instead make these regions neutral ground open to the Confederacy's movement and supply, which no source supports. The alternative, keeping them `unknown`, has the same effect on passage and hides a fact that is known. **Rejected:** a department per governor (a person, not a government); a single "territories" department (Colorado and New Mexico had separate governments, governors and histories); `unknown`.

**Caveats for the gate and situations:**
- **Dakota and Colorado** were organised on paper with the governors not in place on 5 March; Native nations held or claimed much of their regions' land (both acts, and the Nebraska act, except treaty Indian lands from the Territory until the tribe assents; the amount of land is not sourced here, and the 1851 Fort Laramie text could not be read). The department is the *Territory's* government, not a government of the nations who lived there; the Dakota Territory region touches R3.
- **New Mexico's government was not unanimous.** Rencher, Loring and officers' sympathies are for situations; the Mesilla convention of March 1861 and Baylor's "Confederate Arizona" (July–August) come after the start and are not modelled here.

## 3. Stores

### 3.1 What the sources give (days of rations or supply, around March 1861)

| Block | Figure in the pack | Date of the figure | Source |
|---|---|---|---|
| Fort Sumter garrison | 7 | 1 April | existing (OR I-1 p. 214 etc.) |
| USS Brooklyn | 21 | 16 March | existing (ORN I-4 p. 96) |
| USS Sabine | 10 | 22 March | existing (ORN I-4 p. 100) |
| Company A, 1st Artillery (Vogdes), afloat | 90 | 23 January (embarkation, 3 months) | existing; OR I-1 p. 353 |
| **Key West garrison (Brannan)** | **120 (new)** | 15 January 1861 (the OCR prints "January 115"; the printed volume reads "January 15"): "I have four months' provisions and 70,000 gallons water" | OR I-1 p. 343; **H** (checked against the 1880 printed volume by the reviewer) |
| Fort Pickens garrison | **unknown** (held; a figure exists) | about 5 February 1861: "I have provisions for five months for my present command" (Slemmer to Thomas, in his series of reports running to 5 February) | OR I-1 p. 341; **H** |

The Key West figure is **four months at 30 days**, the conversion the pack already used for Vogdes's three months, dated mid-January and not aged for consumption. **Fort Pickens is held at unknown** (the reviewer's and the lead's ruling, after this lane first applied 150): five months is 150 days, but the kernel has no rule that brings a dated stock forward, so the pack would read it as the stock on 5 March, and later pages contradict that. Vogdes after 19 March: "The supplies at the fort are getting low, and those of that naval forces are still lower. These last have not ten days' supply" (p. 364: the "ten days" is the *navy's*, in line with Sabine's 10); Slemmer, 30 March, "Fresh provisions are now denied us" (p. 365); Scott's order of 2 April sends provisions "for the garrison of Fort Pickens for six months" (p. 366). The row keeps the letters and the reasoning in its note, and decision 0065's `stores_date` column is the right home for the dated figure. A blog snippet that reads Slemmer as having "three months' supply" on 18 March is a misreading: on p. 362 it is a debt for cattle.

### 3.2 Not found (and what was tried)

- **Fort Jefferson (Arnold):** he asks on 18 January whether it is "a double-ration post" (p. 346): no figure. A snippet says a ship took "six months of provisions" there on an undated trip **(snippet, L)**.
- **Fort Monroe:** army headquarters wrote on 30 April that Dimick had "a large amount of army subsistence stores" (OR II p. 612, snippet, **L**), after the window and with no figure.
- **Washington (regulars, militia, marines), the Texas regulars, the Department of New Mexico, Pacific regulars, the Saint Louis arsenal troops, the other ships (about forty blocks), and every Confederate and state block (Charleston, Fort Morgan, Forts Jackson and St. Philip, the Texas state forces):** no statement of stores found in the places read. Not read: OR I-1 pp. 368–389 and 391–394 (Harvey Brown's April reports from Pickens, which may give stores), the ORN I-4 pages for the ships' provisions beyond those already cited, Meigs's and Keyes's reports, and the Confederate commissary returns.
- **Searches for New Mexico stores** found only background (a Fort Union study) and an unidentified OR excerpt about "twelve months" of subsistence at an unnamed post; not usable.

### 3.3 A design-parameter proposal (kept apart)

**None for the unknowns.** Decision 0064 rejected "a default strength for unknown blocks" and keeps unknown stores unknown and listed in every sum; I do not propose a default. **One format proposal:** `force_blocks.csv` has a `strength_date` but **no stores date**, and the sourced stores range from 23 January to 1 April. A `stores_date` column (an ISO date, or a "before the start" label) would let a pack say a figure is January's and let the kernel age it, as the Pickens example needs. For the lead.

## 4. Conflicts kept

| Question | Values |
|---|---|
| Choctaw action of 7 February 1861 | "declared for the South" (the pack's old region note) against a conditional resolution (OR I-1 p. 682) |
| Chickasaw act of 25 May 1861 | "approved secession" (Governor Harris, two pages) against "declared independence" (timeline) against "independence in May, joined the Confederacy in July" (OHS); which body acted is not stated |
| Cherokee treaty place, 7 October 1861 | Tahlequah (UNL summary) against Park Hill (the project's earlier note) |
| Nebraska's acting governor, March 1861 | Morton from 24 February against Paddock from 6 March |
| Jayne in Yankton | 17 May, "late May", 8 June |
| Gilpin in Denver | 29 May (most) against 21 May (1926 article) |
| Rencher's term end | 24 May, late August, 4 September |
| Pickens stores | five months (Slemmer, January) against "getting low" (Vogdes, late March) |
| Principal Chief of the Choctaw | the Nation's list says Hudson 1860–62, a photo caption in a Nation article says Pitchlynn for the decade, its body says Pitchlynn from 1864 |

## 5. What stays open

- **The Creek government in 1861** (principal chief by a verbatim source, council structure, the Upper and Lower towns): the only name is from a summary. Not reached: the Muscogee Nation's own history, Opothleyahola's letters, the verbatim signature blocks of the UNL treaty page.
- **Whether Opothleyahola or the Upper Creeks formally declared neutrality, and when.**
- **Chickasaw and Choctaw action before February, and the Chickasaw legislature's own record of 25 May.**
- **The Cherokee government's 1861 structure from a read source** (the code PDF was only a snippet), and Ross's 22 February letter and 9 October message re-read verbatim.
- **Georgetown's government, and the Levy Court's membership, in March 1861.**
- **Stores for everything in 3.2.**

## Findings outside my scope

1. `regions.csv` notes for both Indian Territory boxes need correction; the Choctaw one is wrong (the patch in 1.6).
2. The Union pack's `eastern_shore`, `new_england` and `michigan_wisconsin` stay `unknown` (0061); splitting them is the map lane's, as is splitting the Indian Territory boxes (1.5).
3. Faction changes in play for a government department (1.4) need a format decision.
4. The Confederate pack, if one is built, will need the nations too; the Articles of 1 July are the one document that speaks for four of them together.

## Sources

| Key | Source | Read as |
|---|---|---|
| [STAT] | Statutes at Large: 2 Stat. 103 (1801), 9 Stat. 446 (1850), 10 Stat. 277 (1854), 12 Stat. 172 and 239 (1861), govinfo.gov and dheller.org page scans | text layer extracted locally; **H** |
| [USCONST] | Constitution, National Archives transcription, art. I sec. 8 cl. 17 | **H** |
| [OR1-682] | OR I-1 p. 682, "Resolutions ... of the General Council of the Choctaw Nation", 7 Feb 1861 (civilwar.com transcription) | read |
| [OR3-594] | OR I-3 p. 594, Hudson's proclamation of 14 June 1861 (civilwar.com) | read |
| [OR13-490], [OR13-497] | OR I-13 pp. 490, 497, the Cherokee inclosures including Ross's proclamation of 17 May 1861 (civilwar.com) | read |
| [CHOC-1861] | Choctaw Nation, "1861confederation.pdf": the Articles of Confederation of 1 July 1861 and the resolution of 7 February 1861 (choctawnation.com) | read; facts only |
| [CHOC-CHIEFS] | Choctaw Nation, "List of Chiefs" (choctawnation.com/about/history/chiefs) | read |
| [CHOC-ITI] | Choctaw Nation, *Iti Fabvssa*, "A New Chahta Homeland: 1860–1870" (1 May 2021) | read |
| [HUDSON-1934] | P. J. Hudson, "A Story of Choctaw Chiefs", *Chronicles of Oklahoma* 1939 (written 1934; partial, "to be continued") | read |
| [CHICK-TV], [CHICK-HOF], [CHICK-TL] | Chickasaw Nation: chickasaw.tv "Civil War and More Broken Promises"; Hall of Fame (Cyrus Harris, 2012); timeline.chickasaw.net (the later half only summarised) | read |
| [OHS-CHICK] | Encyclopedia of Oklahoma History, "Chickasaw" (J. P. Pate) | read |
| [UNL-CSA] | University of Nebraska–Lincoln, Confederate Indian treaties portal | partly verbatim, partly a model summary: signature blocks **L** |
| [BAHOS] | C. Bahos, "On Opothleyahola's Trail", *Chronicles of Oklahoma* 63:1 (Spring 1985) pp. 58–81 | read as extracted text |
| [EVSTAR] | *Evening Star*, 28 June 1861, via the UALR primary-sources exhibit | read |
| [CHER-CODE] | Cherokee Nation Attorney General's code, the 1839 constitution | **snippet** |
| [WP-CHOC], [WP-BERRET], [WP-WASHCO] | Wikipedia: Choctaw in the American Civil War; James G. Berret; Washington County, D.C. | pointers only |
| [GCF] | `docs/research/2026-11-14-gate-and-catalogue-facts.md` | earlier note |
| [KAPPLER] | Treaty of Fort Wise with the Arapaho and Cheyenne, 18 February 1861, ratified 6 August 1861, 12 Stat. 1163 (Kappler vol. 2), via the Oklahoma State University Tribal Treaties Database | read |

## 6. Wording applied after the gate review (decision 0069)

The gate reviewer's verdict (approve after fixes) led to wording changes only; no region, department or government row changed. On branch `research-it-wording`:
- **G2.** The Choctaw sentence in `world/regions.csv` and the map draft now reads: "The Choctaw General Council's five resolutions of 7 February 1861 were conditional: the third says that if the Union is permanently dissolved, the Choctaw will follow their own people's ties and interests, which it says bind them to the Southern states (OR I-1 p.682)."
- **G3.** The two Indian Territory rows of `control.csv` end "neither side's", not "no one's". "Opothleyahola's Unionists" is "Opothleyahola's loyalists" in `world/regions.csv` and the draft.
- **G8.** The notes for `tr_nebraska`, `tr_dakota`, `tr_colorado` and `tr_new_mexico`, and the governments rows for those regions and `arizona`, say that the act keeps treaty Indian lands outside the Territory until the tribe assents (the Nebraska, Dakota and Colorado acts; the 1850 New Mexico act's clauses read carry no such exception), that Native nations held or claimed much of the land, and that the department is the Territory's government, not the government of the nations who lived there. **The brief's "most of the region's land was the nations'" is not sourced here:** the evidence read supports "much of", and the New Mexico clause is unsourced, so the rows say so. Colorado's row cites the Fort Wise treaty (signed 18 February 1861, unratified until 6 August).
- The importer script (`import-people-oob.mjs`) still writes "no one's" and the old Choctaw sentence; it is never re-run (0056).
