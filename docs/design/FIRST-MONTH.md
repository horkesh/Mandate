# The first month on paper: Lincoln, 4 March to 11 April 1861

Status: design lane output (2026-11-14), a proposal like everything in `docs/design/`. It plays the opening of the March 1861 scenario (0028) against FOUNDATION and decisions 0015–0038 as written, to find missing verbs, missing state and pacing problems before Phase 0 builds the kernel. Nothing here is accepted until a decision record accepts it.

History comes only from the research notes: `docs/research/2026-11-14-secession-winter-1861.md` (cited as **[SW]**), `2026-11-14-union-information-flows.md` (**[IF]**), `2026-11-14-union-command-and-promotion.md` (**[CP]**) and `2026-11-14-war-scale.md` (**[WS]**). Anything the walkthrough needs that those notes lack is marked **[unsourced: needs research]**. Game-side guesses (what the kernel would compute, what a seat would choose) are marked **[game]**.

## How to read this

The walkthrough is a played game. Each **stop** is a moment the game waits for the player: the opening, then the end of each turn. For each stop it gives the days that passed, the reports that arrived (type, author, route, delay, per 0032), the situations that fired (with historical default and staff recommendation, per 0023), what the player sees, what this Lincoln does and what it costs (0025), what the people do with it, and an **engine check**: what the kernel must know, and whether FOUNDATION and the records already provide it. Gap numbers (G1, G2, …) point to the Gaps section.

Where the design has no verb for something Lincoln plainly needs, I use the nearest verb as written, charge its cost, and log a gap. The tally at the end gives attention both **as written** and **with the proposed fixes**.

### Assumptions (none of these numbers is canon)

- **Attention:** 6 points a week, refilled to 6 on 4, 11, 18 and 25 March and 1 and 8 April; unspent points do not carry over. 0025 sets no numbers, so these are mine (G13).
- **Costs:** set a goal 2; edit an arrow 1; transfer 1; audience 1; appoint or relieve 1; send an observer 1; decide a situation 1. Free: approving a draft as written, sending a plan back with notes, delegating, ignoring, reading.
- **Turn ends** on 0027's default list (an objection or refusal, a battle report, a closed pocket, a situation that needs the player, a plan ready for review), plus one player setting: "a report I asked for has arrived" (G12).
- **Seconds of effort** are my estimate of a player who reads properly: 10–20 seconds per short report, 30–90 per situation, about 120 per audience.
- **Latency:** where the notes give a real delay, the walkthrough assumes the kernel's edges reproduce it.

## The desk on 4 March

**Who is in post** [SW 4.2]: Seward (State), Chase (Treasury), Cameron (War, in office from 5 March), Welles (Navy), Smith (Interior), Bates (Attorney General), Blair (Postmaster General); Nicolay and Hay as the president's secretaries; Winfield Scott as general-in-chief, aged 74; Totten, Chief of Engineers. Anderson commands Fort Sumter; Slemmer holds Fort Pickens, with Captain Adams's ships offshore under the truce of 28 January [SW 2.3]. Robert E. Lee is in the army and will be made colonel of the 1st Cavalry on 28 March [SW 1]; his rank before that is **[unsourced: needs research]**.

**What the player has:** almost no army. The regular army is about 16,000 men, most of them in companies at 79 posts in the territories; Twiggs has surrendered the posts in Texas; 286 officers will go south over the coming months [SW 4.1]. There is **no field army and no corps** [WS 1.2], so there is no commander to give a goal to except Scott and the garrison officers. The Treasury holds under $2 million against Chase's estimate of a $320 million need [SW 4.5]. **Congress is not sitting** until a special session the president himself will call [SW, findings]; whether the Senate sits in March for confirmations is **[unsourced: needs research]**.

**The staff map:** the coast from Charleston to Pensacola in pencil; two inked federal points inside hostile ground (Sumter, Pickens), each drawn as a pocket, since neither has a land supply path (0019). The border states shaded by divided control, the proposals in [SW 3] (Maryland 350/250/400, Kentucky 330/250/420, Missouri 450/200/350 and so on). Virginia's convention is sitting, about two-thirds Unionist when elected [SW 1].

**The inaugural is already given:** the federal government will "hold, occupy, and possess" its property, with no invasion and no purpose to interfere with slavery in the states [SW 1]. The scenario treats it as the premise, not a choice (see Findings).

**Sensitive history at the start** (0021, 0026, the gate checklist in [SW 6.8]): the seceded states' declarations name slavery as the cause, and the pack quotes them (modelled with locked consequences). The Corwin amendment, passed by Congress on 2 March, is narrated only; it is never a playable bargaining chip [SW 6.8].

---

## The walkthrough

### Stop 1. 4 March, the opening

**Days passed:** none. **Why the game waits:** the start of the game, with one situation already live.

**Situation S2, Fort Pickens** fires at once, because its cause is present at the start (the truce, Slemmer's garrison, the ships offshore) [SW, situation table].
- Options: reinforce now; keep the truce; abandon both forts.
- Historical default: reinforce (ordered 11–12 March and again 1 April) [SW 2.3].
- Staff recommendation: reinforce, matching Seward, Bates and Chase [SW, S2]. Scott will later advise abandoning both (28 March).

**What the player sees:** a short briefing (who is who, what the map shows), the Pickens card with its options and the staff line, and the attention meter at 6.

**This Lincoln:** reinforces Pickens at once, a week earlier than history. Under the design that means a **goal for Scott**: objective Fort Pickens, posture hold, risk low, permission sea, force Vodges's company [SW 2.3]. Cost 2 (G13: does the situation decision cost 1 on top of the goal? I charge only the goal).

**What the people do:** nothing yet. Scott's seat will answer at the turn boundary (0027).

| Engine check | Provided? |
|---|---|
| A situation live at start, with options, default and staff line | Yes: 0023, lane 0.7 |
| A situation option that issues a goal to a post holder | **Partly.** 0023 says options have consequences; nothing says an option can be an order through a person (G2, G13) |
| A goal whose objective is a coastal fort and whose force is one company | **Partly.** Goals take a region and "divisions committed"; force blocks are brigade-sized in 1861 (0033), so a company is below the unit of account (G17) |
| Pockets drawn at start for Sumter and Pickens | Yes: derived (0019) |

**Effort:** about 4 minutes, most of it the briefing.

### Stop 2. 5 March (one day)

**Days passed:** 4 to 5 March. **Why it stopped:** a situation fired (Sumter), and a plan is ready (Scott's Pickens draft).

**Reports that arrived:**
| Report | Type (0032) | Author | Route and delay | Says |
|---|---|---|---|---|
| Anderson's letter | strength return plus garrison status | Anderson | dated 28 February, arrived 4–5 March, about 5 days; mail through Charleston **[unsourced: needs research: the route]** | Provisions for 4 to 6 weeks; relief would need about 20,000 men [SW 1] |
| Scott's endorsement | none fits: it is advice (G3) | Scott | in person, same day | "no alternative but a surrender, in some weeks" [SW 1] |
| The Confederate commissioners are in Washington | informal source | press and callers **[unsourced: needs research: how Lincoln learned it]** | same day | Forsyth and Crawford arrived 5 March [SW 2.4] |
| Scott's plan for Pickens | plan ready for review | Scott | in person | Land Vodges's company from the ships; asks the Navy for the landing (a support request to Welles) **[game]** |

**Situations that fired:**
- **S1, Sumter's garrison** (cause: provisions under six weeks and no relief possible by force). Options: evacuate; provision only, with notice; reinforce by force; do nothing. Historical default: provision only, with notice on 6 April. Staff recommendation: evacuate (Scott, Totten, Cameron, Seward, Smith, Bates, Welles against Chase and Blair) [SW, S1]. The research calls this the cleanest case of 0023's two fields disagreeing.
- **S3, the Confederate commissioners.** Options: receive; refuse and answer unofficially through Justice Campbell; refuse in writing at once. Historical default: Seward's memorandum, dated 15 March but delivered only 8 April, with informal assurances through Campbell. Staff recommendation: refuse in writing (marked [I] in the note) [SW, S3].

**What the player sees:** the Sumter card with a clock (Anderson's 4–6 weeks from 28 February, drawn as a pencilled range from 28 March to 11 April), Scott's one-line advice, the commissioners' card, and Scott's arrows for Pickens: one short sea arrow from the ships to the fort.

**This Lincoln:**
- **Approves Scott's Pickens plan** as drafted. Free.
- **Wants to keep Sumter open** and learn more before choosing. The design has no "not yet" (G1). Decide, delegate and ignore are the three choices (0025), and **ignore resolves by default**. If "default" means the historical default, ignoring Sumter would send a provisioning expedition with notice: the player would get Lincoln's own policy by doing nothing (C1, G2). This Lincoln leaves the card unanswered in the inbox, assuming the interface allows it.
- **Audience with Scott** to hear his reasons on Sumter. Cost 1. Scott's stated reasons: the fort cannot be relieved by force; his engineers agree [SW 2.1]. What Lincoln really wanted was a written answer to a question, which the design cannot ask (G4).
- **Delegates the commissioners to Seward.** Free. The holder's bias applies (0025).

**What the people do:** Scott's seat complies with the Pickens goal and sends the order through Welles to the ships **[game]**. Seward, holding the delegated S3, chooses the historical line by his own values: a memorandum refusing recognition, held back, and informal talks through Campbell **[game, following SW 2.4]**. He reports the memorandum (his declared rung). He does not report the assurances (his actual rung). This is 0007's declared-versus-actual machinery applied to a cabinet secretary, and it works as designed, provided cabinet seats can act on the enemy's knowledge (G16).

| Engine check | Provided? |
|---|---|
| Report types for a garrison letter | Yes (strength return), but a besieged post's **days of provisions** is not a state field (G11) |
| Advice as a report type ("surrender in some weeks") | **No.** 0032's types are all claims of fact (G3) |
| A situation the player can leave open while its clock runs | **No** (G1) |
| "Ignore" not equal to the historical default | **Contradiction** C1 (G2) |
| Asking a holder a question in writing | **No verb** (G4) |
| Delegating a situation to a cabinet seat, whose choice includes talking to the enemy | **Partly.** Delegation exists (0025); a cabinet seat sending messages to an enemy seat does not (G16) |
| An order relayed Scott → Welles → the squadron | **Partly.** Joint support requests exist (0016); a chain below the Navy Department is relay, which 0026 defers (C2, G8) |

**Effort:** about 5 minutes. Decisions 3 (approve, audience, delegate), one deliberately left open.

### Stop 3. 12 March (seven days)

**Days passed:** 5 to 12 March, a full turn at the seven-day cap. Nothing in the default stop list fired, which is right: the week's news is reading, not deciding.

**Reports that arrived:**
| Day | Report | Type | Author, route | Says |
|---|---|---|---|---|
| 5 | Cameron takes office | informal | narrated | [SW 1] |
| 7–8 | The Adjutant General resigns; a list names his successor | promotion list (0026) | the War Department (Cameron), in person | Cooper resigned 7 March [SW 1]; the list proposes Lorenzo Thomas, whom the note names for the vacated post [SW, starting posts] **[unsourced: needs research: the date Thomas took it]** |
| 9 | Cabinet meeting: Scott's estimate | advice (G3) | Scott, in person | Relieving Sumter needs 25,000 troops and six months or more [SW 1] |
| 11–13 | The Confederate constitution | press report | Southern and Northern papers **[unsourced: needs research: delay]** | Adopted 11 March, with its slavery clauses [SW 1, 6.1]. Narrated, the clauses quoted: gate, locked consequences |
| 12 | Scott's formal letter | advice, with claims | Scott, in person | Relief impracticable; evacuate. Under 100 men against about 3,500; provisions for 26–48 days depending on the ration; a relief fleet takes four months, 5,000 regulars and 20,000 volunteers [SW 2.1] |
| weekly | The front page | press | the pack's papers | The notes have only that evacuation rumours in March drew mixed reaction, some calling it "unfortunate but unavoidable" [SW 5] **[unsourced: needs research: what the March papers said]** |

Attention refilled to 6 on 11 March (5 points were left; they are lost).

**What the player sees:** the Sumter clock now has two sources that disagree: Anderson's 4–6 weeks from 28 February, and Scott's 26–48 days from 12 March, which runs from 7 April to 29 April. The staff map widens the pencilled range. This is the knowledge model doing its job (FOUNDATION section 8: beliefs derived on read).

**This Lincoln:**
- **Approves the War Department's list** for Adjutant General. As written this is an appointment, cost 1 (0025); under the plan-approval principle it should be free (C3, G13).
- **Asks the cabinet for written opinions on Sumter**, as Lincoln did on 15–16 March [SW 2.1]. The design has no such verb. The nearest is seven audiences: 7 points against a budget of 6, so it **cannot be done**; the best available is audiences with the two poles, Seward and Blair (2), plus the situation's single staff line. That loses the most interesting thing in the record: seven people, seven reasons, a five-to-two split. I play the walkthrough with the proposed verb (G5): one call, cost 1, seven written opinions in a day or two.

**What the people do:** the cabinet seats write their answers **[game]**. Each answer becomes a stance on record, which matters later when positions move.

| Engine check | Provided? |
|---|---|
| Two disagreeing reports drawn as a range on the map | Yes (0013, FOUNDATION section 8) |
| Promotion list from the War Department | Yes (0026); its cost is ambiguous (C3) |
| A cabinet meeting as a place where advice is given | **No.** Meetings are not modelled; I fold this into G5 |
| A poll of the cabinet | **No verb** (G5) |
| Gate handling of the constitution's slavery clauses | Yes (0021; [SW 6.8]) |

**Effort:** about 4 minutes. Decisions 2.

### Stop 4. 16 March (four days)

**Days passed:** 12 to 16 March. **Why it stopped:** the last answer to the poll arrived (the player's own setting, G12).

**Reports that arrived: the seven opinions** (advice, in writing, same-day delivery) [SW 2.1]:
| Member | Answer |
|---|---|
| Seward | No. Force would provoke combat; the fort is "practically useless" |
| Chase | Yes, "with serious difficulty"; civil war "highly improbable" |
| Cameron | No; relies on Scott, Totten and Anderson |
| Welles | No; would not provoke hostilities |
| Smith | No; if war must come, better by South Carolina's resistance |
| Bates | No; willing to evacuate; reinforce Pickens and Key West |
| Blair | Yes; evacuation would show the administration "lacks firmness"; Fox can relieve "with little risk" |

The note records a tally conflict (five to two, or five to one with Chase as no) [SW 2.1]. The pack must pick a reading and cite it.

**What the player sees:** seven short cards, each with its author's reasons, and a tally. Blair's card names Gustavus Fox, a private citizen and Blair's brother-in-law [SW 4.2], who has a plan to relieve the fort by sea.

**This Lincoln:** keeps Sumter open and sends **Fox to look at the fort**, as Lincoln did (Fox visited on 19 or 21 March) [SW 1]. As written, "send an observer" sends an office-holder (FOUNDATION section 5), and Fox holds no office until August [SW 4.2]. I charge it as an observer, cost 1, and log G6.

**What the people do:** Fox goes **[game]**; how he reaches a fort inside a hostile harbour is **[unsourced: needs research]**.

| Engine check | Provided? |
|---|---|
| Positions as stances that can later move, with reasons | **Partly.** The people core has values and stated reasons (M2); "a stance on record" that costs a man to reverse is not specified (G5) |
| An observer who holds no post | **No** (G6) |
| A reading of a tally conflict in the pack | Yes: citations per pack datum (0033) |

**Effort:** about 4 minutes, two of them reading. Decisions 1.

### Stop 5. 23 March (seven days)

**Days passed:** 16 to 23 March, at the cap. Attention refilled on 18 March.

**Reports that arrived:**
| Day | Report | Type | Author, route | Says |
|---|---|---|---|---|
| 19–20 | The Missouri convention votes against secession | informal and press | Missouri papers, congressmen **[unsourced: needs research: delay]** | 89–1 or 98–1, unresolved [SW 1]. The map shifts Missouri's loyalty a little toward the Union **[game]** |
| 21–23 | Stephens's "Cornerstone" speech | press | Savannah, then Northern papers | Slavery as the "immediate cause" [SW 6.1]. Narrated, gate |
| ~23 | Fox's report | observer's letter | Fox, in person **[unsourced: needs research: date]** | Relief by sea is possible with tugs at night **[unsourced: needs research: Fox's plan in his own words; the notes give only Blair's summary]** |

Meanwhile, out of the player's sight: Scott's Pickens order is at sea. In history it took about 19–20 days (delivered to Scott 11–12 March, arrived 31 March) [SW 2.3], so the kernel would land it at Pensacola about 24 March **[game]**.

**What the player sees:** Fox's letter. It is more than a report: it is a plan offered by a man who holds no command. The design has no place for it. Plans come only from commanders answering a goal (0016, 0026). G7.

**This Lincoln:** sends **Ward Lamon and Stephen Hurlbut to Charleston**, as Lincoln did (in Charleston about 24–27 March) [SW 1]. Two observers, cost 2. Neither holds an office relevant to the errand **[unsourced: needs research: Lamon's and Hurlbut's posts in March 1861]** (G6).

| Engine check | Provided? |
|---|---|
| A proposal from a person without a command | **No** (G7) |
| An order in transit by sea for about three weeks | Yes: kernel-owned latency (0026) |

**Effort:** about 3 minutes. Decisions 1 (two sends).

### Stop 6. 28 March (five days)

**Days passed:** 23 to 28 March. Attention refilled on 25 March. **Why it stopped:** an objection. Scott, holder of the Pickens goal, now advises abandoning Pickens.

**Reports that arrived:**
| Day | Report | Type | Author, route | Says |
|---|---|---|---|---|
| ~27–28 | Hurlbut's report | observer's letter | Hurlbut, in person **[unsourced: needs research: date he returned]** | Charleston has "no attachment to the Union" and would resist even an unarmed supply ship [SW 1] |
| ~27–28 | Lamon's account | observer's letter | Lamon | Says nothing of what he told Charleston. In the record he implied Sumter would be abandoned [SW 1]: an agent who went past his errand. The player does not learn it yet **[game]** |
| 28 | Scott's memorandum to Cameron | advice; under the design, an **objection** to his own standing goal | Scott, through Cameron | Evacuate both Sumter and Pickens [SW 1]. The note says the cabinet was amazed and read it as political advice, which weakened Scott [SW 2.1] |
| 28 | A War Department list: Lee to be colonel of the 1st Cavalry | promotion list | Cameron | [SW 1] |

**What the player sees:** Scott's objection card with his stated reason. The research gives Scott's earlier argument that evacuation would "soothe" the eight slave states still in the Union [SW 2.1]; whether the 28 March memo said so is **[unsourced: needs research]**. The staff assessment of Scott as an adviser should drop here: he is giving political advice in a military voice.

**This Lincoln:**
- **Audience with Scott.** Cost 1. Lincoln answers with a counter (the M2 typed counters): the order stands. Scott complies, with reservations **[game]**; his grievance rises a notch.
- **Approves the Lee list.** As written 1, proposed free (C3).
- **Asks the cabinet again** (proposed verb, cost 1), as Lincoln did on 29 March [SW 1].

**What the people do:** the cabinet's stances move. The engine has to say why: Hurlbut's report, Scott's loss of credibility, the clock **[game]**. Each stated reason must be a typed term (hard rule 6).

| Engine check | Provided? |
|---|---|
| A holder objecting to his own standing goal | Yes: compliance and the ladder (FOUNDATION section 6) |
| An adviser's credibility, separate from a commander's competence | **Partly.** M2 has credibility functions in `derive`, moving to `politics` (FOUNDATION section 10); assessment (0020) is about generals in the field, not advisers (G3) |
| An agent whose declared report omits what he actually did | Yes in principle (declared versus actual), but it needs G16 for non-commanders |
| A list arriving the same day as a crisis without stopping the turn | **Not specified.** Lists should never stop a turn (G12) |

**Effort:** about 5 minutes. Decisions 3.

### Stop 7. 29 March (one day)

**Days passed:** 28 to 29 March. **Why it stopped:** the second round of answers arrived.

**The second round** (advice, written, Cameron absent) [SW 2.1]:
| Member | 29 March |
|---|---|
| Seward | Against the expedition "in every view"; Anderson to retire forthwith |
| Chase | For provisioning Sumter and holding Pickens; if resisted, reinforce |
| Welles | Concurs in an armed force with provisions and a peaceful notice |
| Smith | Evacuation "a necessity"; present it as forced |
| Bates | Reinforce Pickens "at all hazards"; withdraw or rescue Sumter's garrison |
| Blair | Relieve Sumter "without reference to Pickens" |

**What the player sees:** the board has moved from five-to-two against to a split. The note says only two members explicitly objected to relieving Sumter on 29 March [SW 2.1]. The staff recommendation on the S1 card still reads "evacuate": it has an author (Scott and the War Department) and he has not moved (G3).

**This Lincoln decides S1: provision only, with notice.** The notice is to go to Governor Pickens of South Carolina when the ships sail [SW 1].
- It goes against the staff recommendation, so it costs 1 (as written, deciding always costs 1).
- The option must become an order to people: a **goal for Welles** (objective Fort Sumter, posture provision, risk low, deadline "ready to sail by 6 April", permission sea). As written that is another 2 (G13).
- **Fox to command the expedition.** He holds no post, and there is no expedition post to give him. I charge an appointment, cost 1, and log G6.

Attention this week as written, even without the impossible poll: audience 1, list 1, decision 1, goal 2, appointment 1 = 6, the whole budget. With the fixes: audience 1, poll 1, decision including its goal 1, appointment 1, list 0 = 4. **This is the one week of the month where attention binds**, and as written it binds on bookkeeping, not on the choice.

**What the people do:** Welles's seat accepts the goal; he concurred in the expedition that morning **[game]**. Seward records his dissent, which raises his grievance and lowers his regard **[game]**. Scott, overruled twice in two days, slides a rung **[game]**.

| Engine check | Provided? |
|---|---|
| A situation option that creates a goal, a notice and an appointment at once | **No.** Options have "consequences"; issuing orders through people is not described (G2, G13) |
| A goal with "ready by" timing to a navy holder | **Partly.** Goals have a deadline; the navy works through posts (0028); "ready, sail on my word" is not a posture (G14) |
| A temporary command post for an expedition | **No** (G6) |
| A message to an enemy official (the notice) | **No verb.** I treat it as part of the option (G2) |

**Effort:** about 4 minutes. Decisions 2.

### Stop 8. 30 March (one day)

**Days passed:** 29 to 30 March. **Why it stopped:** two things, by coincidence on one day: the expedition plan is ready, and an objection arrives from Pensacola.

**Reports that arrived:**
| Report | Type | Author, route, delay | Says |
|---|---|---|---|
| The Sumter expedition plan | plan ready for review | Welles, with Fox's annotations; in person | Warships, tugs and transports meet off the Charleston bar; boats run the provisions in; the *Powhatan* as the main warship [SW 1, 2.2: the fleet's tugs and the *Powhatan*] **[game: the plan's shape; unsourced: needs research: the real order of sailing and numbers]** |
| Captain Adams declines to land Vodges's company | objection, relayed | Adams, through the squadron, Welles and Scott; about 6 days back **[game, on the historical 31 March refusal and 6 April receipt, SW 2.3]** | He holds the truce of 28 January as binding and does not land [SW 2.3] |

The outbound order took about 19–20 days and the reply about 6 [SW 2.3]. The notes do not say why the two routes differ **[unsourced: needs research]**, and the edge data will need to know.

**What the player sees:** the expedition's arrows (a long sea arrow from the northern ports to the Charleston bar, a short boat arrow to the fort), the Sumter clock (still 28 March to 29 April in pencil; the bottom of that range has already passed), and Adams's refusal with its reason.

**This Lincoln:**
- **Approves the expedition plan.** Free. (As written, approval is also the go; Lincoln historically held the final word until 4 April [SW 1]. G14.)
- **Answers Adams. This is the first real fork of the month.** Two ways:
  1. **The proper channel:** send the plan back to Welles with a note: "a Navy Department order to land Vodges, overriding the truce". Free. Every holder in the chain complies; nobody's regard suffers. But it travels the same slow route, about 19 days, so it lands in mid-April **[game]**.
  2. **Around the chain**, as history did: on 1 April Lincoln signed orders drawn by Meigs, Porter, Scott and Seward for a special Pickens expedition, run around the War and Navy secretaries [SW 1, 2.3]. It is fast (the troops landed on 11–12 April [SW 2.3]), but it took the *Powhatan* away from the Sumter fleet, because Porter held a Lincoln-signed order and would not turn back when Seward's telegram arrived 15 minutes after she sailed [SW 2.3].

  This Lincoln takes **the proper channel**, so the Sumter fleet keeps its warship and Welles keeps his regard. The price is that Pickens is reinforced later than in history **[game]**.

**What the people do:** Welles signs the order **[game]**. Adams's seat will comply on arrival, because the conflicting standing order (the truce) is now superseded by his own department **[game]**.

| Engine check | Provided? |
|---|---|
| A refusal whose reason is an inherited agreement (the truce) | **No.** No state holds standing agreements or prior orders that a holder's compliance reads (G8) |
| An order relayed down a chain of posts, each with its own compliance and delay | **Contradiction** with 0026's "no relay mechanic yet" (C2, G8) |
| An order sent around the chain, and conflicting orders to one holder | **No** (G9) |
| Choosing a faster route for one order, at a price | **No** (G9) |

**Effort:** about 4 minutes. Decisions 2, one of them the month's best.

### Stop 9. 1 April (two days)

**Days passed:** 30 March to 1 April. Attention refilled on 1 April. **Why it stopped:** a challenge from a cabinet secretary, which the ladder (FOUNDATION section 6) treats as an objection.

**Reports that arrived:**
| Report | Type | Author, route | Says |
|---|---|---|---|
| "Some Thoughts for the President's Consideration" | none fits: a memorandum to the president (G3) | Seward, in person | No domestic policy beyond abandoning Sumter; demand explanations from Spain and France; implies the president should let him direct policy [SW 2.4] |
| Anderson, 1 April | garrison status | Anderson, by mail, arriving later (stop 10) | Rations for "about a week longer" [SW 2.1] |

**What the player sees:** Seward's memo, framed by the ladder as a rival's bid: a rung above grumbling, below public defiance.

**This Lincoln:** **audience with Seward.** Cost 1. Lincoln's answer in the record was a draft reply saying he must hold the property [SW 2.4]; in the game, the counter is "I must do it", which asserts the president's authority. Seward's seat steps back down the ladder **[game]**, but his grievance stays. The audience works as designed.

| Engine check | Provided? |
|---|---|
| A cabinet member climbing the ladder | Yes (the M2 ladder and rivals, FOUNDATION section 6) |
| A memorandum as a report type | **No** (G3) |

**Effort:** about 3 minutes. Decisions 1.

### Stop 10. 4 April (three days)

**Days passed:** 1 to 4 April. **Why it stopped:** the Sumter clock crossed a threshold. Anderson's 1 April letter arrived ("about a week longer"), so the pencilled end of his provisions is now about 8 April **[game, from SW 2.1]**. Under 0027 this is not a stop; it should be (G11).

**Reports that arrived:**
| Day | Report | Type | Author, route | Says |
|---|---|---|---|---|
| 1–3 | Connecticut's election | press and informal | papers, the state party | Buckingham 43,012, Loomis 40,926: a narrow Republican hold, before Sumter [SW 5] |
| 2–3 | Chase's loan | economy report | Chase, in person | Offered $8 million, placed $3.1 million at an average of 94.01 [SW 4.5] |
| 4 | Anderson, 1 April | garrison status | Anderson, by mail **[game: route]** | A week of rations left [SW 2.1] |
| 4–5 | Virginia's convention rejects secession | press, informal | Richmond **[unsourced: needs research: wire or mail]** | 90–45 [SW 1] |

**What the player sees:** the clock on Sumter nearly out; the expedition due to sail by 6 April; a better day in Virginia; a poor loan; a narrow election. Almost all of it is reading.

**This Lincoln:** gives the final word to sail (as Lincoln told Fox on 4 April [SW 1]). As written there is nothing to do, because approving the plan on 30 March was already the go (G14). Whether Lincoln dealt with Virginia's Unionists in this window is **[unsourced: needs research]**; the "address" and "promise" verbs could reach them if he did. Cost 0.

**What the people do:** the expedition assembles **[game]**. Chase's seat asks for nothing yet, because Congress is not sitting and there is no lever to ask for (G15).

| Engine check | Provided? |
|---|---|
| A garrison's provisions as state, falling day by day | **No** (G11) |
| A provisions threshold as a decision point | **No** (G11) |
| An economy report from a holder with nothing to ask | Yes (0023) |
| "Congress not sitting" as a state that changes what Chase can do | **No** (G15) |

**Effort:** about 2 minutes. Decisions 0.

### Stop 11. 11 April (seven days)

**Days passed:** 4 to 11 April, at the cap. Attention refilled on 8 April and went unspent.

**What happened, in the player's sight:**
| Day | Report | Type | Author, route | Says |
|---|---|---|---|---|
| 6 | The notice goes to Governor Pickens | the S1 option executing | carried by the clerk Robert Chew [SW 1] | "Provisions only" |
| 6–8 | The expedition sails | wire dispatch | Welles **[unsourced: needs research: sailing dates and ports]** | |
| 8–10 | The commissioners' channel collapses | informal source | Justice Campbell **[unsourced: needs research: how Lincoln heard]** | Seward's memorandum was delivered on 8 April. Through Campbell, Seward had led the commissioners to expect evacuation; about 7 April he sent "Faith as to Sumter fully kept. Wait and see." Campbell read an evacuation pledge; Seward meant a pledge of notice [SW 2.4] |

**What happened, out of the player's sight:** on 9 April Jefferson Davis's cabinet decided 5–1 to attack (Toombs dissenting); on 10 April Davis ordered Beauregard to demand the fort's evacuation and, if refused, to reduce it; the demand was delivered on 11 April and Anderson refused [SW 1]. The note is clear that the decision was taken before the fleet could arrive [SW 2.2].

**What the player learns:** delegating the commissioners to Seward in week one had a price. Seward's actual conduct (the assurances) reaches the president five weeks later, by an informal route, and it colours how the South reads the expedition **[game]**. That is the design's information model working at its best: nothing was hidden by a die, only by a man and a route.

**The turn ends at the cap.** The next turn will stop on 12 or 13 April with the first wire or press report of the bombardment (a battle report). In history the Confederates opened fire at 4:30 a.m. on 12 April; Fox's ships arrived off the bar in a gale without the *Powhatan* and the tugs; the fort surrendered after about 34 hours [SW 1]. In this game the *Powhatan* is with the fleet **[game]**, but the decision to fire is the Confederate seat's and was already taken, so it does not change whether the war starts (0028's labelled railroad).

| Engine check | Provided? |
|---|---|
| A delegate's hidden conduct surfacing late through a third party | **Partly** (G16) |
| The first shot as a labelled railroad in the Confederate seat | **Partly.** 0028 labels it, but what triggers it if Sumter is evacuated is not defined (G10) |
| "Who is seen to fire first" as public belief | **Partly.** The press exists (0023); a framing term owned by `politics` is not named (G10) |

**Effort:** about 3 minutes of reading. Decisions 0.

---

## Where a different choice diverges

1. **Pickens, around the chain or through it (stop 8).** Played: through Welles; slower, no grievances, the *Powhatan* stays with the Sumter fleet. Historical: a special expedition signed by the president around the War and Navy secretaries; Pickens is reinforced on 11–12 April, the Sumter fleet loses its warship, and the sources split over whether Seward or Lincoln is to blame [SW 2.3]. The engine needs G8 and G9 to offer this fork at all, and it is one of the best moments in the month: a cost in people against a cost in time.
2. **Evacuate Sumter (stop 7).** This is the staff recommendation, so a player who trusts his staff will take it. Per the sources, evacuation would have soothed the slave states still in the Union (Scott) but demoralised the party and conceded legitimacy; Republican hawks warned Lincoln would be "as dead politically as John Brown is physically" [SW 2.1]. Hurlbut's report suggests Charleston would demand Pickens next, which the note marks as its own inference [SW 2.1]. Under 0028 the war still begins, so the engine must say what starts it: the railroad has to be written as "the Confederate seat opens the war" with a list of triggers (a relief attempt, a Pickens landing, a last date), not as "Sumter is fired on" (G10). Politically, evacuation should be a large, immediate blow to the Republican bloc and a modest gain in the border states, with the press as the carrier.
3. **Reinforce Sumter by force.** The planner cannot produce a plan with the forces that exist. The right engine response is not "option disabled" but Scott's own answer: a plan that asks for 25,000 men and six months [SW 1], which the player cannot supply with Congress away. This is a good test case for the planner returning a request instead of a plan.
4. **Decide the commissioners yourself (stop 2).** Refusing in writing at once costs 1 attention and removes the Campbell channel, so there is no "faith" misunderstanding on 8 April. Receiving them would be a recognition signal the foreign-pressure clocks (0023) must read.
5. **Order Pickens on day one, not 11 March (stop 1).** Played: the refusal comes back a week earlier than in history (30 March instead of 6 April), which is what gives the player time to choose the proper channel. Small choices in March move the April crisis.

---

## Tally

| Stop | Date | Days in turn | Why it stopped | Reports read | Decisions | Attention as written | Attention with fixes | Seconds |
|---|---|---|---|---|---|---|---|---|
| 1 | 4 Mar | — | opening; S2 live | 1 briefing | 1 | 2 | 2 | 240 |
| 2 | 5 Mar | 1 | S1 fired; plan ready | 4 | 3 | 1 | 1 | 300 |
| 3 | 12 Mar | 7 | cap | 6 | 2 | 3 (and the poll impossible) | 1 | 240 |
| 4 | 16 Mar | 4 | requested answers in | 7 | 1 | 1 (no such observer) | 1 | 240 |
| 5 | 23 Mar | 7 | cap | 3 | 1 | 2 | 2 | 180 |
| 6 | 28 Mar | 5 | objection (Scott) | 4 | 3 | 2 (and the poll impossible) | 2 | 300 |
| 7 | 29 Mar | 1 | requested answers in | 6 | 2 | 4 | 2 | 240 |
| 8 | 30 Mar | 1 | plan ready; objection (Adams) | 2 | 2 | 0 | 0 | 240 |
| 9 | 1 Apr | 2 | challenge (Seward) | 2 | 1 | 1 | 1 | 180 |
| 10 | 4 Apr | 3 | clock threshold (needs G11) | 4 | 0 | 0 | 0 | 120 |
| 11 | 11 Apr | 7 | cap | 3 | 0 | 0 | 0 | 180 |
| **Total** | 38 days | mean 3.8 | | **42** | **16** | **16, plus two unaffordable polls** | **12** | **2,460 (41 min)** |

- **Attention available:** 6 refills of 6, so 36. Spent with the fixes: 12. As written, the week of 25 March spends its whole budget (6 of 6) on bookkeeping charges and still cannot afford the poll; with the fixes it spends 4, and four of the six weeks spend a third of the budget or less.
- **Approvals as drafted:** 4 of 16 decisions (two plans, two lists). Nothing like an "approve, approve, approve" loop.
- **Stops that were not worth stopping for:** stop 2's plan (merged with a real stop, luckily) and stop 8's plan (likewise). In a turn without a real stop beside them, each would have been a one-day turn for a single free click (G12).

---

## Gaps

Ranked by how much they matter to the first month. Each names the fix and what it touches.

### Top gaps

**G1. A situation cannot be held open.** Sumter is live from 5 March to 6 April; the right play is to wait and gather information while the clock runs. The design offers only decide, delegate or ignore.
*Fix:* situations have a **live** state. While live, the cause predicate is re-evaluated daily; options can **expire** (reinforce by force goes when the fleet cannot be ready) or **appear**; the situation re-stops the turn only when an option expires, a new one appears, or a pack-set clock threshold is crossed. Pack fields: `expiresWhen` per option, `resurfaceOn`. *Touches:* 0023, FOUNDATION section 7 (situations), section 9 (decision points), lane 0.7's schema.

**G2. "Ignore" resolves to the historical default (contradiction C1).** 0025 says an ignored decision "resolves by default"; 0023 gives each situation a historical default. Read together, ignoring Sumter sends Lincoln's own expedition. The historical default is also a hindsight leak if the player can see it.
*Fix:* three different things. **Ignore** resolves to a required, pack-authored `inaction` outcome (for Sumter: the garrison starves, then surrenders). **Delegate** hands the choice to a named holder's seat, which picks by his values (Cameron or Scott would evacuate). The **historical default** is used only by history runs and a rule-seat Lincoln, and is never shown to the player. A situation option may issue orders through people (a goal, an appointment, a notice), not only abstract consequences. *Touches:* 0023, 0025, lane 0.7's enforcing test (add `inaction`, keep the two existing fields).

**G3. Advice is not a report type, and the staff recommendation has no author.** Most of what reached Lincoln in March was opinion (Scott's "surrender in some weeks", seven cabinet answers, Seward's memo). 0032's types are all claims of fact. 0023's "staff recommendation" is a bare field, but in March it is Scott's and the War Department's view, and it carries their bias (the cabinet read Scott's 28 March memo as political).
*Fix:* add an **advice** report type to 0032 (author, recommended option, stated reasons as typed terms, confidence) and a **memorandum** subtype for unsolicited ones. A situation's staff recommendation is an advice report authored by the holder of a named post (the general-in-chief, the relevant secretary), so its bias and the author's credibility as an adviser (separate from his field assessment under 0020) are visible. *Touches:* 0032, 0023, 0020, FOUNDATION section 8.

**G4. No verb to ask a question.** Lincoln constantly asked for reports ("Have you anything from Grant?" [IF 2.2]). The design can only hold an audience, which is costly and in person.
*Fix:* add **Inquire** to the verb list: ask any holder for a report on a subject. It travels like an order and comes back as a report from that author, shaded by him. Cost 0 attention; repeated inquiries to the same man in a week cost his patience (regard). It names no place except as a subject, so hard rule 1 holds. *Touches:* FOUNDATION section 5 (verb list), 0016, 0025, 0032; the verb-list architecture test.

**G5. No verb to consult the cabinet.** The 15 and 29 March written polls are the heart of the Sumter decision. As written they cost seven audiences, which no weekly budget can pay.
*Fix:* add **Consult** (one attention point): ask a set of holders (the cabinet, or the cabinet plus Scott) for written advice on a situation. Answers arrive as advice reports. Each answer becomes a **stance on record**: reversing it later costs the man consistency, and a stance can leak. Cabinet meetings need not be modelled as places; this verb is the meeting. *Touches:* FOUNDATION section 5, 0025, the people core's regard and values (the Starfleet council-adoption rule fits here).

**G10. The war-opening railroad is underspecified.** 0028 says player choices shape "who is seen to fire first", and the research says the firing was the Confederate seat's decision, already taken [SW, design implications]. If Sumter is evacuated, nothing is defined to start the war.
*Fix:* a superseding record restates the railroad as "the Confederate seat opens the war", with an ordered trigger list (a relief attempt at Sumter; a landing at Pickens; a last date) and a guaranteed fallback, labelled in data and docs. The player's choices set a **framing** term owned by `politics` (who the public believes began it, through the press), the timing, and which fort. *Touches:* 0028, FOUNDATION section 7, lane 0.7.

### Other gaps

**G6. Agents without posts, and temporary posts.** Fox, Lamon and Hurlbut held no office relevant to their errands, yet they were Lincoln's eyes in March; Fox then commanded the expedition.
*Fix:* "send an observer" may target any rostered person; a person without a post carries personal bias only. "Appoint" may create a **temporary post** (an expedition command) that dissolves when its operation ends. *Touches:* FOUNDATION section 5, 0020 (observers), 0033 (posts nest).

**G7. Unsolicited plans.** Fox and Blair brought a relief plan nobody had ordered.
*Fix:* any person can submit a **proposal**: a candidate plan the kernel drafts from his traits and the map. The player adopts it by giving a goal to a holder with the proposal attached; the holder reads it like any order (and may resent an outsider's plan). Seats still never invent a plan the kernel has not validated (0026). *Touches:* 0026, FOUNDATION section 5.

**G8. Relay down a chain of posts, and inherited agreements (contradiction C2).** The Pickens order went president → Scott → Welles → squadron → Captain Adams, who refused because of the 28 January truce. 0026 says there is "no relay mechanic yet" (written about corps). The navy's posts (0028) make relay unavoidable in week one.
*Fix:* relay is ordinary message passing between posts: each link receives the order as a message, applies its own compliance and delay, and forwards or objects. 0026's deferral stays for corps inside an army only. Add **standing agreements and prior orders** as state on a post (owner: `command`, proposed by verbs and situations), which a holder's compliance reads; a newer order from his own department supersedes them. *Touches:* 0026, 0028, FOUNDATION section 10 (`messages`, `proxy`, the field-to-writer table).

**G9. Going around the chain, and choosing a route.** The historical Pickens expedition ran around the War and Navy secretaries and produced the *Powhatan* mix-up [SW 2.3].
*Fix:* any order may be sent **direct** to a holder below the one who should relay it: faster, a grievance for the bypassed holder, and a risk of conflicting orders. A holder with two conflicting orders resolves them by his compliance (signer's rank, recency, his own preference) and reports which he obeyed. A special messenger or fast ship is a route choice with a price. 0032 already lets the president go around a filter for reports; this is the same idea for orders. *Touches:* FOUNDATION section 5, 0032, 0026 (latency).

**G11. A besieged post's provisions.** Sumter's clock is the month's engine, and no state field holds it. A pocketed force block has strength, morale and equipment but no days of supply.
*Fix:* add **stores on hand** (days) to a force block, written by `forces`, proposed by supply each day (falls when the block is in a pocket, refills when a path or a sea delivery reaches it). A pocket whose stores cross a pack-set threshold is a decision point, like a pocket closing. The player never sees true stores, only the garrison's reports and the staff's pencilled range. *Touches:* FOUNDATION section 4 and 10, 0019, 0029 (sieges "take time, supply and patience").

**G12. Stop hygiene.** Two of eleven stops carried a plan with nothing to decide; a quiet one would have been a one-day turn for one free click. Lists arriving mid-crisis must not stop the turn.
*Fix:* (a) a goal can carry **"approve as drafted unless he objects"**; the plan then executes without a stop, and an objection or a large departure from the goal still stops. (b) Lists, promotions and routine returns go to the inbox and never end a turn. (c) "A report I asked for has arrived" is an optional stop type (needs G4 and G5). *Touches:* 0027, 0025.

**G13. Attention accounting.** 0025 gives no numbers and leaves several charges ambiguous; as written, the crisis week went over budget on bookkeeping.
*Fix, as a cost table in the pack with these rules:* a situation decision includes the orders its option issues (no double charge); accepting the staff recommendation is free and overruling it costs 1 (the same principle as approving a draft, and it makes overruling your advisers the thing that costs); approving a promotion list as drafted is free, each amendment costs 1 (resolves contradiction C3 with 0026); sending back with notes is free; attention refills to cap with no carry-over, and the meter shows the next refill date. *Touches:* 0025, 0026.

**G14. Ready versus go.** Lincoln approved the expedition's preparation and gave the final word days later. As written, approval is the go.
*Fix:* a goal's timing can be **"prepare, await my word"**; the operation assembles and waits; "go" is a free command. *Touches:* FOUNDATION section 5 (goal fields), 0016.

**G15. Congress not sitting.** Raised by the secession-winter lane and confirmed here: in March, Chase has no lever to ask for and no one to answer to, and later presidential acts (the calls, the blockade, habeas) must be answered for at the special session.
*Fix:* a `politics` state for each chamber (sitting, adjourned, special session called), which changes which situation options are legal and creates an accountability check at the next session. Whether the Senate sat in March for confirmations is **[unsourced: needs research]**. *Touches:* 0023, FOUNDATION section 7.

**G16. Seat initiative outside the field.** Seward's back channel, Lamon's freelancing and Seward's "Some Thoughts" are cabinet and agent seats acting unprompted, including toward the enemy. FOUNDATION section 8 describes seats answering requests; the ladder covers rivalry; neither covers initiatives that create messages to an enemy seat.
*Fix:* each seat gets a pack-defined **initiative menu** evaluated in the weekly people step (open a channel to the enemy, write to the press, propose a plan, bid for authority), resolved by the same compliance machinery with declared and actual rungs, and delivered to the president only through report routes. *Touches:* FOUNDATION section 8, the people core, 0032.

**G17. The planner's first jobs are naval.** The first two plans of the campaign are a company landing at a fort and a relief run over a harbour bar: sea edges, tugs, small forces below the 1861 force block.
*Fix:* lane 0.9's spike adds one small joint relief operation to its cases (a sea route, a landing, a support request to a navy post), and the world format allows detachments below the force block for garrisons and landings. *Touches:* 0030 item 5, 0033.

**G18. Patronage is the likeliest bookkeeping trap in this window, and it is unsourced.** How much of Lincoln's March went to office-seekers is **[unsourced: needs research]**. If the pack models it, it must arrive as weekly lists with defaults (like promotions), never as one card per office. *Touches:* 0023.

### Contradictions found

| # | Between | What | Resolved by |
|---|---|---|---|
| C1 | 0025 and 0023 | "Ignore resolves by default" and "historical default" together make ignoring Sumter play Lincoln's policy | G2 |
| C2 | 0026 and 0028 | "No relay mechanic yet" against navy posts whose orders must relay in week one | G8 |
| C3 | 0025 and 0026 | Approving a draft is free; appointing costs; a promotion list as drafted is both | G13 |
| C4 | 0028 and [SW] | "Who is seen to fire first" as a player lever, when the firing is the Confederate seat's decision already taken | G10 (needs a superseding record) |

One more mismatch that is scenario data, not a design gap: 0032's filtering telegraph office belongs to Stanton's War Department from March 1862 [IF 2.1]. In March 1861 that filter post should be empty in the scenario start, and the 1861 game should feel different for it.

---

## Pacing verdict

**Is the first month fun?** Yes, as a political thriller, and the design's best ideas carry it: a clock that is only ever a pencilled range from disagreeing reports; seven advisers with seven reasons; a delegate (Seward) whose real conduct surfaces five weeks later by an informal route; an order that dies at the bottom of a chain for a reason the player can read (the truce); and a genuine fork between a cost in people and a cost in time (Pickens). None of it needs a die. "I should have known" is available at every turn.

**Is it cheap to operate?** Yes, with the fixes: 11 stops, 16 decisions, 12 attention points of 36, about 41 minutes for 38 days. Four decisions were approvals, so there is no "approve, approve, approve" loop. As written it is not cheap where it matters: the two polls are unaffordable, the crisis week spends its whole budget on bookkeeping charges, and the player cannot hold Sumter open without exploiting an inbox loophole.

**What is wrong with it:**
1. **The core loop barely appears.** There is no army in March 1861, so goals and arrows show up only as two small naval plans. A player who bought the game for plan review and arrow edits waits until summer. This does not hurt the campaign (the opening is meant to be politics), but it matters for the demo in 0037.
2. **The month is dense.** Turns averaged 3.8 days, not a week, and the effort came to about 7.5 minutes per game week. At that rate a 209-week campaign takes about 26 hours, just over 0027's 15–25. The war months will have battles and plans on top. The dials are the stop list (G12) and the share of reading that is skimmable.
3. **Attention is slack.** Four of the six weeks used a third of the budget or less. That is fine before the war, but attention teaches the player nothing in month one. Do not tune it up to bite here; let the war make it bite, and judge it with the liveness gate (0025 already logs it).
4. **The No Greater Glory risks are in the gaps, not the design's intent:** a cabinet poll priced as seven audiences, an observer per errand without a cheap way to send agents, promotion lists charged per name, and (if modelled) patronage card by card.

**What to change, in order:**
1. Add **Inquire** and **Consult** to the verb list (G4, G5), and let situations stay **live** with expiring options and a clock (G1). Without these three, March cannot be played as Lincoln played it.
2. Separate **ignore, delegate and the historical default**, and hide the default from the player (G2). Lane 0.7 should build its schema with `inaction` and an authored recommendation from the start (G3).
3. Restate 0028's railroad with a trigger list and a framing term (G10) before any situation is authored.
4. Write the attention cost table with the free paths (G13) and the stop hygiene rules (G12).
5. Make the **demo** (0037) start from a later scenario (0030 allows it), where an army exists and plan review is the first thing the player does; keep March 1861 as the campaign's opening.

---

## Findings outside my scope

- **The demo's start date (0037).** A demo built from the March 1861 start shows no arrows for weeks. The owner and the lead should pick a later scenario start for the Steam demo, since wishlists are the go or no-go signal.
- **Research needed before the March situations can be authored** (a short Sonnet research lane): how Lincoln learned of the commissioners; Anderson's mail route; why the Pensacola order took about 19 days out and 6 back; the dates of Fox's, Lamon's and Hurlbut's reports and Fox's plan in his own words; Lamon's and Hurlbut's posts; the expedition's ships, ports and sailing dates; Lee's rank before 28 March; the date Lorenzo Thomas became Adjutant General; whether the Senate sat in March 1861 for confirmations; how often the cabinet met; what the March papers printed; whether Lincoln dealt with Virginia's Unionists before 4 April; the patronage load; the troops in and around Washington in March 1861; the delays for Richmond, Missouri and Southern press news.
- **0028 needs a superseding record** for the railroad's wording (G10, C4); that is a decision for the lead, not this lane.
- **Lane 0.7 (situations schema) and lane 0.9 (planner spike) are affected before they start:** 0.7 by G1, G2 and G3; 0.9 by G17.
- **The inaugural as a choice.** The scenario starts after the inaugural, so its framing is fixed. A pre-game option for its tone would let the player shape the first weeks, but it touches the gate (the inaugural's slavery passage) and is a design call for the lead.
- **Option labels can leak hindsight.** A Sumter option worded as "provision only, with notice" tells a player which choice history took, much as visible true stats would (0020). Situation options should be worded neutrally, in the advisers' own terms, and listed in a fixed order unrelated to the historical default. This belongs with lane 0.7's string-table and gate checklist.
- **The shared notes folder** had no sibling notes when this lane started.
