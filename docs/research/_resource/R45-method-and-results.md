# R45: second-round results and apply handoff

2026-11-19. Research only, on `research-1861-round2`, based on `research-1861-leads` at 3d7188a. No pack data, packages, gate content, original reader table or original apply tool was edited. Git was used only for permitted read commands. R44 and R46 worktrees were left alone.

## Round two

Every assigned cell appears exactly once, in the original batch order and with its original `prior_value`. CSV header and quoting follow rs1-rs9. A node harness runs the inherited parser and apply body without changing them, with filesystem writes unavailable. Counts:

| Batch | Cells | KEEP | CHANGE | HOLD |
|---|---:|---:|---:|---:|
| rs10 | 29 | 10 | 0 | 19 |
| rs11 | 29 | 0 | 1 | 28 |
| rs12 | 30 | 1 | 0 | 29 |
| rs13 | 30 | 2 | 0 | 28 |
| rs14 | 12 | 0 | 0 | 12 |
| Total | 130 | 13 | 1 | 116 |

| Field, all batches | Cells | KEEP | CHANGE | HOLD |
|---|---:|---:|---:|---:|
| reputation | 76 | 5 | 1 | 70 |
| nerve | 16 | 2 | 0 | 14 |
| competence | 13 | 0 | 0 | 13 |
| trait | 18 | 2 | 0 | 16 |
| value | 4 | 3 | 0 | 1 |
| regard | 3 | 1 | 0 | 2 |

Each rsN.md also gives its per-field counts. KEEP/CHANGE are recommendations grounded in the cited documentary words. Every move from those words to a qualitative band is [I]. None asserts that a numeric band was measured by a historian.

The CHANGE is **Lincoln's reputation, average to above [I]**, on Andrew's praise in his 1860 ratification speech, Pearson 1 p116. This is another man's contemporary judgment, not Lincoln's self-assessment. The exact day is not printed. The earlier reader's inferred 23 May is **not** re-entered as a verified date.

The principal KEEP results are Andrew's regard/three values/antislavery trait, Bates's nerve and reputation, Blair's nerve, Chase's and Dayton's reputations, Seward's reputation, Lyons's reputation and Stevens's antislavery trait. The CSVs explain the limits: convention votes establish standing within that convention, and the speech/letter printed in a later book is the leg, not its author's hindsight. These results need the standing review. In particular, the inference from a presidential candidacy to a reputation band is visible for the reviewer to assess.

## Bounded search and what HOLD means

The retained primary-text discovery corpus was the six NYT issues already downloaded for the second round: **20 December 1860, 12 January, 30 January, 5 February, 19 February and 2 March 1861**, together with the 1860 Chicago convention proceedings. `evidence-r45/round2-search.json` records a surname search for **each of the 130 cells** across all seven texts. These are discovery searches, not an assertion that every hit is the intended man or that every issue was read cover to cover. Zero hits are subject to OCR limitations.

Selected potentially useful passages were then read directly in Pearson, Nicolay and Hay, Newton, Woodburn, Nason and the convention proceedings. The CSV records the read documentary basis or the remaining failure of evidence. The search was finite, especially for the less prominent officers. **HOLD means this pass did not establish a sufficient leg. It does not mean a contemporary judgment cannot exist.** The brief explicitly permits HOLD, so no rank, office, election to a commission, later fame or plausible trait was used to fill the remaining cells from memory.

Only short excerpts are used. The new CSVs do not reproduce period racial slurs. Research proposals touching `fugitive-policy`, `war-aims-1861` or related gate topics remain for the separate gate reviewer at the later apply/placement. No situation or player string is authored, and nothing is signed.

## Read sources

All read on 19 November 2026 from the retained source OCR unless the entry names a web page. Source file paths and SHA-256 values are in `evidence-r45/round2-source-files.json`. The retained source root is given by `tools/r45-read.py`. Retention reuses the earlier lane's raw copies rather than downloading duplicate books.

| Key | Copy and passages used | Classification |
|---|---|---|
| PEARSON-ANDREW | [*Life of John A. Andrew*, vol1](https://archive.org/details/lifeofjohnaandre01pear), pp114-116,121-128,138-139,166,219-220 | Later biography. Only the quoted 1860 speech, dated newspaper extract and 5 January 1861 inaugural are admitted. Surrounding characterisation is excluded. |
| NH | [*Abraham Lincoln: A History*, vol3](https://archive.org/details/abrahamlincolnhi03nico), pp351-352,370-372,388,432-434 | Later narrative. Only the reprinted Bates and Blair memoranda support KEEP. Other read passages supply rejected leads, not judgment facts. |
| CHI-1860 | [*Proceedings of the Republican National Convention*, 16-18 May 1860](https://archive.org/details/proceedingsofrep00repu), pp108-109,113,115 | Contemporary proceedings. Other delegates' nominations and votes are evidence of their esteem. [I] The standing bands are recommendations. |
| NEWTON-LYONS | [*Lord Lyons*, vol1](https://archive.org/details/lordlyonsrecordo01newtuoft), pp2,30-38,43-44 | Later narrative. Only Russell's quoted early-1853 letter at p2 is used for Lyons's reputation. Exact day/month absent. Diplomatic reports and assignment expectations are not promoted to competence. |
| WOODBURN-STEVENS | *Life of Thaddeus Stevens*, retained `rs2/stevens.txt`, pp91-99,165-167 | Later narrative with reprinted speeches. The 29 January 1861 speech at pp165-166 has its date in the p166 footnote and supplies the admitted leg. The earlier speech has an impossible February day in OCR and is not dated here. |
| NASON-WILSON | [*Life and Public Services of Henry Wilson*](https://archive.org/details/publicservhenrywil00nasorich), pp306-308 | Later biography. Scott's actual letter is dated 10 August 1861, after the relevant boundaries. It is rejected for these cells. |
| NYT issues above | `rs-13/sim_new-york-times_the-new-york-times_<date>_10_<issue>.txt`, exact identifiers and hashes in the source manifest | Contemporary text used as a discovery corpus. No unverified search hit becomes an admitted factual citation. |

No NEW key is needed for rs10-rs14. Existing keys resolve in this worktree's PROVENANCE. The source policy's `referenceWorks`/`factBlocs` amendments were read through **`git show e8c5808:packs/union-1861/gate/source-policy.json`**, because this docs-only branch does not yet contain those amendments. The local older policy is not silently described as the amended version.

## A1 and the ten blocs

`A1-registers.md` has all **23 lines**. The thirteen serving officers pass. Nine former officers have no current US Army commission. Stone's January District appointment prevents certifying the broad claim that all ten lacked any federal commission. His Regular Army resignation and reappointment are clear. The presidential authority claim has only his later account beside Cullum's factual appointment entry and still needs a contemporary commission/order/muster roll. The lead must apply the definition of `army` to that exception.

`ten-confederates.md` recommends **none for all ten [I]**, with evidence and limits for each. It distinguishes current office, later service and the fact of joining a side. Bulloch's precise employment/location/commitment on the start date is not established. Polk's and Floyd's precise start-day personal commitment is also not proved by their later commissions. None of these gaps is concealed as a finding of neutrality.

## Dating pass

`dating.csv` contains **12 citation-date records across 9 older cells** whose exact documentary dates were checked in this pass. It does not treat an embedded date as proof of itself. Its rows identify the printed date, footnote or memorandum context used. Dating a citation does not rehabilitate a HOLD or date every other document in the same page span. This is a small beginning, not completion of the hand-over's **998 cells / 1,668 citations**. Undated Andrew/Lincoln ratification speeches and Russell's early-1853 letter remain bounded dates in the round-two tables and are not converted into invented calendar days.

## Validation and scope

- `node docs/research/_resource/tools/r45-validate.cjs`: **exit 0**, exact 130-cell coverage, original priors/order, seven columns, no BOM/semicolon, legal decisions, required bases and direction/citations, no duplicate cells. Uses the inherited CSV parser. Its read-only invocation of the unchanged apply body reports **log 0, 198 held judgment rows, 50 held blocs, 15 pre-positioned, 35 fact HOLDs standing, no missing civilian ids**. These are apply dry-run counts, not a report of data changes. The original plain `node .../apply.js --dry` invocation fails because the script is CommonJS inside an ESM root. That launch failure is retained. The harness makes no patch to the parser or apply logic.
- Required **`MANDATE_NO_GIT=1 npm run check`: exit 2**, typecheck stops at TS2688, missing Node type definitions. **0 tests executed**, no test count claimed.
- Required **`npm run run:done-check`: exit 1**, `tsx` is not installed. **0 criteria evaluated**.
- No `npm ci` was performed. This is a docs-only branch with no `node_modules`, and its older Vitest config does not implement `MANDATE_NO_GIT`. After dependencies are supplied by the owning lane, the full suite also needs the later no-git exclusion before Codex can run it under R45's command rule. No configuration or package file was changed to force a pass. These required checks remain unmet.

Evidence is under `evidence-r45/`: required-command logs, `csv-and-apply-check.log`, batch counts/search/source records and A1 excerpts. The new helper scripts write only research outputs. `r45-read.py` and `r45-registers.py` access source files read-only. No server was started, no other process stopped, and no git write operation was run.

## Proposed rulings

1. **[I] Stone:** leave his bloc unassigned pending the lead's classification of the District appointment, preserving his January service in the notes. Reject both an unqualified civilian label and an unsupported claim that the May Regular commission was his first 1861 appointment.
2. **[I] Ten Confederate starts:** do not apply these ten as established March-side facts without the lead's ruling. Recommend blank, with private allegiance explicitly unproved where it is unproved. Reject backdating later service and speculative replacement factions.
3. **[I] Date precision:** accept a source's bounded pre-start year/context as such, never turn it into a fabricated day. Reject repeating the earlier inferred 23 May date or assigning January to Russell's merely early-1853 letter.

## Findings outside my scope

- **Apply lane:** the unchanged apply still pre-positions fifteen post-start resigners. R49 is now specifically building their true starts, so the later apply **must skip those fifteen stand-ins** after the resignation data lands. It also still keeps the ten disputed Confederate fact HOLDs as coded. R45's recommendations and Stone exception are not implemented by that dry run.
- **Lead/research:** obtain Stone's contemporary District commission/muster authority, and Bulloch's precise start-day evidence if a positive March bloc is desired. Schofield's lieutenant-date disagreement does not change A1's service verdict.
- **Validation owner:** dependencies and the later no-git test exclusion are prerequisites for the two required checks, which did not pass here.
- The earlier hand-over's Harris/Henderson correction and Cameron strength cross-check remain earlier findings, not newly verified by this pass.
