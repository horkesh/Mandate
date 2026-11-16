# 0084: Politics, first cut, as built

Status: accepted (2026-11-16). From:
- Phase 1 lane 1.6 (`notes/lane-1.6-politics.md`);
- the standing reviewer's review and re-checks (`review-lane-1.6.md`);
- the gate reviewer's read (`review-gate-1861.md`, G-1.6a to G-1.6c);
- lane 1.11r's answer on the lag from a call to a sitting Congress (`docs/research/2026-11-16-1861-gaps.md`, Part F).

Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out FOUNDATION section 12's row 1.6 (0073), under 0023, 0028 and 0046.

## Context

Lane 1.6 built the first cut of politics for 1A:
- blocs and the mandate, recast from M2;
- the principal's credibility;
- the chambers of Congress and the ledger of acts taken while Congress was away (0046);
- the framing term (0028);
- a weekly front page from each paper.

The reviews found:
- a truth leak through the press;
- three gate holes: the captured dropped, a surrender read as a draw, and a Confederate bloc without slavery;
- unlabelled design numbers.

The lane closed them all.

## Decision

**State.** Four fields, each written only by `politics`:
- `blocSupport`;
- `chamberStates`;
- `congressLedger`;
- `warFraming`.

The mandate and the principal's credibility are derived on read, each with typed terms, and never stored. Politics runs as phase 4e, after the weekly people step: today's addresses and effects, the week's drift and the ladder's pull, the press, then the chambers and the ledger.

**Blocs**, recast from M2.
- **Pack data:** each bloc is a pack rule with its side, voice, rest, values and reactions to a battle won or lost, each cited.
- **Movement:** support starts at the rest and drifts back weekly. It moves:
  - by an address (lane 1.5's verb);
  - by the ladder's pull;
  - by a situation's `bloc-support` effect;
  - by the press, at the paper's reach.
- **No bloc is named for a protected group,** checked in any locale by `checkBlocs`.
- **The bloc table is pinned to the gate reviewer,** as gated rows are (0082). The hash covers each bloc's rule and English name, so a new, edited or renamed bloc fails until it's re-signed. A neutral name whose members are one group would pass `checkBlocs`, so composition comes to the gate reviewer by this route.

**Credibility** (P7) is a base, plus a share of the side's mandate, plus a term for each man who holds a relief against the principal (a record that he does relieve), clamped. It replaces 0079's stand-in, and the pack rule `people.context.leaderCredibility` is retired.

**The legislature.**
- **Sitting:** each chamber sits by the pack's session calendar, recomputed daily. A situation's `session-call` summons a callable session, which holds until it closes, and a second call while one stands is refused.
- **The ledger** (0046): `ledger-act` enters an act. It is met on the first day a chamber of its side sits, and `ledger-answer` (S20) answers what is before it.
- **Conditions:** `chamber` and `ledger` are public facts that option conditions may read.
- **The lag from a call to a sitting quorum is a pack rule.**
  - In 1861 it was 80 days: the 15 April proclamation for 4 July.
  - The shortest feasible lag is not on record. The comparisons are the Confederate Provisional Congress in 1861 (17 days), 1841 (75) and 1893 (38).
  - So the Union pack's "at once" session, `congress_37_1_at_once`, sits 30 days after its call, marked [I] with those comparisons. The historical call keeps 4 July.

**Framing** moves only by situations' `framing` effects. It counts in the mandate, and the front page prints it as the public's belief, attributed, never as the narrator's verdict.

**The press is a report route, not an owner** (FOUNDATION section 7, 0032).
- **Who writes and reads:** each paper's editor, a person of its side, writes a front page every `cadenceDays`. It goes by mail to the side's principal and its serving post holders. A paper whose editor no longer serves its side is silent.
- **The result:** each battle closed since the last page is read as won, lost or drawn by who left the field, which was public. A side that surrendered or was destroyed has lost (G-1.6b). The result always prints, whether or not a return has come.
- **The figures come only from the casualty returns** the side's principal holds by the printing day: the full return if it has come, else the first, low one. The battle record is never read for figures. Before any return, the page prints no figure.
- **The captured** count among the missing (G-1.6a), as the first return has them. They print apart only once every day's full return has come.
- **Effects:** the press moves the side's blocs and the battle's commander's standing, at the paper's reach.

**Every design number is labelled.** Voices, reactions, reach, rests, drift, address, ladder, credibility, framing and the press's standing each carry a cite saying "[I]" or "M2's", so lane 1.14 can find them.

**The Confederate bloc holds `slavery_defence`,** cited to the Confederate constitution (G-1.6c). R1 decides the Confederacy's real blocs.

**Unknown `politics` fields are refused,** in play and at validation. The 1B fields (`foreign-patience`, `national-will`) are reported, not applied.

**The mail.** The press is the run's first bulk mail, so a weather day on the mail counts as `messages.mail_delay`, apart from `messages.courier_delay`, and the courier band keeps watching orders and reports.

Rejected:
- **Four new world tables for politics.** They'd have one consumer each; pack rules with cites suffice.
- **Per-scenario bloc starts now.** There is one start per pack until the March 1862 demo needs more.
- **Chambers on the weekly step.** It would miss the session days.
- **Recording every act of the principal in the ledger.** Which acts are owed to Congress is a situation's judgement.
- **The press as an owner of State,** a single national front page, and the enemy reading the papers (1B).
- **The press reading the battle record's losses,** whether at once or on a lag. That leaks the truth to the principal ahead of the returns.
- **A paper's own estimate of losses.** That's a slant, which belongs to 1B.
- **M2's override count for credibility.** The new State keeps no record of overrides.
- **Silently dropping unknown fields.**
- **A reader-kinds rule to cut the mail,** until lane 1.14 measures a full campaign.
- **Using Kentucky's 20 June election as the floor for the lag.** The kernel doesn't model members missing from a sitting.

## Consequences

- FOUNDATION section 10 gains the four fields and phase 4e. Section 7 records the press as built.
- **Lane 1.11** uses the vocabulary:
  - S09 is a `session-call` with a `ledger-act`;
  - S20 fires on the House sitting and answers with `ledger-answer`;
  - the war's opening uses `framing` effects;
  - "Summon Congress at once" calls `congress_37_1_at_once`.
- **Lane 1.14** calibrates the [I] numbers against the politics note's calibration points, and measures the press's mail over a full campaign.
- **Lane 1.11b** fixes two cites: the army bloc's starting value gets "[I]", which needs a gate re-sign, and the at-once session cites the gaps note, Part F.
- **1B:**
  - papers with a slant, and leaks;
  - the enemy reading the papers;
  - relief costing bloc support;
  - the border Unionists' `slavery_noninterference` once blocs read policy;
  - national will, elections and the verdict.
- **OPEN_QUESTIONS:**
  - a test for a battle of two or more days whose full returns arrive apart;
  - the Confederate Congress's sessions, for whoever first needs them.
