For the lead: 3 items

# S3: Congress, politics and the 1862 midterms

Research delivery, 2026-11-20. Branch `sprint/research-politics`, base `ceff796`. Docs only; no pack, engine, gate signature or other lane changes. Decision 0106 governs commits and deferred review. Four dated notes are under `docs/research/2026-11-20-S3-*`; scans and raw verification evidence are external.

## Delivered and where to begin

1. [Congress and politics](../docs/research/2026-11-20-S3-congress-and-politics-1861-62.md): sessions, Confiscation Acts, Legal Tender, Homestead, District emancipation, the preliminary proclamation and dated political positions. The original House Homestead and Legal Tender tallies use the read, paginated Currie study; the original Senate Homestead and first-confiscation House pages were directly read.
2. [Midterms and checkpoint proposals](../docs/research/2026-11-20-S3-midterms-and-checkpoint-bands.md): sixteen-state, **151-contest** reconstruction, seven later-voting existing states, West Virginia and occupied/contested representation; statutory apportionment/district rules; Directory and organizing-vote comparisons; explicit proposed bands and state checks.
3. [State politics and press](../docs/research/2026-11-20-S3-state-politics-soldier-voting-and-press.md): government-table transitions, state legislative outcomes, Altoona's conflicting dates, Minnesota's original voting law, qualified soldier returns and an Iowa district example, oversight, Douglass's editorials/endorsement, Lincoln's public reply and restrictions on distribution.
4. [Source register](../docs/research/2026-11-20-S3-source-register.md): eighteen used scan files with page/viewer locators, source limitations and an external SHA-256 manifest. Whole-volume downloads are not claimed as whole-volume reading.

Coherent steps: **165d78a**, legislative record and initial register; the second commit adds the election reconstruction, adjacent research, final register and this hand-over. Both use the pre-commit hook. No push.

## Work and verification plan

1. Read the coordination rules, 0106, the existing politics research and the 1B scope. Run `npm ci` before committing.
2. Retain primary scans and their provenance in `C:/Pyrrhic/mandate-research-sources/S3/`. Read the relevant pages; distinguish printed pages from digital leaves. Check OCR against scans for quantitative tables.
3. Document Congress's calendar, acts and votes, parties and political disputes. Reconstruct state election results and distinguish returns known by November 1862 from the completed 38th House. Propose, rather than implement, checkpoint bands.
4. Extend into state elections, governors, soldier voting and the press. Mark interpretations [I] and leave unsupported cells on HOLD.
5. Check citations, arithmetic, links, source inventory, scope and whitespace cheaply before the required project checks. Run `MANDATE_NO_GIT=1 npm run check` through the commit hook and one required `npm run run:done-check`. Expected cost: several minutes for the hook and roughly twenty minutes for the done check; no simulation behavior changes are expected. Pass criteria: each required gate's own exit and counts, with inherited failures retained rather than repaired outside S3. Stop expensive retries after an unexpected failure; diagnose from retained logs and reuse unaffected evidence.
6. Commit coherent documentation steps through the hook, never push. Read the shared main-checkout CODEX.md fresh and append one final UTF-8 status without changing its existing prefix.

## Proposed rulings

1. [I] Keep the 37th serving through November and treat the midterms as returns for its successor; reject seating the 38th on election night.
2. [I] Prefer the direct Globe's 60–48 first-confiscation House tally over McPherson's conflicting 61–48; reject averaging them.
3. [I] Preserve local election labels and separate actual authority, policy implementation and attributed political responses; reject one national support scalar inferred from seats.
4. [I] Use **151 original contests**, not 154: Vermont's successor House returns are explicitly **1863** in TA64 p. 55. Wisconsin's Hanchett won and then died; retain its original result and subsequent vacancy separately. Reject inferring a House election from a general state-election calendar.
5. [I] Propose **63–79 Democratic local-ticket winners**, **0–2 Independent Democratic**, and **71–87 Republican/Union plus Missouri Emancipation**, constrained to sum to 151, with the named state checks in the note. These are design envelopes, not historical error bars or adopted acceptance criteria. Reject passing a national total with a wholly wrong state pattern, or silently waiving any exact-winner criterion the lead adopts.
6. [I] Keep office transitions, state chambers, soldier voting machinery, press arguments and oversight separate. Reject election-night replacement of all governors, a universal soldier franchise, unmeasured press effects or an editorial allegation treated as established fact.

All bands and representation choices remain proposals for the lead. No checkpoint or existing acceptance criterion was changed.

## Verification and retained evidence

`npm ci` exited 0 (51 packages, no vulnerabilities). Typecheck, boundary, licences and decisions preflights exited 0. External logs are under `C:/Pyrrhic/mandate-research-sources/S3/`.

The required `MANDATE_NO_GIT=1 npm run run:done-check -- --label s3-baseline` exited **1** on unchanged code and packs. Phase 0 behaviour, hash, resume, liveness and section-ten passed; the budget failed (Union median 91.83 ms, p95 169.05 ms). Reported 1A checkpoint, operation, pushback and lever-sweep criteria also failed; unknown-strength and stand-ins passed. Every category is retained in `done-check.log`; no expensive retry or out-of-lane calibration is authorized by S3's docs-only work. The hash references were `55a35b1034c19b09` (Union) and `69d8759b02cfa93f` (testbed). Hook checks remain required for each commit.

The first commit's exact-staged-tree hook exited **0**: **137 test files passed; 1,529 tests passed, one expected failure, four skipped**. Typecheck, boundary, dependency licences and the 106-record decision index passed. Evidence: `commit-congress.log` and `commit-congress-exit.txt`. The second commit invokes the same hook; its result is retained as `commit-midterms.log` / `commit-midterms-exit.txt` and reported in the final shared CODEX status. The first result is reused as evidence for the unchanged code, not as a waiver of the second hook.

The final document audit checks links, UTF-8 decoding, the outside-scope endings, state and vote arithmetic, PDF validity, hashes and write scope. It passes with **16 state rows**, **151 total contests**, **18 used scan files**, **42 retained valid PDFs** and **3 failed HTML responses**. The PDF count includes unused downloads, not 42 sources cited as read. Evidence: `audit-packet.py`, `document-audit.json`, `election-audit.json`, `source-manifest.json`, `source-inventory.json` and `renders/`. No code or pack file differs from the base; only the four S3 research notes and this hand-over are in the branch's write scope. This is maker verification; the independent and gate reviews remain deferred under 0106.

## Remaining source and owner decisions

- The proposed checkpoint needs the lead's definition of binding historical winners versus permitted alternate close outcomes. The proposed widths are not accepted merely because they have been documented.
- The almanac's **76/74** roster footer does not reconcile with the local district classifications. The Directory's **184** wider series has a jurisdictional reconciliation [I]: **151** original contests + **29** later existing-state seats + **3** West Virginia + **1** Nevada. Nevada's admission and Worthington's 38th-Congress election are page-backed **1864** evidence. A member-level party crosswalk and replacement/credentials convention still need approval before production use; no November return was changed to fit a later total.
- Retrieve the original House Globe pages **695** (Legal Tender) and **1035** (Homestead); the read secondary source supplies the tallies in the meantime. Some archive issue dates are miscatalogued, and a targeted retrieval timed out. Failed and irrelevant downloads are excluded from historical evidence.
- Establish House-specific statutory election dates, exact governor accessions, Vermont's exact 1863 election day, Wisconsin district vote totals, Altoona's original dated address and Pennsylvania's original court report before authoring precise events. These open checks do not erase the page-backed results already supplied.
- Quantified circulation, delivery lag, persuasion, turnout and policy-vote causal weights remain HOLD. The returns and a small press sample cannot identify them.

## For the lead

1. Review the research and proposed checkpoint definitions after the sprint, including exact-winner requirements and a party/coalition crosswalk.
2. Route sensitive-history material to the gate reviewer; no wording or placement is signed here.
3. Keep later elections separate from information available at the November checkpoint.

## S17: politics as data drafts

S17 continues from `0401894` on the same branch. Its files are inert drafts under `packs/union-1861/source/drafts/politics/`, with a proposed checkpoint beside `checkpoints.json`. No importer, live pack, generated world, strings, runtime rule, signed item or other sprint worktree is in scope. New source scans and evidence stay in `C:/Pyrrhic/mandate-research-sources/S3/S17/`; existing S3 scans are reused without modification.

### Work and validation plan

1. Read S3's notes and the actual cited pages again. Draft Congress's sessions, member/party observations and dated membership changes, then legislative ledger records. A party label does not establish a faction; unsourced faction cells stay unknown.
2. Draft the sixteen-state midterm references and proposed checkpoint bands. Keep original winners, later vacancies, returns and seating separate. Draft governors and state chambers from dated observations, not an invented daily officeholding series.
3. Extend the press draft with papers, editors, publication variants, dated editorial positions, distribution constraints and measured reach where sources support it. Circulation copies, readers, persuasion and the runtime's reach parameter are different measures.
4. Before each coherent commit, run cheap syntax, citation, arithmetic, identity/date and inertness audits. Run the real pre-commit hook for each commit, retaining logs and exits externally. Do not bypass it or push. Expected cost: several minutes per hook; stop retries after an unexpected failure and diagnose every retained category first.
5. Run the inherited required done check once, after cheap startup/prerequisite checks. Expected cost: roughly twenty minutes. Its own Phase 0 and supplemental 1A outcomes remain binding as reported; no timing waiver or out-of-scope calibration. Reuse S3's historical failure evidence as context, not as a passing S17 result. Stop expensive retries after failure.
6. Finish inventories and preservation checks before the final hand-over. Record proposed rulings and residuals, read the shared CODEX fresh, then append one UTF-8 status preserving its prior bytes.

Independent review and gate sign-off remain deferred under 0106. This run is maker verification, not acceptance.

### S17 batch 1: Congress and ledger

Drafted 258 named congressional observations, 689 possible member/session intersections, seven separately typed territorial delegates, 12 historical ledger entries, 22 vote questions and five complete Senate roll calls (196 cast votes). The 29 documentary-alignment observations preserve the border replies, Maynard's separate response and Sumner's dated letter without inventing permanent factions. The source register and draft README retain qualification/term distinctions and the conflicts concerning Baker, Wright, Upton, Shiel, Todd, Jackson, Phelps, Vandever and the publication-only Pendleton claim. No live identity or party crosswalk is applied.

The first cheap audit passes 2,431 checks: file structure, UTF-8, page citations, source hashes, party and vote arithmetic, record resolution, unsigned/inert status and protected-path preservation. Both unchanged live packs validate (exit 0). The single required S17 done check is running with drafting; its own log and exit will be retained. The first coherent batch is submitted through the actual commit hook, with the hook's own result retained externally. No passing integrated check is claimed before that result exists.

Batch 1 committed as **`9fcf122`** through the real hook: exit 0, **137 files / 1,530 tests passed / one expected failure / three skips**, plus typecheck, boundary, licences and the 106-record decision index. The runtime done check remains a separate required result.

### S17 batch 2: elections and state institutions

Drafted all **151 original winners in sixteen states**, their state totals, ten named-office vote references, the later-state/House-series scope distinctions, and **19 proposed checkpoint records** beside the live checkpoint file. The reference groups remain **71 D / one Independent D / 79 Republican–Union–Emancipation**, with five Missouri Emancipation winners identified. These are contemporary-ticket classifications, not the Directory's modern party crosswalk or an adopted presidential coalition.

Added **49 governor-table observations** (36 with separate party evidence, 13 on party HOLD) and **77 legislative-party observations**, preserving approximate and qualitative statements. Accessions remain HOLD rather than fabricated election-night dates. The focused audit passes **2,980 checks** before the second commit.

New page-backed corrections to S3 are recorded in the draft README: Indiana's Senate is 27 Democratic plus two Independent, not 29 Democratic; McBride's printed Oregon opponent is Wait, not Shiel. New Jersey's printed governor total/margin and Indiana's printed secretary-of-state margin do not reconcile with their candidate cells. Both the source claims and explicit arithmetic survive. Existing S3 research notes and every live input remain unchanged.

Proposed rulings [I]: retain the November original-contest denominator and the state-pattern constraints; reject immediate seating of the 38th, counting later 1863/1864 results in November, making governor-party equal legislative control, or accepting a wrong binding historical winner merely because it is inside a band. The current checkpoint schema has no election kind, so the new file remains a schema proposal and is not loaded. Source/identity crosswalks and adoption remain with the lead.

Batch 2 committed as **`2cb0764`** through the real hook: exit 0, **137 files / 1,530 tests passed / one expected failure / three skips**, with the other chained checks passing. Its log and exit are retained as `S17/commit-elections.log` and `commit-elections-exit.txt`.

### S17 final batch: press, oversight and hand-over

The final packet has **22 files**: twenty under the politics draft directory, the separately named checkpoint proposal and this hand-over. Begin at [the draft README](../packs/union-1861/source/drafts/politics/README.md) and `sources.json`. The Congress tables retain **258 named observations**, **689 possible session intersections**, **seven delegates**, **29 dated alignment observations** and **196 individual cast votes**. The ledger now has **14 entries / 24 vote questions**, adding the Senate's 9 December 1861 joint-war-committee question (GCW p.32, 33–3) and the 30 April 1862 Cameron censure (MP p.333, 79–45). They are historical references, not executable legislative effects.

The final governor table has **37 source-backed party observations / twelve holds**, after BB-M p.1616 supplied Morgan's Republican national-committee role overlapping his gubernatorial term. It does not establish exact accession days. All **77 legislative-party observations**, the **151 original election winners**, ten named-office vote comparisons and **19 checkpoint proposals** retain the distinctions described above. No elected successor is seated in November by inference.

The press packet has **eleven papers**, **five named editors**, **six role observations** including the Liberator's separate general agent, **thirteen attributed content observations**, **fifteen qualified quantities** and **eight distribution observations**. Original Tribune, Herald, Dispatch and Liberator page scans supplement the Monthly issues, almanac, official biographies and Hudson's retrospective history. Publication, endorsement, criticism, access to opposing papers and actual receipt remain distinct. The five accused papers in MP p.188 are not treated as convicted or mechanically assigned a faction. Unknown editor roles stay held, including Douglass where the read pages do not establish the role under this run's page-citation requirement.

The **100,000** Thompson circulation advertisement, **over 1,000 / nearly 500** reported Daily News consignments, and the **1860** aggregate press columns retain their different units, periods and qualifications. **Every runtime reach and permanent press-faction field remains unknown.** [I] Proposed ruling: adopt source-qualified observations for review; reject translating copies into unique readers, votes, coercion effects or runtime permille without evidence. The Tribune Clubs offer is for a book, not newspaper circulation. The failed Herald page-4 retrieval is not cited as read. No executable suppression option, signed content or live editor mapping is authored.

### S17 final verification and residuals

The focused draft audit passes **3,228 checks**, including structure, UTF-8, local links, source locators and hashes, record identity, party/election/vote arithmetic, date scope, holds, unsigned status and protected paths. The final source inventory validates **39 keys / 39 unique used scans: 32 PDFs and seven JPEGs**. Every cited scan opens and matches its registered SHA-256. It separately inventories unused PDF leads and failed HTML responses; a download is not a reading claim. Scans and all recipes/logs remain external under `C:/Pyrrhic/mandate-research-sources/S3/S17/`, alongside reused, unchanged S3 sources.

The full-tree preservation comparison against pinned **`0401894`** passes: **1,677 base entries outside the explicit S17 allowlist are unchanged**, including code, lockfiles, original S3 research, all live pack inputs, live checkpoints, signatures and this worktree's CODEX.md. Only this hand-over and the inert draft paths change. The actual loader comparison with the drafts present versus hidden has no errors or draft accesses and identical digest **`4388a59027bff3002e52794c94202950d517cbc0cb8020f2e4073702ace4bd1f`**. This evidence is reused for the unchanged loader and live inputs; the new press files use the same ignored draft directory. The two unchanged live packs also validated before the campaign.

The single required S17 done check exited **1** in **2,521.9 seconds**. Phase 0 **behaviour, hash, resume, liveness and section-ten passed; budget failed**: Union median **132.62 ms**, p95 **262.20 ms**, against **40 / 160 ms**. The historical run was **126.72 / 294.12 ms**. Supplemental 1A **checkpoints, operation, pushback and lever-sweep failed; unknown-strength and stand-ins passed**. Diagnosis covers every category: Confederate strength below its floor, neither side fighting a planned operation, relay/filter/trim shortfalls and excessive compliance-with-reservations, and the lever sweep's unmeasured people response/unexercised governor chain. The Union strength floor is reported as nonbinding by the harness; that does not waive the other failures. These categories also failed in S3's unchanged-code baseline. S17's Phase 0 final hashes match that baseline: **`55a35b1034c19b09` / `69d8759b02cfa93f`**. No expensive retry, threshold change or out-of-lane repair was made.

Evidence: `S17/draft-audit.json`, `source-inventory.json`, `preservation.json`, `delivery-inventory.json`, `inertness.json`, `runtime-diagnostics.json`, the retained done-check log, copied summaries, and hashes of all five generated run artifacts (including both resume saves). The final coherent batch invokes the real pre-commit hook; its own result is retained as `commit-press.log` / `commit-press-exit.txt` and reported in the single shared CODEX status. Earlier passing hooks are evidence for unchanged code, not a substitute for this hook. No push. Independent review, sensitive-history gate review, schema adoption and loading remain deferred to the lead under 0106.

Remaining research holds include unresolved membership qualification conflicts, original House Homestead/Legal Tender roll-call pages, exact governor accessions, unsupported party/editor roles, per-paper 1862 circulation and receipt, and every proposed conversion into runtime political effects. The historical winner criterion is not retired by a broad band. These are explicit limits, not invented zeroes or adoption decisions.

## Findings outside my scope

The earlier politics note mixes several national party counts and includes snippet-only claims. S3 supplies page-backed replacements for the corresponding 1861–62 material without rewriting that note or canon. S1 owns the reported 1A behavior failures; S2 owns timing. S5 should preserve the first note issue's replacement clause and coin exceptions. S6 owns cast values and exact governor service rows. S7 and the gate reviewer own sensitive-history wording and placement. None of those lanes' files was edited.
