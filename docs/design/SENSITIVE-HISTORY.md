# Sensitive history: the placement checklist and the 1861–62 topic register

Status: design lane output (2026-11-14), a proposal like everything in `docs/design/`. It is the gate checklist that 0021 places "with the situations schema" and that FOUNDATION section 12 assigns to lane 0.7. It works under 0021 as amended by 0026 (wider scope, the placement rule, Black regiments), and under 0016, 0022, 0023, 0028, 0029, 0040, 0041 and 0042. Nothing here is accepted until a decision record accepts it.

History comes only from the research notes, cited as **[CS]** `docs/research/2026-11-14-confederate-side.md`, **[UP]** `2026-11-14-union-politics.md`, **[UE]** `2026-11-14-union-war-economy.md`, **[UN]** `2026-11-14-union-navy.md`, **[SW]** `2026-11-14-secession-winter-1861.md`, **[U62]** `2026-11-14-union-1861-62.md`, and three notes outside the brief's list that I read for one or two facts each: **[MX]** `2026-11-14-map-extent-size-sources.md` (the Dakota War, the slice's end date), **[MF]** `2026-11-14-march-1861-facts.md` (the inaugural's reception) and **[CP]** `2026-11-14-union-command-and-promotion.md` (Butler's removal). A placement that rests on a fact the notes do not source is marked **needs-source**; its authoring is blocked until a research lane sources it. **(added)** marks a topic the brief did not list.

The first slice runs from the inauguration (4 March 1861) to 31 December 1862 [MX]. A topic dated later is placed provisionally and ruled again before it is authored.

## How to use this document

Every situation, option, lever, event, derived term, report template, string, setup option and verdict that touches a gate topic:

1. **is tagged** with its topics and its placement from section 1, which must be one the register (section 3) allows;
2. **passes the checklist** (section 2): the mechanical questions by test, the rest by the author and then the gate reviewer;
3. **is signed off** by the separate gate reviewer lane (`docs/LANES.md`), against the checklist version and the item's content hash, so any later edit voids the sign-off.

The pack loader refuses gate content that skips a step (section 5).

## 1. The placements

0026 says each sensitive feature is placed, before it is authored, as **modelled with locked consequences**, **narrated only** or **refused**, and asks one question: "Is this a lever?" These six placements refine those three so that a test can tell them apart. Each placement applies to one **facet** of a topic, not to the whole topic: the Fort Monroe arrivals are a derived term, Butler's question is a decision, and a "recapture" verb is refused. Most register entries therefore list several placements and an explicit list of refused facets.

| Placement | 0026 category | What it is | What it permits | What it forbids |
|---|---|---|---|---|
| **decision** | modelled with locked consequences | A situation the president decides, or delegates to a named holder whose seat decides by his values from the same options (0040). Also a standing order through a holder that an option creates (a lever, below). | Options worded per 0041; options that issue orders through people (0040); consequences on state; locked costs. | Any option that orders, permits or profits from an atrocity. Any option or verb whose object is a protected population (enslaved people, freedpeople, Black soldiers as a category, Native nations) rather than a policy. A cost that can be avoided. |
| **event** | modelled with locked consequences | A fixed occurrence that fires when its cause holds in state (or a labelled railroad, 0028 and 0040). Nobody on the player's side chooses it. Acts of the Confederate seat on gate topics are events in the Union game until the playable-Confederacy record (0026) says otherwise. | Locked consequences on state; authored reports about it; follow-on situations for the player's reply. | Options. Any consequence whose benefit to a seat is conditional on the event being an atrocity. |
| **derived** | modelled with locked consequences | A term inside a derived quantity (regional capacity, supply, bloc support, national will, foreign patience), computed from state with typed reasons and never stored (hard rules 5 and 6). | Appearing in explanations, reports and the verdict, with its typed reason. Reading protected pack data (for example census figures). | Any verb, option, goal, initiative or setup option that targets it or its protected inputs. A meter, stock or bar the player is invited to raise or spend. |
| **text** | narrated only | Report, press, briefing or quotation text. It changes no state. | Authored reports (0032), the front page, the opening briefing, cited quotations. | Any effect field. |
| **refused** | refused | A facet that is never built, with its reason recorded in the register. | Nothing. Where possible the refusal is a machine-checkable signature (a field name, a target, a verb shape). | Any pack item matching the signature. |
| **record** | (not yet placed) | The topic is held until its own decision record places it (section 4). 0026 forbids authoring before placement, so nothing ships meanwhile. | Draft items under a drafts folder the runner never loads. | Any loadable item tagged with the topic. |

Two statuses sit beside the placement:
- **Window.** `slice` (inside 4 March 1861 to 31 December 1862) or `later` (provisional: re-ruled before authoring).
- **needs-source.** The placement depends on a fact no note sources. The loader treats the topic as `record` until the flag is cleared.

**Definitions used throughout.**
- **Locked consequences**: the consequence terms are fixed in pack data; they apply on every use and every outcome; they carry no chance or detection condition (an arrest is not free because nobody noticed); and no other verb, option or initiative in the pack has an effect that cancels them for this item. The size of a cost is the reviewer's judgement; its existence and unconditional application are the test's.
- **Lever**: the verb list is fixed (0016, FOUNDATION section 5) and no screen adds to it, so the gate never adds a verb. A gated lever is one of: a situation option that creates a standing order through a holder (a habeas policy, an order to suppress a paper); a seat-initiative menu entry of a non-player seat (0040); or a standing agreement or prior order on a post (0040). Each runs through a person who can stall, refuse or exceed it.
- **Protected population**: a group whose people the game must show as agents, never as a resource (0021, 0026). In this pack: enslaved people, freedpeople and refugees from slavery, free Black men and women, Black soldiers and sailors as a category, and Native nations. The engine knows only the flag; the pack names the groups (rule 3).

**The four rules the placements encode.**
1. **An atrocity is never a lever, for anyone** (0026). Massacres of surrendered soldiers, killings of civilians and prisoners, and reprisal killings are events and text only. No seat's option or initiative orders or permits them, and no seat gains from them through a separate option.
2. **Slavery is never managed.** Neither side has a verb, option, stat or stock whose object is enslaved people or their labour. Policy toward slavery (confiscation, emancipation, fugitive policy) can be a decision; what people do in response is derived, and its reasons name them as actors.
3. **Coercive state power may be a decision, never a free one.** Habeas suspension, arrests and press suppression were presidential policy; they are decisions or levers with locked costs, run through holders.
4. **Agency is shown as agency.** Black enlistment, self-emancipation, Unionist resistance and Native nations' choices come from those people's choices responding to conditions, never from a pool the player draws on.

## 2. The checklist

Every question is phrased so that **yes passes**. Enforcement:
- **M** = lane 0.7's tests enforce it. The kind is in brackets: **[field]** a required schema field; **[tag]** a required gate tag or a tag/placement match; **[pattern]** a forbidden-wording or anachronism match; **[graph]** a check over effect targets and data flow; **[arch]** an architecture test on code; **[hash]** a content-hash comparison; **[run]** a run that compares outcomes.
- **R** = the author and then the gate reviewer answer it by reading.
- **M+R** = the test catches the clear cases and the reviewer judges the rest.

### A. Every gated item

| ID | Question | Enforced |
|---|---|---|
| A1 | Does the item carry a gate tag naming at least one register topic and one placement, whenever its strings match the pack's trigger list or its effects touch a protected field? An untagged match fails unless the item carries `gate: none` with a reason and a reviewer sign-off. | M [tag] |
| A2 | Is the item's placement one the register allows for each topic it names? | M [tag] |
| A3 | Is no named topic in `record` status or flagged needs-source? | M [tag] |
| A4 | Is each topic's window open on the item's earliest in-game date? | M [field] |
| A5 | Does every historical claim cite a source in the pack's sources table, and does the source say what the item says? | M+R [field] |
| A6 | Does no claim rest solely on a source the pack's source policy bans or marks weak (Davis's *Rise and Fall* and Johnston's *Narrative* are advocacy [CS 4.6]; snippet-only citations are leads, not facts [UE])? | M [field] |
| A7 | Has the gate reviewer signed the item off against the current checklist version and the item's current content hash? | M [hash] |

### B. Situations

| ID | Question | Enforced |
|---|---|---|
| B1 | Does it have a cause predicate, options, an `inaction` outcome, a historical default and an authored staff recommendation (0023, 0040)? | M [field] |
| B2 | Is its cause in state, not a date alone, unless it is a labelled railroad (0028, 0040)? | M [field] |
| B3 | Does every option act as policy or through people (orders to holders), with no effect targeting a protected population or protected field? | M [graph] |
| B4 | Is no option tagged with an atrocity-class topic? | M [tag] |
| B5 | Does every option tagged `decision` carry non-empty locked costs, unconditional, with nothing elsewhere in the pack cancelling them? | M [field] [graph] |
| B6 | Is the `inaction` outcome costed like the options, so ignoring the situation is not a way round the gate? | R |
| B7 | Does a delegate decide from the same option set as the president, so delegation cannot reach an option the player is refused (0040)? | M [field] |
| B8 | Where enslaved, freed, Black or Native people act in the situation, are they the subject of the sentence, not an object or a quantity? | R |
| B9 | Is the historical default never shown to the player and never used to order options (0040, 0041)? | M [arch] |

### C. Option wording (0041)

| ID | Question | Enforced |
|---|---|---|
| C1 | Is each label in the advisers' own terms, with `proposedBy` naming the holders who argued for it (or `inaction`)? | M+R [field] |
| C2 | Are options listed by a neutral display key (the order advisers raised them), never by the historical default? Across the pack's gated situations, does the historical default not sit in the same display position every time? | M [arch] [run] |
| C3 | Is the label free of hindsight wording ("historically", "as Lincoln did", "would later", "turning point") and of terms dated after the situation (the anachronism list)? | M [pattern] |
| C4 | Is the label free of moral verdicts ("the right thing", "humane", "shameful", "noble", "expedient")? | M+R [pattern] |
| C5 | If an option would return people to slavery or keep them from freedom, does it say so plainly, with no euphemism such as "restore property"? | R |

### D. Levers (standing orders, seat initiatives, post policies)

| ID | Question | Enforced |
|---|---|---|
| D1 | Does it name a holder who can stall, refuse or exceed it (0023, hard rule 1)? | M [field] |
| D2 | Do its locked costs apply on every use, whatever the outcome and whether or not anyone noticed? | M [field] |
| D3 | Does it target no protected population or protected field, and feed no player-spendable resource from one? | M [graph] |
| D4 | Does no lever exist for an atrocity-class topic, for any seat? | M [tag] |
| D5 | Is no benefit conditional on an atrocity having happened (no "publicise the massacre" gain)? | M+R [graph] |
| D6 | Would a player optimising only for victory find that its best use is not the historically worst conduct? ("Is this a lever?") | R |
| D7 | If the other side holds the analogous lever, does it carry costs of the same kind (0009)? | R |

### E. Derived consequences

| ID | Question | Enforced |
|---|---|---|
| E1 | Is it computed from state with typed reasons and never stored (hard rules 5 and 6)? | M [arch] |
| E2 | Does no verb, option, goal, initiative or setup option target it or its protected inputs? | M [graph] |
| E3 | For topics of the slavery and Black-service classes, is its reason type one of the register's agency types (for example `agency:self-emancipation`), so the explanation names the people as actors? | M [field] |
| E4 | Is it absent from the meter registry, so it is never drawn as a stock or bar to raise or spend? | M [arch] |
| E5 | When non-zero, does it appear in the explanation of each quantity it moves (capacity, will)? | M [run] |
| E6 | Is the reason text worded as the people's act, not as the enslaver's loss ("people freed themselves", not "labour lost")? | R |

### F. Reports, press and other text (including the briefing, voice templates and generated voice)

| ID | Question | Enforced |
|---|---|---|
| F1 | Does the text have an author and a route (0032), so any period view belongs to someone, not to the narrator? | M [field] |
| F2 | Outside cited quotations, is it free of the forbidden patterns (Lost Cause wording, resource vocabulary for people, slurs)? | M [pattern] |
| F3 | Is every quotation cited, attributed and short, and does any period racist language appear only inside such a quotation, with a reviewer note? | M+R [field] |
| F4 | Where sources disagree on a number (the dead, the arrested), does the text show the range? | M+R [field] |
| F5 | Does narrator text neither praise nor scold the player? | M+R [pattern] |
| F6 | Is it free of terms dated after its earliest display date? | M [pattern] |
| F7 | For generated voice (0022): does the request carry the gate tag, and does the template fallback pass F1–F6? | M [field] |
| F8 | Does a historical person's voice stay within views the pack cites for him, so that Lost Cause or racist views are his, attributed, and never the game's? | R |

### G. Setup options

| ID | Question | Enforced |
|---|---|---|
| G1 | Does no setup option remove, soften or toggle a gate topic, its consequences or the war's cause? Leaving the topic out is itself a framing (0021). | M [graph] |
| G2 | Does no setup option vary a premise item, including the inaugural (0042)? | M [field] |
| G3 | Do the history modes (history's shadow, as history, unknown men) change only people's stats, never gate facts? | M [graph] |
| G4 | Does any presentation option (for example hiding quoted period slurs behind a note) leave the state hash of a seeded run unchanged? | M [run] |

### H. Victory and defeat text

| ID | Question | Enforced |
|---|---|---|
| H1 | Does every verdict say which will broke and why, with typed terms, including slavery-related terms when they are non-zero (0028)? | M [run] |
| H2 | Does every verdict in which the Confederacy is not defeated carry the required clauses: what the Confederacy was founded to protect, quoted from its constitution or declarations; and slavery's status in the game's state at the end? Does it predict nothing about the peace (0026)? | M+R [field] |
| H3 | Does the Union-victory verdict carry the slavery-status clause and, when non-zero, self-emancipation and Black military service among its terms, without crediting the president alone with freedom? | M+R [field] |
| H4 | Does no verdict explain the outcome with a disputed thesis ("the feuds lost it", "a failure of will", "overwhelming numbers alone") [CS 2.4, 4.6]? | M+R [pattern] |
| H5 | Does no verdict grade the player's morality? (The schema has no virtue, morality or karma field to grade with.) | M [field] |

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

**`neutral-option-wording`** (0041). A rule, not a topic: section 2, group C, applies to every gated situation. Labels in the advisers' own terms, in a fixed order unrelated to the historical default. The Sumter label "provision only, with notice" is the walkthrough's example of a leak (`FIRST-MONTH.md`, findings).

### 3.2 Slavery, self-emancipation and Union policy

**`self-emancipation`**. Window: slice, from the night of 23 May 1861 (Baker, Townsend and Mallory reach Fort Monroe) [SW 6.3].
- *derived*: a term in Confederate regional capacity and supply, caused by the reach of Union lines and forces and by known Union policy, with reason type `agency:self-emancipation`. It reads the census population of enslaved people as protected pack data [SW 6.2]; it never writes it.
- *event*: named arrivals at Union posts (the three men; about 900 people at Fort Monroe by 30 July [SW 6.3]), each able to raise a policy situation (see `fugitive-policy`).
- *refused*: any verb, option or initiative for either side to encourage, entice, prevent, recapture, count or spend it; any Union gain stock of "labour" or "men" fed by it; a "suppress insurrection" action [SW 6.8].
- Reasons: 0021 and 0026; [CS 4.3] reads this as the Confederate economy's central weakness and says neither seat may manage or prevent it. Calibration waits on sources: the 500,000 and 200,000 figures are UNVERIFIED [CS 4.3].
- Change from the brief's proposal ("a derived loss only, never a lever"): kept as derived and never a lever, but it is also the cause of Union policy decisions, and its reason text is the people's act, never a line in the enslaver's ledger (E6). It is not a Union gain either.
- Risks: agency, resource, scoring.

**`fugitive-policy`** (added). Window: slice.
- *decision*: Butler's question of 27 May 1861 (approve holding them; order them returned; ignore), historical default Cameron's approval of 30 May with status reserved [SW S12]. Locked costs both ways: border-state loyalty against the Radical bloc. Later replies follow the same pattern (Cameron's 8 August letter applying the Confiscation Act [SW 6.3]).
- *event*: a commander's standing practice toward fugitives, from his pack data and values (McClellan's 26 May 1861 proclamation promised no interference with slavery and to "crush any attempt at insurrection" [SW 6.3]), with locked consequences on border loyalty and on the self-emancipation term near his lines.
- *text*: the First Confiscation Act (6 August 1861) as the loss of a claimant's "claim to such labor", not a grant of freedom [SW 6.3], [UP 1.4].
- *refused*: euphemism for return (C5); the insurrection action [SW 6.8].
- Risks: agency, lost-cause.

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
- needs-source: emancipation in the District of Columbia (the notes say only that it "belongs to 1862" [SW 6.3]); colonization proposals (no note covers them). Neither is authored until sourced.
- Reasons: these are the president's own decisions in the record, so refusing them would erase the hardest choices of 1862. The record in section 4 (R7) settles how the consequences avoid both a karma button and a cynical unlock.
- Risks: scoring, hindsight, agency.

**`northern-racism-cost`** (added). Window: slice.
- *derived*: the bloc reaction to emancipation and Black enlistment includes racist opposition; the 1862 midterm causes include fear of freed Black labour and racist campaigning over the proclamation [UP 3.1]. The reason text names it as racist opposition.
- *text*: press reports describe a paper's racist campaign; they do not reproduce slurs (F2, F3).
- *refused*: a neutral "economic concern" framing of it; slurs in templates.
- Reasons: the cost was real and leaving it out would make emancipation politically free; naming it plainly keeps the game from laundering it.
- Risks: lost-cause, agency.

**`confederate-enslaved-labour`** (impressment). Window: slice for informal use; the Impressment Act of 26 March 1863 and the 1864 requisition of 20,000 workers are later [CS 4.2], [CS 3.4].
- *text* (slice): Confederate use of enslaved workers on the Sewell's Point works and the Charleston batteries, from Confederate payrolls (snippet) [SW 6.3]; Butler's own stated reason in his reports, that denying the Confederacy this labour was a military necessity [SW 6.3].
- *event* (later): the Impressment Act and the 1864 requisition, with locked consequences: escapes (the people's agency [CS 4.2]), owners' protests, harvest losses [CS 4.7].
- *derived*: no separate stat. Escapes from impressment count in `self-emancipation`.
- *refused*: a verb for either side; any field counting enslaved labour as a resource (a test forbids such field names); the census population is protected input, read only by derivations.
- The brief's proposal (no verb, no labour stat) stands.
- Risks: resource, agency.

**`slavery-as-wealth`** (added). Window: slice.
- *text*: the economists' account that Confederate wealth lay in land and enslaved people, which were illiquid [CS 3.3], appears only attributed and never alone, as the note warns.
- *refused*: any finance term that values enslaved people.
- Risks: resource.

### 3.3 Black military service

**`black-enlistment-1861-offers`**. Window: slice (April 1861 on).
- *event*: offers arrive as men's own acts: a Boston meeting, two regiments organised in Philadelphia, a Providence company, Jacob Dodson's offer of 300 men in Washington (23 April, snippet) [SW 6.4].
- *decision*: accept or refuse (S13 in [SW]). Locked costs: border-state loyalty, which Lincoln feared [SW 6.4], if accepted; the Radical bloc and abolitionists if refused. If accepted, regiments form through `black-enlistment`.
- *refused*: a recruit verb.
- Change from [SW 6.8] (which has policy refusing the offers): the player may accept. The men's agency is the source of the regiments either way; hard-coding refusal would remove a policy choice the record shows Lincoln faced. The 1792 Act's limit to white militia and the policy basis of the 1861 exclusion [SW 6.4] go into the option's text and costs.
- Risks: agency, resource, hindsight.

**`black-enlistment`**. Window: slice.
- *decision*: Cameron's report of late 1861 proposing to arm freed slaves, whose passage Lincoln cut in December 1861 (let it stand, strike it) [SW 6.4], [UE finding 5]; [U62] says Stanton reportedly drafted it. The Militia Act of 17 July 1862, the first law to admit Black men to the militia [UE 2.1], is a decision if Congress's bills are modelled as decisions, otherwise an event.
- *derived*: enlistment by free Black men and freedpeople, responding to policy, pay, treatment, Confederate capture policy and the reach of Union lines; never a pool in "men" (0026). The total of 178,895 Black troops [UE finding 3] is a calibration band for history runs, not a target.
- *refused*: a recruitment verb or rate dial; any pool; a goal or transfer field that selects forces by race; Black regiments as a reserve of labour the player assigns.
- needs-source: Hunter's 1862 regiment in South Carolina (the notes give only his emancipation order).
- Risks: resource, agency, scoring.

**`black-soldiers-pay`**. Window: slice (the Militia Act, 17 July 1862) to 15 June 1864.
- *record* (R2). Interim: *text* only (the pay, $10 a month less $3 for clothing against $13 for white soldiers [UE finding 3]).
- Correction to the brief: the brief says 0026 requires its own record. 0026 does not say so; the economy note recommends it [UE finding 3]. I adopt the recommendation.
- Risks: resource (the gap as a saving), agency.

**`black-sailors`**. Window: slice, from September 1861.
- *decision*: the Navy Department's policy of letting refugees enlist, held by Welles's seat by default; the player can order it through Welles [UN 1].
- *derived*: enlistment by the men's own choice. The navy works through posts and models no crews (0028), so today this is *text*; it becomes derived only if crews are ever modelled.
- *text*: about 10,000 Black sailors, about 17 percent of the navy's sailors [UN 1]. That the navy took freedpeople before the army is the note's interpretation [UN, findings].
- *refused*: a navy recruitment pool.
- Risks: agency, resource.

**`captured-black-soldiers`**. Window: slice for Seddon's instruction of 30 November 1862 and Davis's proclamation of 23 December 1862 (General Orders No. 111, 24 December); later for the January 1863 message, the joint resolution of 1 May 1863, the 54th Massachusetts captives, Lincoln's retaliation order of 30 July 1863 and the 1864–65 concessions [CS 4.4].
- *event*: the Confederate acts, with locked consequences on Union opinion and on Black enlistment. The proclamation named Butler's conduct at New Orleans as its reason [CS 4.4], [CS findings 5].
- *text*: the proclamation, quoted and cited.
- *refused*: an execute or enslave option for any seat; any Union gain conditional on it (D5).
- *record* (R4): retaliation.
- Risks: atrocity, agency.

### 3.4 The Confederate side

**`twenty-slave-law`**. Window: slice (11 October 1862).
- *event*: fires when Confederate conscription and the preliminary proclamation are both in state. Locked consequences: resentment among non-slaveholders ("rich man's war") in Confederate bloc terms; Escott's breach between planters and non-slaveholders is disputed, so the size is a band [CS 3.4].
- *text*: states the law's motive as its supporters gave it: keeping the enslaved labouring and controlled after the preliminary proclamation [CS 3.4].
- *refused*: a neutral "overseer exemption" framing [CS 4.7]; a Union lever that exploits it; a free choice by the Confederate rule seat, until the playable-Confederacy record (R1).
- Change from [CS 4.7] ("a political act with costs"): the costs stay, but in the Union game it is an event, not a rule-seat choice, because choosing it is choosing how to control enslaved people.
- Risks: lost-cause, resource.

**`confederate-habeas`**. Window: slice (Davis's suspensions; [CS 6] gives February 1862 and February 1864 but did not read a primary source).
- *decision* for the Confederate rule seat, symmetric with the Union's habeas decisions (0009, 0029), with locked costs on governors' friction (Vance's repeated habeas disputes, North Carolina courts' writs that the War Secretary refused, opposition by state leaders and some mobs) [CS 3.5, 4.5].
- needs-source: the dates and terms of the suspensions. Blocked until sourced.
- *refused*: framing the friction as "states' rights" apart from slavery [CS 3.5, 4.6].
- Change from [CS 4.7] (narrated with locked consequences): it is coercive policy, not an atrocity or an act on enslaved people, so the symmetric machinery applies; an event would make the Confederate government passive.
- Risks: lost-cause.

**`unionist-repression`**. Window: later for Shelton Laurel (January or February 1863; the source says February) [CS 4.5]; East Tennessee in 1861–62 is needs-source (not researched [CS 4.5]).
- *event*: repression and killings of Unionists fire from cause (Unionist resistance, conscription pressure), with locked consequences on regional loyalty and Confederate will. Vance's investigation is text [CS 4.5].
- *derived*: Unionist loyalty as a regional term; [CS 4.7] recommends Unionists as a bloc.
- *refused*: any option or initiative for any seat to order or permit reprisal killings; any Union gain conditional on the massacre. Lincoln's wish to occupy East Tennessee [U62] is an ordinary goal and is not gated.
- Risks: atrocity, agency.

**`bread-riots`**. Window: later (Richmond, 2 April 1863, about 5,000 people, mostly poor women; one of a series) [CS 3.4].
- *event*: a Confederate will term for home-front hardship, with women as political actors; *text*: the government's suppression of the news [CS 4.5].
- *refused*: a Union lever; a Confederate suppression choice until R1.
- needs-source: both facts are snippet-only [CS 3.4, 4.5].
- Risks: agency.

**`confederate-arming-enslaved`** (added). Window: later (Cleburne's memorandum December 1863; the law Davis signed on 13 March 1865; no enslaved man accepted) [CS 4.4].
- *text* only.
- *refused*: a pool in any resource; Black soldiers in Confederate force data (see the traps below).
- Risks: lost-cause, resource.

**`lost-cause-traps`**. The six traps in [CS 4.6], plus two from the other notes. Each becomes a refused framing with a check:

| Trap | Refused framing | Check |
|---|---|---|
| 1. "The feuds lost it" | Narrator or verdict text claiming that Richmond's dysfunction explains the outcome. Davis's feuds have mechanical effects without the game asserting the thesis (Woodworth against Gallagher) [CS 1.1, 4.6]. | H4; reviewer on Confederate text |
| 2. "States' rights" | The phrase as the cause of secession or of the Confederacy's difficulties. Governors' friction is described as what it was: conscription, impressment, habeas and the exemption of enslavers [CS 3.5]. | F2 pattern (fails outside cited quotation) |
| 3. "Black Confederates" | Black men as willing soldiers in Confederate ranks. They appear only as coerced labourers and body servants [CS 4.2]; no credible evidence of significant numbers fighting [CS 4.6]. | Force-data test: no Confederate force block with Black soldiers; F2 pattern |
| 4. "Loyal slaves" | Enslaved people loyal to the Confederacy. | F2 pattern; no loyalty value for any protected population |
| 5. Lee-centrism | Lee as the Confederacy's moral centre [CS 4.6]. | Reviewer |
| 6. Memoir sources | Davis's *Rise and Fall* (1881) or Johnston's *Narrative* (1874) as evidence [CS 4.6]. | A6 source policy |
| 7. (added) "Coercion" as narrator framing | Virginia and the upper South "leaving over coercion" in the narrator's voice; governors' quotations may say it [SW 6.1]. | F2 pattern; reviewer |
| 8. (added) "Servile war" or "racial war" as narrator framing | The British reading of the proclamation [CS 3.1] and the "fears of racial war" in Gallagher's list [CS 2.1] appear only as attributed contemporary or scholarly views. | F2 pattern; reviewer |

### 3.5 Civil liberties and public violence

**`union-habeas-and-arrests`**. Window: slice (the 1863 act is later).
- *decision*: the habeas order of 27 April 1861 (S7 in [SW]); Merryman (obey, defy, seek legislation; S8) [SW 6.6]; the standing arrest policy as an order through the seat that ran it (which seat ran the 1861 arrests is needs-source: [U62] lists Seward's internal-security arrests as "needs research"; Stanton's order of 8 August 1862, with at least 350 arrests in the following month [UP 4.3]); the habeas proclamation of 24 September 1862 [UP 1.5]. Locked costs: Democrats, border-state trust, and accountability when Congress next sits (0040's chamber state).
- *event*: arrests made by holders under the policy, each with its own cost (Marshal Kane, 27 June 1861; the Baltimore police board, 1 July; Mayor Brown and 31–33 legislators, 11–12 September 1861 [SW 6.6]); Taney's rulings (28 May oral, 1 June written) [SW 6.6]; Charles Stone's arrest on 8 February 1862 (9 and 12 in other sources) and six months without trial [UP 1.3] (added).
- *derived*: the arrest count is a calibration band for history runs (13,000 to 15,000 over the war [UP 4.3]), never a score.
- *refused*: arrests made free by not being noticed; arrests that raise loyalty without cost; one card per arrested person (bookkeeping of the kind 0040 bans for patronage).
- Note: [SW 6.8] calls Taney's defiance "a fixed event" while its S8 lists options. The ruling is the event; the president's answer to it is the decision.
- Risks: scoring, hindsight (the 1863 indemnity act must not be implied in 1861 text).

**`press-suppression`**. Window: slice (telegraph censorship from April 1861; the New York grand jury presentment of 16 August 1861 and the Post Office's refusal to carry the papers) [SW 5], [UP 4.1, 4.3]. The Chicago Times (June 1863) and the World and Journal of Commerce (May 1864) are later [UP 4.1, 4.3].
- *decision*: raised as a situation or issued as an order through a holder (the Postmaster General, a department commander), with locked costs on the Democratic blocs and the press's belief [UP, design implications].
- *event*: mob attacks on papers (111 wrecked by mobs, mostly in the North, per one essay [UP 4.3]; the Baltimore *Wecker*, a Philadelphia crowd, Concord in 1861 [SW 6.6]). Never caused by a player verb.
- *refused*: a "suppress paper" verb; mobs as an instrument of any seat.
- Change from the brief's proposal ("a lever with a locked cost"): the locked cost stands, but it is a decision or an order through a holder, because the verb list cannot grow. Conflict between the notes: [SW 6.8] places "press suppression and mobs" as narrated only; [UP] models suppression. This ruling models government suppression and keeps mobs as events.
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
- *event*: Pratt Street, 19 April 1861 (12 civilians and 4–5 soldiers per McPherson; the NPS gives 11 and 16 on different pages) and Camp Jackson, 10 May 1861 (at least 28 civilians) [SW 6.7]. These are outcomes of situations about routes and the militia camp (S7 and S10 in [SW]), resolved by the kernel from a named stream with locked consequences. Text shows the ranges (F4).
- *refused*: an option to fire on a crowd; any benefit conditional on the deaths.
- Risks: atrocity.

**`guerrilla-war-west`** (added). Window: slice (Missouri sabotage and executions in July 1861; sustained guerrilla war and Lane's Osceola raid from September 1861 [SW 6.7]; Frémont's martial law of 30 August 1861 [U62]).
- *derived*: guerrilla pressure on loyalty and supply (0029).
- *event*: raids on civilians and reprisals by either side's commanders, from their seat data, with locked consequences.
- *decision*: the president's reply to a commander's martial-law order (Frémont's).
- *refused*: goal postures or raid targets aimed at civilians (raids strike rail, river edges and depots, 0029); reprisal as a lever.
- *record* (R6) for commanders' conduct toward civilians. needs-source: the Osceola raid's details; the terms of Frémont's martial law beyond its emancipation clause.
- Risks: atrocity, lost-cause (romantic raiders).

**`occupation-orders`** (added). Window: slice (Butler's General Order No. 28, 15 May 1862; his removal 16 December 1862) [U62], [CP].
- *event*: a commander's order from his seat, with locked consequences on foreign patience and the press (the order caused international outrage [U62]); Davis's December proclamation cites Butler [CS 4.4]. The president's reply uses the ordinary relieve verb.
- *refused*: occupation severity as a player lever.
- needs-source: the execution of Mumford (a search summary only [CS findings 5]). *record* (R6).
- Risks: atrocity, lost-cause.

**`fort-pillow-and-jccw`**. Window: later for Fort Pillow (12 April 1864) and the committee's reports on it (1864) and Sand Creek (1865) [CS 4.4], [UP 1.3]; slice for the committee itself (created 9 December 1861) and Stone [UP 1.3].
- *event*: the Fort Pillow massacre, with locked consequences; *text*: the committee's reports as authored reports of an investigation seat (0032) [UP, design implications 3].
- *refused*: any Confederate option that permits it; any Union gain conditional on it.
- The Sand Creek massacre itself is not in the notes: needs-source, and it falls under R3. Retaliation falls under R4.
- Risks: atrocity, agency.

**`prisoners-and-exchange`** (added). Window: mostly later. 0021 puts prison camps in the gate; the notes cover only the 1863 exchange talks and Lee's 1864 offer [CS 4.4]. The 1862 exchange arrangements are not in any note.
- *record* (R4); needs-source.
- Risks: atrocity, agency.

### 3.7 Native nations

**`indian-territory-1861`**. Window: slice.
- *event*: the Union abandons its posts (Fort Washita mid-April, Arbuckle 3 May, Cobb about 9 May 1861); Pike's treaties with the Creek (10 July), Choctaw and Chickasaw (12 July), Seminole (1 August) and Cherokee (7 October, outside [SW]'s window, signed by Ross after much negotiation) [SW 6.5], [CS 4.5]. Ross's neutrality, Stand Watie's commission and Opothleyahola's loyalists (with Black Creeks and enslaved people) moving toward Kansas, with the fights of 19 November, 9 December and 26 December 1861, are the nations' own choices, shown through their effects [SW 6.5].
- *text*: more than 7,000 enslaved people in Indian Territory, about 14 percent [SW 6.2]; the text does not erase slavery there either.
- No Union decision in 1861 [SW 6.8].
- *refused*: any verb for either principal to recruit Native nations or treat them as a manpower pool; a Confederate treaty decision until R3.
- Risks: agency, resource, lost-cause.

**`dakota-war-1862`** (added as a separate entry). Window: slice (18 August to 26 September 1862; 358 settlers and about 113 soldiers and militia killed; a commission sentenced 303 Dakota men to death; Lincoln reviewed the cases personally and 38 were hanged at Mankato on 26 December 1862; the source also gives 39) [MX]; Pope went to the Department of the Northwest in September 1862 [U62].
- *record* (R3) and needs-source. The Department of the Northwest may exist as a post; nothing about the war is authored.
- Reasons: 0026 names it; [SW 6.8] refuses it until its own record; [UP findings] asks for a lane and a record; the facts come from one Wikipedia article [MX]. The review of the sentences would put a choice of who is executed on the player's desk, the gravest case of "Is this a lever?".
- Risks: atrocity, agency, scoring, hindsight.

### 3.8 Navy and economy

**`black-sailors`**: in 3.3.

**`prize-money-and-cotton`**. Window: slice for prizes; later for the Red River cotton (1864).
- Ruling: prize money ($25 million over four years [UN 5]) is not gated: an ordinary motive term in flag officers' compliance. Cotton as a commodity in the blockade and foreign clocks is not gated. The Porter–Banks race for cotton on the Red River [UN 6] is ordinary army–navy friction.
- *refused* (gated facet): any Union lever that directs the labour of freedpeople on captured plantations or in cotton. No note covers Union plantation policy, so any such feature is needs-source and needs a record before it is designed.
- Reviewer note: cotton text should not present the crop as if nobody grew it.
- Risks: resource (only if labour enters).

### 3.9 Victory and defeat

**`verdict-text`**.
- Proposal in the brief and [CS 4.7]: Confederate victory text must say that independence meant slavery's survival.
- Ruling: every verdict in which the Confederacy is not defeated (the 1864 election lost, or Union will collapsing before it, 0028) carries two required clauses: (1) what the Confederacy was founded to protect, quoted with citations from its constitution or declarations [SW 6.1], [CS 4.1]; (2) slavery's status in the game's state at the end, derived (where self-emancipation, Union policy and Union armies had ended it, and where it stood). It predicts nothing about the peace or what the winner would have done, as 0026 requires for the 1864 verdict. The Union-victory verdict carries clause (2) and names self-emancipation and Black military service among its terms when they are non-zero (H3).
- Change: grounding the clause in the founding documents and the end state, rather than a forecast, keeps it compatible with 0026's "no claim about what a McClellan administration would have done", and extends it to the 1864 verdict. That extension needs the lead's ruling (R5).
- Risks: lost-cause, scoring, hindsight.

## 4. Records needed

The lead writes these; each states the question the record must answer and this lane's recommendation.

| # | Record | Question it must answer | Recommendation |
|---|---|---|---|
| R1 | A playable Confederacy under the gate (already required by 0026 and 0029) | (a) the Confederate player's verbs; (b) whether any verb acts on enslaved people; (c) victory and defeat text from the Confederate side; (d) blocs: planters, non-slaveholding whites, Unionists, with enslaved people as agents shown through their effects, never a managed bloc; (e) the first-hand sources that voice enslaved people's agency [CS 4.7]. Also: whether the Twenty-Slave Law, impressment, Confederate habeas and the Native treaties become the Confederate seat's choices or stay events. | (b) none, as [CS 4.7] recommends; the Twenty-Slave Law and impressment stay events; habeas becomes a decision; treaties wait for R3. |
| R2 | Black military service | Is the pay gap ($10 less $3 against $13, 1862 to 15 June 1864 [UE]) a fixed condition shown as text and a derived grievance, or a decision the president can press on Congress? Is the money difference modelled at all? How do duty assignments and officer policy enter (needs-source)? How does Confederate capture policy feed enlistment? | A decision to press Congress for equal pay, with locked political costs; the money gap is not modelled as a saving the player banks; grievance and enlistment are derived. |
| R3 | The wars against Native nations | Is Lincoln's review of the Dakota death sentences a player decision, and if so which options and locked costs keep any option from paying? How are the nations represented (seats, data, blocs)? Which sources voice the Dakota and the Indian Territory nations? What research is needed first (the war's causes, the 38 or 39 count, Indian Territory in 1862, Sand Creek)? | A research lane first. Then the review as a decision whose consequences are only the responses of real actors (Minnesota's officials, the Senate, the press), with locked costs on every option and no option that improves any player-facing measure; nations as seats or data whose choices are their own. |
| R4 | Prisoners, exchange and retaliation | Can retaliation (Lincoln's order of 30 July 1863 [CS 4.4]) ever be a decision? How do exchange and prison camps enter? How do the Confederate rules on captured Black soldiers interact with them? | A research lane first. No retaliation option whose execution pays; exchange as a decision through the War Department's seat with locked costs; camps as events and text. |
| R5 | Verdict text under the gate | Must the 1864 verdict (and any verdict in which the Confederacy is not defeated) state, from cited sources, what the Confederacy was founded to protect and slavery's status at the end? This clarifies 0026 and 0028. | Yes, as in 3.9: factual clauses, no prediction. |
| R6 | Civilians, guerrilla war and commanders' conduct | Is a commander's treatment of civilians (martial law, occupation orders, reprisals) seat behaviour from his values with locked consequences? Which goal postures and raid targets are refused? How does the president reply? | Seat behaviour with locked consequences; no civilian-targeting posture or target in the schema; the reply through relieve, pressure and orders. |
| R7 | Emancipation as policy | Which decisions exist in 1861–62 (Frémont, compensated emancipation, Hunter, the Second Confiscation Act, the proclamation, the District of Columbia, colonization), what each moves, and how the consequences avoid both a virtue score and an unlock that pays? | The decisions in 3.2, with consequences only on modelled actors (blocs, border states, foreign clocks, the Confederate seat) and on the derived agency terms; no player resource rises directly; District of Columbia emancipation and colonization researched before they are placed. |

## 5. Lane 0.7 handoff

The engine holds the mechanism; the pack holds every Civil War word (rule 3, 0024). The testbed pack carries a small fictional register, one topic per placement, so every test runs on it.

### Engine schema (packages/kernel, generic)

| Field | On | Purpose | Checklist |
|---|---|---|---|
| `gate: { topics: TopicId[], placement: Placement, risks: RiskId[] }` or `gate: { none: reason }` | situation, option, event, initiative entry, post policy, derived-term declaration, report template, in-world string, verdict template | The tag. `Placement` is the six-value enum of section 1; topic and risk ids must exist in the pack's register. | A1–A3 |
| `gateReview: { reviewer, date, checklistVersion, contentHash }` | every gated item | Sign-off. `contentHash` is over the item and its strings in lane 0.1's canonical serialization; any edit or checklist version bump voids it. | A7 |
| `citations: SourceId[]` | every gated item | Resolve to the pack's sources table and its source policy. | A5, A6 |
| `earliest: Date` | gated in-world strings, events, situations | Compared with topic windows and the anachronism list. | A4, C3, F6 |
| `proposedBy: PersonId[] \| 'inaction'`, `displayKey` | option | Advisers' wording and neutral order. | C1, C2 |
| `lockedCosts: Effect[]` | gated option, lever | Non-empty; `Effect` here has no condition or chance field. | B5, D2 |
| `holder: PostId` | lever | Who carries it out. | D1 |
| `scope: 'narrator' \| 'voice' \| 'quotation' \| 'out-of-world'`, `quotation: { speaker, citation }` | string entry | Which patterns apply; quotations are exempt from F2 only with a citation and a reviewer note. | F1–F3, F8 |
| `protected: { topic }` | world-field declaration, population entity | No verb, option, initiative, goal or setup effect may target it; only derivations read it. | B3, D3, E2 |
| `reasonType` | derived-term declaration | Must be one of the register's agency types for slavery and Black-service topics. | E3 |
| `requiredClauses: StringId[]` per outcome class | verdict template | The clauses of 3.9. | H2, H3 |
| `premise: true` | scenario item | Immutable by setup. | G2 |

Loader rules: refuse gated items without a valid review outside a drafts folder; refuse items tagged with topics in `record` status or flagged needs-source; refuse setup options whose targets include gated items or protected fields.

### Pack files (`packs/<pack>/gate/`)

- `register.json`: one entry per topic: id, class, window, allowed placements, refused-facet signatures (field-name patterns, forbidden targets, forbidden verb shapes), agency reason types, needs-source flag, status, sources. Section 3 is its first content.
- `classes.json`: the pack's topic classes, each marked whether it is atrocity-class. For this pack: cause and aims; slavery and emancipation; Black military service; atrocities (massacres of surrendered soldiers, killings of civilians and prisoners: atrocity-class); guerrilla war; civilians; prisoners; Native nations; civil liberties; riots and mobs.
- `forbidden.json`: patterns with scope, severity (`fail`, or `review`, which forces a reviewer note) and reason. Starting set:
  - *fail outside quotation*: "states' rights" and "states rights"; "War of Northern Aggression"; "Lost Cause" in any in-world string; "loyal slave(s)", "faithful slave(s)", "faithful servant(s)", "happy slave(s)"; "Black Confederate(s)"; "contraband" as a noun for people outside quotation marks; resource words ("pool", "stock", "supply", "count") attached to a protected group; the slur list (kept in the pack, not in this document).
  - *fail in option labels and in-world narrator*: "historically", "as history records", "as Lincoln did", "the historical choice", "in hindsight", "would later", "turning point"; "the right thing", "humane", "shameful", "noble", "righteous", "heroic".
  - *review*: "slaves" as a narrator noun (prefer "enslaved people"); "owner" or "master" of people (prefer "enslaver"); "servant(s)"; "property" near a protected group; "coercion" in narrator text; "servile war", "racial war"; "lost because of", "overwhelming numbers", "failure of will" in verdicts.
- `anachronisms.json`: term, earliest in-world date, source. Starting set from the notes: "contraband" for refugees 24 May 1861 [CS 4.3]; "Cornerstone" speech 21 March 1861 [SW 6.1]; "Confiscation Act" 6 August 1861 and "Second Confiscation Act" 17 July 1862 [UP 1.4]; "Joint Committee on the Conduct of the War" 9 December 1861 [UP 1.3]; "Militia Act" (of 1862) 17 July 1862 [UE 2.1]; "Emancipation Proclamation" 22 September 1862 for the preliminary, 1 January 1863 for the proclamation [CS 4.3]; "Twenty-Slave Law" 11 October 1862 [CS 3.4]; "Dakota War" 18 August 1862 [MX]; "Enrollment Act" 3 March 1863 [UP 1.4]; "draft riots" 13 July 1863 [UP]; "Fort Pillow" as a massacre 12 April 1864 [CS 4.4]. "Lost Cause" is barred from all in-world text (the literature is postwar [CS 4.6]). "Copperhead" needs a sourced first date.
- `triggers.json`: words whose presence requires a gate tag or `gate: none` (A1): enslav-, slave, slavery, freedm-, freedpeople, contraband, fugitive, Black, colored, emancipat-, abolition, massacre, atrocity, execut-, hang-, prisoner, habeas, arrest, martial law, suppress-, riot, mob, guerrilla, insurrection, servile, Indian, Dakota, Creek, Cherokee, Choctaw, Chickasaw, Seminole, Native.
- `source-policy.json`: banned as evidence (the two memoirs [CS 4.6]); weak and never sole (blogs flagged in the notes, snippet-only citations, the `cavac.at` mirror [CS findings 1]).
- `checklist.json`: the version and the question ids of section 2. Bumping the version voids every sign-off, on purpose.

### Tests (mechanical questions)

| Test | Checks |
|---|---|
| gate-tag | A1–A4, B4, D4: tags present on trigger matches and protected-field effects; placements allowed; no `record` or needs-source topic loadable; windows open on `earliest`. |
| gate-review | A7: sign-off present, version current, hash matches. |
| gate-sources | A5, A6: citations resolve; none rests only on a banned or weak source. |
| gate-situation | B1, B2, B5, B7: required fields; cause not a bare date unless a labelled railroad; locked costs present and unconditional; delegates share the option set. |
| gate-targets (graph) | B3, D3, D5, E2, G1, G3: no effect of a verb, option, initiative, goal or setup option targets a protected field or gated item; no resource has a contributor from a protected population; no positive effect is conditioned on an atrocity-class event; no field name matches the refused signatures (for example a labour or slave stock). |
| gate-wording (pattern) | C3, C4, F2, F5, F6, H4: forbidden patterns by scope; anachronisms by `earliest`. |
| gate-order | C2, B9: the presenter never reads the historical default (architecture); across gated situations the default does not sit in one display position. |
| gate-derived | E1, E3, E4, E5: derived gate terms have no writer, carry agency reason types, are absent from the meter registry, and appear in explanations when non-zero. |
| gate-text | F1, F3, F4, F7: authors and routes; quotations cited; disputed numbers stored as ranges; voice requests tagged with passing fallbacks. |
| gate-setup (run) | G2, G4: premise items immutable; presentation options leave a seeded run's state hash unchanged. |
| gate-verdict | H1, H2, H3, H5: required clauses present per outcome class; typed terms in every verdict; no virtue, morality or karma field in the schema. |
| gate-confederate-forces | Trap 3: no Confederate force block carries Black soldiers. |

## 6. Changes from the brief's proposals, and conflicts settled

| Topic | Proposal | Ruling | Why |
|---|---|---|---|
| Self-emancipation | A derived loss only, never a lever | Derived, never a lever; also the cause of Union policy decisions; worded as the people's act, not the enslaver's loss; no Union gain stock | A loss-only term frames freedom from the enslaver's ledger |
| Confederate victory text | Must say independence meant slavery's survival | Required clauses quoting the founding documents and stating slavery's status at the end; no forecast; extended to the 1864 verdict (R5) | Keeps 0026's "no claim about what the winner would have done" |
| Press suppression | A lever with a locked cost | A decision or an order through a holder, with a locked cost; mobs are events | The verb list cannot grow (0016, FOUNDATION section 5) |
| Twenty-Slave Law | (none; [CS] proposed a political act) | An event in the Union game; the Confederate seat's choice waits for R1 | Choosing it is choosing how to control enslaved people |
| Confederate habeas | (none; [CS] proposed narrated with locked consequences) | A symmetric decision for the Confederate rule seat, needs-source | Coercive policy, not an atrocity; 0009 |
| Black enlistment, 1861 | Unreviewed ([SW]: policy refuses the offers) | The player may accept, with locked border costs; regiments still come from the men's choices | Hard-coding refusal removes a real policy choice |
| Unequal pay | "0026 says it needs its own record" | Needs its own record (R2), but the recommendation is the economy note's, not 0026's | Attribution checked against 0026 |
| Impressed labour | No verb, no labour stat | Agreed; census population allowed only as protected input to derived terms | A precise line for the test |
| Press and mobs ([SW 6.8] against [UP]) | Narrated only, against modelled | Government suppression modelled; mobs events | Suppression was presidential policy; mobs were nobody's lever |
| Merryman ([SW 6.8] against S8) | Fixed event, against options | Taney's ruling is the event; the answer to it is the decision | Both readings kept, one per facet |

## 7. Research needed before authoring

Placements above that stay blocked until a research lane sources them: the dates and terms of Davis's habeas suspensions; Confederate repression in East Tennessee in 1861–62; the bread riots (snippet-only); the government's response to the draft riots and the 1862 Wisconsin draft resistance; Seward's advice to wait for a victory (the staff recommendation for the proclamation); emancipation in the District of Columbia; colonization proposals; Hunter's 1862 regiment; the Osceola raid and the terms of Frémont's martial law; Mumford's execution; the 1862 exchange arrangements and prison camps; Union plantation and labour policy for freedpeople; the Dakota War (causes, the 38 or 39 count, from a primary source); Sand Creek; Indian Territory in 1862; Black sailors' service conditions; Black soldiers' duty assignments and officer policy; the first date of "Copperhead".
