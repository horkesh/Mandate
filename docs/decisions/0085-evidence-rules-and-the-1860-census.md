# 0085: Evidence rules for the 1861 cast, and the 1860 census by region

Status: accepted (2026-11-16). Amended by 0087 (the rules as checks; a later work sources facts but not judgments; a period document printed verbatim later counts as contemporary; older judgment cells meet the same rule). From:
- Phase 1 lanes 1.11r and 1.11r2 (`docs/research/2026-11-16-1861-gaps.md`, and `packs/union-1861/source/drafts/census/README.md`);
- the standing reviewer's review and re-checks (`review-research-1861-gaps.md`).

Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Applies 0033 and the gate's weak rule. Gives 0078's self-emancipation term its Union input.

## Context

Lane 1.11r re-sourced the cast cells held back under 0033. Its readers applied three different boundaries for "evidence dated after the start", so the draft's "sourced" count wasn't one standard.

Lane 1.11r2 read the 1860 census for every region of the Union pack: Kennedy (1864), Table 2, from page images. That's the input the self-emancipation term had lacked on the Union side.

## Decision

**Which evidence counts, by the kind of cell.**
- **Innate stats and traits** (competence, nerve, and innate dispositions such as `slow`, `rank_proud`, `joint_minded`, `organiser`) may be sourced on evidence up to **31 July 1861**, the end of 1A's window. Such evidence shows what the man was.
- **Cells true at the start** (values, regard, reputation, candour including `candid`, boldness, and relationships such as `political_patron`) are sourced only on evidence before **5 March 1861**.
- Evidence later than its boundary is weak. A cell whose every citation is weak is refused (lane 1.11a's rule).
- The class of each cell is mapped in the people README.

**Whose words count.**
- A man's own words are a leg when they are themselves the conduct that shows the trait: Johnston's 29 July letter protesting his rank, for `rank_proud`.
- They are not a leg when they assess his own quality (candour, competence, organising): Paulding's and Rodgers's own reports. Such a cell needs a third party's leg.
- An order assigning a man a task shows the assigner's expectation, not the man's gift. It is not a leg for the trait the task needs.

**A past rank's kind follows its commissioning authority.** A rank by election in the regiment or by a governor is `state_`. One by the President is `usv_`. So Breckinridge's is `state_maj:1847`, partly sourced, and Pike's `state_capt:1846` stays needs-source.

**Under these rules,** the held-back draft has 12 sourced, 60 partly sourced and 46 unsourced cells.

**The census, by region.**
- **The source:** Table 2, read from page images, with every page and leaf cited. Every state's enslaved total matches its printed line, and the county rows sum to the printed national total of 3,953,760.
- **Print errors:** a figure in doubt only for internal consistency keeps its printed digits. Two figures are corrected because the state totals force them (Florida's La Fayette, Arkansas's Lawrence), each flagged with its printed value.
- **Baltimore** is split by Table 3: the city's 2,218, and the county as the remainder, 3,182. The single Table 2 row counts once.
- **"Lillington"** is the enumerated part of New Hanover that a failed 1859 county act would have created, per the Newberry Atlas. It is counted with New Hanover, in `wilmington`, labelled as an inference.
- **Utah's 29** fall outside every region, because the pack has no Utah region. So the regions sum to the national total less 29.

Rejected:
- **One boundary of 31 July for every cell.** In-window conduct would set the starting states that the game then simulates.
- **An innate exception with no end date.** 1862's battles would set 1861's men, and battle changes stats (0020).
- **Keeping three readers' boundaries.** The count would mean nothing.
- **`usv_` for every officer of a regiment mustered into federal service.** Mustering in didn't change who commissioned him.
- **Correcting every internally inconsistent census figure.** Only the state totals justify a correction.
- **Counting the Baltimore row in both regions, or leaving "Lillington" out.**

## Consequences

- **Lane 1.11b** (to open):
  - writes these rules into `banned-sources.ts` and the people README;
  - enters the sourced cast cells and the census by region as pack data;
  - adds the PROVENANCE keys the drafts list;
  - fixes the cite nits filed under its heading.
- **Lane 1.14** carries the census caveats: the Indian Territory was not enumerated; counties created after 1860 sit inside their parents; Texas has "no return" counties; part-county regions; and Charles City and Chesterfield are printed 100 off in opposite directions.
- **The catalogue** (`SITUATIONS-1861-62.md`) carries lane 1.11r's corrections for S04, S05, S08, S13, S16, S19 and S21.
- **The research leads** the review lists are filed for a later research lane.
