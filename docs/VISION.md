# Mandate: vision (draft 0.2)

"Mandate" is a working codename. This is the pitch; the integrated design is [design/FOUNDATION.md](design/FOUNDATION.md), and the accepted decisions in [decisions/](decisions/) outrank both.

## The pitch

You lead a faction at war, and you are the one person in it who cannot do anything yourself.

Every army, department, governorship and ministry is held by someone else. You govern by choosing who holds what, by telling them what you want, and by living with what they actually do and what they choose to tell you. You win or lose on two clocks at once: the war, and whether the people who put you in power still keep you there.

## The first game

The first game is **the American Civil War, 1861 to 1865, and you are Lincoln** (0018). You cannot move a division. You give your commanders goals, and each puts forward a plan that appears on the map as arrows. You approve it, send it back, or redraw the arrows yourself, and every redraw is a counter-order he can resent. You move divisions between commanders, which is a political act. You never see the truth about your own armies, only what your generals report, what your observers write and what the newspapers print. Your generals gain and lose nerve and fame, leak to friendly papers, and may run against you. Lose the 1864 election and the game ends with a verdict: the electorate has rejected the war.

The Union comes first; the Confederacy becomes playable later on the same machinery.

## What the engine promises

Mandate is an engine for **wars with fronts**: wars fought by a political leadership through commanders, across a map where fronts, railways and supply matter. The Civil War is the first; a later gunpowder or industrial war would be a new pack, not a new engine. A mechanism belongs in the engine only if it makes sense in any such war and works on the fictional testbed pack; everything else is pack data (0024). Rome is a possible later game that would reuse the people layer but need a different theatre (0018).

## Pillars

1. **You hold a mandate, and you act only by lending it.** You never move a division, in any mode, ever. A verb may name a place, but only as part of an order to a person (0016). AWWV kept manual brigade orders underneath and had to force "president mode" later; we make the principal's role structural from the first line of code.
2. **People, not pieces.** Every person has interests, competence, nerve, standing and a memory. Forces belong to the post a man holds, not to your faction. Who he is decides what he does.
3. **Pushback is caused, readable and negotiable.** We don't roll dice for obedience. Every refusal comes with a reason, and you can answer it. A player should be able to say "I knew he'd balk", or "I should have known".
4. **You see what you're told.** Every fact on screen has an author, and authors have reasons to shade the truth. Fog of war is political, not only spatial. Even a general's own ability is hidden: you see your staff's assessment of him, built from biased sources, which sharpens as he fights (0020).
5. **Success breeds rivals.** Victory makes your best general your most dangerous subordinate, and a popular or sacked general can become the opposition's candidate in 1864.
6. **Distance is time.** Orders and reports travel along the map, by courier and telegraph. The kernel owns that latency.
7. **You can lose the coalition before you lose the war.** Outcomes are verdicts, not victories (AWWV).
8. **Every number is explainable and every run is repeatable.** Mechanisms return their reasons, not only results. The kernel is deterministic, and the record of what every seat decided is the truth about what happened.
9. **Mechanism is symmetric and asymmetry lives in data.** Settings are packs. Engine code names no setting.

## The map and time

**The map** is a few hundred irregular regions joined by typed links: road, rail, river and sea. Control of a region is a matter of degree, and fronts and pockets are derived from it, never saved (0019). Cut the railway at the junction and the army beyond it may find itself in a pocket. You see all this on the staff's map: hand-drawn, built from reports, ink where confirmed and pencil where not (0013).

**Time** moves in turns of up to a week on a daily tick (0027). A turn ends early when something needs you: an objection, a battle report, a closed pocket. Between turns you act; during a turn you watch the days pass as the dispatches arrive. A great battle plays back hour by hour from its dispatches: fragments, contradictions, silence. A full campaign takes about 15 to 25 hours.

**Attention** is Lincoln's scarcest resource: a budget that refills weekly (0025). Setting goals, editing arrows, transferring divisions, audiences, appointments and observers cost attention. Approving a good draft, reading and pausing cost nothing, so the default path stays quick. Decisions that reach you can be decided, delegated or ignored.

## The leader's verbs

There is a small fixed set, and no screen can add to it (FOUNDATION section 5):

- **Set a goal** for a commander: an objective, posture, risk, deadline, permissions and the divisions committed.
- **Review his plan**: approve it, send it back with notes, or edit the arrows within a limited grammar (an axis's objective, waypoints and timing; adding or removing an axis). The commander assigns divisions to axes. Each edit is a counter-order (0026).
- **Transfer divisions** between armies and departments. Inside an army, its commander assigns them.
- **Appoint, relieve, promote.** Relief has modes with different costs; promotions arrive as lists you approve, amend or override.
- **Audience**: hear a man out and answer his reasons with counters.
- **Visit** an army: days away from Washington for first-hand reports that are better than dispatches, but still not the truth.
- **Send an observer**, who has his own bias and reports to you.
- **Honour, promise, pressure, address** people and blocs.

## The people in the seats

Every person in the game is a **seat**: whoever decides for him, whether the rules model, an AI model, or later a human (0015). Each seat knows only what has reached it. The rules model is always there and plays well alone, so the game is fully playable offline. Lincoln's seat comes first, playing a general second, multiplayer third.

**AI text is voice, never state** (0022). The engine decides what a general does and what he claims; a model may only put it into words, from what he chose to say. No outcome ever depends on generated text, and every line has a written fallback.

## The home front

The war is fought through people at home too (0023). A light economy of money, men, munitions and rail capacity runs through holders who can stall: the treasury, the governors, the War Department. The press prints a weekly front page of what the public believes, and generals leak to it. The 1862 midterms and the 1864 election are checkpoints. History arrives as situations triggered by their causes, not by dates. Britain and France are pressures, not players; the border states are contested, with governors of their own.

## History handled with care

The Civil War was fought over slavery, and the game says so (0021, 0026). No Lost Cause framing, in text or in mechanics. Enslaved people are agents of their own freedom, never a resource either side manages, and Black regiments come from the choices of the men who enlisted. A written gate covers slavery and emancipation, Black soldiers, massacres, guerrilla war, civilians, prison camps, the wars against Native nations, the draft riots and civil liberties. Each sensitive feature is placed before it is written: modelled with locked consequences, narrated only, or refused. An atrocity is never a lever that pays.

## The loop

```
Dispatches arrive  →  you decide, delegate or ignore, within your attention
        ↑                               ↓
Reports authored   ←  Days pass: commanders draft and carry out plans as they
by commanders           read your orders; fronts move; blocs, press and rivals move
```

## What we take, and what we don't

| From | Take | Leave |
|---|---|---|
| AWWV | a deterministic kernel with a state hash, the directive chain with bounded deviation, "the number is never the decision; the source is", consequence receipts, asymmetry in data, player-visible-state boundary, single owner per truth, derived fronts never saved, verdict not victory | manual control mode, a 150-step combat engine, cell-level calibration as a gate, geometry-derived adjacency, process inside canon, more than one inbox |
| Starfleet Career | systems own truth and text only renders, swappable packs + boundary validator, regard + values council-adoption rule, `known_from`/`known_to` epistemics, named RNG streams, save versioning, "rules that matter become checks", decision records, offline authored product first | "canon happens": our player *is* a headline cause |
| Other games | AGEoD's regions and political costs of sacking, HoI's fronts and plan arrows, priced delegation (DC: Barbarossa), order delay preview (Command Ops), attention budget (Old World), real time with pause (Europa Universalis), coalition thresholds (CK3), debate before decision (Suzerain) | dice-driven obedience, unexplained refusals, thousands of regions, order screens that eat the game (*No Greater Glory*), opaque politics, event spam |

See [design/FOUNDATION.md](design/FOUNDATION.md) for the design, [design/PROPOSALS.md](design/PROPOSALS.md) for the original mechanism proposals, and [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) for what the owner needs to decide.
