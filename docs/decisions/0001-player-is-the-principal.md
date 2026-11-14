# 0001: The player is the principal: no unit control, in any mode

Status: superseded by 0016 (2026-11-14). Accepted 2026-11-13 as the owner's founding premise; 0016 keeps "the player never moves a division" and lets a verb name a place only as part of an order to a person.

## Context

The owner's founding brief: "You are not the general, you are the leader of your faction. You command through proxies, humans, who can and will push back." AWWV stated the same premise in canon (Game Bible §21.5) but kept manual brigade orders underneath (autonomy level 0). It had to force "president mode" at campaign start later, and the general-level game kept leaking back in through the tactical map.

## Decision

- The player never issues orders to units, forces or places. The player acts only through the leader's verbs: Appoint, Dismiss, Direct, Allocate, Summon, Oversee, Honour, Promise, Pressure, Address, Negotiate. Each verb targets a **person, post, bloc or patron**.
- There is no manual or "autonomy 0" mode, not even for debugging. Debug tools observe state; they do not command it.
- Assets (forces, money, materiel) are held by posts (proposal P1). The faction has no pool of assets that can be commanded directly.

## Consequences

- The theatre model is driven entirely by post-holders' behaviour, so it can stay coarse (P13).
- Delegation must be good when the player picks the right person, or the design fails. This is a design obligation, not a setting.
- Any feature request that amounts to "let me move that brigade myself" is rejected at the design stage.
