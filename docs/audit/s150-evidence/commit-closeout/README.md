# S150 defect and branch-commit closeout

Lead ruling: 24 November 2026, “S150's hooks and live orders received; fix the
defects, mark the July liveness as known, and commit”. Baseline: HEAD `91a816bd`,
staged tree `387794045a03b3978d2656dc507d6adba5e5db83`, 522 combined paths.
S152 is outside this work.

1. `ReportedAvailableLot` is an immutable record; its five readonly properties
   are derived by the ownership audit. All 15 diagnostics are reads, not writes.
   [The diagnostic disposition](one-writer-diagnostics.json) names each site and
   reason. The raw scanner and its positive controls are unchanged. Exact
   path/line/key/form classifications require the reviewed whole-source hash;
   a changed, missing, unused, ambiguous or unexplained entry fails closed.
   Nine fictional registry guards and 44 existing ownership tests pass.
2. The old day-40 fixture was first reproduced exactly with kernel `5c4a9d83`
   and its own command log before comparison. Days 1–5 match the current kernel.
   [Day 6](fixture-first-cause.json) adds only the governor's after-muster
   holdings dispatch, accepted mechanism 0133. All common messages and other
   roots match that day. The fixture was regenerated with
   `node --import tsx tools/make-save-fixture.ts`; all seven saved-run tests pass.
   [Daily hashes and provenance](fixture-divergence.json) retain the old and new
   fixture hashes. New state hash: `1b863e8162908bd849a055f1f003ed726031e5d873b55ad734aef5732a5f4a72`.
3. The junction selector uses `johnston_junction`; its original assertion is
   unchanged. F07 stamps the fictional superior's actual land-mode authority
   onto its fabricated ask. The original voluntary-offer/response/receipt
   assertions pass. Its new unstamped counterpart defers `modes_unavailable`,
   sends no assignment and preserves the holder without a join.
4. The reported “wire price 1 to 0” was **latency**, in days. Attention price
   remains 0. In the retained 0135 States, Northern Virginia has no control
   entry and no wire owner: the wire falls back to a one-day courier. In the
   accepted live-orders States, McDowell's hold operation after receipt creates
   Union control 360 on day 120 and 585 on day 140, above the unchanged 250
   threshold. The holder owns the wire, eliminating that courier leg. Wire and
   special messenger then both take zero days; unchanged fastest-route policy
   chooses free wire ahead of the messenger's price 1. [Pure derivations](wire-latency-cause.json)
   preserve all State hashes. Actual day-134 packets and earlier menu witnesses
   remain in [the accepted capture](../live-orders-capture/lead-review.md).
   No day-134 State was invented and no campaign was repeated.
5. A new two-day fictional live-driver test uses a real opening letter, a
   received fictional objection and no owned/public wire connection. The real
   rules seat selects the urgent special messenger; the kernel sends it and
   fires `messages.special_messenger`. The nominal free wire option falls back
   to the slower courier. This supplies the driver for that run's quiet record.
6. Exactly the three authorized tests use Vitest `.fails`, each naming all 25
   failing bands/floors and “the July armies have not formed”.
   [The full observations and scope](known-liveness.json) retain every captured
   value. No band, floor, value or threshold changed. Ordinary assertions outside
   the marks keep new diagnostic kinds, other criteria, testbed/exercise
   failures, run errors, criterion inventory changes and planted-control defects
   red. Reference results are reused. The standalone/hosted done check is
   unchanged and acceptance remains unmet. No merge into `sprint/july` while
   any mark remains.

[Independent review](independent-review.json) passed after targeted corrections
to prevent `.fails` hiding unrelated assertions. [Validation receipts](validation-evidence.json)
record focused results, boundary/rules exits and raw log digests. Boundary and
rules checks precede the commit's ordinary hook. The hook runs the full staged
check; its final log is `runs/s150-commit/commit-hook.log`, with actual disposition
in the single final CODEX status. Any other failure stops the commit.

[Preservation](preservation.json) verifies all 231 prior raw files and the exact
starting index before staging these authorized closeout changes. No other
worktree is written except the one final UTF-8 Python append to the lead's
CODEX after reading it fresh. No process was stopped, no local timing is
performance evidence, no browser or desktop was used, and nothing is pushed.

Findings outside my scope
