"""R23: metric downhill relief and whole ranked rivers, reusing the R18/R22 masters.
No network, no simulation inputs or region/base/rail edits. Output stays ignored.
"""
from pathlib import Path
import hashlib, io, json, math, sys, zipfile
ROOT=Path(__file__).resolve().parents[3]
PROTO=ROOT/'prototypes/desk';OUT=ROOT/'art-masters/R23'
sys.path.insert(0,str(PROTO/'.geometry-tools'))
import shapefile
import numpy as np
from PIL import Image
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def digest(v):return hashlib.sha256(json.dumps(v,sort_keys=True).encode()).hexdigest()
target=PROTO/'public/map-data/union-1861.json'
geometry=json.loads(target.read_text(encoding='utf8'))
before={k:digest(geometry[k]) for k in ['regions','base']}
before['rail']=digest(geometry['cartography']['rail'])
elev=np.asarray(Image.open(ROOT/'art-masters/R22/sources/etopo1.tif'),dtype=float)
assert elev.shape==(1300,2000) and np.isfinite(elev).all()
# Smooth only one source pixel to suppress isolated DEM noise. Gradient units
# are metres per kilometre, including latitude's effect on east-west distance.
smooth=(4*elev+np.roll(elev,1,0)+np.roll(elev,-1,0)+np.roll(elev,1,1)+np.roll(elev,-1,1))/8
gy,gx=np.gradient(smooth)
relief=[]
for row in range(4,1296):
    lat=50-(row+.5)*.02;coslat=math.cos(math.radians(lat))
    for col in range(4,1996):
        east=gx[row,col]/(2.2264*coslat);north=-gy[row,col]/2.2264
        slope=math.hypot(east,north)
        if smooth[row,col]<100 or slope<35:continue
        strength=min(1,(slope-25)/150)
        seed=((row*73856093)^(col*19349663)) & 0xffffffff
        if (seed%1000)/1000 > .65+.35*strength:continue
        # Steeper faces carry longer, denser strokes. Deterministic sub-cell
        # jitter removes the sampling lattice without inventing ridge locations.
        lon=-105+(col+.5)*.02+((seed%97)/97-.5)*.012
        a_lat=lat+(((seed>>8)%97)/97-.5)*.012
        length=2+min(4,slope/40) # kilometres downhill
        dx=-east/slope*length/(111.32*coslat)
        dy=-north/slope*length/111.32
        relief.append({'a':[round(lon,5),round(a_lat,5)],'b':[round(lon+dx,5),round(a_lat+dy,5)],'strength':round(strength,3),'slope':round(slope,3)})

rivers=[];seen=set()
for file in ['ne_10m_rivers_lake_centerlines.zip','ne_10m_rivers_north_america.zip']:
    z=zipfile.ZipFile(ROOT/'art-masters/R18/sources'/file)
    part=lambda ext:io.BytesIO(z.read(next(n for n in z.namelist() if n.endswith(ext) and not n.startswith('__MACOSX'))))
    r=shapefile.Reader(shp=part('.shp'),shx=part('.shx'),dbf=part('.dbf'),encoding='latin1')
    for item in r.iterShapeRecords():
        if item.shape.shapeType==0 or not item.shape.points:continue
        if not any(-170<x<0 and -30<y<75 for x,y in item.shape.points):continue
        d=item.record.as_dict();name=d.get('name','') or '';geom=item.shape.__geo_interface__
        if name=='Cowpasture' and any(-81<x<-74 and 36<y<41 for x,y in item.shape.points):
            # Preserve the documented R22 main-stem naming correction; keep the
            # upstream tributary too, under its supplied name and own rank.
            parts=list(item.shape.parts)+[len(item.shape.points)]
            for start,end in zip(parts,parts[1:]):
                pts=item.shape.points[start:end];down=[p for p in pts if p[0]>-79.4];up=[p for p in pts if p[0]<=-79.4]
                for label,line in [('James',down),('Cowpasture',up)]:
                    if len(line)>1:rivers.append({'name':label,'rank':int(d.get('scalerank',6) or 0),'shape':{'type':'LineString','coordinates':line}})
            continue
        key=digest(geom)
        if key in seen:continue
        seen.add(key);rivers.append({'name':name,'rank':int(d.get('scalerank',6) or 0),'shape':geom})
# Same named river, same rank over its entire source geometry. Supplemental
# detail replaces the base river pass; it never sits over a second grey stroke.
ranks={}
for r in rivers:
    if r['name']:ranks[r['name']]=min(ranks.get(r['name'],99),r['rank'])
for r in rivers:
    if r['name']:r['rank']=ranks[r['name']]
geometry['cartography'].update(relief=relief,rivers=rivers)
target.write_text(json.dumps(geometry,sort_keys=True,separators=(',',':'),ensure_ascii=False)+'\n',encoding='utf8')
assert all(before[k]==digest(geometry[k]) for k in ['regions','base'])
assert before['rail']==digest(geometry['cartography']['rail'])
recipe_path=Path(str(target)+'.recipe.json');recipe=json.loads(recipe_path.read_text(encoding='utf8'))
recipe.update(request='R23',date='2026-11-18',sha256=sha(target),actualSize=target.stat().st_size)
recipe['R23']={'scriptSha256':sha(Path(__file__)),'sourceReuse':'Unchanged R18 Natural Earth ZIPs and R22 NOAA ETOPO1 export; URLs/licences/hashes in R22 source manifest and prior recipe. No new download.','relief':'Weighted five-pixel smoothing, metric downhill gradient; elevation >=100m, slope >=35m/km; source-pixel sampling with seeded slope-dependent density; lengths 2.875–6km; no flat-ground marks.','rivers':'Complete Natural Earth features, deduplicated; minimum supplied scalerank per river name; rendered once, replacing base river strokes. Existing R22 James/Cowpasture naming split retained.','preservedHashes':before}
recipe_path.write_text(json.dumps(recipe,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
report={'hachures':len(relief),'slopeRange':[min(r['slope'] for r in relief),max(r['slope'] for r in relief)],'rivers':len(rivers),'majorRanks':{n:ranks[n] for n in ['Potomac','Shenandoah','Rappahannock','York','James']},'preservedHashes':before,'geometrySha256':sha(target)}
(OUT/'cartography-build.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
