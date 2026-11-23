# 0121: Authored letters, their receipt, and the authority a commander receives

Status: accepted (2026-11-23). From S110's design (`docs/design/S110-RECEIPTS-LETTERS-AUTHORITY.md` and `docs/design/S110/` on `sprint/design` at `0e7517e6`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0052 (who may order). Clarified by 0124 (standing authority comes from an assignment to command).

## Context

- **There are three things the kernel can't yet express.**
  - **Whether a person has received a particular paper.**
    - `requiresNotice` looks for any received situation report.
    - An identified offensive counts as issued once any goal goes to its post.
    - Nothing can express "Patterson has Scott's letter of 24 May".
  - **Which letter is which.** Copies of sent letters are compacted by post. So a second letter to the same post can be suppressed by the first, and an old one can go out again after a new goal replaces it.
  - **Who besides the principal may order.**
    - 0052 says only a principal gives orders. It leaves deferred, as 0040 did, whether commanders order their own subordinates.
    - Scott directed Patterson, and Patterson directed Wallace within limits. The model can only credit those letters to Lincoln, or leave them out.
- **Why this matters now.**
  - Johnston stays at Harpers Ferry because his June picture holds no threat.
  - S99 researched the Union's sourced June moves (G01 to G09). Building them needs all three:
    - Scott's letters received;
    - Patterson's own orders, within bounds;
    - Wallace's raid on Romney and his return.

## Decision

1. **An authored letter has an identity of its own (S110's design B).**
   - **There are three identities:**
     - the authored letter: issuer namespace, key and revision;
     - each dispatch of it: message id and origin;
     - each leg: hop id.
   - **The sender keeps a ledger.** `knowledge` holds a finite ledger of the sender's own dispatches, by authored identity, written when a dispatch first enters transit.
   - **A dispatched letter isn't sent again by itself.** A sourced repeat or a deliberate retry is a new dispatch, linked to its predecessor and logged.
   - **A letter's terms are bound to its key.** Altered terms under an authentic key are rejected. A manual variation is a new instruction of the sender's own.
   - **Dispatch ids include the letter's identity,** so an unrelated letter never renumbers another or shifts its courier stream.
   - **One field goal per post per morning stays.** Ready letters wait their turn: first by declared dependency, then by earliest date, then by key.
2. **A revision of a letter replaces the earlier one only on receipt.**
   - At the addressee, a later revision of the same letter replaces the earlier only once received, and only through ordinary compliance.
   - A revision that arrives late, after a newer one, keeps its receipt and its answer, but its content is obsolete. It never restores a goal or an authority that the newer one replaced or revoked.
   - Letters that aren't revisions of one another still go through 0052's resolver of chain against bypass. There is no rule that the newest date wins.
3. **A doctrine row may require papers received (design A).**
   - **The prerequisite.** An identified doctrine action may carry `requiresPapers`: a conjunction of positive selectors, whose length a validator limits. There are two kinds of selector:
     - **a named letter:** its issuer, key and revision, the receiving post, and whether it was received as relay or as addressee;
     - **a correlated received report:** its author, subject and type, and where needed the dispatch it answers. Any typed claim and bound it requires must be in that same paper.
   - **It is judged on the acting seat's own knowledge alone.** When a paper arrives, `knowledge` files a minimal receipt witness, after any filtering. No selector reads another seat, a hidden response, the truth or a date.
   - **Readiness is derived each morning, never saved.** Today's arrivals count from the next morning's menu.
   - **A receipt proves possession only.** It doesn't prove obedience, or that a report is true. A false alarm can open a gate.
   - **Witnesses are pruned** when nothing can refer to them. An identity, once met, stays met.
4. **A commander may order under a mandate he has received (design C).** This amends 0052's rule that only a principal gives orders.
   - **A mandate travels as the enclosure of an ordinary order.** It names:
     - its granting issuer and its holder;
     - the actions it allows and the subordinates it covers;
     - its regions and its modes of movement;
     - a force ceiling, and a guard the holder must keep;
     - its expiry and the holder's reporting duties;
     - whether he may grant within it.

     Anything it doesn't name is denied.
   - **Enactment.**
     - `command` alone writes enacted mandates (`authorityByPost`).
     - A mandate is enacted only after the holder receives it and answers. A refusal enacts nothing; a qualified undertaking enacts only its accepted part.
     - It is bound to the person. If he leaves the post, a successor needs a new grant.
     - A revocation acts where and when it is received.
   - **A child mandate is the intersection of its parent.** Two siblings can't both spend one ceiling.
   - **The principal is the root of all authority.**
     - A general-in-chief's power to grant comes from a root grant that the pack declares.
     - The data build must source that grant, and the lead must review it.
     - Nothing is assumed received.
   - **His choices come from a menu.**
     - The kernel builds it from planner candidates within the mandate. Free-form orders stay rejected (0052).
     - Each choice is logged, and validated again when executed.
     - It reaches his subordinates through the real chain, with ordinary latency and compliance.
   - **What no mandate allows:**
     - appointing anyone, levying troops, or moving another commander's forces;
     - issuing a political verb;
     - compelling a peer. A peer still receives an ordinary request, and may decline.
   - **The player is unchanged.** The President still commands only through people. This gives the people below him the authority their papers gave them, and their reports reach him later, in their own names.
5. **A limited sortie is a mode of mandate, not a capture.**
   - **It is distinct from `take`.** `limited_sortie` has four stages: outbound, action, returning and closed. Each transition records its reason.
   - **What prompts it.** It needs the commander's own received report of an armed hostile gathering, produced by ordinary reconnaissance. Neither a date nor a number from the source can stand in for that report.
   - **Choosing a detachment.**
     - The planner weighs a bounded set of detachments within the mandate.
     - Each needs a guard kept, a route out and back, and stores for the round trip.
     - If no candidate is safe, or the parent's strength is unknown, there is no sortie.
   - **`return_line_unsafe` belongs to the sortie alone,** judged from his own picture. It isn't a third general condition beside `turned` and `outmatched` (0116).
   - **How it ends.**
     - It ends with an actual return and rejoin, or with a recorded loss.
     - It never leaves a garrison or a lasting capture.
     - Another sortie needs a new qualifying report.
   - **Safety is a pack rule.** It covers the limit on candidates, the guard kept and the test of safety. The build brings the rule's form and values to the lead with their basis, never fitted to a recorded raid.
   - **Treatment of civilians,** including searches and arrests, stays outside this design, with the gate for sensitive history.
6. **Regions stay as they are.** Local scope uses the existing regions and edges. Nothing claims that two places inside one region are distinct; a finer map is its own decision.
7. **The order of the builds:**
   1. letter identity;
   2. receipts;
   3. mandates and their menus;
   4. the sortie's lifecycle;
   5. the sourced June data (S99's G01 to G09).

   With each build:
   - every saved field gets its `ownership.ts` class and its FOUNDATION section 10 row;
   - an older save gets empty collections, never invented receipts or grants.

Rejected:
- **Making every commander a principal,** or silently removing the check that only a principal orders.
- **Crediting every order to Lincoln.**
- **Treating situation delegation (0052) or a request for support as a grant of authority.**
- **A superior scripting a commander's route or raid,** or a letter addressed to oneself standing in for a local choice.
- **Widening `requiresNotice` to any situation or date.** Also rejected:
  - reading other seats or hidden responses;
  - treating sending as receipt;
  - keeping every message forever.
- **Matching letters by text, date or last goal.** Also rejected:
  - an unbounded archive;
  - cancelling a letter in transit when a newer one is sent;
  - automatic resends.
- **A permanent capture of Romney, a return fixed by the calendar, or `outmatched` standing for every reason to retire.**
- **Strength or safety constants chosen to reproduce the record.**

## Consequences

- **Where the builds run.** S112 builds the letter identity and then the receipts on `sprint/design`, which merges into `sprint/july`. Mandates, the sortie and the June data follow, each in its own lane.
- **No 1A credit from the design.** Passing these designs grants none. The June chain is measured when its data lands.
- **The records that name this one.** 0052's Status names it. FOUNDATION section 10 gains its rows with each build.
