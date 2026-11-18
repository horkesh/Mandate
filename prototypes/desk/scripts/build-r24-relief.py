"""Close-only USGS 3DEP hachures. No learned processing or invented terrain."""
from pathlib import Path
import sys,json,math,hashlib
R=Path(__file__).resolve().parents[3];P=R/'prototypes/desk';O=R/'art-masters/R24'
sys.path[:0]=[str(P/'.geometry-tools'),str(R/'art-masters/R22/python-tools')]
import numpy as np
from PIL import Image
meta=json.loads((O/'sources/3dep-response.json').read_text());e=meta['extent']
source=O/'sources/3dep-virginia.tif';image=Image.open(source);tags=image.tag_v2
assert tags[259]==1 and tags[258]==(32,) and tags[339]==(3,), 'Expected uncompressed float32 tiles'
raw=source.read_bytes();endian='<' if raw[:2]==b'II' else '>'
a=np.zeros((meta['height'],meta['width']),dtype=float);valid=np.zeros(a.shape,dtype=bool)
tw,th=tags[322],tags[323];columns=math.ceil(a.shape[1]/tw);missing=[]
for i,(offset,count) in enumerate(zip(tags[324],tags[325])):
 row,col=divmod(i,columns);y,x=row*th,col*tw;hh=min(th,a.shape[0]-y);ww=min(tw,a.shape[1]-x)
 if not offset or not count:missing.append(i);continue
 assert count==tw*th*4 and offset+count<=len(raw)
 tile=np.frombuffer(raw[offset:offset+count],dtype=endian+'f4').reshape(th,tw)[:hh,:ww]
 good=np.isfinite(tile)&(tile>-100)&(tile<10000);a[y:y+hh,x:x+ww]=np.where(good,tile,0);valid[y:y+hh,x:x+ww]=good
assert valid.mean()>.99 and a.max()>1000 and a.min()>-100

s=(4*a+np.roll(a,1,0)+np.roll(a,-1,0)+np.roll(a,1,1)+np.roll(a,-1,1))/8;gy,gx=np.gradient(s)
dx=(e['xmax']-e['xmin'])/a.shape[1];dy=(e['ymax']-e['ymin'])/a.shape[0];marks=[];seen=set()
for height in range(50,1701,50):
 q=[s[:-1,:-1],s[:-1,1:],s[1:,1:],s[1:,:-1]]
 for row,col in np.argwhere((np.minimum.reduce(q)<=height)&(np.maximum.reduce(q)>height)):
  if row<3 or col<3 or row>=a.shape[0]-3 or col>=a.shape[1]-3:continue
  if not valid[row-2:row+3,col-2:col+3].all():continue
  vals=[s[row,col],s[row,col+1],s[row+1,col+1],s[row+1,col]];cs=[(col,row),(col+1,row),(col+1,row+1),(col,row+1)];hits=[]
  for j in range(4):
   k=(j+1)%4
   if (vals[j]<=height<vals[k]) or (vals[k]<=height<vals[j]):
    t=(height-vals[j])/(vals[k]-vals[j]);hits.append((cs[j][0]+(cs[k][0]-cs[j][0])*t,cs[j][1]+(cs[k][1]-cs[j][1])*t))
  for j in range(0,len(hits)-1,2):
   u,v=hits[j:j+2];lat=e['ymax']-(row+.5)*dy;cos=math.cos(math.radians(lat))
   km=math.hypot((v[0]-u[0])*dx*111.32*cos,(v[1]-u[1])*dy*111.32)
   n=max(1,math.ceil(km/.22))
   for k in range(n):
    t=(k+.5)/n;x=u[0]+(v[0]-u[0])*t;y=u[1]+(v[1]-u[1])*t
    east=gx[row,col]/(dx*111.32*cos);north=-gy[row,col]/(dy*111.32);slope=math.hypot(east,north)
    if slope<35:continue
    lon=e['xmin']+(x+.5)*dx;lat=e['ymax']-(y+.5)*dy
    key=(height,round(lon*cos/.0035),round(lat/.0035))
    if key in seen:continue
    seen.add(key)
    span=min(.8,max(.065,50/slope*.72))
    b=[lon-east/slope*span/(111.32*cos),lat-north/slope*span/111.32]
    marks.append({'a':[round(lon,6),round(lat,6)],'b':[round(v,6) for v in b],'strength':round(min(1,slope/250),3),'slope':round(slope,3),'contour':height})
p=P/'public/map-data/union-1861.json';g=json.loads(p.read_text(encoding='utf8'));g['cartography']['lod'].update(relief=marks,reliefExtent=[e['xmin'],e['ymin'],e['xmax'],e['ymax']])
p.write_text(json.dumps(g,sort_keys=True,separators=(',',':'),ensure_ascii=False)+'\n',encoding='utf8')
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
r=Path(str(p)+'.recipe.json');recipe=json.loads(r.read_text(encoding='utf8'));recipe.update(sha256=sha(p),actualSize=p.stat().st_size)
recipe['R24']['closeRelief']={'scriptSha256':sha(Path(__file__)),'source':'art-masters/R24/sources/3dep-virginia.tif','sourceSha256':sha(O/'sources/3dep-virginia.tif'),'method':'50m isolines; <=220m along-row stroke spacing; downhill 72% contour separation, 65..800m length; slopes >=35m/km. Replaces broad relief only in the source extent at close bands.','limits':'Modern bare-earth DEM for persistent landforms; no modern roads/buildings traced.'};r.write_text(json.dumps(recipe,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
report={'sparseTiffTilesExcluded':missing,'noDataPixelsExcluded':int((~valid).sum()),'hachures':len(marks),'sourceSize':list(a.shape),'pixelDegrees':[dx,dy],'elevationRange':[float(a.min()),float(a.max())],'sha256':sha(p),'bullRunEnvelopeStrokes':int(sum(-77.9<m['a'][0]<-77.55 and 38.75<m['a'][1]<39.05 for m in marks))}
(O/'close-relief-build.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
