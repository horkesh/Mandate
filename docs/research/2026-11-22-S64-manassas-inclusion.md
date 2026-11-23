# S64: July 1861 command inclusion

22 November 2026. Research and proposed model mappings [I], unsigned.
All page numbers are printed pages in *The War of the Rebellion*, series I,
volume II (1880). The source is the public-domain scan
[warofrebellion02secrrich](https://archive.org/details/warofrebellion02secrrich).
The reading and scan hashes are in [the reading receipt](s64-source-reading.json).
Scans stay outside the worktree in `C:/Pyrrhic/mandate-research-sources/S64/`.

The [42-row organisation register](2026-11-22-S64-command-inclusion.csv)
lists the commands, their subordinate organisations, dates, pages and model
matches. [The cohort crosswalk](s64-cohort-crosswalk.json) identifies the 24
blocks in S52's McDowell draft and the three existing local contingents whose
receiving command can be identified. A blank match means unrepresented or
unresolved, never zero historical men. These files are inclusion evidence,
not an authorisation to create duplicate armies.

## McDowell and Washington are different commands

The July 16 movement order sends Tyler, Hunter, Heintzelman and Miles forward.
Runyon commands the reserve, fortifications and camps, and guards the railways;
four named New York regiments must remain at their stations except in an
emergency (pp.303-305). The July 19 report again assigns much of the reserve
to guarding the railway (p.307). The five-division departmental duty return on
July 16-17 is therefore not an engaged field-army count (p.309). The roster
also distinguishes Runyon's reserve and Blenker's reserve at Centreville from
the battle proper; the Fourth Michigan is marked not engaged (pp.314-315).

The p.309 image gives the following officers-plus-men duty sums [I]. They are
observations, **not live strength assignments**:

| Command | Officers | Men | Combined [I] |
|---|---:|---:|---:|
| General staff | 19 | 0 | 19 |
| Tyler | 569 | 12,226 | 12,795 |
| Hunter | 121 | 2,364 | 2,485 |
| Heintzelman | 382 | 8,680 | 9,062 |
| Runyon | 247 | 5,201 | 5,448 |
| Miles | 289 | 5,884 | 6,173 |
| 21st New York Volunteers | 37 | 684 | 721 |
| 25th New York Militia | 39 | 519 | 558 |
| Company E, 2nd U.S. Cavalry | 4 | 56 | 60 |
| Department | 1,707 | 35,614 | 37,321 |

The table warns that omitted present cells in Tyler's Fourth Brigade make
the present/aggregate columns anomalous. Those columns must not replace the
duty sum (p.309). The division figures are not uniformly spaced regimental
strengths, and cannot be divided over nominal battalions.

Mansfield still acts from the separate Washington command on July 21. His
letter sends McCunn's four named regiments toward Fairfax Station, while a
later order retains his last two at Alexandria. The July 22 correspondence
recalls McCunn's regiments to their Washington camps (pp.751,754). This is
positive evidence against treating every Washington regiment as already
McDowell's field army. It is not a complete July Washington garrison return.

**Model limit [I].** There are no McDowell division blocks or named regiment
memberships in the state's generated call batches. The live pack also lacks
a separate Department of Washington post; `us_dc_militia` is its older
concentration stand-in. Neither a New York batch of 38 regiments nor the
whole Washington militia block is one of the source divisions. No 37,321,
division sum or residual is applied to them. Membership must be resolved at
the unit/cohort boundary before a complete field army can be represented.

## Patterson

The June 28 return has Cadwalader's First and Keim's Second Divisions and
14,344 present for duty, with the stated exceptions to its three-month troop
composition (p.187, image). This is a June return, not a July 21 count.

Patterson's July 8 circular names Thomas's First Brigade, Stone's Seventh
Brigade with Perkins's battery, Cadwalader's Division with Doubleday's
battery, and Keim's Division with Negley, Abercrombie and Wynkoop. It
temporarily attaches the 19th and 28th New York to Keim. The July 9 letter
reports Stone and those two New York regiments arrived, while Sandford's
Fifth and Twelfth New York are still expected (pp.161-162). An order to join
and an actual arrival remain different observations.

**Model limit [I].** `us_dept_pennsylvania` has no block that is this command
or either division. A generic Pennsylvania call batch does not identify its
included regiments, and a state name would also miss the named non-Pennsylvania
troops. The 14,344 return cannot be applied to a nonexistent army block or
added on top of existing state calls. This inclusion gap remains open.

## Beauregard

No.80 prints a July 21 organisation, from a return dated September 25, with
six infantry brigades under Bonham, Ewell, D. R. Jones, Longstreet, Cocke and
Early (p.469). Its continuation lists unbrigaded infantry, cavalry and
artillery (p.470). Evans's separate report identifies the Seventh Brigade's
battle combination: Fourth South Carolina, the First Special Louisiana
Battalion, Terry's cavalry squadron and Davidson's section of Latham's battery
(pp.558-559). These are overlapping administrative and battle combinations;
Fourth South Carolina cannot be counted both under Early and Evans.

The p.568 retrospective army return gives 21,863; its engaged subset gives
9,977. Those are overlapping measures, not two additions to the army. Neither
identifies the two model local battalions with the whole army or a whole
brigade.

The model's Garland and Preston contingents come from the May orders for
four- and seven-company battalions to Manassas (pp.824,826-827), and the local
garrison observation (pp.846-847). Beauregard's June 3 letter, reporting his
June 1 arrival and local command, gives the later superior command (pp.901-902).
**[I] The two surviving identities may therefore be transferred from
`st_va_potomac` to `cs_cmd_manassas`, through ordinary letters and joining
movement.** Their strengths stay unknown. They do not become full July
regiments, and their brigade-level membership is not asserted from surnames.

Charleston's aggregate harbour block and its fort detachments are not
Beauregard's July field army merely because he once commanded them. The
existing March blocks do not identify the particular later regiments in
No.80. No Charleston aggregate is transferred north as this army [I].

## Johnston and the other joining forces

The June 30 organisation has Jackson, Bartow, Bee and Elzey brigades, plus
unbrigaded cavalry and the Thirty-third Virginia (p.470). Its 10,654 duty
return includes infantry, cavalry, artillery and staff (p.187). Johnston's
report distinguishes his original Harpers Ferry force, subsequent additions,
the June evacuation and July movements (pp.470-473). **[I] The surviving
`state-forces.va_harpers_ferry` is a partial Virginia contingent under his
command, not the whole Army of the Shenandoah.** Its assignment can change to
`cs_cmd_harpers_ferry`; its unknown strength cannot become 10,654.

Johnston reports the infantry to use the Piedmont railway while cavalry and
artillery march. His July 20 arrival account names troops preceding or
accompanying him; remaining arrivals were expected. Militia under Carson and
Meem and sick men remained at Winchester (p.473; acknowledgement p.982).
Rhett's later July 21 engaged list has different combinations, including the
Sixth North Carolina, and expressly cannot furnish unit strengths (p.569).
No June roster is silently carried forward as a complete July arrival list.

Cooper's July 17 order asks Holmes for three regiments and a light battery,
with Ruggles retaining the district and militia replacing the withdrawn troops
(p.980). Holmes reports actually moving with the Second Tennessee, First
Arkansas and Walker's battery, later employing Scott's cavalry in pursuit
(pp.565-566). His text says “Wednesday, the 18th”; retain that weekday/date
conflict. It does not establish that the entire statewide Tennessee or
Arkansas service return joined at Manassas.

Hampton reports six hundred infantry reaching Manassas on July 21 after
thirty hours' detention in the cars from Richmond (p.566). That is the infantry
detachment, not the whole Legion. July 17-18 orders separate Hampton's infantry
by rail, cavalry marching and artillery awaiting transport, and also name
McRae's Fifth North Carolina and Barksdale's Mississippi regiment (pp.980-981).
An ordered reinforcement is not proof of arrival. These units have no exact
model identities to quantify here [I].

## Source limits and proposed application [I]

The candidate uses the three exact existing local-contingent identities only.
It keeps independent sending-post destinations after the later concentration
becomes available, and withholds unallocated statewide batches from the new
field commands. It creates no force, adds no historical total, changes no
enlistment and sets no arrival date. Unknown strength remains unknown.

Reject converting quotas into July returns, assigning an entire army total to
one local battalion, matching an Arkansas or Tennessee statewide return to
Holmes's two regiments, or allocating the Washington garrison to McDowell by
proximity. A complete unit-aware allocation is still required. This candidate
must not be treated as a historically complete July army implementation.

Remaining S64 work: the missing unit/cohort identity and force-allocation
boundary; a complete July Washington garrison return; brigade-level lineage
of the two May Manassas battalions. These are unmet, not waived.

Findings outside my scope: S62's projection repair; the lead's separate
institutional-office work after S62; whole-branch and gate review under 0106.
No item is signed.
