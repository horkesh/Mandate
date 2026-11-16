# 0077: Portraits of real people get a procedural engraving finish

Status: accepted (2026-11-16). Amends 0051. Decided by the owner on the lead's recommendation.

## Context

The owner asked whether Codex could rework the historical photographs in a painted or more game-like style, so as to avoid credits. The lead advised against it:
- **Credits cost little.** The Library of Congress and the National Archives ask for credit but do not require it (`docs/research/2026-11-14-portrait-and-image-sources.md`, section 4), and the plan is already one line per image on an about screen.
- **Restyling saves no work.** The real work is the item-level rights pass, and a restyle still needs it: an AI rework of a photograph that is not public domain is still a copy of it.
- **AI restyling adds risk.** It raises the likeness question 0051 parked for a lawyer, it needs an AI disclosure on every face in the cast, and it can drift a real man's features or invent insignia.

The research note already allows public-domain photographs to be "engrave-filtered freely". In 1861 the public saw these men as the wood engravings that *Harper's Weekly* and *Frank Leslie's* made from Brady's photographs.

## Decision

**Every portrait of a real person gets the same procedural engraving finish.**
- **The technique:** deterministic, non-machine-learned image processing, run by script. The photograph's tones are mapped to line hatching and stipple, in the manner of the period's wood engravings.
- **One set of parameters** serves the whole cast, recorded in each recipe, so the finish can be re-run from the master.
- **It changes rendering, never content.** It draws no face, hair, insignia or outline the photograph does not show. 0051's ban on machine-learned processing stands: no learned style transfer, no restoration, no upscaling.
- **The runtime styling stays.** The era skin's toning, vignette and paper border still apply on top, equally to every portrait.

**The fallback** is the plain processed photograph, with the era skin's toning and vignette.
- The portrait pilot (R5: McClellan and Stanton) renders both, and the owner picks one for the whole cast, so the set stays uniform.
- A sitter whose master is too dark or damaged to engrave well is reported. The owner then decides whether that sitter, or the whole set, falls back.

**Period engravings may be sources.** A public-domain engraving of the sitter printed in 1861–62 (*Harper's Weekly*, *Frank Leslie's*) may be used directly where a research lane finds one. This matters most for the men whose only photograph is post-war. Each one is cited and dated like a photograph, and the finish is not re-applied to it.

Rejected:
- **AI restyling of the photographs (oil painting or a game style).** It saves none of the rights work, raises the likeness question 0051 parked for a lawyer, needs an AI disclosure on every face, and can change a real man's face.
- **No finish beyond toning and vignette.** That remains the fallback, not the first choice: the owner wants a more stylised, uniform look, and the engraving is true to how the period saw these men.

## Consequences

- **`docs/design/ASSETS.md` section 6** gains the finish and the fallback, replacing "the engraving-like finish is dropped". **`CODEX.md`'s working rule** names the finish as allowed scripted processing.
- **The R5 pilot** delivers both versions, and stays blocked until the owner's Library of Congress rights pass records both items.
- **A later research lane** looks for period engravings of the cast's sitters, starting with the nine whose only photographs are post-war.
- **Credit lines** stay as planned, on the about screen.
