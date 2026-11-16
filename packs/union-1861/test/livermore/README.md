# Livermore's tables: the battle model's harness data

`livermore-1900.csv` holds the named set-ups that `../livermore.test.ts` runs through the kernel's battle-day resolver
with this pack's combat rules (lane 1.3; the combat note `docs/research/2026-11-14-combat-model.md`, finding 2 and its
calibration targets).

**Source.** Thomas L. Livermore, *Numbers and Losses in the Civil War in America, 1861–65* (1900), public domain;
source key LIV. The battle tables run pp. 77–140; the figures were read from the OCR text at
https://archive.org/details/numberslosses00liverich by the combat note's research lane (its section 2.1), and are
re-entered here from that table. The ODC-BY `acw-battle-data` CSV is a cross-check only and is not copied.

**Columns.**
- `union_engaged`, `union_kw`, `confederate_engaged`, `confederate_kw`: men engaged and killed plus wounded (Livermore's
  "hit"), as Livermore prints them. Missing and captured are not in these tables (Fox keeps them, and the model splits
  them by result).
- `approx`: the figure Livermore prints as approximate ("about"), named by column; the harness's bands do not rest on
  any one battle, so no range is invented for it.
- `type`, `attacker`, `terrain`, `union_commit`, `confederate_commit`, `surprised`: **the set-up, which is the model's,
  not a fact**: the battle type from the combat note's own classification, a terrain of this pack, and each side's dawn
  commit. Change them only with a reason in the commit message.

**What the harness asserts** (the combat note's targets 1–4, over the set-ups, never one battle): a side fully engaged
for a single open day loses 90–240 per 1000; open battles' absolute losses within 0.5–1.5 of each other in 70% of runs;
assaults on works costing the attacker 2–7 times the defender in 80% of runs, with the defender at 10–100 and the
attacker at 40–220 per 1000; open-battle averages of 100–160 (Union) and 120–200 (Confederate) per 1000; and at least
60% of set-ups within half to twice Livermore's figure for both sides.
