# S70: regiment lots without changing the reference behaviour

For the lead: 3 items. S70 only, `C:/Pyrrhic/sprint-july`, `sprint/july`, on the staged S67/S68 stack.
Read the lead's S66/0107/0108/S69/S70 message, accepted 0108, and S68's complete
status and hand-over. Research inputs are read-only S66 registers. No commits,
push, hook bypass, browser, desktop control or other-lane implementation.

## Fixed validation plan

Question: do lots, catalogue assignment and per-regiment service preserve every
unrelated S68 reference output? S68 changes no simulation input, so reuse S67's
once-run references as its baseline. Snapshot the original index, staged patch
and file inventory first. Keep logs, exits and recovery under `runs/s70/`.

Reject cheaply with typecheck, boundary, pack generation/validation, prescribed
fixture regeneration, rules, paired-State/one-writer tests, affected force and
recruitment tests, and a two-day startup/projection preflight. Require exact old
State hashes after projecting lots to the previous block/enlistment schema.

Then run `MANDATE_NO_GIT=1 node node_modules/vitest/vitest.mjs run
--maxWorkers=1 --reporter=default --reporter=json
--outputFile=runs/s70/full-suite.json` once, about nine minutes on the evidence
from S68. The four inherited July assertions remain binding and expected to
fail; every new failure must be explained and corrected at its cause with a
targeted check. Stop expensive retries, inspect every failure category, and
reuse unaffected evidence. Do not rerun the full suite for reassurance.

Run each frozen reference once, with replay/save/resume, full daily counters,
checkpoint scores, old-schema projection hashes and tick timings. Compare all
268 projected daily hashes, every daily field/counter and score. Measure the
reference ticks against 40 ms and state host activity; this is not hosted timing
certification. Do not run the done check. Freeze simulation inputs before the
suite and check them again before references and closeout. Final inventories
and runtime diagnostics precede final-result prose. Keep everything staged and
back up the complete staged tree.

## Delivery and exact behavioural acceptance

`forces` now saves `fbLots`, not block strength/straggler totals or a second
block enlistment table. A lot carries identity, generated marker, arm, quantities
and its raising/service provenance. `forceTotals` is the aggregate reader;
`enlistmentOf`/`enlistmentsOf` derive the old block service observation and next
fixed expiry. Indexed-world WeakMaps cache by immutable lot array. Stores and
condition updates reuse that array. Ownership/FOUNDATION rows and nested
immutable records cover the new fields. Consumed catalogue/generated identities
remain in `forceRaisedIdentities` after discharge; a regiment cannot be raised
again by reusing its catalogue entry.

A raised batch remains one block. Known regiment counts consume the model's
quota in nominal men-per-regiment order, leaving a partial last lot when needed.
The existing two-regiment, 1,500-man quota therefore remains 1,500 men. Unknown
counts remain one unidentified, unknown-strength lot. Initial scenario
formations remain single unlabelled lots with their existing quantities. A later
return may quantify the same unidentified batch when its count becomes known,
keeping one aggregate lot. It cannot mint or replace identities or assign that
aggregate to individual regiments. An already identified unknown-strength batch
may only confirm its original model quota. Unsupported apportionments are refused
with a typed reason. No historical aggregate is divided into regimental strengths.

Quantity reductions use proportional integer floors, with remainders in strict
lot-identity order. Missing men are allocated from the men removed; returns use
straggler weights. Unknown men stay unknown and exact block totals are conserved.
Detachments split quantities into distinct lots, rejoin without copying men,
and mint collision-free lot identities even when a detached block id is reused.
Service provenance stays with each lot. S70 creates homogeneous service batches;
regrouping different terms and their partial discharges belongs to step 2.

The immutable catalogue preserves **214 identities and 365 dated observations**
from S66, including all original observation/path fields, source/page citations,
scopes and distinct militia/volunteer identities. Order is the explicit S66
regiment-path row order, independent of dates. The source fields compare exactly
with the two registers. No historical strength, commander record or alias merger is invented.
Only the next unused identity of the raising state's department, matching arm,
regimental scope and an explicit sourced term, can be assigned. Overflow and
unmatched terms receive marked generated identities.

S66 supplies terms for **53 records, all Union; 161 have no established term**.
Unknown terms are not wildcards. The Union reference consumes 34 catalogue
identities; five remain live at its end. The remaining sources/terms must be
resolved before relying on named identities in step 2. Washington, militia,
alias and strength holds stay open. Generated identities do not settle them.

Both references ran once: **zero rejections; exact replay and save/resume**.
Every counter, daily field, score, decision and observation is identical to
S68's reused S67 references. All **268** daily hashes and both initial States
are recovered by projecting lots back to the former quantity/service schema.
The World differs only by its catalogue. The prescribed save-fixture tool ran;
its original World/log are exact and projecting the new State recovers its old
hash. No released-save compatibility is claimed; 0108 prescribes regeneration.

New final hashes: Union **9a299907554c955ff00407b814f9ab3ff694aa8bc942a3785e2fcb01612329f1**;
testbed **160f67761bda23a1fe11ebacd92099ccbde4ff757171e00de45926136e1158db**.
Projected finals: **d330b44b3e2bd2bdf2978caacd28b11ed624920c770850e0491af6a56168e327**
and **911345b7cd7e740e8f9e723b345537a6b435768bd3ab1ac2e3299814903eb71f**.

## Checks and retained limitations

Final typecheck, rules (**zero new/changed/stale findings**), boundary and pack
validation pass. Paired-State/one-writer batch: **91 pass**. The completed full
suite exits **1**, **564.124 s**: **214 passed / 3 failed files; 2,003 passed /
4 failed / 3 skipped tests**. Failed assertions match S68 exactly: R86's July
battle paper, Union liveness, and the two liveness-dependent done-check unit
assertions. Ten new tests pass. No July assertion, band or checker is weakened.
Existing quantity/service test observations and fixtures follow the new schema;
the ownership-list expectation follows the renamed root. Four classification
fingerprints change only through aggregate readers/cache plumbing; every
protected-read identity is unchanged and citations/reasons remain intact.

An initial suite attempt was stopped after **287.526 s** when a preservation
check exposed Windows-default decoding in my editing scripts. Original Unicode
bytes were restored, exact catalogue preservation checked, and **121** cheap
correction tests plus typecheck/rules/boundary passed before the single completed
replacement suite. Only my own test node/worker were stopped. No completed suite
was repeated. Stopped evidence is retained.

Union's kernel/replay/resume and State projection passed on the first full run.
Its wrapper exited **1** because an auxiliary proof compared a raw World hash
with the CLI's compound map/start/situations hash. The corrected compound proof
passes offline against the retained artifacts; the original exit/log and failed
proof remain. Testbed's wrapper exits **0**. Neither reference was repeated.

Measured tick median/p95: Union **42.21/83.94 ms**, testbed **4.34/9.69 ms**.
Union's full-run median exceeds **40 ms**. Background GalaxyClient, Claude/Codex,
Chrome and other normal processes were active on a 16-logical-processor host;
there is no idle-host or hosted certification and no causal attribution to them.
The 100 microseconds/block/day and 40 ms limits are unchanged and not waived.

After the Union measurement, one redundant derived-table computation in the
renewal filter/sort was bound once. Expanding that pure binding gives the exact
previous function body. Ten retained-State queries reduced root reads from
31,050 to 1,350, with the same results; 148 eligibility-day queries also match.
**65** targeted renewal/ownership tests, typecheck and rules pass.

Final requirements review also found the legacy quantified-return path reaching
the new regiment allocator. The corrected path retains Tennessee's day-119
22,000 infantry and 2,000 cavalry as **two unidentified aggregate lots**, rather
than deriving 24 regimental strengths from that historical return. It preserves
the original service credit and block totals. A first strict guard exposed the
existing generic unknown-batch return contract; the corrected aggregate-lot
case preserves that contract without apportionment. No assertion was changed.
Two added regression cases and all **63** targeted state-force/ownership tests
pass, with final typecheck, rules and boundary.

A bounded correction check starts at the retained day-60 save and runs only the
88-day suffix, with replay and a day-120 save/resume (**43.028 s**). All **88**
old-schema hashes, all **30 affected daily rows** from day 119, six checkpoints,
decisions, replay and save/resume match. The first changed new-schema hash is
119. Day 61 has the expected cold-cache diagnostic recomputation, retained
separately, not substituted into the continuous reference counters. The original
unaffected prefix and functional evidence are reused; neither whole reference
nor the completed suite was repeated. Current-code evidence is explicit in
`post-suite-input-receipt.json`, `return-suffix/receipt.json` and the combined
projection. The original reference trace/final carry the pre-correction lot
representation: **use `runs/s70/return-suffix/final-state.json` for the current
Union lot inventory**, and its day-120 save. It has 134 blocks and 243 lots.

There is **no final full-run Union timing after these corrections**, so
performance acceptance remains open. No standalone done check, sweep, build or
full timing campaign was added. S68 licence/decision checks are reused with
unchanged inputs; no production dependency was added.

## Preservation and proposed rulings

Source/runtime inventories preceded this final prose. All **2,052** original
paths remain, **1,993** byte-exact; no settled final input drift across **703**
inputs. The original index remained exact until final staging. S64's withholding,
S65's belief/arrival/pending-letter semantics and S68's bounded corrections
remain. HEAD stays `febfd38ca2241e35e8ab1013857470b7c0e4b45f` on `sprint/july`.
No commit, push, hook bypass, signature or browser/desktop action occurred.
The four excluded lanes were not written; only S66's authorised research inputs
were read there. The main coordination file receives one fresh-read UTF-8 Python
append.

Proposed rulings: retain the canonical lot storage, cached derivations, model
quota/partial-lot allocation and strict sourced-term selection. Reject saved
duplicate totals, daily regiment blocks, historical-return apportionment, date
matching, unknown-term wildcards, guessed aliases and cloned absent regiments.
Retain the exact behavioural acceptance evidence; reject July or performance
clearance from passing unrelated checks. The lead should route the term gap and
the outstanding controlled timing measurement before treating step 2 as cleared.

Portable evidence: `docs/audit/s70-evidence/`. Complete logs/exits, initial index,
source/encoding proofs, raw references, States/saves, runtime diagnostics and
staged backup: `runs/s70/`. Final backup/index/hash and reverse-check receipt:
`runs/s70/final-receipt.json`; patch: `runs/s70/final-staged.patch`.

## Findings outside my scope

S69 cast work; the missing regimental term evidence and S66 research holds;
organisation, provisional bundles, division posts, transfers and mixed-term
regrouping/discharges in step 2; the retained July/contact/checkpoint/pushback
contracts; controlled 40 ms and 100 microseconds/block certification; whole-stack
review, integration, release and pushing. Nothing is signed or cleared for main.
