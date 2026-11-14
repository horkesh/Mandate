# 0005: Real historical and living people, under a sensitivity policy

Status: accepted (2026-11-13). Direction chosen by the owner; the policy details below are a proposed first draft. Amended by 0022 for AI-generated prose about real people.

## Context

Mandate's premise means real people are shown disagreeing with, deceiving or defying their leader. For the Union or Rome that is history. For Russia–Ukraine it concerns living people in an ongoing war. The owner chose real names over fictionalized analogues. AWWV's experience: sensitive-history gating is heavy, and it has to be designed in, not bolted on.

## Decision

Real names are used. Every real person's **starting** traits, values, relationships and posts must be sourced from the public record and cited in the pack. Proposed policy for people who are living, or who died recently:

1. **Sourced starting profile.** Each trait or value carries a citation. No trait is invented to make a person look bad.
2. **Emergent, not asserted.** In-game behaviour that departs from the record, such as a general defying the leader, is presented as the simulation's counterfactual, never as a claim about the real person. The Codex distinguishes the "historical record" from "this war".
3. **Bright lines (not modelled for living people):** personal crimes, private life, health, family. Coups or armed defiance by a living person are not authored as scripted events. They can arise only from the general mechanism, and the text describes them in neutral, counterfactual terms.
4. **No likeness generation.** No AI-generated photos, portraits or voices of living people. Use stylized or iconographic representation.
5. **Pack-level flag.** A pack declares `contemporary: true`, which turns on these checks in the pack validator.

## Consequences

- A pack validator rule set for `contemporary` packs (to be built with the first such pack).
- Item 3 needs owner review before any modern pack ships.
