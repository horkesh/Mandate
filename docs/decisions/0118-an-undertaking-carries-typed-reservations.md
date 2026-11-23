# 0118: An undertaking carries typed reservations

Status: accepted (2026-11-23). From S104's proposal (`docs/research/2026-11-23-S104-conditional-compliance.md` and `docs/research/S104/` on `sprint/pushback` at `a403817c`), with S102's measurements (`docs/audit/s102-evidence/` on `sprint/callterms` at `e12a85fb`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Refines the compliance machinery FOUNDATION describes (the people core carried over from M1 and M2): how a response's rung is chosen. Clarified by 0119 (a call for troops asks no temperament).

## Context

- **The rung comes from a narrow numeric window.** The compliance resolver chooses a response's rung from willingness alone. In the Union pack, `comply_with_reservations` is the window from 0 to 9, against an offended value's weight of 200 and deterrence of about 60.
- **The record's qualified answers fall either side of it.** S102 measured these against real per-call terms:
  - C01 at 127, C05 at 213, C07 at 67, C12 at 104 and U39 at 51, all above it;
  - C02 at −73, C10 at −296 and C11 at −83 and −283, all below it.
- **Most answers within each side complied and said what they objected to:**
  - Letcher raised the reserve while protesting the President's appointment power (OR IV-I pp.412, 419–420);
  - Brown undertook the reserve while asking who would receive and support it (pp.421–422);
  - Harris pledged three regiments while disclaiming the authority to order them out of Tennessee (pp.232–233);
  - Holmes dispatched Bate as directed while disputing the expedition (OR I-II p.959);
  - outside the registers, Buckingham, Andrew, Patterson in June and Johnston in July did the same (OR III-I pp.82, 85–86; OR I-II pp.696–697, 982).

  A numeric band can't say which term a man objected to. Widening it would only be tuning.

## Decision

1. **A response has two parts: an undertaking and its reservations.**
   - **Willingness** decides whether the actor undertakes the particular request.
   - **Typed reservations** say what he contests, asks for or makes a condition of that undertaking.
2. **A reservation names the clause it qualifies.** Each clause of a received paper has a stable identifier within its call or order revision. A reservation records:
   - its **subject**: purpose, service term or consent, appointments, organisation, authority, muster, destination, arms or equipment, transport, support, timing, or the course itself;
   - its **grounds**:
     - an offended value he holds, linked to that clause;
     - a judgment of the course on the evidence;
     - a recorded structural condition;
     - a dated resource report he has received;
     - or a request for information.

     A negative total is not a reservation. Unknown judgments give no grounds (0113).
   - its **requested treatment:** protest, clarify, request support, or propose an amendment;
   - its **effect:**
     - **statement**: the work goes on, and the protest is published;
     - **request**: the work goes on while he asks;
     - **gate**: a named stage waits for a named prerequisite;
     - **offer**: a changed undertaking waits for the other party's acceptance;
   - its **provenance** and state of knowledge.
3. **The rung follows the undertaking.**
   - If willingness to the original request is zero or above, he undertakes it, with every reservation that has grounds attached.
   - Otherwise he takes the best admissible concrete alternative the existing grammar can express, if its willingness is zero or above. An amendment outside his authority is an offer, never compliance with the original.
   - With an undertaking, no reservations gives `comply`, and any reservation gives `comply_with_reservations`, whether willingness is 7, 67 or 213. `exceed` keeps its conditions, and only for an unqualified undertaking.
   - Without an undertaking, the existing rungs and thresholds for objection, refusal, covert delay and reinterpretation stand.
   - **The 0 to 9 numeric window retires** when the build is accepted. No weight or threshold changes.
4. **Execution respects ownership.** Recruitment owns new men, transfer owns existing men, enlistment owns terms, and an operation owns its progress. A reservation refers to their events and never copies their state. A gate or an offer the build can't yet execute stays visible, as a named representation gap (0112).
5. **Matching under 0111 and 0112.** A reservation row matches when three things hold: an undertaking of the same request, a qualification that names the row's subject, and a compatible effect. The registers, their exclusions and the three source holds are unchanged.

Rejected:
- **Widening the numeric window.** It still treats a total as the subject of a qualification, and it can't tell two calls in one letter apart.
- **Per-person thresholds, fitted traits or new weights chosen for C02, C03, C10 or C11.**
- **Cancelling an offended value because the actor protests it.** The cost stands while the clause stands.
- **Reading a call's terms from the reply, or borrowing another request's undertaking.**
- **Treating every complaint as a gate, or every inability as unwillingness.**

## Consequences

- **The build starts with the first two effects.** It adds stable clause references and the `statement` and `request` reservations, with the paired tests S104 lists:
  - the same undertaking and protest at willingness 7 and at 67;
  - a positive score with no protest;
  - a negative score with no admissible undertaking;
  - a reserve that never required arms;
  - an offer without consent.

  `gate` and `offer` follow as their owners can carry them.
- **Measure, don't promise.** Coverage and strength are measured afterwards, and neither result is predicted here.
- **The negative cases stay open.** C02, C03, C10 and C11 remain diagnosis questions wherever unchanged inputs can't generate a supported undertaking. Brown's C02 comes from a temperament term of −118 against a call's boldness, and nothing else. Whether a call for troops should be read for boldness at all is its own question.
