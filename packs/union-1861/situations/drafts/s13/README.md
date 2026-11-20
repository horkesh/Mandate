# S13 authoring drafts

Unsigned work for the August 1861–November 1862 window. The JSON files one directory above are never loaded by the production pack loader. `index.json` maps them to the catalogue, records the missing owners and holds unsupported alternatives. This first batch records the sourced papers; decision facets follow separately.

`strings.json`, `sources.json` and `topics.json` are draft overlays. They change no live string, source or register row. The four new topics are proposals for the gate reviewer, including the provisional classification of civilian coercion; their presence here accepts no placement.

Run `node --import tsx packs/union-1861/situations/drafts/s13/validate.ts`. It uses the existing schema, situation validator, policy validator and gate for each draft in isolation. Only unsigned, held-topic and wording-review findings are separated into review blockers. Every other error fails. The production gate still rejects unsigned gated content. No signature is supplied or generated.

The present causes read specifically identified receipt records in `State.knowledgeBySeat`, with earliest-date guards. No date alone fires a paper. The absent report producers are explicit 1B needs. These papers do not create armies, appointments, statutes, arrests, camp populations or policy owners. Retrospective evidence does not establish a contemporary report route or receipt date.

Read [sources-read.md](sources-read.md) for pages and limits, and the [lane hand-over](../../../../../notes/sprint-S13-situations.md) for validation and proposed rulings. None of these drafts is cleared for release or integration.
