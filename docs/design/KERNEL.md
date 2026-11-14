# Kernel (M2)

This is how `packages/kernel` is put together after M2. It describes the engine before the redesign agreed on 2026-11-14 (fronts, plans, seats); it will be replaced by the foundation design. The code is the authority; this page is a map of it.

## Modules

| Module | Owns | Proposal |
|---|---|---|
| `state.ts` | the `GameState` shape; `newId` | — |
| `scenario.ts` | pack data → initial state; validation that reports every problem | 0003 |
| `derive.ts` | **derived, never stored**: mandate, sanction and promise credibility, oversight, disposition, defending force, assault availability | rule 5 |
| `compliance.ts` | `resolveDirective`: willingness = values + temperament + regard + deterrence + capacity + disposition → ladder rung, declared rung, true reasons, stated reasons | P2, P4 |
| `verbs.ts` | the leader's verbs and their attention cost | 0001, P9 |
| `orders.ts` | shared low-level operations: `direct`, `addGrievance`, `removeGrievances`, `keepPromise` | rule 5 |
| `reading.ts` | `readOrder`: the **single owner** of how a holder reads an order, used both on arrival and in an audience preview | P2 |
| `audience.ts` | `holdAudience` (pure preview) and `commitAudience`; typed counters and which stated reasons each answers | P3 |
| `proxy.ts` | a holder acting on his reading of a directive; delegation by default when an objection goes unanswered | P2, P9 |
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
4. Every 7th day:
   - recruitment: held posts with a levy raise force into their own post;
   - bloc drift back toward each bloc's baseline;
   - people politics (`weeklyPeople`).
5. Promises that have come due are broken.
6. Checkpoints (mandate tests).
7. Termination: capital fallen, or end day reached.

A turn stops at the first day, after `minTurnDays`, on which the player has been told something that needs them (an objection, a refusal, a battle report, a signal), or at `maxTurnDays`.

## Two truths

- The **ledger** is ground truth with causes. Every `directive_read` carries its contributions, which sum to the willingness (tested). Every battle, ladder move, delegation and checkpoint names its causes (tested).
- **Claims** are what a faction has been told, by whom, and when. A view is built only from claims, plus the principal's own returns and its own acts.

## The Audience (P3, M2)

- An audience costs one attention and allows at most two counters.
- The holder states his declared answer and his **stated** reasons. Candid men state all their reasons. Uncandid men hide distrust, fear, protection and grievances, and if they say yes they give only flattering reasons.
- Counters and what they answer:

| Counter | Answers |
|---|---|
| frame | values offended (and may appeal to a held value even when none is stated) |
| adjust | too rash, too timid |
| reinforce | lacks resources (issues a real transfer order to another holder, and counts only as far as promises are believed) |
| promise advancement | the passed-over grievance (creates a promise to keep) |
| withdraw overseer | the monitored grievance |
| ease pressure | the pressured grievance |
| vindicate | blamed, overruled, promise-broken grievances (raises his standing) |
| threaten | nothing (adds a grievance) |

- Distrust and standing cannot be answered in one audience.
- Example (union-1861): McClellan refuses an attack on Manassas. Framed in terms of his reputation, he says "comply". He is uncandid, and his willingness is still negative, so he reinterprets the order.

## Known simplifications, to revisit

- **Policy decisions** (emancipation, habeas corpus, conscription) need a pack-defined event and decision system, an AWWV idea to reimplement (0012).
- **Intermediaries and relays.** The research found a telegraph supervisor striking McClellan's insubordinate sentence before Stanton saw it, and Halleck forwarding Lincoln's wishes as mere suggestions. Relay nodes that filter or soften messages are a natural next mechanic.
- **Calibration.** The union-1861 pack is uncalibrated. With the scripted leader, the Union over-performs militarily.
- A principal knows its own posts' true strength. P4 implies even this should arrive as returns.
- Proxies know the true enemy force in front of them.
- The collective principal (0006) is not implemented; only the single case is.
- No save versioning or migrations beyond `schemaVersion: 1`.
- The theatre balance is untuned: defenders are strong, and the testbed player rarely takes ground.
- The bot principal is deliberately simple: it accepts counters, sacks repeat refusers and attacks on estimates.
