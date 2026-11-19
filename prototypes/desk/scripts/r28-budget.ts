import {readFileSync} from 'node:fs';
import {mapProjection} from '../web/map/projection.ts';
import {geographicBounds} from '../web/map/atlas.ts';
const g=JSON.parse(readFileSync('public/map-data/union-1861.json','utf8')),p=mapProjection(false);
for(const scale of [14,15,16]){
 const specs=[{box:g.baseCoverage.worldBounds,scale:1},{box:geographicBounds(p,[-104,24,-65,50]),scale:4},{box:geographicBounds(p,[-86.5,33.5,-72.5,43]),scale},{box:geographicBounds(p,[-78.25,38.15,-76.7,39.35]),scale:80}];
 const bands=specs.map(s=>({scale:s.scale,width:Math.ceil((s.box[2]-s.box[0])*s.scale),height:Math.ceil((s.box[3]-s.box[1])*s.scale)}));
 console.log(JSON.stringify({scale,bands,bytes:bands.reduce((n,b)=>n+b.width*b.height*4,0)}));
}
