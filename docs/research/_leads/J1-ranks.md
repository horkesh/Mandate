# J1: Mexican War ranks of Breckinridge and Pike (lead note, 2026-11-16)

Verdict: RANK and UNIT sourced for both (Heitman 1903 + Appletons 1887/89, with Taylor's reports and Carleton 1848 for Pike). DATE of commission and COMMISSIONING AUTHORITY (election vs governor) NOT sourced for either. No pack change is forced on kind (`state_`); see "Pack effect".

Method: archive.org `_djvu.txt` OCR downloaded and read in the scratch dir; page numbers are from the OCR running heads (head triples read "first-name  page  last-name"; OCR doubts noted). Labels: STRONG = official or contemporary; WEAK = retrospective/modern transcription.

## Heitman (1903), `historicalregist02heitrich`, vol. 2 (Part II): "Officers of U. S. Volunteers in the service of the United States during the war with Mexico, 1846-1848" (index: vol. 2, p. 43 ff.)
- p. 45 (OCR line 7800, last entries of the "Br" group): `Breckenridge,  JohnC.,  maj  3  Kv  inf.` (spelling Breckenridge; "Kv" = OCR for Ky). STRONG (official compilation of the Adjutant General's office; the identification with the future Vice President rests on name, rank and regiment, and agrees with Appletons and the Kentucky roll).
- p. 64 (OCR line 11254; head reads "OWEN. 64 PINTO."): `Pike,  Albert,  capt  Ark  vols.` STRONG.
- The list gives rank and regiment only: no date, no authority. Heitman's Mexican War volunteer list is NOT confined to Regular Army men (it is its own section), which corrects the assumption that he lists only some.
- Same volume, Confederate general officers list (a different section): `Breckinridge,  John  C.,  maj  gen.` (page not checked) and `Pike,  Albert,  brig  gen.` Not about the Mexican War.
- Vol. 1 (`historicalregist01heitrich`) has only a different man, John Cabell Breckinridge (born NY, capt a q m vols 17 May 1898); do not confuse. Vol. 1 `Breckinridge, Joseph Cabell` likewise unrelated.

## Breckinridge
- Rank/regiment: major, 3rd Kentucky (Foot) Volunteers. Heitman vol. 2 p. 45 (above).
- Appletons' Cyclopaedia, vol. 1 (`fiskeappletons01granrich`), p. 366 (head "366 BRECKINRIDGE"): "At the beginning of the war with Mexico, in 1847, he was elected major in a regiment of Kentucky volunteers". STRONG as to what Appletons says; Appletons is a 19th-century reference work, so it is the weaker leg and does not name the electors or the governor's commission.
- Regiment field and staff (WEAK, genealogy transcription of an unnamed roll, kygenweb.net/fleming/flemmex.html): "Manlius V. Thompson Colonel; Thos. L. Crittenden Lieut Col.; John C. Breckenridge Major". It gives the regiment's company musters as 4 October 1847 at Louisville (Company B: "mustered in on October 4, 1847 at Louisville"), mustered out 21 Jul 1848. No date for the field officers. The original is the Report of the Adjutant General of Kentucky, Mexican War Veterans (Frankfort, 1889): NOT found on archive.org (advanced searches for title and subject return nothing); not read.
- Date: 1847 only (Appletons, Heitman by list). A date for his election/commission is UNVERIFIED; the regiment's mustering was Oct 1847, so a date between Sept/Oct 1847 is plausible but not sourced.
- Authority: Appletons says "elected". Election by the regiment, commission by the Governor of Kentucky, is the usual route, and agrees with `state_maj`; no source read says who signed the commission. UNVERIFIED beyond "elected".
- Congressional Biographical Directory: bioguide.congress.gov returned HTTP 403 to WebFetch; blocked, not routed around, not read.

## Pike
- Rank/unit: captain, Arkansas volunteers; commanded a squadron of two companies (his own, Company E, and Captain John Preston's, Company K) of the Arkansas Mounted Regiment (Col. Archibald Yell; Lt Col John S. Roane).
  - Heitman vol. 2 p. 64: `Pike,  Albert,  capt  Ark  vols.` STRONG.
  - Taylor, report to the Secretary of War, Agua Nueva, 6 March 1847 (transcription at dmwv.org/mexwar/docs/bvista.html, from Butler, A Documentary History of the Mexican War, 1995, pp. 108-114; the PD print I did not reach): "I had place all the regular cavalry and Captain Pike's squadron of Arkansas horse under the orders of Brevet Lieutenant-colonel May" and "I may, however, mention Lieutenants Rucker and Campbell of the dragoons, and Captain Pike, Arkansas cavalry, commanding squadrons". STRONG in content (an official report), WEAK in the copy (modern transcription; check against House Ex. Doc. 1 / Sen. Ex. Doc. 1, 30th Cong. 1st sess.).
  - Taylor to the Adjutant General, Camp near Monterey, 8 June 1847, in "Messages of the President ... on the subject of the Mexican War" (H. Ex. Doc. 60, 30th Cong. 1st sess., 1848; `messagesofpresid00polk`, running head "Ex. Doc. No. 60. 1175"): "Captain Pike's squadron of Arkansas cavalry has been discharged at this place". STRONG, read in print OCR. This also shows the squadron was discharged at Monterey, June 1847, before the rest of the regiment at Camargo.
  - Carleton, The Battle of Buena Vista (1848; a participant's contemporary compilation; label WEAK-to-medium), `battleofbuenavis0carl`, p. 72: "Captain Albert Pike, with his own company and that of Captain John Preston, Jr. (the two united as a squadron)"; casualty table note (appendix, after p. 132): "Companies E, (Pike's,) and K, (Preston's,)". 
  - Appletons vol. 5 (`americanbio05wilsuoft`), p. 18 (OCR head "PIKE PIKE", page number line "18" above the entry): "During the Mexican war he commanded a squadron in the regiment of Arkansas mounted volunteers in 1846-'7". No rank given, as the pack note says; Heitman and Taylor supply "captain".
- So the pack's `state_capt` fits the rank. The squadron command does not raise his rank (no major's commission).
- Date: 1846. No sourced date of election or commission read. Secondary pages (Encyclopedia of Arkansas, an Arkansas Gazette retrospective, modern: finding aids only, not evidence) put his company's call 4 June 1846 and the regimental election 4 July 1846 (Yell, Roane, Borland). UNVERIFIED which date to use; the safe cell is `state_capt:1846`.
- Authority: company officers of a volunteer regiment were elected by the company; the Governor of Arkansas issued the commission. No source read for Pike's own election. UNVERIFIED beyond that general rule (and the muster into US service was by US mustering officers, which does not make it a Presidential `usv_` commission).

## Pack effect (for the lead)
- Breckinridge `state_maj:1847`: rank, regiment, year confirmed (Heitman p. 45, Appletons p. 366). Authority "elected" confirmed by Appletons.
- Pike `state_capt:1846`: rank and branch confirmed as captain in Arkansas volunteers (Heitman p. 64; Taylor 6 Mar and 8 Jun 1847; Carleton p. 72); the date 1846 is consistent but the exact date is not sourced.
- Cite Heitman vol. 2 (not vol. 1) for both; cite the Taylor 8 June 1847 letter (Ex. Doc. 60, p. 1175) as the print-read primary for "Captain Pike".

## To read still
1. Report of the Adjutant General of Kentucky: Mexican War Veterans (1889) for the 3rd Kentucky field and staff dates (no archive.org id found).
2. Arkansas Mounted Regiment company rolls / Governor's commission (Arkansas State Archives; Roster in H. Ex. Doc. on volunteers).
3. Taylor's 6 March 1847 report in a PD print (H. Ex. Doc. 1, 30th Cong. 1st sess., or Jenkins 1850 `historywarbetwee00jenk`; downloads from archive.org stalled).
4. Pike's own report of Buena Vista (if printed; Roane's report in the same volume).

Scratch files: C:\Users\User\AppData\Local\Temp\claude\4d87ab6d8ae0089a\9b5270b2-8d26-4ceb-8899-4a7cb8486063\scratchpad\gaps\leads-J1-ranks\
