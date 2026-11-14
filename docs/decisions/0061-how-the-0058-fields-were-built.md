# 0061: How the 0058 format fields were built

Status: accepted (2026-11-14). From lane 0.7's session, which built 0058's three format fields on `format-0058` (merged as 7e221dc; hand-over in `notes/format-0058.md`), and the standing reviewer's approval with four nits, two of them fixed before merge. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0058.

## Decision

**Department kinds say which are governments** (`departmentKinds[].government`, default false). The engine reads "a government department" from the kind, just as it reads `role` from a post kind, without naming any kind (hard rule 3). This is the one shape beyond 0058's text.

**`unknown` in `governments.csv` is a value, not the "needs a source" marker.**
- It means "no known government": the region is not neutral ground, and control decides passage (0054).
- The row is cited and gives its reason, so an unknown government can be a settled fact of the model, as it is for the Indian Territory nations until research.

**Each government row carries provenance**, as obstructions do.

**The State fields.**
- They are `regionGovernments` and `closedGovernments`, both written by `command`.
- `regionGovernments` is not called `governments`, because the start table already uses that name, as `control` sits beside `regionControl`. The one-writer scan keys on field names and has no exceptions.
- `closedGovernments` maps a department to the day it closed.

**Intelligence chiefs.**
- A chief is a `posts.csv` column, read with the post.
- The chief must be on the post's side exactly, even where the holder check lets a holder with no faction pass.

**The kernel's setup checks government rows** the way lane 0.4's control setup does. It refuses a region not in the World, water or off-map regions, duplicates and unknown departments, and reports every problem at once. Two further checks (that each department is a government, and that every region has a row) stay with the pack validator until governments change in play.

**Accepted limits:**
- A person with no faction passes as a neutral government's intelligence chief, because people carry no home state yet (N3).
- Regions spanning state lines are `unknown`, so the Eastern Shore is closed to every side until the map splits it (N4). The Union pack's other `unknown` rows are the territories, the District of Columbia, the two Indian Territory nations, New England and Michigan–Wisconsin. All of these except the Indian Territory nations are under Union control, so control decides passage there.

Rejected:
- **Treating any department as a government.** A war ministry would govern a region.
- **Recognising government kinds by name.** That breaks the pack boundary.
- **An empty cell for an unknown government.** It reads as a mistake.
- **The ordinary unknown marker for governments.** A release pack refuses unknowns, but an unknown government can be the model's settled answer.
- **Exempting `governments` from the one-writer scan.** The scan's value is that it has no exceptions.
- **A dated table of intelligence chiefs.** No source yet gives a chief's tenure.
- **The holder rule's leniency for chiefs.** A chief of no faction on a faction's post is a data error.

## Consequences

- The research items on territorial departments, the Indian Territory nations, filter posts and chiefs, and the split of regions that span state lines are in `docs/OPEN_QUESTIONS.md`.
- Lane 0.5 wires neutral passage to `regionGovernments` and `closedGovernments`.
