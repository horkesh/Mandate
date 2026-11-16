# The 1860 census by county and by pack region (draft, lane 1.11r2)

Status: draft input for 1A's self-emancipation term. **Nothing here is entered into the pack.** Source: J. C. G. Kennedy, *Population of the United States in 1860* (Washington: GPO, 1864), archive.org id `populationofusin00kennrich`. Every figure was read from the page images (leaf = printed page + 119 on every page used), not from the volume's OCR text, which is column-scrambled.

## Files

| File | What it is |
|---|---|
| `kennedy-county-1860.csv` | 1,285 rows: every county or county-equivalent of the 15 slave states, plus Kansas, Nebraska, New Mexico, Utah and New Jersey, as printed in "Table No. 2, Population by Color and Condition", with the printed state total line per state (`county` = `__STATE_TOTAL__`). Columns: state, county, total_free, black_slave_total, mulatto_slave_total, total_slave, aggregate, page, leaf, flags. |
| `kennedy-state-summary-1860.csv` | The Recapitulation (printed pp. 598-599, leaves n717-n718): free, slave and aggregate for every state and territory. |
| `enslaved-1860-by-region.csv` | The result: enslaved, free and aggregate population per pack region (268 regions), with the counties used, the Kennedy citation (state, table, page, leaf), a mapping note and a status. |
| `aggregate.mjs` | Rebuilds the region file from the two Kennedy files and `world/regions.csv` (`node aggregate.mjs`, run in this folder). It holds the alias table (the pack's county spellings against the printed ones) and the list of counties created after the 1860 enumeration. |
| `aggregate-report.txt` | Rows no region claims, and each row that is counted other than once. |

## How the readings were checked

Each county row had to satisfy: black slave total + mulatto slave total = total slave; total free + total slave = aggregate; and the rows of a state sum to the printed total line (total slave, total free, aggregate, and the black and mulatto sub-columns). The scan is poor (3, 8, 0, 6 and 5 confuse), so a row that failed was re-read at larger scale and, if it still failed, kept as printed with a flag; a value changed to make the check pass is flagged `SOLVED-BY-CHECK` or `PRINT-ERROR` and carries both readings in `flags`.

Results (my own re-sum of each CSV, not the readers' claim): the enslaved totals of every state match the printed state line (Virginia 490,865, North Carolina 331,059, South Carolina 402,406, Georgia 462,198, Florida 61,745, Alabama 435,080, Mississippi 436,631, Louisiana 331,726, Texas 182,566, Arkansas 111,115, Tennessee 275,719, Kentucky 225,483, Missouri 114,931, Maryland 87,189, Delaware 1,798, District of Columbia 3,185). **The 1,262 county rows sum to 3,953,760 enslaved, the printed national total (Recapitulation, p. 599).** The free-population sums also match except Kentucky (4 off: Warren's total free is misprinted) and the aggregate column, which is off in a few states because of printed errors in single rows (Tennessee Bradley, Kentucky Carroll, Missouri Jackson, Arkansas Phillips and Saline, Virginia Washington; the printed digits are kept and the implied values are in `flags`). No enslaved figure depends on a printed error except where flagged: Florida La Fayette (printed 877, recorded 577 because black 553 + mulatto 24, the aggregate and the state total all give 577), Arkansas Lawrence (printed 491, recorded 494, same three checks), and Virginia Charles City and Chesterfield (the black and mulatto sub-columns differ from the printed total by plus and minus 100; the total slave column is consistent with the aggregate and is used).

## How counties map to regions

- Each region's `counties` list in `world/regions.csv` is summed from the rows above, using the printed spelling (the alias table in `aggregate.mjs`).
- **Free states** (Pennsylvania, Ohio, Indiana, Illinois, New York, New England, the Midwest and Plains regions): the Recapitulation prints a dotted (zero) slave cell for each, so the region's enslaved figure is 0 (status `free-state-zero`). The county tables of those states were not read, so their free population by region is blank.
- **Wildcard regions** (`State:*`): a whole state is taken from the Recapitulation; a remainder (Texas west, Kansas west) is the sum of the county rows no other region claims.
- **Regions that take part of a county** (Fort Sumter, Fort Pickens, Ship Island, Port Hudson, Island No. 10, Fort Henry, the Indian Nations): the county tables cannot split a county, so such an item adds nothing and the note gives the whole county's figure for reference. **The Indian Territory was not enumerated in 1860** (the only trace is "West of Arkansas 65,680" Indians on p. 605); the enslaved of the Five Nations are given only in the Introduction's text (Choctaw 2,297, Cherokee 2,504, Creek 1,651, Chickasaw 917, read from OCR only, not in any state total).
- **Counties the pack lists that did not exist in the 1860 table** (North Carolina Transylvania, Clay, Mitchell; Florida Polk; Missouri Worth; Texas Wilson; Kentucky Wolfe): their people sit inside parent counties in Kennedy; the region note says so and the figure for that region is understated by the part of the parent's total that belongs to the new county.
- **Counties that print "no return"** (18 in Texas): no figures exist; they are not counted and the region note says so. Ten Texas counties print a free population only (slave = 0). Hernando, Florida, Hancock, Sunflower and Washington (Mississippi), Bienville (Louisiana) and Blanco and Tarrant (Texas) are marked by Kennedy as estimates; their figures are kept and flagged.

## Caveats the lead should know

1. **Baltimore is counted twice.** Table 2 prints no separate Baltimore City row (the city sits inside the printed "Baltimore" row, 5,400 enslaved); the pack's `baltimore` and `baltimore_county` regions both claim it, so the two regions cannot be split from Table 2. Table 3 (cities) gives the city separately and was not transcribed.
2. **North Carolina "Lillington" (3,228 enslaved, aggregate 6,286) matches no pack county.** I re-read the printed row from the page image (p. 358, leaf n477, between Lenoir and Lincoln, and Harnett is a separate row). The pack's 89 North Carolina counties less the three created in 1861 leave 86, all matched; Kennedy prints 87 rows. It is counted in no region. Whichever county the printed name stands for, check it against a second scan before the region that contains it is used.
3. Reconciliation: the sum of the regions' enslaved figures is 3,955,903 = 3,953,760 (national) + 5,400 (Baltimore twice) − 3,228 (Lillington) − 29 (Utah, no pack region). The Utah and New Jersey rows are listed in the county file for completeness.
4. Table 3 (cities and towns) of several states carries slave figures for Memphis, Nashville, Charleston, St. Louis and others; it was not transcribed. The South Carolina "Charleston" row is the district.
5. Texas Table 2 rows for counties with no return are present with empty cells and the flag `NO-RETURN`.

---

# The readers' notes (verbatim)

One section per reader (G1 Virginia, Maryland, Delaware, District of Columbia and North Carolina; G2 South Carolina, Georgia, Florida and Alabama; G3 Mississippi, Louisiana, Texas and Arkansas; G4 Tennessee, Kentucky and Missouri; G5 the Recapitulation, the territories and New Jersey): each lists the pages and leaves used, the per-state sum checks and every flagged row.


## Reader G1: Virginia, Maryland, Delaware, District of Columbia, North Carolina

### Census 1860 by county, group G1 (Virginia, Maryland, Delaware, District of Columbia, North Carolina)

Source: Kennedy, *Population of the United States in 1860* (GPO 1864), archive.org `populationofusin00kennrich`, Table No. 2 "Population by Color and Condition", read from page images (lane 1.11r2, agent cen-G1-va-nc). CSV: `G1-va-nc.csv` (267 rows: 262 county lines plus 5 `__STATE_TOTAL__` lines). Zero values in `mulatto_slave_total` or the slave columns mean the table prints blank (dots) there.

Page offset: leaf = printed page + 119 held on every page checked (p. 516 = n635, p. 517 = n636, p. 518 = n637, p. 46 = n165, p. 214 = n333, p. 358 = n477, p. 359 = n478, p. 588 = n707). No plate or insert shifted it (also spot-checked p. 33, 37, 41, 45, 61, 66, 203 to 216, 221, 227, 233, 561, 569, 577, 583, 587).

#### Check results per state

| State | Printed pages (leaves) | Rows | total_slave: my sum / printed | total_free: my sum / printed | aggregate: my sum / printed | Flagged rows |
|---|---|---|---|---|---|---|
| Virginia | 516 to 518 (n635 to n637), total on p. 518 | 148 | 490865 / 490865 | 1105453 / 1105453 | 1596317 / 1596318 | 9 (3 real issues) |
| Maryland | 214 (n333) | 21 | 87189 / 87189 | 599860 / 599860 | 687049 / 687049 | 1 |
| Delaware | 46 (n165) | 3 | 1798 / 1798 | 110418 / 110418 | 112216 / 112216 | 0 |
| District of Columbia | 588 (n707) | 3 | 3185 / 3185 | 71895 / 71895 | 75080 / 75080 | 0 |
| North Carolina | 358 to 359 (n477, n478), total on p. 359 | 87 | 331059 / 331059 | 661563 / 661563 | 992622 / 992622 | 3 |

The black-slave and mulatto-slave column sums also equal the printed total lines in every state (Virginia 420886 and 69979; Maryland 78316 and 8873; Delaware 1715 and 83; DC 2252 and 933; North Carolina 308069 and 22990). Black M + F = total and mulatto M + F = total held on every row transcribed.

#### Flagged rows

Virginia
- Charles City: PRINT-INCONSISTENT. Black slave 1494 + 1235 = 2729 and mulatto 155 + 163 = 318, so total slave should be 3047, but the page prints 2947 (and aggregate 5609 = 2662 + 2947). Read at 3x; digits are clear enough that I recorded the printed values.
- Chesterfield: PRINT-INCONSISTENT. Black slave 3709 + 3225 = 6934 plus mulatto 1320 = 8254, but the page prints total slave 8354 (aggregate 19016 = 10662 + 8354). The two errors are +100 and -100 and cancel in the state's total_slave sum, so the printed state total does not help decide which figure is wrong. Both rows keep the printed total_slave. A downstream user who prefers internal consistency can use black + mulatto instead (3047 for Charles City, 8254 for Chesterfield) and aggregate minus free.
- Washington: PRINT-INCONSISTENT. Total free 14345 + total slave 2547 = 16892 but aggregate prints 16891 (clear at 2.2x). The printed state aggregate total (1596318) is one more than the sum of the printed county aggregates (1596317), so the one-unit misprint is in this row (or the total line).
- Frederick: SOLVED-BY-CHECK. Black slave M and total were smudged ("76?" and "1?93"); 766 and 1493 follow from F = 727, mulatto 338 + 428 = 766, total slave 2259 and aggregate 16546.
- Grayson, Hancock, Marshall, Webster: mulatto slave columns printed blank (recorded 0). McDowell: all slave columns printed blank (recorded 0 and total_slave 0, aggregate = total free 1535).

Maryland
- Howard: SOLVED-BY-CHECK. Read at 2x as total free 10470 and aggregate 13388, which fail (10470 + 2862 = 13332). Corrected to 10476 (= white total 9081 + free colored 1395) and 13338. The two corrections are independent and each closes the gap to the printed state total exactly (total_free 599854 to 599860, aggregate 687099 to 687049). The digit confusions involved (0 for 6, 8 for 3) are the typical ones in this scan.

North Carolina
- Ashe: SOLVED-BY-CHECK. Black slave M ("15?") and mulatto total ("60") were smudged; 153 and 69 follow from F = 169, total 322 and total slave 391, aggregate 7956.
- Gates and Hyde: mulatto slave columns printed blank (recorded 0).

#### Oddities

- Virginia: the table includes the counties that became West Virginia (for example Barbour, Berkeley, Boone, Brooke, Cabell, Hampshire, Kanawha, Monongalia, Ohio, Wood), transcribed in the order printed, with no marker separating them. "Alexandria" and "Elizabeth City" are printed as ordinary rows; there are no separate rows for Richmond city or Norfolk city in this table (they fall inside Henrico and Norfolk). Printed spellings kept: "Loudon", "Spottsylvania", "Nansemond".
- Virginia p. 518 carries a note under the total line: "112 Indians included in white population" (not in the numbers used here).
- Virginia p. 518 prints the state Total line above Table No. 3; p. 516 and 517 have no totals. No county is split across a page break.
- Maryland: Baltimore City is not a separate row on this page; it is inside the county line "Baltimore" (aggregate 266553). Printed spellings kept: "Queene Anne", "Saint Mary's", "Prince George's".
- District of Columbia: the table has three rows (Georgetown, Washington City, Remainder of District) rather than counties. Its Table No. 1 is on p. 587; Table No. 2 is on p. 588. The DC section is at the end of the volume, after the Territories.
- Delaware rows are Kent, Newcastle, Sussex (printed "Newcastle").
- North Carolina: 87 county lines. Printed spellings kept: "Edgecomb", "Cabarras", "Tyrrel", "Lillington", "Perquimans". The sums match the printed total exactly, so no county was missed.
- Charles City and Chesterfield are classed as print errors rather than transcription errors because the black, mulatto and total-slave state sums all match the printed total lines.
- The Virginia pages are noticeably blurrier than p. 518, Maryland, Delaware and DC; Virginia was read in four strips per page with the M/F columns used to adjudicate each digit.

Second scan: not consulted; none was needed.


## Reader G2: South Carolina, Georgia, Florida, Alabama

### 1860 census by county, Deep South set 1 (SC, GA, FL, AL): transcription note

Lane 1.11r2, agent cen-G2-deepsouth1. Source: Kennedy, *Population of the United States in 1860* (GPO, 1864), archive.org `populationofusin00kennrich`, Table No. 2 "Population by Color and Condition", read from page images (not OCR). Data file: `G2-sc-al.csv` (255 rows: 251 county lines plus 4 `__STATE_TOTAL__` lines).

Column mapping: `total_free` is the printed "Total free" (white plus free colored), `black_slave_total` and `mulatto_slave_total` are the printed Total under BLACK and MULATTO within SLAVE, `total_slave` and `aggregate` as printed. Black slave M, F and mulatto slave M, F were also read and used for check 2.

#### Page offset

leaf = printed page + 119 held on every page used (printed page number read on each image: p. 5 = n124, p. 54 = n173, p. 72 = n191, p. 426 = n545, p. 452 = n571). No plate or insert shifts it in these ranges.

#### Per state

| State | Printed pages | Leaves | Rows | Sum check (county sums vs printed Total line) | Flagged rows |
|---|---|---|---|---|---|
| Alabama | 8 | n127 | 52 | total_slave 435,080 = 435,080; total_free 529,121 = 529,121; aggregate 964,201 = 964,201 (all PASS) | 1 |
| Florida | 54 | n173 | 37 | total_slave 61,745 = 61,745; total_free 78,679 = 78,679; aggregate 140,424 = 140,424 (all PASS) | 3 (+1 note) |
| Georgia | 72, 73 | n191, n192 | 132 | total_slave 462,198 = 462,198; total_free 595,088 = 595,088; aggregate 1,057,286 = 1,057,286 (all PASS; total line is on p. 73) | 0 |
| South Carolina | 452 | n571 | 30 | total_slave 402,406 = 402,406; total_free 301,302 = 301,302; aggregate 703,708 = 703,708 (all PASS) | 0 |

Beyond the three required sums, the state sums of black slave M, F, Total and mulatto slave M, F, Total also match the printed Total line in all four states (after the Walton FL treatment below), so every county row is checked twice (row arithmetic and column sum). Row arithmetic (checks 1, 2, 3) passes on every row except the print errors listed here.

#### Flagged rows (all are printing errors in the volume itself, not unresolved reads)

Each was re-read at 2.5x scale and the printed digits are exactly as read; the printed state Total line only sums if the corrected value is used, which shows the county line was misprinted. The CSV carries the corrected value, with the printed one in `flags`.

- Alabama, Dale (p. 8): aggregate printed 12,195; total_free 10,388 (white 10,381 + free colored 7) + total_slave 1,809 = 12,197. CSV has 12197.
- Florida, Calhoun (p. 54): total_free printed 992; white 895 + free colored 27 = 922, and aggregate 1,446 minus slave 524 = 922. CSV has 922.
- Florida, La Fayette (p. 54): total_slave printed 877; black 553 + mulatto 24 = 577, and aggregate 2,068 minus free 1,491 = 577. CSV has 577.
- Florida, Walton (p. 54): black slave M printed 475 with F 153 and Total 328 (M would be 175; the state M total only sums with 175). None of the CSV columns is affected; flagged for check 2 only.
- Florida, Hernando*: note only. The county name carries a printed asterisk ("Estimated; no schedule returned"), so its figures (free 1,000; slave 200) are round estimates, not enumeration.

#### Odd things

- Alabama: the table prints a "Note.--160 Indians included in white population". Florida: free colored note (318 male and 325 female mulattoes). Georgia: 38 Indians in white population. South Carolina: 88 Indians in white population. None affects the slave or free totals used.
- Dade County, Florida prints dotted blanks for the mulatto columns: recorded as zero (black slave 2, mulatto slave 0, total 2).
- Echols, Georgia prints blanks for slave mulatto columns: recorded as zero (all 314 slaves are black).
- Georgia column order: Columbus is printed before Coffee on p. 72, and Montgomery and others sit in printed order; the CSV keeps the printed order. Georgia county Dade (GA) and Dade (FL) both exist; the state column distinguishes them.
- South Carolina is tabulated by "Districts" (30 lines; Charleston is a district, not the city). Abbeville, Barnwell and so on keep the printed spelling (Orangeburgh, Spartanburgh, Williamsburgh). The city and town figures (Charleston wards etc.) are in Table 3 on the same page and are NOT in this CSV.
- Florida has 37 county lines (Brevard, Dade, Hernando, Manatee, New River, Orange, Taylor, Volusia etc. as printed). "St. John's" and "La Fayette" are printed with that spelling.
- No county is split across a page break; Georgia's table breaks between Jackson (end of p. 72) and Jasper (start of p. 73).
- No second scan of the volume was needed.

#### Method note

Each county row was entered with its M and F columns and run through a checker (black M+F=Total, mulatto M+F=Total, black+mulatto=Total slave, Total free + Total slave = Aggregate) and summed against the Total line. First-pass misreads: none for Alabama except the Dale print error, none for Georgia and South Carolina.


## Reader G3: Mississippi, Louisiana, Texas, Arkansas

### Census 1860 by county: Arkansas, Louisiana, Mississippi, Texas (lane 1.11r2, agent cen-G3-deepsouth2)

Source: Kennedy, *Population of the United States in 1860* (GPO, 1864), archive.org `populationofusin00kennrich`, Table No. 2 "Population by Color and Condition", read from page images (leaf = printed page + 119). Data in `G3-ms-tx.csv`. Page headers were located in the djvu text and every page image was checked for its printed page number.

Layout note for these four states: the table has WHITE (M, F, Total), FREE COLORED (M, F, Total, no black/mulatto split), Total free, SLAVE black (M, F, Total), SLAVE mulatto (M, F, Total), Total slave, Aggregate. Dotted cells (nil) are written as 0 in the working data; the CSV carries only Total free, black slave total, mulatto slave total, Total slave and Aggregate. Checks 1 to 3 were run on every row (check 2 used the M and F cells), and check 4 on each state.

#### Arkansas

- Printed page 18, leaf n137 (offset 119 confirmed). One page, 55 county rows plus the Total line.
- Sum check against printed Total line: total_slave 111,115 = 111,115 PASS; total_free 324,335 = 324,335 PASS; aggregate: sum of printed county aggregates 435,458 vs printed 435,450, FAIL by 8, entirely explained by two printed-aggregate errors in the county rows (below). With Saline = 6,640 and Phillips = 14,877 the sum is 435,450.
- Flagged rows (3):
  - Lawrence: printed total slave 491, but black 430 + mulatto 64 = 494, aggregate 9,372 minus free 8,878 = 494, and the state slave total only works with 494. The CSV carries 494 (printer's error in the 491; flagged PRINT-ERROR).
  - Phillips: printed aggregate 14,876, but free 5,936 + slave 8,941 = 14,877. Printed value kept; PRINT-INCONSISTENT. Read at 4x, no doubt about the glyphs.
  - Saline: printed aggregate 6,649, but free 5,891 + slave 749 = 6,640. Printed value kept; PRINT-INCONSISTENT. Read at 4x.
- Odd: Craighead is printed after Crittenden (not strict alphabetical). A stray ink mark sits over Chicot mulatto F (48) and Washington black total (1,121); both read cleanly and pass. Note to the table: free colored are 42 male and 45 female mulattoes; 48 Indians are in the white population.

#### Louisiana (parishes)

- Printed page 194, leaf n313 (offset 119 confirmed). One page, 48 parish rows plus the Total line. Heading is "PARISHES".
- Sum check: total_slave 331,726 = 331,726 PASS; total_free 376,276 = 376,276 PASS; aggregate 708,002 = 708,002 PASS.
- All four checks pass on every row. Flagged rows (1, informational only): Bienville, printed with `*` (Estimated), round numbers (free 6,000, slave 5,000, aggregate 11,000).
- Odd: the names "Baton Rouge, W" (printed truncated), "Feliciana, E." and "Feliciana, W." and "St. John the Bap't" are as printed. Bossier (slave 8,000) and Claiborne (free 9,000) also have round figures but carry no asterisk. Orleans parish (New Orleans city) is a single row (free 160,007, slave 14,484). Note: 173 Indians are in the white population.

#### Mississippi

- Printed page 270, leaf n389 (offset 119 confirmed). One page, 60 county rows plus the Total line.
- Sum check: total_slave 436,631 = 436,631 PASS; total_free 354,674 = 354,674 PASS; aggregate 791,305 = 791,305 PASS.
- Flagged rows (5):
  - Amite: last digit of Total free is damaged in the scan (reads 4,43?). Set to 4,436 by check 3 and confirmed independently (white 4,427 + free colored 9 = 4,436). SOLVED-BY-CHECK.
  - Yalabusha: mulatto slave total damaged (reads 5?3). Set to 538 by check 1 (9,531 - 8,993) and confirmed by M 238 + F 300 = 538. SOLVED-BY-CHECK. (The M cell 238 is itself blurry; any alternative would break the aggregate.)
  - Hancock, Sunflower, Washington: printed with `*` (Estimated); informational flag ESTIMATED.
- Odd: Notes on the page say 2 Indians are in the white population and the free colored are 292 male and 309 female mulattoes.

#### Texas

- Printed pages 484, 485, 486, leaves n603, n604, n605 (offset 119 confirmed on each; page 486 is the last county page, with the Total line, and carries the start of Table No. 3 below it). 151 county rows plus the Total line (on page 486, leaf n605).
- Sum check: total_slave 182,566 = 182,566 PASS; total_free 421,649 = 421,649 PASS; aggregate 604,215 = 604,215 PASS.
- Flagged rows:
  - Harrison (p. 485): black slave M and F as read (3,803 and 3,653) sum to 7,456, but the printed black total is 7,461 and it agrees with slave total 8,784 and the state total. One digit in M or F is blurred (the 3 vs 8 problem). Totals used; the CSV does not carry M or F.
  - Blanco and Tarrant: the page note says these two counties were estimated; neither shows mulatto slave figures (Blanco shows black slave total 98 only; Tarrant black 850 only).
  - 18 counties are printed "(no return)" with every column dotted: Baylor, Collehan, Coleman, Concho, Demmit, Duval, Edwards, Hardeman (page 484); Haskell, Jones, Kimble, Knox, Lasalle, McCulloch, McMullen, Menora, Runnels (page 485); Taylor (page 486). In the CSV these rows have empty numeric cells and flag NO-RETURN. (A stray dash sits in the Hardeman aggregate cell; it is not a number.)
  - 10 counties print a free population only, with the slave columns dotted: Brown, Clay, Dawson, Eastland, Ensinal, Kinney, Throckmorton, Webb, Zapata, Zavola. In the CSV these have slave figures 0 and no flag (the printed dots mean nil).
- Odd: the printed "Banderah" (Bandera) and "Maveric" (Maverick), "Collehan", "Demmit", "Ensinal", "Menora" and "Zavola" are as printed. Several rows (Hidalgo, Maveric, Frio, Presidio, Starr, Uvalde, Shackleford, Goliad, Karnes, Coryell, Blanco, Brazos) have a nil in one of the M or F or mulatto cells; they pass the checks with dots read as 0. Pencil marks on Presidio (580 circled), Wise (3,160 crossed) and Karnes (327 underlined) do not change the figures, which pass. Note: 403 Indians are in the white population; the free colored include 145 male and 128 female mulattoes.
- Table No. 3 (cities and towns, printed below the county table on page 486) was not transcribed; some towns there show a "(*)" for slaves that are noted on page 183.

#### Method

Each page was cropped to the county-name column plus the right-hand columns at native or 1.12x to 1.6x scale. Doubtful cells (Lawrence, Phillips, Saline, Amite, Yalabusha) were re-read at 4x in single-row crops. No second scan of the volume was used.


## Reader G4: Tennessee, Kentucky, Missouri

### 1860 census by county: Tennessee, Kentucky, Missouri (lane 1.11r2, agent cen-G4-border)

Source: Kennedy, *Population of the United States in 1860* (GPO, 1864), archive.org id `populationofusin00kennrich`, "Table No. 2.--Population by Color and Condition". Numbers read from the page images (n585, n586, n299, n300, n405, n406), not from the OCR text. Output: `G4-tn-mo.csv` (309 rows: 306 counties plus 3 `__STATE_TOTAL__` rows).

Columns kept: Total free, Black slave Total, Mulatto slave Total, Total slave, Aggregate. In every state the county tables in this volume have the same column set (White M/F/Total, Free colored Black and Mulatto M/F/Total, Total free colored, Total free, Slave Black and Mulatto M/F/Total, Total slave, Aggregate). The slave M and F columns were read for every row and used for check 2.

Page offset: leaf = printed page + 119 held on every page used (verified by the printed folio on each image). No plate or insert shifted it.

Row values are as printed. Where the printed row is arithmetically inconsistent (see flags) the printed digits are kept and the flag states the implied value. Blank (dotted) cells in the print are written as 0 in the CSV (they are blank in the image: Douglas MO, Ozark MO, Hickory MO and Putnam MO mulatto M, and similar), so a 0 in black_slave_total or mulatto_slave_total means "printed blank".

#### Tennessee (printed pp. 466-467, leaves 585-586)
- 84 counties (p. 466: Anderson to Robertson, 65 rows; p. 467: Rutherford to Wilson, 19 rows) plus the printed Total line on p. 467 (leaf 586). The page 467 image also carries Table No. 3 (cities, towns), not transcribed.
- Sum check (my county sums vs printed total line): total_slave 275,719 vs 275,719 PASS; total_free 834,082 vs 834,082 PASS; black slave total 238,133 vs 238,133 PASS; mulatto slave total 37,586 vs 37,586 PASS; aggregate 1,109,810 vs 1,109,801 FAIL by +9 (all from Bradley, see below).
- Flagged rows: 1.
  - Bradley (p. 466): printed aggregate 11,710 (confirmed at 6x zoom). Free 10,528 + slave 1,173 = 11,701, and the state total only sums with 11,701. A print error in the volume. Kept as printed.
- Cheatham (and a few counties) print no free-colored figures; that is as printed.

#### Kentucky (printed pp. 180-181, leaves 299-300)
- 109 counties (p. 180: Adair to Livingston, 64 rows; p. 181: Logan to Woodford, 45 rows) plus the printed Total line on p. 181 (leaf 300). Spelling as printed: "Muhlenburg", "La Rue", "Rock Castle".
- The column positions differ between the two pages (p. 181 is shifted left of p. 180), so the crops used different `-RightX0`. Total free on p. 181 was cross-read from the full-page view and checked arithmetically (check 3).
- Sum check: total_slave 225,483 vs 225,483 PASS; black slave total 182,202 vs 182,202 PASS; mulatto slave total 43,281 vs 43,281 PASS; total_free 930,205 vs 930,201 FAIL by +4 (Warren, below); aggregate 1,155,685 vs 1,155,684 FAIL by +1 (Carroll, below).
- Flagged rows: 4.
  - Bath: black slave M+F reads 950+962 = 1,912 against black total 1,917. The total 1,917 is confirmed by checks 1 and 3 (1,917 + 583 = 2,500; 9,613 + 2,500 = 12,113), so one of the M/F digits is unclear in the scan (probably M = 955). No output column affected.
  - Knox: mulatto slave M 84 + F 95 = 179 against printed total 180. Total confirmed by checks 1 and 3. No output column affected.
  - Carroll: printed aggregate 6,579; free 5,533 + slave 1,045 = 6,578. The state total's aggregate sums with 6,578. Print error or unreadable digit. Kept as printed.
  - Warren: printed Total free 12,006 (confirmed at 6x zoom). White 11,799 + free colored 203 = 12,002, aggregate 17,320 - slave 5,318 = 12,002, and the state total sums only with 12,002. Print error in the volume. Kept as printed.
- Odd: Kentucky's printed Total line carries a margin note, "33 Indians included in white population".

#### Missouri (printed pp. 286-287, leaves 405-406)
- 113 counties (p. 286: Adair to McDonald, 64 rows; p. 287: Mercer to Wright, 49 rows) plus the printed Total line on p. 287 (leaf 406). The p. 286 folio prints as "28(" in the scan; the image header and the continuation on p. 287 fix it as 286. `St. Louis` is the county as printed (186,178 free), which includes the city; the city and its wards are in Table No. 3, not transcribed.
- Counties that print no slave figures at all: Douglas (slave columns blank, aggregate 2,414), written as 0 for all slave columns. Ozark has Black slaves (43) but blank mulatto columns.
- Sum check: total_slave 114,931 vs 114,931 PASS; total_free 1,067,081 vs 1,067,081 PASS; black slave total 93,017 vs 93,017 PASS; mulatto slave total 21,914 vs 21,914 PASS; aggregate 1,181,995 vs 1,182,012 FAIL by -17 (Jackson, below).
- Flagged rows: 1.
  - Jackson (p. 286): printed aggregate 22,896 (confirmed at zoom). Free 18,969 + slave 3,944 = 22,913 and the state total only sums with 22,913. Print error in the volume. Kept as printed.

#### Summary of flags
| state | county | kind |
|---|---|---|
| Tennessee | Bradley | print error, aggregate 11,710 printed, 11,701 implied |
| Kentucky | Bath | black M/F unclear (no output column affected) |
| Kentucky | Knox | mulatto M/F inconsistent (no output column affected) |
| Kentucky | Carroll | print error, aggregate 6,579 printed, 6,578 implied |
| Kentucky | Warren | print error, total free 12,006 printed, 12,002 implied |
| Missouri | Jackson | print error, aggregate 22,896 printed, 22,913 implied |

No row is UNRESOLVED. Each of the five printed-value discrepancies is pinned down by two or three independent checks (own row arithmetic, the white total plus free colored, and the printed state total). A consumer who wants the corrected values should use the implied ones; the CSV keeps the printed digits so that it matches the page.
No second scan was used.


## Reader G5: Recapitulation, territories, New Jersey

### Census 1860 (Kennedy, Population of the United States in 1860): summary table and territory county tables (lane cen-G5-summary-territories)

Source: archive.org `populationofusin00kennrich`, read from page images (2320 x 3216 px), with native-resolution crops for every figure used. OCR was used only to locate pages. CSV: `G5-summary.csv` (181 data rows).

Leaf = printed page + 119 verified on every page used (p. 162 = n281, p. 314 = n433, p. 548 = n667, p. 558 = n677, p. 568 = n687, p. 576 = n695, p. 587 = n706, p. 598 = n717, p. 599 = n718, p. 605 = n724). No plate or insert shifts it in the ranges checked (n281 to n724).

#### 1. National state-by-state table

Printed title: "Population of the States and Territories by Color and Condition, with the Rate of Increase and Representation in Congress", in the "Recapitulation" section. It runs across two pages: **p. 598 (leaf n717)** carries White, Free colored (black and mulatto, M/F/Total), Total free colored, Indian (civilized), and **Total free**; **p. 599 (leaf n718)** carries Slave (black and mulatto, M/F/Total), **Total slave**, **Aggregate**, then rates of increase and representation. The CSV rows use `county` = `__STATE_TOTAL__`, one per State and Territory (34 States, 7 Territories, District of Columbia = 42 rows), with `page` = `598-599` and `leaf` = `717-718`. The black and mulatto slave totals are printed and are filled for all slave jurisdictions. Free-state slave cells are dotted in print and are entered as 0.

Three extra rows give the printed national lines, with `county` = `__NATION_TOTAL__` and `state` = `UNITED_STATES_34_STATES_SUBTOTAL`, `UNITED_STATES_TERRITORIES_AND_DC_SUBTOTAL` and `UNITED_STATES_ALL`. Filter them out if you want states only.

Checks (all pass, including every row):
- Per row: black + mulatto slave = total slave; total free + total slave = aggregate (42 of 42 rows).
- 34 States: sum of Total free = 27,197,515 (printed 27,197,515); sum of Total slave = 3,950,531 (printed 3,950,531); sum of aggregate = 31,148,046 (printed 31,148,046). Black slave 3,539,874 and mulatto slave 410,657 also match.
- 8 Territories and DC: free 292,046, slave 3,229, aggregate 295,275 all match the printed Total. Black 2,273 and mulatto 956 match.
- All: free 27,489,561, slave 3,953,760, aggregate 31,443,321 all match the printed "Total in States and Territories". Black 3,542,147 and mulatto 411,613 match.

Slave jurisdictions in this table (total slave): Alabama 435,080; Arkansas 111,115; Delaware 1,798; Florida 61,745; Georgia 462,198; Kansas 2; Kentucky 225,483; Louisiana 331,726; Maryland 87,189; Mississippi 436,631; Missouri 114,931; New Jersey 18 (footnoted `*18`, "colored apprentices for life by the act to abolish slavery passed April 18, 1846"); North Carolina 331,059; South Carolina 402,406; Tennessee 275,719; Texas 182,566; Virginia 490,865; District of Columbia 3,185; Nebraska 15; Utah 29.

**Non-zero slave figure in a state the brief called free: none** except the border-slave states already above. The listed free states (New York, New England states, Pennsylvania, Ohio, Indiana, Illinois, Michigan, Wisconsin, Minnesota, Iowa, California, Oregon) all print dotted (zero) slave cells. The only slave figures outside the 15 slave states are Kansas 2, New Jersey 18, DC 3,185, Nebraska 15, Utah 29. Colorado, Dakota, Nevada, New Mexico and Washington print none.

The table prints Total free as white + free colored + civilized Indians (e.g. Alabama 526,271 + 2,690 + 160 = 529,121). Dakota's "Total free" of 4,837 is therefore white 2,576 + Indian 2,261. Reading note: the Ohio aggregate cell is partly obscured by a stain on the scan ("2,3?9,511"); the free figure 2,339,511 and a dotted slave cell fix it.

#### 2. County tables

Each county table below is "Table No. 2.--Population by Color and Condition" for that State or Territory. Only Kansas, Nebraska, New Mexico, Utah and New Jersey print county rows. Colorado and Dakota print a single territory-wide line (their county-level detail does not exist: Table 3 lists camps, gulches and settlements).

**Column conventions.** No county table prints black/mulatto slave columns (only slave M/F/Total), so `black_slave_total` and `mulatto_slave_total` are empty for all county rows and for the Kansas/Nebraska/NM/Utah/NJ/Colorado/Dakota `__STATE_TOTAL__` rows. A dotted slave cell is entered as 0. Where a table has no "Total free" column, `total_free` is the printed white + free colored (+ Indian) total and the flag says so. Checks 1 and 2 of the brief cannot be applied (no colour split). Check 3 (free + slave = aggregate) passes on every row and check 4 (sum of rows = printed Total) passes for every state below.

##### Kansas (State), printed p. 162, leaf n281
- 41 county rows (Allen to Wyandott, as printed: Dorn, Godfrey, Hunter, Marion, McGhee, Nemeha, Wyandott etc. in their printed spellings) plus the Total row.
- Slaves: **Anderson only, 2 (both female)**. Total slave 2 matches the summary table.
- Sum check: sum of total_free 107,204 = white 106,579 + free colored 625 (printed); aggregate sum 107,206 = printed Total 107,206; slave 2 = printed 2. The summary table (p. 598-599) also gives 107,204 / 2 / 107,206.
- Note printed under the table: 189 Indians included in white population (summary table lists Kansas Indian as 189 civilized; the summary Total free already includes them). Flag on rows: free = white + free colored.
- Total-line page/leaf: 162 / 281. Kansas's Table 3 (pp. 163-164 and the sequel) is cities and towns and was not used.

##### Nebraska (Territory), printed p. 558, leaf n677
- 35 rows (Buffalo to the unorganized-region line) plus Total. Printed Total free column present.
- Slaves: **Kearney 5 (M 2, F 3), Otoe 10 (M 4, F 6)**; total 15 (M 6, F 9). Matches summary.
- Sum check: free 28,826 = printed 28,826; slave 15 = 15; aggregate 28,841 = 28,841.
- Odd rows: "Platte / Madison" is printed with a bracket joining the two names to one set of figures (782): kept as one CSV row, flagged. The last row, "All that portion N. of latitude 40 and W. of longitude 103 ... also that portion bounded N. by latitude 42, E. by longitude 101 30, S. by latitude 40, and W. by longitude 103", is a multi-line description with figures 1,765 and is abbreviated in the `county` cell (flagged).
- Note printed: of the free colored population, 21 male and 18 female are mulattoes.

##### New Mexico (Territory), printed p. 568, leaf n687
- 11 county rows (Arizonia, Bernalillo, Doña Anna, Mora, Rió Ariba, Santa Ana, Santa Fé, San Miguel, Socorro, Taos, Valencia) plus Total. Table 2 prints **no slave column and no Total free column**: columns are white, free colored, Indian, Aggregate. So `total_free` = aggregate and `total_slave` = 0 are by omission, flagged on every row.
- Sum check: aggregate sum 93,516 = printed 93,516. Printed: white 82,979, free colored 85, Indian 10,452 (= 93,516). Summary table agrees (free 93,516, no slaves).
- Odd: the printed "Arizonia" county is the Gadsden-purchase area, listed first. Table 3 (pp. 568-572) lists subdivisions by county.

##### Utah (Territory), printed p. 576, leaf n695
- 21 lines plus Total. Four lines print with no figures at all (Deseret, Greasewood, Walade, "Country east of Wasatch mountains"): rows exist with empty numerics and flag `PRINTED-BLANK`.
- Slaves: **Davis 10 (M 6, F 4), Salt Lake 19 (M 12, F 7)**; total 29 (M 18, F 11). Matches summary.
- Sum check: free 40,244 = printed 40,244; slave 29 = 29; aggregate 40,273 = 40,273.
- Odd: a footnote in Table 3 on the same page ("12 male and 7 female slaves included in white population") attaches to Salt Lake City, so those 19 slaves are also counted in that city's white figure. The county line in Table 2 shows them separately in the slave column and the aggregate 11,295 = 11,276 + 19 matches.
- Note: of the free colored population one male and one female are mulattoes.

##### New Jersey (State), printed pp. 313 and 314, leaves n432 and n433
- Table 2 (p. 314) prints 21 county rows with **free population only** (white, free colored black/mulatto, Total free colored, Aggregate) and an aggregate that excludes slaves: Total free 672,017, then a separate line `*18`, then Aggregate 672,035. The footnote reads: "Colored apprentices, under laws of the State, represented in Preliminary Report, and in Table No. 1, as slaves."
- **The 18 slaves by county come from Table 1, p. 313 (leaf n432), "SLAVE" block:** Hunterdon 4 (M 1, F 3), Middlesex 1 (F 1), Morris 1 (F 1), Passaic 2 (F 2), Somerset 9 (M 5, F 4), Warren 1 (F 1); total 18 (M 6, F 12). No other county prints slaves. The six slave-county rows are flagged (aggregate in the CSV is the printed free-only aggregate; add the slave count for the true aggregate).
- Sum check: sum of county free = 672,017 = printed Total free; slaves 18 = printed 18; the `__STATE_TOTAL__` row carries aggregate 672,035 as printed.
- The summary table (p. 598-599) agrees: free 672,017, slave 18 (black 9, mulatto 9), aggregate 672,035.

##### Colorado (Territory), printed p. 548, leaf n667
- Table 2 is one territory-wide line only: white 34,231 + free colored 46 = 34,277 aggregate. No slave column. The `__STATE_TOTAL__` row only (no county rows exist). Note: of the free colored 9 male and 4 female are mulattoes.

##### Dakota (Territory), printed p. 552 (page number blurred on the scan, so given by the offset rule), leaf n671
- One territory-wide line: white 2,576 + Indian 2,261 = 4,837 aggregate. No free colored and no slave column. `__STATE_TOTAL__` row only.

#### 3. Indian Territory

There is **no "Indian Territory" jurisdiction, county table, or state/territory row anywhere in this volume**. It was not enumerated as a territory. The volume carries only:
- Recapitulation p. 605 (leaf n724): "Indian population in the States and Territories not enumerated in the Eighth Census and retaining their tribal character", where the first line reads "West of Arkansas ... 65,680" (an estimate of aborigines, with no slave figure and no county or tribe breakdown on that page).
- The Introduction (Kennedy, text headed "Indian Slavery", at about OCR line 2443, Roman-numbered pages): "statistics of negro slavery among the Indian tribes west of Arkansas" held by the Choctaw (2,297 slaves, 385 owners), Cherokee (2,504, 384 owners), Creek (1,651, 267 owners) and Chickasaw (917, 118 owners); Seminoles hold none. These four figures are read from the OCR text only (not checked against an image); they sum to 7,369. The text says a supporting table is "appended to the population tables", but I did not locate such a table: the Recapitulation page headings I checked (pp. 592-621, leaves n711-n740) show none, and the OCR text has no tribal slave table (the only "Choctaw" hits are Choctaw County, Alabama). The end of the volume past p. 621 was not examined. These slaves are not in any state or territory total above (the 1860 national slave total 3,953,760 does not include them).

#### 4. Flagged rows (summary of the flag types)

No row failed an arithmetic check. Flags in the CSV mark data conventions, not unresolved digits:
- Kansas: every county row (free = white + free colored; no slave colour split).
- Nebraska: two rows (Platte/Madison bracket; unorganized-region description abbreviated).
- New Mexico: every county row and its total (no slave column printed; free = aggregate).
- Utah: four PRINTED-BLANK rows.
- New Jersey: six rows (aggregate printed is free-only; slaves taken from Table 1).
- Colorado and Dakota: single territory line each.
- UNRESOLVED: none.

#### 5. Not done and outside the brief

- Nevada, Washington and District of Columbia county/subdivision tables were not transcribed (not requested; summary-table rows are included). DC is covered by the summary: free 71,895, slave 3,185 (black 2,252, mulatto 933), aggregate 75,080; its Table 1 shows the free colored at 11,131.
- I did not use a second scan of the volume.
