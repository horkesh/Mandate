# 0035: The stack, and a map-rendering tripwire

Status: accepted (2026-11-14). The owner asked to be preemptive about tools this time (AWWV found MapLibre only after a month, and rebuilt its map four times). From the tooling survey (`docs/research/2026-11-14-tooling-survey.md`), which read every version and licence from the tools' own pages on 2026-11-14. Recommended by the lead; the owner takes recommendations by default. Confirms 0013's renderer. Amended by 0043 (the tripwire's result: PixiJS stands; lazy bake; authored label hints).

## Decision

**Map rendering: PixiJS 8** (0013 stands). The survey found no evidence against it. MapLibre's GeoJSON is tiled internally, and washes, hatching and rough strokes sit outside its style specification; its one real advantage is label placement.
- Static layers are baked to textures **in tiles**, because texture limits of 16,384 pixels are not universal (notably on Linux).
- Hand-drawn strokes come from our own seeded noise, not Rough.js (no release since 2024).
- **Tripwire:** a spike on the first 40 regions measures bake time and memory, draws one curved, letter-spaced region name, and tests hit-testing. If labels would cost more than about a week, reopen MapLibre for camera and labels only.

**The rest of the stack** (versions are those current on 2026-11-14; lanes upgrade deliberately, never silently):

| Need | Tool | When |
|---|---|---|
| Tests, benchmarks | Vitest 5 (upgrade from 3) | Phase 0, lane 0.1 |
| Language | TypeScript 7 (upgrade from 5, after a compatibility check) | Phase 0, lane 0.1 |
| Property and model-based tests | fast-check | Phase 0 |
| Pack schemas with readable errors | Zod 4 | Phase 0, lane 0.2 |
| String tables (ICU messages) | intl-messageformat | Phase 0, lane 0.2 |
| Map data pipeline | mapshaper, QGIS (with GDAL), d3-geo, Turf | Phase 0, lane 0.3 |
| Graph authoring | our own graph viewer, then an editor | Phase 0, lane 0.3 |
| AI seats | the Anthropic TypeScript SDK; plain HTTP to OpenAI-compatible local servers (Ollama, llama.cpp, LM Studio) | Phase 1 |
| Desk interface | React 19 with Vite | Phase 2 |
| UI screenshots | Playwright | Phase 2 |
| Desktop wrapper | Electron | Phase 2 |
| Steam | steamworks.js, behind our own main-process interface | first desktop build |
| Modder docs | VitePress | when packs are published |
| Typefaces | self-hosted SIL Open Font Licence faces (IM Fell, Libre Caslon, Old Standard TT, Cinzel) | Phase 2 |

**Engineering rules from the survey:**
- The state hash is computed over canonical JSON, never over compressed bytes.
- `viewFor` returns stable references for unchanged data, so the interface can skip re-rendering.
- A dependency-licence check joins `npm run check` (the survey found a GPL-3.0 tool among the candidates).

Rejected: MapLibre, deck.gl or SVG as the renderer (the style gap; 0013's prototype showed SVG filters paint too slowly); Tauri (its own documentation says WebGL can silently fall to a slow path on Linux WebKitGTK); Rough.js (unmaintained); Svelte or Solid (React's ecosystem and the team's familiarity win for a desk of panels around one canvas).

## Consequences

- Lane 0.1 starts with the Vitest 5 and TypeScript 7 upgrade.
- A new Phase 0 lane, 0.10, runs the map tripwire spike once lane 0.3 has the first 40 regions (Sonnet, high: UI).
- Before any live AI voice ships, ask Valve whether bring-your-own-key AI counts under Steam's rule that per-call AI services must collect payment through Steam (parked for the owner, since it is outward-facing).
- The "learn now" list (mapshaper and QGIS, Zod 4's errors, ICU message syntax, fast-check's model-based tests) goes to the lanes that use them first.
