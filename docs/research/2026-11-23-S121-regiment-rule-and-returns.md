# S121: the regiment rule and the returns

For the lead: 3 items. **S121 only**, research on `sprint/research-military`
from `c63aac4f398b8dc6940a42b4624880f8162edcd7`. Read the lead's final S121
message and accepted 0076, 0110 and 0125 in main, together with the sprint
rules and 0106/0107. No code, pack, criterion, band, accepted-decision or
source-hold change. No new 1A clearance or signature.

**Recommend an establishment selected by side, call kind, arm and formation
size, rather than a universal 1,000.** An establishment is a recruitment rule's
basis, never an achieved return. The exact initial-muster sample recovered here
is small: one Union regiment and two companies. The tables expose the missing
side/call/arm cells instead of deriving an average from later or cumulative
strengths. No exact initial-muster distribution for Confederate regiments was
recovered in the material read.

**No new exact lot closure is claimed.** The packet gives dated command returns,
qualified estimates, transfer membership and missing records. All 16 historical
unknowns in the requested battle-attending inventory remain unknown because
no dated return with exactly reconciled lot membership was found. That is a
negative research result, not permission to pass the unknown-strength criterion.

## Evidence and delivery

**[H]** means a read historical passage with printed page; **[M]** an inspected
model or S120 artifact; **[I]** a derivation or recommended treatment. Blank
quantities mean unknown/not found, never zero. Quotas, privates, total officers
and men, present for duty, men engaged and cumulative enlistments stay distinct.

The packet contains:

| File | Coverage |
|---|---|
| [Establishments](S121/establishments.csv) | 24 legal/order observations, side/call/arm, unit size, limits and metric |
| [Muster observations](S121/muster-observations.csv) | 38 observations, including rejected substitutes for initial musters |
| [Distributions](S121/distributions.csv) | 14 explicitly scoped samples or not-found cells; no national population claim |
| [Returns](S121/returns.csv) | 15 dated transfer, command, estimate and control records with membership/limits |
| [Battle coverage](S121/battle-coverage.csv) | Every one of S120's 103 battle-attending inventory lots |
| [Historical unknowns](S121/unknown-combatants.csv) | All 16 required lots; individual result and recovery target |
| [Reading receipts](S121/source-reading.json) | 87 retained page texts, original URLs, hashes and printed locators |
| [Image inspections](S121/image-inspections.json) | 22 actual headless image inspections; scans remain outside worktrees |
| [Input receipts](S121/input-receipts.json) | Frozen S120 files and July committed inputs |

[M] S120's inventory and proposal were read from `sprint-pushback` and copied
only into this lane's ignored evidence directory. July inputs were obtained
**only with `git show a360803f7bd02dacce450fded56f6c749dab991f:<path>`**.
No S119 working file was read. The retained S120 extraction/capture proof is
reused as inventory evidence; this task runs no extraction, campaign or scorer.
Its lots are S116 observations, not predicted S119 results.

Sources are the OR's official printing of contemporary instruments/reports and
the Maine and Massachusetts adjutant-generals' reports for 1861. Later reports
of earlier events are labelled by both dates where material. Searches, an
officers-only North Carolina register and archive finding aids supplied leads,
not unit headcounts. Livermore's discussion was read to locate original records;
his inferred average is not adopted. No whole-volume reading is claimed.

Downloaded originals and rendered pages are under
`C:/Pyrrhic/mandate-research-sources/S121/`. Existing cached sources were read
only. Retained text normalizes CRLF to LF, trims trailing line whitespace and
uses one final newline; receipts keep
raw and delivery hashes without wording edits. Printed heads and images resolve
OCR errors, notably 866 rather than 806, cavalry 660 rather than 600, and the
Louisiana recapitulation's 1,231 rather than 1,331. An early I-III offset search
was rejected against its printed heads and contributes no citation. Logs and
corrections are under `runs/s121/`.

## 1. What the establishments actually authorize

### Union, April

[H] The proclamation is dated April 15. The War Department's requisition calls
for infantry or riflemen for three months, subject to muster and examination.
The schedule gives a one-regiment quota as **37 officers, 743 men, aggregate
780**. Some larger State quotas include higher staff, so dividing a State's
whole quota by its regiments need not yield 780. The printed table expressly
omits the detailed regimental composition. These are authorized quotas, not
returns of men received. **OR III-I pp.67-69** (`III1:67-69`).

### Union, May volunteers

[H] GO 15, May 4, gives ten infantry companies. A company has **64-82 privates**
and an aggregate **83-101**; the regiment's printed aggregate is **866-1,046**.
The additional ranks and regimental establishment explain why privates alone
are not the regiment's total. Massachusetts' execution instructions require
companies selected for this service to fill the federal maximum before muster,
while separately limiting an unselected volunteering militia company to 79.
This supplies a real institutional basis for a full-formation target, not proof
that every muster attained it. **OR III-I pp.151-152; Massachusetts report
pp.26,29** (`III1:151-152`, `MA:26`, `MA:29`).

[H] Volunteer cavalry has 79-95 per company and two companies per squadron.
For four, five and six squadrons the printed regimental ranges are respectively
**660-788, 818-978 and 976-1,168**. The number of squadrons therefore matters even
within one arm and call. **OR III-I pp.152-153** (`III1:152-153`).

### Union, May Regular increase

[H] GO 16 is a separate organization. New infantry has eight companies per
battalion, two or more battalions per regiment, company aggregate 82-100,
battalion 663-807, and **2,020-2,452** for the specified three-battalion regiment.
New Regular cavalry's three-battalion regiment is **997-1,189**. The artillery
battery is **80-156**, and the specified twelve-battery regiment **997-1,909**;
the order permits eight or twelve batteries. These cannot share a ten-company
volunteer infantry constant. **OR III-I pp.154-157** (`III1:154-157`).

### Confederacy, March law and April calls

[H] The March 6 public-defense act authorizes up to 100,000 volunteers for twelve
months after muster, distributed among the arms as directed. Sections 5-7
provide formation and organization; section 8 permits **64-100 privates** in a
volunteer company and an additional second lieutenant. The separate Regular
Army act of the same date gives different company establishments: infantry
90 privates; cavalry 60 plus farrier and blacksmith; artillery 70. Their listed
officers/other ranks differ. **OR IV-I pp.126-128,131** (`IV1:126-128`, `IV1:131`).

[I] Counting the Regular act's listed company ranks gives **104 infantry,
76 cavalry and 84 artillery**, not 1,000 per regiment. The law draws some
regimental appointments from existing ranks; blindly adding them again would
duplicate personnel. Cooper's June 3 explanatory volunteer organization lists
four company officers, four sergeants, four corporals, two musicians and 64-100
privates: **78-114 per infantry company**, with regimental appointments separately
listed. These are component arithmetic and legal limits, not achieved returns.
**OR IV-I pp.127-128,131,367** (`IV1:127-128`, `IV1:131`, `IV1:367`).

[H] The April 22 calls are not a single numerical establishment. The detailed
Kentucky letter, also sent with changes to Arkansas, North Carolina and
Tennessee, says ten companies of at least **64 men each** and lists officers;
the statute says **privates**. Both wordings are retained. Other letters refer
to the public-defense law or familiar regulations. The calls ask Alabama for
two regiments, Georgia two, Louisiana one (a second if ready), Mississippi two,
Arkansas one, North Carolina one and Tennessee three. None reports a 1,000-man
regiment received. **OR IV-I pp.231-233** (`IV1:231-233`).

### Muster evidence and the distribution's limits

[H] Maine explicitly identifies the First Regiment list as taken from original
muster-in rolls and dates federal service May 3; its statistical table records
**779** three-month men. The OR editorial State-furnished summary instead gives
Maine 771. This packet exposes that difference without asserting an unproved
reconciliation or changing one figure to meet a rule. **Maine report, Appendix
D p.52, Appendix F pp.2-3; OR III-I p.69** (`ME:133`, `ME:913-914`, `III1:69`).

[I] Two company-level original musters can be read from dated names, not from a
later headline total. Second Maine Company A has **75** at its May 28 original
company muster: three officers, four sergeants, four corporals and 64 privates.
A late-listed man, Holt, has an Army muster date of May 28 but the facing
remarks say he transferred from Company H on October 1: he is excluded from
Company A's initial count. Third Maine Company A has **95** on June 4: three
officers, five sergeants, eight corporals, two musicians, a wagoner and 76
privates, all with that muster date. Do not multiply either company by ten.
Maine distinguishes its first two April-origin organizations from subsequent
ones, despite their later service terms. **Maine report p.6, Appendix D
pp.62-66,122,124,126 and Appendix G p.7** (`ME:7`, `ME:143-147`, `ME:203`,
`ME:205`, `ME:207`, `ME:922`).

[H] Maine's tempting regimental table is **not** an initial-strength sample for
the three-year column: its footnote includes all men mustered through January
31, 1862. The cavalry figure 1,168 and battery figures 140-160 have the same
problem; the sixth battery's first muster is in 1862. Likewise Massachusetts'
five April-service regimental totals range 444-823 (median 685), but describe
service aggregates with replacements and attachments, not exact simultaneous
initial musters. Its battalion and battery remain separate. The seven reported
Massachusetts corps totals sum to its State total 3,736. **Maine Appendix F
pp.2-3; Massachusetts pp.13-17** (`ME:913-914`, `MA:13-17`).

[H] Early reports Fagan's regiment **900 strong at Lynchburg on May 27, already
Confederate-mustered**. That is a dated observation, not its exact first muster
date or a July State-pool return. Grivot's November 22 annual account provides
17 named Louisiana volunteer regiments' aggregate 14,949, regular infantry
1,033, regular artillery 740 and separate battalions. The editors omitted the
company detail; the report also describes formations and changes since
transfer. Those figures cannot be turned into original individual musters or a
national mean. **OR I-LI.2 p.115; OR IV-I pp.747,749-752** (`LI2:115`,
`IV1b:747`, `IV1b:749-752`).

[M/I] Accordingly `distributions.csv` reports the initial samples separately by
side, call and arm: Union April regiment n=1, April-origin long-service company
n=1, May-organization company n=1. Exact whole-unit original muster samples for
Union May regiments/Regular arms and Confederate infantry/cavalry/artillery are
**not found in the read material**. No pooled mean, quartile or side comparison
is justified. Other observations are published with their actual scope and
excluded from that initial sample. A missing sample is not evidence of no men.

### Proposed rule form [I]

Use **side + call kind + arm + organization**, including company/battalion or
squadron count and the effective establishment date. Keep a declared legal
target separate from the mechanism's generated quantity and from a historical
return. This is more specific than one number for each side.

For an explicitly full April militia regiment, 780 has the schedule's basis.
For an explicitly full May GO 15 volunteer infantry regiment, 1,046 has a legal
maximum and an execution-order basis; label it a **target**, not a typical muster.
Use the stated ranges and organization for cavalry and the new Regular arms.
For Confederate volunteer infantry, retain the sourced private/rank structure
and the actual call's wording; this packet does **not** certify a single exact
regiment scalar from the limited initial-muster sample. A later build must
declare its target/fill assumption, rather than calling 1,000 a measured mean.

Reject a universal 1,000, a single side-only constant across arms and calls,
a midpoint fitted to July, a cumulative-enlistment average, applying a legal
maximum to historical unreturned units, or replacing an already-generated
model lot with its historical namesake's strength. Under 0125 a rule-created
lot still counts and fights as the model's output. This proposal changes no
number, band or rule here.

## 2. The four State transfers

**Virginia.** The June 8 proclamation transfers Virginia-mustered volunteers by
regiments, with later formations transferred as formed/required, and the navy
separately. It is not a personnel return. Letcher's June 17 message summarizes
**upward of 40,000 volunteers**, without the dated constituent list needed to
map the model's regional aggregates. His discussion separately says the proposed
10,000-man provisional army could not be raised as planned, and the referenced
Lee report is marked not found by the editors. Do not add 10,000 to 40,000.
**OR I-II p.911; I-LI.2 pp.134-136; IV-I pp.388,390-393**.

The **June 30 Shenandoah return** is real but at a different date and scope:
10,654 present for duty, including 32 general staff, 10,010 infantry, 334 cavalry
and 278 artillery. Its named brigades and unbrigaded troops include States
besides Virginia. Jackson's infantry has 128 officers and 2,043 enlisted,
**2,171**, with artillery separate. June 30 organization names the Second,
Fourth, Fifth and Twenty-seventh Virginia in that brigade, while Cummings is
separate. This is neither a Virginia-wide transfer total nor Preston alone.
**OR I-II pp.187,470** (`R03-R04`).

**North Carolina.** Walker's June 23 letter anticipates ten war-term regiments
received after actual formation is notified; the June 27 ordinance transfers
formed units, provides for later formations and treats the twelve-month men
separately. Four regiments are already in Confederate service; another 2,000
are authorized for designation/tender, with later acceptance conditional.
No dated, complete personnel return at the transfer was found in these read
records. The title's 10,000, ten regiments, and additional 2,000 are not receipts.
Neither a numbered model lot nor an officer list identifies its companies.
**OR IV-I pp.396-397,402-404** (`R05-R06`).

**Tennessee.** Keep June 29 authorization, July 2 tender, July 5 receiving
procedure and July 31 State order distinct. The tender lists 22 infantry
regiments, two cavalry regiments, ten artillery companies and other corps,
without personnel numbers. July 5 requires rolls made at each camp/station,
verified by Confederate officers. G. Gantt, writing for the governor on July
23, calls the **whole Tennessee Army about 22,000 strong**. That is a newly
read contemporary estimate of its own scope, not the rejected arithmetic of
22,000 infantry plus 2,000 cavalry, and not a return divided by arm. On September
28 Harris still reports a considerable portion of rolls unverified. A complete
same-date transfer return was **not found**. **OR IV-I pp.411,417; I-IV
pp.362-363,371-373,379,431** (`R07-R09`).

**Arkansas.** July 15's agreement, forwarded July 17, enumerates Cleburne,
Gratiot, the Third/Fourth attached to Pearce, Cross, Lyon, Shaver, Carroll,
Borland, and the listed artillery; it does not give men. On July 27 Hardee says
**about 800 transferred**, **less than 2,300 under his command**, and **less than
5,000 projected** when this part of the State finishes transferring. His July
28 letter again distinguishes current strength from a projected about 5,000.
These are overlapping and differently qualified quantities, not additive
categories or a statewide transfer return. No complete dated return covering
all the enumerated agreement units was found. **OR I-III pp.609-610,616,618**
(`R10-R12`).

[I] Each record stays at its own scope under 0125 item 5. An estimate can only
serve an exactly matching command/aggregate with its date and limitations;
these letters do not authorize assigning a State total to a per-arm lot. The
CSV names the rolls, receipts and membership reconciliation still required.

## 3. Manassas and every requested unknown combatant

[M] Select `in_battle_record=True` from S120, then classify by **quantity origin**,
not its `generated` flag or whether a historical name was attached. The result
is **103 = 86 rule + 16 unknown + 1 return control**. The 16 are ten North
Carolina State-transfer lots, three residual volunteer lots, two additional
North Carolina lots and the original Preston aggregate. All 25 inventoried
opening rows have no battle attendance. Arkansas and Tennessee State-conversion
rows also have no battle attendance in this inventory. This is not a new audit
of the other 59 numeric opening controls outside S120's detailed inventory.

[H/I] For Preston, May 25 reports seven companies already gone to Harpers
Ferry. June 30 places the Fourth Virginia in Jackson's brigade; the July 21
account names James F. Preston's Fourth with the other four Virginia regiments
and gives **2,611 for Jackson's whole brigade**. Rhett's August 23 list names
the units actually engaged, then explicitly says he cannot furnish their
strengths. These papers support the continuation already ruled in S118, but
not exact equality between the original seven companies and the later whole
regiment. Never divide 2,171 or 2,611, borrow the six hundred left at Manassas,
or substitute R. T. Preston's Twenty-eighth. Reconcile the original lot against
the Harpers Ferry pool before any count. **OR I-II pp.42,187,470,486,569**.

[H/I] The North Carolina lots still have no historical identities or company
membership. July 21's organization identifies Fifth and Eleventh North Carolina
in different brigades, and Rhett's list includes the Sixth, but a name in a
battle list is not a mapping from the model's 15 ordinals. The First Corps
return records **21,863 full aggregate** and **9,977 engaged** separately, was
made September 25 for July 21, and includes many other States. It cannot close
these unreturned lots. **OR I-II pp.469-470,568-569**.

[H/M] Garland is the control, not a new unknown: Cocke's May 14 report records
**490** in Garland's force, arrived May 12, separately from other companies.
S120's 367 is a later model remainder, not the historical paper's original
quantity and not a second force to add. **OR I-II p.841**; S120 Garland row.

Every required lot has its own not-found verdict, candidate command records,
membership hold and next record in `unknown-combatants.csv`. There is **no
return or estimate with reconciled membership that clears any of these 16**.
The unchanged unknown-strength criterion remains non-passing; a command total
or this research packet does not waive it.

## Verification and routing

The settled packet's reference, row and preservation audit passed **2,457/2,457**
before final closeout prose; the opening test passed **9/9**. The first audit's
61 failures were solely LF normalization; raw/delivery hashes document the
correction. Four workspace aliases resolve into this worktree. Source and
delivery inventories, acquisition issues and runtime evidence were settled
before this note/handover. Fresh final audit, staged whitespace/recovery proof,
ordinary-hook exit and committed-byte proof are recorded in `runs/s121/`.
No campaign, package, timing, checkpoint measurement or repeated simulation
review is requested here. Formal whole-branch and gate review remain deferred
under 0106/0107; the hook's ordinary checks are still required.

For the lead:

1. Rule on the proposed call/arm/organization establishment form; 780 and the
   May volunteer maximum have explicit bases, while national initial-muster
   distributions and a Confederate exact scalar remain unsupported here.
2. Route the dated State estimates and command returns at their stated scope,
   with the missing membership/roll records named in `returns.csv`. Do not
   restore any State regiment-to-men conversion.
3. Route all 16 individual recovery holds before applying a strength; retain
   the 86 rule quantities under 0125 and Garland's existing source. No new 1A
   credit follows from this note.

Outside this lane: S119 merge, timing and measurement; strength-kind/scorer or
pack implementation; complete national or State muster-roll transcription;
unread originals and exact lot identity/receipt chains; full audit of the
59 inherited numeric opening controls; signature, integration, release or push.

Findings outside my scope
