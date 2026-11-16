# Lane 1.5: the people's verbs, the audience and attention

Lane 1.5 is FOUNDATION section 12's people-verbs row for Phase 1 (decision 0073). It is on one branch, `phase1-people-verbs`:
- b95e1b0 is the lane's work;
- 80a3a93 merges main, which brings in lanes 1.3 and 1.10.

`npm run check` passes (1113 tests), and so does `npm run run:done-check` (six of six).

Every verb is an order to a person, and he answers it through his compliance with typed reasons, which `proxy` records (key `order|person`). No verb names a place except as part of an order to a person (hard rule 1). `command-kinds.test.ts` holds a test for that.

## What is built

**Verbs** (`log/commands.ts`; `tick/verbs.ts`). `COMMAND_KINDS` gains ten. A verb is accepted only from a principal (`not_a_principal`).

The couriered verbs travel as a `msgVerb`, beside `msgOrder` and `msgReport`, and the transit invariant is now "exactly one of the three". They are answered at arrival (`arriveVerb`):
- **appoint** (an optional rank, checked against the vocabulary). A man who refuses declines the post. An appointment settles a pending promise of advancement (`people.promise_kept`).
- **relieve**, by mode:
  - `quiet_department`, `own_request` and `outright`, each with its own grievance, regard and standing change (pack rules);
  - a relief is always effected;
  - `own_request` becomes `outright` if he will not ask.
- **transfer**: the sending commander picks the blocks by his own answer:
  - `strongest_first` if he complies;
  - `weakest_first` if he drags his feet;
  - half the amount if he reinterprets;
  - nothing if he objects or refuses, and his memorandum says why.

  This replaces the weakest-first stand-in (`command.ts`, `TransferPick`).
- **inquire**: a report of his position and his belief about a region. Past the week's free inquiries he holds a `pestered` grievance (patience, 0040).
- **consult**: each holder of the named posts writes his recommendation (`advice` of subtype `requested`), and it becomes a stance on record (`personStances`, recorded only). The route is fixed to courier.
- **observer**:
  - a man is posted at a headquarters (`observerPostings`, owned by `command`), and the watched man holds a `monitored` grievance;
  - letters come every `letterEveryDays`;
  - the oversight he adds is its own typed term, `{ kind: 'watched', source, amount }`, on top of the `context.oversight` stand-in, which it never overwrites (the lead's condition, tested).

These act at once, in Washington (`verbs.in_washington`):
- **promise**: clears `passed_over`, falls due after `dueDays`, and breaks into a `promise_broken` grievance and lost regard;
- **pressure**: a `pressured` grievance, which also adds a typed oversight term for `pressure.days`;
- **address**: only emits a `{proposal: 'address'}` for politics.

**The audience** (`audience/audience.ts`, owned by `audience`; the counters are in the import-free `audience/counters.ts`, which keeps the view boundary). It is M2's audience recast for plans:
- **before**: about a goal not yet sent, in the preview only;
- **during**: about an approved plan.

The counters are M2's eight, each answering only its kinds of reason:
- an uncandid man hides his reasons;
- a frame may name only his own values that are not cost-only;
- a threat answers nothing and leaves a grievance;
- a promised reinforcement is itself a transfer order to the other holder, who answers it by his own compliance.

`previewAudience` is pure. Holding an audience applies the counters through their owners (`people`, `command`) and records it (`audienceHeld`); it cools down for 7 days and costs attention. **M2's nine audience cases are moved onto the new State one for one**, in `people-verbs.test.ts`, "M2's audience cases".

**Attention** (`seats/attention.ts`, `seatAttention`, owned by `seats`; prices in `tick/attention.ts`):
- the pack's cost table prices it: approving as drafted and sending back are free, an edit is 1, inquire is 0, consult is 1, and a special messenger's price is added on top;
- it refills to the cap every `refillDays`, with no carry-over;
- a command is paid only if it is not rejected, and one it cannot pay is refused (`no_attention`).

**The weekly people step** (`tick/people-week.ts`, phase 4d):
- grievances fade;
- due promises break;
- the ladder moves one rung a week (`ladder/ladder.ts`, `personRungs`). Each rung above loyal costs disposition;
- a man on lobbying or above with enough standing becomes a rival (`personRivals`);
- seat initiatives fire through `resolveDirective` and reach the principal as a memorandum (`seatInitiatives`, owned by `seats`, with a cooldown). The testbed's case is `write_to_the_press`.

**From the reviews.**
- `costOnly` on pack values: honouring one adds nothing and gives no reason, and offending one still costs. A kernel test runs over every cost-only value of the Union pack and checks that no term is positive.
- The order-to-value map is pack data (`rules.people.verbs.orderValues`):
  - `goal:`, `verb:` and `policy:` rows, each with `gateTopics` and `notCheaperThan`;
  - `pushbackOf` counts every person on the side who holds an offended value, plus the recipient's unwillingness, and floors a row at the row it names;
  - an administrative verb's row has `boldness: null`, so temperament has no bearing on it.
- `regard_others`, a person-table column (`toward:direction:cite;...`), validated and cited. Regard toward anyone else stays `regardUnknown`.
- `applyPeopleChanges` checks a rank against the vocabulary and its kind (`rank "x" is a K rank, not K2`). Lane 1.3's calls now pass the vocabulary too.

**Rules.**
- Every new State field has an `OWNED_FIELDS` row: personPromises, personInquiries, seatAttention, seatInitiatives, personRungs, personRivals, audienceHeld and observerPostings.
- There is no Map or Set in State.
- Every default is a pack rule (`rules.people.attention`, `rules.people.verbs`), checked by `verbRulesProblems` in the kernel and the validator alike.

**The liveness gate.** Re-banded in both full runs:
- ladder moves, rivals, grievances fading, attention spent and refilled, and initiatives all fire in a reference run;
- the verbs, promises, observer letters and refused attention are in `QUIET`, because no rule seat uses the verbs yet. Each names the test that drives it, and those tests now count their mechanic.

## Not done, or done as a stand-in

1. **The Union fugitive-policy rows are not authored.** The mechanism is built and tested: the `fugitive-policy` gate topic, the `notCheaperThan` floor (`return` never cheaper than `approve-holding`), and pushback over every side member. The rows themselves are 1.11's data and need the gate reviewer's sign-off. Both packs carry only the six `verb:` rows.
2. **The practice-clash term is not modelled.** There is no data for it.
3. **`lacks_resources` never arises in an audience.** `goalTerms` sets `required: 0` and the reading context offers `available: 1000`, because force ratio is the planner's (lane 1.2), not compliance's. So M2's case 7 is ported as "a promised reinforcement is an order to another holder, who answers it". Its other half, "counts only as far as promises are believed", has no shortfall to shrink until something feeds `required`.
4. **Stance reversal pricing waits for 1B.** Stances are recorded only, as approved.
5. **Freelancing is not ported**, as approved.
6. **Consult goes by courier only.**
7. **The ladder reads regard as well as grievances.** Discontent is the grievance load minus half the regard. In the testbed run, men cool toward their leader climb to lobbying with no grievance at all, and one becomes a rival. That follows from the formula, and the thresholds are design parameters, not calibrated.
8. **No rule seat uses a verb.** The rule seats need a policy (when to inquire, relieve or consult) before the verbs can fire in a reference run.

## Files

- New:
  - `people/verb-rules.ts`, `seats/attention.ts`, `ladder/ladder.ts`, `command/observers.ts`;
  - `audience/audience.ts` and `audience/counters.ts`;
  - `tick/verbs.ts`, `tick/people-week.ts`, `tick/attention.ts`;
  - `test/people-verbs.test.ts` (26 tests).
- Changed, beside the State plumbing:
  - `reading/orders.ts` (`extraContext`, `orderTerms`, `pushbackOf`);
  - `directive.ts` and `compliance.ts` (`costOnly`, oversight terms, the `watched` reason);
  - `messages/transit.ts`;
  - the pack format (schemas, the `regard_others` column, validation);
  - both packs' `pack.json` (attention and verbs; the Union pack's six 0074 values, two of them cost-only).
