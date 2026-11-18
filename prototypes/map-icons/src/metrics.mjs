// Flood-fill exterior on the native 20px mask. Enclosed holes become solid;
// open boundaries remain open. Internal details cannot rescue duplicate outlines.
export function silhouette(mask, size=20) {
  const exterior = Array(size*size).fill(0), queue=[];
  const add = i => { if (!mask[i] && !exterior[i]) {exterior[i]=1;queue.push(i);} };
  for(let x=0;x<size;x++) {add(x);add((size-1)*size+x);}
  for(let y=0;y<size;y++) {add(y*size);add(y*size+size-1);}
  for(let k=0;k<queue.length;k++) {
    const i=queue[k],x=i%size,y=Math.floor(i/size);
    if(x) add(i-1);if(x<size-1)add(i+1);if(y)add(i-size);if(y<size-1)add(i+size);
  }
  return exterior.map(x=>1-x);
}

export function similarity(a,b,size=20) {
  let best=0;
  for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) {
    let intersection=0, union=0;
    // Include the shifted mask's full extent, so clipping never inflates IoU.
    for(let y=-1;y<=size;y++) for(let x=-1;x<=size;x++) {
      const av=x>=0&&x<size&&y>=0&&y<size?a[y*size+x]:0;
      const bx=x-dx,by=y-dy;
      const bv=bx>=0&&bx<size&&by>=0&&by<size?b[by*size+bx]:0;
      if(av&&bv)intersection++;if(av||bv)union++;
    }
    best=Math.max(best,union?intersection/union:1);
  }
  return best;
}
