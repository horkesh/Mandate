# 0123: Attack or demonstrate is a duty to detain

Status: accepted (2026-11-23). From S115's design (`docs/design/S115-ATTACK-OR-DEMONSTRATE.md` and `docs/design/S115/` on `sprint/pushback` at `429a073f`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Clarifies 0120 (the first of its four goal forms).

## Context

- **What 0120 requires of each form.** Item 4 approved four operational goal forms in principle, one at a time, attack-or-demonstrate first. Each needs a design note before any code.
- **The record S115 read** (OR I-II pp.166–169):
  - On 13 July, Scott told Patterson that if he couldn't beat the enemy, he should demonstrate so as to detain him in the Valley (p.166).
  - Patterson answered with a course objection and a proposal of his own (pp.166–167).
  - Fresh papers of 17 and 18 July repeated the duty and added limits: no crossing of the Potomac, intrenching allowed if short-term men abandoned him (pp.167–168).
  - Patterson's replies claimed success through threats and reconnaissance (pp.168–169). Johnston left Winchester on 18 July.
- **The two rows are separate.** U33 asks for a course objection to the matter of 13 July. U34 asks for slow walking on the fresh matter of 17 and 18 July. They share a form, not a match.

## Decision

1. **One purpose with two means, and a continuing duty.**
   - `attack_or_demonstrate` is a typed goal purpose given to a named commander. Its duty is to detain a named opposing command in a stated area.
     - It names a detention area and an action area, and neither is a route.
     - Attack and demonstration are two means to that one duty. Choosing to demonstrate doesn't authorise inactivity, and neither means guarantees the enemy stays.
   - **It is a variant of its own.** It replaces the regional posture and objective, so it can't also say `hold` or `take`. Every converter, log, envelope, schema, edit and report keeps the variant whole.
   - **The target is an opposing command, judged from what the commander has received.** He needs a received, attributed link between that command and a force reported in the area. Without one, he gets an information request or a typed reason that there is no target, never a fabricated enemy.
   - **Authority.**
     - The principal orders the person (0016).
     - Anyone else issues the form only under an enacted mandate that names it (0121).
     - Revisions and fresh letters follow 0121's identity and receipt rules.
   - **Compliance.**
     - Both means use the existing `advance` directive kind, with every people term unchanged, so choosing to demonstrate is no concession in compliance.
     - `turned` and `outmatched` (0114, 0116) may explain a choice, but aren't the only causes, and no new general condition is added.
2. **A demonstration is force-backed activity, and the enemy judges it in the ordinary way.**
   - **The stages.** `operations` gains a bounded demonstration activity: preparing, approaching, demonstrating, recovering and closed, each transition with its typed reason. Its tasks are `deployment` and `reconnaissance_in_force`.
   - **Only real activity counts.** An activity needs a real allocated force, movement, stores and an action record naming the force, the region and the interval. Neither a task ordered nor a report that it happened counts as the activity.
   - **The opponent learns of it through reconnaissance.** The ordinary producer gains an attributed claim of observed activity, sent through the existing route, filters, latency and perception.
   - **The opponent decides for himself.** His planner reads what he received. He may stay, reinforce, attack, retire or go anyway. There is:
     - no pinned state;
     - no compulsory combat;
     - no rule of enemy compliance;
     - no bonus for detention.

     If his ordinary judgment doesn't react, detention fails, and that is measured.
   - **Combat rules still apply.** The activity grants no immunity from battle. It leaves no garrison or capture, and no stage label is proof of detention.
   - **Two bounds go to the lead before the build.** The pack's limits on areas, candidates and task duration come with their basis, never as a timer fitted to July.
3. **The evidence has four stages, and the two rows stay separate.**
   - The record keeps apart, each tied to its letter and dispatch:
     - the demand received;
     - the answer given;
     - the activity executed;
     - the effect known.
   - **The superior learns only through reports.** He gets ordinary delayed reports, and may believe a false one.
   - **Offline diagnostics may read the truth.** They separate:
     - an attempt;
     - observed pressure;
     - a reported success;
     - actual retention or departure;
     - causal evidence.

     Where no reaction is recorded, the cause is `unestablished`, even if the enemy stayed.
   - **What each row needs.**
     - **U33** needs the fresh form received and an actual, grounded challenge to its course.
     - **U34** needs the separate fresh matter and the same commander's actual deferral or qualified execution, tied to his answer.
     - A reservation alone, or a successful demonstration without pushback, earns neither row.
     - Each act covers at most one row (0112).
4. **Regions stay as they are.** Winchester and Martinsburg share `lower_valley`.
   - Within one region, activity is regional reconnaissance only.
   - If contact rules make it a battle, it is recorded as one.
   - Before any historical campaign, the build must show cheaply that an ordinary regional activity is feasible, or name the execution gap.
   - A finer map is its own decision (0121 item 6).
5. **The order of the build.** It comes after 0121's letter identity, receipts and mandates are built. Its steps:
   1. the purpose, its validation and its correlation to papers;
   2. candidates from beliefs and authority;
   3. the activity and its producer of observations;
   4. reporting, saves and ownership;
   5. the sourced exposure and the two matchers.

   Before the reference capture, it shows cheaply four things:
   - both means can start;
   - controls without authority or without reports stay closed;
   - a demonstration changes what is observed;
   - an opponent can ignore it and leave.

Rejected:
- **Separate `take` or `hold` orders, or `outmatched` leading to `hold` as a substitute.**
- **Demonstrations by date, a universal syntax of conditions, or a capture taken as proof of detention.**
- **A pin effect, invented troop numbers, assumed producers of reports, tactical separation within one region, or immunity from combat.**
- **Credit for a dispatch, a chosen means, elapsed time, a claim of success, an invented covert intent, or a weaker matcher.**
- **A penalty fitted to Patterson, or a bonus for the historical date.**

## Consequences

- **The build waits for 0121's builds.** S112 is building letter identity and receipts; mandates follow. This form's build brief names its reference baseline, commands, cost and stop rule before it runs.
- **Building it makes U33 and U34 binding** under 0112. No match, detention or 1A result is promised.
- **The same producer serves M10.** The attributed activity claim is also the channel by which Johnston's June picture can receive a caused threat.
