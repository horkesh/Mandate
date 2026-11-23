# S101: proposed mapping of each call's own terms

Research draft, 23 November 2026. **No pack or code change.** Historical
statements refer to the read printed pages in [source-reading.json](source-reading.json).
All proposed mappings below and in [value-mapping.csv](value-mapping.csv) are
inferences **[I]**. They describe the call, never a governor's starting character.

## The join

[call-register.csv](call-register.csv) has 98 entries: the 49 S84 Confederate
rows, 24 Union principal-doctrine rows (including three central Regular Army
raising rows), 24 April militia quotas, and the separate Minnesota renewal
credit. The two April situation options repeat the same 24 calls; enumerate
them once. The hypothetical `larger_longer` option is not another historical
call. Twenty term profiles in [call-terms.json](call-terms.json) cover these
entries and the national May 3 proclamation. This grouping shares text, not
governor responses. Each expanded entry retains its destination, model quantity,
historical conditions and source limits.

The pack catalogue also contains laws, appropriations and transfers. They are
not additional governor levies. February 28 and March 6 provide the expressly
incorporated Confederate legal bases (OR IV-I pp.117,126-127); May 8 changes the
war-volunteer organisation (p.302). None is an automatic numerical call.
March appropriations, July federal ceilings and the VA/NC/TN/AR transfer entries
are not counted again. Their presence/classification is pack metadata, not a
claim to have re-read each transfer's historical originals in S101.

July 22 authorises up to 500,000 volunteers, six months to three years and
disbandment at war's end; Governors commission volunteer field, staff and company
officers, with Presidential acceptance/commissioning where State authorities
refuse or omit. It prescribes ten-company infantry, higher formation and officer
rules; mounted men generally furnish horses/tack, with an exception allowing
federal provision; clothing and travel allowances and benefits are specified
(OR III-I pp.380-383). July 25 authorises up to 500,000, war duration, arms as
President directs and the July 22 organisation (p.383). July 31 permits acceptance
without a previous proclamation (p.372). These are legal context, not proof any
particular State furnished 500,000 or that every letter repeats all conditions.
July 29's Regular establishment specifies three-year enlistments in 1861/62,
five years thereafter, and recruitment by detailed officers; it is not another
governor levy or evidence that GO16 itself stated three years (pp.372-374).

## Values

Use only the 16 IDs in the pinned July vocabulary. The proposal uses
`union`, `order`, `state_autonomy` and `caution`; it does not add Confederate
nationalism as a new value or reinterpret `union` as loyalty to either side.
Empty arrays are deliberate, not missing defaults. `duty`, `glory`, `career`,
`reputation`, `native_state` and the other values are not automatic properties
of an official troop call. No call here supplies an abolition policy. No
cost-only slavery value is added or rewarded. Existing evidence/gate rules hold.

| Profile | Honours [I] | Offends [I] | Own-text basis and limit |
| --- | --- | --- | --- |
| CS-M09 | state_autonomy | none | Incorporated February 28 act requires State consent and retains unit officers; March letter specifies provisional service, not Union preservation (IV-I pp.117,134-135). |
| CS-A08, CS-A16 | state_autonomy | union | Explicit resistance to Washington's coercion/hostile purpose; incorporated State unit-appointment rules. This is a sovereignty interpretation, not a governor-tailored reward (pp.126-127,211,221-222). |
| CS-A22 | none | none | Minimal direct telegram terms do not state the same political argument as the longer Kentucky letter. Preserve incorporated appointment rules structurally; do not invent universal duty/glory (pp.231-233). |
| CS-A22-N | state_autonomy | union | Kentucky letter, adapted to AR/NC/TN, explicitly rejects US coercion and preserves State-law unit appointments; it does not establish each governor's legal power to send troops (pp.231-232). |
| CS-J29 | order | none | Explicit protection of Mississippi Valley; appointments and arms not specified by this letter (p.411). |
| CS-J30-R | caution, order | state_autonomy | Precaution/public safety and Presidential organisation/field appointments explicitly in reserve text (p.412). |
| CS-J30-C | caution, order | none | Supplement completes precautionary corps; cavalry paragraph has no independent field-appointment provision. Do not copy every infantry condition to cavalry (p.412). |
| CS-J01 | state_autonomy | none | Own choice of regimental officers is explicit, except Presidential staff. No brigade-breaking instruction in this letter (p.416). |
| US-A15 | union, order | state_autonomy | Express Union integrity/enforcement and probable armed repossession of seized property; offence is the overriding national objective, not an assertion the letter removed State officer selection (III-I pp.67-69). |
| US-M03, US-M15 | union, order | state_autonomy | Explicit preservation/enforcement/suppression in proclamation and enclosed GO15. Preserve State field appointments too (pp.145-146,151-154,203-204). |
| US-M15-KNM | union, order | state_autonomy | MN/KS/NE one-regiment letter expressly refers to GO15 already forwarded; it does not repeat the Massachusetts circular's discharge-excess instruction (p.204). |
| US-M15-RI, US-M15-NY | none | none | RI's particular term offer and NY's fourteen-regiment send/hold clarification have separate profiles; no national political rhetoric or Massachusetts circular conditions are imported into their own texts (pp.204,207-208). |
| US-NY2, US-M04-REG, US-NY25, US-NY30 | none | none | Minimal accepted-tender/organisation/acceptance texts supply administrative terms; don't borrow adjacent political rhetoric to manufacture rewards (pp.151,154-157,369-371). |
| US-IN11 | union, order | state_autonomy | Original June 11 letter and Lincoln instruction recovered: GO15 expressly incorporated; two named colonels' regiments and four governor-designated regiments, all to report to McClellan after muster (pp.263,265). |

These are conservative candidate arrays, not a prediction of a response. The
April Union `state_autonomy` offence is an explicit interpretive proposal about
national repossession against State claims, not an established adjudication of
constitutional legality. Reject treating any governor's contrary description as
the President's professed purpose. The restraint on peaceful citizens/property
in the April proclamation remains part of that paper; it neither makes the call
pacifist nor supplies an unprinted slavery policy (III-I p.68).

July 12's specific demand to Brown does ask him to send the brigade's two
regiments without standing on brigade organisation (IV-I p.466). **[I]** That
separate demand can offend `state_autonomy`; it cannot be backdated into July 1
merely because Brown suspected that intent on July 8 (pp.424,477-478).

## Material demand and sourced means

The call's resource obligation comes from issuer text, while available means
come from dated State returns or received reports. [governor-qualifications.csv](governor-qualifications.csv)
keeps those separate. A governor reply can source his stated means/condition;
it cannot create an arms obligation absent from the call. Reported means are
not omniscient true inventory.

| State | Read evidence about means or access | What it can support; what is still needed |
| --- | --- | --- |
| Alabama | July 4 Moore says unarmed reserve and armed cavalry possible; extra infantry arms limited, home defence endangered (IV-I p.420). | Dated shortage claim. Printed telegram says both cannot arm more than one and lacks arms to arm one: preserve tension, no precise stock. Need serviceable arms by type, existing commitments, equipment and funds. |
| Georgia | April 23 Brown requests muskets and lists intended accouterments/transport bills (p.234); July 6 limited funds, quartermaster occupied, arms nearly committed, 500 Sharps loan and State cavalry arming (pp.421-422); July 8 equipment conditional (p.424). | Separate arms/equipment/support constraints at those dates, not March stocks. Need issued/remaining counts, compatible ammunition, receipts of promised supplies, camp capacity and bills paid. |
| Louisiana | April 23 cannot maintain ready camps (p.235); July 6 arming two regiments plus reserve would leave none for home; July 7 refuses State-financed camps (pp.422-423). July 12 Booth at Baton Rouge reports 680 muskets/20 Hall carbines/20 Colt rifles on hand (p.466). | Governor's reported burden and one location's inventory, not a State total or proof every arm serviceable. Need depot reconciliation, commitments, actual finance and federal camp arrangements. |
| South Carolina | Pickens July 5 reports Second/Sixth each about 1,000, fully armed/equipped, but consent to war extension uncertain (pp.420-421). | Existing units proposed for substitution, not spare arms for two new regiments. Need acceptance/consent and lot identities; do not count same men/guns twice. |
| Maryland | Hicks April 20 reports armories/ammunition and organised forces controlled by opponents (I-II p.581). | Access constraint and governor's received picture, not a statewide weapons census or zero private arms. Need accessible government stores and lawful organisation. |
| Massachusetts | Andrew April 18 reports arsenal emptied/other corps stripped, interior companies retain muskets; asks Springfield arms (III-I p.85). | Location/commitment distinction. Need new requisition quantity, serviceable stocks and receipt, not average State capability. |
| Pennsylvania | Curtin April 17 reports arriving men unarmed, many arms unfit, no ammunition; endorsement says arms ordered (p.82). | Shortage and promise, not delivery. Need fit arms/ammunition and actual receipt. |
| Wisconsin | Randall May 2 reports 3,000 muskets assigned at Springfield IL but no accouterments; seven regiments enrolled without drill arms (p.145); Cameron May 15 promises arms on muster (p.208). | Assignment, access, equipment and receipt differ. No three-month-call supply term inferred from reply. |
| New York | May 3 tender expressly State-armed/equipped, federal depot pay/support (p.151); Morgan June 22 says remaining schedule might fail for lack of arms (p.290). | Tender obligation plus later reported shortfall; no opening stock. Need State/federal stocks, issues and production/purchase receipts. |
| Indiana | Morton June 11 reports four regiments nearly field-ready and separate one-year State forces; June 22 reports four equipped/armed and future contracts for six (pp.265,290). | Existing equipment and promised contracts are not available spare supply. Original June 11 call now read; it adds no exclusive State equipment duty. Need delivery and stock balance. |
| Vermont | Fairbanks May 2 reports first regiment armed/equipped and State raising appropriation (p.145). | One unit and authority/funds, not general equipable capacity. Need commitments, actual expenditure and supply receipts. |

Connecticut's April 17 reply places arsenal/arms at Hartford and proposes that
as muster point (III-I p.82); it supports a location/transport question, not a
complete arms balance. Tennessee's defective organisation/lack of legal
out-of-State authority (IV-I p.233) and Virginia's appointment protest
(pp.419-420) are institutional constraints, not numeric gun shortages.
The read pages give no complete dated State material balance for any State.
Florida, Mississippi, Texas, Arkansas, North Carolina, Kentucky and the remaining
Union quota States have issuer demands but no usable State-wide arms/equipment/
transport capacity estimate in this packet. Unknown remains unknown. Governor
dispatches are evidence of claims, not independent certification.

**[I] Capacity proposal.** For a future implementation, name each material
requirement with unit, quantity, needed place and time, payer/provider, whether
absolute or qualified, and source page. Separately name usable means, location,
commitments, report author/as-of date/receipt and uncertainty. Arms must be
serviceable/compatible, equipment/horses distinct, transport must have usable
capacity and finance must have accessible funds. A named allocation is not a
receipt, a contract not completed delivery, and State population not arms.
Home-defence retention needs sourced commitments/authority, not an arbitrary
designer percentage. Support promises and reimbursement do not create stocks.

If the owner later chooses a scalar prototype, a shared demand reference can
normalise `required` and `available` to the existing 0..1000 scale; alternatively
`required=1000` with available as the minimum capped fraction of the **known,
actually required** material dimensions is an explicit bottleneck approximation.
Round with integer arithmetic and retain each component's reason and source.
No conversion or weight is calibrated here. Missing dimensions or conflicting
counts cannot become a fabricated average or zero. A call admitting unarmed
reserve companies has no arms admission deficit; the armed cavalry supplement
and July extra regiments do. April 16's near-equipment practicability clause
must survive. Legal authority is not another resource fraction.

## Existing grammar and its limits

Pinned inputs and hashes: [grammar-inputs.json](grammar-inputs.json). They were
read from `C:/Pyrrhic/sprint-july` only; S100 may change that branch while it runs.
The preserved local snapshots in `runs/s101/inputs/` fix this proposal's reading.
The following are code observations, not historical facts:

| Clause | Existing carrier | Limit / proposed use [I] |
| --- | --- | --- |
| Quota, arm, fixed term, war term | Call `regiments`, `men`, `arm`, `termDays`; message `orderCall`; callId | Fixed years/months already use model day conversion; war is null. Three years **or war** needs both maximum and war-ending condition; the present 1095-only approximation is not the whole contract. No restart of existing terms. |
| Readiness versus activation | `readiness`, ordinary receipt, no levy on readiness | Preserve no-pay-before-muster and separate activated quantity. No new date-caused execution or duplicate readiness/active levy. |
| Own values | `DirectiveTerms.honours/offends` | Recruitment currently has only one pack-wide `callTerms`; callId does not itself select per-call terms. A future bounded per-call profile must travel with the paper and be read by relays/addressee. Empty profile must not fall back to Union/duty. |
| Material requirement/means | `DirectiveTerms.required`, `CommandContext.available`, typed `capacity`/`lacks_resources` | Existing recruitment forces required0 and passes only oversight; reading defaults available1000. A future call must supply both terms from its own demand/dated means; changing only required cannot make a shortage against default1000. |
| Federal support | Directive `support`, means `supportPromised`, response `if_supported` | General hook exists; call body/profile does not currently carry/enforce these material promises. Promise is not delivery. |
| Officer election, appointment, State consent, preserve brigade/regiment, muster locality, camps, supplier/payer, contracted scope | No equivalent structured call clause | Values can reflect a loss of control but cannot execute or record the precise negotiated clause. Generic `when_reinforced` is not consent or a surgeon guarantee. Need bounded representation before claiming exact qualifications covered. |
| Existing unit transfer/substitution | Ordinary transfer; renewal/lot identity for term changes | Preserve existing men, arms, expiry and owner. New levy must not duplicate a credited regiment; permanent-destination consent and integrity are still missing terms. |

`compliance.ts` computes `shortfall=max(0,required-available)`, contributes a
negative capacity term and a `lacks_resources` reason. A shortfall may generate
`when_reinforced`; missing support may generate `if_supported`.
`tick/recruitment.ts` selects raised share/delay from actual rung and creates
levies. It does not implement each written qualification merely because a rung
is called `comply_with_reservations`. Neither generic values nor one scalar
proves historical organisation, consent or delivery occurred.

**[I] Recommended ruling:** accept the sourced term/reply separation and bounded
per-call profile proposal for later implementation. Keep means and institutional
authority separate; hold unknowns; retain 0112 classifications and all unmet
criteria. Reject uniform Union/duty rewards, governor-specific call profiles,
outcome-fitted weights or boldness, retroactive terms, unarmed-reserve arms
penalties, a value-only claim to close exact contractual gaps, and automatic
coverage credit from this research. No new reference/coverage/1A verdict is made.

## Findings outside my scope

Recovery of unread original call/appointment/acceptance papers, complete State
stocks and transport/funding returns, reconciliation of Moore's printed arms
statements and Corinth/Memphis wording, per-call/conditional-contract design and
implementation, S100 and the queued S99 build, pack application, measurement,
whole-branch/gate review and signatures, integration, main, release and pushing.
