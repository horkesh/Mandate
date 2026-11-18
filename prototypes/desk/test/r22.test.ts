import { expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { placeMarks, placeCaptions } from '../web/map/placement.ts';
import type { MapGeometry, MapMark } from '../web/map/model.ts';

it('R22 has an explicit renderer skin selection and deterministic shared-edge roughening', async () => {
  expect(existsSync('web/map/skins.ts'), 'renderer skins are missing').toBe(true);
  const { readLook, roughLine } = await import('../web/map/skins.ts');
  expect(readLook('')).toBe('A');
  expect(readLook('?look=B')).toBe('B');
  expect(readLook('?look=unknown')).toBe('A');
  const line: [number,number][] = [[0,0],[10,7],[20,9]];
  expect(roughLine(line)).toEqual(roughLine(line));
  expect(roughLine([...line].reverse()).reverse()).toEqual(roughLine(line));
  expect(roughLine(line)[0]).toEqual(line[0]);
  expect(roughLine(line).at(-1)).toEqual(line.at(-1));
  expect(roughLine(line)).not.toEqual(line);
});

it('separates the captions of headquarters sharing Washington without moving their anchors',()=>{
  const marks:MapMark[]=['Scott','Stone','Buchanan'].map((caption,i)=>({id:String(i),kind:'headquarters',region:'washington',author:caption,day:7,source:String(i),post:String(i),value:null,token:null,sources:1,caption}));
  const placed=placeMarks(marks,()=>[900,350],1920,1080);
  const captions=[...placeCaptions(placed,1920,1080).values()];
  expect(captions).toHaveLength(3);expect(placed.map(p=>p.anchor)).toEqual([[900,350],[900,350],[900,350]]);
  for(let i=0;i<captions.length;i++)for(let j=i+1;j<captions.length;j++){
    const a=captions[i]!,b=captions[j]!;expect(a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1]).toBe(false);
  }
});

it('has real relief, only selected historical rails, and all five named river lines',()=>{
  const geometry:MapGeometry=JSON.parse(readFileSync('public/map-data/union-1861.json','utf8'));
  const build=JSON.parse(readFileSync('../../art-masters/R22/cartography-build.json','utf8'));
  expect(geometry.cartography!.rail.length).toBeGreaterThan(1000);
  expect(geometry.cartography!.relief.length).toBeGreaterThan(1000);
  for(const name of ['Potomac','Shenandoah','Rappahannock','York','James'])expect(geometry.cartography!.rivers.some(r=>r.name===name)).toBe(true);
  expect(build.railYearRange[1]).toBe(1861);expect(build.regionsPreserved).toBe(true);expect(build.basePreserved).toBe(true);
  const main=readFileSync('web/main.tsx','utf8');expect(main).toContain("get('study')==='1'");
  const desk=readFileSync('web/App.tsx','utf8');expect(desk).not.toContain('StudyMarks');expect(desk).not.toContain('illustration');
});
