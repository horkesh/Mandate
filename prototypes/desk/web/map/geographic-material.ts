/** Offline geographic material. Uses the same contour-to-downslope segments as
 * the relief bake; it has no camera, claim, date or game-state dependency. */
import type {MapGeometry,Point} from './model.ts';
import type {BakedSign} from './furniture-plan.ts';
import {mapProjection} from './projection.ts';
import {glyphSvg} from './glyph-design.ts';
export function ridgeHatches(geometry:MapGeometry,sign:BakedSign){
 if(sign.kind!=='mountain')return [];
 const projection=mapProjection(false),[l,t,r,b]=sign.box;
 const candidates=(geometry.cartography?.relief??[]).flatMap((h,sourceIndex)=>{
  const a=projection(h.a) as Point,finish=projection(h.b) as Point;
  if(a[0]<l||a[0]>r||a[1]<t||a[1]>b||Math.max(a[0],finish[0])<l||Math.min(a[0],finish[0])>r||Math.max(a[1],finish[1])<t||Math.min(a[1],finish[1])>b)return [];
  const local=(p:Point):Point=>[(p[0]-sign.point[0])/sign.factor,(p[1]-sign.point[1])/sign.factor];
  return [{sourceIndex,a:local(a),b:local(finish),strength:h.strength,contour:h.contour??0}];
 });
 // Fine contour data contains thousands of samples per wide-view footprint.
 // One strongest source segment per cell keeps the same field without flooding it.
 const cells=new Map<string,typeof candidates[number]>();
 for(const h of candidates){const key=`${Math.floor(h.a[0]/3)}:${Math.floor(h.a[1]/3)}`;
  if(h.strength>(cells.get(key)?.strength??-1))cells.set(key,h);
 }
 return [...cells.values()];
}
export function geographicSvg(sign:BakedSign,band:string,hatches:ReturnType<typeof ridgeHatches>){
 const svg=glyphSvg(sign.kind,`${sign.kind}-sheet-${sign.variant+1}`,band);
 if(!hatches.length)return svg;
 const [l,t,r,b]=sign.box.map((v,i)=>(v-sign.point[i%2]!)/sign.factor),margin=.6;
 const lines=hatches.map(h=>{
  const mid:Point=[h.a[0]+(h.b[0]-h.a[0])*.55,h.a[1]+(h.b[1]-h.a[1])*.55];
  const u=(h.a[0]-(l!+r!)/2)/((r!-l!)/2),v=(h.a[1]-(t!+b!)/2)/((b!-t!)/2);
  const edge=Math.max(0,1-u*u-v*v);
  return `<path d="M${h.a.join(' ')} L${mid.join(' ')} L${h.b.join(' ')}" fill="none" stroke="#68472f" stroke-width="${(.42+h.strength*.34).toFixed(3)}" opacity="${((.56+h.strength*.32)*edge).toFixed(3)}"/>`;
 }).join('');
 // Keep the old geographic footprint and all R36 water/collision alternatives.
 return svg.replace('>',`><defs><clipPath id="flank"><rect x="${l!+margin}" y="${t!+margin}" width="${r!-l!-margin*2}" height="${b!-t!-margin*2}"/></clipPath></defs><g clip-path="url(#flank)">${lines}</g>`);
}
