# S125: the residual unknowns

For the lead: 3 items. **S125 only**, `sprint/research-authority`, from
`0cb5af51c9fba5d5956a394856b543672b9a45c9`. Research draft for the deferred
review under 0106/0107. No code, pack, decision, band, criterion or signature
changes. No new strength-criterion or C11 credit is claimed.

**Result:** the requested exact landing strength, fifteen matched North Carolina
strengths, Moore's starting cause value, and Preston's original seven-company
strength remain unrecovered. There is useful new evidence: a contemporary
**80-man estimate for Vogdes's company in Meigs's later report**, named North
Carolina formation-strength statements with substantial limits, additional
Moore documents, and a Fourth Virginia company roll. Those records do not have
the date, membership or authorship needed to close the requested unknowns.
The distinctions and citations follow below; this is a bounded search result,
not an assertion that the missing records never existed.

## Reading and deliverables

The lead's S125 message, decisions 0085, 0087, 0122, 0125 and 0127, and sprint
rules 0106/0107 govern this packet. S121's lot inventory and S113's Moore row
were read as finding aids. In particular, a historical regiment receives no
legal establishment by default; a contemporary command estimate cannot be
divided among its units; and Moore needs his own eligible expression of the
common cause, rather than a faction, office or state vote.

- [Strength findings](S125/strength-findings.csv): 15 observations, each with its
  unit scope, evidence date, reported quantity, evidence kind, source keys and
  exclusion. No quantity is assigned to a model lot.
- [North Carolina lots](S125/north-carolina-lots.csv): all **15 exact S121 lot
  identifiers**, with their inherited battle references and individual holds.
- [Moore evidence](S125/moore-evidence.csv): seven records or grouped proceedings,
  distinguishing eligible personal papers, other people's words and late papers.
- [Source pages](S125/source-pages.csv): **71 retained page extracts**, printed
  pagination, physical locators, URLs, source-artifact and extract SHA-256s.
  Context pages already read by S121 are identified by their citations; the
  naval, North Carolina roster/history, Louisiana and company-roll readings
  extend its sources. This is not a claim to have read every acquired volume.
- [Searches](S125/searches.csv), [input receipts](S125/input-receipts.json) and
  [three headless image checks](S125/image-inspections.json) retain scope and
  limits. Raw acquisitions, discovery, checks and recovery evidence are in
  ignored `runs/s125/`, within this worktree.

The source types remain distinct. Clark's histories and the 1882 roster are
retrospective works. A dated contemporary letter reproduced in a later book is
eligible under 0087, but the book's surrounding characterization is not a
contemporary leg. A retrospective formation-strength statement is not relabelled
as a dated unit return or a contemporary estimate under 0125.

## 1. Vogdes at Fort Pickens

**The landing is attested, its exact company strength is not recovered.** Adams's
14 April report says the troops under Vogdes and the squadron's marines landed
on the night of 12 April. The assisting officers and seamen returned to their
ships; the marines remained. It gives no company headcount. Vogdes's 13 April
letter says some men were accidentally left and sent back with the quartermaster,
without saying how many. These distinctions prevent a combined naval landing
party, or a planned complement, becoming a company receipt.
**ORN I-IV pp.115-116** ([115](https://archive.org/details/officialrecordso0004hahe/page/n144/mode/1up),
[116](https://archive.org/details/officialrecordso0004hahe/page/n145/mode/1up)).
The army printing and Slemmer's account independently place the landing on the
12th, again without the requested count: **OR I-I pp.376,389**
([376](https://archive.org/details/cu31924077725913/page/n395/mode/1up),
[389](https://archive.org/details/cu31924077725913/page/n408/mode/1up)).

**A new contemporary estimate is available at its later scope.** Meigs's report,
dated Havana, **25 April 1861**, introduces an approximate estimate of the forces
on and about Santa Rosa Island. Its table gives **Captain Vogdes's company 80**,
with marines and ordinary seamen separately listed. The rendered printed table
was checked: it says 80, not 90. The underlying observation day is not specified
by that table. It is therefore an estimate reported on 25 April, not a return of
the men who landed on 12 April. It cannot be carried backward in date or combined
with the separately counted marines. **OR I-I pp.393,398-399**
([report date](https://archive.org/details/cu31924077725913/page/n412/mode/1up),
[estimate introduction](https://archive.org/details/cu31924077725913/page/n417/mode/1up),
[table](https://archive.org/details/cu31924077725913/page/n418/mode/1up)).

The January orders still do not supply the landing count: their attached
privates and the referenced, unprinted command return are different evidence.
**OR I-I pp.352-353** ([352](https://archive.org/details/cu31924077725913/page/n371/mode/1up),
[353](https://archive.org/details/cu31924077725913/page/n372/mode/1up)).
The additional naval readings were ORN I-IV pp.80,90,109-111,115-118, including
Vogdes's requests, the April instructions, Adams's report and subsequent letters.
The familiar 86 was also located in the later Welles narrative reprinted by USF;
no read contemporary return behind that number was recovered. It remains a
discovery lead, not the requested return. See `searches.csv` for that distinction.

**Proposed treatment [interpretation]:** keep the landing quantity unknown. Route
the 80-man contemporary estimate for review only at its actual later scope/date;
do not replace the opening or landing number. The January original return,
company muster roll and a ship's dated disembarkation list remain recovery targets.

## 2. The fifteen North Carolina lots

**There are fifteen model lots to reconcile, not fifteen recovered historical
regiment identities.** The S121 inventory names ten State-transfer ordinals,
three residual volunteer ordinals and two additional ordinals. It supplies no
historical regiment or company membership for any of them. That is a model-input
finding, from the read S121 CSV, not an inference about North Carolina's actual
order of battle. Each identifier and battle reference is carried into
`north-carolina-lots.csv`; none has been assigned a number by its ordinal.

The new North Carolina sources give useful candidates and several reasons why
that assignment would be unsafe:

- **The State-authorized roster is cumulative.** Its compiler explains his use
  of the wartime Roll of Honor and later returns, missing names and incomplete
  casualty records. The Sixth's field-and-staff list contains successive
  appointments, and Company A's list mixes 1861 and 1862 enlistments. Counting
  printed names would not produce a simultaneous original muster or a July
  field return. **Moore, Roster of North Carolina Troops I (1882), preface
  iii-vi, pp.197-199**
  ([preface](https://archive.org/details/rosternorthcaro00moorgoog/page/n9/mode/1up),
  [staff](https://archive.org/details/rosternorthcaro00moorgoog/page/n228/mode/1up),
  [Company A](https://archive.org/details/rosternorthcaro00moorgoog/page/n229/mode/1up)).
- **Third Volunteers / later Thirteenth:** Williams reports ten named companies
  and **1,050 men** at the formation associated with the **16 May** election.
  This is a retrospective formation-strength statement, not a newly recovered
  original return. **Clark I pp.653-654**
  ([653](https://archive.org/details/cu31924092908536/page/n734/mode/1up),
  [654](https://archive.org/details/cu31924092908536/page/n735/mode/1up)).
- **Fifth Volunteers / later Fifteenth:** Kearney reports **about 1,100 officers
  and men** when ordered to Virginia late in June, arriving at Yorktown about
  1 July. He explicitly says the company enlisted totals include recruits during
  the entire war. Those two kinds of number cannot be substituted for one
  another. **Clark I pp.733,736**
  ([733](https://archive.org/details/cu31924092908536/page/n818/mode/1up),
  [736](https://archive.org/details/cu31924092908536/page/n821/mode/1up)).
- **Sixth:** Ray identifies the organization, companies and movement, but his
  perhaps 2,000 is from first to last during the war. His departure narrative's
  round thousand is not an original dated return. The historical company and
  route information can help an identity search; neither number closes an
  unreturned model lot. **Clark I pp.295-298**
  ([295](https://archive.org/details/cu31924092908536/page/n346/mode/1up),
  [296](https://archive.org/details/cu31924092908536/page/n347/mode/1up),
  [298](https://archive.org/details/cu31924092908536/page/n349/mode/1up)).
- **Names and dates matter:** the Fifth State Troops is expressly distinguished
  from the Fifth Volunteers/later Fifteenth, and the Twelfth's history explains
  its former Second Volunteers number. The Seventh organized in August, and the
  Eighth in August-September; the former's May date is a rank date. They cannot
  become July combatants by copying model ordinals 7 and 8. **Clark I pp.281-282,
  361,387,605**
  ([Fifth](https://archive.org/details/cu31924092908536/page/n328/mode/1up),
  [Seventh](https://archive.org/details/cu31924092908536/page/n416/mode/1up),
  [Eighth](https://archive.org/details/cu31924092908536/page/n444/mode/1up),
  [Twelfth](https://archive.org/details/cu31924092908536/page/n682/mode/1up)).
  Clark's Eleventh chapter describes a **31 March 1862** reorganization of the
  Bethel Regiment, while his Twenty-first chapter identifies Kirkland and gives
  a July 1861 Manassas arrival. The read pages do not establish a mapping of
  either to an S121 ordinal. **Clark I p.583; II pp.129-130**
  ([Eleventh](https://archive.org/details/cu31924092908536/page/n654/mode/1up),
  [Kirkland](https://archive.org/details/cu31924092908544/page/n162/mode/1up)).

**Proposed treatment [interpretation]:** all fifteen stay unknown. First recover
the governor's designations and acceptance/receipt lists naming each lot's
companies; reconcile old/new regiment numbers and the separately raised April
call; then use the matching original muster or dated prebattle return. This
packet supplies historical leads, not fifteen invented identities or a division
of a State total. Selected roster and history sections were read; no complete
national or fifteen-regiment name transcription is claimed.

## 3. Thomas O. Moore and the common Confederate cause

**Proposed starting cell: unknown.** New eligible personal papers were read, but
none recovered here expresses the distinct common-polity commitment required
by 0122. This is not a negative cell and does not deny his support for secession,
slavery or aid to another Southern state.

1. His **19 November 1860 proclamation**, printed in the *Daily Advocate* on
   **27 November, p.1**, attacks the antislavery party, defends Southern
   institutions, mentions sister States' security, and calls an extraordinary
   session to deliberate Louisiana's course. That is his own preboundary text;
   its security/cooperation language does not expressly undertake a common
   Confederate polity. The clipping was read from a headless local render.
   [Newspaper clipping](https://lasc.libguides.com/ld.php?content_id=69499759).
2. His **23 January letter to Sherman** regrets the loss of his services and
   directs the transfer of arms, munitions and funds to Professor Smith. The
   letter is printed verbatim, and dated by the letter; Sherman's surrounding
   retrospective commentary supplies no value. **Sherman, Recollections of
   California, 1846-1861, p.140**, in the 1945 printing/transcription
   ([letter](https://tile.loc.gov/storage-services/service/gdc/calbk/085.pdf#page=130)).
3. His **24 January cover** sends the annual message to the convention, saying
   it is the only communication he is then prepared to make. The reprinted
   22 January message is inherited context, not a second independent leg.
   The convention's approval and his presence at the secession announcement
   are state acts/attendance, not a personal subscription to a common charter.
   **Louisiana Convention Journal pp.13-14,18-20**
   ([cover](https://archive.org/details/officialjournal00loui/page/n18/mode/1up),
   [proceedings](https://archive.org/details/officialjournal00loui/page/n23/mode/1up)).
   The delegate **John Moore**, listed for St. Martin on **p.4**, is a different
   person; his motions and subscription must not be assigned to the governor
   ([delegate list](https://archive.org/details/officialjournal00loui/page/n9/mode/1up)).
4. His **25 February letter to James H. Rogers** approves Texas's defensive
   preparations and expresses his desire to aid them. After news of Twiggs's
   withdrawal, he orders 1,000 muskets, conditionally offering more if needed.
   **That is a real new eligible personal letter**, but the stated object is
   Texas's defence. The common-destiny and shared-banner statements immediately
   above it belong to **Rogers's 23 February letter**, not Moore's. The original
   printed page was checked visually to confirm the column/document boundary.
   **Sprague, The Treachery in Texas (1862), documentary pp.132-133**, reproducing
   the contemporary correspondence
   ([133](https://tile.loc.gov/storage-services/public/gdcmassbookdig/texastreason00spra/texastreason00spra.pdf#page=27)).
5. The convention also prints Moore's **7 March** and **13 March** letters:
   administrative communication about the provisional forces act, and a
   forwarding letter about the Choctaw council's resolutions and future
   relations of Native nations with the Confederacy. Both are **after the
   starting-value boundary**. Neither is read backward. **Convention Journal
   pp.64,70** ([64](https://archive.org/details/officialjournal00loui/page/n69/mode/1up),
   [70](https://archive.org/details/officialjournal00loui/page/n75/mode/1up)).

The declaration-level reading is an interpretation for the lead's review:
security for Southern states and aid to Texas are not automatically a personal
commitment to the common Confederate government. Accepting either as sufficient
would require the lead to explain that reading under 0122. No C11 answer or
score was used to choose the cell. The full Sacher article remained inaccessible
behind JSTOR's access page; its title and modern characterization provide no
contemporary leg. No complete Moore letterbook search is claimed.

## 4. Preston's original seven companies

**No original seven-company roll or quantified receiving return was recovered.**
The May 10 instruction describes Preston's battalion as seven companies and
provides for later expansion. Bonham's May 25 report says seven companies of
Preston's command had gone to Harpers Ferry. Its 600 infantry remaining at
Manassas is a different scope. **OR I-II pp.826,879,42**
([instruction](https://archive.org/details/cu31924077730186/page/n845/mode/1up),
[order](https://archive.org/details/cu31924077730186/page/n898/mode/1up),
[movement report](https://archive.org/details/cu31924077730186/page/n61/mode/1up)).

**New inspection evidence is at command scope.** Deas's May 21 letter reports
7,700 at Harpers Ferry and its outposts, with 7,000 available, and says he
inspected the Third and Fourth Virginia on May 19. The May 23 report instead
gives about 8,000, of whom about 7,300 could go into combat well armed. The
earlier regimental numbering and exact original seven-company membership are
not reconciled in these reports. Neither is a receipt naming those seven or a
number to divide among regiments. **OR I-II pp.861-862,867-870**
([May 21](https://archive.org/details/cu31924077730186/page/n880/mode/1up),
[May 23](https://archive.org/details/cu31924077730186/page/n886/mode/1up)).

**A Fourth Virginia roll was actually recovered and read.** Apperson's roll of
Company D, the Smyth Blues, lists names from the orderly sergeant's book and
subsequent casualties, promotions and careers. His covering letter is dated
1902; the printing identifies the *Times-Dispatch*, 4 June 1905. It contains no
single 1861 muster-date boundary or Harpers Ferry receipt. A name count would
therefore be a retrospective company list, not Preston's original seven-company
strength. **Southern Historical Society Papers 34 (1906), pp.359-362**
([359](https://archive.org/details/southernhistoric34sout/page/n372/mode/1up)).

The Fourth Virginia under James F. Preston is independently named in Jackson's
23 July battle report; the referenced regimental reports are marked not found
by the editors. That supports the regimental identity, not equality between the
later regiment and the original seven-company lot. **OR I-II pp.481-482**
([481](https://archive.org/details/cu31924077730186/page/n500/mode/1up),
[482](https://archive.org/details/cu31924077730186/page/n501/mode/1up)).

The Virginia Tech Newlee finding aid and Library of Virginia Accession 27684
finding aids were also read. They are archival leads, not read original muster
images or troop receipts. Their unpaginated catalog locators and the modern
Fourth Virginia chronology are logged as discovery only in `searches.csv`.
**Proposed treatment [interpretation]:** retain unknown until the original seven
companies, their movement and receiving membership reconcile with the Harpers
Ferry pool. Reject cumulative company names, another Preston's regiment, brigade
averages and division of a command estimate.

## Verification and routing

Sources, raw inventories, image checks and runtime diagnostics were settled
before closeout prose. The focused packet audit passed **2,699/2,699**, including
all **1,752 baseline tracked files** byte-exact, 71 extract/source hashes,
reference resolution, all 15 North Carolina identifiers and the explicit holds.
All four `@mandate` workspace aliases resolve within this worktree.
`npm run check:boundary` exited 0; opening/rules tests passed **14/14**, exit 0.
These checks do not stand in for the ordinary commit hook. Its actual exit,
commit and final preservation receipts will be in `runs/s125/` and the sole
fresh-read Python CODEX append. No simulation, package, calibration or repeated
whole-branch review was run. Existing unmet acceptance criteria stay unmet.

For the lead:

1. Review the later Vogdes 80-man estimate at its stated scope and report date.
   Reject backdating it to 12 April or restoring 90 from a legal complement.
2. Retain all fifteen North Carolina strength holds, Preston's original-lot
   hold and Moore's unknown value on this evidence. Route the named identity,
   original muster, disembarkation and receipt records for archival recovery.
3. Apply any later accepted evidence in its owning build lane, with the ordinary
   date/membership checks and measurement; this research makes no such changes.

## Findings outside my scope

The North Carolina identity gap is distinct from missing numerical returns;
mapping model ordinals requires the pack owner's reconciliation. The later
Vogdes estimate needs an explicit date/scope decision before use. Original
manuscript and restricted-roll recovery, Moore's complete correspondence,
S123/S124 implementation and measurements, formal independent and sensitive-history
reviews/signatures, integration, release and pushing retain their owners.

Findings outside my scope
