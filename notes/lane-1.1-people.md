# Lane 1.1: the people recast (State and compliance)

Lane 1.1 is FOUNDATION section 12's first row for Phase 1 (decision 0073). Its two merges:

1. `phase1-scanner-aliases` (8bb2474). The one-writer scanner now follows non-object type aliases (aliases of aliases and multi-line unions included). It also catches writes through a local bound to an owned key: `const c = x.key; c.push(v)`, `c[id] = v`, `delete c[id]` and `Object.assign(c, ...)`. Copies are not flagged. Destructured bindings and parameters are still not followed, so the test-time freeze stays the backstop for them. Two positive controls cover the change. The real tree shows no new records and no new violations.
   After the standing review (`review-scanner-aliases.md`), 0b094a2 fixes S1 (a cast at the write, `(c as X[]).push(f)`) and adds controls for N1 and N2. It also handles three of the cheap declaration forms the review listed: a declaration in parentheses, one with a `?? {}`, `?? []` or named default, and one that is an arm of a conditional. A call around the key (`Object.keys(state.x)`) is a copy and is not flagged; it has a negative control. Still not followed: `satisfies`, several declarators, a later assignment, two hops, nested values reached through a copy or a loop, a call inside the chain, and Maps or Sets. The steward has filed these.
2. `phase1-people` (this branch, built on the first). I merged in 0b094a2 and main (d3bfd8b), so the recast passes the stricter scanner. People are State, `compliance`, `reading` and `proxy` run on the new State, and relays and the filter push back.

## What is built

**People State, owned by `people`** (`people/people.ts`, `people/ranks.ts`). Each field below has its own root key, `OWNED_FIELDS` entry and section 10 row:
- `personTrue`: hidden competence, nerve and experience, plus temperament (boldness, candour). History's shadow draws each once at setup, on the person's own stream `people/shadow/<id>`. Setup option `people`: `shadow` (the default), `as-history` or `unknown-men`.
- `personTraits`.
- `personStanding`, drawn from the reputation centre.
- `personGrievances`.
- `personRegard`, toward anyone and kept sparse. It starts from the cited regard for the person's own principal.
- `personStances`.
- `personStatus`: serving, wounded, killed or captured, with its day.
- `personRanks`: now one rank per kind, each with its date.

Other mechanisms propose a typed `PeopleChange` and `people` applies it (`applyPeopleChanges`). The changes are standing, regard, grievance, status, stance and rank. In the tick (phase 2b), a bypassed relay's grievance is now applied: weight 150, held against the principal.

**Responses, owned by `proxy`** (`proxy/responses.ts`). `orderResponses` is keyed `order|person`. Each response holds both rungs, the willingness with its terms, the true and the stated reasons, and the conditions. `plans` should keep only a key (`responseKey`).

**The world format.** The person table gains four columns, all optional, so the Union pack loads unchanged:
- `boldness` and `candour`, centres written like nerve;
- `regard`, his regard for his own principal at the first start;
- `values`, written `value:CITE;...`.

The validator rejects a direction or a value without an admissible citation, a value outside the vocabulary, and a duplicate value. Unknown temperament is allowed with no warning while lane 1.9 researches the cast. The vocabularies gain `values` (the ten from the brief) and `rankKinds`, and each rank term carries a `kind`.
- The testbed uses regular, volunteer and brevet.
- The Union pack adds a fourth kind, `state`, for state commissions. Ids follow the pack's own scheme: `_bvt_` is brevet, `usv_` and `pacs_` are volunteer, `state_` is state, and everything else is regular. This is a data call for the lead (item 3).

The testbed's fifteen people now have temperament, regard and values, cited to TB-DESIGN.

**Pack rules** (`WorldRules.people`, `people/rules.ts`), stated by both packs with no kernel default (0072). The kernel and the validator check them the same way (`peopleRulesProblems`). They cover:
- history's shadow: the centre per direction, spreads, and regard per direction;
- compliance's weights;
- `goalTerms`, the boldness and the values each goal kind honours or offends. Hold is 400 and advance 600; see the calibration note;
- the reading context: oversight and the principal's credibility (item 4);
- relay holds per covert rung;
- the filter's hold and trim values, and its candour threshold;
- the trait rules, which were lane 0.6's stand-in values;
- the bypass grievance's weight.

**Compliance** (`compliance.ts`, still pure and still M2's function). `DirectiveTerms` gains three optional fields:
- `ownBest`: temperament is read against the man's own best plan (lane 0.9 finding 2);
- `departure`: an edit's distance from his judgement, which adds a `judgement` term and a `departs_from_judgement` reason;
- `support`.

A response gains `conditions`:
- `when_reinforced` applies only past the shortfall his boldness tolerates (finding 8);
- `if_supported` applies to each unpromised support need.

`resolveConflict` decides between two orders by his willingness, plus a chain weight and a newer-order weight. On a tie the order he already holds stands. M2's calls and M2's results are unchanged.

**Reading on the new State** (`reading/orders.ts`, pure):
- `goalTerms`, `profileOf`, `contextFor` and `answerOrder`, which is what lane 1.2 calls at arrival;
- `resolveOrderConflict`, lane 1.2's call at `arriveOrder`. It reads each order with his regard for that order's issuer;
- `relayAction`: comply forwards at once; reservations, a slow walk or a reinterpretation hold for the pack's days; an objection or a refusal goes back as a memorandum;
- `filterDecision`, which reads values through the pack's rules.

**Relays and the filter come alive.** `relayOrder` answers through compliance and records the response with `proxy`. It now returns the State. The relay's terms carry the rung and each contribution: the new `relay_term` term kind has a `rule` naming the term. The filter reads its holder's values.

**The trait adapter is gone.** `standin/traits.ts` is deleted. `SeatPerson` keeps only `id` and `faction`, and `SeatsWorldOptions.traits` and `traitRules` are removed. Every reader calls `traitsOf(world, state, id)`: requests, view, report generation, beliefs, relay and filter. An intelligence chief's bias is now his own perception bias. `perceptionBias` and `demandRatio` moved to `people/traits.ts` and keep their shape. Lane 1.2's planner profile should import them from there.

**Tests:**
- `compliance.test.ts` runs on the new State. All ten of M1's cases are kept with the same numbers: each proxy is a person in people State, moved by `people` changes. New cases cover relative boldness, the objection to an edit, reservations and a slow walk on an edit, both conditions, and conflicts.
- `people.test.ts` covers the shadow's bounds, determinism and per-person streams, the modes, the changes, the bypass grievance end to end, and rule problems.
- `seats-orders.test.ts` shows a relay objection, a relay hold, a filter hold and a trim, each for typed reasons.
- The view boundary now forbids `people/`, `proxy/` and `reading/`.
- The save fixture was regenerated (`tools/make-save-fixture.ts`) because State's shape changed.

**The liveness gate, re-banded:**
- Union at war: `orders.relay_objected` 1, `orders.relay_held` 1, `orders.bypassed` 2, each `around(n)`.
- Testbed: `orders.relay_held` 3. The testbed's war minister is not candid, so he holds; objections and bypasses there are `notHere`.
- Filter holds and trims stay quiet, now because both packs start with their wire offices empty (0040), not because values are empty.

`npm run check` passes (963 tests), and `npm run run:done-check` passes all six criteria.

## Calibration note

With the original goal boldness (hold 200, advance 700), a man with no values and unknown temperament objected to an ordinary advance. That would make disobedience the rule on the Union pack while its people have no values. I moved hold to 400 and advance to 600, so an average man complies with reservations. A cautious or timid man still slow-walks or objects. These are design parameters for lane 1.14 to calibrate with the planner's weights.

## Decisions taken within the brief (the lead may record or overturn them)

1. **Values are a pack vocabulary, and the kernel never names one.** Every place a mechanism reads a value is a pack rule: goal terms, the filter's holds and trims, and perception values.
   - Rejected: engine-named values, as lane 0.6's stand-in had (`caution`, `order` and `reputation` by name).
2. **Boldness is its own cited centre, not nerve's.** On the Union pack, unknown boldness now draws widely around 500 until lane 1.11 enters lane 1.9's data.
   - Rejected: falling back to nerve, which would keep the retired adapter alive.
3. **Each person draws on his own seeded stream.**
   - Rejected: one shared `people` stream, where adding a person would shift everyone after him.
4. **A relay cannot rewrite an order.** A reinterpretation by a relay is a longer hold, and a refusal by a relay sends the order back like an objection.
5. **An intelligence chief's estimate bias is his own perception bias.**
   - Rejected: keeping `intelligenceBias` as a free input, which was part of the adapter.
6. **Regard toward the principal comes from a person column. Regard between people starts at none** and moves only by changes.

## For the lead

1. **Lane 1.2:** `DirectiveTerms` gains `ownBest`, `departure` and `support`, and `DirectiveResponse` gains `conditions`. Call `answerOrder` at arrival and `resolveOrderConflict` at `arriveOrder`. Record responses with `recordResponse(responseOf(...))` and keep `responseKey` in `plans`. Read traits with `traitsOf`, and import `perceptionBias` and `demandRatio` from `people/traits.ts`. `relayOrder` now returns State. I left `plans/standing.ts` and `arriveOrder` alone.
2. **Format for regard between people** (rivals, pincer partners): State holds it, but there is no column yet. I recommend lane 1.5 adds it with the ladder and rivals.
3. **The Union pack's fourth rank kind, `state`** (state commissions), and the id-based assignment of kinds. FOUNDATION names three kinds. I recommend keeping four, and having lane 1.9 or 1.11 check the assignment.
4. **Two new pack values stand in for derived terms:** `context.oversight` and `context.leaderCredibility`. Politics (lane 1.6) should derive credibility, as M2's `derive` did. Neither is labelled STAND-IN in code; both are documented as pack values until lane 1.6.
5. **`orderResponses` grows with every hop of every order.** It needs a pruning rule, as knowledge has. This is for lane 1.4 or 1.14.
6. **Docs for the steward:** in `OPEN_QUESTIONS`, the alias-gap line under Tooling is closed by merge 1, and the "values empty" lines under lanes 0.5 and 0.8 are closed by this merge. The trait-adapter row of the exit review's stand-in table is done.

## Findings outside my scope

- The merge-1 commit subject begins with a UTF-8 byte-order mark, because PowerShell's `Set-Content` writes one. I did not force-push. The steward can reword it on merge.
- `applyPeopleChanges` does not check a proposed rank against the vocabulary. The proposer, lane 1.5's promotion lists, should check it, or `people` should once it has the map.
- The M2 kernel's `people.ts` (`ProxyProfile`, `ValueId`) is still the type compliance reads. It goes when lane 1.13 deletes M2.
- The planner-spike prototype now carries its own copy of the old trait numbers (`PROTOTYPE_TRAIT_RULES`), so its recorded findings still reproduce.
