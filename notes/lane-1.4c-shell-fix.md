# Lane 1.4c: no empty shell in a transfer, no re-minted ids, and the test gaps

A small follow-up lane, carrying out 0081's rulings on the standing review of lane 1.4b (`review-lane-1.4b.md`, items 2 to 6) and the re-check of lane 1.5b. Branch `phase1-shell-fix`, cut from main at d6de34d.

`npm run check` passes. `npm run run:done-check` passes all six criteria with the finals unchanged from main: Union `08ecc54e6076400a`, testbed `0dc77944e8d96091`.

## What changed

**The empty shell in a transfer** (`command.ts`, `transferForce`).
- The sender never picks a block whose strength is known to be 0, so an unwilling holder cannot hand over an emptied shell. A block of unknown strength can still be picked, last as before.
- A detachment goes with its chosen parent only if it stands in the parent's region (`forceLocations`). One standing elsewhere, such as a landing ashore or a garrison left behind, stays where it is, under its post and on its axis.
- `menSent` counts every man actually sent, detachments included, for a transfer of blocks as well as of men. Before, a transfer of blocks reported 0.
- Lane 0.4's two transfer tests (`forces-command.test.ts`) encoded the old rule: their guard stands at a1 while its parent is at a2. They now expect the guard to stay.

**Ids are never re-minted** (`tick/detachments.ts`).
- The id already carried the day it is made (`<parent>.det.<day>`, with a counter). The reviewer's re-mint needs a make, a rejoin and a make again from one parent on one day, in separate calls. A per-call set cannot see across calls, and there is no new State field.
- So **a detachment cannot rejoin on the day it was made.** That refusal is typed `same_day` and changes nothing; the detachment rejoins a day later. Any id a rejoin frees then carries an earlier day than today, and every id made from then on carries today's or a later one.
- `madeToday` reads the day from the id. `detachmentId`'s comment now states this.
- This adds a refusal, a small rule change: a garrison cannot be detached and rejoined within one day. No reference run does either.

**Lane 1.4b's test gaps** (`detachments.test.ts`):
- a rejoin's condition is averaged by men (morale, experience and equipment, with the arithmetic shown);
- the `apart` refusal leaves State as given (`toBe` the same object);
- `not_standing` (aboard, and on a leg) and `no_post` are typed refusals, each changing nothing;
- the sailing test starts the ship at `w0`, one water leg up the river. It asserts the carrier reached `w`, `movement.leg_started`, and `operations.landed` fired once, in telemetry.

**Lane 1.5b's test gaps:**
- naming a policy on an option, or on the inaction outcome, of the signed testbed decision changes its content hash, and `checkGate` reports the sign-off stale (`policy-rows.test.ts`);
- `situations.policy_unpaid` fires 0 times when the floor is paid in full (`gate-wiring.test.ts`).

## Re-breaks tried

Each was reverted after its run, and each failed at least one test:
- transfer picks a 0-strength shell;
- a detachment standing elsewhere goes with its parent;
- `menSent` leaves out a following detachment;
- a same-day rejoin allowed (the id is made again);
- a rejoin takes the parent's morale;
- a rejoin takes the detachment's experience;
- the `apart` refusal applies the forces part first;
- `not_standing` (on a leg) as untyped `forces`;
- `not_standing` (aboard) as untyped `forces`;
- `no_post` as untyped `forces`;
- `operations.landed` not fired;
- the carrier does not sail;
- an option's policy left out of the hash;
- inaction's policy left out of the hash;
- `policy_unpaid` fired when the floor is paid.

One re-break did not bite at first: dropping the line that spent a rejoined id within its call. Within one call a make already reserves its id, so that line was redundant. That is why the guarantee became the `same_day` refusal, whose re-break fails the id test.

## Findings outside my scope

- **An axis with troops on two ships** still sails only the first (review item 6, 0081's consequences for 1B).
- **An emptied parent shell** stays aboard until a rejoin or a disbandment, as 0081 records. It can no longer be handed over.
