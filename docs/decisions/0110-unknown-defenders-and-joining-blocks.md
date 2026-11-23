# 0110: A force of unknown strength is not an empty field, and a block on its way doesn't move headquarters

Status: accepted (2026-11-23). From S77's two proposed rulings (`notes/lane-s77-concentration.md` and `docs/audit/s77-evidence/` on `sprint/july`, staged, backed up as `C:\Pyrrhic\mandate-reviews\staged\s77-july-concentration-staged.patch`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0076; clarifies 0064. Clarified by 0125 (a historical unit named without men stays unknown; a rule's output is the model's own quantity).

## Context

- **What happened at Manassas.** In S77's history run, McDowell's 63,000 known men met Beauregard's two local Virginia battalions on 25 July. Both battalions' strengths are unknown.
  - Under 0076 item 6, "an unknown strength fights as none". The battalions were listed as present but contributed nothing to the numbers.
  - The resolver's withdrawal and cut-off decisions divided by that zero. The record shows no contact, one cut-off, and Beauregard captured.
- **What the criterion requires.** 1A's unknown-strength criterion (FOUNDATION section 12: "no block fights with unknown strength") rightly rejects that record. The cure for the criterion is sourced strengths, not a different arithmetic. Meanwhile the arithmetic produced a capture that nothing in the record supports.
- **Headquarters.** 0064 derives a post's headquarters from where its strongest block stands. S77's new transfers assigned Tennessee troops to Johnston while they were still in Tennessee and Georgia.
  - Johnston's derived headquarters jumped to Nashville on 12 July, then followed those troops to Chattanooga and Atlanta. His assembly was Harpers Ferry.
  - Davis's order therefore went by a five-day special messenger, although S77 found that the record has Cooper's telegram of 17 July reaching Johnston at Winchester (OR I-II pp.473, 478).

## Decision

1. **A side made only of blocks of unknown strength is not an empty field** (amends 0076 item 6).
   - An unknown strength still adds no men to any number, and still gets no default.
   - But when every block a side has present is of unknown strength, the battle-day records **unresolved contact**: no losses, no capture, no rout or withdrawal, no commander hit and no change of control. The record lists the unknown blocks, as now.
   - A side with some blocks of known strength fights as 0076 says, with the unknown blocks listed and counted as none.
2. **The unknown-strength criterion is unchanged.** A record of unresolved contact still fails it. Only sourced strengths clear it.
3. **A block still travelling to join its post doesn't count toward that post's headquarters** (clarifies 0064).
   - Headquarters are where the strongest block that has joined stands. A block still on its joining journey is not under the commander's hand yet.
   - With no joined block, headquarters are the post's seat or declared assembly, as 0064 already says for a post that commands none.
   - Headquarters stay derived, never stored.

Rejected:
- **A default strength for unknown blocks.** 0076 rejected it, and it fits the data's gaps.
- **Treating a side of unknown strength as absent.** It turns a gap in the data into a defeat and a capture.
- **Clearing the unknown-strength criterion on a record of unresolved contact.** The criterion exists to catch exactly this.
- **Counting assigned but unjoined blocks toward headquarters.** It moves a commander to where his reinforcements are still mustering.
- **Storing headquarters.** That would be a second truth beside the blocks (0064).

## Consequences

- The build applies both rules in `sprint-july`, with paired tests: a defender of unknown strength gives unresolved contact, a partly known side fights as before, and a block on its way leaves headquarters where they are.
- The blocks of unknown strength that can fight in July need sourced strengths: Garland's and Preston's battalions at Manassas, and the Virginia contingent at Harpers Ferry, among the 23. That is a research request.
