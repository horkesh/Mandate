# Kernel (M1)

This is how `packages/kernel` is put together after M1. The code is the authority; this page is a map of it.

## Modules

| Module | Owns | Proposal |
|---|---|---|
| `state.ts` | the `GameState` shape; `newId` | — |
| `scenario.ts` | pack data → initial state; validation that reports every problem | 0003 |
| `derive.ts` | **derived, never stored**: mandate, sanction and promise credibility, oversight, disposition, defending force, assault availability | rule 5 |
| `compliance.ts` | `resolveDirective`: willingness = values + temperament + regard + deterrence + capacity + disposition → ladder rung, declared rung, true reasons, stated reasons | P2, P4 |
| `verbs.ts` | the leader's verbs and their attention cost; `addGrievance` | 0001, P9 |
| `proxy.ts` | a holder reading a directive and acting on it; delegation by default when an objection goes unanswered | P2, P9 |
| `theatre.ts` | operations: launch, resolve (seeded noise), retreat, bloc effects, biased battle reports, overseer reports | P13, P4 |
| `ladder.ts` | weekly people politics: grievance decay, one rung per week, lobbying drain, rivals, freelancing, broken promises | P5, P6, P7 |
| `messages.ts` | sending messages with latency; authored claims; the ground-truth ledger | P8, P4 |
| `view.ts` | `viewFor(state, faction)`: everything a principal may see, and nothing else | 0008, 0011 |
| `bot.ts` | the bot principal, which reads only its own view | 0009 |
| `turn.ts` | `advance(state, decisions)`: pure; daily ticks until a decision point | 0010 |

## The day tick (fixed order)

1. Deliver due messages. Directives are read by whoever holds the post on arrival; claims become known; forces arrive.
2. Settle stale objections (grace period + round trip).
3. Resolve due operations, then deliver any zero-latency reports they produced.
4. Every 7th day: people politics (`weeklyPeople`).
5. Promises that have come due are broken.
6. Checkpoints (mandate tests).
7. Termination: capital fallen, or end day reached.

A turn stops at the first day, after `minTurnDays`, on which the player has been told something that needs them (an objection, a refusal, a battle report, a signal), or at `maxTurnDays`.

## Two truths

- The **ledger** is ground truth with causes. Every `directive_read` carries its contributions, which sum to the willingness (tested). Every battle, ladder move, delegation and checkpoint names its causes (tested).
- **Claims** are what a faction has been told, by whom, and when. A view is built only from claims, plus the principal's own returns and its own acts.

## Known simplifications, to revisit

- **No typed counters yet in the Audience (P3).** Verbs change state generally: Honour raises regard and standing, Allocate adds force. The specific "this counter answers that reason" mapping is not yet enforced. This is the next design step and should be playtested in text first.
- A principal knows its own posts' true strength. P4 implies even this should arrive as returns.
- Proxies know the true enemy force in front of them.
- The collective principal (0006) is not implemented; only the single case is.
- No save versioning or migrations beyond `schemaVersion: 1`.
- The theatre balance is untuned: defenders are strong, and the testbed player rarely takes ground.
- The bot principal is deliberately simple: it accepts counters, sacks repeat refusers and attacks on estimates.
