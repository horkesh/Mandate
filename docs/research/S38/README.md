# S38: experience from service registers

Research draft, 21 November 2026. Unsigned. S38 only, from `4d475c2` on `sprint/research-cast`. Nothing here is loaded by the pack or admitted to its sources table. S12 and S22 remain byte-for-byte unchanged.

The delivery covers **392 handles**: all **239 S22 pool handles**, plus a **153-person superset of the live cast's military and bureau roles**. Existing and provisional handles remain separate even when a proposed identity link points to the same person. Of the 392 experience cells, **225 have conditional value proposals and 167 remain HOLD**. The pool alone has **100 proposals / 139 holds**. These are research coverage counts, not 392 distinct historical people or 225 accepted changes.

| File | Contents |
|---|---|
| [service-records.csv](service-records.csv) | One row per handle: commissioned tenure by 1 March 1861, named service, field-command evidence, staff/bureau evidence and remaining limits |
| [experience.csv](experience.csv) | Seven-column rs-shaped experience proposals; no apply has run |
| [service-intervals.csv](service-intervals.csv) | 253 dated U.S. intervals behind the calculations |
| [militia-intervals.csv](militia-intervals.csv) | 22 year-bounded state/other-government intervals, kept distinct from U.S. service |
| [naval-service.csv](naval-service.csv) | 44 Navy/Marine entries, with the first rank counted under the proposed definition |
| [staff-intervals.csv](staff-intervals.csv) | 65 dated staff/bureau intervals; partial aggregates, not complete duty histories |
| [cast-post-coverage.csv](cast-post-coverage.csv) | Live-cast post selection with the pack's dates and uncertainties preserved |
| [post-exclusions.csv](post-exclusions.csv) | Draft post references whose person IDs have no live cast row |
| [government-transitions.csv](government-transitions.csv) | Attributed U.S. exits; an exit never supplies a Confederate appointment |
| [later-confederate-register.csv](later-confederate-register.csv) | 103 selected later rank events, separating appointment, rank and confirmation dates |
| [later-commands.csv](later-commands.csv) | 252 dated OR command observations, reread independently of the prewar calculation |
| [conflicts.csv](conflicts.csv) | Edition disagreements, resolved OCR errors and rejected homonyms |
| [holds.csv](holds.csv) | One concrete next-source request per held experience cell |

[Method](method.md) gives the single proposed rule and its rejected alternatives. [Sources](sources.md) gives editions, reading limits and failed acquisitions. Every `NEW:S38-... p...` locator resolves through [scan-manifest.json](scan-manifest.json) to the scan URL, local file and SHA-256. The manifest contains **473 entries**, including five title leaves, **563,319,310 bytes** when counting the official PDF once. Cited passages were read; this is not a claim that all 468 complete numbered pages, or any whole volume, were read. The PDF row identifies the whole scan and a separately hashed page render.

There is **no established numeric prewar field-command strength** in this delivery. A source's command of a battalion, column, district or expedition is recorded where read; the maximum command and its numerical strength remain HOLD when not established. No casualties, rank or later command substitute for a strength return. Naval action and ship-command details also remain held where the rank list supplies none. Lack of an entry never becomes zero service.

The read-only [audit](audit.py) checks coverage against the actual cast/post files, interval unions and bands, priors, citation resolution, every manifest hash and preservation of **all 1,721 original tracked files**. Run `python docs/research/S38/audit.py` with the external evidence directory present. [Counts](counts.json), [source/derivation inventory](source-artifacts.json) and [validation receipts](validation.json) support review. All 117 source/derivation files and five runtime artifacts also passed their hash audit. The research commit `50c1143` passed its actual hook: 139 test files, 1,548 passed, one existing expected failure, three skips and all chained checks. Scans, raw logs and derivation scripts remain in `C:/Pyrrhic/mandate-research-sources/S6/S38/`; the closing hook has its separate `commit-closeout` receipt there.

## Findings outside my scope

The lead must accept or reject the experience rule and identity joins before source admission or application. Full 1860/January 1861 register collation, unresolved state/foreign service, complete staff histories and prewar strength returns remain named research holds. Whole-branch and sensitive-history review remain with Claude under 0106; no gate or reviewer signature is supplied.
