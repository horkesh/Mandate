# 0089: Codex builds a desk prototype on the console's driver

Status: accepted (2026-11-17). The owner asked whether Codex could build a playable desk too, pointing to the room screen of their earlier game (AWWV). Their larger Codex plan runs to 22 November 2026, and Claude's side of the project is paused to save tokens. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0048 (what Codex may write).

## Context

`PRESENTATION.md` section 6 plans the desk in steps: the console first (built in lane 1.13, 0088), then in Phase 2 the React desk without the map (step 2), the staff map (steps 3 and 4), the audience scene and the battle night (step 5), and the desktop build (step 6). The desk's art is mostly delivered (R1 to R4, R9, and the sounds in R7 and R11), and the store art (R10) waits for a playable desk. The console's driver, `ConsoleGame` (`packages/cli/src/console/game.ts`), already hands its renderer only what the player may see: the morning's request (his view and his menu), each day's new reports, the refusals of his orders and his decision points.

AWWV's Dayton room (`F:\A-War-Without-Victory\src\ui\map\dayton_conference\`, read on 2026-11-17) is the precedent. Codex made its art, and it was built in React and Vite:
- **Objects:** each object in the room is a positioned button that opens a panel.
- **Panels:** one shared modal owns opening, closing, Escape, the focus trap and returning focus to the object that opened it. The room goes inert while a panel is open.
- **Fallback:** a labelled bar repeats every object for the keyboard.
- **Writes:** they pass through one adapter, and reads never start anything.
- **Two lessons from it:**
  - The owner's review found its first version an empty room wrapped around the old form; its plan's rule became "the room must not wrap the old form".
  - Its interface imported simulation modules directly. That is the one part this desk must not copy.

## Decision

**Codex builds step 2 now, as a prototype in `prototypes/desk/`.**
- **Stack:** React 19 with Vite and TypeScript (0035), the self-hosted SIL Open Font Licence faces 0035 names, and the art in `art/`.
- **It plays the real game through the console's driver.** `ConsoleGame` runs in a local Node process (a Vite dev-server middleware or a small local server, never a remote one). The browser receives only what the console's desk layer receives, as JSON: the morning's request, each turn's days with their reports and refusals, the decision points and the pack's strings. It sends back only the player's orders, as the console's commands. It never sees `ConsoleGame.state`, `ConsoleGame.world` or anything else of the truth (0052, gate B9).
- **The browser's code imports the kernel only as types from `@mandate/kernel/seat-api`**, the rule the boundary test applies to player-facing packages.
- **No new verbs.** Every act on the desk is one the console already offers; a place is named only inside an order to a person (hard rule 1, 0016, 0026). The map's place shows the text twin, as step 2 says.
- **Every word comes from a string table** (0030): the pack's strings, or a desk string table in the prototype for chrome.
- **Codex writes only in `prototypes/desk/`, `art/` and `CODEX.md`.** It never edits `packages/`, `packs/` or `docs/`; when the desk needs something from them, it asks in `CODEX.md`. It doesn't commit; the lead commits after review, as with art.
- **A prototype, not canon.** When Phase 2 opens, the desk lane decides whether to promote it to a package and extracts the shared presenter that section 6 proposes ("one presenter, two renderers").

Rejected:
- **Waiting for the Phase 2 desk lane.** It costs Claude's tokens while the project is paused, and misses the Codex plan's window; the store art and the demo both need a playable desk.
- **Codex building in `packages/` now.** The milestone 1A lanes have unmerged branches in `packages/cli` and the kernel, so it would collide with them, and it would make the prototype canon before anyone has reviewed it.
- **A desk with its own way into the kernel.** Reading the State or the World directly would break the seat boundary (0052) and invite verbs the console doesn't have.
- **Building the shared presenter now.** It is the desk lane's design, in lane-owned files.

## Consequences

- 0048's write scope gains `prototypes/desk/` for this work.
- The standing reviewer and the gate reviewer review the prototype when the project resumes, against this record and `PRESENTATION.md` sections 1, 2 and 5.
- The 1A lanes still change the console's driver. The prototype keeps its contact with it in one adapter module, so a change there is a local fix.
