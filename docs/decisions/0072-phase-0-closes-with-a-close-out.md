# 0072: Phase 0 closes after one close-out lane

Status: accepted (2026-11-15). Amends 0064 and 0068. From the Phase 0 exit review (`review-phase0-exit.md`), a fresh lane that reviewed no Phase 0 lane. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Context

The exit review reran every check on main (999033a), and every FOUNDATION section 12 criterion passes:
- 895 tests;
- the done check's six criteria;
- matching hashes on Linux, Windows and its own machine;
- exact replay and resume over a 1,460-day campaign.

Nothing blocks closing Phase 0. But it found that the done check proves the machinery, not a war. In the at-war Union reference run, each rule-seat president marches his own capital's garrison on the other's capital, and Washington falls on day 20. 0064's line "without [the war gate], Washington falls on day 19" read as if the gate had fixed that; it only delays it. The review also found one latent crash, and a few promises in canon that no code carries.

## Decision

**Phase 0 closes when one close-out lane merges.** That lane fixes:

1. **The crash (S1).** A post whose government joins a side during play gets a hold goal. `receiveOrder` never throws on a post without one. A tick-level test covers it, from the department-sides fixture.
2. **The contest record (S2c).** No gain is recorded where nothing is gained: a side already holding 1000‰ records a stalemate. The Union liveness bands are then reset from mechanics that change something, not from a frozen stand-off.
3. **Labels (S2b, S2d).**
   - The generic rule-seat principal is marked as a stand-in in code.
   - The done check's Union line says it is a mechanics run whose outcome is not a war.
4. **Hidden kernel defaults (S3).**
   - The report templates, latency rules, `CONFLICT_WINDOW_DAYS` and `SCORE_CAP` move into `WorldRules`, each stated by every pack, with no hidden default (0032, FOUNDATION section 8, 0064).
   - The trait rules stay a labelled stand-in until the people recast (0058).
5. **Canon's promises (S4).**
   - Start fortification becomes State owned by `regions`, copied at setup, as 0050 says. The siege method needs it.
   - Ranks become State owned by `people`.
   - Section 10's rows for the Congress ledger and for people who have reached Union lines join `OWNED_FIELDS` as reserved, with no writer yet.
   - `KERNEL_MODULES` gives pockets to `supply` (0054).
   - A verb-list test pins Phase 0's `COMMAND_KINDS`.
6. **Small fixes:**
   - checkpoint scores read a department's side from State (0065);
   - a seatless post's menu uses the start's headquarters, not the true one (P2);
   - an unknown department's faction throws rather than mapping to an empty string (P4);
   - the stale `headquartersAt` comment is corrected.

**The record, corrected (amends 0064 and 0068).**
- The war gate keeps a 1861 history run at peace. With war on, the generic principal still strips its own capital, and Washington falls.
- The generic rule-seat principal is a stand-in. Its replacement is Phase 1's rule-seat principals, who must do their historical jobs for the Phase 1 history run (FOUNDATION section 11).
- The at-war Union run is a mechanics run, not a war.

**Phase 1 inherits, in the review's order of risk:**
1. pushback, which has never run on the new kernel;
2. the rule-seat principals and the history run;
3. the planner replacing standing goals;
4. two kernels side by side until M2 retires;
5. data gaps deciding outcomes, since unknown strength fights as none (14 of 24 Confederate blocks).

These shape the Phase 1 plan.

Rejected:
- **Closing Phase 0 as it stands.** The crash sits on the first border-state situation's path, and the liveness bands pin a deadlock.
- **Deferring the kernel defaults to Phase 1.** Phase 1 builds its report types on them, and then a later war's pack couldn't change them.

## Consequences

- One close-out lane (code) builds items 1–6, reviewed by the standing reviewer.
- The steward fixes the pointers: CLAUDE.md's `run:headless` is M2's runner and `run:phase0` is the new kernel's; CI's M2 determinism steps get M2 names; and the garbled `OPEN_QUESTIONS` filename. It also files P1 and P3 and the stand-ins' owners.
- When the close-out lane merges, the lead declares Phase 0 closed in the ROADMAP, and the Phase 1 plan begins.
