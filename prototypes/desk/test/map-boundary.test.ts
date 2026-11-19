import { expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

it('the map presenter takes exactly SeatRequest and geometry; browser code cannot reach truth', () => {
  const model=readFileSync('web/map/model.ts','utf8');
  expect(model).toMatch(/function buildMapModel\(request: SeatRequest, geometry: MapGeometry\)/);
  // The separate import-boundary test recursively checks every browser import.
  // These checks make the data path explicit without treating Pixi's world container as game truth.
  for(const name of readdirSync('web/map').filter(n=>/\.tsx?$/.test(n))) {
    const source=readFileSync(resolve('web/map',name),'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/gm,'');
    expect(source).not.toMatch(/\b(?:game|data|snapshot)\.(?:state|world|log|stateNow)\b/);
    expect(source).not.toMatch(/\b(?:fetch|eval|require)\s*\(/);
  }
  expect(model).not.toMatch(/\.(?:history|stateNow|forceBlocks|planRecords|worldHash)\b/);
  const http=readFileSync('server/http.ts','utf8');
  expect(http).toContain('map-data');
  expect(http).not.toContain('game.world');
  expect(http).not.toContain('game.state');
});
