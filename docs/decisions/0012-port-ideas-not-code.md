# 0012: Port ideas from AWWV, not code

Status: accepted (2026-11-14). The owner takes recommendations by default.

## Context

AWWV has working modules that look reusable: the event system, the save migration stack, the commander belief model and the directive chain. They are entangled with OSIDs, Bosnian constants, `Record<FactionId, …>` types, and a 150-step pipeline.

## Decision

- Reimplement against the Mandate kernel, using AWWV's designs and rulings as the spec (see `docs/research/2026-11-13-awwv-harvest.md`).
- Do not copy AWWV source files. Short algorithms may be transcribed when they are setting-free and rewritten to integer permille math.

Rejected: lifting modules wholesale (untangling would cost more than rewriting, and Bosnian assumptions would leak past the pack boundary).

## Consequences

- When a Mandate module reimplements an AWWV idea, its header cites the AWWV file it came from, so the lineage stays findable.
