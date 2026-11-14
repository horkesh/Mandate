# Research: what combat model Phase 1 should build

Date: 2026-11-14. Status: research note and proposal (not canon until a decision record accepts it). Written by a research-and-design lane for the lead. It covers how other games and models resolve battles at this scale, the historical data to calibrate against, a proposed combat model for the kernel, and calibration targets.

**Conventions.**
- Each claim ends with a source key in [brackets]; the keys resolve to URLs in the Sources list at the end. **(fetched)** means this lane read the page. **(snippet)** means it was seen only in a search summary; treat it as a lead.
- **[I]** marks our own inference or arithmetic. **[gk]** marks general knowledge this lane did not verify.
- "K+W" means killed plus wounded, which is what Livermore calls "hit". "Missing" includes the captured [FOX-XIV].
- What the lane could not reach: the *Strategic Command: American Civil War* manual (no search hit), the battle section of Grand Tactician's manual (the PDF is over the fetch limit), the battle chapter of the *For the People* rulebook (the page was cut off before section 7), the Dupuy Institute's 49-battle post (HTTP 503), and the CWSAC report itself. The relevant lines below are marked accordingly.

**Does the evidence contradict a settled decision?** No. It supports 0007 (dice only for exogenous noise), 0019 (no retreat into regions under 50‰ control, so a force is destroyed only when it is cut off), 0029 (fortification as region state) and 0032 (casualty first figures run low). It refines FOUNDATION section 10 in two ways: forces need a stragglers pool, and the combat module needs a battle record (see "Findings outside my scope").

---

## 1. How others resolve battles at this scale

### 1.1 AGEoD (*Civil War II* and its engine)
- **Structure.** A battle day has up to six rounds ("or hours"). Each round opens at a range set by terrain and weather, and the range drops by one per phase until melee at range 0 [AGE-BP] (fetched; a 2012 wiki page, and exact values live in the game's `GameLogic.opt`).
- **Frontage.** Before each hour the engine picks the subset of units that actually fight, by terrain [AGE-BP].
- **Fire and assault.** The hit chance is a product of about ten multipliers (firepower, troop quality, command, protection, entrenchment, terrain, cohesion, rules of engagement and others) times a constant, with a 5% floor, tested on a d100. Assault uses (attack − defence) × the same chain. Every element that fires loses 3 cohesion [AGE-BP].
- **Morale.** Elements that took losses roll a d10 against troop quality each round; failure means "shaken". Failing a morale check mid-round means "routed", and the element leaves the battle [AGE-BP].
- **Retreat.** Two steps: the side decides whether it wants to retreat (power ratio, commander aggressiveness, entrenchment), then rolls to see whether it gets away. Routed forces take pursuit losses, more if the winner has cavalry [AGE-BP].
- **Winner.** Decided by battle points: +5 for holding the ground, ±1 per national-morale point, −5 for routing. The winner can be the side that left the field [AGE-BP].
- **Strengths:** frontage, cohesion separate from strength, and a retreat that is not destruction. **Failures for us:** the multiplier chain of 10+ terms, a d100 per element, a d10 per element per round and a retreat roll make any single outcome hard to explain. Players already turn AGEoD's obedience rolls off (games survey [GAMES], section 1.5). The "decide to retreat" step is a person's decision taken by dice, which 0007 forbids.

### 1.2 Grand Tactician
- Battles are fought in real time at brigade level. Casualties are recorded as KIA, WIA and MIA, and a unit's morale and "loss resilience" decide how many casualties it bears before it panics [MGW-CAS], [MGW-MOR] (snippet).
- The army commander's personality decides whether he attacks, defends or withdraws; a cautious general may give ground "even if in good condition" (games survey [GAMES], section 2, citing the manual pp. 136–137).
- With fog of war on, enemy casualties are estimates [MGW-CAS] (snippet).
- Early Access reviewers questioned its casualty figures [GAMES], section 2.
- **Lesson:** the personality-driven decision to stand or withdraw is the right idea and fits 0007 if it is deterministic. A tactical simulation is the wrong layer for a president's game.

### 1.3 *Strategic Command: American Civil War*
- Not read (no manual or rules page was found). From general knowledge [gk], the series resolves each attack as a strength-point exchange between two units, with predicted losses shown before the attack and modifiers for entrenchment, readiness and morale. Treat this as unverified; it is listed only so the gap is visible.

### 1.4 *For the People* (GMT, card-driven)
- Each general has an offensive and a defensive battle rating. Both sides roll a die, add modifiers (leader rating, interception +2, fort +2, amphibious +2, event cards), and losses in strength points follow. In the worked example, 6 Union against 7 Confederate strength points, each side lost 2, and a tie without an asterisk goes to the defender, so the attacker retreats [FTP] (fetched, from the rulebook's examples; the battle chapter was not reached).
- A battle result moves each side's Strategic Will (in the example: +3 Union, −4 Confederate, including ±2/3 for a "change of fortune") [FTP].
- An army with zero strength points is eliminated before any retreat [FTP], rule 5.21.
- **Lesson:** small, readable inputs and a direct line from battle to national will. It is a board game, so all the variance sits in one die per side.

### 1.5 Lanchester models
- The square law makes fighting power grow with the square of numbers. Kirkpatrick's 2021 Cambridge study of Civil War battles found the ratio of losses "inversely proportional to the ratio of numbers effectively engaged", argues that what matters is getting units into action, and concludes the square law should not be applied indiscriminately [KIRK] (fetched abstract only; the number of battles and the method were not read).
- Dupuy's verities say the same thing from a different angle: "There is no direct relationship between force ratios and casualty rates", and "the numerical losses of attacker and defender are often similar" [DUP-V] (fetched).
- **Lesson:** a raw Lanchester exchange lets the bigger army win by numbers alone. Civil War losses were set by how many men could get into contact, which argues for a frontage cap.

### 1.6 Dupuy's QJM and TNDM
- These models compute combat power for each side (strength × weapon lethality × posture, terrain, weather, surprise and quality factors), then derive casualty and advance rates from the power ratio. The post on Livermore and Dupuy applies Dupuy's posture divisors to Civil War scores: attack 1.0, hasty defence 1.3, prepared defence 1.5, fortified defence 1.6 (the post also lists "Attack and Hasty Defense ÷1.2") [HORN] (fetched).
- Dupuy's attrition verities that bear on this model [DUP-V]:
  - winners lose at lower rates than losers (3);
  - small forces lose at higher rates than large ones (4);
  - defenders' losses fall as fortification rises (8);
  - surprised forces lose more (9);
  - bad weather and difficult terrain lower both sides' rates "markedly" (11, 12);
  - casualty-inflicting capacity declines with each successive day of battle (13);
  - an all-out effort raises both sides' losses (18).
- Civil War intensity exceeds the range of Dupuy's World War charts [HORN]. In one Union offensive of three battles over 12 days, the attacking Union lost 0.96% a day and the defending Confederates 0.66% [HORN].
- The Dupuy Institute tested the "three-to-one rule" on 49 Civil War battles and found the attacker winning half the time at about 2.1–2.3 to 1 (snippet) [DUP-49].
- **Strengths:** every factor is a named, published term, which suits hard rule 6. **Failures:** the factors multiply, so a result is hard to read back, and the World War calibration does not fit Civil War intensity.

### 1.7 What to take
- From AGEoD: frontage; cohesion and morale kept apart from strength; rout as leaving the battle, not dying.
- From Dupuy: named posture and terrain terms; declining intensity on successive days; losses depending on who wins.
- From Lanchester's failure: cap engagement by contact, not by numbers present.
- From Grand Tactician: the commander's character decides whether he stands. In Mandate that decision must be deterministic (0007).
- From *For the People*: few inputs, and a direct line from a battle to the will of the nation.
- **Avoid:** per-element dice, a chain of ten or more multipliers, and a retreat decided by a roll.

---

## 2. Historical data to calibrate against

### 2.1 Losses per battle (Livermore, K+W per 1000 engaged)
Livermore's tables, read from the 1900 text [LIV] (fetched; printed values, some garbled by OCR, checked where noted):

| Battle | Type [I] | Union engaged / K+W / ‰ | Confederate engaged / K+W / ‰ |
|---|---|---|---|
| Bull Run, 21 Jul 1861 | meeting, rout | 28,452 / 1,492 / 52 | 32,232 / 1,969 / 61 |
| Wilson's Creek, 10 Aug 1861 | Union attack | 5,400 / 944 / 175 | 11,600 / 1,157 / 100 |
| Fort Donelson, Feb 1862 | siege, surrender | 27,000 / 2,608 / 96 | 21,000 / ~2,000 / 95 |
| Shiloh, 6–7 Apr 1862 | surprise attack, 2 days | 62,682 / 10,162 / 162 | 40,335 / 9,735 / 241 |
| Fair Oaks, 31 May–1 Jun 1862 | Confederate attack | 41,797 / 4,384 / 105 | 41,816 / 5,729 / 137 |
| Seven Days, 25 Jun–1 Jul 1862 | Confederate attacks, 7 days | 91,169 / 9,796 / 107 | 95,481 / 19,739 / 207 |
| Second Manassas, 27 Aug–2 Sep 1862 | mixed | 75,696 / 10,096 / 132 | 48,527 / 9,108 / 187 |
| Antietam, 16–17 Sep 1862 | Union attack, open | 75,316 / 11,657 / 155 | 51,844 / 11,724 / 226 |
| Perryville, 8 Oct 1862 | meeting | 36,940 / 3,696 / 100 | ~16,000 / 3,145 / 196 |
| Fredericksburg, 13 Dec 1862 | assault on works | 106,007 / 10,884 / 103 | 72,497 / 4,656 / 64 |
| Chickasaw Bayou, 27–29 Dec 1862 | assault on works | 30,720 / 1,213 / 39 | 13,792 / 197 / 14 |
| Stones River, 31 Dec 1862–1 Jan 1863 | Confederate attack | 41,400 / 9,220 / 223 | 34,732 / 9,239 / 266 |
| Gettysburg, 1–3 Jul 1863 | Confederate attacks, 3 days | 83,289 / 17,684 / 212 | ~75,000 / 22,638 / 301 |
| Fort Wagner, 18 Jul 1863 | assault on works | 5,264 / 1,126 / 214 | ~1,785 / 169 / 95 |
| Chickamauga, 19–20 Sep 1863 | Confederate attack | 58,222 / 11,413 / 196 | 66,326 / 16,986 / 256 |
| Wilderness, 5–7 May 1864 | meeting in woods | 101,895 / 14,283 / 140 | 61,025 / ~7,750 / ~127 |
| Franklin, 30 Nov 1864 | assault on works | 27,939 / 1,222 / 44 | 26,897 / 5,550 / 206 |

- **War-wide averages.** Over 48 battles, Union 112.09 and Confederate 150.47 K+W per 1000 engaged; with 15 Union-only battles added, Union 106.33 per 1000 over 2,328,515 engaged [LIV p64–66].
- Livermore warns that "the ratio between losses warrants no deduction of the ratio between numbers", and notes the Confederates were "on the defensive, in earthworks in the most of these battles" [LIV p66].

### 2.2 What the table shows [I]
- **Open battles: absolute losses are about equal; the smaller side's rate is higher.** Antietam 11,657 against 11,724; Stones River 9,220 against 9,239; Shiloh 10,162 against 9,735; Prairie Grove 988 against 981 [LIV]. The loss ratio sits between 0.5 and 1.5 in open battles (Seven Days 0.50, Chickamauga 0.67, Gettysburg 0.78), which matches Dupuy's verity 7 [DUP-V]. The outnumbered side's per-1000 rate is higher because the same absolute loss falls on fewer men.
- **Assaults on works: the attacker loses 2 to 7 times as many men.** Fredericksburg 2.3×, Franklin 4.5×, Chickasaw Bayou 6.2×, Fort Wagner 6.7× [LIV]. Entrenched defenders lose 14–95 per 1000; their attackers 39–214.
- **Single big days:** 100–230 per 1000 for a side fully engaged in open battle (Antietam, Stones River, Franklin's attackers). **Multi-day battles** spread a similar or larger total over 2–7 days (Gettysburg 212 Union over 3 days; Seven Days 107 Union over 7), so the per-day rate falls, as Dupuy's verity 13 predicts.
- **Defeat does not mean higher K+W.** At Fredericksburg and Franklin the losing attacker bled; at Chancellorsville and Chickamauga the losing Union army lost heavily in missing (2.3).

### 2.3 Missing and captured (Fox)
Fox's Union losses in the great battles [FOX-XIV] (fetched); missing share is our arithmetic [I]:

| Battle | Killed | Wounded | Missing | Aggregate | Missing share |
|---|---|---|---|---|---|
| Gettysburg | 3,070 | 14,497 | 5,434 | 23,001 | 24% |
| Chancellorsville | 1,606 | 9,762 | 5,919 | 17,287 | 34% |
| Chickamauga | 1,656 | 9,749 | 4,774 | 16,179 | 30% |
| Manassas (Second) | 1,747 | 8,452 | 4,263 | 14,462 | 29% |
| Stones River | 1,730 | 7,802 | 3,717 | 13,249 | 28% |
| Shiloh | 1,754 | 8,408 | 2,885 | 13,047 | 22% |
| Wilderness | 2,246 | 12,037 | 3,383 | 17,666 | 19% |
| Fredericksburg | 1,284 | 9,600 | 1,769 | 12,653 | 14% |
| Cold Harbor | 1,844 | 9,077 | 1,816 | 12,737 | 14% |
| Antietam | 2,108 | 9,549 | 753 | 12,410 | 6% |

- Missing is high (around 30%) where a Union flank broke or was surprised (Chancellorsville, Chickamauga, Second Manassas, Shiloh) and low where the Union attacked and held its ground (Antietam 6%) [I].
- At Fredericksburg and Cold Harbor, Fox says the missing "may be added to the killed and wounded", since they fell in a failed assault [FOX-XIV].
- Killed to wounded runs about 1 to 4.5–7 across the table [I].

### 2.4 The rifle musket and entrenchment
- Hess argues that rifle-musket regiments opened fire at about the same distance as smoothbore regiments, and that "the ranges of firing and casualty totals with the new rifle were basically the same as before"; its only appreciable effect was in skirmishing and sniping [HESS-R] (fetched review). The average opening range is put at about 100 yards (snippet) [HESS-S]. Critics say the evidence is sparse and mostly western [HESS-S] (snippet).
- So the weapon is not a war-wide multiplier. What changed during the war was digging: losses drove both armies into entrenchments by 1864 (snippet) [HESS-S]. Dupuy's divisors (prepared 1.5, fortified 1.6) and Livermore's assault cases (2.1) give the size of the effect.
- *Attack and Die* claims the Confederacy bled itself by attacking more often than the Union did, and a blurb gives 175,000 Southern dead in the first 27 months (snippet) [AAD]. The thesis is contested and the figure unverified; use only the direction.

### 2.5 Straggling and attrition on the march
- Lee's army fell from 75,528 present for duty on 2 September 1862 (Allen's muster-roll study) to about 37,351 engaged at Antietam on the 17th (Carman). Estimates range from about 35,000 to over 50,000, so at least a third, perhaps half, of his strength vanished in two weeks, mostly to straggling and desertion. Some of the difference was casualties at Harpers Ferry and South Mountain [ECW-LEE] (fetched).
- Lee wrote in September 1862 that straggling "seems impossible to prevent with our present regimental officers" (snippet) [CWT-LEE].
- On the Union side, Rosecrans wrote that only 63–67% of each corps was present before Stones River (`2026-11-14-union-information-flows.md`, 1.4). The present share of the Union rolls fell from about 92% (January 1862) to 67% (March 1865) (`2026-11-14-war-scale.md`, 1.1).
- [I] Straggling is mostly recoverable: Lee's army was back to about 75,000 present by the winter [gk]. Stragglers are absent, not dead.

### 2.6 How often battles were decisive
- The CWSAC rated 384 principal battles: 45 (about 12%) Class A, "a decisive influence on a campaign and a direct impact on the course of the war", and 104 (about 27%) Class B, a direct and decisive influence on their campaign (snippet) [CWSAC]. Each battle also carries a result of Union, Confederate or Inconclusive [CWSAC-D] (fetched).
- Frey's *Failure to Pursue*: in all but two of nearly 20 major operations, the winner made no pursuit or only a half-hearted one; Thomas after Nashville and Grant in April 1865 are the strongest examples of effective pursuit (snippet) [FREY].
- Biggs: no Civil War battle forced a political settlement. Armies were hard to destroy: the Army of Tennessee, beaten at Missionary Ridge, was at its strongest by May 1864. The nearest cases of destruction were Nashville (a few thousand survivors reached Alabama), Richmond, Kentucky (a Union force nearly annihilated) and Sailor's Creek (a third of Lee's army lost) [CCWRT] (fetched).
- [I] In the field, armies were destroyed by being cut off and surrendering (Fort Donelson, Vicksburg, Appomattox), or by a rout followed by a cavalry-led pursuit (Nashville). A lost battle by itself destroyed none.

### 2.7 Attacker and defender
- Dupuy: the average attacker brings about twice the defender's numbers [DUP-V]. The Dupuy Institute found Civil War attackers winning half the time at 2.1–2.3 to 1 (snippet) [DUP-49].
- In open battle the attacker's per-1000 rate is often lower than the defender's because he is larger (Antietam, Shiloh). Against works it is far higher (2.2) [LIV] [I].

---

## 3. Design constraints the proposal must meet
- Hard rules 4–6: integer permille arithmetic, `Math.trunc`, named seeded streams, every number returned with its terms.
- 0007: **no person decision uses a stream.** Whether to commit the reserve, attack again, withdraw or pursue is the commander's seat's decision from his own view. Streams supply only exogenous battle variance.
- 0019: a force never retreats into a region under 50‰ friendly control. So a force is destroyed only when it has no legal retreat.
- 0029: fortification and entrenchment are region state with one writer, and sieges are operations.
- 0027 and 0026: the kernel resolves whole days. The night-of-the-battle log is built from hour-stamped dispatches; orders wired in response arrive for a later day.
- 0032: reports are typed, with an author, route, filters and bias terms.
- 0033: force blocks with a strength that can range widely; a tick cost of about 100 µs per block per day.
- AWWV: a retreat is not destruction; no 150-step engine; a battle receipt names the forces and operations that caused the battle.

---

## Proposal

**One battle calculation per day of battle per region, between the force blocks in contact, using six inputs a player could name:** contact, battle type, posture and works, quality, the commander's decisions, and bounded noise. Each day ends with a typed result per side. Retreat, rout and pursuit are separate steps, and a force is destroyed only when it is cut off.

### P1. When a battle exists
- A battle opens in a region on the day opposing force blocks are there and at least one side's operation has an attacking posture (FOUNDATION section 5). If both sides are advancing, it is a **meeting engagement**.
- `combat` owns a **battle record**: id, region, start day, the sides' block lists, the operations that caused it (AWWV's battle receipt), and the per-day results. It is the only writer of that record.
- `combat` *proposes* deltas: strength, stragglers, morale and experience to `forces`; control to `control`; results to `people`; reports to `messages`; operation outcomes to `operations`. It writes none of them itself (one writer per field).
- The battle closes when one side has left the region, when both commanders choose not to attack, or after a pack cap on days (default 7, the Seven Days).

### P2. Battle type (typed, chosen by rule)
| Type | Rule | Base rate (K+W per 1000 men in contact per day), attacker / defender, starting values |
|---|---|---|
| `meeting` | both sides advancing, or no works and the defender arrived the same day | 110 / 110 |
| `attack_open` | defender in place, works level 0 | 120 / 110 |
| `attack_hasty` | works level 1 (dug in overnight) | 140 / 75 |
| `assault_works` | works level 2+ (prepared or fortified) | 160 / 35 |
| `rearguard` | the day after a withdrawal, with the winner pursuing | 40 / 80 |

- The base rates are placeholders inside the bands of 2.1–2.2, for the calibration lane to fit. They are pack data.
- Siege assault is `assault_works` inside a siege operation (0029).

### P3. Contact (the frontage cap)
- **Present** = a block's strength minus its stragglers. **Committed** = the share the commander commits today (P6). **Engaged** = committed, capped by the region's frontage (pack data per terrain type: men who can be in contact per side per day).
- **Men in contact** C = min(engaged A, engaged B). Both sides' losses are computed from C, not from their own size. This reproduces Livermore's main pattern: equal absolute losses in open battle, and a higher rate for the smaller side (2.2).
- The larger side gets a bounded **numbers term**: reserves and room to outflank lower its losses and raise its odds of turning a flank. Capped at ±150‰, so a force ratio never wins by itself (Kirkpatrick, Dupuy verity 6).

### P4. Daily losses: additive terms on a base rate
For side A on day d:

```
mult_A‰ = 1000 + Σ terms_A‰                 (clamped to 250..3000)
kw_A    = trunc(C × base_A‰ × mult_A‰ / 1,000,000)
```

- Each term is a typed record {kind, value‰, source}. The terms are added, not multiplied, so the breakdown reads as a list ("works level 2: −450‰; enemy commander's competence: +80‰; day 3 of battle: −200‰").
- **Terms**, with starting bounds:
  - terrain (difficult ground lowers both sides) ±200;
  - weather (rain and mud lower both sides, Dupuy 11) up to −250;
  - quality difference: the enemy's experience, morale, supply state and equipment against one's own, ±300;
  - commander competence of both sides, ±150 (hidden true stats, 0020);
  - surprise (a meeting engagement where one side's intelligence failed, Shiloh) up to +300 on the surprised side;
  - posture: all-out raises both sides (Dupuy 18) +200; probe lowers both −400;
  - successive day: −100 per day after the first (Dupuy 13);
  - numbers (P3) ±150;
  - noise (P7) ±150.
- **Missing** is separate: missing_A = kw_A × missing‰, where missing‰ comes from the side's result (P5): about 50‰ if it held, 250‰ if it fell back, 500‰ if it routed, and the bulk of the force if it is cut off (Fox, 2.3). Missing men go to the block's **stragglers pool**, not to the dead. Only the captured share is permanent, and it depends on pursuit (P8).
- Integer remainders: the breakdown's parts must sum exactly to the total (largest-remainder rule, ties broken by term kind).

### P5. End-of-day result (typed, per side)
- **Morale** falls with the day's loss share, with a broken flank, and with the commander's nerve. It rises with experience and supply. These are deterministic terms, the same style as P4.
- The result for each side is one of: `held`, `gained_ground`, `fell_back` (still in the region), `withdrew` (leaves at night by a legal edge, in order), `routed` (morale below the pack's rout threshold: leaves in disorder, with high missing and equipment loss), or `cut_off` (no legal retreat edge under 0019).
- `held`, `fell_back` and `withdrew` are **the commander's choices** (P6). `routed` is mechanical, from morale, so the general does not choose it; his nerve and competence moved the morale terms that caused it.
- **The winner of the day** is the side that holds or gains ground, as in AGEoD. A separate **battle verdict** at the close records three typed parts: the field (who held it), the operation (did the loser abandon his objective?) and the damage (each side's loss share). A side can lose the field and win the operation.

### P6. People decide; the kernel offers the menu
Three decisions per side per day, each from the commander's view (what he believes about the enemy, 0011 and 0015), never from truth and never from a stream:
1. **Commit** at dawn: all-out, main effort with a reserve, or probe. This sets the committed share and the posture term. A cautious man who overestimates the enemy holds a corps back. (McClellan at Antietam is the usual example [gk]; Grand Tactician gives cautious commanders the same overestimate [GAMES].)
2. **Stand** at night: attack again, hold, or withdraw.
3. **Pursue** (the winner, the morning after a withdrawal or rout): none, follow, or press. Pressing costs supply and his own morale and needs cavalry.

The rule seat decides from nerve, competence, believed odds, supply, standing orders and traits. The AI or a human seat picks only among options the kernel offers. A player's wire arrives for a later day (0026).

### P7. Noise
- One named stream per battle-day: `combat/<battleId>/<day>`. Draw a **fixed number of values per day whatever the branch** (two per side: a loss term and a flank term), so replays and resumes stay exact even when the logic changes branch.
- Each term is the sum of two uniform draws, centred, mapped to ±150‰, which gives a triangular distribution with no transcendental maths.
- The flank draw, against a threshold set by quality and numbers, decides whether a flank breaks today (the Chancellorsville and Chickamauga event). It is exogenous fortune, not a person's choice.

### P8. Retreat, rout, pursuit and destruction
- **A retreat is not destruction** (AWWV). A force that withdraws loses its K+W, plus missing into its stragglers pool. Stragglers rejoin at a pack rate per day (starting value: 100‰ of the pool a day while in supply and not pursued).
- **Rout** adds missing (500‰ of K+W), drops morale to a floor, and imposes a recovery period (starting value: 3–7 days) before the block can attack. It does not kill.
- **Pursuit** turns the loser's stragglers into captured at a rate set by the pursuer's committed cavalry and the loser's rearguard. `follow` captures little; `press` captures much and costs the pursuer. Because commanders choose pursuit, and the rule seat's thresholds follow traits, effective pursuit is rare without anyone forcing it (Frey: 2 of about 20).
- **Destruction and surrender** happen only when a force is `cut_off`: no edge to a region at or above 50‰ friendly control. Then its commander chooses to break out (a new battle day at the assault rates) or surrender (the force becomes captured). This makes Fort Donelson and Vicksburg emerge from pockets and sieges (0019, 0029) without a scripted rule.

### P9. Effects outside combat (proposed deltas)
- **Forces:** strength (K+W, captured), stragglers, morale, experience (both sides gain), equipment.
- **Control:** the side holding the field at close gains control in the region by the pack's rate.
- **People:** the true record of the battle goes to `people`. How it moves a general's reputation goes through the press, and how it moves his nerve goes through his traits (0020: victory does not reliably make men bolder). The officer pool surfaces named colonels for the reports (0020).
- **Politics:** the battle's *reported* verdict, not its truth, moves the blocs through the press (0032). This is the game's central gap between what happened and what was believed.
- **Fortification:** a block in place overnight proposes works +1 to `regions` (or whichever module owns fortification, per 0029), up to a level set by the pack and the date. Digging in grew during the war (2.4), so the date limit and a doctrine level are pack data; there is no rifle-era multiplier.

### P10. The night of the battle: hour-stamped dispatches
- The kernel stays daily. Each battle-day's result carries a **day shape**: the day's losses, ground and flank events apportioned over four phases (dawn, morning, afternoon, evening) by a pack template for the battle type, with the flank draw choosing which phase the break happens in. The day shape is derived from the result, never resolved separately, so it adds no second truth.
- Report generators (0032) then write typed dispatches from the day shape:
  - the commander's wires at phase ends: optimistic and vague, silent on losses (his reading and traits shade them);
  - corps commanders' direct lines, if the president has them;
  - the press, about a day later;
  - the casualty return: the first figure runs about 20% low (Fredericksburg's "ten thousand" against nearly 13,000, from the information-flows note), and missing shrinks later as stragglers return;
  - enemy losses claimed at 1×–3× truth (McClellan claimed 30,000 at Antietam [INFO]; Livermore has 11,724 K+W [LIV]).
- The hour stamp is the phase time plus the route's latency (the kernel owns latency, 0026). The Gettysburg wires ran 5–28 hours late (information-flows note, 2.3), so on most nights the log is mostly silence, then fragments. An army off the wire sends nothing.
- No stream draws for what a person says (0007). The commander's report is a deterministic function of his truth, his traits and his reading.

### P11. Liveness counters and invariants
**Counters** (per run and per month; each must fire within a band in the reference run):
- battles opened, by type; battle days per battle;
- results by kind (`held`, `fell_back`, `withdrew`, `routed`, `cut_off`);
- pursuits chosen by kind, and pursuits that captured more than a pack threshold;
- surrenders and breakouts;
- stragglers created and returned;
- flank breaks;
- works levels gained;
- dispatches emitted per battle-day by type, and battle-days with zero dispatches reaching Washington;
- the share of total loss that each term contributed (so a dead term, such as weather never mattering, shows up).

**Invariants** (in the barrier, typed failures):
- conservation: strength before = strength after + K + W + captured + new stragglers − returned stragglers, for every block every day;
- no strength or pool below zero; engaged ≤ committed ≤ present;
- every breakdown sums exactly to its total;
- a block is removed only after `cut_off` and surrender or a failed breakout, never after a lost day;
- no retreat into a region under 50‰ friendly control;
- every battle-day draws exactly the fixed number of values from its stream;
- people modules import no stream (extends `banned-apis.test.ts`);
- the day shape's phases sum to the day's result;
- every battle record names at least one causing operation.

### P12. Cost and size
- A battle-day touches the blocks in one region, with about 20 terms per side and four draws: microseconds. It fits the 100 µs per block per day budget of 0033 [I].
- Code size target: one `combat` module with the day resolver, the result step and the pursuit step, and report templates in the reports module. If it grows past a few hundred lines of rules, the model has drifted toward AWWV.

### Alternatives rejected
- **AGEoD-style rounds and per-element dice:** unexplainable, and puts a person's retreat on a roll (0007).
- **Raw Lanchester exchange:** the bigger army wins by numbers, which the Civil War data contradict (1.5, 2.2).
- **A full QJM with multiplied factors:** published terms but unreadable products, calibrated on the wrong wars.
- **Sub-day resolution in the kernel:** 0027 settles a daily kernel; the day shape gives the night-of-the-battle log without a second truth.
- **A result table with one die per side (*For the People*):** readable, but too coarse for multi-day battles and missing men.

---

## Calibration targets

Bands and counts from a history run of 1861–62 and from a battle test harness of named historical set-ups. No single battle must match.

**Loss rates**
1. Open battles (`meeting`, `attack_open`): each side's K+W per 1000 engaged across the run averages **100–160 for the Union and 120–200 for the Confederates**, against Livermore's 112 and 150 over 48 battles [LIV p64–66].
2. A single fully engaged day in open battle: **90–240 per 1000** for each side (Antietam 155/226, Stones River 223/266, Perryville 100/196).
3. Open battles: absolute K+W ratio between the sides within **0.5–1.5** in at least 70% of them [LIV].
4. Assaults on works: the attacker loses **2–7 times** the defender's K+W in at least 80% of cases; defender **10–100 per 1000**, attacker **40–220** (Fredericksburg, Chickasaw Bayou, Fort Wagner, Franklin) [LIV].
5. Missing as a share of a side's aggregate loss: **5–15% when it held, 20–35% when it fell back or routed** (Fox) [FOX-XIV]. No side's missing share above 50% except when cut off.
6. Killed to wounded **1 to 4–7** if the model splits them [FOX-XIV] [I].

**Battle shape**
7. Battle length: **60–80% of battles last one day; under 10% last four days or more** [I, from Livermore's dates].
8. Attackers win the field about half the time at **2–2.5 to 1** (snippet) [DUP-49].

**Decisiveness**
9. Effective pursuit (more than 10% of the loser's force captured during pursuit): **at most 2 in every 20 battles with a withdrawal or rout** [FREY].
10. Armies destroyed in the field without being cut off: **0**. Surrenders of forces cut off: **0–2 in 1861–62** (Fort Donelson is the historical one).
11. Battles whose verdict changes the operation (the loser abandons his objective or region): **about 10–20%** of battles of a pack-set size or more, against the CWSAC's 12% Class A; **35–45%** when counting campaign-level effect, against 39% for Class A and B together (snippet) [CWSAC].
12. A routed army returns to at least **80% of its pre-battle present strength within 30 days** if not pursued and in supply (stragglers rejoin) [I].

**Attrition**
13. A force marching hard for two weeks in hostile country with poor supply loses **25–50% of its present strength** to stragglers, mostly recoverable (Lee, September 1862) [ECW-LEE].
14. The Union's present share of its total falls from **about 90% early 1862 to about 75% at the start of 1863** in the history run (war-scale note, 1.1).

**Counts of named things (1861–62 history run)**
15. Battles with more than 10,000 engaged on a side: **12–30**; Livermore tabulates at least 21 battles from Bull Run to Stones River, not all over 10,000 a side [LIV].
16. At least **2 assaults on works** (Fredericksburg and Chickasaw Bayou were both December 1862) and at least **1 surprise meeting engagement** (Shiloh).
17. Battle reports: at least **one battle where the first casualty report is low by 15–30%**, and **one where a commander claims enemy losses of 2× truth or more** [INFO].

---

## Findings outside my scope

1. **Forces need a stragglers (absent) pool, and FOUNDATION's field table needs a battle record.** Missing men are mostly absent, not dead (Fox, Lee in 1862), and the information-flows note already splits present from present-and-absent. Add `stragglers` to the forces fields (writer `forces`, proposed by combat, attrition and the march) and "battle records" to the writer table (writer `combat`). It also gives strength returns (0032) their present-versus-aggregate gap for free.
2. **Livermore's per-battle tables are the calibration fixture.** They are public domain (1900) and already cover engaged and K+W per side for about 60 battles. jrnold's `acw-battle-data` packages them as CSV under ODC-BY [ACWBD]. Under 0033 the pack should re-enter the figures from Livermore and cite him, using the CSV only as a check. A test harness of named set-ups (Antietam, Fredericksburg, Shiloh, Franklin) could run the bands above in CI.
3. **Who owns fortification is still open.** 0029 says fortification is region state with one writer but names no writer, and FOUNDATION's table has no row for it. Combat (works lost when stormed), operations (dig in) and the date-based doctrine all propose changes. It needs a row before Phase 1.
4. **The reported verdict, not the true one, should drive politics.** That is already in 0032's spirit, but the politics lane should state it as a rule, since it is where the game's gap between truth and belief costs the player votes.
5. **Commanders killed or wounded in battle need a placement under 0007.** It is exogenous fortune, so it belongs on a named stream (for example `combat/<battleId>/<day>/leaders`) with a fixed number of draws per day. The officer pool's lazily generated colonels (0020) also need their own stream, keyed by the report, so that whether a report is read cannot change later draws. Neither is in the proposal's four draws per day.
6. **Kirkpatrick's abstract is ambiguous.** "Losses inversely proportional to numbers effectively engaged" could describe absolute losses or loss rates. Read the full text before citing it in a decision record; the proposal rests on Livermore's figures, not on Kirkpatrick.
7. **Gaps to fill:** the Strategic Command manual, Grand Tactician's battle chapter, the full CWSAC class counts and definitions, the Dupuy Institute's 49-battle table (it was down), Livermore's pp. 75–76 classification of assaults, successes and routs, and the Confederate side of the Spotsylvania and Cold Harbor rows.

---

## Sources

**Primary and public domain**
- [LIV] Livermore, *Numbers and Losses in the Civil War in America, 1861–65* (1900), OCR text: https://dn790003.ca.archive.org/0/items/numberslosses00liverich/numberslosses00liverich_djvu.txt (fetched; pages 64–66 for the averages, battle tables pp. 77–140; via https://archive.org/details/numberslosses00liverich).
- [FOX-XIV] Fox, *Regimental Losses in the American Civil War* (1889), chapter XIV: https://wargame.ch/wc/acw/sub/vmi/AoA/Library/Fox/Chapter%20XIV.htm (fetched).

**Games**
- [AGE-BP] AGEoD wiki, "Battle Points" (archived): https://leqg.org/doc/age/www.ageod.net/agewiki/Battle_Points.html (fetched).
- [FTP] *For the People* rulebook (GMT), examples of play and rules 5.21, 5.54: https://rulespal.com/for-the-people/rulebook (fetched; the battle chapter was not reached).
- [MGW-CAS] Grand Tactician guide, casualties: https://guides.magicgameworld.com/grand-tactician-the-civil-war-1861-1865-casualties (snippet).
- [MGW-MOR] Grand Tactician guide, unit morale: https://guides.magicgameworld.com/?p=37549 (snippet).
- [GAMES] This repo's games survey, `docs/research/2026-11-14-civil-war-games.md` (sections 1.5 and 2).

**Models and scholarship**
- [DUP-V] Dupuy Institute, "Trevor N. Dupuy's Combat Attrition Verities": https://dupuyinstitute.org/2016/06/17/trevor-n-dupuys-combat-attrition-verities/ (fetched).
- [DUP-49] Dupuy Institute, "The U.S. Army Three-to-One Rule versus 49 U.S. Civil War battles": https://dupuyinstitute.org/2019/10/29/the-u-s-army-three-to-one-rule-versus-the-civil-war-1861-1865/ (snippet; the page returned 503).
- [HORN] John Horn, "Livermore v. Dupuy: analyzing relative effectiveness": https://johnhorncivilwarauthor.blogspot.com/2016/02/livermore-v-dupuy-analyzing-relative.html (fetched).
- [KIRK] Kirkpatrick, *How Important are Superior Numbers? A Reappraisal of Lanchester's Square Law* (Cambridge, 2021): https://www.cambridge.org/core/elements/how-important-are-superior-numbers/400D403E02FF938651B9CD362F69857E (fetched; abstract only).
- [HESS-R] Review of Hess, *The Rifle Musket in Civil War Combat*: https://historynet.com/cwt-book-review-rifle-musket-civil-war-combat/ (fetched).
- [HESS-S] Reviews of the same book: https://personal.tcu.edu/swoodworth/Hess-RMCWC.htm and https://brettschulte.net/CWBlog/2008/12/21/review-the-rifle-musket-in-civil-war-combat (snippet).
- [AAD] McWhiney and Jamieson, *Attack and Die* (1982), publisher description: https://www.everand.com/book/292909922/Attack-and-Die-Civil-War-Military-Tactics-and-the-Southern-Heritage (snippet).
- [FREY] Review of Frey, *Failure to Pursue*: https://www.strategypage.com/bookreviews/1516 (snippet; the page returned 404 to the fetch).
- [CCWRT] Greg Biggs, "Decisive Battles of the Civil War? None", Cleveland Civil War Roundtable: https://www.clevelandcivilwarroundtable.com/decisive-battles-of-the-civil-war-none/ (fetched).
- [ECW-LEE] "Playing the numbers: Robert E. Lee, the Army of Northern Virginia, and Maryland in 1862", Emerging Civil War: https://emergingcivilwar.com/2019/09/16/playing-the-numbers-robert-e-lee-the-army-of-northern-virginia-and-maryland-in-1862/ (fetched).
- [CWT-LEE] Lee's report on straggling, forum transcription: https://civilwartalk.com/goto/post?id=2229422 (snippet).

**Data sets and references**
- [CWSAC] CWSAC 1993 class counts as reproduced: https://online.norwich.edu/documents/civil-war-sites-advisory-commision-report and https://civilwartalk.com/goto/post?id=2106697 (snippet).
- [CWSAC-D] `acw-battle-data`, CWSAC battles schema: https://acw-battle-data.readthedocs.io/en/stable/resources/cwsac_battles.html (fetched).
- [ACWBD] `acw-battle-data`, Livermore battle list (ODC-BY): https://acw-battle-data.readthedocs.io/en/stable/resources/livermore_battles.html (snippet).
- [INFO] This repo's `docs/research/2026-11-14-union-information-flows.md`, sections 2.3 and 3 (McClellan's 30,000 claim, Burnside's "ten thousand", the Gettysburg wire delays).
