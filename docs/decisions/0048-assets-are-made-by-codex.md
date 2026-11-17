# 0048: Assets are made by Codex, through one coordination file

Status: accepted (2026-11-14). The owner: commissioning "can be done by Codex. He made all the assets for my other games too", through one coordination file that Claude writes requests into and Codex reports in. Mirrors the owner's other projects (Far Postings' `CODEX.md`). Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amended by 0051 (no AI likenesses of real people until a lawyer clears it; game-resolution assets only; full provenance). Amended by 0089 (Codex also builds the desk prototype in `prototypes/desk/`).

## Decision

**Codex (OpenAI Codex) makes the game's art and non-speech audio** through `CODEX.md` at the repository root: append-only, one message per request, answer or status, numbered requests, each turn ending with whom it waits on. The owner prompts each side to read it.

- **The lead writes the requests**, each pointing to a brief in `docs/design/ASSETS.md` and naming the exact outputs and folder.
- **Codex writes only to `art/` and `CODEX.md`,** saves a recipe with every asset (prompt, references with their source URLs, requested and actual size, tool, SHA-256), and never commits.
- **The standing reviewer** (0047) checks each delivery against its brief's acceptance criteria, the licence rules (0014, 0033) and the sensitive-history rules for images (0046). The lead looks at the images, commits what passes, and replies in `CODEX.md`.
- **Real historical people** are depicted only from their cited public-domain photographs (the image-sources research note), never from an invented likeness, and never caricatured.
- **Cost:** Codex uses its built-in image tool on the owner's plan, with no API key, no credits bought and nothing signed up for; it stops at the plan's limit.
- **Disclosure:** Codex-made assets are AI-generated, so the Steam store page's AI-content disclosure covers them (`docs/research/2026-11-14-ai-players.md`, 0038, 0039).

**Ownership.** The lead owns presentation canon through records, and writes the requests from the briefs. No art-direction lane is opened: the briefs, the lead and the reviewer cover direction. Reopen the question if request volume outgrows the lead.

Rejected:
- **Paid human commissions as the default route.** Not ruled out, but they would be the owner's spending call under 0037, case by case.
- **A standing art-direction lane now.** With Codex executing and the reviewer checking, it would mostly relay messages.

## Consequences

- `docs/design/ASSETS.md`'s production route "commissioned" becomes "Codex via `CODEX.md`", and its briefs are written so a request can point to them directly.
- Committing large binaries is a question for `ASSETS.md` (Git LFS or keeping originals outside the repository), settled before the first delivery lands.
