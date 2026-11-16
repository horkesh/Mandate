# Lane 1.2 hand-over: the planner and plans in the kernel

Branch `claude/phase1-planner-8a4cce`, from `main` at fdb93bc, with `main` merged in at 0505b37 (lane 1.1, people) and adapted to it (3463399; no rebase, L20). Built to FOUNDATION section 12 row 1.2 (0073) and the lead's brief, on 0062 and lane 0.9's hand-over. For the standing reviewer, then the steward. Lane 1.1's scanner fix is on main, so the new State (`planRecords`) can merge.

## The answer

The planner is a pure kernel module in 0062's shape, `plans` is State, and standing goals are no longer any order's content. The spike's three cases run on the kernel planner on the testbed, with every input about the enemy and the ground read from the commander's view. They keep the spike's differences of character. Three picks changed, each explained below: two are lane 0.9's own fixes taking effect, and one is lane 1.1's compliance judging the pincer partner. Locally, `npm run check` passes (984 tests, the stricter one-writer scanner among them) and `npm run run:done-check` gives six PASS.

## What is built

| Where | What |
|---|---|
| `kernel/src/heap.ts` | The binary heap, moved out of `supply` (git mv). Supply, movement and the planner import it (FOUNDATION 11, rule 11) |
| `kernel/src/movement/march.ts` | `passageBar`, exported: the movement passage rule without water obstructions. `marchBar` is `passageBar` plus the obstructions truly there. The planner imports `passageBar`; the spike's `regionPasses` and `edgePasses` are gone |
| `kernel/src/knowledge/report.ts`, `beliefs.ts`; `view/` | New claim kinds: `works` (fortification by region), `obstruction` (a water edge in `claimToken`, with the works' region, or null for a boom), `plan-submitted` and `plan-answer`. New `latestWorksClaims`, `latestObstructionClaims`, `SeatView.worksBeliefs` and `obstructionBeliefs`. The enemy estimate now carries the works and obstructions of the ground he watches (`tick/generate.ts`) |
| `kernel/src/planner/` | `types`; `context` (input, threat field, willingness); `input` (`plannerInputFor`: view, derived map, his own side's State, and people through `traitsOf` and `answerOrder`); `route` (Dijkstra on `passageBar`, goal permissions, view obstructions, held-ground days); `profile`; `axes`; `score`; `methods`; `draft`; `edits`; `index`. Exported as the `planner` namespace |
| `kernel/src/plans/` | `goal.ts`: `PlanGoal`, postures, `EditSpec`, statuses, `goalKindOf`, and the STAND-IN `StandingGoal`. `plans.ts`: the writer (`setGoal`, `saveDraft`, `choose`, `approve`, `sendBack`, `release`, counters). `execute.ts`: the STAND-IN execution adapter, owned by 1.4 |
| `kernel/src/tick/plans.ts` | Phase 1b (picks, submissions) and phase 2c (edits answered through `answerOrder`, then drafts within the daily cap); `PLANS_MECHANICS` |
| `kernel/src/tick/orders.ts` | `issueOrder` for goals, reviews and `go`. `arriveOrder` by kind: a goal is answered by `answerOrder`, and a conflict by `resolveOrderConflict`. The order payload (`orderKind`, `orderGoal: PlanGoal`, `orderEdit`). `relayOrder` reads a review's or a go's kind from its plan's goal (`relayKindOf`) |
| `kernel/src/log/commands.ts`, `log.ts`, `session.ts` | `order` carries `GoalTerms`. New `review` (approve, send back, edit) and `go`. Every field is typed by `entryProblems` |
| `kernel/src/seats/` | `PlanMenu` (the planner's candidates as `OptionView`s) replaces `StandingMenu` and the consistency judgement. The principal's menu gains `reviews`, `awaiting` and `goalDefaults`. A plan stays off his menu while his answer is in play: on its way, or withheld by an office whose objection has not reached him yet |
| `kernel/src/world/world.ts`, `people/rules.ts`, `pack-format`, both packs | `WorldRules.planner`: thresholds, lane 0.9's fixes, `dailyDraftCap`, `partnerWillingnessWeight`, `weights`. `WorldRules.plans`: goal defaults, `holdingRisk`. `people.traits.assaultMargin`. `standing.scoreCap` is removed along with the consistency judgement |
| `rule-seats` | A commander picks his best candidate. The generic principal sends a full goal, approves submitted plans and gives the word, and goes around an office that withheld one of those answers with the same answer. `crossNeutral` is a STAND-IN |
| `cli/src/planner-cases.ts`, `run-planner-cases.ts`, `drafting-measure.ts` | The three cases through the view (seating by rewriting the holder's World record, people `as-history`); the drafting measurement on the kernel planner |
| Tests | `cli/test/planner.test.ts`: the spike's 25 ported, plus findings 7, 8, 9 and 11 and term liveness. `kernel/test/plans.test.ts`: the plan cycle. The touched suites are updated |
| Retired | `prototypes/planner-spike/` with its `tsconfig.json` and `vitest.config.ts` includes, `plans/standing.ts`, `plans/conflict.ts` (the stand-in), `standingOptions`, `holdGoalsForNewFieldPosts`, `initialGoals`, `plans.compliance*` |

### The boundary (lane 0.9 finding 11), as built

- **From his view only:** enemy strength per region (with his perception, 0052), works and obstructions. `plannerNetwork` drops the derived network's obstructions, so nothing can plan around a boom he was not told of. A test drafts the relief with and without the report.
- **From the derived map:** his side's control index and supply, plus the network's edge condition and neutral ground. Edge damage is read from there, not reported; no proposer changes it in 1A (see "Findings").
- **From his own side's State:** blocks and posts. **From people:** his traits (`traitsOf`) and drawn competence; a partner holder's willingness (`answerOrder` to an advance from his principal). **From the World:** the map and the rules.

The stop rule did not trigger: nothing the planner needs about the enemy or the ground has to come from truth.

## The three cases (`npx tsx packages/cli/src/run-planner-cases.ts`)

| Case | Appointee | Organiser | Fighter | Steady |
|---|---|---|---|---|
| Pincer, true strength | direct, waits for men (pincer refused: `max_axes`) | holds | direct, waits for men (spike: direct); **pincer** with a partner of neutral will | direct = pincer with a neutral partner (id order picks direct) |
| Supply | supply line | holds | direct, farther outside supply | supply line |
| Naval relief | clear first | clear first | run in | clear first |

What changed, and why:
1. **The assault margin makes one army too few against the Bulge's garrison** (1500‰, finding 1, now `people.traits.assaultMargin`). With a partner of neutral will, the fighter picks the pincer at true strength; with the margin at 1000‰ he attacks alone, as in the spike. The steady man's pincer window moved from a 1.75–2.5x overestimate to 1.25–1.75x. All of this is tested.
2. **The partner is the testbed's organiser, and lane 1.1's compliance has him unwilling to advance.** The pack's advance terms offend his caution, so his willingness is −508. The request to him then costs more than the pincer gains, and the fighter attacks alone on condition of men. Give the organiser a willingness of 400 and the pincer returns; give him 0 and every pre-merge pick returns. This is character doing its job, not a regression (tested both ways).
3. **The march on Southvale avoids the fortified Neck.** Held ground is priced (finding 9), so the direct route now takes the Highcairn road (the spike's flank) with an assault at the hills. Every penalty alternative doubles back, so no flank is offered. Priced at zero, the route goes by the Neck again (tested). A waypoint through the Neck is now the dearest edit.
4. Perceived strengths, the shortfall condition (now compliance's `reinforceShare` rule), the boom's two variants and every gate list match the spike.

## Measurements

- **Cost per draft, Union graph** (23 held commands with a block, 16 of them with a land force; each asked to take the other capital, with neutral ground permitted):
  - per draft: about 1.3 ms on average (31 ms over 23), slowest 7.8 ms;
  - all 23 in one day: 31 ms (p95 35 ms);
  - a capped day (the 3 slowest together): at worst 13.8 ms.
  - Testbed: under 1 ms.
- **The tick, after the merge:** Union at war median 10.1 ms, p95 18.3 ms (budget: 40 ms median, 160 ms p95); testbed 1.8 ms.
- **The cap stays at 3 drafts a day** (lane 0.8's value), applied to all sides together, oldest request first. Edits are not capped (each re-expands one plan).
- **Term liveness, over drafts and edits:** each of the 10 terms is live in some case across the 4 seatings and 3 overestimates (tested). In the reference runs, drafts fire `supply` and `goal_fit`, and the editing exercise fires `haste` over edits. `exposure` no longer falls under that exercise's "move now" since lane 1.1's perception, so it is QUIET, driven by the planner test.

## Choices, with what was rejected

1. **Draft sets are State records with prefixed keys** (`cand*`, `axis*`, `leg*`, ...), declared in `IMMUTABLE_RECORDS`. *Rejected:* recomputing on read (a later call sees a changed map); saving the planner's input (larger).
2. **Records are named `Plan*`** (`PlanCandidate`, `PlanTerm`, ...), because the scanner matches records by name and `Contribution` already exists in `directive.ts`.
3. **One plan record per post**, with statuses drafting → choosing → review → ready → approved. *Rejected:* a list of plans per post (one goal at a time is FOUNDATION's model).
4. **Drafting runs in phase 2c**, after deliveries and lane 1.1's people changes. It uses a fresh derivation of the morning's map, only on days with plan work. *Rejected:* drafting inside `arriveOrder` (no derived map there); the shared map cache (it would add a recompute at month boundaries and move `map.recomputed`).
5. **The seat picks the morning after the draft.** An unanswered menu takes the best candidate and counts `seats.defaulted`; a draft with one candidate needs no request.
6. **"Approve as drafted unless he objects"**: a pick goes ahead unless it holds against a goal to take or relieve, or waits for men; then it goes for review.
7. **Submissions and answers travel as reports.** A review is listed once the submission is no longer in transit (his knowledge may prune it, superseded by a later answer to the same order). An answer already sent, or withheld by an office whose objection has not reached him, is not listed again.
8. **The answer to an edit is a report.** It carries his declared rung and stated reasons; the edit's distance is a truth term (`edit_distance`). His response is `proxy`'s (`recordResponse`), and the plan keeps only its key (`counterResponse`, `planResponse`). He executes `concretePlan` for his actual rung; an objection keeps his own plan under review.
9. **Edits are answered by `answerOrder`** on the goal's pack terms, with `ownBest` (his own plan's boldness), `departure` (the edit's distance) and `support` (its requests). This replaces the hand-raised boldness and the `overruled` grievance.
10. **Conflicting orders are resolved by `resolveOrderConflict`** at `arriveOrder`. A conflict needs a plan, a different goal, a different chain status, and an earlier goal set inside the window. Each goal is read with its kind's pack terms and its `issuedDay`.
11. **Relay compliance applies to approvals and the word to go** (0040: they are orders through the chain), with the plan's goal kind. The principal goes around an office that withheld one with the same answer, by special messenger. *Rejected:* exempting them from relay compliance; letting the rule seat answer an objection with a fresh goal (which restarts the plan, and looped the Union run 25 times).
12. **The assault margin is pack data** (`people.traits.assaultMargin`, at least 1000), applied by the planner's `demandFor`, with `demandRatio` untouched. It is named in the `force_ratio` term's reason, not given a term of its own (see "For the lead").
13. **The situations `goal` condition keeps its key**, now `{ post, posture }` read from `plans`. 0071's refusal stays pointed at it, with "goal" in its wording for "standing goal". *Rejected:* dropping the condition and the refusal (a goal is still the principal's order, 0071).
14. **Option orders name a posture and an objective**; the rest of the goal is `plans.goalDefaults`. The gate's `orderPattern` string becomes `posture:post:objective`.
15. **No goal at the start, and none when a government joins a side** (0072's hold goal is retired). A post with no goal holds where it stands, and an order to it is answered by compliance.
16. **The generic principal's goals permit neutral ground** (`crossNeutral`, STAND-IN). Phase 0's passage crossed it without permission, and without it neither opening army has a route.
17. **Unknown strength and stores count as none** in the planner, as elsewhere. A block with unknown stores outruns them at once, which the supply term prices heavily.
18. **`-0` is normalised** in every term: it does not survive a save, and the resume check caught it.

## Stand-ins this lane leaves, each labelled in code

- `plans/execute.ts` and `standingGoals` (owner 1.4): an approved plan marches through Phase 0's path to its own main axis's objective. Route, phases, depot steps, partner axes and support requests are not executed.
- `RuleSeatPolicy.crossNeutral` with the generic principal (owner 1.12).
- Ships carry their own stores in the planner's supply term (owner: 1B's ships' stores).

## Merged with lane 1.1: what was adapted

- **Conflicts:** `plans/conflict.ts` is deleted; `arriveOrder` calls `resolveOrderConflict` with the people rules.
- **Responses:** `PlanRecord.planIssuedDay` and `planResponse`; `PlanCounter.counterResponse` replaces `counterAnswer`. Both are `responseKey`s into `orderResponses`.
- **Edits:** `editDirective(input, set, edited, distance, holdingRisk, base)` returns `DirectiveTerms` with `ownBest`, `departure` and `support`; `answerEdit` calls `answerOrder`.
- **Traits:**
  - `profileOf` takes a `PerceivingPerson` and competence, and `demandRatio` comes from `people/traits.ts`.
  - The planner cases seat a man by rewriting the holder's World record (temperament, competence centre and values) and creating State `as-history`.
  - `SeatPerson.competence` is gone.
- **Two owners reconciled:**
  - the shortfall threshold is compliance's `reinforceShareTimid/Bold` (`planner.shortfall*` removed);
  - the assault margin is `people.traits.assaultMargin` (`planner.assaultMargin` removed).
- **Values:** the partner's willingness is `answerOrder`'s to an advance from his principal, weighted by `partnerWillingnessWeight`. `partnerRegard*`, `partnerHonours` and `partnerOffends` are removed, and the planner names no value.
- **Retired:** `plans.compliance*`.
- **Test seats:** `kernel/test/support/test-seats.ts` sends reviews and go around the chain, so a test office's relay compliance cannot withhold them.

## Not done, or not verified

- CI on Linux and Windows: pushed; see the report for its state.
- There is no decision point for "a plan is ready for review": 1.4's row names it.
- The principal's review sees the plan's arrows from the kernel's menu once the dispatch has arrived. A console preview of an edited route is 1.13's.
- No kernel unit test drives the "objection on its way back" filter in `reviewsFor` directly. The Union reference run's bands (one submission, one approval, four bypassed relays) catch its regression.

## Findings outside my scope

1. **The Union at-war run no longer occupies ground.** Phase 0's 29 occupations came only from the generic principal marching the Washington garrison away. The garrison now holds; the Charleston command takes Washington by contest (days 15 to 23), and a stalemate follows. I changed the done check's behaviour criterion to "a contest or an occupation, and control changes" in each run (`done-check.ts`). The lead should confirm or record it.
2. **In the Union run, the War Department withholds the principal's approval of the Washington garrison's plan** (lane 1.1's relay compliance, on a hold goal), and the principal sends it around by special messenger. Whether an office should be able to withhold "approved as drafted" at all is a design question for 0040's owner.
3. **Edge damage reaches the planner through the derived map, not by report.** Nothing proposes damage in 1A. Once raids exist (1B), damage he has not been told of should not route him.
4. **Gate code touched:** `gate.ts` (the order pattern string, one line and comments) and `situation-layer.ts` (posture for kind, wording). A gate reviewer should look.
5. **Most Union blocks have unknown stores** (lane 0.3's data gap), which the planner reads as none, so every march outruns its stores at once. For example, the Washington garrison's supply-line march on Montgomery takes −960 for supply and −600 for lateness, and scores −760 against holding's −50. This is risk 5 of the exit review, for lane 1.10's numbers.
