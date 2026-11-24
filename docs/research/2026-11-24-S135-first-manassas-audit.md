# S135: the armies at First Manassas

For the lead: 3 items. **Research only, S135 only.** Worktree
`C:/Pyrrhic/sprint-research-military`, branch `sprint/research-military`, base
`c1e535983c84c455ee19e551d035b504dd1bffca`. No pack, production code, accepted
decision, criterion, band, source hold or signature changes.

**The first numerical problem is who reaches the field, not an unsupported
regiment scalar.** McDowell's first model side contains 27 generated rule lots
without named historical counterparts (23,382 men), 18 named lots outside his
July 21 roster (15,588), and 24 roster counterparts (20,784). Beauregard's
6,490 comprises six generated lots (6,000) and Garland's dated return (490).
The unknown North Carolina men enter later. Recovering those returns alone
cannot repair the composition or explain the initial side. These are measured
model quantities, not historical returns or a proposed subtraction from State.

## Evidence boundary and reproduction

**[M]** means inspected model evidence; **[H]** a historical source read with
printed page; **[I]** a comparison, arithmetic or proposed remedy. Unknown men
are blank, never zero. Historical names attached to generated recruitment lots
do not turn their rule quantities into returns (0125).

The S134 second commit was not present when the input snapshot was frozen.
This audit therefore uses the lead's expressly permitted **committed merge
fallback**, `2a5e62d1aa30e30723ad3654aee134318898aa63`, and its committed
`docs/audit/s134-evidence/merge/` packet. It does **not** claim to have inspected
the uncommitted 0130 capture. No July working file was read. The input receipt
lists 503 files obtained with `git show <commit>:<path>` into this worktree's
ignored `runs/s135/committed/` snapshot; local workspace-package links resolve
to that snapshot's packages.

The committed packet names battle participants but references, rather than
commits, the raw daily force files. A two-day selector/startup check preceded
**one** unchanged 148-day headless reconstruction. The stock runner's final
hash equals S134's committed hash:
`b3054fd0f6beabf08792de5213a92320678c0beeb750cbc00fbd1d4ee447886e`.
World and initial hashes, 275 log entries, 68 decision points and zero
rejections also agree. **All saved battles equal the committed battle packet.**
This recovers evidence; it is not another calibration, sweep, timing,
save/resume or acceptance campaign. See [proof](S135/reconstruction-proof.json),
[inputs](S135/input-receipts.json) and [read-only observer](S135/audit-observer.txt).
Raw daily states, startup logs and checks remain in `runs/s135/`.

The model's day 140 is **July 23**, and day 146 is **July 29**: its day zero is
March 5. July 21 is the historical comparison date, not a claim that the model
battle happened that day. End-of-day location and battle attendance are
separate columns, because a defender can fight and retreat within one day.

## 1. Every model block and lot, days 140-146

[Model blocks](S135/model-blocks.csv) lists all **42** blocks physically at
Manassas at an observed day boundary or named in its battle record during the
window. [Daily lots](S135/model-lots-daily.csv) supplies **576 rows for 99
distinct lots**: every day/block/lot, strength kind, men, raising post and
person, call/act, service dates, first observed origin, arrival day, assignment,
block commander, battle commander and end-of-day position. A lot has its block's
commander, not an invented regimental commander (0108). Arrival means model
physical/battle observation, not historical arrival. Empty men remain unknown;
an empty commander means the inspected post has no holder.

Battle-entry men use the previous day's lot values. Every side sum and every
block's before/after balance against its recorded killed, wounded, missing and
captured men reconciles; the table also preserves the actual end-of-day men.
The scope is saved daily positions and recorded contacts, not unrecorded
within-day transit. Model source strings are reproduced as provenance, not a
new historical certification of every citation embedded in the pack.

| Model battle day | Union men present | Confederate known men present | Confederate unknown blocks | Recorded result |
|---|---:|---:|---:|---|
| 140 | 59,754 | 6,490 | 0 | Confederates routed |
| 141 | 58,811 | 3,780 | 3 | Confederates routed |
| 142 | 58,193 | 3,915 | 3 | Confederates routed |
| 143 | 57,645 | 3,866 | 3 | Confederates routed |
| 144 | no battle record | no battle record | not applicable | Union physical presence retained |
| 145 | no battle record | no battle record | not applicable | Union physical presence retained |
| 146 | 57,159 | 2,727 | 3 | Confederates routed |

The three unknown blocks contain **15 North Carolina lots**, not three known
regiments. Their missing men cannot be inferred from their ordinal identities,
from a call or from a command aggregate. [Battle days](S135/battle-days.csv)
preserves actual commanders and block IDs. [Lot differences](S135/model-lot-differences.csv)
gives a cause, remedy and owner for **all 99 lots**.

On day 140 the Union's 69 lots are all `rule`, each 866 before combat.
Garland is the sole `return`-origin lot. His source is Cocke's **May 14**
report of 490, arrived May 12, not a new July return; later modeled casualties
remain model changes (**OR I-II p.841**). The other Confederate 6,000 are two
explicit 3,000-man reserve-call outputs: each splits into 780, 780 and 1,440.
They are not six historical regimental returns. Under 0127 a call asking for
men retains that request; its last lot exceeding 780 does not itself authorize
reducing the accepted quota.

## 2. What the historical returns and reports establish

[Historical units and crosswalk](S135/historical-unit-crosswalk.csv) preserves
**152 observations**: McDowell's July 21 roster (68 component observations),
Beauregard's retrospective July 21 roster (37), Johnston's July 21 engaged list
(20), Holmes's report (4), and **23 explicitly context-only June 30 observations**.
Components, repeated dates and different scopes are not additive regiments.
Each row gives brigade, commander, page, model identity/whereabouts, service
expiry where observed, limitation and remedy owner.

[Strength observations](S135/historical-strengths.csv) contains **61 rows**, with
date, report date, measure and scope. Nine Union brigade cells explicitly say
no usable same-date personnel figure was recovered in the passages read.
Nothing is divided out of an army or divisional total to fill them.

### McDowell

[H] The July 16-17 departmental return reports **1,707 officers and 35,614 men
present for duty: 37,321 people**, including reserves and attachments. Its
division figures, officers plus men, are Tyler **12,795**, Hunter **2,485**,
Heintzelman **9,062**, Runyon **5,448**, and Miles **6,173**. The remainder is
separately returned staff and attachments. The source warns that Tyler's
other present columns omit a brigade; Hunter's return must not be read as the
strength of every component in the later battle roster. **OR I-II p.309.**

[H] The July 21 roster names Keyes, Schenck, Sherman and Richardson under Tyler;
Porter and Burnside under Hunter; Franklin, Willcox and Howard under
Heintzelman; Runyon's reserve; and Blenker and Davies under Miles. It separately
lists batteries, regular infantry/cavalry company components and Marines.
Fourth Michigan is marked not engaged; Blenker is at Centreville, outside the
battle proper. **OR I-II pp.314-315.**

[H] Two usable brigade reports were read: Keyes's July 25 report estimates
**about 2,500** on July 21 and expressly says exact morning returns were
impossible; it reports Second Maine's **640** going into action. Porter's July
25 report gives **3,700** for his mixed brigade, including regulars, Marines,
cavalry and artillery. These figures overlap their parent commands and are
not extra troops. **OR I-II pp.353,355,383.**

[H] McDowell's August 4 account says **about 18,000 of all arms crossed Bull
Run**, with Miles, Richardson and Schenck outside the main action. His account
also describes reserve/rear-guard employment and the retreat. His July 21
dispatch already reports the reversal after enemy reinforcement. Thus a whole
department, a regional presence and main-action engagement are different
populations. **OR I-II pp.316-317,321,324.** The Confederate compilation's
54,140 Union figure is an enemy attribution, not adopted as a Union return
(**OR I-II p.569**).

### Beauregard

[H] The First Corps return for **July 21**, made **September 25**, gives these
infantry officers-plus-men totals; its separately listed general/staff officers
are retained separately in the CSV:

| Brigade | Infantry officers and men | Separately listed staff |
|---|---:|---:|
| Bonham | 4,281 | 4 |
| Ewell | 2,440 | 4 |
| D. R. Jones | 2,117 | 4 |
| Longstreet | 2,524 | 4 |
| Cocke | 3,273 | 3 |
| Early | 2,617 | 3 |

The same return lists unbrigaded infantry, cavalry and artillery separately.
Its printed aggregate is **21,863**: infantry 19,569, cavalry 1,468, artillery
826. The 22 general/staff officers are tabulated separately and are not added
to that printed aggregate here. Its separate **engaged** return prints **9,977**
and itself qualifies the cavalry actually engaged. Neither return is added to
the other. **OR I-II pp.469-470,568**, checked against the page image.

[H] Beauregard's report, headed August 26 [October 14] and transmitted October
14, instead says the morning effective force,
including Camp Pickens, did not exceed **21,833**. The thirty-person difference
from the printed return remains unreconciled. His Jackson and Bee/Bartow
figures below describe supporting groups, not additional First Corps brigades.
Evans's temporary bridge group overlaps permanent brigade membership. Hampton's
own July 29 report gives **600 infantry arriving on July 21**, while the full
return gives 654 officers and men for the Legion; these scopes are retained,
not normalized into one new number. **OR I-II pp.484,486-487,566,568.**

### Johnston and the junction

[H] The **June 30** return gives 10,654 present for duty, including 32 general
staff, 10,010 infantry, 334 cavalry and 278 artillery. Its four brigade totals
(infantry plus artillery) are Jackson **2,256**, Bartow **2,608**, Bee **2,872**
and Elzey **2,311**; Cummings's 241 infantry and Stuart's cavalry are separate.
This is a June return, not the men joining on July 20-21. **OR I-II pp.187,470.**

[H] Johnston's October 14 report places his arrival about noon **July 20**,
preceded by Jackson's five Virginia regiments and Seventh/Eighth Georgia, and
accompanied by Bee with Fourth Alabama, Second Mississippi and **two companies**
of Eleventh Mississippi. The infantry used the railway from Piedmont; cavalry
and artillery were ordered to continue by road. His report and the printed
July 17 telegram establish a discretionary junction instruction, not a calendar
arrival. **OR I-II pp.470,473,478.**

[H] The reports give Jackson's five-regiment brigade **2,611**, and the arrived
Bee/Bartow infantry group **2,732 bayonets**. Beauregard estimates about **6,000**
of Johnston's army ready when the battle began and reports **8,334 engaged**
after later Smith/Elzey and Fisher reinforcements; Hill's 550 are separately
described as reserve. Johnston describes Smith arriving with three Elzey
regiments about **3 p.m. July 21** and Fisher entering later in the battle.
**OR I-II pp.476,486-487.**

[H] Rhett's **August 23** list names the regiments actually engaged, including
Sixth North Carolina and Elzey's Tenth Virginia, Third Tennessee and Maryland
regiment, but explicitly cannot furnish regimental strengths. Therefore neither
8,334 nor Jackson's 2,611 closes an individual model lot. [Arrival observations](S135/johnston-historical-arrivals.csv)
keep those qualifications for all twenty engaged-list components.
**OR I-II p.569.** Preston's original seven companies had already left
Manassas for Harpers Ferry on May 25; Fourth Virginia later belongs with
Jackson. That does not prove exact equality of the old component and the later
whole regiment. **OR I-II pp.42,470,481,486.**

[H] Holmes's July 26 report names **Second Tennessee, First Arkansas and
Walker's battery**, describes his support movement, and says his brigade did
not participate in the infantry fight before the retreat; artillery and cavalry
then pursued. Beauregard gives about **1,265 bayonets**, a cavalry company about
90, and six guns, without battery personnel. These are not an additional
Tennessee State army or a crew count inferred from guns. **OR I-II pp.487,565-566.**

[I] For the main action, McDowell's approximate 18,000 crossing and the printed
9,977 First Corps engaged plus reported 8,334 Shenandoah engaged (18,311) support
the lead's near-parity observation at those qualified scopes, unlike the model's
roughly nine-to-one initial numerical sides. They are not a new simultaneous
all-arm return. Both McDowell's dispatch and Johnston's account support the
Confederate victory after reinforcement (**OR I-II pp.316,476**). No battle
coefficient or predetermined victory is inferred.

## 3. Ranked causes and owners: remedies only

[Causes and remedies](S135/causes-and-remedies.csv) ranks **known affected model
men**, not invented missing historical men. The ranking mixes directions and
overlapping mechanisms; **do not add its rows into a correction target**.
The complete historical-observation and model-lot crosswalks carry the individual
cases, including all unknown/unmapped components.

1. **23,382 Union rule men in 27 generated field lots.** No named historical
   counterpart is established for them. Audit the call fulfilments, quantity
   origins and destination requests. Owners: recruitment, concentration and
   identity-data lanes. Generated does not prove there were no historical men;
   naming an additional historical army on top would duplicate the abstraction.
2. **15,588 Union rule men in 18 named units outside McDowell's July 21 roster.**
   [Every placement difference](S135/unit-placement-differences.csv) has a source.
   Fourth Connecticut belongs in Patterson's June 20 organisation; Nineteenth
   and Twenty-eighth New York in his July 10 Eighth Brigade (**OR I-LI.1
   pp.406,416**). Other read histories supply Washington destinations, duty or
   later attachments, not permission to backdate them: **Dyer pp.1248,1251,
   1411,1413-1419,1437**. Remedy: supported receiving scope and real transfer
   orders, not a July 21 force cap. Owners: concentration and historical data.
3. **11,460 active Confederate rule men assigned to Manassas but outside it at
   end day 140**, excluding the already-routed first side. Later arrival,
   incomplete journeys and allocation explain this model count; it is not a
   historical brigade return. [Dispositions](S135/confederate-dispositions.csv)
   preserve regions and joining records. Owners: concentration and movement.
4. **10,920 removed Union rule men:** fourteen historical-roster identities,
   last seen at 780 each on day 135, expire on day 136. Recover and reconcile
   their actual muster/service and catalogue-call chain; do not extend a term
   just to retain troops for this battle. The historical expiry issue itself
   was real, but McDowell identifies particular departures, not these fourteen
   simultaneous model discharges (**OR I-II pp.314-315,325**). Owner: call-term
   and catalogue data, then recruitment if a mechanism defect is established.
5. **9,526 Union rule men with Runyon/Miles roster names fight in the regional
   contact:** eleven lots, a subset of the 20,784 roster counterparts. History
   distinguishes reserves, demonstrations, the crossing and the rear guard
   (**OR I-II pp.315,321,324**). Remedy: actual commander task and commitment,
   not calendar exclusions. Owners: operations and concentration.
6. **6,000 Confederate rule men in the initial six generated lots.** Audit
   identity, receiving scope and explicit-man call authority. The legal minimum
   rule is not a return and is not evidence that a particular requested total
   should be cut. Owners: call data/concentration; regiment-rule owner only for
   a newly sourced legal correction.
7. **5,340 known Johnston men fail to join:** Turney's 780 plus two Georgia rule
   batches of 3,000 and 1,560. Their actual day-146 fight is at Harpers Ferry
   against Patterson's 1,732, not at Manassas. The unknown Virginia aggregate is
   separately at Lynchburg. [Johnston's trajectory](S135/johnston-trajectory.json)
   retains Lee's earlier Lynchburg goal and the Manassas relief goal received
   on day 141. Remedy: received relief trigger, authority, actual route/junction
   and interception, compared with the historical July 17-21 chain (**OR I-II
   pp.473,476,478**). Owners: command and junction mechanisms; no scripted arrival.
8. **1,646 Union rule men elsewhere:** Second Wisconsin's 866 and First
   Minnesota's 780 exist but are at lower_valley and Washington on day 140. Trace their real
   sending/receiving commands; do not clone their historical roster entries.
   Owner: concentration. Historical membership: **OR I-II pp.314-315**.

**Unranked because men are unknown:** the fifteen North Carolina historical
lots, Virginia's unidentified pool and unmapped Confederate brigade components.
North Carolina's ordinance transfers formed bodies and distinguishes terms;
it is not a constituent personnel return (**OR IV-I pp.402-404**). Recover
dated rolls, identities and actual receiving receipts before any closure.
Do not split 21,863 or 10,654 among them. Garland's 490 cannot become an
unallocated Virginia balance. Owners: military return/identity research, with
concentration responsible for the journey of an existing block.

Holmes also remains a distinct concentration/identity problem: Bate's model
780 are at Lynchburg, not in a Manassas reinforcement. The Fagan/Flournoy naming
hold established in [S118](2026-11-23-S118-tennessee-holmes-preston.md) remains
open; no independent Fagan 900 is added beside a generated April-call lot.
The historical brigade estimate is not divided to manufacture the absent unit.

## 4. Proposed routing and verification

**Recommend concentration and junction audit/remedies before any battle tuning.**
In parallel recover the actual fighting North Carolina lots and reconcile
Virginia/Preston identity. A separate data review should address the fourteen
expired roster names and catalogue-call compatibility. These are recommendations,
not authorisation to implement another sprint here.

The legal **866** minimum is visible in GO 15, **OR III-I p.152**, checked on
the original cached page image against OCR's erroneous 806. This audit provides
no source basis to change it. Under 0108, 0110, 0125, 0127 and 0130: no clones,
default unknown strengths, distributed command balances, fitted men, weights,
quotas, dates, bands or prescribed outcomes. Observer estimates cannot supply
the truth of historical lots. No unknown-strength or other inherited criterion
is waived or newly passed.

[Reading receipts](S135/source-reading.json) retain 51 numbered-page/selected
opening excerpts, hashes, original locators and actual headless image
inspections. OR papers are later official printings of dated reports; Dyer is
a retrospective compilation used for identity/place, not personnel. No whole
book reading is claimed. S118, S120 and S121 are reused as research and recovery
context, not as new force returns or predictions of S134's 0130 build.

Before this result note, the packet's exhaustive checks passed **3,445**
assertions: all 503 frozen source hashes, daily block/lot coverage and kind/men/
assignment/commander values, battle sums/loss balances, historical return
arithmetic, individual difference coverage, source hashes and preservation of
every pre-existing tracked file. Root typecheck, boundary and 13 pack-rule tests
passed. The ordinary staged-tree commit hook remains the commit gate; its
actual log/exit and final inventory are retained in `runs/s135/` and reported
in the one CODEX handoff. Formal independent branch review and signatures remain
deferred under 0106/0107; requested 5.6 worker models were unavailable and no
worker model was substituted. No push or browser/desktop control.

For the lead:

1. Route the measured allocation, reserve and failed-junction causes to the
   concentration/command/operations owners; keep their overlapping amounts
   separate from a historical surplus target.
2. Route exact return, identity and service-term recovery from the CSVs; keep
   every unclosed lot and inherited unmet criterion visible.
3. Review this **committed merge fallback** audit beside S134's eventual 0130
   committed packet before authorising a build; no uncommitted July evidence
   was read and no numerical replacement army is proposed.

Remaining outside S135: implementing any remedy, finishing S134, obtaining all
missing rolls, changing battle resolution or acceptance, source-hold closure,
formal review, integration, release and pushing.

Findings outside my scope
