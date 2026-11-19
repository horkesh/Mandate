# CLAUDE.md: By Order of the President

*By Order of the President* (0036) is a strategy game, built on an engine codenamed **Mandate** for wars with fronts, in which the player is the political leader of a faction at war and commands only through people who can and do push back. First game: the American Civil War, 1861–65; you play Lincoln (0018).

**Phase: Phase 0 closed (0072); Phase 1 planned (0073), milestone 1A next.** The game and kernel were redesigned on 2026-11-14 (goals and plans as arrows, hidden stats and assessment, seats, variable turns of up to a week, regions over a typed graph). The design is [docs/design/FOUNDATION.md](docs/design/FOUNDATION.md), accepted through the decision records from 0015 on (see [the index](docs/decisions/README.md)); its section 12 is the phase plan. The kernel (the new State, seats, situations, forces, the planner, operations, combat, people and politics) is in `packages/kernel`, and the text console plays it (`npm run play -- union-1861`). M2's kernel retired in lane 1.13; [docs/design/KERNEL.md](docs/design/KERNEL.md) describes it for the record.

## Hard rules

1. **The player is the principal** (0016, which supersedes 0001). The player never moves a division. A verb may name a place only as part of an order to a person (a goal, or an edit to a commander's plan within the edit grammar of 0026). Reject features that put the player back in the general's seat.
2. **Settled decisions are settled.** Read [docs/decisions/](docs/decisions/) before proposing anything they cover. To change one, write a superseding record.
3. **Settings are packs** (0003, test amended by 0024). No setting names in `packages/`. `npm run check:boundary` enforces this.
4. **Determinism** (0002). The kernel uses integer permille math only. No `Math.random`, `Date`, I/O, `localeCompare` or transcendental `Math`. Randomness comes from named seeded streams. Enforced by `packages/kernel/test/banned-apis.test.ts`.
5. **One owner per truth.** Every piece of state has exactly one writer. Derived data is recomputed, never saved. (This was AWWV's most expensive lesson.)
6. **Every number is explainable.** Mechanisms return their contributing terms and typed reasons, not only a result.
7. **Rules that matter become checks.** If a rule keeps being broken, write a test, validator or hook, not another paragraph.

## Canon precedence (highest wins)

1. `docs/decisions/`, accepted records
2. `docs/VISION.md`
3. `docs/design/` (proposals are only proposals until a record accepts them)
4. Everything else (research notes, agent memory)

## Where things live

- `packages/kernel/`: the pure deterministic sim core (its module map is `docs/design/FOUNDATION.md` section 10)
- `packages/cli/`: headless runners that read packs from disk
- `packs/`: setting data (one folder per pack)
- `docs/decisions/`, `docs/design/`, `docs/research/` (dated, sourced), `docs/LESSONS.md`, `docs/OPEN_QUESTIONS.md`
- `tools/`: validators
- `CODEX.md`: the one coordination file through which Claude writes requests for Codex: assets (0048), the prototypes in `prototypes/desk/` and `prototypes/map-icons/` (0089, 0090), coding tasks run through Codex's command line (0092), and the paused 1A lanes, which Codex now implements while it reviews Claude's work (0096)

## Commands

```bash
npm run check            # typecheck + tests + pack boundary + licences (also the pre-commit hook)
npm test                 # vitest
MANDATE_TIMING=1 npm test  # also run the wall-clock budget tests (CI's Linux job does; the pre-commit hook skips them)
npm run typecheck
npm run check:boundary
npm run check:licences  # dependency-licence check over every lockfile
npm run check:decisions  # every decision record has an index row, and the index's amendment notes match each record's Status
npm run demo             # headless demo: three testbed commanders read the same order (the people core on the new State)
npm run run:phase0         # Phase 0 runner on the new kernel (reference runs with the liveness gate)
npm run run:done-check     # the Phase 0 done check: six criteria, each PASS or FAIL (also run in CI)
npm run run:seats          # Phase 0 seats runner (rule seats, knowledge, command log); on union-1861 it is now a peace run
npm run pack:generate -- <pack>   # (also pack:validate, pack:schemas) world format v2: generate, validate and publish schemas for a pack
npm run play -- union-1861       # play Lincoln in the text console: turns of up to a week (default pack: testbed; --at-war opens the war)
```

Hooks: `git config core.hooksPath .githooks`. The pre-commit hook checks exactly the staged tree, in a private snapshot when the working tree differs from the index.

## Working style

- The owner wants proposals and pushback, not option menus. Recommend one thing and say why.
- **The owner takes the recommendation by default** (stated 2026-11-14). Don't stop to ask. Decide, record an accepted decision record that names the alternatives you rejected, and proceed. Stop only for things outside design and code: money, publishing, outward-facing or irreversible actions. The owner can overturn a decision at any time by superseding it.
- Git history is the ledger. Don't write changelogs into canon docs.
- Edit an existing doc rather than creating a new process document.
- Related repos: `F:\A-War-Without-Victory` (AWWV, the ancestor premise) and `F:\Star Trek` (Starfleet Career, the source of the pack and process patterns). Mine them; don't copy their process weight.

## How work is run

The main session is the lead; work goes to lanes (separate sessions) with written briefs. Read [docs/LANES.md](docs/LANES.md) before opening or closing a lane. The rules that bite most often:

- Facts about the world come from a research lane, never from the lead's memory.
- Lanes send questions to the lead by `SendMessage`, never through wrap-up, and end with "Findings outside my scope".
- Verify a lane's claims on disk before reporting them. Every review is a lane, never a subagent. The steward merges accepted work; the lead decides and records (0045).
- Read every lane report in full, never just its preview, and route every item in the same turn; sweep the lanes every 20 minutes while any run (L17, `docs/LANES.md` "Collecting reports").
