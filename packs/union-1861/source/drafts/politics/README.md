# Politics data drafts, August 1861 to November 1862

Status: **draft, not loaded**, S17, 2026-11-20, under decision 0106. These are research interchange tables for review. No importer, live pack, generated world, runtime schema, situation, strings or signature is changed. They do not implement elections or add calendar triggers. The checkpoint proposal is separately named `../../../checkpoints-politics-1862.draft.json` beside the live checkpoint file.

The starting evidence is the four [S3 research notes](../../../../../docs/research/2026-11-20-S3-source-register.md). S17 re-reads their sources and adds the official 2005 *Biographical Directory* roster and selected biographies. `sources.json` identifies retained scans, URLs, hashes, printed pages and PDF locators. Scans, transcriptions, renders, recipes and validation logs remain in `C:/Pyrrhic/mandate-research-sources/S3/`, with this run's additions in `S17/`. Whole-volume downloads are not whole-volume reading claims.

## Congress

| File | Meaning |
|---|---|
| `congress-sessions.json` | The three regular sessions of the 37th, the earlier Senate-only special session, and the almanac's published party totals. The third regular session is a later audit reference, outside November. |
| `congress-members.csv` | Named members overlapping a regular session, plus an explicitly held publication-only claimant. Each party observation has its own source. `party_candidate` preserves the proposed resolution of a conflict without erasing the original observation. |
| `congress-session-members.csv` | [I] Session intersections of the member records' coverage bounds. This is neither a daily attendance return nor a legal-entitlement or quorum count. Partial sessions are retained. |
| `congress-delegates.csv` | Territorial delegates separately; do not add them to voting representative totals. |
| `political-alignments.csv` | Named signatories and a dated letter: documentary alignments, with the positions attributed. These are the sourced faction-related observations; they do not establish permanent caucuses. |
| `legislative-ledger.json` | Fourteen entries and 24 vote questions: statutes, a presidential recommendation, a proclamation, the joint war committee and Cameron's censure. These are historical references, not executable `ledger-act` effects. |
| `senate-roll-calls.csv` | Five complete recorded Senate roll calls. Only the named, cast votes are represented. An omitted senator is not classified as voting nay. |

`member_id` is a draft research key, not a live person id. No personality, value, reputation, support permille, vote discipline or allegiance is inferred from party. Every member's permanent `faction` remains unknown: the read rosters classify parties, and the dated documents supply alignments. A future crosswalk must preserve that distinction.

Coverage floors and ceilings marked [I] are review aids. An ordinary member without an explicit entry exception is assigned the first regular-session floor, **not** an invented swearing-in or legal-term date. A member with a qualification exception begins on that recorded day. Exact-day death, resignation and expulsion observations are inclusive bounds for the table intersection, not proof of attendance that day. Blair's July resignation retains month precision. The biographies' legal-service observations remain separate from qualification. The 1863 third-session rows must never be read as November knowledge.

### Source conflicts and held service questions

- **Session end:** BDR p.162 ends the third session on 3 March 1863; MP p.121 prints 4 March. The draft prefers BDR [I], retaining the alternative. This has no effect on the November checkpoint.
- **Baker:** BDR p.164 n.74 and BB-B p.597 date his death to **21 October 1861**. MP p.123 prints 1862. The draft uses the corroborated 1861 date [I].
- **Wright:** MP p.123 gives **3 March 1862** for succession; BDR p.163 n.24 prints **2 June** for taking his seat. MP p.212 and G62 p.1951 record his votes before June. The draft provisionally uses March for possible session coverage [I]; exact qualification remains HOLD. BB-W pp.2203–2204 begins legal service on 24 February. These measures cannot be collapsed.
- **Upton:** BDR p.165 n.107 dates the adverse entitlement ruling **27 February 1862**; MP p.123 gives the 28th. The draft prefers the official roster [I] pending the original House journal.
- **Shiel:** TA62 p.19 prints him in Roman, which its House key calls Republican; BB-S p.1904 explicitly calls his successful 37th-Congress contest Democratic. Both observations survive; prefer the explicit biography for adoption [I]. This does not alter TA62's transcribed party totals.
- **Todd:** the analogous Roman-type observation in TA62 p.19 conflicts with BB-T p.2051's explicit Democratic election. Keep the delegate separate and prefer the explicit biography [I].
- **Phelps:** MP p.123 supplies qualification on **9 May 1862**, while BB-P pp.1731–1732 describes a continuous elected-term series. TA62's printed name is not proof of a December qualification.
- **Vandever:** BDR p.163 n.28 records the House's **20 January 1863** retrospective ruling against entitlement since **24 September 1861**. His publication-roster presence and later adverse ruling both remain; the table is not a certification of his legal seat.
- **Jackson:** BDR p.163 n.35 records resignation **13 December 1861**, preceding his later death. MP p.217 nevertheless prints his name on the July majority reply; BB-XY p.2209 describes Yeaman's replacement as filling a death vacancy. Retain the incompatible descriptions and the attributed signature; do not reseat Jackson by inference.
- **Edmund Pendleton:** TA62 p.19 lists him for Virginia, but BDR p.165 does not establish him as a qualified member. His publication-only record is excluded from all session intersections. Earlier departed, never-qualified and rejected claimants are not manufactured into sitting members.
- **Washington delegate:** TA62 p.19 prints James H. Wallace; BDR p.165 gives William H. Wallace. The identity candidate follows BDR [I], with the discrepancy retained.

## Midterms and state governments

| File | Meaning |
|---|---|
| `midterm-original-winners.csv` | 151 original winners in sixteen states, preserving printed names/initials and local-ticket categories. Wisconsin's Hanchett is restored as the original winner with his later death recorded separately. |
| `midterm-state-counts.csv` | [I] Counts of those original contests: 71 Democratic, one Independent Democratic and 79 Republican/Union/Emancipation. Missouri's five Emancipation winners remain identifiable within the last group. |
| `midterm-scope.json` | Pending later states, occupied/restored representation, the almanac's conflicting footer and the Directory's distinct initial-election series. |
| `statewide-vote-references.csv` | Ten named-office, two-candidate comparisons. Candidate cells, printed totals/margins and recomputed sums/shares are distinct. |
| `governor-party-observations.csv` | 49 governor-table observations across the 1862 and 1863 almanacs: 37 with separate party evidence, twelve on party HOLD. |
| `state-legislature-party-observations.csv` | Exact, approximate and qualitative party observations, including holds. Each retains the source's period heading and local labels. |

The **19 proposed checkpoint records** in `../../../checkpoints-politics-1862.draft.json` preserve S3's envelopes and cross-constraints. Their proposed election measure kind is not supported by today's live checkpoint schema; the file is deliberately inert. Bands have not been adopted, and an envelope that permits a close alternative outcome cannot waive a subsequently binding named-winner requirement. The later 184-seat comparator includes 1864 Nevada and must never be evaluated in November 1862.

Ordinary general-election dates translated from TA63 p.64 are marked [I]. They are candidates, not verified House-specific statutory dates, receipt times or runtime triggers. A result, its publication, a later vacancy and a member taking a seat are separate events. A two-candidate share is not a share of all eligible voters or residents.

The state-government tables are publication snapshots, sometimes incorporating incoming governors. They do **not** establish that Seymour, Parker, Cannon or every other listed successor was incumbent in November. Party observations retain the date/office of their underlying evidence; a later gubernatorial return is not automatically an earlier party history. Morton's and Salomon's earlier lieutenant-governor tickets are identified as such. Unknown party, accession and chamber fields are not filled from a state's federal delegation. The tables' loyal-government scope does not establish every Confederate state government's party or its local control.

### Additional corrections and qualifications found in the scans

- **Indiana legislature:** TA63 p.57 prints **21 Unionist / 27 Democratic / two Independent senators**, with **38 / 62** Unionist/Democratic representatives. Its Democratic joint majority is **30**, comparing 89 with 59. S3's prose grouped the Independents with Democrats and reported 32. S17 preserves the printed categories; no old note or live rule is rewritten.
- **Oregon opponent:** TA63 p.57 labels McBride's Democratic congressional opponent **Wait**, not Shiel as S3's prose says. This does not change the original winner, vote totals or state seat count.
- **New Jersey governor arithmetic:** TA63 p.53 prints candidate cells **61,307 and 47,491**, but a total **108,017** and margin **14,507**. The cells sum to **108,798**, difference **13,816** [I]. Keep both the publication claims and arithmetic; the draft does not silently repair them.
- **Indiana secretary-of-state arithmetic:** TA63 p.57 prints a **9,543** margin, while its **128,160 and 118,517** candidate cells differ by **9,643** [I]. The office remains secretary of state.
- **Wisconsin provisional returns:** TA63 p.62 explicitly lacks the full soldier vote and some counties, and can show losing provisional leads. Do not use those cells to overwrite the later roster or the separately corroborated original Hanchett victory. Its legislature is described only as “pretty evenly divided.”
- **Chamber categories:** Maine's War Democrats and Straight Democrats, Rhode Island's Sprague and Republican Unionists, California's two Union labels, and Indiana's Independents remain distinct. Missouri's counts and Senate majority remain approximate/probable. None is a timeless national faction map.

## Legislative interpretation

Votes identify the actual question: passage, amendment, concurrence, conference or suspension of rules. A division not taken is null, never a zero-vote or unanimous roll call. Exact-day uncertainty remains month precision where the read page gives only sequence. The first-confiscation House reference is the direct Globe's **60–48**, with MP's **61–48** retained. The original House Homestead and Legal Tender roll-call pages remain retrieval holds; the ledger explicitly cites the read Currie study for those tallies.

Sensitive historical summaries and documentary positions are unsigned research drafts. They prescribe neither player text nor placement. The separate gate reviewer must review any eventual treatment of slavery, freedom, colonization, military service, land rights or coercive state power. No human price, stock, labour allocation or persuasion coefficient is supplied.

## Press

| File | Meaning |
|---|---|
| `press-papers.csv` | Eleven research identities, publication variants, five page-backed editor observations and explicit identity/role holds. No live person, side or faction crosswalk. |
| `press-role-observations.csv` | Six named role observations. The Liberator's general agent is kept distinct from its editor. |
| `press-content-observations.json` | Thirteen attributed observations: editorial positions, endorsements, document publication, cross-paper reading and a retrospective network account. |
| `press-reach-observations.csv` | Fifteen qualified quantities: an advertised circulation, reported seized consignments, and 1860 aggregate publication/circulation columns. All runtime reach fields remain HOLD. |
| `press-distribution-constraints.json` | Eight documentary observations about a presentment, mail direction, reported seizure, asserted military authority, publication variants and subscription/reprint routes. No executable suppression option or receipt rule. |

The sample includes Douglass' Monthly, the New-York Daily Tribune, the Liberator, the New York Herald, the Richmond Dispatch, Thompson's Bank Note and Commercial Reporter, and the five papers named in the printed grand-jury presentment. Greeley's editorship is in BB-G pp.1149–1150; Garrison's in LIB62 issue p.1; Bennett's in HUD pp.479,482–483; Thompson's in TA62 p.68; Wood's in BB-W pp.2193–2194. Douglass' editorial role remains HOLD under the page-citation rule: the read issue titles establish the paper, while the unpaginated catalog lead does not establish a paginated role observation. The Dispatch's damaged header also leaves its editor unknown.

DM-S pp.705,707–708 and DM-O pp.721–723 supply the paper's dated arguments; LIB62 p.154 contains both the proclamation and the separate abolitionist discussion; HER62 p.1 prints the proclamation on 23 September. These are publication observations, not proof that every reader had received them. RD62 pp.1–2 quotes and criticizes Northern papers, a case of access across the conflict rather than a universal transport model. Hudson's later account is attributed and retrospective; its broad war-period network claim is not a precise 1862 coverage count.

TA62 p.68's **100,000** is a publisher's advertised circulation claim, with editions not separated. MP p.188's **over 1,000** and **nearly 500** are reported newspaper consignments, the latter shared across four destinations. TA63 p.27's daily, weekly and annual columns describe different periods and an **1860** aggregate. None establishes unique readers, persuaded voters, a November 1862 per-paper circulation, or a runtime permille. No conversion is proposed.

The presentment's accusation is not a conviction. The separate mail order applies from receipt, which is unknown; Brooklyn's inclusion in the accusation does not establish its inclusion in the New York-city mail direction (MP p.188). The Tribune Clubs offer read on TR62 p.4 sells the **book** *Among the Pines*, not newspaper copies. Those distinctions are retained in the data.

Seven original newspaper-page JPEG scans were read alongside the cited PDFs. The failed Tribune PDF endpoints and the Herald page-4 image failures are retained as acquisition evidence, never cited as read pages. Unused whole-volume downloads are separate from the 39 cited scan files; no full-volume reading claim is made.

## Proposed rulings

1. [I] Adopt source-specific party observations, dated documentary alignments and explicit uncertainty. Reject timeless faction assignments or deriving policy support from party totals.
2. [I] Prefer explicitly cited official roster/biography evidence where it resolves a transcription conflict; retain incompatible evidence and HOLD unresolved qualification dates. Reject silently repairing the almanac or making every printed name a seated member.
3. [I] Keep these tables inert until their schemas, identity crosswalks, historical scope and source conflicts receive lead review. Reject copying them into live data or generating outputs during S17.
4. [I] Retain the press's dated arguments, roles, publication variants and qualified quantities separately. Reject replacing them with permanent party loyalty, uniform audiences, delivery certainty or an invented persuasion/reach coefficient.

## Findings outside my scope

The live election, Congress, press and faction mechanisms remain with their implementation owners. S6 owns live person and service values. S7 and the gate reviewer own sensitive wording and placement. S1/S2 retain the inherited simulation and timing failures. No file in those lanes is edited.
