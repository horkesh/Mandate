For the lead: 3 items.

# S43: the road to Richmond

**Stone reaches Richmond because the route has no opposing Virginia army in April or May, his one 600-man block can march without accounted stores, and the Confederate rule seat concentrates distant blocks only after its field commands open. His first actual Richmond battle on this pin is against 158 men, not the army later assembled at Manassas.** This explains the result; it does not establish historical plausibility. On 19 July, 16,000 men under Beauregard defeat Stone's remaining 574 and capture the survivors.

S43 only, 21 November 2026. Worktree `C:/Pyrrhic/sprint-realism`, branch `sprint/realism`, base `edc57b05142a95757ef120080edf8d934406fa0c`. Research and proposed rulings, **not canon or a clearance**. No code, pack, band, signature or existing report was changed. S42's worktree was neither read nor written. No desk, browser or desktop was opened.

## What was measured

Root `npm ci` ran first: exit 0, 51 packages added, 56 audited, zero vulnerabilities. The required standing, command-line, writing, 0106 and S1-to-S10 rules were read from the main coordination file. Its later S43 scope controls this run. Independent whole-branch review remains deferred under 0106; this report is the hand-over, with no additional lane note outside the authorized write scope.

[The observer](s43-evidence/trace.ts) runs the **86 committed S41 advance commands**, including 44 `end` commands and 42 signed acts, through the real `ConsoleSession` and `ConsoleGame`. It splits each existing turn into single-day calls only to retain end-of-day truth. An ordinary, unmodified `ConsoleGame` receives the same lines: State hashes match **after all 86 commands**. Both finish day 148, **31 July**. No State is injected or edited, no policy is supplied from the observer, and other seats retain their normal rule driver. The opening preflight passed before this bounded trace.

All **31 changed paper records** in S41's committed comparison match the observed records on their author, dates, subject, hour and claims, including absent records. This is a check against S41's retained comparison, not a claim of independently comparing every historical snapshot byte. The daily delivery capture has 2,162 distinct papers; S41's count of 2,163 also includes the opening bulletin. The source command-file SHA-256 is `c4ec83124c744d011a85ded888949e23049ab2d4ab8ee825a57d710ef33f405c`. Final State hash: `7d633d7cb0ad144c9a5c05c925d7cbb7ed80e3fb17a506ff4e1c49501df2e8a9`. [Trace summary](s43-evidence/trace-summary.json), [public comparison](s43-evidence/s41-public-comparison.json), [command dates](s43-evidence/commands.json).

Public papers and private diagnostics are separate artifacts. The retained S39 public snapshot was read from `sprint-play` without writing it; its selected papers and source hash are [preserved here](s43-evidence/s39-papers-public.json). **No private S39-pin reconstruction is claimed.** The causal trace below is the requested integrated S41 base. The early S39 paper dates are evidence of what that earlier player received, not proof of identical private events on both pins.

## The public account

The signing mornings are **16 April**, an order to Stone to take Richmond for review; **19 April**, the same goal by direct wire after Scott's objection; and **21 April**, approval by direct wire. The goal is Richmond, not Manassas. The 600-man plan offers a 24-day axis duration without a received start date. The trace's operation starts on **22 April**; this private date must not be retrofitted into what the player knew.

| Paper or act | Written / received | What it establishes |
| --- | --- | --- |
| Stone's plan, `m.47...plan.us_dc_militia` | 21 / 21 April | A submitted supply-line plan for Richmond. |
| First arrival, `m.72...arrived.us_dc_militia` | 16 / 19 May | Stone reports reaching Richmond. |
| Repeated arrival, `m.95...arrived.us_dc_militia` | 8 / 9 June | Another arrival report; the trace does **not** show a second physical march into Richmond. |
| Four Stone phase papers, `m.100...battle.*.union` | 13 / 14 June | Richmond fighting, at 08:00, 12:00, 17:00 and 21:00; each estimates 158 enemy men. |
| Arrival after that fight, `m.101...arrived.us_dc_militia` | 14 / 15 June | The objective report resumes after contact ends. |
| Stone's full return, `m.107...return.full.union` | 20 / 25 June | Reports 26 own losses and two missing. |

The complete IDs, routes, confidence and claims are in [the public papers](s43-evidence/papers-public.json). S39 additionally received four Richmond phase papers written **7 June**, absent in S41; its 13 June and 19 July papers remain separate dated episodes. S41's comparison records this change beginning with the **8 June receipt**. Press victories are attributed claims. No Manassas **battle** appears in this trace; later Manassas **control** reports do appear, so absence of a battle paper is not absence of the place from the record.

## What Stone actually had and how he got there

Stone has exactly `fb_us_dc_militia`: **600 infantry**, no non-combatants, unknown stores, morale 600, experience 400 and equipment 600 on the game's permille scales. No recruited block joins him. The initial row carries a strength date of **18 April** but is present from the March opening; its provenance includes `needs-source (primary source not reached)`. That is a pack-data fact, **not certification of 600 historical effectives**. The block has no enlistment record, so no term-end date applies to it. [Initial row, plan and dated context](s43-evidence/context-private.json).

The selected plan scores **533**, against direct 97, holding −52 and flank −302. Its terms already penalize supply by **−387**; perceived route exposure is zero, force ratio contributes +300, goal fit +400, time +120 and glory +100. The model does not simply omit logistics from planning. It chooses the less costly supply-line candidate despite the warning. These are private terms, not information to expose at the desk.

| Stage | Trace date | Detail |
| --- | --- | --- |
| Open / assemble | 22 April | Two days' concentration; no supporting force requested. |
| First road arrival | 24 April | Northern Virginia. |
| Manassas | 29 April | Arrives without a battle. The operation records its depot-step pause on 30 April. |
| Fredericksburg | 5 May | Depot-step pause recorded 6 May. |
| Hanover | 10 May | Depot-step pause recorded 11 May. |
| Richmond | 15 May physical arrival; 16 May objective recognition | Enters works stage and sends the first arrival paper. |

The route is **Washington → northern Virginia → Manassas → Fredericksburg → Hanover → Richmond**, entirely by road. Its planned road time is **14 days**, plus **two days concentrating and four two-day depot steps**, giving the offered 24 days. Physical arrival and next-day stage recognition are distinct; [daily movement](s43-evidence/movements-private.json) and [operation log](s43-evidence/operations-private.json) retain both.

Those depot steps are pauses. `stepAxis` enters `pause` until the phase's days expire; it creates no depot or transported stock. More decisively, `storesStep` skips any block whose stores are null. Stone's stores remain null throughout all 148 days: he neither consumes accounted rations nor receives an accounted refill. The pack's only stores norm covers its home naval squadron. **“Supply-line plan” therefore does not prove this column was supplied.** The evidence supports an unaccounted sustainment requirement, not a hidden successful wagon train. Sources: [stores.ts, lines 62–87](../../packages/kernel/src/forces/stores.ts#L62), [operations.ts, lines 426–445](../../packages/kernel/src/tick/operations.ts#L426).

Road movement does not require every region to be friendly-traced; rail movement does. It checks closed neutral ground, edge capacity and relevant obstructions. Hostile troops can stop the operation when physically present, but political side or nominal government alone does not conjure a garrison. Stone leaves only **36 permille Union control** at each intermediate route region, below the 250 supply-trace threshold; his passing through them does not establish a secured supply corridor. Sources: [march.ts, lines 60–99](../../packages/kernel/src/movement/march.ts#L60), [0054](../decisions/0054-control-fronts-pockets-and-supply.md), dated context above.

## Where the opposing forces were

The initial scenario contains **no non-Union block in the traced Virginia corridor, Harpers Ferry, Winchester or Norfolk**. There is no Virginia-department block anywhere in the trace before **6 June**. Political changes therefore leave Stone's April–May road physically empty.

| Date | Trace disposition |
| --- | --- |
| 23 May | Davis issues Johnston's Harpers Ferry appointment, day 79. |
| 24 May | Davis orders Charleston's blocks transferred to that command, day 80. They must physically join; assignment is not arrival. |
| 31 May | Davis issues Beauregard's Manassas appointment, day 87. |
| 6 June | The Virginia transfer notice creates **one unknown-strength infantry block at Richmond**, under the governor. |
| 7 June | Davis orders that block to Manassas. The unknown-strength presence puts Stone's operation into assault stage, but no Richmond battle record is created that day. Its departure lets the operation resume works and issue the repeated arrival on 8 June. |
| 13 June | Johnston's 158-man Georgetown Coast Guard reaches Richmond while joining Harpers Ferry. Most of his Charleston/early levy blocks are still around Greensboro; two Arkansas blocks are much farther west. |
| 17 June | The Virginia block is filled to **40,000 at Manassas** by a later return. These are not 40,000 men who were physically present on Stone's April passage. |
| 28 June onward | Davis transfers North Carolina blocks to Manassas; their joining route later brings them through Richmond. |

The Coast Guard approaches through the North Carolina coastal plain, Southside and Chesterfield. It is a **joining block**, not a sourced 1861 Virginia field formation. Transfers invoke `orderJoins` toward the receiving post's home seat; joining chooses passable legs and marches blocks independently. No new Confederate operation record accompanies these Richmond contacts. [Rule-seat entries](s43-evidence/rule-entries-private.json), [movement/join.ts](../../packages/kernel/src/movement/join.ts), [verbs.ts, lines 308–331](../../packages/kernel/src/tick/verbs.ts#L308), [operations.ts, lines 263–305](../../packages/kernel/src/tick/operations.ts#L263).

The principal policy transfers every qualifying source command into its current concentration post. On this pin, the dated concentration selector still reads `departmentSide` as well as post holder/faction. S40's held received-only correction and S42's paper contracts are separate work; this report does not apply or evaluate S42. The issued transfers establish the behavior described here without assuming the unread S42 tree. [Rule policy, lines 214–221](../../packages/rule-seats/src/index.ts#L214), [selector, lines 116–128](../../packages/kernel/src/seats/requests.ts#L116).

### What decided Richmond

On **13 June**, Stone attacks with **600 present / 420 committed** against Johnston's **158 / 158**, in an `attack_hasty` battle. All participating strengths are known. The Confederate flank draw is **38 against threshold 197**; morale falls **600 → 274**, with −141 losses, −150 broken flank, −5 nerve and −30 experience. Johnston's night believed ratio is **157 permille**, below hold-at 633 and breakout-at 422. With no eligible retreat neighbour, he surrenders: **15 killed or wounded, 143 captured**, and Johnston is captured. Stone loses **26 killed or wounded and two missing**. The two missing later rejoin, leaving 574.

On **19 July**, Beauregard's three North Carolina blocks bring **16,000** against **574**. Confederate losses are **89 killed or wounded and seven missing**. Stone's side routs, has no eligible retreat neighbour, and surrenders: **71 killed or wounded, 503 captured**. Stone is captured and his post vacates. Richmond's control shares immediately after that tick still read Union 800 / Confederate 200: battle, surviving force, post vacancy and eventual control are distinct outputs. The operation's earlier `objective_reached` outcome was already recorded on **15 June**, not an assessment of the July battle. [Full battle records and contributing terms](s43-evidence/battles-private.json), [retreat rule, battle.ts lines 178–191](../../packages/kernel/src/combat/battle.ts#L178).

## The April–June record

Historical claims below come from **pages actually read** of *Official Records*, series I, volume II (1880), abbreviated **OR I-2**. The retained scan is outside every worktree. [Source manifest](s43-evidence/sources.json) records its SHA-256, printed-to-PDF mapping (+20), and the 24 read pages; [complete extracted cited pages](s43-evidence/source-pages.txt) are portable. Pages 726 and 895 were also inspected as rendered scans to check the return columns and place names. These edited contemporary reports contain estimates and requests, not one omniscient roster.

| Date | Sourced position, strength or constraint |
| --- | --- |
| **22–27 April** | Harper reports about **2,400 at Harpers Ferry** on 22 April. Ruggles assumes the Mount Vernon–Rappahannock line that day. On 24 April Lee orders rendezvous, instruction and subsistence, and tells Cocke to fall back on reserves toward Gordonsville if unable to hold. Johnston receives Richmond's state forces on 26 April; Jackson is ordered to Harpers Ferry on 27 April. These are active state institutions before the June transfer. [OR I-2 pp. 774–775](https://ehistory.osu.edu/books/official-records/002/0775), [777–778](https://ehistory.osu.edu/books/official-records/002/0777), [783–784](https://ehistory.osu.edu/books/official-records/002/0783). |
| **10–15 May** | Walker's telegram gives Lee control of Confederate forces in Virginia on **10 May**. Cocke reports **scarcely 1,000 at Manassas on 15 May** and urges concentration there and at Winchester. Lee's same-day instructions reinforce Manassas and require Cocke and Terrett to oppose an advance with their combined force. This is an early weakness, not an empty state or July's army already assembled. [OR I-2 p. 827](https://ehistory.osu.edu/books/official-records/002/0827), [845–847](https://ehistory.osu.edu/books/official-records/002/0847). |
| **30 May** | Garnett's explicitly incomplete estimate totals **36,200**, including Confederate troops at Richmond: **5,500 Richmond/Ashland**, **2,700 Fredericksburg and lower-river counties**, **6,000 “Manassas Gap”**, **5,500 Harpers Ferry excluding Maryland troops and Point of Rocks**, **7,000 Norfolk**, and **3,500 Williamsburg/Yorktown**, among other locations. Several entries are conjectural or lack returns. “Manassas Gap” must not silently become an exact Junction roster. [OR I-2 p. 895](https://ehistory.osu.edu/books/official-records/002/0895). |
| **6–15 June** | Letcher's transfer proclamation is dated **6 June**, published with Lee's order on **8 June**; it transfers forces already mustered, not forces first brought into existence then. Lee's **15 June** account estimates roughly **35,000 Virginia troops**, then argues from weapons issues for roughly **40,000**. It describes incomplete returns, not an exact 40,000-man concentration at one place. Neither estimate should be added to Garnett's overlapping total. [OR I-2 pp. 911–912](https://ehistory.osu.edu/books/official-records/002/0911), [927–928](https://ehistory.osu.edu/books/official-records/002/0928). |
| **24–26 June** | McDowell estimates **23,000–25,000 opposing infantry plus about 2,000 cavalry** around Manassas and its dependencies; that is Union intelligence, not a certified Confederate return. His own 26 June return has **764 officers and 13,666 men present for duty**, distinct from **16,611 present and absent**. **Seventeen of its twenty regiments are three-month troops.** [OR I-2 p. 718](https://ehistory.osu.edu/books/official-records/002/0718), [726](https://ehistory.osu.edu/books/official-records/002/0726). |

**Ninety-day service was an operational clock, not a guarantee of ninety useful field days.** Patterson warns on 28 June that nearly all his terms expire within a month and predicts replacement regiments will not be fit before September, if then. His May correspondence already warns that some terms could expire before equipment arrived. Those are his dated judgments about his command, not a universal readiness date or proof that Stone's particular District block had the same term. [OR I-2 pp. 646](https://ehistory.osu.edu/books/official-records/002/0646), [730](https://ehistory.osu.edu/books/official-records/002/0730).

**Transport south of the Potomac was a constraint even before Richmond.** On 24 June McDowell reports that after equipping two regiments for moves of about six miles, the Quartermaster-General had only three horses left. He says a movement toward Vienna would need repaired rail transport, protected approaches, reserves and a force large enough to withstand attack. His approximately 24 June Manassas plan describes narrow wooded roads, a destroyed section of the Orange and Alexandria Railroad and a blocked cutting; it names that railroad as the intended principal supply channel, with wagon alternatives, repair parties and guards. Its proposed force is 30,000 with a 10,000 reserve. This is evidence of actual requirements, not proof that every road was physically impassable. [OR I-2 pp. 718–721](https://ehistory.osu.edu/books/official-records/002/0720). Virginia faced transport shortages too: Lee requests field wagons, battery horses and funds on 27 April. [OR I-2 p. 784](https://ehistory.osu.edu/books/official-records/002/0784).

**Union regiments were not interchangeable trained blocks.** Cadwalader reports unserviceable arms on 4 May; Patterson forwards that evidence on 6 May against moving unequipped troops, while saying officers and men want to serve. McDowell's late-June plan calls most regiments very raw and asks for small fixed brigades under experienced regular officers. His 24 June letter distinguishes unavailable fortress artillery from field artillery and notes an otherwise good volunteer battery's unfamiliarity with its guns. This supports condition, organization and equipment differences, not a claim that volunteers could not fight. [OR I-2 pp. 620–621](https://ehistory.osu.edu/books/official-records/002/0621), [718](https://ehistory.osu.edu/books/official-records/002/0718), [721](https://ehistory.osu.edu/books/official-records/002/0721).

## Classification and proposed rulings

Each row gives one primary classification. Recommendations and counterfactual judgments are marked **[I]**; none is implemented.

| Difference | Classification | Proposed ruling [I], and rejected alternative |
| --- | --- | --- |
| No Virginia forces on the April–May route; a June administrative transfer creates the first block. | **Missing data** | Represent sourced state forces at dated places before their federal transfer, with unknowns where returns fail, and preserve their identities through transfer. Reject backdating the June statewide estimate or spawning July's army in April. |
| One block becomes 40,000 at Manassas when a later return supplies a statewide total. | **Missing data** | Separate return coverage, location and effective strength; reconcile component forces before applying a total. Reject treating a statewide estimate as one local formation or adding it to already represented men. |
| Stone's opening 600 has weak provenance, a later strength date, no stores and no enlistment record. | **Missing data** | Source the specific contingent's date, strength, service and stock before filling fields. Reject giving Stone a guessed ninety-day term, zero rations, or all later Washington volunteers. No source read here establishes his exact historical field strength. |
| Unknown stock escapes consumption; depot preparation is elapsed time without provisioned transport or stock. | **Missing mechanism** | Define how an expedition demonstrates sustainment when stock is unknown, and what a depot step actually provides or requires. Retain genuine uncertainty. Reject invented full stores, automatic depots, a Richmond-specific ban or a fitted march delay. |
| Uniform starting force condition does not represent the cited differences in drill, arms, field organization and transport readiness. | **Missing mechanism** | Extend the existing condition/readiness owners and received reporting only where sourced. Experience/equipment and enlistment expiry already exist; there is no basis to build duplicate systems or prescribe an arbitrary “trained by July” switch. Reject a universal volunteer incapacity penalty. |
| Distant forces all join the current concentration post, piecemeal through occupied Richmond. | **A rule seat's choice** | Review the concentration/transfer policy on its received basis and test threatened routes and grouping after the missing data is restored. Keep S42's separate receipt work with S42. Reject free relocation, hidden-truth planning, or forcing all South Carolina units into the historical Virginia army. |
| Stone selects the supply-line candidate after an April Richmond goal; Scott objects and the human principal bypasses him. | **A rule seat's choice** | Preserve the commander's choice among plans and the official's objection. The human's early goal is the scenario input, not an automated historical July order. Reject enforcing the historical July objective/date. The retained human line explicitly names Richmond. |
| Early exploitation of a weak front, or a battle occurring away from Manassas. | **A plausible outcome the record doesn't rule out** | Permit the possibility if sourced forces, warning, transport and sustainment produce it. Cocke's May warning supports vulnerability, not proof that this 600-man conquest was sustainable. Reject both a scripted Manassas requirement for every human path and certification of this trace as realistic. |
| A 600-versus-158 local victory, followed by defeat against 16,000. | **A plausible outcome the record doesn't rule out** | The local combat results have explicit numerical causes. Review the inputs and the detached joining behavior before changing combat. Reject tuning casualty, flank or victory bands to make the early arrival disappear. The exact historical matchup did not occur in the sources read. |

The first missing-force row is the earliest physical cause; receipt corrections alone cannot make absent April–May units fight. The unknown-stores path is a separate sustainment gap. **[I] Restore those contracts before judging the model by Richmond's arrival date.** This report supplies no alternate run and does not claim how much any proposed change would move that date.

## Evidence and verification

[Audit receipts](s43-evidence/audit.json) retain the raw-file hashes. Complete daily diagnostics, transcripts and command entries remain in this worktree's ignored `runs/s43/`; the portable artifacts above preserve the causal findings, battle terms, source pages, 148 daily hashes and comparison checks. One reporting selector initially used `batRegion` instead of `battleRegion`; the complete retained daily records were audited with the correct field. No game was rerun for that extraction correction. A broad search for “refused” also matches the `pickens_refused` situation name; it is explicitly a word search, not a dispatch-refusal count.

The pre-report inventory verifies **all 1,879 original tracked files unchanged**, including packs, kernel, locks, hooks, art, gate material and the worktree's coordination copy. [Preservation receipt](s43-evidence/preservation.json). Runtime prerequisite and inventory checks precede this report. No package build, calibration campaign or done check was added to this read-only investigation; the unrelated S41 acceptance evidence and its unresolved criteria are not re-scored or waived. The final commit runs the actual configured pre-commit hook; its settled result belongs in the single coordination status and `runs/s43/hook.log`.

For the lead:

1. Rule on the missing dated Virginia deployments and the geographic/identity meaning of statewide returns; keep S42's received-paper work distinct.
2. Commission the smallest sustainment/readiness design that makes an expedition's requirements explainable, preserving uncertainty and lawful alternatives. Review rule-seat transfers against those inputs before considering combat or date calibration.
3. Review this report and branch under 0106. Keep the integrated candidate's existing pushback, D6, CI and other acceptance gaps open; S43 establishes causes, not 1A completion.

## Findings outside my scope

S42's implementation and result; a new order-of-battle apply; logistics or training code; Stone's unresolved original authority/strength/term evidence; the exact strength and location of every Virginia company; a private replay of S39's older pin; new acceptance bands or campaigns; gate signatures, whole-branch review, integration, CI, pushing and release. No finding is cleared by the existence of this report.
