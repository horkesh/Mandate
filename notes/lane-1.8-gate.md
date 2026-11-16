# Lane 1.8: the gate for 1A

Branch `claude/phase1-gate-1861-9c44ea`. Row 1.8 of FOUNDATION section 12 (0073). Three deliverables, in order:
- **A.** R4's battle ruling, drafted for the lead to decide and record (lane 1.3 waits on it).
- **B.** Registration of every SENSITIVE-HISTORY section 3 topic whose window overlaps 5 March to 31 July 1861, in `packs/union-1861/gate/`.
- **C.** Draft records R6 and R7 for 1B.

Source tags are SENSITIVE-HISTORY's: **[SW]** secession winter, **[GCF]** gate and catalogue facts, **[U62]**, **[UP]**, **[UE]**, **[UN]**, **[CS]**, **[MF]**, **[MX]**, plus **[CM]** for `docs/research/2026-11-14-combat-model.md`. Nothing here is sourced from memory; facts no note sources are marked **needs-source** and listed for a research lane at the end.

---

## A. Draft record: R4's battle ruling (capture and surrender)

*Draft for the lead. Not in `docs/decisions/`: the lead decides and records it, after the gate reviewer reads it (0073). Number to be assigned.*

# NNNN: Capture in battle is a battle loss; what happens to prisoners stays held for R4

Status: draft (lane 1.8, 2026-11-16). Answers the battle question 0073 put to R4 before lane 1.3 merges. Narrows SENSITIVE-HISTORY 3.6's `prisoners-and-exchange` and adds a register topic. R4 proper (1B) adopts or supersedes it.

## Context

Lane 1.3's battle model takes captured men out of a block's strength, and a force that is cut off can surrender (the combat note's P8 and its `cut_off` rule [CM]; `OPEN_QUESTIONS`, the trapped garrison). SENSITIVE-HISTORY 3.6 holds `prisoners-and-exchange` in `record` status with no interim placement, so as the register stands every item tagged with it is refused (A3), and any 1A notice of a surrender would have no topic it could legally carry. 0073's candidate answer is: capture is a battle loss, placed as an event; the captured leave play; casualty returns may name them as a count; exchange, parole, camps, retaliation and the Corcoran lot stay held for R4 proper in 1B.

**The record, in 1A's window (5 March to 31 July 1861).** Every case the notes source, and one they do not:

| Case | What the notes give | What it tests |
|---|---|---|
| Camp Jackson, 10 May | Lyon's force took 669 State Guard militia (three sources; about 689 in a fourth) [SW 3.5, 1; OZARKS-CJ, ECW-CJ, MO-Timeline]. The civilians killed afterwards are `civilian-deaths-1861` [SW 6.7]. | A capture with almost no fighting, by a commander's own act (S14's Lyon). Whether the men were paroled: **needs-source**. |
| Rich Mountain, 11–13 July | Rosecrans's flank force beat Pegram, who surrendered about 553 men on 13 July [SW 3.6; NPS-RM, BF-RM]. | A cut-off force surrenders: the combat note's `cut_off` rule, and a commander (Pegram, a named person) captured. |
| Bull Run, 21 July | Union losses 2,708 (481 killed, 1,011 wounded, 1,216 missing) in one table and 2,896 (460, 1,124, 1,312) in the same article's text; Confederate 1,982 [SW 4.6, WIKI-Bull]. Fox's "missing" includes the captured [CM 2.3, FOX-XIV]. About 2,600–2,700 Union prisoners had reached Richmond by November 1861 [GCF 5.1]. The lot of 10 November 1861 fell on Colonel Michael Corcoran of the 69th New York [GCF 5.1]. | A rout, where missing is high and captured is a share of it. How many of Bull Run's missing were captured: **needs-source** (WIKI-Bull is a Wikipedia article, weak as a sole source). That Corcoran was captured at Bull Run, and how many of the Richmond prisoners came from it: **needs-source**. |
| Lynde, 27 July (Fort Fillmore and San Augustine Springs, New Mexico Territory) | **Not in any research note.** The pack has `fort_fillmore` in the `arizona` region and nothing else. | A garrison that abandons its post and surrenders on the march. Date, place, numbers and terms (above all whether the men were paroled at once): **needs-source**, for lane 1.9 or 1.10. |
| Fort Sumter, 13 April | Surrendered after about 34 hours [SW, HN-Sumter, snippet]. | The terms (the garrison allowed to leave): **needs-source**. If the garrison left rather than being held, the battle model has no capture to make, which is how Sumter should read. |
| The *Savannah*'s crew (taken June 1861) and Davis's warning of 6 July | Tried for piracy; Davis warned that Union prisoners would get "the same treatment and the same fate" [GCF 5.1, D-OR2-3]. | Inside 1A's window, but these are the first step of the hostage chain (the Corcoran lot), so they are R4 proper's, not the battle model's. |

**What the cases show.**
1. **Capture is common and ordinary in 1A:** three of the sourced actions in the window end with men taken (Camp Jackson, Rich Mountain, Bull Run), and a fourth (Lynde) awaits a source. A battle model without capture would understate the record; one that held the whole topic would leave 1.3 and the surrender notices with no tag.
2. **The fate of the captured is where the gate's harm lies, not the capture.** Every gated question in 3.6 (camps and mortality, exchange and recognition, parole, hostages by lot, retaliation, GO 54 and GO 60, Black captives) is about what was done with men already taken. None is decided at the moment of capture.
3. **"Leave play" fits each case whatever the terms were.** Men held in Richmond were out of the war; men paroled were barred from duty until exchanged (the cartel's own rule of July 1862, [GCF 5.2], and Camp Parole's men waiting [GCF 5.2]). So the battle model need not know, in 1A, whether a garrison was paroled or held: either way it leaves play until R4 proper places exchange. That is why Lynde's missing terms do not block the ruling, only the authoring of a Lynde notice.
4. **Missing is not captured.** Bull Run's two sets of figures differ by about 100 missing, and Fox's missing count stragglers as well as prisoners [CM 2.3]. The first return names missing; captured is a later, partly known figure, and disputed numbers are ranges (F4).

## Decision

**1. Capture in battle is its own register topic, `capture-in-battle`, open, placed `event` and `text`.** It is not a facet of `prisoners-and-exchange`, which stays in `record` status with no interim placement.
- It covers: men of a force block taken in battle, in pursuit, or when a force that is cut off surrenders (garrisons included); and a commander captured (lane 1.3's `people` status `captured`).
- The decision to surrender a cut-off force is its commander's, from his seat and traits ([CM] P8). It is an *event*: the act of a seat the player does not decide. No verb, option or goal orders a force to be captured or names what becomes of the captured.
- Notices of a capture or a surrender (Rich Mountain, Lynde once sourced, a garrison in the game) are tagged `capture-in-battle`, placed `event`, with a sign-off, like any gated notice.

**2. The captured leave play.**
- In 1A, capture is permanent. The captured leave a block's strength as a typed loss (`captured`) in the battle record, and a captured commander keeps the status `captured`. Nothing in 1A returns either.
- There is no prisoner stock, pool or count that any seat holds, spends, trades, exchanges or paroles. The captor gains nothing from the captured but their absence from the enemy's ranks.
- No option, notice or initiative names a captured man's fate: no exchange, parole, release, hostage, trial or retaliation. Those are R4 proper's.

**3. Casualty returns may name the captured as a count.**
- In the battle record, the casualty return and the reports built on them (0032), as killed, wounded, missing and captured, kept apart as Fox keeps them.
- The first return names *missing*; *captured* is a later, partly known figure. Disputed numbers are ranges with citations (F4): Bull Run's missing is 1,216 to 1,312.
- A count of soldiers taken is not a count of a protected population. A return never counts civilians or enslaved people (point 4).

**4. Only soldiers are captured.**
- The battle model captures only from a force block's strength. Civilians, enslaved people, and Black teamsters or servants with either army are never captured by it.
- People who reach Union lines, or whom Union forces find where they occupy, are `self-emancipation` and `fugitive-policy`, never a capture. Nothing treats a person as property taken (the register refuses it: no field, option or label that captures, seizes or confiscates enslaved people). The Second Confiscation Act's "captives of war" (sec. 9, 1862 [GCF 4]) appears only as the law's quoted words.
- **Black soldiers:** this ruling holds only while no Black unit exists in either side's force data, which is true of 1A. Before any Black unit can fight (R2's situations; the 1st Kansas Colored, the 1st South Carolina and the Louisiana Native Guards in 1862 [GCF 7.1]), R2 and R4 proper must place the capture of Black soldiers, because the Confederacy's policy toward them differed (`captured-black-soldiers`). A uniform "leave play" would hide that difference.

**5. Killing the captured is never a choice.** It is atrocity-class (SENSITIVE-HISTORY rule 1: killings of prisoners). No seat has a "no quarter" or execute option; if it is ever authored as conduct, it is an event under its own topic and the sign rule.

**6. Held for R4 proper in 1B,** under `prisoners-and-exchange`, still `record`: exchange (the local exchanges of 1861, the House resolution of December 1861, Wool–Cobb, the Dix–Hill cartel), parole, camps and their conditions, the privateers and the Corcoran lot (with Davis's 6 July 1861 warning, inside 1A's window), retaliation, GO 54 and GO 60, and the treatment of Black people captured. The topic's refused signatures keep them out mechanically until then: any field named for prisoners, and any option or label that exchanges, paroles, holds hostage, executes or retaliates against prisoners, is refused, with the reason "held until R4".

**Tested against the ship rule.** Unchanged: `prisoners-and-exchange` stays a slice ship-blocker in `record` status. Opening `capture-in-battle` lets 1A's battles and notices exist; it does not let the slice ship. 1A is a milestone, not a release (no `release.json` yet), so the held facets inside 1A's window (the privateers, Davis's 6 July warning) are simply absent from 1A's history run. Under G1 ("leaving the topic out is itself a framing"), the slice still cannot ship until R4 places the fate of the captured.

**Tested against the lever sweep and 0060 and 0063.** Capture of men in arms is lawful war, so `capture-in-battle`'s class is not atrocity-class: E7 and D5 do not apply, and the rule needs no `watched` mark. The topic has no option, so D6 has nothing to sweep. The one lever risk is that the captor pays nothing to hold the captured. In 1A that is bounded three ways: the player has no verb that captures (pursuit and surrender are commanders' choices by traits, and effective pursuit is rare [CM] bands 9 and 10); the combat note's bands bound the captured share (bands 5, 9 and 10); and R4 proper brings the holding cost back with the camps. The planner may score an encirclement, as it scores any operation; that is the war, not a gated lever.

Rejected:
- **Capture as a facet of `prisoners-and-exchange` with its own placement.** The register holds or opens a whole topic; a facet-level placement on a held topic needs a change to the gate machinery for no gain over a second topic.
- **Capture ungated, like the emergency militia of 1863.** Surrender notices and casualty returns would then escape the gate reviewer, and the terms that name prisoners would have no topic to carry.
- **An interim `text` placement on `prisoners-and-exchange`.** It would open text on exchange and camps too, which the candidate holds, and a surrender notice carries effects.
- **A prisoner stock in 1A, to be used later.** A stock is the first thing a seat trades; R4 proper decides whether one exists.
- **Returning the captured after a fixed time.** That is parole or exchange by another name.

## Consequences

- The register gains `capture-in-battle` (open, class `prisoners`) and `prisoners-and-exchange` (record, its held facets as refused signatures). Lane 1.8 registers both.
- Lane 1.3: `captured` is a typed loss in the battle record; no prisoner field; a captured commander's status is terminal in 1A. A kernel test should assert that nothing moves a person out of `captured`, and that no force block loses strength to capture except by the battle model (rule 7; lane 1.3's or 1.1's test, not the gate's).
- Lane 1.11 and 1.4: a surrender or capture notice is tagged `capture-in-battle`; a casualty-return template that names the captured is tagged the same way.
- A research lane sources Lynde's surrender, the Camp Jackson and Sumter terms, Bull Run's captured share and Corcoran's capture (the list at the end of this note).
- R2 and R4 proper re-rule capture before the first Black unit exists in force data.

---

## B. Registration: the Union pack's gate for 1A

All of this is in `packs/union-1861/gate/`. `pack:validate -- union-1861` gives 0 errors and 744 warnings, the same count as before the lane. `register-coverage` and every pack test pass, and so does `npm run check` (988 tests).

### B.1 Which topics, and why

The test: does a SENSITIVE-HISTORY section 3 topic's window overlap 5 March to 31 July 1861, *and* does a facet fall in it? Every topic is listed here.

**Registered (19 topics, the existing `indian-territory-1861` included):**

| Topic | Status | Window in the register | Placements | What falls in 1A |
|---|---|---|---|---|
| `indian-territory-1861` | open | 4 Mar 1861 – 31 Dec 1862 | derived, event, text | Unchanged. The posts abandoned, and the treaties of 10 and 12 July. |
| `cause-of-secession` | open | slice | event, text | The declarations, the constitution (11 March) and Cornerstone (21 March) in the briefing and the press [SW 6.1], [CS 4.1]. |
| `inaugural-slavery-passage` | open | slice | event, text | The premise's framing values, and the passage quoted (0042) [SW 6.3], [MF] row 12. |
| `corwin-amendment` | open | slice | text | Text only [SW 6.3, 6.8]. |
| `war-aims-1861` | open | 4 Jul – 6 Aug 1861 | decision, text | S20's `ask-war-footing-and-aims`; Crittenden–Johnson as Congress's act [SW 5]. |
| `lost-cause-traps` | open | slice | refused | A rule rather than a topic: it carries trap 3's and trap 4's machine signatures. Its framings are in `forbidden.json`. |
| `self-emancipation` | open | 23 May 1861 – slice end | derived, event | The Fort Monroe arrivals from the night of 23 May; about 900 people by 30 July [SW 6.3]. |
| `fugitive-policy` | open | 23 May 1861 – 17 Jul 1862 | decision, event, text | S17 and Butler's question, McClellan's proclamation of 26 May [SW 6.3]. |
| `union-freedpeople-camps` | open, **needs-source** (whole topic, so held) | 23 May 1861 – slice end | event, text | Cameron's "employ them and keep account" [SW 6.3]. Nothing may be authored about Union camps. |
| `confederate-enslaved-labour` | open | slice | text | The Sewell's Point and Charleston works (snippet) and Butler's stated reason [SW 6.3]. |
| `slavery-as-wealth` | open | slice | text | Any finance text in S20's money question [CS 3.3]. |
| `black-enlistment-1861-offers` | open | 15 Apr 1861 – slice end | decision, event | S13: the offers, and `decline`, `refer-governors` and `ask-congress` [SW 6.4]. |
| `union-habeas-and-arrests` | open | 27 Apr 1861 – slice end | decision, event, derived | S12's `suspend-on-line`, S18 Merryman, and Kane, the Baltimore police board and the Maryland arrests [SW 6.6], [GCF 9]. |
| `press-suppression` | open | 12 Apr 1861 – slice end | decision, event | Telegraph censorship from April, and the mob attacks of 1861 [SW 5, 6.6], [UP 4.1, 4.3]. |
| `civilian-deaths-1861` | open | 19 Apr – 31 Dec 1861 | event, text | Pratt Street (9–12 civilians, 4–5 soldiers) and Camp Jackson (at least 28) [SW 6.7]. |
| `guerrilla-war-west` | **record** (held for R6) | 1 Jul 1861 – slice end | derived, event, decision | Missouri sabotage and executions in July 1861 [SW 6.7]. |
| `capture-in-battle` | open (new, from A) | slice | event, text | Camp Jackson, Rich Mountain, Bull Run, and Lynde once sourced. |
| `prisoners-and-exchange` | **record** (R4), no interim | slice | decision, event, text | The *Savannah* privateers and Davis's 6 July warning [GCF 5.1]. Everything else is later. |
| `neutral-option-wording` | a rule, not a register topic | — | — | Its checks are the C1–C4 machinery plus the hindsight and moral-verdict patterns in `forbidden.json`. |

**Not registered, with the reason:**

| Topic | Why not now |
|---|---|
| `emancipation-policy` | Its window is the slice, but its first decision is Frémont's proclamation of 30 August 1861, after 1A. In 1A, McClellan's proclamation, Crittenden–Johnson and the Confiscation Act's text sit under `fugitive-policy` and `war-aims-1861`. It is R7's (section C). Registering it now with no record would make it a new ship-blocker, which SENSITIVE-HISTORY section 4 does not list. |
| `northern-racism-cost` | The notes source it from 1862 (the midterms, the proclamation [UP 3.1]). No 1861 facet is sourced. |
| `black-enlistment` | Cameron's report (late 1861) and the Militia Act (July 1862) are after 1A, and both are R2's. Its refused facets (pools, recruit verbs, race-selecting fields) are already registered under `black-enlistment-1861-offers`, `self-emancipation` and `lost-cause-traps`. |
| `black-sailors` | From September 1861 [UN 1]. |
| `black-soldiers-pay`, `captured-black-soldiers`, `twenty-slave-law`, `occupation-orders`, `confederate-habeas`, `dakota-war-1862` | Every facet dates from 1862. |
| `unionist-repression` | Shelton Laurel is 1863. East Tennessee in 1861–62 is needs-source [CS 4.5], so no 1A facet has a source. |
| `fort-pillow-and-jccw` | The committee dates from 9 December 1861 and Fort Pillow from 1864. |
| `bread-riots`, `confederate-arming-enslaved`, `draft-riots`, `commutation`, `emergency-militia-1863` | Later. `commutation` and `emergency-militia-1863` are not gated. |
| `prize-money-and-cotton` | Prize money is not gated. Its gated facet (freedpeople's labour on plantations) begins at Port Royal (November 1861) and is needs-source. |
| `verdict-text` | 1A's run ends at checkpoints, not a verdict. It is R5's. |

### B.2 Choices made in registering (each the recommended option; the alternatives are rejected)

1. **Classes.** The register uses eight classes, the ones section 5 names that 1A needs: `cause-and-aims`, `slavery-and-emancipation` (agency), `black-military-service` (agency), `civil-liberties`, `atrocities` (atrocity), `guerrilla-war`, `prisoners` and `native-nations`. Rejected: separate `civilians` and `riots-and-mobs` classes, because no 1A topic needs them.
2. **`civilian-deaths-1861` is atrocity-class.** SENSITIVE-HISTORY refuses any benefit to the acting side from the deaths "(E7)", and E7 bites only on an atrocity class.
   - **The lead's ruling (2026-11-16):** the class stays atrocity. The Pratt Street deaths are their own notice, tagged `civilian-deaths-1861`, never a tag on S12's decision. S12 is tagged `union-habeas-and-arrests` only, so its options, `meet-governor` among them, may move measures.
   - The register does not force S12's tag. A1 needs some tag on an item whose strings hit a trigger ("riot", "mob", "habeas"), and the habeas tag satisfies it. So the register entry is unchanged.
   - **For lane 1.11, because tags do not decide taint:** D5 follows *dependence*, not tags (0060). If S12's trigger reads the deaths notice (fires on it, waits on news of it, follows it in a chain, or reads a flag it sets), S12 is tainted whatever its tag. S12's event condition must therefore read the route's closure in state (the bridges burned, the line through Baltimore cut [SW 3.2]), and the deaths notice fires from the same cause beside it, never upstream of it. The gate reviewer checks the route at sign-off; `checkGate` reports any taint mechanically.
   - Rejected: a non-atrocity `civilians` class, which leaves the sign rule unenforced on these deaths.
3. **`guerrilla-war-west` is held (`record`).** SENSITIVE-HISTORY 3.6 says "Held for R6", and one topic cannot carry both its atrocity-class events (reprisals, sign rule) and its decision (the reply to Frémont): B4 refuses a decision on an atrocity class. R6 (section C) proposes the split.
   - Under the ship rule, a held topic in the slice blocks release. The lead ruled that the ship rule governs (0046), and SENSITIVE-HISTORY section 4 now lists R6 / `guerrilla-war-west` as a slice ship-blocker (23c9590 on main).
   - It does not block 1A, which ships nothing.
4. **Held facets as refused signatures.** Some facets are held rather than refused for ever. Each gets a signature whose reason begins "held until R4" or "held, not refused", and whoever lifts the hold lifts the signature. Without one, an untagged item could carry a held facet past A3. The cases are:
   - exchange, parole, hostages, retaliation and prisoner fields, under `prisoners-and-exchange`;
   - a direct `accept` of Black volunteers, needs-source, under `black-enlistment-1861-offers`.
5. **Sources live in each signature's reason.** The topic schema has no `sources` field, and adding one is a change to `gate.ts` that no placement needs (the brief allows such a change only when a placement cannot be expressed otherwise). The full source list is section B.4 below. I recommend a `sources` field that resolves against `PROVENANCE.json` (rule 7), but the GCF and research-note keys are not in `PROVENANCE.json` yet. That is a change to `PROVENANCE.json`, which is outside my scope.
6. **"Fail outside quotation" is split by scope.** The machinery cannot see a quotation. So each such pattern fails in option labels, which are never quotations, and is a `review` hit in narrator text, where the reviewer's note confirms the quotation.
   - Terms no period speaker could have used fail everywhere: "War of Northern Aggression", "Southern way of life", "Lost Cause", "Black Confederates".
   - Rejected: `fail` in narrator text. It would refuse cited quotations of governors and editors, which SENSITIVE-HISTORY allows.
7. **The two memoirs are `banned` as evidence** (the lead's ruling, 2026-11-16, from trap 6 and section 5). Davis's *Rise and Fall* (`DAVIS-RF`) and Johnston's *Narrative* (`JOHNSTON-1874`) may not be cited by any gated item. A memoir may appear only as its author's attributed view in text, or serve as a lead to a primary document, which is what the item then cites. The `NOTE-*` research-note pointers are `weak`, never sole: `PROVENANCE.json` itself says each is "never the source of a fact". The probe test checks both: a memoir is refused even beside a primary source, and a pointer is refused alone and passes beside one.
8. **Narrow triggers and anachronisms.**
   - `execut(ed)` is left out of the triggers: "the order was executed" would flood A1. `executions?` stays.
   - "Militia Act of 1862" is the anachronism term, not "Militia Act", which would flag the 1795 and 1792 acts that S09 and S13 name.
   - "contrabands" (plural, almost always people) is the anachronism, not "contraband", which would flag contraband of war before 24 May.
   - "Copperhead" is not added: its first date needs a source.

### B.3 Probes (rule 7)

`packs/union-1861/test/gate-register.test.ts` is the probe test.
- **What it probes.** For every pattern of every refused signature (field, field and subject, option id, label), at least one planted case fires and one legal case passes.
- **Two runs.**
  - Through the matchers `checkGate` uses (`signatureRefuses`, and the option and label regexes). Each legal case must pass *every* signature in the register, so it is clean pack-wide.
  - End to end through `checkGate`, with the Union register laid over the testbed and one testbed situation edited per case. Only `gate-refused` at the edited place is read.
- **It also fails if:**
  - a signature has no probes;
  - the self-emancipation protected fields stop refusing a target;
  - a Union situation tagged `fugitive-policy` offers `return` without being listed in `supersededOptions` (so a renamed S17 cannot slip past B10);
  - the held topics change from the three named above.
- **Cases worth seeing:** "Order them returned under the 1850 law" (the catalogue's own wording) is refused as euphemism, and "Return them to slavery" passes. "Ask Congress for authority to enlist Black volunteers" passes, and "Raise two regiments of Black volunteers" is refused. "Produce the prisoner" (Merryman) passes, and "Propose an exchange of prisoners" is held.

### B.4 Sources by topic

The keys are SENSITIVE-HISTORY's.

- `cause-of-secession`: [SW 6.1], [CS 4.1]; 0021.
- `inaugural-slavery-passage`: [SW 6.3]; [MF] row 12; 0042.
- `corwin-amendment`: [SW 6.3, 6.8].
- `war-aims-1861`: [SW 5]. The resolution's wording on slavery is needs-source as a facet.
- `lost-cause-traps`: [CS 4.2, 4.6]; [SW 6.1, 6.2]; [CS 2.1, 2.4, 3.1].
- `self-emancipation`: [SW 6.2, 6.3]; [CS 4.2, 4.3]; 0046. The 500,000 and 200,000 figures are UNVERIFIED [CS 4.3].
- `fugitive-policy`: [SW 6.3]; [UP 1.4]; 0046 (the ruling on `return`).
- `union-freedpeople-camps`: [SW 6.3] (snippets). The topic is needs-source.
- `confederate-enslaved-labour`: [SW 6.3]; [CS 4.2, 4.7].
- `slavery-as-wealth`: [CS 3.3].
- `black-enlistment-1861-offers`: [SW 6.4].
- `union-habeas-and-arrests`: [SW 6.6]; [UP 1.3, 1.5, 4.3]; [GCF 9].
- `press-suppression`: [SW 5, 6.6]; [UP 4.1, 4.3].
- `civilian-deaths-1861`: [SW 6.7]; [UE 5].
- `guerrilla-war-west`: [SW 6.7]; [U62]; [GCF 10].
- `capture-in-battle`: [CM 2.3, P8]; [SW 3.5, 3.6, 4.6]; [GCF 5.1].
- `prisoners-and-exchange`: [GCF 5, 7].

### B.5 For other lanes

- **Lane 1.11 (authors):**
  - The proximity rule is strict for every protected group now registered. A resource word ("recruits", "pool", "stocks", "labour force") within five words of "Black men", "fugitives", "enslaved people" and the rest is an error in any string, as it already was for the nations.
  - S17's `return` label must say "return them to slavery". The catalogue's "Order them returned under the 1850 law" is refused.
  - S17 must have the id `fort_monroe_arrivals`, its option `return`, and the Second Confiscation Act situation the id `confiscation_and_militia_acts`. Those are the ids in `supersededOptions`, and the probe test catches a mismatch.
  - The Pratt Street deaths are their own notice under `civilian-deaths-1861`. S12 is tagged with civil liberties only, and its trigger reads the route's closure, never the deaths notice (B.2, item 2).
  - S13's `accept` stays held until sourced.
- **Lane 1.7:** the protected field ids for the census population and for people who reached Union lines are reserved: `enslaved_population`, `region_enslaved_population`, `reached_union_lines` and `region_reached_union_lines`. Use them, or change the register in the same merge. Any pack-item proposal to a field named for these people as a quantity is refused by pattern in any case.
- **Lane 1.3:** see A's consequences. No pack item may propose a field named `prisoners`, `captives`, `hostages` or `paroled`.
- **The release lane:** `release.json` and `reviewers.json` are still absent, so `releaseProblems` will rightly refuse a Union release until they exist (review-gate-register-it, N2).

---

## C. Draft records for 1B: R6 and R7

*Drafts for the lead, off the critical path. Not in `docs/decisions/`. R1's interim rule and R8 are recorded in 0046 and are not redrafted. R2 is 1B's.*

### C.1 Draft: R6, civilians, guerrilla war and commanders' conduct

# NNNN: Commanders' conduct toward civilians is seat behaviour under the sign rule; reprisals are events, never a choice

Status: draft (lane 1.8, 2026-11-16). Answers SENSITIVE-HISTORY section 4's R6. Places the held facets of `guerrilla-war-west` and `occupation-orders`.

## Context

SENSITIVE-HISTORY holds `guerrilla-war-west` and Mumford (`occupation-orders`) for R6. Since then [GCF 10] has sourced Missouri in detail:
- Frémont's proclamation of 30 August 1861. Its shooting clause was an order, which Lincoln countermanded on 2 September ("no man to be shot under the proclamation without first having my approbation or consent"); his open order of 11 September modified only the emancipation clause.
- Halleck's request for martial law, and Lincoln's grant of 2 December 1861 (martial law and habeas suspension "in your discretion").
- The bridge-burner orders (GO 32, 22 December 1861: "immediately shot"; towns and counties to pay; enslaved people impressed for repairs).
- The commissions: about twenty trials, eight sentences "provisionally mitigated" as hostages for good behaviour.
- The Magoffin sentence, which Lincoln suspended on 25 March 1862.
- The assessments: $10,000 on St. Louis secessionists, and Schofield's $500,000, which Lincoln suspended on 10 December 1862.
- Halleck's GO 2 ("hung as robbers and murderers"); Kirksville (fifteen captured men shot for breaking parole); Merrill's public executions; and Palmyra (ten men shot on 18 October 1862 for an informant not returned).
- Lane's Osceola ("burned to ashes"), and Jennison's men burning forty-two houses.
- Lieber's *Guerrilla Parties*, which left the civil war to "the executive power".

[GCF 10.5] states what the record shows Lincoln doing: who commanded, granting martial-law and habeas authority, reviewing death sentences when someone brought him one, the militia arrangement, and suspending particular orders after petitioners reached him. Kirksville, Merrill and Palmyra were department or district decisions that were never put to him.

**The problem.** The register gives a topic one class. As one topic, `guerrilla-war-west` either refuses its own decision (B4 forbids an atrocity class on a decision), or leaves reprisals outside the sign rule (E7 binds only atrocity classes). That is why the register holds it today.

## Decision

1. **Split the topic.**
   - **`guerrilla-war-west`** (class `guerrilla-war`, not atrocity-class, open), for:
     - derived guerrilla pressure on loyalty and supply (0029);
     - commanders' martial-law, assessment and banishment orders as events from their seats;
     - the president's replies as decisions.
   - **`executions-and-reprisals`** (class `atrocities`), placed `event` and `text` only, for raids on civilians, the burning of towns, and killings of prisoners, civilians and hostages, in Missouri and in occupied cities alike. The cases are Kirksville, Merrill's executions, Palmyra, Osceola, Jennison's burnings and Mumford (item 5). Each is the act of the commander's own seat, with `actingSide` his side, under E7 and D5.
2. **Commanders' conduct is seat behaviour from their pack values, and appointment is not a way round** (0046's sign rule, adopted). A harsh commander's reprisals never lower guerrilla pressure, raise control, or raise any measure of his own side, whoever appointed him. Whether reprisals raised guerrilla pressure historically is a calibration question, needs-source, and never decides the sign.
3. **The president's decisions** each carry locked costs on his own side (B5, 0060). Where they depend on an atrocity they are tainted and `watched` (0063). They are:
   - **The reply to a martial-law order's shooting clause** (Frémont, 2 September 1861): *restrict* (no shooting without the president's consent, the historical reply) or *revoke*. No option upholds it (rule 1). The emancipation clause is R7's.
   - **The grant of martial law and habeas authority to a department** (Halleck, 2 December 1861): a security order under 0046's R8, with the costs of `union-habeas-and-arrests`.
   - **A death sentence brought to him** (Magoffin, March 1862): *suspend for review* or *let it stand*.
     - The terms R3 recommends for the Dakota review apply. The consequences are only the responses of real actors (here, Kentucky's governor and the family who petitioned; the department commander).
     - No option raises any player-facing measure, and both are `watched`.
     - Whether an option to confirm an execution may exist at all goes to the gate reviewer. I recommend it may not exist as a player option: the president's real choice in the record was to suspend or not intervene, and "not intervening" is the `inaction` outcome.
   - **Suspending a commander's assessment or banishment order** after petitions (December 1862): suspend, or let it stand. The costs are on the commander's regard and on Missouri's Unionist bloc.
   - The ordinary verbs (relieve, pressure, an order through the chain) remain the answer to conduct he dislikes. No verb orders, permits or ratifies a reprisal.
4. **What the schema refuses.**
   - No goal posture, raid target or order aimed at civilians. Raids strike rail, river edges and depots (0029).
   - The kernel's goal grammar has no civilian target kind. This needs an architecture test by the lane that builds raids.
   - The register's signatures already refuse reprisal and burning options and labels.
5. **Occupation orders.**
   - Butler's General Order No. 28 and his other New Orleans orders are events from his seat under the sign rule. They carry costs on foreign patience and the press, and they cause Davis's proclamation as an event [GCF 8].
   - **Mumford's execution** (7 June 1862, by a military commission's sentence, Special Orders No. 70) goes under `executions-and-reprisals`. The execution of a civilian by a commander's order may not benefit the acting side, whatever its legal form.
   - The text states the legal form and the dispute (Butler's "by every military rule"; Moore's "MUMFORD THE MARTYR").
6. **Civilian deaths from riots** stay `civilian-deaths-1861` (atrocity-class, events), as registered.
7. **Confederate conduct toward civilians and Unionists** is an event under the interim rule: East Tennessee (needs-source), Shelton Laurel (1863), and the Partisan Ranger Act as a Confederate decision under coercive-policy symmetry. That act authorises bands but orders no atrocity, so it is a decision of the Confederate rule seat with locked costs.

Rejected:
- **One topic with two classes.** It needs a schema change for the same result as two topics.
- **Separate atrocity topics for Missouri and for occupied cities.** The rule is the same in both theatres; one topic keeps one set of signatures.
- **Treating sentences by military commission as lawful and so outside the sign rule.** A harsh occupation would then pay through deterrence, which is the lever rule 1 refuses.
- **A presidential option to confirm an execution.** The record shows him suspending or not intervening, and a confirm option puts a killing on the player's desk.
- **Leaving reprisals to the reviewer's reading.** The sign rule is mechanical once the class is right (rule 7).

## Consequences

- The register splits `guerrilla-war-west`, opens the non-atrocity half, and adds the atrocity-class topic, each with probes.
- SENSITIVE-HISTORY 3.6 is amended to match, and section 4's ship-blocker list is reconciled with the held topics.
- needs-source, for a research lane:
  - the Osceola raid's details beyond Lane's report;
  - East Tennessee's repression in 1861–62;
  - calibration of guerrilla pressure under reprisal;
  - the Missouri sabotage and executions of July 1861 that [SW 6.7] names, beyond its line.

### C.2 Draft: R7, emancipation and fugitive policy from Frémont on

# NNNN: Emancipation decisions move only modelled actors and the people's own terms; no virtue score and no unlock

Status: draft (lane 1.8, 2026-11-16). Answers SENSITIVE-HISTORY section 4's R7 for the decisions after 1A. Builds on 0046, which recorded the ruling on `return` and is not redrafted here.

## Context

The record of decisions, all now sourced: Frémont's emancipation clause (30 August 1861; Lincoln asked a modification on 2 September and ordered it on 11 September) [U62], [GCF 10.1]. Cameron's 8 August 1861 letter applying the Confiscation Act [SW 6.3]. The compensated-emancipation message of 6 March 1862 and the border members' meeting of 10 March; Lincoln's appeal of 12 July and their replies of 14 July [GCF 3.2]. The District of Columbia act of 16 April 1862, with compensation capped at $300 a person to claimants and $100,000 for voluntary colonization, and Lincoln's signing message [GCF 3.1]. Hunter's General Order No. 11 (9 May 1862, revoked 19 May) [U62]. The Second Confiscation Act and the Militia Act of 17 July 1862, signed with the explanatory resolution and the veto message sent anyway [GCF 4]. Colonization: the $500,000 appropriation of 16 July 1862, the meeting of 14 August with a committee of Black men, Chiriquí (ended about 24 September) and Île à Vache [GCF 3.3]. The draft proclamation read on 22 July and the preliminary of 22 September 1862 [U62]; Seward's advice to wait for a victory is "verify".

The risk R7 must meet is two-sided: emancipation as a **virtue button** (a score for the right choice) or as a **cynical unlock** (freedom bought because it pays the player in men or labour).

## Decision

1. **Each is a decision situation through the president or a named holder**, with options in the advisers' terms (0041), locked costs on the decider's own measures on every option (B5, 0060), and consequences only on:
   - **modelled actors:** blocs (Radical, abolitionist, Democratic, border members), border-state loyalty, the foreign clocks, commanders' regard and standing, and the Confederate seat through the events the decision causes (`twenty-slave-law`, `captured-black-soldiers`);
   - **the people's own derived terms:** `self-emancipation` near Union lines, and Black enlistment (R2), each with an agency reason.
   No option adds directly to any player resource (men, labour, money, will). Black enlistment is derived and never a pool (0026). There is no virtue, morality or karma field anywhere (H5).
2. **The decisions and their options:**

| Situation | Options (in the advisers' terms) | What moves (locked, on every outcome) |
|---|---|---|
| Frémont's emancipation clause (S22) | `ask-modify` (ask him to conform it to the Confiscation Act, the historical first step), `order-modify`, `uphold`, `revoke` | Kentucky and border loyalty (Lincoln's "to lose Kentucky", [SW 3.4]) on `uphold`; Radicals and abolitionists on modify and revoke; Frémont's regard on any order; self-emancipation near his lines with the policy known. The shooting clause is R6's. |
| A commander's fugitive practice after the Confiscation Act (Cameron's 8 August letter; later commanders) | as 0046: `approve-holding`, `no-instruction`, `return`, with `return` expiring at the Second Confiscation Act | 0046's terms; each commander's own practice an event from his values |
| Compensated emancipation (S33) | `propose` (the 6 March message), `wait`, and later the `appeal` to the border members (12 July) | border members' bloc and their states' loyalty; Radicals (who saw it as too slow); the money is a fixed appropriation if Congress passes it, never priced per person in any field |
| The District of Columbia act | `sign` (with or without the stated reservation), `veto` | Congress's act is an event; signing moves blocs and the foreign clocks; compensation is the act's fixed sum to claimants (0046's register note); people freed are not counted as a quantity any seat holds |
| Hunter's General Order No. 11 | `revoke` (historical), `let-stand`, `modify` | border loyalty and Democrats on `let-stand`; Radicals and the abolitionist press on `revoke`; Hunter's regard; self-emancipation in his department |
| The Second Confiscation Act | `sign-with-resolution` (historical, with the objections on record), `sign`, `veto` | blocs; the supersession that expires `return` (B10); the act's sec. 9 freedom as Congress's law in text; sec. 11's authority is R2's |
| Colonization | `propose-voluntary` (policy only), `fund-a-scheme`, `decline` | blocs and foreign clocks; every option `watched` (D6). Whether anyone emigrates is Black people's own choice (agency), never sent, counted or priced. Chiriquí and Île à Vache are events and text, with the Central American governments' protests. The 14 August meeting is text, quoted with Douglass's answer attributed |
| The proclamation (S46) | `issue-now`, `wait-for-a-victory` (staff author needs-source), `do-not-issue`, in a chain to the preliminary and the final | border loyalty, Democrats and the 1862 midterms (with `northern-racism-cost` named as racist opposition [UP 3.1]); the foreign clocks (British officials read it as an incitement to servile war, which hardened opinion against intervention [CS 3.1], an attributed reason); the Confederate seat's events; self-emancipation and Black enlistment through their derived terms |

3. **Against the virtue button:** no option text or verdict praises or scolds the player (F5, Q5). The historical choice's display position follows C2. Every option, the emancipating ones included, has a real locked cost on the decider's own side. That cost existed in the record (border loyalty, the midterms, racist opposition), so emancipation is never politically free (`northern-racism-cost`).
4. **Against the cynical unlock:** emancipation's only routes to Union strength run through people's own choices:
   - self-emancipation, a derived term with an agency reason that moves only Confederate capacity and Union reach;
   - enlistment, derived from conditions, pay and treatment (R2).
   Neither is a stock the decision fills, and the lever sweep (D6) watches `return`, colonization and any option whose best play is the worst conduct.
5. **What stays held:** Union camps and plantation labour (`union-freedpeople-camps`, needs-source as a whole); Seward's advice (the staff line's author); and the Crittenden–Johnson wording, which matters only when R7's text quotes it.

Rejected:
- **Emancipation as a single late "proclamation event" with no decisions.** It erases the hardest choices of 1862, which were the president's.
- **Raising Black enlistment or labour directly from the proclamation.** That is the cynical unlock, and it erases the men's own choice (0026).
- **Refusing colonization.** It was Lincoln's stated policy in 1862 [GCF 3.3]. Leaving it out cleans the record. As a policy decision with every option watched, and emigration only by people's own choice, it is not a lever on people.
- **A "moral standing" or legacy measure.** A virtue score in all but name (H5).

## Consequences

- 1B registers `emancipation-policy` (open, decision, derived, event and text) with its refused signatures:
  - emancipation as an unlock that adds to a player resource;
  - re-enslavement or the return of freedpeople as a peace term;
  - colonization options that send or price people.
  Each needs probes like B.3's.
- `northern-racism-cost` is registered with the 1862 situations.
- needs-source: Seward's advice; any article of war of 1862 forbidding returns (not in the notes read); Union plantation policy.

---

## Needs-source, for a research lane

1. Lynde's surrender, 27 July 1861 (Fort Fillmore and San Augustine Springs): date, place, numbers and terms, above all whether the men were paroled.
2. Camp Jackson, 10 May 1861: whether the captured militia were paroled.
3. Fort Sumter, 13–14 April 1861: the terms of surrender (whether the garrison left or was held).
4. Bull Run: the captured share of the 1,216–1,312 Union missing, from a source other than Wikipedia; how many of the 2,600–2,700 Union prisoners in Richmond by November 1861 came from Bull Run.
5. Whether Corcoran was captured at Bull Run (GCF names him only as the lot's first choice).
6. Black men with either army in July 1861 (servants, teamsters) and whether any were taken at Bull Run (R4 proper's question about Black people captured, brought into 1861).
7. The Crittenden–Johnson resolution's wording on slavery (a facet of `war-aims-1861`).
8. A lawful path to direct acceptance of Black volunteers under the 3 May 1861 call (`black-enlistment-1861-offers`, the held `accept`).
9. The first date of "Copperhead".
10. Missouri's sabotage and executions of July 1861 beyond [SW 6.7]'s line; the Osceola raid's details; whether reprisals raised guerrilla pressure (calibration only).
11. East Tennessee's repression in 1861–62.
12. Union camps, labour and conditions for freedpeople (`union-freedpeople-camps`, a whole-topic ship-blocker).
