import {expect,it} from 'vitest';
import {StaffRenderer} from '../web/map/renderer.ts';
import * as visibility from '../web/map/label-visibility.ts';
import type {MapRegion} from '../web/map/model.ts';

const region=(size:string|null,kind='land',minZoom:number|null=null):MapRegion=>({id:'place',name:'Place',kind,point:[-78,38],shape:null,label:{size,minZoom,anchor:null,spine:[]}});
it('R27 opens Union on the Eastern frame, and leaves other packs at fit',()=>{
 const open=(StaffRenderer.prototype as any).fitOpening;
 expect(typeof open).toBe('function');if(!open)return;
 const boxes:number[][]=[];let fits=0;
 for(const pack of ['union-1861','testbed'])open.call({geometry:{pack},fit(){fits++;},fitGeographic(b:number[]){boxes.push(b);}});
 expect(fits).toBe(2);expect(boxes).toEqual([[-80.35,36.7,-75.85,40.65]]);
});
it('R27 reveals region classes in order and keeps water names at the wide view',()=>{
 const policy=(visibility as any).labelPolicy;
 expect(typeof policy).toBe('function');if(!policy)return;
 expect(policy(region('l')).minZoom).toBeLessThanOrEqual(1);
 expect(policy(region('m')).minZoom).toBeGreaterThan(1);
 expect(policy(region('s')).minZoom).toBeGreaterThan(policy(region('m')).minZoom);
 expect(policy(region(null,'sea')).minZoom).toBeLessThanOrEqual(1);
 expect(policy(region('s','land',4200)).minZoom).toBe(4.2);
 expect(policy(region('l')).size).toBeGreaterThan(policy(region('s')).size);
});
it('R27 uses a hysteresis band without letting repeated redraws change visibility',()=>{
 const visible=(visibility as any).labelVisible;
 expect(typeof visible).toBe('function');if(!visible)return;
 let shown=false;
 for(const z of [1.9,1.99,1.95]){shown=visible(z,2,shown);expect(shown).toBe(false);}
 shown=visible(2.01,2,shown);expect(shown).toBe(true);
 for(const z of [1.99,1.91,1.99]){shown=visible(z,2,shown);expect(shown).toBe(true);}
 expect(visible(1.79,2,shown)).toBe(false);
});
