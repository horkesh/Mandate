# 0064: Forces, command, movement, infrastructure and the control contest

Status: accepted (2026-11-15). Amends 0061. Amended by 0066 (each side's war flag is its own, set only by its own decision), 0072 (the war gate only delays the day-1 march; the generic principal is a stand-in) and 0076 (the battle model replaces the simple contest). From Phase 0 lane 0.5 (`notes/lane-0.5-forces.md`, merged as ce9d9d1) and the standing reviewer's review (`review-lane-0.5.md`, approved after one fix). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION sections 4, 9 and 10, and decisions 0019, 0033, 0040, 0050, 0054, 0055, 0058 and 0061.

## Context

Lane 0.5 replaced lane 0.6's stand-in comms World with the v2 World. Principals' orders now move real force blocks over the typed graph, and control, supply and pockets respond to them.
- On `union-1861` at 5 March 1861, Washington is supplied. A Union force reaches it by rail through Maryland's open neutral ground, and closing Maryland blocks that route.
- The tick alone takes a median of 6.7 ms a day on the Union pack.

## Decision

**A force block has three writers for three fields.**
- `forces` owns what a block is and has (`forceBlockStates`).
- `movement` owns where it stands (`forceLocations`).
- `command` owns who commands it (`forceAssignments`), beside `postStates`.

**Stores are counted in milli-days**, so a part-day's delivery never rounds away.
- Unknown strength or stores stay unknown and are listed in every sum.
- Stores fall daily and refill through supply's priority allocation, and they fall in a pocket.

**Transfers name a force (0033):** a number of blocks, a number of men in whole blocks, or a corps that moves as a bundle.
- Pending Phase 1's compliance, the sender gives his weakest blocks first, as a labelled stand-in.
- Temporary posts dissolve with their operation (0040).

**Movement:**
- A leg is one edge, at supply's own edge leg, and a leg once begun is finished.
- An edge carries a march only at one whole unit of capacity this month, which is how low water and ice close small rivers.
- Land troops use roads and rail, and ships use water edges. Rail needs both ends traced by the mover's side, or open neutral ground.
- Troops may enter enemy ground and ground whose government is unknown. They may not enter a closed neutral government's territory or an off-map box.
- **Clarifying 0061:** "closed to every side" for an unknown government means neutral passage and supply, not movement.
- `movement` exports the passage rule (`marchBar`, `marchSteps`) for the planner (0062).

**Neutral passage** is built from `command`'s governments as `NetworkConditions.neutralGround`.
- Supply passes open neutral ground.
- A situation closes or reopens a government through a `government_closed` proposal to `command`, applied in phase 4c.

**The contest:**
- Only troops that marched in press for ground. Blocks where the start placed them hold, but take nothing.
- Occupation scales with men: the full rate at 5,000 men, in proportion below.
- The stronger side gains in proportion to its margin. A tie changes nothing, and there are no losses until Phase 1's battles.
- **Neutral ground is passed, never taken by arms.** Where no side holds a control share in a region whose government has no faction, the contest and occupation do nothing, and a situation decides that ground. Kentucky in September 1861 is the model. Ground with an unknown government is occupied and contested as usual.

**Headquarters** are derived from where a post's strongest block stands, never stored.

**Courier days** derive from the typed edges.

**The generic rule-seat principal keeps every standing goal at hold until its faction is at war.**
- War is a chain flag the pack names in its rule-seat settings: the war's opening situation in `union-1861`, and none in the testbed.
- A labelled runner option starts a run at war for mechanics runs.
- Lane 0.8 builds this. Without it, Washington falls on day 19 of a 1861 run.

**The design numbers move into packs** (hard rule 3) as `WorldRules` fields that every pack states, with no hidden kernel default:
- stores: men per unit of capacity, the cap, and the low threshold;
- the contest: the occupation rate and its men, and the contest rate;
- movement: the minimum capacity to march, and the courier fraction.

Lane 0.5 does this on `phase0-pack-rules`.

Rejected:
- **One block record with three writers.** It breaks one writer per field.
- **Whole-day stores, or a default strength for unknown blocks.**
- **Naming blocks one by one in a transfer.** That is 0033's trap.
- **A separate movement cost table.** It would be two models of one road.
- **Closing an edge only at zero capacity.** No season would ever close one.
- **Barring untraced ground to movement.** No army could ever advance.
- **Every block pressing from day 1.** Federal troops still in Texas took the state back.
- **A flat occupation rate.** 600 militiamen took Georgia.
- **Letting a clash on neutral ground start control.** A neutral state's side is a political act, decided by situations.
- **A stored headquarters.** It would be a second truth beside the blocks.
- **Leaving the design numbers as kernel defaults.**

## Consequences

- **FOUNDATION section 10** gains the seven fields, `combat` as a proposer only in Phase 0, and the Phase 0 phase order.
- **Lane 0.4's five seams are closed:**
  - the network in the tick;
  - control-change proposals;
  - wire owners in latency;
  - supply allocation;
  - control after movement and the contest.
- **Lane 0.8:**
  - sets liveness bands for the new mechanics, some of them quiet on v2 packs until Phase 1 values (0058);
  - builds the war gate;
  - adds the `union-1861` run to the done check.
- **Phase 1** replaces the stand-ins:
  - the traits adapter and weakest-first transfers (by the people recast and compliance);
  - standing goals (by plans);
  - the contest (by battles);
  - storeless ships (by sea deliveries).
