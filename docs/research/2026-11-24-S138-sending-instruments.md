# S138: the sending and onward instruments

For the lead: 2 items. Research only, 24 November 2026, on
`sprint/research-authority`, base `c5d4ba8eed71849759080586757f39e8b846ada4`.
No pack, code, strength, service-term, destination-policy or decision change.

The read papers support scoped requests, assignments and conditional onward
orders. They do **not** close every regiment's journey from its governor to
its July command. Uncovered regiments and generated lots must remain under
their actual authority until an applicable received instrument exists (0131).
This is an inventory-complete evidence packet, **not a complete recovered
archive of governor orders or an allocation-ready declaration for every lot**.

## Delivery and reading contract

- [Instruments](S138/instruments.csv): 61 distinct records, with issuer,
  authority basis, date, addressee, sending/receiving commands, force scope,
  operative conditions, receipt evidence, printed pages and retained readings.
- [Per-inventory evidence](S138/regiment-instruments.csv): 972 rows for 260
  distinct keys. Filter `unit_id` to obtain each key's read evidence and its
  unrecovered initial-sending and chain gaps. Federal regulars/Marines have a
  federal-order gap, not an invented governor. The instrument fields are repeated
  so this CSV can be read without a relational join.
- [Source readings](S138/source-reading.json): 79 retained primary-page extracts
  with hashes and locators. [Input receipts](S138/input-receipts.json) identify
  the read audit, design, decisions and source containers.

**[H]** below means a read historical passage, cited by printed page. **[M]**
means inventory/software evidence. **[I]** means an interpretation, candidate
identity link or application under the accepted decisions. CSV `evidence_kind`
distinguishes an instrument from a notice of an unread original, a report,
a request with dissent, and a roster. A `read_scope_link` identifies wording
in the read evidence, not a certified receipt or a fully proved alias chain.
`inferred_candidate` and `identity_hold` must not be silently promoted to
declarations. Blank historical fields mean unrecovered, never unlimited or zero.

These are selected readings of official printings, usually retained OCR, not
the original autograph papers, complete volumes, or freshly collated scans.
The full retained page can contain other papers: its inclusion does not claim
every unrelated passage was adopted. OCR wording is preserved. GO17's date was
checked against the cached PDF scan headlessly: printed **16 July**, despite
OCR's **10 July** (OR I-II p.303; image/hash in the reading register). The
attempt to open the Archive page for OR I-LI.2 p.108 through the headless web
reader failed; the local cached primary OCR supplied the reading instead.
No Computer Use, desktop session or real browser was used.

## Inventory boundary

**[M]** The union of S135's `historical-unit-crosswalk.csv`,
`model-lots-daily.csv`, `confederate-dispositions.csv`,
`unit-placement-differences.csv` and `model-lot-differences.csv` contains **223
distinct inventory keys**. All occur in the per-inventory CSV, including
batteries, company/battalion scopes and placeholders, rather than dropping
non-regimental rows. This includes **65 generated lots and 5 unidentified
pools**. Those are model keys, not 70 newly identified historical regiments.
No model quantity is adopted as a historical strength here.

S135's historical crosswalk labels McDowell, Beauregard, Johnston and Holmes
reinforcements, but contains **no Patterson army rows**. Its placement ledger
does identify several Patterson discrepancies. To cover the requested army,
the packet additionally retains all **43 distinct Patterson keys** in S66's
365-row regiment observation table, then checks the organising papers directly.
These are successive observations, including June antecedents, not a claim
that all 43 were together on one July day. Nine keys already occur in S135,
so the supplement adds 34. S138 adds three explicit instrument controls:
`ny_21_infantry`, `ny_26_infantry`, `pa_4_infantry`. The distinct union is
**260**: 223 S135 keys + 34 Patterson-only keys + 3 controls. Counts use exact
inventory keys; similarly named
militia, volunteer and regular units are not merged by a number. Each CSV row
retains its input filenames and observation IDs. These observations are scope
evidence [M]; their original source pages are not all re-read or recertified
by S138. Historical claims here come from the retained primary readings.

There are read evidence links for 171 keys and none for 89 (including the 65
generated lots and five pools). **A read roster link is not a recovered sending
instrument.** Every key still has an explicit initial-sending gap and an
incomplete-chain gap. These counts do not measure recovered authorisation.

## Authority: who is ordering

**[H]** Scott is directed to assume Army command by the presidential direction
of 5 July 1841 (Richardson IV p.73). WD GO12 assigns Mansfield to Washington,
Butler to Annapolis and Patterson to Pennsylvania (OR I-II p.607). WD GO26
assigns McDowell the new Virginia department, with stated geographic exceptions
(p.653). The Regulations deny duty by commission alone and describe numbered
orders, approval, staff signatures and passage through intermediate commanders
(1857 Regulations pp.2-3,57-60, especially paragraphs 8,14,422-429,438-441).

**[H]** Letcher's direction and Lee's assumption give Lee Virginia's forces
(OR I-II pp.775-776). Walker's telegram, published as received in Lee GO13,
gives Lee control of Confederate forces in Virginia and authority to assign
their duties until further orders (p.827). Letcher's proclamation dated 6 June
and Lee's GO25 dated 8 June transfer the state forces to Confederate authority
(pp.911-912). That is a transfer of command, not an order sending every unit to
Lynchburg, Johnston or Manassas.

**[I]** Apply 0124 and 0129: Townsend, Porter, Fry, Garnett, Deas and Jordan
carry their commanders' orders; they do not become granting principals.
Secretary-issued assignments and Cooper's governmental staff channel are
rooted in the government. The departmental enabling act was not read in S138;
that institutional link stays marked [I]. Beauregard's signed organisation
papers attest his command (pp.943-944,999-1000); his original assignment is
not recovered here. Johnston's original assignment remains unrecovered, as in
0124; read recipient/roster evidence is not a reconstructed original.

## Union: sending is separate from organisation

**[H]** The read sending sequence is not a statewide destination table:

| Record | Read terms | Limit |
| --- | --- | --- |
| U01, Scott to Patterson, 4 May | Send the New Jersey regiments to Washington (OR I-II pp.619-620) | The addressed command at that time, not all future NJ lots |
| U02, Cameron, 5 May | Six PA volunteer regiments to Washington via York; Patterson acknowledges previous-evening receipt on 6 May (pp.623-624) | Finite cohort; individual selection/arrival absent |
| U03, Scott, 24 May | Remaining PA/NJ quotas toward Frederick, Hagerstown and Cumberland; no more to Cadwalader or Mansfield (p.652) | Different direction and purpose; no identified roster |
| U04, Scott through Townsend, 15 June | Third Michigan and other regiments arriving through the Harrisburg routing to Washington (p.690) | Washington is not McDowell membership |
| U05, Patterson, 16 June | Detach whole Rhode Island regiment and battery on receipt; Hagerstown to Frederick, then rail to Washington (p.695) | Not every Rhode Island regiment; actual receipt still needed |
| U07, Cameron to Curtin, 13 July | Five long-term PA regiments, in addition to two at Cumberland, to Patterson; remainder to Scott in Washington (p.166) | Does not name which five; never `999` |
| U09, Scott to Sickles, 20 July | Accepted, mustered, armed, ready regiments under Sickles to Patterson | Printed footnote changes destination to Washington; changing instrument/date unread (p.745) |
| U10, Scott to Curtin, 21 July | Wisconsin regiment at Harrisburg rerouted to Baltimore, with addressed regiments there/elsewhere (p.751) | Wisconsin number missing |
| U11-U14, 21-22 July | Named and unnamed reinforcement, hold and recall papers (pp.747-748,751,754) | Preserve sequence/actual recipients; do not backdate into first contact |

**[H]** Mansfield's 21 July paper names McCunn's 37th, Murphy's 15th,
Christian's 26th and Kerrigan's 25th, under Scott's orders, to Fairfax Station;
its expected arrival is not a receipt. His next message holds his last two at
Alexandria without naming them (OR I-II p.751). Scott's 22 July recall reaches
the regiments actually with McCunn and Woodbury, not an automatically restored
initial list (p.754; Woodbury's Fourth Michigan identity is printed on p.748).

**[H]** Patterson SO66, SO68, SO76, SO94, SO95, SO96 and SO105 explicitly
organise or assign troops already in his chain (OR I-LI.1 pp.397-398,406,
415-416,418). SO77 separately orders Negley's movement and Owen's following
and reporting (p.406). SO76 assigns Fourth Connecticut to the Sixth Brigade;
SO96 assigns 19th/28th NY to the Eighth; SO105 prints Fourth **[Second]**
Massachusetts under Gordon to the Sixth. These are useful positive allocation
papers, but cannot stand in for missing governor dispatches or first receipts.
SO94 has five companies of 25th PA, SO96 six: preserve both dated scopes rather
than sending the entire regiment twice (pp.415-416).

**[H]** McDowell GO13 (8 July) says it organises troops **in this department**
(OR I-LI.1 pp.413-414). Its New Jersey reserve is an actual division in the
organisation, not permission to sweep later state arrivals to McDowell. The
later compiled battle roster differs (OR I-II pp.314-315). In particular:

- GO13 prints Second Maine in both Keyes and Howard. The battle roster prints
  Third Maine in Howard. S138 does not silently emend or duplicate the lot.
- GO13's Thirteenth NY Militia and Second NY Volunteers wording does not by
  itself close the inventory's volunteer/militia aliases. Their links are holds.
- GO13 prints Twenty-fourth **[Twenty-seventh]** PA; that editorial correction
  stays visible. Garibaldi Guard to the 39th NY is marked a candidate link.
- Eleventh Massachusetts, Fourth Michigan, Twenty-seventh NY, Third Maine,
  Forty-first NY and other later roster entries do not obtain a missing earlier
  assignment merely by appearing in the compiled battle roster.

## McDowell, 15-18 July: actual preparatory and marching papers

**[H]** M00 is the preparatory restraint of 15 July: McDowell, through Fry,
orders Miles to make no movement by either brigade until headquarters'
instructions are received (OR I-LI.1 p.419). The referenced Blenker advance
order is not reproduced. It is not evidence that his brigade had departed.

**[H]** M01 is **GO17, Arlington, 16 July**, signed by Fry by McDowell's
command (OR I-II pp.303-305). It directs afternoon movement in light marching
order: Tyler toward Vienna by separate roads (Richardson across Chain Bridge),
Hunter on Columbia turnpike to Little River turnpike without crossing it,
Heintzelman south of the railway toward Accotink/Pohick, and Miles by Little
River turnpike toward Annandale/Braddock-road junction. It specifies renewed
march after daylight on the 17th, routes toward Fairfax/Sangster's, tactical
discretion and supporting duties. It regulates baggage, delayed trains,
subsistence, engineers, reconnaissance and communications (pp.304-305).

Runyon guards the railways. The 28th NY at Fort Corcoran, 25th at Roach's,
21st at Fort Runyon and 17th at Fort Ellsworth are not to be removed except
in emergency (p.304). **The printed 28th is not safely resolved here to the
inventory's 28th Volunteers; that unit link is a hold.** Read station wording
cannot repair militia/volunteer identity by number alone.

**[H]** M02, the 17 July report, says Fairfax was occupied and exhaustion
prevented pursuit beyond Centreville (p.305). M03, the 18 July report, locates
different divisions and reports movement orders while admitting lack of
communication with Heintzelman (p.306). These are reports of orders and
execution, not recovered original addressed instructions for every movement.

**[H]** M04 is **GO19, Fairfax Court-House, 18 July**: Heintzelman to Little
Rocky Run, Miles to Centreville, Tyler beyond Centreville on the Gainesville
road, Hunter near Centreville where water is available. Movement follows
receipt of supplies. If trains are late, division commanders obtain beef at
market rates by orders on the chief commissary; troops need two days' cooked
rations (pp.307-308). The surrounding 19 July report describes altered plans
and instructions after contact; it is not an earlier issue/receipt date.

**[H]** M05, **GO18 of 18 July**, is the property-protection/police order,
not the march order: each regiment selects a provost marshal and police
detail; unauthorised searches, entry and arrests are forbidden (pp.743-744).
M06, GO22, is a separate 20 July battle/task instruction (pp.326-327).
M07 retains SO37's request and SO39's discharge/rearward order for Fourth PA
and Varian's battery (p.745). S137 owns any service-term correction.

**[I]** These papers provide actual antecedent restraint, departure routes,
supply conditions and subsequent orders. They supply no licence to backdate
model receipt, move a seed, shorten a road, or fit a contact date. Links from a
21 July roster member to GO17/19's division scope are explicitly candidates:
the issuer must actually hold it when the received order operates.

## Confederate sending, changes of destination and onward orders

**[H]** Harris's 30 April reply reports the April22 requisitions, three
regiments being organised for Lynchburg, Letcher's subsequent request not to
send yet, conditional provisioning and Harris's retained recall (OR IV-I
p.272). His 2 May report says Turney left Winchester the preceding night;
Bate and Maney would be ready and Harris asks whether to send them (p.275).
These read reports do **not** recover the governor's original sending orders.
Maney and Turney are not interchangeable inventory identities.

**[H]** C03 is Lee's 14 May instruction through Garnett to E. K. Smith:
send ready Confederate troops **under Smith at Lynchburg** to Richmond, by
battalions/regiments as prepared, with **three regiments in all** as the cap
and notice of each departure (OR I-II p.840). This cannot send Johnston's
whole command to Lynchburg; the direction goes the other way and has a
different holder, readiness condition and finite scope.

**[H]** Lee to Cocke on 15 May asks that Garland/Preston be filled, then
reinforcements organised and sent to Garland under Terrett at Manassas as
judgment/request requires; a threatened attack changes the condition to
support with Cocke's whole force (p.845). Lee's staff notice to Bonham of
24 May says Moore's seven-company Virginia regiment has been ordered to join
the next day; the original addressed order is not reproduced (p.872).

**[H]** **SO119, 25 May**, supplies particularly useful direct terms:
Withers' Virginia regiment by rail to Bonham at Manassas; Bate's Second
Tennessee by rail to **Ruggles at Fredericksburg**; on Bate's arrival Ruggles
sends two First Virginia companies to rejoin their regiment at Manassas.
The railway/quartermaster appoint the departure hour; the staff provide the
means. The order continues to its Lee/Garnett signature (OR I-LI.2
pp.107-108). It does not address Holmes retroactively. It does not send the
whole First Virginia a second time. Williams' Second NC goes to Huger at
Norfolk in a separate paragraph; it is not equated to S135's 5th/6th/11th NC.

**[H]** Lee's second 1 June letter to Johnston reports instructions to the
available Staunton companies and to Turney's First Tennessee **then at
Richmond**, to report to Johnston as soon as practicable (OR I-II pp.897-898).
This is a read notice; original addressed copies are unrecovered. The
unnamed Tennessee arrival notice on p.908 alone does not certify Turney's
exact receipt date. Lee's 7 June notice names Gartrell's Georgia regiment
(p.910); the inventory Seventh Georgia link stays [I] pending the alias and
original. Johnston's 12 June acknowledgment says Lee's 10 June letter
reported **two unnamed Lynchburg regiments** ordered to Harpers Ferry
(p.922). The original and identities are gaps, not a roster-matching exercise.

**[H]** Beauregard's 17 June letter to Bate requests Holmes's and the
Secretary's approval before Bate, preferably another regiment and a battery,
support him at Brentsville. Holmes's 18 June endorsement disagrees with
detaching part of his command (pp.932-933). It is a request with dissent, not
Beauregard commanding a peer's troops or proof of an executed transfer.

**[H]** GO20 of 20 June organises Beauregard's current command in six brigades,
using colonels' names (pp.943-944). The later **SO169, 25 July**, provides many
explicit numbered-regiment/colonel pairs and a changed organisation, plus
artillery/cavalry duties (pp.999-1000). Its later date stays visible. Numeric
links across those dates are interpretations where the earlier paper names
only a colonel. Cocke's regiment in GO20 is not silently equated to the later
19th Virginia under Strange. The July21 return and June30 Johnston roster
are observations, not original sending instruments (pp.469-470).

**[H]** The July reinforcement papers also retain distinct conditions:

| Record | Terms read | Unresolved link |
| --- | --- | --- |
| C12, government through Cooper, 17 July | All Johnston's effective force to junction if practicable; discretion; sick/baggage to Culpeper (p.478) | Johnston's report says received about1am on18th; report and reproduced copy differ (p.473) |
| C13, Cooper to Holmes, 17 July | Move three regiments and a light battery; replace with militia; leave Ruggles in district command (p.980) | The three identities are not named |
| C14, Lee SO224 IV, 17 July | Ready on Beauregard's notice; three regiments/one field battery; preserve district; return when necessary/after service (pp.980-981) | Relative receipt/sequence with Cooper's direction is not established |
| C15, SO224 V | McRae's Fifth NC to Beauregard when quartermaster supplies transport (p.981) | Issue is not arrival |
| C16, SO224 VI | Hampton infantry by rail; cavalry march; artillery follows as transport furnished (p.981) | Separate arms/partial arrivals, not whole-legion teleportation |
| C17, Cooper to Beauregard | Permission to appropriate NC regiment en route to Johnston (p.980) | Number missing: do not choose 5th or6th by desired roster |
| C18, Davis, 18 July | Notice of McRae, Barksdale from Lynchburg and Hampton's pending transport (p.981) | Original Barksdale telegram not reproduced |
| C19, Cooper to Clay, 20 July | Armed regiments arriving **at Lynchburg** forwarded to Manassas; acknowledgment and daily reports (p.985) | Barksdale July18 original is referenced, unread; no generated-lot identity established |

**[I]** The conditional junction instrument does not independently prove
which individual lots Johnston held or their actual location. His report of
mixed road/rail movement and partial arrivals (p.473) is distinct from the
issue copy (p.478). S138 supplies the paper evidence; relief choice, routes,
transport precision and task commitment remain the later builds' work.

## Open originals and what the CSV permits

The following are **referred to but not read**, not missing facts filled from
memory: Walker/Letcher April22 requests (Harris, OR IV-I p.272); the individual
Harris sending orders (his reports, pp.272,275); Lee's earlier 10 May letter
to Cocke (OR I-II p.845); the addressed order to Moore (p.872); the addressed
Turney/Staunton and Gartrell orders (pp.897-898,910); Lee's 10 June order/notice
about the two Lynchburg regiments (Johnston's acknowledgment p.922); the
Sickles destination-changing order (editorial note p.745); Barksdale's
18 July telegram to Clay (Cooper's later reference p.985); the Blenker advance
order (Fry's restraint, OR I-LI.1 p.419); and the original Confederate command
assignments described above. Individual governor dispatches, completed
receipts and unprinted intermediate assignments remain per-key chain gaps.

For named inventory keys with no read link, the deliverable makes **no
historical destination assertion**. This includes several New York lots that
S135's model placed at Manassas, Arkansas's First and several Patterson
artillery/detachment keys. S135's Dyer citations are discovery leads; S138
does not promote later service summaries to original sending instruments.
Generated lots retain their model call/raising metadata [M], but no named
historical identity or destination is invented for them. Their call's actual
offered destination and a received applicable cohort request must be proved
before selection. A common state label is insufficient.

**[I] Recommendation under 0131:** declare only recovered, reviewed scopes,
retaining notice/report/roster distinctions and identity holds. Do not treat
this research CSV itself as executable pack data. Recover missing governor
and receipt instruments in bounded follow-up groups; until then preserve
shortfalls and current authority. Reject wholesale roster allocation,
substitution of named missing units with generated lots, proportional quotas,
and issue-date arrivals. These are applications of accepted decisions, not
new proposed numerical rules.

## Validation and hand-over

Focused validation checks UTF-8, CSV shape and stable IDs, unique instruments,
complete S135/Patterson-key coverage, retained-page hashes, every source-key
reference, and preservation of original tracked files. Existing S135 audit
and S136 design evidence is reused; no scenario, package or battle campaign
is rerun. The ordinary hook remains required; the one CODEX status reports its
actual exit and log after completion. Formal branch review remains deferred under
0106/0107. Git history is the ledger; no unrelated project ledger is added.

For the lead:

1. Use the recovered papers as research inputs for 0131 allocation, preserving
   exact scope, conditions, authority and receipt gaps. Resolve identity holds
   before declaring those named scopes; universal allocation is not certified.
2. Route the missing governor, receipt and referenced-original chains as
   bounded recovery work. In particular retain the two unnamed Lynchburg
   regiments, the diverted NC identity, and the two competing Holmes directions
   as open evidence questions; do not fill them from the July roster.

Findings outside my scope
