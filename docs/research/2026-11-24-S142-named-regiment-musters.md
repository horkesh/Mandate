# S142: the musters of the named regiments

For the lead: 3 items. **S142 only**, on `sprint/research-military`, from
`f6b7c7029f22ddfecc95a1d744c04b24c52e2095`. Research under accepted decisions
0127 and 0132; no pack, production code, decision, rule value, strength,
scenario, band, criterion, signature or hold changes.

The [catalogue-keyed CSV](S142/named-musters.csv) has **all 214 identities**:
130 Union and 84 Confederate. It preserves the catalogue's arms and scopes,
including batteries, regular detachments, militia pools and unresolved names.
This is an inventory of evidence and gaps, **not complete recovery of every
identity's receipt, muster components or contract**.

There are 436 event records across 118 identities. **101 identities have a
muster observation at its stated scope**, including company/individual entries
and partial-date ranges; **106 have a contract or term description at its
stated scope**. These counts do not certify complete regimental chronologies.
Union: 94 muster/100 term; Confederate: 7 muster/6 term. **96 identities have
no adopted event at all**, including 69 Confederate identities. None is
silently assigned a date or term. S142's recovery remains unfinished there.

## 1. Receipt-to-muster pairs for the lead to assess

Elapsed days use receipt as day zero. These six identities have a demonstrated
receipt/identity join in the selected reading. The source's call kind and
component scope remain binding; this is no automatic approval to insert a
number into a different call profile.

| Catalogue identity | Read State/government receipt | Performed muster | Elapsed days | Source pages |
| --- | --- | --- | ---: | --- |
| `nj_1_3y_infantry` | May 17 requisition and GO15 received | May 21, Camp Olden | 4 | Stryker I pp.[67],68 |
| `nj_2_3y_infantry` | Same specified three-regiment cohort | May 26, Camp Olden | 9 | Stryker I pp.[67],102 |
| `nj_3_3y_infantry` | Same specified three-regiment cohort | June 4, Camp Olden | 18 | Stryker I pp.[67],150 |
| `oh_1_3m_infantry` | Governor's explicit April 15 received reply | April 29, Lancaster, Pennsylvania | 14 | OR III-I p.73; Ohio official roster I p.[1] |
| `oh_2_3m_infantry` | Same April call; own opening explicitly joins it | April 29, Lancaster, Pennsylvania | 14 | OR III-I p.73; Ohio official roster I p.19 |
| `mn_1_infantry` | Ramsey's April 15 telegram conveying his accepted tender, known in St. Paul that day | Eight companies April 29; Hastings and Winona April 30, Fort Snelling | 14;15 | Minnesota State commissioners, *Minnesota in the Civil and Indian Wars* I pp.2-3 |

Minnesota's evidence concerns **notice of an accepted named offer**, not an
unread generic federal requisition. Its model call/offer must be matched before
use. New Jersey's May 18 readiness does not replace the performed dates.
Ohio's April 18 organization and April 19 departure are different events.
The First Ohio opening's proclamation year and muster clause were checked in
the static original page; OCR's proclamation-year `1863` is rejected.

The [interval CSV](S142/intervals.csv) contains 239 arithmetic records, including
component records and explicitly marked context/bounds. **They are not 239
independent pairs or a distribution.** Only the six identities above have the
`paired_evidence_for_lead_review` disposition. Every other identity retains
**`musterDays` as provisional under 0132**: 208 identities, without fitted
dates or a borrowed State median. No interval is counted from an archived
absolute date in the model, and nothing is tuned to July 19 or 21.

The April New Jersey written requisition was received April 17, but operative
notice already existed by April 16. Both the written interval and the bounded
first-notice interval are retained; selecting the later mail receipt as a
clean origin would overstate the evidence. OR III-I pp.68,73,83; Stryker I
pp.15,28,40,53. Pennsylvania's State narrative records the April 15 telegram
and response, and places its three-month records under that call. It does not
allocate each of the original sixteen and additional accepted regiments to a
particular received instrument. Those calculations remain **programme context
only**, not 0132 rule inputs. Bates I pp.1,3; individual company pages in CSV.

## 2. Components and original clocks

**Second Maine, Twelfth New York and Thirteenth New York remain separate.**

- **Second Maine:** State enlistment two years unless sooner discharged;
  State report describes federal three-year service, with May 28 muster in
  its return. The later federal register describes two- and three-year men.
  Both descriptions remain, with no reconciliation into one universal term.
  Maine AG1861 p.6, Appendix F pp.2-3; U.S. *Official Army Register*, Volunteer
  Force, I p.14.
- **Twelfth New York Volunteers:** State two years; initial federal three
  months; its own order explicitly names **August 13** expiration before
  reporting for the remainder of State service. No conversion into a generic
  90-day or 92-day contract. Phisterer III p.1873; OR III-I p.391.
- **Thirteenth New York Volunteers:** initial federal three months after
  May 14 muster, with State two-year obligation and continuation for its
  unexpired portion. Later companies and three-year men stay distinct.
  Phisterer III pp.1887-1888. This is not the printed Thirteenth Militia in GO13.

The Nineteenth, Twenty-first and Twenty-sixth New York also require separate
State/federal stages. The Nineteenth's source expressly calls its original
three-month federal muster an error; it does not provide the performed day in
that opening. May 17 acceptance is not relabelled muster. Phisterer II p.1264;
III pp.1970,2027; OR III-I p.391. The covering letter names individual orders
whose muster dates differ; Twelfth's August 13 endpoint is not copied to them.

Other consequential readings:

- **Credited dates:** Pennsylvania's Twenty-sixth was actually mustered May 25,
  credited from May 5; its Twenty-seventh May 30-31, also credited from May 5.
  Bates I pp.344,382. New York's Twenty-fourth, Twenty-seventh, Thirty-third
  and Thirty-ninth likewise distinguish performed muster from earlier credit.
  Phisterer III pp.2002,2039,2115,2188. The CSV keeps separate event types.
- **Selected Massachusetts individuals:** First Regiment original field/staff
  entries May 22, assistant surgeon May 25, surgeon May 30; Second's Gordon
  May 24; Ninth original officers June 11; Eleventh original officers June 13.
  These are individual entries under **Date of Muster**, not completed
  ten-company musters. Massachusetts AG, *Record* II pp.2,27,81,126.
- **Minnesota continuation:** May 7 receipt of the proposed three-year/war
  service, May 10 reorganization direction, and later remuster are distinct.
  Consenting original men were remustered for three years **to date from
  original enlistment**. The selected passage does not date the performed
  remuster. Minnesota I p.4. No fresh full term is invented at proposal receipt.
- **South Carolina:** Second's Company C mustered May 23 for twelve months
  from May 22; Company E kept the State balance; Company I was mustered for
  one year; Company K's one year ran from its **May 8 organization**. Salley II
  pp.62,118,227,252-253. Third's Company B mustered June 6 for **ten months and
  eight days**, after April 14 State enrollment for twelve months. II p.318.
  Thirty company openings were read across Second, Third and Fourth; a
  company's remainder is never assigned to every company.
- **Louisiana:** June 4,5,15 musters for Sixth, Seventh and Eighth are read in
  the AG report. May 26 receipt of permission to accept twelve-month corps is
  acceptance context, not an established original call receipt for those named
  regiments. Eighth's Kelly acceptance for the war is a separate instrument
  whose recipient receipt is unread. OR IV-I pp.749-751; I-LI.2 p.138.
  Walton retrospectively describes Washington Artillery's original war-term
  battalion muster, without dating it. OR I-LI.2 pp.572-573.

**Source differences remain visible.** Pennsylvania Twenty-fourth's narrative
says May 7; its company headings say May 1 (Bates I pp.218-225). Second South
Carolina Company B's narrative says May 23 while the roll inventory says
May 22 (Salley II pp.35-36); Fourth's Company B says June 7 while its inventory
lists June 6 (p.571). First Connecticut has Company E April 19, Company A
April 22, field/staff April 23; federal April 22-23 is an **organization**
summary (CT catalogue p.12,p.4,unnumbered opening before p.4; U.S. register I
p.303). Pennsylvania Fifteenth Companies F/G have genuinely blank printed
April days (Bates I pp.147-148), verified in scans and left blank.

## 3. Coverage and unfinished recovery

[Coverage](S142/coverage.csv) preserves all four priority armies' catalogue
memberships and S137's **49-regiment McDowell crosswalk**. Of those 49,
**48 have muster observations at some stated scope**; that includes partial
component readings, not 48 complete regimental muster censuses. Fourth Michigan
is now read directly at Robertson p.223. Twenty-seventh Pennsylvania's actual
dates are read at Bates p.382. **Second Wisconsin's performed muster remains
unrecovered**: the 1886 own-unit roster uses **Rank from** and **Enlisted**,
which do not establish it. Wisconsin roster I pp.345,347; its three-year term
is separately described in the AG1864 report p.26.

The remaining rows, including Johnston's and Beauregard's largely unpaired
regiments, identify missing receipt, performed-muster, contract, component or
identity links. Regular detachments require actual company/individual records;
unidentified pools cannot inherit a similarly numbered regiment's history.
Johnston himself records uncertainty about whether Virginia's transfer required
a further Confederate muster; this is no evidence of one common performed day
(OR I-II p.960). An issued call, State act, roster presence, organizing order,
departure or later aggregate is not used to fill a missing receipt or muster.

No assertion is made that unread records do not survive. Complete original
company/individual roll collation, exact answered-call receipts, the unresolved
GO13 identity, State-to-Confederate transfers, and all previously held source
questions remain **unfinished S142 recovery**. Inventory completeness and
passing checks do not close those requirements.

## Packet and verification

- [Named identities](S142/named-musters.csv): one row per frozen catalogue key,
  with receipt, muster and contract statuses, event/interval references,
  provisional disposition, source keys and specific remaining work.
- [Events](S142/events.csv), [receipts](S142/call-receipts.csv),
  [identity joins](S142/receipt-links.csv), [intervals](S142/intervals.csv),
  [State coverage](S142/state-coverage.csv).
- [Read passages and page locators](S142/source-reading.json),
  [provenance](S142/provenance.json), [input hashes](S142/inputs.json),
  [static scan checks](S142/image-inspections.json),
  [verification receipt](S142/verification.json).

July's catalogue was read **only with `git show 5c4a9d83`**, never its working
tree. S137/S140/S75/S76 evidence is reused with selected primary passages read
again; Dyer supplies **no adopted service date or term**. The packet retains
350 source keys and 344 distinct text hashes; combined extracts and the
excluded duplicate South Carolina scan locator are explicitly labelled, so
these are not 349 independent observations. Raw scans, research helpers and
retrieval/verification logs remain under ignored `runs/s142/` or their already
retained source locations. New scans were retrieved through HTTP; no browser,
Computer Use or desktop control was used. Firecrawl credits were unavailable;
no account change, purchase or repeated credit request was made.

The settled source/data inventory, runtime diagnostics and preservation check
preceded this note. Focused integrity audit: **10,864 checks passed**, zero
failures; all **2,368 starting tracked files preserved**. Boundary and the
existing **13 pack-rule tests** pass. The ordinary commit hook is mandatory;
its actual outcome is retained in `runs/s142/commit-hook.log` and
`commit-exit.json` and reported in the single CODEX status. No scenario,
package, battle or timing campaign was run. Formal whole-branch review and
signatures remain deferred under 0106/0107. Requested 5.6 worker models were
unavailable; no substitute or independent-review claim.

For the lead:

1. Assess the six paired identities at their exact call/offer and component
   scopes. Any eventual model interval starts at the model's own receipt.
2. Preserve the named State/federal contract stages, credited dates, explicit
   endpoints, component remainders and unresolved source differences.
3. Keep all 208 unpaired identities provisional, and route the listed original
   receipts/rolls and identity gaps as unfinished recovery. No new ruling,
   numerical profile or source-hold closure is proposed.

Other findings: none beyond these routed evidence gaps. S139/S141,
implementation, battle tuning, integration, release and pushing are outside
this brief. The sole authorized write outside this worktree is one final
fresh-read Python UTF-8 append to the lead's CODEX.md.

Findings outside my scope
