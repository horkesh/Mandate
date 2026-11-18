import type {Point} from './model.ts';
import type {GlyphKind} from './furniture.ts';
export function glyphVariant(key:string){const match=key.match(/-sheet-(\d+)$/);if(match)return (Number(match[1])-1)%8;let n=2166136261;for(const c of key)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n%8;}
type Design={paths:Point[][];fills:{points:Point[];colour:string;opacity:number}[]};
/** Original procedural arrangements: varied clusters, pressure, open pen joins. */
export function glyphDesign(kind:GlyphKind,key:string):Design{
 let seed=2166136261;for(const c of `${kind}:${key}`)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 const v=glyphVariant(key),paths:Point[][]=[],fills:Design['fills']=[];
 const line=(...p:Point[])=>paths.push(p);
 const rect=(x:number,y:number,w:number,h:number)=>line([x,y+h],[x,y],[x+w,y],[x+w,y+h],[x+.6,y+h]);
 const circle=(x:number,y:number,r:number,n:number)=>line(...Array.from({length:n},(_,i)=>[x+r*Math.cos(i*Math.PI*2/(n-1)),y+r*Math.sin(i*Math.PI*2/(n-1))] as Point));
 const wash=(points:Point[],colour='#72533d',opacity=.34)=>fills.push({points,colour,opacity});
 const house=(x:number,y:number,w:number,h:number,pitch:number)=>{
  rect(x,y,w,h);const roof:Point[]=[[x-1,y],[x+w*.42,y-pitch],[x+w*.78,y-pitch+.7],[x+w+1,y]];
  line(...roof);wash(roof,'#654b39',.5);line([x+w*.44,y],[x+w*.44,y+h-.7]);line([x+w*.7,y+1],[x+w*.7,y+2]);
  if(w>6)line([x+1.2,y+1.2],[x+1.2,y+2.5]);
 };
 if(['hamlet','town','city','capital','station'].includes(kind)){
  const city=kind==='city'||kind==='capital',count=kind==='hamlet'?2+v%4:kind==='town'?4+v%4:kind==='station'?1+v%4:6+v%4;
  const hamlets:Point[][]=[
   [[-8,1],[4,0]], [[-10,0],[0,-6],[9,5]], [[-12,-5],[-2,4],[9,-6],[15,5]], [[-12,-4],[-3,-7],[7,3],[-6,8],[13,-4]],
   [[-6,-7],[3,6]], [[-13,5],[-3,2],[10,-7]], [[-11,7],[-6,-5],[7,-5],[13,7]], [[-15,5],[-7,-4],[2,-8],[9,-2],[15,7]],
  ];
  for(let i=0;i<count;i++){
   const columns=city?(v<4?3+v%2:[2,3,4,3][v%4]!):v<4?3:2+v%3,rows=Math.ceil(count/columns),row=Math.floor(i/columns),col=i%columns;
   let x=(col-(columns-1)/2)*(city?8:10)+(row%2?2:-1),y=(row-(rows-1)/2)*(v<4?9:7);
   if(kind==='hamlet'){[x,y]=hamlets[v]![i]!;}
   else if(v>=4&&!city){x+=row*3;y+=(col-(columns-1)/2)*4;}
   house(x+(random()-.5)*2-3,y+(random()-.5)*3,4.3+random()*3,3+random()*2,2.4+random()*3);
  }
  if(city){line([-19,13],[-8,11],[3,12],[20,10]);for(let i=0;i<2+v%3;i++)line([-12+i*8,-15],[-10+i*8,-9]);}
  if(kind==='capital'){circle(0,0,24,26+v);line([-5,-17],[0,-23],[5,-17]);line([-6,-15],[6,-15]);}
  if(kind==='station'){line([-24,12],[23,11]);for(let i=0;i<5+v;i++)line([-21+i*4,9],[-20+i*4,15]);}
 }
 if(kind==='fort'){
  const n=4+v%5,r=17+v%2;
  for(const inner of [0,4])line(...Array.from({length:n*4+1},(_,i)=>{const a=i*Math.PI/(n*2)-Math.PI/2,rr=(i%4===0||i%4===3?r:r*.65)-inner;return [Math.cos(a)*rr,Math.sin(a)*rr] as Point;}));
  for(let i=0;i<3+v%4;i++)line([-10+i*5,3],[-9+i*5,7]);
 }
 if(kind==='earthwork'){const n=4+v%4;line(...Array.from({length:n},(_,i)=>[-22+i*44/(n-1),(i%2?-7:-2)+(v>=4?i*1.6:0)] as Point));if(v>=4)line([-20,-10],[-5,-14],[7,-10],[20,-13]);for(let i=0;i<4+v;i++)line([-20+i*4,1],[-19+i*4,6]);}
 if(kind==='bridge'){
  line([-23,-5],[22,-4]);line([-22,5],[23,6]);for(let i=0;i<5+v;i++){const x=-20+i*40/(4+v);line([x,-7],[x,8]);}
  line([-25,-9],[-23,-5],[-26,-1]);line([26,2],[23,6],[26,10]);
 }
 if(kind==='ferry'){
  const w=14+v,p:Point[]=[[-w,-2],[-w+5,6],[w-4,6],[w,-2],[-w,-2]];line(...p);wash(p,'#71634f',.28);
  line([-25,-9],[25,-8]);for(let i=0;i<2+v;i++)line([-16+i*5,10],[-12+i*5,10]);
 }
 if(kind==='mountain'){
  const n=2+v%4,ridge:Point[]=[[-27,12]];
  for(let i=0;i<n;i++){const x=-22+(i+.5)*44/n,y=-6-random()*14;ridge.push([x,y],[x+44/n*.44,7+random()*4]);line([x,y],[x+2,2],[x+44/n*.4,11]);for(let j=0;j<3+v%3;j++)line([x+2+j*1.8,y+5+j*2],[x+5+j*1.8,9]);}
  ridge.push([28,13]);line(...ridge);wash(ridge,'#796852',.21);line([-28,15],[-9,14],[8,16],[29,14]);
 }
 if(kind==='woods'){
  const n=2+v%5;for(let i=0;i<n;i++){
   const treeLayouts:Point[][]=[[],[],[],[],[],[[-3,-9],[4,7]],[[-9,6],[0,-8],[10,4]],[[-11,-6],[4,-10],[-4,8],[12,6]]];
   const [x,y]=v>=5?treeLayouts[v]![i]!:[(i-(n-1)/2)*8.2,(i%2?3:-2)+(random()-.5)*4];
   const r=5+random()*2;
   const crown:Point[]=Array.from({length:12+v%4},(_,j)=>{const a=j*Math.PI*2/(11+v%4),rr=r*(.8+random()*.4);return [x+Math.cos(a)*rr,y-5+Math.sin(a)*rr] as Point;});
   wash(crown,'#73836a',.43);line(...crown);line([x,y+7],[x+.7,y-4]);line([x,y+2],[x-3,y-1]);
  }
 }
 if(kind==='marsh')for(let i=0;i<3+v%4;i++){
  const x=(i-(2+v%4)/2)*8,y=v<4?(i%2?6:0):-4+i*2.6;line([x-5,y+3],[x,y+4],[x+6,y+2]);line([x,y+1],[x-1,y-10]);line([x,y],[x-5,y-6]);line([x,y],[x+4,y-8]);wash([[x-6,y+1],[x,y-4],[x+6,y+1],[x,y+4]],'#7b886a',.24);
 }
 if(kind==='compass'){
  circle(0,0,13,25+v);circle(0,0,3,15+v);const n=4+(v%4)*4;
  if(v>=4){circle(0,0,19,29);for(let i=0;i<8;i++){const a=(i+.5)*Math.PI/4;line([Math.sin(a)*17,-Math.cos(a)*17],[Math.sin(a)*21,-Math.cos(a)*21]);}}
  for(let i=0;i<n;i++){const a=i*Math.PI*2/n,r=i%2?18:26,p:Point[]=[[Math.sin(a)*r,-Math.cos(a)*r],[Math.sin(a+.22)*6,-Math.cos(a+.22)*6],[0,0],[Math.sin(a-.22)*6,-Math.cos(a-.22)*6],[Math.sin(a)*r,-Math.cos(a)*r]];line(...p);if(i%2===0)wash(p,'#654b39',.4);}
 }
 if(kind==='scale'){
  rect(-25,-3,50,6);for(let i=0;i<=4+v;i++){const x=-25+i*50/(4+v);line([x,-6],[x,7]);if(i%2===0)wash([[x,-3],[x+50/(4+v),-3],[x+50/(4+v),3],[x,3]],'#654b39',.6);}
  line([-30,-6],[-34,0],[-30,6]);line([30,-6],[34,0],[30,6]);
 }
 if(kind==='cartouche'){
  rect(-31,-20,62,40);rect(-29,-18,58,36);for(let i=0;i<4+v;i++){const x=-25+i*50/(3+v);line([x,-22],[x+2,-25],[x+4,-22]);}
  for(const x of [-1,1])for(const y of [-1,1])line([x*24,y*20],[x*28,y*24],[x*34,y*20],[x*34,y*14]);
 }
 const waved=paths.map((p,index)=>{
  const q:Point[]=[];p.forEach(([x,y],i)=>{if(i){const a=p[i-1]!;q.push([(a[0]+x)/2+(random()-.5)*.55,(a[1]+y)/2+(random()-.5)*.55]);}q.push([+(x+(random()-.5)*.6).toFixed(3),+(y+(random()-.5)*.6).toFixed(3)]);});
  if(index%5===v%5&&q.length>5)q.pop();return q;
 });return {paths:waved,fills};
}
export function glyphPaths(kind:GlyphKind,key:string){return glyphDesign(kind,key).paths;}
export function glyphSvg(kind:GlyphKind,key:string){
 const {paths,fills}=glyphDesign(kind,key),d=(p:Point[])=>p.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' ');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -32 80 64" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${fills.map(f=>`<path d="${d(f.points)}Z" fill="${f.colour}" fill-opacity="${f.opacity}" stroke="none"/>`).join('')}${paths.map((p,i)=>`<path d="${d(p)}" stroke-width="${(.75+(i%5)*.22).toFixed(2)}" opacity="${.78+(i%3)*.09}"/>${i%4===0?`<circle cx="${p[0]![0]}" cy="${p[0]![1]}" r=".7" fill="currentColor" stroke="none"/>`:''}`).join('')}</svg>`;
}
