# 0056: The Union 1861 start as data

Status: accepted (2026-11-14). From lane 0.3, which converted the Union drafts into world format v2 (merged as 52b2199), and the standing reviewer's four rounds on it. The lane's hand-over, `notes/lane-0.3-union-data.md`, holds the counts and the full lists. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Builds on 0050 and 0055.

## Decision

**The pack's source CSVs are the source of truth.** The importer in `packs/union-1861/source/import/` is the record of a one-time conversion, and it refuses to run unless a reproduce flag is set. From the merge on, the CSVs are edited by hand and the importer is never re-run over them.

**The start is 5 March 1861.** Every row is as of that day, the day Lincoln's cabinet was confirmed (0042).

**Governments and control.**
- On 5 March:
  - the seven seceded states are Confederate departments;
  - the eight slave states still in the Union (Delaware, Maryland, Virginia, North Carolina, Tennessee, Kentucky, Missouri, Arkansas) have **no faction**, and situations decide their side;
  - the rest are Union.
- Control is never read from loyalty:
  - the eight states and the Indian Territory nations are no one's, with the reason in each row;
  - federal installations in those states stay with their Union posts.
- The research note's border-state loyalty shares are kept in the control rows' notes. They are for a loyalty field, which the format does not yet have.

**Posts and holders.**
- A tenure counts only when it certainly covers 5 March. A tenure that ends on the start date has ended.
- Where a draft orders two undated tenures in its own rows, that order stands. Waite holds the Department of Texas, and Slemmer holds Fort Pickens.
- A holder whose only citation is a research note is marked `needs-source` until a primary source is fetched.
- The five cabinet holders cite the New York Times of 6 March, and that citation is **unverified** until the verification research checks it.
- Posts and force blocks formed after the start are not in it.
- No Confederate command is scheduled. The Confederate rule seat creates commands in play, so harbour commands and temporary commands become creatable by directive.

**People.**
- Only primary sources count as evidence for a stat. A direction with no admissible citation is unknown.
- Bates's diary is dropped until its licence is confirmed, and so is the unlisted `WP1848` key.
- Starting sides follow 0055. Each man's note keeps his eventual side, for the history run.
- Fifteen men whose home or residence on 5 March no source gives are `unknown` for faction. That includes six whose home state could only be read off an office they held later.

**Forces, water and rail.**
- Strengths are each block's nearest return, with its date.
- Ships on foreign stations go to the nearest off-map box. A new `mediterranean` box joins the North Atlantic by one sea leg, and its length and capacity are design parameters.
- Each forted region's fort commands the water edges touching it.
- Only the 12 water edges the drafts source as obstructed are obstructed at the start.
- A rail edge belongs to the first line its census entry names.
- A "high water only" season is written as the complementary closed months and marked inferred.

**Supply (0055).**
- There are 14 sources: eight in the coarse northern regions and six at the Confederate capital and the arsenals its states held.
- There are 10 depots, at named navy yards and the Washington arsenal.
- Every region and capacity among them is a design parameter, cited to the lane.
- There is no off-map source, because 0054 never passes an off-map box.

**One format change.** A sea edge may join two key points on one harbour, such as Charleston to Fort Sumter. Two ordinary land regions still fail.

Rejected:
- **Re-running the importer after hand edits.** Two writers to one file. The importer stays only as a record.
- **Union government or control in the eight states.** On 5 March that would make Letcher's Virginia a Union government.
- **Loyalty shares used as control.** Loyalty is not control.
- **Leaving the 44 Confederate-coded men without posts as Confederate.** The start would show Lee as Davis's man.
- **Marking all 44 unknown.** That throws away what the drafts do say.
- **Guessing residences, or reading a home state off a later office.** Both are hindsight, not sources.
- **Scheduling the Pensacola and Texas commands.** The Confederacy's rule seat makes them, and a history run reproduces them through the historical default.
- **A bring-forward rule for strengths now.** No attrition rule exists yet.
- **Dropping the two harbour sea edges, or retyping them.** They are authored data and carry obstructions.
- **Confederate sources at every state capital, or capacities from census figures.** Nothing in the drafts supports them.

## Consequences

- A verification research lane checks the Times citation and fetches the Senate Executive Journal and the primary sources for every row marked `needs-source`.
- A residence research lane sources the 15 men marked `unknown` for faction.
- The format gains a loyalty field when the regions owner is built in Phase 1. The border-state shares wait in the control notes until then.
- Lane 0.5 implements neutral passage. Maryland and the Baltimore line are open on 5 March.
- The map tripwire re-measure (0043) waits for licence-clean geometry.
- The pack validates with 0 errors. Its 754 warnings are almost all values left unknown, as a draft pack allows.
