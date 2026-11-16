# 0074: The gate for 1A: capture in battle, the values that touch slavery, and the leaders' own words

Status: accepted (2026-11-16). Amends 0063. Amended by 0082 (a chosen policy applies its row's pushback through the owners: who carries the floor's difference, an unpaid floor recorded, and inaction's own policy). From:
- lane 1.8's draft R4 ruling (`notes/lane-1.8-gate.md` section A);
- lane 1.9's cast research (`docs/research/2026-11-16-cast-1861.md`);
- the separate gate review (`review-gate-1861.md`);
- the standing reviewer's mechanics and citation reviews (`review-gate-register-1861.md`, `review-research-cast-1861.md`).

Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Carries out 0073's gate work for milestone 1A.

## Context

0073 asked for R4's ruling on capture in battle before lane 1.3, the battle model, merges. Lane 1.9 found motives the people format's ten values cannot hold, and two of them concern slavery. The gate reviewer read both, endorsed the lead's provisional rulings, and asked for more.

## Decision

**Capture in battle (R4's battle ruling; narrows SENSITIVE-HISTORY 3.6).**
- **A new open topic, `capture-in-battle`** (class prisoners; placed as event and text), holds:
  - capture in battle and in pursuit;
  - a cut-off force's surrender, garrisons included;
  - a captured commander.

  `prisoners-and-exchange` stays in `record` for R4 proper, with its held facets as refused signatures.
- **Surrender is the cut-off commander's own act,** from his seat and traits. No verb, option or goal captures, or names what becomes of the captured.
- **The captured leave play in 1A** as a typed loss in the battle record, and a captured commander keeps the status `captured`. No seat holds, spends, trades, exchanges or paroles a prisoner stock, pool or count.
- **A capture notice may state the terms the record gives for that force,** cited: paroled, held, or allowed to leave. No option, initiative, effect or field acts on those terms.
- **A captured count is the losing side's loss, never the captor's holding.** No derived term reads prisoners held as a gain.
- **Casualty returns** keep killed, wounded, missing and captured apart, and give disputed numbers as cited ranges.
- **Only soldiers in force blocks are captured.**
  - Civilians, enslaved people, and Black teamsters and servants are never captured by the battle model.
  - People who reach Union lines fall under self-emancipation and fugitive policy.
  - Killing the captured is never a choice (rule 1).
- **R2 and R4 proper re-rule capture before the first Black unit exists in force data.** That re-ruling also covers any Black teamsters or servants taken at Bull Run, if research finds them.

**Values.** These are pack vocabulary, in lane 1.1's format.
- **The Union pack gains six terms:**
  - `state_autonomy`;
  - `slavery_defence`;
  - `slavery_noninterference`;
  - `free_soil`;
  - `native_state`;
  - `fugitive_defence`: opposes returning people to slavery, with no aim against slavery where it exists. Return and exclusion orders offend it.

  `abolition` keeps its narrow meaning, an aim against slavery where it exists. `honour` is not adopted.
- **`slavery_defence` and `slavery_noninterference` only cost.**
  - Honouring one never raises its holder's willingness, regard or standing. It never relieves a grievance or speeds its decay, and it never adds a positive term to his compliance.
  - Offending one brings pushback or a grievance.
  - The holder's own conduct toward fugitives (his pack data and values, SENSITIVE-HISTORY 3.2) never raises a measure of his own side. Its consequences are those of 0046's `return` ruling. 0046's border-loyalty gain on the president's `return` option is untouched.
- **The mechanics.**
  - The vocabulary marks both terms with a generic `costOnly` flag.
  - A kernel test asserts that no `costOnly` value yields a positive term on its holder's willingness, regard, standing or grievance relief (rule 7).
- **The map from orders to values is gate content.** Its fugitive-policy rows carry the `fugitive-policy` tag and the gate reviewer's sign-off. By construction, it never makes `return` cheaper in pushback than `approve-holding`.
- **`state_autonomy` is one term for both sides.**
  - Its reason text is tagged `cause-of-secession`, never says "states' rights", and quotes the holder's own cited words.
  - A Confederate holder never carries it without `slavery_defence` where his own words give that. Where that evidence is weak, the cell becomes a research lead, never a silent drop.
- **`native_state`:** text that uses it quotes the holder, and never narrates his choice as the game's judgement of his character.
- **A value is coded only on the holder's own motive, never on a policy he carried out.** Harney's 14 May 1861 letter, for example, rests on Lincoln's stated views.

**The leaders' own words.**
- **What and where:** quotations of the Confederacy's founders on slavery (Davis on 29 April 1861, Stephens, Toombs, Harris, Benjamin, Brown) and Lee's 1856 letter enter play under `cause-of-secession`, as text only.
- **The form:** verbatim, cited and attributed. Never in an option label, generated voice, a value's reason template or narrator text.
- **No excerpt drops a passage's slavery content:**
  - Lee's letter never appears without its "painful discipline" passage and its turn to Providence;
  - Davis's "let alone" never appears without the same message's slavery passage.
- **Stephens's speech** is cited as a reporter's sketch, never as verbatim.

**Decisions about atrocity-class orders and sentences (amends 0063).**
- **Every option** restricts, suspends, refers or revokes the order or sentence.
- **Letting it stand is only the `inaction` outcome.** Its terms fall under E7, and its text states that the matter was before the president and he did not intervene.
- **The lever sweep (D6)** reads such an inaction outcome as if it were a `watched` option. It reports it when it is the bot's best choice in more than a quarter of seeds.
- **The Dakota review** is R3's to decide, not this rule's.

**The lead's earlier rulings, endorsed and extended.**
- **Pratt Street:**
  - The deaths are their own atrocity-class notice, which names its `actingSide`.
  - S12's trigger, and the bridge-burning event that closes the route, read the route's closure in State, never the deaths notice.
  - The same applies to S14 and Camp Jackson.
  - A Northern rally after the attack on the 6th Massachusetts, if modelled, is a separate non-atrocity notice under a `riots-and-mobs` topic, registered first.
- **Sources:**
  - Davis's *Rise and Fall* and Johnston's *Narrative* are banned as evidence.
  - Every other memoir key enters `PROVENANCE` marked weak, in the same merge.
  - The retrospective chapters of Welles's diary get a page-scoped key of their own.

Rejected:
- **Capture as a placement on a facet of the held topic.** It needs a change to the gate machinery, for no gain over a second topic.
- **Capture ungated.** Surrender notices and casualty returns would escape the gate reviewer.
- **A prisoner stock kept for later, or the captured returned after a fixed time.** The first is what a seat trades; the second is parole by another name.
- **Silence on a surrender's terms.** It misstates Camp Jackson and Rich Mountain, and frames by omission.
- **Dropping the slavery values.** The Confederate leaders would carry only `state_autonomy`, which puts the states'-rights frame (trap 2) into data, and R7's pushback from commanders would have no mechanism.
- **A separate stance system** for one topic.
- **Slavery values that could be honoured as well as offended.** Ordering fugitives returned would then buy a general's obedience.
- **Widening `free_soil`** (it would miscode Lincoln and Bates), **or coding these men as `abolition`** (the window's evidence does not support it).
- **"Let it stand" as an option.** It is a confirm option under another name.

## Consequences

- **Lane 1.8's fix pass,** in its own files:
  - the gate review's B1 (a refusal for ever of killings without trial, the widened parole pattern, ten triggers), S1 to S6, and N2;
  - outside `gate/`: a lowercase rule for field and option ids in the situation schema, and the source policy enforced on every pack citation, `people.csv` included.

  The gate reviewer and the standing reviewer then re-check it, and the steward merges it.
- **Lane 1.9** empties Harney's `slavery_noninterference`, and codes `fugitive_defence` from the evidence it has already read.
- **Lane 1.3** merges under the battle ruling once it is reviewed.
- **Lane 1.5** builds the `costOnly` flag and its test, and the gated map from orders to values.
- **Lane 1.11:**
  - enters the six terms;
  - follows the text and quotation rules;
  - registers `riots-and-mobs` before any Northern rally;
  - adds the memoir keys as weak.
- **R6, when it is recorded,** carries the gate reviewer's boundary: an order that directs killings, burnings or collective reprisals (assessments laid on a community, banishment, hostages) is atrocity-class and carries both topics.
- **R7, when it is recorded,** drops the `fund-a-scheme` option (SENSITIVE-HISTORY 3.2).
- **Research** (lane 1.10's list):
  - who fired at Pratt Street;
  - Claiborne Jackson's statements on slavery in 1861;
  - the terms of the Camp Jackson, Rich Mountain and Lynde surrenders;
  - verification of the Custis estate details.
