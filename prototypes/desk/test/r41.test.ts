import {expect,it} from 'vitest';
import {placeNameHints} from '../web/map/place-names.ts';
it('R41 keeps national capitals and large-city names at fit without a sign atlas',()=>{
 expect(placeNameHints('union-1861','1861-03-06',1).map(p=>p.id).sort()).toEqual(['baltimore','cincinnati','montgomery','new_orleans','philadelphia','st_louis','washington']);
 expect(placeNameHints('union-1861','1861-05-29',1).some(p=>p.id==='richmond'&&p.rank==='national')).toBe(true);
 expect(placeNameHints('testbed','1861-03-06',1)).toEqual([]);
});
it('R41 retains the place-name zoom hierarchy without adding terrain drawings',()=>{
 const theatre=placeNameHints('union-1861','1861-03-06',3),close=placeNameHints('union-1861','1861-03-06',6);
 expect(theatre.some(p=>p.id==='southern_maryland')).toBe(true);
 expect(theatre.some(p=>p.kind==='hamlet')).toBe(false);expect(close.some(p=>p.id==='fort_monroe')).toBe(true);
 expect(close.every(p=>['hamlet','town','city','capital'].includes(p.kind))).toBe(true);
});
