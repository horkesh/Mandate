# Mandate: vision (draft 0.1)

"Mandate" is a working codename. This is a draft for the owner to tear apart.

## The pitch

You lead a faction at war, and you are the one person in it who cannot do anything yourself.

Every legion, army, province, ministry and brigade is held by someone else. You govern by choosing who holds what, by telling them what you want, and by living with what they actually do and what they choose to tell you. You win or lose on two clocks at once: the war, and whether the people who put you in power still keep you there.

## The three-setting test

Each mechanism in the engine must make sense in all three reference wars. If one of them doesn't need it, it belongs in a pack, not the engine.

| | Rome (reference: Second Punic War, 218–201 BC) | US Civil War, Union, 1861–65 | Russia–Ukraine, Kyiv, 2022– |
|---|---|---|---|
| You are | the Senate leadership (a collective principal) | Lincoln | the President |
| Your proxies | annual consuls, proconsuls, legates, allied Italian cities | army commanders, governors who raise regiments, cabinet secretaries, political generals | Commander-in-Chief, brigade founders, oblast heads, ministers, foreign patrons |
| They push back by | fighting when told to wait (Varro), waiting when told to fight (Fabius), going to Africa against your wishes (Scipio) | "the slows" (McClellan), political generals you can't sack (Banks, Butler), governors withholding troops | public disagreement (Zaluzhnyi), units with their own media and donors, patrons' red lines |
| Your coalition | senatorial factions, the assemblies, the allies | Radical Republicans, War Democrats, border states, the 1862 and 1864 elections | Rada, army, public opinion, Western patrons |
| Distance | weeks by courier | the telegraph reaches some armies and not others | instant, and leaky |

## Pillars

1. **You hold a mandate, and you act only by lending it.** There is no unit control, in any mode, ever. AWWV kept manual brigade orders underneath and had to force "president mode" at campaign start later. We make the principal's role structural from the first line of code.
2. **People, not pieces.** Every proxy has interests, competence, standing and a memory. Assets belong to the post they hold, not to your faction.
3. **Pushback is caused, readable and negotiable.** We don't roll dice for obedience. A player should be able to say "I knew he'd balk", or "I should have known".
4. **You see what you're told.** Every fact on screen has an author, and authors have reasons to shade the truth. Fog of war is political, not only spatial.
5. **Success breeds rivals.** Victory makes your best general your most dangerous subordinate.
6. **Distance is time.** Orders and reports travel. The era sets the length of the leash.
7. **You can lose the coalition before you lose the war.** Outcomes are verdicts, not victories (AWWV).
8. **Mechanism is symmetric and asymmetry lives in data.** Settings are packs. Engine code names no setting.

## The kernel: nouns

| Noun | What it is | Notes |
|---|---|---|
| **Person** | an agent: values, ambitions, competences, standing, regard, knowledge, ladder state | richer than AWWV's 5 ratings; Starfleet's two-value + regard model as the base |
| **Post** | an office in the faction's org chart, with powers, resources, tenure, and who appoints to it | consul, army command, governorship, ministry, brigade command |
| **Asset** | forces, money, materiel, held **by a post** | you don't own your army; the man holding it does |
| **Bloc** | a constituency or power group whose support makes up your mandate | Senate factions, Radical Republicans, the Rada |
| **Patron** | an outside power whose aid comes with its own agenda and red lines | Rome's allies, Britain (for the Confederacy), Western states |
| **Directive** | intent + constraints + resources + priority + deadline, issued to a post | a contract the proxy interprets, not a move order |
| **Message** | an order or a report that travels with latency and has an author | the only way information moves |
| **Claim** | what someone asserts is true, with author, date, and audience | the player's view of the world is a set of claims |
| **Theatre** | a coarse place graph where force meets force | deliberately simple and hidden behind reports |
| **Ledger** | the dated record of what happened and who warned whom | chronicle, consequence receipts, the verdict |

## The kernel: the leader's verbs

There is a small fixed set. Packs give them names and flavour; the engine never adds a verb for one setting.

**Appoint · Dismiss · Direct · Allocate · Summon (audience) · Oversee (attach an inspector, commissar or journalist) · Honour · Promise · Pressure · Address (the public or a bloc) · Negotiate (with patrons, blocs or the enemy)**

## The loop

```
Dispatches arrive  →  Audience (decide / delegate / ignore, limited by attention)
        ↑                               ↓
Reports authored   ←  Days pass: proxies act on their reading of your directives;
by proxies              theatre resolves; blocs, patrons, rivals move
```

A turn ends when something needs you, not when the calendar turns over. The tick is a day. The scenario sets the minimum and maximum gap between decision points.

## What we take, and what we don't

| From | Take | Leave |
|---|---|---|
| AWWV | deterministic `runTurn`, the directive chain with bounded deviation, "the number is never the decision; the source is", consequence receipts, patron demands as events, asymmetry in data, player-visible-state boundary, single owner per truth, verdict not victory | manual control mode, a 150-step combat engine, cell-level calibration as a gate, process inside canon, more than one inbox |
| Starfleet Career | systems own truth and text only renders, swappable packs + boundary validator, regard + values council-adoption rule, `known_from`/`known_to` epistemics, named RNG streams, save versioning, "rules that matter become checks", decision records, offline authored product first | "canon happens": our player *is* a headline cause |
| Other games | priced delegation (DC: Barbarossa), proxies generating your options (Shadow Empire), order delay preview (Command Ops), attention budget (Old World), structural rebellion thresholds (Imperator), coalition thresholds (CK3), allies with their own scoring (COIN), political rot as command dysfunction (Defiance), debate before decision (Suzerain) | dice-driven activation, opaque politics, interchangeable loyalty currency, event spam, patrons as vending machines |

See [design/PROPOSALS.md](design/PROPOSALS.md) for the specific ideas and [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) for what the owner needs to decide.
