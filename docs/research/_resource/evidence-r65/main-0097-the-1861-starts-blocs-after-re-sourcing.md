# 0097: The 1861 start's blocs and judgments after re-sourcing

Status: accepted (2026-11-19). The rulings that lane 1.11r3's re-sourcing left owed. Rounds 1 and 2 were researched by Claude's lane and by Codex (R45), and reviewed by Codex (R44, R50) and by Claude's standing reviewer. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Applies 0085 and 0087 to `union-1861`'s people.

## Context

- 0087 made the contemporary leg a check: a judgment about a man, or his factional bloc, needs a source from the time and from someone else, and a later reference work is not one.
- Round 1 (readers rs1 to rs9) and round 2 (rs10 to rs14, R45) re-sourced every warned cell. Round 2 gave 13 KEEP, 1 CHANGE and 116 HOLD over the 130 cells that rested only on reference works.
- The lead's earlier rulings are in lane 1.11r3's hand-over. Under them, `army` and `confederate` are facts rather than factions; the ten civilians get no bloc; and the fifteen who resigned after 5 March 1861 were pre-positioned as stand-ins.
- R45 also checked the army registers (A1) and the ten men coded `confederate` whose side on 5 March was in doubt.

## Decision

1. **`army` and `confederate` are facts** (`evidence.factBlocs`): a federal commission held on 5 March 1861, or a side joined. A register sources them. A reference work is refused only as a leg for a judgment or a factional bloc.
2. **The ten coded `confederate` start with no bloc:** Breckinridge, Buckner, Vance, Letcher, Polk, Lovell, Mason, Hunter, Floyd and Bulloch. None of them had plainly joined the Confederacy on 5 March 1861 (R45's `ten-confederates.md`). Their later service is not backdated. No bloc means no start-day fact of joining; it is not a judgment that he was neutral.
3. **The civilians.** Nine of the ten start with no bloc: Burnside, Grant, Halleck, Hitchcock, Hooker, Mitchel, Patterson, Rosecrans and Sherman. None held a US Army commission on 5 March 1861 (R45's `A1-registers.md`). The thirteen serving officers keep `army`.
4. **Stone starts with no bloc for now.** He held a District of Columbia volunteer colonelcy as inspector general from 1 January 1861 (Cullum). Whether that was a federal commission isn't established by any source read. Fill his bloc when a commission, order or muster roll from the time shows the authority. His January service goes in the row's notes.
5. **The fifteen who resigned after 5 March take their true start in US service.** Each then resigns by the resignation mechanism (R49), on his sourced date in a history run. The pre-positioned stand-in is withdrawn, and the apply skips these men.
6. **Held cells stay held.** The 116 HOLDs of round 2 and the 82 of round 1 go to the held list, and the pack keeps no value for them until a contemporary leg is found. HOLD records the limit of the search; it does not claim that no evidence exists.
7. **Lincoln's reputation stays average, as a HOLD.** R45's one CHANGE is rejected. It rested on one supporter's ratification-rally speech, which already supports Andrew's regard. The convention ballots keep the coded bands but don't set them.
8. **Dates stay as precise as their sources.** A source dated only to a year or a month keeps that bound, and no day is invented.

Rejected:
- **Backdating later Confederate service for the ten.** It writes a fact the start day doesn't hold, and the war's opening turns on who had joined.
- **Stone as `army` on the strength of his District appointment.** That rests on an authority no source read has shown.
- **Stone as an ordinary civilian.** That erases service the registers do show.
- **Holding all 130 cells at once, without round 2.** That would have cost 13 sourced KEEPs for no saving, since Codex's tokens were prepaid.
- **Keeping the fifteen as stand-ins until 1B.** Lane 1.12 put resignation in 1A, and R49 builds it.

## Consequences

- The apply of rounds 1 and 2 to `union-1861` (R51) implements items 2 to 8 and skips the fifteen. It changes the politics calibration, which lane 1.14's Part B then measures.
- Lane 1.14 is told how many factional blocs are held, so its bands aren't fitted to them.
- Still open in `docs/OPEN_QUESTIONS.md`: a man's bloc doesn't change in play, so a civilian commissioned later never joins the army bloc (1B).
