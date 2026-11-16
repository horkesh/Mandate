# 0083: A detachment can't rejoin on the day it was made

Status: accepted (2026-11-16). Amends 0081. From Phase 1 lane 1.4c (`notes/lane-1.4c-shell-fix.md`) and the standing reviewer's review (`review-lane-1.4c.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Context

0081 requires that a detachment's id is never re-minted, because battle records and reports name blocks by id. An id carries its make day, with a counter for a second detachment that day.

Lane 1.4c found that a make, a rejoin and a make again, in separate calls on one day, gave the second detachment the first one's id. No check inside a single call can see the earlier make without a new State field.

## Decision

**A detachment can't rejoin its parent on the day it was made.** The proposal is refused with the typed reason `same_day`, and nothing changes.

So any id a rejoin frees carries an earlier day than today, and new ids carry only today's day or a later one. A freed id is never made again, across any number of calls. A disbandment removes the parent with its detachments, so it frees no id that could be re-minted either.

0081's other rulings stand as lane 1.4c built them:
- a transfer never picks a block of known strength 0;
- a detachment goes with its chosen parent only if it stands in the parent's region;
- the men a transfer reports are every man actually sent.

Rejected:
- **A new State field counting each parent's detachments.** It adds state to prevent a case no reference run reaches.
- **A condition of one call per day.** The kernel can't see it without that same new field.

## Consequences

- 0081's refusals gain `same_day`.
- No reference run detaches and rejoins on one day, so the finals are unchanged.
- **OPEN_QUESTIONS (1B):** two test gaps, filed by the steward. Nothing tests that the same-day check covers ids with a counter. Nothing tests that a following detachment counts toward a transfer of men.
