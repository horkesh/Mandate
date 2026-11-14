# By Order of the President

A strategy game in which you are not the general. You lead a faction at war, and every army, department and ministry is held by someone else: people with their own ambitions, who report what suits them and who can and will push back.

The first game is the American Civil War, 1861–65: you play Lincoln, the Union first. The engine underneath, codenamed Mandate (hence the repository's name), is built for wars with fronts, with each setting as a pack. The design was reworked on 2026-11-14; Phase 0 (the new kernel's foundation and the Union 1861 world) is next.

## Start here

- [docs/VISION.md](docs/VISION.md): the pitch and pillars
- [docs/design/FOUNDATION.md](docs/design/FOUNDATION.md): the integrated design and the kernel's architecture
- [docs/decisions/](docs/decisions/): settled decisions
- [docs/design/PROPOSALS.md](docs/design/PROPOSALS.md): the original mechanism proposals, with their status
- [docs/OPEN_QUESTIONS.md](docs/OPEN_QUESTIONS.md): what still needs the owner
- [docs/ROADMAP.md](docs/ROADMAP.md): phases

## Develop

```bash
npm install
git config core.hooksPath .githooks
npm run check
npm run demo
```

Node 22 LTS.

## Licence

Source-available under the [PolyForm Noncommercial License 1.0.0](LICENSE.md): you may read, study, modify and share the game and its engine for noncommercial purposes, such as personal study, hobby projects, mods and research. Commercial use needs a separate licence from the owner. See [decision 0014](docs/decisions/0014-licence.md).
