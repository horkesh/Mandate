# 0020: Generals have hidden stats that battle changes; the player sees an assessment

Status: accepted (2026-11-14). The owner asked for "stats that change with battles lost or won. Traits too", chose the staff's assessment over true numbers, asked for staff observers and hidden gems, and chose "history's shadow" as the default. Clarifies 0007. Amended by 0026 (the 1864 rival general; cited stat centres). Design: `docs/design/FOUNDATION.md` section 6; evidence in `docs/research/2026-11-14-union-command-and-promotion.md`.

## Context

- The player already knows who Grant is, so true historical stats would make hindsight a cheat sheet.
- The history lane found that victory does not reliably make generals bolder nor defeat more cautious, that observers answered to whoever sent them and could be wrong, and that memoirs are self-serving.

## Decision

- **True stats** (competence, nerve, experience) and innate traits are hidden. Some traits stay hidden until circumstances reveal them.
- **History's shadow** (default): true stats are drawn once per game, at setup, from a seeded stream, in a range centred on the historical record. Setup also offers "as history" and "unknown men".
- **Public standing** moves with the press and the blocs; **reputation and nerve are separate stats**, and a general's traits decide how a result moves him. **Earned traits** come from events.
- **Assessment.** The player sees his staff's assessment of each general, built from biased sources (the general's reports, observers, newspapers, rivals, West Point reputation) and converging on the truth as the general fights, fastest from independent sources.
- **Observers** are people with posts and biases who report to whoever sent them.
- **The officer pool:** real junior officers whose rise is not guaranteed, and invented ones, checked against rosters so none is a real person. They surface through battle reports; superiors can take their credit.
- **0007 is clarified:** drawing stats at setup initialises state; it is not a die roll on behaviour. People still never draw from a stream when they decide.

Rejected: true stats shown, AGEoD-style (hindsight wins); stats fixed to history as the default (same); "unknown men" as the default (history stops feeling like history).

## Consequences

- The reckoning (FOUNDATION section 6) reveals this game's true values, not the historians' verdicts.
- The officer generator needs name sources and a real-person check (the history note lists candidates).
