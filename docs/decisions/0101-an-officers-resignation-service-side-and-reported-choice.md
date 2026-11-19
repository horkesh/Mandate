# 0101: An officer's resignation, service side and reported choice

Status: accepted (2026-11-19). The rulings of the resignation lane, opened by 0096 from lane 1.12's note. Built by Codex (R49, R61) on `phase1-resignation` at `5a96a16`, and reviewed by Claude's standing reviewer and the gate reviewer. Codex drafted this record (R71). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it.

## Context

R49 replaces the pre-positioned officers with a choice of service; R61 adds Holmes's and Loring's government prerequisites and the missing regressions. The source is `phase1-resignation` at `5a96a16f0eec66f9eaebdbe8df70a4b34aee9d55`, especially `notes/lane-resignation.md`, `packages/kernel/src/people/resignation.ts`, `tick/people-week.ts` and the Union service rows. Section references below name that hand-over. Its original proposed ruling allowing an unknown-government historical date is retained as history, not silently equated with the lead's later government ruling.

The lead's “R56 received; reviews … R60 to R63” message in `CODEX.md` supplies the Holmes/Loring ruling; R71 restates it, records R61's approval and explicitly accepts its cost to Holmes's date. The gate source is `C:/Users/User/AppData/Roaming/Claude/side-session-notes/local_8f1af2fe-a73e-49bd-9537-2482e939c167/review-gate-1861.md`, “The fourth draft: R49's officer_resignation,” read on 2026-11-19 (SHA-256 `008f1bc884f91b5a85e9ab61575157b982f696acd139986d08bd385e573a9371`).

## Decision

1. **Resignation is the officer's act, offered once.** A serving officer with an authored service row can resign or stay; a recorded answer prevents another offer. Ordinary choices occur on the people week after the named government joins the destination side. The deterministic calculation returns the base, matching value and trait terms, and threshold. A stay is final for that offer. This is not a player verb that transfers an officer or his force. Sources: the lead's R49 brief; “Where this lane stopped”; proposed rulings 2–3; `serviceChoices` and `resignationChoice` at the pinned commit.

2. **People owns the choice; command owns the vacancy.** `people/people.ts` alone writes optional `State.personService`. Its immutable `PersonService` carries `serviceFaction`, `serviceBloc`, `serviceChoice` and `serviceDay`. Absence in an older State means no answer was recorded. On resignation the tick calls command's holder-relief path, then people records his new service; it does not change his serving status, rank or troops. He becomes unposted and can appear in the other principal's existing candidates. `sideOfPerson`, unposted location and the politics bloc reader read current service. Ownership stays with the existing rank, force, command, people and politics mechanisms; there is no second allegiance table. Sources: “Where this lane stopped,” “Format and data,” `people/people.ts`, `people/resignation.ts`, `command/command.ts` and `tick/people-week.ts`; OWNED_FIELDS and FOUNDATION section 10 as recorded in the hand-over.

3. **A historical default supplies a date, never a motive.** The pack's `historicalDefaults` selects the sourced-date path. It may act between people weeks, but not before `historicalOn`; where a government is named, that government must also have joined the destination side. The ordinary values model remains available when that historical path is not selected. `PersonRecord.service` carries the government, destination faction/bloc, historical date and citations. Validation rejects an incomplete row, bad references, impossible dates, missing citations, the starting side as destination, or a row with neither government nor date trigger. All fifteen retain their US starting factions and ranks and use the `army` fact bloc; the apply must preserve their rows. Sources: “Format and data,” “R61 follow-ups,” and the pinned `serviceChoices`; the lead's R49 brief and 0097's exclusion of these stand-ins.

4. **The officer waits for his own state's government to join the other side.** This is the lead's ruling, including Holmes and Loring. The appointment-state mapping is a design inference [I] from Heitman's entries, not a finding about anyone's motive or a substitution of birthplace for appointment state. The authored government mappings are:

   | Government | Officers | Heitman, volume 1, entries cited by the lane |
   |---|---|---|
   | Virginia | Ewell; J. E. Johnston; Lee; Magruder; Stuart; Thomas | pp. 410, 578, 625, 684, 933, 953 respectively |
   | North Carolina | Holmes | p. 539 |
   | Florida | Loring | p. 642 |

   R61 reads Heitman's Notes and Abbreviations, item 3: Loring's North Carolina birthplace does not replace his Florida appointment provenance. Keep the register dates unchanged. The lead accepts the resulting cost: Holmes may appear to resign about 20 May when North Carolina joins, rather than his register date of 22 April. This is an acknowledged model consequence, not a correction to the register. Sources: the lead's ruling before R61; “R61 follow-ups”; R71 item 2, which records the reviewer's Holmes observation. Virginia's operational date is 17 April under the lead's separate R71 ruling.

5. **An officer with no state to wait for has no government prerequisite.** At `5a96a16`, Cooper, G. B. Crittenden, Gorgas, A. S. Johnston, Longstreet, Pemberton and E. K. Smith have a historical date but null government. The built historical path permits those acts on their dates without a government-side test. The lead rules that this is right, not a gap: item 4 applies where the officer's appointment state was still on the starting side at the start and later joined the other side. Where it had already joined the other side before the start, or never did (Crittenden's Kentucky, for example), there is nothing to wait for. His row's government stays null, and he acts by his own values, or on his sourced date in a history run. Source: the pinned `source/world/people.csv` service columns and `serviceChoices`; the older hand-over's proposed ruling 1 expressly allowed this. The historical date table in the hand-over remains the record of fourteen Army Register dates, pp. 61–62 and 64.

6. **Buchanan is held as an administrative departure.** The cited 1863 Navy Register entry is in its unnumbered Dismissals table, between Forrest and Magruder. It is not a source for encoding a voluntary resignation. His US start and `army` bloc remain; no dismissal mechanism or departure date is invented here. Sources: “Format and data / Buchanan is held” and “For the lead,” item 3; the lead's R55 receipt and R71 item 2. The later research correction in R62 does not authorize this lane to use the dismissal as a voluntary act.

7. **The values model's coefficients are uncalibrated [I].** The pack supplies every coefficient: base 0, `resignAt` 500, `state_autonomy` +600, `native_state` +800, `union` −600, `duty` −300; the Union trait-weight list is explicitly empty. A score equal to the threshold resigns. These are design parameters, not historical ratings or explanations of an officer's conduct. Fictional tests exercise both values and traits; sparse historical values do not establish calibration. Sources: proposed ruling 2; `people/resignation.ts`; “R61 follow-ups” and its threshold tests; the gate note's “Outside my scope / The values model”; R71 item 2. That review's Lee example describes its earlier data snapshot, not a prediction after subsequent research applies.

8. **The principal hears an act through ordinary reports.** The officer's letter is authored at his serving location and travels through the normal routes. Resignation is reported to both principals; a stay to the existing side. Hidden `service_term` terms remain in truth. The desk reports only that he resigned or remains in service, without revealing values, scores or a hindsight explanation. Sources: `serviceChoices`; “Where this lane stopped”; the gate note's “The fourth draft.” Current service affects simulation and candidate eligibility without granting instant knowledge of the letter.

9. **The bare notice is ungated only within the reviewer's two conditions.** The reviewer permits `officer_resignation` to leave drafts unsigned with a `gate.none` reason describing only a reported service change, excluding motive, secession causes, slavery policy, security orders and protected-population effects. The two boundaries are explicit:

   - **Motive in text:** adding state, home, relatives, honour or another motive brings the text under `cause-of-secession`. It must use the officer's own cited words verbatim, never narrator voice or a label, and must not omit slavery content. Neither notice nor desk may paraphrase the motive.
   - **Reasons reaching a presenter:** exposing the mechanism's resignation terms also brings the value-reason rules into play. `state_autonomy` must not become “states' rights”; a secessionist holder's reason must quote his own cited words, not generic loyalty to his state.

   Source: the gate note, “Conditions for staying ungated,” items 1–2; the lead's R55 receipt and R71 item 2. At `5a96a16` the notice is still in `situations/drafts/` with its old topic block. It moves out of drafts with the `gate.none` reason when the lane next merges main.

Rejected:

- Transferring an officer's rank or troops with his service choice, or offering the same choice every week after an answer. Source: proposed ruling 3 and the lead's R49 brief.
- Treating the historical date as a value rating, moving a register date to conceal the government prerequisite, or using birthplace in place of the sourced appointment state. Sources: “Format and data,” “R61 follow-ups” and R71's express Holmes trade-off.
- Automatic resignation for every officer when a government changes side, dice for his answer, or coefficients hidden in the kernel. Source: proposed ruling 2 and the pack-owned resignation rules.
- Reusing Buchanan's dismissal entry as voluntary resignation. Sources: the hand-over's Buchanan finding and R71.
- Showing hidden terms as a motive, paraphrasing home-state loyalty, or dropping slavery from a quoted explanation. Source: the gate note's two conditions.
- Inventing an appointment government for an officer whose state had already gone, or never went, so that he waits for an event that cannot come.

## Consequences

R61's seven new cases cover current-service politics, both score and date boundaries, no repeated choice, service-row validation and the sourced Holmes/Loring mappings. Its retained root check passes 1,270 tests with three established optional skips; the done check passes 6/6 without changing bands. Four deliberate re-breaks fail their intended tests.

The history test still uses an artificial at-war prerequisite on this base. After lane 1.11 and Part B integrate, it must use the actual secession event without injection. Preserve both the current-service and capital readers when their shared location module merges, and keep the research apply's exclusion of the fifteen rows. The five existing Virginia citations joined with `+` also retain the hand-over's parser finding. None of these integration requirements is waived.

Ruling source gaps: none. The lead's rule and the reviewer's two conditions are located. The null-government behavior, unpromoted notice, Buchanan hold and pending history integration are implementation/evidence limits, not invented rulings or completed work.
