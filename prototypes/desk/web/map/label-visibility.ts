import {geoArea} from 'd3-geo';
import type {GeoPermissibleObjects} from 'd3-geo';
import type {MapRegion} from './model.ts';

/** Display fallback until packs supply their 0043 label hints. No source records change. */
export function labelPolicy(region:MapRegion){
 const water=region.kind==='sea'||region.kind==='river';
 const area=region.shape?geoArea(region.shape as GeoPermissibleObjects):0;
 const squareDegrees=Math.min(area,4*Math.PI-area)*(180/Math.PI)**2;
 const sizeClass=region.label.size??(water?'l':squareDegrees>=2?'l':squareDegrees>=.45?'m':'s');
 return {sizeClass,size:region.kind==='key_point'?14:water?18:sizeClass==='l'?21:sizeClass==='s'?12:14,
  minZoom:region.label.minZoom!==null?region.label.minZoom/1000:water?0:region.kind==='key_point'?2.4:sizeClass==='l'?0:sizeClass==='m'?1.7:3};
}

/** Enter at the threshold; leave 10% below it. Pan/redraw never resets the latch. */
export function labelVisible(zoom:number,minZoom:number,previouslyVisible:boolean){
 return zoom>=minZoom*(previouslyVisible ? .9 : 1);
}
