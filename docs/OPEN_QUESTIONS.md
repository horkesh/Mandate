# Open questions for the owner

The owner takes recommendations by default (CLAUDE.md), so this file lists only things that are not design or code decisions, plus lane findings still waiting for a home.

Answered and moved to decisions:
- stack (0002), first slice (0004), living people (0005), Rome's principal (0006), all on 2026-11-13;
- dice (0007), telegraphing (0008), opponents (0009), tempo (0010), multiplayer (0011), porting AWWV (0012), the staff map (0013), all on 2026-11-14;
- licence (0014), the redesign (from 0015 on; see the decisions index), the title (0036), the commercial stance (0037), live AI on Steam (0038), and positioning, price and the go or no-go bands (0039, from the market-research lane), all on 2026-11-14. The lane findings triaged here earlier that day (the player-visible boundary, the verb-list test, run outputs, no copied functions, map provenance, calibration by counts, reputation and nerve, observers, relief modes, Senate lapses, memoirs as weak evidence, AI cabinets agreeing too much) are now in `docs/design/FOUNDATION.md` and those records.

## Parked

- **Clear the title before it is used publicly** (0036): run the manual register searches listed in section 9 of `docs/research/2026-11-14-name-collisions.md` (USPTO advanced search, EUIPO, TMview, WIPO), re-run the Steam search, and have a trademark attorney clear *By Order of the President* before marketing or a store listing. Studio domains: `pyrrhic.com` is parked for sale; `pyrrhicgames.com` and `pyrrhicstudio.com` had no DNS on 2026-11-14 (check only; buying is the owner's call).
- **Before any live AI-generated text ships** (AI-players lane): Steam requires a disclosure of AI content and a description of guardrails; check the licence of any local model before bundling it; AI voice acting raises union issues (SAG-AFTRA's charge over Fortnite's AI Vader). Source: `docs/research/2026-11-14-ai-players.md`.
- **Ask Valve about bring-your-own-key AI** (0038): once a Steamworks partner account exists. Until Valve answers, the Steam build ships template voices only.
- **Open gate records R1–R7** (docs/design/SENSITIVE-HISTORY.md section 4; accepted by 0046): R1 a playable Confederacy, R2 Black military service, R3 the wars against Native nations, R4 prisoners, exchange and retaliation, R5 verdict text, R6 civilians, guerrilla war and commanders' conduct, R7 emancipation and fugitive policy. R2 and R3 block the 1861–62 slice's release, and R4 is now in the slice as a fifth ship-blocker (amendment merged 1dbb767).
- **What the gate-and-catalogue facts note informs** (docs/research/2026-11-14-gate-and-catalogue-facts.md, merged; both reviewers approved): it meets most of the research prerequisite for R3 (the Dakota war and Indian Territory: causes, the commission, the count with each number sourced, the advisers, the 1863 acts). Still open: R3 itself must be written, with the Dakota-voiced sources it lists as unread leads; R2 is a decision record, not research, so it stays open; union-freedpeople-camps is not researched and still blocks the slice; East Tennessee repression and camp conditions are not researched. The lead decided the follow-ups: R4 (`prisoners-and-exchange`) moved into the slice, and the register text on Brown and the legislators and on Watie's figure was corrected (1dbb767).
- **LOC item-level rights pass (owner, a person):** the Library of Congress shows a Cloudflare bot check even in a real browser, and no asset tool can automate it (reviewer, `review-research-images.md`). Before Codex's portrait pilot (McClellan and Stanton), a person records each demo portrait's Rights Advisory and reproduction number from its LOC item page. 17 of the 24 demo cast are ready for that pass (presentation lane).
- **Which plan Codex runs on** (owner, 0051): not yet decided. The lawyer consultation is filed under Codex and legal below.
- **Gate records and the presentation design** (gate review of the presentation design, eview-gate-presentation.md): R3 decides how Native nations appear on the map; until it does, their lands are labelled with their own names and not hidden under either side's colours. R1, a playable Confederacy, would need its own symbol rules. Decoration, symbol and music rules are already in CODEX.md (135933c).
- **A 16:10 test machine** (owner, 0049): whether to have one, since 0049 says 16:10 is checked before release (reviewer's presentation review).
- **Cloud environment hosts:** the owner kept the five hosts the cloud lanes added to the cloud environment.
- **Verification pass on the data drafts** (packs/union-1861/source/drafts/): the drafts carry items marked unresolved: the McClellan 28 June 1862 telegram, the Senate Executive Journal, and primary citations for the cabinet rows. Run a verification pass once HathiTrust and the Library of Congress are reachable.
- **Map licence emails** (0031): three drafts are in the owner's Gmail (2026-11-14): the Newberry Library (addressed to its rights team), Jeremy Atack (jeremy.atack@vanderbilt.edu, from https://my.vanderbilt.edu/jeremyatack/contact/) and the University of Nebraska's railroad project (cdrh@unl.edu, named for copyright inquiries on https://railroads.unl.edu/about/copyright.html). All three are unsent; the owner reviews and sends them. The Atack data page states no licence for the shapefiles, only a suggested citation.
- **Sensitivity policy for living people** (0005, item 3) needs the owner's sign-off before any contemporary pack ships.
- **Competitor to watch:** Broken Rift: Dominion, a 4X game with offline LLM diplomacy, reportedly planned for Q4 2026 (seen only in a search snippet).

## Lane findings waiting for a home

- **War Resilience** (games survey): AGEoD lets a losing side that still holds its capital regain morale, to stop runaway collapse. A candidate for the Phase 1 politics design.
- **The dispatch-log UI precedent** (games survey): Grand Tactician delivers events as telegrams in a dispatch log and presents its manual as an 1862 drill book. Study it before the Phase 2 desk.
- **AI seats as a health check** (AWWV-architecture lane): AWWV's three LLM commanders filed 321 typed observations, which its team came to trust more than the calibration percentage. Build the observation channel with the first AI seat.
- **Licence pages to read in a browser** (map lane): NHGIS, the Library of Congress and the National Park Service refused automated fetches. Read and archive them before lane 0.3 commits map data.
- **Sourced first-period events** (map lane): Lincoln's review of the Dakota War death sentences in December 1862 (sources disagree on 38 or 39 approved; check before authoring, under the gate) and the Trent affair (17–19 days for news to cross to Europe). Candidates for the situations in Phase 1. The Dakota review is on hold until a decision record on the wars against Native nations exists (the gate checklist's R3, under review).
- **Phase 1 research lanes already identified** (secession-winter lane): a Confederate-side situation set (Davis's cabinet, Beauregard, the upper-South conventions); the navy seat (Welles, Fox, the Strategy Board, the officers who resigned); the War Department seat (Cameron, patronage, contracts, the railways). Also check the Union dossier's Anaconda entry (a 3 May 1861 Scott letter to McClellan) and the Official Records' quota table.
- **Situation design notes** (secession-winter lane): the decision to fire on Sumter was already taken in Richmond, so the player's levers are evacuate or relieve, notice and timing, and the firing is the labelled railroad (0028); the call for 75,000 volunteers, not Sumter alone, moved Virginia, North Carolina, Tennessee and Arkansas, so it needs its own situation; the note proposes starting control and loyalty for each border state; Congress did not sit from 4 March to 4 July 1861, so the calls for troops, the blockade and the habeas order were executive acts ratified later, and the politics model needs a "Congress not sitting" state that changes which actions are legal and what Lincoln must answer for when it returns.
- **Event caps defer rather than drop** (AWWV-architecture lane): for the situations engine (Phase 0, lane 0.7).
- **Situations catalogue gaps** (docs/design/SITUATIONS-1861-62.md, proposal): its research gaps, the facts that block situation authoring, are with a cloud research lane. The catalogue recommends an early-March-1862 scenario for the public demo.

### Routed from the lead's private notes (L17), by lane or phase

Source names: the lane notes are in the lead's shared notes folder (`lead-routing-notes.md`, `lead-queued-lanes.md`) and the research notes under `docs/research/`. Dropped as done: lane 0.1's work, the tripwire, the gate checklist and its Confederate, navy, politics and economy placements (all in `docs/design/SENSITIVE-HISTORY.md`), the catalogue, neutral option wording and the 0040 live-state items (FOUNDATION), the Confederate-will note (PR 2) and the `run:headless`, `check:licences` and `pack:*` commands.

**Lane 0.3 (Union data) and the map and posts data lanes**
- Tripwire close-out (0043): `npm run measure` in `prototypes/map-tripwire/` needs the regions as lon/lat GeoJSON with `properties.kind` (land, river, or a region), `properties.name`, optional `id` and `controlA`, and a `projection` member (else it fits its own conic). Keep `glsync=1`, or bake timings read about 100 times low. Expect per-tile cost to rise with real vertex counts.
- Provenance: Natural Earth is the only geometry source confirmed public domain (terms read 2026-11-14); the Census licence stays unconfirmed. census.gov blocks this machine's IP (Cloudflare 403), so the local pipeline must not fetch from it; do not brief the Wayback route (the permission system refused it as routing around the block).
- From lane 0.2's close-out: the first commit with `packs/union-1861/pack.json` must generate clean (or build the pack up on a branch), because `npm test` checks every pack with a manifest; settle region ids before writing forts' `commands_edges`, `obstructions.csv` and `edge_conditions.csv` (edge ids derive from their ends), or give those edges explicit ids; author lane 0.3's own vocabularies (ranks with seniority above all) and source registry, not the fit test's scaffold; the people roster has no priority column (image-sources note).
- From lane 0.4's report: the World has no telegraph data, so every held land region counts as wired. Whether wires follow the railways needs a format flag and data (lane 0.3 or the format).
- Person ids use the convention surname_firstgiven_initials (`lee_robert_e`).
- Navy data (navy note): pre-Sumter navy holders for March 1861 are not yet covered; the Western Flotilla belongs to the Army until 1 October 1862, then the Navy (a post changing department); the Strategy Board is a temporary post; squadrons are created by directive during play, not all at start.
- Anderson's 28 February 1861 strength figure differs between his letter as printed (70,000) and Holt's covering letter (20,000): carry the figure Lincoln read once known (March facts note).
- Source fixes: the Union dossier's Johnston seniority episode is fixed (the verification pass, PR 1, cited OR IV,1 pp. 605–11, OR I,2 p. 985 and the Confederate Congress journal, and marked the blog superseded); the Confederate-side note's command-friction episodes rest on secondary pages, so pull the Official Records dispatches before pack data cites them.

**Lanes 0.4 and 0.5 (derived indexes; forces and movement)**
- The M2 names (RegionId and similar) are not retired: lane 0.2 kept the `ids` namespace, since retiring it touches M2's aliases; it goes when lanes 0.4 and 0.5 replace M2 (0050).
- From lane 0.4's report, seams for lane 0.5: the tick still treats the network as intact; no mechanism proposes control changes yet; the seats layer's latency should read `wireOwnerOf`; nothing calls supply allocation yet; control changes currently run after the stand-in standing-goal step and must run after movement and combat once lane 0.5 lands them (FOUNDATION section 10's order).
- Every new State field needs an `OWNED_FIELDS` entry in `packages/kernel/src/ownership.ts`; owned keys must be unique across State records (lane 0.1 hand-over, `notes/lane-0.1-foundations.md`).
- Edges and regions (navy note): river and sea edges need depth by season and an obstruction state; fort regions need a passage-versus-reduction flag; naval bases are key points; blockade-running ports are off-map boxes. A support request needs three terms: the commander's compliance, his department's consent, and physical limits (depth, season, passage).
- From lane 0.6: two World models exist (lane 0.2's `world` and lane 0.6's stand-in); unify them when M2 is replaced.
- From lane 0.6: the testbed save fixture (`packages/cli/test/fixtures/saves/testbed-seats-day40.json`) fails its resume test on any new State field. Before a public build, regenerate it with `npx tsx tools/make-save-fixture.ts` and say so in the commit; after one, it needs a schema bump and a migration.
- Forces need a stragglers and absent field (rejoin over days); writer-table rows are needed for battle records (owner `combat`) and for fortification, which 0029 does not give a writer (combat note).

**Lane 0.6 (seats)**
- Cross-service orders are a refusal path: compliance must weigh which department an order comes from (Captain Adams refused Scott's order partly for that reason); Seward as shadow executive is a case for seat initiative (0040) (March facts note).

**Lane 0.7 (situations)**
- From lane 0.6: options that issue orders need a kernel path, since the kernel takes orders only from a principal, by courier, special messenger or wire. The ruling goes into decision 0052 (the lead is writing it).
- Event caps defer rather than drop (AWWV lane; also listed above).
- Authors follow `SENSITIVE-HISTORY.md` over the older gate tables in the secession (6.8), union-politics and confederate-side (4.7) notes (0046).
- Test fixtures under `packages/` use the fictional testbed register, never Civil War terms (`check:boundary` flags them).
- 0042 parks an optional "draft the address with advisers" prologue until the March situations exist.
- Scenario setup: whether S33, compensated emancipation (proposed 6 March 1862), is already resolved at the demo's 8 March start is a call for the demo scenario's author (gate review of the presentation design).
- Unverified: the FIRST-MONTH document may still date the Pickens situation 4 March; the author of the March 1861 situations checks it against 0042 (situations start on 5 March).

**Lane 0.8 (headless runner)**
- From lane 0.6: `playDays` and `replay` hash every day with no switch, so add a checkpoints-only option for Monte Carlo runs (0044); normal play leaves the `freeze` option off; `compare-runs` matches on pack and `kernel`, so a Phase 0 runner needs its own `kernel` value or must replace the `run:seats` step.
- Phase 0's day tick must hash each day with `canonicalHash` (lane 0.5 or 0.8); M2 hashes per turn.
- From lane 0.4: its performance test has about 1.8x headroom on Windows CI (8.2 ms against a 15 ms bound). If it flakes, raise the bound; do not skip the test (lane 0.8 and CI).
- The liveness gate is a skeleton (12 M2 mechanics at minFires 0); lane 0.8 sets the Phase 0 bands.
- The testbed reference run never fires audience, honour or pressure verbs, rivals or broken promises, so the M2 people core is barely exercised headless; it needs a script or rule seat that does (also for Phase 1's people recast).

**Any lane that adds phases to the tick**
- The standing-goal menus are built first, from the morning's State (lane 0.6; also in 0052).

**Tooling, small, after lane 0.1 (lead queued them)**
- An `npm run check` check that every decision file is in the index and the index's amendment notes match each record's Status line (hard rule 7; my own repeat duty).
- The pre-commit hook checks the working tree, not the staged tree, so intermediate commits beside unstaged edits are never checked alone: check the staged tree, or rely on CI per commit.
- App-created worktrees set `core.hooksPath` to the main checkout's absolute `.githooks`, so a lane's own hook changes do not run in its worktree until merged. Low impact (CI covers); a candidate LESSONS entry; it is app-managed config.
- From lane 0.6 (finding 3): replace the growing `IMMUTABLE_STATE_KEYS` list (68 keys) with a per-record "immutable record" declaration in `ownership.ts`, a change to the one-writer scanner.

**Phase 1**
- Combat (combat note and model proposal): one battle per day per region; men in contact are the lesser of those engaged, capped by frontage; five battle types with base loss rates; additive typed terms; one named stream per battle-day with fixed draws; commanders decide commit, stand or pursue without dice; missing go to stragglers; rout by morale does not kill; destruction only when cut off; a four-phase template drives hour-stamped dispatches. Generals killed or wounded need their own named stream with fixed draws per day, and generated colonels need a stream keyed by report, so reading a report cannot shift later draws. Livermore's public-domain tables become a calibration fixture for a CI harness of named set-ups; the ODC-BY acw-battle-data CSV is a cross-check only. Cite Livermore, not Kirkpatrick's ambiguous abstract.
- Politics (politics note): seven blocs proposed (Radicals with abolitionists 18, Moderates 25, War Democrats 20, Peace Democrats 12, Border Unionists 13, the army 12), with the Democratic total held at 28–36; Congress as a session calendar; the Joint Committee as an investigating seat that leaks; papers as typed authors; suppression as a lever with a locked cost; governors and state legislatures as election-rule seats with a "state electoral law" field before the election mechanic (soldier voting depended on state law). Verify vote totals and the draft table against the Congressional Globe and the Official Records.
- Economy (economy note): money has two holders (Treasury: bonds and notes; Congress: taxes and the greenback limit), with the gold premium as the confidence meter; new regiments belong to governors, refills to the War Department and, from 1863, the Provost Marshal General; munitions run through Ripley and Meigs; rail is capacity per named line, owned by railroad presidents; Britain's 1861–62 saltpeter ban and Stanton's January 1862 voiding of foreign arms contracts tie the foreign clock to munitions; the commissary is a possible fifth supply line not named in 0023; governors held money and arms in 1861 (state loans, arms purchases competing with Ordnance); "act now, ratify later" (the 3 May 1861 call) is a candidate verb that costs legitimacy rather than a vote, to weigh against 0016, 0023 and 0040. Navy: prize money and cotton tie naval conduct to the Treasury seat and trade permits.
- Research needed for situations and document templates (presentation lane, out of scope there): returns, endorsements and forms of address in 1861–62 War and Navy Department paperwork.
- March 1861 facts note: Lincoln's health was strained on 28 March and 1 April (attention modifiers, 0025); the Pickens expedition was paid from the State Department's secret-service fund (a lever). Next verification pass: the Senate Executive Journal, the Navy Official Records vol. 4 (Fox's account), Northern papers via HathiTrust (also in the parked verification item).

**Phase 2 (desk and map)**
- Tripwire measurements cover only the RX 7800 XT; integrated GPUs, the Steam Deck and Electron's Chromium are untested, and WebGPU and an OffscreenCanvas worker bake are untried. The prototype points Playwright 1.65 at the installed chromium-1234 (`CHROMIUM_PATH` overrides); adopting Playwright for screenshots means `npx playwright install`, a browser download that is the owner's call.

**Pack format and Phase 2 (images and assets; from the image-sources note)**
- Images need a provenance schema and validator in the pack.
- loc.gov limits automated requests (10 a minute) and blocks addresses, so asset ingest must be manual or rate-limited.
- Before Codex's portrait pilot, someone with a browser checks the Library of Congress item pages and the National Portrait Gallery's terms for the demo cast (the owner's).

**Codex and legal (from the Codex-terms note)**
- Whether the PolyForm licence does anything for files with no copyright (AI-made art): a question for the lawyer.
- The store-page AI disclosure wording is drafted in the repo before submission, alongside 0038's question to Valve.
- Re-check OpenAI's terms (see `docs/research/2026-11-14-codex-output-terms.md`, merged) before Codex's first delivery and again before Steam submission (they changed on 2026-11-13; new usage policies take effect on 2026-11-20).
- One short lawyer consultation, covering real-person likeness references, scripted tool use and PolyForm: the owner's spending call (0037).
- Both image research notes are now on main (`docs/research/2026-11-14-codex-output-terms.md` and `docs/research/2026-11-14-portrait-and-image-sources.md`). `docs/design/ASSETS.md` (not yet on main) should cite them by those paths, not as branches under review (presentation lane, item 4).
- The handwriting typeface the presentation design proposes needs a licence check, and 0035's typeface list needs amending if it is adopted (reviewer's presentation review).
