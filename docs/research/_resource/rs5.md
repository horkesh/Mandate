# Re-sourcing, batch 5 (rs5): 30 cells, lane 1.11r3 (0087)

Cells: Morton (6), Chase (5), Clay (4), Dennison (3), Seymour (3), Hicks (2), Tattnall (2), Anderson, Chandler, Greeley, Semmes, Van Dorn (1 each). Output: `rs5.csv` in this folder.

## Counts

KEEP 19, CHANGE 3, HOLD 8 (30 cells).

## What each cell turned on

- **Direction changes (CHANGE).** Chase's regard for Lincoln (both the `regard` cell and `regard_others:lincoln_abraham`) goes from average to above: his own letters of 10 Nov 1860 (to Fogg, "the sentiments of regard and confidence which Mr. Lincoln has expressed towards me", AHA 1902 vol 2 p291) and 9 Jan 1861 (to Stevens, "He is a man to be depended on", p295). Chase's regard for Seward goes from low to above: the only pre-boundary document, Chase to Sumner 14 Feb 1860 (p286), calls him "a great man ... I heartily honor". If the lead wants low, it needs a Dec 1860 to March 1861 letter, which I did not find.
- **Thin KEEPs.** Seymour's reputation (a party convention's applause, 31 Jan 1861) and `opposes_emancipation` (his Albany speech attacks antislavery agitation but never names emancipation), Tattnall's competence (the 1859 approval concerns the propriety of his Peiho course), Hicks's competence (a mixed record in his own message and letters), Morton's `makes_policy` (two acts of his own, none by others). Each says why in `basis`.
- **HOLD.** Morton nerve, the three Morton regard_others cells, Dennison on Cameron, Chase on Blair, Seymour nerve, Van Dorn's reputation. The start-class cells that name Cameron, Magoffin and Dennison rest on April to September 1861 events: every document is after 5 March 1861, so no leg can exist for them from the evidence the pack cites.

## Sources used (existing pack keys)

REBREC1 (Rebellion Record vol 1, archive.org `rebellrecord01moorrich`: Doc 1 p1, Doc 9 p9, Doc 16 p17-18, Doc 109 p159-160, Doc 166 p245, Diary p11-12), OR III-1 (`warofrebellion0301rootrich`, pp 41, 79-80, 89, 190), ORN I-1 (`officialrecordso0001unse_r5p9`, pp 613-620), ORN II-1 (`officialrecordso0001unse`, pp 373-374), CHI-1860 (`proceedingsofrep00repuiala`, pp 127-131), CHASE-D (AHA 1902 vol 2, `diaryandcorrespo00chasrich`), CHANDLER-OS (`zachariahchandle00detruoft`, pp 190-192), FOULKE-MORTON (`mortonoliverlife01foulrich`, pp 105-108), USREPORTS (Kentucky v. Dennison, 65 U.S. 66, read in the Cornell LII text of the U.S. Reports).

## New sources (not in PROVENANCE.json yet)

- `NEW:CLAY-WRITINGS`: C. M. Clay, *The Writings of Cassius Marcellus Clay, including speeches and addresses* (New York: Harper, 1848), archive.org `writingsofcassiu00clay`. Primary: his own speeches and True American editorials, each dated in the original. Used pp 134, 213-215.
- `NEW:GREELEY-HINTS`: H. Greeley, *Hints toward Reforms, in lectures, addresses, and other writings* (New York, 1850 and later editions), archive.org `hintstowardrefor00greeuoft` (the 1854 printing, used for page numbers pp 352-357). Primary: his letter "Slavery at Home" of 3 June 1845.
- `NEW:SEYMOUR-SPEECHES`: *Speeches of Hon. Horatio Seymour at the conventions held at Albany, January 31, 1861 and September 10, 1862* (1862 pamphlet), archive.org `speechhoratio00seymrich`. Primary: the speech and the convention report of 31 Jan 1861 (only that one is used: the 1862 speech is after every boundary).
- `NEW:SEYMOUR-RECORD`: *Public Record: including speeches, messages, proclamations ... and other public utterances of Horatio Seymour* (New York, 1868), archive.org `cu31924032762290`. Prints each speech in full (editors' headings not used). Used for the 4 July 1856 Springfield speech (pp 18-20, 9-10). It has no Seymour document dated 5 March to 31 July 1861.
- `NEW:JONES-TATTNALL`: C. C. Jones Jr., *The Life and Services of Commodore Josiah Tattnall* (Savannah, 1878), archive.org `josiahtattnall00jonerich`. Secondary as a life, used only for the official letters it prints verbatim (Lord Lyons to Cass, 10 and 17 Oct 1859, Toucey to Tattnall, 22 Oct 1859, Tattnall's reply, pp 106-109). Also read: The Spectator, 2 June 1894, p15, which prints Toucey's letter of 5 Oct 1859 (finding aid for the letter, not the source).

## Not reached

- Morton: the Indiana Documentary Journal for 1861 and the Six Regiment Act (7 May 1861); Foulke and the OR are what exist.
- Seymour: the 1854 veto message of the Maine Law bill (the act that cost him re-election) is not in the Public Record and was not reached; it is the likeliest leg for nerve.
- Van Dorn: the Secretary of War's December 1858 report (which prints his despatch of 5 Oct 1858 on Wichita Village) and Twiggs's report. The 1857 report and the 1858 abridgment on archive.org do not contain them. Justia's copy of *Kentucky v. Dennison* sat behind a bot challenge (not bypassed), and the Cornell LII text was used instead.
- Congressional Globe 36-2 for Chandler's speech of 2 March 1861 and the House vote on Anderson (8 or 9 Jan 1861): the sketch's extracts and the Record's date were used and the dates flagged.

## Findings outside my scope

- The Hicks competence cell's parenthetical ("called out the existing militia ... instead of four loyal regiments", NH 4 p163) does not match what Hicks's own documents say (OR III-1 p79-80, REBREC1 Doc 166). The pack should recheck NH 4 p163 against the Record.
- Chase's start-class cell `regard_others:seward_william_h` = low probably reflects the later (1861-62) rivalry; the start values at 5 March 1861 are probably higher.
- Several `regard_others` cells name people Morton and Dennison met only after 5 March 1861 (Magoffin, Cameron). Start-class regard toward a person first dealt with in April 1861 cannot be sourced; the lead may want to make these `innate`-class (up to 31 July 1861) or drop them.
