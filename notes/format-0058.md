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

## S71: institutional office role (proposed extension, 23 November 2026)

Scope: extend `PostKindTerm.role` with `office`. A national institutional office
uses its government's current seat even when it directly commands distant forces;
its returns remain office reports. Field headquarters continue to follow their main
body. No new State field, writer or save migration is needed. The Union pack
declares this role on its cabinet kind; the kernel reads only the role. Neutral
offices retain their declared local seat. Existing received papers are dated evidence
and are never rewritten when the government moves.

Validation plan: first reproduce the headquarters/report errors in the generic
capital fixture and pass the corrected focused tests. Check local workspace aliases,
typecheck, rules (zero new/changed/stale findings), boundary, pack generation and
validation, paired-State and one-writer tests. Then run one full suite with
`MANDATE_NO_GIT=1`, `--maxWorkers=1` and retained JSON/logs (about nine minutes),
followed by one reference pair (120-day testbed / 148-day history, daily hashes,
replay, saved-log and resume checks). Compare every daily hash, counter, score and
summary field to S68's unchanged S67 references. Capture office locations, Pickens
and the Manassas notice in that same pair. Stop expensive retries on surprises,
inspect all failure categories and verify corrections cheaply. No done check,
commit, staging, hook bypass, push, browser or desktop control.

No additional sourced government move is needed: the existing
`confederate_capital_moved` notice implements the government's own act under
the Virginia-secession prerequisite, not a bare clock mutation. Its original
citations and signature status remain unchanged. Source reading and final results
will be retained under `runs/s71/`; the completed receipt belongs in this section.

### Settled evidence and limits

S71 only, `C:/Pyrrhic/sprint-office`, `sprint/office`, unchanged
`febfd38ca2241e35e8ab1013857470b7c0e4b45f`. All 18 delivery paths are unstaged
above the exact S68 index (`955c4772a4066f13edb482dfadce55fea32aa26a`). No
commit, staging, push, history rewrite, hook bypass, signature, browser or desktop
control. No other sprint worktree was accessed. Only the named main coordination
file/decisions and external retained sources were read outside this worktree.

Re-read selected primary Cornell OCR with printed headings: OR IV-1 pp.342–343,
the resolution approved 21 May authorizing removal of the executive departments;
p.354, General Orders 8 of 25 May directing the War Department bureaus and their
officers to Richmond; p.361, Davis's Richmond-dated telegram of 29 May. Source:
`https://archive.org/details/cu31924079579524`; retained OCR SHA-256
`aa23178b67455b5dd5c8d2589e9ac0fcbdaf82eaac29bc4411f625db69cbb2d4`.
The pack already has that sourced government act, so no new move or dated
department arrival was added. The office follows the government's modeled seat;
this does not assert that every historical department arrived on that exact day.
Primary reading extracts and failed HTTP challenge pages stay outside worktrees,
under `C:/Pyrrhic/mandate-research-sources/S71/`; receipt: `runs/s71/source-receipt.json`.

| Requested observation | Result and cause |
|---|---|
| Welles | Washington from the opening and throughout the reference, replacing `pennsylvania_north` under the old strongest-block rule (directly assigned `fb_us_ship_michigan`). The explicit office role overrides force location. |
| Walker from June | Richmond in every June/July observation. Headquarters changes on day 85, 29 May, when the existing government notice changes `command`'s capital. His opening post seat remains Montgomery in the declaration; it is not copied into a second mutable seat field. |
| Pickens | This supplied base still has the older `pickens_refused` condition, and its history default records day 32, 6 April. Every daily decision counter is unchanged. **S58's receipt-gated Navy notice is absent here.** The lead's S58 status reports the 12 April regression on that other stack; S71 does not establish the combined S58+S71 decision date. A same-ground route probe shows Welles's in-person leg going from five typical riding days to zero, with wire/mail probes separately retained; this is not an S58 replay or an observed six-day arrival. |
| Manassas notice | It never fires in this reference because the July army/advance prerequisite is still absent. The day-142 analytical probe now uses Richmond to Richmond, zero days, instead of Montgomery to Richmond, four days (wire zero plus four days from the wire). No actual Manassas delivery, intermediate wire path or new army contact is claimed. |

Three new capital-fixture regressions first failed on the old headquarters/report
rules, then passed. They cover directly assigned remote forces, opening
headquarters, field/office classification, office words based only on held returns,
the government act, save/resume and unchanged old received reports/force locations.
The focused run passes **101 tests in eight files**, including paired-State,
sender-belief, report-delivery, control-report and one-writer checks.

One full suite: **exit 1, 571.408 seconds; 210 files pass / four fail;
1,995 tests pass / five fail / three optional skips**. Four failed assertions are
the retained July contracts: R86's battle dispatch, Union liveness, and the
done-check criterion/positive control. The fifth was the old world-format assertion
that every kind role is null. S71 explicitly authorizes the cabinet role: that
single line now requires exactly `{id: cabinet, role: office}`, preserving Nicolay's
null role, the absence of filter/intelligence roles and every other assertion.
Its targeted correction passes **all 19 tests**. No production code changed after
the full suite, and the unaffected suite evidence is reused. No full-suite retry
or standalone done-check campaign occurred; the required full suite includes the
existing done-check unit file. Failures and correction remain separately retained.

Typecheck, boundary, pack validation, generated pack/schema freshness, licences
and the 106-decision index pass. Rules pass with **zero new, changed or stale
findings**. Exactly three projection classification hashes are refreshed:
`principalMenu`, `pendingRequests`, and `viewFor`. The audit proves the protected
reader identities are unchanged; changed closure units are only headquarters,
the public post role helper and the institutional menu distinction. Checker code,
baseline findings, exemptions, liveness bands, signed content and hooks remain
unchanged. These narrow classification changes are proposed for lead review,
not an independent review or gate signature.

Each reference ran once: **120 testbed / 148 history days**, zero rejections,
**268 replayed daily hashes**, matching saved-log replay and resumed finals.
S68 explicitly reused S67's references because its changes were fixtures and a
band, so those exact local portable summaries are the comparison baseline.
Testbed is identical in every field. History's initial State hash is identical;
its World hash changes only through the declared role. **All 148 daily hashes**
change through the report population and later office routing; every before/after
hash and cause is in `runs/s71/comparison.json`. **All checkpoint scores remain
identical**, as do total log entries, rejections and decision points.

| Counter | Before → after (fires unless specified) | Mechanism |
|---|---|---|
| `messages.sent` | 13,078 → 12,995 | Welles produces office words rather than field reports and is excluded from field orders; this is the net across interacting paths. |
| `messages.delivered` | 12,360 → 12,273 | Changed envelope population and office-to-principal routing change the day-148 delivered horizon. |
| `messages.courier_delay` | 167 → 156 | Office reports no longer ride from a remote directly assigned force; Walker reports follow the new government seat. |
| `messages.mail_delay` | 2,732 → 2,721 | Welles no longer produces the field strength-return mail stream. |
| `knowledge.pruned_superseded` | magnitude 10,363 → 10,272; fires stay 146 | Changed report population/timing leaves fewer superseded records for the unchanged pruner. |

These are observed aggregate deltas and mechanism-level explanations; interacting
contributions were not separately campaigned. All **312 changed daily fields**
are retained with causes. They concern message counts and earlier notice
surfacing from the corrected office; every daily decision count stays exact.
The same **18 liveness problems** remain. No floor, July criterion or accepted
assertion is waived. No performance campaign or hosted timing certification is
claimed. Runtime/host diagnostics are retained alongside the logs.

Inventories, runtime diagnostics and preservation checks preceded these results.
All **2,052 original paths** remain; **2,034 are byte-identical**, with 18
authorized changed paths and no untracked delivery. Every index mode/blob/path
matches the supplied S68 base. Final unstaged recovery patch:
`runs/s71/office-delta.patch`; its exact size, SHA-256 and applicability checks
are in `runs/s71/final-receipt.json`. Inputs, receipts, failures, raw logs,
reference saves/finals/events, routes, hash/counter/daily/score comparisons and
closure evidence all remain in `runs/s71/`.

Proposed ruling: retain the pack-declared office role and three narrow projection
hashes. Retain the already sourced government act and dated papers. Reject a
cabinet-kind check in the kernel, duplicated mutable office-seat State, moving
forces to fix a headquarters, changing old report claims/dates, a bare calendar
move, fabricated notice delivery or a claimed S58 timing pass without that stack.
For the lead: review the office delta and classifications with the staged base;
integrate S70 separately; then verify S58's coupled receipt timing and actual
Manassas delivery when those prerequisites are available.

### Findings outside my scope

S70/S72 and the July named-army build; S58 integration and its coupled Pickens
date; inherited July/contact/checkpoint/pushback and lever-placement criteria;
whole-branch and gate review, canon acceptance, main integration, performance
certification, release and pushing. Nothing is signed or cleared for main.


## Dated doctrine posture

A rule-seat dated goal may specify `posture` (`hold`, `relieve`, `take`); omitted means the existing `take`. The received doctrine view carries the same optional value. Orders use the ordinary attention, relay, compliance, planning and movement path. S78 uses this for Scott's containment instruction to Patterson (OR I-II pp.725,166-168) and his later Harpers Ferry hold (p.173). The existing geographic hold cannot guarantee that an enemy is pinned.
