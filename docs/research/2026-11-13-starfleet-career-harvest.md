# Research: what to harvest from Starfleet Career (`F:\Star Trek`)

Date: 2026-11-13. Status: research note (not canon). The source repo is the owner's own pre-production TNG officer-career game (C#/.NET sim + Godot presentation).

## Decision records worth carrying over (theirs → ours)

| Theirs | Idea | Our adaptation |
|---|---|---|
| 0001 Hybrid architecture | Deterministic systems own all truth; narrator only writes prose | Carry over verbatim |
| 0004 / 0011 Canon happens | Headline canon fires on schedule; player owns local outcomes; canon events are timeline data with a future "drift" toggle | **Cannot carry over as-is**: our player *is* the leader, so their choices are headline causes. Keep "events as dated data" and "drift toggle"; decide history policy fresh (see our 0003) |
| 0006 Godot + C# | Sim is a plain .NET library with no engine dependency | Carry over the *separation*; stack choice is open (our 0002) |
| 0007 Swappable packs | Every setting name lives in packs; validator enforces it | Carry over: this is the whole point of a multi-setting engine |
| 0010 Cameo tiers | Tier 1 famous (scripted, fixed fate) / Tier 2 secondary / Tier 3 invented (full agency) | Strong fit for historical figures. Inverted for us: the leader's famous subordinates must have agency |
| 0012 Career model | Rank, billet, qualifications are separate state; promotion needs open billet + record + board | Generalize to **offices and posts** |
| 0017 Calibration as percentiles | Design targets defined as Monte Carlo percentiles | Carry over |
| 0022 Authored approaches | Player picks 2–4 authored approaches, not free text | Carry over for negotiation scenes |
| 0028 Offline authored game is the product | No runtime model call is ever required | Carry over verbatim |

## People modeling (most transferable)

- **Regard (long-term, −100..+100) vs Mood (scene, −3..+3)**; each character holds 2 values; regard moves on conduct that hits their values, capped per scene. "Time spent is not regard."
- **Qualitative display**: the player sees states ("Checks your work twice"), not numbers.
- **Council adoption rule (GAME_BIBLE §2)**: a decider adopts advice only if (1) regard with the recommender ≥ threshold AND (2) the advice honours one of the decider's values. "Regard alone never carries a recommendation." Otherwise the decider picks by their own values *and the scene says why*. **This is our compliance rule, inverted**: the proxy is the decider, the leader is the recommender.
- **Role result = (1−w)·personal + w·outcome**, with a principled-loss floor and a broken-principle cap: "should not pay them for virtue either, or principle becomes a score to farm".
- **NPCs run on the same promotion system as the player**, so rivals rise independently.
- **Conduct record is a dated list, not a number.**
- Gap: no loyalty, defection, intra-cast factions, NPC-to-NPC relationships, or autonomous off-screen action. Those are exactly what we need to add.

## Narrative architecture

- Moment loop: Select (systems) → Frame → Choose → Resolve (systems) → Render (text) → Commit (systems).
- Storylets are quality-based; every scene writes a durable trace ("no purely informative events").
- Progress/threat **clocks**; complication deck; threads with dormancy windows.
- **"Canon is weather, not plot."** "No local outcome is ever a cause of a headline outcome."
- Text selection draws from a **separate RNG stream outside the sim hash**; adding a text variant never changes a roll.
- Live narrator (dormant): packet in → JSON out → code gate → repair once or fall back. "The narrator has no memory"; continuity comes from system-owned event lines.

## Content packs

- Source (one JSON per item) → `build-pack` → built canonical JSON + manifest + SHA-256 content hash. Runtime never reads source.
- Stable ids, never reused; `retired.json` for migration.
- JSON Schemas generated from code types; test fails on drift.
- Review stamps `{role, text_hash}`; any text edit voids stamps.
- **`validate_pack_boundary.py`**: setting terms (from `pack_terms.txt`) forbidden in engine code; fuzzy, camelCase-aware.
- **Lore facts carry `known_from` (date) and `known_to` (public / service / restricted / scripted-only)**: an epistemic model. **This maps directly onto our political fog of war.**

## Engineering

- `Game.Sim` is BCL-only: no clock, no I/O, no threads. Banned APIs enforced by analyzer. No floats in saved state; one rounding rule.
- RNG: SplitMix64, **one named stream per purpose**, seeded `Mix(saveSeed ^ FNV1a(streamName))`, with keyed sub-streams.
- Saves: envelope / sim (hashed) / flavour (unhashed) / input log / hash. Integer `save_version` + frozen migration chain + shape test.
- One facade (`GameSession`) with a closed set of `Decision` records valid only against a matching `PendingDecision`.
- Rules as `Resolve(state, rules, input, rng)`; tunables as an immutable record.
- Tests: determinism property tests, banned-API tests, architecture (dependency direction), save migration, 1,000-seed soak.

## Process

- Copy day one: short routing CLAUDE.md; **"Rules that matter become checks"**; decision records; LESSONS.md with an "Enforced by:" field and a check-first ladder (test > hook > agent rule > lesson); pre-commit hook; pack-boundary validator; determinism bans and architecture tests from the first commit.
- Defer: seven-agent team (start with ~3), review stamps, heavy lore strictness, CODEX.md bus (it bloated to ~2,000 lines).
- Warnings: doc drift (their CLAUDE.md still says "no code yet"); dense cross-referencing hostile to humans; an overnight no-gates run produced code that came back "accept with fixes" everywhere.
