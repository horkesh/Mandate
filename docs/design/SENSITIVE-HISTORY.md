# Sensitive history: the placement checklist and the 1861–62 topic register

Status: design lane output (2026-11-14), revised after the gate review of the same day; a proposal like everything in `docs/design/`. It is the gate checklist that 0021 places "with the situations schema" and that FOUNDATION section 12 assigns to lane 0.7. It works under 0021 as amended by 0026 (wider scope, the placement rule, Black regiments), and under 0009, 0016, 0022, 0023, 0028, 0029, 0032, 0040, 0041 and 0042. Nothing here is accepted until a decision record accepts it.

History comes only from the research notes, cited as **[CS]** `docs/research/2026-11-14-confederate-side.md`, **[UP]** `2026-11-14-union-politics.md`, **[UE]** `2026-11-14-union-war-economy.md`, **[UN]** `2026-11-14-union-navy.md`, **[SW]** `2026-11-14-secession-winter-1861.md`, **[U62]** `2026-11-14-union-1861-62.md`, and three notes outside the brief's list that I read for one or two facts each: **[MX]** `2026-11-14-map-extent-size-sources.md` (the Dakota War, the slice's end date), **[MF]** `2026-11-14-march-1861-facts.md` (the inaugural's reception) and **[CP]** `2026-11-14-union-command-and-promotion.md` (Butler's removal). **[GCF]** is `2026-11-14-gate-and-catalogue-facts.md`, the research that sourced the gate's needs-source topics after this document was accepted (0046). Situation and option ids (S13, `return`, `ask-congress`) are those of the situations catalogue, `docs/design/SITUATIONS-1861-62.md` on its own branch. A placement that rests on a fact the notes do not source is marked **needs-source**; its authoring is blocked until a research lane sources it. **(added)** marks a topic the brief did not list.

The first slice runs from the inauguration (4 March 1861) to 31 December 1862 [MX]. A topic dated later is placed provisionally and ruled again before it is authored.

**Precedence.** Several research notes carry gate placement tables of their own ([SW 6.8], [CS 4.7], the [UP] gate table). They are inputs. Authors follow section 3 of this document wherever they differ; section 6 lists every known difference.

## How to use this document

Every situation, option, lever, event, derived term, report template, string, setup option and verdict that touches a gate topic:

1. **is tagged** with its topics and its placement from section 1, which must be one the register (section 3) allows;
2. **passes the checklist** (section 2): the twelve reviewer questions, which the author and then the gate reviewer read (2.1), and the test specification, which lane 0.7's tests enforce and nobody needs to read (2.2);
3. **is signed off** by the separate gate reviewer lane (`docs/LANES.md`), against the versions of the questions that apply and the item's content hash, so any later edit voids the sign-off.

The pack loader refuses gate content that skips a step, and a scenario cannot ship while a held topic falls inside its window (section 1, the ship rule).

## 1. The placements

0026 says each sensitive feature is placed, before it is authored, as **modelled with locked consequences**, **narrated only** or **refused**, and asks one question: "Is this a lever?" These five placements refine those three so that a test can tell them apart. Each placement applies to one **facet** of a topic, not to the whole topic: the Fort Monroe arrivals are a derived term, Butler's question is a decision, and a "recapture" verb is refused. Most register entries therefore list several placements and an explicit list of refused facets.

| Placement | 0026 category | What it is | What it permits | What it forbids |
|---|---|---|---|---|
| **decision** | modelled with locked consequences | A situation the president decides, or delegates to a named holder whose seat decides by his values from the same options (0040). Also a standing order through a holder that an option creates (a lever, below). | Options worded per 0041; options that issue orders through people (0040); options that **set policy toward a protected population** (receive or return fugitives, accept or decline volunteers, emancipate); consequences on state; locked costs. | Any option that orders, permits or profits from an atrocity. Any option, verb or effect that **acts on a protected population's people as a quantity or resource** (counts, spends, allocates, recaptures, moves or assigns them). A cost that can be avoided. |
| **event** | modelled with locked consequences | A fixed occurrence that fires when its cause holds in state (or a labelled railroad, 0028 and 0040), or an act of a non-player seat's conduct that nobody on the player's side chooses. Confederate acts follow the interim rule below. | Locked consequences on state; authored reports about it; follow-on situations for the player's reply. | Options. Any consequence that benefits the acting side when the event is atrocity-class (the sign rule below). |
| **derived** | modelled with locked consequences | A term inside a derived quantity (regional capacity, supply, bloc support, national will, foreign patience), computed from state with typed reasons and never stored (hard rules 5 and 6). | Appearing in explanations, reports and the verdict, with its typed reason. Reading protected pack data (for example census figures). | Any verb, option, goal, initiative or setup option that targets it or its protected inputs. A meter, stock or bar the player is invited to raise or spend. |
| **text** | narrated only | Report, press, briefing or quotation text. It changes no state. | Authored reports (0032), the front page, the opening briefing, cited quotations. | Any effect field. |
| **refused** | refused | A facet that is never built, with its reason recorded in the register. | Nothing. Where possible the refusal is a machine-checkable signature (a field name, a target, a verb shape, a force composition). | Any pack item matching the signature. |

Three statuses sit beside the placement, on the topic in the register:
- **Window.** `slice` (inside 4 March 1861 to 31 December 1862) or `later` (provisional: re-ruled before authoring).
- **record.** The topic is held until its own decision record places it (section 4); 0026 forbids authoring before placement. Draft items may live in a drafts folder the runner never loads. The register may give a held topic one **interim placement**, which can only be `text` with citations (no effects): the loader then accepts cited text-only items for it and nothing else.
- **needs-source.** The placement depends on a fact no note sources. The flag sits on what it names: **on a facet, it holds only that facet** (for example Hunter's 1862 regiment within `black-enlistment`, or direct acceptance within `black-enlistment-1861-offers`), and the topic's other facets may be authored; **on a whole topic**, the loader treats the topic as `record` with no interim placement until the flag is cleared.

**The ship rule.** A scenario cannot ship (the release check, not the loader) while any topic in `record` status, or needs-source as a whole topic, has a window overlapping the scenario's dates. A facet-level needs-source flag does not block release; the facet is simply absent until sourced. Section 4 lists the slice's ship-blockers. G1's principle ("leaving the topic out is itself a framing", 0021) applies to the whole slice: a slice that ships silent on the Dakota War or unequal pay would be framing by omission. **A scenario that starts later** (the public demo, 0039 and 0040) may omit a gated *situation* whose moment has passed, but only if the topic's derived terms and text facets are present; it may never omit the whole topic. Emancipation in a demo that starts after September 1862, for example, is present as derived terms, the state of policy and briefing text, even if the proclamation situation itself is not offered.

**The interim Confederate rule** (until the playable-Confederacy record, R1). In the Union game the Confederacy is a rule seat on the same machinery (0009, 0029). Until R1:
- a Confederate act that touches a protected population or an atrocity class is an **event**, fired by its cause, never the rule seat's choice (the Twenty-Slave Law, impressment, the policy on captured Black soldiers, the treaties with Native nations);
- coercive policy that touches neither (habeas suspension, conscription, press and news control) runs on the symmetric machinery: a **decision** of the Confederate rule seat with locked costs, exactly like the Union's equivalent.

**Definitions used throughout.**
- **Locked consequences**: the consequence terms are fixed in pack data; they apply on every use and every outcome; they carry no chance or detection condition (an arrest is not free because nobody noticed); and nothing cancels them. **Cancelling** means: an effect anywhere in the pack whose predicate references this item's or option's id and that targets the same field with the opposite sign. The size of a cost is the reviewer's judgement; its existence and unconditional application are the test's.
- **Lever**: the verb list is fixed (0016, FOUNDATION section 5) and no screen adds to it, so the gate never adds a verb. A gated lever is one of: a situation option that creates a standing order through a holder; a seat-initiative menu entry of a non-player seat (0040); or a standing agreement or prior order on a post (0040). Each runs through a person who can stall, refuse or exceed it.
- **Security orders.** 0032 says the president "can issue or lift security orders such as press and mail bans, as can his commanders", but FOUNDATION section 5's verb table has no such verb. This document rules that security orders (press and mail bans, arrests, habeas policy) are **situation options or standing orders on a post, issued through a holder**, never a free-standing verb. Because that narrows 0032's wording, R8 asks the lead to record it.
- **Protected population**: a group whose people the game must show as agents, never as a resource (0021, 0026). In this pack: enslaved people, freedpeople and refugees from slavery, free Black men and women, Black soldiers and sailors as a category, and Native nations. For a nation that is itself a seat, "protected" forbids pool and resource targeting, not diplomacy toward it (R3 settles the details). The engine knows only the flag; the pack names the groups (rule 3).

**The rules the placements encode.**
1. **An atrocity is never a lever, for anyone** (0026). Massacres of surrendered soldiers, killings of civilians and prisoners, and reprisal killings are events and text only. No seat's option or initiative orders or permits them.
2. **The sign rule.** Any term whose reason is an atrocity-class event or conduct has a non-positive sign on the acting side's measures (will, control, supply, loyalty, foreign patience), whoever chose the man who acted. Appointing a harsh commander is not a way round rule 1: if his reprisals are atrocity-class, their terms cannot help his own side, however the player came to appoint him. Whether reprisals raised guerrilla pressure historically is needs-source for calibration, not for the rule.
3. **Slavery is never managed.** Neither side has a verb, option, stat or stock that acts on enslaved people or their labour as a quantity. Policy toward slavery (confiscation, emancipation, fugitive policy) can be a decision; what people do in response is derived, and its reasons name them as actors.
4. **Coercive state power may be a decision, never a free one.** Habeas suspension, arrests and press suppression were presidential policy; they are decisions or levers with locked costs, run through holders.
5. **Agency is shown as agency.** Black enlistment, Native men's enlistment, self-emancipation, Unionist resistance and Native nations' choices come from those people's choices responding to conditions, never from a pool the player draws on.

## 2. The checklist

The checklist has two layers. The **reviewer checklist** (2.1) is the twelve questions that need a reader: the author answers them, then the gate reviewer. The **test specification** (2.2) holds every question a test can enforce; authors never fill it in, because the loader and lane 0.7's tests do. Question ids (A1, B5 and so on) are stable across both layers; the reviewer questions also list the ids they merge.

Every question is phrased so that **yes passes**. Enforcement kinds in 2.2: **[field]** a required schema field; **[tag]** a required gate tag or a tag/placement match; **[pattern]** a forbidden-wording or anachronism match; **[graph]** a check over effect targets, signs and data flow; **[arch]** an architecture test on code; **[hash]** a content-hash comparison; **[run]** a seeded run that compares outcomes.

### 2.1 The reviewer checklist (twelve questions)

| ID | Question | Merges | Backed by a test |
|---|---|---|---|
| Q1 | Is every historical claim cited to a source row that says what the item says, and is every number the sources dispute (the dead, the arrested) shown as a range? | A5, F4 | A5, F4: citations resolve; disputed numbers stored as ranges |
| Q2 | Is the `inaction` outcome costed like the options, so ignoring the situation is not a way round the gate? | B6 | — |
| Q3 | Where enslaved, freed, Black or Native people act, are they the subject of the sentence, and is their act worded as theirs ("people freed themselves"), not as the enslaver's loss ("labour lost")? | B8, E6 | E3: agency reason types |
| Q4 | Is each option label in the advisers' own terms, matching the holders named in `proposedBy`? | C1 | C1: `proposedBy` present |
| Q5 | Is no option label a moral verdict, and does no narrator text praise or scold the player? | C4, F5 | C4, F5: pattern lists |
| Q6 | If an option would return people to slavery or keep them from freedom, does it say so plainly ("return them to slavery"), with no euphemism such as "restore property" or "under the law" alone? | C5 | — |
| Q7 | "Is this a lever?" Does no benefit depend on an atrocity having happened, and is the historically worst conduct not the best play for a player who wants only to win? The reviewer marks the options to watch and reads the sweep. | D5, D6 | D5 (graph), D6 (the lever sweep, a run) |
| Q8 | If the other side holds the analogous lever, does it carry costs of the same kind (0009)? | D7 | — |
| Q9 | Is every quotation cited, attributed and short, and does any period racist language appear only inside such a quotation, with a reviewer note? | F3 | F3: quotation fields |
| Q10 | Does a historical person's voice stay within views the pack cites for him, so that Lost Cause or racist views are his, attributed, and never the game's? | F8 | — |
| Q11 | Does every verdict in which the Confederacy is not defeated carry, correctly worded, what the Confederacy was founded to protect (quoted from its constitution or declarations) and slavery's status in the game's state at the end, predicting nothing about the peace (0026)? Does the Union-victory verdict carry the slavery-status clause and, when non-zero, self-emancipation and Black military service among its terms, without crediting the president alone with freedom? | H2, H3 | H2, H3: required clause ids present |
| Q12 | Does no verdict explain the outcome with a disputed thesis ("the feuds lost it", "a failure of will", "overwhelming numbers alone") [CS 2.4, 4.6]? | H4 | H4: pattern list |

### 2.2 The test specification

The mechanical questions, and the mechanical halves of the questions merged into 2.1. Lane 0.7 writes one test per row group (section 5 maps them).

**A. Every gated item**

| ID | Question | Kind |
|---|---|---|
| A1 | Does the item carry a gate tag naming at least one register topic and one placement whenever its strings match the trigger rules or its effects touch a protected field? An untagged match fails unless the item carries `gate: none` with a reason and a reviewer sign-off. | [tag] |
| A2 | Is the item's placement one the register allows for each topic it names (or the topic's interim placement, if the topic is held)? | [tag] |
| A3 | Is no named topic held (`record` without an interim placement, or needs-source)? | [tag] |
| A4 | Is each topic's window open on the item's earliest in-game date? | [field] |
| A5 | Does every historical claim cite a source in the pack's sources table? | [field] |
| A6 | Does no claim rest solely on a source the pack's source policy bans or marks weak (Davis's *Rise and Fall* and Johnston's *Narrative* are advocacy [CS 4.6]; snippet-only citations are leads, not facts [UE])? | [field] |
| A7 | Is there a sign-off by a reviewer who is not the item's author, recording the current versions of the questions that apply and the item's current content hash? | [hash] |
| A8 | (Release check.) Does no topic in `record` status, or needs-source as a whole topic, have a window overlapping the scenario being shipped? (Facet-level needs-source flags do not count.) | [field] |

**B. Situations**

| ID | Question | Kind |
|---|---|---|
| B1 | Does it have a cause predicate, options, an `inaction` outcome, a historical default and an authored staff recommendation (0023, 0040)? | [field] |
| B2 | Is its cause in state, not a date alone, unless it is a labelled railroad (0028, 0040)? | [field] |
| B3 | Does every option act as policy or through people, with no effect targeting a protected population's people, a protected field or a resource fed by either? | [graph] |
| B4 | Is no option tagged with an atrocity-class topic? | [tag] |
| B5 | Does every option tagged `decision` carry non-empty locked costs, with no chance or detection condition, and does no effect cancel them (as defined in section 1)? | [field] [graph] |
| B7 | Does a delegate decide from the same option set as the president (0040)? | [field] |
| B9 | Is the historical default never shown to the player and never read by the presenter (0040, 0041)? | [arch] |
| B10 | Does an option that a later law forbids carry an `expiresWhen` keyed to that law's event (for example `return` and the Second Confiscation Act)? The register lists such options. | [field] |

**C. Option wording (0041)**

| ID | Question | Kind |
|---|---|---|
| C1 | Does each option name its proponents in `proposedBy` (holder ids, or `inaction`)? | [field] |
| C2 | Are options listed by a neutral display key (the order advisers raised them)? Across the pack's gated situations with three or more options, does no single display position hold the historical default in more than half of them? | [arch] [run] |
| C3 | Is the label free of hindsight wording and of terms dated after the situation (the anachronism list)? | [pattern] |
| C4 | Is the label free of the moral-verdict pattern list? | [pattern] |

**D. Levers (standing orders, seat initiatives, post policies)**

| ID | Question | Kind |
|---|---|---|
| D1 | Does it name a holder who can stall, refuse or exceed it (0023, hard rule 1)? | [field] |
| D2 | Do its locked costs apply on every use, whatever the outcome and whether or not anyone noticed? | [field] |
| D3 | Does it target no protected population's people, no protected field, and feed no player-spendable resource from one? | [graph] |
| D4 | Does no lever exist for an atrocity-class topic, for any seat? | [tag] |
| D5 | Is no positive effect for any seat conditioned on an atrocity-class event or conduct? | [graph] |
| D6 | **The lever sweep.** In seeded history runs, a victory-only bot takes each gated decision in turn while every other seat plays its rules. Is no option the reviewer has marked `watched` (the historically worst conduct, such as `return`) the bot's best choice in more than a quarter of the seeds? A flag goes to the reviewer (Q7), who rules whether the costs are wrong. | [run] |

**E. Derived consequences**

| ID | Question | Kind |
|---|---|---|
| E1 | Is it computed from state with typed reasons and never stored (hard rules 5 and 6)? | [arch] |
| E2 | Does no verb, option, goal, initiative or setup option target it or its protected inputs? | [graph] |
| E3 | For topics whose class carries `requiresAgencyReason` in the pack, is its reason type one of the register's agency types (for example `agency:self-emancipation`)? | [field] |
| E4 | Is it absent from the meter registry, so it is never drawn as a stock or bar to raise or spend? | [arch] |
| E5 | When non-zero, does it appear in the explanation of each quantity it moves? | [run] |
| E7 | **The sign rule.** Does every term whose reason is an atrocity-class event or conduct carry a non-positive sign on the acting side's will, control, supply, loyalty and foreign patience, whoever appointed the actor? | [graph] [run] |

**F. Reports, press and other text** (including the briefing, voice templates and generated voice)

| ID | Question | Kind |
|---|---|---|
| F1 | Does the text have an author and a route (0032)? | [field] |
| F2 | Outside cited quotations, is it free of the forbidden patterns (Lost Cause wording; resource words within five tokens of a protected-group term from the register; slurs)? | [pattern] |
| F3 | Does every quotation carry a speaker and a citation? | [field] |
| F4 | Is every disputed number stored as a range `[low, high]` with citations? | [field] |
| F5 | Is narrator text free of the praise-and-scold pattern list (second-person evaluations)? | [pattern] |
| F6 | Is it free of terms dated after its earliest display date? | [pattern] |
| F7 | For generated voice (0022): does the request carry the gate tag, and does the template fallback pass F1–F6? | [field] |

**G. Setup options and scenarios**

| ID | Question | Kind |
|---|---|---|
| G1 | Does no setup option remove, soften or toggle a gate topic, its consequences or the war's cause? Leaving the topic out is itself a framing (0021). | [graph] |
| G2 | Does no setup option vary a premise item, including the inaugural (0042)? | [field] |
| G3 | Do the history modes (history's shadow, as history, unknown men) change only people's stats, never gate facts? | [graph] |
| G4 | Does any presentation option (for example hiding quoted period slurs behind a note) leave the state hash of a seeded run unchanged? | [run] |
| G5 | If a scenario omits a gated situation whose window it starts after, are that topic's derived terms and text facets present? | [field] |

**H. Victory and defeat text**

| ID | Question | Kind |
|---|---|---|
| H1 | Does every verdict say which will broke and why, with typed terms, including slavery-related terms when they are non-zero (0028)? | [run] |
| H2 | Does every verdict template for an outcome in which the Confederacy is not defeated include the required clause ids for founding aims and slavery's status? | [field] |
| H3 | Does the Union-victory verdict template include the slavery-status clause id and the agency terms? | [field] |
| H4 | Is verdict text free of the disputed-thesis pattern list? | [pattern] |
| H5 | Does the schema have no virtue, morality or karma field to grade the player with? | [field] |

Count: the first version had 51 questions (34 mechanical, 17 for a reader; its report said 48 in error). The review added four mechanical questions (A8, B10, E7, G5) and gave D6 a run check. The reader's 17 merge into the twelve of 2.1; no question was dropped.

## 3. The topic register, 1861–62

Each entry gives the window, the placement of each facet, the refused facets, the reasons, the risks and the sources. Risk tags: **lost-cause** (Lost Cause framing), **scoring** (moral scoring), **hindsight** (hindsight leaks), **atrocity** (gamifying atrocity), **agency** (erasing agency), **resource** (people treated as a resource; added, since it is the core of 0021).

### 3.1 The cause, the premise and wording

**`cause-of-secession`** (added). Window: slice (premise).
- *text*: the seceded states' declarations (South Carolina, Mississippi, Georgia, Texas), the Confederate constitution's slavery clauses and Stephens's "Cornerstone" speech, quoted with citations in the opening briefing and in Confederate-side press as they arrive (the constitution 11 March, Cornerstone 21 March 1861) [SW 6.1], [CS 4.1].
- *event*: the starting framing values the pack sets from these and the inaugural (0042).
- *refused*: any text, option or setup naming "states' rights" as the cause; any option that relitigates the cause.
- Reasons: 0021; the sources are plain. For Virginia and the upper South the narrator says they left over the call to arms against fellow slaveholding states after the Deep South left over slavery [SW 6.1, interpretation].
- Risks: lost-cause.

**`inaugural-slavery-passage`** (0042). Window: premise (4 March 1861).
- *event*: fixed, already given. The pack sets starting framing, border-state loyalty and Northern opinion from the address and its mixed reception, with citations (0042; [MF] row 12).
- *text*: the passage disclaiming any purpose to interfere with slavery in the states, and the remark on a Corwin-type amendment, quoted in the opening briefing [SW 6.3].
- *refused*: a tone option on the setup screen; a live situation on 4 March (both rejected by 0042). If the prologue that 0042 leaves open is ever built, the slavery passage stays fixed in it: varying it would score the player morally or leak hindsight, the reason 0042 gives.
- Risks: scoring, hindsight.

**`corwin-amendment`** (added). Window: slice (passed 2 March 1861).
- *text* only [SW 6.3, 6.8].
- *refused*: any option that offers it as a bargaining chip or a peace term (it would make slavery a cost-free chip).
- Risks: resource, lost-cause.

**`war-aims-1861`** (added in review). Window: slice (the special session, 4 July to 6 August 1861; the Crittenden–Johnson resolution passed the House on 22 July and the Senate on 25 July [SW 5]).
- *decision*: the catalogue's S20 option `ask-war-footing-and-aims` ("ask for the same, and state the war's aims"), with locked costs on the blocs the stated aims offend. The aims it may state are those the period's advisers argued in that week, and the 4 July message's own terms ("essentially a people's contest", to "elevate the condition of men" [SW 5]) are the sourced baseline.
- *text*: the Crittenden–Johnson resolution as Congress's act. Its wording on slavery is not in the notes: needs-source before any text quotes or summarises it.
- *refused*: an aims option that names a policy no adviser in the pack argued that week (it would leak what the war became); any aims option that scores the player.
- Risks: hindsight, scoring.

**`neutral-option-wording`** (0041). A rule, not a topic: questions C1–C4 and Q4–Q6 apply to every gated situation. Labels in the advisers' own terms, in a fixed order unrelated to the historical default. The Sumter label "provision only, with notice" is the walkthrough's example of a leak (`FIRST-MONTH.md`, findings).

### 3.2 Slavery, self-emancipation and Union policy

**`self-emancipation`**. Window: slice, from the night of 23 May 1861 (Baker, Townsend and Mallory reach Fort Monroe) [SW 6.3].
- *derived*: a term in Confederate regional capacity and supply, with reason type `agency:self-emancipation`. It has two kinds of cause, so that it is the people's agency and not a Union output: (1) **resistance and flight within the Confederacy**, not keyed to Union reach: escape from impressment and the disruption it caused [CS 4.2], and resistance by people who never reached Union lines [CS 4.3, McCurry]; Confederate commanders ordering enslaved people moved from threatened areas [CS 4.3] is the Confederate response it causes; (2) **flight to Union lines**, scaled by the reach of Union lines and forces and by known Union policy (see `fugitive-policy`). It reads the census population of enslaved people as protected pack data [SW 6.2]; it never writes it.
- *event*: named arrivals at Union posts (the three men; about 900 people at Fort Monroe by 30 July [SW 6.3]), each able to raise a policy situation.
- *refused*: any verb, option or initiative for either side to encourage, entice, prevent, recapture, count or spend it; any Union gain stock of "labour" or "men" fed by it; a "suppress insurrection" action [SW 6.8].
- Reasons: 0021 and 0026; [CS 4.3] reads this as the Confederate economy's central weakness and says neither seat may manage or prevent it. Calibration waits on sources: the 500,000 and 200,000 figures are UNVERIFIED [CS 4.3].
- Change from the brief's proposal ("a derived loss only, never a lever"): kept as derived and never a lever, but it also causes Union policy decisions, it has a cause independent of Union action, and its reason text is the people's act, never a line in the enslaver's ledger (Q3). It is not a Union gain either.
- Risks: agency, resource, scoring.

**`fugitive-policy`** (added; the gate's first worked case, catalogue S17). Window: slice, until the Second Confiscation Act (17 July 1862), which barred the army from returning fugitives [UP 1.4].
- *decision*: Butler's question of 27 May 1861 (catalogue S17: `approve-holding`, `no-instruction`, `return`), historical default Cameron's approval of 30 May with status reserved [SW 6.3]. Later replies follow the same pattern (Cameron's 8 August letter applying the Confiscation Act [SW 6.3]).
- **The ruling on `return`.** The option stays. Refusing it would make the Union cleaner than it was: the 1850 Act was law, the inaugural accepted the fugitive clause, and officers went on returning people [SW 6.3]. It is allowed because it **sets policy toward a protected population**; it does not act on the three men as a quantity (no count, stock or allocation of people exists for it to move). Its terms:
  1. *Locked consequences*: the people's response (the self-emancipation term near that commander's lines falls as the policy becomes known, so the Confederacy keeps the labour Butler wanted to deny it [SW 6.3]); the Radical and abolitionist blocs; the foreign clocks. The border-state gain it buys is real, which is why 2 and 4 apply.
  2. *The lever sweep* (D6, Q7): `return` is a `watched` option; if a victory-only bot finds it best in more than a quarter of seeds, the costs are wrong.
  3. *Expiry* (B10): `expiresWhen` the Second Confiscation Act is in state.
  4. *Wording* (Q6): the label says "return them to slavery", in the advisers' terms; "order them returned under the 1850 law" alone is not enough.
  5. The ruling goes to R7 so the lead records it.
- *decision* (`approve-holding`): Cameron's "employ them and keep account" [SW 6.3] feeds no resource (D3); see `union-freedpeople-camps`.
- *event*: a commander's standing practice toward fugitives, from his pack data and values (McClellan's 26 May 1861 proclamation promised no interference with slavery and to "crush any attempt at insurrection" [SW 6.3]), with locked consequences on border loyalty and on the self-emancipation term near his lines. This is also S17's `inaction` outcome: each commander decides.
- *text*: the First Confiscation Act (6 August 1861) as the loss of a claimant's "claim to such labor", not a grant of freedom [SW 6.3], [UP 1.4].
- *refused*: euphemism for return (Q6); the insurrection action [SW 6.8]; any option that recaptures, counts or moves the people as such.
- Risks: agency, lost-cause, scoring.

**`union-freedpeople-camps`** (added in review). Window: slice. Needs-source.
- What the notes hold: Cameron's instruction to employ the people at Fort Monroe and keep account [SW 6.3]; refugees arriving at Alexandria through 1861 and Camp Barker in Washington in 1862 (snippets) [SW 6.3]. Union camps, labour and conditions are otherwise unresearched.
- Interim: nothing authored; the topic is needs-source.
- *refused*: any Union labour stock or resource fed by freedpeople; any lever that assigns their labour.
- Risks: resource, agency.

**`emancipation-policy`**. Window: slice (the proclamation of 1 January 1863 is later).
- *decision*, one situation each, every one with locked consequences on blocs, border loyalty and the foreign clocks:
  - Frémont's proclamation of 30 August 1861, issued without notifying Lincoln (modify, revoke, uphold); Lincoln asked him to modify it on 2 September and ordered it on 11 September [U62].
  - Compensated emancipation, proposed 6 March 1862; the border congressmen objected on 10 March [U62].
  - Hunter's General Order No. 11 of 9 May 1862, revoked 19 May [U62], [CS 4.3].
  - The Second Confiscation Act, 17 July 1862, which Lincoln signed after an explanatory resolution, sending his prepared veto message anyway [UP 1.4].
  - When and whether to issue a proclamation: the draft read to the cabinet on 22 July, the preliminary proclamation of 22 September 1862 [U62], [CS 4.3]. Seward's advice to wait for a victory is "verify" in [U62], so the staff recommendation's author and reasons are needs-source.
- *derived*: its effects on the self-emancipation term, on Black enlistment and on Confederate will ("emancipation's effects", 0028); British officials read the proclamation as an incitement to servile war that hardened opinion against intervention [CS 3.1], which is a foreign-clock term with that reason.
- *event*: the Confederate replies it causes (`twenty-slave-law`, `captured-black-soldiers`).
- *text*: Greeley's "Prayer of Twenty Millions" (19–20 August 1862) and Lincoln's reply [UP 2.1], [U62]; McClellan's Harrison's Landing letter (7–8 July 1862) as his advice, in his voice [U62].
- *refused*: emancipation as an unlock that adds to a player resource; any virtue score; re-enslavement or the return of freedpeople as a peace term.
- Sourced since acceptance [GCF]: emancipation in the District of Columbia (the act of April 1862, its terms and compensation) and the 1862 colonization proposals and their funding. The facet flags are lifted. They are placed like this entry's other acts: Congress's act is an *event*, and the president's choices (to sign, and his colonization proposals) are *decisions* with locked consequences, which R7 settles with the rest. Limits on those decisions: colonization is a decision only as policy. Whether anyone emigrates is Black people's own choice, and no option may send, count or price people. The Chiriquí and Île à Vache schemes are events and text. Every option carries locked costs and the `watched` flag (D6). The DC act's compensation is a fixed sum, never so much per person.
- Reasons: these are the president's own decisions in the record, so refusing them would erase the hardest choices of 1862. R7 settles how the consequences avoid both a karma button and a cynical unlock.
- Risks: scoring, hindsight, agency.

**`northern-racism-cost`** (added). Window: slice.
- *derived*: the bloc reaction to emancipation and Black enlistment includes racist opposition; the 1862 midterm causes include fear of freed Black labour and racist campaigning over the proclamation [UP 3.1]. The reason text names it as racist opposition.
- *text*: press reports describe a paper's racist campaign; they do not reproduce slurs (F2, Q9).
- *refused*: a neutral "economic concern" framing of it; slurs in templates.
- Reasons: the cost was real and leaving it out would make emancipation politically free; naming it plainly keeps the game from laundering it.
- Risks: lost-cause, agency.

**`confederate-enslaved-labour`** (impressment). Window: slice for informal use; the Impressment Act of 26 March 1863 and the 1864 requisition of 20,000 workers are later [CS 4.2], [CS 3.4].
- *text* (slice): Confederate use of enslaved workers on the Sewell's Point works and the Charleston batteries, from Confederate payrolls (snippet) [SW 6.3]; Butler's own stated reason in his reports, that denying the Confederacy this labour was a military necessity [SW 6.3].
- *event* (later, under the interim Confederate rule): the Impressment Act and the 1864 requisition, with locked consequences: escapes (the people's agency [CS 4.2]), owners' protests, harvest losses [CS 4.7].
- *derived*: no separate stat. Escapes from impressment count in `self-emancipation`, cause (1).
- *refused*: a verb for either side; any field counting enslaved labour as a resource (a refused-facet signature on field names); the census population is protected input, read only by derivations.
- The brief's proposal (no verb, no labour stat) stands.
- Risks: resource, agency.

**`slavery-as-wealth`** (added). Window: slice.
- *text*: the economists' account that Confederate wealth lay in land and enslaved people, which were illiquid [CS 3.3], appears only attributed and never alone, as the note warns.
- *refused*: any finance term that values enslaved people.
- Risks: resource.

### 3.3 Black military service

**`black-enlistment-1861-offers`**. Window: slice (April 1861 on; catalogue S13).
- *event*: offers arrive as men's own acts: a Boston meeting, two regiments organised in Philadelphia, a Providence company, Jacob Dodson's offer of 300 men in Washington (23 April, snippet) [SW 6.4].
- *decision*: the catalogue's S13 options: `decline` (under the militia law), `refer-governors`, and `ask-congress`, which appears when Congress sits (4 July). **Acceptance runs through `ask-congress`**: the president asks Congress for authority, and regiments form through `black-enlistment` if Congress grants it. Locked costs: border-state loyalty, which Lincoln feared [SW 6.4], on asking; the Radical bloc and abolitionists on declining.
- needs-source: a direct acceptance by the president under the 3 May 1861 call. The only legal basis in the notes is that the exclusion "rested more on policy than statute" [SW 6.4], which is not enough to author an option. If a research lane sources a lawful path, an `accept` option may be added.
- *refused*: a recruit verb.
- Reasons: routing acceptance through Congress keeps the policy choice the record shows Lincoln faced without resting it on one line, and slows the hindsight play of a player who knows what Black regiments later meant (Q7 and the lever sweep watch it).
- Risks: agency, resource, hindsight.

**`black-enlistment`**. Window: slice.
- *decision*: Cameron's report of late 1861 proposing to arm freed slaves, whose passage Lincoln cut in December 1861 (let it stand, strike it) [SW 6.4], [UE finding 5]; [U62] says Stanton reportedly drafted it. The Militia Act of 17 July 1862, the first law to admit Black men to the militia [UE 2.1], is a decision if Congress's bills are modelled as decisions, otherwise an event.
- *derived*: enlistment by free Black men and freedpeople, responding to policy, pay, treatment, Confederate capture policy and the reach of Union lines; never a pool in "men" (0026). The total of 178,895 Black troops [UE finding 3] is a calibration band for history runs, not a target.
- *refused*: a recruitment verb or rate dial; any pool; a goal or transfer field that selects forces by race; Black regiments as a reserve of labour the player assigns.
- needs-source: Hunter's 1862 regiment in South Carolina (the notes give only his emancipation order).
- Risks: resource, agency, scoring.

**`black-soldiers-pay`**. Window: slice (the Militia Act, 17 July 1862) to 15 June 1864.
- Status: `record` (R2), with interim placement *text*: the pay, $10 a month less $3 for clothing against $13 for white soldiers [UE finding 3], in cited text only.
- Correction to the brief: the brief says 0026 requires its own record. 0026 does not say so; the economy note recommends it [UE finding 3]. I adopt the recommendation.
- Under the ship rule the slice cannot ship until R2 exists.
- Risks: resource (the gap as a saving), agency.

**`black-sailors`**. Window: slice, from September 1861.
- *decision*: the Navy Department's policy of letting refugees enlist, held by Welles's seat by default; the player can order it through Welles [UN 1].
- *derived*: enlistment by the men's own choice. The navy works through posts and models no crews (0028), so today this is *text*; it becomes derived only if crews are ever modelled.
- *text*: about 10,000 Black sailors, about 17 percent of the navy's sailors [UN 1]. That the navy took freedpeople before the army is the note's interpretation [UN, findings].
- *refused*: a navy recruitment pool.
- Risks: agency, resource.

**`captured-black-soldiers`**. Window: slice for Seddon's instruction of 30 November 1862 and Davis's proclamation of 23 December 1862 (General Orders No. 111, 24 December); later for the January 1863 message, the joint resolution of 1 May 1863, the 54th Massachusetts captives, Lincoln's retaliation order of 30 July 1863 and the 1864–65 concessions [CS 4.4].
- *event* (interim Confederate rule): the Confederate acts, with locked consequences on Union opinion and on Black enlistment. The proclamation named Butler's conduct at New Orleans as its reason [CS 4.4], [CS findings 5].
- *text*: the proclamation, quoted and cited.
- *refused*: an execute or enslave option for any seat; any Union gain conditional on it (D5).
- Retaliation is held for R4.
- Risks: atrocity, agency.

### 3.4 The Confederate side

**`twenty-slave-law`**. Window: slice (11 October 1862).
- *event* (interim Confederate rule: it touches a protected population): fires when Confederate conscription and the preliminary proclamation are both in state. Locked consequences: resentment among non-slaveholders ("rich man's war") in Confederate bloc terms; Escott's breach between planters and non-slaveholders is disputed, so the size is a band [CS 3.4].
- *text*: states the law's motive as its supporters gave it: keeping the enslaved labouring and controlled after the preliminary proclamation [CS 3.4].
- *refused*: a neutral "overseer exemption" framing [CS 4.7]; a Union lever that exploits it.
- Risks: lost-cause, resource.

**`confederate-habeas`**. Window: slice (Davis's suspensions; [CS 6] gave February 1862 and February 1864 without a primary source; [GCF] verifies the 1862 suspensions).
- *decision* for the Confederate rule seat (interim Confederate rule: coercive policy on the symmetric machinery), with locked costs on governors' friction (Vance's repeated habeas disputes, North Carolina courts' writs that the War Secretary refused, opposition by state leaders and some mobs) [CS 3.5, 4.5].
- Sourced since acceptance [GCF]: the dates, places and terms of every 1862 suspension, and the three acts. The whole-topic flag is lifted, so the topic leaves section 4's ship-blockers.
- *refused*: framing the friction as "states' rights" apart from slavery [CS 3.5, 4.6].
- Risks: lost-cause.

**`unionist-repression`**. Window: later for Shelton Laurel (January or February 1863; the source says February) [CS 4.5]; East Tennessee in 1861–62 is needs-source (not researched [CS 4.5]).
- *event*: repression and killings of Unionists, from the acting commanders' and units' conduct, with locked consequences on regional loyalty and Confederate will under the sign rule. Vance's investigation is text [CS 4.5].
- *derived*: Unionist loyalty as a regional term; [CS 4.7] recommends Unionists as a bloc.
- *refused*: any option or initiative for any seat to order or permit reprisal killings; any Union gain conditional on the massacre. Lincoln's wish to occupy East Tennessee [U62] is an ordinary goal and is not gated.
- Risks: atrocity, agency.

**`bread-riots`**. Window: later (Richmond, 2 April 1863, about 5,000 people, mostly poor women; one of a series) [CS 3.4].
- *event*: a Confederate will term for home-front hardship, with women as political actors.
- *decision* (interim Confederate rule: news control is coercive policy): the government's suppression of news of the riots [CS 4.5], a Confederate rule-seat decision with locked costs.
- *refused*: a Union lever.
- needs-source: both facts are snippet-only [CS 3.4, 4.5].
- Risks: agency.

**`confederate-arming-enslaved`** (added). Window: later (Cleburne's memorandum December 1863; the law Davis signed on 13 March 1865; no enslaved man accepted) [CS 4.4].
- *text* only.
- *refused*: a pool in any resource; Black soldiers in Confederate force data (trap 3 below).
- Risks: lost-cause, resource.

**`lost-cause-traps`**. The six traps in [CS 4.6], plus three from the other notes and the review. Each becomes a refused framing with a check:

| Trap | Refused framing | Check |
|---|---|---|
| 1. "The feuds lost it" | Narrator or verdict text claiming that Richmond's dysfunction explains the outcome. Davis's feuds have mechanical effects without the game asserting the thesis (Woodworth against Gallagher) [CS 1.1, 4.6]. | Q12, H4; reviewer on Confederate text |
| 2. "States' rights" | The phrase as the cause of secession or of the Confederacy's difficulties. Governors' friction is described as what it was: conscription, impressment, habeas and the exemption of enslavers [CS 3.5]. | F2 pattern (fails outside cited quotation) |
| 3. "Black Confederates" | Black men as willing soldiers in Confederate ranks. They appear only as coerced labourers and body servants [CS 4.2]; no credible evidence of significant numbers fighting [CS 4.6]. | A refused-facet signature on Confederate force composition, read by the generic refused-signature test; F2 pattern |
| 4. "Loyal slaves" | Enslaved people loyal to the Confederacy. | F2 pattern; no loyalty value for any protected population |
| 5. Lee-centrism | Lee as the Confederacy's moral centre [CS 4.6]. | Reviewer |
| 6. Memoir sources | Davis's *Rise and Fall* (1881) or Johnston's *Narrative* (1874) as evidence [CS 4.6]. | A6 source policy |
| 7. (added) "Coercion" as narrator framing | Virginia and the upper South "leaving over coercion" in the narrator's voice; governors' quotations may say it [SW 6.1]. | F2 review pattern |
| 8. (added) "Servile war" or "racial war" as narrator framing | The British reading of the proclamation [CS 3.1] and the "fears of racial war" in Gallagher's list [CS 2.1] appear only as attributed contemporary or scholarly views. | F2 review pattern |
| 9. (added in review) "The South" as the white South | "The South" or "Southerners" in narrator text meaning only the Confederacy or white Southerners, which erases about 3.5 million enslaved people in the seceded states [SW 6.2]. Narrator text says "the Confederacy", "Confederates" or "white Southerners" when it means them. | F2 review pattern |

### 3.5 Civil liberties and public violence

**`union-habeas-and-arrests`**. Window: slice (the 1863 act is later).
- *decision*: the habeas order of 27 April 1861 (catalogue S12); the answer to Merryman (comply, decline and defend, ask Congress; catalogue S18) [SW 6.6]; the standing arrest policy as a security order on a post, issued through its holder (Seward's State Department ran the 1861 arrests until they passed to the War Department on 15 February 1862 [GCF]; Stanton's order of 8 August 1862 was followed by at least 350 arrests in a month [UP 4.3]); the habeas proclamation of 24 September 1862 [UP 1.5]. Locked costs: Democrats, border-state trust, and accountability when Congress next sits (0040's chamber state). All are security orders in the sense of section 1 (0032, R8).
- *event*: Taney's rulings (28 May oral, 1 June written) [SW 6.6]; arrests made by holders under the policy, each with its own cost (Marshal Kane, 27 June 1861; the Baltimore police board, 1 July; Mayor Brown and legislators, 12–13 September 1861, 26–28 legislators best supported [SW 6.6], corrected by [GCF]); Charles Stone's arrest on 8 February 1862 (9 and 12 in other sources) and six months without trial [UP 1.3] (added).
- *derived*: the arrest count is a calibration band for history runs (13,000 to 15,000 over the war [UP 4.3]), never a score.
- *refused*: arrests made free by not being noticed; arrests that raise loyalty without cost; one card per arrested person (bookkeeping of the kind 0040 bans for patronage); a free-standing arrest verb.
- Risks: scoring, hindsight (the 1863 indemnity act must not be implied in 1861 text).

**`press-suppression`**. Window: slice (telegraph censorship from April 1861; the New York grand jury presentment of 16 August 1861 and the Post Office's refusal to carry the papers) [SW 5], [UP 4.1, 4.3]. The Chicago Times (June 1863) and the World and Journal of Commerce (May 1864) are later [UP 4.1, 4.3].
- *decision*: a security order under 0032 ("press and mail bans", which the president and his commanders can issue or lift), taken as a situation option or as a standing order on a post (the Postmaster General, a department commander) and issued through that holder, with locked costs on the Democratic blocs and the press's belief [UP, design implications]. Commanders' own bans are their seat conduct, with the same costs. R8 records the mechanism.
- *event*: mob attacks on papers (111 wrecked by mobs, mostly in the North, per one essay [UP 4.3]; the Baltimore *Wecker*, a Philadelphia crowd, Concord in 1861 [SW 6.6]). Never caused or used by any seat.
- *refused*: a free-standing "suppress paper" verb; mobs as an instrument of any seat.
- Risks: scoring.

**`draft-riots`**. Window: later (New York, 13–16 July 1863).
- *event*: fires from the draft's burden (commutation payers outnumbered men furnished in the July 1863 draft, 59 percent) and local conditions [UP 2.2], with locked consequences on blocs and the draft. The text names the victims: Black New Yorkers killed and the Colored Orphan Asylum burned [UP, gate table].
- *refused*: any seat instigating or using the riot; a framing as class protest that hides the racist violence.
- needs-source: the government's response (the notes do not source the troops sent), so a response decision cannot be authored yet. German resistance to the draft in Wisconsin in late 1862 is in the slice [UP 2.1] and needs-source before an event is written.
- Risks: agency, scoring.

**`commutation`**. Window: later (the Enrollment Act, 3 March 1863; limited in July 1864) [UE 2.3], [UP 1.4].
- Not itself a gate topic; it is gated only through `draft-riots`. *derived*: a class-burden term in draft anger [UE 2.3]; *event*: the law.
- *refused*: a commutation-price dial.

**`emergency-militia-1863`**. Window: later (over 120,000 "emergency men", summer 1863) [UE finding 2].
- Ruling: not gated. An ordinary economy event; its only link to the gate is timing with the riots.

### 3.6 Atrocities, guerrilla war and civilians

**`civilian-deaths-1861`** (added). Window: slice.
- *event* (Pratt Street): the Baltimore riot fires **from its cause, not a date**: troops answering the call for militia are routed through Baltimore while the city's state (its loyalty, and Kane's police and the secessionist-leaning mayor that [SW]'s Baltimore row records) is hostile past a pack-set threshold. It is not a railroad: the one deliberate railroad is the Confederate seat opening the war (0028, 0040), and B2 applies. Historically a mob attacked Massachusetts troops on 19 April 1861, when the B&O was the only rail route north to Washington ([UE 5], snippet; [SW 6.7]). The riot is the cause of the situation about routing troops around Baltimore (catalogue S12), not its outcome. The dead: 9–12 civilians and 4–5 soldiers (the NPS counts 11 and 16 on different pages) [SW 6.7], [SW, gaps], shown as ranges (F4).
- *event* (Camp Jackson, 10 May 1861): at least 28 civilians killed [SW 6.7], an event from the conduct of the commander's troops (Lyon's seat), not a draw from a stream (0007: people's conduct is not dice) and not a player option. The president's decision in catalogue S14 concerns the arsenal and the commander; the killings follow from the commander's seat, under the sign rule.
- *refused*: an option to fire on a crowd; any benefit to the acting side from the deaths (E7).
- Change from [SW 6.8] (narrated only): both become events, because each changes state: troops went by Annapolis instead of through Baltimore [SW, situation S7], and the note's own border table proposes a swing of Missouri's moderates after Camp Jackson [SW, border-state proposals, interpretation].
- Risks: atrocity.

**`guerrilla-war-west`** (added). Window: slice (Missouri sabotage and executions in July 1861; sustained guerrilla war and Lane's Osceola raid from September 1861 [SW 6.7]; Frémont's martial law of 30 August 1861 [U62]).
- *derived*: guerrilla pressure on loyalty and supply (0029).
- *event*: raids on civilians and reprisals by either side's commanders, from their seat conduct, with locked consequences under the sign rule: reprisals never lower guerrilla pressure or raise control for the side that commits them, whoever appointed the commander.
- *decision*: the president's reply to a commander's martial-law order (Frémont's).
- *refused*: goal postures or raid targets aimed at civilians (raids strike rail, river edges and depots, 0029); reprisal as a lever; appointment as a way round the sign rule.
- Held for R6 on commanders' conduct toward civilians. The terms of Frémont's martial law beyond its emancipation clause are sourced [GCF] (its shooting clause was an order). The president's reply may restrict or revoke the shooting clause; no option upholds it (rule 1), and "uphold" in `emancipation-policy` applies to the emancipation clause only. needs-source: the Osceola raid's details; whether reprisals raised guerrilla pressure (calibration only).
- Risks: atrocity, lost-cause (romantic raiders).

**`occupation-orders`** (added). Window: slice (Butler's General Order No. 28, 15 May 1862; his removal 16 December 1862) [U62], [CP].
- *event*: a commander's order from his seat conduct, with locked consequences on foreign patience and the press (the order caused international outrage [U62]) under the sign rule; Davis's December proclamation cites Butler [CS 4.4]. The president's reply uses the ordinary relieve verb.
- *refused*: occupation severity as a player lever.
- Mumford's execution is sourced [GCF] (the order, date and place): an *event* from the commander's seat conduct, under the sign rule. Held for R6.
- Risks: atrocity, lost-cause.

**`fort-pillow-and-jccw`**. Window: later for Fort Pillow (12 April 1864) and the committee's reports on it (1864) and Sand Creek (1865) [CS 4.4], [UP 1.3]; slice for the committee itself (created 9 December 1861) and Stone [UP 1.3].
- *event*: the Fort Pillow massacre, with locked consequences under the sign rule; *text*: the committee's reports as authored reports of an investigation seat (0032) [UP, design implications 3].
- *refused*: any Confederate option that permits it; any Union gain conditional on it.
- The Sand Creek massacre itself is not in the notes: needs-source, and it falls under R3. Retaliation falls under R4.
- Risks: atrocity, agency.

**`prisoners-and-exchange`** (added). Window: slice (moved from `later` after [GCF] sourced 1861–62 facets). 0021 puts prison camps in the gate. In-slice facets now sourced [GCF]: the hostages chosen by lot (Corcoran) and how that ended; local exchanges and the House resolution of December 1861; Wool–Cobb; the cartel of 22 July 1862, its terms and agents ("The President directs"); the Union-held numbers; Camp Parole; GO 54 holding Pope's officers; the halt of 28–30 December 1862.
- Status: `record` (R4), with no interim placement until R4 exists. Davis's proclamation and GO 60 stay placed under `captured-black-soldiers`; tag them with that topic until R4 exists.
- **Ship-blocker** (section 4): its window lies inside the slice.
- The Corcoran lot, GO 60 and Davis's proclamation are threatened reprisal killings by the Confederate seat: under rule 1 and the interim Confederate rule they are events and text, never a choice.
- R4 still needs: camp conditions and mortality on both sides in 1862; Confederate-held totals; the treatment of Black people captured in 1862 (civilians and teamsters as well as soldiers); a Union document giving the 1861 reason for refusing a cartel.
- Risks: atrocity, agency.

### 3.7 Native nations

**`indian-territory-1861`**. Window: slice.
- *event*: the Union abandons its posts (Washita left about 15–16 April; Arbuckle's troops left on 3 May; Cobb's troops were gone before 9 May 1861, the day Emory found the column); Pike's treaties with the Creek (10 July), Choctaw and Chickasaw (12 July), Seminole (1 August) and Cherokee (7 October, outside [SW]'s window, signed by Ross after much negotiation) [SW 6.5], [CS 4.5]. Each treaty is the nation's own government's act, a change of side with the Confederacy as the other party (0069), never an act of the Confederate rule seat. The interim rule covers only the Confederacy's own acts toward the nations.
- *derived* and *event* (agency, added in review): the nations' and Native men's own choices: Ross's neutrality; Stand Watie a colonel by 1 September 1861 (July unconfirmed) [GCF]; Opothleyahola's loyalists (with Black Creeks and enslaved people) moving toward Kansas, with the fights of 19 November, 9 December and 26 December 1861 [SW 6.5]. Enlistment by Native men, on either side, is their choice, shown like `black-enlistment`: derived from conditions and policy, never a pool.
- *text*: 7,369 enslaved people in the four nations, about 12.5 percent (the 1860 census; [GCF], correcting [SW 6.2]'s "more than 7,000 ... about 14 percent"); the text does not erase slavery there either.
- No Union decision in 1861 [SW 6.8].
- For authors (0070):
  - Emory's "unworthy conduct of the governor of the Chickasaw Nation" is a hostile officer's attributed view (Q10), never the narrator's.
  - The 12 August 1861 treaty with the Leased District's peoples is contested, so a research lane sources the dispute before it is authored, and the item shows the conflict (Q1).
  - The Reserve peoples' treaty of peace with Texas (14 May) is their own act.
  - No words are given as Opothleyahola's until read in a primary copy.
- *refused*: any verb for either principal to recruit Native nations or Native men, or to treat them as a manpower pool.
- R3 defines "protected" for a nation that is a seat: no pool or resource targeting, though diplomacy toward it may be legal.
- Risks: agency, resource, lost-cause.

**`dakota-war-1862`** (added as a separate entry). Window: slice (18 August 1862, the war's first day (the Acton killings were on 17 August), to 26 December 1862, the executions at Mankato under Lincoln's order); Pope went to the Department of the Northwest in September 1862 [U62]. Figures are given as the attributed ranges in [GCF] sections 1–2, never as single numbers: deaths on each side, the trials (the commission's recorder gives "over four hundred" tried and 303 sentenced to death), and the executions, with each source's interest stated. This replaces the single-source figures first taken from [MX].
- Status: `record` (R3), with no interim placement; needs-source only for Dakota-voiced sources ([GCF] 1.8). The Department of the Northwest may exist as a post; nothing about the war is authored.
- **Ship-blocker**: its window lies inside the slice, so under the ship rule the slice cannot ship until R3 exists and its facets are authored.
- Reasons: 0026 names it; [SW 6.8] refuses it until its own record; [UP findings] asks for a lane and a record; the facts come from one Wikipedia article [MX]. The review of the sentences would put a choice of who is executed on the player's desk, the gravest case of "Is this a lever?".
- Risks: atrocity, agency, scoring, hindsight.

### 3.8 Navy and economy

**`black-sailors`**: in 3.3.

**`prize-money-and-cotton`**. Window: slice for prizes; later for the Red River cotton (1864).
- Ruling: prize money ($25 million over four years [UN 5]) is not gated: an ordinary motive term in flag officers' compliance. Cotton as a commodity in the blockade and foreign clocks is not gated. The Porter–Banks race for cotton on the Red River [UN 6] is ordinary army–navy friction.
- *refused* (gated facet): any Union lever that directs the labour of freedpeople on captured plantations or in cotton. No note covers Union plantation policy, so any such feature is needs-source and needs a record before it is designed (see `union-freedpeople-camps`).
- Reviewer note: cotton text should not present the crop as if nobody grew it.
- Risks: resource (only if labour enters).

### 3.9 Victory and defeat

**`verdict-text`**.
- Proposal in the brief and [CS 4.7]: Confederate victory text must say that independence meant slavery's survival.
- Ruling: every verdict in which the Confederacy is not defeated (the 1864 election lost, or Union will collapsing before it, 0028) carries two required clauses: (1) what the Confederacy was founded to protect, quoted with citations from its constitution or declarations [SW 6.1], [CS 4.1]; (2) slavery's status in the game's state at the end, derived (where self-emancipation, Union policy and Union armies had ended it, and where it stood). It predicts nothing about the peace or what the winner would have done, as 0026 requires for the 1864 verdict. The Union-victory verdict carries clause (2) and names self-emancipation and Black military service among its terms when they are non-zero.
- Change: grounding the clause in the founding documents and the end state, rather than a forecast, keeps it compatible with 0026's "no claim about what a McClellan administration would have done", and extends it to the 1864 verdict. That extension needs the lead's ruling (R5).
- Risks: lost-cause, scoring, hindsight.

## 4. Records needed

The lead writes these; each states the question the record must answer and this lane's recommendation.

**The slice's ship-blockers** (A8): the 1861–62 slice cannot ship until each of these is cleared.
- **R2**, which holds `black-soldiers-pay`.
- **R3**, which holds `dakota-war-1862` (and the Native-nation questions of `indian-territory-1861`, whose agency facets may be authored meanwhile).
- **`union-freedpeople-camps`**, needs-source as a whole topic.
- **R4**, which holds `prisoners-and-exchange` (moved into the slice after [GCF] sourced its 1861–62 facets).

The other records block only the topics they hold, and facet-level needs-source flags block nothing.

| # | Record | Question it must answer | Recommendation |
|---|---|---|---|
| R1 | A playable Confederacy under the gate (already required by 0026 and 0029) | (a) the Confederate player's verbs; (b) whether any verb acts on enslaved people; (c) victory and defeat text from the Confederate side; (d) blocs: planters, non-slaveholding whites, Unionists, with enslaved people as agents shown through their effects, never a managed bloc; (e) the first-hand sources that voice enslaved people's agency [CS 4.7]. **Also record the interim rule** of section 1 for the Confederate rule seat in the Union game, since it narrows 0009 and 0029's "same machinery" for a seat that is not playable. | (b) none, as [CS 4.7] recommends. The interim rule as written: acts touching protected populations or atrocity classes are events; coercive policy such as habeas runs on the symmetric machinery. The interim rule is recorded in 0046. |
| R2 | Black military service | Is the pay gap ($10 less $3 against $13, 1862 to 15 June 1864 [UE]) a fixed condition shown as text and a derived grievance, or a decision the president can press on Congress? Is the money difference modelled at all? How do duty assignments and officer policy enter (needs-source)? How does Confederate capture policy feed enlistment? | A decision to press Congress for equal pay, with locked political costs; the money gap is not modelled as a saving the player banks; grievance and enlistment are derived. |
| R3 | The wars against Native nations (**slice ship-blocker**) | Is Lincoln's review of the Dakota death sentences a player decision, and if so which options and locked costs keep any option from paying? How are the nations represented (seats, data, blocs), and what does "protected" mean for a nation that is a seat (no pool or resource targeting; diplomacy may be legal)? Which sources voice the Dakota and the Indian Territory nations? What research is needed first (the war's causes, the 38 or 39 count, Indian Territory in 1862, Sand Creek)? | A research lane first. Then the review as a decision whose consequences are only the responses of real actors (Minnesota's officials, the Senate, the press), with locked costs on every option, no option that improves any player-facing measure, and every option `watched` in the lever sweep; nations as seats or data whose choices are their own. |
| R4 | Prisoners, exchange and retaliation | Can retaliation (Lincoln's order of 30 July 1863 [CS 4.4]) ever be a decision? How do exchange and prison camps enter? How do the Confederate rules on captured Black soldiers interact with them? | A research lane first. No retaliation option whose execution pays; exchange as a decision through the War Department's seat with locked costs; camps as events and text. |
| R5 | Verdict text under the gate | Must the 1864 verdict (and any verdict in which the Confederacy is not defeated) state, from cited sources, what the Confederacy was founded to protect and slavery's status at the end? This clarifies 0026 and 0028. | Yes, as in 3.9: factual clauses, no prediction. |
| R6 | Civilians, guerrilla war and commanders' conduct | Is a commander's treatment of civilians (martial law, occupation orders, reprisals) seat behaviour from his values with locked consequences? Which goal postures and raid targets are refused? How does the president reply? **Appointment is not exempt**: does the record adopt the sign rule, so that no atrocity-class conduct helps the acting side whoever chose the man? | Seat behaviour with locked consequences under the sign rule; no civilian-targeting posture or target in the schema; the reply through relieve, pressure and orders. |
| R7 | Emancipation and fugitive policy | Which decisions exist in 1861–62 (Fort Monroe and fugitive policy, Frémont, compensated emancipation, Hunter, the Second Confiscation Act, the proclamation, the District of Columbia, colonization), what each moves, and how the consequences avoid both a virtue score and an unlock that pays? **Also record the ruling on `return`** (3.2): kept as policy toward a protected population, with the people's response and the Radical, abolitionist and foreign costs locked, expiring with the Second Confiscation Act, worded plainly, and watched by the lever sweep. | The decisions in 3.2, with consequences only on modelled actors (blocs, border states, foreign clocks, the Confederate seat) and on the derived agency terms; no player resource rises directly; the `return` ruling as written; District of Columbia emancipation and colonization researched before they are placed. |
| R8 | Security orders | 0032 lets the president and his commanders "issue or lift security orders such as press and mail bans", but FOUNDATION section 5 has no such verb. Are security orders (press and mail bans, arrests, habeas policy) situation options or standing orders on a post issued through a holder, never a free-standing verb? | Yes. This narrows 0032's wording without removing the power; the verb list stays fixed (0016). Recorded in 0046. |

## 5. Lane 0.7 handoff

The engine holds the mechanism; the pack holds every Civil War word (rule 3, 0024). Nothing setting-specific, including class names, risk names, group names and force-composition rules, may reach `packages/`. The testbed pack carries a small fictional register (one topic per placement, one held topic with an interim placement, one atrocity-class topic, one class with `requiresAgencyReason`) so every test runs on it, and lane 0.7's tests under `packages/` use only testbed fixtures.

### Engine schema (packages/kernel, generic)

| Field | On | Purpose | Questions |
|---|---|---|---|
| `gate: { topics: TopicId[], placement: Placement, risks: RiskId[] }` or `gate: { none: reason }` | situation, option, event, initiative entry, post policy, derived-term declaration, report template, in-world string, verdict template | The tag. `Placement` is the five-value enum of section 1; topic and risk ids must exist in the pack's register. | A1–A3 |
| `gateReview: { author, reviewer, date, questionVersions, contentHash }` | every gated item | Sign-off. `reviewer` must differ from `author`. `questionVersions` records the version of each question that applies. `contentHash` is over the item in lane 0.1's canonical serialization, **excluding `gateReview` itself and including** the resolved strings, the cited source rows and any effect templates the item references. Any edit, or a bump to an applicable question's version, voids it. | A7 |
| `citations: SourceId[]` | every gated item | Resolve to the pack's sources table and its source policy. | A5, A6 |
| `earliest: Date` | gated in-world strings, events, situations | Compared with topic windows and the anachronism list. | A4, C3, F6 |
| `proposedBy: PersonId[] \| 'inaction'`, `displayKey`, `watched: boolean` | option | Advisers' wording, neutral order, and the reviewer's mark for the lever sweep. | C1, C2, D6 |
| `expiresWhen` (0040) | option | Required where the register lists a superseding law. | B10 |
| `lockedCosts: Effect[]` | gated option, lever | Non-empty; `Effect` here has no condition or chance field. | B5, D2 |
| `holder: PostId` | lever | Who carries it out. | D1 |
| `scope: 'narrator' \| 'voice' \| 'quotation' \| 'out-of-world'`, `quotation: { speaker, citation }` | string entry | Which patterns apply; quotations are exempt from F2 only with a citation and a reviewer note. | F1–F3 |
| `protected: { topic }` | world-field declaration, population entity | No verb, option, initiative, goal or setup effect may target it; only derivations read it. | B3, D3, E2 |
| `reasonType`, `actingSide` | derived-term declaration | The reason type must be an agency type for classes with `requiresAgencyReason`; the acting side is what E7's sign check reads. | E3, E7 |
| `requiredClauses: StringId[]` per outcome class | verdict template | The clauses of 3.9. | H2, H3 |
| `premise: true` | scenario item | Immutable by setup. | G2 |
| `omits: SituationId[]` | scenario | Situations a later start leaves out; G5 checks their topics' derived and text facets. | G5 |

Loader rules: refuse gated items without a valid review outside a drafts folder; refuse items tagged with held topics, except cited text-only items for a held topic's interim placement; refuse setup options whose targets include gated items or protected fields. Release rule: refuse to build a shipping scenario that fails A8.

### Pack files (`packs/<pack>/gate/`)

- `register.json`: one entry per topic: id, class, window, allowed placements, interim placement (text or none), status (`open`, `record`, needs-source flag), refused-facet signatures (field-name patterns, forbidden targets, forbidden verb shapes, forbidden force compositions such as Black soldiers in Confederate force blocks), agency reason types, superseding laws for `expiresWhen`, protected-group terms (for F2's proximity rule), sources. Section 3 is its first content.
- `classes.json`: the pack's topic classes, each with two flags, `atrocity` and `requiresAgencyReason`. For this pack: cause and aims; slavery and emancipation (agency); Black military service (agency); atrocities (massacres of surrendered soldiers, killings of civilians and prisoners: atrocity); guerrilla war; civilians; prisoners; Native nations (agency); civil liberties; riots and mobs.
- `forbidden.json`: patterns with scope, severity (`fail`, or `review`, which forces a reviewer note) and reason. Starting set:
  - *fail outside quotation*: "states' rights" and "states rights"; "War of Northern Aggression"; "War Between the States"; "peculiar institution"; "Southern way of life"; "Lost Cause" in any in-world string; "loyal slave(s)", "faithful slave(s)", "faithful servant(s)", "happy slave(s)"; "Black Confederate(s)"; "contraband" as a noun for people outside quotation marks; resource words ("pool", "stock", "supply", "count", "labour force") within five tokens of a protected-group term from the register; the slur list (kept in the pack, not in this document).
  - *fail in option labels and in-world narrator*: "historically", "as history records", "as Lincoln did", "the historical choice", "in hindsight", "would later", "turning point"; "the right thing", "humane", "shameful", "noble", "righteous", "heroic".
  - *review*: "heritage"; "the South" and "Southerners" in narrator text (trap 9); "slaves" as a narrator noun (prefer "enslaved people"); "owner" or "master" of people (prefer "enslaver"); "servant(s)"; "property" near a protected group; "coercion" in narrator text; "servile war", "racial war"; "lost because of", "overwhelming numbers", "failure of will" in verdicts.
- `anachronisms.json`: term, earliest in-world date, source. Starting set from the notes: "contraband" for refugees 24 May 1861 [CS 4.3]; "Cornerstone" speech 21 March 1861 [SW 6.1]; "Confiscation Act" 6 August 1861 and "Second Confiscation Act" 17 July 1862 [UP 1.4]; "Joint Committee on the Conduct of the War" 9 December 1861 [UP 1.3]; "Militia Act" (of 1862) 17 July 1862 [UE 2.1]; "Emancipation Proclamation" 22 September 1862 for the preliminary, 1 January 1863 for the proclamation [CS 4.3]; "Twenty-Slave Law" 11 October 1862 [CS 3.4]; "Dakota War" 18 August 1862 [MX]; "Enrollment Act" 3 March 1863 [UP 1.4]; "draft riots" 13 July 1863 [UP]; "Fort Pillow" as a massacre 12 April 1864 [CS 4.4]. "Lost Cause" is barred from all in-world text (the literature is postwar [CS 4.6]). "Copperhead" needs a sourced first date.
- `triggers.json`: terms whose presence requires a gate tag or `gate: none` (A1), with **match rules** so ordinary strings do not flood the reviewer: whole-word matching; case rules per term (for example "Black" matches only as a word for people, not inside a capitalised proper noun on the allowlist); and a **proper-noun allowlist** (Blackburn's Ford, Wilson's Creek and other Creek place names, Indiana and Indianapolis, Mobile, executive offices). Starting terms: enslav-, slave, slavery, freedm-, freedpeople, contraband, fugitive, Black (people), colored, emancipat-, abolition, massacre, atrocity, execution and executed (not "executive"), hanged and hanging, prisoner, habeas, arrest and arrested, martial law, suppression of papers, riot, mob (whole word), guerrilla, insurrection, servile, Indian (not on the allowlist), Dakota, Creek (nation), Cherokee, Choctaw, Chickasaw, Seminole, Native.
- `source-policy.json`: banned as evidence (the two memoirs [CS 4.6]); weak and never sole (blogs flagged in the notes, snippet-only citations, the `cavac.at` mirror [CS findings 1]).
- `checklist.json`: each question id with its own version, enforcement kind and the artefact types it applies to. A substantive change to a question bumps that question's version, which voids only the sign-offs of items it applies to; an editorial fix that changes no answer does not bump it.

### Tests

| Test | Checks |
|---|---|
| gate-tag | A1–A4, B4, D4: tags present on trigger matches (after match rules and the allowlist) and on protected-field effects; placements allowed; held topics loadable only through their interim placement; windows open on `earliest`. |
| gate-review | A7: sign-off present, reviewer ≠ author, applicable question versions current, hash matches over the defined scope. |
| gate-sources | A5, A6, F3, F4: citations resolve; none rests only on a banned or weak source; quotations carry speaker and citation; disputed numbers are ranges. |
| gate-situation | B1, B2, B5, B7, B10: required fields; cause not a bare date unless a labelled railroad; locked costs present, unconditional and uncancelled; delegates share the option set; `expiresWhen` present where the register lists a superseding law. |
| gate-targets (graph) | B3, D3, D5, E2, G1, G3: no effect of a verb, option, initiative, goal or setup option targets a protected field, population or gated item; no resource has a contributor from a protected population; no positive effect is conditioned on an atrocity-class event or conduct. |
| gate-refused-signatures | Every refused-facet signature in the register (field-name patterns such as a labour or slave stock, forbidden targets, forbidden verb shapes, forbidden force compositions). Generic: it reads the signatures from the pack. |
| gate-sign (graph, run) | E7: every derived term whose reason is atrocity-class has a non-positive sign on its acting side's will, control, supply, loyalty and foreign patience, in the declaration and in seeded runs, whoever appointed the actor. |
| gate-wording (pattern) | C3, C4, F2, F5, F6, H4: forbidden patterns by scope and severity, including the proximity rule; anachronisms by `earliest`. |
| gate-order | C2, B9: the presenter never reads the historical default (architecture); in gated situations with three or more options, no display position holds the default in more than half of them. |
| gate-lever-sweep (run) | D6: a victory-only bot takes each gated decision across seeded history runs; any `watched` option that is its best choice in more than a quarter of seeds is reported for the reviewer (Q7). |
| gate-derived | E1, E3, E4, E5: derived gate terms have no writer, carry agency reason types where the class requires them, are absent from the meter registry, and appear in explanations when non-zero. |
| gate-text | F1, F7: authors and routes; voice requests tagged with passing fallbacks. |
| gate-setup (run) | G2, G4, G5: premise items immutable; presentation options leave a seeded run's state hash unchanged; omitted situations keep their topics' derived and text facets. |
| gate-verdict | H1, H2, H3, H5: required clauses present per outcome class; typed terms in every verdict; no virtue, morality or karma field in the schema. |
| gate-release | A8: no topic in `record` status, or needs-source as a whole topic, overlaps a shipping scenario's window. |

## 6. Changes from the brief's proposals and the notes' tables

Gate placements in research notes are inputs; authors follow section 3 wherever they differ. Every known difference:

| Topic | Proposal or note table | Ruling | Why |
|---|---|---|---|
| Self-emancipation | Brief: a derived loss only, never a lever | Derived, never a lever; two kinds of cause, one independent of Union action; it also causes Union policy decisions; worded as the people's act; no Union gain stock | A loss-only term, or one caused only by Union reach, frames freedom from someone else's ledger [CS 4.2, 4.3] |
| Fugitive `return` (S17) | Catalogue: "whether this option exists is the gate's call"; [SW 6.8]: returns modelled with locked consequences | Kept as policy toward a protected population; the people's response and Radical, abolitionist and foreign costs locked; expires with the Second Confiscation Act; plainly worded; watched by the lever sweep; recorded in R7 | Refusing it would make the Union cleaner than it was [SW 6.3]; its terms keep it from being a lever that pays |
| Confederate victory text | Brief and [CS 4.7]: must say independence meant slavery's survival | Required clauses quoting the founding documents and stating slavery's status at the end; no forecast; extended to the 1864 verdict (R5) | Keeps 0026's "no claim about what the winner would have done" |
| Press suppression | Brief: a lever with a locked cost; [SW 6.8]: narrated only; [UP]: modelled | A security order under 0032, taken as a situation option or a standing order on a post through a holder, with a locked cost; mobs are events no seat uses; R8 | 0032 grants the power; the verb list cannot grow (0016); suppression was government action [SW 5, 6.6], [UP 4.3] |
| Arrests and habeas policy | [SW 6.8] and [UP]: modelled with locked consequences | Agreed, and they are security orders in the same sense (R8) | One mechanism for all security orders |
| Merryman | [SW 6.8]: "a fixed event"; [SW] S8 and catalogue S18: options | Taney's ruling is the event; the president's answer is the decision | The court ruled, and Lincoln chose his answer in the 4 July message [SW 6.6] |
| Twenty-Slave Law | [CS 4.7]: a political act with costs | An event under the interim Confederate rule; costs kept | Choosing it is choosing how to control enslaved people |
| Confederate habeas and civil liberties | [CS 4.7]: narrated with locked consequences | A decision of the Confederate rule seat under the interim rule; sourced since by [GCF] | Coercive policy, not an atrocity or an act on a protected population; 0009 |
| Interim Confederate rule | (none; the first version made every Confederate act on a gate topic an event, contradicting its own habeas entry) | Stated once in section 1 and recorded in R1 | Consistency, and it narrows 0009 for a non-playable seat |
| Black enlistment, 1861 | [SW 6.8]: no player recruit before the 1862 law, which it attributes to 0026 (0026 does not say it); the first version allowed `accept` | Acceptance only through `ask-congress` (S13); a direct lawful acceptance is needs-source | The legal basis rests on one line [SW 6.4]; Congress routing slows hindsight play |
| Pratt Street and Camp Jackson | [SW 6.8]: narrated only; the first version made both outcomes drawn from a stream | Pratt Street an event fired from its cause (troops routed through a hostile Baltimore), not a date, and the cause of S12; Camp Jackson an event from the commander's seat; ranges 9–12 civilians | Each changed state; 0007 rules out dice for people's conduct |
| Commanders' conduct | (none; the first version's D5 missed benefits that flow through derived terms) | The sign rule and its test; appointment is not exempt (R6) | Otherwise appointing a harsh man is the lever |
| Unequal pay | Brief: "0026 says it needs its own record" | Needs its own record (R2), but the recommendation is the economy note's, not 0026's | Attribution checked against 0026 |
| Impressed labour | Brief: no verb, no labour stat | Agreed; census population allowed only as protected input to derived terms | A precise line for the test |
| `record` | The first version made it a sixth placement | A status beside needs-source, with an optional interim text placement, the ship rule and the demo rule | It holds a topic; it is not a place in the game |
| Checklist layout | 0021 asks for a "short" checklist; the first version had 51 questions in one list | Two layers: twelve reviewer questions; the rest as lane 0.7's test specification | No question dropped; authors read only what needs a reader |

## 7. Research needed before authoring

[GCF] section 14b maps every row below to what it sourced. The list is kept as written at acceptance, for the record: the items [GCF] settled (the Dakota War's causes and count, Indian Territory in 1862, Davis's habeas suspensions, DC emancipation, colonization, the 1861 arrests, Frémont's martial-law terms, Mumford) are no longer held for want of sources (some stay held by their records, such as the Dakota War by R3 and Mumford by R6), and section 3 shows what each lift placed.

Placements above that were held at acceptance until a research lane sourced them: the Dakota War (causes, the 38 or 39 count, from a primary source) and Sand Creek; Indian Territory in 1862; the dates and terms of Davis's habeas suspensions; Confederate repression in East Tennessee in 1861–62; the bread riots (snippet-only); the government's response to the draft riots and the 1862 Wisconsin draft resistance; Seward's advice to wait for a victory (the staff recommendation for the proclamation); emancipation in the District of Columbia; colonization proposals; the Crittenden–Johnson resolution's wording on slavery; whether the president could lawfully accept Black volunteers under the 3 May 1861 call; Hunter's 1862 regiment; Union camps, labour and conditions for freedpeople (Camp Barker, contraband labour); Union plantation and labour policy; the Osceola raid and the terms of Frémont's martial law; whether reprisals raised guerrilla pressure; Mumford's execution; the 1862 exchange arrangements and prison camps; Black sailors' service conditions; Black soldiers' duty assignments and officer policy; which seat ran the 1861 arrests; the first date of "Copperhead".
