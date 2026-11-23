# 0111: Pushback is measured by named acts, not by every response

Status: accepted (2026-11-23). From S87's proposal (`docs/research/2026-11-23-S87-proposed-pushback-measurement.md` on `sprint/pushback` at `b17b2e7a`) and S84's diagnosis (`docs/research/2026-11-23-S84-1A-calibration-diagnosis.md` on `sprint/research-military` at `5a6589ab`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0099.

## Context

- **The two counts don't measure the same thing.** 0099 item 6 compares the model's pushback counts with bands built from Appendix C of `docs/research/2026-11-16-numbers-and-facts-1861.md`.
  - The scorer counts every addressee's response to every order. Appendix C counts named historical cases.
  - In S82's reference the scorer finds 16 compliances with reservations and 18 slow walks, against ceilings of 9.
  - Six of the 16 are Governor Morgan answering six different calls. Counting only the Union side still gives 11 and 9.
  - The two populations differ: a selected historical case is not the same thing as every answer in a generated history.
- **N3-07 doesn't establish a trim.** This is the only case behind the trims floor: Seward's assurances to Justice Campbell. S87 reread Campbell's letters of 13 and 20 April (Richardson, *Messages and Papers of the Confederacy* I pp.93–97) and the State Department memorandum (pp.85–88).
  - They describe assurances made outward, and Seward's changing explanations.
  - They describe no report addressed to Lincoln with a claim removed.
  - Whether Lincoln knew of the assurances is disputed: Burlingame thinks unauthorized assurances the likelier reading, but allows the other (*Abraham Lincoln: A Life*, online manuscript II, ch.22, pp.2349–2351 and n.87). Unauthorized is not the same as undisclosed.

## Decision

1. **Historical calibration measures coverage of a register of named acts.**
   - One row is one named actor's act, in one role, on one bounded matter, supported by pages read. Its key is the issuing side, the actor, the role, the matter and the act.
   - Supporting letters, copies and repeated descriptions add no acts. A materially new instruction can.
   - A model act matches a registered act at most once, by the same role and matter, not by the day or the war's outcome.
   - A contradictory response is a mismatch. No relevant model act is "not observed". Incomplete evidence is "unresolved", and an unresolved case can't satisfy a floor.
2. **Every model response is still published, as a diagnostic.** It is counted by issuing side, actor, role, request kind and rung, with its order and day, and covert delay stays visible. These raw counts are never compared with the register's numbers.
3. **The seven bands use the units in S87's table:**
   - a relay objection or hold is by a named intermediary;
   - a filter hold or trim is by a named filter, on an incoming report, before the principal receives it;
   - a reservation or slow walk is by an addressee, on the same request;
   - a plan objection is a challenge to a particular proposed course. A refusal of a troop call doesn't count, whatever the runtime calls its rung.
4. **Side.** A response belongs to the side of the principal who issued the order. A governor answering Lincoln counts on the Union side, even if his state later joins the Confederacy. Confederate calibration needs its own register. Until then, Confederate responses are reported, never discarded.
5. **The numbers come later.**
   - The lead accepts each band's register and publishes its coverage obligations before the scorer changes.
   - A finite register can't detect excess pushback outside it. A ceiling on the burden of pushback needs its own ruling and a historical denominator.
6. **Until then, 0099's table, as amended by 0109, stays binding, with one recount under 0109's own rule.**
   - Trims become **0 to 3**: N3-07 is excluded as a verified incoming-report trim, and the upper bound is the floor plus three.
   - A floor of zero means the record supplies no required case. It doesn't mean none occurred.
   - Whether Seward kept the assurances from Lincoln stays a research hold, as an originator-disclosure question.

Rejected:
- **Counting only the Union side against the old numbers.** 11 reservations still exceed 9, and the populations still differ.
- **Raising the ceilings to 16 and 18, or tuning thresholds or traits.** That fits this output without making the two units comparable.
- **Counting each person once in the whole window.** It merges different calls and roles.
- **Treating one order as one case.** Reminders and revised plans can be one matter, and different requests on one day can be different matters.
- **Counting only declared responses.** It hides covert delay.
- **Counting every `object` rung as an objection to a plan.**
- **Counting outward assurances as trims, or elapsed days as relay holds.** That changes the mechanism to rescue a floor.
- **Making Seward a filter office, or lowering his candour.** The sources show neither.

## Consequences

- **The scorer stays as it is until the register is done.** A request completes the register:
  - the remaining Appendix C rows, read at their own pages;
  - a Confederate register.

  It also implements the coverage scorer and the raw diagnostics, and proposes each band's obligations for the lead's ruling.
- **The current position.** Until then the pushback criterion keeps failing on reservations (16, above 9) and slow walks (18, above 9). Trims (0) now fall inside 0 to 3.
