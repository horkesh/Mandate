# Lane 1.11r3 (research leads and re-sourcing): hand-over at the pause

Stopped cleanly on the owner's pause. Nothing is applied to the pack data. The re-sourcing results are committed here (on `research-1861-leads`) and the apply tooling is ready, so the apply can run on resume.

## Branches and heads (all pushed)

| Branch | Head | What |
|---|---|---|
| `phase1-evidence-warning` | `e8c5808` | The contemporary-leg warning (0087), extended to blocs (`bloc_cites` column), refusing later reference works as a leg (`evidence.referenceWorks`), and exempting fact blocs (`evidence.factBlocs`: army, confederate). Reviewer approved up to `1027a36`; `83371b7` and `e8c5808` follow it and are with the reviewer. |
| `phase1-taney-1861` | `d50e533` | The `taney_roger_b` row (facts only) and PROVENANCE keys `TYLER-TANEY` and `TANEY-REPORTS`. With the reviewer. Appends at the end of `people.csv`, so expect a trivial merge conflict with any other branch appending rows. |
| `research-1861-leads` | this commit's head | Docs only: every note under `docs/research/_leads/` (J1, K1-K3, L1-L3, M1, N1, T1, T2, W1, G1), the reader outputs under `docs/research/_resource/` (rs1-rs9), the apply tools, the briefs and the batch files. |

## Rulings in force (the lead's)

- `army` and `confederate` are **facts** (a federal commission held on 5 March 1861; a side joined), not factions: `evidence.factBlocs: ["army","confederate"]`. A register (including the Navy Register) sources them. `referenceWorks` refuses a work only as a leg for a judgment or a factional bloc, never for a fact.
- The **ten with no federal commission on 5 March** get **bloc none** at the start: Burnside, Grant, Halleck, Hitchcock, Hooker, Mitchel, Patterson, Rosecrans, Sherman, Stone. A source showing one held a federal commission that day keeps him `army`.
- The **fifteen who resigned after 5 March** (Buchanan, Cooper, G. B. Crittenden, Ewell, Gorgas, Holmes, A. S. and J. E. Johnston, Lee, Longstreet, Loring, Magruder, Pemberton, E. K. Smith, Stuart) are **pre-positioned**: they keep their coded bloc as a labelled stand-in, owned by lane 1.12, with the resignation date and its register source in the row's notes. Their change to `army` is **not** applied until lane 1.12 builds resignation (Part B). `apply.js` writes the note text.
- **Price** changes to `border_unionists` (his election as president of the Missouri convention on 28 February 1861): a plain fact, applied.
- `CongDir37` and `NavyReg1861` stay in `referenceWorks` (period lists that state no judgment). The 12 navy captains and the 13 serving army officers stand as facts if the register entry states a commission before 5 March.
- Lincoln's competence stays HOLD (Newton's 1913 remark is retrospective). Drop `WELLES-D1-RETRO` from the Seward cells (the readers already replaced those cites). Nicolay and Hay's narrative is not a document leg.
- Open question for the steward (OPEN_QUESTIONS, 1B): a man's bloc does not change in play, so a civilian commissioned later never joins the army bloc.

## Re-sourcing results (round 1, readers rs1-rs9; files `docs/research/_resource/rsN.csv` and `.md`)

**181 judgment cells (rs1-rs6): KEEP 92, CHANGE 7, HOLD 82.** No KEEP or CHANGE rests only on a reference work. **172 blocs (rs7-rs9): KEEP 70, CHANGE 17, HOLD 85.** By bloc (KEEP / CHANGE / HOLD of n): army 21/0/23 of 44; confederate 23/16/22 of 61; moderates 4/1/20 of 25; radicals 10/0/11 of 21; war_democrats 6/0/5 of 11; border_unionists 4/0/3 of 7; peace_democrats 2/0/1 of 3.

Under the rulings: the 67 factional blocs split **27 stand, 40 held** (so the held blocs include McClellan, Cameron, Fessenden, Curtin, Dennison, Morton, Yates, Morgan, Ramsey, Butler and the editors, which moves the politics calibration: lane 1.14 needs to know). The 10 civilians lose their bloc. The 35 HOLDs on fact blocs (13 army officers, 22 confederate) **stand as coded**. **Check before they do:** the 22 confederate men include several not plainly in the Confederate side on 5 March (Breckinridge, Buckner, Vance, Letcher, Polk, Lovell, Mason, Hunter, Floyd, Bulloch); the lead should confirm. The 13 army officers (Franklin, Heintzelman, Keyes, McDowell, Mansfield, Meade, Meigs, J. F. Reynolds, Ripley, Schofield, C. F. Smith, G. H. Thomas, F. J. Porter) need the register line checked (task A1 below).

**Net effect on the leg check:** applying round 1 leaves **130 cells still warned** (76 reputation, 16 nerve, 13 competence, 18 traits, 4 values, 3 regard, across 90 people) because they cite only reference works. The warning rose from 353 to 464 when `referenceWorks` landed and fell to 359 with `factBlocs`.

## How to apply on resume

1. New worktree from the branch that holds the policy (`phase1-evidence-warning`, or main once it merges): `git worktree add -b phase1-resource-1861 <path> <base>`, then `npm install` there.
2. Copy `docs/research/_resource/` (rs1-rs9, and rs10-rs14 if round 2 runs) into it. Set `PACK_ROOT` to the worktree path and `HELD_OUT_CELLS` and `HELD_OUT_BLOCS` to the two held-back CSVs under `packs/union-1861/source/drafts/people/` (names: `held-back-judgments-1861.csv`, `held-back-blocs-1861.csv`).
3. `node docs/research/_resource/tools/apply.js --dry` (prints counts, the pre-positioned fifteen, the fact HOLDs that stand), then without `--dry`; then `node .../addsources.js` (45 PROVENANCE entries for the `NEW:` keys, `NEW:` already stripped from the cites); add `ArmyReg1861-09` and `NavyReg1863-RESIGN` to `evidence.referenceWorks` in `gate/source-policy.json`; `npm run pack:generate -- union-1861`.
4. `residual.js` lists the cells still warned (it needs a throwaway `packages/cli/src/tmp-issues.ts` that prints `generatePack(...).issues` filtered to `no-contemporary-leg` as JSON to `$OUT_ISSUES`, because `pack:validate` prints only 200 lines; do not commit it).
5. Run `npm run check` (the hook), commit with `git commit -F`, push, name the head to the reviewer, report the Union run's change to lane 1.14. Dry-run result at the pause: 82 cells held, 50 blocs blanked (40 factional + 10 civilians), 15 pre-positioned, 35 fact HOLDs standing, one error-free generate.

## What remains

- **The 130 residual cells** (round 2, readers rs10-rs14, stopped before writing output): batches are in `docs/research/_resource/briefs/batch10..14.md` with `BRIEF-resource2.md`. Each cell gets a contemporary leg (reputation needs someone else's judgment before 5 March 1861) or goes to the held list. Alternative: hold all 130 at once and skip the round.
- **A1 (army register check):** verify against the 1 Sept 1861 Army Register (`officialarmyregi1861unit`), Heitman and Cullum that the 13 serving officers held a commission before 5 March 1861 and that the 10 civilians held none (Patterson: Pennsylvania militia only? Stone: D.C. militia under what authority?). Not started on disk (the reader was stopped before writing).
- **The dating pass:** add `dated YYYY-MM-DD` to the older cells' citations (998 cited cells, 1,668 citations, 220 with embedded dates; 84 cells would be refused on embedded dates plus the weak list). Includes Holt's reputation re-entry only if the telegram's words are someone else's judgment of Holt, and Harney's regard for Price. A data change after the apply.
- **Findings to route:** Cameron's 22 June speech (250,000 men in the field, half a million in six months) to lane 1.14 as a cross-check; the pack source note that names Henderson as Marine Commandant should read Col. John Harris (Henderson died January 1859).

## Research notes delivered (read the files for words, pages and strengths)

- **T1 Taney:** quote at Reports pp. 269-270 ("I shall, therefore, order ..."); Congress-only sentence p. 255; opinion undated in print, printed in the National Intelligencer by 4 June 1861 (Rebellion Record vol. 1, Diary p. 92), out by 8 June (Tyler p. 430). Use "by 4 June". 1 June is unverified. "Secretary of War ad interim" is unsourced and left out. Sent to lane 1.11 and the lead.
- **N1 Congress and the writ:** none found, 26 May to 4 July 1861. Sent.
- **T2 strengths:** no primary counts Confederate men for 31 July; highest primary is 190 regiments and 34 battalions accepted (Walker, 24 July, OR IV-1 pp. 496-497); about 200,000 is the reader's inference. Marines: no figure for the Washington barracks as a station; about 40 left at the Navy Yard on 24 April (ORN I-4 p. 424); Corps total 2,500 (4 July report). Sent to lane 1.14.
- **W1 Wheeling:** Convention opened 11 June 1861 (printed Journal p. 3); reorganising ordinance "Passed June 19, 1861" (Ordinances p. 6-7; final yeas 78 in the Journal, 74 in Lewis: the date is not in doubt); Pierpont elected Governor 20 June, 77 votes (Journal p. 27); Wheat Attorney General 21 June (p. 31); Legislature met 1 July. Neither the Declaration nor the Ordinance names any county; the credentials roll (Lewis pp. 79-80) gives 35 counties, including Alexandria, Fairfax, Hampshire, Hardy and Jefferson; the 20 August Ordinance's 39 counties are after the window. **Earliest federal recognition: 25 June 1861, Cameron's letter to Pierpont as "Governor of the Commonwealth of Virginia" (OR I-2 pp. 723-724);** then 26 June (Interior certificate), 4 July (the message recognises loyal citizens but does not name the government), 13 July (Senate seats Carlile and Willey on Pierpont's credentials, Globe pp. 103, 109). **Not yet sent to lane 1.11 or the lead.**
- **G1 Texas governor:** Sam Houston held the office on 5 March 1861 and acted as governor (his letter of 6 March, Convention Journal pp. 113-114; Cave for him, 13 March, OR I-1 pp. 612-613, saying he "cannot recognize any obligation" to the Confederate government). He did not appear for the oath at noon on 16 March; the Convention declared the offices of Governor and Secretary of State vacant and treated Lieutenant Governor Edward Clark as Governor that evening (Journal pp. 183-187). Clark confirmed OR I-1 pp. 616, 630. Houston's own 16 March address is unread (snippet only). Birth and death dates are general-record only. So the pack holder on 5 March is Houston, hostile to the Convention and Confederate control: a call from Davis to Texas on 5 March reaches a governor who refuses it. **Not yet sent to lane 1.12 or the lead.**
- Older notes (J1, K1-K3, L1-L3, M1) were sent earlier; see `docs/research/2026-11-16-1861-gaps.md` section 7 for the digest.

## Review fixes (2026-11-19)

Codex's review of this branch (R44) held it for three fixes, made by the lead: the tools in `docs/research/_resource/tools/` run as CommonJS through their own `package.json` (the root package is an ES module, so `apply.js` could not start); G1's line on Clark's successors (Clark to 7 November 1861, then Lubbock, then Murrah); and T2's 200,000, which is a rough estimate for the units Walker counted and an inferred calibration band, not an upper bound. The commands above are unchanged.
