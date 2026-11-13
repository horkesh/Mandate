# Research: what to harvest from A War Without Victory (`F:\A-War-Without-Victory`)

Date: 2026-11-13. Status: research note (not canon). Paths are relative to the AWWV repo.

## The premise, as AWWV states it

- Game Bible §3: "The player acts from the perspective of political-military leadership rather than field command. Agency is exercised through directives, allocations, and prioritization."
- §21.5 (locked 2026-06-01): "the player is the president and commands the war THROUGH their generals… not as a general."
- `docs/20_engineering/PRESIDENTIAL_COMMAND_DOCTRINE.md`: "The player never sees the battlefield directly. They see what their command chain reports to them." Three command levels:
  - **L1 Strategic Guidance**: "most turns, the player operates here and only here".
  - **L2 Army/Corps Directives**.
  - **L3 Direct Intervention**: costs authority, officer morale, execution quality. "This is not a punishment mechanic — it is information."
- Five presidential levers (shipped 2026-06-01): authorize op, request op, stop op, authorize elite deployment, replace corps CO.
- Rulings worth keeping:
  - **Refusing a patron is not a lever.** It is a response inside a triggered patron-demand event, because a standing "defy" button is flavourless.
  - **Pushback is shown before commit; the consequence is written after.** The officer's view is "disposition-colored professional judgment… never a clean win-%". A consequence receipt follows: "you were warned by [officer] on week N". **"The number is never the decision; the source is."**
  - **Asymmetry lives in data, not branches**: no `if faction ==`. One friction-weight table (RS 1.0, RBiH 0.5, HRHB 0.25) × the relieved officer's political reliability > threshold → revolt.

## How it is implemented

- Officers (`src/state/officer_types.ts`): competence, aggressiveness, defensive_skill, political_reliability (1–5), `stubbornness`, `override_tolerance`; mutable status, override_count, `cowed_until_turn`. Event types: `order_pushback`, `order_modified`, `order_refused`, `order_exceeded`, `officer_relieved`, `army_co_proposes_op`, each with `original_order` / `interpreted_order` snapshots and a `reason`.
- Corps compliance (`src/sim/combat/order_interpretation.ts`), a pure function:
  `compliance = 0.45 + 0.10·competence − 0.25·|ordered − preferred stance| + 0.10·(pol_rel − 3)`.
  ≥ 0.80 full, ≥ 0.50 with reservations, ≥ 0.25 shifts one step toward his preference, below that refuses. Two overrides in 8 turns → cowed for 8 turns.
  **Honest verdict: thin.** Stance is a 4-rung ladder and preference comes from aggressiveness alone.
- Army-level directive interpretation with bounded one-step deviation; stubbornness ≥ 4 unlocks autonomous op proposals with a one-turn warning.
- Political bot layer: president → strategic-priorities packet → army CO → corps CO → brigades. **This chain is the most reusable structure in the repo.**
- `CommandAuthority {current, max, reserve, spent_this_turn…}` as a resource, plus strategic dimensions (military credibility, territorial legitimacy, international standing, patron confidence, internal cohesion, negotiating leverage).
- Player-visible state (`docs/20_engineering/PLAYER_VISIBLE_STATE.md`): "the player client should receive a player-facing state, not a prettified full state." Classes: player-safe / staff abstraction / debug-only.
- **No RNG at all.** "Historical variability comes from initial conditions and interactions, not randomness." `strictCompare` everywhere.
- Saves: allow-listed serializer, migrations v1–v35, "derived states are recomputed each turn and never serialized".
- Weekly `runTurn()`: about 150 named steps.

## Gap between intent and implementation

- Manual brigade control still exists underneath (autonomy level 0). President-only mode (autonomy level 2) was **forced at campaign start later**; it was not the structural default. Level 1 "starves the war" because plans wait for approval.
- The bot political brain sat dark for months (bots picked `options[0]`); bot doctrine was calendar-driven: "RS goes offensive w0–12 because the clock says 1992, not because it is winning."
- LLM layer (`src/sim/ai_commander/`) is texture only and cannot change a recorded decision. Correct.

## Pain points

- The spatial model was rebuilt repeatedly (AoR → ZoC → OSID + sectors), and so was the map UI (Canvas → 3D → MapLibre → Deck.gl).
- Pipeline ordering: derived data goes stale after a later mutation step.
- **Multiple writers for one truth.** "Two stores tracking the same data will diverge." "When you have 50+ overrides for one behavior, the mechanic is missing."
- "Derived-signal" failures: a value read correctly that means something else; "zero differences" over an empty set.
- **Cell-level calibration to four painted historical maps became the main workstream for months.** "Protecting a calibration number by forbidding consequence… is scaffolding masquerading as design."
- Process weight: 60+ engineering docs, ledgers, panels, a 322-entry lessons index, changelog paragraphs inside canon.
- UI grew parallel read-models (Decision Room, Inbox, Army HQ, briefing banner, Aftermath), each insisting it was "not a second inbox".

**Bottom line from the read:** AWWV's hard problem was never the command premise. It was tuning a 150-step, many-writer combat engine to reproduce history cell by cell.

## Lift

- The officer agent + compliance + cowing model, rebuilt richer.
- The "source, not number" pushback card and the consequence receipt.
- The directive chain with bounded deviation.
- A small set of named levers paid in authority.
- Patron demands as events, not sliders.
- Asymmetry in data tables.
- Pressure-driven events.
- Pure deterministic `runTurn`.
- The player-visible-state boundary.
- The single-owner rule ("one and only one system should own the decision").
- The terminate-vs-judge split ("verdict, not victory").
- Codex "ghost entries" where your war diverged from history.

## Avoid

- Manual unit control as a mode at all.
- Calendar-driven bot doctrine.
- Multiple writers per truth.
- Cell-level historical calibration as an acceptance gate.
- Process living inside canon.
- More than one inbox.
