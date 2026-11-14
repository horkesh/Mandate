# 0010: Variable tempo: the tick is a day, a turn ends when something needs you

Status: superseded by 0017 (2026-11-14). Accepted 2026-11-14.

## Context

Rome needs months between decisions in winter quarters. Ukraine needs daily decisions during an offensive. AWWV's fixed weekly turn fits neither.

## Decision

- The simulation tick is one **day**. Every system advances in days.
- A player turn runs until the next **decision point**: a message that needs the principal, a deadline, a checkpoint, or a crisis.
- Each pack sets `minTurnDays` and `maxTurnDays`. The turn always stops at the maximum even if nothing is pending, and never stops before the minimum unless a crisis is flagged.
- Message latency (P8) is measured in days, on the same clock.

## Consequences

- The turn function is `advance(state, decisions) → (state, report)`, running a sequence of day ticks until a decision point.
- Pipelines must be cheap per day. Systems that only matter weekly or monthly can run on their own cadence within the daily tick.
