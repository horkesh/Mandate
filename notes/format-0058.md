# Format 0058: post kind roles, intelligence chiefs, and each region's government

Branch `format-0058`, built on local main 022d568 (the tooling batch) and 789df5a (G3), which descend from origin/main 519bbb8. Decision 0058 amends 0050 and 0055. Three commits, one per field, each with positive controls; both packs validate with 0 errors, and the three signed gate hashes are unchanged.

| Field | Where | Checks |
|---|---|---|
| `PostKindTerm.role`: `filter`, `intelligence` or null | kernel `world/world.ts` (`POST_KIND_ROLES`), manifest schema (default null) | the enum (a shape error otherwise) |
| `PostStart.intelligenceChief`: a person or null | kernel `world/scenario.ts`; posts.csv column `intelligence_chief` | the person exists; their faction is the post's department's (a neutral government's chief serves no faction) |
| `ScenarioStart.governments`: `{ region, department \| 'unknown', provenance }` | kernel `world/scenario.ts` (`GovernmentStart`, `UNKNOWN_GOVERNMENT`); `governments.csv`, required | one row per land region and key point; none on water or off-map; the department exists and is of a government kind; cited; no department may be called `unknown` |
| `State.regionGovernments`, `State.closedGovernments` | kernel `root-state.ts`, `tick/setup.ts`, `ownership.ts` (writer `command`, proposed by situations) | copied from the start in region order; closed starts empty |

## Choices, and what each rejected

1. **Department kinds say which are governments** (`departmentKinds[].government`, default false). "A government department" needed a definition the engine can read without a kind name (hard rule 3), the same way `role` does for posts. *Rejected:* any department (a war ministry would govern a region); recognising `state_government` or `province` by name (breaks the pack boundary); a flag on each department (the kind already says what it is). This is the one shape beyond 0058's text.
2. **`unknown` in governments.csv is a value, not the "needs a source" marker.** It means no known government, so not neutral ground, and 0054's control rule applies; the reason goes in the row's notes, and the row is cited. *Rejected:* an empty cell (reads as a mistake); the ordinary unknown marker (a release pack refuses unknowns, but an unknown government can be a settled fact of the model, as for the Indian Territory nations until research).
3. **Each government row carries provenance**, as obstructions do. *Rejected:* the bare `{ region, department }` pair (a jurisdiction is a fact, and the pack cites every fact).
4. **The State field is `regionGovernments`, not `governments`.** The one-writer scan keys on field names, and `governments` is the start table's key, as `control` is beside `regionControl`. *Rejected:* exempting the scan for this key (the scan's value is that it has no exceptions).
5. **`closedGovernments` maps a department to the day it closed**, like `situationFlags`. *Rejected:* a set or list (the day is free and explains a closing); a field on the department (World data cannot change in play, 0058).
6. **The intelligence chief is a posts.csv column**, read with the post. *Rejected:* a dated table like holders (no source yet gives a chief's tenure; a column is enough until one does).
7. **The chief must match the post's side exactly**, even where the holder check lets a factionless holder pass. *Rejected:* the holder rule's leniency (a chief of no faction on a faction's post is a data error, not a neutral).
8. **Testbed:** a `wire_office` kind (role filter) with one empty filter post per side at its capital, as the stand-in comms World had it; no intelligence posts and no chiefs, because the stand-in had none. Executive and province kinds are governments; the North's regions go to its First Minister's office, the South's to the Southern Council, Lowmarch to its province, and `island_fort` is unknown.
9. **Union pack:** each land region takes the department of the one state its `counties_1861` lie in, from the map draft's region list (`source/drafts/map/regions.csv`), citing MAP-LANE and OOB-LANE. Every `role` and `intelligenceChief` stays null. The importer was not re-run (0056).

## Union regions left unknown

- `it_cherokee_creek`, `it_choctaw_chickasaw`: the Indian Territory nations, until a research lane sources their governments in 1861 (0058).
- `nebraska`, `dakota`, `colorado`, `new_mexico`, `arizona` (New Mexico Territory): the pack has no territorial departments.
- `washington`: the District of Columbia, governed under Congress; no department for it.
- `eastern_shore` (Maryland and Virginia), `new_england` (six states), `michigan_wisconsin`: counties in several states, so no single state government.

## For lane 0.5

- Read `State.regionGovernments` and `State.closedGovernments`; a region is neutral ground when its government is a department with no faction that is not in `closedGovernments`. `unknown` is never neutral.
- Read post roles from `vocabularies.postKinds[].role` and chiefs from `PostStart.intelligenceChief`; no kind names.
- In the Union pack, the eight states uncommitted on 5 March 1861 (Arkansas, Delaware, Kentucky, Maryland, Missouri, North Carolina, Tennessee, Virginia) are state departments with no faction, so their regions are neutral ground until closed or until a situation moves them; `eastern_shore` is unknown, so control decides it.

## Findings outside my scope

1. The Union pack needs departments for the territorial governments and the District if they are to be neutral or governed; a research item.
2. `new_england`, `michigan_wisconsin` and `eastern_shore` span state lines; if their governments matter (Maryland's Eastern Shore in a neutrality situation), the map lane could split them.
3. The shared pre-commit hook path points at the main checkout, whose local main (022d568) is ahead of origin; a branch cut from origin/main cannot commit until it has `tools/staged-check.ts`. This branch is built on that local main for that reason.
