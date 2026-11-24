# 0138: The grammar of the July orders: a governor's sending, staged legs, bounded intake and handover, successive organisation, receipt conditions and station rules

Status: accepted (2026-11-24). From S154's design (`docs/design/S154-JULY-ORDER-GRAMMAR.md` and `docs/design/S154-GAP-MAPPING.csv` on `sprint/pushback` at `8d8c3280`), on S152's declarations (`sprint/allocate` at `d2ccca82`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Extends 0131 (the kinds of read instrument), with 0126, 0129, 0133, 0134 and 0136.

## Context

- **What S152 found.** Under 0136, 117 of the read rows that built the July armies are grammar gaps, so the instrument form can't express them. These include:
  - Sandford's and Morgan's April sending (NY AG 1861 p.109; OR III-I pp.85, 95, 100);
  - SO89½ (OR I-LI.1 pp.388–389);
  - the crossing and handover (OR I-II pp.37–41, 653–655);
  - GO1 to GO13 (OR I-LI.1 pp.389–414);
  - the exchange of 18 June (p.403);
  - Lynchburg's successive rules (OR I-LI.2 pp.137, 140, 151, 157, 160).
- **The result.** McDowell holds one regiment on day 120 and none on day 140, and Beauregard holds none.
- **What S154 proposes.** Eight families, each a received paper with one typed act, using the existing owners for requests, offers, goals, journeys, receipts and organisation. Each comes with rejected alternatives, paired fictional specifications and an event-driven cost contract.

## Decision

S154's eight families are accepted as designed (sections 2 to 10), with these rulings.

1. **G1, a governor's own sending.**
   - A declarable `governor_send` act sends the governor's held named or cohort bodies to a destination under his state root.
   - The bodies travel as his offer (0126) and are received by place (0133).
   - A state officer such as Sandford executes it only with read delegation. Morgan's letter of 18 April is such a reading (OR III-I p.85). Without delegation, the clause records `state_authority_missing`.
   - The means come from the read terms, never from 0137's national root.
2. **G2, staged legs.**
   - A read itinerary marks each stop as `transit`, `receive_for_service` or `await_further_order`.
   - A transit stop changes nothing.
   - Receipt or a wait ends the leg. A later received paper starts a new leg from where the body actually is.
   - A missing onward paper stays a gap.
3. **G3, bounded intake (SO89½).**
   - Read state provenance together with an exact place, a receiving post, national service under the issuer's authority, and a received assignment is a lawful scope for a historical command assignment.
   - It takes the actual qualified holdings once, at execution. It is never a standing subscription, and never a scope for 0133's requests.
   - State origin alone stays rejected (0131).
4. **G4, a move of held bodies.** An order to move bodies the commander holds is an identified dated goal in the existing grammar, through the actual chain. It grants no troops. An unopened executing post makes it do nothing until the post opens (0129). Detail the map can't represent stays named.
5. **G5, a handover.**
   - A received handover passes the bodies actually under the named source command, and actually present in the region, to the receiving command, in place and once.
   - Each lot's inclusion or exclusion is recorded.
   - Bodies in transit, independent bodies and state bodies don't pass.
   - Live tasks need explicit adoption or ordinary counterorders.
6. **G6, successive organisation.**
   - A received `organise` act assigns held bodies to formation posts opened under 0129.
   - Each successor replaces only the memberships it names, for bodies its issuer actually holds.
   - A listed body held by another command is recorded `not_held` and never requisitioned (0136).
   - A duplicate or ambiguous membership stays unapplied.
7. **G7, a receipt condition.**
   - A clause may wait on a typed `after_service_receipt` (or `after_departure`) of a named identity at a place and command.
   - It subscribes to that event only. It is consumed once, and it survives save and resume without repeating.
   - When the condition comes true, it is not an order to override the holder's compliance or retention (0135).
8. **G8, station rules.**
   - A received station rule acts on bodies actually held or received at that station, by typed predicates that evaluate to true, false or unknown.
   - Supersession takes effect on receipt and acceptance, and affects only the overlapping clauses it names.
   - Unresolvable conflicts are recorded as `conflicting_station_terms`.
9. **Two prerequisites are not built here.**
   - **Arms and equipment truth.** For example, Lynchburg's "armed and equipped" branch stays `predicate_state_missing`.
   - **Sourced company membership.** Company clauses stay `component_identity_missing` or `component_quantity_missing`.

   Each needs its own evidence and its own design. Neither is ever approximated by readiness, a fraction or a whole regiment.
10. **The cost contract of S154 section 10 binds:**
    - immutable paper indexes, built once;
    - disposable State indexes, rebuilt on load;
    - keyed subscriptions;
    - visited candidates, wakes, selections, journeys, receipts and planner calls published per family.

    An idle tick visits no G1–G8 candidate, and no daily scan of lots or papers is added.

Rejected:
- **A general rule language, or arbitrary pack functions.**
- **A second army-formation system.**
- **A region-wide or state-wide sweep,** whether by department, organisation or station.
- **Dates as receipts, or scheduled swaps.**
- **Borrowing the national root's modes for a governor or a subordinate.**
- **Filling absent identities from generated lots or rosters.**

## Consequences

- **The build comes in two bounded parts,** each proving its paired specifications and the idle-work counters on fictional fixtures before a reference capture:
  - **Build A:** G1 to G5 and the shared indexes of section 10. This is the chain that could form McDowell's army.
  - **Build B:** G6 to G8.
- **The remaining evidence gaps stay named, and go to research.** These are:
  - the onward direction from Annapolis;
  - the sending of Washington's brigades across the river;
  - any further handover paper of 27 to 29 May;
  - the unnamed Lynchburg pairs.
- **What it may give.** No army, size, date or battle is promised. What forms is measured.
