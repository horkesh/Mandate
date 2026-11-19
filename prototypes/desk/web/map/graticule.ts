import type {GeoProjection} from 'd3-geo';
import type {Point} from './model.ts';
// Old Naval Observatory meridian, NOAA Geodetic Letter 3(1), March 1936.
// This is a geographic offset, not a claim of 1861 survey precision.
export const WASHINGTON_WEST=77+3/60+6.119/3600;
export const MERIDIAN_LABELS={top:'Longitude west of Greenwich',bottom:'Longitude from Washington'};
export interface DegreeTick {x:number;y:number;side:'left'|'right'|'top'|'bottom';kind:'latitude'|'longitude';value:number;meridian?:'Greenwich'|'Washington';text:string}
export function degreesMinutes(value:number){const minutes=Math.round(Math.abs(value)*60);return `${Math.floor(minutes/60)}° ${String(minutes%60).padStart(2,'0')}′`;}
/** Intersect geographic curves with their own edges, refining the actual projection. */
export function graticuleTicks(projection:GeoProjection,camera:{x:number;y:number;z:number},w:number,h:number):DegreeTick[]{
 const {x,y,z}=camera,center=projection.invert?.([(w/2-x)/z,(h/2-y)/z]);if(!center)return [];
 const step=z>20?.25:z>7?1:5,result:DegreeTick[]=[];
 const screen=(lon:number,lat:number):Point=>{const p=projection([lon,lat])!;return [p[0]*z+x,p[1]*z+y];};
 const curve=(kind:'latitude'|'longitude',value:number,edgeOnly?:DegreeTick['side'])=>{
  const latitude=kind==='latitude',from=latitude?-169:-25,to=latitude?-1:74;
  const at=(t:number)=>latitude?screen(t,value):screen(value,t);
  for(const side of (latitude?['left','right']:['top','bottom']) as DegreeTick['side'][]){
   if(edgeOnly&&side!==edgeOnly)continue;
   const axis=latitude?0:1,edge=side==='left'||side==='top'?0:latitude?w:h;
   for(let t=from;t<to;t+=1){
    const a=at(t),b=at(t+1);if((a[axis]-edge)*(b[axis]-edge)>0||a[axis]===b[axis])continue;
    let lo=t,hi=t+1;
    for(let j=0;j<30;j++){const mid=(lo+hi)/2;if((at(lo)[axis]-edge)*(at(mid)[axis]-edge)<=0)hi=mid;else lo=mid;}
    const p=at((lo+hi)/2),along=p[latitude?1:0];if(along<40||along>(latitude?h:w)-40)continue;
    const west=-(value+(side==='bottom'?WASHINGTON_WEST:0));
    const washington=side==='bottom',whole=Math.round(Math.abs(west));
    result.push({x:p[0],y:p[1],side,kind,value,...(!latitude?{meridian:side==='top'?'Greenwich' as const:'Washington' as const}:{}),text:washington?`${whole}°${whole===0?'':west<0?' E':' W'}`:degreesMinutes(latitude?value:west)+(latitude?(value<0?' S':' N'):west<0?' E':'')});
   }
  }
 };
 for(let lon=Math.floor((center[0]-50)/step)*step;lon<=Math.min(0,center[0]+50);lon+=step)curve('longitude',lon,'top');
 for(let offset=-90;offset<=75;offset++)curve('longitude',-WASHINGTON_WEST+offset,'bottom');
 for(let lat=Math.max(-25,Math.floor((center[1]-35)/step)*step);lat<=Math.min(74,center[1]+35);lat+=step)curve('latitude',lat);
 return result.filter((p,i)=>result.findIndex(q=>q.side===p.side&&Math.hypot(q.x-p.x,q.y-p.y)<65)===i);
}
