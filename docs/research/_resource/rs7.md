# Resource lane 1.11r3, batch rs7: the army bloc (44 people)

Output: `docs/research/_resource/rs7.csv`. Every row's bloc is `army`. The test used is the one in BRIEF-bloc: a document dated before 5 March 1861 showing the man serving as an officer of the US Army or Navy.

## Counts

- KEEP 21 (12 naval officers from the Navy Register to 1 Jan 1861, 9 army officers from dated 1860-61 documents)
- CHANGE 0
- HOLD 23 (13 serving army officers with no pre-boundary document found, 10 men who held no army or navy commission on 5 March 1861)

## KEEP

Navy (all `NavyReg1861`, the register to 1 Jan 1861, STRONG official): Dahlgren, C. H. Davis, Du Pont, Farragut, Foote, Goldsborough, Mervine, Paulding, D. D. Porter, J. Rodgers, Stringham, Wilkes. Page locators from the OCR running heads: special service pp.91-92, navy-yards p.98-99, squadrons p.105. The captains' list is cited by active-list number (Stringham 10, Mervine 12, Paulding 16, Farragut 37, Goldsborough 50, Du Pont 58, Wilkes 63) with the page from the OCR index, which may be off by one for pp.17-18.

Army, each a document dated before 5 March 1861:

| person | document | date | locator |
|---|---|---|---|
| Anderson | his Fort Sumter report, signed Major First Artillery | 1860-12-26 | OR I-1 p.2 |
| Buell | the verbal-instructions memorandum signed Assistant Adjutant-General, endorsed by Floyd | 1860-12-11 | OR I-1 p.117 |
| Totten | Engineer Department letter as Colonel of Engineers | 1861-01-28 | OR I-1 pp.157-158 |
| L. Thomas | his letter to Scott signed Assistant Adjutant-General, and Harney's letter addressed to him as Lieut. Col. | 1861-01-04, 1861-02-19 | OR I-1 pp.130-131, p.654 |
| Scott | Headquarters of the Army telegram signed Winfield Scott | 1861-02-20 | OR I-1 p.177 |
| Lyon | Harney's letter naming "Captain Lyon's company, of the Second Infantry" | 1861-02-19 | OR I-1 p.654 |
| Wool | his own letter "I command the Eastern Department" | 1860-12-06 | Rebellion Record vol 1 (Documents) p.13 |
| Sumner | NYT list of Lincoln's party "Col. E. V. Sumner, U.S. A.", and the 5 Feb arrivals | 1861-02-19, 1861-02-05 | NYT, page not read |
| Pope | NYT editorial "The Sin of Capt. Pope" (court-martial, joined Lincoln's suite) | 1861-03-02 | NYT, page not read |

Lyon's leg is the assigner's statement of a fact of service, which is what the bloc needs. Wool's and Buell's are the men's own conduct as officers.

## HOLD, serving army officers (13)

Franklin, Heintzelman, Keyes, McDowell, Mansfield, Meade, Meigs, J. F. Reynolds, Ripley, Schofield, C. F. Smith, G. H. Thomas, Fitz John Porter. No document dated before 5 March 1861 naming them was found in OR I-1, Moore's Rebellion Record vol 1, or 53 daily issues of the New York Times (1 Jan to 4 Mar 1861, OCR). Their service is not in doubt: the pack's rank rows put each in the regular army in 1861, and the Official Army Register of 1 Sept 1861 lists them. That register is dated after the boundary, so it is not a leg under the brief. If the lead accepts "the register's own date" for the regulars (the brief's wording for the January register), these 13 flip to KEEP with no further search. The register of 1 Jan 1861 that the brief names is not on archive.org (only the September 1861 edition, `officialarmyregi1861unit` and `officialarmyreg01offigoog`).

## HOLD, no army or navy commission on 5 March 1861 (10)

Burnside, Grant, Halleck, Hitchcock, Hooker, Mitchel, Patterson, Rosecrans, Sherman, Stone. The pack's own rank rows show no regular commission for March 1861 (Burnside last usa_lt 1851, Grant usa_capt 1853, Hooker bvt lt col 1847, Hitchcock col 1851, Patterson Mexican War volunteers and then militia on 1861-04-15, Stone DC militia from 1861-01-01, the others first appear in 1861 volunteers). `army` as defined (serving officer on 5 March) is not supported. Proposed bloc: none, and no leg was found for any other bloc. Stone has a pre-start item (Moore's Diary of Events, Jan 1861, from the Tribune: appointed on Scott's recommendation to organise the District militia) that shows a post under Scott's patronage, not Army service.

## New sources

- `NavyReg1861` (already a pack key): archive.org `registerofcommi00unit`, the first register in the volume (to 1 Jan 1861, confirmed by its resignation list ending 27 Dec 1860).
- `OR` Series I vol 1: archive.org `warofrebellion01secrrich`, OCR read at the pages cited.
- `REBREC1` (already a pack key): archive.org `rebellrecord01moorrich`.
- NEW `NYT-1861-02-19`, `NYT-1861-02-05`, `NYT-1861-03-02`: archive.org `sim_new-york-times_the-new-york-times_1861-02-19_10_2937`, `..._1861-02-05_10_2925`, `..._1861-03-02_10_2947` (OCR of the daily; page numbers not read from images, headlines given instead).
- Searched without result: `armyreg1861` = `officialarmyregi1861unit` (Sept 1861), `lifelettersofgeo01mead` (Meade's Life and Letters prints no letter between 1856 and Sept 1861).

## Not reachable or not done

- The Official Army Register of 1 Jan 1861, the Secretary of War's annual report of Dec 1860 (the Meigs, Franklin, Meade and Pope reports), and a USMA Official Register for 1860 were not found on archive.org. HathiTrust was not tried (blocked per the brief).
- OCR of the NYT is poor (surnames lost: the Feb 19 list gives "Capt. Joun U.S.A."), so Pope rests on the 2 Mar editorial and the 25 Feb "Capt. Pope", not on that list.
- OR page numbers come from OCR running heads and can drift by one (Buell's p.117 is confirmed by the OR index entry "Buell, D. C. 89, 117").

## Findings outside my scope

- The OR I-1 letters found here (Totten 28 Jan, L. Thomas 4 Jan, Scott 20 Feb 1861) are dated pre-start documents the pack could also cite for those men's posts and for any "serving on date X" fact.
- Several people in this batch (Burnside, Grant, Halleck, Hitchcock, Hooker, Mitchel, Patterson, Rosecrans, Sherman, Stone) are coded `army` in the cast table but held no commission on 5 March 1861. The bloc vocabulary has no slot for them: the lead needs to decide whether `army` is meant to cover retired regulars, which the brief's definition excludes.
- Lorenzo Thomas's rank row shows `usa_col:1861-03-07`: before that date the contemporary documents call him Lieutenant Colonel and Assistant Adjutant-General (OR I-1 p.654, 19 Feb 1861).
