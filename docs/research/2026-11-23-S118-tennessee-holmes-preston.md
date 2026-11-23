# S118: Tennessee's transfer lot, Holmes, and Preston

For the lead: 3 items. Research only on `sprint/research-military`, from
`03ebb249d2569dc46d1efae92179ffde6ea1286b`. Read the new S118 handoff and
decisions 0108 and 0124 in main. Read the pack at
`a360803f7bd02dacce450fded56f6c749dab991f` in `C:/Pyrrhic/sprint-july` first.
No pack, code, accepted-decision, source-hold, strength or signature change.
Other worktrees read only; the sole permitted write outside this worktree is
the requested final, fresh-read UTF-8 Python append to main CODEX.

**The whole Tennessee lot has no historical basis at Harpers Ferry.** The
July 2 tender gives numbers of units, not 22,000 infantry or 2,000 cavalry.
The read transfer correspondence distinguishes authorization, tender, a
procedure for receiving verified rolls, the July 31 State order, actual control,
and still unfinished formal musters. Bate's regiment was already in Confederate
service before that tender. Fagan is outside Arkansas's later State pool; his
precise alias to the generated April-call lot still needs a lineage ruling.
The original Preston seven-company component cannot remain a permanent,
independent Manassas battalion after the reported departure for Harpers Ferry.

## Packet and evidence limits

- [Lot candidates](S118/lot-candidates.csv): 34 historical identities, components
  and controls, in 0108's lot fields. These are **not 34 additional units**.
- [Receiving commands](S118/receiving-commands.csv): seven distinct receiving or
  retained-command groups, including the two early Virginia commands.
- [Corrections](S118/pack-corrections.csv): ten proposals against exact pack
  identities, with remaining holds.
- [Model audit](S118/model-audit.json): frozen inputs, retained S116 State,
  affected lots, service origins, assignments, locations and concentration rule.
- [Reading receipts](S118/source-reading.json) and [retained text](S118/read/):
  page locators, URLs, hashes and provenance. Raw downloads/scans, scripts,
  searches and verification logs remain in ignored `runs/s118/`.

**[M]** means the frozen model or retained output; **[R]** a retrospective
veteran account; **[I]** an inference or proposed application. Historical dates
below are evidence, never instructions to create or move troops by the calendar.
Blank quantitative fields mean unknown. Company counts, gun counts, legal
establishments, proposals and command totals are not interchangeable returns.
Only one numerical personnel observation is entered in the lot table: Fagan's
900 on May 27; it is not a June or July strength.

The OR is an official later printing of contemporary papers, sometimes with
later reports. Selective OCR/text passages were read, not entire volumes.
Lindsley's *Military Annals* (1886) contains named veterans' histories; Head's
*Campaigns and Battles* is a retrospective participant narrative; Bevens's
*Reminiscences* (1913) is a company veteran's recollection. They supply unit
identification and additional placements, visibly [R], without overriding a
dated contemporary order. Their celebratory judgments and explanations of the
war are not adopted or turned into traits, values, motives or simulation inputs.

Initial I-I/I-LII.2 leaf offsets and Lindsley's unreliable automatic page
metadata were rejected against printed heads before delivery. The retained
packet uses corrected locators. Two new page images were inspected headlessly:
Lindsley p.132 and Head p.24. The latter resolves OCR `2pth` as **29th**.
Search summaries and failed downloads contribute no facts. No real browser,
Computer Use or desktop control was used.

## 1. How the pack produces and places the Tennessee lot

[M] `situations/tennessee_forces_transferred.json` fires from day116, June29,
subject to the secession flag. It proposes three State-force entries at
`st_gov_tennessee`, initially unknown in count and men. The infantry source act
is `tennessee_forces_transferred`, with unknown service term.
`tennessee_forces_return.json`, from day119, July2, supplies **22 regiments and
22,000 men** to the infantry entry and **2 regiments and 2,000 men** to cavalry.
Artillery stays unquantified. These are distinct authorization and return
situations, but the former is already treated as a service entry in State.

[M] The Confederate concentration in `pack.json`,
`rules.ruleSeats.principals[1].concentrations[0]`, asks
`st_gov_tennessee` for troops for `cs_cmd_harpers_ferry`, citing the two
Tennessee regiments in Johnston's June30 roster. Its stated policy allows actual
model lots, including aggregates; it does not restrict the Tennessee sender to
Turney and Vaughn. That policy is an allocation inference, not historical proof
that every later State lot belongs to Johnston.

[M] The retained S116 final State (day148) confirms the lead's observation:

| Block | Composition | Assignment and position |
|---|---|---|
| `state-forces.cs_tn_infantry_tennessee` | one unidentified lot,22,000 men; service origin June29,22 regiments | `cs_cmd_harpers_ferry`; Harpers Ferry since139, marching on148 toward Loudoun/Fauquier |
| `state-forces.cs_tn_cavalry_tennessee` | one unidentified lot,2,000 men | same assignment and march |
| `state-forces.cs_tn_artillery_tennessee` | unknown men | Harris at Nashville |
| `raised.st_gov_tennessee.d127` | three generated1000-man April22-call lots,365-day term | Johnston; Harpers Ferry since146, marching148 |

This is inspection of retained S116 artifacts, **not a fresh simulation**.
The frozen pack and retained artifact hashes are in the model audit. The
24,000 is the model's infantry/cavalry arithmetic; neither the resolution nor
the tender supplies that personnel total. It must not become a historical
balance from which named regiments are subtracted.

### What the transfer actually says

The **June29 resolution** authorizes and requests the Governor to place the
State's volunteers at Confederate disposal, to be mustered under Confederate
rules, with State defense under the President's direction. It names no strength,
receiving field army, destination or accomplished muster (OR IV-I p.411).

**Harris, July2**, tenders the provisional army and proposes its muster:
22 infantry regiments,2 cavalry regiments,10 artillery companies, engineers,
ordnance and other departments. He names Pillow, Anderson, Zollicoffer,
Cheatham, Foster, Caswell and Sneed. He reports no completed field batteries,
distinguishing work in progress from stationary river batteries. He gives no
returned personnel number or allocation among those commands (OR IV-I p.417).

**July4 SO88** defines Polk's Department No.2, headquartered at Memphis,
including the stated western/southern Tennessee territory and other named
areas. This is a territorial assignment, not all Tennessee (OR I-IV p.362).
**July5**, Cooper directs Polk to arrange the receiving time with Harris and
detail officers. The enclosed instructions require rolls made at the units'
several camps and stations, verified by Confederate officers and transferred
to the designated receivers as the basis for future musters (pp.362-363).
Polk's muster delegation does not locate all troops at Memphis or make his
territorial command statewide [I].

On **July20**, Polk says Harris still needed correspondence with the President
before acting (p.371). On **July23**, Polk reports Harris's consent to particular
operations in Missouri while the general transfer remains pending; he orders
Pillow's proposed6000-man column from the western district. This is permission
and an operation, not the tender's troop-by-troop receipt (OR I-III p.612).
**July26**, Walker explains roll inspection/transfer, the different handling of
State staff and regimental versus company/battalion transfers (OR I-IV p.375).

In his **September28 retrospective account**, Harris identifies his general
order of **July31** as completing the State's required action and says almost
the whole army had been under Confederate officers' actual control from then;
roll verification for a considerable part was still unfinished. His **August3**
letter had expected completion within days. **Benjamin, October4**, accepts
July31 for Confederate pay regardless of formal muster date, while payment
itself requires muster (OR I-IV pp.379,431,436). The original July31 general
order and individual verified receipts are not read here. July31 is an attested
State-transfer/pay date, not a universal physical arrival or proof of receipt
by Johnston [I]. Under0124, keep each receiving event distinct from the
Governor's authority over forces that have not yet transferred.

### Regiment lots and the receiving-command remainder

The CSV distinguishes **22 numbered Tennessee research rows plus a separate
Knox Walker control**. These are not Harris's22: T01-T03 are early direct
Confederate regiments, and the remaining reconstruction is incomplete. No
exhaustive22-name tender roster or numerical distribution among commands was
recovered. A control named by a later consolidation history is not a proved
member of the July2 tender. Do not fill the gap by counting numbered rows [I].

The placements support separate groups, with exact joins blank unless stated:

| Receiving/retained command | Named components supported by the read passages |
|---|---|
| Sneed river brigade, western command; later Polk/Pillow | Neely's Fourth: Randolph after May20, embarkation for Fort Pillow July18 [R] (Lindsley pp.183-184). Wright's Thirteenth: Randolph, brigade ordered New Madrid July26 and promptly moved [R] (pp.313-314). |
| Cheatham / Union City, western command | Travis Fifth: Union City a few days after May22, drilling until September4 [R] (pp.195-196). Stephens Sixth: State muster May15, Union City May26 [R] (pp.204-206). Douglass Ninth: last May for two months, first march August1 [R] (pp.267,273). Russell Twelfth: State muster Jackson May28, Union City a week or two later for summer [R] (p.307). Carroll Fifteenth: Jackson June7, then Union City until August [R] (p.332). |
| Middle Tennessee State camps; national receiver unresolved | Brown Third: Camp Cheatham until July26 order to Trousdale [R] (pp.175-176). Palmer Eighteenth: formed June11, Camp Trousdale until September17 [R] (pp.360-361). Brown's later grouping is not a completed July26 join. |
| East Tennessee, distinct from Virginia-bound troops | Rains Eleventh: Camp Cheatham through late July [R] (pp.292-293). Newman Seventeenth: State companies May5, regiment June11 [R] (pp.347-348). Battle Twentieth: Bristol in July [R] (pp.382,384). Contemporary Anderson letter places all three at Haynesville/Bristol July28 (OR I-II p.1005). Cummings Nineteenth: scattered East Tennessee bridge guards, collected at Cumberland Gap about July1 [R] (Lindsley pp.372-373). |
| Virginia-bound Anderson/Donelson force, later northwest | Maney First, Hatton Seventh, Forbes Fourteenth, Fulton Eighth, Savage Sixteenth: distinguish as below. |

The western and middle groups cannot be collapsed into a Johnston pool. Nor
does the eastern remainder all go to one newly invented field post [I]. On
July31, Zollicoffer reports conflicting orders for Fulton/Savage and proposed
onward travel by Newman/Battle; **August1** orders him to retain Tennessee
regiments at Bristol and assigns the East Tennessee district. Do not backdate
that assignment or assume the proposed travel occurred (OR I-IV pp.377-378).
The CSV retains unit-specific unknowns and separates the command groups without
inventing their missing strengths or distributing unnamed men between them.

### Which Tennessee regiments reached Virginia

- **Turney First:** Harris says it left Winchester, Tennessee, for Lynchburg
  the preceding night on May2 (OR IV-I p.275). Lee's June1 letter continuing on
  p.898 names Turney's Tennessee regiment and directs it to Johnston; June6
  reports a Tennessee regiment's arrival at Winchester (OR I-II pp.898,908).
  The latter linkage is [I], not a named receipt. June30 places First Tennessee
  in Bee's brigade (p.470). Lindsley's numbering explanation separates Turney
  First Confederate from Maney First Tennessee [R] (p.129).
- **Bate Second:** May25 SO119 orders it to Fredericksburg next day; Ruggles's
  June1 report places it there/in the Aquia covering force and relocates it to
  Brooke Station (OR I-LI.2 p.107; I-II p.56). Blackmore recalls Confederate
  muster at Lynchburg about May12 [R], printed p.132, scan inspected. Thus it
  was outside the later State tender, not a component to extract from22,000 [I].
- **Vaughn Third:** Johnston's later report places its arrival at Winchester
  by June13; June30 roster puts Third in Elzey's brigade (OR I-II pp.472,470).
  Lillard recalls departure Knoxville June2, Confederate muster Lynchburg
  June4, Winchester June13 [R] (Lindsley p.137). Keep Brown Third separate.
- **Maney, Hatton, Forbes:** Anderson reports them **already at Staunton on
  July28** (OR I-II p.1005). Their exact Virginia entry days remain unknown.
  Robinson recalls Maney leaving for Virginia July11, then Johnson City until
  July21 [R] (Lindsley p.156). Moore recalls Hatton's mid-July departure and
  Millboro about August1 [R] (pp.227-228). McCulloch says Forbes's intended
  Manassas movement was halted at Haynesville, where news of the battle came,
  before rerouting northwest [R] (p.323). Destination is not participation.
- **Fulton:** only **part** at Lynchburg July28; the rest was expected, not
  reported arrived (OR I-II p.1005; identification Eighth in Lindsley p.265).
- **Savage:** Anderson expected arrival July28; Head reports actual Lynchburg
  arrival **July29** [R], printed p.24, scan inspected. Head's July21 start and
  Dillard's July23 order differ [R] (Head p.23; Lindsley p.335). Preserve the
  difference. None supports arrival for the July21 Manassas battle.
- **Newman, Battle, Rains:** the read July28 and31 papers place them in East
  Tennessee or proposing travel, not in Virginia. No arrival inferred.

## 2. Holmes: overlap, components and joining days

**Bate is outside the July Tennessee State pool.** His earlier Confederate
muster and May25/June1 orders/presence provide a different origin. Harris's
April30 reply explicitly connects the three-regiment preparation to the
April22 requisition, and his May2 letter names Turney, Bate and Maney (OR IV-I
pp.272,275). This makes the generated April-call block the overlap to examine,
not permission to create Bate on top of both that block and the State pool [I].
Which generated lot carries which identity still requires a ruling under0108;
the model's days are not the historical muster dates. Catalogue `tn_2_infantry`
exists but no actual named Bate lot occurs in the retained State [M].

**Fagan is outside Arkansas's July State pool.** The July15 transfer enumerates
Cleburne's First, not Fagan's (OR I-III pp.609-610). Early reports Fagan's
regiment already mustered Confederate at Lynchburg on **May27,900 strong**;
Ruggles places it at Camp Jackson on June4 (I-LI.2 p.115; I-II p.57).

The April-call comparison is more precise than matching a number. Walker's
April22 request to Rector is on p.687. Rector answers he has no power to comply.
Flournoy's April23 tender expressly substitutes volunteers complying with that
same requisition, with the dispatch passed to him by Rector; Walker accepts
Flournoy's regiment for Lynchburg muster (I-I pp.687-688; I-LI.2 p.26). Bevens
recalls the Governor transmitting the colonel vote, then the company's May9
Memphis arrival and Virginia route, but does not identify Flournoy as the
regiment's former designation [R] (*Reminiscences*, pp.7-8,10).

**Proposed ruling [I]:** treat Fagan as a candidate fulfillment of the April
requisition, with `generated.raised.st_gov_arkansas.d79.1` the existing model
representation to reuse or supersede after lineage review. The read originals
do **not explicitly complete the Flournoy-to-Fagan naming chain**. Do not report
that alias as established, and never add an independent900/1000-man Fagan block
beside the generated one. The generated lot remains at Rector's Little Rock
post in the retained State; catalogue identity `ar_1_infantry` does not assign
it to Holmes [M]. This packet resolves the State-pool exclusion; it retains
the exact model-alias hold.

**Walker and the local force:**

- Ruggles's June1 report places Walker's rifled field guns in the preceding
  day's action: present **by May31**, exact joining day and men unknown
  (OR I-II p.56). His battery later marches with Holmes's two regiments
  (p.565). The July21 order's six pieces are guns, not personnel (p.480).
- Ruggles took **four local infantry companies and one cavalry company**
  with Bate to the Aquia area on June1 (p.56). Their names, individual joins,
  headcounts and exact later regimental composition are not returned there.
  His district authority names counties (p.828); May25 permission to muster
  Cauthorn's cavalry if indispensable is not an actual muster (p.880).
- The **Carolina Greys under Hunt** garrison the new battery, explicitly a
  company of Bate's regiment. Retain the detail within Bate (pp.58-59).
- **Fredericksburg Artillery** is named June4; Ruggles says it will be wanted
  at Aquia if attacked. This is a proposed employment, not an arrival, and
  six-pounders do not give crew strength (p.57). Its June captain and join
  are not established by this paper.
- **Aquia fixed batteries** were under Captain Lynch and other naval officers
  in the June1 action. The later twelve-gun statement gives no men
  (pp.56,928). Distinguish naval crews/installations from field-battery and
  infantry lots; Bate's gun detail is not an additional garrison.
- **Brockenbrough at Mathias Point** is named June17; Holmes's July10 estimate
  of about1500 there is a place force with artillery, not a named regiment's
  June return (pp.932,973). Possible overlap with local Virginia companies
  remains open. July6 approval of a Virginia regiment's organisation gives
  no constituent roll or proof that the whole earlier battalion became it
  (pp.963-964). Do not manufacture a Thirtieth Virginia lot from that blank.
- The **two First Virginia companies** are ordered back to Manassas when
  Bate arrives, but execution/join date is absent (I-LI.2 p.107).

Holmes's June5 assignment order, June15 proposal to march with three volunteer
regiments/two batteries while leaving a sufficient guard, and July17 support
orders are distinct instruments. His July26 report names only **Second
Tennessee, First Arkansas and Walker's battery** in the actual march. It prints
Wednesday the18th; preserve that weekday/date discrepancy. Blackmore's later
Bate narrative says July19 and July20 position [R], and even places Holmes over
the June1 force before the read June5 assignment. It cannot silently correct
the contemporary chronology (OR I-II pp.907,929,980-981,565-566; Lindsley p.132).
No date in this packet is a new automatic join.

## 3. Preston after the seven companies left

May10 SO39 names **J.F. Preston**; Lee's associated letter describes seven
companies intended for Manassas, to be enlarged later. On May25, Bonham reports
those seven companies **gone to Harpers Ferry**. The600 infantry are what
remains at Manassas, not Preston's strength (OR I-II pp.879,826,42).

June1 GO24 numbers the Fourth under **James T. Preston**, while the proposed
Twenty-eighth is **Robert T. Preston**. Keep the initial discrepancy visible
(I-LI.2 p.123). June30 return places **Fourth Virginia under Jackson**, and
Beauregard's July battle narrative explicitly names **James F. Preston's Fourth**
in Jackson's brigade (I-II pp.470,486). This supports continuation of J.F.'s
original battalion into Fourth Virginia [I]. It does not supply the original
seven-company roll, an exact Harpers Ferry receipt, or a numerical return.

The surname-only Preston regiment in Cocke's June20 brigade order is a
different question: Robert T.'s own July report identifies his **Twenty-eighth**
and its Manassas service. Early's other force of nine companies640 excluding
officers cannot quantify the original seven (I-II pp.944,549-551; I-LI.2
pp.111-112). Keep the later regiment and its evidence; remove the surname join
that makes it a continuation of the original battalion [I].

**Does `state-forces.va_manassas_preston` belong at Manassas?** As a permanent,
separate original seven-company battalion, **no**: the May25 departure report
contradicts that placement. A corrected history would follow the original
component toward the Harpers Ferry/Jackson chain, with Fourth Virginia as the
supported candidate continuation, deduplicated against the opaque
`state-forces.va_harpers_ferry`. A later return to the Manassas battlefield with
Jackson's brigade is different from remaining under Cocke. Leave exact company
lineage/receipt and men unknown. Do not create seven new companies beside the
existing Harpers Ferry aggregate [I].

## Proposed rulings and verification

Recommend the ten crosswalk corrections for the lead's later build lane,
retaining every stated hold. Reject whole-state command allocation from two
roster identities;1000-man nominal conversions described as returns; a single
June29 completed transfer; calendar arrivals; aggregate-plus-named duplication;
Fagan=Cleburne; Maney=Turney; Brown=Vaughn; and J.F.=R.T. Preston. Specific
mandates and the governor/receiving-command distinction remain0124's, not new
authority invented by this research.

Verification evidence belongs to `runs/s118/`: focused packet audit, input and
byte inventories, workspace-resolution log, startup result, recovery proof,
ordinary-hook commit log/exit and final preservation proof. Final outcome is
reported in the sole coordination append. No new scenario, package, timing,
coverage or 1A campaign is claimed. Formal branch/gate review remains deferred
under0106/0107; the author is not an independent reviewer.

## For the lead

1. Route the Tennessee transfer/quantification and command corrections to the
   next July build; retain the incomplete22-name balance and individual receipt
   holds. None of those blanks justifies Johnston's whole-State lot.
2. Rule on reuse of the generated April-call representation for Fagan and Bate,
   and route exact volunteer/regiment naming and local-company returns where
   needed. No new force may be added on top of the pools.
3. Route the Preston identity/placement split with deduplication against the
   Harpers Ferry lot; retain the original battalion's unknown headcount.

## Findings outside my scope

Pack/code application, call-delivery fidelity, completed muster-roll recovery,
all22 tender identities, Flournoy-to-Fagan naming original, exact Virginia
company lineage and joins, new posts/cast/mandates, strength fitting, C03/C05/C25
credit or source-hold closure, other sprint lanes, formal review/signatures,
main integration, release and pushing.
