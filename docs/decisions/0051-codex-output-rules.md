# 0051: Rules for Codex output: no AI likenesses of real people, game-resolution assets only, and full provenance

Status: accepted (2026-11-14). From the research note on Codex's terms (`docs/research/2026-11-14-codex-output-terms.md`) and the note on image sources (`docs/research/2026-11-14-portrait-and-image-sources.md`), both under review. Decided by the lead under the working style in `CLAUDE.md`; the owner can overturn it. Amends 0048. Amended by 0077 (a procedural, non-machine-learned engraving finish is allowed processing for real people's portraits).

## Context

- OpenAI's terms give the user ownership of output, with no non-commercial limit on images. But whether purely prompted images are copyrightable is uncertain, and the repository is public.
- OpenAI's service terms bar reproducing a person's likeness without consent "and all necessary rights". That can't be had for people dead since the 1800s, so whether a public-domain photograph may be used as a reference is a question for a lawyer.
- Steam allows pre-generated AI content with disclosure, and the terms changed on 2026-11-13, with new usage policies taking effect on 2026-11-20.
- The research notes found public-domain portraits for most of the first year's cast, mainly in the Library of Congress's Brady-Handy collection and the National Archives.

## Decision

**Real people (amends 0048).** Until a lawyer answers, no portrait of a real person is generated or edited with an AI image tool. Each portrait is the public-domain photograph itself, cropped and toned with ordinary image processing, which Codex may do by script. A person with no usable photograph shows "no likeness on file" or a silhouette, never an invented face. Generated officers, who are fictional, may use the image tool, and the reviewer checks them against real portraits for look-alikes.

**What enters the repository.** Only accepted assets at game resolution, stored with Git LFS once the owner confirms the allowance. Originals, rejected variants and raw scans stay outside, recorded by URL and SHA-256 in each recipe.

**Provenance.** Every recipe adds the plan, client, model, date and human edits to 0048's fields. Provenance marks embedded by the tool (C2PA, SynthID) are never stripped.

**Tools.** Codex uses its built-in image tool interactively, not driven by scripts, until the lawyer says scripted use is allowed. Image processing of public-domain photographs by script is not generation and is allowed.

**Terms.** The lead re-reads OpenAI's terms and Steam's AI rules before Codex's first delivery and again before submission to Steam. The store page's AI disclosure is drafted in the repository first.

**Open, for the owner:** which plan Codex runs on (it decides the training-data and indemnity terms), and one short lawyer consultation (the owner's spending call, 0037) on likeness references, scripted use, and what the PolyForm licence does for files with no copyright.

Rejected:
- **AI-finished portraits of real people now.** The "uniform finish" the asset briefs first proposed waits for the lawyer.
- **Age-adjusting post-war photographs.** That is AI editing of a likeness.
- **Production-resolution originals in the public repository.** They add size and copying risk for no play value.

## Consequences

- `CODEX.md`'s working rules and `docs/design/ASSETS.md` change to match.
- The portrait pilot (asset request R5) becomes photograph processing, not generation.
