# S137: the expiring regiments and McDowell's July roster

For the lead: 3 items. **S137 only**, `sprint/research-military`, base
`6cd1e3dc648735832f91eb96497950c0af369372`. Research note and CSVs; no pack,
production code, decisions, numerical rules, gates or acceptance changes.

**The fourteen model expiries are not fourteen historical departures.** Eleven
identities have three-month service evidence, but distinct musters and releases.
Second Maine has a different federal-service history. Twelfth and Thirteenth
New York distinguish initial federal service, State obligations and later
continuation. These differences do not authorise keeping fourteen model lots
until a desired battle day.

## Evidence and deliverables

- [Fourteen service cases](S137/expiring-regiments.csv): observed federal
  muster, historical term, actual departure or muster-out, component scope,
  call/authority, the model assessment, and links to read page receipts.
- [Fourteen model call chains](S137/model-call-chain.csv): exact catalogue,
  call profile/message, raising office/person, muster, expiry and last lot.
- [McDowell's 49 regiments](S137/mcdowell-roster.csv): regiment by regiment,
  catalogue presence, named lots, first/last appearance, blocks and places on
  days 135, 140 and 146, and the reason for each day-140 absence.
- [McDowell's two named departures](S137/mcdowell-departures.csv): the regiment
  and battery he actually identifies; neither is expanded into a blanket rule.
- [Readings and source hashes](S137/source-reading.json),
  [committed July inputs](S137/committed-inputs.json),
  [S135 capture reuse](S137/capture-reuse.json), and
  [packet audit/inventory](S137/verification.json).

[M] July's committed HEAD was still
`2a5e62d1aa30e30723ad3654aee134318898aa63` when frozen. Its catalogue, generated
world, call situation and mechanisms were read with **`git show`**, never from
July's working files. S135's accepted 148-day reconstruction of that same
commit is reused, not rerun and not represented as the uncommitted 0130 build.
Its prior audit passes 3,464 checks again, writing the new receipt only under
`runs/s137/`. Capture and input hashes are retained in this packet.

[H] Historical roster membership here means the AGO's compiled **July 21**
organisation, **OR I-II pp.314-315**. It is not the July 8 order or a claim that
every listed regiment fought in the main action. [M] Day 136 is **July 19**,
day 140 **July 23**; these are the model calendar, not historical event dates.

`[H]` is a read historical statement; `[M]` is a model observation; `[I]` is an
explicit inference or recommendation. `unknown` means not established by this
reading, never no surviving record. Dyer supplies **identity, aliases and place
only**; none of the service dates, contracts or personnel below is adopted from
him. All cited excerpts are retained under `S137/read/`. This is selected-page
reading, not a claim to have read whole books.

## 1. What the model actually expires

[M] Each of these fourteen named lots is present on day 135 with **780 rule
men**, muster day **46**, end day **136**, and a **90-day** call. None survives
in day 136's forces. Their 10,920 men are model quantities, not historical
returns. The seven raising offices are Maine, Connecticut, Massachusetts,
Michigan, New Jersey, New York and Rhode Island. The CSV retains each original
message and governor; New Jersey's four identities belong to one four-regiment
levy, and the five New York identities to its seventeen-regiment levy. No
regimental lot's men are multiplied by its parent levy count.

[M] The cause is the ordinary chain, not a calendar instruction to discharge
fourteen roster names:

1. `call_for_troops.json` declares the State profiles `us_apr15_*` and their
   90-day requisitions. Those profiles cite **OR III-I pp.67-69,76**. The read
   requisition says three months unless sooner discharged (**p.68**).
2. `tick/recruitment.ts:288` makes the end day the actual model muster day plus
   the accepted call term. These lots all muster on day 46.
3. `forces/enlistment.ts:217-229` chooses the next unused, compatible catalogue
   identity. Every affected catalogue entry permits 90; none has an
   `identityCall` that pins it to a particular read instrument. It does not use
   the historical muster date to choose or create the regiment.
4. The same module's expiry branch removes a lot whose own end day has arrived.
   Here all fourteen have the same end day. S135's day-135/136 States confirm
   removal directly.

[I] **Internal compatibility is not proof of historical contract identity.**
An April call addressed to a governor, its answer, the lot raised, the
regiment's identity and a later service change are different links. Decisions
0108, 0121, 0124, 0126 and 0129 preserve those distinctions. In particular, an
offer, transfer or onward order cannot silently start a new term or lose an
existing identity. Decision 0130 supplies no missing true personnel through an
observer's estimate. No change to any of those mechanisms is proposed here.

## 2. The fourteen historical service cases

Dates below describe the cited population. A field/staff or company muster is
not silently enlarged to every recruit; a discharge is not a departure date.
The CSV retains the qualifiers and call-link confidence separately.

| Identity | Federal muster observation | Term and actual release | Read pages |
| --- | --- | --- | --- |
| Second Maine | May 28, 1861 | State two-year enlistment; 1861 State report describes federal three years. Federal register says two and three years; two-year men discharged June 9, 1863, remaining men transferred to Twentieth Maine. | ME AG 1861 p.6, Appendix F pp.2-3; US Register I p.14 |
| First Connecticut | Infantry Company A April 22; field/staff April 23, 1861 | Three months; regimental muster-out July 31. Individual appointments, disability releases and other exceptions remain separate. | CT Catalogue 1864 unnumbered field/staff opening immediately before p.4, p.4; US Register I p.303 |
| Thirteenth New York Volunteers | May 14, 1861 | State two years; initial federal three months; August 2 continuation order for unexpired State term. Muster-out May 12-14, 1863; later three-year companies are separate. | Phisterer III pp.1887-1888 |
| Sixty-ninth New York Militia | May 9, 1861 | Three months; muster-out August 3 at New York city. Later volunteer nucleus is not the same service by assumption. | Phisterer I pp.673-674 |
| Twelfth New York Volunteers | May 13, 1861 | State two years; initial federal three months; August 2 continuation order for unexpired State term. Two-year men sent to Elmira May 1, discharged May 17, 1863; three-year men retained. | Phisterer III p.1873 |
| Eighth New York Militia infantry | April 25, 1861 | Three months; muster-out August 2. Its light battery is a separate component. | Phisterer I pp.556-557 |
| First Rhode Island | May 2 original field/staff entries | Three months; left Washington at midnight July 25; regiment mustered out/disbanded August 2. | RI Register 1866 pp.[1],4,9 |
| Seventy-first New York Militia | May 3, 1861 | Three months; Phisterer gives July 31 muster-out at New York city, verified on the page image. | Phisterer I pp.690-691 |
| Fifth Massachusetts Militia | May 1 original company entries | Three months; State ordinary expiration entries July 31. Federal register instead gives August 1 for the regiment. | MA AG 1861 pp.11,13-14; MA Record I pp.17,19; US Register I p.300 |
| First Michigan, three months | May 1, 1861 | Three months; regimental muster-out August 7. | Robertson pp.165-166,173 |
| First New Jersey Militia | April 30, 1861 | Three months; muster-out July 31 at Newark. | Stryker I p.15 |
| Second New Jersey Militia | May 1, 1861 | Three months; muster-out July 31 at Trenton. | Stryker I p.28 |
| Third New Jersey Militia | April 27, 1861 | Three months; muster-out July 31 at Trenton. | Stryker I p.40 |
| Fourth New Jersey Militia | April 27, 1861 | Three months; muster-out July 31 at Trenton. | Stryker I p.53 |

[H] **The calls, with the limits of the links.**

- Rhode Island's sketch explicitly joins the First to Lincoln's April 15
  call and Sprague's April 16 organisation order (**RI Register p.[1]**).
  Michigan reproduces Blair's April 16 proclamation and explicitly joins the
  three-month First to it (**Robertson p.165**; GO5 and muster **p.166**).
- New Jersey's official roster links the four-regiment brigade to the April
  requisition, received April 17, and Olden's order that day (**Stryker I
  p.15**). Its brigade-wide May 1 summary does not erase the separate
  regimental musters on **pp.15,28,40,53**.
- Massachusetts names Lawrence's Fifth in the April 19 active-duty order
  (**MA AG 1861 p.11**); its three-month President-proclamation cohort is
  introduced on **p.13** and includes the Fifth on **p.14**.
- New York's State account distinguishes April militia mobilisation from
  the volunteer enlistments under the April 18 proclamation and April 16 act
  (**Phisterer I pp.17-19**). The Eighth/Sixty-ninth sketches attest their
  April 20 sending orders and April 23 departures; the Seventy-first its
  ordered April 21 departure (**I pp.556-557,674,691**). Twelfth and Thirteenth
  Volunteers have their own two-year State acceptance and initial federal
  contracts (**III pp.1873,1887**).
- Maine's report explicitly joins First and Second to the April 25 State
  act's two-year enlistment, while describing their federal services
  differently (**ME AG p.6**). Its Second's federal muster is May 28
  (**Appendix F pp.2-3**), not the model's April 20 muster.

[I] The New York April-call family joins, its two-year-volunteer mobilisation
joins, and Connecticut's April-call family join are marked as inferences in
the CSV. The read contracts and State mobilisation context support those
families; a separate acceptance instrument naming each of those regiments was
not recovered. They do **not** establish exact request identities or receipts.
Connecticut's dates and three-month service also have the paginated federal
register's direct support (**US Register I p.303**). An unpaginated State web
history was a search aid only and supplies no adopted page-cited claim.

[H] **Differences remain visible.** Maine's 1861 State description of federal
three-year service and the federal register's mixed two/three-year description
are not reconciled into a universal contract. Massachusetts's State July 31
entries and federal August 1 entry remain distinct. Rhode Island's State
field/staff muster May 2 and federal register's organisation May 9 are
different recorded events (**RI Register p.9; US Register I p.303**). No date
from Dyer resolves any of these. The State/component evidence is retained
alongside the later official federal compilation, not overwritten by it.

[I] **Assessment:** the eleven remaining identities fit a three-month family,
but historical months, the model's 90 days, actual muster, ordered departure
and final administrative discharge are different things. Earlier model raising
can legitimately diverge under 0108. This research does not prove a generic
five-day muster delay is defective or authorise changing it. Second Maine's
90-day compatibility needs a specific authority/service-stage review. Twelfth
and Thirteenth New York need the State/federal distinction and their sourced
continuation treated explicitly; neither permits automatically restarting two
years on August 2. Owners: catalogue/call-term data and service-lifecycle
design, before any implementation ruling. No missing strength is supplied.

## 3. McDowell's roster and the model

[H/M] The **49 regiment rows** in **OR I-II pp.314-315** all have catalogue
identities. At model day 140:

| Model disposition | Regiments | Meaning |
| --- | ---: | --- |
| Named lots present at the Manassas field contact | 24 | Present is not a historical engagement certificate. |
| Named lots expired on day 136 | 14 | The fourteen researched above; names remain in the catalogue. |
| Named lots elsewhere | 2 | Second Wisconsin at `lower_valley`; First Minnesota at `washington`. |
| No named lot instantiated in captured days 1-148 | 9 | Catalogue present, no separate named lot found. |

[M] The nine are **Second and Third Connecticut; First and Second Ohio
(three months); Third and Fourth Michigan; Fourth and Fifth Maine; and
Twenty-seventh Pennsylvania**. Thus **23** roster identities lack active named
lots on day 140 (14 expired plus 9 not instantiated), with two more outside
Manassas. No historical regiment in this roster is missing from the catalogue
itself. The CSV maps every row and lists the actual model lots and blocks.
Anonymous/generated lots are not proved to lack all historical counterparts;
they cannot justify adding a second copy of these regiments.

[H/I] The printed **Second New York** maps to the catalogue's Second Militia /
Eighty-second Volunteers, not Second New York Volunteers (**Phisterer IV
p.2897**). The printed **Fourteenth New York** maps to Fourteenth Militia /
Eighty-fourth Volunteers, not Fourteenth Volunteers (**IV pp.2929-2930**).
Those aliases are explicit in the crosswalk's identity basis. The New Jersey
three-month and three-year regiments of the same number remain separate rows,
as the roster prints them (**OR I-II p.315**).

[H] The same roster marks Fourth Michigan **not engaged**, Runyon's command
**reserve**, and Blenker **at Centreville, not engaged in the battle proper**,
with skirmishing while covering retreat (**OR I-II p.315 and notes 4-5**).
Regular infantry/cavalry company components, Marines, artillery batteries and
the Seventy-first's howitzers are not inflated into additional regiments. Their
existing S135 observations remain available; this CSV's denominator is only
the printed regiments. No S136 allocation, junction or commitment design is
attempted here.

## 4. What McDowell actually says about departures

[H] McDowell says that, on the eve of battle, **Fourth Pennsylvania Volunteers**
and the **volunteer artillery battery of Eighth New York Militia** insisted on
discharge; he appealed to the regiment, the Secretary of War asked the battery
for five more days, discharge was granted, and they moved to the rear the next
morning as the army advanced. He then describes the losses of expiring troops
he expected in the next few days. That expectation is not a completed list of
fourteen simultaneous discharges. **OR I-II p.325.**

[H] The July 21 compiled roster does not list Fourth Pennsylvania; it does
list Eighth New York militia infantry (**OR I-II pp.314-315**). Phisterer
separates that regiment's Company I light battery (**I p.557**). The battery's
departure therefore cannot discharge the whole Eighth infantry.

[M] Both departed units have catalogue identities, but neither has a named lot
in the reused days 1-148 capture. They are not two of the fourteen expired
July-21-roster identities. Their missing named model lots do not license an
extra regiment, a battery crew estimate or an automatic departure event.

## Sources, verification and handoff

Public-domain works read: *Official Records*, I-II and III-I; Maine AG report
for 1861 with Appendix F; Connecticut AG *Catalogue* (1864); Massachusetts AG
report for 1861 and *Record of the Massachusetts Volunteers* I; Rhode Island
*Official Register* (1866); John Robertson's official *Michigan in the War*
(1882); William S. Stryker's official New Jersey *Record* I (1876); Frederick
Phisterer's State *New York in the War of the Rebellion* I, III, IV (1912);
the War Department's *Official Army Register of the Volunteer Force*, Part I
(1865); and Dyer's *Compendium* (1908), restricted here to identity/place.
The receipt gives URLs, exact selected passages, page locators, source hashes
and headless scan inspections. Wrong-publication and wrong-page recoveries are
explicitly excluded. Raw scans and extraction scripts stay in ignored
`runs/s137/`, not in a production path or another worktree.

Final source/packet inventories and preservation checks preceded this note.
The focused audit passes **757 checks** before note-link checks, including all
14 cases, all 49 roster regiments, source/capture hashes, direct day-135/136
coverage and unchanged prior tracked files. S135's **3,464** checks pass on
reused evidence. Boundary and **13 pack-rule tests** pass. An initial audit
caught Windows line endings; an initial test selector named a nonexistent
file. Both were corrected cheaply before the hook. The ordinary staged-tree
hook remains required; its actual result belongs to `runs/s137/commit-hook.log`
and the one CODEX status. No new scenario, tuning or timing campaign ran.

The integrity audit is not independent historical review. Formal branch review
and signatures remain deferred under the sprint process, 0106/0107. Requested
5.6 worker model IDs are unavailable; no substitute worker was spawned. Every
unknown, component qualification, unreceived paper and inherited unmet
criterion remains open. No hold is cleared by a passing CSV audit.

For the lead:

1. Review Second Maine's catalogue compatibility separately from New York's
   State/federal continuation cases. The eleven other three-month cases
   support no blanket retention, new muster delay or numerical adjustment.
2. Use the complete 49-row crosswalk for identity review: 23 missing active
   named identities, two elsewhere, none absent from the catalogue. Preserve
   aliases, component scopes and unnamed-lot uncertainty.
3. Keep McDowell's two specific departures separate, and route unread named
   acceptance/receipt papers and the retained source disagreements to further
   bounded recovery before any data application.

Outside S137: S136's design, S134's completion, applying service/catalogue
changes, replacing unknown personnel, battle tuning, gate signatures, main
integration, release and pushing. No other worktree was written except the
single authorised final CODEX append, performed through Python UTF-8 after a
fresh complete read and prefix-preservation check.

Findings outside my scope
