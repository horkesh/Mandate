# S140: the basis of muster timing

For the lead: 4 items. **S140 only**, `sprint/research-military`, base
`203ebd77fc8b3b1099dc0f3b1628b7758d80b242`. Research and a proposed ruling;
no pack, production code, accepted decision, number, band, criterion or hold
changes. Decisions 0125 and 0127 remain controlling.

**Recommend a received call whose regiments muster separately as they become
eligible and ready, with each accepted service component retaining its own
contract clock.** The records reject a universal five-day interval, simultaneous
muster of every regiment answering a call, and a fresh full term at every
transfer. They do **not** supply a national probability distribution or enough
receipt/muster pairs to replace every call profile's timing numerically.

The empirical part remains incomplete. The packet reports its observed
distributions and missing cells; it does not describe missing receipts or
State-wide first/last musters as recovered. These are unfinished S140 research,
not evidence that the records or units did not exist.

## 1. Receipt to muster: distributions at the record's scope

The packet contains **61 muster observations in twelve States**, **14 receipt
or receipt-bound records**, and **25 State/call-family groups**. The forty
side/State-or-national cells and all **100 committed model call profiles** have
coverage dispositions. A context match is not a demonstrated individual
call/lot join. Components, company ranges, conflicting records, an issued order
without a received date, and a programme spanning two requisitions stay separate.

- [call-receipts.csv](S140/call-receipts.csv): dates, medium/bounds, issuer-side
  context and the actual page for each receipt claim.
- [muster-observations.csv](S140/muster-observations.csv): dated regimental,
  company and field/staff records, places, terms, receipt links, conflicts and
  elapsed-day arithmetic. No strength is inferred from these dates.
- [distributions.csv](S140/distributions.csv): each State/call group, its sample
  population, point values or bounded intervals, first/last observed units and
  places, with every contributing page.
- [state-coverage.csv](S140/state-coverage.csv) and
  [profile-coverage.csv](S140/profile-coverage.csv): observed endpoints or explicit
  gaps for every inventoried cell/profile, including unsampled States and call
  kinds. The profile inventory is model scope, not a historical census.

Elapsed days are ordinary date subtraction, with receipt day zero. For date
ranges, the lower bound is earliest muster minus latest receipt; the upper is
latest muster minus earliest receipt. A range does not mean events occurred on
every intervening day. Medians use only point observations of the same declared
State/call group at regimental record scope. No national or cross-arm mean is
computed, and none of these dates is a proposed historical-name trigger.

| State and call | Read receipt and musters | Distribution and limits |
| --- | --- | --- |
| New Jersey, April militia | Written requisition received April 17; Third/Fourth April 27, First April 30, Second May 1, all at Trenton. | From **written** receipt: 10,10,13,14 days. Earlier operative notice is bounded April 15–16 because the Quartermaster-General already discusses the requisition April 16: operative intervals 11–12,11–12,14–15,15–16. Do not substitute mail receipt for first notice. OR III-I pp.68,73,83; Stryker I pp.15,28,40,53. |
| New Jersey, May volunteers | Requisition and GO15 received May 17; Governor reported three regiments ready May 18. First mustered May 21, Second May 26, Third June 4, Camp Olden, Trenton. | **4,9,18 days; n=3, median9**, for the specified three-regiment cohort. Readiness did not produce one simultaneous muster. Stryker I pp.[67],68,102,150. |
| Iowa, May volunteers | Telegram received May 17; GO15 received May 18, while written requisition had not arrived May 21. Second's companies mustered May 27–28, Third's June 8 and10, at Keokuk. | **10–11 and22–24 days**, two regiments with company ranges, no point median. The Second's roster header May28 does not erase Company A's May27. OR III-I pp.220–221; Iowa AG, *Roster and Record* I pp.91,98,101,283. |
| Vermont, April militia | Governor answered April15; First mustered May8 at Rutland. | **23 days; n=1**, not a State constant. OR III-I pp.73,84; Vermont revised roster p.5. |
| New Hampshire, April militia | Response dated April16 to April15 call; First mustered by companies May1–7 at its Concord camp. | **15–22 days**, bounded receipt and company range. May14 equipment readiness and May25 departure are different events. OR III-I pp.68,73; Ayling p.1. |
| Michigan, April militia | April16 State proclamation answers the federal requisition; First mustered May1 at Detroit. | **15–16 days**, receipt bounded April15–16. Robertson pp.165–166. |
| New York, April militia sample | April18 acknowledgement of April15 requisition; Eighth April25 at Washington, Seventy-first May3, Sixty-ninth May9. | Bounds **7–10,15–18,21–24 days**; inferred cohort linkage, not an exact received named-unit acceptance. A later station is not an attested muster site. OR III-I pp.68,85; Phisterer I pp.556–557,673–674,690–691. |
| Louisiana, April volunteer programme | Grivot gives receipts April18 and21; Second/Third mustered May11. | Programme-join bounds **20–23 days** for each, **excluded from exact-call statistics**: no allocation of each regiment to one of the two requisitions is established. His first reproduced proclamation is dated April17, earlier than his stated April18 receipt. OR IV-I pp.747–749. |

The point sample outside New Jersey's May cohort is only Vermont's First.
It cannot establish a national shape. Connecticut, Massachusetts and Rhode
Island supply useful **component** evidence, not three additional whole-regiment
point samples: First Connecticut field/staff April23 and selected companies
April22, Fifth Massachusetts roster Company B/C entries May1, and First Rhode
Island field/staff May2. The federal register describes **organization**, not
an interchangeable performed muster: Connecticut April22–23 and Rhode Island
May9. Connecticut's Company E heading separately says **April19**; retain that
disagreement, rather than silently replacing either source. CT official
catalogue opening, pp.4,12; Massachusetts *Record* I p.19; Rhode Island official
register p.9; U.S. *Official Army Register*, Volunteer Force, I pp.300,303.

### Where the first and last observed regiments mustered

These are **sample endpoints**, not claims about every regiment a State raised
in1861. A State-wide census and many exact receipts remain unestablished; the
CSV names those gaps. Within the complete specified New Jersey cohorts, both
ends are recovered as above.

| State | First / last in the regimental reading sample | Place and pages |
| --- | --- | --- |
| Maine | First May3 / Thirteenth and Fourteenth December31 | Portland / Augusta; AG1861 Appendix F pp.2–3. Fifteenth has no muster date in the table. The table's First May3 conflicts with the Governor's statement of an April muster (OR III-I p.221; p.150 already calls it mustered on May3). Keep both. |
| New Jersey | Third/Fourth militia April27 / Ninth's last company October15 | Trenton / Camp Olden, Trenton; Stryker I pp.40,53,430. Ninth's first company was September13; not a whole regiment on that day. Later-year sample incomplete. |
| New York | Eighth militia April25 / Thirteenth Volunteers May14 | Washington / Elmira; Phisterer I pp.556–557; III pp.1887–1888. Different kinds of three-month federal service; not a State-wide endpoint. |
| Michigan | First May1 / Third June10 | Detroit / Grand Rapids in narrative context; Robertson pp.166,206. Second May25 at Fort Wayne near Detroit, p.188. Fourth not recovered as a performed muster here, so the May quota's last regiment remains open. |
| Iowa | Second companies May27–28 / Third companies June8,10 | Keokuk; Iowa AG I pp.91,283. These are the two-regiment second-call cohort, not Iowa's first and last of1861. |
| Vermont | First May8 / Second June20 | Rutland / Burlington; revised roster pp.5,27. |
| New Hampshire | First May1–7 / Second June1–8 | Concord / Portsmouth in camp narrative; Ayling pp.1,25. Second's early April recruitment and later three-year muster are separate. |
| Louisiana | Second/Third May11 / Eighteenth October5 | Muster sites **not stated** in these passages. Eighteenth's station above Carrollton does not establish its muster site. AG report in OR IV-I pp.749–751. First's April29 transfer is not silently relabelled a muster. |
| South Carolina | Second May22–23 / Fourth June7 | Second's muster site not stated; field/staff May24 roll at Camp Davis near Richmond is a different record. Fourth: Columbia. Salley II pp.[1],570. Third: Columbia June6, p.284. Original State call predates1861. |

For Connecticut, Massachusetts and Rhode Island, only selected components
establish muster dates/places at the scope just described; **State first/last
regimental musters are not established by this sample**. Twenty-eight of the
forty inventoried side/State-or-national cells have no muster sample. All later
1861 Union authorizations, the new Regular arms, Confederate March/April
readiness and activation families, reserve/cavalry calls and State transfers
still need further received instruments and original rolls at their own scope.
Their model citations in the coverage CSV are not claims that their historical
receipt/muster pairs were read.

Maine's dated table is usable for timing and place even though its strength
columns include accessions through January31,1862. Its later infantry dates
are June4,15,24; July15; August21; September7,22; October4; November12,20;
December31,31. The first cavalry dates October31 at Augusta and remains a
separate arm control. Do not assign all of these to the one additional regiment
in the May quota, or convert the cumulative men into original musters. Maine
AG1861 Appendix F pp.2–3; OR III-I p.204.

## 2. The service clock, including the three separate cases

[service-terms.csv](S140/service-terms.csv) preserves S137's fourteen named
service cases, their actual departure/discharge evidence and limitations.
[term-clocks.csv](S140/term-clocks.csv) adds the read governing explanations
and exceptions. **Contract expiration, permission/departure for home, and
administrative muster-out remain different events.** A discharge date alone
does not prove the exact contractual expiration day.

**Union three-month service.** The April requisition says three months unless
sooner discharged and provides for muster by a U.S. officer. The War
Department's July16 explanation explicitly starts volunteers' terms on muster
into U.S. service by the proper officer. The July24 relief act describes the
ninety-day men's federal clock the same way but permits payment back to State
company organization/acceptance. It does not rewrite the federal muster date.
OR III-I pp.68,332,403. Indiana's six colonels separately describe their existing
three-month service as running from April27; their May21 tender of further
service is not itself acceptance or a new muster (p.220).

**Do not silently equate every “three months” with90 elapsed days.** New York's
SO321 explicitly gives the Twelfth's expiration as **August13**, after its
May13 federal muster: **92 elapsed days [calculation]**. That is a read named
contract endpoint. It is neither permission to apply92 to every regiment nor
evidence that administrative discharge always falls exactly at expiration.
OR III-I p.391; Phisterer III p.1873.

**Second Maine.** The April25 State act enlisted it for two years. The State
1861 report says federal service for three years; its table dates the federal
muster May28 at Willett's Point. The federal register describes two- and
three-year service and records June9,1863 discharge of the two-year men, with
the remainder transferred to the Twentieth. The exact initial federal
acceptance/individual contracts remain needed. This is no90-day case and no
authority for a fresh whole-regiment extension. Maine AG1861 p.6, Appendix F
pp.2–3; U.S. Register I p.14.

**Twelfth New York.** State acceptance/numbering May8 for two years; federal
muster May13 at Elmira for three months. The August2 order directs further
service for the **unexpired State enlistment** after the initial federal term
expires August13. It does not start another full two years on August2. Later
three-year companies and the two-year men's May1863 release remain separate.
Phisterer III p.1873; OR III-I p.391.

**Thirteenth New York.** State two years, numbered May8; federal three-month
muster May14 at Elmira; August2 order for the unexpired State term. Phisterer
gives the later regimental discharge on May12–14,1863 and distinguishes the
remaining three-year companies. Do not copy the Twelfth's printed August13
expiration into this case or merge it with the Thirteenth Militia. Phisterer
III pp.1887–1888; OR III-I p.391.

**Confederate service has more than one start rule.** The March6 volunteer act
expressly provides twelve months **after muster**, with its militia provision
separately no more than six months after muster. The February28 reception of
State forces preserves their enlistment terms. Third South Carolina Company B
is a concrete component example: State enrollment April14 for twelve months,
Confederate muster June6 for **ten months and eight days**. A fresh year at
transfer would contradict that read term; the component cannot supply the
whole regiment's contract. OR IV-I pp.117,126; Salley II p.318.

## 3. Proposed rule form [I], for the lead to rule on

**Replace the call-wide instant with an ordered, call-specific muster process.**
Its profile grain is side, issuing/receiving authority, call kind, arm,
organization and effective acceptance conditions; State is relevant context,
not a universal national-character multiplier. Keep source evidence distinct
from generated output, as0125/0127 do for strength.

1. **Receipt and eligibility first.** Record when the operative instrument was
   received and which existing organizations/men can answer. An April readiness
   instruction does not itself authorize active muster: Walker's April8 letter
   defers pay until muster, and April22 expressly bars mustering conditional
   companies until an absolute call. March9 can instead require muster after
   arrival at destination. OR IV-I pp.135,211,232–233. Preserve already assembled
   companies: Iowa's Second/Third and New Jersey's three May regiments were not
   recruited from nothing on receipt (Iowa AG I pp.91,283; Stryker I p.[67]).
2. **Muster in separate tranches at the existing lot/component grain.** A
   received call starts or releases preparation; each eligible regiment has
   its own readiness and available muster opportunity. When a profile has
   enough paired evidence, its relative cumulative muster observations can
   constrain that process. Keep company ranges when the source requires them.
   Do not force one day between regiments: simultaneous musters also occur.
   Report the reasons for each actual delay, with deterministic ordering and
   existing ownership boundaries preserved. This is a mechanism proposal,
   **not** an approved set of new timing numbers or an invented uniform random
   distribution.
3. **Acceptance and terms gate actual muster.** Prepared troops can wait for a
   mustering officer or acceptable terms; readiness is neither muster nor
   departure. Scott expressly tells Massachusetts it will be mustered after
   arrival (OR III-I p.74). Louisiana's changing twelve-month/war acceptance,
   disbanding and late reversal have real effects; preserve the report's own
   May25/26 sequence conflict rather than repairing it from memory (OR IV-I
   pp.749–750). Kelly's June12 acceptance is an **issued** instrument, not a
   read recipient receipt, even though the Eighth's muster is June15
   (OR I-LI.2 p.138; IV-I p.750).
4. **Each accepted service component keeps its own clock.** For a newly raised
   federal volunteer it normally starts at its actual muster under the read
   rule. State transfers preserve prior service/remainder when the contract
   says so. A later enlistment/continuation needs its own received authority
   and actual acceptance; no blanket extension. Preserve term units and named
   endpoints rather than silently turning months into fixed90-day values.
5. **Leave unsourced profile timing explicit.** New Jersey's4,9,18 and Iowa's
   ranged dates support staggered process, not importing their numbers into
   every State, regular regiment, arm or Confederate call. Before numerical
   application, recover the missing receipt/muster pairs or obtain a separately
   declared provisional rule ruling. This packet closes no missing-record hold.

The committed July implementation already calculates generated service ends
from muster. At `5c4a9d83`, `tick/recruitment.ts` lines154–171 gives a whole levy
one `day + musterDays + delayDays`; lines271–295 creates its block/enlistment
together. Separately read `forces/enlistment.ts` lines118–133 preserves the
muster anchor on renewal. Thus **“count from each lot's own muster” alone
does not remove synchronized expiries if every lot still shares the same
muster**. Proposal: change when the component really musters, retaining its
actual term basis, rather than add days to the common expiry. These are model
claims from [five committed inputs](S140/committed-inputs.json), read exclusively
with `git show`, not historical claims or a code change.

Rejected alternatives:

- **One universal interval or one interval per State.** The same State/call
  produces distinct dates; State and federal musters also differ within a unit.
- **One constant per call followed by simultaneous completion of every lot.**
  It retains the demonstrated within-call synchronization problem.
- **An automatic uniform spread, normal curve, fitted midpoint, or importing
  New Jersey's median everywhere.** The read sample cannot identify those
  distributions or a national rate. Spread must follow the accepted process
  and profile evidence, not merely make the desired battle roster survive.
- **Starting the service term at national proclamation/receipt, or restarting
  every transferred regiment at Confederate muster.** Both erase read contract
  distinctions. Conversely, blindly starting every term at the last muster
  would also erase State remainders.
- **Scheduling historical identities on archived absolute dates, giving all
  fourteen an extension, or subtracting/adding days to reach July19/21.** A name
  acquired by a generated lot does not replace its history or contract.

Future paired acceptance cases, **proposed and not executed**: two eligible
regiments of one fictional call muster separately when one is delayed; a
pre-existing prepared company versus a newly recruiting one; readiness-only
versus received absolute activation; absence versus availability of a muster
officer; new enlistment versus transfer of a remaining term; accepted versus
unaccepted continuation; a three-month named endpoint versus an explicit
ninety-day contract; identical inputs with a different desired battle date
produce identical musters. Same seed/order/save-resume must reproduce each
actual event. These are requirements for a later build, not test passes here.

## 4. Verification, limitations and routing

The settled data audit passes **6,452 checks**, including source hashes,
references, interval arithmetic, scoped distributions and unchanged bytes for
all **2,241** starting tracked files. The data inventory settled before this
note: **125 files**, 115 retained page passages, 58 source-artifact hashes;
seven local static image inspections, five accepted and two rejected locator
attempts. Final focused audit/staged inventory may add checks for this note;
its actual result is retained under `runs/s140/`. This is integrity validation,
not independent historical review.

Boundary and thirteen pack-rule tests pass, exit0. Four workspace aliases
resolve to this worktree; Node22.23.2. The ordinary commit hook remains
mandatory; its actual exit/output is retained in `runs/s140/commit-hook.log`
and `commit-exit.json`. No campaign, package, timing measurement or newly
claimed1A clearance. S137's service packet and S121's source artifacts are
reused; the S135 simulation is not rerun or certified against a later build.
Provenance, known locator corrections and source limits:
[provenance.json](S140/provenance.json),
[source-reading.json](S140/source-reading.json).

For the lead:

1. Rule on separate musters within a received call and preservation of actual
   contract clocks. This is a form recommendation, not numerical calibration.
2. Keep Second Maine, Twelfth New York and Thirteenth New York as separate
   contract/continuation cases; retain the calendar-unit and component issues.
3. Retain the missing receipt/muster pairs, unread call/lot joins and State-wide
   endpoints as **unfinished S140 research**, with the coverage CSVs as the
   retrieval list. No State/call rate is licensed merely by a coverage row.
4. Route implementation and its fictional paired tests separately. Formal
   whole-branch/gate review remains deferred under0106/0107; requested5.6 worker
   models were unavailable and were not substituted. No review/signature claim.

Outside this brief: S138/S139, production timing/term/strength changes, historical
lot application, battle tuning, criterion or source-hold closure, integration,
release and pushing. Only the final authorized status append writes outside
this worktree, through Python after freshly reading main CODEX as UTF-8.

Findings outside my scope
