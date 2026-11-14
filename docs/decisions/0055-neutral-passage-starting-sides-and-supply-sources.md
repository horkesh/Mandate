# 0055: Passage through neutral states, starting sides, and supply sources

Status: accepted (2026-11-14). From the standing reviewer's review of lane 0.3 (the Union 1861 data), which found that the data and lane 0.4's rules together cut Washington off from the North by land, put every traced region in a pocket on day one, and gave men their eventual side at the start. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0050 and 0054.

## Decision

**Neutral passage (amends 0054).** A region held by a government with no faction (0050) is passable to every side's movement and supply, as open water is, unless that government has closed it. Closing is a flag on the government, set by a situation (Kentucky's proclamation of neutrality in May 1861 is the model case), and reopened the same way. Passing through an open neutral region is not free of consequence: situations can fire from it, as the Pratt Street riot fires from troops routed through a hostile Baltimore (0046). In March 1861 Maryland, and with it the rail line to Washington, is open.

**Starting sides (amends 0050).** A person's side at a scenario start comes from the post he holds on the start date. With no post, it comes from his home state's government, and a man from a state whose government has no faction has no side. No one gets the side he took later: Lee and Stuart hold United States commissions on 5 March 1861 and start on the Union side, and situations or events move them.

**Supply sources and depots.** Every pack's scenario start names its supply sources and depots; without them every traced region is a pocket. In the Union pack:
- the Union's sources are the coarse northern regions and the off-map boxes that stand for the North's railways and industry, labelled as design parameters;
- the Confederacy's are its capital and the arsenals the seceded states had seized, labelled the same way;
- depots are added where the drafts or research notes source them (the Washington depots, the navy yards).
Each source and depot carries its sources or a design-parameter label.

Rejected:
- **Treating neutral regions as impassable.** It cut Washington off in March 1861, when trains ran through Baltimore.
- **Treating them as either side's.** That would make the border states' choice before their situations.
- **Starting sides by hindsight.** It leaks who will go South.
- **Leaving supply sources to the code.** Sources are setting data (hard rule 3).

## Consequences

- Lane 0.5 implements neutral passage and the closing flag in the passage rule, with tests, before lane 0.8's done check.
- Lane 0.3 recodes starting sides and adds sources and depots.
- The gate register's Pratt Street entry already fires from this cause.
