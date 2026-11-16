# Lane 1.11b: entering the re-sourced data

Branch `phase1-data-entry`, worktree `lane-1.11b`. Rules: decision 0085 (evidence rules and the 1860 census). Sources: `docs/research/2026-11-16-1861-gaps.md`, `packs/union-1861/source/drafts/people/held-back-resourced-1861.csv`, `packs/union-1861/source/drafts/census/`.

## What changed

1. **The evidence rules are checks** (hard rule 7).
   - `gate/source-policy.json` has a new `evidence` block: the two boundaries (`innateThrough` 1861-07-31, `startBefore` 1861-03-05), the innate stats (`competence`, `nerve`) and the thirteen innate traits. It is the pack's data; a pack without it has no date rule. `SourcePolicySchema` (`gate.ts`) accepts it and the published schema is regenerated.
   - A citation's place may state its date: `dated YYYY-MM-DD` anywhere in the locator. `banned-sources.ts` reads the policy (`readEvidencePolicy`), reads the date (`evidenceDate`) and judges it (`datedAfterBoundary`); `validate.ts` classes each cell (innate or start) and a dated citation past its cell's boundary is weak. An undated citation is not judged by date.
   - Tests (`packages/pack-format/test/validate.test.ts`, "evidence dates by cell class"): a start-class cell on 1 April evidence is weak; evidence of 4 March stands and 5 March is weak; an innate trait on 1 April evidence is not weak, 31 July stands and 1 August is weak; the same trait is start-class when the pack does not list it; the stats follow the pack's list; an undated citation, and a pack with no evidence block, are not judged; regard toward another person, a value and a practice take the start boundary.
   - The people README (`source/drafts/people/README.md`, new section) records the rules, the class mapping, the own-words rule, the order-is-no-leg rule and the rank-kind rule.
2. **Cast cells entered: 28 of the 118 draft rows.** All 12 SOURCED rows and 16 PARTLY rows that the checks admit (each has at least one citation that is not weak under its cell's boundary). Each entered citation carries its evidence date where one is known. Plus Mallory's `reputation` corrected (below). 90 rows stay held back: 44 PARTLY and 46 UNSOURCED.
3. **The census by region entered:** `source/world/census.csv`, 205 rows, read by the self-emancipation term (0078).
4. **PROVENANCE:** eight keys added (`LEWIS-HWVM`, `CHASE-1847`, `HOLT-1861`, `REBREC1`, `USREPORTS`, `CUSTIS-WILL`, `CHI-1860`, `WOODWARD-LYON`); `PRFA` and `MO-CONV-1861` were already there; the Navy Records title now names Series I vols 1, 4, 5, 7, 12 and 22 and Series II vols 1 and 2.
5. **Cite nit done:** `congress_37_1_at_once`'s cite points to `docs/research/2026-11-16-1861-gaps.md`, Part F.

## The census (0078, 0085)

- 268 regions in the draft; 205 rows entered. Skipped: the 49 water, river and off-map regions (no residents), the six forts and shoals and the six Indian Territory regions (their part of a county cannot be separated, and the Indian Territory was not enumerated), and Dakota and Colorado (no county rows).
- Each row cites `CEN1860-POP` with state, table, page and leaf; the notes carry the mapping and every caveat (counties created after 1860, "no return" counties, input flags, the Baltimore split, `wilmington`'s "Lillington" inference).
- **The term now has a Union input.** The Union reference run at war (75 days) fires `regions.self_emancipation` 1,528 times and `regions.reached_lines` 132 times; both were `notHere` while the pack had no census (the testbed run fired them). The bands are now `around(1528)` and `around(132)` in `packages/cli/src/liveness-gate.ts`, with the reason in a comment. The done check passes (the tick-cost line failed once under load on its first run and passed on the next two).

## Gate reviewer: to read before merge

- **Value cells that touch slavery** (the five: `slavery_defence`, `slavery_noninterference`, `fugitive_defence`, `free_soil`, `abolition`): two entered, both `fugitive_defence`.
  - `chase_salmon_p`, `fugitive_defence`: `CHASE-1847 p3-4`. His printed argument to the Supreme Court in Jones v. Van Zandt (1847): "an argument in behalf of an old man who is charged ... with having concealed and harbored a fugitive slave" and "I shall do no such violence to my own convictions of right and duty."
  - `dennison_william`, `fugitive_defence`: `USREPORTS 24 How 66 dated 1860-04-14`. *Kentucky v. Dennison* records his refusal of Magoffin's demand for Willis Lago (indicted in Kentucky for assisting a slave to escape), on Ohio Attorney General Wolcott's opinion of 14 April 1860. The report was read as a text, not a page image; the page is unchecked.
  - Slavery-touching values among the held cells: Letcher's `slavery_defence`, Bates's `free_soil`, Pierpont's `free_soil` and Morgan's `state_autonomy` are UNSOURCED and not entered.
- **The census** is a protected input (`region_enslaved_population`): `source/world/census.csv`, and its derivation from `source/drafts/census/` (`README.md`, `aggregate.mjs`).
- **The army bloc's cite nit is not applied, because a sign-off would break.** Lane 1.6's cite for the army bloc's starting value reads "rest from the M2 scenario" and the other blocs add "[I]". Editing it changes the bloc's content hash, and `packs/union-1861/test/gated-blocs.test.ts` pins that hash as the gate reviewer's. The edit and its new hash, for the gate reviewer to apply in one step: in `packs/union-1861/pack.json` change `rest from the M2 scenario"},{"id":"border_unionists"` to `rest from the M2 scenario [I]"},{"id":"border_unionists"`, then re-sign the army bloc in that test with hash `1d07b74babb36cd737424b1f33d3e748352e8cb9e604e0be13b36ce436919ff5` (computed by `blocHash` over the edited rule and the name "Army"; it is the lane's computation, not a sign-off). I did not commit the edit, so the branch stays green and the sign-off stays honest.

## Cast cells: what entered and what did not

**Entered (28):**

- Cobb reputation; Memminger experience, reputation and boldness; Toombs, Walker, Benjamin, Reagan and Holt reputation; Stanton reputation; Wigfall reputation, nerve and `quarrelsome`; Semmes, Tattnall, Fox, Rodgers (also competence) and Buchanan (also competence) nerve; Johnston `rank_proud`; Du Pont `joint_minded`; Greeley `uses_press`; Letcher `conciliation`; Smith's regard toward the principal (above); Blair's regard toward Fox (above); Chase and Dennison `fugitive_defence`.
- **Ten entered cells rest on a secondary work or a government biography with no strong leg in window:** Buchanan competence and nerve, Tattnall nerve, Letcher `conciliation`, Wigfall reputation and `quarrelsome` (Appletons); Greeley `uses_press` (the Biographical Directory and Nicolay and Hay); Stanton reputation and Holt reputation (Nicolay and Hay); Reagan reputation (the Directory; the confirmation of 6 March is one day past the boundary). The check admits them because Appletons is not on the weak list; lane 1.9's open question 2 (whether an Appletons-only cell should pass) is still open.
- Blair's regard toward Fox is entered as `above`, not the draft's `high`: only the 31 January 1861 letter is before 5 March; `high` leaned on the 26 April letter.

**Corrected, per the lead:**

- **Mallory's `reputation`: above, changed to average.** The old `above:BL 1-p106+JONES I-1861-05-26` rested on a memoir and a later diary. The evidence before the start is the naval committee's split (Owens's minority report, `JCCS I p96`, 1 March 1861); the confirmation of 5 March was 5 States to 2, Florida and Texas voting nay (`JCCS I p106`), where Toombs, Memminger, Walker, Benjamin and Reagan went through unanimously. The old value is in the row's notes.
- **Harney's regard for Lyon: nothing entered.** The draft's `above` rests on OR I-3 p370 (13 May 1861), after 5 March, so it is weak under 0085; the modern page's "below" is gone. The row has no Lyon cell.
- **Breckinridge:** `state_maj:1847` was already in the row; the note now records that its kind follows its commissioning authority (regimental election) and that it is partly sourced (Appletons only). **Pike's** `state_capt:1846` stays needs-source, per the ruling.

**Held back, 44 PARTLY rows (each stays in the draft CSV with its evidence):**

- *No admissible leg once dated (32):* Bulloch (2), Davis toward Lee, Letcher toward Lee, Eckert (2), Foote, Welles toward Fox, Goldsborough, Lincoln `candid`, Stringham, Wilkes, Halleck (2), McClernand `ambitious`, Rosecrans, C. F. Smith, Adams, Hicks, Pierpont (2), Carlile (4), Willey (3), Gamble, Harney toward Lyon, Lyon (2).
- *Own report alone (7):* Mallory competence and nerve, Paulding candour, `union` and `duty`, Rodgers `organiser` and `candid` (the August report is also after 31 July).
- *No clean direction (5):* Lee `slaveholder` (the Custis will shows an executor's control, not ownership), Wigfall `insubordinate` (the official accounts conflict), Seward `intrigues` (only "behind a colleague's back" is documented), Rodgers `joint_minded` (mixed), Greeley competence (the one letter does not show "average").

## Not done, or left for others

- **Existing cells are undated.** The cells entered before the rule cite evidence with no date, so the date check cannot judge them (Harney's regard for Price, 1861 May evidence, is one such start-class cell). A pass that dates those citations would show any that rest on evidence past a boundary.
- **The Lillington inference and the census caveats** stay labelled in the census rows' notes (0085); lane 1.14 carries them.
- **`docs/OPEN_QUESTIONS.md`'s "Lane 1.11b" heading** lists this lane's items; the steward closes them from this note.
- The held-back draft CSV is not edited: it keeps its 118 rows, with the reasons.

## Checks

`npm run check` passes (1,220 tests, three skipped); `pack:validate` 0 errors; `run:done-check` passes. The generated files (`packs/union-1861/data/`, `packages/pack-format/schemas/`) are regenerated, not hand-edited.
