/** R39 offline proof only. Renders shipped subtiles at native working zoom. */
import {ink} from './map/manuscript.ts';
import {PALETTES} from './map/skins.ts';
import {CONTROL_PALETTES} from './map/control-palettes.ts';
import {controlOpacity} from './map/control.ts';
import type {ControlBelief} from './map/control.ts';
import hq from './map/icons/hq-army.svg?raw';
const luminance=(d:Uint8ClampedArray,i:number)=>[.2126,.7152,.0722].reduce((s,w,k)=>{let v=d[i+k]!/255;v=v<=.04045?v/12.92:((v+.055)/1.055)**2.4;return s+w*v;},0);
const ratio=(a:number,b:number)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
const q=(a:number[],p:number)=>a.sort((a,b)=>a-b)[Math.floor((a.length-1)*p)]??1;
(window as any).contrastProof=async(onlyBand?:string,sampling='nearest-min')=>{
 const font=new FontFace('Standard','url(/fonts/old-standard-regular.woff2)');await font.load();document.fonts.add(font);
 const manifest=await fetch('/public/map-data/union-1861-signs/manifest.json').then(r=>r.json());
 const image=new Image();image.src='/public/map-data/union-1861-signs/geographic.png';await image.decode();
 const reports:Record<string,HTMLImageElement>={};for(const palette of ['research','strong'] as const){const report=new Image();report.src=`data:image/svg+xml,${encodeURIComponent(hq.replace('<svg ','<svg width="30" height="30" ').replaceAll('currentColor',`#${CONTROL_PALETTES[palette].colours.friendly.toString(16).padStart(6,'0')}`).replace(/stroke-width="var[^"]*"/,'stroke-width="1.3"'))}`;await report.decode();reports[palette]=report;}
 const records:any[]=[],proof=document.createElement('canvas');proof.width=1200;proof.height=(onlyBand?12:36)*110;const pc=proof.getContext('2d')!;let row=0;
 for(const band of manifest.bands.filter((b:any)=>!onlyBand||b.name===onlyBand)){const zoom={wide:3.029,theatre:11.949,close:16.966}[band.name as 'wide'|'theatre'|'close'];
  for(const palette of ['research','strong'] as const)for(const paint of ['friendly','enemy','neutral'] as const)for(const depth of [1,.72]){
   const swatch=()=>{const c=document.createElement('canvas');c.width=160;c.height=100;return c;};
   const wash=CONTROL_PALETTES[palette],colour=`#${wash.colours[paint].toString(16).padStart(6,'0')}`;
   const belief={asOfDay:0,mark:'ink'} as ControlBelief,alpha=controlOpacity(belief,0)*wash.middle*depth;
   const ground=swatch(),g=ground.getContext('2d')!;g.fillStyle=PALETTES.A.paper;g.fillRect(0,0,160,100);g.fillStyle=colour;g.globalAlpha=alpha;g.fillRect(0,0,160,100);
   const groundData=g.getImageData(0,0,160,100).data;
   const metric=(canvas:HTMLCanvasElement)=>{const d=canvas.getContext('2d')!.getImageData(0,0,160,100).data,vs:number[]=[];for(let i=0;i<d.length;i+=4){const a=luminance(d,i),b=luminance(groundData,i);if(Math.abs(a-b)>.012)vs.push(ratio(a,b));}return {coreP90:q(vs,.9),pixels:vs.length};};
   const reference=(kind:'rail'|'name'|'report'|'front')=>{const c=swatch(),x=c.getContext('2d')!;
    if(kind==='rail'){
     // Rasterize at the same source band density before the same native resize.
     const scale=band.name==='wide'?4:16,source=document.createElement('canvas');source.width=160*scale/zoom;source.height=100*scale/zoom;
     const s=source.getContext('2d')!;s.scale(scale,scale);s.strokeStyle=PALETTES.A.rail;s.lineCap='round';s.globalAlpha=.86;
     ink(s,[[12/zoom,50/zoom],[148/zoom,50/zoom]],.044,.92);
     s.globalAlpha=.86;s.lineCap='butt';s.lineWidth=.13;s.setLineDash([.014,.20]);s.beginPath();s.moveTo(12/zoom,50/zoom);s.lineTo(148/zoom,50/zoom);s.stroke();
     x.fillStyle=PALETTES.A.paper;x.fillRect(0,0,160,100);x.drawImage(source,0,0,160,100);x.fillStyle=colour;x.globalAlpha=alpha;x.fillRect(0,0,160,100);
    }else{x.drawImage(ground,0,0);if(kind==='name'){x.font='14px Standard';x.lineWidth=3;x.strokeStyle=PALETTES.A.paper;x.strokeText('Washington',20,55);x.fillStyle=PALETTES.A.ink;x.fillText('Washington',20,55);}
     if(kind==='report'){x.globalAlpha=.92;x.drawImage(reports[palette]!,65,35,30,30);}
     if(kind==='front'){x.strokeStyle=`#${wash.colours.friendly.toString(16).padStart(6,'0')}`;x.globalAlpha=.96;x.lineWidth=3.7;x.beginPath();x.moveTo(12,50);x.lineTo(148,50);x.stroke();}}
    return {canvas:c,...metric(c)};
   };
   const refs={rail:reference('rail'),name:reference('name'),report:reference('report'),front:reference('front')};
   const signs=band.signs.map((sign:any)=>{const c=swatch(),x=c.getContext('2d')!;x.fillStyle=PALETTES.A.paper;x.fillRect(0,0,160,100);
    const f=sign.atlasFrame,k=sign.factor*zoom,density=sign.texelDensity??1,trim=sign.atlasTrim??[0,0,80,64];
    x.imageSmoothingEnabled=!(sampling==='nearest-min'&&k<density);
    x.drawImage(image,...f as [number,number,number,number],80+(trim[0]/density-40)*k,50+(trim[1]/density-32)*k,trim[2]/density*k,trim[3]/density*k);x.fillStyle=colour;x.globalAlpha=alpha;x.fillRect(0,0,160,100);
    return {id:sign.id,kind:sign.kind,canvas:c,...metric(c)};
   });
   const upper=Math.min(refs.name.coreP90,refs.report.coreP90,refs.front.coreP90),lower=refs.rail.coreP90;
   records.push({band:band.name,palette,paint,depth,alpha,target:{railMultiplier:1,upper:'minimum current report/front/name core'},references:Object.fromEntries(Object.entries(refs).map(([k,v])=>[k,{coreP90:v.coreP90,pixels:v.pixels}])),signs:signs.map(({canvas,...s}:any)=>({...s,passesRail:s.coreP90>=lower,passesPriority:s.coreP90<upper}))});
   pc.fillStyle='#fff';pc.fillRect(0,row*110,1200,110);pc.fillStyle='#000';pc.font='12px serif';pc.fillText(`${band.name} ${palette} ${paint} ${depth}`,5,row*110+14);
   [refs.rail,refs.report,refs.front,refs.name,...signs.filter((s:any)=>s.kind==='capital'||s.kind==='mountain').slice(0,2)].forEach((s,i)=>pc.drawImage(s.canvas,200+i*160,row*110));row++;
  }
 }
 return {records,png:proof.toDataURL('image/png').split(',')[1]};
};
