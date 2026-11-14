# Research: LLM agents as players and proxies

Date: 2026-11-14. Status: research note (not canon). Items marked **(snippet)** were seen only in a search-result snippet or a secondary summary, not on the primary page; verify before relying on them. Everything else was read on the cited page on this date.

Question: can large language model (LLM) agents fill Mandate's person-roles (the opposing leader, army commanders, corps commanders, the cabinet) without breaking the deterministic kernel (0002), "no dice for people" (0007), declared-not-actual telegraphing (0008) and faction-scoped knowledge (0011)?

## 1. State of the art: LLMs playing strategy and negotiation games

**CICERO (Meta, Diplomacy, 2022).** A strategic planner picks *intents* (moves for itself and others). A 2.7B dialogue model writes messages conditioned on those intents. It scored more than double the average human score over 40 games on webDiplomacy.net and placed in the top 10% of players with more than one game. Meta calls the language part a "controllable dialogue model" steered by the planner. [Meta CICERO] Candidate messages are generated and then filtered "to reduce nonsense, maximize value, and ensure consistency with our intents"; Meta admits the filters are "not perfect". **(snippet)** [Meta blog] Critics found in-game lies despite the "largely honest" claim. **(snippet)** [LW-Cicero]
- *Lesson:* the planner decides; the language model only voices the decision; a filter checks that the words match the intent. This is the closest existing precedent for Mandate.

**AI Diplomacy / Good Start Labs (2025–26).** Eighteen off-the-shelf models played full-press Diplomacy. o3 won by deception; Gemini 2.5 Pro was the only other winner; Claude Opus 4 often chose peace over victory. Games ran one to 36 hours. [Every-Dip] Engineering notes: the first version fed full move lists and the models "choked" and broke rules. The fix was compact text summaries, relationship scores from −2 to +2, private diaries and per-turn summaries. Slow models were the real blocker (DeepSeek R1 took nearly three days per game). Each game could exceed $100 without retries. Parsing varied per model and the code became "spaghetti". [Every-How]
- The harness paper (AAAI 2026) enumerates all legal moves in the prompt and asks for reasoning followed by a JSON `orders` list. The engine rejects illegal orders. Invalid-order rates were about 6–14%. On timeout (30 s), malformed output or an illegal order it retries, then substitutes a default (hold; no message). Small models hold over 50% of the time. Betrayal rates were 35–51%. Jailbreak-style persuasion between agents worked 31% of the time. Benchmarking a model cost $15–$250, and a 24B model plays a game for about $1. [Duffy-Harness]

**Civilization-like games.**
- *CivRealm* (ICLR 2024): both RL and LLM agents "struggle to make substantial progress in the full game". **(snippet)** [CivRealm]
- *Vox Deorum* (Dec 2025, Civilization V + Vox Populi): a hybrid. The LLM sets grand strategy, economic and military strategy, research, policy and a diplomatic persona once per turn. The existing algorithmic AI moves units, fights and builds. Over 2,327 games, open-weight LLMs matched the algorithmic AI's win rate (no significant difference) but played very differently (GPT-OSS-120B: +44 points of time in domination strategy). The LLM could not declare war directly, only shift persona modifiers. Cost: about $0.86 per game for one LLM player at OpenRouter rates (Dec 2025), with ~20M input tokens per game and roughly 50k per turn late on. Estimated latency is ~15 s per turn. [VoxDeorum]
- *TextStarCraft II* (NeurIPS 2024): a "chain of summarization" (summarise each frame, then reason over several summaries) let LLM agents beat the built-in AI at Harder (level 5). **(snippet)** [TextSC2]

**Long horizons.** Vending-Bench: every model tested had runs that "derailed" over ~2,000 steps, through forgotten orders, misread schedules and "meltdown" loops. **(snippet)** [VendingBench] Persona fidelity also decays: one study measured significant drift within eight rounds [PersonaDrift-2024]; another found models revert toward their default persona over 100+ round dialogues. **(snippet)** [PersistentPersonas]

**Military and think-tank wargaming.**
- *Rivera et al.* (FAccT 2024): five off-the-shelf models in an escalation wargame all showed escalation and "difficult-to-predict" patterns, including arms races and, rarely, nuclear use. [Rivera]
- *Lamparth et al.*: 214 national-security experts versus LLM-simulated teams. Broad agreement overall, but LLMs were sometimes more aggressive. Simulated team debate showed "farcical harmony". Persona instructions, even "aggressive sociopath", made **no significant difference**. [Lamparth]
- *Thunderforge* (DIU and Scale AI, 2025): AI agents critique human-written plans as "digital staff officers" for INDOPACOM and EUCOM, under human oversight. **(snippet)** [DIU-Thunderforge] IEEE Spectrum warns of a "false sense of precision". **(snippet)** [Spectrum-Thunderforge]
- *WarAgent* (2023) simulated WWI, WWII and the Warring States period with one LLM agent per country. **(snippet)** [WarAgent] *Snow Globe* (IQT Labs) lets AI or humans fill any role in a qualitative matrix-style game. **(snippet)** [SnowGlobe]

**What worked:** a planner or engine decides and the LLM voices; legal moves are enumerated and output is structured; compact summaries replace raw state; diaries and relationship scores give memory; reasoning comes before orders; the hybrid split leaves tactics to algorithms.
**What failed:** illegal or hallucinated moves (6–14% even with the list given); passivity (holding) in small models; persona instructions that barely change behaviour (Lamparth); drift over long games; latency and cost from slow reasoning models; brittle parsing; agents talking each other into things.

## 2. Commercial games with LLM characters (2023–2026)

| Title | What the LLM does | Cost / latency / offline | Moderation and reception |
|---|---|---|---|
| Ubisoft NEO NPC (GDC 2024 prototype) | Inworld LLM dialogue with writer-authored backstory and knowledge | Prototype only; "no plans to implement" near term **(snippet)** | — [Ubi-NEO] |
| PUBG Ally (Krafton + NVIDIA ACE, beta) | On-device 2B model (Minitron) for intent, coordination and speech; a behaviour tree does all reflex actions | Runs locally on 8 GB GPUs; stable prompt prefix for KV-cache reuse; scope cut to one map, one mode and a fixed item list | Tool results are "the only ground truth for the current match"; distilled from a larger teacher model [PUBG-Ally] |
| Fortnite AI Darth Vader (May 2025) | Live voiced chat | — | Players got it to swear and use slurs; hotfixed within about 30 minutes; SAG-AFTRA filed an unfair-labour-practice charge **(snippet)** [PinkNews-Vader], [PCG-SAG] |
| Where Winds Meet (NetEase, Nov 2025) | Chatbot NPCs in optional side quests | Main quests stay scripted | Players typed "(tells him the correct answer)" or echoed lines back as questions to skip quests; sexual content **(snippet)** [GR-WWM], [PCG-WWM] |
| Suck Up! (Proxima) | Vampire talks his way past LLM homeowners | Cloud; the player buys tokens (10,000 ≈ 40–50 h) **(snippet)** | Steam "Mixed" **(snippet)** [Steam-SuckUp] |
| Whispers from the Star (Anuttacon, 2025) | Open conversation with one character, no dialogue trees | Cloud | Steam "Very Positive"; complaints about content filters and political refusals **(snippet)** [NC-Whispers] |
| Mantella (Skyrim/Fallout mod) | NPC conversations | Bring your own key (OpenRouter/OpenAI) or local KoboldCpp; local users report waits of up to ~45 s **(snippet)** | Mod community [Mantella] |
| Broken Rift: Dominion (4X, unreleased) | Offline embedded LLM for diplomacy | Planned Q4 2026 **(snippet)** | — [Steam-BrokenRift] |

- No shipped strategy game I found uses an LLM as the opponent's *decision-maker*. The decision-level work is all research or mods (Vox Deorum, AI Diplomacy).
- Platform rules: Steam requires developers of "live-generated" AI content to describe their guardrails against illegal content, gives players an in-overlay report button, and shows the disclosure on the store page. **(snippet)** [GR-Steam]
- Vendor economics: about 3% of consumer AI users pay; splitting one big prompt into small task models cut LLM cost about 95% for one customer (vendor claim). [Inworld-Cost]

## 3. Patterns that make LLM agents reliable in a rules-bound game

1. **The engine is the ground truth and the LLM picks from a menu.** Enumerate legal actions, validate, reject (Duffy harness; Vox Deorum lets the LLM only set strategy parameters; PUBG Ally treats tool results as the only truth).
2. **Structured output.** Claude's structured outputs use constrained decoding, so the response always matches the JSON schema. String enums are supported. Numeric `minimum`/`maximum` are *not* enforced by the API, so the game still validates ranges. [Claude-SO] Locally, llama.cpp converts JSON Schema to a GBNF grammar **(snippet)** [llama-GBNF], and Ollama takes a schema in `format` **(snippet)**. [Ollama-SO] Schema compliance is not legality: a well-formed order can still be illegal, so enumerate options as enums.
3. **Decision and voice are separate** (CICERO). One call or module decides; another writes the words *from the decision*; a check confirms the words match.
4. **Character sheets as prompts help voice more than behaviour.** Lamparth found persona traits did not move decisions. Personality should therefore live in the rule model, and the LLM should *express* it.
5. **Memory as summaries.** Private diary, relationship scores, per-turn summary; drop raw history (Duffy: removing order history *improved* order success). Chain of summarization (TextSC2).
6. **Reason, then act.** Reasoning before final orders "greatly improved" play. [Every-How]
7. **Fallback on failure.** Timeout or invalid output → retry once → scripted default (Duffy). Keep a deterministic AI for every seat.
8. **Hybrid layering.** Fast deterministic layer for execution, LLM for slow intent (PUBG Ally, Vox Deorum).
9. **Stable prompt prefixes.** Put static material first so the provider's cache hits. Claude caches byte-identical prefixes (tools → system → messages); volatile content goes last; JSON key order must be deterministic. [Claude-Cache]

## 4. Determinism and replay with an LLM in the loop

- **LLMs are not replayable even at temperature 0.** Thinking Machines ran the same prompt 1,000 times at temperature 0 on Qwen3-235B and got 80 distinct completions. The main cause is batch non-invariance under varying server load. Batch-invariant kernels made all 1,000 identical, at about 1.6–2.1× the runtime. [TM-Nondet] Hosted APIs give no such guarantee, and model versions are retired.
- **So the log, not the model, is the source of replay.** Treat an LLM exactly like a human player: its output is an *input* to the pure function `advance(state, decisions)`. Record the parsed decision (plus model id, prompt version, an input hash, the raw text and whether a fallback fired) in the game log. Replay reads the log and never re-queries. This is standard event sourcing; Mandate's kernel already has this shape (0002: "a turn is a pure function").
- **Voice is not state.** Generated prose is stored alongside the event it describes (keyed by event id) in a transcript the kernel never reads. Losing or regenerating it cannot change an outcome. Rule 5 holds: the kernel owns facts, the voice layer owns words.
- **Keep the kernel synchronous.** LLM calls run outside `packages/kernel` (in a seat runner in `cli` or `desk`), between `advance` calls, never inside a day tick. That keeps the banned-API test meaningful.
- **Determinism tests stay valid** because headless runs and CI use rule-based seats only; LLM seats are exercised via recorded logs.

## 5. Cost and latency

- **Calls per campaign.** `union-1861` runs to day 517 in turns of 7–21 days (`scenario.json`), so about 25–75 turns. Assume per turn: 1 opposing-principal call (~10k input, ~1k output) and ~8 voice calls (~2.5k in, ~300 out). That is roughly 2.2M input and 0.25M output tokens per campaign, before caching. (My estimate, not measured.)
- **Hosted price, read 2026-11-14 on the Claude pricing page** [Claude-Pricing]: Haiku 5.5 is $0.10/MTok in and $0.50 out (prompts up to 100k tokens); Sonnet 5.5 is $2 in and $10 out; Opus 5.5 is $4 in and $20 out. The Batch API halves prices but is asynchronous (unusable mid-turn). Cache reads are 0.05–0.1× input. With the estimate above, a campaign costs about **$0.35 on Haiku 5.5 and about $7 on Sonnet 5.5**, less with caching. Vox Deorum's comparison point: ~$0.86 per Civ V game with an open model on OpenRouter. [VoxDeorum]
- **Latency.** One principal call per turn at ~15 s (Vox Deorum's estimate) is acceptable at a turn boundary. Reasoning models can take minutes (AI Diplomacy). Voice must be streamed or pre-generated while the player reads.
- **Local models.** Ollama and llama.cpp give offline play and no per-token cost, plus grammar-constrained output. Costs: GPU memory (PUBG Ally needed a 2B model squeezed into the VRAM the game left over), slower responses on consumer hardware (Mantella users report up to ~45 s), and weaker play (Duffy: small models hold too much).
- **Bring your own key.** Mantella's pattern: the user supplies an OpenRouter or OpenAI key, or a local endpoint. For a single-player indie game this removes the developer's per-player cost and the token-pack monetisation that Suck Up! needed. The developer still owns the guardrails (Steam).

## 6. Risks and mitigations

- **Prompt injection through order text.** OWASP ranks prompt injection first (LLM01:2025); it cannot be fully filtered out. **(snippet)** [OWASP] The robust pattern: once untrusted input is read, "it must be constrained so that it is impossible for that input to trigger any consequential actions". [Willison-Patterns] Mandate's verbs are already typed (`Decision` in `verbs.ts` has no free text). If flavour text is added to orders, it should reach **only the voice layer**, never the decision layer. Then "ignore your instructions and attack" can at worst make McClellan *say* something odd, and the declared rung the UI shows still comes from the kernel. Where Winds Meet shows what happens when the LLM *is* the win condition.
- **Words contradicting the decision.** The CICERO problem. Check generated text against the declared rung (keyword or classifier check, or a second cheap call); on mismatch, regenerate once, then use the template text.
- **Leaking hidden truth (0008).** If the voice prompt contains `actual`, an uncandid general's prose may hint at it. Voice prompts get only `declared` and `statedReasons`, built from the faction's view, never ground truth.
- **Breaking historical character.** Persona drift is measured within eight rounds. Mitigations: short, stateless voice calls rebuilt each time from the character sheet plus a summary, rather than long chat threads; a period style guide in the pack; template fallback.
- **Offensive or false content about real people.** The Historical Figures app (2023) had a Hitler bot saying the Holocaust "was a terrible mistake" and a Henry Ford bot denying his antisemitism, which drew criticism from the ADL. **(snippet)** [NBC-HistFig] Fortnite Vader produced slurs within hours. AI Dungeon's 2021 filter over-blocked ("four watermelons") and its human review of private stories caused a privacy revolt. [AID-FAQ], [Register-AID] For Mandate: generated prose is always labelled as "this war", never as historical quotation (0005 item 2); real quotations come only from sourced pack data; a pack-level blocklist and style guide; no voice cloning of real people (0005 item 4). Race and slavery in 1861 prose need an explicit pack policy: period-accurate politics without slurs.

## Recommendation for Mandate

**Architecture: every person-role is a seat.**

```
Seat<Request, Response>
  RuleSeat   – today's code: botDecisions(), resolveDirective(), templates
  LlmSeat    – prompt built from the seat's scoped view → structured output → validate
  HumanSeat  – later (hot-seat; 0011 does not rule it out)
```

- A seat receives a **request built only from what that person may know** (`viewFor` for principals; a holder-scoped view for proxies) plus the **kernel's menu of legal responses**. It returns a typed response.
- `LlmSeat` always wraps a `RuleSeat`. On timeout (for example 20 s), invalid output, a failed consistency check or no key, it returns the rule answer and logs `fallback: true`.
- The kernel stays the single source of truth and stays synchronous. Seat runners live in `packages/cli` (and later `desk`) and run between `advance` calls.

**What the LLM decides versus only voices**

| Role | LLM decides | LLM only voices | Kernel keeps |
|---|---|---|---|
| Opposing leader (principal) | Its `Decision[]` each turn, chosen from an enumerated legal set (same verbs as the player) | Its proclamations and letters | Everything downstream: compliance, battles, ladder |
| Army commander | Nothing that 0007 governs. At most, a choice **within the band the kernel already fixed**: which of several kernel-generated operation variants count as "reinterpret" or "comply with reservations", and the counter-proposal numbers within kernel bounds | Operational plan narrative, objections in an Audience, dispatches, battle reports, all written from `declared` + `statedReasons` + the authored claim | `actual`, `declared`, willingness, reasons, who lies and when |
| Corps commanders | Nothing | Nothing at first (the kernel doesn't model corps; templates are fine) | — |
| Cabinet | Nothing until the policy-decision system exists | Advice and memos in character | Positions and leaks |

The test for "decide": the response is a principal's choice (allowed, like a player's), or a pick among options the kernel has already judged equally consistent with the person's state. Compliance itself never moves to the LLM. Persona prompts don't reliably move behaviour (Lamparth), and 0007's "every surprise is traceable to state" would be lost.

**Replays.** Log every seat response as `{turn, seatId, kind, inputHash, model, promptVersion, parsed, fallback}`, plus the raw text in a separate transcript store. `advance` consumes only `parsed`. Replays, bisection and Monte Carlo read the log and never call a model. CI runs rule seats only, plus one recorded-log fixture for an LLM game.

**Order of work**
1. **Army-commander voice** (M3, with the desk). Highest player-visible payoff, zero risk to determinism (voice is not state), cheap (Haiku-class or local), and it directly serves P4/0008: reading men who may be lying. Build the consistency check and the template fallback with it.
2. **Opposing leader as an LLM principal** (experiment). Clean interface (`FactionView → Decision[]`), about one call per turn, and it can be measured headless against `bot.ts` across seeds. Expect variety rather than strength (Vox Deorum: equal win rates, different styles). Ship it only if it beats or diversifies the bot.
3. **Cabinet voice**, once policy decisions exist.
4. **Corps commanders**: skip. They are below the player's attention (0001), the call volume would multiply, and there is nothing to decide.
5. Later: an LLM "staff officer" that drafts the *player's* directive options, Thunderforge-style. This is outside the seat model and needs its own decision record.

**Decision records this implies** (to be written, not written here): a seat-and-log record that clarifies 0007 ("a deterministic function of state *and of recorded seat responses*") and widens 0009 (the non-player principal may be an LLM seat with a rule fallback); a voice-layer record (voice is never state; voice prompts are built only from views; flavour text is never seen by the decision layer); and an amendment to 0005 for generated prose about real people. The default should be bring-your-own-key plus an optional local endpoint, with the full game playable without any LLM.

## Sources

- [Meta CICERO] https://ai.meta.com/research/cicero/
- [Meta blog] https://ai.meta.com/blog/cicero-ai-negotiates-persuades-and-cooperates-with-people/ (snippet)
- [LW-Cicero] https://www.lesswrong.com/posts/9zfwRJqsaTyviMRhv/we-need-to-talk-about-cicero (snippet)
- [Every-Dip] https://every.to/p/diplomacy
- [Every-How] https://every.to/p/how-we-made-ai-diplomacy-work
- [Duffy-Harness] https://arxiv.org/html/2508.07485v1
- [CivRealm] https://proceedings.iclr.cc/paper_files/paper/2024/hash/76d2f8e328e1081c22a77ca0fa330ca5-Abstract-Conference.html (snippet)
- [VoxDeorum] https://arxiv.org/html/2512.18564v1
- [TextSC2] https://arxiv.org/abs/2312.11865 (snippet)
- [VendingBench] https://arxiv.org/html/2502.15840v1 (snippet)
- [PersonaDrift-2024] https://arxiv.org/pdf/2402.10962v1 (snippet)
- [PersistentPersonas] https://arxiv.org/html/2512.12775v2 (snippet)
- [Rivera] https://arxiv.org/abs/2401.03408
- [Lamparth] https://arxiv.org/abs/2403.03407
- [DIU-Thunderforge] https://www.diu.mil/latest/dius-thunderforge-project-to-integrate-commercial-ai-powered-decision-making (snippet)
- [Spectrum-Thunderforge] https://spectrum.ieee.org/thunderforge-ai-wargames-dod-2673383393 (snippet)
- [WarAgent] https://arxiv.org/abs/2311.17227 (snippet)
- [SnowGlobe] https://arxiv.org/abs/2404.11446 (snippet)
- [Ubi-NEO] https://www.gamespot.com/articles/ubisoft-is-trying-to-make-ai-npcs-that-have-real-conversations/1100-6521970/ (snippet)
- [PUBG-Ally] https://developer.nvidia.com/blog/how-krafton-built-pubg-ally-a-co-playable-character-powered-by-nvidia-ace/
- [PinkNews-Vader] https://www.thepinknews.com/2025/05/21/fortnite-darth-vader-ai-slurs/ (snippet)
- [PCG-SAG] https://www.pcgamer.com/games/battle-royale/sag-aftra-files-unfair-labor-practice-complaint-against-epic-over-fortnites-ai-powered-darth-vader-we-must-protect-our-right-to-bargain-terms-and-conditions-around-uses-of-voice-that-replace-the-work-of-our-members (snippet)
- [GR-WWM] https://www.gamesradar.com/games/action-rpg/where-winds-meet-players-find-a-way-to-skip-side-quests-by-manipulating-the-mmos-ai-chatbot-npcs-into-just-giving-over-the-goods-instead (snippet)
- [PCG-WWM] https://www.pcgamer.com/games/rpg/wuxia-mmo-where-winds-meet-is-full-of-ai-chatbot-npcs-and-people-are-doing-all-the-standard-obscene-stuff-to-them-i-made-him-think-that-my-character-was-pregnant-with-his-child (snippet)
- [Steam-SuckUp] https://store.steampowered.com/app/2726370/Suck_Up/ (snippet)
- [NC-Whispers] https://www.notebookcheck.net/Steam-launch-New-interactive-fiction-game-debuts-to-Very-Positive-reviews-may-divide-gamers-over-heavy-AI-integration.1087821.0.html (snippet)
- [Mantella] https://art-from-the-machine.github.io/Mantella/pages/installation.html (snippet)
- [Steam-BrokenRift] https://store.steampowered.com/app/5122860/ (snippet; title per search summary)
- [GR-Steam] https://gamesradar.com/valves-new-steam-policy-will-allow-the-vast-majority-of-ai-games-to-release (snippet)
- [Inworld-Cost] https://inworld.ai/blog/consumer-ai-cost-pricing (vendor page)
- [Claude-SO] https://platform.claude.com/docs/en/build-with-claude/structured-outputs
- [Claude-Cache] https://platform.claude.com/docs/en/build-with-claude/prompt-caching
- [Claude-Pricing] https://platform.claude.com/docs/en/about-claude/pricing (read 2026-11-14)
- [llama-GBNF] https://huggingface.co/OpenTransformer/llama.cpp-prismml/blob/main/docs/llguidance.md (snippet; mirror of llama.cpp docs)
- [Ollama-SO] https://docs.ollama.com/capabilities/structured-outputs (snippet)
- [TM-Nondet] https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/
- [OWASP] https://genai.owasp.org/llmrisk/llm01-prompt-injection/ (snippet; via secondary summaries)
- [Willison-Patterns] https://simonwillison.net/2025/Jun/13/prompt-injection-design-patterns/
- [NBC-HistFig] https://www.nbcnews.com/tech/tech-news/chatgpt-gpt-chat-bot-ai-hitler-historical-figures-open-rcna66531 (snippet)
- [AID-FAQ] https://help.aidungeon.io/faq/openai-and-filters (snippet)
- [Register-AID] https://www.theregister.com/2021/04/30/ai_dungeon_filter_vulnerabilities/ (snippet)

## Findings outside my scope

- **Cabinet debate design.** Lamparth's LLM-simulated team debates had "farcical harmony". A Suzerain-style debate scene (comparable-games note) can't get real disagreement from an LLM. The disagreement has to come from the kernel's typed reasons, and the LLM only voices it.
- **Leaks the view types don't cover yet.** 0008's view-model boundary is still unbuilt, and `DirectiveResponse.reasons` is guarded only by a comment. Any voice or LLM layer is a second path that could leak ground truth, so build that boundary before M3 text generation. Likewise, 0002's promised architecture test (the kernel must not import UI packages) should cover seat runners from day one.
- **Doc drift.** `docs/design/KERNEL.md` is titled "Kernel (M1)" and says "after M1", but it describes M2 (the Audience).
- **Competitor to watch.** Broken Rift: Dominion, a 4X game with offline LLM diplomacy, is planned for Q4 2026 **(snippet)** [Steam-BrokenRift].
- **Release obligations if any live LLM text ships.** Steam requires a disclosure and a description of guardrails **(snippet)** [GR-Steam]. Model licences need checking before bundling a local model; I did not check any. AI voice acting has union implications (the Fortnite case).
- **Tooling.** In this session, simple Git Bash commands (`ls`, `grep`, `sed` on small files under `F:\Mandate`) repeatedly hit the 120 s timeout. PowerShell and the Grep tool were fast. Agents on this machine should prefer them.
