# S84: diagnosing 1A strength, pushback and Johnston's junction

2026-11-23. Research and proposed rulings only, on `sprint/research-military`, starting at `04c7e22a`. No code, pack, person rating, band, assertion or accepted decision changes. Independent acceptance remains with the lead under 0096/0106/0107.

## Evidence and limits

This note uses **S82's retained reference at `e2b98c818b6e5e0c2e81256e5cba4955bb7feaa2`**, not the simultaneously changing S83 tree. World, scorer, rules and relevant implementation were read with `git show` at that commit; States, trace, decisions, observations and done results came from `C:/Pyrrhic/sprint-july/runs/s82/` and its named `s82-done` result. No run was repeated. [Reference hashes](S84/reference-inputs.json) identify the exact files. The 17 State fields represented by owner changes reconstruct exactly to the final reference; the trace does not carry every State field, so this is **not** a full-State replay claim.

`[M]` means an observation of those model artifacts or committed implementation, not a historical fact. `[I]` marks an interpretation or recommendation. Historical claims below use only the selected pages actually read, with [reading modes, external paths and SHA-256](S84/source-reading.json). Scans stay outside worktrees. Appendix C is read as a research catalogue: its classifications and its own source limitations remain attributed to it, without claiming fresh primary verification of all 41 rows.

## 1. Confederate strength

### Reconciliation by state of origin [M]

The reference counts known lot men across departments on the Confederate side, including affiliated State departments. This table assigns origin by the lot's raising department, never by its current commander or location. The opening Confederate-department forces have no State raiser in that identity and remain unallocated. Zero Florida means zero represented lots, not no historical Floridians. `Transfer` below means institutional State-force entry, not an inter-post reassignment.

| Origin | Opening known | Raised known | State-force transfer, known | Net known reduction | 31 July known | Unknown blocks |
|---|---:|---:|---:|---:|---:|---:|
| Alabama | 0 | 9,000 | 0 | 0 | 9,000 | 2 |
| Arkansas | 0 | 5,000 | 8,000 | 0 | 13,000 | 3 |
| Confederate opening, raiser unallocated | 3,064 | 0 | 0 | 0 | 3,064 | 1 |
| Florida | 0 | 0 | 0 | 0 | 0 | 0 |
| Georgia | 0 | 9,000 | 0 | 0 | 9,000 | 1 |
| Louisiana | 520 | 0 | 0 | 0 | 520 | 0 |
| Mississippi | 0 | 8,500 | 0 | 0 | 8,500 | 1 |
| North Carolina | 0 | 0 | 16,000 | 8,610 | 7,390 | 0 |
| South Carolina | 5,069 | 6,000 | 0 | 0 | 11,069 | 5 |
| Tennessee | 0 | 0 | 24,000 | 0 | 24,000 | 1 |
| Texas | 0 | 1,000 | 0 | 0 | 1,000 | 3 |
| Virginia | 0 | 0 | 490 | 139 | 351 | 5 |
| **Total** | **8,653** | **38,500** | **48,490** | **8,749** | **86,894** | **22** |

Arkansas's raised total includes 1,000 mustered on 4 May from Lincoln's April call: the State later changes side, so a Union-issued levy contributes to the final Confederate total. This is not a new Davis call. The transfer column includes Tennessee's 24,000 quantified after its initially unknown entry; this is one continuing identity, not another levy. Every final lot, its first appearance, department, strength, assignment and location is in [confederate-lots.csv](S84/confederate-lots.csv). Regiment-equivalent men are the model's existing 1,000 norm, **not** headcounts established by unit lists in the sources.

**Losses explain part of the shortfall, not all of it.** Before net combat reductions the represented known total is 95,643, already 4,357 below 100,000. North Carolina loses 4,751 on 28 July and 3,859 on 29 July, leaving 7,390 of 16,000. Garland loses 146 on 25 July, then recovers seven stragglers, leaving 351 of 490: net reduction 139. Total net reduction is 8,749; the final shortfall is 13,106. Sumter's Confederate recorded losses are zero. No surrendered Confederate block is excluded to conceal men. [Loss accounting](S84/loss-accounting.json) retains killed, wounded, missing, captured, block allocation and Garland's recoveries; net reduction is not a new claim about historical Bull Run losses. [M]

### What Walker measures

Walker reports **190 regiments and 34 battalions**, with independent companies outside that enumeration, on **24 July**. He excludes two recently called regiments from each of Mississippi, Alabama, South Carolina, Texas, Arkansas and Tennessee, and the 30,000 reserve corps, many of whom were in instruction awaiting arms. His estimates for 500 regiments are an appropriation basis. They are not 500 existing regiments. Page 497 explains that arms shortages excluded volunteers and constrained acceptance of twelve-month offers. These are unit/acceptance and readiness measures, not a dated present-for-duty headcount (OR IV-I **pp.496-497**, both page images inspected).

[I] Consequently, no subtraction of 86,894 men from 190 regiments is valid. Walker does not divide his 190/34 by State; a purported exact State shortfall against his report would invent data. The comparison below uses his exclusions plus separately dated calls and transfers. 0099's 100,000 floor stays binding and its 200,000 ceiling stays an inference; neither is replaced by a new conversion of Walker's units.

### Dated coverage and gaps by state

| State | Model result and cause [M] | Read record and bounded diagnosis |
|---|---|---|
| Alabama | 9,000 raised: 2,000 March, 2,000 April absolute, 3,000 reserve, 2,000 July extra; one unknown cavalry supplement and unknown Fort Morgan. | March immediate allocation: OR IV-I p.135; absolute calls pp.231-233; reserve/cavalry p.412; July extra p.416. Moore's 21 July report describes arms/tent delays; his 22 July reply still awaits marching directions for Wood/Cantey (pp.493,495). Model reservation delays are three days, not evidence of those exact historical logistical constraints. Walker's excluded pair must be crosswalked to the existing July pair before adding anything (p.496). |
| Arkansas | 2,000 from pre-transfer calls, 3,000 reserve; 8,000 in the State-force transfer; three unknown blocks. April 22 call is not issued until 15 May. | Seven infantry regiments, one cavalry regiment, a cavalry battalion and artillery components are named in the 15 July agreement (OR I-III pp.609-610); eight model regiment equivalents are not a return. Walker's separately excluded pair has no separate two-regiment call row in S82 (IV-I p.496). Its overlap and date need identification before application. |
| Florida | Zero. March immediate, April readiness and June reserve calls all receive objections; no levy. | The 500 immediate men are a sourced request, not a missing pack call (IV-I p.135). Readiness requests of 1,500 and 2,000 are conditional (pp.211,221-222,233); the 1,000 reserve quota is explicit (p.412). This run's non-raising is a model answer, not historical proof of refusal. |
| Georgia | 9,000 raised, plus unknown cavalry: 2,000 March, 2,000 April absolute, 3,000 reserve, 2,000 extra. | Calls: IV-I pp.135,231,412,416. Brown's 8 July reply conditions the brigade/extra-regiment arrangement on officers, organization and equipment (p.424); his 15 July reply says two new regiments are ready while disputing dismantling the State brigade (pp.477-478). The model's ordinary compliance does not measure that bargain. No separate State-brigade entry is in the inspected S82 institutional data; matching it to existing lots is required before adding its components. |
| Louisiana | Only the opening forts' 520; every inspected call gets an objection and no levy. | Immediate 1,700 request (IV-I p.135), April absolute one/optional second (p.232), two additional regiments (p.411), and 3,000 reserve (p.412) exist in the pack. On 23 July a Third Regiment is already reported at Fort Smith, and an Eleventh is organizing before the reserve companies (pp.495-496). Zero later raising is therefore not historical absence. Source a dated accepting/return path and identities instead of changing all governors' willingness. |
| Mississippi | 8,500 raised: 1,500 March, 2,000 April absolute, 2,000 June extra, 3,000 reserve, plus unknown cavalry. | Allocations are IV-I pp.135,233,411-412. Three active July answers slow-walk into 18/19 July musters. Walker excludes a recently called pair (p.496); the existing June pair needs identity comparison, not automatic duplication. |
| North Carolina | 16,000 State-force men enter 27 June; no new call levy. April absolute call waits until 3 July and then gets an objection. | Ten war-term regiments are described in Walker's 23 June letter; acceptance depends on notification of actual organization (IV-I pp.396-397). The 27 June ordinance distinguishes State troops, four already-serving regiments and 2,000 additional volunteers (pp.402-404). The model has these three scopes. Its uniform 1,000 conversion is not a newly sourced muster return, and an April call cannot be added again without that overlap check. |
| South Carolina | 5,069 opening known plus 6,000 raised; five opening unknown blocks. March call finally musters 24 March; reserve musters 22 July. | Reserve/cavalry distinctions: IV-I p.412. Pickens's 15 July report answers a two-regiment war call with Gregg/Orr, and describes Second/Sixth movements and replacement conditions (pp.479-480). His large arithmetic mixes arms and forces and is explicitly from memory, not a clean State headcount. S82 has no separate later two-regiment war-call row here, and opening Kershaw/Hagood/Rion identities need reconciliation with later components before adding men. |
| Tennessee | State forces enter at unknown strength on 29 June; 24,000 quantify the continuing infantry/cavalry identities on 2 July; artillery stays unknown. April call waits until 7 July and gets an objection, as do reserve/cavalry calls. | Harris's 2 July tender lists 22 infantry regiments, two cavalry regiments and ten artillery companies; it also distinguishes equipment and incomplete field batteries (IV-I p.417; authority on p.411). Walker's excluded later pair has no separate two-regiment call row (p.496); its identity/date are held. Source units support the model's scope, not exact 24,000 actual men. |
| Texas | 1,000 March raised, three opening unknown lots; later readiness/reserve calls get objections. | Immediate destination requirement p.135; reserve quota 2,000 p.412; Walker's excluded pair p.496. No separate later two-regiment row is present. Original State forces and that later request need dated identities/returns, not arbitrary nominal strengths for the three unknowns. |
| Virginia | Five unknown local blocks; Garland is 490 before losses, 351 at end. No reserve levy. | Letcher's 17 June message reports upward of 40,000 volunteers, equipped/ready (IV-I pp.388,392). S82 has local institutional entries but no matched statewide 40,000 return. This is a missing aggregate-to-lot accounting crosswalk, not permission to append 40,000 beside the same local forces. Preston's own strength remains unknown; the statewide claim cannot quantify his battalion. |

[Confederate calls](S84/confederate-calls.csv) records all **49** doctrine entries, **48** issued, exact responses and levy dates. Kentucky's one unissued April request is retained separately: neutral Kentucky supplies no automatic Confederate levy. The April request explicitly named nonmember States (OR IV-I p.232). In S82's decisions the `raising` menu first offers Arkansas on day 71, North Carolina on day 120 and Tennessee on day 124; the driver can send only to a post that menu offers. This accounts for the much later model issues. It identifies an eligibility/knowledge path for future diagnosis, not a newly proved cause of the historical delays. [M/I]

The 8/16 April readiness entries correctly create no active levies: Walker explicitly barred muster before absolute call (IV-I p.233). They cannot supply an extra 54,500 active men. Seven active Confederate slow-walk answers add ten days each; two other slow-walk answers concern readiness only. All active delayed Confederate levies have mustered by 22 July; there is **no Confederate levy still pending on 31 July**. The delays can impede concentration but are not an unraised end-of-July balance. [M]

[Field transfers](S84/field-transfer-requests.csv) separately records **31** inter-post requests: 29 responses in the retained trace, all compliance; two final requests remain in transit, due days 149 and 150. These reassign existing lots. Repeated `blocks, amount=999` requests are an administrative maximum, not 999 men or fresh recruitment. Origin identity is preserved; missing concentration cannot explain away a missing nationwide headcount. [M]

**Proposed strength ruling [I].** Keep the floor and the failures. Prioritize (1) Virginia's nonduplicating statewide/local return crosswalk, (2) dated Louisiana acceptance/returns versus its model's repeated objections, and (3) the unrepresented South Carolina/Texas/Arkansas/Tennessee later pairs and Georgia State brigade, with identity/date/overlap holds first. Alabama/Mississippi already have extra pairs: Walker's six-State list is not permission to add twelve new regiments wholesale. Reject uniform headcount defaults, earlier arrival fitting and blanket compliance changes. This is a bounded data/eligibility diagnosis, not an authorized new campaign or code change.

## 2. Reservations, slow walks and trims

### Every counted response [M]

The scorer counts a unique **addressee response key and actual rung** when its response day is observed. It does not count a unique historical episode or every role in a chain. All dates below are response dates; same-day duplicates are distinct orders. Full order IDs, role/kind, willingness terms and reasons are in [pushback-responses.csv](S84/pushback-responses.csv).

| Side | Actor | Kind | Reservations: days / dates (count) | Slow walks: days / dates (count) |
|---|---|---|---|---|
| Union | Morgan, New York | call | 41 Apr15; 59 May3; 78 May22; 142 Jul25; 147 Jul30 twice (6) | - |
| Union | Randall, Wisconsin | call | 41 Apr15; 78 May22 (2) | - |
| Union | Sprague, Rhode Island | call | 41 Apr15; 71 May15 (2) | - |
| Union | Magoffin, Kentucky | call | 44 Apr18 (1) | - |
| Union | Burton, Delaware | call | - | 41 Apr15 (1) |
| Union | Curtin, Pennsylvania | call | - | 41 Apr15 (1) |
| Union | Washburn, Maine | call | - | 41 Apr15; 72 May16 (2) |
| Union | Yates, Illinois | call | - | 41 Apr15; 72 May16 (2) |
| Union | Jackson, Missouri | call from Lincoln | - | 43 Apr17 (1) |
| Union | Rector, Arkansas | call from Lincoln | - | 45 Apr19 (1) |
| Union | Saunders, Nebraska | call | - | 78 May22 (1) |
| Confederate | Rector, Arkansas | call from Davis | 74 May18 (1) | 121 Jul4 twice (2) |
| Confederate | Moore A.B., Alabama | call | 121 Jul4 twice; 124 Jul7 (3) | - |
| Confederate | Magruder | appointment | 82 May26 (1) | - |
| Confederate | Pickens, South Carolina | call | - | 4 Mar9; 34 Apr8; 42 Apr16; 124 Jul7 (4) |
| Confederate | Pettus, Mississippi | call | - | 120 Jul3; 121 Jul4 twice (3) |
| **Total** | | | **Union 11 + Confederate 5 = 16** | **Union 9 + Confederate 9 = 18** |

Side here is the **issuing principal's side**, so Rector/Jackson's responses to Lincoln stay in the Union-command exposure even if the recipient later serves the Confederacy. Of the 16 reservations, 15 are calls and one an appointment; all 18 slow walks are calls. The 33 call answers have no resource shortfall term; their rung comes from the scored temperament/values/deterrence terms. Reservation willingness is 0-9 under `reservationsAt=0`, `complyAt=10`; negative willingness with uncandid responses produces these slow walks under the existing resolver. These are actual rungs even when the declared answer is compliance. They do not establish 34 deliberate historical political bargains. Two Cameron relay slow walks, days 133/140 (16/23 July), are excluded from those 18 by the scorer's addressee rule. [Measurement evidence](S84/measurement-evidence.json) retains both.

### Comparison with Appendix C

Appendix C's method and count table use **cases**, often a chain or a group, with judgment labels and mixed VP/VS/note-only evidence. Its reservation floor is N3-26, Harney's Price agreement (catalogue cites OR I-III pp.374-376), while X-04 is Morgan's request for explanation of the April call (III-I pp.72,86). N3-15's Summers substitution is note-only. The model has six Morgan call responses but no Harney reservation in its 16; Magoffin's model reservation is not the catalogue's refusal classification. Likewise, N3-10 (Scott/Pickens, ORN I-IV p.90) and N3-34 (Patterson, OR I-II p.168) supply the two verified slow-walk cases. None of the model's 18 slow-walk addressee responses belongs to Scott or Patterson. These are comparisons to the **catalogue's attributed classifications**, not fresh primary verification of those pages.

0099 item 6 explicitly counts both sides against Union case floors and design ceilings. The issue is also the counting unit and exposure: repeated calls expand 16/18 without adding independent catalogue cases. Splitting by side alone gives Union **11 reservations**, still above nine, and **nine slow walks**, at its upper edge. It does not cure the missing cases or justify a pass. 0109 already recounts relay/filter holds by mechanism; its other five bands, including trims, stay unchanged.

### Why zero trims [M/I]

S82's committed post-kind vocabulary has **no `filter` role**. `filterPostOf` can therefore select no presidential wire intermediary, and the reference fires neither `reports.filtered` nor `reports.trimmed`. This is consistent with 0109's prohibition on inventing a Seward/Walker wire-filter office. A further mismatch exists: the generic trim telemetry counts **cut claims**, restricted by the pack to `own-losses` for an uncandid holder with `reputation`. Appendix C's sole trim-floor case N3-07 concerns Seward's diplomatic assurances allegedly not reported upward, not the deletion of own-loss claims from a military return. N3-07's claim that Lincoln was not told remains the catalogue's secondary/note-limited assertion; this run does not newly prove it. Richardson I pp.85-88, read here, confirms the separate outward memorandum case N3-06 and its understood delayed delivery, not all of N3-07's concealment claims. Installing a wire filter or making Seward uncandid would not source that missing act.

**Proposed measurement ruling [I].** Supersede 0099 item 6 explicitly before changing what passes: publish the raw per-side/per-role/per-kind response counts as exposure diagnostics, and use a separate case register with one named, source-bounded act and its declared counting unit per historical comparison. Keep repeated orders identifiable, but do not treat them as more verified cases. Review N3-07 against diplomatic information handling and its original evidence before deciding whether any cut-claim trim floor is warranted. Retain the current failed bands until the lead accepts a revised measurement record. Reject widening ceilings to 16/18, a threshold tweak justified only by those totals, collapsing both sides into apparent Union examples, or declaring this note a waiver.

## 3. Johnston: objection, decision and elapsed time

### What the model actually does [M]

The caused advance notice fires day 140 (**23 July**), reaches Davis day 141 (**24 July**), and produces the ordinary through-chain goal day 142 (**25 July**, also the first Manassas combat day). Walker objects at the relay that day: willingness **-164** = values -200, temperament -105, regard +90, deterrence +51. The history driver then sends the fresh bypass on day 143 (**26 July**) by special messenger. It arrives day 146 (**29 July**), a three-day leg. The committed doctrine dates its offensive from 17 July but requires the received advance notice; the date alone cannot send it.

The order is an ordinary **take Manassas** goal: risk 500, 30 remaining days, rail permitted, river/sea/neutral forbidden, no individually committed blocks, no wait for word and approval as drafted. It carries no separate practicability or sick/baggage instruction. The generic advance terms honour glory and offend caution at boldness 600.

Johnston's sampled boldness is 472 and candour 853. His held values are caution and duty; the order does not honour duty. Willingness is **-224**: caution -200, temperament gap -51, deterrence +27; regard, capacity, disposition and grievances are zero. High candour takes the open-objection branch. Standing shields him; the recorded reasons are offended caution and protected standing. His listed pack traits are `candid`, `infirm`, `rank_proud`, `secretive`, `shifts_blame`; no independent rank grievance, sickness or want-of-men penalty occurs in this response. These are model parameters and observed terms, not newly verified biographical judgments. Changing his historical traits to compel a march is unsupported.

His received local estimates through day 146 report **16,000 in the lower valley**, not an empty enemy front. Tennessee's 24,000 are joined by 29 July; the Georgian 5,000 finish joining by 30 July, with a local Virginia force still unknown. His day-147 selected plan uses 29,000 known, perceives zero at the Manassas objective, and separately charges exposure to perceived men along the route. The retained papers are evidence of what reached him, not an assertion that he knew the full true McDowell army.

**The objection does not stop the operation.** `arriveOrder` records a goal response and sets the winning new goal; it does not make every `object` a veto. The plan changes to choosing on 29 July, and Johnston selects the direct plan on **30 July/day147**, score 922 against -36 for holding. Operation `op:cs_cmd_harpers_ferry:147` opens and remains in `assemble` on 31 July, until day151, with four assembly days followed by seven road days through Loudoun/Fauquier. The model has no completed junction in July, but it also has no permanent refusal by Johnston. S82's status shorthand must not be expanded into that causal claim. [Full order, relay answer, received reports, plan and operation](S84/junction-evidence.json).

McDowell's actual model fighting is 25, 28 and 29 July. Johnston receives the bypass on the last of those days and starts assembly the following day. [I] That late notice/relay/delivery/planning sequence and real route duration explain why joining is already beyond the horizon without a rule forcing refusal or a fitted arrival. The four-day assembly and the goal's lost historical discretion are specific seams for later review, not authority here to erase either. No counterfactual timing run was made.

### What moved him in the record

Johnston's official report says he received the government's telegram about 1 a.m. on **18 July**, decided immediately to join Beauregard under the discretion it conferred, and chose to evade Patterson rather than defeat him first. It describes Stuart's screen, movement through Ashby's Gap to Piedmont, infantry by railway and cavalry/artillery by road, and his arrival about noon on 20 July (OR I-II **p.473**, a retrospective official self-report).

Davis's endorsement prints the actual **17 July Cooper telegram**: Beauregard was under attack; concentration of the effective force was needed; movement was conditional on practicability; sick and baggage could go to Culpeper by railway or Warrenton; Johnston retained discretion over arrangements. It disputes Johnston's rendering of the sick instruction (OR I-II **p.478**). Keep the telegram and later report separate.

Johnston's contemporary **18 July acknowledgment** reports Patterson apparently moving to Charlestown; it says he intends to move toward Beauregard unless prevented, lacks transportation for sick/baggage, can carry only four days' provisions, accepts hunger risk because of urgency, and is delayed arranging care for the sick. Carson's two militia brigades cover Winchester, with fallback orders (OR I-II **p.982**, [transcription read](https://www.civilwar.com/battles/570-official-record/series/volume/campaign/first-manassas/152233-982-series-i-volume-ii-serial-2-first-manassas.html)). This supplies a concrete urgency/discretion/transport/cover combination, not obedience inferred from a personality label.

**Proposed junction ruling [I].** Preserve the actual objection, the subsequent approved operation and the July nonarrival as three separate observations. Review caused intelligence and institutional relay, the ordinary goal's representation of discretionary reinforcement, and assembly against the dated effective-force state before contemplating any calibration. Reject personality fitting, a mandatory 18 July arrival, a forced junction and attributing all delay to Johnston's open answer. This note changes none of those mechanisms.

## Verification and handover

The package is documentation and extracted evidence only. Analysis scripts and raw logs are ignored under `runs/s84/`; they do not enter runtime or this commit. The original 1,812 tracked paths were inventoried and byte-checked before final prose; workspace aliases resolve into this worktree. The focused final audit checks source hashes, all 49 calls, 34 counted responses, 31 transfers, lot ownership, the 86,894 reconciliation and preserved executable inputs. The unchanged pre-commit hook remains the required commit gate. Its actual outcome is reported in the one CODEX status after it runs; this committed note makes no pre-emptive hook-pass claim. No extra full suite or done-check campaign is required by this research-only request; the hook runs its own complete check. S82's unchanged simulation/done evidence is reused, and all unwaived 1A failures remain.

For the lead: rule on the three proposals above; route the small data/identity crosswalks and measurement-definition work separately; retain every acceptance hold until an explicit accepted amendment or implementation clears it. Nothing is signed or cleared for main.

## Findings outside my scope

S83 politics/B2 integration and its changing results, code/pack application, a new calibration campaign, whole-branch independent review, gate signatures, 1B lever-sweep dependency, hosted timing certification, main integration, release and pushing. Missing original strength returns, overlap crosswalks and N3-07's underlying concealment evidence are unfinished research holds, not historical absences.
