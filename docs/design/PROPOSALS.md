# Proposals (draft 0.1)

Each proposal names the problem it solves, how it works, and how it plays in the three reference wars. Status for all of them: **proposed**. The owner accepts, rejects or reshapes them, and accepted ones become decision records.

---

## Part A: core mechanisms

### P1. Assets belong to posts, not to factions

**Problem.** In almost every strategy game the faction owns the army, and the general is a buff on top of it. That makes "command through proxies" a skin over direct control.

**Proposal.** Forces, money and materiel are held by a **post**. The faction's strength is the sum of what its post-holders will actually do with what they hold. To move an army you change the directive of the man who holds it, or you change the man. Transfers between posts are directives too, and the giving side can drag its feet.

- **Rome:** consuls levy and command their own legions for a year. When the year ends, the legions go to whoever is elected.
- **ACW:** state governors raise regiments, and a political general's division is loyal to him.
- **Ukraine:** a brigade with its own donors and media channel is not fully the ministry's to move.

### P2. Directives are contracts, and compliance is a ladder

**Problem.** AWWV's compliance formula is a single number on a four-rung stance ladder. Other games roll a die.

**Proposal.** A directive carries intent, constraints, resources, priority and a deadline. The proxy reads it through four things:
- **Alignment:** do its goals and constraints honour one of my values? This is Starfleet Career's council rule, inverted.
- **Regard:** what I think of the leader.
- **Expected cost of shirking:** Feaver's model, the chance I'm being watched × how credible punishment is.
- **Capacity:** can I do it with what I have?

The response is a rung on a ladder:

> **Exceed → Comply → Comply with reservations → Slow-walk → Reinterpret → Object (with a counter-proposal) → Refuse**

Every response carries **typed reasons**: `lacks_resources`, `disagrees_on_merits`, `career_risk`, `resents_rival`, `bloc_pressure`, `patron_instruction`, `personal_ambition`, and so on. Reasons are data, so the UI, the AI and the text layer all read the same thing.

### P3. The Audience: pushback you can negotiate

**Problem.** Pushback in games is either a die roll or a cutscene. Matrix games capture argument well but adjudicate inconsistently.

**Proposal.** Before you commit an important directive, you can **summon** the proxy. The proxy states its position and its typed reasons. You answer with **counters**, and each counter type addresses only certain reason types:

| Their reason | Counters that work | Counters that don't |
|---|---|---|
| `lacks_resources` | Allocate | Honour, Pressure |
| `career_risk` | Promise, Honour | Allocate |
| `disagrees_on_merits` | a better argument (intel, a second opinion) | money |
| `resents_rival` | restructure the command | flattery |

Grievances are not interchangeable: gold doesn't fix a denied promotion. Resolution is deterministic. This gives you a matrix-game feel with a computer's consistency.

### P4. Political fog of war: every fact has an author

**Problem.** Fog of war is almost always spatial. The leader's real problem is that the people reporting to him have reasons to shade the truth.

**Proposal.** The player never reads state. The player reads **claims**. Every report is written by a person, with:
- **candour**, a trait;
- **bias**, which comes from their interests, such as hiding losses, inflating enemy numbers, or blaming a rival;
- **date and latency.**

Claims use Starfleet's epistemic model (`known_from`, `known_to`). You correct the picture through **independent channels** you have to pay for and that cause resentment: inspectors, commissars, journalists, the telegraph office, OSINT, a second general. "Probing" a proxy costs attention and regard, and reveals how far the claim is from the truth.

- **ACW:** McClellan reports 200,000 Confederates in front of him. Pinkerton (his channel) confirms it. A cavalry scout under another general does not.
- **Ukraine:** the brigade's "situation stable" and the Telegram footage disagree.
- **Rome:** a consul's despatch and the letter from an allied city disagree.

### P5. The insubordination ladder, per person

**Problem.** Most games jump from "loyal" to "rebelling".

**Proposal.** Each proxy sits on a visible state machine:

> **Loyal → Reserved → Foot-dragging → Freelancing → Leaking / lobbying → Going over your head → Public defiance → Armed defiance**

Each step is caused by something specific, such as accumulated grievances, standing high enough to protect them, or a patron or bloc offering cover. Each step also gives off **signals** you can read if you have the channels. Moving down the ladder takes repair, not a bribe.

### P6. Success breeds rivals: Standing

**Problem.** Victory has no political downside in most games.

**Proposal.** Each proxy accumulates **Standing**: their own political capital, from victories, fame, a constituency and patrons. Standing:
- raises the cost of dismissing them;
- lowers the credibility of your threats;
- once it passes your own mandate in some bloc, opens a **rival track**: the proxy becomes a potential competitor for your seat.

Real-world templates: McClellan running against Lincoln in 1864, Scipio's popularity against the Senate, Zaluzhnyi's approval numbers, Prigozhin. The core dilemma of the game: **you need your best people to win, and winning makes them dangerous.**

### P7. Your reputation is what they predict about you

**Problem.** Threats and promises in games are free and always credible.

**Proposal.** Proxies model the leader. Your **record**, a dated list and not a number, feeds a few derived beliefs:
- *keeps promises*;
- *sacks failures*;
- *meddles*;
- *backs subordinates against blocs*.

If you've never sacked anyone, the threat to sack loses its force (Feaver's punishment credibility, derived from your actual history). If you've broken promises, Promise stops working as a counter. This is deterministic, caused, and it gives every choice a long tail.

### P8. Distance is time: latency is the era dial

**Problem.** One engine has to make Rome, the 1860s and 2022 feel different without separate code.

**Proposal.** Every message (order or report) travels along a channel with a latency and a leak rate:
- **Rome:** orders to Spain take weeks, so delegation is forced and proxies act on stale intent.
- **ACW:** the telegraph reaches some armies and not others, which is how Lincoln actually ran the war, from the War Department telegraph office.
- **Ukraine:** messages are near-instant but leaky. You *can* micromanage, and it costs attention and resentment.

The same mechanism produces three different games.

### P9. Attention is the scarce resource

**Problem.** Micromanagement creeps back whenever doing it yourself is free and better.

**Proposal.** Each turn you have a small number of **audiences**, set by your health, your staff and the crisis level. Every decision that reaches you can be:
- **decided** (costs attention);
- **delegated** (the post-holder's bias applies; DC: Barbarossa's priced delegation);
- **ignored** (it resolves by default and is logged).

Delegation must be genuinely good when you pick the right person, or players will micromanage (HOI4's lesson).

### P10. The coalition is the second clock

**Problem.** Most games end on territory.

**Proposal.** Your mandate is derived from **blocs**. Each bloc has interests, a leader (whose change can mutate its demands; Victoria 3) and a weight. Checkpoints are scenario data: consular elections, the 1862 midterms and the 1864 election, a Rada vote, a patron summit. You can lose by:
- deposition;
- a lost election;
- a Senate decree;
- a coup;
- a negotiated peace you could not sell.

The outcome is a **verdict** on several axes (AWWV), not a win screen.

### P11. Patrons are proxies with their own scoring

**Problem.** Foreign aid in games is a faucet.

**Proposal.** A patron is a faction-like actor with its own victory conditions (COIN) and **red lines**: no strikes on its soil, no use of its weapons past a line, no negotiating without it. Aid moves up and down an **aid ladder** in response to what you do and what you report. Patron demands arrive as events you answer, never as a "defy" slider (an AWWV ruling).

### P12. Coup-proofing is a trade-off, not a fix

**Proposal.** You can **counterbalance**:
- create a guard force;
- rotate commanders;
- promote loyalists;
- split commands;
- attach commissars.

Each one lowers the risk of the higher rungs of the ladder (P5) and measurably lowers effectiveness and regard. Show both sides before you commit. The research says counterbalancing can also *provoke* the thing it guards against (De Bruin), so it should.

---

## Part B: architecture proposals

### P13. The theatre model is coarse and hidden: spend the fidelity budget on people

AWWV's hardest problem was never the command premise. It was tuning a 150-step combat engine to reproduce history cell by cell. In Mandate the player **never sees the battlefield raw**, only reports, which is the point of the game. So the theatre model can be:
- a coarse region graph;
- force strength, supply and posture per region;
- operations with a handful of parameters;
- outcome distributions.

The design budget goes into people, information and politics instead.

### P14. A variable-tempo clock

The tick is one **day**. A turn runs until the next **decision point**: a report that needs you, a deadline, a crisis. The scenario sets a minimum and maximum. Rome can run months between turns in winter quarters. Ukraine can stop daily during an offensive. This uses one engine and needs no per-setting turn code.

### P15. History is pressure, not rails

The leader is a headline cause by definition, so Starfleet Career's "canon happens" cannot apply. Instead:
- historical **people, blocs, patrons and starting conditions** are data;
- historical **pressures** (a patron's patience, a bloc's war-weariness, an enemy's doctrine) are data;
- **outcomes are not scripted.**

AWWV's Codex "ghost entries" show where your war diverged from the real one. A pack can optionally ship a "historical AI" mode in which other actors follow their recorded preferences more closely.

### P16. Systems own truth, text only renders, and the offline game is the product

This is carried over from Starfleet Career decisions 0001 and 0028. Proxy dialogue comes from **typed reasons → authored templates**. An LLM layer may later dress the same structured reasons in voice. It never decides anything, and nothing a player needs depends on it.

### P17. A headless people sim first, the map last

> The map ordering is superseded by decision 0013: the hand-drawn staff map is built with the desk UI (M3). The headless-first part stands.

The map is the most expensive thing to build and the least central to the premise. AWWV rebuilt its map UI four times. Build order:
1. Kernel and the people sim, run headless with a text console. Prove the Audience is fun in text.
2. A desk UI: dispatches, audiences, the org chart.
3. The map.

---

## Part C: where I push back on the brief

1. **"One engine that fits them all" is right for the engine and wrong for the first game.** Generic engines die of generality. Build **one vertical slice** of one war against a kernel that obeys the three-setting test. Extract further engine abstractions only when the second setting needs them, the rule of three. The packs boundary keeps us honest without designing for three settings at once.
2. **Don't rebuild AWWV's combat engine.** See P13. If the theatre is the hard part again, we've built the wrong game.
3. **Ukraine is an ongoing war with living people.** Having Zelenskyy, Zaluzhnyi, Syrskyi or Budanov "push back" in a game is a likeness and defamation question, the outcome is unknown, and events keep changing the reference. I recommend Ukraine as a later pack with an explicit policy (OPEN_QUESTIONS Q3), possibly fictionalized analogues. AWWV already learned how heavy sensitive-history gating is.
4. **"Rome" is not one setting.** A Republic's leader is a collective (the Senate), magistrates rotate every year, and campaigns span years. I'm treating it as the *hardest* test of the kernel, and that makes it valuable, but it is a bad first slice.
5. **Recommended first slice: Union, 1861–62.** It is the textbook principal–agent war (Cohen's *Supreme Command* has a whole chapter on Lincoln). It has the McClellan problem, political generals, governors who raise troops, the telegraph as a latency mix, and the 1862 midterms as a coalition checkpoint. It is two-sided, richly documented and in English, and nobody involved is alive.
6. **Don't import AWWV's process weight.** Start lean, the Starfleet way: a short CLAUDE.md, decision records, LESSONS.md with "Enforced by", and validators instead of paragraphs. Add gates only when a rule keeps getting broken.
