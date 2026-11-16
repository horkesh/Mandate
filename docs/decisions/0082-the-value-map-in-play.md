# 0082: The map from orders to values, in play

Status: accepted (2026-11-16). Amends 0074. From:
- Phase 1 lane 1.5b (`notes/lane-1.5b-gate-wiring.md`);
- the gate reviewer's read and re-check (`review-gate-1861.md`, G-1.5a to G-1.5g);
- the standing reviewer's review and re-check at `36598de` (`review-lane-1.5b.md`).

Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out 0079's consequence for lane 1.5b.

## Context

0074 made the map from orders to values gate content. By construction, it never makes `return` cheaper in pushback than `approve-holding`. Lane 1.5 built the map and its `notCheaperThan` floor as data and a reader, but nothing in play applied them.

The gate reviewer required the wiring before lane 1.11 authors any `fugitive-policy` row (S17). Its reviews found three ways around the floor, and the lane closed each:
- the floor's difference fell on the wrong people;
- inaction carried no policy;
- a resisting carrier made a policy cheaper, not dearer.

## Decision

**A chosen policy applies its row's pushback through the owners.** A situation's option, or a decision's inaction, may carry `policy: { row, carriedBy }`. Choosing it does three things:
- **Grievances:** every term the pushback counts becomes a typed grievance against the principal, applied by `people`:
  - `policy_offended`: a person on the side who holds a value the order offends;
  - `policy_unwilling`: a carrier's unwillingness;
  - `policy_practice`: a carrier's clash with his own practice.

  So the applied cost equals the pushback, term for term, and a resisting carrier makes a policy dearer, never cheaper.
- **Carriers' answers:** each carrier answers through his own compliance, read at the oversight where he stands, and `proxy` records the answer.
- **The trail:** every term reaches the explanation trail as a typed `policy` event. `PushbackTerm` has four kinds (`values`, `recipient`, `practice`, `floor`), and the terms always sum to the total.

**The floor.**
- **Who carries it:** the difference to the `notCheaperThan` row falls on the floored row's own stakeholders and carriers, in proportion to their terms. It never falls on the floor row's stakeholders, who favoured the policy the floor stands for.
- **With nobody to bear it,** the principal's own standing pays, as a typed `floor_cost:<row>`.
- **What standing can't pay** is recorded as `floor_unpaid:<row>`, never dropped.

**No second sink for an unpaid floor,** on the gate reviewer's two conditions:
- `situations.policy_unpaid` is banded at exactly zero in both reference runs, so a reference run that leaves a floor unpaid fails the liveness gate;
- the lever sweep (lanes 1.12 and 1.14) treats any `floor_unpaid` in a seed as a breach of the watched option's floor, and reports it to the gate reviewer.

If the sweep ever finds one, the lead adds a sink then, by record.

**Inaction is a policy too.** In a decision the map gates, inaction must name a row that carries the decision's topic. Choosing nothing, or letting the decision lapse, applies it like an option's.

**The validator** (generic: no topic id is written in `packages/`):
- an option tagged with a topic the map gates must name its row, and the row must carry the topic;
- the option honours exactly its row's values;
- the row and the carrying posts must exist;
- every `gateTopics` id is a register topic;
- a watched or superseded option whose row is gated must name a floor that carries the same topics.

**Sign-offs are pinned.**
- Every gated row has its content hash and its reviewer in the pack's sign-off table, checked against `gate/reviewers.json`. An edit voids the sign-off.
- Naming a policy changes an item's hash. A null policy is left out, so items signed before the field existed keep their hashes.

**Practices.** A person may carry cited practices (pack data), and a row lists the practices it runs against (`clashes`).
- A clash is a typed `practice` term at one value's weight, counted once.
- The validator refuses a practice that no row clashes with, one listed twice, and one without a citation.

**Smaller rulings:**
- **Verbs read oversight where the man stands:** every couriered verb on arrival, the audience, and a policy's carriers. Seat initiatives aren't orders, so they stay at the base oversight.
- **The lever sweep reads a delegation** as the move its holder's rule seat would pick. So a delegation that reaches a watched option is a watched move.
- **The edit path** states `lacks_resources` when an edit needs more men than the plan commits.
- **A Union-pack test** carries every `costOnly` value through an inquiry and two weekly steps, and shows that honouring it changes nothing.

Rejected:
- **Inferring carriers from the option's orders.** A policy option issues no orders.
- **Putting the floor's difference on the floor row's stakeholders.** It gave men a grievance for a policy they favoured.
- **Leaving the floor unapplied.** It would never bite in play.
- **Applying only the values terms.** A resisting carrier then made the policy cheaper.
- **A second sink for an unpaid floor.** It would invent a cost the record doesn't show.
- **A practice vocabulary table.** The rows already name every practice that can bite.
- **Coding conduct as a value.** 0074 codes a value only on the holder's own motive.
- **Naming `fugitive-policy` in `packages/`** (hard rule 3).

## Consequences

- FOUNDATION section 10: `people` and `proxy` gain a chosen policy as a proposer.
- **Lane 1.11** may send S17's `policy:` rows for the gate reviewer's sign-off. Each row needs:
  - its hash from the sign-off table;
  - Butler's practice, cited and listed in the `return` row's `clashes`;
  - the `return` row's floor tagged `fugitive-policy`;
  - S17's inaction policy named.
- **Lane 1.12:**
  - a carrier's refusal is only recorded today; whether it stops the policy in his department is seat behaviour;
  - the sweep reads `floor_unpaid`;
  - 0074's rule that the sweep reads an atrocity order's inaction as watched lands with the sweep.
- **Lane 1.4c** adds two tests: a named policy voids a sign-off, and an unpaid floor fires only when the floor goes unpaid.
- **OPEN_QUESTIONS:**
  - the sign-off hash covers a policy row's id, not its content (the gate reviewer's, under A7);
  - options taken together;
  - practices that change in play.
