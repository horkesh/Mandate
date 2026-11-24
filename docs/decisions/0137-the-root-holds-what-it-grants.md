# 0137: A faction's root authority holds every mode of movement its grants convey

Status: accepted (2026-11-24). From S150's and S152's builds (`docs/audit/s150-evidence/live-orders-capture/` and `docs/audit/s152-evidence/` on `sprint/allocate` at `d2ccca82`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Clarifies 0124 (what the principal's own authority names).

## Context

- **What 0124 says.** A mandate names its modes of movement, and anything it doesn't name is denied.
- **What the lead ruled in S150.** A generated sending paper takes its modes from its issuer's authority. A President's request to a governor therefore carries the President's modes.
- **What S150 and S152 found.**
  - Neither principal, Lincoln nor Davis, has a mandate of his own in the pack. He is the root that issues the others.
  - So his requests to governors carry no modes, and Curtin and Pickens defer with `modes_unavailable`.
  - S152 read the 1857 Regulations' transport and embarkation articles (pp.107–110, 123–124, 127–129) and the War Department acts (1 Stat. pp.49–50; Confederate Statutes p.32). These place the business of moving troops under the President's direction of the departments. They name no personal grant of rail, river or sea, because the root grants authority and holds no grant itself.
- **What the pack already declares.** Lincoln's and Davis's grants to their commanders name rail, river and sea modes, with their sources. Scott's `scott_army_command` is an example.

## Decision

1. **The root holds what it grants.** A faction's principal, the root of its national military authority, holds every mode of movement that his read grants convey to others. A grant cannot convey what its issuer lacks. This is `[I]`, derived from the pack's own sourced grants, with no new fact.
2. **His own papers carry those modes.** A request or order the principal issues carries the modes he holds, under the S150 ruling, unless its read terms name or restrict the means.
3. **Read terms still bind.** A paper whose words name a means ("by steamers", "by rail") or forbid one is held to them.
4. **Nothing else changes.** Mandates below the root still name their modes under 0124, and anything unnamed is denied.

Rejected:
- **A fallback to marching for any paper without modes.** It walked a South Carolina regiment for 46 days.
- **Leaving the principal with no modes.** It strands every request he makes, though the grants he issues prove he holds them.
- **Inventing a personal transport grant** that no read source states.

## Consequences

- **The build** stamps each principal's requests with the union of modes his declared grants convey, with a focused test on fictional fixtures. It covers a grant conveyed, a read restriction honoured, and a root with no grants holding no modes.
- **What it may give.** Curtin's and Pickens's regiments may now travel by the means the network offers. Whether they arrive in time is measured.
