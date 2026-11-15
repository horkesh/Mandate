# 0065: A government's side can change in play, and stores carry their date

Status: accepted (2026-11-15). Amends 0050 and 0055. From the research lane on governments and stores (`docs/research/2026-11-15-governments-and-stores-1861.md`), which found that a department's faction is World data and cannot change in play. Phase 0 could close a neutral government's land, but no situation could take Virginia out of the Union in April 1861, or move a nation into a treaty. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Decision

**A department's side is State.**
- `departmentFactions` is copied from the World's departments at the start and written only by `command`.
- A situation changes it through a typed proposal. Virginia's secession, Kentucky's legislature after September 1861, and a nation's treaty are the model cases.
- When a government gains a side:
  - its land stops being neutral ground (0055, 0058);
  - its posts and force blocks serve that side;
  - control is unchanged, because `control` owns it (0054).
- A person who holds one of the department's posts serves its side while he holds the post. A person with no post changes side only through situations or events (0055).

**Stores carry their date.**
- A force block's stores, when given, carry `stores_date`, as strengths carry `strength_date` (0056).
- The date is informational in Phase 0, and no bring-forward rule exists until Phase 1's attrition.
- The research lane's January figures for Key West (120 days) and Fort Pickens (150 days) stay, with their dates. The Pickens row's note records that its officers wrote "getting low" by late March.

**Implementation:** lane 0.5 builds both on `phase0-department-sides`, after `phase0-pack-rules` merges. That covers the State field and its proposal, setup checks, controls, the `stores_date` column with its validator check, and both packs.

Rejected:
- **A second department per government for its later side.** Two records for one government, with posts and forces to move between them. It is also exactly the cross-side department change 0050 forbids.
- **Keeping sides fixed until Phase 1.** The war's first spring is a run of governments choosing sides, and lane 0.8's history runs need it.
- **Reverting the Pickens figure to unknown.** A dated figure with its caveat says more than an unknown, as with strengths.
- **A bring-forward rule for stores now.** No attrition rule exists yet.

## Consequences

- FOUNDATION section 10's row for a region's civil government gains a department's side.
- Situation authors move a government with a proposal to `command`, and a closing (0058) stays separate from a change of side.
- The Indian Territory proposal waits for a gate reviewer (record R3). Once its nations' governments are departments, a treaty is a change of side under this record.
