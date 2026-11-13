# Open questions for the owner

Answered on 2026-11-13 and moved to decisions 0002, 0004, 0005 and 0006: stack, first slice, living people, Rome's principal.

## Q1. Is there dice in people at all?

My recommendation: no. People's behaviour is fully caused by state (AWWV had no RNG at all, and players hate obedience rolls). Battles and weather get seeded noise. The risk is that a deterministic proxy can be "solved". The counter is the political fog of war: you never know their true state, only what they and others tell you.

## Q2. How much does the player see before committing?

There are two options:
- **Full telegraphing** ("Into the Breach for politics"): you see exactly how each proxy will respond.
- **Declared telegraphing**: you see what the proxy *says* they'll do. Candid people tell you the truth; others say "yes" and slow-walk.

I recommend declared telegraphing. The current kernel prototype already returns `declared` and `actual` responses.

## Q3. Who are the opponents?

Is the enemy leader simulated with the same machinery (their own proxies pushing back), or is the enemy a simpler pressure model? The same machinery is more honest and doubles the AI work. I recommend the same machinery with a cheaper "bot principal" brain, and AWWV's lesson is to wire it on day one, not leave it dark for months.

## Q4. Tick and turn

Is a variable-tempo turn (P14: tick = day, turn ends at the next decision point) acceptable, or do you want a fixed weekly turn like AWWV? I recommend variable tempo, because it is what makes Rome and Ukraine feel different on one engine.

## Q5. Multiplayer?

Is it ever intended? It changes how hidden information is stored, so I'd like to know before M1 freezes the claim model. I'm assuming single-player for now.

## Q6. The name

"Mandate" is a codename. It collides with an old Kickstarter space game ("The Mandate", 2015). It is fine for a repo and not for a product.

## Q7. How much of AWWV to port

Candidates:
- the event system (`src/sim/events/`);
- the save migration stack;
- the commander belief model (`commander/belief.ts`).

I recommend porting **ideas, not code**. AWWV's modules are entangled with OSIDs and Bosnian constants, and a clean reimplementation against the new kernel will be faster than untangling them.
