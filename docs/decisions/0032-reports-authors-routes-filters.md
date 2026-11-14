# 0032: A report has an author, a route and filters; the telegraph office is a seat

Status: accepted (2026-11-14). From the information-flows lane (`docs/research/2026-11-14-union-information-flows.md`), which found that not every report reached Lincoln through the commander, and that the War Department filtered the wire. Recommended by the lead; the owner takes recommendations by default. Refines 0008, 0015 and FOUNDATION sections 5 and 8. Amended by 0040 (first-month walkthrough revisions) and 0046 (security orders go through a holder or a situation option, never a free-standing verb).

## Context

- FOUNDATION said reports "go back through the commander". The lane found that Lincoln also read raw telegrams in the War Department's telegraph office, wired governors and railroad men directly, got naval news through the Navy Department, and learned of some battles first from reporters.
- Stanton and the telegraph office's managers held or trimmed wires; early in 1862 Stanton barred even Lincoln from front telegrams.
- Strength figures were biased by structure, not only by intent: "present and absent" ran far above "present for duty", and commanders quoted smaller "effective" figures when they wanted men.
- The enemy read Washington's newspapers and ran agents, so leaks had a military cost.

## Decision

**A report is typed data**, never free text: its author (a person, a post, a newspaper, an observer), its subject (a force, a region, a battle, the enemy), its claims (typed values with the author's confidence), its stamp (day, and hour on battle days), its route, the filters it passed, and its bias terms (the author's and each filter's), all explainable (hard rule 6).

**Report types** (each a pack-tunable template):
- wire dispatch: fast, optimistic and vague, often silent on losses; none when the army is off the wire;
- strength return: on a fixed cycle, with present-for-duty and present-and-absent figures;
- a commander's quoted "effective" strength: shaded by what he wants;
- casualty return: the first figure runs low;
- enemy estimate: its bias depends on the intelligence service behind it;
- press report: fast, partial, sometimes first;
- informal source: governors, congressmen, railroad men;
- observer's letter: biased toward whoever sent him (0020);
- retrospective statement: compiled months later, used by the reckoning.

**Routes.** A report travels by wire, courier, rail, mail or ship, with the kernel computing its delay (0026). Not every report goes through the commander: governors, the Navy Department, the press, observers and informal sources reach the president by their own routes. An army can be off the wire for weeks.

**Filters.** The War Department's telegraph office is a post whose holders (the Secretary of War and the office's managers) can hold, trim or delay wires, by their own compliance and values. Editors and censors filter press reports. The president can go around a filter (reading the raw wires himself, at an attention cost, 0025) and can issue or lift security orders such as press and mail bans, as can his commanders.

**Symmetry.** The enemy's knowledge is built the same way (0009): newspapers, agents and leaks give him reports about the Union, so a leak can cost the Union militarily.

Rejected: reports only through commanders (it misses the press, the governors, the navy and the telegraph office, and makes one man the player's only window); free-text reports (unexplainable, and AI voice must stay out of state, 0022); a neutral telegraph (the filtering is historical and a lever).

## Consequences

- Phase 0 lane 0.6 builds knowledge per seat on this report model; the report types' templates come with it.
- The Secretary of War gains a filtering role, which makes that appointment a real lever.
- The reckoning compares players' reports with retrospective statements and the truth.
