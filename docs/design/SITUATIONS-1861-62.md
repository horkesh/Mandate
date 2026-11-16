# Situations, 5 March 1861 to 31 December 1862: a content inventory for lane 0.7

Status: design lane output (2026-11-14), a proposal like everything in `docs/design/`. It lists the situations the Union campaign needs over its first 22 months, so that lane 0.7's situations schema is built against real cases and the design's gaps show before any situation is authored. Nothing here is accepted until a decision record accepts it. It does not rule on sensitive-history placement: it names the gate topic and leaves the ruling to the gate-checklist lane (0021, 0026).

**Facts come only from the research notes**, cited by note and section:

| Key | Note |
|---|---|
| [SW] | `docs/research/2026-11-14-secession-winter-1861.md` |
| [MF] | `docs/research/2026-11-14-march-1861-facts.md` ("des." = its Design implications, "out" = its Findings outside my scope) |
| [U62] | `docs/research/2026-11-14-union-1861-62.md` |
| [UP] | `docs/research/2026-11-14-union-politics.md` |
| [UE] | `docs/research/2026-11-14-union-war-economy.md` |
| [UN] | `docs/research/2026-11-14-union-navy.md` |
| [CS] | `docs/research/2026-11-14-confederate-side.md` |
| [CP] | `docs/research/2026-11-14-union-command-and-promotion.md` |
| [IF] | `docs/research/2026-11-14-union-information-flows.md` |
| [FM] | `docs/design/FIRST-MONTH.md` (a design walkthrough, cited for game-side play, never for facts) |
| [GAPS] | `docs/research/2026-11-16-1861-gaps.md` (lane 1.11r: primary sources read in print for S04, S05, S08, S13, S16, S19, S21; its corrections to the notes above are marked where made) |

Anything those notes do not source is marked **needs-source**. Where a note itself flags a fact (verify, snippet, conflict), the flag travels with it. **[game]** marks what a seat or the kernel would compute; **[I]** marks this lane's reading.

## How to read an entry

- **Window**: when the cause becomes present and how the situation ends. Causes are stated as conditions, not dates (0023); the historical date is the calibration point.
- **Live**: whether the situation stays open while its clock runs (0040), which options expire (`expiresWhen`) or appear, and what resurfaces it (`resurfaceOn`).
- **Staff recommendation**: the named post whose holder authors the advice report (0040), and what that holder recommended where the notes record it.
- **Options**: worded in the advisers' own terms, with the adviser named where the notes give one (0041). **Order rule: options are sorted alphabetically by their id**, which no author chooses and which is unrelated to the historical default. Proposed as a validator check for lane 0.7. Each option lists the orders or notices it issues and through whom.
- **Inaction**: the pack-authored outcome of ignoring it (0040).
- **Historical default (hidden: history runs and rule seats only)**: never shown to the player (0040).
- **Pushback**: who can object, delay, slow-walk, reinterpret or leak, which is the reason the situation earns its place.
- **Verbs**, **Reports**, **Systems**: tags for the coverage tables in section 2. Verbs are FOUNDATION section 5's, plus `delegate` (0025, 0040). Reports are 0032's types plus 0040's advice and memorandum.
- **Gate**: the sensitive-history topic, if any, for the gate-checklist lane. "Placement pending" means the options shown are a proposal that the gate may cut, change or refuse.

**Where this catalogue changes `FIRST-MONTH.md`**: Pickens fires on 5 March, not 4 March, because the inaugural is the premise and situations start the next day (0042), and Lincoln gave Scott his verbal Pickens order on 5 March [MF des. 8]. Fox's report lands about 25 March [MF 4]; the Pickens order took 19 days out and 5 back [MF 3]; the landing was the night of 12 April [MF des. 6]; Anderson's mail took 2–3 days and was read by the enemy from 29 March [MF 2]; Lamon was not yet marshal [MF 6]; the commissioners reached Lincoln through Seward, not the press, by 15 March at the latest [MF 1, des. 14]; the evacuation leaks drew a real backlash [MF 12]; the Senate sat 4–28 March [MF 10]. Two situations the walkthrough lacked are added: the evacuation rumour (S04) and Lamon's promise (S05).

## 1. The catalogue

Sixty situations: 30 in 1861 (S01–S30) and 30 in 1862 (S31–S60), in order of their first cause.

### S01 `sumter-garrison`: Fort Sumter's garrison

- **Window**: fires 5 March 1861, when Anderson's letters of 28 February and 2 March have arrived (4 March) and his provisions run under six weeks with no relief possible by force [SW 1, 2.1; MF des. 11]. Ends when the garrison is withdrawn, relieved or surrenders, or when the Confederate seat opens the war (0040's labelled railroad).
- **Live**: yes, five weeks. The clock is the garrison's stores on hand, shown only as the staff's range from disagreeing reports (Anderson's 4–6 weeks from 28 February; Scott's 26–48 days from 12 March) [SW 2.1]. `force` expires when no fleet could be gathered before the stores run out (Scott: four months for a fleet [SW 2.1]). `give-up-both` appears if Scott's 28 March memorandum arrives [SW 2.1]. Resurfaces when the stores range crosses the pack threshold (Anderson, 1 April: rations for "about a week longer" [SW 2.1]) and when Anderson's mail is inspected (29 March) and cut (8 April) [MF 2].
- **Staff recommendation**: general-in-chief (Scott): withdraw [SW 2.1]. He does not move when the cabinet does (29 March), so the card and the Consult answers come to disagree [FM stop 7].
- **Options**:
  - `force` "Reinforce by force" (no adviser after Scott's 12 March letter [SW 2.1]). Goal to the general-in-chief; the planner returns a request (25,000 men, six months or more [SW 2.1]), not a plan [FM divergence 3].
  - `give-up-both` (appears 28 March) "Give up both forts" (Scott [SW 2.1]). Orders to Anderson and Slemmer through the Secretary of War.
  - `provision-notice` "Send an armed force with provisions and a peaceful notice" (Welles's 29 March position; Blair, Chase [SW 2.1]). Goal to the Secretary of the Navy with timing "prepare, await my word" (0040); appoint a temporary expedition command, open to a man without a post (Fox [SW 4.2]); a notice to Governor Pickens by messenger when the ships sail.
  - `withdraw` "Retire the garrison forthwith" (Seward's 29 March words; Scott, Smith, Bates, Cameron on 15 March [SW 2.1]). Order to Anderson through the Secretary of War.
- **Inaction**: the stores run out and Anderson asks terms (his own limit was noon on 15 April [SW design, premise 1]); the press calls the government drifting ("shilly shally", 31 March [MF 12]).
- **Historical default (hidden: history runs and rule seats only)**: `provision-notice`, decided 29 March–4 April; the notice left on 6 April and was delivered 8 April; ships sailed 8–10 April from three ports [SW 1, 2.1; MF 7, des. 17].
- **Pushback**: Scott objects and his advice reads as political [SW 2.1]; Seward dissents and keeps his channel open (S03); the cabinet's stances move between 15 and 29 March [SW 2.1]; Fox brings a plan nobody ordered [MF 5]; Lincoln suspected Anderson of Southern sympathies [MF out 2]; the Confederate seat reads Anderson's mail from 29 March [MF 2]; Lincoln decided 4–6 April with only Welles, Fox and Blair, against the cabinet as a body [MF des. 20].
- **Verbs**: consult, inquire, observer, audience, goal, appoint, go, delegate
- **Reports**: strength-return, advice, memorandum, observer-letter, press, informal
- **Systems**: forces, navy, politics, press, people
- **Gate**: none
- **Sources**: [SW 1, 2.1, 2.2, design S1]; [MF 2, 4, 5, 7, 11, des. 1, 11, 17, 20, out 2]; [FM stops 2–11]

### S02 `pickens-reinforcement`: Fort Pickens

- **Window**: fires 5 March 1861; its cause is present at the start (the truce of 28 January, Slemmer's garrison, Captain Adams's ships offshore) [SW 2.3]. Ends when troops land, the fort is given up, or the war opens.
- **Live**: yes. `give-up-both` appears if Scott's 28 March memorandum arrives [SW 2.1]. An order that comes back refused spawns S06.
- **Staff recommendation**: general-in-chief (Scott). The notes do not record his March advice on Pickens before 28 March, when he advised giving up both forts [SW 2.1]; he ignored a verbal order (5 March) and a written directive (9 March) for a week [MF des. 8], so [game] his seat recommends keeping the truce. Seward, Bates and Chase favoured reinforcing [SW design S2, 2.1].
- **Options**:
  - `give-up-both` (appears 28 March) "Give up Pickens with Sumter" (Scott [SW 2.1]). Order to Slemmer through the War Department.
  - `keep-truce` "Keep the January truce and the ships offshore" (the agreement Adams held binding [SW 2.3]). No order; the truce stays a standing agreement on the squadron's post (0040).
  - `land-company` "Land Vodges's company from the ships" (Bates: reinforce Pickens "at all hazards" [SW 2.1]). Goal to the general-in-chief (objective Fort Pickens, posture hold, permission sea, a detachment below the force block), relayed general-in-chief → Navy Department → squadron → Adams (0040's relay).
- **Inaction**: the truce holds and the fort stays a pocket supplied by sea [game].
- **Historical default (hidden: history runs and rule seats only)**: `land-company`, ordered verbally 5 March, in writing 11–12 March, and again 1 April; troops landed the night of 12 April [SW 2.3; MF 3, des. 6, 8].
- **Pushback**: Scott slow-walks and the president learns it a week late [MF des. 8]; the *Crusader* sailed only on 15 March after Army delays [MF 3]; Adams refuses because the order breaks the truce and because an Army officer's order cannot supersede his Navy orders [MF out 8]; Lincoln wrongly inferred the troops had landed from the *Brooklyn*'s move to Key West, a report wrong in a way he could not detect [MF des. 7].
- **Verbs**: goal, inquire, audience
- **Reports**: advice, informal, wire
- **Systems**: forces, navy, people
- **Gate**: none
- **Sources**: [SW 2.1, 2.3, design S2]; [MF 3, des. 5–8, out 8]; [FM stops 1, 8]

### S03 `confederate-commissioners`: the Confederate commissioners

- **Window**: fires when the president learns that Forsyth and Crawford are in Washington. They kept out of sight and worked through ex-senators and Seward, so the cause reaches him through Seward, 9–13 March [I], and by 15 March at the latest [MF 1, des. 14]. Ends when they are received, answered, or leave (11 April [MF 17]).
- **Live**: yes, five weeks. The clock is the commissioners' patience and the Campbell channel. Resurfaces when a delegate's undeclared conduct leaks back (S05; the "faith" note).
- **Staff recommendation**: Secretary of State (Seward): refuse recognition in a memorandum whose delivery is held back by consent, and talk informally through Justice Campbell [SW 2.4; MF des. 14]. His recommendation is his own course, which is the bias the card should carry.
- **Options**:
  - `hold-and-talk` "File a refusal, hold its delivery, and keep an unofficial channel through Justice Campbell" (Seward [SW 2.4]). Delegates the channel to the Secretary of State.
  - `receive` "Receive them" (no adviser found: needs-source). A recognition signal that the foreign-pressure clocks read [FM divergence 4].
  - `refuse-now` "Refuse in writing at once" (the secession-winter note's staff line, marked [I] there [SW design S3]). A written notice through the Secretary of State.
- **Inaction**: no answer; they keep working through Seward's circle [MF 1].
- **Historical default (hidden: history runs and rule seats only)**: `hold-and-talk`: the memorandum dated 15 March was delivered 8 April; Seward's assurances went through Campbell on 15 March, about 20 March, 1 April and about 7 April ("Faith as to Sumter fully kept; wait and see") [SW 2.4; MF 17].
- **Pushback**: a delegated Seward reports the memorandum (declared) and not the assurances (actual) [FM stop 2]; Campbell read an evacuation pledge where Seward meant a pledge of notice [SW 2.4]; the president learns of the "faith" note only after the first shot, through Campbell's letter of 13 April [MF 17, des. 18].
- **Verbs**: delegate, consult
- **Reports**: informal, memorandum
- **Systems**: diplomacy, politics, people
- **Gate**: none
- **Sources**: [SW 2.4, design S3]; [MF 1, 17, des. 14, 18]; [FM stops 2, 11]

### S04 `evacuation-rumour`: the evacuation story in the papers

- **Window**: fires when the press prints that Sumter will be given up (10–13 March 1861: the *World* of 12 March, *Tribune* Washington letters of 11–12 March, the Charleston *Mercury* of 12 March) [MF 12]. Ends when the front page moves on [game].
- **Live**: yes, about a week. The Republican senators' caucus of 13 March (Wade) [MF 10] and Blair's near-resignation [MF 12] arrive as pressure while it is open.
- **Staff recommendation**: Secretary of State (Seward), whom Burlingame names as the probable source of the leaks [MF 12]: [game] say nothing. A biased author by construction.
- **Options**:
  - `deny` "Have a friendly paper deny it". A leak by the president through a friendly paper (FOUNDATION section 7).
  - `find-source` "Ask the cabinet who gave it out". Inquire to each secretary; repeated inquiries cost patience (0040).
  - `say-nothing` "Let the story run".
- **Inaction**: the backlash runs: letters to Trumbull, the caucus, Blair's grievance; the Republican bloc's support falls [MF 12].
- **Historical default (hidden: history runs and rule seats only)**: needs-source. The notes record the backlash, not Lincoln's response.
- **Pushback**: the leaker is a cabinet seat acting on its initiative (0040); Blair threatens to resign [MF 12].
- **Verbs**: inquire, address
- **Reports**: press, informal
- **Systems**: press, politics, people
- **Gate**: none
- **Sources**: [MF 10, 12, des. 15]; [GAPS S04]: *New York Times*, 12–15 March 1861 (the rumour wave, including the Baltimore American dispatch "Mr. Seward has triumphed", 13 March); Nicolay and Hay, *Abraham Lincoln: A History*, vol. 3 pp. 385–388 (the cabinet's written opinions of 15–16 March). No adviser is on record for `deny`, `find-source` or `say-nothing`, and Blair's resignation and Wade's caucus have no public-domain primary (Crawford 1887 is a memoir): those options stay [game].

### S05 `lamon-promise`: Lamon's promise in Charleston

- **Window**: fires only if the player sent an agent to Charleston who exceeded his errand. Historically Lamon told Governor Pickens the garrison would soon be withdrawn (25 March; Beauregard to Walker, 26 March, "Mr. Lamon left here last night, saying that Major Anderson and command would soon be withdrawn from Fort Sumter in a satisfactory manner", OR I-1 p. 282; Anderson's reports show he believed it, OR I-1 pp. 230, 231, 294) [GAPS S05]. Pickens's telegram inquiring about Lamon reached the commissioners on **30 March**, not 29 (Campbell's letter of 13 April 1861, OR I-53 pp. 162–163; the earlier date came from a secondary account) [GAPS S05; MF 6, des. 4]. The president learns it only by this informal route, since Lamon wrote to Seward, not to Lincoln [MF des. 3].
- **Live**: no; one stop.
- **Staff recommendation**: Secretary of State (Seward): disavow [MF 6].
- **Options**:
  - `disavow` "Say he went under no commission or authority" (Seward to Campbell, 31 March [MF 6]). **Retrospective**: those words rest on Campbell's later memorandum, read only through Burlingame. The 1861 record shows Seward's note of 1 April, "I am satisfied the Government will not undertake to supply Fort Sumter without giving notice to Governor Pickens" (OR I-53 p. 163), which does not mention Lamon [GAPS S05]. A notice through the Secretary of State's channel.
  - `let-stand` "Let it stand as a sign of intent". Raises the South's expectation of evacuation [game].
  - `say-nothing` "Say nothing".
- **Inaction**: the promise stays on Charleston's record and costs the president credit there [MF des. 4].
- **Historical default (hidden: history runs and rule seats only)**: `disavow` (31 March); Lincoln later denied Lamon had authority [MF 6]. **Retrospective only**: the sourced 1861 fact is a Seward reply to Campbell on 1 April about Pickens's telegram; whether it disavowed Lamon is sourced only to Campbell's memoir, and no primary shows Lincoln denying it [GAPS S05].
- **Pushback**: an agent without a post who goes past his errand (0040's agents without posts) [MF 6].
- **Verbs**: observer, delegate
- **Reports**: informal, observer-letter
- **Systems**: diplomacy, people
- **Gate**: none
- **Sources**: [MF 6, des. 3, 4]; [GAPS S05]: OR I-1 pp. 218, 221, 222, 281–283, 294; OR I-53 pp. 162–163

### S06 `pickens-refused`: the Pickens order is not carried out (follows S02)

- **Window**: fires when Adams's refusal reaches the president. Historically he refused on 31 March, his courier came back overland in 5 days, and Lincoln learned on 6 April [SW 2.3; MF 3]; in the walkthrough's game it arrived 30 March [FM stop 8]. Ends when troops land or the war opens.
- **Live**: yes. `special-expedition` expires once the *Powhatan* is committed to the Sumter fleet and has sailed [game].
- **Staff recommendation**: Secretary of the Navy (Welles): [game] a department order through the chain; the notes describe him as a believer in procedure [UN 1].
- **Options**:
  - `courier-order` "A Navy Department order to land the company, carried overland by special messenger" (Worden's route: about 4 days [MF des. 5]). A route with a price (0040).
  - `department-order` "A Navy Department order to land the company, by the usual ship" (about 16 days at sea plus handling [MF des. 5]).
  - `let-stand` "Accept the captain's reading of the truce for now".
  - `special-expedition` "Sign a special expedition, drawn by Meigs and Porter, outside the War and Navy departments" [SW 1, 2.3; UN 1]. Appoints a temporary post; goes around the chain (a grievance for Welles and Cameron, and a risk of conflicting orders over the *Powhatan*); paid from the State Department's secret-service fund because Congress had made no appropriation [MF out 7].
- **Inaction**: no landing; the truce stands [game].
- **Historical default (hidden: history runs and rule seats only)**: `special-expedition` (orders signed 1 April; the *Atlantic* sailed 6 or 7 April) and, on learning of the refusal, a Navy order carried overland by Worden, delivered 12 April [SW 2.3; MF 7, des. 5, 6]. History took two options at once (see section 3).
- **Pushback**: Welles learns of the expedition only after dark on 5 April [UN 1]; Porter, holding a Lincoln-signed order, will not turn back when Seward's telegram arrives 15 minutes after the ship sails [SW 2.3]; Seward signs that telegram in his own name [MF out 1].
- **Verbs**: appoint, goal
- **Reports**: informal, wire
- **Systems**: navy, forces, people
- **Gate**: none
- **Sources**: [SW 2.3]; [MF 3, 7, des. 5, 6, out 1, 7, 8]; [UN 1]; [FM stop 8, divergence 1]

### S07 `seward-memorandum`: "Some Thoughts for the President's Consideration"

- **Window**: fires when the Secretary of State's seat takes the initiative "bid for authority" (0040). Historically 1 April 1861: no domestic policy beyond abandoning Sumter, explanations demanded of Spain and France, and the hint that he should direct policy [SW 2.4].
- **Live**: no.
- **Staff recommendation**: open. The natural author (the Secretary of State) is the subject of the paper (see section 3, P5).
- **Options**:
  - `accept-direction` "Let the Secretary direct policy".
  - `answer-in-person` "Answer that the policy is the president's to carry out" (Lincoln's draft reply: he must hold the property [SW 2.4]). An audience.
  - `file-unanswered` "Put it away unanswered".
- **Inaction**: `file-unanswered`; Seward stays on his rung and may bid again [game].
- **Historical default (hidden: history runs and rule seats only)**: `answer-in-person` as a draft reply [SW 2.4]; whether it was sent or spoken: needs-source.
- **Pushback**: the ladder's rival bid itself [FM stop 9].
- **Verbs**: audience
- **Reports**: memorandum
- **Systems**: people, politics, diplomacy
- **Gate**: none
- **Sources**: [SW 2.4]; [MF out 1]; [FM stop 9]

### S08 `virginia-unionists`: a Unionist from the Virginia convention

- **Window**: fires when a channel to the convention's Unionists opens. Historically Seward sent Summers a note (undated; the 1 April telegram is Burlingame's, not in any public-domain source read), Magruder was asked on 2 April to carry the summons to Richmond, and Baldwin met Lincoln on 4 April, about 11 o'clock by his own sworn account (JCR Part II p. 103) [GAPS S08; MF 13]. Expires when the convention votes or adjourns. The vote of 4 April was 45 yeas to 89 nays on Harvie's substitute (a vote to put an ordinance of secession to the people), taken in Committee of the Whole, and not a final secession vote (Virginia Convention Journal p. 31; *New York Times*, 5 April 1861). The "90–45" form appears only in Botts's report of Lincoln's words (Joint Committee on Reconstruction, Part II, p. 114) [GAPS S08; MF 13].
- **Live**: yes, four days.
- **Staff recommendation**: Secretary of State (Seward), who opened the channel [MF 13]: meet.
- **Options**:
  - `hear-only` "Hear him out and promise nothing" (Baldwin's 1866 account [MF 13]; sworn, Joint Committee on Reconstruction Part II pp. 102–105: "No pledge; no undertaking; no offer; no promise of any sort"; the letters of Magruder, Summers, Janney, Stuart and Price of 1866 say Baldwin reported no offer on his return) [GAPS S08]. Retrospective-official, not contemporary. An audience.
  - `no-meeting` "Do not meet". No adviser is on record: nobody urged Lincoln not to meet; Summers pleaded the Convention's business [GAPS S08].
  - `offer-fort` "Offer to withdraw from Sumter if the convention adjourns *sine die*" (Hay's and Smith's versions via Burlingame, not read; Lincoln's words only as Botts and Lewis report them [MF 13]). Sworn: Botts, JCR Part II pp. 114–116, who reports Lincoln's words; J. F. Lewis, JCR p. 71, who says Botts told him of it on 16 April 1861. The one document of the time is Fox's own memorandum of April 1861 (*Confidential Correspondence of G. V. Fox*, vol. 1, p. 38): "The last card was to send for a Union man from the Virginia Convention and say to him that Sumpter would be evacuated at once if the Union people ... would adjourn it" (hearsay as to content) [GAPS S08]. A promise.
- **Inaction**: no meeting; the vote proceeds [MF 13].
- **Historical default (hidden: history runs and rule seats only)**: a meeting on 4 April; whether the offer was made is disputed, and Burlingame concludes it probably was [MF 13]. The offer's terms should be a hidden fact the player cannot verify [MF des. 16].
- **Pushback**: Summers sent a substitute [MF 13]; the public-domain sources give his reason as the Convention's business (Baldwin pamphlet p. 24; Magruder, *Atlantic Monthly*, April 1875, p. 440), and "suspected a plot" rests on Burlingame alone [GAPS S08].
- **Verbs**: audience, promise
- **Reports**: informal
- **Systems**: politics, people
- **Gate**: none
- **Sources**: [MF 13, des. 16]; [SW 3.6]; [GAPS S08]: Virginia Convention Journal p. 31; JCR Part II pp. 71, 102–105, 114–116; Baldwin pamphlet (1866) pp. 22–28; Fox correspondence vol. 1 p. 38

### S09 `call-for-troops`: the call for troops

- **Window**: fires when the war opens (Sumter's fall, 13 April 1861, or 0040's fallback trigger). Historically 15 April [SW 1, 2.5].
- **Live**: yes, until a call is issued. Which options are legal depends on the chambers: the House is not sitting and the Senate has adjourned (28 March) [MF 10; UP 1.5]. The militia law caps a call at 75,000 men for three months [SW 2.5, 4.3]; anything larger is issued now and answered for when Congress meets (an accountability check, 0040).
- **Staff recommendation**: Secretary of War (Cameron). No cabinet debate on the size or form of the call was found [SW 2.5]: needs-source; [game] seat-derived.
- **Options**:
  - `exempt-border` "Leave the border states out of the quotas" [SW design S5].
  - `larger-longer` "Call three-year volunteers as well, beyond the militia law, and answer to Congress later" (the 3 May call [SW 2.5]).
  - `militia-call` "Call 75,000 militia for three months under the 1795 law, and convene Congress".
  - `summon-congress-now` "Convene Congress at once" [SW design S5].
  Each issues requisitions to every governor through the Secretary of War; each governor's seat answers.
- **Inaction**: no federal call; governors act on their own (Ohio offered about 30,000 [SW 4.3]) [game].
- **Historical default (hidden: history runs and rule seats only)**: `militia-call` with Congress for 4 July (15 April), then the 3 May call for 42,034 three-year volunteers, 22,714 regulars and 18,000 seamen [SW 2.5].
- **Pushback**: governors Magoffin, Jackson ("Not one man"), Ellis, Harris, Letcher and Rector refuse [SW 1, 4.3]; the shape of the call, not Sumter alone, flipped Virginia between 4 and 17 April [SW 3.6, premise 3]; quota totals in the sources disagree (93 regiments, 72,540 men, against 73,910) [SW 4.3].
- **Verbs**: address, pressure
- **Reports**: informal, advice
- **Systems**: economy, politics, forces, people
- **Gate**: none
- **Sources**: [SW 1, 2.5, 3.6, 4.3, premise 3, design S5]; [UP 1.5]; [UE 2.1]

### S10 `blockade-or-closure`: a blockade or closed ports

- **Window**: fires when the war opens. Historically the blockade was proclaimed on 19 April 1861 and extended on 27 April [SW 2.5].
- **Live**: yes, until proclaimed. Britain's recognition of Confederate belligerency (13 May) changes the diplomatic terms of every option [SW 2.5; UN 5].
- **Staff recommendation**: Secretary of State (Seward): a proclaimed blockade (Lincoln sided with Seward) [UN 1]. The sources conflict on Welles's and Bates's positions [SW 2.5; UN 1].
- **Options**:
  - `blockade` "Proclaim a blockade" (Seward [UN 1]). Directive to the Navy Department; the blockade clock starts; squadrons form by directive [UN des. 1].
  - `close-ports` "Close the ports" (Bates, per one source, because a blockade implies belligerent status [SW 2.5]).
  - `undeclared-blockade` "Blockade in fact, without a proclamation" (Welles, per the State Department historian [UN 1]).
- **Inaction**: no blockade; Confederate trade runs [game].
- **Historical default (hidden: history runs and rule seats only)**: `blockade` [SW 2.5].
- **Pushback**: Welles argued against Seward [UN 1]; only three ships were fit for blockade duty [UN 1].
- **Verbs**: consult
- **Reports**: advice
- **Systems**: navy, diplomacy, economy
- **Gate**: none
- **Sources**: [SW 2.5]; [UN 1, 5, des. 1, 2]

### S11 `gosport-yard`: the Norfolk navy yard

- **Window**: fires when Virginia's secession threatens the Gosport yard (16–20 April 1861) [SW 4.4].
- **Live**: yes; expires when Virginia's forces take the yard.
- **Staff recommendation**: Secretary of the Navy (Welles): defend it (his 16 April order) [SW 4.4].
- **Options**:
  - `defend` "Hold the yard" (Welles [SW 4.4]). Order to the commandant through the department.
  - `destroy-rest` "Burn what cannot be moved".
  - `remove` "Move the ships and guns out".
- **Inaction**: the commandant decides by his own values [game].
- **Historical default (hidden: history runs and rule seats only)**: `defend` (16 April); the commandant, McCauley, had the yard destroyed on 20 April against that order; *Cumberland*, *Yankee* and *Pawnee* escaped; the Confederates took over 1,000 guns and the *Merrimack* [SW 4.4; UN 3]. The default and the outcome differ because the holder disobeyed.
- **Pushback**: the commandant's own reading of the order [SW 4.4].
- **Verbs**: goal
- **Reports**: wire, informal
- **Systems**: navy, forces
- **Gate**: none
- **Sources**: [SW 3.6, 4.4]; [UN 3, des. 1]

### S12 `washington-cut-off`: Washington cut off

- **Window**: fires when the route north through Baltimore closes (the Pratt Street riot and bridge burnings, 19 April 1861). Ends when a route reopens (7th New York by Annapolis, 25 April) [SW 1, 3.2].
- **Live**: yes. `meet-governor` expires when the legislature meets at Frederick [SW 1]; `suspend-on-line` appears while the line is threatened [game].
- **Staff recommendation**: general-in-chief (Scott): needs-source; [game] seat-derived.
- **Options**:
  - `around-baltimore` "Bring troops around Baltimore by Annapolis" (Lincoln to Hicks and Brown, 20 April [SW 1]). Goal to the general-in-chief.
  - `force-through` "March through Baltimore".
  - `meet-governor` "Meet the governor's request that no more troops cross Maryland" [SW 1].
  - `suspend-on-line` "Authorise the general-in-chief to suspend habeas corpus on the Philadelphia–Washington line" [SW 1, 6.6].
- **Inaction**: the capital stays isolated until regiments find a route [game]; the telegraph is cut [SW mechanics].
- **Historical default (hidden: history runs and rule seats only)**: `around-baltimore` (20 April), then `suspend-on-line` (27 April); Butler occupied Baltimore on 13 May [SW 1, 2.5].
- **Pushback**: Hicks, Brown and Kane planned the bridge burning and each blamed another [SW 3.2].
- **Verbs**: goal
- **Reports**: informal, wire
- **Systems**: forces, politics, people
- **Gate**: civil liberties (habeas suspension); civilians (the Pratt Street dead, narrated with ranges in [SW 6.8]; per 0074 the deaths are their own notice under `civilian-deaths-1861`, and S12 carries no atrocity tag)
- **Sources**: [SW 1, 2.5, 3.2, 6.6, 6.7, 6.8, design S7, mechanics]

### S13 `black-volunteer-offers`: offers of service from Black Northerners

- **Window**: fires when offers arrive: a Boston mass meeting, two regiments organised in Philadelphia, a Providence company, Jacob Dodson's offer of 300 free Black men (letter of about 23 April 1861) [SW 6.4].
- **Live**: recurs as offers arrive [game]; `ask-congress` appears when Congress sits (4 July).
- **Staff recommendation**: Secretary of War (Cameron): decline. His reply of 29 April 1861: "this Department has no intention at present to call into the service of the Government any colored soldiers" (OR III-1 p. 133; Dodson's letter of 23 April, "some 300 reliable colored free citizens of this city", p. 107). No statute is cited: it was policy [GAPS S13; SW 6.4].
- **Options** (placement pending; [SW 6.8] proposes "modelled with locked consequences" with no player "recruit" before the 1862 law):
  - `ask-congress` (appears 4 July) "Ask Congress for authority". **No 1861 adviser on record**: 22 issues of the Congressional Globe for 8 July–7 August 1861 contain no bill, amendment or resolution on Black volunteers and no speaker asking for authority (six issues are not on archive.org; Lovejoy, 23 July, p. 231, and Browning, 25 July, p. 264, say only that Black men might be armed); a game option, flagged "no adviser's own words" [GAPS S13].
  - `decline` "Decline under the militia law" (the 1792 act's "free able-bodied white male", though the exclusion rested more on policy than statute [SW 6.4]).
  - `refer-governors` "Leave it to the governors" (Ohio's governor and the Massachusetts legislature refused [SW 6.4]).
- **Inaction**: the offers go unanswered; the record keeps the men's offer [game].
- **Historical default (hidden: history runs and rule seats only)**: `decline` [SW design S13]. Nothing shows a Lincoln decision on the 1861 offers [SW 6.4].
- **Pushback**: Lincoln's worry that enlistment would push Kentucky and Missouri out [SW 6.4]. **Not sourced as written**: his one primary on the border states, the letter to Browning of 22 September 1861 ("to lose Kentucky is nearly the same as to lose the whole game", Nicolay and Hay, *Complete Works*, vol. 2 p. 81), concerns Frémont's emancipation proclamation, not enlistment; no 1861 letter of his ties Black enlistment to the border states [GAPS S13].
- **Verbs**: delegate
- **Reports**: informal, press
- **Systems**: politics, people, economy
- **Gate**: Black soldiers
- **Sources**: [SW 6.4, 6.8, design S13]; [GAPS S13]: OR III-1 pp. 77–78, 107, 133, 348, 523–524; Congressional Globe, 37th Cong., 1st sess.; Statutes at Large vol. 1 p. 271

### S14 `missouri-arsenal`: Missouri, the arsenal and the department commander

- **Window**: fires when the St. Louis arsenal is at risk (Lyon moved its arms out on 25–26 April 1861). Stages: Lincoln approved enrolling St. Louis loyalists (30 April); Camp Jackson (10 May); the Price–Harney agreement (21 May); Harney removed (30 May) [SW 1, 2.5, 3.5].
- **Live**: yes, five weeks. `repudiate-agreement` appears after Price–Harney.
- **Staff recommendation**: Secretary of War (Cameron): needs-source; [game] seat-derived.
- **Options**:
  - `back-harney` "Back the department commander's truce with the State Guard".
  - `back-lyon` "Back Lyon and arm the St. Louis loyalists" (Frank Blair Jr.'s side [SW 3.5]).
  - `repudiate-agreement` (appears 21 May) "Replace the department commander and set the agreement aside".
- **Inaction**: the department commander's course stands [game].
- **Historical default (hidden: history runs and rule seats only)**: `back-lyon` (enrolment approved 30 April), then `repudiate-agreement` (Harney removed 30 May) [SW 2.5, 3.5].
- **Pushback**: the Camp Jackson riot pushed conditional Unionists such as Price toward the State Guard [SW 3.5].
- **Verbs**: relieve, appoint
- **Reports**: informal, press
- **Systems**: forces, politics, people
- **Gate**: civilians (Camp Jackson: at least 28 civilians killed [SW 6.7]; per 0074 the deaths are their own notice under `civilian-deaths-1861`, and S14 carries no atrocity tag)
- **Sources**: [SW 1, 2.5, 3.5, 6.7, design S10]

### S15 `western-virginia`: western Virginia

- **Window**: fires when the Wheeling conventions meet (13–15 May; 11–25 June 1861) and Virginia's referendum is held (23 May) [SW 3.6].
- **Live**: yes. `recognise` appears after the reorganisation ordinance (19 June) [SW 3.6].
- **Staff recommendation**: Attorney General (Bates), on the legal question: needs-source; [game] seat-derived.
- **Options**:
  - `cross-river` "Order the Department of the Ohio across the river" (goal to McClellan) [SW 3.6].
  - `recognise` (appears 19 June) "Recognise the Wheeling government as Virginia's".
  - `wait` "Wait".
- **Inaction**: the western counties organise alone [game].
- **Historical default (hidden: history runs and rule seats only)**: `cross-river` (26 May) and `recognise` (Lincoln and Congress recognised the Restored Government) [SW 3.6].
- **Pushback**: McClellan's 26 May proclamation is his own wording (no interference with slavery; "crush any attempt at insurrection") [SW 3.6, 6.3].
- **Verbs**: goal
- **Reports**: informal
- **Systems**: forces, politics
- **Gate**: slavery and emancipation (McClellan's proclamation; [SW 6.8] proposes insurrection fears as narrated only)
- **Sources**: [SW 3.6, 6.3, 6.8, design S11, border states]

### S16 `kentucky-neutrality`: Kentucky's neutrality (a chain in two stages)

- **Window**: stage A fires on the neutrality resolution and proclamation (16 and 20 May 1861); stage B on Governor Magoffin's protest at Camp Dick Robinson (19 August) [SW 1, 3.4]. **Corrections** [GAPS S16]: only the Kentucky House adopted the 16 May resolutions (69–26, with 89–4 approving Magoffin's refusal of troops; Kentucky House Journal pp. 91–94), the Senate only received the text; Magoffin's proclamation is 20 May (*Rebellion Record* vol. 1 Doc. 181); Anderson's Department of Kentucky was created on 28 May (G.O. 27, OR I-52/1 p. 147). Ends when either side breaks neutrality (Polk at Columbus, 3–4 September [SW 1; U62 1]).
- **Live**: yes, across both stages; Kentucky's June and August elections move loyalty while it is open [SW 3.4].
- **Staff recommendation**: needs-source for any secretary's position; [game] seat-derived. Joshua Speed is Lincoln's private channel [SW 3.4].
- **Options, stage A**:
  - `arm-quietly` "Respect neutrality and ship arms quietly to the Unionists" (the "Lincoln guns", through Speed [SW 3.4]). Advisers on record: Garrett Davis to Cameron, 3 May (OR I-52/1 pp. 137–138); Lincoln's 7 May commission to Anderson (pp. 140–141); Ripley, 17,000 stands ordered since 4 May (p. 188) [GAPS S16].
  - `move-in` "Send troops in". On record: Governors Dennison, Yates and Morton, memorial of 24 May: "the United States should at an early day take possession of prominent points in Kentucky, such as Louisville, Covington, Newport, Columbus" (OR I-52/1 pp. 146–147); Morton again 29 Aug and 2 Sept (OR I-4 pp. 255–256) [GAPS S16].
  - `wait` "Leave Kentucky alone". On record: Scott, 29 May ("thrusting protection upon their people is likely to do far more harm than good", OR I-52/1 p. 147); McClellan, 4 June (p. 156); Lincoln's 10 July memorandum to Buckner (Nicolay and Hay, *Complete Works*, vol. 2 p. 66) [GAPS S16].
- **Options, stage B**:
  - `close-camp` "Close the camp as the governor asks".
  - `keep-camp` "Decline to remove it" (Lincoln's reply of **24 August**: "I do not believe it is the popular wish of Kentucky that this force shall be removed beyond her limits; and, with this impression, I must respectfully decline to so remove it", Nicolay and Hay, *Complete Works*, vol. 2 pp. 76–77; *Rebellion Record* vol. 3 Doc. 13) [GAPS S16; SW 3.4]. `close-camp` has one adviser on record, Magoffin's letter of 19 August.
- **Inaction**: the neutral block holds until a side moves [game].
- **Historical default (hidden: history runs and rule seats only)**: A `arm-quietly`; B `keep-camp`; the Confederates broke neutrality first [SW 2.5, 3.4].
- **Pushback**: Magoffin let recruits slip south [SW 3.4]; the Military Board took arming power from him [SW 3.4]; Lincoln: "to lose Kentucky is nearly the same as to lose the whole game" [SW 3.4].
- **Verbs**: promise, observer
- **Reports**: informal
- **Systems**: politics, forces, people
- **Gate**: none
- **Sources**: [SW 1, 2.5, 3.4, design S9]; [U62 1]; [GAPS S16]: OR I-52/1 pp. 137–188; OR I-4 pp. 179–187, 251–258; Kentucky House Journal May 1861; *Rebellion Record* vols. 1, 3; Nicolay and Hay, *Complete Works*, vol. 2

### S17 `fort-monroe-arrivals`: people escaping to Fort Monroe

- **Window**: fires when Baker, Townsend and Mallory reach Fort Monroe (23–24 May 1861) and Butler asks Scott what to do (27 May) [SW 6.3].
- **Live**: recurs as arrivals grow (about 900 by 30 July) [SW 6.3] [game].
- **Staff recommendation**: Secretary of War (Cameron): approve holding them, status reserved (his 30 May letter) [SW 6.3].
- **Options** (placement pending; [SW 6.8] proposes "modelled with locked consequences": arrivals are the people's choice, the player's lever is only the policy reply):
  - `approve-holding` "Approve the general's course: do not surrender them, employ them and keep account, final status reserved" (Cameron [SW 6.3]).
  - `no-instruction` "Give no instruction".
  - `return` "Order them returned under the 1850 law" (whether this option exists is the gate's call; [SW 6.8] lists generals returning fugitives as modelled with locked consequences).
- **Inaction**: each commander decides; some keep returning fugitives [SW 2.5, 6.3].
- **Historical default (hidden: history runs and rule seats only)**: `approve-holding` (30 May), with no public policy [SW 2.5].
- **Pushback**: commanders who return fugitives anyway [SW 6.3].
- **Verbs**: delegate
- **Reports**: informal
- **Systems**: politics, forces, people
- **Gate**: slavery and emancipation
- **Sources**: [SW 2.5, 6.3, 6.8, design S12]; [CS 4.3]

### S18 `merryman-writ`: the Chief Justice's writ

- **Window**: fires when a court issues a writ against an arrest made under a suspension (Merryman: arrested 25 May 1861, writ 26 May, oral ruling 28 May, opinion 1 June) [SW 6.6]. Precondition: `suspend-on-line` in S12.
- **Live**: yes; resurfaces at the next session of Congress as an accountability check (0040).
- **Staff recommendation**: Attorney General (Bates): needs-source.
- **Options**:
  - `ask-congress` "Ask Congress to act".
  - `comply` "Produce the prisoner".
  - `decline-and-defend` "Decline the writ and defend it to Congress".
- **Inaction**: the officer's refusal stands (General Cadwalader's own choice) [SW 6.6].
- **Historical default (hidden: history runs and rule seats only)**: `decline-and-defend`, in the 4 July message ("all the laws, but one") [SW 6.6].
- **Pushback**: the court is not a seat in the design (section 4).
- **Verbs**: address
- **Reports**: informal, press
- **Systems**: politics, press
- **Gate**: civil liberties
- **Sources**: [SW 6.6, 6.8, design S8]

### S19 `blockade-board`: the blockade's planning board and squadrons

- **Window**: fires when the blockade exists and the coast has no bases. Historically Welles ordered the board on 25 June 1861 (attested only second-hand, in the board's first report, ORN I-12 p. 195; "at Chase's urging" has no direct evidence, only Chase's forwarding of a Fernandina tip, ORN I-5 p. 720); the board made **three** reports (5, 16 and 26 July, ORN I-12 pp. 195–206); Welles ordered the Atlantic squadron divided on 18 September at the North/South Carolina line, and the named squadrons date from 29 October (ORN I-12 p. 208; ORN I-6 pp. 233–234) [GAPS S19; UN 2, 4].
- **Live**: yes; each of the board's three reports (5, 16 and 26 July) adds or changes options [GAPS S19; UN 2].
- **Staff recommendation**: Secretary of the Navy (Welles): [game] seat-derived; the Assistant Secretary (Fox, from 1 August) pushes hardest for Charleston [UN 1]; the only 1861 text tying Fox to Charleston is Bache's 4 September note, "I think well of Fox's idea of closing up that entrance" (ORN I-12 p. 207), and Fox's own Charleston letters are 1862 [GAPS S19].
- **Options**:
  - `adopt-board` "Adopt the board's plan: Fernandina, a South Carolina sound, the squadron split at Cape Romain" [UN 2]. The board itself, report of 5 July: Fernandina "the most desirable point for a place of deposit", 3,000 men to take and hold it (ORN I-12 pp. 196–198); it proposed the split at Cape Romain (p. 198), but the Department divided at the North/South Carolina line [GAPS S19].
  - `leave-to-squadrons` "Leave it to the squadron commanders". Welles to Stringham, 5 June: "Any information or suggestions from you ... will at all times be acceptable" (ORN I-5 p. 703) [GAPS S19].
  - `port-royal` "Take Port Royal". **Decided in the field**: Welles's order of 12 October said the Government had decided to take at least two of Bull's Bay, St. Helena, Port Royal and Fernandina, and "Which of the two shall be thus occupied will be committed to your discretion" (ORN I-12 pp. 214–215); Du Pont and General Sherman chose Port Royal (Du Pont to Fox, 24 October, Fox correspondence vol. 1). The board's own preference between St. Helena and Port Royal is not printed in ORN I-12 [GAPS S19; UN 2].
  - `take-hatteras` "Take Hatteras Inlet and hold it". The board had advised "the final obstruction of the inner bar" (ORN I-12 p. 200); Stringham thought sunken hulks of little use (6 Aug, ORN I-6 p. 64) and on 2 September urged retaining the forts ("the key to all the ports south of Hatteras", ORN I-6 p. 124); Butler, 30 August (OR I-4 p. 585) [GAPS S19].
  The board is a temporary post (0040) [UN des. 1].
- **Inaction**: the squadrons follow standing orders [game].
- **Historical default (hidden: history runs and rule seats only)**: the board convened; its Atlantic plans mostly adopted, Fernandina postponed, Port Royal chosen in the field under the 12 October discretion order, Hatteras taken and held [GAPS S19; UN 2, 6].
- **Pushback**: Stringham and Butler sought credit after Hatteras (supported only by Stellwagen's hearsay of 12 September, ORN I-6 p. 198) and Stringham asked to be relieved on 16 September (ORN I-6 pp. 216–217; Welles's order of 18 September mentions it, p. 234) [GAPS S19; UN 4, 6].
- **Verbs**: appoint, consult
- **Reports**: advice, wire
- **Systems**: navy, economy
- **Gate**: none
- **Sources**: [UN 2, 4, 6, des. 1, 2]; [GAPS S19]: ORN I-5 pp. 702–720; ORN I-6 pp. 64, 124, 198, 216–217, 233–234; ORN I-12 pp. 195–216; OR I-4 pp. 579–585

### S20 `special-session`: Congress meets in special session

- **Window**: fires when Congress convenes (4 July 1861, under the 15 April proclamation) and runs while it sits (to 6 August) [SW 1; UP 1.5].
- **Live**: yes, while the chambers sit. Bills appear as Congress moves them: the loan act (17 July), the Crittenden–Johnson resolution (22–25 July), ratification of the spring acts and the First Confiscation Act (6 August) [SW 1; UP 1.4].
- **Staff recommendation**: Secretary of the Treasury (Chase) on money [game]; the need he estimated was about $320 million [SW 4.5].
- **Options** (what the message asks):
  - `ask-narrow` "Ask only for ratification and this year's money".
  - `ask-war-footing` "Ask for 400,000 men and $400 million, and defend the spring's acts" (the 4 July message [SW 1]).
  - `ask-war-footing-and-aims` "Ask for the same, and state the war's aims".
  Each is an address to both chambers; bills then resolve by bloc support (FOUNDATION section 7).
- **Inaction**: Congress acts on its own; the spring's acts go unratified until it does [game].
- **Historical default (hidden: history runs and rule seats only)**: `ask-war-footing`; Congress passed the $250 million loan act, the Crittenden–Johnson resolution, ratification and the First Confiscation Act [SW 1; UP 1.4].
- **Pushback**: Vallandigham answered the message in the House on 10 July [SW 5]; Congress twice demanded Cameron's contracts and he refused [UE 4.1].
- **Verbs**: address
- **Reports**: informal, press
- **Systems**: politics, economy, press
- **Gate**: slavery and emancipation (Crittenden–Johnson; the First Confiscation Act, narrated as the loss of an owner's claim, never as "free" [SW 6.3, 6.8]); civil liberties (the accountability check on habeas)
- **Sources**: [SW 1, 4.5, 5, 6.3, 6.8, design S14]; [UP 1.4, 1.5]; [UE 1.3, 4.1]

### S21 `mcdowell-advance`: an advance before the ninety-day men go home

- **Window**: fires when the three-month regiments' terms near their end and the press presses ("On to Richmond", *Tribune*, June 1861) [SW 2.5; UP 4.1]. Historically McDowell marched on 16 July [SW 1].
- **Live**: yes; `drill-first` loses value as regiments' terms expire (two units went home the morning of the battle) [SW 2.5].
- **Staff recommendation**: general-in-chief (Scott): in his own words, "though opposed to the movement at first, we had all become animated and sanguine of success" (statement to the Joint Committee on the Conduct of the War, 31 March 1862, Report 1863 Part 2 p. 242); at the council of 29 June he said he "was never in favor of going over into Virginia" (McDowell's testimony, same Part 2 p. 37) [GAPS S21]. Who pressed the advance: no cabinet member, Lincoln, Seward or congressman is on record in July 1861 urging the date in his own words. On record: Patterson, 28 June, "if we do not meet the enemy with them, we will be in no condition to do so for three months to come" (OR I-2 p. 730; about the Valley); Thurlow Weed's letter of 26 July blaming the *Tribune*, the Postmaster General, F. P. Blair and members of Congress (*Rebellion Record* vol. 2 pp. 384–386), and Blair's reply in the House, 1 August (Globe pp. 386–387); McDowell, sworn: he "begged of the Secretary of War and the Secretary of the Treasury" for time (JCCW 1863 Part 2 pp. 37–38). The *Tribune*'s "Forward to Richmond" was read only through Nicolay and Hay (the original page was not reached) [GAPS S21].
- **Options**:
  - `advance-now` "Advance now". Goal to McDowell (objective the Manassas region); support request to Patterson.
  - `drill-first` "Wait and drill". McDowell, sworn: "I wanted very much a little time; all of us wanted it. We did not have a bit of it. The answer was: 'You are green, it is true; but they are green, also; you are all green alike.'" (JCCW 1863 Part 2 p. 38). The speaker of the reply is **not named**; do not give it to Lincoln [GAPS S21].
  - `wait-for-patterson` "Wait until Patterson's force is in hand". Gen. Sandford at the 29 June council: no movement "until it was ascertained that General Patterson was in such a position as to prevent the junction" (JCCW 1863 Part 2 pp. 55, 62); Scott's assurance, "if Johnson joins Beauregard he shall have Patterson on his heels" (McDowell, p. 37) [GAPS S21].
- **Inaction**: the regiments' terms run out and the army shrinks [game].
- **Historical default (hidden: history runs and rule seats only)**: `advance-now`; defeat on 21 July [SW 1].
- **Pushback**: McDowell warned that enlistments would expire [SW 2.5] (to Townsend, 20 July, OR I-2 p. 308: "In a few days I shall lose many thousands of the best of this force"); Patterson's force did not engage [SW 4.6]: its size is 10,000 (his own count, 28 June), 22,000 (Sandford, JCCW2 p. 56) or "about 23,000" (the Committee, p. 5), not one figure [GAPS S21]. The plan McDowell wrote is undated in OR I-2 pp. 719–721 ("about June 24" is an editor's bracket); the start date was fixed for 8 July (OR I-2 p. 324) or 9 July (Committee) [GAPS S21].
- **Verbs**: goal, review
- **Reports**: wire, casualty-return, press
- **Systems**: forces, press, politics
- **Gate**: none
- **Sources**: [SW 1, 2.5, 4.6, design S15]; [UP 4.1]; [IF 2.4, 3]; [GAPS S21]: Report of the Joint Committee on the Conduct of the War (1863) Part 2 pp. 3–5, 36–38, 55–62, 241–242; OR I-2 pp. 166, 303–308, 324–325, 718–721, 729–730; *Rebellion Record* vol. 2 pp. 384–386; Congressional Globe pp. 218, 246, 386–388

### S22 `fremont-proclamation`: Frémont's proclamation in Missouri

- **Window**: fires when a department commander issues a policy proclamation without notice: Frémont's martial law and emancipation clause, 30 August 1861 [U62 1, 2.5].
- **Live**: yes. If he refuses `private-request` (as Frémont did after Lincoln's 2 September letter), `public-order` appears; Jessie Benton Frémont's late-night audience (10 September) arrives as an unrequested audience [U62 1, 2.5].
- **Staff recommendation**: needs-source for any secretary's position; [game] seat-derived.
- **Options** (placement pending):
  - `let-stand` "Let the proclamation stand".
  - `private-request` "Ask him privately to bring it in line with the Confiscation Act" (Lincoln's 2 September letter [U62 1]).
  - `public-order` (appears on refusal) "Order the clause modified, publicly" [U62 1].
  - `relieve` "Relieve him".
- **Inaction**: the proclamation stands; Kentucky's Unionists take alarm [SW 3.4]; Radicals are pleased [U62 4].
- **Historical default (hidden: history runs and rule seats only)**: `private-request`, then `public-order` (11 September) [U62 1].
- **Pushback**: Frémont refuses; sends his wife to lobby; arrests Frank Blair Jr. for critical letters [U62 2.5].
- **Verbs**: audience, relieve
- **Reports**: informal, press
- **Systems**: politics, press, people, forces
- **Gate**: slavery and emancipation
- **Sources**: [U62 1, 2.5, 4]; [SW 3.4]

### S23 `maryland-legislature`: the Maryland legislature

- **Window**: fires before the Maryland legislature's autumn sitting. Historically Mayor Brown and 31–33 legislators were arrested on 11–12 September 1861, which ended the session; Brown was held 14 months [SW 3.2, 6.6]. Why they were arrested, and on whose order: needs-source.
- **Live**: no.
- **Staff recommendation**: needs-source (the 1861 dossier notes Seward ran internal security arrests, marked "needs research" [U62 3]).
- **Options** (placement pending; wording needs a sourced cause):
  - `detain` "Detain the members".
  - `leave-be` "Let the session meet".
  - `watch` "Watch them and wait".
- **Inaction**: the session meets [game].
- **Historical default (hidden: history runs and rule seats only)**: `detain` [SW 3.2].
- **Pushback**: each arrest costs legitimacy and border trust ([SW 6.8] proposes locked consequences).
- **Verbs**: delegate
- **Reports**: informal
- **Systems**: politics, people
- **Gate**: civil liberties
- **Sources**: [SW 3.2, 6.6, 6.8]; [U62 3]

### S24 `fremont-department`: Frémont's department under review

- **Window**: fires when reports of mismanagement in a department reach the president [U62 2.5]. Historically Cameron and Lorenzo Thomas reached St. Louis on 11 October 1861; Thomas's report is dated 21 October; relief was directed on 24 October and Frémont notified on 2 November [U62 1; CP 3.1].
- **Live**: yes, until he is kept or relieved.
- **Staff recommendation**: Secretary of War (Cameron), who went himself; the Adjutant General (Thomas) wrote the report [CP 2.5, 3.1].
- **Options**:
  - `keep` "Keep him".
  - `observer-first` "Send someone to look first" (Frank Blair Jr. had already been sent to advise and inform [CP 3.1]). Send an observer.
  - `relieve-outright` "Relieve him outright".
  - `relieve-to-post` "Relieve him to another command".
- **Inaction**: he stays and the rumours grow [U62 2.5].
- **Historical default (hidden: history runs and rule seats only)**: `observer-first` (Cameron and Thomas), then `relieve-outright` through Scott; he was given the Mountain Department in March 1862 "to redeem himself" [U62 1; CP 2.7, 3.1].
- **Pushback**: his standing with Radicals and abolitionists [U62 2.5]; his later testimony to the Joint Committee leaked to the *Tribune* [CP 2.8].
- **Verbs**: observer, relieve, appoint
- **Reports**: observer-letter, informal
- **Systems**: people, politics, forces
- **Gate**: none
- **Sources**: [U62 1, 2.5]; [CP 2.5, 2.7, 2.8, 3.1]

### S25 `general-in-chief-1861`: two men for the top command

- **Window**: fires when a field commander bypasses the general-in-chief and deals directly with the cabinet (McClellan, August–October 1861) [U62 2.2, 2.3]. Ends when one of them goes (Scott retired on 1 November) [U62 1].
- **Live**: yes; Scott's request to retire appears as the friction grows [U62 2.2].
- **Staff recommendation**: Secretary of War (Cameron): [game] seat-derived.
- **Options**:
  - `keep-scott` "Keep Scott and order the army commander to go through him".
  - `one-man-both` "Make the army commander general-in-chief and let him keep the army" (McClellan: "I can do it all" [U62 1]).
  - `third-man` "Name a third general to the top command" (candidates: needs-source).
- **Inaction**: the friction continues; Scott's grievance rises [game].
- **Historical default (hidden: history runs and rule seats only)**: `one-man-both` (1 November) [U62 1].
- **Pushback**: whether Scott's retirement was voluntary is disputed [U62 2.2]; McClellan's private contempt for the cabinet [U62 2.3].
- **Verbs**: appoint, relieve, audience
- **Reports**: informal, memorandum
- **Systems**: people, forces
- **Gate**: none
- **Sources**: [U62 1, 2.2, 2.3]

### S26 `trent-affair`: the *Trent*

- **Window**: fires when news arrives that a captain has taken Confederate envoys from a British ship (Wilkes, 8 November 1861, without orders) [UN 4, 5]. Ends when the envoys are released or Britain acts (Seward's note, 26 December) [UN 5].
- **Live**: yes, seven weeks. The clock is British patience, with troop movements to Canada (over 8,000 or 11,000) [UN 5]; Congress thanks Wilkes [UN 4]; Britain bans exports of saltpeter, powder and lead [UE 3.2].
- **Staff recommendation**: Secretary of State (Seward): release them [UN 5]; Senator Sumner shared the credit [U62 2.18].
- **Options**:
  - `hold` "Hold the envoys".
  - `release` "Release them, conceding the captain should have taken the ship to a prize court" (Seward's note [UN 5]).
  Arbitration or other options: needs-source.
- **Inaction**: the envoys stay held; the British clock runs to its threshold [game].
- **Historical default (hidden: history runs and rule seats only)**: `release` (26 December); the saltpeter ban was lifted on 5 February 1862 [UN 5; UE 3.2].
- **Pushback**: the captain acted without orders [UN 5]; Congress and the press cheered him [UN 4].
- **Verbs**: consult
- **Reports**: press, informal, advice
- **Systems**: diplomacy, navy, politics, press, economy
- **Gate**: none
- **Sources**: [UN 4, 5, des. 2]; [UE 3.2]; [U62 2.18]

### S27 `committee-and-stone`: the Joint Committee and General Stone

- **Window**: fires when a defeat (Ball's Bluff, 21 October 1861) produces a congressional investigation: the Joint Committee on the Conduct of the War (9–10 December) [U62 1; UP 1.3]. Historically Stone was arrested on 8 February 1862 (9 or 12 February in other sources), held to August and never tried [UP 1.3; CP 2.7].
- **Live**: yes; the committee's requests arrive while it sits [game].
- **Staff recommendation**: general-in-chief (McClellan) to February; Secretary of War (Stanton) from 20 January: needs-source.
- **Options**:
  - `allow-arrest` "Let the War Department arrest him".
  - `court-of-inquiry` "Order a court of inquiry instead" (whether this was offered: needs-source).
  - `protect` "Refuse an arrest without charges".
- **Inaction**: the committee leaks and Stone's standing falls [UP 1.3].
- **Historical default (hidden: history runs and rule seats only)**: `allow-arrest` [CP 2.7].
- **Pushback**: the committee favoured anti-slavery generals and distrusted West Pointers; non-Republican officers felt the most pressure [UP 1.3]; Lincoln to Wade: "anybody will do for you, but I must have somebody" [CP 2.8].
- **Verbs**: delegate, audience
- **Reports**: informal, press
- **Systems**: politics, press, people
- **Gate**: civil liberties (an officer held without charges) [I]
- **Sources**: [U62 1, 2.18]; [UP 1.3]; [CP 2.7, 2.8]

### S28 `war-department-1861`: the Secretary of War's report, then the Secretary (a chain in two stages)

- **Window**: stage A fires when the Secretary of War's annual report carries a passage on arming the enslaved (December 1861) [SW 6.4; U62 2.14]; stage B when the contracts scandal reaches the president (the House committee reported on 17 December) [UE 4.1]. Ends with the secretary kept or replaced (Cameron resigned 13 January 1862; Stanton confirmed 15 January) [UE 4.1, 4.2].
- **Live**: yes, across both stages.
- **Staff recommendation**: needs-source for any adviser on stage A; [game] seat-derived for stage B.
- **Options, stage A** (placement pending):
  - `cut-passage` "Have the passage withdrawn" (Lincoln cut it [SW 6.4]).
  - `let-print` "Let it print".
- **Options, stage B**:
  - `keep` "Keep him".
  - `move-abroad` "Send him abroad as minister and name a successor" (Russia; Stanton) [UE 4.1].
  - `replace-outright` "Dismiss him".
- **Inaction**: the report prints as written; how Cameron's report was recalled and reprinted is needs-source [U62 2.14].
- **Historical default (hidden: history runs and rule seats only)**: A `cut-passage`; B `move-abroad` (a softened dismissal letter of 11 January) [UE 4.1; U62 1].
- **Pushback**: Cameron released the report on his own [U62 2.14]; he refused Congress's demands for contracts [UE 4.1]; the House censured him on 30 April 1862 [UE 4.1].
- **Verbs**: relieve, appoint
- **Reports**: informal, press
- **Systems**: people, politics, economy, press
- **Gate**: Black soldiers; slavery and emancipation
- **Sources**: [SW 6.4]; [U62 1, 2.13, 2.14]; [UE 4.1, 4.2]

### S29 `treasury-notes`: paper money

- **Window**: fires when the banks suspend specie payments (28–30 December 1861) [UE 1.3]. Ends with a decision on notes (the Legal Tender Act, signed 25 February 1862) [UE 1.3; UP 1.4].
- **Live**: yes. Options need Congress sitting (the 37th Congress sat 2 December 1861–17 July 1862 [UP 1.5]).
- **Staff recommendation**: Secretary of the Treasury (Chase): keep the Treasury on coin; he "came with reluctance" to legal tender [UE 1.3].
- **Options**:
  - `bonds-below-par` "Sell bonds at market, below par".
  - `coin-rule` "Keep the Treasury on coin" (Chase [UE 1.3]).
  - `legal-tender` "Back legal-tender notes in Congress" (Spaulding, Stevens, Fessenden [UE 1.3]).
- **Inaction**: Congress decides alone; Chase stalls [UE 1.3].
- **Historical default (hidden: history runs and rule seats only)**: `legal-tender` [UE 1.3].
- **Pushback**: Chase's specie rule drained the banks; Montgomery Blair criticised his delays; most Democrats opposed (Pendleton) [UE 1.3].
- **Verbs**: address, pressure
- **Reports**: advice, informal
- **Systems**: economy, politics
- **Gate**: none
- **Sources**: [UE 1.3, 1.4]; [UP 1.4, 1.5]

### S30 `arms-and-contracts`: what to buy and from whom

- **Window**: fires when the arms programme's holders disagree: the Chief of Ordnance opposes adopting the Spencer (9 December 1861); the new Secretary of War voids foreign contracts (29 January 1862) and Seward warns of foreign complications [UE 3.1, 3.2].
- **Live**: no; two stops.
- **Staff recommendation**: Chief of Ordnance (Ripley): re-rifle the smoothbores and buy no repeaters [UE 3.1].
- **Options**:
  - `foreign-cancel` "Cancel the foreign contracts and buy at home" (Stanton [UE 3.2]).
  - `foreign-keep` "Keep buying abroad" (Seward's warning [UE 3.2]).
  - `old-stock` "Re-rifle the old stock and buy no repeaters" (Ripley [UE 3.1]).
  - `try-repeaters` "Order breech-loaders tried".
- **Inaction**: the Chief of Ordnance's course [UE 3.1].
- **Historical default (hidden: history runs and rule seats only)**: `old-stock` (to 1863) and `foreign-cancel` [UE 3.1, 3.2].
- **Pushback**: Ripley stalls by not buying and by selling old stock [UE 3.1].
- **Verbs**: consult
- **Reports**: advice
- **Systems**: economy, diplomacy, people
- **Gate**: none
- **Sources**: [UE 3.1, 3.2, 6.1]

### S31 `army-will-not-move`: the army does not move

- **Window**: fires when the main army stays in camp through the winter and its commander falls ill (McClellan, typhoid, late December 1861) [U62 1, 2.3]. The Joint Committee pressed Lincoln at a cabinet meeting on 6 January 1862 [UP 1.3]. Ends with an order to advance or a plan (President's General War Order No. 1, 27 January: a general advance by 22 February) [U62 1].
- **Live**: yes; enemy estimates keep arriving and growing [IF 4].
- **Staff recommendation**: general-in-chief (McClellan): wait [U62 2.3].
- **Options**:
  - `consult-generals` "Meet his division commanders while he is ill" (McDowell, Franklin [U62 1]). Consult.
  - `date-order` "Order a general advance by a fixed date". Goals to every army commander.
  - `wait-for-plan` "Wait for his plan".
- **Inaction**: `wait-for-plan`.
- **Historical default (hidden: history runs and rule seats only)**: `consult-generals`, then `date-order` (27 January) [U62 1].
- **Pushback**: McClellan comes in person to reassert his command [U62 2.3]; inflated estimates from Pinkerton, "a lever against his superiors" [IF 4]; the 22 February date is missed [U62 2.3].
- **Verbs**: consult, goal, audience
- **Reports**: enemy-estimate, advice, strength-return
- **Systems**: forces, people, politics
- **Gate**: none
- **Sources**: [U62 1, 2.3]; [UP 1.3]; [IF 4]

### S32 `grant-rumour`: a rumour about a successful general

- **Window**: fires only when a superior's report about a subordinate reaches the president: Halleck sidelines Grant after Donelson, confines him to Fort Henry and wires McClellan a rumour that Grant had "resumed his former bad habits" (4 March 1862), never substantiated [U62 1, 2.4, 2.11].
- **Live**: short; Grant stays sidelined while it is open (C. F. Smith commands the expedition) [U62 1].
- **Staff recommendation**: general-in-chief (McClellan): needs-source; [game] seat-derived.
- **Options**:
  - `ask-halleck` "Ask the department commander for particulars in writing". Inquire.
  - `leave-to-department` "Leave it to the department".
  - `send-someone` "Send someone to see". Send an observer.
- **Inaction**: the subordinate stays sidelined [U62 1].
- **Historical default (hidden: history runs and rule seats only)**: needs-source (what Lincoln did, if anything).
- **Pushback**: a superior filters a low-standing, high-competence subordinate's reports [U62 2.11].
- **Verbs**: inquire, observer
- **Reports**: wire, informal
- **Systems**: people
- **Gate**: none
- **Sources**: [U62 1, 2.4, 2.11]

### S33 `compensated-emancipation`: an offer to the border states

- **Window**: fires when Congress is sitting and the border states hold the balance. Historically Lincoln proposed compensated emancipation on 6 March 1862; border-state congressmen objected at a meeting on 10 March; the plan was dropped [U62 1; UP 1.2].
- **Live**: yes, while Congress sits.
- **Staff recommendation**: needs-source.
- **Options** (placement pending; the proposal's text is needs-source):
  - `members-first` "Put it to the border-state members first". Audience with a delegation.
  - `not-now` "Not now".
  - `propose` "Propose federal aid to states that end slavery gradually". An address to Congress.
- **Inaction**: no proposal [game].
- **Historical default (hidden: history runs and rule seats only)**: `propose`, then the 10 March meeting; dropped [U62 1].
- **Pushback**: the border-state delegations refuse (Maryland's, and per the page the others) [UP 1.2].
- **Verbs**: address, audience, promise
- **Reports**: informal
- **Systems**: politics
- **Gate**: slavery and emancipation
- **Sources**: [U62 1, 4]; [UP 1.2, 2.1]

### S34 `hampton-roads-scare`: the ironclad in Hampton Roads

- **Window**: fires when news arrives that the *Virginia* has sunk the *Cumberland* and taken the *Congress* (8 March 1862). Ends when the *Monitor*'s report arrives (a draw, 9 March) [UN 7].
- **Live**: yes, a day or two; the cabinet meets on 9 March [UN 1].
- **Staff recommendation**: Secretary of War (Stanton): abandon McClellan's campaign and recall Burnside, in Welles's account, which is one-sided [UN 1].
- **Options**:
  - `hold-course` "Hold course: the ironclad cannot leave the Capes or pass the Potomac shoals" (Welles [UN 1]).
  - `recall` "Recall Burnside and stop the campaign" (Stanton, per Welles [UN 1]).
- **Inaction**: `hold-course`.
- **Historical default (hidden: history runs and rule seats only)**: `hold-course` [I, from UN 1, 7]; whether a recall was ordered: needs-source.
- **Pushback**: the scare kept McClellan's fears alive until the *Virginia* was burned on 11 May [UN 7].
- **Verbs**: consult
- **Reports**: wire, advice
- **Systems**: navy, forces, people
- **Gate**: none
- **Sources**: [UN 1, 7]

### S35 `war-orders-march-1862`: corps, the top command and the West

- **Window**: fires when the general-in-chief has missed the date for a general advance (22 February 1862) [U62 2.3]. Historically President's General War Order No. 2 (8 March) organised the Army of the Potomac into corps; War Order No. 3 (11 March) relieved McClellan as general-in-chief, gave Halleck the West, and created the Mountain Department for Frémont [U62 1].
- **Live**: no; one stop whose options can be combined (section 3, P3).
- **Staff recommendation**: Secretary of War (Stanton): [game] seat-derived. The general-in-chief is the subject.
- **Options**:
  - `corps` "Organise the army into corps and name their commanders" (McDowell, Sumner, Heintzelman, Keyes: verify [U62 1]).
  - `fremont-command` "Give Frémont a department".
  - `relieve-top` "Relieve him as general-in-chief and leave him his army".
  - `unite-west` "Unite the western departments under Halleck".
- **Inaction**: no change [game].
- **Historical default (hidden: history runs and rule seats only)**: all four; no general-in-chief until 23 July [U62 1, 3].
- **Pushback**: McClellan's regard; corps imposed on his army by the president (FOUNDATION section 5, citing the Union dossier); the vacancy leaves later staff lines without their usual author (section 3, P5).
- **Verbs**: appoint, relieve, promote
- **Reports**: informal
- **Systems**: forces, people, politics
- **Gate**: none
- **Sources**: [U62 1, 2.3, 3]

### S36 `washington-cover`: what stays to cover the capital

- **Window**: fires when the main army's plan takes it away from Washington. Historically the Army of the Potomac began shipping 121,500 men to Fort Monroe on 17 March 1862, and Lincoln withheld McDowell's corps (about a third) [U62 1, 2.3].
- **Live**: yes, through the plan review; the commander's protests and strength figures arrive while it is open.
- **Staff recommendation**: Secretary of War (Stanton): [game] seat-derived (the general-in-chief's post is vacant).
- **Options**:
  - `count-first` "Ask for the exact numbers left behind before deciding". Inquire.
  - `release-all` "Send every corps with the army" (McClellan).
  - `withhold-corps` "Keep one corps to cover the capital". A transfer of a corps from the army commander to a new department (Department of the Rappahannock, April [U62 2.8]) and an edit to his plan.
- **Inaction**: the plan executes as drafted [game].
- **Historical default (hidden: history runs and rule seats only)**: `withhold-corps` [U62 1].
- **Pushback**: McClellan's estimates of the enemy [IF 4]; his strength figures depend on the measure (121,500 shipped; 179,000 present for duty across the whole command) [U62 2.3].
- **Verbs**: review, transfer, inquire
- **Reports**: strength-return, effective-strength, enemy-estimate
- **Systems**: forces, people, politics
- **Gate**: none
- **Sources**: [U62 1, 2.3, 2.8]; [IF 1, 4]

### S37 `recruiting`: closing and reopening the recruiting offices (a chain in two stages)

- **Window**: stage A fires on the Secretary of War's initiative to close recruiting, believing the spring campaign will end the war (3 April 1862) [UE 2.1, 4.2]; stage B when the governors ask for a new call (seventeen governors, 28 June) [UE 2.1].
- **Live**: yes. Stage B's `militia-draft` appears when the Militia Act is law (17 July) [UE 2.1].
- **Staff recommendation**: Secretary of War (Stanton): close (stage A) [UE 4.2]; stage B [game] seat-derived.
- **Options, stage A**:
  - `close` "Close recruiting and sell the rendezvous property" (Stanton [UE 2.1]).
  - `keep-open` "Keep recruiting open".
- **Options, stage B**:
  - `call-three-year` "Call 300,000 three-year men, as the governors ask".
  - `militia-draft` (appears 17 July) "Ask the states to draft militia for nine months".
  - `refill-old` "Fill the old regiments first" (the War Department's wish [UE 2.2]).
- **Inaction**: A `keep-open`; B no new call [game].
- **Historical default (hidden: history runs and rule seats only)**: A `close`, reopened 6 June or 6 July (sources conflict); B the call of 2 July and the militia draft of 4 August [UE 2.1].
- **Pushback**: governors raise new regiments instead of refilling old ones, to keep commissions [UE 2.2]; the militia draft credited about 87,000 of 300,000, and "only a small portion actually joined the Army" [UE 2.1].
- **Verbs**: pressure
- **Reports**: strength-return, informal
- **Systems**: economy, politics, people
- **Gate**: none
- **Sources**: [UE 2.1, 2.2, 4.2, 6.2]; [U62 2.17]

### S38 `norfolk`: the squadron, the army and Norfolk

- **Window**: fires when the flag officer refuses to serve under the army commander and offers only to "cooperate" (Goldsborough and McClellan, spring 1862) [UN 4, 6]. Historically Lincoln went to Fort Monroe (6 May), visited the *Monitor* (7 May) and directed Goldsborough to attack Norfolk; troops landed 10 May and Norfolk was abandoned [UN 1, 7].
- **Live**: yes; `go-myself` costs days away (0025).
- **Staff recommendation**: Secretary of the Navy (Welles): needs-source; [game] keep the ships under the department.
- **Options**:
  - `cooperate` "Leave it to cooperation between them".
  - `go-myself` "Go to Fort Monroe and settle it in person". A visit.
  - `navy-under-army` "Put the squadron under the army commander".
  - `separate-flotilla` "Give a separate flotilla to Wilkes, reporting to the department" (Lincoln did so on Welles's recommendation [UN 4]).
- **Inaction**: `cooperate`.
- **Historical default (hidden: history runs and rule seats only)**: `go-myself` (6–10 May) and `separate-flotilla` [UN 1, 4].
- **Pushback**: Goldsborough held back at Gloucester Point and in the Seven Days and asked to be relieved [UN 4]; Rodgers's offer to land troops near Richmond was not acted on (weak source) [UN 6].
- **Verbs**: visit, goal, appoint
- **Reports**: wire, informal
- **Systems**: navy, forces, people
- **Gate**: none
- **Sources**: [UN 1, 4, 6, 7, des. 3]; [CP 3.3]

### S39 `hunter-order`: Hunter's order

- **Window**: fires when a department commander frees the enslaved in his department by order: Hunter's General Order No. 11 for Georgia, South Carolina and Florida (9 May 1862), of which the government had no prior knowledge [U62 1].
- **Live**: yes, until revoked or left standing.
- **Staff recommendation**: needs-source.
- **Options** (placement pending):
  - `let-stand` "Let it stand".
  - `private-withdraw` "Ask him to withdraw it".
  - `revoke` "Revoke it publicly".
- **Inaction**: the order stands [game].
- **Historical default (hidden: history runs and rule seats only)**: `revoke` (19 May) [U62 1].
- **Pushback**: a general making policy, as Frémont did (S22) and Butler did (S17) [U62 2.6].
- **Verbs**: relieve
- **Reports**: informal, press
- **Systems**: politics, press, people
- **Gate**: slavery and emancipation
- **Sources**: [U62 1, 2.6]; [CS 4.3]

### S40 `new-orleans-command`: the general in New Orleans (a chain to December)

- **Window**: fires when an occupying general's order causes an international outcry: Butler's General Order No. 28 (15 May 1862) and threats to foreign consuls [U62 1, 2.6]. Ends when he is kept for good or removed (16 December 1862, replaced by Banks) [U62 1].
- **Live**: yes, seven months; foreign patience is the clock; orders and replies go by steamer through New York, est. 7–14 days one way [I] [U62 5].
- **Staff recommendation**: Secretary of State (Seward): needs-source; [game] seat-derived.
- **Options**:
  - `back-him` "Back him".
  - `replace` "Replace him" (Banks [U62 1]).
  - `withdraw-order` "Order the general order withdrawn".
- **Inaction**: the order stands and the protests mount [U62 2.6].
- **Historical default (hidden: history runs and rule seats only)**: kept until `replace` on 16 December [U62 1].
- **Pushback**: a Massachusetts Democrat whose removal costs War Democrats [U62 2.6]; a courier held in New York for days [U62 5].
- **Verbs**: relieve, appoint
- **Reports**: informal, press
- **Systems**: diplomacy, politics, people, press
- **Gate**: civilians (General Order No. 28) [I]
- **Sources**: [U62 1, 2.6, 5]; [CP 2.6]

### S41 `army-of-virginia`: three departments into one army

- **Window**: fires when three departments in one theatre fail to concert [I] (Jackson's Valley campaign tied down Banks, Frémont and McDowell, May–June 1862) [U62 1]. Historically the Army of Virginia was formed under Pope on 26 June [U62 1].
- **Live**: yes; if the senior man refuses to serve under a junior, `accept-request` and `order-serve` appear (Frémont, 27 June) [CP 2.4].
- **Staff recommendation**: Secretary of War (Stanton): [game] seat-derived; Pope advised in Washington [U62 2.9].
- **Options**:
  - `accept-request` (appears on refusal) "Relieve him at his own request".
  - `keep-separate` "Keep the three departments".
  - `merge-under-junior` "Merge them under the general you choose, regardless of seniority" (the 4 April 1862 resolution allows it [CP 2.4]).
  - `merge-under-senior` "Merge them under the senior general".
  - `order-serve` (appears on refusal) "Order him to serve".
- **Inaction**: `keep-separate`.
- **Historical default (hidden: history runs and rule seats only)**: `merge-under-junior` (Pope), then `accept-request` [U62 1; CP 2.4].
- **Pushback**: Frémont refuses and never commands again [CP 2.4]; Pope's address reads as a critique of McClellan [U62 2.9].
- **Verbs**: appoint, relieve, transfer
- **Reports**: informal
- **Systems**: forces, people, politics
- **Gate**: none
- **Sources**: [U62 1, 2.5, 2.9, 3]; [CP 2.4, 2.9]

### S42 `harrisons-landing-letter`: a general's political letter

- **Window**: fires when a field commander's seat sends unsolicited political advice: McClellan's Harrison's Landing letter, handed to Lincoln on his 8 July 1862 visit, against "forcible abolition of slavery" and confiscation [U62 1, 2.3]. It follows the 28 June telegram whose last sentence the telegraph supervisor struck [U62 2.3; IF 2.4].
- **Live**: no.
- **Staff recommendation**: open; the natural military author is the letter's author (section 3, P5).
- **Options**:
  - `answer` "Answer him".
  - `file` "Take it and say nothing".
  - `show-cabinet` "Show it to the cabinet". Consult.
- **Inaction**: `file`.
- **Historical default (hidden: history runs and rule seats only)**: needs-source.
- **Pushback**: the letter is itself pushback; it is political advice in a military voice, like Scott's of 28 March 1861 (S01) [U62 2.3].
- **Verbs**: visit, audience, consult
- **Reports**: memorandum, wire
- **Systems**: people, politics
- **Gate**: slavery and emancipation
- **Sources**: [U62 1, 2.3]; [IF 2.4]

### S43 `general-in-chief-1862`: filling the top command

- **Window**: fires when the general-in-chief's post has been vacant for a pack-set time (vacant 11 March–23 July 1862, Lincoln and Stanton directing) [U62 3]. Historically an executive order of 11 July made Halleck general-in-chief; he assumed command on 23 July [U62 1].
- **Live**: yes; a candidate can decline (Burnside declined the army command in July via Meigs [U62 2.10]).
- **Staff recommendation**: Secretary of War (Stanton): [game] seat-derived.
- **Options**:
  - `halleck` "Bring Halleck east to the top command".
  - `leave-vacant` "Keep directing the war with the Secretary".
  - `restore-mcclellan` "Give the top command back to the army commander".
- **Inaction**: `leave-vacant`.
- **Historical default (hidden: history runs and rule seats only)**: `halleck` [U62 1].
- **Pushback**: Halleck as a buffer who forwards the president's wishes as suggestions [U62 2.4].
- **Verbs**: appoint
- **Reports**: advice
- **Systems**: people, forces
- **Gate**: none
- **Sources**: [U62 1, 2.4, 2.10, 3]

### S44 `vicksburg-river-1862`: the fleets below Vicksburg

- **Window**: fires when a fleet holds a river below a fortress the army cannot take: Farragut's demand for Vicksburg's surrender (18 May 1862), the failed bombardment, the *Arkansas* through both fleets (15 July) [UN 6].
- **Live**: yes; the clock is the falling river and sickness (a third of Farragut's men sick) [UN 6].
- **Staff recommendation**: Secretary of the Navy (Welles): let the Gulf fleet go (his order of 23 July) [UN 6].
- **Options**:
  - `ask-army` "Ask the western command for troops". A support request (Halleck's answer: needs-source).
  - `release` "Let the Gulf fleet go downriver" (Welles [UN 6]).
  - `stay` "Order the fleets to stay".
- **Inaction**: the flag officers decide (Davis withdrew to Helena on his own authority on 28 July) [UN 6].
- **Historical default (hidden: history runs and rule seats only)**: `release` [UN 6].
- **Pushback**: Davis acts on his own authority [UN 4, 6].
- **Verbs**: goal
- **Reports**: wire, informal
- **Systems**: navy, forces
- **Gate**: none
- **Sources**: [UN 4, 6, des. 3]

### S45 `confiscation-and-militia-acts`: two acts of July 1862

- **Window**: fires when Congress passes the Second Confiscation Act and the Militia Act before adjourning (17 July 1862) [UP 1.4].
- **Live**: yes, until Congress adjourns. `sign-with-resolution` appears if Congress takes up an explanatory resolution [UP 1.4].
- **Staff recommendation**: Attorney General (Bates): needs-source.
- **Options** (placement pending):
  - `sign` "Sign both".
  - `sign-with-resolution` (appears) "Sign the confiscation act once Congress passes the explanatory resolution" [UP 1.4].
  - `veto` "Veto the confiscation act".
- **Inaction**: the acts lapse or become law by the chamber state (pocket rules: needs-source) [game].
- **Historical default (hidden: history runs and rule seats only)**: `sign-with-resolution`, with the prepared veto message sent anyway; the Militia Act signed the same day, the first law to admit Black men to the militia [UP 1.4; UE 2.1].
- **Pushback**: Radicals against the resolution; the border states against confiscation [U62 4].
- **Verbs**: address
- **Reports**: informal
- **Systems**: politics, economy
- **Gate**: slavery and emancipation; Black soldiers
- **Sources**: [UP 1.4]; [UE 2.1]; [U62 1, 4]; [CS 4.3]

### S46 `emancipation-proclamation`: a proclamation of emancipation (a chain in three stages)

- **Window**: stage A fires when the president's draft is ready to put to the cabinet (22 July 1862); stage B when a public demand arrives (Greeley's "Prayer of Twenty Millions", 20 August); stage C when a battle report the public reads as a victory arrives (Antietam, 17 September) [U62 1].
- **Live**: yes, two months. `wait-for-victory` holds the decision until a report meets a condition (section 3, P2).
- **Staff recommendation**: Secretary of State (Seward): wait for a victory (marked verify in the dossier) [U62 1].
- **Options, stage A** (placement pending):
  - `issue-now` "Issue it now".
  - `shelve` "Put it away".
  - `wait-for-victory` "Hold it until a victory" (Seward, verify [U62 1]).
- **Options, stage B**:
  - `announce` "Announce the proclamation".
  - `no-reply` "Make no reply".
  - `union-first-reply` "Reply publicly that saving the Union is the paramount object" (Lincoln's 22 August reply [U62 1]).
- **Options, stage C**:
  - `delay` "Delay again".
  - `issue-preliminary` "Issue a preliminary proclamation with a date".
- **Inaction**: the draft stays in the desk; the Radicals' and abolitionists' pressure rises [U62 4].
- **Historical default (hidden: history runs and rule seats only)**: A `wait-for-victory`; B `union-first-reply`; C `issue-preliminary` (22 September) [U62 1].
- **Pushback**: Greeley's public attack [U62 1]; War Democrats split over emancipation [U62 4]; the Altoona governors' resolution (S52) [U62 2.17]; British officials read it as an incitement to servile war, which hardened opinion against intervention [CS 3.1]; the Herald backed it in September [UP 4.1].
- **Verbs**: consult, address
- **Reports**: press, advice, memorandum
- **Systems**: politics, press, diplomacy, people
- **Gate**: slavery and emancipation
- **Sources**: [U62 1, 2.17, 4]; [UP 4.1]; [CS 3.1, 4.3]

### S47 `peninsula-withdrawal`: bringing the army back from the Peninsula

- **Window**: fires when the general-in-chief orders the army off the Peninsula to join Pope (3 August 1862) and its commander protests that it "will prove disastrous" [U62 1, 2.3].
- **Live**: yes, four weeks; the clock is Pope's position. On 29 August `hold-capital` appears from McClellan's suggestion "to leave Pope to get out of his scrape" [U62 1, 2.3].
- **Staff recommendation**: general-in-chief (Halleck): withdraw (his order) [U62 1].
- **Options**:
  - `hold-capital` (appears 29 August) "Keep the returning corps to hold the capital" (McClellan [U62 2.3]).
  - `push-to-pope` "Send the returning corps forward to Pope". Transfer.
  - `reinforce-there` "Reinforce him where he is".
  - `withdraw` "Bring the army back to join Pope" (Halleck [U62 1]).
- **Inaction**: the general-in-chief's order stands; compliance is slow [U62 2.3].
- **Historical default (hidden: history runs and rule seats only)**: `withdraw` [U62 1].
- **Pushback**: slow withdrawal; his generals' animosity toward Pope contributed to Second Bull Run [U62 2.3]; Halleck cannot integrate the two armies [U62 2.4].
- **Verbs**: transfer, goal, review
- **Reports**: wire, advice
- **Systems**: forces, people
- **Gate**: none
- **Sources**: [U62 1, 2.3, 2.4]

### S48 `military-arrests`: arrests of civilians who discourage enlistment

- **Window**: fires when the militia draft meets resistance. Historically the Secretary of War's order of 8 August 1862 (at least 350 arrested in the month after) and the presidential proclamation of 24 September (military arrest of those discouraging enlistment) [UP 1.5, 4.3; U62 4].
- **Live**: yes; arrests accumulate while it is open [game].
- **Staff recommendation**: Secretary of War (Stanton): [game] his own order.
- **Options** (placement pending; [UP] proposes "modelled with locked consequences"):
  - `narrow` "Limit arrests to draft obstruction, each case reviewed".
  - `nationwide` "Proclaim military arrest for discouraging enlistment".
  - `no-arrests` "Leave it to the courts".
- **Inaction**: the War Department's order runs [game].
- **Historical default (hidden: history runs and rule seats only)**: the 8 August order and the 24 September proclamation [UP 1.5, 4.3].
- **Pushback**: each arrest costs standing with Democrats and the border [UP placement]; 10,000–15,000 held without prompt trial over the war [UP 4.3].
- **Verbs**: delegate
- **Reports**: press, informal
- **Systems**: politics, press
- **Gate**: civil liberties
- **Sources**: [UP 1.5, 2.1, 4.3, placement]; [U62 4]

### S49 `dakota-war`: war in Minnesota

- **Window**: Pope was sent to a new Department of the Northwest (ordered 6 September 1862, command 16 September) for the Dakota War [CP 2.7; U62 2.9]. Its causes, events and Union decisions are needs-source: no research note covers it [SW 6.5].
- **Live**: needs-source.
- **Staff recommendation**: needs-source.
- **Options**: none proposed. [SW 6.8] proposes "Dakota 1862 refused until its own record"; FOUNDATION section 7 places the Dakota War inside the first slice and under the gate.
- **Inaction**: needs-source.
- **Historical default (hidden: history runs and rule seats only)**: needs-source.
- **Pushback**: needs-source.
- **Verbs**: appoint
- **Reports**: informal
- **Systems**: forces, politics
- **Gate**: wars against Native nations
- **Sources**: [CP 2.7]; [U62 2.9]; [SW 6.5, 6.8]

### S50 `railroad-dispute`: a general stops the trains

- **Window**: fires when a field general commandeers the military railroad: Sturgis stopped four trains and arrested Haupt (23 August 1862); Haupt held Halleck's dispatch that no officer could interfere [UE 5].
- **Live**: hours to days.
- **Staff recommendation**: general-in-chief (Halleck): no officer may interfere (his dispatch) [UE 5].
- **Options**:
  - `ask-the-railroad-man` "Ask the railroad's director directly" (Lincoln leaned on Haupt during Second Bull Run [IF 2.2]). Inquire.
  - `back-railroad` "Order the general to release the trains".
  - `leave-to-field` "Leave it to the officers on the spot".
- **Inaction**: the trains stay held; Haupt claimed the delay kept 10,000 men out of Second Manassas [UE 5].
- **Historical default (hidden: history runs and rule seats only)**: needs-source (how it ended).
- **Pushback**: Sturgis: "take your damned railroad" [UE 5].
- **Verbs**: inquire, goal
- **Reports**: wire, informal
- **Systems**: economy, forces, people
- **Gate**: none
- **Sources**: [UE 5, 6.1]; [IF 2.2]

### S51 `cabinet-remonstrance`: the cabinet's paper against McClellan

- **Window**: fires when several cabinet seats act together against a general after a defeat: Stanton's remonstrance, signed by Chase and Bates (Smith reportedly), declined by Welles (30 August–1 September 1862) [U62 1, 2.13].
- **Live**: yes; Pope's beaten army is falling back on the capital [U62 1].
- **Staff recommendation**: Secretary of War (Stanton): remove McClellan [U62 2.13].
- **Options**:
  - `remove` "Relieve him, as the paper asks".
  - `restore` "Put him in command of the capital's defences".
  - `someone-else` "Give the command to another general" (Burnside declined again [U62 2.10]).
- **Inaction**: no one commands the returning armies [game].
- **Historical default (hidden: history runs and rule seats only)**: `restore` (2 September), over cabinet objection [U62 1].
- **Pushback**: the signers' stances on record (0040); Welles's refusal to sign because it "might seem unfriendly to the President" [U62 2.13]; Burnside's refusal [U62 2.10].
- **Verbs**: consult, appoint, relieve
- **Reports**: memorandum, advice
- **Systems**: people, politics, forces
- **Gate**: none
- **Sources**: [U62 1, 2.10, 2.13]

### S52 `altoona-governors`: the war governors meet

- **Window**: fires when the governors meet as a body (Altoona, 24–25 September 1862, 13 or 14 attending) on quotas, with criticism of McClellan by "indirect allusions" and Curtin's resolution approving the preliminary proclamation [U62 2.17].
- **Live**: no.
- **Staff recommendation**: Secretary of War (Stanton), on quotas: [game] seat-derived.
- **Options**:
  - `adjust-quotas` "Adjust the quotas they object to".
  - `hear-them` "Receive their address". An audience with a delegation.
  - `stand-by-general` "Stand by the army commander".
  How the governors' address was received: needs-source.
- **Inaction**: the governors' resolution stands as a public statement [game].
- **Historical default (hidden: history runs and rule seats only)**: needs-source.
- **Pushback**: governors as seats who raise regiments and bargain quotas [U62 2.17, 3].
- **Verbs**: audience, honour
- **Reports**: informal, press
- **Systems**: politics, economy, people
- **Gate**: none
- **Sources**: [U62 2.17, 3]; [UE 2.2]

### S53 `after-antietam`: the army rests after a victory (a chain to the relief)

- **Window**: fires when a battle the army calls a victory is followed by no pursuit (Antietam, 17 September 1862; Lee withdrew 18–19 September) [U62 1]. Ends with the commander moving or relieved (5 November) [U62 1; CP 2.7].
- **Live**: yes, seven weeks. `relieve-after-elections` appears once the autumn elections are scheduled (14 October and 4 November) [UP 3.1]; the commander's excuse reports keep arriving [U62 2.3].
- **Staff recommendation**: general-in-chief (Halleck): [game] he forwards the president's wishes as suggestions [U62 2.4].
- **Options**:
  - `go-see` "Go to the army and see". A visit.
  - `relieve-after-elections` (appears) "Relieve him once the elections are over".
  - `relieve-now` "Relieve him now".
  - `urge-by-letter` "Write to urge him to move" (Lincoln's 13 October letter [U62 2.3]). Pressure.
  - `wait` "Let him refit".
- **Inaction**: `wait`; the excuses continue (the horses: 128 of 267 unfit; Lincoln's 24/25 October telegram; 7,918 replacement horses sent) [U62 2.3].
- **Historical default (hidden: history runs and rule seats only)**: `go-see` (early October), `urge-by-letter` (13 October), then `relieve-after-elections` (5 November; Burnside took command 7 November) [U62 1, 2.3; CP 2.7].
- **Pushback**: an army devoted to McClellan [U62 4]; Burnside reluctant, having declined twice [U62 2.10]; Porter relieved with him [CP 2.7]; McClellan's first casualty return claims 30,000 Confederate losses [IF 3].
- **Verbs**: visit, pressure, relieve, appoint, inquire
- **Reports**: wire, casualty-return, enemy-estimate, effective-strength, observer-letter
- **Systems**: forces, people, politics, press
- **Gate**: none
- **Sources**: [U62 1, 2.3, 2.4, 2.10, 4]; [UP 3.1]; [CP 2.7, 3.3]; [IF 3]

### S54 `buell-east-tennessee`: East Tennessee

- **Window**: fires when a western army stops after a battle (Perryville, 8 October 1862; Buell's slow pursuit) while the government wants East Tennessee [U62 1, 2.12].
- **Live**: yes.
- **Staff recommendation**: general-in-chief (Halleck): advance into East Tennessee ("it is the wish of the Government", 23 October) [U62 2.12].
- **Options**:
  - `accept-his-plan` "Accept his own plan".
  - `order-east` "Set him the goal of East Tennessee". A goal.
  - `relieve` "Replace him" (Rosecrans [U62 1]).
- **Inaction**: `accept-his-plan`.
- **Historical default (hidden: history runs and rule seats only)**: `order-east`, then `relieve` (24 October) [U62 1, 2.12].
- **Pushback**: Buell's caution [U62 2.12]; a military commission examined him (unverified) [U62 2.12].
- **Verbs**: goal, relieve, appoint
- **Reports**: wire
- **Systems**: forces, people
- **Gate**: none
- **Sources**: [U62 1, 2.12, 3]

### S55 `river-squadron`: the river flotilla changes hands

- **Window**: fires when the law moving the Western flotilla from the Army to the Navy takes effect (act of 16 July 1862, effective 1 October) [UN 1, 4]. Historically Porter took the Mississippi Squadron on 15 October; Davis went to the Bureau of Navigation [UN 4].
- **Live**: yes, from the act to 1 October.
- **Staff recommendation**: Secretary of the Navy (Welles): needs-source on Porter's selection; [game] seat-derived.
- **Options**:
  - `another-officer` "Name another officer".
  - `keep-davis` "Keep the present commander".
  - `porter` "Give it to Porter" (energetic, ambitious, boastful in Welles's view [UN 4]).
- **Inaction**: the present commander keeps it [game].
- **Historical default (hidden: history runs and rule seats only)**: `porter` [UN 4].
- **Pushback**: a post changing departments changes whom its holder answers to [UN des. 1].
- **Verbs**: appoint
- **Reports**: informal
- **Systems**: navy, people
- **Gate**: none
- **Sources**: [UN 1, 4, des. 1]

### S56 `bond-agent`: a private agent for the bonds

- **Window**: fires when the Treasury's bonds do not sell: only $23.75 million of the five-twenties had come in by December 1862 [UE 1.3]. Historically Chase made Jay Cooke special agent in the autumn of 1862 (October, snippet) [UE 1.3].
- **Live**: no.
- **Staff recommendation**: Secretary of the Treasury (Chase): a private agent on commission [UE 1.3].
- **Options**:
  - `bank-syndicate` "Go back to the bank syndicate".
  - `more-notes` "Ask Congress for more notes" (needs Congress sitting; it was out 17 July–1 December [UP 1.5]).
  - `private-agent` "Hire a private agent on commission" (Chase [UE 1.3]).
- **Inaction**: the bonds keep stalling [UE 1.3].
- **Historical default (hidden: history runs and rule seats only)**: `private-agent` [UE 1.3].
- **Pushback**: the agent's commission (one-half of 1% on the first $10 million) is a cost the Treasury carries [UE 1.3]; Chase's forecasts missed by tens of percent [UE 1.2].
- **Verbs**: appoint
- **Reports**: advice
- **Systems**: economy, politics
- **Gate**: none
- **Sources**: [UE 1.2, 1.3, 6.2]; [UP 1.5]

### S57 `fredericksburg`: the crossing and the news (a chain in two stages)

- **Window**: stage A fires when the bridging train the commander was promised for mid-November is late (it arrived about 27 November 1862) [U62 2.10]; stage B when the battle's first wires and the front's silence arrive (13–14 December) [IF 2.4, 3; CP 3.2].
- **Live**: yes. In stage B, `see-the-reporter` appears when an informal source reaches Washington (Villard, brought by Senator Wilson on the night of 14 December) [CP 3.2].
- **Staff recommendation**: stage A, general-in-chief (Halleck): [game] seat-derived (responsibility for the pontoons is contested [U62 2.10]); stage B, Secretary of War (Stanton): keep the telegraph ban [IF 2.4].
- **Options, stage A**:
  - `ask-who` "Ask who held up the bridging". Inquire.
  - `change-crossing` "Change the plan's crossing". An arrow edit.
  - `wait-for-bridges` "Let him wait for them".
- **Options, stage B**:
  - `lift-ban` "Lift the telegraph ban on battle news".
  - `read-raw-wires` "Read the raw wires yourself". Going around the filter (0032).
  - `see-the-reporter` (appears) "See the reporter".
  - `wait-for-report` "Wait for the commander's report".
- **Inaction**: A `wait-for-bridges`; B `wait-for-report`, whose first figure is "might reach ten thousand" against nearly 13,000, with the army in "good condition" [IF 3].
- **Historical default (hidden: history runs and rule seats only)**: A `wait-for-bridges` [U62 2.10]; B `see-the-reporter` (Governor Curtin followed: "it was not a battle, it was butchery") [CP 3.2].
- **Pushback**: Burnside forbids wires and boats from the front; Stanton bars battle telegrams in Washington [IF 2.4]; wounded arriving in Washington tell the public first [IF 3].
- **Verbs**: inquire, review
- **Reports**: wire, casualty-return, press, informal
- **Systems**: forces, press, politics, people
- **Gate**: none
- **Sources**: [U62 2.10]; [IF 2.4, 3]; [CP 3.2]

### S58 `cabinet-crisis`: the senators and the cabinet

- **Window**: fires when a party caucus moves against a cabinet member after a defeat: the Senate Republican caucus against Seward (17 December 1862) [U62 1, 2.15]. Ends with the resignations accepted or refused (by 20 December) [U62 1].
- **Live**: yes. Chase's resignation appears after the 19 December meeting with the senators, where his complaints were exposed [U62 2.16]; Blair offered his too [U62 2.18].
- **Staff recommendation**: open; the cabinet is the subject (section 3, P5).
- **Options**:
  - `accept-seward` "Accept Seward's resignation".
  - `both-go` (appears) "Accept both".
  - `keep-both` (appears) "Refuse both resignations".
  - `meet-together` "Meet the senators with the cabinet present" [U62 2.16].
- **Inaction**: the resignation stands [game].
- **Historical default (hidden: history runs and rule seats only)**: `meet-together`, then `keep-both` [U62 1, 2.16].
- **Pushback**: Chase fed complaints to Republican senators while in the cabinet [U62 2.16].
- **Verbs**: audience, consult
- **Reports**: informal, memorandum
- **Systems**: politics, people, press
- **Gate**: none
- **Sources**: [U62 1, 2.15, 2.16, 2.18]; [UP 2.1]

### S59 `going-over-burnside`: generals go over their commander's head

- **Window**: fires when subordinates write or come to the president about their commander: Franklin and W. F. Smith propose a James River plan (20 December 1862); Newton and Cochrane say the army has no faith in Burnside (late December) [CP 3.4].
- **Live**: yes; ends in January with the commander's answer (his General Orders No. 8, which Lincoln did not approve, falls just outside the window) [CP 3.4].
- **Staff recommendation**: general-in-chief (Halleck): [game] seat-derived.
- **Options**:
  - `adopt-their-plan` "Attach their plan to a goal for the commander". A proposal (0040).
  - `hear-them` "Hear them out". An audience.
  - `hold-movement` "Tell the commander to make no general movement without word" (Lincoln's wire of 30 December [CP 3.4]).
  - `send-back` "Send them back to their commander".
- **Inaction**: `send-back` [game].
- **Historical default (hidden: history runs and rule seats only)**: a reply to Franklin and Smith (22 December) and `hold-movement` (30 December) [CP 3.4].
- **Pushback**: the commander moves to dismiss the men who went over his head [CP 3.4].
- **Verbs**: audience, goal, review
- **Reports**: memorandum, informal
- **Systems**: people, forces
- **Gate**: none
- **Sources**: [CP 3.4]

### S60 `davis-proclamation`: the Confederate proclamation on Butler and Black soldiers

- **Window**: fires when the Confederate government announces how it will treat captured officers and Black soldiers: Seddon's instruction (30 November 1862) and Davis's proclamation (23 December; General Orders No. 111, 24 December) naming Butler an outlaw, his commissioned officers "robbers and criminals deserving death", and enslaved men captured in arms to be delivered to the states [CS 4.4]. The chain runs past the window (Lincoln's retaliation threat of 30 July 1863) [CS 4.4].
- **Live**: yes, past the window.
- **Staff recommendation**: Secretary of War (Stanton): needs-source.
- **Options**: placement pending; [CS 4.7] proposes "narrated with locked consequences" and no "execute" option for either side. Union responses in 1862: needs-source.
- **Inaction**: the proclamation stands [CS 4.4].
- **Historical default (hidden: history runs and rule seats only)**: needs-source for 1862.
- **Pushback**: needs-source.
- **Verbs**: delegate
- **Reports**: press, informal
- **Systems**: politics, diplomacy, people
- **Gate**: Black soldiers and their treatment; prison camps
- **Sources**: [CS 4.4, 4.7]

## 2. Coverage

Counts come from each entry's tag lines. A situation can exercise several verbs, reports and systems.

### By year and system

| | Situations | Live | Gate-flagged | Forces | Navy | Politics | Press | Economy | Diplomacy | People |
|---|---|---|---|---|---|---|---|---|---|---|
| 1861 (S01–S30) | 30 | 26 | 11 | 14 | 7 | 22 | 9 | 9 | 6 | 21 |
| 1862 (S31–S60) | 30 | 23 | 9 | 16 | 4 | 20 | 7 | 5 | 3 | 24 |
| **Total** | **60** | **49** | **20** | **30** | **11** | **42** | **16** | **14** | **9** | **45** |

The catalogue marks needs-source in 46 places; the heaviest are S49 (Dakota), S60 (Davis's proclamation), S23 (Maryland arrests) and the historical defaults of S04, S32, S42, S50 and S52.

### Verbs (FOUNDATION section 5)

| Verb | Situations | Count |
|---|---|---|
| Appoint (including temporary posts) | S01 S06 S14 S19 S24 S25 S28 S35 S38 S40 S41 S43 S49 S51 S53 S54 S55 S56 | 18 |
| Set a goal | S01 S02 S06 S11 S12 S15 S21 S31 S38 S44 S47 S50 S54 S59 | 14 |
| Audience | S01 S02 S07 S08 S22 S25 S27 S31 S33 S42 S52 S58 S59 | 13 |
| Relieve | S14 S22 S24 S25 S28 S35 S39 S40 S41 S51 S53 S54 | 12 |
| Consult | S01 S03 S10 S19 S26 S30 S31 S34 S42 S46 S51 S58 | 12 |
| Delegate (0025, 0040) | S01 S03 S05 S13 S17 S23 S27 S48 S60 | 9 |
| Address | S04 S09 S18 S20 S29 S33 S45 S46 | 8 |
| Inquire | S01 S02 S04 S32 S36 S50 S53 S57 | 8 |
| Send an observer (including agents without posts) | S01 S05 S16 S24 S32 | 5 |
| Review a plan (approve, send back, edit arrows) | S21 S36 S47 S57 S59 | 5 |
| Pressure | S09 S29 S37 S53 | 4 |
| Transfer a force | S36 S41 S47 | 3 |
| Promise | S08 S16 S33 | 3 |
| Visit | S38 S42 S53 | 3 |
| Promote | S35 | 1 |
| Honour | S52 | 1 |
| Go (a held operation) | S01 | 1 |
| Proposals (0040) | S01 (Fox), S59 (Franklin and Smith) | 2, inside other verbs |

**Thin or absent**: promotion lists never appear as situations, which is right (0040 sends lists to the inbox), but the catalogue has no case where a list amendment is the interesting choice; `transfer` appears only three times because transfers are player-initiated, not caused; `go` appears once because only the Sumter expedition is held for the president's word in this window; `honour` and `promise` are barely used. A demo or tutorial that wants transfers and arrow edits must start where S36, S47 and S57 live.

### Report types (0032, 0040)

| Type | Situations | Count |
|---|---|---|
| Informal source | most entries | 44 |
| Press report | S01 S04 S13 S14 S18 S20 S21 S22 S26 S27 S28 S39 S40 S46 S48 S52 S57 S60 | 18 |
| Wire dispatch | S02 S06 S11 S12 S19 S21 S32 S34 S38 S42 S44 S47 S50 S53 S54 S57 | 16 |
| Advice | S01 S02 S09 S10 S19 S26 S29 S30 S31 S34 S43 S46 S47 S51 S56 | 15 |
| Memorandum | S01 S03 S07 S25 S42 S46 S51 S58 S59 | 9 |
| Observer's letter | S01 S05 S24 S53 | 4 |
| Strength return | S01 S31 S36 S37 | 4 |
| Enemy estimate | S31 S36 S53 | 3 |
| Casualty return | S21 S53 S57 | 3 |
| A commander's quoted "effective" strength | S36 S53 | 2 |
| Retrospective statement | none | 0 |

**Never exercised**: the retrospective statement, which belongs to the reckoning, not to situations. **Over-used**: "informal source" carries 44 of 60 entries, which says the informal route (callers, Seward's channel, governors, congressmen) is how most history reaches the president in 1861–62. Lane 0.6 should treat it as a family of sub-types (a cabinet member's word, a caller, a governor's wire, a senator) rather than one template.

### Systems and gate topics

- **Every system is exercised.** Diplomacy is thinnest (9) and front-loaded in 1861 (6), since Britain and France are clocks, not seats; the navy falls off in 1862 (4) once the blockade is routine.
- **Gate topics flagged (20 situations)**: slavery and emancipation (S15 S17 S20 S22 S28 S33 S39 S42 S45 S46), Black soldiers (S13 S28 S45 S60), civil liberties (S12 S18 S20 S23 S27 S48), civilians (S12 S14 S40), wars against Native nations (S49), prison camps (S60).
- **Gate topics never reached**: massacres of surrendered soldiers and the draft riots fall after 1862; **guerrilla war is inside the window and has no situation**. The notes record sabotage and executions in Missouri from July 1861 [SW 3.5, 6.7] and sustained guerrilla war from September 1861 onward [SW 6.7], but 0029 makes guerrilla war a regional pressure, not a decision, and nothing in the notes gives the president a lever over it in 1861–62 (see section 4).

### The strongest demo from a later scenario start (0040)

0040 puts the public demo at a later start with armies in the field, to show the desk, the audience and plan review. The catalogue offers two candidate starts.

**Recommended: early March 1862** (open the day the *Virginia*'s attack is reported, 8 March). In about six weeks of game time it runs S34 (a live cabinet crisis with stances on record), S35 (appointing corps commanders and relieving the general-in-chief), S36 (the showpiece: the commander's plan as arrows, an arrow edit and a transfer to keep a corps at Washington, with strength figures that disagree by measure), S32 (a report filtered by a superior, answered by Inquire or an observer) and S38 (a visit and a joint operation, through May). It uses every verb the demo is meant to sell, its pushback is caused and readable, and its gate exposure is one optional situation (S33), so the demo can ship before the gate-checklist lane has placed emancipation.

**The stronger arc, held back: 2 September 1862** (the day after the cabinet remonstrance). S51, S53, S46, S52, S54 and S57 give the densest pushback per week in the window (a cabinet petition, a visit, excuse reports, a relief timed against the elections, and a battle that reaches the president first through a reporter). It cannot be shown without the preliminary Emancipation Proclamation (S46), and leaving that out would itself be a framing the gate forbids (0021), so it waits for the gate's placement.

Also strong as single set pieces: S06 (around the chain or through it), S01 (a live clock built from disagreeing reports), S57 stage B (going around the telegraph filter).

## 3. Schema pressure: what these cases need that 0040 and FOUNDATION do not yet give lane 0.7

Ranked by how many situations need it.

**P1. Causes evaluated on the president's knowledge, not only on truth (needed by about 40).** Most situations should fire when news reaches the president, not when the event happens: S06 fires when Adams's refusal arrives (5 days after it happened), S32 only if Halleck's wire is passed on, S05 only through Pickens's telegram to Campbell, S57's reporter only when he reaches Washington. 0023 and 0040 give a cause predicate but do not say whose knowledge it reads. Proposal: two predicates per situation, a **truth cause** (what history runs and rule seats use, and what starts the clock) and a **surfacing condition** over the player seat's knowledge (FOUNDATION section 8's `viewFor`). Without it, situations either leak events the president cannot know or fire late in history runs.

**P2. Options that hold until a report or condition arrives (S46, S53, S01, S37).** "Hold it until a victory" (S46) and "relieve him once the elections are over" (S53) are choices to decide later on a named condition. 0040 has "prepare, await my word" for goals and `expiresWhen` for options, but no `holdUntil` for a situation's own decision. Proposal: an option may be a **deferral** with a predicate (a report type, a checkpoint, a chamber state) that re-opens the situation with a reduced option set; the deferral is a stance on record.

**P3. Several options at once (S06, S09, S35, S01).** History took two options together in S06 (the special expedition and Worden's courier), and S35 combines four War Order measures. 0040 assumes one choice. Proposal: options declare a compatibility group; the player may pick one per group; the attention cost is per decision, not per option (0040's "a decision includes the orders its option issues").

**P4. Chains and stages (S06 after S02; S05 after S03; S16, S28, S37, S46, S53, S57 in stages; S40 over seven months).** A stage is not a new situation: it shares the clock, stances and earlier choices, and its options depend on what the earlier stage chose. Proposal: a `chain` id, a `follows` reference to a parent outcome, and stage-scoped options; FOUNDATION section 10's `situations` row should own chain state.

**P5. The staff recommendation's author when the post is vacant or is the subject (S07, S35, S42, S43, S58).** The general-in-chief's post is vacant from 11 March to 23 July 1862 [U62 3], so every military staff line in that window has no author; S07 (Seward's memorandum), S42 (McClellan's letter) and S58 (the cabinet crisis) have the natural author as the subject. 0040 requires an authored recommendation. Proposal: each situation names an ordered list of author posts; if the first is vacant or is a party to the situation, the next authors it; if none is available, the card says so ("no staff line: the post is vacant"), which is itself information. The schema test should accept that explicit "no author" state.

**P6. Congress's chambers decide which options are legal, and leave obligations (S09, S13, S18, S20, S29, S33, S45, S56).** 0040 gives the chambers a state but not the two behaviours these cases need: an option's **legality** by chamber state (legal tender needs Congress sitting; the April 1861 call does not, but anything beyond the militia law must be answered for), and an **accountability ledger**: an act taken while Congress is away that resurfaces as a check when it meets (S09, S12's habeas order, S18). Also needed: bills that Congress passes on its own timetable and that arrive as situations for the president (S45), with a pocket rule (needs-source).

**P7. Orders an option issues, with recipients resolved when it fires (all).** Options issue goals, appointments (including temporary posts), notices, transfers, audiences and visits. The schema needs: a recipient named by **post**, resolved to its holder on the day (Cameron or Stanton); a **route** choice with a price (S06's courier against the usual ship); **going around the chain** as a property of the option, with the grievance (S06); and **notices to an enemy seat or official** (S01's notice to Governor Pickens, S03's written refusal, S05's disavowal), which no verb covers today.

**P8. Situations raised by another seat's act (S07, S22, S28, S37, S39, S42, S51, S56).** Seward's memorandum, Frémont's and Hunter's orders, Stanton's closure of recruiting, McClellan's letter and the cabinet's paper all come from a seat's initiative (0040's initiative menu). The schema needs a `raisedBy` seat, the act's text as typed data, and a standard **ratify / modify / revoke** option pattern, with public and private variants (S22's private request against a public order). An unrequested audience (Jessie Frémont, S22) should be a typed event that costs the president attention only if he grants it.

**P9. Delegation targets and declared versus actual choices (S01, S03, S05, S13, S17, S23, S27, S48, S60).** Each situation should list the posts it may be delegated to. A delegate's choice needs 0007's declared and actual rungs, because the best case in the window is Seward reporting his memorandum and not his assurances (S03).

**P10. Promises whose terms the record cannot settle (S08, S16, S05).** The offer to Baldwin exists in three versions [MF 13]. The schema needs an option whose consequence includes a hidden term (drawn at setup like 0020's stats, or fixed by the pack as "unknown to the player") so the player cannot verify what he promised.

**P11. An option whose outcome is a request, not a consequence (S01's `force`, S44's `ask-army`, S50).** Choosing "reinforce by force" should ask the general-in-chief for a plan, and the planner answers with a request for 25,000 men and six months [SW 2.1]. Options need an outcome type "request a plan or a report from a holder", which hands off to `plans` and `knowledge`.

**P12. A narrated kind, and gate metadata (S49, S60, and parts of S12, S14, S17).** Several gate placements are "narrated only" or "modelled with locked consequences, no options". 0040's schema test requires `inaction`, a historical default and a staff recommendation on every situation, which a narrated notice cannot meet. Proposal: two kinds, **decision** (the three required fields) and **notice** (text, locked consequences, no options); and on every situation a gate block (topic, placement, reviewer, status) that the build refuses to ship while the status is pending.

**P13. Consequences as typed proposals to owners (all).** Outcomes touch the framing term, chamber state, border loyalty, foreign patience, bloc support, will terms, standing agreements, a person's grievance. Under hard rule 5 an option cannot write them; it proposes typed deltas to each owner (FOUNDATION section 10's table). The schema needs a closed vocabulary of consequence types keyed to owners, so a pack cannot invent a writer.

**P14. The historical default as the player's choice, not the outcome (S11, S02, S06).** In S11 Welles ordered the yard defended and the commandant burned it. The default must be the president's choice; the outcome comes from the holders' seats. History runs then test whether the seats reproduce history, which is the calibration the harness wants (0023). Some defaults are compound (S06) or unknown (needs-source in S04, S32, S42, S50, S52); the schema test should allow a default marked "unsourced, pack must cite before ship".

**P15. Information options (S57, S04, S32, S36).** Some options buy knowledge, not effects: read the raw wires, see the reporter, ask who leaked, count the men left behind. They should be legal options priced by the attention table (0032's going around a filter), and the situation should stay open after them.

**P16. Inaction that unfolds over time (S01, S16, S26, S40).** Sumter's inaction is a process (stores fall, then surrender), not an instant result. `inaction` needs to be able to name a process with its own clock, owned by the module that owns the state (stores by `forces`).

**P17. Scenario starts in the middle of chains.** A March 1862 start (section 2) must begin with S27 resolved (Stone held), S28 resolved (Stanton in office), S24 resolved (Frémont relieved, about to get a department) and S31's order already missed. Each scenario start needs the state of open and closed chains, not only the world.

## 4. Gaps: situations the history needs whose mechanics the design lacks

Listed, not designed.

1. **The courts.** Merryman (S18) needs a judiciary that issues writs the executive can defy; no seat or post exists for it. The Prize Cases (1863) come later.
2. **Bills, votes and vetoes.** S20, S29, S33 and S45 need bills with sponsors, vote breakdowns by bloc, explanatory resolutions and signing or veto; `politics` has chambers but no bill object.
3. **Congressional investigations.** The Joint Committee (S27) arrests, leaks and protects; [UP] proposes an investigation seat. No post type covers a joint committee, and nothing models the arrest or detention of one's own officer (Stone) or a court-martial (Porter, cashiered January 1863 [CP 2.7]).
4. **Arrests of civilians and the habeas lever.** S12, S18, S23 and S48 need a security-order type beyond 0032's press and mail bans, with the gate's locked consequences.
5. **Recognising a government.** S15 needs a "recognised government" field ([SW] proposes it); regions have control, not legitimacy.
6. **Who holds an installation.** Arsenals and yards (Harpers Ferry, St. Louis, Gosport: S11, S14) change hands by a holder's act, not by control of the region.
7. **Mass resignation of officers.** 286 of about 1,080 army officers and 373 of 1,554 naval officers left over 1861 [SW 4.1, 4.4; UN 3]. No mechanic drains the officer pool and the posts on a timetable.
8. **Creating, merging and abolishing permanent posts.** War Orders 2 and 3 (S35), the Army of Virginia (S41), the Western Department's split [U62 1] and the Military Railroads [UE 5] create or abolish standing posts. 0040's "appoint may create a temporary post" does not cover permanent restructuring.
9. **A post changing department.** The Western flotilla moved from the Army to the Navy (S55); compliance then answers to a different chain.
10. **Messages to the enemy.** Notices to Confederate officials (S01, S03, S05) and later exchange talks have no verb; 0040 folds the Sumter notice into an option and leaves initiatives toward the enemy to seats.
11. **Foreign powers that act.** The *Trent* (S26) needs Britain to demand, deadline and move troops to Canada, and to ban saltpeter exports [UE 3.2]; a pressure clock does not issue ultimatums. Belligerency recognition (13 May 1861) is a foreign act too.
12. **Treasury instruments and a confidence meter.** S29 and S56 need loans, notes, specie suspension, a private agent's commission and a gold-premium meter ([UE 6.2] recommends one); `economy` has "money" only.
13. **Procurement choices and contracts.** S28 and S30 need contracts, agents, fraud and oversight (the House committee); divisions have equipment but nothing chooses what is bought or from whom.
14. **Raising versus refilling regiments.** S37 needs the governors' new regiments against the War Department's old ones ([UE 6.2]); check whether 0033's force blocks carry this before building it.
15. **Occupied cities.** New Orleans (S40) needs an occupation administration whose orders cause diplomatic incidents with consuls.
16. **Collective action by seats.** The cabinet's paper (S51), the Senate caucus (S58) and the governors at Altoona (S52) are several seats acting together; 0040's initiative menu is per seat.
17. **A resignation as a bargaining move.** Blair's near-resignation (S04), Seward's and Chase's (S58) and Burnside's refusals of command (S43, S51) use resignation or refusal as leverage; the ladder has no rung for it.
18. **Discretionary money.** The Pickens expedition was paid from the State Department's secret-service fund because Congress had made no appropriation [MF out 7]; nothing models a fund the president alone controls.
19. **The president's health.** Lincoln was "nearly exhausted" on 1 April 1861 [MF out 3]; attention has no health term, though 0025 allows one.
20. **Enemy reading of one's own mail.** From 29 March 1861 Anderson's letters were read by the enemy [MF 2]; 0032's symmetry covers leaks, but no route state marks a channel as compromised.
21. **Guerrilla war in Missouri.** In the window from July 1861 [SW 3.5, 6.7]; 0029 makes it a regional pressure, but no situation gives the president a decision about it, and the notes do not say what decisions he faced (needs-source).
22. **The Dakota War and Indian Territory.** Inside the first slice (FOUNDATION section 7) and refused until its own record [SW 6.8]; no research note covers 1862.
23. **Self-emancipation and policy replies.** S17, S22, S28, S39, S45 and S46 are policy replies whose effect should run through a derived self-emancipation term [CS 4.3, 4.7]; FOUNDATION states the principle but no module owns that term yet.

## Findings outside my scope

These are for the lead; this lane did not act on them.

- **Proposed amendments to 0040 (a superseding or amending record)**: P1 (truth cause and surfacing condition), P5 (an ordered author list and an explicit "no staff line"), P12 (decision and notice kinds, and a gate block with a ship-blocking status), P14 (the historical default is the president's choice; unsourced defaults are allowed until ship). These change the schema test lane 0.7 is told to write.
- **FOUNDATION section 10**: the field-to-writer table needs rows for chain state and deferrals (`situations`), the accountability ledger (`politics`), and the self-emancipation term (no owner yet).
- **`FIRST-MONTH.md`** still starts the Pickens situation on 4 March; 0042 and this catalogue start it on 5 March. A one-line correction is due when that file is next touched.
- **Research needed before authoring** (a Sonnet research lane): the Dakota War and Indian Territory in 1862; the Maryland arrests' cause (S23); Lincoln's responses in S04, S32, S42, S50 and S52; Bates's opinions on Merryman and the Restored Government; the 1862 Union response to Davis's proclamation; DC emancipation (April 1862), which no note covers beyond a mention [SW 6.3]; guerrilla war decisions in Missouri, 1861–62; the pocket-veto rule as it stood in 1862.
- **The gate-checklist lane** should take the 20 flagged situations in section 2 as its first worked cases, starting with S17 (whether a "return" option exists at all) and S46 (whether a demo can omit it).
- **Lane 0.6** should split "informal source" into sub-types (section 2).
