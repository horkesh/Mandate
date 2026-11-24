# 0131: Regiments go where read orders send them, and a junction is a commander's operation

Status: accepted (2026-11-24). From S136's design (`docs/design/S136-CONCENTRATION-AND-JUNCTION.md` and `docs/research/S136/` on `sprint/pushback` at `ae1c6c21`), on S135's audit of First Manassas (`sprint/research-military` at `6cd1e3dc`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Extends 0108 (how a raised lot is allocated to a command). Clarified by 0133 (receipt by place, and a commander's own request) and 0136 (what a read instrument is).

## Context

- **What S135 measured.** The model's First Manassas, on 23 July, is 59,754 Union against 6,490 Confederates. Its causes:
  - **on the Union side:**
    - 27 generated Union lots, and 18 named regiments that served elsewhere in July, are sent to McDowell;
    - fourteen of McDowell's named regiments expire together;
    - reserves fight by default;
  - **on the Confederate side:**
    - 11,460 Confederates assigned to Manassas are not there;
    - Johnston's junction fails.
- **Why it happens.** The history run's concentration sweeps each donor state's whole available force to one destination (`amount: 999`). Its rows map states to armies, which the read instruments do not do. Those instruments distinguish sending from receipt and organisation:
  - Cameron to Curtin, 13 July (OR I-II p.166);
  - Harris's letters of 30 April and 2 May (OR IV-I pp.272, 275);
  - Lee's SO119 (OR I-LI.2 p.107);
  - McDowell's GO13 (OR I-LI.1 pp.413–414);
  - Scott's and Mansfield's orders of 21 and 22 July (OR I-II pp.751, 754).
- **Why the battle falls on 23 July.** The historical march of 16 July was encoded as the day McDowell's goal became eligible. The model then needs its ordinary concentration and road days.

## Decision

1. **A regiment goes where a read instrument sends it** (S136's ruling A).
   - **An instrument declares a request or an assignment.** It names its issuer under 0124 and 0129, its addressee, its sending and receiving commands, and the force scope its words establish: a named identity, or a cohort such as a call's long-term infantry. State origin alone is not a scope. A finite request is never 999 blocks, and missing terms are gaps.
   - **Receipt is causal.** An issue date constrains when a paper is eligible. It never delivers the paper or moves troops.
   - **A named lot follows its read orders** through ordinary agency. If it is absent, discharged, elsewhere or committed, the shortfall is recorded. A later onward order moves it from where it is, without restarting it.
   - **A generated lot first honours its call's destination,** as an offer under 0126. There a commander may select it against an applicable cohort request within his authority. Lots are never matched to a roster, a target total or a date.
   - **An unmatched lot stays under its current authority, where it is.** No destination is invented. Arrival at Washington is not membership of McDowell's army.
   - **The broad sweeps are retired for the history run.** The testbed's generic policy stays, declared as such.
2. **A junction is a commander's relief operation over real routes** (ruling B).
   - **Before Johnston moves:**
     - he needs his own received picture of Patterson and of his own troops and routes;
     - the government needs received evidence of the threat to Beauregard before its conditional instruction can act;
     - Johnston needs that instruction where he actually is.
   - **Authority.** The instruction is the government's, through Cooper's staff channel (0124 item 4).
   - **His choice.** Johnston decides under 0114's conditional relief and the existing planning rules. There is no exception that he must join, and no expansion of `outmatched`.
   - **The route.** He moves by mixed road and rail from where his troops actually stand, through the map's existing edges, with every passage check. Partial arrivals count as they arrive.
   - **Patterson's pressure is ordinary** (0123, 0128): observed, never a pin.
   - **Gaps stay named.** Station throughput, loading precision and the earlier Lynchburg mission are named dependencies. No train speed or throughput is invented.
3. **Task allocation precedes commitment** (ruling C).
   - **The army commander allocates his actual blocks** under his mandate: main effort, reserve, demonstration, rear or route guard, or local defence. The commander below answers through ordinary compliance.
   - **Combat takes a set derived from the live tasks and actual places.**
     - The attacking side commits the blocks executing the attack, released reserves, and any demonstration whose contact becomes a battle.
     - An unreleased reserve or guard can't swell an attack.
     - Every eligible defender present in the region is exposed. There is no hidden safe pocket.
   - **No exclusion by name or date, and no fitted fraction.** Same-region contact must be shown cheaply before any historical claim.
4. **The date moves only by its causes** (ruling D).
   - **Each step is logged separately:** eligibility, dispatch and receipt, planning, gathering, departure, each leg, contact and acknowledgement.
   - **No fitting to 21 July.** No `fromDate` is advanced, no road shortened, no floor cut and no seed moved for that date.
   - **The orders behind the march.** McDowell's actual preparatory and marching orders are sourced as instruments.

Rejected:
- **Keeping the state sweeps with smaller fitted quotas.**
- **Moving the July roster on a date, or matching generated lots to missing roster names.**
- **Subtracting S135's surpluses.**
- **A reinforcement or withdrawal by calendar, instantaneous rail, or Patterson's failure made mandatory.**
- **Excluding Runyon and Miles by name, excluding all reserves, or a fitted fraction of commitment.**
- **Backdating or shortening anything to reach 21 July.**

## Consequences

- **Three bounded builds,** each proving S136's paired tests on fictional fixtures before a reference capture:
  1. allocation by instrument;
  2. the junction;
  3. tasks and commitment.
- **Allocation needs its instruments first.** The sending and onward orders of April to July, on both sides, come from a research lane. Until they are read, an uncovered regiment stays where it is. That may shrink McDowell's army, and that is the honest reading.
- **S137 owns the fourteen expiring identities.** Battle tuning stays separate.
