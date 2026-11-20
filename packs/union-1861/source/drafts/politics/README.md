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
| `legislative-ledger.json` | Statutes, a presidential recommendation and a proclamation, with distinct vote questions. These are historical references, not executable `ledger-act` effects. |
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

## Legislative interpretation

Votes identify the actual question: passage, amendment, concurrence, conference or suspension of rules. A division not taken is null, never a zero-vote or unanimous roll call. Exact-day uncertainty remains month precision where the read page gives only sequence. The first-confiscation House reference is the direct Globe's **60–48**, with MP's **61–48** retained. The original House Homestead and Legal Tender roll-call pages remain retrieval holds; the ledger explicitly cites the read Currie study for those tallies.

Sensitive historical summaries and documentary positions are unsigned research drafts. They prescribe neither player text nor placement. The separate gate reviewer must review any eventual treatment of slavery, freedom, colonization, military service, land rights or coercive state power. No human price, stock, labour allocation or persuasion coefficient is supplied.

## Proposed rulings

1. [I] Adopt source-specific party observations, dated documentary alignments and explicit uncertainty. Reject timeless faction assignments or deriving policy support from party totals.
2. [I] Prefer explicitly cited official roster/biography evidence where it resolves a transcription conflict; retain incompatible evidence and HOLD unresolved qualification dates. Reject silently repairing the almanac or making every printed name a seated member.
3. [I] Keep these tables inert until their schemas, identity crosswalks, historical scope and source conflicts receive lead review. Reject copying them into live data or generating outputs during S17.

## Findings outside my scope

The live election, Congress, press and faction mechanisms remain with their implementation owners. S6 owns live person and service values. S7 and the gate reviewer own sensitive wording and placement. S1/S2 retain the inherited simulation and timing failures. No file in those lanes is edited.
