# 0040: Revisions from the first-month walkthrough

Status: accepted (2026-11-14). From `docs/design/FIRST-MONTH.md`, a paper play-through of 4 March to 11 April 1861 against the design (11 stops, 16 decisions, 12 of 36 attention, about 41 minutes). Its verdict: fun as a political thriller, and cheap to operate once these gaps are fixed. The lead accepted its fixes; the owner can overturn any of them. Amends 0016, 0020, 0023, 0025, 0026, 0027, 0028, 0032, 0033 and 0039; supersedes 0028's "who is seen to fire first" lever. Amended by 0041 (clarifications) and 0046 (two triggers, waiting options, chains, staff-line authors, decision and notice kinds).

## Decision

**Situations (amends 0023).**
- A situation can be **live**: its cause is re-evaluated daily, options can **expire** or **appear**, and it ends a turn only when an option expires or appears, or a pack-set clock threshold is crossed (pack fields per option: `expiresWhen`; per situation: `resurfaceOn`). The player can wait and gather information while the clock runs.
- **Three outcomes, kept apart:** **ignore** resolves to a required, pack-authored `inaction` outcome (for Sumter, the garrison starves, then surrenders); **delegate** hands the choice to a named holder's seat, which decides by his values; the **historical default** is used only by history runs and a rule-seat Lincoln, and is **never shown to the player** (it would leak hindsight). The schema test enforces `inaction`, the historical default and the staff recommendation.
- An option may issue orders through people (a goal, an appointment, a notice), not only abstract consequences.

**Advice (amends 0032 and 0023).**
- A new report type, **advice** (author, recommended option, stated reasons as typed terms, confidence), with a **memorandum** subtype for unsolicited advice.
- A situation's staff recommendation is an advice report **authored by the holder of a named post** (the general-in-chief, the relevant secretary), carrying his bias. An adviser's credibility is tracked separately from his field assessment (0020).

**New verbs (amend 0016 and 0025).**
- **Inquire** (0 attention): ask any holder for a report on a subject; it travels like an order and returns shaded by him. Repeated inquiries to one man in a week cost his patience.
- **Consult** (1 attention): ask a set of holders, such as the cabinet, for written advice on a situation. Each answer becomes a **stance on record**: reversing it later costs the man consistency, and a stance can leak.
- **Proposals:** any person can submit a candidate plan the kernel drafts from his traits; the player adopts it by attaching it to a goal for a holder, who reads it like any order (0026's rule that seats never invent unvalidated plans stands).
- **Temporary posts and agents without posts:** "appoint" may create a temporary post (an expedition command) that dissolves with its operation; "send an observer" may target any rostered person, and one without a post carries only personal bias.
- **"Prepare, await my word"**: a goal's timing can hold an assembled operation until the player gives a free "go".

**Orders through chains (amends 0026; resolves its contradiction with the navy's posts).**
- **Relay is message passing between posts:** each link receives the order as a message, applies its own compliance and delay, and forwards or objects. 0026's deferral of a relay mechanic now applies only to corps inside an army.
- **Standing agreements and prior orders** are state on a post (owner: `command`), read by the holder's compliance; a newer order from his own department supersedes them.
- **Going around the chain:** an order may go direct to a holder below the one who should relay it: faster, a grievance for the bypassed man, and a risk of conflicting orders. A holder with conflicting orders resolves them by his compliance and reports which he obeyed. A special messenger or fast ship is a route with a price.

**Attention (amends 0025; resolves its contradiction with 0026).** A pack cost table with these rules: a situation decision includes the orders its option issues; **accepting the staff recommendation is free, overruling it costs 1**; approving a promotion list as drafted is free, each amendment costs 1; sending a plan back is free; attention refills to its cap weekly with no carry-over, and the meter shows the next refill date.

**Stops (amends 0027).** A goal can carry **"approve as drafted unless he objects"**, so the plan executes without a stop unless he objects or departs far from the goal. Lists, promotions and routine returns go to the inbox and never end a turn. "A report I asked for has arrived" is an optional stop.

**The war's opening (supersedes 0028's "who is seen to fire first" lever).** The railroad is restated as **"the Confederate seat opens the war"**, with an ordered trigger list (a relief attempt at Sumter, a landing at Pickens, a last date) and a guaranteed fallback, labelled in data and docs. The player's choices set the timing, which fort, and a **framing** term owned by `politics` (who the public believes began it, through the press).

**State additions.**
- **Stores on hand** (days of supply) on a force block, written by `forces`, proposed by supply; a pocket's stores crossing a pack-set threshold is a decision point. The player sees only the garrison's reports and the staff's range.
- **Detachments below the force block** for garrisons and landings (amends 0033).
- **Chambers of Congress** each have a state (sitting, adjourned, special session called) in `politics`, which changes which options are legal and creates an accountability check at the next session.
- **Seat initiative:** each seat has a pack-defined initiative menu (open a channel to the enemy, write to the press, propose a plan, bid for authority), evaluated in the weekly people step through the same compliance machinery and reaching the president only through report routes.

**Scenario and demo (amends 0039).** The March 1861 start has no armies and so no arrows; the public demo starts from a later scenario (with armies in the field) so it shows plan review and audiences. The telegraph-office filter post (0032) is empty in March 1861.

**Patronage**, if modelled, arrives as weekly lists with defaults, never one card per office.

## Consequences

- FOUNDATION is revised to match; lane 0.7's situations schema and lane 0.9's spike (which gains a small joint naval relief case) start from this record.
- About fifteen facts the walkthrough marked "[unsourced: needs research]" go to a research lane before the March 1861 situations are authored.
- The walkthrough projects about 26 hours for a full campaign, just over the 15–25 hour target; the turn cap and decision-point settings are the dials, tuned in Phase 1.
