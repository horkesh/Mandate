# CLAUDE.md: Mandate

Mandate is a setting-agnostic engine for strategy games in which the player is the political leader of a faction at war and commands only through human proxies who can and do push back. Reference wars: Rome, the US Civil War, Russia–Ukraine. First slice: the Union, 1861–62.

**Phase: M2 built (Audience + Union 1861–62 in a text console).** The kernel runs whole games: directives with latency, compliance and lies, the Audience with typed counters, a coarse theatre, recruitment into posts, the insubordination ladder, rivals, promises, mandate tests, and a bot principal. `npm run play -- union-1861` plays Lincoln in the terminal. Pending: the owner's playtest and calibration. Next is M3, the desk UI and the staff map. There is no UI yet beyond the console and the map prototype. See [docs/ROADMAP.md](docs/ROADMAP.md) and [docs/design/KERNEL.md](docs/design/KERNEL.md).

## Hard rules

1. **The player is the principal** (decision 0001). No verb ever targets a unit or a place. Reject features that put the player back in the general's seat.
2. **Settled decisions are settled.** Read [docs/decisions/](docs/decisions/) before proposing anything they cover. To change one, write a superseding record.
3. **Settings are packs** (0003). No setting names in `packages/`. `npm run check:boundary` enforces this.
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

- `packages/kernel/`: the pure deterministic sim core (module map in `docs/design/KERNEL.md`)
- `packages/cli/`: headless runners that read packs from disk
- `packs/`: setting data (one folder per pack)
- `docs/decisions/`, `docs/design/`, `docs/research/` (dated, sourced), `docs/LESSONS.md`, `docs/OPEN_QUESTIONS.md`
- `tools/`: validators

## Commands

```bash
npm run check            # typecheck + tests + pack boundary (also the pre-commit hook)
npm test                 # vitest
npm run typecheck
npm run check:boundary
npm run demo             # headless demo: three proxies receive the same directive
npm run run:testbed      # M1: a scripted 20-turn headless game on the fictional testbed pack
npm run play -- union-1861       # M2: play Lincoln in the text console (default pack: testbed)
npm run run:pack -- union-1861 75  # watch the generic scripted leader play a pack
```

Hooks: `git config core.hooksPath .githooks`.

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
- Verify a lane's claims on disk before reporting them. The lead merges and commits.
