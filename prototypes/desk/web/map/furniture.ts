import type {Point} from './model.ts';
export const GLYPH_KINDS=['hamlet','town','city','capital','fort','earthwork','station','bridge','ferry','mountain','woods','marsh','compass','scale','cartouche'] as const;
export type GlyphKind=typeof GLYPH_KINDS[number];
export type Furniture={id:string;kind:GlyphKind;point:Point;name?:string;size?:number;source:string;orientation?:number};
export const furnitureScale=(zoom:number)=>zoom<2?'wide':zoom<5.2?'theatre':'close';
export function glyphPaths(kind:GlyphKind,key:string):Point[][]{
 let seed=2166136261;for(const c of `${kind}:${key}`)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 const paths:Point[][]=[];
 const line=(...p:Point[])=>paths.push(p);
 const rect=(x:number,y:number,w:number,h:number)=>line([x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]);
 const circle=(x:number,y:number,r:number)=>line(...Array.from({length:25},(_,i)=>[x+r*Math.cos(i*Math.PI/12),y+r*Math.sin(i*Math.PI/12)] as Point));
 const house=(x:number,y:number,w=5)=>{rect(x,y,w,4);line([x-1,y],[x+w/2,y-3],[x+w+1,y]);line([x+w*.6,y+1],[x+w*.6,y+3]);};
 if(['hamlet','town','city','capital'].includes(kind)){
  const city=kind==='city'||kind==='capital';
  if(city){
   // An emblematic street plan, never surveyed road geometry.
   for(const x of [-11,-3,5])for(const y of [-5,3]){rect(x,y,5,5);line([x+1,y+1],[x+4,y+1]);}
   line([-14,0],[14,0]);line([1,-10],[1,11]);
  }else{house(-10,1);house(-2,-4,6);if(kind==='town'){house(6,2);house(-7,-7,4);}}
  if(kind==='capital'){circle(0,0,19);line([-4,-12],[0,-17],[4,-12]);}
 }
 if(kind==='fort'){
  const star=(r:number)=>Array.from({length:17},(_,i)=>{const a=i*Math.PI/8-Math.PI/2,v=i%2?r*.61:r;return [Math.cos(a)*v,Math.sin(a)*v] as Point;});
  line(...star(15));line(...star(10));
 }
 if(kind==='earthwork'){line([-15,5],[-12,-4],[-5,-7],[0,-4],[6,-9],[13,-3],[15,4]);for(let x=-12;x<=12;x+=5)line([x,4],[x+2,8]);}
 if(kind==='station'){house(-7,-2,12);line([-16,8],[16,8]);for(let x=-14;x<15;x+=5)line([x,5],[x,11]);}
 if(kind==='bridge'){line([-15,-5],[15,-5]);line([-15,5],[15,5]);for(let x=-12;x<=12;x+=6)line([x,-7],[x,7]);line([-18,-8],[-15,-5],[-18,-2]);line([18,2],[15,5],[18,8]);}
 if(kind==='ferry'){line([-15,0],[-10,6],[10,6],[15,0],[-15,0]);line([-18,-6],[18,-6]);line([-7,9],[7,9]);}
 if(kind==='mountain'){
  line([-22,9],[-10,-7],[-4,1],[4,-13],[21,9]);line([-10,-7],[-6,7]);line([4,-13],[7,-3],[5,0],[13,9]);
  for(let i=0;i<5;i++)line([6+i*2,-5+i*2],[7+i*2,6+i*.5]);line([-23,11],[-8,10],[2,12],[23,10]);
 }
 if(kind==='woods')for(const [x,y] of [[-11,4],[0,-4],[11,4]] as Point[]){
  line([x,y+8],[x,y-2]);line([x-1,y+3],[x-5,y]);
  line([x-7,y],[x-8,y-4],[x-5,y-7],[x-2,y-6],[x,y-10],[x+4,y-8],[x+5,y-5],[x+8,y-3],[x+6,y+1],[x+2,y+2],[x-2,y+1],[x-7,y]);
 }
 if(kind==='marsh')for(const [x,y] of [[-12,4],[1,-1],[13,6]] as Point[]){line([x-5,y],[x,y+2],[x+6,y]);line([x,y],[x-1,y-10]);line([x,y],[x-6,y-7]);line([x,y],[x+5,y-6]);}
 if(kind==='compass'){
  circle(0,0,13);circle(0,0,3);
  for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?18:25;line([Math.sin(a)*r,-Math.cos(a)*r],[Math.sin(a+.22)*6,-Math.cos(a+.22)*6],[0,0],[Math.sin(a-.22)*6,-Math.cos(a-.22)*6],[Math.sin(a)*r,-Math.cos(a)*r]);}
 }
 if(kind==='scale'){rect(-25,-3,50,6);for(let x=-25;x<=25;x+=10)line([x,-7],[x,6]);line([-30,-6],[-34,0],[-30,6]);line([30,-6],[34,0],[30,6]);}
 if(kind==='cartouche'){
  rect(-31,-20,62,40);rect(-29,-18,58,36);
  for(const x of [-1,1])for(const y of [-1,1])line([x*22,y*20],[x*25,y*23],[x*31,y*23],[x*34,y*20],[x*34,y*15],[x*31,y*12]);
 }
 return paths.map(p=>p.map(([x,y])=>[+(x+(random()-.5)*.5).toFixed(3),+(y+(random()-.5)*.5).toFixed(3)]));
}
export function glyphSvg(kind:GlyphKind,key:string){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -32 80 64" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">${glyphPaths(kind,key).map(p=>`<path d="${p.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ')}"/>`).join('')}</svg>`;}
