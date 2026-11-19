import {mapTest} from './support/map-data.ts';
import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { presenter } from '../web/presentation.ts';
import type { MapGeometry } from '../web/map/model.ts';
import { broadArrow, hatchRings } from '../web/map/strokes.ts';
import { placeMarks,placeCaptions } from '../web/map/placement.ts';
import type {MapMark} from '../web/map/model.ts';

it('lets a headquarters caption yield to navigation without moving its sign',()=>{
  const marks=[{id:'hq',kind:'headquarters',region:'hq',caption:'Charles P. Stone'}] as MapMark[];
  const placed=placeMarks(marks,()=>[1600,35],1920,1080),reserved:[number,number,number,number]=[1540,20,1890,60];
  const caption=placeCaptions(placed,1920,1080,[reserved]).get('hq')!;
  expect(caption).toBeDefined();expect(caption[0]<reserved[2]&&caption[2]>reserved[0]&&caption[1]<reserved[3]&&caption[3]>reserved[1]).toBe(false);
  expect(placed[0]!.point).toEqual([1600,35]);
});

it('gives a draft a broad closed head and clips hatching to the full arrow and holes',()=>{
  const arrow=broadArrow([[0,0],[80,10],[180,120]],40);
  expect(arrow).toContainEqual([180,120]);expect(arrow.length).toBeGreaterThan(12);
  const segments=hatchRings([[[0,0],[100,0],[100,100],[0,100]],[[40,40],[60,40],[60,60],[40,60]]],10);
  expect(segments.length).toBeGreaterThan(10);
  for(const [a,b] of segments){const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];expect(mid[0]!>40&&mid[0]!<60&&mid[1]!>40&&mid[1]!<60).toBe(false);}
});

it('says no enemy seen for zero counts in every shared prose presentation',()=>{
  const p=presenter({'region.fort_monroe.name':'Fort Monroe'});
  expect(p.text('enemy 0 at fort_monroe; enemy 120 at fort_monroe')).toBe('no enemy seen at Fort Monroe; enemy 120 at Fort Monroe');
  expect(p.text('enemy-strength 0 at fort_monroe')).toBe('no enemy seen at Fort Monroe');
  expect(p.text('enemy 10 at fort_monroe')).toBe('enemy 10 at Fort Monroe');
});

mapTest(['union-1861.json'], 'R24 relief lies in real elevation rows with downhill strokes and no flat-ground marks',()=>{
 const g:MapGeometry=JSON.parse(readFileSync('public/map-data/union-1861.json','utf8'));
 expect(g.cartography!.relief.length).toBeGreaterThan(1000);
 expect(g.cartography!.relief.every(m=>m.contour!==undefined&&m.contour%100===0&&m.slope!>=18&&(m.a[0]!==m.b[0]||m.a[1]!==m.b[1]))).toBe(true);
});

mapTest(['union-1861.json'], 'draws full major river features once with a single rank for each named river',()=>{
  const g:MapGeometry=JSON.parse(readFileSync('public/map-data/union-1861.json','utf8'));
  const rivers=g.cartography!.rivers as {name:string;rank:number;shape:unknown}[];
  expect(rivers.length).toBeGreaterThan(100);
  for(const name of ['Potomac','Shenandoah','Rappahannock','York','James']){
    const named=rivers.filter(r=>r.name===name);
    expect(named.length).toBeGreaterThan(0);
    expect(new Set(named.map(r=>r.rank)).size).toBe(1);
    expect(named.every(r=>Number.isFinite(r.rank))).toBe(true);
  }
  expect(new Set(rivers.map(r=>JSON.stringify(r.shape))).size).toBe(rivers.length);
});
