# 0066: The war begins for each side by its own government's decision

Status: accepted (2026-11-15). Amends 0064. From the standing reviewer's review of lane 0.8 (S1 in `review-lane-0.8.md`). The war gate read the war flag straight from State. A notice applies its effects when it fires, but surfaces only when its report arrives, so a notice that set the flag would tell every principal the war had begun before news of it reached him. That is the hindsight 0046's two triggers exist to stop. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Decision

**Each faction's war flag is its own, set only by a decision option of that faction's own situation.**
- A decision applies its options only after it has surfaced on its principal's knowledge, so a principal is at war from the day he chose war, never earlier.
- The validator refuses a war flag set by a notice's effects, by another faction's situation, or by anything but a decision option.
- `union-1861` names one war flag per faction, not a shared `war_begun`. Each is set by its own principal's opening decision:
  - for the Confederacy, the order to reduce Fort Sumter;
  - for the Union, the response once the president knows.
- The March and April 1861 situation authors write those two decisions. Until they exist, the reference run uses the labelled `--at-war` option.

Rejected:
- **A war flag shared by both sides.** One side's decision would put the other at war before its president knew.
- **Reading `atWarSince` from the day a flag-setting notice surfaced.** It needs a report link per faction and still lets a notice decide war for a government.
- **Leaving the gate as built until situations exist.** The first opening situation would have shipped with hindsight in it.

## Consequences

- Lane 0.8 builds the validator check, changes `union-1861`'s `ruleSeats.warFlags` to per-faction flags, and adds a test (the reviewer's N3) before its merge. A decision option sets the flag, and `atWarSince` appears only after the decision.
- The `OPEN_QUESTIONS` item for situation authors now asks for both sides' opening decisions.
