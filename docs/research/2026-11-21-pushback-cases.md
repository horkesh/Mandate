# S37: pushback, case by case

Research and implementation report, 21 November 2026. Proposed rulings, not
canon or gate approval. S37 only, `sprint/1a`, starting at `ddea338`.

The incoming-filter counter counted visits rather than holds; that is fixed
in `2d45c99`. The four floor cases do not establish a March–July holder of
that incoming military-wire role. The eight base histories contain **115
reservations and 216 slow walks**, with **no edits or send-back notes**.
Consequently S35's note/edit correction cannot remove any of these observed
responses [I]. No band, holder, trait, compliance threshold or planner weight
has been changed. The binding done check remains **Phase 0 6/6 locally,
1A 4/6**, exit 1.

## Evidence and counting

Historical statements below cite passages actually read, by printed page.
[The source inventory](_pushback/s37-sources.json) records the eight used
files, URLs, SHA-256 values and reading limits. Newly downloaded material is
outside every worktree, in `C:/Pyrrhic/mandate-research-sources/S37/`.
OCR is a transcription of the cited edition; no claim is made to reading
every page of a downloaded book. The Galaxy's page 96 was checked in its
page-structured OCR, rather than assigning a page from a search result.
Failed downloads and two rejected, wrongly identified OR volumes remain in
the retrieval logs; none supplies a fact below.

The current contractual floors are the exact cases named in
`packs/union-1861/checkpoints.json` and 0099 item 6: relay holds N3-11 and
N3-27; filter holds N3-06; trims N3-07. Appendix C of the numbers note is the
claim being audited, not a substitute for rereading its sources. Categories
below follow S37: (a) sourced data absent, (b) counter error, (c) classification
wrong, (d) mechanism missing. Each floor case has one primary category;
related evidence limits are stated separately. No proposed reclassification
changes an accepted band on this branch.

The runtime counters distinguish these acts:

| Band | Actual counting contract after S37 |
|---|---|
| Relay holds | `orders.relay_held`: one firing when a relaying holder chooses a positive extra hold. Magnitude is days; fires are acts. Ordinary journey time does not fire it. |
| Filter holds | `reports.filtered`: one firing only when the filter decision adds positive hold days. The historical key is retained. The `filtered` tick event still records every visit. |
| Trims | `reports.trimmed`: one firing for a report with at least one cut claim. Magnitude is the number of cut claims. It already counted acts correctly. |
| Reservations and slow walks | The history observer counts an addressee's **actual** response once per order/person/rung, excluding relays. It does not count only the declared response or unique people. |

Code: `packages/kernel/src/tick/orders.ts` (`relayOrder`),
`tick/deliver.ts` (`filterReport`), `telemetry.ts` (`recordFire`), and
`packages/cli/src/history-run.ts` (`observeRun`, `pushbackCount`). The run
counts both governments; 0099 discloses that its verified floors are Union
cases. The eight histories below are separate observations, not a sum to
compare with one ceiling.

## The floor cases

### N3-11, S02: the Pickens dispatch — (d), missing mechanism

**Act and source.** Welles describes Scott's request for a vessel on 11 March,
the Navy orders of 11–12 March, and Scott's difficulty sparing an officer to
carry his dispatch. Welles attributes delayed departure to the
Adjutant-General's office detailing companies for Key West and also describes
a protracted voyage. He names Craven as the selected ship's commander, but
does not name a staff official deliberately withholding the order. Vogdes's
1 April letter says he received the order the previous night; the reproduced
Townsend order is dated 12 March. Thus the documented interval is issuance
12 March to receipt 31 March, not nineteen proved days of reluctant relay
holding. Source: Gideon Welles, “Fort Pickens,” *The Galaxy* 11(1), January
1871, **pp. 95–97**, especially **p. 96** ([page OCR](https://archive.org/download/sim_galaxy_1871-01_11_1/sim_galaxy_1871-01_11_1_djvu.xml)).
This is Welles's retrospective narrative, including reproduced orders, not a
contemporary admission by the staff person responsible.

**Pack and counter.** The bureau `us_war_adjutant_general` exists, but Cooper's
holder row ends on 7 March and no successor is seated in this scenario.
Scott holds `us_general_in_chief`. The Pickens parent chain is
`us_fort_pickens → us_general_in_chief → us_secretary_war → us_president`;
the Adjutant-General's bureau is a sibling of Scott's post, not a relay in
that chain. **The ship post `us_ship_crusader` does exist**, under
`us_navy_home_squadron`, but its holder is explicitly unknown. No
dispatch-carrying route joins that post to the staff and Pickens. Further,
`pickens_reinforcement.land_company` only sets `pickens_landing_ordered`;
the flag has no reader. `pickens_refused` explicitly discloses its dated
substitute for the journey. Adding a bureau holder alone cannot reproduce
the staff work, ship departure and receipt.

The counter correctly excludes pure transport time and cannot count an order
the option never dispatches. The missing mechanism is administrative dispatch
preparation and carriage, with a sourced actor/route where one is established.
Do not manufacture a reluctant staffman's traits from the elapsed interval [I].
Proposed ruling: preserve the sourced delay, but distinguish it from a verified
compliance-based relay hold before using it as such a floor [I].

**Related (a) data proposal, not applied.** The official personnel table
names **Lorenzo Thomas from 7 March 1861**, replacing Cooper: OR **III-1,
p. 964** ([edition OCR](https://archive.org/download/warofrebellion0301rootrich/warofrebellion0301rootrich_djvu.txt)).
Thomas is already in the cast. The proposed existing-bureau holder row is in
the [floor trace](_pushback/s37-floor-traces.json). This is a sourced ordinary
bureau appointment, not the filter-office holder authorized by 0105 item 4;
it neither puts the bureau into the Pickens route nor identifies a deliberate
withholder. It is proposed for the command-data owner, not applied as a
filter-floor remedy. Reject assigning Thomas a filter role or treating the
appointment as evidence that he resisted this dispatch [I].

Welles's addressed order on **p. 95** also establishes Craven commanding
Crusader on **11 March**. Propose that dated attestation for the existing
ship post; it does not establish a 5 March opening tenure or an end date.
The current holder row explicitly holds both tenure alternatives as unknown;
Craven is not in the generated cast. Do not invent that interval or turn a
ship commander into the incoming-wire filter holder [I]. This is another
qualified data proposal, not a live-pack change under 0105's filter-office
instruction.

### N3-27, S14: Harney's relief order — (c), authorized discretion

**Act and source.** Special Orders 135, dated **16 May**, relieves Harney and
is signed by Thomas; the same page identifies Frank P. Blair Jr. as colonel
of the First Missouri Volunteers. Harney's **31 May** letter says he received
the order the previous evening and immediately relinquished command.
Sources: OR **I-3, pp. 374 and 381**
([edition OCR](https://archive.org/download/warofrebellionco03unit/warofrebellionco03unit_djvu.xml)).
The gap alone does not establish disobedient withholding by Blair.

Lincoln's **18 May** letter expressly describes the order as deliverable or
withholdable at Blair's discretion and asks him to withhold it unless urgent
necessity requires delivery. Source: Nicolay and Hay, eds., *Abraham Lincoln:
Complete Works*, **II, pp. 47–48**, letter to Colonel F. P. Blair, copy carrying
copyright 1894 and renewal 1922
([edition OCR](https://archive.org/download/abrahamlincolnco02linco/abrahamlincolnco02linco_djvu.txt)).
The source establishes authorization, not merely a later commentator's guess
about Blair's discretion. Harney also announces an intention to resume command
in his 31 May letter; that is a different recipient's interpretation, not proof
that Blair held contrary to Lincoln's instruction.

**Pack and counter.** Blair Jr. exists as `blair_francis_p`; no scenario post
seats him as this entrusted delivery agent. Montgomery Blair, seated as
Postmaster General, is a different person. Harney remains the Department of
the West's holder in the sampled history. `missouri_arsenal.back_lyon` sets
`st_louis_loyalists_enrolled`, with no reader; it does not create this relief
dispatch. The kernel's `sendVerb` sends relief letters directly, without the
order relay chain. A congressional or regimental post cannot be inserted as
an assumed intermediary merely to increase `orders.relay_held`.

Proposed reclassification: **authorized conditional delivery**, rather than
proxy resistance [I]. A future implementation needs entrusted, discretionary
delivery outside the ordinary hierarchy if it is to recreate this act. Reject
counting its fourteen-day issuance-to-receipt gap as fourteen days of resistance,
or as a reluctant holder's single hold without evidence [I]. Keep 2–6 unchanged
pending the lead's ruling.

### N3-06, S03: Seward's filed reply — (c), outward diplomatic delay

**Act and source.** Seward's State Department refusal memorandum is dated
**15 March**, with an **8 April** direction to deliver it. The covering note
says the delay was understood to have the commissioners' consent. The paper
also says Lincoln generally concurred and sanctioned declining official
intercourse. Source: Richardson, *A Compilation of the Messages and Papers
of the Confederacy*, **I (1905), pp. 85–88**, especially the postscript on
**p. 88** ([edition OCR](https://archive.org/download/compmessages01richrich/compmessages01richrich_djvu.txt)).

**Pack and counter.** Seward is seated at `us_secretary_state` on these dates;
its kind is `cabinet`, whose role is null. This is an **outgoing reply to the
commissioners**, not an incoming military wire to Lincoln. In
`confederate_commissioners`, the default `hold_and_talk` merely sets
`seward_channel_open`; it creates no held message. Reclassify the case as an
outward, negotiated diplomatic delay [I]. Treating it as a presidential
incoming-wire hold would change both addressee and route and would not establish
resistance to Lincoln's chosen policy [I]. Reject making Seward, the cabinet
kind, or a private secretary into the wire-filter holder. No 1–9 band edit.

### N3-07, S03: assurances through Campbell — (d), originator omission

**Act and source.** The passages read describe Seward's assurances through
Campbell beginning **15 March** and the further reassurance on **7 April**.
They concern what Seward said through an unofficial channel. Burlingame
describes unauthorized communication, but his note also records a competing
later assertion that Lincoln knew of the predictions and pledges. The source
does not establish an incoming report to Lincoln from which a filter removed
these claims. Source: Michael Burlingame, *Abraham Lincoln: A Life*, **II,
chapter 22, printed manuscript pp. 2349–2351 and 2392**, including note 87
([Knox manuscript](https://www.knox.edu/documents/LincolnStudies/BurlingameVol2Chap22.pdf)).
Do not upgrade the catalogue's stronger “not passed up” claim into a verified
physical wire-trimming act.

**Pack and counter.** Seward holds the State Department post, but the same
flag-only option does not delegate a continuing channel or originate the
contrasting declared and actual accounts envisioned in catalogue S03.
`filterReport` can only cut claims from an existing message on its incoming
route. `sendReport` also excludes an author's own filter post. A report never
originated is not a report trimmed in transit.

The missing mechanism is an agent choosing what to originate or disclose about
his own conduct, with received evidence of the undisclosed act. Preserve the
uncertainty about Lincoln's knowledge. Proposed ruling: keep this as a
qualified originator-nondisclosure case, separate from incoming-filter trimming
[I]. Reject generating a fictitious complete wire merely to cut it and satisfy
the 1–4 floor.

## The filter office and the two auxiliary cases

The generated pack has **no post kind declaring `role: filter`**. Its cabinet,
bureau and private-secretary kinds all have null roles. There is therefore no
held incoming-wire filter on which either filter counter can fire. This is
more precise than treating an ordinary bureau's vacant seat as the sole cause.

R92's source limit survives rereading. Hay assigns visitor/general supervision
work to Nicolay and letter/newspaper work to himself, without dating a universal
March military-wire screening appointment: Herndon and Weik, **II,
pp. 225–226** ([edition OCR](https://archive.org/download/abrahamlincolntr02hernuoft/abrahamlincolntr02hernuoft_djvu.txt)).
Bates names Strouse as first superintendent and dates his official appointment
15 May, but does not establish that he withheld Lincoln's incoming wires in
this window (**pp. 25–29**). Bates's named Eckert withholding episode is
**21 October**, at the commanding general's headquarters, under Cameron's
instructions (**pp. 93–96**): *Lincoln in the Telegraph Office* (1907)
([edition OCR](https://archive.org/stream/lincolnintelegra00bates/lincolnintelegra00bates_djvu.txt)).
Neither technical management nor later withholding supplies the missing
March–July role [I]. No holder or post is invented here.

For completeness, the filter ceiling also cites two non-floor cases:

| Case | Finding and proposed treatment |
|---|---|
| X-03, 19 April | Morgan reports to Cameron that he has received the department's instruction to wait and asks whether to countermand four regiments: OR **III-1, p. 87**, same edition above. This is an instruction about troop dispatch, not an intermediary screening a report to Lincoln [I]. Cameron holds `us_secretary_war`, with null cabinet role; no filter identity follows. Category (c), not a new holder. |
| N3-09 | Appendix C's assertion about Confederate inspection/interruption of Anderson's mail remains qualified. The source reached here is an unpaginated chronology; the underlying printed pages for that security act were not newly verified. It supplies no named March Union wire-filter holder. Retain HOLD on the actor/post and source particulars, and do not promote it into a floor or relabel it as routine incoming-wire filtering. |

## Every reservation and slow walk

[The CSV](_pushback/s37-responses.csv) gives **all 331 simulated responses**:
seed, day and computed calendar date, person and display name, post, order
origin ID, typed kind and call ID where present, actual and declared rung,
willingness, every contribution, issued day, complete request, directive
terms, reasons and conditions. [The JSON](_pushback/s37-responses.json) also
retains response keys and plan/note/counter context. These are kernel diagnostic
truth, never a player view or historical claims about the named people's acts.

| Seed | Relay holds | Filter holds | Trims | Reservations | Slow walks | Note-bearing edits |
|---:|---:|---:|---:|---:|---:|---:|
| 1861 | 1 | 0 | 0 | 16 | 18 | 0 |
| 1862 | 4 | 0 | 0 | 19 | 19 | 0 |
| 1863 | 4 | 0 | 0 | 19 | 30 | 0 |
| 1864 | 0 | 0 | 0 | 7 | 26 | 0 |
| 1865 | 0 | 0 | 0 | 9 | 38 | 0 |
| 1866 | 0 | 0 | 0 | 13 | 24 | 0 |
| 1867 | 0 | 0 | 0 | 7 | 25 | 0 |
| 1868 | 0 | 0 | 0 | 25 | 36 | 0 |

There are **zero edits of any kind and zero note responses**, not merely zero
recognized matches to S33's sequence. The rule principal approves submitted
plans (`packages/rule-seats/src/index.ts`, `principalCommands`). The isolated
estimate without S35's note/edit defect is therefore **the same eight pairs of
reservation/slow-walk counts shown above** [I]. This says nothing about the
combined effect of S35's other fixes or a human's edited plan. S35 was neither
merged nor reimplemented.

Every slow walk is a call answer. Reservations comprise **78 call answers,
36 transfers and one advance goal**. Across all rows, the only nonzero terms
are temperament (−152 to 0) and deterrence (+7 to +48). Values, regard,
capacity, disposition and grievances contribute zero; no row has a judgement
term or condition on acting. Every vector sums exactly to willingness.
Reservations score **0–9** against the existing **`complyAt: 10`** and
`reservationsAt: 0`. Slow walks score **−136 to −1**, above `slowWalkAbove:
−200`, with the candour branch selecting covert delay. All 216 declare
compliance; 81 of the reservations also do so.

Call directives have boldness 500, honour `union` and `duty`, offend no value,
and require zero on the directive-capacity scale. Transfers read the
`verb:transfer` row, with no temperament gap; their small deterrence term alone
lands in reservations. The one advance goal uses the pack's advance terms.
The shared default response formula explains these outcomes without a
note-score departure: sampled temperament costs outweigh weak deterrence for
the slow calls, while small positive totals fall into reservations. The actual
request quantities, durations and routes remain in every row.

There are **103 Union-issued and 113 Confederate-issued slow walks**, and
**57 Union-issued and 58 Confederate-issued reservations**, across the eight
independent histories. Repeated calls to a person are distinct orders in the
current counter; for example, seed 1861 has six Morgan reservation answers.
Do not deduplicate these, drop concealed responses, or count only one
government to make the existing bands pass [I]. The catalogue's sparse cases
and this per-order, two-government observation need an explicit ruling if
their units are to change. The immediate recommendation is to resolve source
coverage, missing cases and order terms before another parameter search [I].
Lowering `complyAt` alone remains rejected under 0105; it is already 10 here.

## Validation and reproducibility

The one default command was:

```powershell
npm run run:done-check -- --milestone 1a --label s37-final
```

It ran after the counter correction, for **1,376.33 seconds**, eight seeds,
drafting included, unchanged 400-day fork cap. Exit **1**; **Phase 0 6/6 locally,
1A 4/6**. The seven retained failures are:

- relay holds 1 against 2–6;
- filter holds 0 against 1–9;
- trims 0 against 1–4;
- reservations 16 against 1–9;
- slow walks 18 against 2–9;
- the unmeasured grievance consequence in the lever sweep;
- the unexercised border-governor levy chain in all 24 policy moves.

**Every band movement: none.** Every observed reference liveness counter and
every history pushback count is identical to S34. The counter's corrected
meaning does not change these observations because no incoming filter visit
occurs in them. Timing changed as a measurement, not a limit: Union
reference/history median–p95 **31.66/57.63** and **31.19/49.13 ms** against
unchanged 40/160 limits; testbed **2.92/4.83 ms**. Capped drafting worst
**31.7 ms**. This is local evidence, not a Linux CI or unloaded 20 ms claim.
Return is best 0/8; this is not D6 clearance.

The four-case filter regression covers pass-through, trim-only, hold-only,
and hold plus trim, including a two-claim cut. Its corrected fixture failed
the two zero-hold cases before the production change; afterward **59 focused
tests** and root typecheck passed. The first actual commit hook passed
**173 files / 1,787 tests**, with **nine inherited expected failures and three
timing skips**, plus typecheck, rule checks, boundary, licences and the
106-decision index. Deferred review remains Claude's under 0106.

The first eight-seed extraction uses the existing read-only history observer's
deduplication. A bounded follow-up retained sent commands for complete request
payloads; it matched **all eight final State hashes** before being accepted.
Of the 331 requests, **252** join to explicit seat commands. The other **79**
are the kernel's historical-default `call_for_troops/militia_call` requests,
not missing seat commands: `tick/situations.ts` takes that default inside tick.
The dossier builder originally assumed every request had a seat-log entry;
that cheap processing failure was corrected from this trace, without another
simulation run. No default campaign was retried and no coefficient was tuned.

A final source-to-pack check caught an incorrect draft statement that the
Crusader post was absent. The pending report commit was stopped before it
committed, using only that commit's process tree. The corrected statement
distinguishes the existing ship post, unknown holder and absent carrying
route; its source/data trace is retained. The report commit must pass the
hook afresh; the unchanged runtime campaign evidence is reused.

Recipes, from the repository root at these unchanged runtime inputs:

```powershell
node --import tsx docs/research/_pushback/s37-extract.ts
node --import tsx docs/research/_pushback/s37-orders.ts
python docs/research/_pushback/s37-build-dossier.py
```

The first script also accepts `--startup`; the second likewise has a one-day
startup check and stops on the first final-hash mismatch. Raw evidence is in
`runs/s37/`: `final-verdict.json`, the two measurement inventories,
`preservation-before-report.json`, `runtime-diagnostics.json`,
`dossier-verification.json`, `data-audit.json`, the eight seed and order files,
the hook/check logs, and retrieval/read logs. The completed default campaign's
receipts are in `runs/s37-final/` and `runs/s37-final-drafting/`.

Inventories and runtime diagnostics preceded this final report. All **1,776
tracked files and 839 runtime inputs** were identical before and after
measurement. Against S34, the sole runtime change is `tick/deliver.ts`;
all packs, art and save fixtures are unchanged. All **268 reference daily
hashes**, daily activity, replay, saved-log replay and resumes match S34,
with zero rejected commands. No signature, push, browser, desktop control,
package build or other-lane worktree write was performed.

## For the lead

1. Rule on the four floor classifications and source qualifications. Keep
   the current numeric bounds binding until an explicit ruling changes them.
   Reject an invented filter holder, unrelated screening or authorized delay
   recast as resistance.
2. Route the missing dispatch/channel mechanisms and the sourced Thomas bureau
   appointment separately. Accept the positive-hold counter correction for
   review; reject tuning a willingness coefficient to conceal absent traffic.
3. Retain the five pushback failures and both lever-sweep failures. Isolating
   the note/edit correction predicts no change in these eight base histories
   [I]; integrating S35's full branch remains a separate task.

## Findings outside my scope

The ordinary Adjutant-General appointment and Craven's dated ship-command
attestation are proposed, with the ship tenure held; neither is implemented
as a wire-filter remedy. The entrusted relief delivery, Pickens staff/ship route,
and Seward originator-disclosure contract need their respective mechanism
owners and lead rulings. S35 owns note/edit scoring and its other fixes; S36
owns its canon corrections. The unmeasured grievance channel, unexercised
border levy chain, Linux CI evidence, whole-branch review and gate approval
remain open. Nothing is signed.
