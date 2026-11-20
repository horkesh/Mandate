# S22: regard between people, 1861–1862

Research draft, 20 November 2026, from `a3fdf00`. [Hand-over](../../../notes/sprint-S22-regard.md). Documentation only; nothing is applied or signed. Read alongside S6 and S12, which remain unchanged.

## Tables and interpretation

[Observations](observations.csv) records who judged whom, the date of the surviving dated record, the passage, transmission and limit. The date is the letter/entry/report date; when an entry reports an earlier conversation it is **not** a claim that the words were spoken on that exact date. A letter's reported speaker is distinct from its writer. Repeated speakers in one diary are not independent archival witnesses. General accusations and supposed hidden motives remain the speaker's allegations.

[Regard rows](regard.csv) uses the exact seven rs columns: `person,cell,decision,proposed_direction,citations,basis,prior_value`. The observer is `person`; the subject is the target in `regard_others:<target>`. Directions `above` and `below` are **[I]** qualitative proposals relative to the unknown-person baseline, not measured changes from an earlier score. Mixed appraisals and an undated recollection project to HOLD with a blank direction. Each row points back to its observation id. `prior_value` preserves the exact existing directed segment, if any.

**Do not run the old apply.** It deletes HOLD fields, skips some whole people, does not implement dated observations and can silently overwrite repeated cells. The files preserve its row syntax for a later, reviewed temporal apply; they do not assert operational compatibility with its present destructive behavior. All dates here postdate the March-1861 starting boundary. Decisions 0085/0087 remain in force. No source policy is weakened and no source key is installed.

The consumers inspected are [planner/input.ts](../../../packages/kernel/src/planner/input.ts), `expectedCooperation`, and [reading/orders.ts](../../../packages/kernel/src/reading/orders.ts), `resolveOrderConflict`. The former reads the drafter's regard for the proposed partner holder; the latter reads the subordinate's regard for each issuer. [people/people.ts](../../../packages/kernel/src/people/people.ts) seeds principal regard first and then named `regardOthers`, which can overwrite the same target. A future temporal apply must reconcile these representations rather than double-count them. No numerical permille conversion is proposed here.

## Union batch

The first batch contains **67 observations / 46 directed pairs**, with **56 CHANGE proposals and 11 HOLDs**. [Counts](counts.json) are derived from the tables, not acceptance statistics.

Halleck's **3–4 March** representations against Grant must be read with his **13 March** promise of support and **15 March** report accepting good intentions and explaining the missing returns. The original accusation is not a finding of drinking or insubordination. His **1 August** view remains mixed: good general and brave, careless of his command. Sherman explicitly places faith in Halleck, Buell and Grant on **16 April**. These dated observations cannot responsibly become one timeless Halleck/Grant score. [OR I.7, pp679–684](https://archive.org/details/cu31924079609545/page/679); [OR I.10.2, p32](https://archive.org/details/cu31924077728230/page/32); [Chase, pp51–52](https://archive.org/details/diaryandcorrespo00chasrich/page/51); [Sherman letters, p141](https://archive.org/details/shermanlettersco00sher/page/141).

Lincoln's McClellan appraisals distinguish defensive organization from offensive command. The **9 April** letter combines criticism and promised support; **2 September** credits organization; **12 September** combines that praise with inability to strike; **13 October** challenges over-caution. McClellan's **2 and 5 October** letters distinguish distrust of civilian pressure from an appreciation of Lincoln's personal kindness. The recipient's report of presidential praise is marked as such. [Lincoln II, pp142–143, 245–246](https://archive.org/details/completeworksofa02linc_0/page/142); [Chase, pp64–65](https://archive.org/details/diaryandcorrespo00chasrich/page/64); [Welles I, p124](https://archive.org/details/diaryofgideonwel01well/page/124); [McClellan, pp654–655](https://antietaminstitute.org/hrc/files/original/49a9576dfe4913155df745bbd15c5bf90cf55141.pdf#page=678).

Pope's **21 July** warning is directly relevant to partner confidence: he expects no effective help from McClellan. The September accounts preserve Pope's and McDowell's accusations without adjudicating blame for defeat. Chase and Welles give distinct, sometimes opposed, accounts of the cabinet. Lincoln's mixed Pope appraisal, Blair's hostility and Smith's praise coexist. A cabinet member's opposition to a command does not become treason, cowardice or a national reputation score. [Chase, pp46–48, 63–68](https://archive.org/details/diaryandcorrespo00chasrich/page/46); [Welles I, pp100–103, 124–127](https://archive.org/details/diaryofgideonwel01well/page/100).

## Sources and limits

## Confederate and partner batch

The second batch brings the table to **123 dated-record observations / 94 directed pairs**: **108 qualitative CHANGE proposals, 15 HOLDs**. [Identity notes](identities.csv) keep the existing S6 Gustavus W. Smith handle distinct from the new, provisional Edward Johnson research handle. No person is added to active data.

Johnston's **12 September 1861** protest describes a personal indignity while praising Beauregard as his associate; Davis's **14 September** reply condemns the arguments and insinuations. Davis's **10 November** dispute with Beauregard also defends Benjamin. These are separately directed judgments; the administrative criticism does not prove deficient field ability. [OR IV.1, pp605–608, 611](https://archive.org/details/cu31924079579524/page/605); [OR I.5, p945](https://archive.org/details/cu31924077730194/page/945).

In January–February 1862, Benjamin reassures Johnston and values Beauregard, Johnston regrets Beauregard's departure, Jackson protests direct intervention while reporting compliance, and Johnston says he cannot replace Jackson. Jackson's charges against Loring and Loring's rebuttal establish antagonism, with no judgment of guilt entered. Davis's reply to Johnston combines criticism and conditional confidence, so it remains mixed/HOLD. [OR I.5, pp1048, 1051, 1053, 1064–1065, 1070–1072](https://archive.org/details/cu31924077730194/page/1048).

Bragg's **8 August** appreciation of Smith's cooperation and Smith's **11 August** explicit reciprocal confidence provide two actual documents for a partner pair. Smith's **21 September** confidence that Bragg could take Louisville accompanies concerns about his own exposed section. That expectation is not recorded as an accomplished result. Lee's **2 October** comparative officer recommendations and Davis's **26 August** confidence in Lee are contemporary judgments, preserved at those dates. [OR I.16.2, pp745–746, 751, 859](https://archive.org/details/cu31924077730228/page/745); [OR I.19.2, p643](https://archive.org/details/cu31924080772233/page/643); [OR I.12.3, p945](https://archive.org/details/cu31924077730145/page/945).

Grant's April praise of Sherman and the July Sherman/Halleck/McClellan telegrams extend the Union partner evidence. The named division and brigade commendations remain role-specific and do not automatically establish army-command gifts. [OR I.10.1, pp108–110](https://archive.org/details/cu31924077730160/page/108); [OR I.17.2, p83](https://archive.org/details/warofrebellion172unit/page/83); [OR I.19.1, pp839–842](https://archive.org/details/warofrebellion191unit/page/839).

## Source handling

[Source and reading record](sources.md) identifies editions and selected passages. [Scan manifest](scan-manifest.json) gives each cited printed page, archive image position or physical PDF page, URL, bytes and SHA-256. Scans stay outside git under `C:/Pyrrhic/mandate-research-sources/S6/`; reused S6/S12 paths remain in place and are hash-verified. OCR is a reading aid. McClellan p84, Lincoln II p245 and Welles I p126 have been visually checked. Lincoln's heading and body both read **13 October**; OCR's 18 is rejected. Retaining a scan does not claim visual inspection of every page or reading the whole volume.

Only dated documents in later printings supply contemporary legs. McClellan's later explanatory narrative, Welles's retrospective opening chapter and all editorial commentary are excluded as judgment evidence. His p655 report of Lincoln praise is an interested recipient's contemporary account, not independent corroboration. The source manuscripts have not been collated. Sensitive accusations, coercion and slavery-policy contexts remain unsigned research; no gate-none determination is supplied for future use.

## Findings outside my scope

- Whole-branch review, source-key admission, identity acceptance and temporal application belong to Claude after the sprint under 0106. This table does not decide visibility, belief updates or the effects of regard on later simulated conduct.
- The command/military owners retain responsibility for actual orders, deliveries, culpability and tenure. The gate reviewer owns any later placement or wording drawn from sensitive contexts.
