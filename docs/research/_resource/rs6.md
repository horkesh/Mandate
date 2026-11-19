# Re-sourcing batch rs6 (31 cells, lane 1.11r3, decision 0087)

Result: KEEP 17, CHANGE 1, HOLD 13. File: `rs6.csv` (same folder).

## Counts by person
- seward_william_h: 6 KEEP (competence above, nerve average, regard average, secretive, regard Chase low, regard Lincoln average), 1 HOLD (regard Welles below).
- daniel_john_m: 5 HOLD (no contemporary leg reachable).
- lyons_richard_b_p: 3 KEEP (competence high, reputation above, candid), 1 CHANGE (nerve below to average).
- farragut_david_g: 1 KEEP (dutiful), 2 HOLD (nerve, popular_with_troops).
- buchanan_franklin: 2 KEEP (reputation, organiser), both resting on one quoted fragment of Bancroft's 1845 report read only in a later article (weak until the original is pulled).
- du_pont_samuel_f: 1 KEEP (organiser, joint board report, caveat in the CSV), 1 HOLD (reputation).
- welles_gideon: 2 HOLD.
- yates_richard: 2 KEEP. loring_william_w: 1 KEEP. yancey_william_l: 1 KEEP.
- meigs_montgomery_c, wilkes_charles: HOLD.

## Thin keeps to review
- Seward regard Chase low: one 1852 private letter and one 1860 remark. Direction survives, weakly.
- Seward nerve average, Lyons nerve (changed to average): conduct evidence is mixed, so average is the supported value.
- Seward competence above: Russell's diary of late March 1861 is the best leg (an outside observer's judgment), the rest is supporting.
- Yates nerve: his telegram of 19 April 1861 shows speed, not courage under fire.

## New sources (archive.org OCR full text, read in the OCR, quotations exact except marked OCR)
- NEW:SEWARD-WASH: F. W. Seward, Seward at Washington as Senator and Secretary of State, vol. 1 (1891), archive.org `sewardatwashingt01sewa`. Used only for letters it prints verbatim (Seward to Weed 13 Dec 1860, to Lincoln 16 Dec 1860 and 8 Jan 1861, Lincoln to Seward 3 Jan 1861, Seward to his wife 1852 and 1860). The son's narrative is not used as a leg.
- NEW:RUSSELL-DIARY: W. H. Russell, My Diary North and South (1863), archive.org `mydiarynorthsout00russe`. Written from the Times letters of 1861. Entry date for the Sanford dinner is not printed in the OCR (Russell reached Washington on 27 March 1861), so it is dated 1861-03.
- NEW:YATES-1860: Speech of Hon. Richard Yates ... Springfield Jubilee, 20 Nov 1860, archive.org `speechofhonricha00yate` (pamphlet, no page numbers in the OCR).
- NEW:IL-AGR1: Report of the Adjutant General of the State of Illinois, vol. 1 (1867), archive.org `reportofadjutant01illi1` (read from the University of Illinois OCR mirror). Page 7 by its own table of contents.
- NEW:MANSFIELD-1848: The Mexican War: a history of its origin ... with the official dispatches of the generals (1848), archive.org `mexicanwarhistor01mans`, Gen. Scott's despatches p198-199 (Cerro Gordo, 19 April 1847 by content, date line not in the OCR).
- NEW:FARRAGUT-LIFE: Loyall Farragut, The Life of David Glasgow Farragut (1879), archive.org `lifeofdavidglasg01farr`, p172-173 (Farragut's letters to Secretary Dobbin, Navy Department records).
- NEW:YANCEY-1860: Speech of the Hon. William L. Yancey ... Charleston, April 28th, 1860, archive.org `speechofhonwilli00yanc`, p14-15 (OCR garbled in the quoted lines).
- NEW:USNI-1935: "The First Academic Staff", U.S. Naval Institute Proceedings 61 (Oct 1935), read on the penelope.uchicago.edu mirror (no page number there). It quotes Bancroft's annual report for 1845. The report itself was not reached.
- Existing keys used: NH (vol 3 from archive.org `nicolayslincoln03nicorich`), NEWTON-LYONS (vol 1, `lordlyonsrecordo01newtuoft`, quotes from Russell, Lyons and Malmesbury letters), ORN (vol 12, `officialrecordso0012unse`, p195-198).

## Blocked or not reached
- quod.lib.umich.edu returned a Cloudflare challenge ("The Secession Crisis Diary of Gideon Welles", Journal of the Abraham Lincoln Association): recorded as blocked, not worked around. It is the likeliest contemporary leg for both Welles cells and Seward's regard for Welles.
- Library of Congress (Lincoln Papers, Welles, Meigs papers): blocked, not tried.
- Bancroft's Annual Report 1845, Congressional Globe appendix (Yates 1855 speech), Official Records Series III vol 1 (Yates telegrams): not fetched. The Rebellion Record vol 1 OCR download timed out (archive.org `rebellionrecord01moor`).
- No printed run of the Richmond Examiner 1860-61 was found on archive.org, which is why all five Daniel cells are HOLD.
- Git Bash hangs on this machine, as the common brief says. PowerShell was used throughout.

## Findings outside my scope
- Seward's "secretive" and competence cells carried Welles-retrospective cites (WELLES-D1-RETRO p16-17): those are now replaced by Seward at Washington letters, so the cell citation should drop them.
- NH 3 p367 names a written Welles paper on the fugitive-slave clause (Nov 1860) in the Lincoln Papers: a candidate contemporary leg for Welles's "order" value if the Library of Congress copy can be read.
- Lyons's 7 Jan 1861 and 26 Mar 1861 letters (Newton p30-34) are contemporary evidence about Seward's bluster and about how the Cabinet was split on the revenue-collection and blockade question in March 1861: worth a look by whoever holds the March 1861 cabinet material.
