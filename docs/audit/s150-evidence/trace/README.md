# S150 instrument and offer trace through day 140

The retained command log replayed from the original opening through day 140. All **140** state hashes matched and there were **zero** command rejections. The trace covers **16 declared allocation instruments**, **16 received offers** and **4 offers still unreceived**. [Coverage](coverage.json) · [Evidence inventory](evidence-inventory.json)

Mansfield held **17 lots and 14,722 men** at Washington on day 140. The seven June 3 offers account for all 17. Willcox's 1st Michigan also arrived, but its three-month service ended on day 136. Neither group was transferred to McDowell. The day-120 snapshot has 18 lots and 15,502 men in Mansfield's command. [Retained totals](../capture/army-totals.json)

The runner records stable lot IDs at the opening and whenever the tick freezes a new State. Each change carries its day and the calling phase's source line. Movement, receipt or reassignment within the same phase can appear as one combined change. Exact paper dispatches and deliveries also come from the tick's message events. A selection diagnostic uses the State at the preceding observed phase boundary, since the runner cannot inspect the instant between successive messages in a delivery batch. Full local files include 348 lot timelines with 1,070 transitions. [Trace runner](../../../../tools/s150-trace-instruments.ts)

## Allocation instruments

Numbers in the middle columns are simulation days. All 15 papers that dispatched reached their actual addressee, who undertook their terms. The addressee's undertaking and delivery of troops are separate events. The pack's source references and declared terms accompany every row in `runs/s150-trace/before/instruments.json`.

| Paper | Dispatch → answer | Selection, receipt and day-140 fate | First observed interruption or later constraint |
| --- | --- | --- | --- |
| Cameron to Curtin, five to Patterson (OR I-II p.166) | 130 → 135 | Zero selected, shortfall 5 | No lot qualified for the long-term cohort under the governor at the first selection boundary. The allocation's `scope_unavailable` follows the live sending-chain scope. |
| Cameron to Curtin, remainder to Scott (OR I-II p.166) | None | No selection or journey | The authored witness requires the five's reported shortfall to equal zero. The delivered report from the first request gave five and resolved the witness as `claim_bound`. |
| June 3, Connecticut (OR III-I p.246) | 90 → 96 | 1 selected, received 106, still at Washington under Mansfield | Receipt complete. The paper gives Washington as destination. No later assignment for this lot occurred. |
| June 3, Maine (OR III-I p.246) | 90 → 95 | 1 selected, received 105, still at Washington under Mansfield | Receipt complete. No later assignment occurred. |
| June 3, Michigan (OR III-I p.246) | 90 → 96 | 3 selected, received 109, still at Washington under Mansfield | Receipt complete. No later assignment occurred, and none carries the 4th Michigan identity. |
| June 3, New Hampshire (OR III-I p.246) | 90 → 95 | 1 selected, received 105, still at Washington under Mansfield | Receipt complete. No later assignment occurred. |
| June 3, New Jersey (OR III-I p.246) | 90 → 95 | 3 selected, received 101, still at Washington under Mansfield | Receipt complete. The June 25 paper later reached the governor, who had already released these same three named lots to Washington. |
| June 3, Wisconsin (OR III-I p.246) | 90 → 96 | 2 selected, received 109, still at Washington under Mansfield | Receipt complete. No later assignment occurred. |
| June 3, Massachusetts (OR III-I p.246) | 90 → 96 | 6 selected, two containers received 106, still at Washington under Mansfield | Receipt complete. No later assignment occurred. |
| Connecticut First, Second and Third (OR III-I p.160) | 61 → 66 | First selected. No receipt. First expired day 136 with the governor. | `named_absent` at selection for Second and Third. First immediately waited with `no_route` under the exclusive sea/river terms. It never began a leg. |
| Fourth Michigan (OR III-I pp.283, 287) | 107 → 113 | Zero selected | 4th Michigan identity absent at selection and at day 140. No anonymous lot was renamed or treated as a replacement. |
| Sixth Louisiana (OR I-LI.2 p.128, OR IV-I p.750) | 91 → 103 | Zero selected | 6th Louisiana identity absent at selection and at day 140. The earlier April 22 Louisiana offer delivered an anonymous lot to Richmond. |
| Scott through Mansfield to McDowell, Third Connecticut and Second New York militia (OR I-II p.716) | 110 → 110 | Zero selected | Third Connecticut identity absent. Second New York militia was outside Mansfield's sending chain, at New York under its governor, both at the selection boundary and day 140. |
| Scott to Blair, Willcox (OR III-I p.200, Robertson p.166) | 70 → 76 | 1st Michigan selected, received 89 at Washington, expired day 136 | Receipt complete. The existing three-month service term ended under Mansfield. |
| Scott to Olden, three long-term New Jersey regiments (OR III-I pp.287, 296) | 112 → 117 | Zero newly selected | All three named lots were already at the requested destination in Mansfield's command. The governor could send only what he still held. |
| Scott to Patterson, four New Jersey militia regiments (OR I-II pp.619–620, 622, Stryker I p.15) | 60 → 65 | Zero selected | All four named lots were held by the New Jersey governor outside Patterson's chain at the first selection boundary. No matching lot remained at day 140. |

### Code and data behind the interruptions

- `authorityBlocks` and `allocationSelection` restrict selection to lots held in the sending chain. The named scope reads the live, sourced identity. A catalogue entry without a live lot cannot fill it. [Authority](../../../../packages/kernel/src/command/authority.ts) · [Allocation](../../../../packages/kernel/src/command/allocation.ts)
- The Pennsylvania remainder's stated order dependency lives in the pack. `paperReadiness` evaluated the delivered numeric claim against that declared bound. [Pack](../../../../packs/union-1861/pack.json) · [Received-paper gate](../../../../packages/kernel/src/knowledge/papers.ts)
- Connecticut's paper permits only sea and river. The selected infantry block stood in New England, whose water exit is a sea edge. The allocation passage check applies the allowed modes and the movement rule bars a non-naval block from water with `needs_ship`. The join phase recorded `no_route`; the lot remained in New England until the enlistment phase removed it. [Map edges](../../../../packs/union-1861/source/world/edges.csv) · [Allocation passage](../../../../packages/kernel/src/tick/allocation.ts) · [Movement rule](../../../../packages/kernel/src/movement/march.ts) · [Join and route resolution](../../../../packages/kernel/src/tick/operations.ts) · [Expiry](../../../../packages/kernel/src/tick/recruitment.ts)

## Received offers

Each Confederate call in this table uses the April 22 receiving destinations read in OR IV-I pp.231–233. The receiving command in the model was the Confederate War Department, representing the named rendezvous. Each later intake under Lee was an assignment change at the same physical place. The Union recipient was Mansfield's Washington command. [Offer receipt](../../../../packages/kernel/src/tick/offers.ts) · [Command intake](../../../../packages/kernel/src/command/command-assignment.ts)

| Offer | Dispatch → answer | Offer created → physical receipt | Day-140 lot fate |
| --- | --- | --- | --- |
| Alabama | 48 → 48 | 53 → 65, Lynchburg | 2 with Lee at Lynchburg |
| Arkansas | 48 → 51 | 56 → 105, Lynchburg | 1 with Lee at Lynchburg |
| Georgia | 48 → 48 | 53 → 63, Richmond | 2 with Lee at Richmond |
| Kentucky | 48 → 53 | 58 → 81, Harpers Ferry | 1 with Lee at Harpers Ferry |
| Louisiana | 48 → 48 | 53 → 78, Richmond | 1 with Lee at Richmond |
| Mississippi | 50 → 50 | 55 → 71, Lynchburg | 2 with Lee at Lynchburg |
| North Carolina | 50 → 53 | 58 → 62, Richmond | 1 with Lee at Richmond |
| Tennessee | 50 → 50 | 55 → 65, Lynchburg | 1 with Lee, Turney in Johnston's brigade, and Bate in Holmes's Fredericksburg command. All three physically at Lynchburg. |
| Willcox | 70 → 76 | 76 → 89, Washington | 1 expired day 136 after receipt |
| June 3 Connecticut | 90 → 96 | 96 → 106, Washington | 1 with Mansfield at Washington |
| June 3 Maine | 90 → 95 | 95 → 105, Washington | 1 with Mansfield at Washington |
| June 3 Massachusetts | 90 → 96 | 96 → 106, Washington | 6 with Mansfield at Washington |
| June 3 Michigan | 90 → 96 | 96 → 109, Washington | 3 with Mansfield at Washington |
| June 3 New Hampshire | 90 → 95 | 95 → 105, Washington | 1 with Mansfield at Washington |
| June 3 New Jersey | 90 → 95 | 95 → 101, Washington | 3 with Mansfield at Washington |
| June 3 Wisconsin | 90 → 96 | 96 → 109, Washington | 2 with Mansfield at Washington |

The Tennessee contingent was taken into Lee's command at Lynchburg on day 78. The subsequent named orders did complete physically. Turney's 1st Tennessee reached Johnston at Harpers Ferry on day 99 and joined his brigade on day 100. Bate's 2nd Tennessee reached the Fredericksburg command on day 95. Bate moved to Lynchburg by day 115 under Lee's order to Holmes `m.96.lee_robert_e.holmes_theophilus_h.order.cs_cmd_fredericksburg`. Turney later moved there by day 131 under Lee's order to Johnston `m.107.lee_robert_e.johnston_joseph_e.order.cs_cmd_harpers_ferry`. The retained day-140 operation records identify both block participants and Lynchburg objectives. Bate's holding post remained Fredericksburg after the move. [Historical onward terms, OR I-LI.2 pp.107–108 and OR I-II pp.897–898](../../../../packs/union-1861/pack.json)

## Defect, gaps and questions for the lead

The middle column above names the first unmet sending prerequisite, rather than treating every historical destination as a promised outcome. Seven June 3 instruments and Willcox completed their stated Washington receipt. No read term in those papers assigns the received lots to McDowell (OR III-I pp.200, 246). The later June 23 paper names two different regiments, neither held by Mansfield (OR I-II p.716). The three long-term New Jersey regiments already satisfied their Washington destination before the second sending paper reached their governor (OR III-I pp.287, 296). These are not losses after receipt.

The additional own-request chain did expose one plain defect. `holdingAvailability` reserved every candidate axis in an approved draft even after its operation ended. Mansfield's approved day-90 plan had an operation completed on day 96; its archived alternatives still barred his Washington lots at day 140. The correction releases that draft lock only after a matching operation ends, using the operation owner's existing post/order/candidate/draft-occurrence identity. Separate live operation axes, unstarted drafts, reservations, authority and physical restrictions still apply. This restores consideration under 0131/0133; it does not compel a grant. The fictional regression failed before the correction and passed afterwards, including choosing, review, ready, approved-unstarted and active-operation guards. [Implementation](../../../../packages/kernel/src/command/allocation.ts) · [Regression](../../../../packages/kernel/test/s147-receipt-requests.test.ts)

The remaining causes need the lead's scope decision:

- **Missing sending prerequisites:** Pennsylvania's long-term cohort is absent; Connecticut Second/Third, Fourth Michigan and Sixth Louisiana lack live named lots; the four New Jersey militia remain outside Patterson's chain until expiry, and Second New York militia remains with its governor. Neither a roster identity nor a sending permission follows from an empty selection. Recover the raising/call/transfer links before extending data (OR I-II pp.166, 619–620, 622, 716; III-I pp.160, 283, 287; I-LI.2 p.128; IV-I p.750).
- **Water transport:** Connecticut First's received sea/Potomac terms need an actual transport path. Choosing land instead or letting infantry traverse a sea edge would change those terms or movement capability (OR III-I p.160). No such mechanism is added here.
- **Later command choices:** Bate and Turney return to Lynchburg under later ordinary orders, after their read onward orders succeed. The outstanding conditional Lynchburg station/hold and supersession terms remain declared gaps, rather than forced dates or destinations (OR I-LI.2 pp.135–136, 140–141, 151). The lead should decide their next bounded declaration.
- **Intermediate force requests:** Scott's own-request answer can grant only his directly held lots; Mansfield holds the Washington force. The existing chain relays upward or solicits a governor, rather than creating a new addressed request to the subordinate holder. Whether to add that path is a design question under 0133, not permission to seize Mansfield's force.

The independent review found no traced organisation failure to add to this correction: at the four declared army seats on days 120/140/146 there was no otherwise eligible named block blocked solely by a completed draft. Turney was already organised and Bate stood away from Fredericksburg. The similar conservative organisation check is not changed.

The retained plan-choice assertion remains pending. Its four-day fictional probe records one plan-selection choice on day 2 and one new local force-request choice on day 4 (`unknown_enemy_bootstrap`, quantity one), hence `seats.choices = 2`. The new choice came from S147's 0133 request path, not duplicate counting of the plan selection. The assertion expecting one was left untouched. Raw request menus, answers and command log: `runs/s150-trace/plan-choice-probe.json`.
