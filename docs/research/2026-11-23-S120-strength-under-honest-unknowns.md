# S120: strength under honest unknowns

For the lead: 3 items. **Proposal only**, on `sprint/pushback` from `429a073f`.
No code, pack, criterion, band, accepted decision or source hold changes. S119
owns application in July. This document recommends a ruling; it does not make
one. Read the lead's S119/S120 message and accepted 0108, 0110, 0112, 0113,
0121 and 0124 from the main checkout. Sprint 0106/0107 still defer formal
whole-branch and gate review. Nothing here clears 1A or signs anything.

**Recommend a separate UNRESOLVED evidence verdict, which never passes the
milestone.** A missing return is neither a demonstrated shortfall nor evidence
that a strength lies in its band. Keep numerical failures where the read
evidence establishes them, and publish the exact unresolved population. A lot
created at `menPerRegiment` is a model quantity, not a return. A command return
may constrain a disjoint total at its own scope; it cannot silently assign men
to its unreturned regiments or cure an unknown combatant.

## 1. Baseline, method and limits

**[M]** denotes an inspected model/input/output; **[H]** a read historical
passage, with printed page; **[I]** an inference or proposed policy.

The baseline is **S116 at `a360803f7bd02dacce450fded56f6c749dab991f`**, not
S119's concurrent working tree. S116's committed
`docs/audit/s116-evidence/` was read with `git show`, including its README,
strength origins, scores and daily hashes. S118's research at
`C:/Pyrrhic/sprint-research-military` was read only: its note, model audit,
corrections and selected retained originals. No sibling files were written.

The committed S116 packet omits individual final lots. To expose those without
reading July's working files, a local `git archive` materialisation of that
commit supplied the unchanged runtime, pack and worktree-local module links.
After a two-day startup, one successful headless 148-day extraction collected
lots and battle attendance. **All 148 daily hashes and final hash match S116,
with zero rejections.** Final hash:
`6e8d3fa675359b4be87f506b6787761cfdf605093a719b1edbdb24ecac2f58dc`.
The first long invocation completed148 days but wrote its output at
`C:/Pyrrhic/extract-148.json`, then failed its wrong-directory receipt read.
Output paths and module checks were anchored to the script, and the cheap
startup repeated before the successful extraction. The final preservation
check found the stray file; exact byte equality identified it as this task's
output. It was retained inside `runs/s120/` and removed from the parent folder.
Thus **two148-day traversals** occurred, with byte-identical extraction artifacts.
The original terminal error log was overwritten; exact error text is not
retained. `runs/s120/output-path-correction.json` records the correction. No
runtime input changed. S116 replay/save-resume evidence is reused; not rerun.

The extraction is inventory, not a calibration experiment. All projections
below reclassify quantities on the **same retained final blocks and battle
attendance**. They do not predict a changed run: unknowns could change planning,
supply, losses, joins and battles. In particular, the Tennessee-only column is
not S119's result. No timing, sweep, package or done-check campaign was run.

The packet is:

| File | Purpose |
| --- | --- |
| [lot-inventory.csv](S120/lot-inventory.csv) | 309 rows: every unknown or rule/nominal lot, explicit opening inferences/estimates, and Garland's one dated-report control. Individual identity, origin, men, presence on day148, read record, page keys, actual battle attendance and precise recovery request. |
| [lot-universe.csv](S120/lot-universe.csv) | All368 observed identities, including59 other numeric opening controls. A completeness denominator, not a certification of those59 sources. |
| [origin-inventory.csv](S120/origin-inventory.csv) | Origin rollup of the309 inventory rows; initial numeric controls are separately excluded, not silently lost. |
| [criterion-readings.json](S120/criterion-readings.json) | Five fixed-record projections, literal current checkpoint verdicts, and each affected battle-day/block. |
| [capture-proof.json](S120/capture-proof.json) | Hash match, extraction limits and the one removed-block attendance recovery. |
| [source-reading.json](S120/source-reading.json), `S120/read/` | 58 read locators, URLs, original/retained SHA256 and scope. Local retained originals plus four headless university transcriptions; no new scan verification. |

The lifetime inventory includes expired militia and the actual Vogdes
detachment identity. It is **not** a sum of everyone who ever existed. The
checkpoint counts only the294 lots still present in State on day148. A blank
men field means unknown, or absence where `present_day148=false`; never a
manufactured zero. An actual recorded zero stays zero. Sumter's surrendered
block was absent after day39; its identity in that battle-day is recovered
from the same block's day38 attendance, not by recreating men.

Reading a requisition proves what was requested. Reading a catalogue roster
proves only its stated identities/organisation, not a model lot's personnel.
Generated identities remain generated. The59 omitted numeric opening controls
include inherited direct-count and report data: they were not all rechecked
against originals here. **No remainder in this note is a newly certified
all-return historical total.**

## 2. What supplies the model's numbers

**[M]** The frozen recruitment rule is `menPerRegiment=1000`.
`regimentsRaised` uses the call's requested men when supplied; otherwise it
multiplies regiments by that rule, then applies the existing execution and
loyalty calculation. `applyMusters` creates lots from the result. Naming or
organising a lot does not replace its personnel with a return. Later combat
changes those quantities; a final866 or226 does not become a historical return
because it is no longer a round1000.

| Quantity basis | Lifetime inventory lots | Present on day148 | Lots in a battle record |
| --- | ---: | ---: | ---: |
| `menPerRegiment`, named or generated | 179 | 112 | 74 |
| Explicit requested headcount, through recruitment | 61 | 61 | 12 |
| Arkansas/North Carolina State nominal conversions | 24 | 24 | 15 |
| Tennessee22,000/2,000 conversion | 2 | 2 | 0 |
| Unknown call contingents | 8 | 8 | 0 |
| Unknown State aggregates | 9 | 8 | 1 |
| Unknown opening lots | 14 | 14 | 0 |
| Explicit opening inferences/estimates/unverified numbers | 11 | 11 | 0 |
| Garland dated-report control | 1 | 1 | 1 |

These are lot identities, not regiments independently proved in history. A
single State lot can represent multiple regiments. A brigade contains several
lots. The eight unknown calls are three regular-army arms and five Confederate
cavalry supplements. The militia aggregate relieved from Harpers Ferry accounts
for the ninth lifetime unknown State lot that is absent on day148.

**[H] Call families.** Every lot has its applicable page keys in the CSV:

- The15 April proclamation and circular ask for militia and future muster;
  their quota table is not a return of the model's men. Its editorial furnished
  totals are not automatically the same population/date/lot (OR III-I
  pp.67–69). The38 New York regiments are a tender accepted on conditions,
  not38,000 men counted (p.151).
- The May volunteer allocations are quotas and instructions to muster;
  Rhode Island's one regiment and New York's additional14 remain their own
  papers (pp.203–204,207–208). Indiana's six additional regiments are to be
  received when fit to pass muster, not a6000-man return (pp.263,265).
- GO16's regular infantry/cavalry/artillery establishments are authorised
  organisation, not recruits actually obtained (pp.154,157). Their three
  unknown model lots must stay unknown.
- New York GO78 regulates the25,000-man requisition, inspection and eventual
  muster; it expressly permits incomplete companies/regiments to be consolidated
  or discharged. Morgan's1 August letter attests his25 July proclamation,
  not a25,000-man completed muster (pp.369–371,376).
- Walker's9 March call asks the States for specified men; it does not return
  the number who arrived (OR IV-I pp.134–135). His22 April calls ask for
  regiments and describe establishment and future muster (pp.231–233).
- The29 June extras,30 June reserves/cavalry and1 July extras are requests.
  The reserve's30,000 and State shares are quotas; the cavalry's company
  establishment is not an actual crew/headcount (pp.411–412,416).

**[H] State aggregates.** Tennessee's29 June resolution authorises a transfer;
Harris's2 July tender lists22 infantry regiments,2 cavalry regiments and10
artillery companies, without men. Cooper's5 July procedure requires verified
rolls at the several camps and stations (OR IV-I pp.411,417; I-IV pp.362–363).
The two nominal lots do **not** appear in S116's battle records: removing their
24,000 changes the strength checkpoint, but does not itself cure Preston's
unknown battle participation. S118's staging, receiving-command, overlap and
incomplete-roster holds remain intact.

Arkansas's15 July transfer lists seven infantry regiments, Carroll's cavalry,
Borland's battalion and named artillery, not7000+1000 returned men (OR I-III
pp.609–610). North Carolina's27 June ordinance concerns formed regiments under
an act to raise10,000, four regiments already in service, and2000 volunteers to
be designated/tendered. It does not return10,000+4000+2000 men present (OR IV-I
pp.402–404). The model's surviving3400 from that origin is downstream arithmetic,
not a newly sourced personnel return.

Virginia's Norfolk, Richmond and Peninsula entries rest on command/presence
papers, without their lot totals (OR I-II pp.771,783,833,865). Jackson's
organisation and the militia's relief likewise do not count the later
contingent (pp.784–785,787). Harper's about2400 **in all**,22 April, is an
approximate command report, not the militia's share or the later Jackson force
(pp.774–775). Keep the date and relief visible.

Preston's original seven companies had gone to Harpers Ferry by Bonham's
25 May report; its600 counts infantry remaining at Manassas. The June30 roster
names Fourth Virginia under Jackson, without a numerical return for the
original seven (OR I-II pp.42,470). Do not borrow600, a different Preston's640,
or an army average. S119 owns the identity/placement correction and
deduplication against `state-forces.va_harpers_ferry`.

Garland is a useful control: Cocke's14 May report distinguishes his490 from
the command's918 (OR I-II p.841). S116 starts that force at490 and retains367
after model combat. The367 is a model result grounded in that dated report;
it is not claimed as a historical July return, and918 is never assigned to
Garland or Preston.

**[M/H] Opening quantities.** The inventory also exposes the explicit inherited
arithmetic: Louisiana forts520; Fort Monroe377; New Mexico2225; Pacific2900;
Vogdes90, subsequently in a detachment; St Louis490 interpolated between two
dated figures; and the two unverified Washington/District600 entries. Those
descriptions come from the **frozen model's own notes**, not new historical
endorsement. Unread underlying pages remain `nothing_read`, with precise
recovery targets. In particular, they do not become dated returns by being
present in `initial.forces`.

Walker describes Charleston3000 as a probable number in a budget estimate,
not a muster return (OR I-I pp.261–262). Whiting's Morris Island2000 excludes
artillery; Kershaw is only300–500 (p.302). These dated estimates may inform
their own scope, but cannot be added to their constituents as independent
returned troops or replaced by a fitted exact midpoint. The sensitivity column
removing them is distinct from removing regiment-size conversions.

The other unknown opening lots have separate CSV rows. The read papers name
Anderson's reserve/three detached companies, the Morris Island units and the
guard steamers without exact returned personnel (OR I-I pp.36,299,302,317).
Goldthwaite's expected Fort Morgan transfer consent is expressly not reliable
information about an accomplished transfer (OR IV-I pp.192–193). Sherman counts
guns at Galveston; McCulloch counts frontier companies and names Ford's State
regiment, not their men (OR I-I pp.610–611,617–618). **Nothing read in S120**
closes the two Marine station lots or Anacostia/Michigan crews. Their pack
citations remain search leads, not citations represented as newly verified.

## 3. What the current criteria read

**[M]** The S116 scorer sums each block whose derived strength is non-null.
A block with any null lot is unknown and its whole total contributes no number.
It does not distinguish return, quota, estimate or rule provenance. The
`men_union` band is95,000..250,000 with **non-binding floor**; Confederate
100,000..200,000 has a binding floor. Those are the frozen pack's bands under
0099, not newly validated historical limits. The Confederate ceiling remains
an inference, not a proved upper bound. No band moves here.

| Fixed S116-record reading | Union counted men / unknown blocks (lots) | Literal current `men_union` | Confederate counted men / unknown blocks (lots) | Literal current `men_confederate` |
| --- | --- | --- | --- | --- |
| S116 unchanged | 121,566 /7 (7) | PASS | 90,452 /23 (23) | FAIL:9548 below floor |
| Remove Tennessee conversion only | 121,566 /7 (7) | PASS | 66,452 /25 (25) | FAIL:33,548 below floor |
| Remove **all regiment conversions**: calls at1000 plus State conversions | 38,791 /49 (99) | PASS, below advisory floor | 38,297 /42 (69) | FAIL:61,703 below floor |
| Also remove **explicit call quotas** as strength evidence | 13,791 /56 (124) | PASS, below advisory floor | 9,020 /57 (105) | FAIL:90,980 below floor |
| Also withhold inventoried **opening inferences/estimates** | 6,509 /64 (132) | PASS, below advisory floor | 3,500 /60 (108) | FAIL:96,500 below floor |

The last two rows deliberately distinguish a request **for actual numbers of
men** from a multiplication **of regiments into nominal men**. Both fail to
prove actual personnel, but they are not the same historical assertion. The
last row is a sensitivity subtotal, not certification of every retained opening
source or a new requirement imposed on the pack.

The checkpoint arithmetic reconciles as follows:

| Numeric origin basis on day148 | Union | Confederate |
| --- | ---: | ---: |
| Existing numeric opening lots | 13,791 | 8,653 |
| Garland model remainder | 0 | 367 |
| Call lots originating at `menPerRegiment` | 82,775 | 16,755 |
| Calls with explicit requested men | 25,000 | 29,277 |
| Arkansas/North Carolina conversions | 0 | 11,400 |
| Tennessee conversion | 0 | 24,000 |
| **S116 counted total** | **121,566** | **90,452** |

**[M] Unknown-strength** currently fails at
`battle:manassas:140`, day140, Confederate
`state-forces.va_manassas_preston`. S116 reads six battles/seven battle-days.
Tennessee-only removal leaves that failure unchanged. After all regiment
conversions are reclassified, the same records would list these unknown blocks:

| Battle-day | Union unknown blocks | Confederate unknown blocks |
| --- | ---: | ---: |
| Sumter38 and39, separately | 0 | 0 |
| Manassas140 | 32 | 1 |
| Manassas141 | 32 | 4 |
| Manassas142 | 32 | 5 |
| Manassas143 | 32 | 6 |
| Manassas146 | 32 | 6 |

With explicit ordered headcounts also withheld, the Confederate Manassas
sequence is3,5,6,8,8; Union stays32. The unknown-strength criterion **fails in
every column** under its current rule. JSON retains exact block IDs, and every
inventory lot says whether and where it occurs in those records. A record's
listing as present is not a claim that a source proves its historical fighting
strength; an unresolved contact still appears in that record.

## 4. Proposed treatment [I], awaiting the lead

### Separate the quantities before scoring

Publish `modelMen` with its origin, independently of evidence-backed strength.
Distinguish dated unit personnel reports, complete dated command returns,
contemporary estimates/ranges, requested quotas, legal establishments, rules,
and nothing read. Preserve source date, population (present/PFD/enrolled),
membership and overlap. Every quantity has exactly one place in any sum.

This is a proposal for later work, **not a request to substitute null for every
number now**. Historical dates cannot force men into State, and a return of
historical regiments cannot quantify a divergent model batch just because the
State/call/date resembles it (0108). A generated lot needs a supported identity
or an explicitly declared and justified model abstraction before an historical
return can be attached to it. The seeded draw, loyalty formula, establishment
or compliance result is never that source. This follows 0113's evidence
discipline without pretending 0113 itself already changes recruitment.

### Checkpoints: supported bounds, with unresolved comparisons visible

Use the existing population, date and bands until the lead rules otherwise.
For the relevant population, form evidence-supported lower and upper bounds
from **disjoint covered groups**. An unreturned group has no invented size and
no invented finite upper bound. A complete run, reconciled membership and
credible evidence for the comparison are prerequisites.

- **PASS:** evidence bounds establish compliance with every binding edge;
  a non-binding floor stays a reported diagnostic. Unknown membership or
  unbounded unreturned men cannot demonstrate a finite ceiling is satisfied.
- **FAIL:** supported bounds establish a violation, or a required model
  exposure/observation is absent, or evidence has been duplicated/fabricated.
  Known men above a binding ceiling already prove a failure. A supported
  complete upper bound below a binding floor proves a shortfall.
- **UNRESOLVED:** relevant missing returns or membership prevent a comparison.
  In particular, known subtotal below a floor plus unbounded missing troops is
  not a proven army shortfall. State the gap and recovery records; do not
  assign those missing troops precisely the gap. An unsupported possibility
  of meeting a band is never a pass.

All the tabulated strength readings remain **UNRESOLVED as evidence comparisons**
under this proposal: neither side's full population/finite ceiling is established
by the read lot evidence. The current Confederate arithmetic failures remain
the current failures. Missing returns explain an uncertainty; they do not
establish that the model would meet the floor. A future narrow band or a bound
inconsistent with a read source goes to the lead with that source, not to a fit.

For aggregation, FAIL dominates, then UNRESOLVED, then PASS. Milestone success
requires PASS on every applicable requirement. Unknowns cannot shrink a
denominator or make an unbounded subtotal pass. Nor may an empty army pass
because the Union floor is advisory: the required force/exposure population
and fought operations still have to exist and be evidenced. Missing capture
days are incomplete evidence, never a clean empty list.

### Combat: an unresolved source obligation is not cleared

Keep every lot/block in the battle attendance. Publish **UNRESOLVED strength
evidence** for any relevant unsupported combatant; retain the typed cause:
unreturned lot, missing identity, insufficient command membership, or model
rule treated as a return. This status is a **non-pass**, never cleared by
0110's unresolved contact or by a mixed known/unknown side fighting normally.
The existing binding unknown-strength criterion remains FAIL until a later
decision explicitly changes its reporting. A proposed tri-state reporter must
map UNRESOLVED to unsuccessful milestone exit.

Require at least the fought-operation exposure already demanded for both
sides, complete observation of the configured runs, and positive evidence for
every force actually admitted to a resolved numerical engagement. No battles,
no observed troops, filtered-out unknowns or omitted repeat runs cannot pass
this criterion by vacuity. A valid Sumter record cannot pay for an unsupported
Manassas force. This borrows 0112's visible non-pass gaps, not its permission
to park a different mechanism's obligation and claim strength coverage.

### A command return can cover a total without inventing regimental men

Accept a command's **actual returned total at its own scope**, conditional on
all of the following: read dated paper and measure; explicit included
membership; no overlap with other totals; mapping to the model's actually
represented force; and documented subsequent changes. The total covers the
group once. Per-lot quantities remain unknown. Never add the aggregate to its
returned constituent lots, divide its remainder equally, use it to rank
unreturned regiments, or backdate/advance it without evidence.

At a checkpoint, an exact complete aggregate could close that group's total
while preserving per-lot blanks. An estimate may supply only its justified
bound, not a fitted central value. Harper's about2400 on22 April cannot close
Jackson's July force after militia relief. Whiting's2000 excludes artillery
and has overlapping named infantry. Walker's probable3000 is not a complete
personnel return. None currently closes the July side totals here. Garland's
explicit490 is usable at its own force scope; the surrounding918 is not an
unallocated reserve of men (read pages above).

For combat, a command total alone does **not** clear independently moving or
partly committed lots. Only if a read return and proven membership cover the
exact whole force fighting together could future design consider a known
joint strength. That requires a separate ruling on representation and 0108's
derived totals; S120 neither changes the kernel nor asserts that facility
already exists. Splitting the group reopens the unknown subdivision. There is
no second saved total beside `forces`, and nothing bypasses 0121/0124's actual
received papers, assignments and transfers.

### Recovery records, not gap-fitting targets

`record_needed` names a recovery request **for each row**. They are not claims
that those records have already been found. Priority is the actually fighting
lots: the named Union regiments and Confederate call/State components in the
CSV's103 battle-linked rows (including Garland control). Obtain dated
regimental/company personnel or muster returns, with attachments and subsequent
loss/transfer records, rather than applying a July army total to every lot.

For generated April-call lots, recover the naming/fulfilment chain first.
Fagan's900 at Lynchburg on27 May is a read dated unit observation (OR I-LI.2
p.115), but S118 leaves Flournoy-to-Fagan naming unproved;900 is not July
strength and cannot be pasted into the generated Arkansas lot. Harris names
his three-regiment preparation and Turney/Bate/Maney movements without
headcounts (OR IV-I pp.272,275). Reuse origins, never add these men on top of
the existing lots.

For Tennessee, recover the verified camp/station rolls and actual receiving
receipts Cooper requires (OR I-IV p.363), keeping every S118 command and
early-service exclusion. For Arkansas, recover the enumerated units' rolls,
not a conversion of the seven-regiment list (I-III pp.609–610). For North
Carolina, recover completed State and volunteer rolls and actual transfer
receipts, deduplicating the April call (IV-I pp.402–404). For Preston, recover
the original seven-company roll, Harpers Ferry receipt and Fourth Virginia
continuation; no number from the remaining Manassas troops can close it
(I-II pp.42,470).

The two Marine stations and two unknown vessels need their **own dated station
or crew returns**. The opening inference rows need the exact garrison/department
and detachment returns the CSV names. None can be closed merely by making the
side total reach95,000 or100,000.

### Alternatives rejected

1. **Leave the criteria unchanged as the final evidence policy.** Publish their
   readings now, but they count nominal numbers as known; Confederate floor
   failure encourages filling gaps, while the advisory Union floor can pass
   an arbitrarily small subtotal. They cannot certify source completeness.
2. **Count unknowns as zero people, average people, establishment or the exact
   missing gap.** All turn ignorance into invented evidence; zero also
   reproduces the empty-field error 0110 rejects.
3. **UNRESOLVED as PASS, an allowed failure percentage, or waiver of unknown
   combatants.** These let easier populations buy coverage and admit vacuity.
   UNRESOLVED remains an unmet gate obligation.
4. **A command aggregate distributed over unreturned lots.** It invents
   subdivisions, risks duplicate men and hides different dates/populations.
5. **`menPerRegiment` as a return, even for a named regiment.** A model identity
   and a numerical rule do not prove its personnel.
6. **Remove unknown lots, suppress battles or fit the bands/traits/quotas.**
   That changes the problem instead of meeting it. No unrelated criterion is
   waived, and S119's new behaviour must be measured in its own lane.

## 5. Verification and decisions owed

The settled evidence is the committed S116 scores/origins, the148 matching
hashes, per-lot inventory and read sources. Focused checks reconcile the
checkpoint origin sums, inventory completeness, battle attendance, source keys
and retained hashes, and protect every pre-existing tracked file. The ordinary
hook is required for the commit; its actual exit/log and final preservation
receipt are recorded in `runs/s120/` and the one fresh-read main CODEX append.
No acceptance from an unrun full campaign is claimed. No ledger/changelog is
added: this project uses git history, and no behaviour/workflow is enacted.

For the lead:

1. Rule on the non-pass UNRESOLVED evidence verdict and its exact checkpoint
   bounds/exposure rules. A later implementation would explicitly amend the
   relevant 0099/0110 reporting requirements; until then every current failure
   remains binding.
2. Rule on command-return coverage **at total scope only**, with no lot
   allocation and no combat waiver. Any later joint-combat representation
   needs its own 0108 design decision.
3. Route the row-level return/identity recovery requests, prioritising actual
   battle attendance, and retain the distinction between the projections here
   and S119's eventual measured corrected run.

## Findings outside my scope

S119's merge, corrections, transfer timing and measurement; wholesale recovery
of missing rolls; a full re-audit of the59 numeric opening controls and possible
aggregate/constituent overlap; criteria/scorer/kernel/pack implementation;
changed bands, fitted strength or traits, source-hold closure or new1A credit;
other sprint lanes; formal branch/gate review, signatures, integration, release
and pushing.
