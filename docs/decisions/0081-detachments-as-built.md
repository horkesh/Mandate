# 0081: Detachments in play, as built

Status: accepted (2026-11-16). From Phase 1 lane 1.4b (`notes/lane-1.4b-detachments.md`) and the standing reviewer's review (`review-lane-1.4b.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out 0080's consequence for lane 1.4b, on lane 1.7's block creation (0078).

## Context

FOUNDATION section 5 puts detachments below the force block, for garrisons and landings (0040). Lane 1.4 built operations but left detachments out of play, because creating a block needs all three of its owners. Lane 1.7 then built that creation path, and lane 1.4b used it. S02's landing at Fort Pickens needs detachments.

The standing reviewer approved the lane, with one should-fix: an empty parent shell can be handed over in a transfer, and the landing goes with it.

## Decision

**No new State field and no new writer.** A detachment is a `forceBlockStates` record of kind `detachment`, naming its parent. One proposal goes through each owner in turn, and each writes only its own field:
- `forces` makes the block (`applyDetachments`);
- `movement` places it (lane 1.7's `placeAndRemove`);
- `command` assigns it (`musterAssignments`).

**Every check comes first.** A proposal that fails any owner's check changes nothing, and its refusal is typed: `forces`, `not_standing`, `not_aboard`, `not_adjacent`, `not_land`, `apart` or `no_post`.

**Garrisons and landings:**
- **A garrison** is detached where its parent stands, from a block standing still on land. It keeps the parent's arrival day, so it doesn't press for ground its parent already held.
- **A landing** is detached from a block aboard a ship, into a land region across an edge from the ship. It arrives that day, so it presses there.

**Men are conserved.**
- A parent loses exactly the men its detachment has, and stores split by men.
- A rejoin brings back the men, their stores and their stragglers, with condition averaged by men.
- A block of unknown strength can't detach, because no man can be counted out of it. A detachment never detaches.

**A detachment fights as a block.** It takes its own losses, and a parent's disbandment takes its detachments with it.

**An operation by water lands every man of its troop blocks,** and its axis goes on as a land axis. A partial landing, such as S02's, is a proposal with its own count of men, made through a situation's `landing` effect (lane 1.11).

**Lane 1.4c closes the should-fix** before any pack starts troops aboard:
- a transfer never picks a block of known strength 0;
- a detachment goes with its chosen parent only if it stands in the parent's region;
- the men a transfer reports sent are every man actually sent;
- a detachment's id is never re-minted, not even after a rejoin on the same day.

Rejected:
- **A separate detachments table.** It would be a second record for one block.
- **Every new detachment pressing.** A garrison left in Washington would start attacking.
- **A pack share of troops kept aboard in a landing.** No source gives one.
- **Applying a proposal in part.**
- **Sending a detachment that stands elsewhere along with its parent,** with its men counted. A force in the field isn't the parent's to give away.
- **Moving the parent block itself ashore when every man lands,** as the reviewer's alternative fix. It's a larger change, and it would give landings two paths.

## Consequences

- FOUNDATION section 10's detachments row names the three owners and the proposers.
- **Lane 1.11** adds the `landing` effect for S02. Its branch merges only after lane 1.4c's.
- **An emptied parent shell** stays aboard in State until a rejoin or a disbandment. It eats nothing (the ships' stores stand-in) and fights nowhere.
- **For 1B:**
  - embarkation, since a by-water axis today needs its troops to start aboard;
  - a garrison step in the planner;
  - an axis whose troops are on two ships (only the first ship sails).
