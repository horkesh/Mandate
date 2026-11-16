# Lane 1.6: politics, first cut

Phase 1 lane 1.6 (FOUNDATION section 12, row 1.6), on branch `phase1-politics`, from main at 1637a1f. It builds the
chambers of the legislature and the accountability ledger (0040, 0046; S20), the framing term (0028, 0040), the
blocs and the mandate recast from M2's `derive`, and the press as a report route. It also replaces 0079's credibility
stand-in with a derived term, applies lane 1.5's `address` proposals, and adds the gate check that refuses a bloc made
of a protected group.

## What is built, and where

| Piece | Where |
|---|---|
| The four `politics` fields, the only writer `applyPolitics`, and the derived mandate and credibility, each with typed terms | `kernel/src/politics/politics.ts` |
| The pack rules (blocs, chambers, the session calendar, credibility, framing, the press), and the kernel's own check of them | `kernel/src/politics/rules.ts` |
| The front page: a paper's battles as its public hears them, and what it moves at its reach | `kernel/src/politics/press.ts` |
| The phase (4e, after the weekly people step): proposals, the week's drift and the ladder's pull, the press, then the chambers and the ledger | `kernel/src/tick/politics.ts` |
| Two condition kinds for situations, both public facts readable in option conditions: `chamber` and `ledger` | `kernel/src/situations/{types,conditions}.ts` |
| Credibility read from `politics` wherever an order or an audience read the stand-in | `kernel/src/reading/orders.ts` (`principalCredibility`), `kernel/src/audience/audience.ts` |
| Schemas, the validator, and the effect checks on `politics` fields | `pack-format/src/{schemas,validate,situations}.ts` |
| The gate check: no bloc of a protected group | `pack-format/src/gate.ts` (`checkBlocs`), run by the loader beside the situations' gate |
| Tests | `kernel/test/politics.test.ts` (10), `pack-format/test/gate.test.ts` (1 more) |

### The State

All four fields are written only by `politics`:
- `blocSupport`;
- `chamberStates` (records `ChamberState`, keys `cham*`);
- `congressLedger` (records `CongressAct`, keys `ledger*`);
- `warFraming`.

`OWNED_FIELDS` names them, with their proposers. The mandate and credibility are derived on read and never stored.

## The rules, as built

### Blocs

M2's recast. Each bloc is a pack rule: its side, its voice (a side's voices sum to 1000), its rest, its values, and its
reactions to a battle reported won or lost. Each has its cite.
- Support starts at the rest and drifts back toward it weekly, by 1/`driftDivisor` of the gap (M2's).
- An address raises the bloc addressed (`address.support`). The side's blocs that share none of its values lose `othersPenalty` (M2's rule).
- The ladder pulls weekly, by M2's rules:
  - a man on lobbying or above drains his own bloc, `lobbyingPerRung` for each rung from lobbying;
  - from public defiance up, every bloc of his side loses `publicDefiance`;
  - a rival's bloc loses `rival`.

### The mandate

The side's bloc support weighted by voice, plus the framing term at `framing.mandatePermille`. Each term is returned.

### Credibility

The principal's sanction credibility (P7) is derived. It replaces 0079's stand-in, and the pack rule
`people.context.leaderCredibility` is retired. It is the sum of:
- `base`;
- `mandatePermille` of his side's mandate;
- `perRelief` for each man who holds a relief against him: a record that he does relieve, which fades as the grievance does.

It is clamped to `min`..`max`.

Both packs set base 450 and a fifth of the mandate. That puts the start at about the old 500 (testbed 495 and Union
498), so the reference runs' compliance barely moves.

### The legislature

**Chambers by the calendar.** Each chamber sits by the pack's calendar of regular sessions. The state is recomputed
daily, because sessions fall on particular days.

**A call.** A situation's `session-call` effect summons a callable session:
- it is `called` until it opens, on its date (or the day after the call, if that has passed) or `afterCallDays` after the call;
- it then sits to its close or for `sitsDays`;
- a called session holds until it closes, whatever the calendar says;
- a second call while one stands is refused.

**The ledger** (0046):
- `ledger-act` enters an act, with its side, situation and option.
- The act is met on the first day a chamber of its side sits, or at once if one sits.
- `ledger-answer` (S20's ratification) answers what is before the legislature: one act, or all of the side's. An answer with nothing before it is refused.

**Conditions.** `{chamber: {id, state}}` and `{ledger: {side, act, status: away|before|answered}}` are public facts. They
join the option conditions' allow-list (`KNOWABLE`), as its comment had promised, so options can be legal by the
chambers. A situation's own knowledge trigger still reads only `knows`.

### Framing

Framing is signed permille per side: who its public believes began the war (positive: the other side). It is moved
only by situations' `framing` effects. It counts in the mandate, and the front page prints it.

### The press

No owner of its own: a report route (FOUNDATION section 7).

**Printing.** Every `cadenceDays`, each paper prints a front page:
- its editor (a person in the World, of the paper's side) writes it, as a `press` report, from the paper's region by mail;
- it goes to the side's principal and to every serving holder of one of its posts;
- a paper whose editor is no longer serving, or no longer on its side, is silent.

**What it says.** The page carries the battles its side closed since the last page, each read by who left the field:
- `won`: the other side withdrew or routed;
- `lost`: its own side did;
- `drawn`: neither did.

Each battle is a `battle-result` claim, with the side's killed, wounded and missing. The side's framing is a `framing`
claim when it is not zero.

**What it moves**, at the paper's reach:
- each bloc of the side, by its `victory` or `defeat` (applied by `politics`);
- the battle's commander's standing, by `press.standing` (applied by `people`).

The truth layer carries the reach as a `press_reach` term.

### Effects

A situation's effect on `politics` names one of `bloc-support`, `framing`, `ledger-act`, `ledger-answer` or
`session-call`. The fields 1B builds (`foreign-patience` and `national-will`) are still reported and not applied. Any
other field is refused, both in play (a `proposal_refused` event) and at validation. Validation also checks the bloc,
the callable session, the act's side and the ledger condition's act.

### The packs

**Union.** Data:
- the six Union blocs of the politics note (the abolitionists merged into the Radicals, as it recommends) and one Confederate bloc;
- the Senate and the House;
- the 37th and 38th Congresses' sessions, from the note's section 1.5;
- the special session of 4 July 1861 as callable, sitting 34 days;
- three papers (the Tribune, Times and Herald, edited by Greeley, Raymond and Bennett, who are already in the people list with citations).

Sources:
- voices, reactions and reach are [I], from the note's design implications;
- rests come from the M2 scenario;
- the Peace Democrats' reaction (they rise on defeats and fall on victories) is the one direction the note sources.

**Testbed.** The M2 testbed's five blocs, a Northern Assembly with a May and June session and a callable special
session, and a new fictional editor (`n_editor`, person kind `editor`) for the northern gazette.

## Done

- `npm run check` passes (1160 tests), and `npm run run:done-check` passes all six criteria. The Union run's day costs a median of 12.95 ms (p95 30.98 ms), inside the 40 ms budget, with the press's mail.
- The tests drive:
  - blocs at rest, and the mandate and credibility with their terms (a relief raises credibility; an order reads it);
  - an address and the weekly drift, through the tick;
  - the effect mapping, with its refusals;
  - the chambers by the calendar, through the tick;
  - a call, and the refusal of a second;
  - the ledger away, met, answered and refused, with both conditions;
  - battle results;
  - a front page through the tick (blocs, standing, the report the principal holds, none for the other side);
  - a silent press;
  - the rules' own check;
  - the gate's bloc check.
- The liveness gate:
  - **Bands from the merged runs:** front pages, support, and the chambers opening and adjourning.
  - **Mail counted apart (the lead's ruling, the second commit).** A weather day on a mail route now fires `messages.mail_delay`; the courier routes keep `messages.courier_delay`, so that count still watches orders and reports.
  - **Re-banded:** `courier_delay` is at its measured courier-only count, `mail_delay` at its own, and `knowledge.pruned_age` (Union 8 to 28) because front pages are kept the press template's 21 days.

| Run | `courier_delay` | `mail_delay` |
|---|---|---|
| Union (merged with main at d4943e5) | 70 | 1247 |
| Testbed | 35 | 107 |

The other Union bands from the merged run: `front_page` 30, `support` 23, `adjourned` 1, `pruned_age` 29, `messages.sent` 5,288 and `messages.delivered` 4,810.

The pre-press band of 197 also counted the mail's weather days: other reports already went by mail before the press.

### Where the mail comes from (the Union run, 75 days)

- **Messages sent:** about 2,820 before the press, 5,272 after. That is about 2,450 more: 30 front pages (3 papers × 10 weeks), each to about 80 readers.
- **Only courier and mail draw weather.** The wire and special messengers never do. Before the press the run's traffic was mostly wire.
- **Every front page goes by mail from New York.** The pack's mail takes twice the courier's days, and the weather adds 0 or 1 day (`courierNoiseMaxDays` 1), so about half the pages that travel draw a day.
- **Totals:** messages grew about 1.9 times. Weather-exposed traffic grew several-fold, because the press is the run's first bulk mail.
  - **Quiet, each driven by its kernel test:** `act`, `met`, `answered`, `called`, `framing`, `refused` and `press_silent`, until lane 1.11 authors S09, S20 and the war's opening.

## Choices made (for the decision record)

1. **Politics data as pack rules with cites** (`rules.politics`), not four new world tables. They have one consumer and are small, and the generator stays unchanged. *Rejected:* CSV tables for blocs, chambers, sessions and papers.
2. **A bloc starts at its rest; no scenario rows yet.** *Rejected:* per-scenario start rows now, with one start per pack. The March 1862 demo start will need them.
3. **The chambers by the calendar daily**, with a call held until it closes. *Rejected:* the weekly step, which would miss the session days.
4. **The ledger is entered and answered by effects, and met by any chamber of the side that sits.** *Rejected:* recording every act of the principal (the acts owed are a situation's judgement, with S20 answering them).
5. **The press prints to its own side's principal and serving post holders; its effects scale with reach, and a battle is read by who left the field.** *Rejected:* the press as an owner of State; a single national front page; the enemy reading it (1B, see findings).
6. **Credibility derived from the mandate and the reliefs on record.** *Rejected:* M2's override count, because the new State keeps no record of overrides.
7. **Unknown `politics` fields refused; the 1B fields reported.** *Rejected:* silently dropping unknown fields.
8. **No bloc of a protected group**, by its id or name in any locale. This is a gate check, not a convention.

## For the lead

1. A decision record (the eight choices).
2. **FOUNDATION section 10 rows.** The four fields with their code names and proposers. The phase list gains 4e (politics, after the people step). Section 7 gains the press's readers and the battle reading.
3. **Lane 1.11** gets the vocabulary it needs:
   - S09's `militia-call` option: a `session-call` of `congress_37_1`, plus a `ledger-act` for the call.
   - `larger-longer`: a `ledger-act` for the call.
   - S20: fires on `{chamber: {id: house, state: sitting}}`, its options read `{ledger: …, status: before}`, and ratification is a `ledger-answer`.
   - The war's opening: `framing` effects.
   - "Summon Congress at once" needs a callable session with `afterCallDays`, and how many days Congress took to assemble needs a source.
4. **The gate reviewer** should read:
   - `politics/press.ts`, `tick/politics.ts` and the Union blocs and papers in `packs/union-1861/pack.json`, against `press-suppression`, `war-aims-1861` and `northern-racism-cost`.
   - Nothing here suppresses or leaks: suppression stays a security order (lane 1.11).
   - Framing moves only by a situation's effect.
   - The reason ids lane 1.11 writes (for example, racist opposition) pass through unchanged.
5. **The mail load.** The press nearly doubles the Union run's messages, all by mail (see "Where the mail comes from"). The lead ruled to count the mail apart and to leave a reader-kinds rule until lane 1.14 measures a full campaign.
6. **The pushback map.** Nothing in 1.6 consumes the order-to-value map. `address` carries no content yet. Whatever reads its pushback later reads the floored `pushbackOf` (lane 1.5b).
7. **Calibration.** The Union numbers are [I] and the M2 rests. Lane 1.14 calibrates them against the note's calibration points (the 1862 midterm band, the two lows).

## The gate review's fixes (lane 1.6 at 95b88b5)

- **G-1.6a.** The front page counts the captured among a side's losses, as 0074 and 0076 have the public count them among the missing.
- **G-1.6b.** A cut-off force that surrendered or was destroyed has lost, though it never withdrew. Pegram's surrender at Rich Mountain prints as lost, not drawn.
- **G-1.6c.** The Confederate bloc holds `slavery_defence`, cited to the Confederate constitution of 11 March 1861 (`docs/research/2026-11-14-confederate-side.md` [AVA-CSA]). R1 decides the Confederacy's real blocs.
- **Item 4: the bloc table is pinned.**
  - `blocSignOffProblems` and `blocHash` sit in `pack-format/src/gate.ts`, as G-1.5e pins gated rows. The hash covers each bloc's rule and its English name.
  - `packs/union-1861/test/gated-blocs.test.ts` holds each Union bloc's hash, signed by `gate-reviewer`.
  - A new or edited bloc, or a renamed one, fails until it is re-signed.
  - The testbed's fictional blocs are not pinned.

## The standing review's fixes (lane 1.6 at 95b88b5 and e0661a1)

- **Item 5, the [I] labels.**
  - Each Union bloc's cite now labels its rest and reactions: "[I]", or, for the Peace Democrats, "the reactions' direction is sourced, their sizes [I]".
  - `drift` (it was `driftDivisor`), `address`, `ladder`, `credibility`, `framing` and `press.standing` each carry a `cite` stating "[I]" or "M2's". Lane 1.14's stand-in criterion finds them in the pack.
  - Credibility's cite says it replaces 0079's STAND-IN.
- **Item 4, the QUIET events asserted.** The needle tests assert the `framing`, `act`, `answered` and `called` events that the tick fires, each through `applyPolitics`.
- **The lag from a call to a sitting Congress** (the lead's ruling on lane 1.11r's answer, `docs/research/_parts/F-congress-lag.md`):
  - A second callable session, `congress_37_1_at_once`, sits 30 days after its call, for 34 days. It is marked [I], with the 1861 lag (80 days) and the comparisons (17, 75 and 38 days) in its cite; lane 1.14 calibrates it.
  - The historical call keeps its own session, `congress_37_1`, for 4 July.
  - Lane 1.11's "Summon Congress at once" option calls `congress_37_1_at_once`.
- **Item 7, the merge.** Main is merged at d4943e5, the generated files are regenerated, and every Union band this lane set is re-banded from the merged run. The done check's final hashes against both parents:

  | | lane at e0661a1 | main at d4943e5 | merged |
  |---|---|---|---|
  | Union, at war, 75 days | 6a9290a3878bfd34 | 08ecc54e6076400a | aa060c05ee33b77a |
  | Testbed, 120 days | 42bc7f0e15af1099 | 0dc77944e8d96091 | 42bc7f0e15af1099 |

  - **Union:** the merged run differs from both parents, as it should, since main's lane 1.11a people data and this lane's politics both change it.
  - **Testbed:** the merged run equals the lane's, so nothing main merged since 1637a1f changes the testbed run. Main's differs only by this lane's politics: the press, the editor and credibility.

## The press's figures from the returns (the lead's ruling, on 0ffcc56)

A front page went to the principal with the battle record's exact losses, a route around 0008 and 0052. Now:
- **The figures:** a page's `battle-result` takes its side's losses from the casualty returns its principal holds by the printing day (`returnedLosses` in `politics/press.ts`). For each battle day it takes the full return, written `revealDays` after the day, if he holds it, else the first return written that evening. The battle record is never read for figures.
- **Confidence:** 900 from full returns for every day, 500 while a first return stands for any day, and 0 with no return yet, when the page prints the result with no figure.
- **The captured (G-1.6a):** the first return counts them among the missing, and the full return lists them apart. Both count them, so G-1.6a holds through the returns.
- **The result** (won, lost or drawn by who left the field) still reads the record: who left the field was public.
- **Test:** no figure before any return; the first return's low figure; then the full figure with the captured; and the return's claim of the enemy's losses never counts as the side's own. Re-break: reading the battle record's losses fails 2 tests.
- *Rejected:* the truth on a lag (it still leaks exact losses before the full return), and a paper's own estimate (a slant, which belongs to 1B).

## Findings outside my scope

- The enemy reads the papers (0032: Lee followed McClellan in the Inquirer). Front pages go only to their own side, so the enemy route is 1B.
- The relieve verb proposes no bloc resentment. M2 cost the blocs sharing the man's values in proportion to his standing.
- National will (0028's two wills), elections and the verdict remain 1B. The mandate feeds only credibility so far.
- The Confederate side has no chambers: no source in the notes covers its Congress's sessions.
- A paper's own slant (its alignment, and editors' leaks) is not modelled. Every paper prints the same battles.
- **For 1B (the gate review's item 7):** the border Unionists' values ("conciliation, union") omit their stake in slavery, which was the core of the border problem. Add `slavery_noninterference` when blocs read policy (R7's consequences). Today nothing reads bloc values but the address penalty.
- ~~The press reads the battle record's truth, not the casualty returns.~~ Fixed by the lead's ruling (see "The press's figures from the returns").
- M2's `derive.ts` stays until M2 retires.
