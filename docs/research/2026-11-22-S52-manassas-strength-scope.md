# S52: the strength evidence for the Manassas junction

22 November 2026. Research and proposed mappings, unsigned. Printed page
numbers throughout. No historical quantity below is silently entered as a
live force strength.

## The accepted registers do not cover these dates

Read from `origin/sprint/research-military` at
`7fbd1082c061094fa0fca7fd0e2f68f2b083b994`:

- `2026-11-20-S21-unknown-strengths.md` and its complete 203-row disposition
  register;
- `2026-11-21-S31-next-strength-sources.md` and its complete 163-row disposition
  register.

Their earliest observation windows start **12 August 1861**. Neither register
contains an observation overlapping April–July 1861. The Manassas observations
in those registers concern **August–September 1862**. S52's permission to use
their quantities where identity and date match therefore supplies **zero live
April–July matches**. This is a coverage finding, not a claim that the historical
strengths are unknowable. The S4 note and the March-start force tables are
different artifacts; they are not new numerical observations in S21 or S31.

The register comparison and file hashes are retained in
`runs/s52/source-scope.json`. The source notes explicitly distinguish returns,
entered-action counts, estimates, bounds and reconstructions. Nothing permits
using an 1862 return for a July 1861 unit.

## Primary passages read

The retained Cornell text of *The War of the Rebellion*, series I, volume II
(1880), [scan cu31924077730186](https://archive.org/details/cu31924077730186),
was read at the passages below. Reused read-only:
`C:/Pyrrhic/mandate-research-sources/S46/OR-I-2.txt`, SHA-256
`66d9a89b843925389e1d2d5d9798dc4e0c66f9a0488bbfcc8705659e4b37ebbf`.
This pass read OCR, not a fresh image check of every numerical table.

| Read passage | What it establishes | Limit on live application |
|---|---|---|
| OR I-2 pp.470–471 | Johnston assumed command at Harpers Ferry on 23 May. His report describes nine infantry regiments, two battalions, four artillery companies and about 300 cavalry. | The organizational counts are not a complete personnel return. Do not multiply regiments by a nominal strength. |
| OR I-2 p.472 | The army left Harpers Ferry on 15 June, operated toward Winchester and Bunker Hill, and faced Patterson. | An order or place name is not a sourced headcount for each Virginia contingent. |
| OR I-2 p.934 | Johnston to Cooper, Camp Bunker Hill, 17 June: his own force 6,500; the opponent about 18,000 in his estimate. | The first number covers Johnston's command, not only the Virginia state contingent. The second is enemy intelligence, not Patterson's own duty return. Neither fills Garland or Preston. |
| OR I-2 p.895 | Garnett's 30 May statement gives local totals while explicitly saying reliable volunteer returns cannot be obtained. Norfolk's 7,000 is conjectural; Richmond's 5,500 includes Ashland and Confederate troops. | These broad scopes do not match the individual S46 blocks. No apportionment or new statewide residual is inferred. |
| OR I-2 pp.473,980–982 | Cooper's 17 July correspondence connects the junction to news that Beauregard is attacked. Johnston acknowledges the telegram on 18 July and says he will move unless Patterson prevents it. His report says the infantry used the railway from Piedmont, while cavalry and artillery marched. | A cause and an ordinary dispatch, not a calendar-only arrival. The read passages supply no uniform men-per-day conversion for the map's capacity units. |
| OR I-2 p.473 | Johnston reached Manassas about noon on 20 July with some troops preceding him; more were expected. | An expected arrival is not an arrived force. Do not place all formations on that date. |
| OR I-2 p.309, table OCR | The 16–17 July departmental abstract separates 1,707 officers and 35,614 men for duty. The editor warns that omitted present totals create an apparent anomaly. | **[I] 37,321** is their sum, a departmental duty count. It is not the number crossing Bull Run or firing on 21 July. This pass does not certify every divisional cell from OCR. |
| OR I-2 p.324 | McDowell reports about 18,000 of all arms crossing Bull Run and names commands not participating in the main action. | This is a reported crossing/main-action scope. It is not an instruction to set the whole army's strength or the resolver's commitment to 18,000. |

The S46 note's May 10 orders and May 15 garrison observation do not establish
separate strengths for Garland's four-company battalion and Preston's
seven-company battalion (OR I-2 pp.824,826–827,846–847). That earlier note was
read; this pass did not reread those primary pages. Its approximate garrison
total must not become a headcount for each battalion.

## Image follow-up: aggregate returns now checked

During the binding check, the retained public-domain scan
`warofrebellion02secrrich.pdf` was rendered headlessly and **pp.187,309,324,568**
were inspected. Its SHA-256 is
`e80f90602c6393aa7cd3a008195007f455d0ba138217403dd3c461beee270c0e`.
The scans remain read-only in the S4 source store; page images and their receipt
are in `C:/Pyrrhic/mandate-research-sources/S52/`. These are additional primary
observations, not quantities supplied by the S21/S31 registers.

| Date and command | Read measure | Number | Printed source and limits |
|---|---|---:|---|
| 30 June, Johnston's Army of the Shenandoah | Aggregate present for duty | 10,654 | OR I-2 p.187, No.12: general staff 32; infantry 10,010; cavalry 334; artillery 278. An army total, not the Virginia contingent alone, not its July 21 arrivals. |
| 28 June, Patterson's Department of Pennsylvania | Aggregate present for duty | 14,344 | OR I-2 p.187, No.13: infantry 13,691; cavalry 395; artillery 258. The image heading says **28 June**, where the Cornell OCR reads 26. |
| 16-17 July, McDowell's department | Duty officers / duty men | 1,707 / 35,614 | OR I-2 p.309, image. **[I] 37,321 combined**, still a departmental scope; the omitted total/aggregate cells warning remains. |
| 21 July, Confederate First Corps/Army of the Potomac | Printed aggregate return | 21,863 | OR I-2 p.568, No.117, dated 25 September: infantry 19,569; cavalry 1,468; artillery 826. Does not include Johnston's separate army. |
| Same command and day | Printed aggregate engaged | 9,977 | OR I-2 p.568, No.118, also dated 25 September. A narrower measure of the same men, **not additive** with 21,863. |

The p.324 image confirms McDowell's approximate **18,000 crossing Bull Run**.
It does not call that his whole department, and it identifies troops outside
the main action. The p.568 distinction likewise prevents treating every man
available to Beauregard as a man engaged in the main action.

**[I] Live use still needs inclusion accounting.** Neither p.187 army total
identifies S46's single state contingent with the whole army. The simulation
also has already-raised blocks assigned to the same commanders, sometimes still
traveling from distant muster points. Adding a second army total, resetting
those blocks to a historical total, or treating a June return as an unchanged
July return would double-count or overwrite the run's actual history. The
abstracts are useful inputs for a temporal force-organization apply; they do
not solve it by assigning one number to every unknown block. No runtime input
was changed after the frozen history run or during the done check.

## Proposed rulings [I]

1. Retain S46's individual unknown strengths. Obtain matching local rolls, or
   authorize a separate aggregate-return representation with explicit inclusion
   accounting. Reject assigning Johnston's entire 6,500 to his Virginia block,
   or adding that army total on top of the troops already sent to him.
2. Keep McDowell's field army, the departmental duty return, the men crossing
   Bull Run and the model's committed/engaged quantities distinct. The request's
   approximate 35,000 comparison does not turn the p.309 departmental table
   into a 35,000-man field return. Reject shrinking every Union block or moving
   global commitment, frontage or morale parameters to reproduce the result.
3. A received notice of an actual advance can release a dated doctrine order.
   Compliance and the ordinary plan/movement path still govern execution.
   Reject setting a junction flag on 17 July without an advance, teleporting
   troops or forcing a rout.
4. Rail transport requires an explicit capacity model and source/scale mapping.
   Existing movement tests line openness, then advances each block one day per
   day; it does not consume a daily troop-load budget. Reject calling that
   throughput or inventing a Manassas-specific conversion from a desired date.

Findings outside my scope: a matched local return series, the live aggregate
inclusion model, the field-army/reserve allocation and a sourced rail-capacity
scale remain needed. S53–S61 and whole-branch/gate review remain separate.
