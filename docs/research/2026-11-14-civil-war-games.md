# Research: American Civil War strategy games, digital and board (prior art for map, operations and command)

Date: 2026-11-14. Status: research note (not canon).

**Conventions.**
- Citation keys in [brackets] resolve in the Sources list at the end. Page numbers refer to the manual cited.
- **[S]** = seen only in a search-result snippet; the page itself was not read.
- **[gk]** = general knowledge, unverified.
- **[I]** = our interpretation.

**Provenance.**
- **AGEoD and Grand Tactician (sections 1–2):** taken from their official manuals, which are hosted on Steam and were read in full, plus reviews and forum threads.
- **Sections 3–6:** compiled from two research sub-reports, each of which cites pages it says it read. I re-read the sources that matter most for novelty (the two No Greater Glory reviews and the post on Grigsby's leaders) myself.
- **Not reachable:** the AGEoD forum (ageod-forum.com, plain HTTP only), BoardGameGeek and Metacritic all refused automated fetches.

---

## 1. AGEoD: American Civil War (2007) and Civil War II (2013)

### 1.1 Lineage and reception
- **AGEOD's American Civil War: The Blue and the Gray (AACW):**
  - Designers Philippe Thibaut and Philippe Malacher; released June 2007 [AACW-WP], [AACW-Store].
  - More than 300 leaders; promises to let you "put the best leaders in command (if politics allows)" [AACW-Store].
  - Metacritic 63 ("mixed"), IGN 6.2, PC Zone 41% [AACW-WP].
  - Armchair General liked its sweep, and said its logistics show why the Union could not simply march on Richmond. It criticised clumsy play-by-email, slow turn processing and confusing unit organisation [AACW-ACG].
- **Civil War II (CW2):**
  - Released 17 September 2013 by AGEOD and Slitherine. More than 3,000 regions and more than 400 rated leaders [CW2-Store].
  - Armchair General gave the 2014 add-on 89%: "Great graphics, fine AI, exquisite historical detail", against a steep learning curve, long processing, small font and no editor [CW2-BRS].
  - Wargamer called it an "artisan achievement", warning that the micromanagement is not for everyone. This is second-hand, via [CW2-HW].
  - Wargamer's best-of list describes CW2 as the game "where you act as president" [WG-Best].
- **Same engine:** Wars of Napoleon and Pride of Nations. CW2's Regional Decision cards come from Pride of Nations [CW2-Prev], [MG-WON].

### 1.2 Map
- **Size and shape:** more than 3,000 irregular land regions, sea zones and navigable-river regions, from the Eastern seaboard to the Rockies, plus Mexico and the northern Caribbean [CW2-Store].
  - Off-map boxes join the map through transit links, and each transit costs a full turn [CW2M p.16, 18–19, 23].
  - AACW's map was also region-based, from Tucson to Canada [AACW-ACG].
- **Hierarchy:** regions are grouped into States, and States into Departments (Theaters).
  - Some rules work at Theater level.
  - The highest-ranked, most senior leader in a Theater counts as its commander-in-chief [CW2M p.21, 27].
- **What each region carries** [CW2M p.21–23]:
  - a terrain type (clear, woods, forest, hills, mountains, marsh, bayou, wilderness, desert);
  - a Civilization Level (wild, cleared, civilized), which governs foraging;
  - a transport network (none, tracks, roads, railways), which caps movement cost: roads and rail move at clear-terrain cost whatever the terrain, and a train covers one region per day;
  - structures (cities of levels 1–20, depots, forts, ports).
  - **Rivers:** a major river is a severe obstacle to land movement and gives the defender a major bonus. Navigable river sections are separate regions that ships, or troops moving by river, can enter.
- **Control is a percentage, not a flag** [CW2M p.62–63]:
  - Military Control runs from 50/50 to 100/0.
  - You need 25% control to use a region's railways or move supply through it.
  - A stack cannot retreat into a region where its side holds under 5%, so a battle lost deep in enemy territory can mean "complete destruction".
  - AACW also had shared control and per-region loyalty [AACW-ACG].
- **How encirclement emerges:** supply cannot cross enemy-controlled regions, enemy forts and fleets block river supply, and cut-off units starve [CW2M p.58–59, 62–63]. There is no explicit "pocket" rule.

### 1.3 Time model
- Two-week turns, played WEGO.
  - Both sides plan in the Planning Phase.
  - Orders resolve simultaneously in the Resolution Phase, in daily steps ("14 phases – 1 per day") [CW2M p.16, 45], [CW2-Store].
  - Supply and attrition are handled automatically in a Hosting Phase between turns [CW2M p.45].
- The manual is explicit that you plan and your generals execute: you "trust your general's judgment" in resolution. A stack in Offensive posture that meets a superior force will engage and then try to retreat [CW2M p.45].

### 1.4 Command hierarchy and command points [CW2M p.31–37]
- **Stack types:**
  - **Army stack:** needs a 3- or 4-star leader. It is the only real HQ in the game; its fighting formations are its attached corps, and an Army stack on its own never starts combat.
  - **Corps stack:** needs a 2- or 3-star leader within range of an Army.
  - **Independent stack:** anything outside a corps.
  - **Divisions:** formed under a division-enabled general. A division is a unit of up to 18 elements.
- **Command Radius:** set by the Army commander's Strategic Rating.
- **Corps inside the radius gain:**
  - the Army commander's expertise added to their ratings;
  - synchronised movement;
  - a chance to "March to the Sound of the Guns" into an adjacent battle, depending on Military Control and Cohesion;
  - combat bonuses when several corps fight together.
- **Command Points:**

  | Item | Value |
  |---|---|
  | **Command cost** of a brigade or regiment | 1–4 |
  | **Command cost** of a division | 4 |
  | **Command cost** of an Army HQ | 4 |
  | **CP supplied** by a 1-star leader | 4 |
  | **CP supplied** by a 2-star leader | 8 |
  | **CP supplied** by a 3- or 4-star leader | 12 |
  | Cap per stack, before bonuses | 16 |

  - Bonuses: Signal unit +2, Recon unit +1, a capable aide-de-camp +1, and, for a Corps or Army stack, the Army commander's Strategic Rating minus 2. That last bonus can be negative.
- **Out-of-chain penalty:** an Independent stack's leader CP are **halved**. The manual warns that a small, well-led stack moves faster than a large leaderless one and hits as hard.

### 1.5 Leader activation: exactly how AGEoD models inactive generals
- **The check:** every turn, each stack commander tests against his Strategic Rating [CW2M p.43], [AGEWiki-Act].
  - Developer Pocus said in 2007 that AACW rolls a d6, giving about 50% for a typical rating [MG-Act].
  - A leader who was active the previous turn gets +1, worded on the wiki as "+1 Strategic Rating if Active last turn". Pocus put it as +1 for a general who activated but did nothing [AGEWiki-Act], [MG-Act].
  - A corps commander inside his Army's radius has his rating modified by the Army commander's. A cautious Army commander can drag his corps commanders down [AGEWiki-Act], [CW2M p.43].
- **Penalties for failing** (brown envelope icon) [CW2M p.43, 49–51]:
  - movement −35%;
  - up to −35% combat in hostile regions;
  - **Offensive and Assault postures forbidden**;
  - some Special Orders lost: Evade Combat/raiding is barred, and Sortie needs an active leader.
  - Admirals who fail are only delayed.
- **Leaderless troops** are always active but suffer CP penalties [CW2M p.43].
- **Design intent:** the manual says inactivity represents "delayed orders, over cautiousness, or even incompetence" [CW2M p.43]. Pocus tied it to how hard it was for the Union to get its war machine moving with old generals who had seniority [MG-Act].
- **Player reaction:**
  - It was making "life miserable for the Union" (Gem35).
  - One player was "tempted to turn off the activation rule" (MrBoats).
  - Others defended it, saying Lincoln took months to goad McClellan [MG-Act].
  - The rule can be switched off in the options [CW2M p.43].
  - The AI may get +1 to activation at some settings [S, grogheads AAR snippet].
- **[I] What it is not:** activation is a hidden die roll per turn. The general never argues, never asks for anything and never misreports. When he is active, the player moves his stack exactly as he likes. Once activated, he is not a proxy at all; he is a stack with a probability of being usable. This is the obedience roll that decision 0007 rejects.

### 1.6 Seniority, promotion, relief and political cost [CW2M p.27, 32–33, 37, 43–44, 51]
- **Seniority** is a rank-ordered number (1 = most senior) within each star level. Battles won and lost move it.
- **Political Cost** combines rank, seniority, political influence and popularity. The manual's example is McClellan: "The cost of sacking such a leader is not to be underestimated."
- **Promotion:**
  - A leader becomes eligible after good results; a flashing icon appears.
  - Promoting someone to 3 or 4 stars over more senior officers costs NM and VP, scaled by the bypassed leaders' Political Cost.
  - The same applies to giving Army command over a more senior unassigned leader.
  - Relieving an Army commander costs NM in proportion to his Political Cost.
  - Below Army level there is no political cost.
  - Promotion can change a leader's ratings. The manual cites Hood as a capable division commander who incurred excessive losses after promotion to army command.
  - The manual suggests "deadwood can be assigned to dead-end locations".
- **AACW FAQ (eligibility):** a leader qualifies once he has gained 4 seniority points over his base value, or if he is seniority 1 or 2 [S, AGEOD-FAQ].

### 1.7 National Morale, Victory Points and politics [CW2M p.14–16, 78, 82–86]
- **National Morale (NM):**
  - Hitting a side's NM floor or ceiling gives automatic victory; otherwise VP decide the game.
  - NM moves with: objectives taken or lost; battles won (scaled by elements destroyed); promoting juniors over seniors or dismissing politically favoured leaders; late-war weariness; some Historical Options such as exceptional taxes.
  - "War Resilience": a side that still holds its capital regains NM once it falls low.
  - NM feeds back into Cohesion, economic output and recruits, so defeats can spiral.
- **1864:** the manual flags that in 1864 the Union becomes more vulnerable to collapse through low morale, because Lincoln must win victories to be re-elected [CW2M p.15].
- **Victory Points:**
  - Earned from strategic cities (1 VP/turn), objective cities (1–3 VP/turn) and enemy elements destroyed.
  - VP are also spendable as a currency, for example on diplomacy.
- **Foreign Entry Level** runs from −100 to +100. It is pushed by VP, money or NM spent on diplomatic options, and drifts toward the side with higher NM or VP.
- **Political Options:** moving the capital (heavy NM/VP cost), diplomacy (each option has a backfire risk) and prisoner exchange.
- **Regional Decisions:** card-like actions played on map regions, for example suspend habeas corpus, raise partisans or build railroads. Patch 1.02 added spies and rail sabotage [CW2M p.84–86], [CW2-BRS].

### 1.8 Supply, rail and river [CW2M p.52, 57–59]
- **Supply production:** generated by structures, for example city 6/level and depot 4/level, scaled by loyalty, NM and blockade. It is pushed outward each Hosting Phase in three hops, each reaching one to five regions depending on terrain, weather, enemy presence and rail/river/sea links.
- **Units' own stocks:** about two turns of general supply and two battles of ammunition. Lack of supply causes hits and lost Cohesion; lack of ammunition causes severe combat penalties.
- **Depots:** recommended every three to five regions. They are raid targets.
- **Transport pools:**
  - Rail and river movement draw on national pools of trains and steamboats.
  - The pools wear down by 3% and 1% per turn and can be bought back.
  - Capacity used to move troops is not available for supply.
  - Rail lines can be cut and repaired.

### 1.9 How the player sets an offensive [CW2M p.45–56]
- Drag a stack to a region; the game plots the fastest path and shows days per leg.
- Pick one of four **postures**:
  - **Assault:** attack, and storm forts.
  - **Offensive:** attack, but besiege rather than storm.
  - **Defensive.**
  - **Passive:** avoids combat and does not raise control.
- Pick a **rule of engagement**: All-Out, Sustained, Conservative, Feint/Probe, Hold, Defend, Defend-and-Retreat, Retreat-if-Engaged.
- Add **special orders**: forced march, intercept (follow a target stack), synchronised move, move by rail or river, entrench, build depot or fort, destroy rail, evade/raid.
- Combat happens when one side is in Offensive or Assault posture and has detected the other [CW2M p.86].
- **[I] There is no operation object.** Every offensive is rebuilt from per-stack orders every two weeks.

### 1.10 What players praise and complain about
- **Praise:**
  - depth, and logistics that teach why the war was slow [AACW-ACG];
  - historical detail and a decent AI at higher settings [CW2-BRS];
  - a "master piece in strategic gaming" (Captain_Orso) [MG-WON].
- **Complaints:**
  - steep learning curve and micromanagement [CW2-BRS], [CW2-HW];
  - slow turns and confusing unit organisation [AACW-ACG];
  - frustration with activation [MG-Act];
  - a passive Union AI at default settings. The developer said the AI defaults to low aggressiveness and is "like an herd of cats" [MG-AI];
  - bug and rules disputes [MG-WON].

---

## 2. Grand Tactician: The Civil War (1861–1865): the closest modern competitor

- **Release:** Grand Engineer Corps. Early Access August 2020, full release 24 September 2021. Steam "Mostly Positive", 75% of 2,037 reviews [GT-Steam].
- **Role:**
  - The campaign makes you "an important figure in the Cabinet" (funding, policy, army organisation) and also the Commanding General/General-in-Chief running operations [GTM p.28].
  - Yet the in-game Commanding General and General-in-Chief "are appointed by the President, which means you, the player, have no control over it" [GTM p.29].
  - [I] So you are a war minister and a general at once, below an off-stage President. You are never Lincoln.
- **Time:** real time, which can be accelerated or paused, on the campaign map and in battles [GTM p.3].
- **Map:** free movement on a continuous terrain map.
  - You right-click a destination and the commander plans the route. Ctrl-click adds waypoints [GTM p.105–106].
  - **Frontlines** are dynamic zones of control drawn from armies, garrisons and cities; they do not follow borders [GTM p.124].
  - Cities are captured by sitting next to them undefended. Infrastructure points (IIPs) go to zero transport capacity for a time when captured [GTM p.124].
- **Command and control:**
  - **Ranges:** each army shows a combat range and a command range. Corps inside the Army HQ's command range can be pulled into its battles [GTM p.86–87].
  - **Order delays** (optional):
    - Orders are composed and distributed, and the recipient then has to prepare.
    - Delays are much shorter where a telegraph chain reaches the War Department.
    - Army-to-corps delay grows with distance.
    - The delay shows as a countdown on the unit [GTM p.19, 87, 104, 106–107].
- **Feuds:**
  - On the campaign, feuds are an option that makes officers delay orders from commanders they disagree with [GTM p.19].
  - In battle a feud has two states [GTM p.155]:
    - **gray:** the subordinate "does not want to understand" the order, delays it substantially, and may carry it out differently;
    - **red:** he ignores orders and acts on his own initiative, perhaps attacking or perhaps digging in.
  - Feuds arise between famous commanders whose Initiative ratings differ widely.
- **Leader traits:**
  - Fame, Initiative, Leadership, Administration, Cunning and Experience.
  - Commander types: professional (West Point), volunteer, politician, famous, defamed [GTM p.76–79].
- **Political generals:** politicians raise support in their home state but feud more [GTM p.77].
- **Famous commanders:**
  - They keep NM high.
  - They can make an inexperienced enemy commander doubt himself and fall back to a passive defence when ordered to attack [GTM p.77].
  - Promotion raises Fame but costs experience [GTM p.68].
- **Who can command what:** volunteers may command only brigades from their home state; political officers brigades from their home state or HQs; West Pointers anything [GTM p.78].
- **Biased intelligence:** "Cautious commanders will usually overestimate the enemy strength" [GTM p.89]. Low Initiative appears in the attribute table as over-estimation of enemy forces [GTM p.80].
  - [I] This is a McClellan mechanic. The bias is about the enemy, not about the general's own conduct.
- **In battle:** the army commander's personality decides whether he attacks, defends or withdraws. An overly cautious general may give ground "even if in good condition" [GTM p.136–137].
- **Politics and economy:**
  - National Morale decides the war [GTM p.28].
  - Policies take time and "political debate in the Congress", with limited policy slots [GTM p.57–58].
  - Objectives are "set by your government". They are optional and give bonuses when met [GTM p.29].
  - Economy tasks can be handed to the AI (taxes, subsidies, policies, construction) [GTM p.20].
- **Supply:**
  - Armies draw from depots, or forage from nearby IIPs up to the IIPs' transport capacity [GTM p.113].
  - Railroads cannot be used in enemy territory or near enemy units [GTM p.108].
  - Transport capacity is pooled by type, at 200 men per transport [GTM p.108].
- **Planning operations:**
  - Each move order has a panel offering timed departure (to coordinate armies), forced march, retreat, and permission to use rail, sea or river [GTM p.106].
  - A dotted arrow means a plan; a solid arrow means the unit is moving.
  - Stances: offensive and defensive.
  - Readiness gates offensive action [GTM p.19].
- **Reception:**
  - Press quotes on Steam: "definitive" (Wargamer), "threatens to make all previous ACW wargames redundant" (RPS) [GT-Steam].
  - Cultured Vultures gave it 6/10: a "horrendously inefficient and fiddly" UI, a passive AI on lower difficulties, broken naval combat, and a lack of "the more in-depth political system" of comparable games [GT-CV].
  - In Early Access, Wargamer noted weak AI and questionable casualty figures [WG-Best].

---

## 3. The "player is the president" lineage (older than we assumed)

- **No Greater Glory (SSI 1991; re-released on Steam/GOG, December 2024)**
  - **Role:** you are Lincoln or Davis, assigning cabinet, envoy and generals. As Lincoln you can lose the 1864 election, and the game with it [NGG-Steam]. The GOG build runs the original in DOSBox [NGG-GOG].
  - **Scale:** four-month turns. Territories are about half a medium-sized state [NGG-UH], [NGG-Grog].
  - **Cabinet and Congress:**
    - Five posts: Attorney General, Defense, Navy, State and Treasury [NGG-UH].
    - Recruitment needs Congressional approval.
    - Congress and the governors are "constantly looking over your shoulder" [NGG-Grog].
  - **Generals:**
    - Low-initiative generals "refuse to budge" [NGG-UH].
    - You set how hard to fight and whether to pillage, but the general decides whether to obey [NGG-Grog].
  - **Seniority and prestige:**
    - The most senior generals expect the largest commands.
    - Snubbing a prestigious general costs support in his home region; passed-over generals "have friends back home" [NGG-UH], [NGG-Grog].
  - **Verdict:** "a unique flawed masterpiece". Command reassignment and slow transport made up about 60–80% of play, and combat was abstract [NGG-Grog].
- **Frank Hunter's American Civil War: From Sumter to Appomattox (Adanac 1996; freeware since 2002)**
  - **Role:** you play "the president of the Union or the Confederacy and his top-level generals" [Hunter-Intro].
  - **Map and time:** hexes, turns of about 10 days [Hunter-How].
  - **Orders:** you give armies an objective and a stance, and units have "free will" [Hunter-How].
  - **Politics:** promotion without political support costs political points [Hunter-How].
  - **Leaders:** rated for aggression, initiative, inspiration and combat. Bad leaders may fail to move [Hunter-Lead].
  - **Reception:** "arguably the best simulation" of the war, with a cumbersome interface [Hunter-HotU].
- **Gary Grigsby's War Between the States (2by3/Matrix 2008)**
  - **Scale:** grand strategic, a region map, monthly IGOUGO turns [WBTS-ACG].
  - **Political capital** pays for troops, promotions, demotions and entering neutral states [WBTS-MG].
  - **Appointments:**
    - Two theatre slots and four army slots.
    - Stars and firing cost political points.
    - The Union earns political points each term from its appointees' **political ratings**, so low-skill, high-politics generals pay their way [WBTS-CWB].
  - **Initiative:** a dice-rolled check: "No initiative, no movement". Initiative can be passed down to subordinates [WBTS-CWB].
  - **Reception:** Armchair General 83%. The AI is "pretty good" and the politics "somewhat abstracted" [WBTS-ACG].
- **Forge of Freedom (Western Civ/Matrix 2006)**
  - **Format:** an area map with WEGO turns, and optional hex tactical battles [FoF-Sl], [FoF-Blitz].
  - **Politics:** each state has a governor who makes demands, and there are state and national elections [FoF-MG].
  - **Generals:**
    - Senior four-stars block your favourites.
    - Rank slots are capped by army, corps and division containers.
    - A demoted four-star resigned, and the demotion meant a hit with his governor (Erik Rutins) [FoF-Rutins].
  - **Reception:** steep learning curve; a strong tactical layer [FoF-ACG]. One review called it a tactical game "with a strategic system stuck on the side" [FoF-Blitz].

## 4. Other grand-strategic ACW games

- **Strategic Command: American Civil War (Fury/Matrix, July 2022):**
  - IGOUGO on 66,000 hexes of 15 km, with leaders assigned to HQs.
  - More than 160 yes/no decision events, for example Emancipation and the Cotton Stockpile [SCACW-Steam], [SCACW-WNT].
  - The AI is credible but gets bonus units; players regret the thin roster of leaders [SCACW-WNT].
  - No command friction.
- **Victoria II: A House Divided (Paradox 2012):**
  - The ACW fires as an emergent event chain [V2-Wiki]. Destructoid gave it 8/10 [V2AHD-Destr].
  - Generals are generic [gk].
  - **Victoria 3** (not ACW-specific): generals belong to interest groups and defect with them in revolutions [V3-DD41].
  - Paradox ACW mods for HOI4 and EU3 exist [S].
- **Victory and Glory: ACW (2020):** area control, cards and tactical battles. 63% positive on Steam [VaG-Steam], [WG-Best].
- **The Civil War (Dagger, 2020):** turn-based. Orders are given at night and carried out by day, and the campaign ends at the 1864 election [TCW-Steam].

## 5. Operational and tactical digital games (command friction at battle scale)

| Game | Scale / map / time | Command friction | Reception, AI |
|---|---|---|---|
| Ultimate General: Gettysburg (2014) / Civil War (2017) | Tactical, free, real-time with pause | None toward the player. In UG:CW you are a general funded by the government; reputation below 0 gets you fired or "relieved of command" [UGCW-Steam], [UGCW-Disc] | 88% of 5,662 Steam reviews; friendly AI "nails it" nine times out of ten [UGCW-WG]; railroaded campaign [UGCW-Fossil] |
| Sid Meier's Gettysburg! (1997) / Antietam! (1999) | Tactical, real time | Leaders rally troops; little else [SMG-Grog] | Metacritic 92 and 82; AI "competent" [SMG-WP], [SMA-WP], [SMG-Grog] |
| Take Command: 2nd Manassas (2006), Scourge of War (2010–2024) | Tactical, real time, free | Couriers who can be shot, lost or intercepted; subordinates "sometimes" disobey [TC-Blog], [SoW-BS], [SoW-Ch] | Armchair General 95–98% [SoW-ACG], [SoW-Ch]; Remastered 2024 at 88% [SoW-Rem] |
| Civil War Generals 1 / 2 (Sierra 1996/97) | Tactical, hex, IGOUGO | You cannot appoint commanders; ratings depend on superiors [CWG1-Grog], [CWG2-WP] | Weak AI [CWG1-Grog]; more than 700k sold [CWG2-WP] |
| The Blue and the Gray (Impressions 1993) | Strategic map plus tactical | None found | "as history, it was a disaster" [BG93-HotU] |
| North & South (1989) | Arcade strategy | None | CGW 1+/5 for wargamers [NS-WP] |
| Gettysburg: The Tide Turns (PC 2017) | Operational-tactical | Random chit activation by formation [TT-BBB] | Weak AI [TT-Vice] |
| TalonSoft Battleground (1995–) | Tactical hex, 125 yd | "Semiautomatic" leader execution [BGr-Grog] | PC Gamer 90% [BGr-WP] |
| HPS/Tiller Civil War Battles, now WDS | Tactical hex, 20-minute turns | None. Campaign Overland has about a million hexes [HPS-Ov] | "The AI could be better" [HPS-Ov]; WDS owns the series since 2021 [WDS] |
| HexWar Civil War 1861–63 | Tactical hex | None | AI strong on defence, weak on attack [HexWar-ACG] |
| Brother Against Brother (Western Civ 2015) | Tactical hex | Units roll to obey marching orders; orders lost or ignored [BAB-ACG] | Armchair General 93% |
| Battleplan: ACW (2014) | Hybrid | Messengers; corps commander personalities [BP-Steam] | 58% Steam |

## 6. Board games

- **For the People (Herman; Avalon Hill 1998, GMT 2000–2024)**
  - **Format:** grand strategic, point-to-point spaces joined by road, rail and river lines [FtP-R], [FtP-ACG]. Card-driven; you play Lincoln or Davis.
  - **Activation:** a general moves only if the card played is worth at least his Strategy Rating (5.14), which the design notes tie to how much logistic preparation he demanded before moving. An optional Operations Queue banks cards toward one slow general (20.0).
  - **Seniority:** the general with the highest Political Value commands. Creating an army costs Strategic Will if a more political general is passed over (5.22).
  - **Relief:** relieving a general costs Strategic Will equal to his Political Value, halved after a big defeat, plus 2 per general passed over (5.61–5.64). McClellan is strategy 3, political value 10 [FtP-Clio].
  - **Strategic Will:**
    - Each side starts at 100. A big battle swings it +3/−5.
    - The Union loses 5 every Fall.
    - The Confederacy wins if Union Strategic Will is under 50 after Fall 1864 [FtP-R].
    - The "Forward to Richmond" event forces a Union drive.
  - **Reception:** Charles S. Roberts Award [Herman-WP]. BGG 7.8 [BGD-833].
  - "Room at the Top" is **not** in For the People; it is a new A House Divided card. Our 2026-11-13 note groups the two games in one line, which blurs this.
- **A House Divided (Chadwick; GDW 1981, new GMT edition)**
  - **Format:** point-to-point city boxes joined by roads, railroads and rivers [AHD-WP], [AHD-R].
  - **New edition:**
    - Leaders have traits (Cautious leaders get one march only).
    - Arrivals are scheduled for 1862, then driven by event decks.
    - A "Room at the Top" card forces a side to replace a leader [AHD-L1], [AHD-L2].
- **The Civil War 1861–1865 (Victory Games 1983)**
  - **Format:** army/corps level on hexes, 2-month turns [VGCW-WP], [VGCW-RP].
  - **Theatre priority:** players **rank three theatres as Primary, Secondary and Tertiary**, then roll Command Points for each [VGCW-WP].
  - **Leaders:**
    - A leader's initiative sets how much it costs to move his troops.
    - Generals are rated for seniority, and can be sacked, promoted or demoted.
    - A reviewer mentions political costs for removing commanders, unverified in the rules [VGCW-Grog].
  - **Reception:** BGG 7.7 [BGD-2081].
- **The U.S. Civil War (GMT 2015; designer Mark Simonitch, not Herman)**
  - **Format:** hexes, with action points from a die-roll difference [USCW-R], [USCW-BL].
  - **Leaders:** Cautious generals pay double to attack (7.7). Leader churn is scripted on the turn track, with no player choice; reviewers criticised this [USCW-R].
  - **Political pressure:** the Union must meet a resource-capture benchmark each turn (19.3.3, public pressure). The 1864 election check can end the game (S4.3).
  - **Reception:** BGG 8.3 [BGD-162009].
- **Lincoln (Wallace; PSC 2018):** abstract "deck destruction" that simulates pressure; no named generals [Lin-BEV], [Lin-TPS].
- **Battle Cry (Borg; Avalon Hill 2000):** tactical hex; section cards limit which flank you can order [BC-WP].
- **Great Campaigns of the ACW (MMP)**
  - **Format:** operational hex. The initiative cycle runs on die rolls (4.2) [GCACW-R].
  - **Leader moves:** a leader's movement allowance is a die roll plus a side modifier: Union 1d6+1, Confederate 1d6+2.
  - **The "McClellan rule"** in On To Richmond caps how many units a Union leader may activate by the Union's own initiative roll (1–4 allows one unit, 5 two, 6 all) [GCACW-R].
  - In Battle Above the Clouds, certain ties can trigger Insubordination [GCACW-R].
- **Columbia Games, Bobby Lee / Sam Grant:** hex, hidden blocks. HQs are spent to move units, and only the supreme HQ uses rail and river [BL-WP], [BL-Grog], [SG].
- **SPI War Between the States (1977)**
  - **Format:** a monster hex game with weekly turns [SPIWBTS-WP].
  - **Leaders:** a leader acts only on a roll at or under his initiative (McClellan 1, Butler 0) [SPIWBTS-FM].
  - **Politics:** relieving a leader, or calling up a draft, gives the **opponent** Political Points [SPIWBTS-FM].
- **Lincoln's War (Poniske; MMP 2013): the closest board design** [LW-R]
  - Card values serve as Political Currency, which buys activation, promotion and the removal of Immobilization tokens (representing casualties, indecision and insubordination).
  - A "Reluctant to Follow Orders" event raises a general's activation cost by 2 and blocks detaching subordinates.
  - The General-in-Chief is appointed by the President.
  - Seditious politicians drain Political Currency.
  - BGG 6.3 [BGD-35452].
- **Civil War Brigade Series (The Gamers/MMP, tactical)**
  - Written orders travel by courier and on arrival are **accepted, delayed or distorted** after an acceptance check.
  - Players follow orders on the honour system [CWB-R].
  - This is the best precedent we found for orders that come back delayed or distorted.
- **New titles:**
  - Army of the Potomac (Herman, GMT 2026): you are the army commander [AotP].
  - Rebel Tide (Compass 2026): bad leaders can be sacked [RT].
  - Secession 1861 (solitaire, you play the Confederacy against a Lincoln-popularity track) [Sec1861].
- **Not found:** any solitaire game where the player is Lincoln commanding through generals.

---

## 7. Map approaches compared

The test: a game whose fronts follow railways and rivers, and where encirclement means cutting an army off from its supply line.

- **Hexes**
  - Used by Strategic Command (66,000 × 15 km), SPI WBTS, VG Civil War, The U.S. Civil War, GCACW, Hunter and the Tiller games.
  - Strengths: uniform geometry, easy movement and zone-of-control maths, and encirclement by surrounding hexes.
  - Weaknesses for us:
    - Railways and rivers become decorations crossing hexes, or hexside costs, not the front's skeleton.
    - Lines of communication are usually checked by counting hexes to a source, not traced along a rail line with a capacity.
    - Fine hexes invite pushing counters, which is the general's seat that decision 0001 forbids.
    - Board designers bolt on strategic-movement caps to make rail matter, e.g. The U.S. Civil War's rail caps of 12 Union and 7 Confederate strength points (15.2) [USCW-R].
- **AGEoD-style irregular regions**
  - Strengths:
    - Regions can be drawn to the real terrain.
    - Navigable rivers can be their own regions.
    - Rail is a region attribute with a national capacity pool.
    - Percentage control gives soft fronts.
    - Encirclement emerges: no supply through regions under 25% control, no retreat into regions under 5% [CW2M p.52, 58, 62–63]. That is close to what we want.
  - Weaknesses:
    - 3,000+ regions means micromanagement, which is the commonest complaint [CW2-HW], [CW2-BRS].
    - Rail is a property of a region, not an edge, so "cut the Orange & Alexandria at Manassas" is only implicit.
    - Supply runs as an opaque three-hop push the player cannot read.
- **Point-to-point**
  - Used by For the People, A House Divided and, partly, Lincoln's War.
  - Strengths:
    - Links are typed (road, rail, river), so a line of communication is literally a path in a graph.
    - For the People traces rail lines of communication with attrition (9.3) and lets lone generals move freely by rail (5.65) [FtP-R].
    - It reads naturally for a leader-level game: Mandate's questions are "is the line to Nashville open?", not "which hex".
  - Weaknesses: coarse and abstract-looking, and broad fronts and wide flanking moves are hard to draw.
- **Free movement**
  - Used by Grand Tactician, Ultimate General and Scourge of War.
  - GT gets fronts as dynamic zones of control, plus rail availability blocked near the enemy [GTM p.108, 124].
  - Strengths: beautiful and continuous.
  - Weaknesses for us:
    - Real-time continuous positions do not fit integer, deterministic simulation easily (0002).
    - Encirclement is fuzzy.
    - The interface keeps the player dragging armies about, the general's seat again.
- **[I] What the evidence supports for Mandate:** an AGEoD-style region layer as the visible map, with a For-the-People-style typed graph underneath.
  - **The region layer:**
    - It suits decision 0013: GeoJSON regions, and HoI4 front lines derived from the adjacency of claimed control.
    - Regions should number in the hundreds, not thousands.
  - **The graph underneath:**
    - Rail, river and road links between region nodes, each with a capacity; depots sit on the nodes.
    - Supply is traced as a path with capacity from a source, and readable as such.
    - Encirclement is defined plainly as "no path to a source above threshold".
    - Control stays a percentage, as in AGEoD, so fronts are soft.
  - **Rejected:** hexes, because they hide the rail and river skeleton and invite counter-pushing; free movement, because of determinism and the general's-seat pull.

## 8. How these games let the player plan operations

- **Per-stack destination + posture + rules of engagement, every turn (AGEoD).**
  - Works: posture and ROE express intent compactly ("Conservative Attack", "Defend and Retreat"). Intercept, synchronised move and march-to-the-guns hand execution detail to the AI [CW2M p.48–55].
  - Fails: no persistent operation, and every offensive is rebuilt stack by stack every two weeks, hence micromanagement.
- **Arrows with permissions and timing (Grand Tactician).**
  - A dotted plan arrow turns solid when moving.
  - Rail, river and sea use are **permissions** the commander may exercise.
  - Timed departure coordinates several armies, and the order delay shows as a countdown [GTM p.105–107].
  - [I] Permissions and timing are the most transferable idea here: they are intent, not movement.
- **Objective + stance, then the general decides (Hunter's ACW, No Greater Glory).** The closest existing match to a directive [Hunter-How], [NGG-Grog].
- **Theatre priority (Victory Games' Civil War).** Ranking theatres Primary, Secondary and Tertiary is a verb fit for a head of government [VGCW-WP].
- **Activation economies (For the People, Lincoln's War, GCACW, SPI WBTS).** The plan is limited by which general you can get to move. For the People's Operations Queue lets you invest in prodding one slow general [FtP-R], [LW-R].
- **Written orders checked on arrival (Civil War Brigade Series)** and courier latency (Scourge of War) [CWB-R], [SoW-BS].
- **Government-set objectives (Grand Tactician; For the People's "Forward to Richmond"; The U.S. Civil War's capture benchmark):** pressure on the player from above. In Mandate the player is the "above".
- **[I] What works across these games:** orders expressed as objective + posture + permissions + timing; visible latency; and execution filtered through a named commander's traits. What fails: per-stack, per-turn re-plotting, and failures the player cannot explain.

## 9. Gaps Mandate could own (and what is already done)

**Already done. We should stop calling these novel:**
1. **The player as president commanding through generals who may not obey.** No Greater Glory did this in 1991:
   - cabinet, Congress and governors;
   - seniority claims and home-region backlash;
   - the general decides whether to follow orders;
   - a losable 1864 election.

   Hunter's ACW (1996) and Grigsby's WBTS (2008) followed [NGG-Grog], [NGG-UH], [Hunter-Intro], [WBTS-CWB].
2. **Sacking and passing-over costs scaled by political weight:** AGEoD's Political Cost, For the People's Political Value, Grigsby's political points, and SPI WBTS giving the opponent Political Points [CW2M p.37, 44], [FtP-R], [WBTS-CWB], [SPIWBTS-FM].
3. **Slow-walking and reinterpreting orders:**
   - Grand Tactician's feuds already delay orders and carry them out differently, or ignore them outright [GTM p.155];
   - the Civil War Brigade Series has accepted, delayed or distorted orders [CWB-R];
   - Scourge of War and Grand Tactician have order latency, with telegraphs that shorten it [SoW-BS], [GTM p.106–107].
4. **Biased reporting, partly:** in Grand Tactician, cautious commanders overestimate enemy strength [GTM p.89].
5. **A general's fame as political capital:** Grand Tactician's Fame and Defamed status, politician generals who boost home-state support, and fame-driven feuds [GTM p.76–78].
6. **Appointees whose political weight is an asset:** Grigsby's political-rating bonus [WBTS-CWB].

**Not found in any game surveyed. These are Mandate's to own:**
1. **Generals who lie about themselves.** GT's over-estimation is an honest error about the enemy. No game has a general inflate a victory, hide losses, claim he obeyed when he slow-walked, or blame a rival.
2. **No ground truth about your own forces.** Every game shows the player his own stacks exactly; delay is the only fog. A claims-only staff map (0013) with sourced, dated, fading reports has no precedent here.
3. **Pushback that is caused, readable and negotiable.**
   - Everywhere else it is a hidden die roll (AGEoD, Grigsby, SPI WBTS, GCACW, No Greater Glory's initiative check, Brother Against Brother) or a trait-distance feud icon (GT).
   - Nobody offers a counter-proposal ("I will move if you give me McDowell's corps"), conditions or bargaining.
   - The player reaction to AGEoD (switch the rule off, "making life miserable") is evidence that unexplained friction is resented [MG-Act]. This supports 0007 and 0008.
4. **Generals as political competitors over time.** Prestige and home-region support exist (No Greater Glory, GT), and Victoria 3 has defection with an interest group. No ACW game has a general:
   - court the opposition party;
   - leak to the press or the Joint Committee;
   - go over the president's head;
   - run against him in 1864.
5. **An escalation ladder.** Games stop at "won't move" or "acts on his own". None runs slow-walk → reinterpret → leak → appeal to Congress → public defiance.
6. **Memory between the leader and each general:** promises, grievances, trust. GT's feuds are subordinate against superior, never against the player. No Greater Glory's prestige is a static demand.
7. **No unit verbs at all.** Even No Greater Glory and Hunter let the player move armies or set stack orders. Removing direct movement entirely (0001) is untried, and that is both the opportunity and the risk.

**Lessons from the closest precedents:**
- No Greater Glory shows that appointment bookkeeping can swallow the game: "about 60–80% of the game" went on command reassignment and slow transport [NGG-Grog].
- AGEoD shows that unexplained obedience rolls drive players to switch the rule off [MG-Act].
- Grand Tactician shows that a deep sim with a fiddly interface gets marked down hard [GT-CV].

Mandate's directive and Audience layer must therefore be cheaper to operate than these games' order screens, and every refusal must come with a reason.

---

## Findings outside my scope

- **Corrections to our own docs.**
  - Decision 0007 lists Grand Tactician's feuds as "obedience rolls". The manual describes them as caused by Fame and by distance between Initiative ratings, and it never mentions dice [GTM p.155]. They also apply only in battles.
  - The 2026-11-13 note implies "Room at the Top" belongs to For the People. It is an A House Divided card.
  - Nothing edited; flagged for the owner.
- **Market signal [I], from Steam review counts:**

  | Game | Reviews | Positive |
  |---|---|---|
  | Ultimate General: Civil War | 5,662 | 88% |
  | Grand Tactician (base price €44.99) | 2,037 | 75% |
  | Strategic Command ACW | (count not checked) | 84% |
  | No Greater Glory re-release | 11 | 72% |

  [GT-Steam], [UGCW-Steam], [SCACW-Steam], [NGG-Steam]. The ACW strategy audience is real but niche, and the president-player premise alone did not sell the 2024 re-release.
- **An answer to "a deterministic proxy can be solved".** AGEoD and Hunter both offer randomised leader ratings [CW2M p.44], [Hunter-Lead]. Mandate could seed hidden traits once per game at setup without breaking 0007.
- **Anti-snowball rule worth noting.** AGEoD's War Resilience: a side that still holds its capital regains morale once it falls low [CW2M p.15–16].
- **UI and diegesis precedent.** Grand Tactician presents its manual as an 1862 drill book and delivers events as telegrams in a dispatch log [GTM p.1–5, 38–39]. That is a close cousin of the desk UI.
- **Tooling note for future agents.** Steam hosts free manual PDFs, and `pdftotext` is at `/mingw64/bin/pdftotext` in Git Bash. Calling `python` from Bash hung here.

## Sources

**AGEoD**
- [CW2M] Civil War II manual (Steam-hosted PDF, read in full): https://cdn.cloudflare.steamstatic.com/steam/apps/306630/manuals/AG_ACW2_Materials_Manual.pdf
- [CW2-Store] https://www6.slitherine.com/game/civil-war-ii
- [CW2-Prev] https://armchairgeneral.com/civil-war-ii-pc-game-preview.htm
- [CW2-BRS] https://armchairgeneral.com/?p=10591
- [CW2-HW] https://handwiki.org/wiki/Software:Ageod's_American_Civil_War_II
- [AACW-Store] https://www6.slitherine.com/game/american-civil-war-the-blue-and-the-gray
- [AACW-WP] https://en.wikipedia.org/wiki/AGEOD%27s_American_Civil_War
- [AACW-ACG] https://armchairgeneral.com/?p=3510
- [AGEWiki-Act] https://www.leqg.org/doc/age/www.ageod.net/agewiki/Leader_Activation.html
- [AGEOD-FAQ] http://www.ageod-forum.com/viewtopic.php?t=3466 (snippet only; site refused fetch)
- [MG-Act] https://forums.matrixgames.com/viewtopic.php?p=1422497
- [MG-AI] https://forums.matrixgames.com/viewtopic.php?p=3290758
- [MG-WON] https://forums.matrixgames.com/viewtopic.php?p=4266843
- [WG-Best] https://www.wargamer.com/ultimate-general-civil-war/best-civil-war-games
- grogheads AAR (snippet only): https://grogheads.com/aars/20394

**Grand Tactician**
- [GTM] Grand Tactician manual v1.13 (Steam-hosted PDF, read in full): https://cdn.cloudflare.steamstatic.com/steam/apps/654890/manuals/Grand_Tactician_Manual.pdf
- [GT-Steam] https://store.steampowered.com/app/654890/Grand_Tactician_The_Civil_War_18611865/
- [GT-CV] https://culturedvultures.com/?p=165493

**President lineage and grand strategy**
- [NGG-Grog] https://grognard.com/reviews/ngglory.txt
- [NGG-UH] https://www.math.uh.edu/~barrett/data/all/NoGreaterGlory
- [NGG-Steam] https://store.steampowered.com/app/3014490/No_Greater_Glory_The_American_Civil_War/
- [NGG-GOG] https://www.gog.com/en/game/no_greater_glory_the_american_civil_war
- [Hunter-HotU] https://homeoftheunderdogs.net/game.php?id=3363
- [Hunter-How] https://mail.thurb.com/games/acw/how2play.htm
- [Hunter-Intro] https://thurb.com/games/acw/intro.htm
- [Hunter-Lead] https://thurb.com/games/acw/leaders.htm
- [WBTS-ACG] https://armchairgeneral.com/gary-grigsbys-war-between-the-states-pc-game-review.htm
- [WBTS-MG] https://www.matrixgames.com/news/matrix-games-unveils-gary-grigsby-s-war-between-the-states-29-04-08
- [WBTS-CWB] https://cwbn.blogspot.com/2008/07/grigsbys-leaders.html
- [FoF-Sl] https://www6.slitherine.com/game/forge-of-freedom-the-american-civil-war-1861-1865
- [FoF-MG] https://www.matrixgames.com/news/matrix-games-announces-forge-of-freedom-25-07-06
- [FoF-Rutins] https://forums.matrixgames.com/viewtopic.php?p=1385264
- [FoF-ACG] https://armchairgeneral.com/forge-of-freedom-review.htm/2
- [FoF-Blitz] https://theblitz.club/message_boards/showthread.php?tid=48665
- [SCACW-Steam] https://store.steampowered.com/app/1966130
- [SCACW-WNT] https://www.awargamersneedfulthings.co.uk/2022/08
- [V2-Wiki] https://vic2.paradoxwikis.com/American_Civil_War
- [V2AHD-Destr] https://www.destructoid.com/reviews/review-victoria-ii-a-house-divided/
- [V3-DD41] https://www.paradoxinteractive.com/games/victoria-3/news/dev-diary-41-revolutions
- [VaG-Steam] https://store.steampowered.com/app/1241910/
- [TCW-Steam] https://store.steampowered.com/app/1413650/The_Civil_War/

**Operational and tactical digital**
- [UGCW-WG] https://www.wargamer.com/reviews/review-ultimate-general-civil-war/
- [UGCW-Steam] https://store.steampowered.com/app/502520/Ultimate_General_Civil_War/
- [UGCW-Disc] https://steamcommunity.com/app/502520/discussions/0/208684375409225629
- [UGCW-Fossil] https://cdromfossil.com/2021/08/30/reviewing-ultimate-general-civil-war/
- [SMG-Grog] https://grognard.com/reviews/mgetty.txt
- [SMG-WP] https://en.wikipedia.org/wiki/Sid_Meier%27s_Gettysburg!
- [SMA-WP] https://en.wikipedia.org/wiki/Sid_Meier%27s_Antietam!
- [TC-Blog] https://haries4game.blogspot.com/2006/04/take-command-2nd-manassas-review.html
- [SoW-ACG] https://armchairgeneral.com/?p=6821
- [SoW-BS] https://armchairgeneral.com/scourge-of-war-brandy-station-pc-game-review.htm
- [SoW-Ch] https://armchairgeneral.com/scourge-of-war-chancellorsville-pc-game-review.htm
- [SoW-Rem] https://store.steampowered.com/app/2205330/
- [CWG1-Grog] https://grognard.com/reviews/roblee.txt
- [CWG2-WP] https://en.wikipedia.org/wiki/Civil_War_Generals_2
- [BG93-HotU] https://www.homeoftheunderdogs.net/game.php?id=1372
- [NS-WP] https://en.wikipedia.org/wiki/North_%26_South_(video_game)
- [TT-BBB] https://bigbossbattle.com/?p=34699
- [TT-Vice] https://www.vice.com/en/article/gettysburg-the-tide-turns-shows-how-a-map-makes-the-game
- [BGr-WP] https://en.wikipedia.org/wiki/Battleground_2:_Gettysburg
- [BGr-Grog] https://www.grognard.com/reviews/batgetty.txt
- [HPS-Ov] https://brettschulte.net/CWBlog/2012/12/18/civil-war-game-review-campaign-overland-by-john-tiller-software
- [WDS] https://wargameds.com/pages/about-us-wds
- [HexWar-ACG] https://www.armchairgeneral.com/civil-war-1863-ios-game-review.htm
- [BAB-ACG] https://armchairgeneral.com/brother-against-brother-pc-game-review.htm
- [BP-Steam] https://store.steampowered.com/app/285130/

**Board games**
- [FtP-R] https://www.gmtgames.com/nnfp/FTP-rules-2014.pdf
- [FtP-ACG] http://armchairgeneral.com/grappling-with-the-anacondas-coils-in-gmt-games-for-the-people-board-game-review.htm
- [FtP-Clio] https://insidegmt.com/abraham-lincoln-through-the-lens-of-mark-hermans-for-the-people
- [Herman-WP] https://en.wikipedia.org/wiki/Mark_Herman_(game_designer)
- [AHD-WP] https://en.wikipedia.org/wiki/A_House_Divided_(board_game)
- [AHD-R] https://rulespal.com/a-house-divided/rulebook
- [AHD-L1] https://insidegmt.com/how-leaders-work-in-the-new-a-house-divided-part-1-leaders-in-battles/
- [AHD-L2] https://insidegmt.com/how-leaders-work-in-the-new-a-house-divided-part-2-arrivals-and-departures-of-leaders-and-leader-ratings/
- [VGCW-WP] https://en.wikipedia.org/wiki/The_Civil_War_1861%E2%80%931865
- [VGCW-RP] https://rulespal.com/civil-war-1861-1865/rulebook
- [VGCW-Grog] https://www.grognard.com/originals/uscivilwar_rv1.aspx
- [USCW-R] https://gamers-hq.de/media/pdf/be/48/bb/TUSCWRULESAug2017-LR.pdf
- [USCW-BL] https://theboardgaminglife.com/2016/02/28/the-us-civil-war-a-boardgaminglife-review
- [Lin-BEV] https://www.boardseyeview.net/post/2018/04/22/lincoln
- [Lin-TPS] https://theplayersaid.com/2018/12/06/until-successful-or-till-i-die-or-am-conquered-a-review-of-lincoln-from-worthington-psc-games/
- [BC-WP] https://en.wikipedia.org/wiki/Battle_Cry_(Avalon_Hill_game)
- [GCACW-R] https://mmpgamers.com/support/gcacw/GCACW_Series_Rules_1.6.pdf
- [BL-WP] https://en.wikipedia.org/wiki/Bobby_Lee_(game)
- [BL-Grog] https://grognard.com/reviews/bobbylee.txt
- [SG] https://pawnderings.blogspot.com/2008/05/sam-grant-brief-review.html
- [SPIWBTS-WP] https://en.wikipedia.org/wiki/War_Between_the_States_1861%E2%80%931865
- [SPIWBTS-FM] https://grognard.com/reviews1/wbts.txt
- [LW-R] https://rulespal.com/lincolns-war/rulebook
- [CWB-R] https://mmpgamers.com/support/gamersarchive/cwb/CWB_v32_Rules.pdf
- [AotP] https://rulespal.com/army-of-the-potomac-campaigns-of-1862-and-1864/rulebook
- [RT] https://theplayersaid.com/2026/02/11/grants-most-anticipated-wargames-of-2026/
- [Sec1861] https://theplayersaid.com/2025/06/16/interview-with-robert-phaneuf-designer-of-secession-1861-the-american-civil-war-and-the-armada-from-fortress-games-currently-on-kickstarter/
- BGG ratings via a BGG-sourced mirror (BGG itself blocked fetches): [BGD-833] https://boardgame-directory.vercel.app/games/833 · [BGD-2081] https://boardgame-directory.vercel.app/games/2081 · [BGD-162009] https://boardgame-directory.vercel.app/games/162009 · [BGD-35452] https://boardgame-directory.vercel.app/games/35452
