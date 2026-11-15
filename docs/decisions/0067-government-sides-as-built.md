# 0067: Government sides as built, and Fort Pickens' stores unknown

Status: accepted (2026-11-15). Amends 0065. From lane 0.5's `phase0-department-sides` (approved in `review-department-sides.md`) and the standing reviewer's check of the governments research (`review-governments-stores.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Decision

**Fort Pickens' stores are unknown at the start**, reversing 0065's line that kept 150 days.
- Slemmer's "five months" letter dates from about 5 February, not January.
- The fort's own officers wrote that supplies were "getting low" by late March (OR I-1 pp. 364–365).
- With no bring-forward rule, the kernel would read the figure as the stores on 5 March, and the sources contradict that. So a stores figure enters the start only when nothing in the sources contradicts it on the start date.
- Key West's 120 days, dated 15 January, stays.

**A man serves his post's side only if `command` could have put him there:** his own side is the post's today, or the department's at the start.
- A neutral state's officer with no side follows his state when it chooses one.
- The other side's man in one of our posts keeps his own side (0057's S6).
- A man who followed his post returns to his own side when relieved. Whether he keeps his adopted side afterwards is for Phase 1's people model.

**Changes of side:**
- A government may move from one side to another, as well as from none to a side. No proposal takes a side away.
- To keep "nothing crosses sides" true, a change of side also:
  - cuts a post whose parent is now on another side;
  - unassigns a block whose post is on another side;
  - clears an intelligence chief now on another side;
  - lifts a closing.

  All of these are reported in the change.

**The pack validator** checks every proposal to `command` in a situation file:
- the subject is a government department;
- a change of side names a real side, with delta +1;
- a closing's delta is +1 or −1.

Rejected:
- **"Every holder serves his post".** It would let the other side's man count as ours.
- **Keeping Fort Pickens at 150 days with a caveat.** The kernel reads the figure as true on the start date.

## Consequences

- Lane 0.5's note records each consequence of a change of side with its test.
- Phase 1's people model decides whether a man keeps an adopted side after leaving his post.
