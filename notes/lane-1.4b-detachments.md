# Lane 1.4b: detachments in play

A small lane after lane 1.4 (0080), on lane 1.7's block creation. Branch `phase1-detachments`, from main at 1637a1f. It
makes FOUNDATION section 5's detachments below the force block (garrisons and landings) live in play; S02's landing at
Pickens needs it.

## What is built, and where

| Piece | Where |
|---|---|
| `forces`' part: detach (men and their share of stores out of a block, in its condition and under its enlistment), rejoin (men, stores and stragglers back, the condition averaged by men), stand alone (a block of its own) | `kernel/src/forces/detachments.ts` |
| One proposal applied across the three owners in one phase, with typed refusals (`forces`, `not_standing`, `not_aboard`, `not_adjacent`, `not_land`, `apart`, `no_post`) | `kernel/src/tick/detachments.ts` |
| Operations by water: a by-water axis sails its carrier along the plan's water legs; beside its objective, its troops go ashore as a landing, and the axis goes on as a land axis (`landed`) | `kernel/src/tick/operations.ts` |
| Tests | `kernel/test/detachments.test.ts` (6) |

`movement` reuses lane 1.7's `placeAndRemove`, and `command` its `musterAssignments`: no new writer, no new State field. A
detachment is a `forceBlockStates` record of kind `detachment` with its parent (that row's code shares the record, as the
stragglers row does).

## The rules, as built

- **A garrison** is detached where its parent stands, from a block standing still on land, and keeps the parent's
  arrival day: a garrison left behind does not press for ground it already held (0064's rule, kept by the battle model).
- **A landing** is detached from a block aboard a ship into a land region across an edge from the ship's region. It
  arrives that day, so it presses there.
- **Strength is conserved:** a parent loses exactly the men its detachment has, and gets back exactly what returns, its
  stragglers included. Stores split by men. A block whose strength is unknown cannot detach (no man can be counted out of
  it), and a detachment never detaches.
- **The id** is content-derived: `<parent>.det.<day>`, with a counter for a second on the same day.
- **A detachment fights as a block.** The battle model counts every land block standing, so a detachment is in the
  record and takes its own losses; a parent's disbandment (lane 1.7) takes its detachments with it.
- **An operation's landing** puts each troop block's full known strength ashore, so the parents stay aboard with no men.
  Its axis then holds the detachments and goes on as a land axis (assault or works at the objective). A by-water axis
  carried by another post's ship moves only on that holder's answer to the naval support request.

## Done

- `npm run check` passes (1155 tests), and `npm run run:done-check` passes all six criteria.
- Tests: a landing from a ship, directly and through an operation by water, with the men conserved; a garrison detached in
  place, rejoined with its stragglers, and refused when apart; one standing alone; a detachment fighting as a block; the
  refusals each with its reason, changing nothing.
- The liveness gate: `operations.landed` fires in neither reference run (no plan there goes by water) and is quiet,
  driven by the operation-by-water test.

## Choices made (for the decision record)

1. **No new State field and no new writer:** detachments were already `forces` records; lane 1.7's placement and
   assignment functions do the rest. *Rejected:* a separate detachments table (a second record for one block).
2. **A garrison keeps its parent's arrival day; a landing arrives that day.** *Rejected:* every new detachment pressing
   (a garrison left in Washington would start attacking).
3. **An operation lands every man of its troop blocks.** *Rejected:* a pack share kept aboard (no source gives one). S02's
   partial landing is a proposal with its own count of men (lane 1.11).
4. **Refused, never applied in part:** a proposal that fails any owner's check changes nothing and names its reason.

## For the lead

1. A decision record (the four choices).
2. **Who proposes in 1A:** operations (landings by water) and, through `applyDetachmentProposals`, anything that names a
   count of men and a region. A situation's option (S02's Pickens landing) has no proposal path to `forces` yet: lane 1.11
   needs either an `effect` field `forces`/`landing`, or a verb. Recommend the effect field, applied in phase 4c beside
   `command`'s proposals.
3. **No operation leaves a garrison yet.** The planner drafts no garrison step; when an axis takes an objective it holds
   it with every block. A plan phase "leave a garrison" is the planner's (1B) if 1A's history run needs it.

## Findings outside my scope

- An operation's landing leaves its parent blocks aboard with no men: they eat nothing (the ships' stores stand-in) and
  fight nowhere, but they stay in State until a rejoin or lane 1.7's disbandment.
- Embarkation (troops going aboard) is still not built, so a by-water axis needs its troops to start aboard (1B).
