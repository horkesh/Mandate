# 0099: The 1A checkpoint bands and the limits of the victory sweep

Status: accepted (2026-11-19). The rulings lane 1.14 Part A left owed. Part A was built by Claude's lane and merged as `a00f2d8`, with Codex's merge of main (`b8501cc`) and the Confederate ceiling (`3c2754b`, R58). Codex drafted this record from the lane's hand-over (R53, under 0096). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amended by 0109 (two floor cases reclassified; relay holds 1–4, filter holds 0–6) and 0111 (pushback measured by named acts; trims 0–3 meanwhile).

## Context

Lane 1.14 Part A builds a harness; Part B calibrates the integrated history run. The source snapshot is `phase1-done-check-1a` at `f6dedeb`: `notes/lane-1.14-done-check.md`, `packs/union-1861/checkpoints.json`, and the harness it names. The lead's initial rulings and G-1.14a to c are in `85c3a37`; G-1.14d and the standing review's corrections are in `63ca901`. Section references below are to that hand-over.

The later source correction is `docs/research/_leads/T2-strengths.md` at `a38470f` (“the three fixes from R44's review”), section 1. Its corrected verdict distinguishes Walker's accepted units from men present and from an upper bound. The hand-over records the lead's instruction to use a labelled inferred ceiling of 200,000, which R58 implemented (`3c2754b`). This record makes no calibration result or new gate acceptance.

## Decision

1. **The bands are authored pack data.** `checkpoints.json` sits beside `pack.json`, outside generated `data/` and outside kernel `WorldRules`. It supplies 16 checkpoints, seven pushback bands and the victory weights, each with a citation. Validation checks references, dates and band order. Pure scorers read observations from a history run, from the scenario start to the last checkpoint, with each government's own war decision and no `--at-war`. Sources: “What is in place,” “Choices made,” item 1, and `159aaaa`.

2. **Historical outcomes and source limits remain explicit.** The checkpoints cover the exact eleven seceded states; border and treaty governments' service sides, including the Restored Government; Washington held throughout; known men; and planned operations fought by each side, at 31 July 1861. The citations identify the numbers note's Priority 1 and appendices, rather than treating all outcomes as a single calibration score. At `f6dedeb` the western Virginia checkpoint still names no department; that absence is reported, not treated as a pass. Sources: `checkpoints.json`; “What it measures on today's main”; `docs/research/2026-11-16-numbers-and-facts-1861.md` as cited by each checkpoint.

3. **The Union men band keeps incompatible measures apart.** Its outward-rounded range is 95,000 to 250,000, with a non-binding lower edge. The note's inferred present-for-duty and enrolled ranges are different measures; a block's men present cannot simply be scored as enrolled men. Falling below the lower edge is reported but does not alone fail that checkpoint. Cameron's 22 June public claim of 250,000 is an upper-edge cross-check, not a return. Sources: “Choices made,” item 3; “Since 85c3a37”; `checkpoints.json`'s `men_union` citation; `63ca901`.

4. **The Confederate ceiling is inferred and revisable [I].** Keep the 100,000 lower edge, which the numbers note rounds outward from Livermore's July estimate of 112,040. The lead later instructs Part B to add a labelled 200,000 ceiling inferred from Walker's 24 July count of 190 regiments and 34 battalions. T2's corrected wording limits the claim: converting those units suggests roughly 200,000–210,000 paper strength [I], but does not prove an upper bound on accepted men or men under arms. Walker separately excludes independent companies, twelve recently called regiments and a 30,000 reserve corps, and many units lacked arms. Davis's 20 July message supplies no troop count. Thus 200,000 is a calibration test ceiling to revisit, never a primary return or established maximum. Sources: “The lead's rulings and the gate review” (the earlier open top), “Where the lane stopped / Owed on resume” (the later lead instruction), and corrected T2 section 1, “What the sources support,” citing OR IV-1 pp. 247–248, 254–255 and 496–497. Implemented in `3c2754b`.

5. **Both sides must fight a planned operation.** The Union band is 1–26; the Confederate band is 1–4, retaining FOUNDATION's requirement for each side. The lower Confederate case is Sumter, on Davis's government's order, which lane 1.12 makes fightable. Upper edges count the researched cases, with the note's inferred or disputed cases disclosed. A drafted operation must execute and fight through the battle model; the operation criterion also checks a loss breakdown whose parts sum. Sources: `checkpoints.json`, `operations_union` and `operations_confederate`; “The lead's rulings and the gate review”; `85c3a37`; `history-run.ts`, `operationsFought` and `operationScore`.

6. **Pushback ranges have sourced floors and design ceilings [I].** Lower bounds count verified record cases. Upper bounds are three times the catalogue's cases of that kind, including its note-only and extra cases, and at least the lower bound plus three. The lead accepted this proposal; it allows for an incomplete catalogue without allowing unlimited pushback. The run counts both sides while the verified floors are Union cases. Sources: “The proposals as made / Pushback upper bounds,” “The lead's rulings and the gate review,” and `checkpoints.json`, whose citations list every counted case.

   | Band | Lower | Upper |
   |---|---:|---:|
   | Relay objections | 0 | 6 |
   | Relay holds | 2 | 6 |
   | Filter holds | 1 | 9 |
   | Trims | 1 | 4 |
   | Compliance with reservations | 1 | 9 |
   | Slow walks | 2 | 9 |
   | Objections to a plan | 10 | 42 |

7. **The sweep maximizes an explicit victory measure [I].** The lead accepted the design weights, with the mandate added by G-1.14c. Every term returns its count and contribution. Capital and government terms count the side's holdings or governments minus those belonging to other sides. Men and ground use the side's permille share above an even split. The mandate is that side's derived mandate above its rest, reading bloc support by voice and framing. Sources: “The proposals as made / The victory measure,” “The lead's rulings and the gate review,” `victory.ts` and `checkpoints.json` at `f6dedeb`; `85c3a37`.

   | Term | Weight |
   |---|---:|
   | Capital | 1,000 per net capital held |
   | Government | 100 per net government on the side |
   | Known men | 1 per permille above an even share |
   | Ground | 1 per permille above an even share |
   | Mandate | 1 per permille above its rest |

   These are design weights, not historical measurements. The original four-term explanation gives a capital more weight than either men or ground alone, and a government one tenth of a capital. Adding the mandate does not establish a new claim that a capital outweighs every possible combined term.

8. **G-1.14a follows the forward route from inaction.** The atrocity-decision finder includes a decision whose inaction can fire an atrocity-class item, directly or through intervening items. It follows decision outcomes, prevention conditions, flags and chain stages. It excludes routes back through that decision's own options. Sources: “The lead's rulings and the gate review,” G-1.14a, and `85c3a37`.

9. **G-1.14b exercises the recruitment consequence.** A fugitive-policy decision is identified by a policy row tagged `fugitive-policy` on an option or its inaction. Each move plays on, up to 400 days, until the recruitment chain is exercised at a border-government post; the border governments come from the pack's government-side checkpoints. Without that event it reports “chain unexercised.” The later correction requires a new levy created by an answer to a call. A transfer or goal at the post cannot satisfy it. Sources: “The lead's rulings and the gate review,” G-1.14b; “Since 85c3a37”; `85c3a37` and `63ca901`.

10. **G-1.14c discloses what the score can measure.** `VICTORY_READS` names government-side proposals and politics' bloc support, framing, ledger acts and answers. Ledger consequences count through the mandate once Congress meets the act, so a move entering an act plays on until that meeting, within the bounded play-on. An effect outside those channels is reported unmeasured and yields no valid D6 evidence for that decision. The mandate term prevents political consequences already in the model from disappearing from the score. Sources: “The lead's rulings and the gate review,” G-1.14c; `victory.ts`; `85c3a37`.

11. **G-1.14d follows indirect channels too.** The coverage check follows policy pushback to `people/grievance` and every flag set or cleared through all readers, to a fixed point. Readers include other situations and pack rules: self-emancipation policy, pressure and protection flags reach `regions/self-emancipation`; war flags reach `seats/war`. The report names each unmeasured channel and its route, labels the decision “measured in part,” and states that no D6 result for it counts as evidence. The hand-over expects S17's people's-response cost to remain in this category until enemy capacity exists in 1B. Sources: “Since 85c3a37,” G-1.14d; `63ca901`.

12. **The sweep's bounds and warnings remain visible.** It weighs each gated decision once per seed, normally plays each move 30 days from its open morning, and extends for the ledger and recruitment waits described above. A tie counts as best because a maximizing bot may choose it. The done check uses eight seeds; its test uses two. Any `floor_unpaid` is a breach. Sources: “Choices made,” items 4–5; “What is in place,” lever-sweep row; the two gate-review sections and `63ca901`'s stopping-rule corrections. Exercising a route is separate from having measured all of its consequences.

13. **Reporting criteria does not claim milestone completion.** Phase 0's six criteria still set the default exit status; `--milestone 1a` makes 1A's six binding. Those are checkpoints, a fought operation, pushback, unknown strength, stand-ins and the lever sweep. The stand-in scan recognizes `STAND-IN(<key>; owner: <lane>)` and reports inherited M2 values. The tick budget includes a timed history run and requires the planner, people and situations to run in a timed sample. Linux CI separately checks that its required stopwatch tests ran and that no tests were skipped. Sources: “What is in place,” “Exit status,” “Choices made,” items 2 and 6, and the Part B instructions. The CI milestone-flag change belongs to Part B.

Rejected:

- Kernel `WorldRules` or generated `data/` as the home for hand-authored checkpoint bands. Source: “Choices made,” item 1.
- Either Union strength bracket alone, or treating the non-binding floor as an exact return. Source: “Choices made,” item 3 and the checkpoint citation.
- Zero as the Confederate planned-operation floor. The lead retains “each side,” including Sumter. Source: `85c3a37` and the corresponding hand-over ruling.
- A pushback ratio to orders before the principals exist, or no upper bound on compliance with reservations. Source: “The proposals as made / Pushback upper bounds.”
- Checkpoint distance or number of planned operations as victory terms, and a separate casualty term when losses already affect men. Source: “The proposals as made / The victory measure.”
- Strictly best moves only, which would hide a watched option tied for best. Source: “Choices made,” item 4.
- A transfer or goal substituting for an answered call's new levy; D6 evidence from only partly measured consequences. Sources: `63ca901` and “Since 85c3a37.”

## Consequences

Part B calibrates design parameters against the sourced bands, rather than fitting the bands to a run. T2's correction requires the Confederate ceiling to retain its inference label and its exclusions. A new historical source can change a band through an explicit ruling; an inconvenient run cannot supply that source.

At this Part A snapshot the Union pack had no gated decisions loaded. G-1.14a to d were wired and tested on fictional fixtures, not exercised on the eventual authored history run. The gate rules, stopping rules and coverage disclosures therefore remain requirements for Part B, not a claim of gate clearance or a completed sweep.

The hand-over assigns Part B the integrated runs after lanes 1.11 and 1.12, eight-seed sweep, calibration within its measured-run budget, war-run timing and separate press-mail count, and the CI milestone flag. The 200,000 ceiling is in the pack as an inferred band, not a historically proved maximum.
