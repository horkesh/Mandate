import type { Point } from './model.ts';

/** Distance from a label centre to its own projected area, with holes retained. */
export function regionLabelDistance(point:Point, polygons:readonly (readonly (readonly Point[])[])[]):number {
  let nearest=Infinity;
  for(const polygon of polygons){
    let inside=false;
    for(const ring of polygon)for(let i=0,j=ring.length-1;i<ring.length;j=i++){
      const a=ring[j]!,b=ring[i]!,dx=b[0]-a[0],dy=b[1]-a[1];
      const t=Math.max(0,Math.min(1,((point[0]-a[0])*dx+(point[1]-a[1])*dy)/(dx*dx+dy*dy||1)));
      nearest=Math.min(nearest,Math.hypot(point[0]-a[0]-t*dx,point[1]-a[1]-t*dy));
      if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    if(inside)return 0;
  }
  return nearest;
}
