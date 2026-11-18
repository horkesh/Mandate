import type { MapMark, Point } from './model.ts';

/** Screen-space label placement only. The reported location stays the anchor. */
export function placeMarks(marks: readonly MapMark[], screen: (region: string) => Point | null, width: number, height: number) {
  const placed: { mark: MapMark; anchor: Point; point: Point }[] = [];
  for (const mark of marks) {
    const anchor = screen(mark.region);
    if (!anchor || anchor[0] < 18 || anchor[0] > width - 18 || anchor[1] < 18 || anchor[1] > height - 18) continue;
    const fits = (p: Point) => p[0] >= 18 && p[0] <= width - 18 && p[1] >= 18 && p[1] <= height - 18
      && placed.every(other => Math.hypot(other.point[0] - p[0], other.point[1] - p[1]) >= 29);
    let point: Point | undefined;
    for (let ring = 0; ring < 32 && !point; ring++) {
      for (let y = -ring; y <= ring && !point; y++) for (let x = -ring; x <= ring && !point; x++) {
        if (Math.max(Math.abs(x), Math.abs(y)) !== ring) continue;
        const candidate: Point = [anchor[0] + x * 30, anchor[1] + y * 30];
        if (fits(candidate)) point = candidate;
      }
    }
    placed.push({ mark, anchor, point: point ?? anchor });
  }
  return placed;
}

/** One written report location, with every holder/date retained. Signs stay separate. */
export function groupHeadquarters(placed:ReturnType<typeof placeMarks>){
  const groups=new Map<string,(typeof placed)[number]&{marks:MapMark[]}>();
  for(const item of placed.filter(p=>p.mark.kind==='headquarters')){
    const group=groups.get(item.mark.region);
    if(group)group.marks.push(item.mark);else groups.set(item.mark.region,{...item,marks:[item.mark]});
  }
  return [...groups.values()];
}
/** Captions yield to furniture and live linework; anchors remain untouched. */
export function placeCaptions(placed:readonly (ReturnType<typeof placeMarks>[number]&{marks?:MapMark[]})[],width:number,height:number,reserved:readonly [number,number,number,number][]=[]){
  const occupied:[number,number,number,number][]=[...reserved,...placed.map(p=>[p.point[0]-18,p.point[1]-18,p.point[0]+18,p.point[1]+18] as [number,number,number,number])];
  const result=new Map<string,[number,number,number,number]>();
  for(const {mark,marks,point:[x,y]} of placed.filter(p=>p.mark.kind==='headquarters')){
    const w=marks?260:Math.max(135,Math.min(225,(mark.caption?.length??22)*8.2+14)),h=marks?marks.length*24+6:43;
    let chosen:[number,number,number,number]|undefined;
    for(let ring=0;ring<9&&!chosen;ring++)for(const side of [1,-1])for(const dy of [0,-1,1]){
      const left=side===1?x+34:x-w-34,top=y-14+dy*ring*22;
      const b:[number,number,number,number]=[left,top,left+w,top+h];
      if(b[0]<12||b[1]<12||b[2]>width-12||b[3]>height-12||occupied.some(a=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1]))continue;
      chosen=b;break;
    }
    if(chosen){occupied.push(chosen);result.set(mark.id,chosen);}
  }
  return result;
}
