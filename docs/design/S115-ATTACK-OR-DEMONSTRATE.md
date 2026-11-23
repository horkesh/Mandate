# S115: Attack or demonstrate, with the duty to detain

23 November 2026. **Design proposal for the lead; no implementation or accepted
decision.** S115 only, `sprint/pushback`, base
`0b7ab4c93530a5fb0f5f1494dea356b652484959`. Current-kernel comparisons use read-only
`sprint/july` at `488a4a8af407c923fd5aab3d83f4b18f7cde5187`.

Recommend one typed operational purpose, `attack_or_demonstrate`, given to a
named commander. Its duty is **to detain an opposing force in a stated area**.
Attack and demonstration are alternative means of that same duty. Choosing the
second does not authorize inactivity. Neither means guarantees the enemy stays.

All proposed mechanics and judgments below are **[I]**. Decisions 0120 item 4
and 0121 govern; S110 is read as its design precursor, not another source of
permission. [Inputs](S115/inputs.json) pin 29 inspected documents/code entry
points. [Page receipts](S115/source-pages.csv) and the four retained
[OCR readings](S115/readings/) identify the historical evidence actually read.
This is a retained-text reading, with no fresh scan, archival recovery, live
source check, or verification of historical receipt clocks.

## 1. What the form must distinguish

The read papers are *Official Records*, series I, volume II (1880), chapter IX,
**printed** pp.166–169. Numbers in these papers describe their authors' statements;
they are not new production strengths, judgment cells, or troop-term inputs.

| Paper and evidence read | Consequence for this proposal [I] |
|---|---|
| Scott, July 13: if Patterson cannot beat the enemy, demonstrate to detain him in the Valley; if the enemy retires in force toward Manassas and following is too hazardous, consider another route (p.166). | Detention is the purpose; the alternative still requires action. This design does not silently implement the further route contingency. |
| Patterson, July 14: reports keeping Johnston nearby, proposes an advance, and raises expiring service and transportation (p.166). His July 16 letter continues across pp.166–167: active operations toward Winchester cannot be contemplated until short-term troops are replaced; he proposes holding Harpers Ferry and a possible subsequent movement, requesting approval (p.167). | Preserve a challenge and a proposed course. A request for approval does not approve itself. His reply cannot seed the conditions he already knew before receiving the instruction. |
| Patterson, July 17: asks whether to hold Harpers Ferry or withdraw; the printed repeat adds no act (p.167). Scott, July 17, 9.30 p.m.: warns against a small front force disguising reinforcement of the Junction (pp.167–168). | A materially fresh instruction has its own authored identity; reminders and copies do not multiply coverage. A screen cannot be treated as the whole opposing command. |
| Patterson, July 18, 1.30 a.m.: acknowledges that night's telegram, raises terms and supposed enemy superiority, and asks whether to attack (p.168). Scott's July 18 paper expects attack or occupation by threats/demonstrations, questions reinforcement of Manassas, forbids crossing the Potomac, and allows intrenching if abandoned by short-term men (p.168). | Fresh demand, question, continued duty, and additional constraints remain distinct. The source's strength comparison does not become Patterson's perception or a model fact. |
| Patterson's July 18 replies claim success through threats and reconnaissance and report constraints; his longer account describes his own conduct (pp.168–169). | Retain attributed claims. They establish neither actual detention nor secret intent. They do not turn a report into an executed demonstration. |

The [paper crosswalk](S115/papers.csv) separates original direction, reported
earlier direction, reply, and repeated copy. Scott's July 12 telegram is referred
to on p.166; **its original is not claimed read here**. The missing sketch noted
on p.167 is not reconstructed. Exact dispatch/receipt clocks, the full legality
of each contingent's term, and actual enemy movement are not recovered by this
four-page reading. The longer July 18 account continues beyond the retained
p.169; that continuation is not read or relied on here.

S109's and S111's U33/U34 entries remain `representation_gap`. U33 asks for a
course objection on the fresh July 13 matter; U34 asks for slow walking on the
fresh July 17–18 matter. They share a form, not one match. C06 is interception at
a dock, U32 is depot change, and C16 is landing-conditioned withdrawal; none is
covered by S115. No verdict or accepted register changes here (0111/0112).

## 2. Typed goal and authority contract

Use a discriminated goal-purpose variant, rather than making `demonstrate` an
interchangeable synonym for `hold` or a new free-standing capture posture. The
following is a **contract sketch**, not the current API or executable code:

```ts
type DetentionPurpose = {
  kind: 'attack_or_demonstrate';
  duty: 'detain';
  target: { kind: 'opposing_command'; post: PostId };
  detentionArea: readonly RegionId[];
  actionArea: readonly RegionId[];
  means: readonly ['attack', 'demonstrate'];
};
```

The goal envelope retains its recipient person/post, received order origin,
authored issuer/key/revision, risk, timing, committed blocks, transport/neutral
permissions and plan-review terms. This purpose variant replaces the regional
posture/objective pair for this form; it cannot simultaneously say `hold` or
`take`. A regional goal remains the existing variant. Plan axes still have
concrete regional endpoints selected by the commander. A validator rejects a
target on one's own side, empty/duplicate/invalid areas, an unknown target post,
missing bounds, illegal combinations and goal references outside the mandate.
Area-list and candidate limits are finite pack validation limits, reviewed
before a build; S115 chooses no numbers.

`target.post` identifies the command whose force is to be detained, not a
secret list of its blocks, live position, or all troops of its faction. The
actor needs a received, attributed association between that command and the
force reported in the area. Anonymous regional `enemy-strength` is insufficient
to distinguish a screen from the main command. If no producer supplies that
association, offer an information request/no-target reason, not a fabricated
named enemy. Believed association may be wrong; it can cause a mistaken plan.
Execution and offline outcome diagnostics retain the distinction.

The two areas bound different things: where the opponent is to be detained and
where the recipient may act. Neither is a prescribed route. Leaving the latter,
pursuing a withdrawing enemy elsewhere, changing depot, or crossing a forbidden
line requires another received order or an explicit existing grant. No open
predicate, `enemy_moved` discretion condition, arbitrary script, or automatically
generated replacement objective is added. Scott's additional July 13 route
clause and July 18 retreat/entrenchment clauses must be retained as sourced
unrepresented terms until their own typed representation is approved; a later
data brief must expose those limits instead of claiming a complete letter.

The principal orders the person (0016). A nonprincipal may issue this form only
under an enacted, holder-bound 0121 mandate naming these actions, subordinates,
areas, movement modes, guard, ceiling, expiry and reporting duties. A root grant
for Scott still needs sourced data and lead review. Neither this note, a reply,
nor a letter's mere presence in World grants authority. Receive, answer, enact;
validate again at selection/dispatch and execution. Child bounds intersect the
parent, and sibling allocations share its ceiling. Commanders cannot use this
form to acquire a peer's troops, levy, appoint or command another side.

0121 supplies identity and receipt semantics: independent fresh letters remain
distinct, same-family revisions become effective only on receipt and through
compliance, late obsolete revisions never restore an old course, and unrelated
chain/bypass conflicts keep 0052's resolver. A repeat needs its explicit new
dispatch link; no automatic resend. One field goal per post per morning remains.

## 3. Beliefs, means and the answer

The morning menu uses the actor's own received papers and derived perception,
own known resources, enacted authority and the map. It never reads the enemy's
private letters, a global response, or the historical answer. Today's arrivals
may affect delivery enactment in its normal phase, but menu choices wait for
the next morning (0052/0121).

The deterministic planner produces a bounded set of **attack** and
**demonstration** candidates. Both carry the same target/detention duty,
order origin, authority basis, force allocation, area and reporting obligations.
Attack candidates use normal route, supply, enemy-estimate, risk and combat
checks. Demonstration candidates require a real force, an authorized deployment
or reconnaissance-in-force task, stores and a feasible recovery course. The
planner ranks feasible candidates with explained existing terms; a future
necessary new term must be presented with its basis, never a fitted Patterson
penalty or a bonus for the historical date.

The future goal converters, equality checks, command log, order envelope,
doctrine schema, plan edits and reports must preserve this discriminant and
its target/areas end to end. Do not let today's `goalKindOf` ternary or a
posture-only conversion erase it. Proposed compliance mapping: both means use
the existing `advance` directive kind, with unchanged people terms; choosing
demonstration is not a new compliance concession. Tactical feasibility remains
the planner's separate question. S115 proposes no new willingness weight.

Test attack feasibility from his own picture. `outmatched` may explain choosing
demonstration, but is not its sole possible cause: a feasible demonstration may
better serve detention without driving the enemy away. Choosing between means
is within this received purpose, not a fallback to a different duty. Ordinary
0114 `turned`/`outmatched` discretion can authorize an expressly supplied
fallback; no new general condition is added. The current regional-only fallback
types need an explicit union extension if a future build uses this form inside
them. Neither path silently manufactures permission.

Unknown enemy location/identity is not absence. Unknown allocable own strength
blocks a numeric commitment or split; it cannot become zero or an estimated
detachment. If no safe authorized means is feasible, record all typed blockers
and retain the unmet duty. The commander may ask for information/reinforcements
or propose a different goal through the ordinary response protocol. Such a
proposal needs received acceptance before action; 0114/0116's proposal triggers
are preserved, not expanded to every preference difference.

`proxy` still owns compliance and any actual/stated delay. Willing compliance,
a supported reservation, a question, a course objection, a proposed new goal
and actual execution are separate. A demonstration chosen within the duty can
be full compliance. A mere question cannot satisfy U33's objection, and a
stated promise cannot prove U34's execution. A refusal enacts no operation;
ordinary delay may prevent an otherwise feasible one. Do not set a covert-delay
flag from these sources or add a trait, weight, threshold or name-specific rule.

## 4. What a demonstration does

Add a finite **demonstration activity** to operations, not a calendar flag or a
holding candidate with a different label. It is a force-backed attempt to make
the opposing commander account for an imminent attack. It has these proposed
stages, with typed transition reasons:

| Stage | Required execution evidence; failure or next transition |
|---|---|
| `preparing` | An approved in-scope candidate with actual exclusive allocations. Assembly and support use normal owners. Missing troops, unknown strength, delayed support or no route blocks activity; time passing is not demonstration. |
| `approaching` | Execute the commander's route, through movement. Actual arrival at an authorized regional deployment/contact area, with available force and stores, permits activity. Obstruction, losses and capture remain possible. |
| `demonstrating` | Execute the bounded deployment/reconnaissance task. Operations records participating blocks, region, task, interval and actual availability; normal stores and combat rules apply. A task merely ordered, a zero-length stage transition, an unstaffed post or a report saying it happened supplies no executed activity. |
| `recovering` | End the bounded task, or abort on an explained safety/resource/authority failure, and follow its authorized recovery plan. Blocked recovery remains an active problem; no teleport, guaranteed retreat or remote rejoin. |
| `closed` | Actual recovery, supersession with allocations handed back, or an existing recorded terminal loss. Close this episode, not the detention duty. Another episode needs a new logged candidate decision and live resources. |

The task vocabulary is bounded to `deployment` and `reconnaissance_in_force`.
A deployment requires a recorded movement leg and actual availability at its
authorized endpoint. A reconnaissance task requires its allocated force to
perform an operations action at the named region, exposed to the ordinary
contact/combat and observation phases and charged normal stores. Its action
record names that force, region and interval; selecting a task or waiting at
headquarters creates no action record. Task duration/recovery bounds need a
reviewed pack rule with a basis before implementation, not a July timer. Where
the engine cannot execute such a task, reject the candidate as unrepresented.

The enclosing detention operation remains active between episodes; an attack
branch likewise does not end the duty merely by reaching a region. Derived
status may say `pressure_attempted`, `blocked`, `awaiting_reply` or `duty_overdue`.
It must never use regional `objective_reached` to certify detention. The existing
deadline is the time performance is required, relative to receipt; it does not
release authority or auto-complete the mission. A received replacement/release,
mandate expiry, terminal loss or confirmed departure that defeats this bounded
mission ends it with its reason and evidence. A report of departure can cause a
mistaken decision; no hidden-position test decides what the commander knows.

Demonstration creates **observable military activity**, not an enemy movement
prohibition. Extend the ordinary reconnaissance producer with an attributed
activity claim, tied to a real observed operation/task/force in a watched region.
Send only what an observer can attribute and observe, with the existing report
route, filtering, latency, confidence and perception. The opposing recipient
knows a reported threat, never the goal's secret intention or the opponent's
mission ID. Observer-internal correlation stays outside the seat boundary.
An uncertain command identity remains uncertain. Numeric claims require known
quantities; no phantom strength is manufactured to make pressure credible.

The opposing commander's next menu/planner reads those received reports and
its own orders/resources. Existing threat judgment may favor staying,
reinforcing, attacking, retiring or proceeding despite the threat. **No pinned
state, compulsory combat, new enemy compliance rule or flat detention bonus.**
If ordinary decision rules do not react, detention may fail; that result must
be measured, not fixed by making the source come true. Existing reports of
strength can already be caused by movement; new activity/identity fields need
actual producers and tests, not a sourced-strength injection.

Physical co-location still obeys combat/contact rules. This form gives no
immunity from battle and no guarantee that a probe remains small. It does not
install a garrison, claim a lasting capture, forbid ordinary enemy attacks, or
run a limited sortie's capture/return policy under a new name. Any control
change comes from ordinary owners and is not evidence of detention by itself.

**Map limit:** the read `regions.csv` combines Winchester and Martinsburg in
`lower_valley`. No distinct Bunker Hill/Charlestown approach, road block or
intra-region line is asserted by a regional activity. A same-region task can
record regional force-backed reconnaissance only; it cannot claim tactical
separation that the combat model lacks. If contact rules collapse that activity
into battle, record it as such. Do not disable combat or award a demonstration
from a stage label. A finer map/contact model is a separate decision. A future
build must cheaply demonstrate a feasible ordinary regional activity or retain
the resulting execution gap before any historical campaign.

## 5. Evidence of performance and pushback

Publish four separate records/views, correlated to the right authored letter
and dispatch: **demand received; answer given; activity executed; effect known**.
The superior gets ordinary delayed reports, not the true operation or the
enemy's private choices. He may believe a false success report. Knowledge of
the opposing force still being nearby proves neither continuous detention nor
that the demonstration caused it to remain.

Offline diagnostics may inspect truth and publish opposing command membership,
strength unknowns, actual departure/march events and reaction reasons for the
bounded interval. They must distinguish **attempt**, **observed pressure**,
**reported success**, **actual retention/departure**, and **causal evidence**.
Forces present at both endpoints may have departed in between; a screen left
behind does not prove retention of the main command. Publish known component
movement and unknown components rather than inventing a percentage for
"enough detained". Where no causal reaction is recorded, the cause is
`unestablished`, even if the enemy stayed. No new detention success threshold
or counterfactual certainty is claimed.

U33's future matcher needs the correctly exposed received form and an actual
challenge to its course, with the generated typed grounds/proposal. U34's needs
the separately exposed fresh matter and the same actor's actual deferral or
qualified execution that actually defers the ordered active course, tied to
its answer and execution history under the
accepted slow-walk interpretation. Honest delay is not proof of covert intent;
conversely, covert actual delay remains in raw diagnostics even when the stated
reply is compliant. A successful demonstration without pushback cannot buy a
slow-walk match. A reservation alone earns no slow-walk credit. No enemy battle
outcome is required as a proxy for pushback.

One act covers at most one row; repeated copies/answers add no credit (0112).
Once a build represents these matters, both rows become binding; recording the
new type alone does not match them. The future measurement must explain any
remaining missing demand, information producer, authority, execution or answer.
S111's other 31 row verdicts and all unmet 1A criteria remain untouched here.

## 6. Owners, persistence and build boundary

| Owner in a later authorized build | Sole responsibility |
|---|---|
| `plans` / planner | Received purpose, selected candidate, original order correlation and approval; draft and score both means; retain parent duty through branch changes. Planner returns proposals, never writes forces, knowledge or authority. |
| `command` | Enacted holder-bound mandates, child bounds and exclusive authority commitments; coordinate allocations without a second troop balance. |
| `proxy` | Response, actual/stated qualifications, delay and reasons, including the normal proposal path. |
| `operations` | Activity stage/events, participating allocation references and closure; no private copy of men or live enemy location. |
| `forces`, `movement`, existing supply/combat/control owners | Lots, men, stores, placement/marches, losses and control through their existing exclusive writers. Any detachment extension must conserve known lots and preserve unknowns. |
| `messages` / `knowledge` | Transport and delivered evidence, respectively. Producers propose actual observations; knowledge files only what was received after filtering. |
| seats / CLI / coverage | Derived legal menu and own received explanations; log selections and revalidate; offline measurement may join truth only in diagnostics. |

Store only new facts that cannot be derived: accepted purpose and its order
correlation under plans; episode stage/history and resource references under
operations; received typed claims under knowledge. Activity opportunities,
beliefs, effective authority, feasibility, status and coverage are Derived.
0121 owns receipts/dispatches/mandates; this form must consume them, not create
parallel ledgers. Keep live references for pruning, then bound ended episode
retention under the existing operation policy; retain the compact last episode
basis needed to prevent replaying a closed task without a new choice.

Each saved field/immutable record needs its `ownership.ts` class and FOUNDATION
section 10 row **with the future code**, plus schema/log/save checks. Older
saves get empty new collections and legacy regional purposes, never an invented
mission, receipt, observed activity or authority. Replay of an older log must
keep legacy meaning or require a fresh run. Strict ordering, integer arithmetic,
content-based candidate/message identities and logged choices remain; unrelated
letters must not renumber streams. No new randomness is proposed.

Build only after the lead rules on this form and 0121's actual dependency
implementations are available: purpose/validation and paper correlation; paired
belief/authority candidates; activity execution plus real observation producer;
reporting/save/ownership; finally sourced exposure and the two row matchers.
Identity/receipts alone do not establish mandates or the activity lifecycle.
Do not merge sibling work, assume S112 complete, or build M1/M3/M10 in this lane.

## 7. Proposed acceptance tests and rulings

[Test matrix](S115/tests.csv): **24 proposed checks**, not executed simulation
tests. Use fictional actors/regions first. Same truth with different delivered
papers must change only the appropriate actor's choices; same papers with a
different enemy choice must permit detention failure. Preserve normal lost,
late, refused, stale, false-report, unknown-strength and combat outcomes.

For the lead, rule on these proposals [I]:

1. **One purpose with two means and a continuing duty.** Reject independent
   `take`/`hold` orders, an `outmatched -> hold` substitute, date-triggered
   demonstration, universal condition syntax and capture as proof of detention.
2. **Force-backed regional activity and ordinary enemy judgment.** Reject a
   pin effect, invented troop quantities, assumed report producers, favorable
   same-region tactical separation or immunity from combat. Keep any unresolved
   map/contact limitation visible in the build brief.
3. **Four separate evidence stages and two independent row obligations.**
   Reject credit for dispatch, selected means, elapsed time, success claims,
   invented covert intent, proxy outcomes or a weaker matcher. Make no promise
   of U33/U34 matches, detention success or 1A passage.

Before any later expensive reference, the authorized build must cheaply prove
both means can actually start, lost authority/report controls remain closed,
demonstration changes observable execution, and an opponent can ignore it or
depart. Set the reference pin, commands, cost, acceptance and stopping rule in
that build's brief. A failed prerequisite stops the campaign for diagnosis;
other passing rows do not waive an unmet criterion.

For **this documentation delivery**, workspace/startup, links, UTF-8, source/input
hashes, paper/row/test reconciliation, allowed scope and original-byte
preservation precede the ordinary unchanged commit hook. Expected hook cost:
a few minutes, stop at first failure; logs and actual exits in `runs/s115/`.
Reuse S111 as the current row baseline without rerunning it. No new simulation,
package, timing, strength or done-check evidence is claimed. Git history is the
project ledger. Formal branch/gate review remains deferred under 0106/0107.

## Findings outside my scope

S114 and its governors/troop evidence; S112 implementation and sibling writes;
root authority sourcing, missing originals and actual enemy-movement recovery;
term/strength/identity report inputs; finer map/contact rules and safety values;
the other three goal forms, advice/offers and M10; implementation, new coverage
or 1A results, accepted decisions, formal review/signatures, integration,
release and pushing. Nothing signed or cleared for main.
