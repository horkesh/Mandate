"""R24 display detail. Preserve authored region records and all game inputs.
Uses exact dated county matches from R18; no new aliases, adjacency or roads.
"""
from pathlib import Path
from datetime import date
import hashlib,io,json,math,sys
ROOT=Path(__file__).resolve().parents[3];P=ROOT/'prototypes/desk';OUT=ROOT/'art-masters/R24'
sys.path[:0]=[str(P/'.geometry-tools'),str(ROOT/'art-masters/R22/python-tools')]
import shapefile,numpy as np,shapely
from PIL import Image
from shapely.geometry import shape,mapping,box,LineString
from shapely.ops import unary_union
from map_zip import open_zip

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def digest(v):return hashlib.sha256(json.dumps(v,sort_keys=True).encode()).hexdigest()
def reader(p):
 z=open_zip(p.read_bytes())
 def f(ext):return io.BytesIO(z.read(next(n for n in z.namelist() if n.endswith(ext) and not n.startswith('__MACOSX'))))
 return z,shapefile.Reader(shp=f('.shp'),shx=f('.shx'),dbf=f('.dbf'),encoding='latin1')
def clean(g,tol=.0003):
 if not g.is_valid:g=shapely.make_valid(g)
 return shapely.normalize(g.simplify(tol,preserve_topology=True))
T=P/'public/map-data/union-1861.json';g=json.loads(T.read_text(encoding='utf8'))
protected={k:digest(g[k]) for k in ['regions','base']};protected['rail']=digest(g['cartography']['rail'])
report=json.loads((ROOT/'art-masters/R18/geometry-report.json').read_text())
z,r=reader(OUT/'sources/US_AtlasHCB_Counties_Gen001.zip');index={};counties=[];states={};dated=0
for i,rec in enumerate(r.iterRecords()):
 d=rec.as_dict()
 if d['START_DATE']<=date(1861,3,6)<=d['END_DATE'] and d['CNTY_TYPE']!='Proposal':
  geom=clean(shape(r.shape(i).__geo_interface__))
  key=(d['STATE_TERR'].strip().casefold(),d['NAME'].strip().casefold());index[key]=geom;states.setdefault(key[0],[]).append(geom);dated+=1
 if d['START_DATE']<=date(1860,12,31)<=d['END_DATE'] and d['CNTY_TYPE']!='Proposal':
  if d['STATE_TERR'].strip() in ['Virginia','Maryland','Pennsylvania','Delaware','District of Columbia','North Carolina','Tennessee','Kentucky','Ohio','New Jersey']:
   geom=clean(shape(r.shape(i).__geo_interface__))
   counties.append({'name':d['NAME'],'state':d['STATE_TERR'],'shape':mapping(geom)})
byregion={}
for match in report['matched']:byregion.setdefault(match['region'],[]).append(tuple(v.strip().casefold() for v in match['county'].split(':',1)))
for exp in report['wildcardExpansions']:
 state=exp['expression'].split(':')[0].casefold()
 byregion.setdefault(exp['region'],[]).extend((state,n) for n in exp['sourceCountyNames'])
regions={}
for reg in g['regions']:
 if not reg['shape']:continue
 keys=byregion.get(reg['id'],[])
 assert keys and all(k in index for k in keys),reg['id']
 regions[reg['id']]=mapping(clean(unary_union([index[k] for k in keys])))
state_shapes=[{'name':name,'shape':mapping(clean(unary_union(shapes),.001))} for name,shapes in sorted(states.items())]
# Detailed source coastline/land replaces simplified paths only at close scale.
base=[];clip=box(-105,24,-65,50)
for name,kind in [('land','land'),('coastline','coast'),('lakes','lake')]:
 zz,rr=reader(ROOT/f'art-masters/R18/sources/ne_10m_{name}.zip')
 for item in rr.iterShapeRecords():
  d=item.record.as_dict()
  if not item.shape.points or (kind=='lake' and 'reservoir' in str(d.get('featurecla','')).lower()):continue
  geom=shape(item.shape.__geo_interface__)
  if not geom.intersects(clip):continue
  geom=clean(geom.intersection(clip),.0004)
  if not geom.is_empty:base.append({'kind':kind,'rank':int(d.get('scalerank',8) or 0),'shape':mapping(geom)})
# Marching-square isoline rows. Hachures start at a real elevation crossing,
# follow the downhill gradient, and stop short of the next 100m contour.
elev=np.asarray(Image.open(ROOT/'art-masters/R22/sources/etopo1.tif'),dtype=float)
smooth=(4*elev+np.roll(elev,1,0)+np.roll(elev,-1,0)+np.roll(elev,1,1)+np.roll(elev,-1,1))/8
gy,gx=np.gradient(smooth);relief=[]
for height in range(100,3101,100):
 a=smooth[:-1,:-1];b=smooth[:-1,1:];c=smooth[1:,1:];d=smooth[1:,:-1]
 candidates=np.argwhere((np.minimum.reduce([a,b,c,d])<=height)&(np.maximum.reduce([a,b,c,d])>height))
 for row,col in candidates:
  if row<3 or row>1295 or col<3 or col>1995:continue
  vals=[smooth[row,col],smooth[row,col+1],smooth[row+1,col+1],smooth[row+1,col]];corners=[(col,row),(col+1,row),(col+1,row+1),(col,row+1)];hits=[]
  for j in range(4):
   k=(j+1)%4
   if (vals[j]<=height<vals[k]) or (vals[k]<=height<vals[j]):
    t=(height-vals[j])/(vals[k]-vals[j]);hits.append((corners[j][0]+(corners[k][0]-corners[j][0])*t,corners[j][1]+(corners[k][1]-corners[j][1])*t))
  for j in range(0,len(hits)-1,2):
   u,v=hits[j:j+2];lat=50-(row+.5)*.02;cos=math.cos(math.radians(lat))
   length=math.hypot((v[0]-u[0])*2.2264*cos,(v[1]-u[1])*2.2264)
   n=max(1,math.ceil(length/.85))
   for k in range(n):
    t=(k+.5)/n;x=u[0]+(v[0]-u[0])*t;y=u[1]+(v[1]-u[1])*t
    east=gx[row,col]/(2.2264*cos);north=-gy[row,col]/2.2264;slope=math.hypot(east,north)
    if slope<18:continue
    lon=-105+(x+.5)*.02;lat=50-(y+.5)*.02
    span=min(2.6,max(.32,100/slope*.72))
    end=[lon-east/slope*span/(111.32*cos),lat-north/slope*span/111.32]
    relief.append({'a':[round(lon,6),round(lat,6)],'b':[round(v,6) for v in end],'strength':round(min(1,slope/160),3),'slope':round(slope,3),'contour':height})
g['cartography'].update(relief=relief,lod={'sourceTolerance':.001,'renderTolerance':.0003,'regions':regions,'base':base,'counties':counties,'countyDate':'1860-12-31','states':state_shapes,'stations':[],'stationLimit':'Atack line layer has no point station catalogue; none invented.'})
assert protected['regions']==digest(g['regions']) and protected['base']==digest(g['base']) and protected['rail']==digest(g['cartography']['rail'])
T.write_text(json.dumps(g,sort_keys=True,separators=(',',':'),ensure_ascii=False)+'\n',encoding='utf8')
recipe=Path(str(T)+'.recipe.json');meta=json.loads(recipe.read_text(encoding='utf8'))
meta.update(request='R24',date='2026-11-18',sha256=sha(T),actualSize=T.stat().st_size)
meta['R24']={'scriptSha256':sha(Path(__file__)),'sourceManifest':'art-masters/R24/sources/manifest.json','preservedHashes':protected,'detail':'Newberry .001 degree source, exact R18 matches only, .0003 degree rendering; 1860-12-31 county lines, 1861-03-06 state boundaries. Natural Earth .0004 degree display detail. Hit shapes and authored points unchanged.','relief':'100m isoline rows; downhill strokes spaced <=0.85km along contours; length 72% of contour separation clamped 0.32..2.6km; slope >=18m/km; NOAA source reused.','stations':'No point station catalogue supplied by source; none invented. No roads.'}
recipe.write_text(json.dumps(meta,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
result={'sha256':sha(T),'protectedHashes':protected,'detailedRegions':len(regions),'countyDate':'1860-12-31','counties':len(counties),'states':len(state_shapes),'hachures':len(relief),'detailedBaseFeatures':len(base),'sourceTolerance':.001,'validRegions':all(shape(s).is_valid for s in regions.values()),'contours':True}
(OUT/'cartography-build.json').write_text(json.dumps(result,indent=2));print(json.dumps(result))
