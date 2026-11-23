# 0109: Two pushback floor cases belong to other mechanisms

Status: accepted (2026-11-23). Recommended by S53 (`docs/research/2026-11-22-S53-proposed-0099-amendment.md` on `sprint/pushback` at `4c4edd66`). Corroborated by S73's search for carriers and filters, `docs/research/2026-11-23-S73-dispatch-carriers-and-filters.md` at `5121a231`. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0099.

## Context

- 0099 item 6 sets each pushback band's lower bound from the verified record cases of that kind. Its upper bound is three times the catalogue's cases of that kind, including note-only and extra cases, and at least the lower bound plus three. The catalogue is Appendix C of `docs/research/2026-11-16-numbers-and-facts-1861.md`.
- **The relay-hold floor of 2** counts two cases:
  - N3-11: the Adjutant-General's office and the *Crusader*'s passage with Scott's order of 12 March to Vogdes;
  - N3-27: Special Orders No. 135, the order relieving Harney.
- **The filter-hold floor of 1** counts one case: N3-06, Seward's memorandum to the Confederate commissioners.
- **S53 reread the sources for both cases:**
  - Lincoln's letter of 18 May to F. P. Blair leaves the delivery of Special Orders No. 135 to Blair's discretion, and asks him to hold it unless it is urgently needed (Nicolay and Hay, *Complete Works* II pp.47–48; OR I-III pp.374, 381). That is an authorised condition on delivery, not an intermediary resisting his principal.
  - Seward's memorandum of 15 March is an outward reply, delivered on 8 April with the commissioners' understood consent (Richardson, *Messages and Papers of the Confederacy* I pp.85–88). It is not an incoming paper held before Lincoln saw it.
- **S73 searched for a filter on either side** between the wire or the mail and Lincoln or Davis, from March to July 1861.
  - It found none for either president in the sources it read. That is a limit of the evidence read, not proof that no screening happened.
  - What it did find is narrower: departmental mail screening, a diplomatic summary passed to Lincoln through Seward, and Hay's handling of the mail, which can't be dated to the window.
  - The named instance of a dispatch being withheld comes later: Stone's dispatch, on 21 October 1861 (Bates pp.93–96).

## Decision

1. **N3-27 is an authorised conditional delivery, not a relay hold.** Its dated order and its receipt stay as evidence for a later contract on discretionary delivery.
2. **N3-06 is outward diplomatic handling with a negotiated delay, not a filter hold.** No military-wire filter office is invented for Seward.
3. **The two bands are recounted by 0099 item 6's own rule:**

   | Band | Lower | Upper | Cases |
   |---|---:|---:|---|
   | Relay holds | 1 | 4 | Floor: N3-11. Upper: three times one is below the floor plus three. |
   | Filter holds | 0 | 6 | No verified case in the window. Upper: three times the remaining catalogue cases, N3-09 (note-only, the adversary's postal filter at Charleston) and X-03 (extra, the War Department's "wait for further directions" to Governor Morgan, OR III-1 p.87). |

   The other five bands are unchanged. Trims keep N3-07 until its classification is ruled on.
4. **The citations move with the numbers.** `checkpoints.json`'s citations for the two bands name these cases and this record. The change is applied on the sprint integration branch, with the July stack, not separately.

Rejected:
- **Keeping the floors and backdating a later case.** October 1861 and 1862 aren't in a window that ends on 31 July.
- **Counting the time between issue and receipt as a hold.** Neither elapsed time nor an authorised condition proves resistance.
- **Making Seward or Walker's office a wire filter.** The sources show diplomatic handling and departmental mail screening, not a post between the wire and the President.
- **Lowering other floors to match what the runs produce.** That fits bands to the model, which 0099 forbids.

## Consequences

- The relay-hold floor still needs one hold by 31 July. The only remaining case, N3-11, is the Pickens order of 12 March. S73 sourced its journey: the order went by the *Crusader*, was transferred at Key West on 26 March, and reached Vogdes on 31 March (ORN I-4 pp.89–90, 102, 104, 110–111). Producing that hold from its cause needs dated, document-specific carrier itineraries; S53's format selects an itinerary by destination alone. That is the next pushback build, after the July commit.
- A filter hold may still occur in play. It is no longer required.
