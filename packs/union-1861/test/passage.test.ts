import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ids, phase0, world as w } from '@mandate/kernel';
import { loadPack, type PackFiles } from '@mandate/pack-format';
import { describe, expect, it } from 'vitest';

/**
 * Lane 0.5's done check on the Union start (FOUNDATION section 12, decisions
 * 0055 and 0058): on 5 March 1861 Washington is not cut off, Maryland is open
 * neutral ground, and a Union force from the North reaches Washington by rail
 * through it. Closing Maryland's government bars that line (positive control).
 */
const root = fileURLToPath(new URL('../', import.meta.url));
const files: PackFiles = {
  read: (p) => {
    const full = join(root, ...p.split('/'));
    return existsSync(full) && statSync(full).isFile() ? readFileSync(full, 'utf8') : undefined;
  },
  folders: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name),
  files: (p) => readdirSync(join(root, ...p.split('/')), { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name),
};
const { pack } = loadPack(files);
const map = w.indexWorld(pack!.world);
const world = phase0.indexSeatsWorld(map, pack!.scenarios[0]!, { situations: pack!.situations!.filter(s => s.id === 'manassas_advance_received') });
const state = phase0.createState(world, { seed: 1 });
const R = (id: string) => ids.toId('region', id);
const UNION = ids.toId('faction', 'union');
const MARYLAND = ['baltimore', 'baltimore_county', 'frederick_md', 'southern_maryland', 'western_maryland'].map(R);

function groundOf(s: phase0.State): phase0.MarchGround {
  return { map, index: phase0.buildControlIndex(map, s.regionControl), network: phase0.passageOf(map, s), month: 3 };
}

/** The legs a Union force takes from `from` to Washington, following the first quickest step each time. */
function routeToWashington(s: phase0.State, from: string): string[] {
  const g = groundOf(s);
  const legs: string[] = [];
  for (let at = R(from); at !== R('washington'); ) {
    const step = phase0.marchSteps(g, at, R('washington'), UNION, false)[0];
    if (step === undefined) return [...legs, 'no way'];
    legs.push(step.leg.edge);
    at = step.leg.to;
  }
  return legs;
}

describe('the Union start on 5 March 1861', () => {
  it('Washington is supplied, not in a pocket', () => {
    const supply = phase0.deriveSupply(map, groundOf(state).index, 3, phase0.passageOf(map, state)).factions.get(UNION)!;
    expect(supply.paths.has(R('washington'))).toBe(true);
    expect(supply.pockets.flatMap((p) => p.regions)).not.toContain(R('washington'));
  });

  it("Maryland is open neutral ground: a neutral government's, open to every side", () => {
    const neutral = phase0.passageOf(map, state).neutralGround!;
    for (const r of MARYLAND) expect(neutral[r], r).toBe('open');
  });

  it('a Union force from Harrisburg reaches Washington by rail, through York, Baltimore County and Southern Maryland', () => {
    const route = routeToWashington(state, 'harrisburg');
    expect(route.every((e) => e.startsWith('rail:'))).toBe(true);
    expect(route.some((e) => e.includes('baltimore_county'))).toBe(true);
    expect(route.at(-1)).toBe('rail:southern_maryland:washington:baltimore_and_ohio');
  });

  it("closing Maryland's government bars the line through it (positive control)", () => {
    const md = state.regionGovernments[R('baltimore')];
    expect(md).not.toBe('unknown');
    const closed = phase0.closeGovernment(map, state, md as never, 1);
    expect(phase0.passageOf(map, closed).neutralGround![R('baltimore')]).toBe('closed');
    expect(routeToWashington(closed, 'harrisburg').some((e) => e.includes('baltimore_county') || e.includes('southern_maryland'))).toBe(false);
  });
});
