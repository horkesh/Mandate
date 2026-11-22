# S66 proposal: regiments inside brigade-sized force blocks

22 November 2026. **Proposed ruling [I], not accepted canon or an implementation.** Read with [the research note and registers](../research/2026-11-22-S66-july-armies.md). S66 changes documents only. Implementation waits for the lead's ruling and S62/S65 integration plus commitment of the staged S46/S52/S64 work, as the lead required.

Recommend a **regimental component register owned by `forces`, carried inside brigade-sized blocks**. Regiments retain their identities and individual service obligations; the daily moving/fighting unit remains the block. Army commanders organise what has actually reached them. The President orders people through the existing transfer/compliance path and receives their papers. Historical organisations are sourced preferences, not scheduled State mutations.

## Constraints and code read

0033 retains brigade-sized blocks, divisions as the army grows, sender selection on transfers and about 100 microseconds per block per day. 0073 makes recruitment one proposal applied across `forces`, `movement` and `command`; `people` owns status and simultaneous rank kinds. 0020 keeps true stats hidden and generated officers contingent on relevance. 0064's ownership, unknown-strength and movement rules remain binding. No budget, unknown-strength criterion, command knowledge boundary or one-writer rule is waived.

This recommendation reads the **staged S64 filesystem**, not this branch's older kernel and not S65's worktree. File hashes are in the source receipt. Relevant existing boundaries:

| Read-only path in `C:/Pyrrhic/sprint-1a/packages/kernel/src/` | What exists |
|---|---|
| `forces/forces.ts`: `ForceBlockState`, `sumStrength`, `applyForces` | A block has one arm, aggregate strength/condition/stores; unknown strength stays unknown. |
| `forces/enlistment.ts`: `Enlistment`, `MusterDelta`, `applyMusters` | Enlistment is currently one block record with raising post/person, call, regiment count, entry day and expiry; service/quantify/renew are explicit proposals. |
| `tick/recruitment.ts`: `raisedBlockId`, `recruitmentPhase`, `stateForcesPhase` | One levy produces a statewide block at the governor's seat. The institutional service transfer is distinct from a geographical movement. |
| `tick/verbs.ts`: `case 'transfer'` | On the sender's answer, willingness selects strongest first, unwilling compliance weakest first, reinterpretation reduces the requested amount. The actual result orders joining movement. |
| `command/command.ts`: `transferForce`, `commandedBlocks`, `createTemporaryPost`, `dissolveOperation` | Whole blocks are chosen, assignments change, detachments elsewhere stay behind. Corps are bundled. Existing creatable posts are temporary and dissolve with their operation. |
| `movement/join.ts`, `tick/operations.ts`: `orderJoins`, `joinStep` | A transfer orders travel to the receiving post's seat; graph routes, ground/control and actual daily legs govern arrival. |
| `forces/detachments.ts` | Splitting requires a known quantity and conserves strength/stores. An unknown parent cannot yield an invented number of men. |

The current levy block has **no regiment identities**. Its block-level expiry cannot describe a brigade containing different service terms. Merely renaming a batch would leave both defects. Current transfer selection also cannot select part of a batch as a historical regiment. Those are future interface/schema changes, not capabilities claimed to exist today.

## 1. Identities and quantities

**Recommend [I]:** immutable pack catalogue records for sourced regiment identities and aliases, with dated source observations. Dynamic component lots belong exclusively to `forces`. Each lot has a stable identity, actual game raising post/person and call/act, arm, original/current service obligation, and current men/stragglers when known. A partial company group is a scoped lot of the same regiment, not another full regiment. An unidentified cohort remains unidentified; a proposal must never assign all the units of one state to it.

`forces` also owns the partition of lots into force blocks. Each lot belongs to exactly one block; a split conserves its component share. Regiments inherit their block's location and commanding post. **There is no separately saved regiment location or regiment-to-commander table.** To move a lot independently it first becomes a separate provisional block/detachment through the existing three-owner proposal boundary.

Use lot quantities as the single authoritative men/straggler values. **Block totals become derived**, with unknown component IDs retained in every sum. This requires replacing current authoritative `fbStrength`/`fbStragglers` reads with an aggregate interface; do not save both a component sum and an independently writable block total. A Derived index may retain the aggregate between mutations, rebuild on load, and invalidate on a force proposal. Component enlistments likewise replace authoritative block expiry; an optional block summary is derived. `forces` remains the sole writer. Morale/equipment and stores may remain block condition until a split/join proposal conserves or blends them; no second owner may adjust them directly.

Muster proposals create only the regiments supported by the call and response, in provisional brigade-sized bundles, separated by arm, location and service obligation. A pack-supplied **four-regiment planning bundle** is recommended for unorganised infantry [I], not asserted as a historical norm. Actual named brigades retain their sourced membership and can contain more or fewer. Unknown quantities remain null; the catalogue supplies identity, not men. Unmatched generated cohorts are retained as anonymous lots instead of acquiring unsupported famous names.

Block combat/attrition proposals distribute changes to known component quantities with a documented deterministic integer rule and stable-ID remainder ordering [I]. That allocation is a model consequence, never a reconstructed historical return or a historical claim about which regiment suffered the losses. Unknown strength cannot be manufactured by loss allocation. Splits of unknown or unallocated quantities remain refused/held. Before a named block fights, the existing unknown-strength check must be satisfied by its represented quantities; this research supplies no new numerical allocation.

**Reject:** one full daily force block per regiment; one permanent giant state block with cosmetic labels; a parallel historical army added over the levies; duplicate saved block/component totals; regimental strengths obtained by dividing a brigade/army return; and a surname match turning S64's partial battalions into full July regiments. The component design is a real schema/reader migration and needs its own accepted writer table, save migration and invariants before implementation.

## 2. Muster to field army

**Recommend [I]:** retain the transfer verb and its sender compliance. A rule-seat or principal requests a force from the actual raising/sending commander to the field commander. The receiver's historical roster may guide what he asks for, but the sender chooses what he supplies from his available units, with his own willingness, refusal, delay and reinterpretation. A requested count/strength is not a menu of regiment IDs for the President.

The sender's implementation may partition provisional bundles into conserved lots at dispatch. It chooses deterministically from eligible actual components and rebundles them for transport. Command changes only assignments; movement owns the join orders and every route leg. Known component men, stores, stragglers, service credit and identity are conserved. No unit counts at the receiving assembly while still in transit. A blocked route waits with a reason; a refused or unanswered transfer produces no arrival. An administrative state-to-Confederate service act does not itself move troops to Manassas.

Johnston's discretionary junction and separate infantry/horse/gun journeys, Holmes's smaller actual contingent, and Hampton's delayed infantry are examples the mechanism must be able to express (OR I-II pp.473,565–567,980–981). They are not hardcoded itineraries or promises that a replay will repeat their dates. Reuse the existing `orderJoins`/`joinStep` route mechanism; amend an inadequate route only with evidence, not to force a July rendezvous. S65 retains ownership of sending knowledge/arrival truth and outstanding-letter behavior; no S66 change is stacked on that work.

**Reject:** `on July20 add Johnston`, a `reached_command_date` trigger, teleporting a governor's levy to the desired army, bypassing sender compliance, shortening routes to reproduce the battle, or using the service-transfer proposal as geographic transport.

## 3. Who forms brigades and divisions

**Recommend [I]:** the army/department commander's **local organisational act**, represented as a sourced pack organisation template and a commander-seat action. The President may instruct that commander to organise his force; he does not assign individual regiments or drag them on a board. Local authority and the commander's response determine whether and how the order is carried out. The register supplies preferred names, hierarchy and attachments, with dates as evidence bounds.

The act proposes a partition of the commander's eligible, actually present component lots into named brigade blocks, and brigade posts under division posts when justified. `forces` validates membership and conserved quantities and performs the regrouping; `command` creates/parents the declared posts and assigns blocks/holders through its own writer; `movement` confirms colocated stationary inputs and preserves their location. The transaction either succeeds across the owners or returns typed reasons without a partial State. It cannot seize another commander's regiment, duplicate a detachment, collect a dispersed regiment for free or organise troops it only expects to receive.

This requires a bounded organisational proposal contract. Do not masquerade it as a new application of current `transferForce` that silently overrides the chosen commander or as `temporary_post` if that causes an enduring formation to vanish with an operation. Each new State field gets its ownership declaration and FOUNDATION row under the subsequent implementation brief. Received establishment and returns travel normally; the principal's view never reads the new component truth to learn an unreceived organisation.

**Reject:** calendar-driven formation; the principal choosing regiment-by-regiment; formations inferred automatically from national totals; cosmetic renaming that leaves command unchanged; direct writes from a pack situation into all three owners; and forming a brigade while its component locations disagree.

## 4. Division posts and their appearance

**Recommend [I]:** persistent, pack-declared **division-command** posts below the actual army/department command, with brigade-command posts beneath them. They become live through the authorised commander's organisational act when there are real subordinate formations, an available commander and an actual army to command. The World may declare templates; State does not contain active empty historical divisions from 5 March. Opening such a post is not a commander's service choice or a promotion.

For McDowell the named candidates are Tyler's First, Hunter's Second, Heintzelman's Third, Runyon's reserve Fourth and Miles's Fifth (OR I-LI.1 pp.413–414). The 8 July order is a firm dated organisation observation, not a forced in-game opening. For Patterson, Cadwalader/Keim have explicit 11 June division orders, and Sandford has a 10 July order (pp.398,416). The research register distinguishes earlier brigade lists from those division acts. Changes of holder and dissolution are actions with their own evidence; Miles's 25 July dissolution (p.425) must be possible, not compulsory after an alternate battle.

Johnston's 30 June roster and the 21 July battle combinations do not warrant adding an independent standing division above each of his brigades (OR I-II pp.470,569). Nor does Beauregard's 20 July tactical plan justify permanent division posts just because it calls combinations divisions (pp.479–480). Keep those as temporary groupings of real brigades unless a separately sourced organisational act supports a standing post. Do not import 1862 corps or the later First Corps title into the earlier command tree merely because a retrospective return uses it (p.469).

Current operation-bound temporary posts are insufficient for every persistent division. Add a persistent formation-post lifecycle to `command` only after the lead accepts this proposal; do not change the existing temporary-post dissolution rule globally. A dissolution reparents surviving brigades and releases the actual holder through existing ownership, without disbanding troops.

**Reject:** five fixed divisions at setup; using the President's appointment to create troop membership from nothing; inferring a post-creation date from a return date; permanent Confederate divisions derived from the attack plan; and treating every July formation as an operation-scoped expedition that disappears with the plan.

## 5. Divergence

**Recommend [I]:** resolve the organisation template against actual eligible regiment lots. Form the portion present, with an explicit actual roster and vacancy/absence reasons, or defer if no useful force/commander exists. A missing named regiment remains absent; an anonymous cohort stays anonymous. Other available regiments may be assigned by the commander, but the authored return names the actual substitution. A brigade name is an organisational intention, never a certificate of full historical composition or strength.

A regiment transferred elsewhere, still at muster, delayed, expired, captured or never raised cannot be cloned into the template. The same regiment in two source combinations is one actual set of lots, reassigned or attached for a stated interval, not two forces. A wounded/absent commander is replaced through actual command authority and known eligible people. Generated officers surface only when needed under 0020; do not preload a second cast or invent another real historical person with the same identity. Unknown quantities retain their holds, and all absence/organisation papers follow 0032's normal authorship and routes.

**Reject:** guaranteed named armies regardless of play; filling an absent regiment with average men; adding the June and July organisations together; silently changing a historical ID into a generic substitute; and accepting a forced Manassas battle as evidence the mechanism works.

## July size and cost estimate [I]

These are estimates of **block workload**, not historical manpower, and have two separate scopes.

For the commands researched here, plan roughly **45–55 Union blocks** and **30–40 Confederate blocks**, including separately moving artillery/cavalry/garrisons, rather than one ticked block for each of the register's many repeated regiment observations. The Union basis is eleven field brigades plus Runyon's two reserve groups (OR I-II pp.314–315; Dyer p.272), Patterson's eight numbered brigades across the June/July organisations (OR I-LI.1 pp.397–398,406,415–416), and several provisional Washington groups. Batteries, horse and detached fort/arsenal parts add independently moving blocks. The Confederate basis is seven Beauregard field combinations, Johnston's four, Holmes, Hampton and two retained militia brigades, allowing for unbrigaded infantry and separately moving guns/horse (OR I-II pp.469–470,473,558–559,565–569). Overlapping attachments count once. Unknown garrison and militia identities prevent an exact historical simultaneous count.

For **the whole retained S64 model on 31 July**, the save has 72 Union blocks, 62 Confederate blocks and one neutral block. Rebucketing its quantified enlisted regiment counts into provisional groups of at most four changes the arithmetic to **87 Union and at least 70 Confederate**, plus the neutral block: **at least 158**. This replaces the old enlisted containers; it does not add another army over them. Thirteen Confederate enlisted cohorts have unknown regiment counts, so this is **not an upper bound**. The exact save hash, counts and calculation are in the cohort inventory/source receipt. The model numbers are observations of a retained run, not a historical national order of battle.

At 100 microseconds a block, 158 blocks represent about **15.8 ms/day** of the force allowance; the researched-theatre estimate alone is **7.5–9.5 ms/day**. These are multiplication, not measured implementation times or promises that the entire tick fits 40 ms. A subsequent implementation must count its final simultaneous blocks, including detachments and other theatres, then measure component aggregation and the **whole tick** against the unchanged 100-microsecond/block and 40-ms/day constraints. Do not declare the budget passed from this paper estimate. Keep source roster work, alias lookup, derived membership indexes and component regrouping out of repeated daily block scans; process relevant service expiries through a derived due index and aggregate on mutations. Do not introduce a global cache or nondeterministic ordering.

## Implementation acceptance after a ruling [I]

Before a costly campaign, the implementation owner should prove cheaply: one live container per component; no lot duplicated across dated source aliases; conservation of known men/stragglers/stores and service credit through split/join; unknown quantities preserved; mixed-term components expire independently; refusal/slow walk/weakest selection affect actual dispatched troops; route blocking prevents joining; absent/missing historical units are not created; divisions appear only through the authorised act; posts and projected knowledge remain separate; saves/replay reconstruct derived indexes; and stable integer remainder ordering is deterministic. Fictional paired-State tests must keep unreceived organisation/arrival off the President's menu under S65's accepted contract.

Only then run the mandated suite and the lead's bounded 1A campaign, reporting every changed hash/counter with a cause. A force-container refactor must preserve unrelated outputs; an intended change in actual brigade membership must be disclosed, never hidden by refreshing a checker fingerprint or widening bands. No extra campaign or acceptance waiver is authorised by this proposal. Historical quantities and cast holds must be resolved in their own approved source/application steps.

## Findings outside my scope

The lead's ruling, schema/save migration, source admission and cast request, exact cohort lineage, missing regiment quantities, implementation tests/performance, S65's sender contract, staged-tree commitment/integration, whole-branch review and release remain outside S66. This proposal creates no post, soldier, person, troop arrival or accepted decision.
