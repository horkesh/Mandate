# Proposed decision: count source-bounded pushback acts

Status: **proposed, unsigned**, 23 November 2026; S87, for the lead's ruling.
Would amend **0099 item 6, as amended by 0109**. It is deliberately outside the accepted
decisions directory. No band, scorer, assertion, pack or accepted record changes.

## Problem and recommendation [I]

Use **named case coverage** for historical calibration, and retain **all response
events** as a separate diagnostic. A selected historical case and every response
in a generated history are different populations. Taking one third as many model
responses, counting only Union responses, or merging everyone who shares a surname
does not repair that difference.

This proposal specifies a measurement, not new passing numbers. The accepted
0099 table, with **0109's relay-hold 1–4 and filter-hold 0–6 amendments**,
remains binding until the lead accepts an amendment and its numerical
schedule. Never compare the case-coverage totals below to that table's existing
floors and three-times-catalogue ceilings. No 1A pass follows from this draft.

## Proposed decision [I]

1. **Window and side.** Use 5 March through 31 July 1861, inclusive, in the
   history reference with each government's own war decision. Attribute an order
   response to its **issuing principal's side**, separately retaining the actor's
   office and role. A governor answering Lincoln is on the Union-issued side of
   this measurement even if his State later joins the Confederacy. A second
   side is not added to a Union source floor. Confederate historical calibration
   requires its own source register; Confederate model responses are reported
   now, never silently discarded.

2. **Unit.** One register row is **one named actor's act, in one role, on one
   bounded matter**, supported by identified pages. Its key is
   `(issuer side, actor, role, matter, act)`. `act` identifies the particular
   response, intervention or omission, not every mention of it. Supporting
   letters, forwarded copies, observer snapshots and repeated descriptions do
   not add acts. A materially new instruction can create another act; a reminder
   or renewed report of the same unresolved resistance cannot. Record the
   source and reason for the boundary before scoring. Different actors on the
   same chain can contribute separate acts in their respective roles.

3. **Model matching.** A registered act scores at most one, from the model's
   actual behaviour in the same role and matter. Retain every candidate order
   and its response day; do not require the historical day, a particular outcome
   of the war, or fitted traits. A matching actor alone is insufficient. Assign
   one model act to at most one historical row in the same band. When several
   rows describe successive responses on one matter, use distinct model acts in
   order; do not reuse a single answer. A contradictory response is a **mismatch**;
   no relevant model act is **not observed**; incomplete evidence is **unresolved**.
   An unresolved case cannot satisfy a floor. Raw actual/declared response
   differences remain visible, including covert delay.

4. **Meaning of the seven units.**

   | Band | One eligible registered act | Does not qualify |
   |---|---|---|
   | Relay objections | A named intermediary objects while relaying a particular instruction | An addressee's objection; ordinary transmission |
   | Relay holds | A named intermediary actually withholds that instruction contrary to the principal's delivery direction | Transit time, administrative difficulty alone, or authorized discretion |
   | Filter holds | A named incoming-report filter deliberately adds a hold before the intended principal receives a particular report | A visit with zero hold; an outgoing answer; refusing extra troops |
   | Trims | A named incoming-report filter removes a material claim from a particular report before delivery to the principal | Claim count/magnitude; an assurance made outward; an unproved failure to disclose one's own activity |
   | Compliance with reservations | A named addressee undertakes the same request with an evidenced qualification or reinterpretation | A clarification question without subsequent undertaking; plain compliance |
   | Slow walks | A named addressee delays the same requested action, with evidence connecting the delay to his response | Pure journey/assembly time; an objection followed by ordinary timely execution |
   | Objections to a plan | A named actor challenges a particular proposed course, supported by the content of the objection | Every `object` rung, especially refusal of a troop requisition, without regard to its matter |

   An individual Cabinet answer is one actor's act. A group summary does not
   become five proved individual acts. Unread individual answers remain held.
   A refusal is retained in the register and diagnostics but does not become a
   plan objection merely because the runtime calls its rung `object`.

5. **Register and publication.** [case-register.csv](S87/case-register.csv)
   records the freshly read, source-bounded acts relevant to the disputed units.
   It includes excluded and qualified acts so their disappearance cannot be
   mistaken for a repaired mechanism. [catalogue-disposition.csv](S87/catalogue-disposition.csv)
   accounts for all 41 inherited Appendix C rows. That file is a register of
   *catalogue claims and reading holds*, not fresh verification of their history.
   It preserves their old labels and does not erase accepted floors. The present
   register is a bounded revision of the disputed cases, **not a replacement
   verified catalogue for all ten plan objections**. Existing unreviewed rows
   remain outstanding; accepting this unit must not silently retire them.

6. **Numbers and required next ruling.** Before numerical implementation, the
   lead must accept the eligible source register for each band, decide all
   reclassification/reading holds, and publish the resulting case obligations
   and any design ceiling with the same unit and population. A finite register
   measures coverage, so an upper bound of three times its own row count cannot
   detect excessive *unregistered* resistance. Keep that burden visible as raw
   diagnostics; designing an exposure-normalized burden ceiling requires a
   separate ruling and historical denominator. No denominator is invented here.

7. **Diagnostics stay complete.** Publish counts by issuing side, actor, role,
   request kind and actual rung, with all contributing order IDs/days; publish
   relay/filter firings and trim magnitude separately. Publish matched,
   mismatched, not-observed and unresolved registered acts, and all unmatched
   raw events. A zero registered score never conceals nonzero raw pushback.

## S82 scored under the draft

Frozen reference: `e2b98c818b6e5e0c2e81256e5cba4955bb7feaa2`.
The input is S84's **34-row pushback-responses.csv**, preserved as a UTF-8,
LF-normalized [snapshot](S87/s84-pushback-responses.csv), with separate original-byte
and snapshot hashes in the receipts. It contains reservations and
addressee slow walks only. S82's frozen observations, final State, trace,
criteria and summary supplement it for the other bands and audit the join;
they are never replaced by the currently running S83 tree. Receipts and exact
order matches are in [the scoring evidence](S87/score.json).

The newly read eligible rows yield **one matched reservation act**: Morgan's
April militia-call response. Harney's agreement has no matching response.
Morgan's 18 April undertaking is on **OR III-I p.85**, correcting Appendix C's
p.86 locator; the clarification request is on **p.72**. Calling this a
reservation remains a nearest-type inference, not a claim that his question
proves reluctance.
Patterson's nearby model goal responses are plain compliance, but their exposure
is different: the President issues **hold lower_valley** on model day 112 and
**hold harpers_ferry** on day 140, rather than the record's fresh attack or
demonstration direction. Neither his recorded objection nor his delay is matched;
this is an **exposure mismatch**, not proof he would comply with the historical
order. The exact command payloads are retained. Seward's 1 April memorandum has no matching response
act. These are failures of case coverage, not a claim to have disproved every
other historical act or every latent capability.

| Band | Matched acts in freshly read eligible subset | Status of source denominator |
|---|---:|---|
| Relay objections | 0 | No eligible case in this bounded rereading; no inferred zero historical frequency |
| Relay holds | 0 | N3-11 unresolved resistance under the proposed stricter unit; 0109's existing floor remains binding; N3-27 authorized, excluded |
| Filter holds | 0 | N3-06 and X-03 belong to other channels, excluded |
| Trims | 0 | N3-07 does not prove this act; disclosure question unresolved |
| Compliance with reservations | 1 of 2 | X-04 matched; N3-26 qualified historical analogue, not observed |
| Slow walks | 0 of 1 | N3-34 qualified delay analogue, exposure mismatch; N3-10 attribution held |
| Objections to a plan | 0 of 2 | N3-14 not observed; N3-33 exposure mismatch; rest of old ten-case floor not replaced |

The match is on Morgan's **April call**, not his other five reservations.
Their different dated `respCallId` values survive in the unmatched ledger.
Alabama's cavalry and reserve replies also stay separate. Calling all these
duplicates merely because one person answers them would discard different
matters. The raw scorer still reads **16 reservations /18 slow walks**: Union
**11/9**, Confederate **5/9**. Of the reservations, 15 are calls and one is a
Confederate appointment. All 18 addressee slow walks are calls. Two additional
Cameron relay slow walks are excluded from the addressee band by its standing
role rule, and remain separate relay diagnostics. Exact counts for every
response kind and all seven accepted counters are retained in the packet.

## N3-07: what the pages establish

Campbell's 13 April letter describes his own communications to the commissioners,
his consultations with Seward and Nelson, his notice to Seward of what he had
said, and Seward's changing explanations. Its reprint gives an expectation of
evacuation within **five days**, later reassurance, a **1 April** written
notice-before-supply statement, and the **7 April** reassurance. These are
different communications: the register splits them rather than counting the
four-date bundle as one proved trim. Campbell's account does not describe a
report addressed to Lincoln with a claim removed. It also does not establish
which of those communications Lincoln had or had not learned. The 20 April
covering letter says Campbell had received no reply to his 13 April inquiry;
it does not prove that Lincoln was ignorant. **Richardson I, pp.93–97**, especially
**pp.93–96** ([edition OCR](https://archive.org/download/compmessages01richrich/compmessages01richrich_djvu.txt)).

The outward refusal memorandum is a separate act. It records presidential
concurrence in declining official intercourse and describes delayed delivery
with the commissioners' understood consent. That cannot prove presidential
knowledge of every private assurance either. **Richardson I, pp.85–88**,
especially **pp.87–88**. Do not import its explicit concurrence into N3-07,
or use N3-07 to deny the concurrence the memorandum actually records.

Burlingame's discussion argues that unauthorized assurances are the likelier
reading, but its footnote explicitly allows the possibility of authorization
and records Welling's contrary, unsourced claim of Lincoln's full knowledge.
It cites an April newspaper denial which S87 has **not** independently read.
The narrative distinguishes a prediction from the pledge Campbell understood.
This supplies a documented historical dispute, not proof of a particular
withheld incoming report. **Burlingame, online manuscript II, ch.22,
pp.2349–2351, especially p.2349 n.87; p.2392**
([published chapter](https://www.knox.edu/documents/LincolnStudies/BurlingameVol2Chap22.pdf)).

**Proposed ruling [I]:** whether Seward kept these specific assurances from
Lincoln remains **unresolved on the evidence read**. Unauthorized is not the
same proposition as undisclosed; silence in Campbell's account proves neither
Lincoln's ignorance nor his full knowledge. Exclude N3-07 from the verified
*incoming-report trim* floor. Preserve a separate, unresolved
originator-disclosure case. A mandatory positive trim floor for this 1861
window is **not supported by this case**; that is not a claim that no trimming
ever occurred in 1861. Do not set the floor to the observed zero, invent a loss
claim, lower Seward's candour or create a filter office. The old floor remains
binding until the lead accepts a replacement; a separate live mechanism test
is capability evidence, not a historical frequency witness.

The OR I-LIII pp.162–163 web locators failed in this session. They are not
claimed read or used to settle their reported **ten/five-day** textual conflict.
The Richardson reprint's five-day wording is the actual edition used here.

## Rejected alternatives [I]

- **Union-only counting against the old numbers:** 11 reservations still exceeds
  9; selected cases and all answers remain different populations.
- **Raise ceilings to 16 and 18, or tune thresholds/traits:** fits this output
  without making the historical and model units comparable.
- **One person once in the entire window:** merges different calls and roles;
  one actor can perform more than one distinct, sourced act.
- **One order ID always equals one historical case:** repeated delivery,
  reminders and revised plans can describe one unresolved matter. Conversely,
  different requests on one day are not automatically one case.
- **Keep only declared responses:** loses covert delay already observed in truth.
- **Count all object rungs as objections to a plan:** troop-call refusals and
  advice about a proposed campaign have different meanings.
- **Treat a selected-register score as a full-history pass:** hides unmatched
  generated resistance and incomplete historical coverage.
- **Count outward assurances as report trims, or elapsed days as resistant
  relay holds:** changes the mechanism to rescue an unsupported floor.
- **Immediately set unsupported floors to zero:** absence of proof is not a
  measured zero-frequency historical population or an accepted numerical ruling.

## For the lead

1. Rule on the named-act unit, separate raw diagnostics, and the explicit
   prohibition on comparing the new subset score to the old numerical table.
2. Rule on N3-07's removal from verified incoming-trim evidence while retaining
   the disclosure hold; complete the remaining register before numerical apply.

## Findings outside my scope

S83 integration, S85 performance, S86 strength work, scorer/band implementation,
new simulation campaigns, remaining catalogue primary readings, original
Seward/Lincoln disclosure evidence, whole-branch/gate acceptance, integration,
release and pushing. No sensitive-history item is signed.
