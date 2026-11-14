# 0016: Goals, plans and arrow edits: places are targeted only through a person

Status: accepted (2026-11-14). The owner asked to plan operations as president ("giving grand goals maybe, like, take New Orleans. Then your commander prepares a plan"), chose "edit arrows, at a cost" over "approve or send back", and chose to transfer divisions between commanders. Supersedes 0001. Amended by 0026 (kernel-drafted plans, edit grammar, corps as posts, promotion lists, visits). Design: `docs/design/FOUNDATION.md` section 5.

## Context

- 0001 said no verb ever targets a unit or a place. The owner wants HoI-style fronts and arrows and to attempt encirclements without micromanaging.
- The games survey found that what works across games is intent expressed as objective, posture, permissions and timing, executed by a named commander; what fails is per-stack, per-turn re-plotting and failure the player cannot explain.

## Decision

- **0001's premise stands: the player never moves a division.** What changes is that a verb may name a place, but only as part of an order to a person.
- **Goals.** The player sets a commander a goal: an objective (a region, a force or a line), posture, risk, deadline, permissions (rail, river, sea) and the divisions committed.
- **Plans.** The commander's seat drafts a plan: axes with assigned divisions, routes along the map graph, phased timings and support requests to other posts. It appears as arrows.
- **Review.** The player approves the plan, sends it back with notes, or edits the arrows. **Every edit is a counter-order** that passes through the commander's compliance; the further it departs from his own judgement, the more he resists, and he remembers it.
- **Divisions move between commanders by transfer**, a verb aimed at two people. Commanders decide where their divisions stand.
- **Joint operations.** A plan's support requests are directives to other holders, each with its own compliance.
- No manual or debug mode commands units (kept from 0001).

Rejected: approve or send back only (too little operational play for the owner); HoI-style direct front assignment (the general's seat again); per-stack orders (AGEoD's micromanagement).

## Consequences

- The default path must take seconds: a draft good enough to approve, with reasons shown inline.
- An architecture test asserts the app's commands match the kernel's verb list exactly.
- The coarse theatre of P13 is replaced by the map model of 0019.
