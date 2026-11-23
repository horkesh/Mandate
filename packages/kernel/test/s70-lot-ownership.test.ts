import { expect, it } from 'vitest';
import { applyDetachments } from '../src/forces/detachments.ts';
import { forceTotals } from '../src/forces/lots.ts';
import { createState } from '../src/tick/setup.ts';
import { B, block, forcesIndex, forcesStart } from './support/forces-fixture.ts';
import { region } from './support/map-fixture.ts';
import { worldOf } from './support/tick-context.ts';

it('keeps each lot in one block when a detached block id is reused after rejoining', () => {
  const map = forcesIndex({regions:[region('a')],edges:[]});
  const world = worldOf(map, forcesStart({a:{a:1000}},[],[block('parent',{department:'a_war',strength:1000,region:'a'})]));
  const state = createState(world,{seed:1});
  const detach = { change:'detach',parent:B('parent'),detachment:B('child'),men:300,name:'child',cause:'command' } as const;
  const next = applyDetachments(state,[detach,{change:'rejoin',detachment:B('child'),cause:'command'},detach]).state;
  const lots = Object.values(next.forceBlockStates).flatMap(b=>b.fbLots);
  expect(new Set(lots.map(l=>l.lotId)).size).toBe(lots.length);
  expect(Object.values(next.forceBlockStates).reduce((n,b)=>n+forceTotals(b).fbStrength!,0)).toBe(1000);
});
