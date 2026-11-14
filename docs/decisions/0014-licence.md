# 0014: Source-available under the PolyForm Noncommercial licence

Status: accepted (2026-11-14). The owner made the repository public on GitHub (`horkesh/Mandate`) and chose this licence from three options the lead offered.

## Context

- The repository became public on 2026-11-14. Without a licence, public code is "all rights reserved" by default: readable, but nobody may use, copy or modify it.
- Mandate is meant to become a commercial game.
- Licences only loosen safely. Code released under a permissive licence stays under it forever for every version released that way, while a restrictive licence can be relaxed later.

## Decision

Mandate is licensed under the **PolyForm Noncommercial License 1.0.0** (`LICENSE.md`, the official text, plus the required notice "Copyright 2026 horkesh").

- Anyone may read, study, modify and share the code for noncommercial purposes: personal study, hobby projects, mods, research, and use by charities, schools and public bodies.
- Commercial use stays with the owner, who can grant separate commercial licences.

Rejected:
- **All rights reserved.** The most protective, but it gives readers no right to study or mod, which wastes the point of a public repository.
- **MIT, or another permissive open-source licence.** Anyone could sell a game built on the engine, and that grant could never be withdrawn for the versions released under it.

## Consequences

- `package.json` declares `"license": "PolyForm-Noncommercial-1.0.0"` (its SPDX identifier), and the README names the licence.
- Outside contributions would need a contributor agreement before they could be accepted, so the owner keeps the right to license commercially. There are no outside contributors yet.
- Third-party data and assets keep their own licences and must not be committed unless those licences allow it (see the Newberry and NHGIS notes in `packs/union-1861/README.md`).
- The owner may relax the licence later (for example to a permissive one) by superseding this record. Tightening it applies only to future versions.
