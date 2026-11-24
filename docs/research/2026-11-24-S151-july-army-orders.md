# S151: the orders that built the July armies

For the lead: 3 items.

Research only, 24 November 2026, on `sprint/research-authority`, starting at
`3c89d7320eaca9c3dc0bc7fdf9c0ef5706f2d9c4`. The five targets were worked in
the requested order. This is a bounded recovery packet, **not a claim that all
five archives or every governor-to-army chain have been recovered**. Missing
originals, unnamed selections and intermediate receipts remain listed below.
No pack, production code, roster, strength, service-term, policy or decision
change; no S150 implementation or measurement.

## Delivery and use

- [Instruments and witnesses](S151/instruments.csv): **92 records**, ordered by
  target: New York 38, crossing/handover 8, Confederate concentrations 18,
  McDowell onward assignments 13, Patterson 15. These include orders, requests,
  reports of unread orders and later official movement narratives; **92 does
  not mean 92 original sending orders**. Each row supplies issuer/authority,
  addressee, sending/receiving commands, force scope, conditions, dates, paper
  receipt, troop receipt, page citations and identity limits.
- [Identity links](S151/identity-links.csv): **69 distinct keys**, including all
  **49** McDowell inventory keys and all **19** New York bodies in those 49.
  Keys with no new link remain explicit and retain S138/S149 pointers. This is
  an evidence index, not an allocation table or a new army roster.
- [Reading register](S151/source-reading.json): **104 selected primary-reading
  records**, including the authority pages. [Inputs](S151/inputs.json),
  [retrieval and image checks](S151/retrieval-and-image-checks.json), and
  [focused verification](S151/verification.json) retain provenance and limits.

**[H]** means a read historical passage, with its printed page. **[M]** means
the catalogue, inventory or repository. **[I]** means interpretation, including
application of 0124/0126/0131/0133/0134 and identity joins. `authority_basis` is
marked [I]; a staff signature carries the commander's order, not a separate
personal grant. Scott's presidential assignment is read in Richardson IV p.73;
the Regulations distinguish commission from assigned duty and prescribe the
order/staff/intermediate-command chain (1857 Regulations pp.2–3,57–60).
Mansfield/Patterson are assigned by GO12; McDowell by GO26 (OR I-II pp.607,653).

The readings are selected official printings, mostly OCR or PDF text, not
autograph originals or complete-volume collation. The scope column gives
selected terms, sometimes with elisions, expanded numbers or a named-list
summary; consult the retained page for the complete wording. A report's date
and the earlier event it reports occupy separate columns. A 1912 State register
entry is a later movement witness, **not a recovered 1861 addressed order**.
Blank receipt evidence means unrecovered, never automatic receipt or proof
that no paper survives. Partial regimental components are not whole regiments.

**[M/I]** Catalogue keys and S138 keys are separate columns. In particular,
`ny_25_militia_infantry` and `ny_28_militia_infantry` exist in the frozen
catalogue/S149 union but have **no S138 key**. They are not mapped to the
similarly numbered Volunteers. Names outside the frozen union, such as the
Reserve regiments named by Curtin, remain textually identified and explicitly
unmatched rather than receiving invented keys.

## 1. New York sending, April and May

**[H]** Morgan's April18 acknowledgement says Sandford has been directed to
furnish Seventh Militia or two smaller First Division regiments. His April20
letter reports ordering Sixth, Twelfth and Seventy-first on the previous day;
after receiving the federal dispatch, he changes their route to fast steamers
up the Potomac. The additional two First Division and two Second Division
regiments remain unnamed there; Ellsworth and Wilson are named separately
(OR III-I pp.85,95; N01–N02). Morgan's April22 letter identifies the Albany
Twenty-fifth proceeding through New York to Washington (p.100; N03).

**[H]** Sandford's own December30 report supplies important intermediate
destinations. It attests April19 orders for Sixth/Twelfth/Seventy-first to
Washington, April20 for Eighth/Sixty-ninth to **Annapolis**, and April27 for
Fifth to **Annapolis**. It says Second and Fifty-fifth were directed into camp
to prepare; Second subsequently embarked **without orders**. The Seventy-ninth's
April24 direction was readiness, followed by later embarkation. These are
attestations of issued orders, not the original addressed copies
(NY AG report for 1861, p.109; N08–N11).

The seven priority bodies have the following read movement evidence. Dates
in this table describe witnesses, not departure triggers:

| Body / frozen key | Read direction and movement limits |
| --- | --- |
| Fifth Militia / `ny_5_militia_infantry` | Sandford attests Apr27 embarkation order for Annapolis (NY AG p.109). Morgan May6 and NY AG departure table give Apr27; Phisterer gives Apr28 departure and May1 Washington muster (OR III-I p.165; NY AG p.8; Phisterer I p.531). |
| Eighth Militia / `ny_8_militia_infantry` | Sandford attests Apr20 Annapolis direction; Morgan/table give Apr23 departure; State register places muster at Washington Apr25 (NY AG pp.8,109; OR III-I p.165; Phisterer I pp.556–557). |
| Twelfth Militia / `ny_12_militia_infantry` | Morgan and Sandford attest Apr19 Washington direction; departure Apr21, Washington muster May2 in later register (OR III-I pp.95,165; NY AG pp.8,109; Phisterer I p.576). |
| Twenty-fifth Militia / `ny_25_militia_infantry` | Albany sending reported Apr22; Morgan/table give Apr23 departure. Phisterer prints an **Apr9** order, Apr27 departure of nine companies, Company A May1. Static scan confirms printed 9; no emendation or original recovered (OR III-I pp.100,165; NY AG p.8; Phisterer I p.623). |
| Twenty-eighth Militia / `ny_28_militia_infantry` | Morgan/table give Apr30 departure; later register says ten companies left under orders for Washington and were mustered there, without an exact arrival day (OR III-I p.165; NY AG p.8; Phisterer I p.629). |
| Sixty-ninth Militia / `ny_69_militia_infantry` | Sandford attests Apr20 Annapolis order. Morgan and Phisterer give Apr23 departure, while NY AG table gives Apr29. Phisterer gives Annapolis service from Apr27, Washington service from May and May9 federal muster (NY AG pp.8,109; OR III-I p.165; Phisterer I p.674). |
| Eleventh Volunteers / `ny_11_infantry` | Morgan reports Ellsworth ordered Apr20; May6 return and Phisterer give Apr29 departure; Phisterer gives Washington service from May2 and May7 federal muster. NY AG p.11 instead prints May1 departure (OR III-I pp.95,165; Phisterer III p.1861; NY AG p.11). |

**[H]** The federal sequence changes. Cameron's Apr29 letter says send no
more to Washington until further advised; Morgan May6 acknowledges it and a
new depot communication about Scott's wishes. Scott's read May6 telegram
directs equipped New York quota regiments **in and about the city**, by ocean
and Potomac. The scope is bounded by holder, place, quota and readiness
(OR III-I pp.130–131,165–166; N05–N07).

**[H]** May13's five three-year request and Read's ten-regiment direction retain
the conflict between federal expectations and Morgan's two-year/war promise.
Read's named Walrath, Quinby and Davies list is an order-to-muster report, not
performed musters. May15 divides the same fourteen city regiments between five
Washington and nine Fort Monroe; Fish substitutes only if Morgan declines.
The actual destination partition is still unnamed here (OR III-I
pp.188–189,191,201,204,206; N13–N14).

**[H]** Keyes May27 explicitly reports Walrath and Quinby ordered from Elmira
to Washington through Harrisburg/Baltimore, conditional permission for Ninth
and Seventy-ninth, and other finite cohorts. Morgan's same-page telegram refers
to Scott's **May19 direction for six**; that original remains unread
(OR III-I p.239; N15). Walrath/Quinby are Twelfth/Thirteenth Volunteers, distinct
from militia names (Phisterer III pp.1873,1887).

**[H/M]** N20–N38 read State-register openings for all nineteen New York keys
in McDowell's 49. They retain stated departure, Washington service and later
brigade evidence without converting these into original sending papers.
The contemporary State departure column and Phisterer disagree for several
bodies: for example Blenker's Eighth is June3 versus May26; Thirty-ninth is
June27 versus May28; Forty-first is June26 versus July8 (NY AG p.11;
Phisterer III pp.1815,2188,2237). The CSV keeps both witnesses. The Twenty-seventh's
later register gives July10 departure and July12 Washington service, not an
April/May dispatch inferred from its credited May21 date (Phisterer III
p.2039). Company I/K exceptions for Fourteenth Militia and battery components
also remain explicit (Phisterer IV pp.2929–2930; I pp.556–557,691).

**Left:** original governor/Sandford addressed embarkation copies; Cameron's
April20 telegram acknowledged by Morgan; the unnamed additional militia and
five/nine/six selections; Scott May19 original; exact individual receiving
receipts and conflict resolution. S149's June sending/diversion work is reused,
not silently replaced. No unnamed cohort is selected from the July roster.

## 2. Crossing of 24 May and McDowell handover

**[H]** A recovered antecedent is **Scott SO89½, May22**, assigning Sandford
immediate command of all New York regiments **within the District of Columbia**,
reporting directly to Army headquarters. The half-number is verified in the
static scan (OR I-LI.1 pp.388–389; X01). It does not send governor-held regiments
or itself order a Potomac crossing.

**[H]** The **original crossing instruction remains unread**. Sandford's May28
contemporary report says he acted pursuant to Scott's order and arrangements
with Scott/Mansfield. It records the named May24 positions, three unnamed
New Jersey regiments, and Eleventh Volunteers/First Michigan at Alexandria.
It separately places Eighth Militia crossing on **May26**, its battery arriving
**May27** (OR I-II pp.37–39; X02–X03). His December account groups Eighth into
the May24 detachment; retain the difference, rather than erasing the dated
contemporary sequence (NY AG p.110).

**[H]** Heintzelman's July1863 report recites a manuscript then in his possession:
May23 afternoon plans changed to include Alexandria, officers sent to colonels
at9p.m., bridge entry at2a.m. May24. Its columns name Third New Jersey and
**48 pioneers** of Fourteenth New York, not a dispatch of that whole regiment
(OR I-II pp.40–41; X04). Willcox's and Farnham's May24 Alexandria reports are
contemporary performance evidence; Farnham explicitly lacks details of his
regiment's orders (pp.41–42; X05).

**[H]** GO26 of May27 creates McDowell's geographical department. GO1 May28
assumes command and assigns the nine named bodies to Stone, Heintzelman and
Hunter; the contemporary Sandford report supplies the militia identities.
McDowell May29 reports meeting Sandford on May27 and inspecting troops May28,
including Michigan, Zouaves and Sixty-ninth. His May30 letter to Mrs Lee attests
the Government's direction to relieve Sandford (OR I-II pp.653–655;
I-LI.1 pp.389–390; X06–X08).

**[I/M]** This supports the read handover and onward brigade scopes; GO26's
text alone names no Washington regiment to cross. The corrected Twenty-fifth
join is militia, superseding S149 U39's volunteer candidate **in this research
only**. S150's report correctly distinguishes historical GO1 from the model's
July template; no declaration or mechanism is changed here.

**Left:** Scott/Mansfield original crossing paper(s), issued regiment copies,
and any additional May27–29 Scott handover instruction. References and later
recitals are not promoted into recovered originals.

## 3. Confederate concentrations and Lynchburg conditions

**[H]** The following successive rules must remain separate:

| Date / record | Read scope and destination |
| --- | --- |
| June11 / C03 | Kentucky men for Duncan to Harpers Ferry with transportation; the unnamed thousand held; telegraph descriptions and hold arrivals for route orders (OR I-LI.2 p.137). |
| June14 / C04 | Armed **and equipped regiments arriving** to Beauregard at Manassas; unarmed regiments **and companies** reported by telegraph and detained (p.140). |
| June29 / C08 | Modify June14: **all armed and unarmed arrivals held**, daily designation/State/arrival/arms/muster table to central office. Rome Georgia companies separately to Richmond by South Side Railroad (p.151). |
| July8 / C09–C10 | Cooper sends unattached Alabama companies and Tenth Georgia companies to Richmond; Walker's separate paper says **all Alabama companies** at Lynchburg. Intra-day receipt precedence unrecovered (p.157). |
| July11 / C11 | Armed **companies** present or arriving to Richmond by South Side road (p.160). |

**[H]** Named onward orders include Gartrell's Seventh Georgia to Johnston
(SO65 June6), Cash to Beauregard (SO66 June7), Sixth Louisiana from Lynchburg
to Beauregard (Walker June15), and Jenkins Fifth South Carolina to Beauregard
(SO73 June17). Walker June15 sends Ninth Georgia to **Richmond for muster**,
not directly into either field army (OR I-LI.2 pp.135–136,140–141; C01–C07).
These re-read scopes preserve S149's evidence; each receiving receipt remains
separate.

**[H]** Johnston June12 acknowledges Lee's June10 notice about two Lynchburg
regiments. Lee June21 says the President selected a Georgia/Tennessee pair
sent from Lynchburg without passing Richmond. Neither reading identifies both
by number; the original June10 paper remains unread. Turney's separate Richmond
direction cannot silently supply that identity (OR I-II pp.897–898,922,945;
C12 and inherited S149 C33/C46–C47).

**[H]** July13 Davis reports an unnamed war-term North Carolina regiment arrived
Richmond July12 and left for Johnston July13; no number or Johnston receiving
receipt is supplied. Lawton July13 acknowledges Walker's Semmes telegram late
the previous night, orders eleven Williams companies, reserves Read's company,
and explains coastal notification/transport delays. Walker also requests
Ramseur's battery for Manassas (OR I-II pp.976–977; I-LI.2 pp.162,168–169;
C13–C15). Unmatched names remain unmatched, not State-origin allocations.

**[H]** Lee's July12 SO32 requires scheduled train departures, prompt camp/depot
movement, baggage reduction and readiness at the depot; it supplies **no train
throughput or speed** (OR I-LI.2 p.163; C16). The July17 boundary controls reused
from S138 preserve Holmes's conditional readiness/security, McRae's transport
gate, Hampton's separate infantry/cavalry/artillery modes, and Johnston's
conditional junction rather than a dated mandatory move (OR I-II pp.980–982;
C17–C18).

**Left:** the original June10 dispatch, exact unnamed pairs and Rome regiment,
individual Lynchburg dispatch/arrival tables, July8 precedence/receipts,
Richmond-to-field orders for still-unmatched arrivals and actual receiving
receipts. No conditional station rule or quantitative transport mechanism built.

## 4. Washington to McDowell, June and July

**[H]** Beyond June23, the read **June18 Scott/Townsend order** tells Heintzelman
Fourth Pennsylvania will be sent down, and **only when Fourth arrives** to send
Seventy-first New York back by steamers (OR I-LI.1 p.403; M03). June23 remains
Third Connecticut and Tompkins Second New York, with guides, wagons, crossing
question and expected arrival distinct from receipt (OR I-II p.716; M04).

**[H]** The dated organisation chain assigns received or already held forces:

- McDowell SO5 June3: Eighth/Twenty-fifth New York with First Connecticut under
  Tyler, explicitly only one Connecticut regiment present (I-LI.1 p.396; M01).
- Mansfield SO140 June12: First/Second Ohio under Schenck, still Washington
  organisation at issue (p.399; M02).
- McDowell SO17/18 July1: Franklin's Fifth Massachusetts/Fourth Pennsylvania;
  Willcox's Michigan/Zouaves; Porter's Eighth/Fourteenth New York Militia
  (pp.408–409; M05–M06).
- Mansfield SO167 July2: Burnside's Rhode Island/New Hampshire/Seventy-first
  brigade and Richardson's Second/Third Michigan, First Massachusetts, Twelfth
  New York Volunteers; SO169 July3: Blenker's Eighth/Twenty-ninth Volunteers
  and Garibaldi Guard (pp.409–410; M07–M09).
- McDowell SO26 July6 assigns Keyes the listed Connecticut/Maine/Varian brigade
  and Miles the still incomplete Davies/Howard division (p.411; M10).
- McDowell GO13 July8 assigns the troops **in this department** into divisions,
  including Runyon's reserve. It is an onward organisation, not a governor call
  or permission to fetch a July roster (pp.413–414; M11).

**[H/I]** GO13's duplicate Second Maine, Thirteenth New York **Militia**, Second
New York **Volunteers**, and Pennsylvania Twenty-fourth **[Twenty-seventh]**
remain visible. The CSV links unambiguous named scope only; it does not silently
emend these to match the battle roster (I-LI.1 pp.413–414). Cameron's July12
Marine-battalion request to Welles is a request, not the Navy's missing response
or actual receipt (I-II p.739; M12). July15 restrains Miles from moving before
further instructions; the referred Blenker advance order remains unread
(I-LI.1 p.419; M13).

**Left:** addressed Washington-to-Virginia movement papers and receipts between
the two departments' organisation papers; GO13 identity holds; subsequent
assignments for July roster additions and Marine response. Presence in a later
organisation does not reconstruct the missing earlier journey.

## 5. Patterson, after SO78, and Curtin

**[H]** Patterson June25 suggests Curtin's reserves occupy named Pennsylvania
frontier stations for possible later federal employment. McCall June30 can
offer no further ready force: his armed rifle regiment, infantry regiment and
artillery section have already gone to support Wallace. Neither paper names
that pair by number or puts all reserves under Patterson (OR I-II
pp.724–725,735; P01–P02).

**[H]** July5 Patterson directs Stone to join by Williamsport urgently, reducing
baggage and hiring/pressing transport with promise to pay. Scott July6 reports
Gordon ordered from Boston to Williamsport and Sandford's further sending.
Sandford's December report identifies Nineteenth/Twenty-eighth Volunteers sent
July6, Fifth/Twelfth Militia leaving July7, crossing at Williamsport July9,
and reporting at Martinsburg July10 (OR I-LI.1 pp.410–412; NY AG p.110;
P03–P05). This is useful departure/receipt testimony, not four recovered
addressed orders.

**[H]** Subsequent orders are separately retained: SO95 July8 attaches
Nineteenth/Twenty-eighth to Wynkoop; SO91 July9 makes First Pennsylvania the
Martinsburg garrison/depot guard; SO94 July9 gives Stone five companies of
Twenty-fifth Pennsylvania, SO96 July10 gives six and assigns Sandford's Third
Division. Sandford's State report identifies Fifth/Twelfth as militia.
SO98 July11 holds present/future regiments at Williamsport/Hagerstown;
SO105 July14 assigns Gordon's Fourth **[Second]** Massachusetts to Sixth
Brigade (OR I-LI.1 pp.414–416,418; NY AG p.110; P06–P11).

**[H]** Cameron's July11 readiness enquiry for fifteen regiments is answered by
Curtin July12 sending Wright. July13 directs **five long-term regiments in
addition to the two at Cumberland** to Patterson, remainder to Scott at
Washington. Wright July17 reports the July12 acceptance interview: regiments
accepted, artillery/corps headquarters excluded. Curtin July18 reports Biddle
and Simmons in Virginia, McCalmont moving to join under a referred federal
order, Ricketts not mustered at Greencastle and other camps ready when mustered
(OR III-I pp.325,327,329,336–337; P12–P15).

**Left:** the exact five selections, Curtin's individual addressed forwarding
copies, the McCalmont federal original, aliases outside the frozen key set,
and receiving receipts. None is joined to S138's three-month Pennsylvania
regiments by a shared number, nor made a guaranteed pre-battle reinforcement.

## Verification and handoff

**[M]** Final source/identity inventory and runtime diagnostics preceded this
note. All **2,063 starting tracked files remain byte-identical**;
`@mandate/*` resolves to this worktree's packages; branch/base are correct.
Focused validation checks exact key joins, all49 inventory coverage,
source/input hashes, citations, UTF-8/LF, explicit component/identity holds and
preservation. Boundary and decision-index checks exit0. Raw evidence, search
limits, HTTP receipts and validation details are in `runs/s151/`.

The ordinary staged-tree hook is the required commit gate. Its actual exit,
commit revision and final tree state belong in the single fresh-read Python
UTF-8 append to the lead's CODEX.md, with `runs/s151/commit-hook.log` and
`commit-exit.json`. No separate duplicate full suite, package build, scenario,
hosted timing or simulation-acceptance claim. Whole-branch historical review
remains deferred under0106/0107; no independent review is claimed. Git history
is the project's ledger.

The HTTP retrievals were direct public requests, with no Firecrawl or credits.
All image inspections were static local images/PDF renders, headlessly; no
Computer Use, desktop control or real browser. Other worktrees and the shared
source cache were read-only except the one expressly authorized main CODEX
append after commit. Readings/CSVs are not simulation declarations.

For the lead:

1. Use the recovered Sandford assignment, GO1 militia joins, June18 conditional
   replacement and July brigade scopes as research evidence for a separately
   authorized build; preserve actual senders, held-force scope and receipt.
2. Keep successive Lynchburg rules, July modes, Sandford's Patterson movement
   testimony and State-record disagreements separate. The CSV's reports and
   unresolved aliases are not automatic allocation instructions.
3. Route the five ordered recovery lists above. All five targets received a
   bounded pass; archive/receipt recovery remains incomplete as stated.
   No measurable account budget was supplied or claimed exhausted; no paid
   extension, new campaign or S150 work was undertaken.

Findings outside my scope
