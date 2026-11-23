# 0113: A judgment nobody has evidence for adds no term to a response

Status: accepted (2026-11-23). From S89's diagnosis (`docs/research/2026-11-23-S89-governor-objections.md` and `docs/research/S89/` on `sprint/research-cast` at `84d723a8`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Clarifies 0020.

## Context

- **What setup does.** Under 0020, setup draws each person's hidden stats once, "in a range centred on the historical record". When a person's cast row has no evidence for a centre, the implementation draws around 500 with a spread of 200, on his own seeded stream.
- **What compliance does with the draw.** The compliance resolver then reads the drawn boldness, candour and standing as if they were evidence:
  - the temperament term is minus four tenths of the gap between the order's boldness (500) and the drawn boldness;
  - the drawn candour chooses an open objection over a covert delay;
  - the drawn standing discounts deterrence.
- **The result in S82's reference.** Three governors have every judgment unknown: Thomas O. Moore of Louisiana, Madison S. Perry of Florida and Edward Clark of Texas. All thirteen of their answers to Confederate calls are objections. In each, the only negative term is a temperament gap from a drawn number, and no levy follows.
- **The record says otherwise.** Moore reports orders complying with Walker's call on 15 March (OR IV-I pp.171–172). Perry tells Walker on 19 March that he will furnish the troops (p.176). Louisiana mustered ten volunteer regiments by 22 July (pp.747–751).
- **So the objections come from the draw, not from anything known about these men.** A term that comes from a draw and from no evidence breaks the rule that every number is explainable (`CLAUDE.md` hard rule 6). It also breaks the evidence rules of 0085 and 0087.

## Decision

1. **Unknown boldness adds no temperament term.** When a person's boldness has no evidence-backed centre, his response to an order has no temperament term.
2. **Unknown candour gives an open response.** When a person's candour has no evidence, negative willingness is declared openly: he objects, reserves or refuses as his willingness says, and his declared response is his actual one. A covert delay is a claim about character, and it needs an uncandid person on the evidence.
3. **Unknown standing gives no shield.** When a person's reputation has no evidence, deterrence applies without the standing discount.
4. **Values and regard are unchanged.** Unknown values already add nothing, and unknown regard is already zero.
5. **The draw itself stays, for everything else.** Hidden stats are still drawn for every person (0020), and the draw still governs battle, assessment and every other reader. Only the terms of a response to an order read whether the evidence exists.
   - That presence comes from the cast data in the World. It adds no State.
   - It applies to every person on both sides, with no exception by name.

Rejected:
- **Treating an unknown person as unwilling.** It turns a gap in the cast into resistance the record contradicts.
- **Treating an unknown person as average in every respect.** That invents a temperament just as the draw does.
- **Narrowing the unknown spread.** A smaller arbitrary number is still arbitrary.
- **Fitting the three governors' traits until they comply.** Traits come from sources, never from outcomes (0085).
- **Fixing only Moore, Perry and Clark.** The defect is general. Many other people's cast rows have unknown judgments; S83's pack validation counts 1,182 unknown-value warnings.

## Consequences

- **The build** carries the evidence mask from the cast data to the compliance reader, with paired tests: an unknown person versus the same person with sourced judgments, and a draw changed with nothing else.
- **Every reference changes.** Each hash and counter change is reported with its cause.
- **What to expect.** Unknown people should object, reserve and slow-walk less: Moore, Perry and Clark among the governors, and some of the Union governors behind S84's 16 reservations and 18 slow walks. The strength checkpoint and pushback coverage are measured again afterwards, and neither result is predicted here.
- **S89's six cast cells are applied with the build, with their provenance:**
  - Moore's `duty`, his `state_autonomy` and boldness `above`, from his message of 22 January (OR I-I pp.493–496);
  - Perry's `duty`, his `state_autonomy` and boldness `above`, from his message of 2 February (OR IV-I pp.85–88) and his order to occupy the forts (OR I-I p.444).

  Clark's judgments, every candour cell, and Moore's and Perry's `slavery_defence` stay held.
