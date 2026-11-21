# Proposed experience rule

This is an inference for the lead, not a historical judgment printed by a register. Decision 0087 admits later reference works for service facts; it does not make their praise a contemporary leg for competence, nerve or reputation. S38 expressly requests a service-based experience proposal. Acceptance of the mapping below remains a separate ruling. All other S22 cells and priors stay unchanged.

## One calculation for every officer

**[I] Map documented commissioned tenure before 1 March 1861 to the existing experience scale.** Count the union of dated intervals, not their sum. Concurrent regular, volunteer, staff and brevet appointments therefore earn one elapsed day, and the staff table adds no extra years. Cadet and enlisted time are excluded. U.S., state/militia, Republic of Texas and later Confederate records retain separate government/date fields. A government's label in the pool or opening cast is never backdated into earlier service.

| Documented tenure | Proposed band | Existing pack centre |
|---|---|---:|
| Proven zero | low | 200 |
| More than zero, below 3 years | below | 350 |
| 3 to below 10 years | average | 500 |
| 10 to below 20 years | above | 650 |
| 20 years or more | high | 800 |

The centres are read from `people.shadow.centrePermille` in `packs/union-1861/pack.json`. The thresholds are proposed, not estimated from a desired distribution. They are applied without reference to the accepted prior or the person's later success. The resulting counts are 92 high, 65 above, 35 average and 33 below; no zero-service point is proposed.

**[I] Dates use half-open intervals `[appointment, exit)`, clipped at `1861-03-01`.** An exit day is excluded consistently, including a resignation on the cutoff. This is a calculation convention, not a ruling about legal effectiveness within that day. Days are converted to nominal years as `days × 4 / 1461`; three decimal places are display only. Integer comparisons set bands before rounding. These are documented nominal commissioned years, not a proven complete career or days of exercised duty. An Army entry's brevet second-lieutenant appointment after graduation is counted; its cadet entry is not.

For naval records, the first counted date is lieutenant, purser, assistant surgeon or Marine lieutenant as specified in the row. Midshipman, cadet and warrant periods receive no commissioned-year credit under this proposal. The selected entries largely describe rank progression rather than duty. The legal classification of every earlier naval appointment, constructors in particular, has not been established here; Lenthall's commissioned total remains HOLD despite a separately dated bureau tenure. Callahan's retrospective rank headings must not be read as the rank held at the beginning of an office. Reserved/active-list transfers do not, by themselves, establish a break in commission.

**[I] Year-only militia spans receive bounds.** The conservative start is 31 December of the starting year; the permissive start is 1 January. The conservative end is 1 January of the ending year; the permissive end is 1 January of the following year, both clipped at the cutoff. Short or reversed conservative spans contribute zero, not negative days. Union these bounds with the U.S. intervals. Propose a point only if both resulting bounds lie in the same band. No exact day is invented. Lovell's discrepant resignation dates receive the same bounded treatment: Heitman gives 18 December 1854, Cullum 18 September; both yield the same band. The U.S. point column is explicitly the Heitman calculation; the all-documented bounds expose the alternative. [Heitman p644; Cullum II p122, scan locators](scan-manifest.json).

**[I] Hold when identity, interval or material duty evidence is unresolved.** A first listed U.S. commission in 1861 does not prove no earlier state or foreign commission. A volunteer/militia officer without a safely joined prewar register entry remains held. Registers' omissions are not negative service findings. Source selection is not a complete search of state or foreign archives.

The same duty exception applies to anyone whose read source explicitly says that nominal tenure included an extended period with no government duty. Northrop is the identified case: the nominal commission calculation is preserved separately, but experience is HOLD until duty/absence accounting can support it. Ordinary authorized leave remains inside nominal tenure; it is not labelled exercised field service. [Heitman p751; Cullum I p487](scan-manifest.json).

## Keep different evidence separate

Mexican War actions and frontier/Indian-war duty are descriptive facts, not bonuses in the rule. Stationing, surveying, forced removal, scouting, actual fighting and command are distinguished where the passage permits. Participation in an expedition explicitly described as not at the seat of war does not become battle experience. Brevet action clauses establish the named action cited by that clause, not an accepted personal quality. Historical service against Native peoples is not endorsed or treated as a measure of their worth. The source's dehumanizing labels and celebratory judgments are not adopted as narrator language. Sensitive contexts remain unsigned research for later gate review.

Staff rows distinguish a dated appointment from a complete account of duties. Overlaps are unioned. Academic instruction and membership of an engineering/ordnance corps do not automatically become bureau work. Conflicting staff endpoints stay exposed and held, including Grant, Robertson, George B. Anderson and Pender. Meigs's printed image resolves `31 July 1837`, and John F. Lee's September-register image resolves `2 March 49`; neither correction rests on guessing the OCR. [Conflict records](conflicts.csv).

`highest_field_command` means the strongest exercised-command evidence established in the read prewar passages, with an explicit HOLD where a career maximum has not been established. Arsenal, garrison, governorship and department appointments are not silently equivalent to a field formation. All printed numerical size fields remain held. Later OR organization tables show campaign commands and successions; they do not establish uninterrupted command, a prewar maximum or present-for-duty numbers.

The later Confederate table preserves the compiler's appointment, rank and confirmation dates independently, including inconsistencies. Its `person_candidates` column is a finding aid based on surname and initial, not an accepted identity join. Selected events extend through the S22 horizon of November 1862; later confirmation dates are reference facts, not opening availability. [Government exits](government-transitions.csv) do not fill gaps between a U.S. resignation and a state or Confederate appointment.

## Proposed rulings and rejected alternatives

- Adopt the same documented-tenure thresholds for all officers, subject to the holds above. Reject fitting a separate threshold or campaign bonus to each person.
- Keep the new facts and proposed values beside S22. Reject overwriting its 239 held experience rows, altering a prior, or applying this draft to the pack.
- Require full-name/role corroboration before accepting initials-only joins. Reject the Kansas James H. Lane for the Confederate handle, Austin Brockenbrough who died in 1842, John Newman Andrews for John W. Andrews, and the William S. Smith who died in 1849. The separate William Sooy Smith entry is explicitly identified. [Conflicts](conflicts.csv).
- Count elapsed commission once and preserve duties separately. Reject rewarding rank, a later victory, academy seniority, forced removal, or an inferred headcount.
- Keep the source acquisition limits visible. Reject claiming an 1868/1891 collation, a complete Army Register or an absent state commission from the unsuccessful downloads.
