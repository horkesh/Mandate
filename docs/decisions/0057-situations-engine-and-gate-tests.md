# 0057: The situations engine, and the gate as tests

Status: accepted (2026-11-14). From lane 0.7, which built the situations schema, the situations phase of the day tick and the sensitive-history gate's mechanical checks (merged as 87407ae). The gate reviewer and the standing reviewer each approved it after two rounds. The lane's hand-over, `notes/lane-0.7-situations.md`, maps each gate question to its test. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Builds on 0040, 0046 and 0052. Amended by 0060 (every route to an atrocity; a response decision's own costs).

## Decision

**The format.**
- Situations are hand-written JSON, one per file, in a pack's `situations/` folder. They are checked when the pack is generated and when it loads. Nothing derives them, so nothing goes stale.
- Conditions use a closed vocabulary:
  - all, any and not;
  - a day, a flag, fired, decided;
  - knows (a report pattern over a seat's knowledge);
  - a goal, a headquarters, the clock.

**Two triggers.**
- A situation **fires** when its event condition holds in State, and its clock starts then.
- It **surfaces** when its knowledge condition holds over the deciding seat's knowledge, counting only reports received since it fired.
- A notice is a report from an author post through the ordinary report path, so it has a route and a delay.
- The staff line is an advice report from the first author post held by a holder who is not a subject. When no such holder exists, the record says so.

**What the principal must know reads only an allow-list.**
- The knowledge trigger may use only `knows`.
- A waiting option may use `knows` and the clock.
- An option's appear and expire conditions may use `knows`, the clock and dates. A chamber's sitting state joins them once it exists.
- The validator and the kernel guard refuse everything else, `decided` included.
- So the truth may fire a situation, but it never changes what a president is offered.
- A knowledge trigger, or a wait, counts only news since its event or since the wait began. An option condition counts everything the principal holds, so a law he already knows still expires an option.

**Effects.**
- An effect is either a chain flag, applied by `situations`, or a typed proposal to the module that owns the field. It never writes State directly.
- Until those owners exist, proposals are counted in the tick result and not applied.
- Every order an option issues goes out in the principal's name, through the same validated path as his own orders.

**Delegation and the historical default.**
- A delegate decides from the principal's own option set, scored by how far each option honours his values. Delegating moves the choice, never the authority.
- The kernel reads the historical default only for a principal whose seat is on the rules model, in a history run. The default is never shown in a view or a request, and is never logged, because replay reproduces it.

**Sides.**
- Every post a situation names is on its own side. The validator, the kernel guard and the delegate command all refuse another side's holder.

**Atrocities (corrected on gate re-check).**
- No situation or option is an atrocity lever.
- An atrocity-class item names its acting side, and every one of its effects names a side.
- An atrocity-class term may only **lower** the acting side's own measures. Every other side's measures stay unchanged, so no seat gains anything from an atrocity, including through the other side's outrage.
- The rule rests on a convention: every side measure reads higher-is-better for its own side, as the published schema states. When Phase 1 builds the owners of measures (will, pressure clocks, ledgers, grievances), each owner declares its measure's direction, and the check uses that declared direction.

**The gate lives in `pack-format`, and its words live in the pack.**
- The register, triggers, forbidden wording, anachronisms, source policy, checklist versions, release windows and accepted reviewers are pack files. The kernel carries only the tag and sign-off types.
- A sign-off records a content hash. The hash covers the item, the text of every string it shows in every locale, and every source row it cites, so editing a word in any translation voids it.
- Fixture sign-offs load in a draft pack and are ship-blockers at release.
- A release accepts sign-offs only from reviewers listed in the pack, and only for scenarios with release windows.
- A review-severity wording hit needs the reviewer's note in the sign-off.

**Which gate questions are tests.**
- Every mechanical question that has its artefact is a test now, each with a positive control. A sweep that disabled each check site in turn made a test fail every time.
- The reviewer checklist (Q1–Q12) stays with readers.
- Questions whose artefact does not exist yet (levers, derived terms, voice, verdicts) become tests when their artefact is built. The checklist file already carries their versions.

Rejected:
- **CSV sources with a generator for situations.** It needs an invented nesting syntax.
- **One file for all situations.** Every edit would void every diff and every sign-off.
- **An expression language for conditions.** It can't be validated, and a pack could invent predicates the kernel doesn't evaluate.
- **One predicate for firing and surfacing.** Situations would either leak news the president can't have, or start late in history runs.
- **Option conditions over State.** An option that vanishes tells the player a fact no report brought.
- **Effects that set State fields.** That is a second writer for every field a pack touches (hard rule 5).
- **The historical default in a rule seat's request.** It would cross the player-visible boundary (0052).
- **A staff line shown as situation text.** It would have no author, no bias and no credibility.
- **Gate checks in the kernel.** They are load-time validation, and need patterns and string tables the kernel does not read.
- **A pack list of the measure kinds an atrocity may touch.** It is a second vocabulary that an unlisted field would escape.
- **Letting an atrocity raise the other side's outrage.** That is a gain to someone from an atrocity (0046).

## Consequences

- **Open follow-up (G3).** The no-gain check skips effects that name no side. Lane 0.7 closes this on a branch from main, the gate reviewer re-checks it, and it lands before any real atrocity situation is authored.
- **Lane 0.5.** An option's orders go through `issueOrder`. The `goal` and `headquartersAt` conditions read stand-ins and move with them.
- **Lane 0.8.** Waiting, lapse, resurfacing and changing options fire only in kernel tests, because the rule-driven principal takes defaults at once. Lane 0.8 sets their bands in a run that exercises them.
- **Phase 1.** Owners for the proposals (politics, regions, forces) and each measure's declared direction. The lever sweep (D6) once a victory measure exists. Derived-term declarations and verdict templates, which turn their gate questions into tests.
- **The March 1861 situations** wait for:
  - the register's real content: protected fields, protected groups and refused signatures, written by the gate reviewer from `SENSITIVE-HISTORY.md` section 3, with a research lane sourcing the trigger and forbidden lists;
  - the catalogue pressures the schema does not yet carry (P6, P8, P10, P11, P15, P16), each when its owner module exists.
- FOUNDATION section 10's tick order now reads situations' two triggers. In Phase 0 code they run as phase 4b, after control, and later physical phases go before them.
