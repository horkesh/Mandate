# Presentation: the desk, the staff map and how a week plays on screen

Status: design lane output (2026-11-14), revised for 0049 and 0051 and for the standing reviewer's review (`review-presentation.md`); a proposal like everything in `docs/design/`. Nothing here is accepted until a decision record accepts it. It turns the parts the canon already fixes (the inbox, the audience, the org chart, the ledger and the staff map: 0013, FOUNDATION section 12's Phase 2; positioning in 0039) into screens, states, an interaction model and a storyboard. Its asset briefs are in `ASSETS.md`.

**How elements are marked.** **[canon: NNNN]** means an accepted record already fixes the element and this document only lays it out. **[proposed]** means this document introduces it. **[game]** in the storyboard marks what a seat or the kernel would compute. Facts about the world come only from the research notes and the catalogue (`SITUATIONS-1861-62.md`, cited by situation number), never from this lane's memory (L10). Where a period convention is needed and no note sources it, it is marked **needs-source** and listed for a research lane in section 9.

**The starting hypothesis and what changed.** The lead's candidate was one desk seen from above, the staff map in the middle, a tray of papers, a ledger, an org board, the calendar and the attention meter always visible, almost no modals, the audience as the one scene change, battles as dispatches, and a week that runs read, ask, set goals, review arrows, audiences, run. It survives in outline. It changes in ten places, each with its reason:

| # | Change | Reason |
|---|---|---|
| 1 | The map stays the largest object, but **the default focus is the paper you are reading**, which opens in a reading column beside the map, not on top of it, and lights the places it names. | The first-month walkthrough's stops are mostly reading (42 reports, 16 decisions in 11 stops); 0039 sells "the desk, the letters and the generals" first and the arrows second. A paper that hides the map loses the link between a claim and its place. |
| 2 | **Live situations get a docket rail of their own**, with their clocks always visible, instead of sitting in the tray. | Sumter is open for a month in the walkthrough and its clock is the month's engine (0040, FIRST-MONTH stops 2–10). A paper at the bottom of a tray hides a clock. |
| 3 | **A file and a daybook** join the desk: the file holds every paper read, searchable by author, subject and date; the daybook is the log of the days passing and the night of the battle. | 0027 shows the days of a turn passing as dispatches arrive; Grand Tactician's dispatch log is the closest precedent (games survey, findings). The hypothesis had nowhere to go back to. |
| 4 | The audience stays the **only scene change during play**, but the night of the battle and a visit are **desk states**, and the reckoning and the verdict are **screens outside the turn**. | Each has a different job: the battle night is reading at speed, a visit takes the president away from his desk (0025, 0041), the reckoning compares claims with truth (FOUNDATION section 6). |
| 5 | **Transfers are made on the org board, never on the map.** | A transfer names two commanders and a force (0033). Drawing it as a map arrow would look and feel like moving a division (hard rule 1). |
| 6 | **The ledger prints only authored estimates**, mostly as ranges, and has no meter for a derived term that touches a protected population. | Pillar 4 (every fact has an author) and the gate's E4 (`SENSITIVE-HISTORY.md` 2.2): self-emancipation is never drawn as a stock or bar. |
| 7 | **Signed orders wait in an out-tray** and can be recalled free until the days run. | Seats answer at turn boundaries (0027), so nothing has left the building yet; recall makes mistakes cheap without an undo stack. Needs lane 0.6 to confirm (section 10). |
| 8 | In plan review, **the same blue-pencil marks can be sent two ways**: as notes (send back, free) or as orders (edits, each a counter-order that costs attention). The interface never predicts the commander's reaction. | 0025 and 0040 make sending back free and editing costly; one set of marks makes the difference a choice, not a mode. A compliance preview would leak hidden stats (0020, 0022). |
| 9 | **A week does not run read, ask, goals, review in one sitting.** Plans come back at a later stop, because seats answer at turn boundaries (0027); Inquire and Consult go first because their answers take days and can end the turn early (0040). | The walkthrough's stops 2–4 and 6–7 have exactly this rhythm. |
| 10 | **Every screen is drawn at 3440×1440 first**, with side areas collapsing into drawers at 16:9 and the docket under the map rather than across the screen. | 0049 (owner's directive, added after the first draft). |

---

## 1. Screens and states

There is **one main screen, the desk** [proposed, from the hypothesis], plus one scene (the audience), two screens outside the turn (the reckoning and the verdict) and the setup screen. Everything else is a state of the desk. The desk is flat 2D, seen from above, not a room to walk around [proposed].

### 1.0 The display: ultrawide first

[canon: 0049] Every screen below is drawn first at the reference resolution, **3440×1440 (21:9)**, the owner's monitor. **16:9 (2560×1440 and 1920×1080)** is the secondary target and stays fully usable: the side areas collapse into drawers; the map never shrinks to make room. The extra width of 21:9 goes to the desk, not to stretched panels: the map holds the centre, the in-tray anchors to the left edge, the org board and ledger to the right, and **no single panel spans the full width** (so the calendar, the meter and the run button are separate objects, and the docket sits under the map only). **Papers, reports and dialogue keep a maximum line length** of about 70 characters (proposed figure); extra width goes to margins, portraits and the map. The desk runs at 144 Hz on the owner's hardware with a 60 Hz floor, and the map's lazy bake (0043) is measured at 3440×1440 [canon: 0049]. 16:10 down to 1280×800 is checked before release, not designed for [canon: 0049].

**Columns at 3440×1440** [proposed]: left edge 560 px (calendar, meter, in-tray, out-tray); reading column 760 px, present only while a paper is open (otherwise the map takes it); the map at least 1,460 px; right edge 660 px (org board, ledger, file, daybook, run button). At 16:9 the left and right edges become drawers with visible tabs and counts (the in-tray's unread count, the docket's nearest clock), and the reading column opens over the map's left part while the map pans to keep the lit place in view.

### 1.1 The desk at rest

At 3440×1440 [proposed]:

```
+--------------+---------------------------------------------------------------------+-----------------+
| Sat 8 Mar    |                                                                     | ORG BOARD       |
| 1862         |                                                                     |  posts, holders |
| up to 7 days |                                                                     |  (pinned cards) |
| ATTENTION    |                                                                     |                 |
| ■■■■□□ 4/6   |                         THE STAFF MAP                               |-----------------|
| refills      |            (fronts, washes, flags, pencil, arrows)                  | LEDGER          |
| Tue 11 Mar   |                                                                     |  (closed book)  |
|--------------|                                                                     |-----------------|
| IN-TRAY  (7) |                                                                     | FILE   DAYBOOK  |
|  ▣ wire      |                                                                     |                 |
|  ▣ letter    |                                                                     |                 |
|  ▣ return    |---------------------------------------------------------------------|                 |
|  ▢ front pg  | DOCKET [Hampton Roads ◷ 1–2 d] [War orders ◷ open] [Capital ◷ ...]  |                 |
| OUT-TRAY (2) |                                                                     | LET THE DAYS    |
|  signed      |                                                                     |      RUN ▸      |
+--------------+---------------------------------------------------------------------+-----------------+
   560 px                 map, at least 1,460 px (+760 when no paper is open)               660 px
```

At 16:9 (2560×1440, 1920×1080) [proposed]: the left and right edges become drawer tabs ("In-tray 7", "Board", "Ledger", "File"); the calendar, meter and run button stay pinned in the corners over the map; the docket stays under the map.

```
+--+-------------------------------------------------------------------------+--+
|In| Sat 8 Mar 1862   ■■■■□□ 4/6 refills Tue 11 Mar            LET THE DAYS RUN▸|Bd|
|7 |                                                                         |Lg|
|  |                          THE STAFF MAP (full width)                     |Fi|
|  |-------------------------------------------------------------------------|  |
|  | DOCKET [Hampton Roads ◷] [War orders ◷] [Capital ◷]                     |  |
+--+-------------------------------------------------------------------------+--+
```

- **Shows:** the calendar, the attention meter, the in-tray and out-tray, the staff map, the org board, the ledger (closed), the file and daybook (closed), and the docket of live situations.
- **Hides:** everything not authored by someone the president can hear from. There is no ground truth anywhere on the desk; the developer truth layer exists only in development builds [canon: 0013 item 5].
- **Always visible:** the calendar and the attention meter with the next refill date [canon: 0025, 0040]; the docket's clocks [proposed]; the button that runs the days [proposed name].
- **Rule:** every figure on the desk carries an author and a date, except the calendar and the president's own attention [proposed, from pillar 4 and 0032].

**The in-tray** is a stack of papers, newest on top, each showing its genre, its author, its route and its stamp (day, and hour on battle days) [canon: 0032 for the fields; proposed for the stack]. Unread papers are face up with a corner turned; read ones go to the file. Lists, promotions and routine returns arrive here and never end a turn [canon: 0040].

**The docket** is a rail of situation cards along the front edge of the desk [proposed]. A card stays there while its situation is live, with its clock drawn as a range (section 2.3) [canon: live situations, 0040]. A notice situation (no options) arrives in the tray as a paper, not on the docket [canon: two kinds, 0046; proposed placement].

**The org board** is a cork board of posts, each with its holder's card pinned to it (section 1.5).

**The ledger** is a bound book that opens forward (section 1.6).

### 1.2 Reading a paper

Clicking a paper, or pressing Space for the next unread one, slides it forward into the **reading column**, between the tray and the map. The map stays visible and dims slightly; the places the paper names are outlined on it in blue pencil and their names underlined in the paper; hovering one does the same in reverse [proposed].

At 3440×1440 [proposed]:

```
+--------------+-------------------------------+---------------------------------------+-----------------+
| calendar     |  [telegraph form header]       |                                       | ORG BOARD       |
| meter        |  place · date · hour           |       STAFF MAP (dimmed)              |                 |
|--------------|  To: ...                       |       the places the paper names      |                 |
| IN-TRAY  (6) |  ............................  |       outlined in blue pencil         |-----------------|
|              |  (at most ~70 characters a     |                                       | LEDGER          |
|              |   line; the column widens its  |                                       |                 |
|              |   margins, never its lines)    |                                       |-----------------|
|              |  [route: wire, via ...]        |                                       | FILE   DAYBOOK  |
|              |  [author card]  [subject ▸]    |---------------------------------------|                 |
|              |  Refer to ▸  Ask him ▸  File   | DOCKET [...] [...]                    | RUN ▸           |
+--------------+-------------------------------+---------------------------------------+-----------------+
      560                 760                              map 1,460                         660
```

At 16:9 [proposed]: the reading column opens as a drawer over the left of the map at the same width; the map pans so the lit places stay visible beside it.

(The header text is placeholder layout; real forms come from the document templates in `ASSETS.md`, built on period conventions a research lane sources.)

- **Shows:** the paper in its genre's form; its author's card (portrait thumbnail, post, the staff's note on his reliability as an adviser or reporter); its route and the filters it passed, where the player can know them (for example "held two days at the War Department" only if the president has learned it) [canon: 0032]; disputed numbers as ranges with their sources [canon: gate F4].
- **Hides:** the bias terms themselves, the true reasons behind a man's statement [canon: 0022, FOUNDATION section 8], and any filter the president has not discovered.
- **Actions on a paper** [proposed placement; verbs canon in FOUNDATION section 5]: file it; refer it (delegate, where it is a decision); ask its author or anyone about its subject (Inquire, free); open the person's card; open the situation it belongs to.
- **No modal:** a paper opens in place and Esc puts it down [proposed, from the hypothesis]. The only blocking confirmation in the game is ending a turn with unanswered non-live situations (section 1.8).

### 1.3 The audience

The one scene change [proposed, from the hypothesis]. The desk slides back and the visitor sits across it: his portrait, large, on the far side; his case on the left as numbered reasons; the president's counters on the right; his standing and the staff's assessment as a small card under the portrait [canon: the audience and typed counters, FOUNDATION section 5 and M2; proposed layout].

At 3440×1440 [proposed]: the visitor's portrait holds the centre at about 720 px tall; his case and the president's answers sit either side at reading width; the outer margins show the desk's edge, not stretched text.

```
+--------------+------------------------------+-------------------------------+------------------------------+-----------+
| (desk edge,  |  HIS CASE                    |                               |  YOUR ANSWER                 | meter     |
|  calendar)   |  1. "The capital is safe..." |         [ PORTRAIT ]          |  ▸ The order stands          | ■■■□□□    |
|              |     reason: enemy estimate,  |          ~720 px tall         |  ▸ I will give you ...       | cost 1    |
|              |     from his intelligence    |                               |  ▸ Put it in writing         | (spent)   |
|              |     chief                    |   Maj. Gen. ..., Army of ...  |  ▸ We will speak again       |           |
|              |  2. "..."                    |   staff assessment: (band)    |                              |           |
|              |                              |   standing · stances (2)      |                              |           |
|              |------------------------------+-------------------------------+------------------------------|           |
|              |  What he said is entered in the file. What he will do, you will learn from what he reports.    |           |
+--------------+------------------------------------------------------------------------------------------------+-----------+
```

At 16:9 [proposed]: the desk-edge margins drop and the meter moves above the answers; the case and answer columns keep their reading width, and the portrait shrinks to about 560 px tall at 1920×1080.

- **Shows:** his stated reasons as typed terms rendered from the string table, each with its source where he cites one; the counters the kernel allows; his answer to each counter as his declared rung [canon: 0007, FOUNDATION section 6].
- **Hides:** his actual rung, his true reasons, his hidden stats [canon: 0020, 0022].
- **Ends:** with a short line in his voice and a paper in the file recording what was said [proposed]. There is no "success" banner; the result is whatever he later reports [proposed, from pillar 4].
- **Portrait:** for a real person, his cited public-domain photograph itself, cropped and toned by ordinary processing, never an invented or AI-edited likeness [canon: 0048, 0051]; a photograph taken after the scenario's start date carries its date in the caption; for a generated officer, an invented face from the generated library; otherwise a card saying no likeness is on file (`ASSETS.md` briefs 6 and 7) [proposed].

### 1.4 Plan review on the map

When a plan is ready for review (a decision point, 0027), its paper arrives in the tray with a docket mark, and opening it brings the **map forward**: the reading column holds the plan sheet, the map shows the plan's arrows at full strength, and everything else on the map dims [proposed].

At 3440×1440 [proposed]: the plan sheet takes the reading column; the in-tray stays at the left edge; the right edge shows the commander's card and the supporting holders' cards instead of the board, so the people behind the arrows stay in view.

```
+--------------+-------------------------------+------------------------------------------------------+---------------+
| IN-TRAY      | PLAN  Army of the Potomac     |                                                      | HIS CARD      |
| (dimmed)     | for: [the goal you set]       |     ===hatched arrow (axis 1)===>  objective         | portrait,     |
|              | drafted by his staff, 11 Mar  |              \                                       | assessment    |
| meter        | axes:                         |               \==axis 2==> (support request: Navy)   |---------------|
| ■■■■□□       |  1. ... divisions (his choice)|                                                      | SUPPORT ASKED |
| marks: 2 = 2 |  2. ...                       |     blue pencil: your marks, numbered (1) (2)        | Navy: [card]  |
|              | phases: [timeline strip]      |                                                      |  "agreed"     |
|              | his reasons (inline)          |                                                      |               |
|              |-------------------------------|                                                      |               |
|              | Approve (free)                |                                                      |               |
|              | Send back with notes (free)   |                                                      |               |
|              | Order these changes (2 = 2)   |                                                      |               |
+--------------+-------------------------------+------------------------------------------------------+---------------+
```

At 16:9 [proposed]: the side columns become drawers; the plan sheet stays open over the map's left; the map keeps full height.

- **Shows:** the commander's draft as broad hatched arrows, one per axis, with his inline reasons [canon: 0013 item 2, 0016, FOUNDATION section 5 "reasons shown inline"]; the divisions he assigned to each axis as a list on the sheet, never as draggable pieces [canon: 0016, 0026]; phases with timings as a strip [canon: 0016]; support requests to other posts as dotted arrows labelled with the post asked [canon: 0016 joint operations; proposed style].
- **The president's marks** are blue pencil [canon: 0013]: drag an arrowhead to another region (an axis's objective), drag a route handle to a waypoint region, nudge a phase on the strip (timing), strike an axis or draw a new one to an objective, or ask for a force size in the margin [canon: the edit grammar, 0026]. A route between waypoints is drawn only when the kernel has validated it; the shell never routes [canon: 0026, kernel owns movement; proposed display].
- **Two ways to send the marks** [proposed]: "Send back with notes" (free: the commander reads them like any order and redrafts by his own judgement) or "Order these changes" (each mark is an edit, a counter-order through his compliance, costing attention per the pack table) [canon: 0025, 0040 for the costs].
- **Never shown:** a prediction of how he will take an edit, or a score of how far it departs from his judgement [proposed rule]. Where his chief of staff or another holder volunteers a warning, it arrives as an advice paper [canon: advice, 0040].
- **Approve as drafted unless he objects** and **prepare, await my word** are set on the goal, not here, but an approved plan held for the word shows a Go button on its docket card, which is free [canon: 0040].

### 1.5 The org board

A cork board of posts, nested as the pack nests them (military divisions above departments, departments above armies and corps, an army and its department often one post) [canon: 0033 posts nest; proposed board]. Each post shows its holder's card; a vacant post shows an empty pin and the words "vacant since …" [proposed, from SITUATIONS P5].

The board lives at the right edge at rest; opened, it widens leftward over the map to about 1,400 px at 3440×1440 (a board, not a full-width panel), and at 16:9 it opens as a drawer of the same width [proposed].

```
+----------------------------------------------------------------------------+
| ORG BOARD           [Cabinet] [Army] [Navy] [States] [Temporary]           |
|                                                                            |
|  War Department ── Sec. of War [card]                                      |
|        │                                                                   |
|        ├─ Army of the Potomac [card]  ── I Corps [card] ── II Corps [card] |
|        ├─ Dept. of the Missouri [card]                                     |
|        └─ General-in-chief: vacant since 11 Mar                            |
|                                                                            |
|  Person card (open): portrait, post, assessment band with its sources,     |
|  standing, stances on record, last report, observers attached              |
|  [Goal ▸] [Ask ▸] [Audience ▸] [Observer ▸] [Transfer from ▸] [Relieve ▸]  |
+----------------------------------------------------------------------------+
```

- **Verbs launched here** [canon: FOUNDATION section 5; proposed placement]: appoint (including creating a temporary post), relieve (with its modes: to a quiet department, "at his own request", outright), promote, send an observer (to any rostered person's headquarters; a person without a post can be sent), set a goal, audience, Inquire, honour, promise, pressure, and **transfer**.
- **Transfer** [canon: 0033; proposed form]: pick the sending holder's card, then the receiving one; the form asks for a force (a number of divisions, a corps, or a strength in men) and shows men as well as unit counts. The sending commander chooses which units go. A corps moves with its commander. Nothing is drawn on the map until reports place the units.
- **Promotion lists** arrive in the tray, not on the board; approving as drafted is free, each amendment costs 1 [canon: 0040].
- **The person card** shows the staff's assessment as a band in words with its sources listed, converging as he fights [canon: 0020], never a true stat. It shows his public standing, his stances on record [canon: 0040, 0041] and, for an adviser, a credibility note derived from what the president has seen [canon: 0041, derived; proposed wording].

### 1.6 The ledger

A bound book that opens forward over the map as a two-page spread about 1,500 px wide at 3440×1440, each page at reading width, with the map visible either side; at 16:9 the spread covers the map's centre and closes with Esc [proposed]. Each page is a table of the staff's figures, each row signed and dated. Pages:

| Page | Contents | Status |
|---|---|---|
| Treasury | money as the Treasury reports it; loans placed and their terms | canon (money, 0023); layout proposed |
| Men | strength returns by army, present for duty and present and absent side by side; the quoted "effective" figures marked as the commander's | canon (0032) |
| Munitions and rail | what the War Department reports equipped; rail capacity on the main lines as reported | canon (0023) |
| Gold premium | the market's premium on gold as a confidence reading | **proposed**, pending the economy design (the catalogue's gap 12 cites the war-economy note's recommendation) |
| Blocs | each bloc's support as the staff reads it, from papers and callers, as a band | canon (blocs, FOUNDATION section 7); bands proposed |
| Will | the Union's and the enemy's will, each as the staff's estimate with its reasons, as a band | canon (two wills, 0028); bands and authorship proposed |
| Elections | the next checkpoint and the staff's reading of it | canon (FOUNDATION section 7) |
| Foreign | Britain and France as the Secretary of State reports them | canon (pressure clocks, FOUNDATION section 7) |

- **Hides:** true values; the historical default; any derived term the gate places as protected, which appears only inside explanations with its agency reason, never as a row to raise [canon: gate E4, E5].
- **Explains:** clicking any figure opens its terms and their sources (hard rule 6) [canon: hard rule 6; proposed interaction].

### 1.7 The file and the daybook

- **The file** is a drawer of everything read, grouped by situation, by person and by date, searchable [proposed]. Stances on record are tabbed under each person [canon: 0040].
- **The daybook** is the log of days passing: one line per paper as it arrived, stamped [proposed, from 0027 and Grand Tactician's dispatch log]. On a battle night it becomes the dispatch log (section 1.9).

### 1.8 Turn flow and stops

```
 between turns: act           LET THE DAYS RUN ▸            a stop
 (read, ask, decide,   ──►  calendar pages turn; papers  ──►  "Why we stopped" slip on top
  sign orders)              drop into the tray by stamp;     of the tray; the desk waits
                            the daybook fills
```

- **Running the days** [canon: 0027]: the calendar turns one day at a time; papers arrive in stamp order and drop into the tray; the map's pencil changes as reports land. Speed is a setting (instant, brisk, slow) and Space skips to the stop [proposed].
- **A stop** shows a slip on top of the tray naming why the game stopped: an objection or refusal, a battle report, a pocket closed, a pocket's stores crossed their threshold, a situation needs you, a live situation's option expired or appeared or its clock crossed a threshold, a plan is ready, or (if the player chose it) a report he asked for has arrived [canon: FOUNDATION section 9, 0040]. The slip links to the paper [proposed].
- **Never a stop:** lists, promotions, routine returns [canon: 0040]; a plan whose goal says "approve as drafted unless he objects", unless he objects or departs far from the goal [canon: 0040].
- **Stop settings** live on the setup screen and in options: which events end a turn, within the pack's maximum turn length [canon: 0027].
- **Before the days run** [proposed]: if a non-live situation has no answer, the button asks once: "These will take their course: …" and lists them. A live situation is not ignored by waiting; it stays on the docket until its clock runs out, then its `inaction` outcome applies [canon: inaction, 0040; the end-of-turn rule is proposed and needs lane 0.7, section 10].
- **The out-tray** [proposed; confirmed workable by lane 0.6's seat API, where a command enters the log only when the shell hands the day's entries to the tick]: the shell holds signed orders there until the days run, and they can be recalled free; once the days run, they are gone. Audiences and Consult are not orders in transit and happen when held.
- **Away on a visit** [canon: 0025, 0041; proposed state]: the desk shows a field-desk banner ("At Fort Monroe since 6 May; business goes to Mr …"), papers that would have reached Washington go to the named delegate or, with none, take their course, and the visit's first-hand reports arrive as observers' letters from the army's officers [canon: 0026: better than dispatches, not the truth].

### 1.9 The night of the battle

A desk state, not a cutscene [canon: 0027, FOUNDATION section 9]. The map closes in on the battle's region; the daybook opens beside it as the dispatch log; the calendar shows the hour.

At 3440×1440 [proposed]: the dispatch log takes the reading column; the left edge shows the hour on the calendar; the right edge holds the cards of the commanders engaged, each with his last dispatch's time, so silence from one man is visible at a glance.

```
+--------------+-------------------------------+------------------------------------------------------+---------------+
| CALENDAR     | DISPATCH LOG  (battle day 1)  |                                                      | ENGAGED       |
| 9 Mar        |  7:40 am  wire, Gen. ...      |     STAFF MAP, battle region                         | Gen. A [card] |
| 3:05 pm      |   "Engaged at ... all well"   |     pencil marks appear as each dispatch is read;    |  last: 10:15  |
|              |  10:15 am wire, ...           |     contradictory reports both drawn, each signed    | Gen. B [card] |
| IN-TRAY      |  noon  — nothing on the wire —|                                                      |  last: 7:40   |
| (held until  |  3:05 pm  press, reporter ... |                                                      |               |
|  morning)    | [▶ play] [next] [to morning]  |   Wire an order ▸  (arrives for a later day)         |               |
+--------------+-------------------------------+------------------------------------------------------+---------------+
```

At 16:9 [proposed]: the engaged commanders become a row of small cards along the top of the map.

- **Shows:** each dispatch at its hour stamp, in the order it reached Washington; silence as empty hours [canon: "fragments, contradictions, silence", VISION and 0027; proposed rendering]; the map's pencil from those dispatches only.
- **Orders** wired during it are ordinary commands that arrive for a later day of the battle or after it, and the form says so [canon: 0026, 0027].
- **Hides:** the resolved day's truth. The battle is resolved in the day tick; the playback never reveals more than the dispatches say [canon: FOUNDATION section 9].

### 1.10 The reckoning

A screen outside the turn, offered after each major battle (optional) and at campaign end [canon: FOUNDATION section 6]: two columns, "what you were told" (the reports, signed and dated) and "what happened" (this game's truth, and the retrospective statements), with the map shown twice, staff map against truth [proposed layout]. This is the one screen that uses 21:9 for two maps side by side (each about 1,600 px); at 16:9 the two maps share one frame with a slider between them [proposed]. It is the only place truth is ever drawn in a shipped game [proposed, from 0013 item 5 and FOUNDATION section 6].

**Retrospective statements are attributed claims, never the game's explanation** [proposed, from the gate review's G4; canon for the rules it applies: `SENSITIVE-HISTORY.md` F3, H4, Q10, Q12, A6]. Each carries its speaker and citation (F3) and sits in the "what you were told" column's register, beside "what happened" but never as its caption or summary. They fall under the disputed-thesis list (H4) and Q10 and Q12. A statement drawn from a memoir the checklist bans as evidence (A6) appears, if at all, only as an attributed claim, and never in the "what happened" column.

### 1.11 The verdict

The end screen: which will broke and why, as typed terms, with the gate's required clauses [canon: 0026, 0028, gate H1–H3; R5 pending]. Text only, set like a printed proclamation page; no score, no grade [canon: gate H5, Q5].

### 1.12 Setup and the history modes

At 3440×1440 the setup form is a single sheet of reading width (about 900 px) centred on the desk, with the scenario's opening map plate to its right and the cast's portraits to its left; at 16:9 the plate and portraits drop below the sheet [proposed].

```
+--------------------------------------------------------------------------+
| NEW GAME                                                                 |
|  Start:  ( ) 4 March 1861: the inauguration       [canon: 0028]          |
|          ( ) early March 1862: armies in the field [demo start, 0046]    |
|  People: (•) history's shadow  ( ) as history  ( ) unknown men [0020]    |
|  Stops:  [x] objections [x] battle reports [x] pockets [x] plans ...     |
|          [ ] a report I asked for has arrived                  [0040]    |
|  Voice:  templates   (AI voice: non-Steam builds only)         [0038]    |
|  Seed:   4D414E44  (shown, editable)                           [proposed]|
|  Presentation and accessibility ▸                              [section 5]|
+--------------------------------------------------------------------------+
```

- **History modes change only people's stats** [canon: 0020; gate G3].
- **No setup option removes, softens or toggles a gate topic** or varies a premise item such as the inaugural [canon: gate G1, G2; 0042].
- **Presentation options never change the state hash** of a seeded run [canon: gate G4].
- **The opening briefing** is a paper, the first in the tray, not a tutorial overlay: who holds what, what the map shows, and the premise text the gate requires [canon: cause-of-secession and inaugural text facets, `SENSITIVE-HISTORY.md` 3.1; proposed form].

---

## 2. The interaction model

### 2.1 Attention

The meter is a row of tokens on the blotter, spent ones struck through, with "refills Tuesday 11 March" beside it [canon: weekly refill, no carry-over, refill date shown: 0025, 0040; proposed form]. Hovering or focusing any action shows its price on the meter before it is taken: the tokens it would strike glow, or the word "free" appears [proposed].

| Action | Cost | Status |
|---|---|---|
| Read, file, pause, run the days | free | canon (0025) |
| Approve a plan as drafted | free | canon (0025, 0040) |
| Send a plan back with notes | free | canon (0040) |
| Accept the staff recommendation on a situation | free | canon (0040) |
| Overrule it (choose another option) | 1 | canon (0040) |
| A situation decision's own orders | included in the decision | canon (0040) |
| Approve a promotion list as drafted / each amendment | free / 1 | canon (0040) |
| Inquire | free (repeated inquiries cost the man's patience, not attention) | canon (0040) |
| Consult | 1 | canon (0040) |
| Go (a held operation) | free | canon (0040) |
| Delegate a decision | free | proposed, following FIRST-MONTH's assumption; 0025 lists it as an outcome, not a price |
| Ignore (let it take its course) | free | proposed, as above |
| Set a goal, edit an arrow, transfer, audience, appoint or relieve, send an observer | pack cost table | canon (0025, 0040); amounts are pack data |
| Go around the telegraph filter (read the raw wires) | pack cost table | canon (0032) |
| Visit | days away, not attention | canon (0025) |

- **Out of attention** [proposed]: costed actions stay visible but are drawn in faint pencil with "after Tuesday's refill"; free actions, delegation and ignoring remain. Nothing is hidden, so the player learns what attention buys.
- **The price is shown, never the effect** [proposed]: the meter tells what an act costs Lincoln, not what it will make a man do.

### 2.2 Ordering through people

A verb may name a place only as part of an order to a person [canon: 0016]. The interface enforces it [proposed]:
- **The map has no verbs of its own.** Clicking a region outside an order opens a "what we know" note: its claimed control with sources, the last reports about it, and an "Ask about this ▸" button (Inquire names a place only as a subject) [canon: Inquire, 0040].
- **A goal is a form on a person.** It opens from his card (board, map flag or paper). The objective field accepts a region, a force or a line picked on the map while the form is open; posture, risk, deadline, permissions (rail, river, sea), the divisions committed (as a force size), "approve as drafted unless he objects" and "prepare, await my word" are fields on the form [canon: 0016, 0040; proposed form].
- **Signing** an order puts it in the out-tray and spends its attention [proposed].
- **Orders down a chain** show their route on the form ("through the Secretary of the Navy and the flag officer"), with "send direct to …" as an alternative that warns of the bypassed man's grievance; a special messenger or fast ship is a route with a price [canon: 0040; proposed form]. Before signing, the form shows each route's **typical days** (without weather) and **price** from the principal's menu (`RouteOption.typicalDays`, `price`) [canon: lane 0.6's seat API]; after signing, nothing tracks the message, because the view has no transit fields; the shell computes no arrival [canon: 0026].

### 2.3 Live clocks and expiring options

- **A clock is a range, not a countdown** [proposed, from FIRST-MONTH stops 2–3]: drawn on the docket card as a short calendar strip with each source's estimate as a signed tick ("Anderson: 28 Mar–11 Apr", "Scott: 7–29 Apr"), the overlap shaded. As reports arrive the range moves. When its threshold is crossed, the turn stops [canon: `resurfaceOn`, 0040].
- **Options on a live card** are listed in their pack display order [canon: gate C2, 0041], each in its advisers' own words with the advisers named [canon: 0041, gate C1].
- **An option that may lapse** carries a small mark and, where an adviser has said when, his estimate (for example a garrison commander's "about a week longer", as Anderson wrote of his rations on 1 April 1861 in the secession-winter note). The true expiry condition is never shown [proposed; `expiresWhen` is canon in 0040]. When it lapses, the turn stops and the option is struck through with the reason as a paper [canon: 0040].
- **An option that appears** is written in a different hand at the bottom of the card, dated [proposed].
- **The staff line** sits under the options: "Staff: Mr Stanton (Secretary of War) advises …", with his reasons. If the post is vacant or its holder is the subject, the next post in the ordered list writes it; if none can, the card says "No staff line: the post is vacant", which is information [canon: authored recommendation, 0040; ordered list, 0046; wording proposed].
- **The historical default is never on screen** and the presenter cannot read it [canon: 0040, gate B9].
- **Several options at once**: where the pack allows options to combine, the card shows them as checkboxes in their group; the decision costs once [canon: 0046 several options; proposed display].
- **Waiting options** ("hold it until a victory") show as a stance pinned to the card with its condition [canon: 0046 waiting options].

### 2.4 Deciding, delegating and ignoring

Three outcomes kept apart [canon: 0040], three visible acts [proposed]:
- **Decide:** pick an option and sign. The card leaves the docket with a stamp ("Decided 29 Mar") and goes to the file.
- **Delegate:** "Refer to ▸" a holder from the situation's list of delegation posts. The card is stamped "Referred to Mr Seward, 5 Mar" and moves to that man's card on the org board, where it stays visible as his. What he chose comes back as his report, which may not be the whole of what he did [canon: delegation by the holder's values, 0040; declared and actual, 0007].
- **Ignore:** "Let it take its course" stamps the card and applies the `inaction` outcome; on a live card, waiting is not ignoring (section 1.8) [canon: inaction, 0040; proposed acts].

### 2.5 Inquire and Consult

- **Inquire** [canon: 0040]: "Ask ▸" from any person, paper or map note; choose a subject (a force, a region, a battle, the enemy, a situation). It travels like an order (out-tray, route) and returns as his report. The form notes "you asked him twice this week" when patience is at stake [proposed].
- **Consult** [canon: 0040]: "Ask in writing ▸" from a docket card; the default set is the cabinet, editable. The answers arrive as advice papers clipped under the card with a tally strip; each is a stance on record, tabbed on the man's card [canon: 0040, 0041; proposed display]. "A report I asked for has arrived" can stop the turn if the player chose it [canon: 0040].

### 2.6 Keyboard and mouse

Every act is reachable from the keyboard and every keyboard act from the mouse [proposed]. Defaults, all rebindable:

| Key | Act |
|---|---|
| Space | open the next unread paper; while the days run, skip to the stop |
| ↑ ↓ or K J | previous / next paper in the tray or list in focus |
| Enter / Esc | open / put down |
| F | file the open paper |
| R | refer (delegate) |
| I | ask (Inquire) |
| A | approve (a plan, a list) |
| N | send back with notes |
| S | sign the open order |
| D, B, L, M, G | focus docket, org board, ledger, map, file |
| Ctrl+G | go to a region or person by name |
| W A S D, arrows (map focus) | pan; + / − zoom; 0 fit |
| Tab / Shift+Tab | move between desk regions in reading order |
| Ctrl+Enter | let the days run |
| ? | the key card |

Mouse: wheel zooms the map at the cursor; drag pans; right-click on a person, paper or region opens its verbs; drag a paper onto a person's card to refer it or ask him about it [proposed].

---

## 3. The staff map's visual language

The map is the staff's map on the president's desk, drawn only from what the faction has been told [canon: 0013]. It never shows ground truth [canon: 0013, FOUNDATION section 4].

### 3.1 What it draws

| Layer | Drawn as | Status |
|---|---|---|
| Base: coast, water lines, rivers, relief, towns, rail, roads | baked once per scenario, in the era skin (1862: ink on linen, hachured ridges, engraver's water lines, miles) | canon (0013, prototype `map-style`) |
| Regions | irregular, roughened borders from seeded noise | canon (0019, 0035, 0043) |
| Claimed control | washes in the faction's and the enemy's colours, strength of wash from claimed permille, hatched where contested; **Native nations' lands are labelled with the nations' own names and no wash hides those labels** (how nations are represented beyond that waits for R3) | canon (0013 derived from claimed control); wash rules proposed; the Native-lands rule proposed, from the gate review's G7 |
| Fronts | a heavy line with teeth toward the enemy, segment by segment: ink where confirmed by more than one source, pencil where it rests on one report | canon (0013 items 1–2) |
| Pockets | the staff's own reading: a friendly area ringed in pencil with "no supply path (staff)", derived from **claimed** control and from reports with an author, never from the kernel's pocket index over true control | canon (the staff map draws from claims, 0013 item 2); derivation from claims and style proposed |
| Supply | "the line to X is open / cut at Y" as the staff reads it from claimed control and from signed reports, drawn on the rail and road lines with a cut mark and its source; never the kernel's true supply path | canon (0013 item 2; FOUNDATION section 4 for what supply is); derivation from claims and style proposed |
| Own forces | a headquarters flag per post at its **last reported position**, labelled with the holder's name, the last reported strength, and the report's date and author; it fades like any pencil as the report ages; a corps under its army's flag. The true position exists only in the developer truth layer | canon (posts, 0016; truth layer, 0013 item 5); flags proposed |
| Enemy | pencilled estimates: a shaded area or a figure range, each signed by its author and dated ("Pinkerton: 100,000–120,000", his Yorktown figure in the information-flows note); **estimate signs only: no Confederate flag, seal or emblem as a marker** (`ASSETS.md` section 0.3) | canon (pencil for single reports, 0013); style proposed; the no-symbol rule proposed, from the gate review's G2 |
| Plans | broad hatched arrows per axis; a draft outlined, an approved plan filled, an operation under way solid | canon (0013 item 2, 0016); draft/approved distinction proposed |
| The president's marks | blue pencil: edits, notes, orders | canon (0013 item 1) |
| Corrections | red strike-through over the original, initialled by the correcting source (an observer, an inspector) | canon (0013 item 1) |
| Orders sent | **not drawn on the map.** The president's view carries no transit fields (lane 0.6's boundary test), so he cannot know where a courier is. Sent orders appear in the out-tray's record and the daybook ("sent 8 Mar by courier; typically 3 days"), from the shell's own record and the menu's `typicalDays`, and an acknowledgement appears when its report arrives | canon (kernel latency, 0026; the seat API's view); display proposed |
| Notes | pencilled marginal notes with author and date beside each single-source claim | canon (0013 item 1) |
| Ornaments | cartouche, compass, scale bar, seals per pack | canon (0013 item 3) |

### 3.2 What it never draws

- ground truth of any kind, including the president's own forces' true positions, strengths or stores [canon: 0013, FOUNDATION section 4];
- a counter or piece the player can drag, or any target picked outside an order to a person [canon: 0016; proposed rule];
- a figure without an author and a date [proposed, from pillar 4];
- a transfer as an arrow (transfers live on the org board) [proposed];
- a hex, a grid or a zone of control [proposed, from 0019];
- a compliance prediction or an edit-distance score [proposed; the seat API's principal menu carries no such field];
- a pocket, a cut or open line, or a position derived from truth rather than from claims and signed reports [canon: 0013];
- a message's position on its route [canon: the seat API's view has no transit fields];
- a derived term the gate protects, as a layer or heat map [canon: gate E4].

### 3.3 Uncertainty and staleness

- **Ink, pencil, fade** [canon: 0013]. A claim with two or more independent sources is ink; one source is pencil, with author and date beside it; information ages and fades. **Proposed rule for fading**: a mark fades in three steps as it ages past pack-set thresholds (the prototype used "older than two weeks" as its one step), and a mark superseded by a newer report from the same author is erased, leaving a faint ghost for one turn. Pruned knowledge disappears [canon: pruning, FOUNDATION section 8].
- **Disagreement** is drawn, not resolved: two estimates of the same thing both appear, each signed [canon: FIRST-MONTH stop 3 and 0013; proposed rule].
- **Redundancy for accessibility** (section 5): ink is solid and heavy; pencil is a lighter grain with a broken edge; fade lowers contrast and adds the date in the note; colour never carries a meaning alone [proposed].

### 3.4 Arrows and edits

- **A commander's draft** is a broad hatched arrow per axis, outlined, with the axis number at its tail and the divisions listed on the plan sheet [canon: 0013, 0016].
- **An approved plan** fills the hatching. **An operation under way** draws the travelled part solid and the rest hatched [proposed].
- **Edits** are blue pencil over the draft, numbered in order, each with its attention cost in the margin while unsent [proposed, costs canon 0025/0040].
- **Support requests** are dotted arrows from the supporting post's flag to the axis they support, labelled "asked of: …" and later "agreed" or "declined" from that holder's answer [canon: 0016 joint operations; proposed style].
- **Hit-testing** follows the tripwire's rules: small regions win within a 12-pixel radius; otherwise the region under the cursor [canon: 0043, prototype `map-tripwire` section 4].

### 3.5 Labels

- **Region names** run along a spine inside the region, letter-spaced, in the map face, sized by size class, shown from a minimum zoom, with hysteresis so they do not flicker [canon: 0043 authored hints; proposed details from the tripwire's estimate table].
- **Authored hints** per region (anchor, spine, size class, minimum zoom) are pack data, so a modder fixes a label without code [canon: 0043].
- **Key points** get small horizontal labels beside the point once it is about 11 pixels across [canon: tripwire section 5].
- **Rivers and ridges** follow their own lines in an italic [proposed, from the prototype].
- **Names are the pack's names as of the scenario date**, checked by the gate's anachronism list [canon: gate F6; proposed application to map labels]. **Map labels also pass F2's slur list**: a period place name that fails it goes to the gate reviewer, who chooses a neutral form with a note [proposed, from the gate review's G7].
- **Native nations' lands carry the nations' own names**, and claimed-control washes never hide those labels; how nations are represented beyond that waits for R3 [proposed, from the gate review's G7].
- **Labels dim** under fronts and arrows and while a plan is under review [proposed, from the tripwire's remaining-work table].
- **Fit:** at fit zoom the tripwire showed 140 of 250 names; labels that do not fit hide, and the region's name is always available on hover and in "what we know" [proposed].

---

## 4. Text and voice

- **String tables.** All player-facing text lives in pack string tables keyed by id, as ICU messages [canon: 0030 item 3, 0035]. The engine produces typed reasons and ids; the presenter renders them [canon: 0003, 0030]. No English in `packages/` [canon: hard rule 3].
- **Template voices.** Every voiced line has a template fallback [canon: 0022]. The Steam build ships templates only until Valve clears a key or local-model path [canon: 0038]. Templates are written per person-type and per stance, in the voice the pack cites for that person [canon: 0022 on real people; gate Q10].
- **AI voice** is a setting in non-Steam builds, off by default, never named on the store page, the demo or the trailer [canon: 0038, 0039]. When it is on, a small mark on each generated paper says so [proposed], and the template remains one click away [proposed].
- **The gate's wording rules apply to every string** [canon: 0046, `SENSITIVE-HISTORY.md`]:
  - option labels in the advisers' own terms, naming their proponents, in the pack's neutral display order, free of hindsight words (C1–C3, Q4);
  - no moral verdict in an option label and no narrator text that praises or scolds the player (C4, F5, Q5);
  - where enslaved, freed, Black or Native people act, they are the subject of the sentence (Q3);
  - an option that would return people to slavery says so plainly (Q6);
  - period language only inside cited, attributed, short quotations with a reviewer note (Q9, F3);
  - disputed numbers as ranges with citations (F4);
  - no terms dated after the display date (F6);
  - the forbidden and review lists in `packs/<pack>/gate/forbidden.json` (F2).
- **Out-of-world text** (menus, the key card, settings, tooltips, store copy, trailer text) is plain modern English, scoped `out-of-world` [canon: gate string scope, section 5 of the checklist]. **The scope lifts only the anachronism list (F6) and period-voice conventions.** The F2 fail patterns (Lost Cause wording, resource words near protected groups, slurs) and the praise-and-scold list (F5) apply to every string, including store copy and trailer text [proposed, from the gate review's G3]. The narrator is sparing and never says "you" to judge [canon: gate F5; proposed tone].
- **Document genres** [proposed list; period conventions **needs-source**, section 9]:

| Genre | Report type (0032, 0040) | Form |
|---|---|---|
| Telegram | wire dispatch | a military telegraph form, operator's hand, hour stamp |
| Letter | informal source, observer's letter | letterhead or plain sheet, the writer's hand or a clerk's |
| Memorandum | advice (memorandum subtype) | a plain sheet, endorsed |
| Written opinion | advice (Consult answer) | a plain sheet, signed, with the question it answers |
| Strength return | strength return | a printed table, present for duty and present and absent |
| Casualty return | casualty return | a printed table, first figures marked provisional |
| Enemy estimate | enemy estimate | a report signed by the intelligence source behind it |
| Newspaper | press report | a front page, weekly, plus single clippings when a story breaks |
| General Orders | the president's and commanders' published orders | printed, numbered |
| Promotion list | list | a printed list with blanks for amendment |
| Plan | plan ready for review | the plan sheet (section 1.4) |
| Situation card | situation | a docket card (section 2.3) |
| Briefing | text | the opening paper |
| Retrospective statement | retrospective statement | the reckoning only; an attributed claim with speaker and citation, never the game's explanation (section 1.10) |

---

## 5. Accessibility

All of it is presentation and so cannot change a seeded run's state hash [canon: gate G4].

- **Colour-blind-safe map** [proposed]: every meaning carried by colour also has a shape or texture. Own and enemy washes differ by hatching direction as well as hue; a front's teeth face the enemy; corrections are struck through and initialled, not only red; the president's marks are numbered and have a distinct stroke. An alternative palette for each colour-vision type is a skin variant, chosen in options. The prototype's enemy (`#8e3a2a`) and correction (`#b0231b`) colours are too close for anyone and must separate in production (section 10).
- **Type scaling** [proposed]: papers and chrome scale from 80% to 200%; reading text is at least 18 px at 100% on a 1440-pixel-high display (about 14 px at 1080), and larger type widens the reading column before it lengthens lines; map labels scale on their own slider. A **plain reading** option sets papers in Libre Caslon at a larger size in place of the more ornamental faces; handwriting forms gain a typeset transcription under the hand.
- **Contrast** [proposed]: paper ink meets WCAG 2.1 AA (4.5:1) for body text in every skin; faded map marks may drop below it, so their content is always available as text in the "what we know" note. A high-contrast skin raises washes and pencil to full contrast and drops paper grain.
- **Low glare** [proposed]: an evening-lamp option dims paper and warms the desk. There is no separate dark theme for papers; paper stays paper.
- **Reduced motion** [proposed]: respects the system setting; papers appear without sliding, the calendar changes without turning pages, and the days run in one step to the stop.
- **Keyboard play** [proposed]: section 2.6; the game is completable without a mouse, including plan review (arrow handles are focusable, moved region by region with the arrow keys).
- **Screen readers** [proposed]: papers, cards, the docket, the ledger and the org board are HTML and carry their semantics. The map is a canvas, so it has a **text twin**: a list of fronts, flags, estimates, plans and marks, each with its author and date, the same description the console prints (section 6).
- **Audio** [proposed]: every sound has a visual equivalent; no information is carried by sound alone; separate volume for effects and music.

---

## 6. From the Phase 1 console to the Phase 2 desk

Playable at every phase [canon: 0030 item 4]. Phase 1 ends console-playable: plan review, arrow edits, audiences and dispatches [canon: 0030, FOUNDATION section 12]. Phase 2 is the desk and the staff map, and yields the public demo [canon: FOUNDATION section 12, 0037, 0039].

**One presenter, two renderers** [proposed]. A presenter module sits between `viewFor` and every screen. It builds the desk model (tray, docket, board, ledger, map layers, prices) from the player's view and the string tables, and turns the player's acts into the kernel's commands. The console and the React desk both render the same desk model. The presenter imports only `@mandate/kernel/seat-api` and declares `"playerFacing": true`, so lane 0.6's boundary test (`boundary.test.ts`) keeps the truth layer and the historical default out of its reach [canon: FOUNDATION section 8, gate B9; the test is lane 0.6's, merged]. Today's M2 console already works this way in small (`packages/cli/src/console.ts` takes one command line and returns lines, reading only the player's view).

| Step | Phase | What is playable | Map | Status |
|---|---|---|---|---|
| 1 | Phase 1 | The console, rebuilt on the presenter: papers printed with genre, author, route and stamp; the docket as a list with clocks as date ranges; plans as numbered axes with routes listed as region names; edits typed in the grammar (`edit 2 objective <region>`); audiences as numbered reasons and counters; the battle night as a timed dispatch log | text twin only | canon (console loop); presenter proposed |
| 2 | Phase 2, first | The React desk without the map: tray, reading column, docket, board, ledger, file, attention, calendar, out-tray; the map's place shows the text twin | text twin | proposed |
| 3 | Phase 2 | The staff map, read-only: base bake, washes, fronts, flags, pencil, fading, labels | PixiJS | proposed (renderer canon 0035, 0043) |
| 4 | Phase 2 | Plan review on the map: arrows, blue-pencil edits, send back or order | PixiJS | proposed |
| 5 | Phase 2 | The audience scene with portraits; the night of the battle | — | proposed |
| 6 | Phase 2 | The Electron build, the demo scenario, the store screenshots (Playwright at 3440×1440 and 1920×1080) | — | proposed (tools canon 0035; sizes canon 0049) |

Each step keeps the previous one playable; the console stays as the headless and accessibility path and as the test harness for the presenter [proposed].

---

## 7. A storyboard of one week: 8 to 15 March 1862

The working demo start is early March 1862, opening the day the *Virginia*'s attack is reported (8 March) [canon: 0046, catalogue section 2]. History here comes only from the catalogue entries named; the turn timings, seat choices and attention numbers are **[game]**. Attention assumes 6 a week, refilling Tuesdays, which is not canon (the pack sets it) [game]. The scenario begins with S27, S28 and S24 resolved and S31's order missed [catalogue P17].

**Stop 1. Saturday 8 March, the opening.** The briefing is the first paper: the premise text the gate requires (the `cause-of-secession` and inaugural text facets, section 1.12), who holds what (Stanton at War, per S28 resolved), the army in winter camp, the missed date for a general advance (S31). The map shows the Army of the Potomac's flag near Washington with a pencilled enemy estimate across the river, signed by its source; western flags further off. The docket holds **S35** (war orders: corps, the top command, the West), live from the start because the 22 February date was missed. The tray brings a wire: the *Virginia* has sunk the *Cumberland* and taken the *Congress*, which opens **S34** on the docket with a clock of a day or two. S34's staff line is Stanton's: recall Burnside and stop the campaign (in Welles's account, which the card cites as one-sided). The president **consults the cabinet in writing** on S34 (1 attention; 5 left) and leaves S35 open.

*On screen:* the docket card for S34 with two options in their display order, "Hold course: the ironclad cannot leave the Capes or pass the Potomac shoals" (Welles) and "Recall Burnside and stop the campaign" (Stanton, per Welles); the "Ask in writing" form; the meter striking one token.

**Stop 2. Sunday 9 March (one day): the answers he asked for.** The cabinet's opinions arrive clipped under S34, each a stance on record. A wire follows: the *Monitor* has fought the *Virginia* to a draw. S34's window ends on that report; nothing was decided, so the situation takes its `inaction` course, "hold course" [catalogue S34]. Stanton's stance for recall stays tabbed on his card [game].

*On screen:* the S34 card stamped "Closed: the Monitor's report" and moved to the file; Stanton's card showing a new tab. This is the week's lesson in miniature: waiting cost nothing, asking cost one token, and the record of who said what remains.

The president turns to **S35**. Its options can be combined [catalogue S35, P3]: organise the army into corps and name their commanders (the catalogue's names, McDowell, Sumner, Heintzelman and Keyes, are marked "verify"), relieve the general-in-chief and leave him his army, unite the western departments under Halleck, give Frémont a department. The staff line is Stanton's, and the card notes that the general-in-chief is the subject [catalogue S35, P5]. The president ticks all four. Whether that overrules the staff line depends on Stanton's seat-derived recommendation [game]; if it does, 1 attention (4 left), and the appointments the options issue are included [canon: 0040].

*On screen:* four checkboxes in one group; the org board updating as the signed orders reach the out-tray (new corps posts with pinned cards, "General-in-chief: vacant from 11 Mar" pending); the out-tray with four slips, recallable.

**Stop 3. Wednesday 12 March (three days): a plan is ready.** Attention refilled on Tuesday (6). The days run; papers drop in: the order reaching McClellan, his reply in his voice [game], the corps commanders' acknowledgements. A wire from McClellan relays Halleck's report that Grant, sidelined after Donelson, has "resumed his former bad habits", which opens **S32** [catalogue S32; the timing of its arrival is game]. Then the stop: **the army's plan** takes it away from Washington, which opens **S36** on the docket and brings the map forward.

*On screen:* the plan sheet beside the map; one long hatched sea arrow from the army's camps to Fort Monroe (its route is whatever the planner drafts) [game], a support request to the Navy as a dotted arrow, his reasons inline. Two strength papers in the tray disagree by measure: 121,500 shipped against 179,000 present for duty across the whole command [catalogue S36; their arrival as two papers is game]. The S36 card's options: "Ask for the exact numbers left behind before deciding" (an Inquire), "Send every corps with the army" (McClellan), "Keep one corps to cover the capital" (a transfer and an edit) [catalogue S36].

The president **asks for the exact numbers** (Inquire, free) and **asks Halleck for particulars in writing** on S32 (Inquire, free). Both go to the out-tray. He sets the stop for "a report I asked for has arrived".

**Stop 4. Saturday 15 March (three days): the count comes back.** McClellan's count of what stays behind arrives, shaded by him [game]; Halleck's answer arrives too [game]. The president decides S36: **keep one corps to cover the capital**. On the org board he opens a transfer from McClellan's card to a new department's post and names a corps; on the map he strikes the corps' place in the plan's axis in blue pencil and chooses "Order these changes" [catalogue S36: a transfer and an edit]. Under 0040 the decision includes its orders; whether it overrules the staff line depends on Stanton's seat [game]: 0 or 1 attention. McClellan's objection returns as a paper the same day [game], and the president grants him an **audience** (1). Across the desk: McClellan's case as numbered reasons, his enemy estimate signed by its source; the president answers "the order stands" [game]. The turn ends.

*On screen at the end of the week:* the map with the Army of the Potomac's sea arrow approved and filled, one corps flag left near Washington under a new department, a red-initialled correction where an observer's letter contradicts a flag's strength [game]; the daybook showing the week. Attention: 1 or 2 before Tuesday's refill, then 1 or 2 of the refilled 6, so 2–4 across 8–15 March [game]. That is no tighter than the first month's slack weeks, so this week does not yet show attention biting; the walkthrough expected the war to make it bite (FIRST-MONTH, pacing verdict 3), and that is for Phase 1's tuning to show.

**Gate exposure in this week.**
- **S33 (compensated emancipation)** is gate-flagged with placement pending [catalogue S33]. The proposal went to Congress on 6 March 1862, two days before the start; border-state members met the president on 10 March, and the House passed the resolution on 11 March, both inside this week (the gate-and-catalogue facts note, section 3.2). **Whether the scenario starts with S33 resolved or live is open**, for lane 0.7's scenario setup to decide, as P17 did for S27, S28 and S24. If it is live and placed, it appears as a docket card; if not placed, the demo may not omit the topic's derived and text facets, so the briefing and the press carry them [canon: the ship rule and G5, 0046].
- **Other topics whose windows cover the week**, whose derived and text facets G5 likewise requires: `self-emancipation`, `fugitive-policy` (until 17 July 1862), `union-habeas-and-arrests` and `guerrilla-war-west` [canon: the register, `SENSITIVE-HISTORY.md`]. The briefing and the week's press carry them; none needs a docket card in this storyboard.
- The storyboard's four stops do not depend on how any of these is placed.

---

## 8. What is open

- **Hour-level battle presentation** beyond section 1.9: pacing of playback, how many dispatches per hour before the log needs grouping (FOUNDATION section 13).
- **Fading thresholds** and how many steps (section 3.3), tuned on real play.
- **The attention table's amounts** (pack data, Phase 1).
- **Whether delegate and ignore are always free** (section 2.1).
- **The presenter's name and package** (section 6), for the Phase 2 desk lane.
- **Minimum hardware and 16:10**: the tripwire ran on one discrete GPU only; 0049 asks for a 16:10 check down to 1280×800 before release, which needs a test machine or an emulated viewport plus a slower GPU.

## 9. Research needed before templates are built

A research lane (Sonnet, high) sources from public-domain scans, citing each:
1. the layout of a United States Military Telegraph message form of 1861–62 and of commercial telegraph forms of the period;
2. letterhead and heading conventions of army and department headquarters, the Navy Department and the Executive Mansion;
3. the format of General Orders and President's War Orders as printed;
4. the layout of a strength return and a casualty return;
5. the structure of a Northern daily's front page in 1861–62 (columns, headline decks, datelines), and which mastheads may be reproduced or must be reset;
6. endorsement conventions (how an official endorsed a letter he passed on);
7. forms of address between the president, secretaries and generals.

## 10. Questions for other lanes

- **Lane 0.6 (seats and messages): answered** by its merged seat API (the standing reviewer's review): an out-tray held by the shell until the days run fits, because a command enters the log only when the shell hands it to the tick (section 1.8); the view carries no transit fields, so the order form shows the menu's `typicalDays` and `price` before signing and nothing after (section 2.2); the principal's menu carries no compliance or edit-distance field (section 1.4).
- **Lane 0.7 (situations):** what happens at end of turn to a non-live situation with no answer (section 1.8)? The catalogue orders options alphabetically by id; the gate's C2 calls for a display key "in the order advisers raised them". One rule is needed.
- **Lane 0.9 (planner):** the interface shows no edit-distance or compliance preview (section 1.4), and the seat API gives the principal none. If a planner score is ever needed for the attention price of an edit, it must not reveal the commander's hidden stats.
- **The Phase 2 desk lane:** separate the enemy and correction colours (section 5); self-host every face (0035); add a handwriting face, which 0035's list lacks (`ASSETS.md`).
