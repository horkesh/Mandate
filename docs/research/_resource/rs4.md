# Re-sourcing batch rs4 (lane 1.11r3, decision 0087)

Thirty cells, eleven people: Lincoln (11), Crittenden (4), Dana (3), Vance (3), Gamble (2), Vallandigham (2), and one each for Adams, Covode, Foote, Sickles and Trumbull. Table: `rs4.csv` (same folder).

## Counts

- KEEP 15, CHANGE 1, HOLD 14.
- KEEP: Lincoln nerve, value:party, trait:antislavery, trait:secretive, regard Chase (average), Bates (above), Smith (average); Crittenden reputation and opposes_emancipation; Dana antislavery; Gamble nerve; Vallandigham opposes_emancipation; Adams nerve; Foote reputation; Trumbull antislavery.
- CHANGE: Lincoln regard for Cameron, below to average (his own letters of 31 Dec 1860 to 13 Jan 1861 say he never doubted Cameron's ability and faithfulness).
- HOLD: Lincoln competence, regard for Welles, regard for Blair; Crittenden competence and nerve; Dana competence and reputation; Vance all three; Gamble conciliation; Vallandigham competence; Covode reputation; Sickles nerve.

## Sources used (new keys the steward must add to PROVENANCE.json)

All read as archive.org OCR full text (`_djvu.txt`) or, for one, the government's HTML, and searched with Grep. Quotations were typed from the OCR and are exact unless marked. None was read as a page image.

| Key | Work | archive.org id | Kind |
|---|---|---|---|
| NEW:BROWNING-D | The Diary of Orville Hickman Browning, vol. 1, 1850-1864, ed. T. C. Pease and J. G. Randall (Collections of the Illinois State Historical Library vol. 20, Springfield 1925). Entries of 9 and 11 Feb and 26 Apr 1861 used (pp.453, 454, 466). A 1925 publication, public domain in the US since 2021. | diaryoforvillehi0001theo | contemporary diary, STRONG |
| NEW:BATES-D | The Diary of Edward Bates 1859-1866, ed. H. K. Beale, Annual Report of the AHA for 1930 vol. 4 (GPO 1933). Entries of 27 Jul 1859 (Dana's letter of 10 Jul), 16 and 31 Dec 1860, 18 Feb 1861, and Nicolay's MS notes of 15 Dec 1860 printed in a footnote (p.166). Licence caveat of lane 1.11a stands (no licence stated on the printing): nothing here rests on Bates alone except the Dana antislavery cell. | diaryofedwardbat00bate | contemporary diary, STRONG |
| NEW:GLOBE-36-2 | Congressional Globe, 36th Congress, 2d session, daily issues, read at the issue of the day after: 1860-12-12_3 (10 Dec, Vallandigham p.37), 1860-12-19_7 (18 Dec, Crittenden and Hale pp.114-115), 1861-01-17_25 (16 Jan, p.409). Page numbers from the running heads. The OCR interleaves the columns, so quotations are cut at gaps and the gap is marked. | sim_united-states-congress-congressional-globe_<date>_<n> | official record, STRONG |
| NEW:HOPPIN-FOOTE | J. M. Hoppin, Life of Admiral Foote (Appleton, 1874): prints Du Pont's letter of 25 Jan 1861 (p.147). | lifeofandrewhull00hopprich | a friendly biography, the printed letter is the leg |
| NEW:MO-CONV-JUL1861 | Journal of the Missouri State Convention held at Jefferson City, July 1861: Gamble's election (p.25), the Address he presented (pp.27-28), his oath (p.32), the debate (p.73 of the second pagination). | journalofmissour00miss | official journal, STRONG |
| (existing) LINCOLN | Lincoln's letters, here read in `Complete Works of Abraham Lincoln`, ed. Nicolay and Hay, Lincoln Memorial University ed. (1905-06), vol. 6, pages cited. Cited as `LINCOLN <date>-<person> p<page>`. | completeworksv6linc | his own letters, STRONG |
| (existing) PRFA | Adams to Seward No. 2, 21 May 1861, pp.91-93 of the Message of the President of Dec 1861 (the Papers Relating to Foreign Affairs). Read as the HTML at history.state.gov/historicaldocuments/frus1861/d47, which keeps the printing's page marks: not the archive.org scan, so re-read it in print. | history.state.gov (US government) | official despatch, STRONG |

Also read, no leg found: Hay's Letters and Diary vol. 1 (lettersofjohnhay01hayj), Newton, Lord Lyons vol. 1 (lordlyonsrecordo01newtuoft), Frederick Seward, Seward at Washington (sewardatwashingt01sewa), Rebellion Record vol. 1 (rebellrecord01moorrich), the March 1861 Missouri Convention journal (proceedings00knaprich), the Globe index for 1861 (sim_united-states-congress-congressional-globe_1861_index, 618 KB).

## Not reached

- Globe: speeches printed only in the Appendix (Adams 31 Jan 1861: the daily says 'His speech will be published in the Appendix'). The daily issues after 5 Feb 1861 were downloaded but not searched for these cells. Papers Relating to Foreign Affairs by archive.org (a large file) never finished downloading: the despatch was taken from history.state.gov instead.
- No Vance papers or North Carolina newspapers of April to July 1861 as public-domain text. No Dana letters of 1861. No Covode contemporary rating. No contemporary rating of Lincoln's ability dated by 31 Jul 1861.
- The Welles Diary, Chase, Grant and other memoirs were not used (not legs).

## Method notes for the next lane

- PowerShell `Invoke-WebRequest -OutFile` was very slow for 1-5 MB archive.org texts here (minutes, with timeouts), while `curl.exe -sL -o` took 3 seconds. Use curl.exe.
- The daily Globe on archive.org is `sim_united-states-congress-congressional-globe_YYYY-MM-DD_<issue>` (the issue of day N covers day N-1). Its 1861 index lists every speaker by page. That is the way to date a start-class speech or vote; the OCR is column-scrambled but the roll calls are legible.
- History.state.gov carries the Foreign Relations volumes for 1861 as HTML with page marks: a government source that can be read without the archive.org download.

## Findings outside my scope

1. The Lincoln competence cell (above) has no contemporary leg. The one remark on his ability met for mid-1861 is Newton's own sentence (1913, vol. 1 p.47, no source given) that 'competent judges' found him well-meaning but without 'natural talents': it runs against above and is not a dated document. The steward should think about average, or hold it, until a primary judgment is found.
2. Bates's diary of 1859 prints a newspaper saying Crittenden 'is buried deeper than if he lay with the Titans' (pp.41-42); his reputation was low before Dec 1860, so the reputation cell should be dated to the secession winter.
3. Browning's diary (1925, public domain) is a good contemporary source for Lincoln, Douglas, Trumbull and the Illinois men in 1861 and is not yet a PROVENANCE key. The 26 Apr 1861 entry (p.466) says Douglas and Trumbull told him the Cabinet had determined to evacuate Sumter and that Lincoln refused the order.
4. Lincoln to Cameron, 13 Jan 1861 (p.96-97): 'I have not doubted that you would perform the duties of a department ably and faithfully.' Other cells that treat Cameron as corrupt before 5 Mar 1861 need a leg dated before the boundary.
