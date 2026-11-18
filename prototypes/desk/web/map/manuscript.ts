/** Seeded material rendering, independent of camera, time and game state. */
import type {Point} from './model.ts';
/** Bounded watercolour band with a pooled outer rim and visible pigment grain.
 * Render below the land mask so its inland half is removed, not blurred. */
export function waterPigment(c:CanvasRenderingContext2D,paths:readonly Path2D[],box:readonly number[],scale:number,pixels=12){
 const layer=document.createElement('canvas');layer.width=c.canvas.width;layer.height=c.canvas.height;
 const p=layer.getContext('2d',{willReadFrequently:true})!;p.setTransform(scale,0,0,scale,-box[0]!*scale,-box[1]!*scale);p.lineJoin='round';p.lineCap='round';
 // Each opaque inner pass replaces its predecessor. The final edge is finite.
 for(const [width,colour] of [[pixels*2,'#78979e'],[pixels*2-2.4,'#a6bdb7'],[pixels*1.4,'#acc1b9'],[pixels*.7,'#adc2b9']] as const){
  p.strokeStyle=colour;p.lineWidth=width/scale;for(const path of paths)p.stroke(path);
 }
 const data=p.getImageData(0,0,layer.width,layer.height),d=data.data;
 for(let y=0;y<layer.height;y++)for(let x=0;x<layer.width;x++){
  const i=(y*layer.width+x)*4;if(!d[i+3])continue;
  const wx=box[0]!+x/scale,wy=box[1]!+y/scale,n=grain(Math.floor(wx*scale),Math.floor(wy*scale),25),v=(n-.5)*18;
  d[i]=d[i]!+v;d[i+1]=d[i+1]!+v;d[i+2]=d[i+2]!+v;d[i+3]=d[i+3]!*(.54+n*.22);
 }
 p.putImageData(data,0,0);c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(layer,0,0);c.restore();layer.width=layer.height=1;
}
export function grain(x:number,y:number,seed=24){let n=(Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^seed)>>>0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;}
export function noise(x:number,y:number){const a=Math.floor(x),b=Math.floor(y),u=x-a,v=y-b,s=u*u*(3-2*u),t=v*v*(3-2*v);return (grain(a,b)*(1-s)+grain(a+1,b)*s)*(1-t)+(grain(a,b+1)*(1-s)+grain(a+1,b+1)*s)*t;}
/** Pressure and waver use absolute source coordinates, so panning never changes ink. */
export function ink(c:CanvasRenderingContext2D,points:readonly Point[],width:number,alpha=1,seed=0){
 if(points.length<2)return;
 const saved=c.globalAlpha;
 for(let i=1;i<points.length;i++){
  const a=points[i-1]!,b=points[i]!,length=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const count=Math.max(1,Math.ceil(length/Math.max(width*7,.18)));
  for(let j=0;j<count;j++){
   const t=j/count,t1=(j+1)/count,x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;
   const wobble=(noise(x*3+seed,y*3)-.5)*width*.9;
   c.globalAlpha=saved*alpha*(.67+.33*noise(x*2+18,y*2));c.lineWidth=width*(.65+.7*noise(x*4,y*4));
   c.beginPath();c.moveTo(x+wobble,y+wobble*.6);c.lineTo(a[0]+(b[0]-a[0])*t1+wobble*.8,a[1]+(b[1]-a[1])*t1-wobble*.4);c.stroke();
  }
 }
 for(const p of [points[0]!,points.at(-1)!]){c.globalAlpha=saved*alpha*.4;c.beginPath();c.arc(...p,width*.63,0,Math.PI*2);c.fillStyle=c.strokeStyle;c.fill();}
 c.globalAlpha=saved;
}
/** One material pass per static band. Fibres, foxing and folds share world coordinates. */
export function agePaper(c:CanvasRenderingContext2D,box:readonly number[],scale:number){
 const {width,height}=c.canvas,data=c.getImageData(0,0,width,height),d=data.data;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const wx=box[0]!+x/scale,wy=box[1]!+y/scale;
  const broad=(noise(wx/27,wy/24)-.5)*10+(noise(wx/5,wy/5)-.5)*3;
  const fibre=(grain(Math.floor(wx*92),Math.floor(wy*11))-.5)*3.3;
  const fine=(grain(Math.floor(wx*160),Math.floor(wy*160))-.5)*2.5;
  const fx=((wx+4)%19+19)%19,fy=((wy+2)%15+15)%15;
  const fold=(t:number)=>-Math.exp(-(((t-.12)/.075)**2))*9+Math.exp(-(((t-.22)/.09)**2))*7-Math.exp(-(((t-.34)/.16)**2))*2;
  const crease=fold(fx)+fold(fy);
  const edge=Math.max(0,(Math.abs(wx-170)-280)/100,(Math.abs(wy+15)-180)/80);
  const stain=noise(wx/.7,wy/.7)>.79?(noise(wx/.7,wy/.7)-.79)*14:0;
  const shift=broad+fibre+fine+crease-edge*8-stain;
  const i=(y*width+x)*4;d[i]=Math.max(0,d[i]!+shift);d[i+1]=Math.max(0,d[i+1]!+shift-stain*.3);d[i+2]=Math.max(0,d[i+2]!+shift-stain*.8);
 }
 c.putImageData(data,0,0);
 // Sparse elongated fibres and rusty foxing. Never a repeating raster tile.
 c.save();c.setTransform(scale,0,0,scale,-box[0]!*scale,-box[1]!*scale);
 for(let y=Math.floor(box[1]!);y<box[3]!;y+=.44)for(let x=Math.floor(box[0]!);x<box[2]!;x+=.63){
  const n=grain(Math.round(x*100),Math.round(y*100));
  if(n>.982){c.fillStyle='#84542d';c.globalAlpha=.035+n*.025;c.beginPath();c.ellipse(x,y,.035+n*.028,.022+n*.016,n*3,0,Math.PI*2);c.fill();}
  else if(n>.61){c.strokeStyle=n>.8?'#fff9e0':'#735334';c.globalAlpha=.035;c.lineWidth=.007;c.beginPath();c.moveTo(x,y);c.lineTo(x+.08+n*.12,y+.013);c.stroke();}
 }
 c.restore();
}
export function paintWash(c:CanvasRenderingContext2D,path:Path2D,bounds:readonly number[],colour:string,strength:number,scale:number){
 c.save();c.clip(path,'evenodd');c.fillStyle=colour;c.globalAlpha=strength*.13;c.fill(path,'evenodd');
 // The outer half is clipped off: the remaining band fades towards the centre.
 c.strokeStyle=colour;c.lineCap='butt';c.setLineDash([.035,.10]);
 for(const [width,a] of [[.8,.035],[.44,.05],[.22,.08],[.065,.13]] as const){c.lineWidth=width;c.globalAlpha=strength*a;c.stroke(path);}
 c.setLineDash([]);
 for(let y=bounds[1]!;y<bounds[3]!;y+=.24)for(let x=bounds[0]!;x<bounds[2]!;x+=.29){
  const n=grain(Math.round(x*100),Math.round(y*100));c.globalAlpha=strength*(.015+n*.04);c.beginPath();c.ellipse(x,y,.16+n*.17,.09+n*.1,n*3,0,Math.PI*2);c.fill();
  if(n>.92){c.globalAlpha=strength*.025;c.lineWidth=.02;c.beginPath();c.ellipse(x,y,.2,.14,n*3,0,Math.PI*2);c.stroke();}
 }
 c.restore();
}
