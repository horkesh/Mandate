# 0125: A strength is a return, an estimate, a rule's output or unknown

Status: accepted (2026-11-23). From S120's proposal (`docs/research/2026-11-23-S120-strength-under-honest-unknowns.md` and `docs/research/S120/` on `sprint/pushback` at `6e68cded`), with S118's corrections (`sprint/research-military` at `c63aac4f`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0099 (how the men checkpoints read) and clarifies 0110 (which lots stay unknown).

## Context

- **What S120 found.** It inventoried every lot in S116's capture whose men are unknown or set by a rule. The model's numbers have four sources:
  - dated reports, which are few;
  - contemporary estimates and inferences carried from the opening forces;
  - quantities produced by rules;
  - unknowns.
- **The rule quantities are most of the men.**
  - Recruitment creates lots at `menPerRegiment` (1,000), or at a call's requested men.
  - Some situations convert a historical transfer of regiments into men at the same rate: Tennessee's 22,000 and 2,000, and 11,400 for Arkansas and North Carolina.
  - Without any conversion or quota, Confederate counted men fall from 90,452 to about 9,000.
- **Two decisions push in different directions.**
  - 0076 and 0110 reject a default strength for a block of unknown strength. The cure for the unknown-strength criterion is sourced strengths.
  - The `men_confederate` checkpoint's binding floor of 100,000 rewards filling gaps. S118 found Tennessee's tender gives units, not men.
- **S120's recommendations.**
  - A separate verdict, unresolved, that never passes.
  - Command returns usable only at their own scope.
  - No quantity set by a rule counted as evidence.

## Decision

1. **Every lot's strength has a kind, and `forces` carries it with the lot.** The kinds are:
   - **return:** a dated return of that unit; or a complete dated return of a command, for a lot that represents exactly that command;
   - **estimate:** a dated contemporary estimate, or an interpolation between two dated returns, with its source;
   - **rule:** men a model mechanism produced by a declared pack rule, such as recruitment's `menPerRegiment`, or a call's requested men;
   - **unknown.**

   Every derived sum (a checkpoint, a block, a side) reports its total by kind. No sum of mixed kinds is presented as a return.
2. **A rule's output is the model's own quantity, and it counts.**
   - It fights, and it counts toward a checkpoint. A checkpoint tests the model's output against history, not the archive's completeness.
   - It is never cited as a return.
   - **The rule needs its own sourced basis.** For `menPerRegiment`, that means the 1861 establishments and the strengths at muster-in. The value changes when the sources say so, never to meet a band.
   - A lot the model raised keeps its rule quantity even when a read paper gives it a historical identity. The model's regiment is not replaced by the historical return.
3. **A historical unit the record names without men stays unknown** (0076, 0110). This covers a unit the history supplies to the model: opening forces, transfers and state aggregates.
   - **No rule's number is applied to it.** A conversion of a regiment count into men isn't a return. Tennessee's, Arkansas's and North Carolina's conversions become unknown men under their regiments.
   - **An inference with no dated source becomes unknown.** An estimate keeps its source and its kind.
4. **A checkpoint has three verdicts: pass, fail and unresolved.**
   - **Unresolved** means the counted men fall short of a binding floor, and unknown lots exist whose returns could close the gap. The record lists those lots and the records that would close them. It is never a pass.
   - **Fail** means the comparison is established:
     - the counted men exceed a binding ceiling; or
     - they fall short of a binding floor with no unknown lot left; or
     - an evidence error is found, such as duplicated men.
   - **Combining verdicts.** Fail outranks unresolved, which outranks pass. A milestone needs pass on every binding requirement. A non-binding floor stays a reported diagnostic.
5. **A complete command return counts only at its own scope.**
   - It may set the men of an aggregate lot that represents exactly that command, as a return.
   - At a checkpoint, it may bound a group's total when its membership reconciles exactly.
   - It is never divided among lots, added to its constituents, or moved in date without evidence.
6. **The unknown-strength criterion is unchanged.** A block of unknown strength in a battle record is a non-pass, and only a return or an estimate clears it (0110 item 2). Unknown men still add nothing, with no default; 0110's unresolved contact stands.
7. **Recovery comes first for the lots that fight.** Research works in this order:
   1. the rule's basis;
   2. returns at transfer for the state forces (Virginia, North Carolina, Tennessee and Arkansas);
   3. returns for every historical unit in a battle record whose men would be unknown.

Rejected:
- **Counting a rule's conversion of a historical regiment count as men.** That is a default strength for a historical unit.
- **Refusing to count the model's own rule quantities.** That would make every checkpoint an audit of the archive, and leave divergent play unmeasurable.
- **Counting unknown men as zero, as an average, as the establishment, or as the exact gap.**
- **Treating unresolved as a pass, allowing a percentage of failures, or waiving unknown combatants.**
- **Dividing a command's return among its unreturned lots.**
- **Moving a band, a quota or a trait to meet a checkpoint.**

## Consequences

- **The build.** After S119:
  - `forces` carries the kind;
  - the checkpoint scorer reports the three verdicts and the totals by kind;
  - the Arkansas and North Carolina conversions and the unsourced opening inferences become unknown;
  - the effect is measured.

  The unknown-strength criterion may then list more blocks at Manassas, and that is the honest reading.
- **Research.** One lane reads the regiment rule's basis and the state forces' returns, and the returns for lots that fight, in 7's order.
- **1A.** Both strength criteria stay non-passing until their unknowns are closed by records. No number is supplied to close them.
