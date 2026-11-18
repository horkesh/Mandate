import {mapProjection} from './projection.ts';
import { Application, Container, Graphics, Sprite, Text, Texture } from 'pixi.js';
import { geoAlbers, geoMercator, geoPath, geoDistance } from 'd3-geo';
import type { GeoProjection } from 'd3-geo';
import type { GeoPermissibleObjects } from 'd3-geo';
import type { GeoShape, MapGeometry, MapModel, MapRegion, Point } from './model.ts';
import { placeMarks, placeCaptions } from './placement.ts';
import { geographicBounds, roughRings } from './atlas.ts';
import { loadAtlas } from './atlas-disk.ts';
import { broadArrow, hatchRings, lineBoxes } from './strokes.ts';
import type { BakedAtlas } from './atlas.ts';
import { grain } from './manuscript.ts';
import { graticuleTicks } from './graticule.ts';
import { PALETTES } from './skins.ts';
import {OPENING_FRAMES} from './framing.ts';
import {labelPolicy,labelVisible} from './label-visibility.ts';
import type { Look } from './skins.ts';
import {controlColour,controlOpacity,sharedFront,contactMark,CONTROL_COLOURS} from './control.ts';

type Box = [number, number, number, number];
type Painted = { path: Path2D; bbox: Box; kind: string; rank: number };
export interface PencilRoute { number: number; post: string; axis: string; regions: readonly string[]; strike: boolean }
export interface StudyMarks {
  washes: {regions:string[];permille:number;contested?:boolean;side:'friendly'|'opposing'}[];
  front:Point[];enemySide:Point;draft:Point[];revision:Point[];
  estimate:{point:Point;text:string};draftLabel:{point:Point;text:string};
}

const CAP = 96 * 1024 * 1024;
const overlaps = (a: Box,b: Box) => a[0] <= b[2] && a[2] >= b[0] && a[1] <= b[3] && a[3] >= b[1];

/** Pixi owns the camera, labels and live marks. Canvas2D bakes the fixed static atlas (R22). */
export class StaffRenderer {
  app = new Application();
  projection: GeoProjection;
  camera = { x: 0, y: 0, z: 1, fit: 1 };
  private world = new Container();
  private content = new Container();
  private frameMask = new Graphics();
  private tiles = new Container();
  private arrows = new Graphics();
  private washes = new Graphics();
  private labels = new Container();
  private geometry: MapGeometry;
  private regions: MapRegion[];
  private regionPaths = new Map<string, Painted>();
  private cacheBytes = 0;
  private frame = 0;
  private dead = false;
  private model: MapModel = { marks: [], plans: [], control:{}, fronts:[], faction:null,day:0,unplaced: [], absent: [] };
  private claimChanges=new Map<string,number>();
  private frontPaths=new Map<string,Point[][]>();
  private controlCounts={regions:0,fronts:0,contacts:0,animating:0};
  private pencil: PencilRoute[] = [];
  private reviewPost: string | null = null;
  private bounds: Box;
  private observer?: ResizeObserver;
  private cleanup: (() => void)[] = [];
  private paintCount = 0;
  private hovered: string | null = null;
  private onCamera: () => void;
  ready = false;
  look: Look = '0';
  private atlas?: BakedAtlas;
  private atlasSprites: {sprite:Sprite;minZoom:number}[]=[];
  private frameTimes:number[]=[];
  private startup:{created:number;constructorDone?:number;appReady?:number;atlasReady?:number;firstRender?:number;lastRender?:number;lastOverlay?:number;draws:number}={created:performance.now(),draws:0};
  private textCache=new Map<string,Text>();
  private regionAngles=new Map<string,number>();
  private labelPolicies=new Map<string,ReturnType<typeof labelPolicy>>();
  private labelEligibility=new Map<string,boolean>();
  private omittedLabels:{id:string;point:Point;box:Box;collision:boolean}[]=[];
  private study:StudyMarks|null=null;
  private regionRings=new Map<string,Point[][][]>();
  private liveObstacles:Box[]=[];
  private riverObstacles:Box[]=[];
  private overlayBoxes:Box[]=[];
  captionReservations:Box[]=[];
  private atlasGeneration=0;
  private atlasLoading=false;
  private overlaySignature='';
  setStudy(study:StudyMarks|null){if(this.study===study)return;this.study=study;if(this.ready)void this.installAtlas();this.invalidate();}
  setLook(look:Look){if(this.look===look)return;this.look=look;if(this.ready)void this.installAtlas();this.invalidate();}
  private async installAtlas(){
    const generation=++this.atlasGeneration;this.atlasLoading=true;this.host.dataset.ready='loading';
    const atlas=await loadAtlas(this.geometry.pack,this.look,this.appearance.contrast,this.appearance.lamp,!!this.study);
    if(this.dead||generation!==this.atlasGeneration)return;
    this.atlasLoading=false;
    for(const {sprite} of this.atlasSprites)sprite.destroy({texture:true,textureSource:true});
    this.tiles.removeChildren();this.atlasSprites=[];
    this.atlas=atlas;
    for(const band of this.atlas.bands){
      const sprite=new Sprite(Texture.from(band.canvas,true));sprite.position.set(band.box[0],band.box[1]);sprite.scale.set(1/band.scale);
      this.tiles.addChild(sprite);this.atlasSprites.push({sprite,minZoom:band.minZoom});
    }
    this.cacheBytes=this.atlas.bytes;this.paintCount=0;this.invalidate();
    this.startup.atlasReady=performance.now();
  }
  fitGeographic(box:Box){
    const [x0,y0,x1,y1]=geographicBounds(this.projection,box),w=this.app.screen.width,h=this.app.screen.height;
    const z=Math.min((w-120)/(x1-x0),(h-110)/(y1-y0));
    this.camera.z=z;this.camera.x=w/2-(x0+x1)/2*z;this.camera.y=h/2-(y0+y1)/2*z;this.invalidate();
  }
  resetTimings(){this.frameTimes=[];}

  private appearance = { contrast: false, lamp: false, mapScale: 100 };
  setAppearance(value: { contrast: boolean; lamp: boolean; mapScale: number }) {
    if (value.contrast === this.appearance.contrast && value.lamp === this.appearance.lamp && value.mapScale === this.appearance.mapScale) return;
    this.appearance = { contrast: value.contrast, lamp: value.lamp, mapScale: value.mapScale };
    this.tiles.removeChildren();
    this.cacheBytes = 0;if(this.ready)void this.installAtlas(); this.invalidate();
  }

  constructor(private host: HTMLElement, geometry: MapGeometry, onCamera: () => void) {
    this.geometry = geometry; this.regions = geometry.regions; this.onCamera = onCamera;
    for(const region of this.regions)this.labelPolicies.set(region.id,labelPolicy(region));
    this.projection = geometry.schematic ? geoMercator().center([-1.4,52]).scale(20000).translate([0,0]) : mapProjection(false);
    const path = geoPath(this.projection);
    const make = (shape: GeoShape,kind: string,rank=0): Painted => {
      const object = shape as GeoPermissibleObjects;
      const b = path.bounds(object);
      return { path: new Path2D(path(object) ?? ''), bbox: [b[0][0],b[0][1],b[1][0],b[1][1]], kind, rank };
    };
    this.regionAngles=new Map(Object.entries(geometry.regionAngles??{}));
    for (const r of this.regions) if (r.shape) this.regionPaths.set(r.id,make(r.shape,'region'));
    const points = this.regions.filter(r => r.point && !['off_map','off-map'].includes(r.kind)).map(r => this.project(r.point!));
    // Reference points alone miss northern Maine and other outlying vertices.
    for(const path of this.regionPaths.values())points.push([path.bbox[0],path.bbox[1]],[path.bbox[2],path.bbox[3]]);
    this.bounds = [Math.min(...points.map(p=>p[0]))-15, Math.min(...points.map(p=>p[1]))-15, Math.max(...points.map(p=>p[0]))+15, Math.max(...points.map(p=>p[1]))+15];
    this.startup.constructorDone=performance.now();
  }

  async init(openOnPack=false) {
    await document.fonts.load('18px Fell');
    const rect=this.host.getBoundingClientRect();
    await this.app.init({ width: Math.max(1,rect.width), height: Math.max(1,rect.height), preference: 'webgl', antialias:true, resolution:Math.min(window.devicePixelRatio,2), autoDensity:true, autoStart:false, backgroundAlpha:0 });
    this.startup.appReady=performance.now();
    if (this.dead) { this.app.destroy(true,{children:true,texture:true,textureSource:true}); return; }
    this.host.append(this.app.canvas);
    this.app.canvas.setAttribute('aria-hidden','true');
    this.app.stage.addChild(this.content,this.frameMask);
    this.content.addChild(this.world,this.labels);
    this.content.mask=this.frameMask;
    this.world.addChild(this.tiles,this.washes,this.arrows);
    await this.installAtlas();if(this.dead)return;this.ready=true;if(openOnPack)this.fitOpening();else this.fit();if(this.reviewPost)this.fitPlan();
    this.observer=new ResizeObserver(() => {
      const box=this.host.getBoundingClientRect();
      // The observer also fires once on attachment. Refitting an unchanged
      // canvas would undo a place selected through Find during initialization.
      if (Math.abs(box.width-this.app.screen.width)<1 && Math.abs(box.height-this.app.screen.height)<1) return;
      this.app.renderer.resize(box.width,box.height); this.fit();
    });
    this.observer.observe(this.host);
    // HTML titles, reports and captions participate in the same label pass.
    // Watch layout changes without moving any sign or its reported anchor.
    const overlays=new MutationObserver(()=>{if(this.readOverlayBoxes())this.invalidate();});
    overlays.observe(this.host.closest('.playable-table,.map-study')??this.host.parentElement!,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class']});
    this.cleanup.push(()=>overlays.disconnect());
    let drag: { x:number; y:number; originalX:number; originalY:number } | null=null;
    const down=(e:PointerEvent) => {
      if(e.button!==0)return;
      drag={x:e.clientX,y:e.clientY,originalX:this.camera.x,originalY:this.camera.y};
      this.host.setPointerCapture(e.pointerId);
    };
    const move=(e:PointerEvent) => {
      if(drag) { this.camera.x=drag.originalX+e.clientX-drag.x; this.camera.y=drag.originalY+e.clientY-drag.y; this.invalidate(); }
      else { const rect=this.host.getBoundingClientRect(); const id=this.pick(e.clientX-rect.left,e.clientY-rect.top)?.id??null; if(id!==this.hovered){this.hovered=id;this.invalidate();} }
    };
    const up=()=> {drag=null;};
    const leave=()=>{if(!drag&&this.hovered){this.hovered=null;this.invalidate();}};
    const wheel=(e:WheelEvent) => { e.preventDefault(); const rect=this.host.getBoundingClientRect(); this.zoom(Math.exp(-e.deltaY*.0012),e.clientX-rect.left,e.clientY-rect.top); };
    this.host.addEventListener('pointerdown',down); this.host.addEventListener('pointermove',move); this.host.addEventListener('pointerup',up); this.host.addEventListener('pointercancel',up); this.host.addEventListener('pointerleave',leave); this.host.addEventListener('wheel',wheel,{passive:false});
    this.cleanup.push(()=>{this.host.removeEventListener('pointerdown',down);this.host.removeEventListener('pointermove',move);this.host.removeEventListener('pointerup',up);this.host.removeEventListener('pointercancel',up);this.host.removeEventListener('pointerleave',leave);this.host.removeEventListener('wheel',wheel);});
    this.invalidate();
  }
  project(point: Point): Point { return this.projection(point) as Point; }
  scaleMiles() {
    if(this.geometry.schematic || !this.projection.invert)return null;
    const x=(this.app.screen.width/2-this.camera.x)/this.camera.z,y=(this.app.screen.height/2-this.camera.y)/this.camera.z;
    const a=this.projection.invert([x,y]),b=this.projection.invert([x+100/this.camera.z,y]);
    return a&&b?geoDistance(a,b)*3958.7613:null;
  }
  scaleBar(){const raw=this.scaleMiles();if(!raw)return null;const unit=10**Math.floor(Math.log10(raw));const miles=[1,2,5,10].map(n=>n*unit).filter(n=>n<=raw).at(-1)??unit;return {miles,pixels:100*miles/raw};}
  screen(region: string): Point | null { const r=this.regions.find(r=>r.id===region); if(!r?.point)return null;const [x,y]=this.project(r.point);return [x*this.camera.z+this.camera.x,y*this.camera.z+this.camera.y]; }
  /** The neat line belongs to the canvas, independent of the camera. */
  frameScreen(): Box {
    return [0,0,this.app.screen.width,this.app.screen.height];
  }
  degreeTicks(){
    return this.geometry.schematic||!this.ready?[]:graticuleTicks(this.projection,this.camera,this.app.screen.width,this.app.screen.height);
  }
  hoveredRegion(){return this.regions.find(r=>r.id===this.hovered)??null;}
  northAngle(){
    const {x,y,z}=this.camera;
    const centre=this.projection.invert?.([(this.app.screen.width/2-x)/z,(this.app.screen.height/2-y)/z]);
    if(!centre)return 0;
    const a=this.project(centre),b=this.project([centre[0],Math.min(89.99,centre[1]+.01)]);
    return Math.atan2(b[0]-a[0],a[1]-b[1])*180/Math.PI;
  }
  /** Reading navigates the camera only, preserving the current map scale. */
  revealRegion(id:string,smooth=true){
    const p=this.screen(id);if(!p)return;
    const w=this.app.screen.width,h=this.app.screen.height;
    if(p[0]>w*.3&&p[0]<w*.78&&p[1]>140&&p[1]<h-230)return;
    const dx=w*.57-p[0],dy=h*.48-p[1],start={...this.camera};
    if(!smooth){this.pan(dx,dy);return;}
    const began=performance.now(),step=()=>{
      if(this.dead)return;const t=Math.min(1,(performance.now()-began)/480),e=t*t*(3-2*t);
      this.camera.x=start.x+dx*e;this.camera.y=start.y+dy*e;this.invalidate();
      if(t<1)requestAnimationFrame(step);
    };requestAnimationFrame(step);
  }
  private maximumZoom(){
    if(this.geometry.schematic)return this.camera.fit*60;
    const a=this.regions.find(r=>r.id==='manassas')?.point,b=this.regions.find(r=>r.id==='washington')?.point;
    if(!a||!b)return this.camera.fit*60;
    const p=this.project(a),q=this.project(b);
    // Keep the western hills in view. Tighter frames magnify mostly empty
    // Fairfax farmland: the pack has neither a road layer nor rail stations.
    return Math.min((this.app.screen.width-180)/Math.abs(p[0]-q[0]),(this.app.screen.height-240)/Math.abs(p[1]-q[1]),this.app.screen.height/12);
  }
  closestManassas(){
    const a=this.regions.find(r=>r.id==='manassas')?.point,b=this.regions.find(r=>r.id==='washington')?.point;
    if(!a||!b)return;
    const p=this.project(a),q=this.project(b);this.camera.z=this.maximumZoom();
    this.camera.x=this.app.screen.width/2-(p[0]+q[0])/2*this.camera.z;
    this.camera.y=this.app.screen.height/2-(p[1]+q[1])/2*this.camera.z;this.invalidate();
  }
  private constrainCamera() {
    const maximum=this.maximumZoom();
    if(this.camera.z>maximum){const old=this.camera.z;this.camera.z=maximum;this.camera.x=this.app.screen.width/2-(this.app.screen.width/2-this.camera.x)*maximum/old;this.camera.y=this.app.screen.height/2-(this.app.screen.height/2-this.camera.y)*maximum/old;}
    const coverage=this.geometry.baseCoverage;if(!coverage)return;
    const [left,top,right,bottom]=coverage.worldBounds,w=this.app.screen.width,h=this.app.screen.height;
    const old=this.camera.z,z=Math.max(old,w/(right-left),h/(bottom-top));
    if(z!==old){this.camera.x=w/2-(w/2-this.camera.x)*z/old;this.camera.y=h/2-(h/2-this.camera.y)*z/old;this.camera.z=z;}
    this.camera.x=Math.max(w-right*z,Math.min(-left*z,this.camera.x));
    this.camera.y=Math.max(h-bottom*z,Math.min(-top*z,this.camera.y));
  }
  setData(model: MapModel, pencil: PencilRoute[], reviewPost: string | null) {
    const changed=this.reviewPost!==reviewPost;
    for(const [id,belief] of Object.entries(model.control))if(JSON.stringify(belief)!==JSON.stringify(this.model.control[id as keyof typeof this.model.control]))this.claimChanges.set(id,performance.now());
    this.model=model;this.pencil=pencil;this.reviewPost=reviewPost;
    if(changed&&reviewPost&&this.ready)this.fitPlan();this.invalidate();
  }
  fit() {
    const w=this.app.screen.width,h=this.app.screen.height,[x0,y0,x1,y1]=this.bounds;
    const z=Math.min((w-100)/(x1-x0),(h-100)/(y1-y0));
    this.camera={x:w/2-(x0+x1)/2*z,y:h/2-(y0+y1)/2*z,z,fit:z};
    if(!this.geometry.schematic)this.fitGeographic([-102,29,-69,44.5]);else this.invalidate();
  }
  fitOpening(){
    this.fit();
    const box=OPENING_FRAMES[this.geometry.pack];if(box)this.fitGeographic(box);
  }
  private labelZoom(){
    if(this.geometry.schematic)return this.camera.z/this.camera.fit;
    const [x0,y0,x1,y1]=geographicBounds(this.projection,[-102,29,-69,44.5]);
    return this.camera.z/Math.min((this.app.screen.width-120)/(x1-x0),(this.app.screen.height-110)/(y1-y0));
  }
  fitPlan() {
    if(!this.ready)return;
    const ids=[...this.model.plans.filter(p=>p.post===this.reviewPost).flatMap(p=>p.plan.axes.flatMap(a=>a.regions)),...this.pencil.flatMap(p=>p.regions)];
    const points=ids.map(id=>this.regions.find(r=>r.id===id)?.point).filter((p):p is Point=>!!p).map(p=>this.project(p));
    if(!points.length){this.fit();return;}
    const x0=Math.min(...points.map(p=>p[0])),x1=Math.max(...points.map(p=>p[0])),y0=Math.min(...points.map(p=>p[1])),y1=Math.max(...points.map(p=>p[1]));
    const z=Math.min(this.camera.fit*8,(this.app.screen.width-240)/Math.max(80,x1-x0),(this.app.screen.height-220)/Math.max(80,y1-y0));
    this.camera.z=z;this.camera.x=this.app.screen.width/2-(x0+x1)/2*z;this.camera.y=this.app.screen.height/2-(y0+y1)/2*z;this.invalidate();
  }
  focusRegion(id: string, factor=4) {
    const r=this.regions.find(r=>r.id===id); if(!r?.point)return;
    const p=this.project(r.point);this.camera.z=this.camera.fit*factor;
    this.camera.x=this.app.screen.width/2-p[0]*this.camera.z;this.camera.y=this.app.screen.height/2-p[1]*this.camera.z;this.invalidate();
  }
  pan(x: number,y: number) {this.camera.x+=x;this.camera.y+=y;this.invalidate();}
  zoom(factor: number,x=this.app.screen.width/2,y=this.app.screen.height/2) {
    const old=this.camera.z,z=Math.max(this.camera.fit*.8,Math.min(this.maximumZoom(),old*factor));
    this.camera.x=x-(x-this.camera.x)*z/old;this.camera.y=y-(y-this.camera.y)*z/old;this.camera.z=z;this.invalidate();
  }
  /** Exact canvas even-odd hit test with the tripwire's 12px priority for small regions. */
  pick(x:number,y:number):MapRegion | null {
    const [left,top,right,bottom]=this.frameScreen();
    if(x<left||y<top||x>right||y>bottom)return null;
    const wx=(x-this.camera.x)/this.camera.z,wy=(y-this.camera.y)/this.camera.z;
    const ctx=document.createElement('canvas').getContext('2d')!;
    const candidates=this.regions.map(r=>({r,p:r.point?this.screen(r.id):null,path:this.regionPaths.get(r.id)}));
    const small=candidates.filter(({r,p,path})=>p && (this.geometry.schematic || !path || Math.max(path.bbox[2]-path.bbox[0],path.bbox[3]-path.bbox[1])*this.camera.z<=28) && Math.hypot(p[0]-x,p[1]-y)<=12)
      .sort((a,b)=>Math.hypot(a.p![0]-x,a.p![1]-y)-Math.hypot(b.p![0]-x,b.p![1]-y));
    if(small[0])return small[0].r;
    return candidates.filter(({path})=>path && wx>=path.bbox[0] && wx<=path.bbox[2] && wy>=path.bbox[1] && wy<=path.bbox[3] && ctx.isPointInPath(path.path,wx,wy,'evenodd'))
      .sort((a,b)=>(a.path!.bbox[2]-a.path!.bbox[0])*(a.path!.bbox[3]-a.path!.bbox[1])-(b.path!.bbox[2]-b.path!.bbox[0])*(b.path!.bbox[3]-b.path!.bbox[1]))[0]?.r??null;
  }
  private invalidate() {if(!this.ready||this.dead||this.atlasLoading)return;this.constrainCamera();if(this.frame)return;this.host.dataset.ready='baking';this.frame=requestAnimationFrame(()=>{this.frame=0;this.draw();});}
  private draw() {
    if(this.dead)return;
    const started=performance.now();
    this.world.position.set(this.camera.x,this.camera.y);this.world.scale.set(this.camera.z);
    const [left,top,right,bottom]=this.frameScreen();
    this.frameMask.clear().rect(left,top,right-left,bottom-top).fill(0xffffff);
    for(const band of this.atlasSprites)band.sprite.visible=this.camera.z>=band.minZoom;
    this.readOverlayBoxes();this.drawControl();this.drawArrows();this.drawLabels();
    this.app.render();this.startup.firstRender??=performance.now();this.startup.lastRender=performance.now();this.host.dataset.ready='ready';this.onCamera();
    this.startup.lastOverlay=performance.now();this.startup.draws++;this.host.dataset.startup=JSON.stringify(this.startup);
    this.host.dataset.control=JSON.stringify({...this.controlCounts,beliefs:Object.keys(this.model.control).length,segments:this.model.fronts.length,approvedRoutes:this.model.plans.filter(p=>p.approved).length,changed:[...this.claimChanges.keys()],points:this.regions.filter(r=>r.point).map(r=>({id:r.id,point:this.screen(r.id)})),reducedMotion:window.matchMedia('(prefers-reduced-motion: reduce)').matches});
    this.frameTimes.push(performance.now()-started);if(this.frameTimes.length>600)this.frameTimes.shift();
    if(this.controlCounts.animating)this.invalidate();
  }
  private rings(id:string){
    if(!this.regionRings.has(id)){const region=this.regions.find(r=>r.id===id);if(region?.shape&&!['sea','river','off_map'].includes(region.kind))this.regionRings.set(id,roughRings(region.shape,this.projection));}
    return this.regionRings.get(id)??[];
  }
  private progress(id:string){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return 1;
    const began=this.claimChanges.get(id);return began===undefined?1:Math.min(1,(performance.now()-began)/900);
  }
  private drawControl(){
    const g=this.washes,z=this.camera.z;g.clear();this.controlCounts={regions:0,fronts:0,contacts:0,animating:0};
    const frame=this.frameScreen(),visible=(id:string)=>{const b=this.regionPaths.get(id)?.bbox;return !b||(b[2]*z+this.camera.x>frame[0]&&b[0]*z+this.camera.x<frame[2]&&b[3]*z+this.camera.y>frame[1]&&b[1]*z+this.camera.y<frame[3]);};
    for(const [id,belief] of Object.entries(this.model.control)){
      if(!visible(id))continue;
      const rings=this.rings(id),progress=this.progress(id);if(progress<1)this.controlCounts.animating++;
      if(!rings.length||(!belief.neutralGovernment&&!Object.values(belief.shares).some(s=>s>0)))continue;
      this.controlCounts.regions++;
      const shares=Object.entries(belief.shares).filter(([,s])=>s>0).sort((a,b)=>b[1]-a[1]||(a[0]<b[0]?-1:1));
      const neutral=belief.neutralGovernment&&!belief.holder&&!belief.contested;
      const colour=this.appearance.contrast?0x182d4c:controlColour(belief.holder??shares[0]?.[0]??null,this.model.faction,neutral);
      const alpha=controlOpacity(belief,this.model.day)*(.3+.7*progress),strength=neutral?1:Math.max(...shares.map(([,s])=>s),0)/1000;
      for(const polygon of rings){
        const ring=polygon[0];if(!ring?.length)continue;
        g.poly(ring.flat()).fill({color:colour,alpha:alpha*strength});for(const hole of polygon.slice(1))g.poly(hole.flat()).cut();
        // Transparent, overlapping pools retain the linen and hachures below.
        // Narrow rim widths are in screen pixels; holes retain their own rim.
        for(const edge of polygon)for(let i=1;i<edge.length;i++){
          const a=edge[i-1]!,b=edge[i]!,n=grain(Math.round(a[0]*100),Math.round(a[1]*100),29);
          if(belief.mark==='pencil'&&i%5===0)continue;
          if((i/edge.length)>progress)continue;
          for(const [width,factor] of [[9,.17],[4,.3],[1.4,.8]] as const)g.moveTo(...a).lineTo(...b).stroke({color:colour,width:width/z,alpha:alpha*factor*(.7+n*.3)});
        }
        const hatchSpacing=belief.contested?16:27;
        for(const [k,[a,b]] of hatchRings(polygon,hatchSpacing*Math.SQRT2/z).entries()){
          const n=grain(k,Math.round(a[0]*100),29);
          if(belief.contested){
            g.moveTo(...a).lineTo(...b).stroke({color:colour,width:.9/z,alpha:alpha*1.15*progress});
          }else if(n>.35){
            const t=n*.7,dx=b[0]-a[0],dy=b[1]-a[1],fraction=Math.min(.12,10/(Math.hypot(dx,dy)*z));
            g.moveTo(a[0]+dx*t,a[1]+dy*t).lineTo(a[0]+dx*(t+fraction),a[1]+dy*(t+fraction)).stroke({color:colour,width:(3+n*4)/z,alpha:alpha*.11});
          }
        }
        if(belief.contested){const second=shares.find(([f])=>f!==(belief.holder??shares[0]?.[0]));
          if(second)for(const [a,b] of hatchRings(polygon,16*Math.SQRT2/z,-1))g.moveTo(...a).lineTo(...b).stroke({color:controlColour(second[0],this.model.faction),width:.9/z,alpha:alpha*1.15*progress});
        }
      }
    }
  }
  private drawFronts(){
    const g=this.arrows,z=this.camera.z;
    // One orientation is drawn: the president's front faces the opposing end.
    for(const front of this.model.fronts.filter(f=>f.faction===this.model.faction)){
      const own=this.regions.find(r=>r.id===front.own)?.point,enemy=this.regions.find(r=>r.id===front.faces)?.point;if(!own||!enemy)continue;
      const key=`${front.own}:${front.faces}`;let lines=this.frontPaths.get(key);
      if(!lines){lines=sharedFront(this.rings(front.own),this.rings(front.faces));if(!lines.length){lines=[contactMark(this.rings(front.own),this.project(own),this.project(enemy))];}this.frontPaths.set(key,lines);}
      const colour=this.appearance.contrast?0x111111:CONTROL_COLOURS.friendly,progress=Math.min(this.progress(front.own),this.progress(front.faces)),target=this.project(enemy);
      const age=Math.max(0,this.model.day-front.asOfDay),alpha=(front.mark==='ink'?.96:.72)*(age>28?.4:age>14?.6:age>7?.8:1);
      for(const line of lines){
        if(line.length<2)continue;this.controlCounts.fronts++;
        const length=line.slice(1).reduce((sum,b,i)=>sum+Math.hypot(b[0]-line[i]![0],b[1]-line[i]![1]),0);let walked=0;
        for(let i=1;i<line.length;i++){
          const a=line[i-1]!,b=line[i]!,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(!len)continue;
          const remaining=length*progress-walked;if(remaining<=0)break;const amount=Math.min(1,remaining/len),count=Math.max(1,Math.ceil(len*z/7));
          let nx=-dy/len,ny=dx/len;if(nx*(target[0]-(a[0]+b[0])/2)+ny*(target[1]-(a[1]+b[1])/2)<0){nx=-nx;ny=-ny;}
          for(let j=0;j<count*amount;j++){
            if(front.mark==='pencil'&&j%4===3)continue;
            const t=j/count,u=Math.min(amount,(j+1)/count),n=grain(i,j,29);
            g.moveTo(a[0]+dx*t,a[1]+dy*t).lineTo(a[0]+dx*u,a[1]+dy*u).stroke({color:colour,width:(3.2+n)/z,alpha});
          }
          for(let t=8/z;t<len*amount;t+=22/z){const x=a[0]+dx*t/len,y=a[1]+dy*t/len,n=grain(i,Math.round(t*z));
            g.moveTo(x-dx/len*4/z,y-dy/len*4/z).lineTo(x+nx*(8+n*4)/z,y+ny*(8+n*4)/z).lineTo(x+dx/len*4/z,y+dy/len*4/z).stroke({color:colour,width:1.7/z,alpha});
          }walked+=len;
        }
        this.liveObstacles.push(...lineBoxes(line.map(([x,y])=>[x*z+this.camera.x,y*z+this.camera.y]),14));
      }
    }
  }
  private readOverlayBoxes(){
    const origin=this.host.getBoundingClientRect(),root=this.host.closest('.playable-table,.map-study')??this.host.parentElement!;
    const nodes=root.querySelectorAll<HTMLElement>('.map-meridian,.table-calendar,.table-trays,.table-books,.table-docket,.table-run,.table-playback,.table-paper,.holder-at-flag,.map-plan-sheet,.study-cartouche,.map-cartouche,.map-scale,.study-caption,.study-navigation,.map-tools,.table-report,.table-commander,.table-tray,.table-mock-label,.mark-caption,.hq-caption,.axis-label,.support-label,.arrow-handle,.pencil-number');
    const boxes:Box[]=[];this.captionReservations=[];
    for(const node of nodes){if(!node.offsetWidth||getComputedStyle(node).display==='none')continue;const b=node.getBoundingClientRect();const box:Box=[b.left-origin.left-5,b.top-origin.top-5,b.right-origin.left+5,b.bottom-origin.top+5];boxes.push(box);if(!node.classList.contains('mark-caption')&&!node.classList.contains('hq-caption'))this.captionReservations.push(box);}
    const signature=JSON.stringify(boxes);this.overlayBoxes=boxes;const changed=signature!==this.overlaySignature;this.overlaySignature=signature;return changed;
  }
  private ribbon(points:Point[],colour:number,width:number,hatched:boolean){
    if(points.length<2)return;
    const z=this.camera.z,screen=points.map(([x,y])=>[x*z+this.camera.x,y*z+this.camera.y] as Point),outline=broadArrow(screen,width);
    if(!outline.length)return;
    const world=(p:Point):Point=>[(p[0]-this.camera.x)/z,(p[1]-this.camera.y)/z];
    this.arrows.poly(outline.map(world).flat()).fill({color:colour,alpha:hatched?.035:.35});
    for(let i=0;i<outline.length;i++){const a=outline[i]!,b=outline[(i+1)%outline.length]!,n=grain(i,Math.round(a[0]));this.arrows.moveTo(...world(a)).lineTo(...world([b[0]+(n-.5)*.7,b[1]])).stroke({color:colour,width:(1.2+n*1.3)/z,alpha:.65+n*.25});}
    if(hatched)for(const [i,[a,b]] of hatchRings([outline],9).entries()){const n=grain(i,24);this.arrows.moveTo(...world(a)).lineTo(...world([b[0]+(n-.5)*1.4,b[1]+(n-.5)])).stroke({color:colour,width:(.6+n*.65)/z,alpha:.4+n*.35});}
    this.liveObstacles.push(...lineBoxes(screen,width/2+5),...lineBoxes(outline.slice(Math.floor(outline.length/2)-2,Math.floor(outline.length/2)+3),5));
  }
  private arrow(regions: readonly string[],colour:number,width:number,hatched:boolean,dotted=false) {
    const points=regions.map(id=>this.regions.find(r=>r.id===id)?.point).filter((p):p is Point=>!!p).map(p=>this.project(p));
    // A missing region breaks a route; do not bridge across it.
    if(points.length!==regions.length || points.length<2)return;
    const bluePencil=colour===0x315c83;
    if(this.appearance.contrast)colour=0x111111;
    const g=this.arrows,z=this.camera.z;
    if(!dotted){this.ribbon(points,colour,Math.max(34,width*2.4),hatched);return;}
    for(let i=1;i<points.length;i++) {
      const a=points[i-1]!,b=points[i]!,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len===0)continue;
      const nx=-dy/len,ny=dx/len;
      if(bluePencil){for(let t=0;t<len;t+=4/z){const n=grain(i,Math.round(t*z)),u=Math.min(len,t+4/z);g.moveTo(a[0]+dx*t/len,a[1]+dy*t/len+(n-.5)/z).lineTo(a[0]+dx*u/len,a[1]+dy*u/len).stroke({color:colour,width:(1.5+n*1.6)/z,alpha:.4+n*.5});}}
      else if(dotted){for(let t=0;t<len;t+=9/z){const end=Math.min(t+3/z,len);g.moveTo(a[0]+dx*t/len,a[1]+dy*t/len).lineTo(a[0]+dx*end/len,a[1]+dy*end/len).stroke({color:colour,width:1.7/z});}}
      else if(hatched){
        for(const side of [-1,1])g.moveTo(a[0]+nx*width/z*side/2,a[1]+ny*width/z*side/2).lineTo(b[0]+nx*width/z*side/2,b[1]+ny*width/z*side/2).stroke({color:colour,width:1.1/z,alpha:.85});
        for(let t=0;t<len;t+=9/z){g.moveTo(a[0]+dx*t/len-nx*width/z/2,a[1]+dy*t/len-ny*width/z/2).lineTo(a[0]+dx*Math.min(len,t+5/z)/len+nx*width/z/2,a[1]+dy*Math.min(len,t+5/z)/len+ny*width/z/2).stroke({color:colour,width:.8/z,alpha:.6});}
      }else g.moveTo(...a).lineTo(...b).stroke({color:colour,width:width/z,alpha:.85});
    }
    const tip=points.at(-1)!,prev=points.at(-2)!,a=Math.atan2(tip[1]-prev[1],tip[0]-prev[0]),s=(hatched?20:12)/z;
    g.moveTo(tip[0]-Math.cos(a-.5)*s,tip[1]-Math.sin(a-.5)*s).lineTo(...tip).lineTo(tip[0]-Math.cos(a+.5)*s,tip[1]-Math.sin(a+.5)*s).stroke({color:colour,width:(hatched?2:2.4)/z});
  }
  private drawArrows() {
    this.arrows.clear();this.liveObstacles=[];
    this.drawFronts();
    if(this.study)this.drawStudy(this.study);
    for(const review of this.model.plans) {
      const active=!this.reviewPost || review.post===this.reviewPost;
      for(const axis of review.plan.axes) this.arrow(axis.regions,review.approved?CONTROL_COLOURS.friendly:active?0x4d5144:0x9c9b83,active?15:9,!review.approved);
      for(const request of review.plan.requests) {
        const [kind,post]=request.split(':');
        if(!['cooperating_axis','naval_support'].includes(kind!)||!post)continue;
        const hq=this.model.marks.find(m=>m.kind==='headquarters' && m.post===post);
        const end=review.plan.axes[0]?.regions.at(-1);
        if(hq && end)this.arrow([hq.region,end],0x626655,2,false,true);
      }
    }
    for(const mark of this.pencil) {
      if(mark.strike) {
        const original=this.model.plans.find(r=>r.post===mark.post)?.plan.axes.find(a=>a.name===mark.axis)?.regions;
        const p=original?.at(-1);if(!p)continue;const world=this.regions.find(r=>r.id===p)?.point;if(!world)continue;const [x,y]=this.project(world),s=18/this.camera.z;
        this.arrows.moveTo(x-s,y-s).lineTo(x+s,y+s).moveTo(x+s,y-s).lineTo(x-s,y+s).stroke({color:0x315c83,width:2.7/this.camera.z});
      } else this.arrow(mark.regions,0x315c83,2.4,false,true);
    }
    if(this.hovered)for(const polygon of this.rings(this.hovered)){if(polygon[0]?.length){this.arrows.poly(polygon[0].flat()).fill({color:0xf4bd58,alpha:.14});for(const hole of polygon.slice(1))this.arrows.poly(hole.flat()).cut();}}
  }
  private drawStudy(study:StudyMarks){
    const g=this.arrows,z=this.camera.z;
    for(const wash of study.washes){
      const colour=this.look==='B'?(wash.side==='friendly'?0x168acf:0xee8043):(wash.side==='friendly'?0x598fac:0xc17842);
      const alpha=Math.max(0,Math.min(1000,wash.permille))/1000*(this.look==='B'?.42:this.look==='C'?.50:.30);
      for(const id of wash.regions){
       if(!this.regionRings.has(id)){const r=this.regions.find(r=>r.id===id);if(r?.shape&&!['sea','river','off_map'].includes(r.kind))this.regionRings.set(id,roughRings(r.shape,this.projection));}
       for(const polygon of this.regionRings.get(id)??[]){
        if(!polygon[0]?.length)continue;
        if(this.look!=='A'){g.poly(polygon[0].flat()).fill({color:colour,alpha});
        for(const hole of polygon.slice(1))g.poly(hole.flat()).cut();}
        // Loose watercolour edge, kept inside the exact same roughened fill.
        
        if(wash.contested)for(const [a,b] of hatchRings(polygon,18*Math.SQRT2/z,wash.side==='friendly'?1:-1))g.moveTo(...a).lineTo(...b).stroke({color:colour,width:.65/z,alpha:.22});
       }
      }
    }
    const front=study.front.map(p=>this.project(p)),enemy=this.project(study.enemySide),frontColour=this.look==='B'?0x000000:0x4e6567;
    for(let i=1;i<front.length;i++){
      const a=front[i-1]!,b=front[i]!,dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(!len)continue;
      let nx=-dy/len,ny=dx/len;if(nx*(enemy[0]-(a[0]+b[0])/2)+ny*(enemy[1]-(a[1]+b[1])/2)<0){nx=-nx;ny=-ny;}
      for(let k=0;k<Math.ceil(len*z/13);k++){const t=k/Math.ceil(len*z/13),u=(k+1)/Math.ceil(len*z/13),n=grain(i,k);g.moveTo(a[0]+dx*t,a[1]+dy*t).lineTo(a[0]+dx*u+(n-.5)*.7/z,a[1]+dy*u).stroke({color:frontColour,width:(3.4+n*1.8)/z,alpha:.83+n*.12});}
      for(let t=12/z;t<len;t+=(20+grain(i,Math.round(t*z))*7)/z){const x=a[0]+dx*t/len,y=a[1]+dy*t/len;
        const n=grain(i,Math.round(t*z));g.moveTo(x-dx/len*4/z,y-dy/len*4/z).lineTo(x+nx*(8+n*5)/z,y+ny*(8+n*5)/z).lineTo(x+dx/len*4.5/z,y+dy/len*4.5/z).stroke({color:frontColour,width:(1.5+n)/z,alpha:.92});
      }
    }
    this.liveObstacles.push(...lineBoxes(front.map(([x,y])=>[x*z+this.camera.x,y*z+this.camera.y]),16));
    this.ribbon(study.draft.map(p=>this.project(p)),this.look==='B'?0x171717:0x5b5546,42,true);
    const revision=study.revision.map(p=>this.project(p));
    for(let i=1;i<revision.length;i++){const a=revision[i-1]!,b=revision[i]!,n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*z/5));for(let j=0;j<n;j++){const r=grain(i,j);g.moveTo(a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n+(r-.5)/z).lineTo(a[0]+(b[0]-a[0])*(j+1)/n,a[1]+(b[1]-a[1])*(j+1)/n).stroke({color:0x315f88,width:(1.6+r*2)/z,alpha:.4+r*.5});}}
    this.liveObstacles.push(...lineBoxes(revision.map(([x,y])=>[x*z+this.camera.x,y*z+this.camera.y]),5));
    const note=this.project(study.estimate.point);g.ellipse(note[0],note[1],36/z,22/z).stroke({color:0x5b574f,width:1.2/z,alpha:.85});
  }
  private drawLabels() {
    this.omittedLabels=[];
    this.labels.removeChildren();
    const w=this.app.screen.width,h=this.app.screen.height,ratio=this.camera.z/this.camera.fit;
    const labelZoom=this.labelZoom();
    for(const r of this.regions){const policy=this.labelPolicies.get(r.id)!;this.labelEligibility.set(r.id,labelVisible(labelZoom,policy.minZoom,this.labelEligibility.get(r.id)??false));}
    // The HTML signs use this same placement. Names yield; their placement
    // must never push a report away from its existing point or reported anchor.
    const occupied:Box[]=placeMarks(this.model.marks,id=>this.screen(id),w,h)
      .map(({point:[x,y]})=>[x-19,y-19,x+19,y+19]);
    
    occupied.push(...this.overlayBoxes);
    this.riverObstacles=[];
    for(const river of this.geometry.cartography?.rivers??[]){
      if(!['Potomac','Shenandoah','Rappahannock','York','James'].includes(river.name))continue;
      const lines=river.shape.type==='LineString'?[river.shape.coordinates as Point[]]:river.shape.coordinates as Point[][];
      for(const line of lines)this.riverObstacles.push(...lineBoxes(line.map(p=>{const [x,y]=this.project(p);return [x*this.camera.z+this.camera.x,y*this.camera.z+this.camera.y];}),3).filter(b=>b[2]>0&&b[0]<w&&b[3]>0&&b[1]<h));
    }
    this.captionReservations.push(...this.liveObstacles,...this.riverObstacles);
    const frame=this.frameScreen();
    const font={fontFamily:PALETTES[this.look].font,fontSize:14,fill:this.appearance.contrast?'#111111':PALETTES[this.look].ink};
    const label=(id:string,value:string,p:Point,size:number,rotation=0,river=false)=>{
      let text=this.textCache.get(id);if(!text){text=new Text({text:value});this.textCache.set(id,text);}
      text.style={...font,fontSize:size,fontStyle:'italic',stroke:{color:PALETTES[this.look].paper,width:this.look==='A'?4:0,join:'round'}};text.text=value;text.anchor.set(.5);text.position.set(...p);text.rotation=rotation;text.label=id;
      const b=text.getBounds();const box:Box=[b.x-4,b.y-4,b.x+b.width+4,b.y+b.height+4];
      const collision=occupied.some(a=>overlaps(a,box))||(!river&&this.riverObstacles.some(a=>overlaps(a,box)));
      if(box[0]<8||box[1]<8||box[2]>w-8||box[3]>h-8||collision){this.omittedLabels.push({id,point:p,box,collision});return false;}
      occupied.push(box);this.labels.addChild(text);return true;
    };
    if(this.study)for(const [id,note] of [['estimate',this.study.estimate],['draft',this.study.draftLabel]] as const){
      const p=this.project(note.point),x=p[0]*this.camera.z+this.camera.x,y=p[1]*this.camera.z+this.camera.y;
      let placed=false;
      for(const dy of [-48,48,-83,83]){for(const dx of [0,50,-50,110,-110])if(label(id,note.text,[x+dx,y+dy],15,-.045)){placed=true;break;}if(placed)break;}

    }
    occupied.push(...this.liveObstacles);
    if(ratio>2.5&&this.geometry.cartography){
      const targets:Record<string,Point>={Potomac:[-77.7,39.3],Shenandoah:[-78.3,38.9],Rappahannock:[-77.1,38.12],York:[-76.65,37.46],James:[-77.6,37.5]};
      for(const [name,target] of Object.entries(targets)){
        const candidates=this.geometry.cartography.rivers.filter(r=>r.name===name).flatMap(r=>r.shape.type==='LineString'?[r.shape.coordinates as Point[]]:r.shape.coordinates as Point[][]);
        const q=this.project(target),options:{line:Point[];index:number;distance:number}[]=[];
        for(const coordinates of candidates){const line=coordinates.map(p=>this.project(p));line.forEach((p,index)=>options.push({line,index,distance:Math.hypot(p[0]-q[0],p[1]-q[1])}));}
        for(const chosen of options.sort((a,b)=>a.distance-b.distance)){
          const p=chosen.line[chosen.index]!,a=chosen.line[Math.max(0,chosen.index-2)]!,b=chosen.line[Math.min(chosen.line.length-1,chosen.index+2)]!;
          let angle=Math.atan2(b[1]-a[1],b[0]-a[0]);if(Math.abs(angle)>Math.PI/2)angle+=Math.PI;
          if(label(`river-${name}`,name,[p[0]*this.camera.z+this.camera.x,p[1]*this.camera.z+this.camera.y-12],this.look==='B'?15:16,angle,true))break;
        }
      }
    }
    // Towns are the navigation anchors of the scene. Their labels get first
    // choice among region names and may move around a report sign.
    for(const r of [...this.regions].sort((a,b)=>(a.kind==='key_point'?0:1)-(b.kind==='key_point'?0:1)||(a.id<b.id?-1:1))) {
      if(!r.point || ['off_map','off-map','river'].includes(r.kind))continue;
      if(!this.labelEligibility.get(r.id))continue;
      const anchor=this.project(r.label.anchor??r.point);const p:Point=[anchor[0]*this.camera.z+this.camera.x,anchor[1]*this.camera.z+this.camera.y];
      if(p[0]<10||p[0]>w-10||p[1]<20||p[1]>h-20)continue;
      const size=this.labelPolicies.get(r.id)!.size;
      let text=this.textCache.get(r.id);
      if(!text){text=new Text({text:r.name});this.textCache.set(r.id,text);}
      text.text=this.look==='A'&&r.kind!=='key_point'?r.name.toUpperCase():r.name;
      text.style={...font,fontFamily:this.look==='A'?'Standard':font.fontFamily,fontSize:size*this.appearance.mapScale/100,letterSpacing:r.kind==='key_point'?.1:this.look==='A'?2:1.2,fontWeight:this.look==='C'?'bold':'normal',fontStyle:r.kind==='sea'?'italic':'normal',stroke:{color:PALETTES[this.look].paper,width:this.look==='A'?3:0,join:'round'}};
      if(r.label.spine.length>1){
        const first=this.project(r.label.spine[0]!),last=this.project(r.label.spine.at(-1)!);
        text.rotation=Math.atan2(last[1]-first[1],last[0]-first[0]);
        if(Math.abs(text.rotation)>Math.PI/2)text.rotation+=Math.PI;
      }
      text.anchor.set(.5);text.label=r.id;
      if(r.label.spine.length<2){
        text.rotation=0;
        if(this.look==='A'&&r.kind==='land'&&r.shape){
          if(!this.regionAngles.has(r.id)){
            const pts=roughRings(r.shape,this.projection).flat(2);let angle=0;
            if(pts.length){const cx=pts.reduce((n,p)=>n+p[0],0)/pts.length,cy=pts.reduce((n,p)=>n+p[1],0)/pts.length;let xx=0,yy=0,xy=0;for(const p of pts){xx+=(p[0]-cx)**2;yy+=(p[1]-cy)**2;xy+=(p[0]-cx)*(p[1]-cy);}angle=Math.max(-.65,Math.min(.65,.5*Math.atan2(2*xy,xx-yy)));}
            this.regionAngles.set(r.id,angle);
          }
          text.rotation=this.regionAngles.get(r.id)!;
        }
      }
      const offsets:Point[]=[[0,0]];
      for(let ring=1;ring<=(r.kind==='key_point'?5:2);ring++)for(const [dx,dy] of [[1,0],[-1,0],[0,-1],[0,1],[1,-1],[-1,-1],[1,1],[-1,1]])offsets.push([dx!*(text.width/2+ring*28),dy!*ring*28]);
      for(const [dx,dy] of offsets){
        text.position.set(p[0]+dx,p[1]+dy);
        // Measure after the authored spine rotation and any display offset.
        const bounds=text.getBounds();
        const b:Box=[bounds.x-3,bounds.y-3,bounds.x+bounds.width+3,bounds.y+bounds.height+3];
        if(b[0]<frame[0]+4||b[1]<frame[1]+4||b[2]>frame[2]-4||b[3]>frame[3]-4||occupied.some(x=>overlaps(x,b))||this.riverObstacles.some(x=>overlaps(x,b)))continue;
        occupied.push(b);text.alpha=this.reviewPost?.55:.88;this.labels.addChild(text);break;
      }
    }
  }
  diagnostics() {
    const {x,y,z}=this.camera,w=this.app.screen.width,h=this.app.screen.height;
    const viewport:Box=[-x/z,-y/z,(w-x)/z,(h-y)/z];
    const fits=(b:Box)=>b[0]>=4&&b[1]>=4&&b[2]<=w-4&&b[3]<=h-4;
    const measured=this.regions.filter(r=>!['off_map','off-map'].includes(r.kind)).map(r=>{
      const p=this.screen(r.id),shape=this.regionPaths.get(r.id)?.bbox;
      return {id:r.id,point:p,shape:shape?[shape[0]*z+x,shape[1]*z+y,shape[2]*z+x,shape[3]*z+y] as Box:null};
    });
    const coverage=this.geometry.baseCoverage?.worldBounds;
    return {labelZoom:this.labelZoom(),labelVisibility:this.regions.map(r=>({id:r.id,kind:r.kind,...this.labelPolicies.get(r.id),eligible:this.labelEligibility.get(r.id)??false})),look:this.look,noteAnchor:this.study?(()=>{const p=this.project(this.study.estimate.point);return [p[0]*z+x,p[1]*z+y];})():null,detail:this.geometry.atlasDetail??{sourceTolerance:this.geometry.cartography?.lod?.sourceTolerance,countyDate:this.geometry.cartography?.lod?.countyDate,counties:this.geometry.cartography?.lod?.counties.length,stations:this.geometry.cartography?.lod?.stations.length,reliefRows:this.geometry.cartography?.relief.some(r=>r.contour!==undefined)},studyControl:this.study?{mock:true,mode:this.look==='C'?'region-tint':'wash',claims:this.study.washes.map(w=>({regions:w.regions,permille:w.permille,contested:!!w.contested})),roughenedShapes:true}:null,bakeMs:this.atlas?.bakeMs,atlasLoadMs:this.atlas?.loadMs,atlasSource:this.atlas?.source,degreeTicks:this.degreeTicks(),maximumZoom:this.maximumZoom(),hatchScreenSpacing:18,staticBands:this.atlasSprites.length,staticBakes:this.paintCount,frameTimes:[...this.frameTimes],omittedLabels:this.omittedLabels,renderer:this.app.renderer?.type,tiles:this.atlasSprites.length,rawTextureBytes:this.cacheBytes,rawTextureCap:CAP,paintedTiles:this.paintCount,zoom:this.camera.z/this.camera.fit,ready:this.host.dataset.ready,
    regionContainment:{points:measured.filter(r=>r.point).length,shapes:measured.filter(r=>r.shape).length,
      outside:measured.filter(r=>(r.point&&!fits([...r.point,...r.point]))||(r.shape&&!fits(r.shape))),
      excludedOffMap:this.regions.filter(r=>['off_map','off-map'].includes(r.kind)).map(r=>r.id)},
    baseCoverage:coverage?{viewport,bounds:coverage,geographicBox:this.geometry.baseCoverage!.geographicBox,inside:viewport[0]>=coverage[0]-1e-6&&viewport[1]>=coverage[1]-1e-6&&viewport[2]<=coverage[2]+1e-6&&viewport[3]<=coverage[3]+1e-6}:null,
    labelObstacles:{overlays:this.overlayBoxes,live:this.liveObstacles,rivers:this.riverObstacles},renderedLabels:this.labels.children.map(child=>{const b=child.getBounds();return {id:child.label,text:(child as Text).text,bounds:{x:b.x,y:b.y,width:b.width,height:b.height}};}),
    frame:this.frameScreen(),fitBounds:[...this.bounds],camera:{...this.camera},
    ...(this.geometry.schematic?{referencePoints:Object.fromEntries(this.regions.filter(r=>r.point).map(r=>[r.id,this.screen(r.id)]))}:{})};}
  destroy() {this.dead=true;this.ready=false;cancelAnimationFrame(this.frame);this.observer?.disconnect();for(const fn of this.cleanup)fn();if(this.app.renderer){for(const text of this.textCache.values())text.destroy();this.textCache.clear();this.app.destroy(true,{children:true,texture:true,textureSource:true});}}
}
