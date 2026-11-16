# Lane 1.2 hand-over: the planner and plans in the kernel

Branch `claude/phase1-planner-8a4cce`, from `main` at fdb93bc. Built to FOUNDATION section 12 row 1.2 (0073) and the lead's brief, on 0062 and lane 0.9's hand-over. For the standing reviewer, then the steward. **It adds State (`planRecords`), so it merges only after lane 1.1's scanner fix (`phase1-scanner-aliases`) lands.**

## The answer

The planner is a pure kernel module in 0062's shape, `plans` is State, and standing goals are no longer any order's content. The spike's three cases run on the kernel planner on the testbed, with every input about the enemy and the ground read from the commander's view. They keep the spike's differences of character; the two picks that changed are lane 0.9's own fixes taking effect (below). `npm run check` (947 tests) and `npm run run:done-check` (six PASS) pass locally.

## What is built

| Where | What |
|---|---|
| `kernel/src/heap.ts` | The binary heap, moved out of `supply` (git mv); supply, movement and the planner import it (FOUNDATION 11, rule 11) |
| `kernel/src/movement/march.ts` | `passageBar`: the movement passage rule without water obstructions, exported; `marchBar` = `passageBar` + the obstructions truly there. The planner imports `passageBar`; the spike's `regionPasses`/`edgePasses` are gone |
| `kernel/src/knowledge/report.ts`, `beliefs.ts`; `view/` | Claim kinds `works` (fortification by region) and `obstruction` (a water edge in `claimToken`, the works' region or null for a boom), plus `plan-submitted` and `plan-answer`. `latestWorksClaims`, `latestObstructionClaims`; `SeatView.worksBeliefs`, `obstructionBeliefs`. The enemy estimate now carries works and obstructions of the ground he watches (`tick/generate.ts`) |
| `kernel/src/planner/` | `types`, `context` (input, threat field, willingness), `input` (`plannerInputFor`: view + derived map + own side's State), `route` (Dijkstra on `passageBar`, goal permissions, view obstructions, held-ground days), `profile`, `axes`, `score`, `methods`, `draft`, `edits`, `index` (exported as the `planner` namespace) |
| `kernel/src/plans/` | `goal.ts` (`PlanGoal`, postures, `EditSpec`, statuses; the STAND-IN `StandingGoal`), `plans.ts` (the writer: `setGoal`, `saveDraft`, `choose`, `approve`, `sendBack`, `release`, counters), `conflict.ts` (STAND-IN conflict resolution, the call site 1.1 swaps), `execute.ts` (STAND-IN execution adapter, owned by 1.4) |
| `kernel/src/tick/plans.ts` | Phase 1b (picks, submissions) and 2b (edits answered through `resolveDirective`, then drafts within the daily cap); `PLANS_MECHANICS` |
| `kernel/src/tick/orders.ts` | `issueOrder` for goals, reviews and `go`; `arriveOrder` by kind; the order payload (`orderKind`, `orderGoal: PlanGoal`, `orderEdit`). `relayOrder` changed by one line (`isAdvance`) for the new payload |
| `kernel/src/log/commands.ts`, `log.ts`, `session.ts` | `order` carries `GoalTerms`; new `review` (approve, send back, edit) and `go`; every field typed by `entryProblems` |
| `kernel/src/seats/` | `PlanMenu` (the planner's candidates as `OptionView`s) replaces `StandingMenu` and the consistency judgement; the principal's menu gains `reviews`, `awaiting`, `goalDefaults`; `SeatPerson.competence` (STAND-IN, 0058 table) |
| `kernel/src/world/world.ts`, `pack-format`, both packs | `WorldRules.planner` (thresholds, lane 0.9's fixes, `dailyDraftCap`, `weights`) and `WorldRules.plans` (goal defaults, compliance stand-ins); `standing.scoreCap` removed with the consistency judgement |
| `rule-seats` | A commander picks his best candidate; the generic principal sends a full goal, approves submitted plans, gives the word; `crossNeutral` (STAND-IN) |
| `cli/src/planner-cases.ts`, `run-planner-cases.ts`, `drafting-measure.ts` | The three cases through the view; the drafting measurement on the kernel planner |
| Tests | `cli/test/planner.test.ts` (the spike's 25, ported, plus finding 7, 8, 9, 11 and term liveness), `kernel/test/plans.test.ts` (the plan cycle); the touched suites updated |
| Retired | `prototypes/planner-spike/`, its `tsconfig.json` and `vitest.config.ts` includes, `plans/standing.ts`, `standingOptions`, `holdGoalsForNewFieldPosts`, `initialGoals` |

### The boundary (lane 0.9 finding 11), as built

- **From his view only:** enemy strength per region (with his perception, 0052), works, obstructions. `plannerNetwork` drops the derived network's obstructions so nothing can plan on a boom he was not told of; a test drafts the relief with and without the report.
- **From the derived map:** his side's control index and supply, and the network's edge condition and neutral ground. Edge damage is read from there, not reported; no proposer changes it in 1A (see "Findings").
- **From his own side's State:** blocks, posts, holders' regard and values. **From the World:** map, rules, traits through `seats/world.ts`.

The stop rule did not trigger: nothing the planner needs about the enemy or the ground has to come from truth.

## The three cases (`npx tsx packages/cli/src/run-planner-cases.ts`)

| Case | Appointee | Organiser | Fighter | Steady |
|---|---|---|---|---|
| Pincer, true strength | direct, waits for men (pincer refused: `max_axes`) | holds | **pincer** (spike: direct) | direct = pincer, id order |
| Supply | supply line | holds | direct, farther outside supply | supply line |
| Naval relief | clear first | clear first | run in | clear first |

What changed, and why:
1. **The fighter now picks the pincer at true strength.** The assault margin (1500‰, finding 1) makes one army too few against the Bulge's garrison. With the margin at 1000‰ he attacks alone, as in the spike (tested). The steady man's pincer window moved from 1.75–2.5x overestimate to 1.25–1.75x.
2. **The march on Southvale avoids the fortified Neck.** Held ground is priced (finding 9), so the direct route now takes the Highcairn road (the spike's flank) with an assault at the hills; every penalty alternative doubles back, so no flank is offered. Priced at zero, the route goes by the Neck again (tested). A waypoint through the Neck is now the dearest edit.
3. Perceived strengths, the shortfall condition, the boom's two variants and every gate list match the spike.

## Measurements

- **Cost per draft, Union graph** (23 held commands with a block, 16 with a land force; each asked to take the other capital, neutral ground permitted): median 2.1–2.4 ms per draft, slowest 6.6 ms; all 23 at once 27 ms (p95 29 ms). A capped day (the 3 slowest together) is at worst 11.5 ms. Testbed: under 1 ms.
- **The tick, re-measured with the planner running:** Union at war median 19.2 ms, p95 45.7 ms (budget: 40 ms median, 160 ms p95); testbed 1.3 ms.
- **The cap stays at 3 a day** (lane 0.8's value), applied to all sides together, oldest request first. Edits are not capped (each re-expands one plan).
- **Term liveness, over drafts and edits:** every one of the 10 terms is live in some case across the 4 seatings and 3 overestimates (tested). In the reference runs, drafts fire `supply` and `goal_fit`; the editing exercise run fires `haste` and `exposure` over edits.

## Choices, with what was rejected

1. **Draft sets are State records with prefixed keys** (`cand*`, `axis*`, `leg*`, ...), declared in `IMMUTABLE_RECORDS`. *Rejected:* recomputing on read (a later call sees a changed map); saving the planner's input (larger).
2. **Records renamed `Plan*`** (`PlanCandidate`, `PlanTerm`, ...) because the scanner matches records by name and `Contribution` already exists in `directive.ts`.
3. **A plan record per post**, statuses drafting → choosing → review → ready → approved. *Rejected:* a list of plans per post (one goal at a time is FOUNDATION's model).
4. **Drafting runs in phase 2b**, after deliveries, on a fresh derivation of the morning's map only on days with plan work. *Rejected:* drafting inside `arriveOrder` (no derived map there); the shared map cache (it would add a recompute at month boundaries and move `map.recomputed`).
5. **The pick is the seat's the morning after the draft**; an unanswered menu takes the best and counts `seats.defaulted`; one candidate needs no request.
6. **"Approve as drafted unless he objects"**: a pick goes ahead unless it holds against a goal to take or relieve, or waits for men; then it goes for review.
7. **Submissions and answers travel as reports.** A review is listed once the submission is no longer in transit (his knowledge may prune it, superseded by a later answer to the same order); an answer already sent is not listed again.
8. **The answer to an edit is a report** (declared rung and stated reasons in it; willingness and the actual rung as truth terms `compliance`, `edit_distance`); `plans` keeps only its id (0073: responses are `proxy`'s). He executes `concretePlan` for the actual rung; an objection keeps his own plan.
9. **Edits answer through `resolveDirective`**, boldness relative to his best (finding 2), required from his demand, an `overruled` grievance by distance; candour, standing and context are STAND-IN pack rules until 1.1.
10. **The situations `goal` condition keeps its key**, now `{ post, posture }` read from `plans`; 0071's refusal stays pointed at it, wording "goal" for "standing goal". *Rejected:* dropping the condition and the refusal (a goal is still the principal's order, 0071).
11. **Option orders name a posture and an objective**; the rest of the goal is `plans.goalDefaults`. The gate's `orderPattern` string becomes `posture:post:objective`.
12. **No goal at the start**, and none when a government joins a side (0072's hold goal retired): a post with no goal holds where it stands, and an order to it is obeyed (S1).
13. **The generic principal's goals permit neutral ground** (`crossNeutral`, STAND-IN): Phase 0's passage crossed it without permission, and without it neither opening army has a route.
14. **Unknown strength and stores count as none** in the planner, as elsewhere; an unknown-stores block outruns its stores at once, which the supply term prices heavily.
15. **`-0` normalised** in every term: it does not survive a save, and the resume check caught it.

## Stand-ins this lane leaves, each labelled in code

- `plans/execute.ts` and `standingGoals` (owner 1.4): an approved plan marches through Phase 0's path to its own main axis's objective; route, phases, depot steps, partner axes and support requests are not executed.
- `plans/conflict.ts` (owner 1.1): resolution by department, at `arriveOrder`'s one call site.
- `WorldRules.plans.compliance*` and `SeatPerson.competence` (owner 1.1).
- `RuleSeatPolicy.crossNeutral` with the generic principal (owner 1.12).
- Ships carry their own stores in the planner's supply term (owner 1B's ships' stores).

## Not done, or not verified

- CI on Linux and Windows: pushed; see the report for its state.
- No decision point for "a plan is ready for review": 1.4's row names it.
- The principal's review sees the plan's arrows from the kernel's menu once the dispatch has arrived; a console preview of an edited route is 1.13's.

## Findings outside my scope

1. **The Union at-war run no longer occupies ground.** Phase 0's 29 occupations came only from the generic principal marching the Washington garrison away. The garrison now holds; the Charleston command takes Washington by contest (days 15 to 23), then a stalemate. I changed the done check's behaviour criterion to "a contest or an occupation, and control changes" in each run (`done-check.ts`). The lead should confirm or record it.
2. **`relayOrder` (1.1's) changed by one line** to read the new payload (`isAdvance`); relay compliance still sees only "is it an advance".
3. **Edge damage reaches the planner through the derived map, not by report.** Nothing proposes damage in 1A; once raids exist (1B), damage he has not been told of should not route him.
4. **Gate code touched**: `gate.ts` (the order pattern string, one line and comments), `situation-layer.ts` (posture for kind, wording). A gate reviewer should look.
5. **Most Union blocks have unknown stores** (lane 0.3's data gap), which the planner reads as none: every march outruns its stores at once (the Washington garrison's supply-line march on Montgomery takes −960 for supply and −600 for lateness, and scores −760 against holding's −50). Risk 5 of the exit review, for lane 1.10's numbers.
