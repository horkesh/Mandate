import {mapProjection} from './map/projection.ts';
/** Build-time Canvas2D entry point. The playable desk never imports this module. */
import {geoAlbers,geoMercator} from 'd3-geo';
import {bakeAtlas} from './map/atlas.ts';
import {atlasVariant} from './map/atlas-disk.ts';
import {studyWashes} from './map/study-data.ts';
import type {MapGeometry} from './map/model.ts';
import type {Look} from './map/skins.ts';
import {deskApi} from './adapter.ts';
const geometries=new Map<string,Promise<MapGeometry>>();
const builder=async(pack:string,look:Look,contrast:boolean,lamp:boolean,study:boolean)=>{
 if(!geometries.has(pack))geometries.set(pack,deskApi.geometry(pack));
 const geometry=await geometries.get(pack)!;
 const projection=geometry.schematic?geoMercator().center([-1.4,52]).scale(20000).translate([0,0]):mapProjection(false);
 const atlas=bakeAtlas(geometry,projection,look,contrast,lamp,study?studyWashes:[]);
 return {variant:atlasVariant(look,contrast,lamp,study),bakeMs:atlas.bakeMs,bytes:atlas.bytes,paths:atlas.paths,bands:atlas.bands.map(b=>({box:b.box,scale:b.scale,minZoom:b.minZoom,width:b.canvas.width,height:b.canvas.height,png:(b.canvas as HTMLCanvasElement).toDataURL('image/png').split(',')[1]!}))};
};
(window as unknown as {buildAtlas:typeof builder}).buildAtlas=builder;
