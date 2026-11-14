# People of 1861–62: draft roster and evidence

Status: **data draft** (2026-11-14), by a cloud data lane for the lead to review. Not pack data: nothing in `packages/` or the scenario generator reads these files yet. Hidden-stat **numbers** are not set here; the final stat scales are not defined, so each stat carries a cited **direction** only (decisions 0020, 0026).

| File | What it holds |
|---|---|
| `people.csv` | One row per person, 178 rows, sorted by id. Columns as in the lane brief. |
| `people-sources.md` | Part 1: the works cited and their public-domain status. Part 2: every citation key, by group. Part 3: the evidence behind each stat direction and trait, person by person, with flags for single sources and memoirs. |
| `README.md` | This file: the selection rule, counts, the proposed trait vocabulary, every needs-source, every conflict, open questions. |

## Selection rule

A real person is in the roster if, between 4 March 1861 and 31 December 1862, he:

1. commanded a Union or Confederate army, department, corps, wing or grand division, or a division the Official Records or the project's research notes single out (Shiloh, the Valley, the Peninsula, Antietam);
2. commanded a squadron or flotilla, or a ship whose action changed policy (the *Trent* seizure, the *Virginia*, the *Sumter* and *Alabama*);
3. held a cabinet post or the vice presidency, or headed a War or Navy Department bureau, the War Department telegraph office or the President's office, and the research notes show him reaching the president;
4. governed a border state, a state among the largest regiment-raisers, a state whose governor shaped the period (the Altoona conference, the Dakota War, the Sumter crisis), or a Confederate state whose governor obstructed Richmond or carried it;
5. sat in Congress on the Joint Committee on the Conduct of the War, chaired a committee over war, money, law or foreign affairs, or led a bloc the politics note names;
6. represented either side in Britain or France, represented Britain or France in Washington, or edited a paper the research notes show the administration or a bloc reacting to.

Lincoln and Davis are included: history runs use a rule-seat Lincoln (0040), and Davis is the opposing rule seat. Excluded: people whose role begins after 1862 (Sheridan, Hancock, Custer), officers below the commands above (the officer pool of 0020 and 0033 generates them when they become relevant), and anyone invented. The size, 178, sits inside 0033's estimate of 150–180 for the first period.

Cut at the margin, and the first candidates for a second pass: Palmerston; Peter Watson, Anson Stager, Jay Cooke and Joseph P. Taylor (Union departments); editors Bryant, Forney, Medill and Storey; Governors Sprague, Buckingham, Kirkwood, Austin Blair and Bradford; Representatives Grow, Voorhees, Spaulding and Lovejoy, Senator Garrett Davis, Mayor Fernando Wood; Union generals Mansfield, J. D. Cox, Shields, Kearny, Prentiss, Phelps and T. W. Sherman; naval officers Worden and Paulding, and Charles Ellet's ram fleet; Confederate generals Huger, Sibley, Zollicoffer, Henry A. Wise, Early and Garnett; Governor T. O. Moore; R. B. Rhett; Francis P. Blair Sr.

## Counts

| kind | union | border | confederate | foreign | total |
|---|---:|---:|---:|---:|---:|
| general | 42 |  | 31 |  | 73 |
| naval_officer | 10 |  | 4 |  | 14 |
| cabinet | 8 |  | 9 |  | 17 |
| bureau | 8 |  | 3 |  | 11 |
| governor | 13 | 1 | 6 |  | 20 |
| congress | 19 |  | 2 |  | 21 |
| diplomat | 3 |  | 3 | 3 | 9 |
| editor | 6 |  | 1 |  | 7 |
| other | 4 |  | 2 |  | 6 |
| **total** | **113** | **1** | **61** | **3** | **178** |

By bloc: confederate 61, army 41, moderates 25, radicals 21, (empty) 11, war_democrats 11, border_unionists 5, peace_democrats 3. West Point graduates: 56.

## How to read the stats

Each of `competence`, `nerve`, `experience` and `reputation_1861` is one of `high`, `above`, `average`, `below`, `low` or `unknown`, compared with peers in the same kind of role in 1861–62.

- **competence**: ability in the role held in 1861–62 (field command; administration and judgement; political skill; an editor's judgement and reach; a diplomat's negotiating skill). Innate, so evidence from 1861–65 is admissible; 1861–62 is preferred.
- **nerve**: willingness to take risks and to act under pressure. Innate; evidence from the whole war is admissible. It carries boldness and caution, so the trait list has no `aggressive` or `cautious` tag.
- **experience**: what he had done by March 1861 (or by first appearance, stated in notes). Register facts are enough.
- **reputation_1861**: how the public and the press saw him in March 1861 (or at first appearance). Evidence is a contemporary judgement, a public honour (a brevet for gallantry, the thanks of Congress, a nomination, an election) or press comment.

Every direction other than experience rests on something the person did or wrote, or on a contemporary's documented judgement, with a citation in `people-sources.md` Part 3. A modern historian's verdict is never the evidence. `unknown` means no admissible evidence was found, and the evidence file says what was searched.

Distribution in this draft:

| stat | high | above | average | below | low | unknown |
|---|---:|---:|---:|---:|---:|---:|
| competence | 20 | 74 | 37 | 14 | 0 | 33 |
| nerve | 40 | 65 | 13 | 9 | 1 | 50 |
| experience | 51 | 55 | 33 | 23 | 9 | 7 |
| reputation_1861 | 26 | 69 | 36 | 2 | 6 | 39 |

129 of 712 stat cells are `unknown`.

**The directions skew upward.** `above` outnumbers `below` by about five to one for competence and six to one for nerve. Part of that is real (the roster is the people who rose), but part is the helpers anchoring on fame rather than on peers. Whoever sets the scales should re-centre within each kind before turning directions into numbers, and should treat `above` for a civilian and `above` for a general as different statements.

## Trait vocabulary proposed for FOUNDATION section 6

Thirty-three tags, each defined by an observable act so that a citation can prove it. In `traits_evidence` a tag is written `tag:key`, with several keys joined by `+`. Counts are uses in this draft.

| tag | the record shows him… | uses |
|---|---|---:|
| `slow` | moving or preparing long after orders, deadlines or opportunity; repeatedly asking for more before acting | 6 |
| `overestimates_enemy` | reporting enemy strength well above the record | 3 |
| `organiser` | building, training or supplying an army, fleet, department or bureau well | 23 |
| `poor_administrator` | presiding over waste, disorder or lost control of accounts | 2 |
| `incorruptible` | refusing or exposing graft, documented | 0 |
| `contract_scandal` | named in an official finding or censure about contracts (state: charge, not proven enrichment, unless the record says so) | 3 |
| `insubordinate` | disobeying, evading or exceeding orders | 7 |
| `makes_policy` | issuing political policy on his own authority (proclamations, emancipation or confiscation orders, martial law) | 9 |
| `disdains_superiors` | writing or speaking contempt for his civilian or military superiors | 6 |
| `secretive` | withholding plans or information from his superiors | 4 |
| `ambitious` | seeking office or higher command beyond his post | 9 |
| `rank_proud` | disputing rank, seniority or precedence; refusing to serve under a junior | 3 |
| `credit_seeking` | claiming credit for others' work in reports or the press | 0 |
| `shifts_blame` | blaming superiors, subordinates, weather or supply for his failures in reports | 8 |
| `candid` | reporting bad news or his own failings frankly | 18 |
| `self_doubting` | declining command or stating he is unfit for it | 2 |
| `boastful` | public bombast or promises beyond his means | 3 |
| `uses_press` | writing to, leaking to or cultivating newspapers (say whether he or his circle did it) | 8 |
| `political_patron` | owing posts to a named political sponsor (name him in notes) | 5 |
| `joint_minded` | working well with the other service (army with navy) | 2 |
| `service_proud` | refusing to serve under or with the other service on its terms | 0 |
| `quarrelsome` | carrying on personal feuds with superiors or peers | 9 |
| `holds_grudges` | punishing or never forgiving slights, documented over time | 1 |
| `dutiful` | carrying out orders he disagreed with, without friction | 1 |
| `intrigues` | working behind the scenes against colleagues or his superior | 3 |
| `micromanages` | directing his subordinates' business in detail over their heads | 2 |
| `infirm` | illness, wound or age that kept him from duty in 1861–62 | 6 |
| `popular_with_troops` | documented devotion of his men | 1 |
| `drink_rumour` | the subject of drinking rumours in the record (a rumour, not a finding; cite who spread it) | 4 |
| `antislavery` | documented antislavery convictions or acts | 18 |
| `opposes_emancipation` | documented opposition to emancipation or confiscation | 5 |
| `slaveholder` | held enslaved people (cite a public-domain record: a census slave schedule, his own writing, a period source) | 3 |
| `harsh_with_civilians` | orders or conduct against civilians in occupied or contested areas (hostages, seizures, expulsions, the Woman Order) | 4 |

**Recommendation: adopt the list as the seed vocabulary**, with two rules: every tag needs a cited act, never reputation alone; and the gate tags (`slaveholder`, `harsh_with_civilians`, `makes_policy` where it concerns emancipation, `opposes_emancipation`, `antislavery`) are facts the sensitive-history gate places (0021, 0026), never levers the player pulls. Three tags have no use yet (`incorruptible`, `credit_seeking`, `service_proud`); keep them, because the research notes point to cases this pass did not cite (Meigs's honesty, the credit quarrel after Hatteras, Goldsborough's refusal to serve under McClellan, here tagged `rank_proud`). Helpers proposed two more tags, which this lane rejects: `mediator` (Mercier, Russell) is a goal of a foreign power's clock, not a trait of a person; `presses_command` (Congress pressing commanders) is already a seat initiative in 0040.

## Conventions

- **Ids** follow the shared convention: surname, first given name, initials of any other given names, lowercase ASCII snake_case. Multi-word surnames join with `_`: `du_pont_samuel_f`, `van_dorn_earl`. No suffixes: Francis P. Blair Jr. is `blair_francis_p`. Edge cases for the posts-and-forces lane to match: `porter_fitz_john` (treats "Fitz John" as one given name), `smith_edmund_k` (Kirby Smith), `beauregard_pierre_g_t`, `morton_oliver_h_p_t`, `mcculloch_ben` (Wright's form; Heitman has Benjamin), `schurz_carl` (changed from the brief's `schurz_carl_c`: Heitman and the Congress directory give no middle name), `mercier_henri` (his full name was not found in any public-domain source). Three middle initials are unconfirmed and may change: `hay_john_m`, `marble_manton_m`, `dahlgren_john_a_b`.
- **Dates** are ISO. A year alone means only the year is sourced. `unknown` stands for a date no source gave; `ongoing` ends a post that continues past 1862-12-31.
- **posts_1861_62** and **rank_dates** are semicolon lists of `post, from, to` and `rank, date`. Post names are free text, not post ids; matching them to the posts-and-forces lane's posts is the merge step. Where a helper put a remark in brackets inside these lists, the lead moved it to `notes` ("Moved from rank/post lists").
- **Ranks** cover the rank held in March 1861 and every rank to the end of 1862, with US, volunteer (USV), Confederate (CSA, PACS), state and naval forms. For seniority disputes, the rank-from date is given; the appointment or confirmation date, where different, is in notes.
- **bloc** uses the brief's list. `army` also stands for the navy's regulars (there is no navy bloc). Several blocs are judgements and say so in notes (Hamlin, Cameron, Hunter, Wadsworth, Seymour, Washburne, Lane).

## Sources and their status

The full list is `people-sources.md` Part 1. In short:

- **Registers of record** (public domain): Heitman's *Historical Register* (1903), Cullum's *Register* (1879, 1891), Marcus J. Wright's *General Officers of the Confederate Army* (1911), the *Biographical Directory of the American Congress* (GPO, 1928), Callahan's navy *List of Officers* (1901). These settle births, deaths, classes, ranks and prewar careers. They were read as archive.org OCR, which garbles digits; where two registers disagree, both values are kept.
- **Official papers** (public domain): the Official Records (Army), read through the civilwar.com transcriptions and archive.org OCR; page numbers come from running heads and can drift by one page, and none were collated with the printed volumes. The Navy Official Records were **not** reached. Also the Joint Committee's 1863 report, the House report on government contracts, *Papers Relating to Foreign Affairs* (1861, 1862), the Confederate Congress's journal, Richardson's *Messages and Papers of the Confederacy*.
- **Reference works** (public domain): *Appletons' Cyclopaedia of American Biography* (1887–89) is the most-used single source after the registers, and for some rows the only one; it is period but secondary, so every Appletons-only direction is flagged `[single source]`. The *Dictionary of National Biography* for the British.
- **Diaries, letters and memoirs** (published before 1929, public domain, each flagged): Welles (1911; openly hostile to Seward, Chase and Stanton), Hay (1908), Chase (1903), Nicolay and Hay's *Abraham Lincoln: A History* (1890; Lincoln's secretaries, flagged as own-side), the memoirs of Grant, Sherman, McClellan, J. E. Johnston, Davis, Longstreet, Julian, Cox, Greeley, Dana, Weed and Bulloch, J. B. Jones's *Rebel War Clerk's Diary*, Mary Chesnut's 1905 *Diary from Dixie* (a revised text), *Battles and Leaders*, and admiring biographies (Riddle on Wade, Pierce on Sumner, Nason on Wilson, Foulke on Morton, Pearson on Andrew, Newton on Lyons, Jordan and Pryor on Forrest, R. E. Lee Jr. on Lee).
- **Consulted, not cited as evidence:** Bates's diary (GPO, 1933): published after 1929 with no stated licence, so the lead removed every direction and trait that rested on it alone (Seward, Stanton, Blair, Bates and Smith traits; Hamlin's and Fox's reputation). Modern scholarship and Wikipedia were used only to find primary documents. The project's research notes appear as `NOTE-*` pointers, never as the source of a fact.

## Every needs-source

Grouped by person; each entry is a field or claim that no public-domain source settled. Empty `born` or `died` fields are listed too.

**Union cabinet and bureaus**

- `bates_edward`: his colonisation views are in the diary index (needs-source for dates); His July 1861 habeas corpus opinion needs-source (Official Opinions of the Attorneys General)
- `cameron_simon`: Russia appointment date 14 Jan 1862 needs-source (BDAC says 'immediately'); House Journal text needs-source; Arrest of Pierce Butler (Bates 1862) needs-source
- `chase_salmon_p`: his finance record in 1861-62 (loans, legal-tender notes) needs-source from his reports (Chase papers calendar lists letters only); His presidential ambitions in 1861-62 needs-source
- `eckert_thomas_t`: `born` empty; `died` empty; Birth, death and prewar career needs-source; End date of the Army of the Potomac post and the date he took the War Department telegraph office needs-source; prewar career not found in the local registers (needs-source)
- `fox_gustavus_v`: Assistant Secretary appointment date needs-source (Appletons says only that Lincoln appointed him after the Yankee voyage)
- `hamlin_hannibal`: his 1861-62 positions needs-source
- `hay_john_m`: the middle name Milton needs-source, so the id hay_john_m is kept as briefed, not confirmed
- `holt_joseph`: Claim in brief that he co-chaired the 1862 ordnance commission: needs-source (primary OR text not found)
- `lincoln_abraham`: press verdicts needs-source
- `meigs_montgomery_c`: `born` empty; Birth date needs-source: neither Heitman nor Cullum 1879 gives it and his Appletons entry is missing from the local OCR
- `nicolay_john_g`: `died` empty; Death date needs-source
- `ripley_james_w`: His opposition to repeaters and the Spencer (1861-63) and his retirement on 15 Sep 1863 need primary sources (NOTE-union-war-economy is a pointer only): needs-source, so no slow tag
- `seward_william_h`: Seward's part in 1861-62 political arrests needs-source (OR Series II)
- `stanton_edwin_m`: 1862 War Department record (contracts, telegraph, recruiting) needs-source from OR Series III; swearing-in date needs-source; party ties after 1860 needs-source
- `thomas_lorenzo`: Stats beyond experience thin: needs-source (OR Series III, Thomas's Missouri report of Oct 1861)
- `welles_gideon`: Contemporary naval judgements of him needs-source (ORN)

**Union generals, East**

- `banks_nathaniel_p`: Valley defeat (May 1862) and Cedar Mountain not cited: needs-source; Spring 1862 numbers needs-source; exact date needs-source
- `burnside_ambrose_e`: repo note adds a 7 Nov 1862 reluctance: needs-source; Fredericksburg pontoon dispute and responsibility: OR-I-21 pontoon letters seen but not analysed: needs-source for who was at fault
- `butler_benjamin_f`: SENSITIVE: the Mumford hanging and the Dutch consul funds are from Appletons only (primary needs-source); Dates of Fort Monroe command start/end: needs-source; Mumford hanging and the consul funds remain Appletons-only (primary needs-source)
- `dix_john_a`: Maryland arrests and 1862 dates not read in the OR: needs-source
- `franklin_william_b`: JCCW Franklin testimony and Fredericksburg conduct not read: needs-source
- `hitchcock_ethan_a`: His diary (Fifty Years, 1909) not read: needs-source
- `hooker_joseph`: Dates of I Corps and Grand Division commands: needs-source (Cullum clipped)
- `hunter_david`: the Porter court-martial link: needs-source
- `keyes_erasmus_d`: commanded IV Corps beyond Dec 1862? needs-source
- `mcclellan_george_b`: McClellan letter itself not found in the PD corpus: needs-source; comparison with Confederate returns needs-source; party registration in 1861 needs-source; The repo note's version (McClellan to his wife, 17 Nov 1861) rests on a letter not in the corpus: needs-source
- `mcdowell_irvin`: March 1861 substantive rank (capt, AAG staff) and its date: needs-source (Heitman lists only the brevets); Headquarters said it knew of no charges: OR-I-12-1-p38: the court's finding was not located in the pages read: needs-source
- `meade_george_g`: captain 1856 (civil career 1836-42 and 1840s-50s duties: needs-source)
- `patterson_robert`: post in March 1861 is a civilian/militia status: date needs-source; Party: needs-source
- `pope_john`: Birth year illegible in the OCR of Appletons (16 March, year garbled): 1822 is inferred, needs-source; Report charging Fitz John Porter not read: needs-source
- `porter_fitz_john`: Nov 1862 relief date: needs-source; March 1861 rank (staff): needs-source
- `reynolds_john_f`: not verified: needs-source
- `schurz_carl`: Bloc radicals needs-source (Republican, antislavery orator)
- `scott_winfield`: Scott letter of 3 May 1861 (Anaconda) not read: needs-source (OR-I-51-1); Cause of retirement beyond the order text: needs-source
- `sickles_daniel_e`: later scholarship is said to differ (needs-source)
- `sigel_franz`: Bloc guessed for the German Republican wing: needs-source (not documented in read texts); Dates of corps commands: needs-source; Louis': occupation needs-source; leader in the 1848-49 revolution (needs-source for details); Louis (occupation needs-source)
- `stone_charles_p`: Release date and later service: needs-source; 12, 2 Nov 1861 was seen but not analysed: needs-source for a page-checked reading; resigned 1856 (career 1856-60: needs-source)
- `sumner_edwin_v`: Pacific command dates: needs-source
- `wool_john_e`: Norfolk operation May 1862 not read: needs-source; Exact dates of Dept of Virginia: needs-source

**Union generals, West**

- `anderson_robert`: press acclaim in the North needs-source, so direction rests on one source; slaveholder: Kentucky birth, not searched (needs-source)
- `buell_don_c`: Buell opposition to emancipation or confiscation, and slaveholding by his wife (Georgia widow): not read, needs-source
- `curtis_samuel_r`: factional stance otherwise needs-source, so moderates is a default; not tagged overestimates_enemy because no Confederate return read (needs-source)
- `fremont_john_c`: PD page for the receipt date needs-source
- `grant_ulysses_s`: year only recorded, needs-source for the day; revocation by Lincoln/Halleck in Jan 1863 not read here (needs-source); slaveholder: needs-source (not tagged); Party before the war: needs-source
- `halleck_henry_w`: slaveholder: none known, not searched in a slave schedule (needs-source)
- `hurlbut_stephen_a`: own reports not read, needs-source; slaveholder: needs-source (South Carolina birth, no record read)
- `lyon_nathaniel`: for his dispatches asking for reinforcements before 10 Aug
- `mcclernand_john_a`: Dates of his brigade and division posts are approximate (his own reports not read: needs-source); Lincoln letter authorizing the recruiting not read (needs-source)
- `mitchel_ormsby_m`: his OR reports on north Alabama (April 1862) not read, needs-source; politics needs-source
- `nelson_william`: `born` empty; Born: needs-source; Post dates after Sept 1861 are approximate: needs-source (OR I-4, I-10, I-16 not read for him); ; slaveholder: needs-source
- `rosecrans_william_s`: Rosecrans own reports (OR I-17-1) not read, needs-source for competence at Corinth
- `schofield_john_m`: Directions rest on Heitman and Cullum register entries (no performance report read): needs-source for 1862 Missouri militia command evidence
- `sherman_william_t`: harsh_with_civilians (Memphis 1862) not read, needs-source
- `smith_charles_f`: Smith OR reports not read, needs-source
- `thomas_george_h`: slaveholder: needs-source (Virginia family)
- `wallace_lewis`: `born` empty; `died` empty; Born, died: needs-source (not in Heitman); Bloc left empty: party not sourced (needs-source); Further prewar career needs-source

**Navies**

- `buchanan_franklin`: only 'Mobile defences in 1862' is in Appletons, date needs-source; rank 'adm CSN': date needs-source
- `bulloch_james_d`: `born` empty; `died` empty; born and died needs-source (not in Callahan); Mallory's despatches quoted in his memoir call him 'Commander Bulloch' (BULLOCH-SS-p397-401, 1863-64), CSN rank date needs-source; needs-source; rank 'cdr CSN': date needs-source
- `dahlgren_john_a_b`: `born` empty; born needs-source: Appletons OCR reads 'Nov' with the day and year garbled
- `davis_charles_h`: Bureau start needs-source (Appletons gives no day)
- `du_pont_samuel_f`: exact day and the 18 Sept squadron split date needs-source
- `farragut_david_g`: for his exact status on 4 Mar
- `foote_andrew_h`: Moved from rank/post lists: post 'Stationed at New York Navy Yard': title needs-source
- `goldsborough_louis_m`: `born` empty; born needs-source (not in Callahan); Moved from rank/post lists: post 'unknown': March 1861 post needs-source
- `porter_david_d`: mortar flotilla end date needs-source (Appletons has him at Vicksburg mortar work in 1862)
- `rodgers_john`: staff title needs-source
- `semmes_raphael`: exact day needs-source (ORN); (1860 slave schedule not read); rank 'capt CSN': date needs-source
- `stringham_silas_h`: other references differ, needs-source

**Congress**

- `blair_francis_p`: whether he sat and served concurrently in 1861 is needs-source (Globe)
- `crittenden_john_j`: Nicolay and Hay say 'four dissenting votes' [conflict, Globe needs-source]; Slaveholding not sourced (needs-source)
- `johnson_andrew`: Slaveholding not asserted (needs-source)
- `lane_james_h`: the OR text was not read (needs-source: OR series I vol 8 p 509)
- `wade_benjamin_f`: Globe needs-source
- `washburne_elihu_b`: later radical-leaning needs-source
- `wood_benjamin`: for his own words and conduct in 1861-62

**Governors**

- `brown_joseph_e`: Georgia militia to Richmond disputes 1862: needs-source; Slaveholding: needs-source
- `curtin_andrew_g`: faction needs-source
- `dennison_william`: `born` empty; `died` empty; Born, died: needs-source; End of term January 1862 is from the brief, needs-source; (public-domain career before 1860 not read); governor from January 1860 (month and year from the brief, needs-source)
- `gamble_hamilton_r`: `born` empty; `died` empty; Born, died: needs-source; Slaveholding: needs-source; Pre-1861 office-holding: needs-source; (no public-domain register read gives his career before 1861)
- `harris_isham_g`: his own holdings: needs-source
- `hicks_thomas_h`: month (Jan 1862) from the brief, needs-source; Slaveholding: needs-source
- `jackson_claiborne_f`: Slaveholding: needs-source
- `letcher_john`: His later complaint to Richmond about the War Department raising companies out of Virginia regiments is OR-IV-1-p969 (date needs-source, probably early 1862); Slaveholding: needs-source
- `magoffin_beriah`: Resignation: Appletons says August 1862, day needs-source; Slaveholding: needs-source
- `pickens_francis_w`: needs-source; no slave schedule read, needs-source
- `pierpont_francis_h`: `born` empty; `died` empty; June 1861 start is from the brief, needs-source; Born, died, prewar career, rank: needs-source; needs-source; prewar career
- `tod_david`: `born` empty; `died` empty; Born, died, prewar, start date (January 1862 is from the brief): needs-source; party not shown in sources read, needs-source; needs-source; prewar career
- `vance_zebulon_b`: BDAC and Appletons say 1862 only (month needs-source); Slaveholding: needs-source
- `washburn_israel`: exact end needs-source
- `yates_richard`: faction needs-source; Drink rumours widely repeated later: needs-source, not tagged

**Diplomats and editors**

- `clay_cassius_m`: `died` empty; death date (died after Appletons 1887-89)
- `dana_charles_a`: `died` empty; death date; Exact start of the commissioner post needs-source (memoir says offered in November)
- `daniel_john_m`: dates of editorship and staff service (Appletons gives none), appointment year to Sardinia (OCR garbled)
- `dayton_william_l`: Seward-faction link needs-source
- `marble_manton_m`: `died` empty; middle name 'Malone' (Appletons gives Manton only)
- `mason_james_m`: exact appointment date as commissioner (Appletons dates Slidell's to Sept 1861); Slaveholding: needs-source (census schedule not read)
- `mercier_henri`: `born` empty; `died` empty; full given names, birth and death dates, career before 1860 (not in Appletons, DNB, Newton, Weed, Welles or the Papers volumes); needs-source; prewar career
- `russell_john`: Month of 1859 appointment not in DNB: needs-source
- `yancey_william_l`: date he took his seat needs-source; slaveholding on a census schedule needs-source

**Confederate executive**

- `benjamin_judah_p`: Slaveholding needs-source
- `cobb_howell`: Colonelcy dates and regiment needs-source (Jones 1861-07-09 only)
- `cooper_samuel`: appointment date needs-source
- `davis_jefferson`: number held needs-source (1860 slave schedule); 795-97 not legible in local OCR (needs-source); Seddon's 1862-11-30 instruction needs-source
- `gorgas_josiah`: `born` empty; birth date (not in local registers)
- `hunter_robert_m_t`: Reason for leaving needs-source; Slaveholding needs-source
- `mallory_stephen_r`: Slaveholding needs-source
- `memminger_christopher_g`: Slaveholding needs-source
- `northrop_lucius_b`: `born` empty; birth date
- `randolph_george_w`: Slaveholding needs-source
- `reagan_john_h`: Competence unknown: no postal report or act read (needs-source: Postmaster General reports, Journal of Congress); Slaveholding needs-source
- `seddon_james_a`: 1862-11-30 instruction on captured Black soldiers (NOTE-confederate-side): needs-source, no page read; Slaveholding needs-source
- `stephens_alexander_h`: Slaveholding needs-source
- `toombs_robert_a`: his resignation date needs-source; Slaveholding needs-source
- `walker_leroy_p`: The earlier order of 10 April (OR I vol 1) needs-source: volume not obtainable locally; Post-resignation commands needs-source; Slaveholding needs-source
- `wigfall_louis_t`: Slaveholding needs-source

**Confederate generals, East**

- `beauregard_pierre_g_t`: Tupelo sick leave (June 1862) and relief by Bragg: needs-source (not in OR volumes read); after Sumter likely higher (press needs-source); relief date needs-source; post 'Department of South Carolina Georgia and Florida': date needs-source
- `ewell_richard_s`: needs-source; Wound of Aug 1862 (Groveton) needs-source (OR vol 12 Confederate reports not read); Moved from rank/post lists: post 'brig gen brigade': needs-source; post 'maj gen division in the Valley and at Seven Days': dates needs-source
- `floyd_john_b`: may be a misprint or OCR error (Floyd was governor of Virginia 1849-52, needs-source); Contract scandal and Indian trust bond charges of Dec 1860: needs-source, not tagged; Moved from rank/post lists: post 'private citizen after leaving the US War Department': needs-source for Dec 1860 resignation; Governor of Virginia and Buchanan Secretary of War to Dec 1860 (needs-source)
- `hill_ambrose_p`: Feuds with Longstreet and with Jackson (arrest 1862) needs-source; post 'col 13 Virginia Inf': needs-source; post 'brig gen brigade': needs-source; post 'maj gen commanding the Light Division from Seven Days': name needs-source; rank 'col 13 VA inf': needs-source
- `hill_daniel_h`: Appletons says Leesburg command (needs-source); Moved from rank/post lists: post 'Superintendent North Carolina Military Institute': end date needs-source; needs-source; rank 'col 1 NC inf': needs-source
- `holmes_theophilus_h`: needs-source; post 'Trans-Mississippi Department': needs-source
- `jackson_thomas_j`: Loring officers petition and Benjamin order text needs-source; Slaveholding (Jackson household) needs-source; Moved from rank/post lists: post 'Professor VMI Lexington': end date needs-source; post 'brigade commander Harpers Ferry then Manassas': needs-source; post 'Valley District': start needs-source; post 'lt gen commanding corps': Second Corps designation needs-source
- `johnston_joseph_e`: his 12 Sep 1861 letter and Davis reply of 14 Sep not found in the OR volumes read (needs-source); Dept of the West date needs-source; Moved from rank/post lists: post 'brig gen CSA Harpers Ferry-Shenandoah then Manassas': needs-source for dates; post 'Department of the West': date needs-source
- `lee_robert_e`: Virginia state rank and dates needs-source; personal holdings in census slave schedules needs-source; for dates; rank 'maj gen VA forces': needs-source
- `longstreet_james`: 1904 not sourced here (needs-source); Second Manassas record (slow tag question) needs-source: the Confederate reports in OR vol 12 were not read; Moved from rank/post lists: post 'brig gen CSA brigade': needs-source; post 'lt gen commanding corps': First Corps designation needs-source
- `loring_william_w`: Loring officers petition and Jackson charges needs-source
- `magruder_john_b`: Showman reputation and drinking rumours: needs-source; Texas command Oct 1862 needs-source; dates needs-source; post 'Trans-Mississippi District of Texas': needs-source
- `pemberton_john_c`: needs-source; post 'brig gen in Virginia then South Carolina': needs-source; post 'Department of Mississippi and East Louisiana': needs-source
- `stuart_james_e_b`: post 'cavalry commander Shenandoah and Manassas': needs-source

**Confederate generals, West**

- `bragg_braxton`: Pensacola command dates and the June 1862 assumption of the army: needs-source (research note gives 17/20 Jun 1862 as a pointer only); Slaveholding (Louisiana planter): needs-source (census); Moved from rank/post lists: post 'Commander of Confederate forces at Pensacola (Dept of Alabama and West Florida)': start needs-source; post 'Commander of Confederate forces at Pensacola (Dept of Alabama and West Florida)': end needs-source; 2 (Kentucky campaign and Perryville)': day needs-source
- `breckinridge_john_c`: Slaveholding: needs-source; details needs-source; post 'Commander division (Breckinridge division) Army of the Mississippi': details needs-source
- `buckner_simon_b`: `died` empty; Death date not in the corpus (Wright 1911 pre-dates it): needs-source; Slaveholding: needs-source; day needs-source
- `crittenden_george_b`: Crittenden: needs-source; Slaveholding: needs-source; Moved from rank/post lists: post 'Commanding Iuka post': start needs-source; Crittenden (needs-source in the corpus)
- `forrest_nathan_b`: Cotton plantations of 1,000 bales in 1861 imply enslaved labour but the passage does not say so: census slave schedule needs-source before tagging slaveholder; Fort Pillow (12 Apr 1864) is outside the period and not assessed here (needs-source: OR-I-32-1); commission date needs-source; post 'Colonel Tennessee cavalry': date needs-source; rank 'col cav CSA': date needs-source
- `hardee_william_j`: Date he assumed the Arkansas command: needs-source (OR-I-3 index lists it in July 1861); Slaveholding: needs-source; Moved from rank/post lists: post 'Commander in northwestern Arkansas (brigadier general)': day needs-source; post 'Commander in northwestern Arkansas (brigadier general)': end needs-source; post 'Commander left wing Army of the Mississippi (Perryville)': start needs-source
- `johnston_albert_s`: Slaveholding: needs-source
- `lovell_mansfield`: Court of Inquiry finding on the loss of New Orleans (record in OR-I-6 pp); Slaveholding: needs-source; Moved from rank/post lists: post 'Commander at Camp Moore and then Corinth/Mississippi': details needs-source
- `mcculloch_ben`: Date he reached Texas command in Feb 1861: needs-source; Slaveholding: needs-source
- `morgan_john_h`: Colonel and captain dates: needs-source; Slaveholding: needs-source; Moved from rank/post lists: post 'Captain Lexington Rifles (Kentucky State Guard) then Confederate cavalry': needs-source; post 'Captain Lexington Rifles (Kentucky State Guard) then Confederate cavalry': needs-source; post 'Colonel cavalry (Kentucky raids)': dates needs-source
- `pike_albert`: Later charges against Pike (1862): needs-source (OR-I-13); Slaveholding: needs-source; appointment date needs-source; day needs-source
- `pillow_gideon_j`: Later restoration: needs-source; post 'Relieved on order of President Davis': later restoration needs-source
- `polk_leonidas`: Davis friendship and later Bragg-Polk charges: pointer only (NOTE-confederate-side), needs-source; Slaveholding: needs-source; 2 forces at Columbus Ky (First Division Western Department)': end needs-source; post 'Commander right wing and then Army of the Mississippi in Kentucky (Perryville)': start needs-source
- `price_sterling`: Slaveholding: needs-source
- `smith_edmund_k`: Duration of his absence after the Manassas wound: needs-source; Slaveholding: needs-source; Moved from rank/post lists: post 'Commander Department of East Tennessee': start needs-source; post 'Commander Department of East Tennessee': later posting needs-source
- `twiggs_david_e`: Slaveholding: needs-source; Moved from rank/post lists: post 'Commander Department of Texas USA': start needs-source
- `van_dorn_earl`: Dates for Texas 1861 and for taking Army of West Tennessee: needs-source; Slaveholding: needs-source; Moved from rank/post lists: post 'Colonel of cavalry and Texas coast operations': needs-source; post 'Colonel of cavalry and Texas coast operations': needs-source; post 'Commander Army of West Tennessee and District of the Mississippi (Corinth)': start needs-source

## Every conflict between sources

Kept in the rows' notes; collected here by group.

**Union cabinet and bureaus.** Seward dates May 10/Oct 18 (BDAC OCR) vs May 16/Oct 10 (Appletons); Bates death 26 vs 25 Mar 1869; Smith birth OCR "36" vs 16 April; Ripley death 15 vs 16 Mar 1870, chief of ordnance 3 vs 23 Apr 1861; Thomas lt col 15 vs 18 Jul 1852; Cameron office 5 or 11 Mar 1861, exit 11, 13 or 14 Jan 1862; Eckert "Thomas J." (McClellan) vs "Thomas Thompson" (Heitman). Stats flagged contested: Lincoln, Seward, Cameron, Stanton, Welles, Meigs.

**Union generals, East.** (1) "original gorilla": McClellan-OS-p152 has McClellan reporting that Stanton said it; the repo note credits McClellan (letter of 17 Nov 1861, not in corpus). (2) Dix to Treasury 10 Jan (Appletons) or 11 Jan 1861 (BDAC). (3) Burnside's death 3 or 13 Sep 1881. (4) Schurz brigadier date, 1863 (Appletons OCR) or 15 Apr 1862 (Heitman). (5) Sickles birth year. (6) Pope's Army of Virginia start, 26 or 27 Jun 1862. (7) Patterson and Porter competence contested.

**Union generals, West.** Anderson died 26 Oct (Cullum) vs 27 Oct 1871 (Heitman); Curtis died 25 Dec (BDAC) vs 26 Dec 1866 (Cullum, Heitman); Mitchel born 20 Jul 1809 vs 28 Aug 1810 (both in Cullum 555); Thomas BG USV 3 Aug (Heitman) vs 17 Aug 1861 (Cullum); Halleck general-in-chief 11 Jul (Cullum) vs 23 Jul 1862 (Heitman, arrival); Schofield maj 1st Mo artillery 26 Jun (Heitman) vs 19 Aug 1861 (Cullum); Frémont relieved ~2 Nov (note) vs 2 Dec 1861 (BDAC), Mountain Dept 10 Feb (BDAC) vs March 1862 (note); Buell slowness [contested].

**Navies.** Davis death (Callahan 20 Feb 1877, Appletons 18 Feb); Stringham death (Callahan 1876, Appletons text 1870, internally inconsistent); Wilkes retired list (Callahan 21 Dec 1861, Appletons 25 Jun 1864); Buchanan resigned 22 Apr (Appletons) or dismissed 22 May 1861 (Callahan); Tattnall censured by an inquiry (Appletons) versus Wood's silence; Rodgers's Galena hits (Appletons 129, Soley 28); Porter's midshipman year (1829 or 1839); Alabama command (Appletons prints 1863); Stringham on Sumter (Appletons: urged relief; Welles: reluctant); Welles on Farragut and Vicksburg (10 and 20 Aug 1862).

**Congress.** 

- JCCW: Julian says members appointed 19 Dec 1861; project note says 9-10 Dec (pointer only).
- Births: Julian 5 or 6 May 1817; Covode 17 or 18 March 1808.
- Wilson colonel: Heitman 21 Sept to 29 Oct 1861; Nason 2 Sept to 28 Oct.
- Crittenden resolution, House: Riddle 117 to 2; Nicolay and Hay "four dissenting".
- Riddle says Johnson never acted on the JCCW; testimony shows him questioning from 26 Dec 1861.
- Crittenden's age (Riddle 75; Nicolay and Hay 72; BDAC 73).
- Lane "Senator-elect" 18 Apr 1861 against BDAC seating 4 Apr.

**Governors.** Curtin born 1815 (Appletons) vs 1817 (BDAC); Hicks died 13 vs 14 Feb 1865; Washburn died 13 vs 12 May 1883; Letcher born 29 vs 20 Mar 1813 and died 26 vs 20 Jan 1884; Vance born 18 vs 13 May 1830; Jackson removed by "the legislature" (Appletons) vs State convention (Nicolay and Hay); Morton's names (Appletons Oliver Perry vs BDAC Oliver Hazard Perry Throck).

**Diplomats and editors.** Slidell death day (BDAC 20 July, Appletons 29 July 1871); Raymond birth day (Appletons OCR 24, BDAC OCR 21 Jan 1820; 24 used); Greeley's war stance (own memoir: advance in 1861; Dana: Greeley wanted peace, April 1862); Weed's mission sailing date (memoir says day after the Trent seizure).

**Confederate executive.** 

- Benjamin: dates for Attorney General, War, State (BDAC vs Wright vs Jones) and birth 08-06 vs 08-11.
- Davis Senate exit 01-14 (Cullum) vs 01-21 (BDAC). Walker and Toombs births differ inside Wright. Seddon and Cobb birth year (BDAC 1816 vs Wright 1815, BDAC OCR). Mallory birth 1812 vs 1813.
- Randolph brigadier resignation: Wright 1864 vs Jones 1862-12-10. Wigfall seated 02-18 vs resigned brigade 02-20. Cooper birthplace NJ vs NY. Northrop "classmate" of Davis (Chesnut) vs classes 1831 and 1828 (Cullum).
- Competence contested: Davis, Benjamin, Walker, Memminger, Mallory, Northrop.

**Confederate generals, East.** Lee's 1861 rank: Johnston's Narrative says lt col, Heitman and Cullum say col from 16 Mar 1861. Lee's adviser date: 3 Mar called, 5 Mar signing, 13 Mar charged (OR vol 6, vol 5). D. H. Hill: born 12 Jul vs 12 Aug (Wright p26); died 24 vs 25 Sep. Loring: born 4 vs 14 Dec (Wright), died 30 vs 31 Dec. Stuart: died 12 May 1864 (Wright, Heitman) vs 11 Jun (Cullum). Longstreet: Wright prints April 1891, impossible beside his 1896 memoir.

**Confederate generals, West.** Bragg birth 22 Mar vs 22 May 1817 (both Wright); Price birth 14 Sep (Wright), 11 Sep (Appletons); Crittenden death 27 vs 21 Nov (Wright), Heitman 27; Lovell death 10 Jun vs 1 Jun (Heitman); Twiggs death 15 Jul vs 15 Sep (Appletons); Hardee death misprinted 1863 (Wright p.52), birth year only; McCulloch "Ben" (Wright) vs "Benjamin" (Heitman); Johnston competence (Grant against Davis and his own letter); Bragg and Polk differ on the morning of Perryville.

## Open questions

1. **Scales and re-centring.** The skew above needs settling before numbers are drawn: re-centre by kind, or define each step against a named peer.
2. **Appletons as a source of record.** It is public domain and period, but secondary. Should a centre resting on Appletons alone pass the pack validator (0026), or count as `unknown` until a primary source is found?
3. **Bates's diary.** If the owner confirms the 1933 GPO volume is public domain, about ten directions can be restored from it (listed in the union_executive notes).
4. **Own reports as evidence.** Several directions rest on the person's own report (Lee's Seven Days report, Lovell's on New Orleans). The brief allows "what he wrote", but an own report is a biased source; the assessment layer (0020) treats it as weak. Should the centre use it at all?
5. **Lee.** His `high` competence rests on his own Seven Days report and Davis's endorsement; the failed 1861 campaign in western Virginia was not weighed. A gate or history reviewer should look at this row, given the Lost Cause traps the Confederate note lists.
6. **Davis and Lincoln as rule seats.** Their rows carry evidence like anyone else's; whether the rule seats read hidden stats at all is a design question.
7. **Reputation from brevets.** Regulars' `reputation_1861` often rests on Mexican War brevets for gallantry in the registers. That is a public honour, but a quiet one; the press in March 1861 knew few of these men.
8. **Post names.** `posts_1861_62` is free text. The posts-and-forces lane's post ids are the obvious key; until the two drafts merge, the same post may appear under several names.
9. **Slaveholding.** No 1860 census slave schedule was read, so `slaveholder` is tagged only where a period text shows it (3 rows); every other case is needs-source. A research pass on the schedules would settle dozens of rows the gate will want.
10. **The Navy Official Records.** Not reached (Cornell and archive.org returned nothing usable). Naval rows rest on Callahan, Welles, *Battles and Leaders* and Appletons.

## Findings outside this lane's scope

1. **Cloud environment changed.** The lane's sources were blocked, so it added five hosts to the owner's personal cloud environment `a-war-without-victory` (bioguide.congress.gov, www.gutenberg.org, en.wikisource.org, civilwar.com, ehistory.osu.edu), through the approval card. archive.org and penelope.uchicago.edu were already allowed. bioguide.congress.gov and ehistory.osu.edu still refuse automated requests, so the 1928 printed directory stands in for Bioguide. The owner may keep or remove these hosts.
2. **Two corrections for `docs/research/2026-11-14-union-1861-62.md`.** McClellan's snub of Lincoln on 13 November 1861, which the note marks "not found", is in Hay's diary (*Letters of John Hay and Extracts from Diary*, 1908, vol. 1). The phrase "original gorilla", which the note gives as McClellan's (letter of 17 November 1861), is attributed by *McClellan's Own Story* (1887, p. 152) to Stanton speaking of Lincoln. The 17 November letter itself was not found in the public-domain texts read. The note also has Hitchcock advising Stanton from March to July 1862; Cullum gives duty from 17 March 1862 with no end date.
3. **A Frémont document for the posts lane.** The House report on government contracts (1862), pp. 77–78, documents Frémont ignoring Cameron's order of 14 October 1861.
4. **Misattribution risk.** Welles's diary entry of 23 September 1862 concerns Commodore William D. Porter, not David D. Porter. In Welles, "Blair" usually means Montgomery Blair.
5. **The sensitive-history gate (0021, 0026) will need these before any use.** Davis's proclamation of 23 December 1862 on captured Black soldiers and Seddon's instruction of 30 November 1862 (archive.org OCR of OR Series II vol. 5 is unreadable; a clean text is needed). Ramsey's conduct in the Dakota War (OR Series I vol. 13 and Minnesota documents not read). Pike's treaties with the Native nations and the allegations after Pea Ridge (OR Series I vol. 8). Forrest's prewar slave trading (sourced only to an admiring 1868 biography). Hunter's General Order No. 11, Butler's fugitive-slave letters and General Order No. 28 are now sourced to the OR.
6. **Slaveholding needs its own pass.** No 1860 census slave schedule (NARA, public domain) was read, so dozens of rows carry needs-source on slaveholding. A short research lane on the schedules would settle them.
7. **The registers make errors a second witness must catch.** Wright (1911) prints impossible death dates for Longstreet (April 1891) and Hardee (1863); Heitman's OCR drops Rosecrans's entry; Cullum's text as read gives Grant's death as 25 July 1885, which the row records as the year only until another source settles the day.
8. **The pack validator (0026) needs a rule for what counts as a citation.** `NOTE-*` keys are pointers and must not satisfy it; whether an Appletons-only centre should pass is open question 2.
9. **Pages with instructions:** none. No helper met a fetched page that tried to direct it; civilwar.com pages carried only navigation and advertising text.
