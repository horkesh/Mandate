import type { Point } from './model.ts';
export type Box=[number,number,number,number];

/** Screen-space ribbon with a closed, broad head and slight continuous waver.
 * Only presentation changes; every route vertex remains on its supplied route.
 */
export function broadArrow(route:readonly Point[],width:number):Point[]{
  if(route.length<2)return [];
  const dense:Point[]=[];let travel=0;
  for(let i=1;i<route.length;i++){
    const a=route[i-1]!,b=route[i]!,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(!len)continue;
    const n=Math.max(1,Math.ceil(len/12));
    for(let j=0;j<n;j++){
      const t=j/n,wave=Math.sin((travel+len*t)/37)*1.3*Math.sin(Math.PI*t);
      dense.push([a[0]+dx*t-dy/len*wave,a[1]+dy*t+dx/len*wave]);
    }travel+=len;
  }
  const tip=route.at(-1)!;dense.push(tip);if(dense.length<2)return [];
  const last=route.at(-2)!,angle=Math.atan2(tip[1]-last[1],tip[0]-last[0]);
  const head=Math.min(width*1.65,travel*.38),shoulder:Point=[tip[0]-Math.cos(angle)*head,tip[1]-Math.sin(angle)*head];
  let remaining=head;while(dense.length>1){const a=dense.at(-2)!,b=dense.at(-1)!,len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(remaining<len)break;remaining-=len;dense.pop();}
  dense[dense.length-1]=shoulder;
  const left:Point[]=[],right:Point[]=[];
  dense.forEach((p,i)=>{
    const a=dense[Math.max(0,i-1)]!,b=dense[Math.min(dense.length-1,i+1)]!,len=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
    const nx=-(b[1]-a[1])/len*width/2,ny=(b[0]-a[0])/len*width/2;
    left.push([p[0]+nx,p[1]+ny]);right.push([p[0]-nx,p[1]-ny]);
  });
  const nx=-Math.sin(angle)*width,ny=Math.cos(angle)*width;
  return [...left,[shoulder[0]+nx,shoulder[1]+ny],tip,[shoulder[0]-nx,shoulder[1]-ny],...right.reverse()];
}

/** Even-odd diagonal hatching, including holes. All endpoints stay in the fill. */
export function hatchRings(rings:readonly Point[][],spacing:number,direction=1):[Point,Point][]{
  const all=rings.flat();if(!all.length)return [];
  const values=all.map(([x,y])=>y-direction*x),min=Math.min(...values),max=Math.max(...values),result:[Point,Point][]=[];
  for(let k=Math.floor(min/spacing)*spacing;k<=max;k+=spacing){
    const hits:Point[]=[];
    for(const ring of rings)for(let i=0;i<ring.length;i++){
      const a=ring[i]!,b=ring[(i+1)%ring.length]!,av=a[1]-direction*a[0],bv=b[1]-direction*b[0];
      if((av<=k&&bv>k)||(bv<=k&&av>k)){const t=(k-av)/(bv-av);hits.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}
    }
    hits.sort((a,b)=>a[0]-b[0]);for(let i=1;i<hits.length;i+=2)result.push([hits[i-1]!,hits[i]!]);
  }return result;
}

export function lineBoxes(points:readonly Point[],pad:number):Box[]{
  const boxes:Box[]=[];
  for(let i=1;i<points.length;i++){
    const a=points[i-1]!,b=points[i]!,n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/8));
    for(let j=0;j<=n;j++){const x=a[0]+(b[0]-a[0])*j/n,y=a[1]+(b[1]-a[1])*j/n;boxes.push([x-pad,y-pad,x+pad,y+pad]);}
  }return boxes;
}
