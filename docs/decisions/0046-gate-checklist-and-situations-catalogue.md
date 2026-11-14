# 0046: The sensitive-history checklist and the situations catalogue are accepted

Status: accepted (2026-11-14). From two design lanes: `docs/design/SENSITIVE-HISTORY.md` (approved by a separate gate reviewer after two rounds of fixes) and `docs/design/SITUATIONS-1861-62.md` (60 situations, March 1861 to December 1862). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Applies 0021 and 0026; amends 0032 and 0040.

## Decision

**The gate.** `docs/design/SENSITIVE-HISTORY.md` is the sensitive-history checklist 0021 asks for, and its topic register places the 1861–62 topics.
- **Placements** are decision, event, derived, text and refused, applied to each facet of a topic, not to the topic as a whole. `record` (held until its own decision record) and needs-source are statuses beside the placement. A needs-source flag on a facet holds only that facet.
- **Two layers.** The mechanical questions are lane 0.7's test specification. The twelve reviewer questions are the checklist people read, which keeps 0021's "short".
- **Sign-off** stores a hash of the item's content, versions each question, and requires a reviewer who is not the author; any edit voids it.
- **Engine and pack.** Rules shared by any war live in the engine; everything specific to a setting (the register, forbidden and trigger words, class flags) lives under `packs/<pack>/gate/` (hard rule 3).
- **Authors follow the checklist's section 3** wherever an earlier research note's gate table differs (Merryman, press suppression, the arrests, the Twenty-Slave Law, Confederate habeas, the 1861 Black enlistment offers, Pratt Street and Camp Jackson).
- **The ship rule.** A scenario cannot ship while a topic in `record` status, or needs-source as a whole topic, overlaps its dates; the slice's ship-blockers are listed in the checklist's section 4. A later-start scenario may omit a gated situation whose moment has passed, but never the topic's derived and text facets.
- **The fugitive "return" option** stays, because refusing it would make the Union cleaner than it was. But the decision placement allows setting policy toward a protected population, never acting on its people as a quantity or resource. The option's costs (the people's response, Radical, abolitionist and foreign reaction) are locked, and it expires when the Second Confiscation Act bars returns.
- **Atrocity-class terms** never benefit the acting side, whoever chose the commander. Appointing a harsh man is not a way around this.
- **The interim Confederate rule** (until a record on a playable Confederacy, R1): a Confederate act touching a protected population or an atrocity class is an event fired by its cause, never the rule seat's choice; coercive policy such as habeas runs on the same machinery as the Union's. This narrows 0009 and 0029 for a seat that is not playable.

**Security orders (amends 0032; the checklist's R8).** Press and mail bans, arrests and habeas policy are issued as situation options, or as standing orders on a post, through a holder. They are never a free-standing verb, so the fixed verb list (0016, FOUNDATION section 5) stands.

**The situations catalogue** is the content inventory lane 0.7's schema must fit, and the source for the March 1861 situations once the gate places them. Its recommended public-demo start, early March 1862, is the working demo scenario (0039, 0040).

**Situations (amends 0040).** From the catalogue's schema pressures:
- **Two triggers.** A situation has an event condition (when the thing happens) and a knowledge condition (when news of it reaches the president); about two thirds of the catalogue needs both.
- **Waiting options.** An option may wait on a condition ("hold it until a victory", "relieve him after the elections"), with that wait as state on the situation.
- **Several options at once, and chains.** A situation may allow more than one option together, and situations may chain in stages.
- **Who writes the staff line.** It is an ordered list of posts; when a post is vacant, or its holder is the subject, it falls to the next.
- **Two kinds.** A decision situation carries the fields 0040 requires; a notice situation (an event or text facet the player doesn't decide) carries text, sources and effects, but no options.

**Owners for new state (hard rule 5).**
- Situation chain and wait state: written by `situations`.
- The Congress accountability ledger (acts taken while Congress was away, owed an answer at the next session): written by `politics`.
- Self-emancipation is a derived term recomputed from Union reach, known policy and pressure within the Confederacy (such as impressment); never a lever for either seat. The lasting result, people who have reached Union lines, is State written by `regions`, proposed by that term.

**Open, as records to write:** R1 a playable Confederacy; R2 Black military service (pay, duty, capture); R3 the wars against Native nations (after research); R4 prisoners and exchange; R5 verdict text; R6 civilians and commanders' conduct; R7 emancipation as policy, including the fugitive ruling above. R2 and R3 block the 1861–62 slice's release.

## Consequences

- FOUNDATION section 7 points to the checklist; section 10 gains the rows above; lane 0.7's brief starts from both documents and this record.
- `docs/OPEN_QUESTIONS.md` carries R1–R7 until each is written.
