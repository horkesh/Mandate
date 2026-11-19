# 0090: Codex makes the first document decoration, drafts the map icons and gives the desk its keys and skins

Status: accepted (2026-11-17). The owner asked for more work for Codex while their Codex plan lasts (to 22 November 2026). Claude's side of the project stays paused. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0089 (Codex's write scope gains `prototypes/map-icons/`). Amended by 0091 (the staff map is built now, as R18).

## Context

Codex has delivered R1 to R4, R7, R9 and R11 to R14. R14 is the desk prototype (0089). It plays the real game, and one Union turn was played on it on 2026-11-17. Of the requests still in `ASSETS.md` section 12, three are blocked:
- R5 and R6, the real portraits, wait for the browser pass and the rights work.
- R8, the document decoration, waits for the period-conventions research to name its scans.
- R10, the store art, needs R6's photographs and Steam's capsule sizes.

The image-sources note (`docs/research/2026-11-14-portrait-and-image-sources.md`, section 3) already names scans for three of R8's genres: telegrams, General Orders and newspaper front pages. It recommends drawing the telegraph form and the letterhead ourselves. Returns, endorsements and forms of address remain needs-source.

The rest of the unblocked work is procedural: the map icon set (`ASSETS.md` section 1, producer the Phase 2 desk lane), and the keyboard and accessibility of the desk (`PRESENTATION.md` sections 2.6 and 5).

## Decision

Three requests, in this order:
1. **R15, document decoration, first part** (brief 4).
   - **Files:** the telegraph form's header, the General Orders head, the masthead ornament and the two rules.
   - **Sources:** the scans section 3 of the image-sources note names.
   - **Then:** Codex uses the new decoration in the desk prototype's papers of those genres.
   - **Deferred:**
     - the letterhead vignettes, which need the list of issuing posts;
     - the return-form rules, whose source is still needed.
2. **R16, the map icon set, drafted** (brief 1's icons), as authored SVG in a new prototype, `prototypes/map-icons/`.
   - **Checks:** the brief's acceptance tests run as scripts: the 20 px silhouette test, distinct outlines, the three states and simulated colour vision.
   - **Status:** a draft for the Phase 2 desk lane to adopt or replace, not canon.
3. **R17, the desk prototype's keyboard and skins**, inside `prototypes/desk/`.
   - **Keyboard:** the bindings of section 2.6 that have a desk act today, and the key card.
   - **Display options:** type scaling from 80% to 200%, the high-contrast skin and the evening lamp (section 5).
   - **Limits:** no new verbs; the map keys wait for the map.

Codex runs each request from the command line (`codex exec`), started by the lead, one after another. The rules of 0048 and 0089 hold:
- art goes to `art/`;
- Codex never edits `packages/`, `packs/` or `docs/`, and never commits;
- the reviewers check everything at the resume.

Rejected:
- **The staff map (section 6, steps 3 and 4) now.** The pack has no region geometry yet, only the graph and label anchors. The map's look is the desk lane's central design, and the tripwire's open questions belong to it.
- **The audience scene (step 5).** It needs R6's portraits.
- **The Electron build (step 6).** It is worth little before the desk has been reviewed.
- **More generated faces.** The library holds 100, against a demo need of about 12 and a starting library of about 40, and none are reviewed yet.
- **Music.** Not for the demo; its gate needs research first.
- **Waiting for the research lane to source all of R8.** Three of its genres already have named public-domain scans, and the rest can follow as R8's second part.

## Consequences

- `ASSETS.md` section 12 records R15 and R16. `PRESENTATION.md` section 6 points step 2 to R17 as well.
- R8's second part (letterheads and returns) still waits for the period-conventions research.
- If R16's icons are adopted, the Phase 2 desk lane moves them into the era skin's package and owns them from then on.
