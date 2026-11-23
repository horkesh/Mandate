# S89: why Moore, Perry and Clark object in S82

Research draft, 23 November 2026. **S89 only. No code, pack, numerical band, accepted decision or signature changes.** Base of this lane: `cb633cb322789fc620333497eb23e90d1e3ce4e8`. The diagnosed run is the frozen S82 reference at `e2b98c818b6e5e0c2e81256e5cba4955bb7feaa2`, not this older lane's runtime or S83's moving checkout. S82 and S84 files were read only; their hashes are in [reference-inputs.json](S89/reference-inputs.json).

## Finding

**Unknown judgments become behavioral numbers that cause the objections.** There is no categorical `unknown => refuse` branch. Instead, setup replaces unknown boldness, candour and reputation with seeded draws, and compliance uses those draws without an evidence-presence mask. For all thirteen answers by the three entirely unknown governors, the only negative contribution is the temperament mismatch. It outweighs deterrence; drawn candour selects `object`. The raising rules then create no levy. These are model outcomes, not evidence that the historical governors refused those calls.

The defect is the conversion of missing judgment evidence into active unwillingness. Under the lead's S89 ruling, unknown should contribute no term. A later build must carry knowledge of which inputs are unknown to the reader; sourcing a few cast cells does not correct that general defect. **No fix is applied here.**

## Exact reference coverage

The S84 register has 49 call identities. Forty-eight have answers, each joined exactly by order/person/call/day to S82's trace and final State. `cs_apr22_absolute_kentucky` was not issued and has no answer. A full scan of all retained trace response creations, not just the final table, finds 19 objecting Confederate-issued governor responses, all calls, from six actors. The [call index](S89/call-index.csv), [all answers](S89/all-confederate-call-responses.csv), [19 relevant answers](S89/objecting-governor-call-responses.csv) and [verbatim response objects](S89/response-evidence.json) preserve this distinction. Readiness answers are flagged; they are not musters.

“All judgments unknown” here means four unknown centres, both temperament cells unknown, unknown regard, empty values/traits/practices/other regard, and no bloc. Exactly Moore, Perry and Edward Clark meet that definition among the objectors. Ellis has a value; Harris and Letcher have entered judgment directions. Their inherited entries are reported as data, not re-certified from unread historical citations.

| Governor | Model call | Answer date (day) | Values | Temperament | Regard | Deterrence | Capacity | Total |
|---|---|---|---:|---:|---:|---:|---:|---:|
| perry_madison_s | `cs_mar09_florida` | 1861-03-09 (4) | 0 | -37 | 0 | 35 | 0 | -2 |
| moore_thomas_o | `cs_mar09_louisiana` | 1861-03-09 (4) | 0 | -76 | 0 | 27 | 0 | -49 |
| perry_madison_s | `cs_apr08_florida` | 1861-04-08 (34) | 0 | -37 | 0 | 35 | 0 | -2 |
| moore_thomas_o | `cs_apr08_louisiana` | 1861-04-08 (34) | 0 | -76 | 0 | 27 | 0 | -49 |
| clark_edward | `cs_apr08_texas` | 1861-04-08 (34) | 0 | -34 | 0 | 22 | 0 | -12 |
| perry_madison_s | `cs_apr16_florida` | 1861-04-16 (42) | 0 | -37 | 0 | 35 | 0 | -2 |
| moore_thomas_o | `cs_apr16_louisiana` | 1861-04-16 (42) | 0 | -76 | 0 | 27 | 0 | -49 |
| clark_edward | `cs_apr16_texas` | 1861-04-17 (43) | 0 | -34 | 0 | 22 | 0 | -12 |
| moore_thomas_o | `cs_apr22_absolute_louisiana` | 1861-04-22 (48) | 0 | -76 | 0 | 27 | 0 | -49 |
| ellis_john_w | `cs_apr22_absolute_north_carolina` | 1861-07-08 (125) | 0 | -34 | 0 | 28 | 0 | -6 |
| harris_isham_g | `cs_apr22_absolute_tennessee` | 1861-07-11 (128) | 0 | -135 | 0 | 10 | 0 | -125 |
| moore_thomas_o | `cs_jun29_extra_louisiana` | 1861-07-03 (120) | 0 | -76 | 0 | 9 | 0 | -67 |
| harris_isham_g | `cs_jun30_cavalry_tennessee` | 1861-07-11 (128) | 0 | -135 | 0 | 10 | 0 | -125 |
| perry_madison_s | `cs_jun30_reserve_florida` | 1861-07-04 (121) | 0 | -37 | 0 | 30 | 0 | -7 |
| moore_thomas_o | `cs_jun30_reserve_louisiana` | 1861-07-04 (121) | 0 | -76 | 0 | 9 | 0 | -67 |
| ellis_john_w | `cs_jun30_reserve_north_carolina` | 1861-07-07 (124) | 0 | -34 | 0 | 28 | 0 | -6 |
| harris_isham_g | `cs_jun30_reserve_tennessee` | 1861-07-11 (128) | 0 | -135 | 0 | 10 | 0 | -125 |
| clark_edward | `cs_jun30_reserve_texas` | 1861-07-07 (124) | 0 | -34 | 0 | 11 | 0 | -23 |
| letcher_john | `cs_jun30_reserve_virginia` | 1861-07-03 (120) | 0 | -81 | 0 | 42 | 0 | -39 |

Every row is `actual=declared=object`. Disposition and grievances are zero; there is no judgement/edit or practice contribution. The five requested terms therefore sum exactly to each total. Call names/dates in the table are model metadata, not newly verified historical dates. The CSV preserves each inherited historical citation explicitly as `call_source_as_entered`.

## Which inputs are sourced and which are substitutes

The [input register](S89/governor-inputs.csv) contains every entered citation and initial draw. [Term origins](S89/term-origins.csv) classify each term and the candour selector for each governor.

| Actor | Boldness | Candour | Standing | Regard for Davis in State | Entered values relevant to a call |
|---|---:|---:|---:|---:|---|
| Moore, Louisiana | 690, unknown draw | 665, unknown draw | 514, unknown draw | 0, unknown fallback | none |
| Perry, Florida | 594, unknown draw | 614, unknown draw | 428, unknown draw | 0, unknown fallback | none |
| Clark, Texas | 586, unknown draw | 657, unknown draw | 303, unknown draw | 0, unknown fallback | none |
| Ellis, North Carolina | 413, unknown draw | 636, unknown draw | 507, unknown draw | 0, unknown fallback | `conciliation` is entered but not honoured |
| Harris, Tennessee | 838, draw around entered `high` | 827, draw around entered `high` | 316, unknown draw | 0, unknown fallback | `conciliation` and cost-only `slavery_defence` are entered; neither is honoured |
| Letcher, Virginia | 703, draw around entered `above` | 518, unknown draw | 605, unknown draw | 0, unknown fallback | none |

The pack's call is always boldness 500, honours `union` and `duty`, offends nothing, and requires zero resource points. Empty values correctly supply zero; absence is not itself a negative value. Harris's and Letcher's entered directions have historical citation strings, but their boldness citations point after the start boundary (Harris April, Letcher April 18); that is a separate inherited evidence hold. Harris's candour has a January leg as entered alongside April. This packet does not claim to have reread those sources. The precise 838/827/703 are shadow draws, not source measurements.

Regard is zero for all six answers. In particular, Harris and Letcher have entered `above` regard, but opening faction is null and setup does not create a principal-regard entry for them. The retained State has no Davis regard entry for either, initially or finally. Do not report their dormant cast centre as +90 in these answers. No later regard change appears for these actors in the trace's response terms.

Deterrence is a genuine model term, not a historical judgment: oversight of the recipient from the issuer's location, political sanction credibility, and a discount for standing. **Every objector's reputation centre is unknown**, so its standing component is also a fallback draw. Oversight has pack constants and route calculations; credibility has pack constants, mandate and relief history. This packet verifies the recorded aggregate amounts; it does not pretend to reconstruct an unrecorded within-day oversight/mandate breakdown from the differential trace. Changing totals are not proven changes in personal loyalty.

Capacity is zero because `required=0` and `contextFor` defaults `available` to 1000. The call's headcount, term, arms and financial constraints do not enter this compliance shortfall. Thus zero capacity penalty does not demonstrate historical capacity, and a small and large requisition can receive the same objection.

## Frozen code path and arithmetic

All line references below are **at e2b98c81**, with hashes and numbered excerpts in [code-evidence.json](S89/code-evidence.json). Core people, reading, compliance and politics files also match this worktree byte-for-byte; recruitment, context and response wrappers differ, so those are inspected from the committed snapshot.

1. `people/people.ts:101–105`, `119–146`: `drawStat` uses the known centre/spread when present, otherwise `unknownCentre=500`, `unknownSpread=200`, on the person's named shadow stream. Setup draws boldness, candour and standing, and stores regard only when a principal can be identified and it differs from `regardUnknown=0`.
2. `people/traits.ts:48–60` and `reading/orders.ts:46–49`: `traitsOf` and `profileOf` pass numeric draws and the actual issuer regard, without an evidence mask.
3. `recruitment/rules.ts` (`callTerms`) and `tick/recruitment.ts:111`: all governor calls use the same terms; `answerOrder` receives route-derived oversight. `reading/orders.ts:77–87,174–182` supplies default means, credibility and other context, then calls `resolveDirective`.
4. `compliance.ts:165–167`: `temperament = -trunc(abs(500 - boldness) * 400 / 1000)`. Moore: −76; Perry: −37; Clark: −34. No explicit stand-in label distinguishes an unknown draw at this point.
5. `compliance.ts:187–202`: `shield=trunc(standing*600/1000)`; effective credibility is credibility discounted by that shield. Deterrence is the oversight/credibility product weighted by 250. Capacity is minus shortfall weighted by 500. The aggregate amounts above are retained evidence, not guessed inputs.
6. `compliance.ts:240–259`: the sum is compared with the **pack's** `complyAt=10`, `reservationsAt=0`, `severeBelow=-450`, `candidAt=500`. Do not substitute the exported legacy/default `complyAt=150`. These totals are negative but not below −450; all six have candour at least 500, so the result is `object`, not `refuse`.
7. `tick/recruitment.ts:81–84,112–126`: `responseOf` records the explanation, and `regimentsRaised` finds no raising rung for `object`. No levy is recorded; this is the consequential bridge from the spurious objection to strength.

As an arithmetic sensitivity observation only, remove the unsupported temperament term from the thirteen unknown-person rows and the totals become their positive deterrence amounts: Moore 27/9, Perry 35/30, Clark 22/11. Under unchanged thresholds these would fall in comply or reservations, not object. **This is not a patched run, a future outcome guarantee, or permission to keep all the other unknown-person defaults.** Unknown candour and standing also need an explicit semantic rule. Nothing here raises a band or fits willingness, traits, credibility or a headcount to reach the floor.

## Cast drafts under 0085 and 0087

All proposed values, boldness and candour need a contemporary leg **before 5 March 1861**. Temperament is not covered by the innate-through-July exception. A contemporary document printed in the Official Records counts by its own date; a governor's own words can show his political conduct, but an own quality assessment cannot alone establish candour. These are [replacement fragments](S89/people.csv) for existing IDs, with [48 explicit cell dispositions](S89/judgment-drafts.csv), never three additional people or directly loadable opening rows. Six cells are proposed [I], 42 held. No exact permille is researched.

**Thomas O. Moore.** His January 22 message is dated on OR I-I p.493 and signed on p.496. Propose `duty` [I] from his accounting of assumed public responsibility and inter-State assistance, and `state_autonomy` [I] from his defence of independent State action and the convention's authority (pp.494–496). Propose boldness `above` [I]: he calls for settling the conflict now and reports having already seized military posts and arms; he also emphasizes avoiding collision, so `high` or an unconditional appetite for attack is not warranted (pp.494–495). The page images were inspected. His message defends the political interests of slaveholding States; that context is retained and not endorsed. The separate `slavery_defence` cell stays held pending a more direct leg, rather than silently turning vague “rights” into either proof of innocence or an unsupported precise value. `native_state` is held: the State governed is not evidence of birthplace allegiance. Candour, regard, other ratings and traits remain unknown.

His later correspondence directly contradicts treating the model's universal objection as the history: March 14 seeks clarification of the term; March 15 reports orders complying with Walker's call and asks about transport, organization and an ordnance officer (OR IV-I pp.164,171–172). On March 18 he expects the requested infantry and offers a further regiment subject to practical arrangements (p.175). On May 20 he conditions additional arming on home protection and the existing volunteers' terms, while reporting the Fifth and Sixth organized (pp.336–337). These are bounded disputes and undertakings, **not new starting traits** or clearance of the Fifth's separate muster/deadline conflict. July's clothing request is not refusal to raise (p.495).

**Madison S. Perry, the governor addressed in the in-window Florida correspondence.** His February 2 message begins partway down OR IV-I p.85, ends and is signed on p.88. Propose `duty` and `state_autonomy` [I] from his call to fund defence, reclaim delegated sovereignty and prepare the expected Confederate quota before it is called (pp.85–88). Propose boldness `above` [I] from the pre-start order to occupy forts and request Alabama aid, reported by Andrew B. Moore on January 8 (OR I-I p.444), together with Perry's call for armed preparation (OR IV-I pp.87–88). He expressly hopes preparedness may avert war, so no `high` centre or unconditional assault preference follows. Senators' advice against assault on OR I-I p.445 is their advice, not Perry's own promise. His inability to supply a financial estimate (IV-I p.88) is not enough to rate candour; the independently reported occupation order is not independent testimony about candid reporting. Candour and regard remain unknown.

Do not copy the Georgia declaration's explicit slave-property language at the **top of IV-I p.85** into Perry's message. It is a different document. His own message's slaveholding-State context is visible, but this packet holds the distinct `slavery_defence` value pending a more direct leg. His February 13 proposal about representation is not personal regard for Davis (p.102).

Perry tells Walker on March 19 that he will furnish the troops (IV-I p.176); on April 19 he is raising the 1,500, asks about the additional demand and reports a limited effective force; Walker offers to revoke the requisition if it cannot be raised expeditiously, and Perry undertakes to raise 2,000 on April 20 (pp.226–227). On May 18 he reports one regiment awaiting orders and two needing arms/equipment (p.333). On June 1 he says he has been telegraphing about 2,000 raised and presses for coastal protection (OR I-I p.469). These establish practical constraints and correspondence, not universal unwillingness or retrospective permission to set starting candour.

**Edward Clark.** His April 4 letter asks Davis to accept a mounted regiment for frontier defence and presses Confederate responsibility for its support (OR I-I p.621). His May 15 letter transmits commissioners' business (OR IV-I p.322). Both are after the starting-cell boundary. The first retains his prejudicial characterizations as his claims; no new judgment about Native nations or Mexicans is adopted here. Waul's contemporary comment on Clark is also post-start (I-I p.616). No sufficiently early value, boldness or candour leg was read. All Clark starting judgments stay held; his position as a Confederate governor is not a substitute. The Texas Archives finding aid lists a March 4 Hobby manuscript, but its contents were not read and supply no judgment. Further originals may change the draft; no fabricated `average`, `duty`, pro-Davis regard or high candour is entered to make his calls succeed.

## Proposed rulings and rejected alternatives

1. **Accept the diagnosis for a later build:** preserve unknownness through the profile/reader so unknown contributes no judgment term; separately specify unknown candour and unknown standing behavior. Reject universal refusal, silently treating unknown as average/candid, fitting traits or fixing three names only. Existing shadow design and affected decision/tests require that build's review; no implementation is authorized by this research packet.
2. **Review the six source-bounded cast proposals and retain the holds.** Reject March–July letters as starting-value or temperament legs, courteous closings as regard, an assignment as ability, office as personal loyalty, own quality praise as candour, State defence as birthplace allegiance, and adjoining Georgia text as Perry's words. Higher/lower numerical centres are not established by these readings.
3. **Keep historical constraints separate from the unknown-input defect.** Review quota/term/arms/transport/notice semantics in a later bounded build; reject blanket willingness increases, forced levies, assumed headcounts, duplicate identities, backdating and waiver of the 100,000 floor. The four 1A failure categories in frozen S82 remain binding. No later S83 result is anticipated.

## Evidence and verification

[Source reading](S89/source-reading.json) records 27 selected page locators, five inspected images, exact extraction leaves and upstream hashes. This is not a whole-volume reading claim. Raw scans stay outside all worktrees under `C:/Pyrrhic/mandate-research-sources/S89/`. Discovery excerpts, sales listings, a placeholder web page and unread archival entries are not historical evidence. Fresh selected-text and image reading, not prior lane conclusions, supports the proposals. `NEW:S89-*` keys in the draft require ordinary provenance/gate review before any apply; no production provenance or signature changed.

Verification is reproducible with `python docs/research/S89/verify.py` from this worktree. The retained artifacts and code excerpts are its inputs. Cheap dependency/alias, opening and type checks precede the unchanged commit hook. Final check results, source/preservation inventories and the actual commit are recorded in `runs/s89/` and the sole fresh-read UTF-8 CODEX append. There is no new campaign: S82's frozen outcomes are reused with hash checks, and this packet changes none of its inputs. No new timing, CI or 1A pass is claimed.

## For the lead

1. Route the unknown-input semantics defect to a later build with evidence masks and meaningful regression cases; do not use these thirteen objections as historical calibration targets.
2. Review the six draft cells and retain Clark/candour/remaining-value holds under 0085/0087 and the gate. Route originals research separately if needed.
3. Keep the existing strength and other 1A holds through S83 and whole-branch review. Nothing is signed or cleared for main.

## Findings outside my scope

S83 integration; S85 timing; military-pack application; scorer/band changes; unknown-person code fixes; a complete Clark pre-start archive search; original muster/deadline conflicts; whole-branch/gate acceptance, main integration, release and pushing. Harris/Letcher post-start judgment citations and uninstantiated opening regard are documented inherited findings for the lead, not silently corrected here.
