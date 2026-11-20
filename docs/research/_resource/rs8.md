# rs8: blocs of the Confederate group (61 people), lane 1.11r3

Output: `docs/research/_resource/rs8.csv`. All 61 rows carry the pack bloc `confederate`.

## Counts

- KEEP 23: Beauregard, Benjamin, Brown, Cobb, Davis, Hardee, A. P. Hill, McCulloch, Mallory, Memminger, Northrop, Pickens, Reagan, Semmes, Slidell, Stephens, Tattnall, Toombs, Twiggs, Van Dorn, Walker, Wigfall, Yancey.
- CHANGE 16: to `army` (15): Buchanan (navy), Cooper, Crittenden, Ewell, Gorgas, A. S. Johnston, J. E. Johnston, Lee, Longstreet, Loring, Magruder, Pemberton, E. K. Smith, Stuart, Holmes. To `border_unionists` (1): Price.
- HOLD 22: Bragg, Breckinridge, Buckner, Bulloch, Daniel, Floyd, Forrest, I. G. Harris, D. H. Hill, Hunter, C. F. Jackson, T. J. Jackson, Letcher, Lovell, Mason, Morgan, Pike, Pillow, Polk, Randolph, Seddon, Vance.

## How the legs were built

- Strong legs (office or commission in the Confederate government before 5 Mar 1861): JCCS vol 1 (Provisional Congress): roll of 4 Feb p11, election of Davis and Stephens 9 Feb p40, cabinet nominations 21 Feb p73 and 25 Feb p85, commissioners 26-27 Feb pp89, 93, Beauregard 1 Mar pp96-97, Texas delegates 2 Mar p97, Mallory's consent 4 Mar p106.
- Seceding-state legs: OR I-1 (Pulaski pp318-319, Pickens pp113 and 136, Twiggs and McCulloch pp502-504), Congressional Globe (Slidell and Benjamin withdrawals 4 Feb, pp719-722).
- Resignation-date legs (weaker: the date shows leaving US service, not why): Official Army Register 1 Sep 1861, Casualties, resignations pp61-66; Navy Register (resignations table). Used for Hardee 31 Jan, Van Dorn 31 Jan, Northrop 8 Jan, A. P. Hill 1 Mar, Semmes 15 Feb, Tattnall 21 Feb, and Beauregard 20 Feb. The brief's tip counts these.
- The same registers prove `army`: a man whose recorded departure was after 5 Mar was on the rolls on 5 Mar; Buchanan is listed as dismissed, the other fourteen as resigned. The Army Register is dated 1 Sep 1861, and the Navy list is in the 1863 edition; each departure retains its entry date, not the publication date.

## New sources (all archive.org full-text OCR, read in text)

- `NEW:ArmyReg1861-09`: Official Army Register for September 1861 (Adjutant General's Office, 1 Sep 1861), archive.org `officialarmyregi1861unit`. Not the 1 Jan 1861 register (the Jan edition `officialarmyreg01offigoog` timed out on download). Casualties p61-66.
- `NEW:NavyReg1863-RESIGN`: the Navy Register volume `registerofcommi00unit` (composite 1861-1863). Its first register is the 1861 list (pack key NavyReg1861: Tattnall p16, Buchanan p18, Semmes p33 by the volume's own index). The resignation and dismissal tables of 1 Jan 1861 to 31 Dec 1862 belong to the 1863 edition. Buchanan is in **Dismissals, p112**, dated 22 April 1861, not in the resignation table. Appletons vol1 p428 describes his resignation and his refused attempt to withdraw it; the register classifies the recorded departure as dismissal. The source key is retained, with its description corrected.
- `NEW:GLOBE-36-2`: The Congressional Globe, 36th Congress 2nd session, daily issue of 5 Feb 1861 (archive.org `sim_united-states-congress-congressional-globe_1861-02-05_45`). OCR is column-jumbled: quotations checked, pages 719 (Slidell) and 721-722 (Benjamin) taken from the running heads (719 and 725 bound the passage).
- Existing keys used: JCCS (`journalofcongres00conf`), OR I-1 (`warofrebellionco01unit`), REBREC1 (`rebellionrecord14evergoog`, OCR poor, no page numbers so diary entries are located by date), MO-CONV-1861 (`journalandproce00convgoog`, page numbers approximate: 14-16 from page marks at lines 732 and 1011).

## Cautions

- Wigfall is KEEP at MODERATE: his legs are a seat on the Texas list (absent) and a newspaper item, not an act in office. Consider HOLD if the rule is strict.
- Price CHANGE to `border_unionists` rests on his election as president of the Missouri convention (75-15), not on words of his own.
- Resignation-only KEEPs (Hardee, Van Dorn, Northrop, Hill, Semmes, Tattnall) should be reviewed: the date shows leaving US service, not joining the Confederacy.
- The Jan 1861 Army Register (service on 1 Jan) was not reached; `army` rests on the Sept register's resignation dates.

## Not reached or not found

- Library of Congress, Chronicling America (Richmond Examiner for Daniel) blocked; no HathiTrust.
- Davis, Mallory, Yulee farewell speeches of 21 Jan (Globe issue of 22 Jan) not downloaded.
- Peace Conference proceedings (Seddon), Virginia and Tennessee convention journals, Louisiana convention (Bragg), Tennessee governor's message (Harris), Georgia convention journal.
