# Northern Virginia command assignments, R98

Research note, 20 November 2026; not canon. Read for R98 only. No battle outcome or historical force allocation is prescribed.

The source is the War Department's *War of the Rebellion*, Series I, volume II (1880), Cornell University Library scan `cu31924077730186`. The original scan's OCR was downloaded and read at [Internet Archive](https://archive.org/download/cu31924077730186/cu31924077730186_djvu.txt), retained in `runs/r98/sources/OR-I-2.txt`. Page references below are printed pages. The Ohio State endpoints were unavailable (Cloudflare); Bull Runnings' transcriptions supplied leads, then the Cornell volume supplied the primary verification. Search summaries supplied no entered facts.

Retained OCR SHA-256: `66d9a89b843925389e1d2d5d9798dc4e0c66f9a0488bbfcc8705659e4b37ebbf`.

| Printed pages | Document read | What it establishes |
|---|---|---|
| 844–845 | Cooper to J. E. Johnston, Montgomery, 15 May 1861 | The War Department assigned Johnston to troops near Harpers Ferry. He was to travel via Lynchburg and arrange reinforcements there. This is an assignment date, not an arrival date. |
| 856 | Johnston to Lee, Abingdon, 18 May | Johnston reports delay through debility, expects Lynchburg on Monday, and says the President intends an army near Harpers Ferry. |
| 470 | Johnston's report, Fairfax Court House, 14 October 1861 | He states he assumed command at Harpers Ferry on 23 May. This is a retrospective official report, not a contemporary arrival telegram. |
| 896 | Special Orders 149, Headquarters Virginia Forces, Richmond, 31 May | By Lee's order, Beauregard is assigned to troops in the Alexandria line and referred to his predecessors' instructions. It does not say Davis signed the order. |
| 901–902 | Beauregard to Davis, Camp Pickens, Department of Alexandria, 3 June | He reports arriving on 1 June at 2 p.m., describes the junction's defenses, and asks for reinforcement. His own dated account supplies the Manassas headquarters and arrival, rather than an uncited 2 June date. |
| 907 | Beauregard's 5 June proclamation, headquarters heading and self-identification only | It explicitly locates Camp Pickens at Manassas Junction. Its political assertions and appeals are not used, quoted or implemented. This geographical identification supports mapping the 3 June letter's headquarters to the existing Manassas region. |

## Modelling choices [I]

R98 authorizes Davis's doctrine to make the assignments. The 15 May and 31 May dates date the doctrine's appointment letters. The existing message path determines when an eligible officer takes the post; the historical 23 May and 1 June arrivals are evidence, not forced completion dates. Appointment costs, compliance, routes and attention are unchanged. Reassignment names the expected old post, releases its holder only when appointment succeeds, and leaves its troops assigned there until ordinary transfers move them.

Both commands are declared, initially unopened `army_command` posts, under the existing War Department. Their campaign names supply the existing temporary-command lifetime mechanism through this horizon [I]; this does not establish a new historical department boundary. No new army, men, control or equipment is created by an appointment.

Virginia's live department side must be Confederate, the sourced date must have arrived, and the specified officer must be serving on that side. Johnston still holds the Union Quartermaster General post in the supplied R90/R96 base: the resignation implementation described in decision 0101 has not reached this checkout. R98 supplies his doctrine and declared command but preserves this eligibility failure; it does not implement another lane's resignation system or change his opening side.

The latest dated, eligible, established concentration receives new levies through the existing governor transfers. Each northern concentration expressly includes the old Charleston concentration as a sending post. An army already assigned to Johnston stays his; the later Alexandria assignment does not transfer his army south or order a July junction. This is a disclosed allocation approximation [I], because the read documents do not supply a complete regimental allocation. The source supports reinforcement of those commands, not sending every historically raised regiment there. Existing inquiry and transfer prices apply.

The old concentration's transfer requests all its commanded blocks through the existing bundle-transfer verb, including opening blocks as well as newly raised levies. No read source supplies that complete allocation. It is a proposed modelling ruling [I] for review, not a claim that Charleston's historical garrison moved in full. The run exposes its cost: four opening blocks with unknown strength fight at Manassas and fail the unchanged unknown-strength criterion. Their headcounts have not been invented, and the criterion has not been waived.

Rejected: changing Johnston's starting faction; moving the Union War Department to the Confederate side; implementing resignations here; opening the commands from a date-only notice; forcing an arrival date, a July march, battle, control change or tactical weight. R97's state-force acts are outside this checkout. Independent review belongs to Claude under 0096.
