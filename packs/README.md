# Packs

Each setting is a pack: `packs/<pack-id>/`. Packs hold every setting-specific name, value, person, post, bloc, patron, place, verb label and line of text (decision 0003). Engine code never names a setting.

Planned:
- `union-1861/`: first slice (decision 0004)
- `rome-punic/`: Second Punic War, collective principal (decision 0006)
- `ukraine-2022/`: a contemporary pack under the policy in decision 0005

When a pack introduces names, add them to `tools/pack-terms.txt` so the boundary check catches leaks into engine code.

The pack format is defined in M1. Its starting points are Starfleet Career's source/built split, stable ids, schemas generated from types, and sourced claims.
