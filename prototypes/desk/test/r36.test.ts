import {expect,it} from 'vitest';
import {capitalRank,wideTown,placeNearAnchor,namePositions} from '../web/map/furniture-placement.ts';
import {glyphSvg,glyphPaths} from '../web/map/furniture.ts';

it('R36 gives March national capitals priority over state capitals and updates with the calendar',()=>{
 expect(capitalRank('washington','1861-03-06','capital')).toBe('national');
 expect(capitalRank('montgomery','1861-03-06','capital')).toBe('national');
 expect(capitalRank('richmond','1861-03-06','capital')).toBe('state');
 expect(capitalRank('montgomery','1861-05-28','capital')).toBe('national');
 expect(capitalRank('richmond','1861-05-29','capital')).toBe('national');
 expect(capitalRank('montgomery','1861-05-29','capital')).toBe('state');
 expect(wideTown('richmond','capital','state')).toBe(false);
 expect(wideTown('washington','capital','national')).toBe(true);
 expect(wideTown('baltimore','city','none')).toBe(true);
 expect(wideTown('fort_sumter','city','none')).toBe(false);
});
it('R36 stays on its point and only moves to clear a report, never toward a neighbouring place',()=>{
 const anchor:[number,number]=[100,100],box:[number,number,number,number]=[85,85,115,115];
 const options:[number,number][]=[[100,100],[100,68],[136,100],[100,60]];
 expect(placeNearAnchor(anchor,box,options,[],[],[[100,70]])).toEqual(anchor);
 const moved=placeNearAnchor(anchor,box,options,[[80,80,120,120]],[],[[100,70]]);
 expect(moved).toEqual([136,100]);
 // A paper may suppress furniture, but is never a reason to relocate it.
 expect(placeNearAnchor(anchor,box,options,[],[[80,80,120,120]],[])).toBeNull();
});
it('R36 places a name immediately beside its own sign',()=>{
 const positions=namePositions([100,100],[80,80,120,120],60,20);
 expect(positions[0]).toEqual([158,100]);
 expect(positions.every(p=>Math.hypot(p[0]-100,p[1]-100)<70)).toBe(true);
});
it('R36 draws fine brown open hills rather than dark filled peaks',()=>{
 const svg=glyphSvg('mountain','mountain-sheet-1');
 expect(svg).toContain('#79604a');
 expect(svg).not.toContain('fill-opacity="0.21"');
 expect(Math.max(...glyphPaths('mountain','mountain-sheet-1').flat().map(p=>Math.abs(p[1])))).toBeLessThan(14);
});
