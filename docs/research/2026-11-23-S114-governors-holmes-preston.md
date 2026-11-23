# S114: pre-call conditions, Holmes's troops, and Preston's battalion

23 November 2026. Research only, on `sprint/research-military` from
`d887b692ae6d0098e6de8143ce64365cc53e7f06`. Read the lead's S114/S115 message,
0120, 0121, 0108, and S111's evidence. **S114 only. No pack, code, accepted
decision, matcher, cast, strength, source-hold status or signature changes.**
Other worktrees were read only, apart from the expressly requested final
coordination append. All acquisitions and inspections were headless HTTP,
retained text/PDF and local page images; no real browser or desktop control.

**Findings:** C05 now has an independently dated, personally known organisation
leg in Harris's January 7 message. The separate extra-state authority leg is
still unproved. Moore's earlier Louisiana report documents support costs and
expenditure, but no independently dated inability to keep the April contingents
in camp was recovered. Holmes's catalogue entries are not actual lots assigned
elsewhere under Ruggles. His full June roster, unit strengths and exact joining
dates remain partly unresolved. No pre-battle numerical return for the original
seven-company Preston battalion was recovered; its identity and departure must
be resolved before assigning a later regiment's strength to it.

## Evidence packet and reading limits

- [Governor records](S114/governor-records.csv): 11 dated/context/exclusion rows.
- [Holmes lot candidates](S114/holmes-lot-candidates.csv): ten components and
  controls, with identity, arm, raising/service fields and overlap dispositions.
  **These are not ten additional lots.** Unknown fields are blank.
- [Holmes observations](S114/holmes-observations.csv): 21 orders, presence reports,
  proposals, estimates and retrospective reports, with their distinct dates.
- [Pack crosswalk](S114/pack-crosswalk.csv) and [model audit](S114/model-audit.json):
  the catalogue, actual lots, assignments and aggregate origins examined first.
- [Preston dispositions](S114/preston-dispositions.csv): six observations and
  rejected numerical/identity substitutions.
- [Source receipts](S114/source-reading.json): 58 read locators, URLs, external
  artifact paths, SHA-256, reading scope and acquisition/locator corrections.

Historical statements below cite printed pages actually read. **[M]** identifies
the frozen model; **[I]** identifies a comparison or proposed ruling. The OR is
the later official printing of contemporary papers. A downloaded volume was
searched selectively, not read in full. HathiTrust's public text-only pages
supplied original Tennessee journal/code text and printed heads; no image
inspection is claimed for those pages. Scans remain outside Git under
`C:/Pyrrhic/mandate-research-sources/S114/`. The only quantities in the CSVs are
source observations or explicitly identified model quantities. Gun calibre,
number of companies, proposed guards and legal establishments are not men
present for duty.

## 1. Which Moore, and what he knew before April 22

**The brief's Alabama label conflicts with C03's person.** The April 22
requisition names **Thomas O. Moore, New Orleans**, and the April 23 reply is
signed by him; Walker's next telegram again addresses Thomas O. Moore at New
Orleans (OR IV-I pp.232,235). Alabama's January 14 state message is by **A. B.
Moore** (*Message to the Senate*, opening printed p.3). The requested Alabama
inquiry is retained separately. The Louisiana inquiry follows C03's identified
person, without attributing Alabama's money or knowledge to him. The discrepancy
was raised to the owner during work; no answer was received before this packet.

Alabama's own January 14 message says the Governor arranged a one-million-dollar
bank loan **if required by the Legislature**. He asks the Legislature to
consummate that arrangement and proposes borrowing another million on State
bonds. This is evidence of a means of financing preparations, known to A. B.
Moore by his own message, not proof that the money was already received or that
an April camp lacked funds (*Message*, printed pp.6-7; PDF spread 4, inspected).
No earlier Alabama record establishing the specific camp-maintenance inability
measured in C03 was found in this inquiry; Alabama would in any event be the
wrong State for that row.

For Louisiana, the Military Board's *Special Report* supplies an earlier own
record. On printed p.6 it recommends liberal appropriations for volunteer corps
whose officers and members bear heavy expenses; requests a military bureau;
and recommends a regular paid force for ordinary garrison duty. It distinguishes
the citizens' difficulty leaving occupations from the expense of supporting
volunteers. It says full disbursing accounts have not yet been rendered. The
report carries **Thomas O. Moore's signature as President of the Military
Board**, followed by the closing date **February 14, 1861**. Thus this is
personally known by that date, without inventing an arrival of someone else's
report. Its statement that volunteer support costs about twice regular support
is the Board's assessment, not a rate adopted here (*Special Report*, p.6,
original image inspected).

The accompanying warrants schedule totals **$32,670.91**, including **$257**
for board and quarters for troops on January 14, **$2,500** for commissary
expenses on January 17, and **$750** for debts and February supplies on January
30. These are warrants drawn, not the treasury's remaining cash or unspent
appropriation. The heading prints an act date of **December 12, 1861 [sic]**
above the December 1860/January 1861 entries; the typo is retained rather than
silently corrected (*Special Report*, p.7, original table inspected).

Moore's March 13 paper describes slow enlistment into the two regular
regiments, distinct four-month troops and expected Confederate protection of
the forts. It does not state the April volunteer-camp financial inability (OR
I-LIII p.636). On March 15 he asks who supplies transportation and seeks New
Orleans muster, forwarding the act he approved that day authorising transfer
of regular forces and permission for volunteers to tender Confederate service.
Neither a transfer power nor the expectation of relief from expense after
Confederate receipt establishes a camp balance (OR IV-I pp.172-173).

**[I] C03 disposition:** earlier own financial/support evidence was recovered,
but **no pre-April22 record establishing the specific lack of means to keep
these men instantly available in camp**. Do not convert general support costs,
private occupational hardship, drawn warrants or a transport-cost question into
`camp_finance_limited`. The April 23 reply (OR IV-I p.235) remains the answer
being measured and cannot supply that missing condition. No C03 closure is
claimed.

## 2. Harris's organisation and authority are separate questions

The original *Senate Journal of the Extra Session of the Thirty-third General
Assembly* is identifiable by its January-session title at HathiTrust sequence
7. The January 7 sitting appears at sequence 9. On printed p.6, the journal
records the Governor's message delivered by Secretary of State J. E. R. Ray
and read by the Clerk. On printed **p.17**, Harris says that, except for a small
number of volunteer companies, there is no military organisation in the State;
the militia disorganised after repeal of the drill/parade requirement. He asks
for reorganisation and says full county strength reports are lacking. The
signature closes on **p.19**, not p.18 as the initial modern locator suggested
(*Senate Journal*, January extra session, pp.6,17,19).

This is an independent **January 7 own-state organisation statement**, known
to Harris as its author by that day. His estimate of potential militia strength
on p.17 is not an organised field force, muster, or a stock to supply three
regiments. This packet makes no values or motive inference from the political
passages around the administrative evidence.

The *Code of Tennessee* (1858), p.113, sections 187-189, makes the Governor
commander-in-chief except when forces enter United States service, authorises
staff appointments, and gives custody of the public arms. Printed pp.156-157,
sections 469-476, retain earlier militia laws except incompatible provisions,
address invasion/insurrection and exemptions, repeal scheduled drills, and
require assessor/county reports. **Section 469 prevents treating these selected
pages as the complete surviving militia law.** The book's publication precedes
the call, but the precise day a copy or particular provision reached Harris
was not recovered. No 1858 January 1 receipt is invented (*Code*, pp.111-113,
156-157).

**[I] C05 disposition:** offer the January 7 record as an organisation leg with
its own date and provenance. Do not turn it into proof of every extra-state
legal restriction, or assume the condition persisted unchanged to April 22,
let alone S111's model dispatch on July 3. The read pre-call records do not
establish the full legal claim that Harris lacked authority to order troops
beyond Tennessee. His April 22 reply says that, but it is the measured answer
(OR IV-I pp.232-233). The April 25 request for organisation and maintenance
legislation is later, and cannot be backdated (*Senate Journal*, second extra
session, p.12). No C05 matcher/coverage result is claimed from this research.

## 3. Holmes: identity, existing representation, and June observations

### Existing pack first

**[M]** Read-only copies of July's catalogue, organisations, pack, world,
scenario, posts and relevant State-force origins were retained in
`runs/s114/model/`, re-read from **S111 commit `488a4a8a`** using `git show`.
July advanced to `a360803f` during the inquiry. Comparing all twelve tracked
inputs found five byte differences, all line endings only; normalised text is
identical. The first live copies and comparison remain in `runs/s114/`.
S111's retained day148 reference State supplies the actual
lot/assignment audit; it is not a new June State or a rerun. Its full catalogue
has **214 identities** and **four organisation templates**. The two named
infantry identities `tn_2_infantry` and `ar_1_infantry`, and
`unknown_walker_artillery`, occur in the catalogue. **None occurs as a named
lot in that State.** No lot is assigned to `cs_cmd_fredericksburg`; there is no
Ruggles post or Holmes organisation template. A catalogue observation is not
an instantiated regiment waiting under another commander.

**[M/I]** There are other represented resources requiring careful distinction:

- The unidentified **22,000-man Tennessee infantry transfer lot** is assigned
  to Harpers Ferry; the three generated July call identities are also there.
  Neither proves Bate's presence or ownership by Holmes. The source behind the
  transfer is Tennessee's June 29 resolution, not a named Bate return (OR IV-I
  p.411). Do not add another Bate regiment on top of it without resolving scope.
- The April Arkansas call has a generated regiment at the Governor's post.
  Its identity cannot be changed to Fagan by State/call date alone. The later
  seven-regiment Arkansas State-transfer pool is **not a valid Fagan alias**:
  its primary enumeration names **Cleburne's First**, Gratiot's Second and the
  other specified State units, rather than Fagan's First already observed in
  Virginia (OR I-III pp.609-610; OR I-II p.57).
- Virginia's unidentified Richmond and other local lots do not establish
  which constituent companies served near Fredericksburg. No entire Richmond
  pool can be assigned to Holmes merely to make his field order eligible.
- Walker's battery has no sourced raising department or known service term in
  the catalogue. Fixed naval batteries need their own correct representation;
  the twelve guns are not twelve men or a fabricated infantry force.

**[I] Answer to the first check:** no already assigned, positively identified
Holmes force was found under Ruggles or another post. The gap combines identity,
scope and assignment; this is **not proof that all the historical men are
absent from every aggregate**. Neither adding historical troops on top of pools
nor moving whole unidentified pools is supported.

### What the read June papers establish

SO119 of May 25 orders **Bate's Second Tennessee** to move to Fredericksburg
the next day and report to Ruggles. It also orders the two First Virginia
companies there back to their regiment when Bate arrives: order date is not
arrival/execution date (OR I-LI.2 p.107). Ruggles's May 30 **[?]** report describes
about 700 taken forward and another 500 left behind, covering a Tennessee
regiment and a volunteer battalion. No allocation to either unit is supplied
(OR I-II p.55).

Ruggles's June 1 report locates Bate's Tennessee/Walker Legion, mentions four
local infantry companies and a cavalry company, and places Bate at Brooke's
Station. It describes **Walker's rifled 6-pounder guns** brought into the May 31
action. On June 4, **Fagan's Arkansas regiment is at Camp Jackson**, with a
proposed future movement toward Chopawamsic. The **Fredericksburg Artillery**
is named separately, with 6-pounders. These are presence/armament observations,
not regimental personnel returns (OR I-II pp.56-57).

Bate's June 11 account places one of his companies in a battery, the rest in
reserve, with Walker's battery and rifle/mounted support details. His further
request about a promised field battery is not proof another battery had joined.
Cluskey's June 1 account names Captain Hunt's **Carolina Greys** at a new battery;
it is a detail from Bate's regiment, not another regiment lot (OR I-II pp.57-59).

**Lynch and other naval officers command the fixed batteries**, while Bate
commands the covering force until Ruggles arrives (OR I-II p.56). Lee's June 15
statement gives **twelve guns at Aquia** in aggregate (pp.927-928). No personnel
strength or separate crew allocation was recovered. A later municipal historical
preface identifies the local Thirtieth Virginia and the Fredericksburg Artillery
under Carter M. Braxton, but supplies neither a June return nor the exact join
needed here (*Fredericksburg Ordinances*, 1883, historical preface printed p.16,
reformatted transcription PDF7). Those remain identity candidates.

Holmes's June 5 assignment is SO64 IV (OR I-II p.907); his June 15 own letter
proves he has arrived by then, without fixing his arrival day. He offers
**three volunteer regiments and two batteries**, after leaving a proposed
**500-man** battery guard; he does not enumerate the units or report their men.
Lee's reply is June 17, and Holmes's distinct objection to Beauregard's
detachment suggestion is June 18 (pp.929,932-933). Brockenbrough is reported at
Mathias Point on June 17 without a numbered-regiment return (p.932).

Later controls do not fill the June blanks. The July 6 reply approves the
Virginia-regiment organisation Holmes made, without printing the original
organising paper (pp.963-964). On July 10 Holmes gives about **1,500 men and a
battery** at Mathias Point: a place-force estimate, not a June regimental return
(p.973). The July 17 orders request three regiments and a battery while leaving
Ruggles in the district (pp.980-981). Holmes's July 26 report names **two**
regiments that marched, Second Tennessee and First Arkansas, with Walker's
battery. Its wording "Wednesday, the 18th" is retained as a weekday/date
conflict. Scott's cavalry appears in the July pursuit, not a proved June join
(pp.565-566).

**[I] 0108 disposition:** preserve the ten candidate/component rows with their
overlaps; admit no new men. Exact raising post/person, call/act, service term,
stragglers, joining day and dated June personnel strength are blank wherever
unrecovered. The Third Virginia-regiment identity and company membership are
still incomplete. The record does not support an exhaustive exact June return
or three average-sized infantry lots. The CSVs expose that limit rather than
pretend that the proposal itself is such a return.

## 4. The original Preston lot

The May 10 order describes **seven companies** in Preston's battalion, intended
to grow into a regiment (OR I-II p.826). The enclosed SO39 names **J. F.
Preston** (p.879, image inspected). Bonham's May 25 report says seven companies
of Preston's command **have gone to Harpers Ferry**. Its **600 infantry** are
the troops remaining at Manassas, not Preston's battalion strength (p.42,
image inspected).

The June 1 numbering order distinguishes the formed Fourth under **James T.
Preston** (as printed) from the prospective Twenty-eighth under **Robert T.
Preston** (OR I-LI.2 p.123). The early J.F./later printed J.T. initials must be
kept visible; they do not authorise conflating all Prestons. Early's different
May report says nine companies sent from Lynchburg numbered **640 besides
commissioned officers** and explains assigning Preston after Radford preferred
cavalry. It does not identify the original seven-company contingent or give its
headcount (pp.111-112). Cocke's later brigade lists a Preston regiment by surname
(OR I-II p.944), also not a return for the original lot.

**[I] Ruling:** **no pre-battle numerical return for the original seven-company
battalion was recovered in the sources searched/read.** Keep its strength
unknown. Reject 600, the later nine-company 640, or a later Fourth/Twenty-eighth
return as automatic replacements. The original lot's possible relationship to
the Harpers Ferry contingent and its model retention under Manassas require
company-level identity/transfer evidence. This narrows S86's R.T.-Preston
candidate; it does not silently edit that earlier packet or the pack.

## Proposed rulings and verification

**[I] Recommend:** retain the independent January organisation leg, the earlier
Moore financial context and their exact limits; preserve unknown strengths and
overlap holds. Reject replies as conditions, absence of a provision as proof of
absence of all authority, January facts asserted unchanged in July, warrants as
cash balances, aliases inferred from surname/number alone, and adding men to
make a field menu dispatch. No new eligibility mechanism or S115 design is
proposed here. Acceptance/application and subsequent measurement belong to the
lead and later build lanes.

The final evidence inventory was settled before this verification/handover
closeout. The focused audit passes **153/153 checks**, including CSV/source-key
closure, retained-source hashes, required unknowns/exclusions, model counts,
branch and preservation of **all 1,857 original tracked files byte-exact**.
All four workspace aliases resolve locally. Typecheck exits **0**; the bounded
startup check passes **9/9** (exit **0**, 24.136 seconds). Commands, logs/exits,
runtime inventory, preservation manifests and recovery proof stay in
`runs/s114/`. The ordinary hook remains the commit gate; its actual outcome is
reported in the sole CODEX append, never presumed in this pre-hook note.

No reference run, timing campaign, package build, liveness/done-check campaign
or review is repeated for research-only additions. S111's measurements are
reused only as frozen model context; **no new coverage, strength or 1A credit**
is claimed. Formal whole-branch and gate review remain deferred under
0106/0107. Nothing is signed or cleared for main.

## For the lead

1. Resolve the brief's Alabama/Louisiana wording and retain only the identified
   person's own evidence for C03. Rule on the narrow January organisation leg;
   retain the missing exact camp-finance and extra-state legal grounds.
2. Route a later identity/transfer decision for Holmes using the full origin
   audit, with no duplication of State aggregates. The exact third-regiment
   and local-company return remains a research hold.
3. Recover the original Preston companies' return/transfer before changing
   `state-forces.va_manassas_preston`; the newly read departure makes the
   existing surname join unsafe.

## Findings outside my scope

Application, source-hold closure, troop assignment/creation, new field
eligibility, C14's missing original/identity, S112/S113/S115, any change to C15's
causal chain, new coverage/strength/1A measurements, formal reviews and
signatures, main integration, release and pushing.
