import {expect,it} from 'vitest';
import {controlColour,controlOpacity} from '../web/map/control.ts';
import {readControlPalette,CONTROL_PALETTES} from '../web/map/control-palettes.ts';

it('R33 defaults to strong and selects only a named palette from the query',()=>{
 expect(readControlPalette('')).toBe('strong');
 expect(readControlPalette('?palette=research')).toBe('research');
 expect(readControlPalette('?palette=strong')).toBe('strong');
 expect(readControlPalette('?palette=unknown')).toBe('strong');
});
it('R33 uses the research endpoints and preserves strong endpoints',()=>{
 expect(controlColour('us','us',false,'research')).toBe(0x1f59a8);
 expect(controlColour('cs','us',false,'research')).toBe(0xc33830);
 expect(controlColour(null,'us',true,'research')).toBe(0xd5a32f);
 expect(CONTROL_PALETTES.research.colours.correction).toBe(0x76509b);
 expect(controlColour('us','us')).toBe(0x084bd6);
});
it('R33 gentler research middles retain the same ink, pencil and age ratios',()=>{
 const b={asOfDay:0,mark:'ink'} as any;
 const strong=controlOpacity(b,0),research=controlOpacity(b,0,'research');
 expect(strong).toBe(.92*.72);expect(research).toBeLessThan(strong);
 expect(research).toBeGreaterThan(.4);
 for(const day of [0,8,15,29])for(const mark of ['ink','pencil']){
  expect(controlOpacity({...b,mark},day,'research')/controlOpacity({...b,mark},day)).toBeCloseTo(research/strong);
 }
 expect(CONTROL_PALETTES.research.rim[0]![0]).toBeLessThan(CONTROL_PALETTES.strong.rim[0]![0]);
});
