"""R22 cartography only. Preserve the dated Newberry regions and base verbatim.
Run from any directory; raw inputs stay in art-masters/R22/sources.
Requires existing pyshp, Pillow, numpy and pyproj (development only).
"""
from pathlib import Path
import hashlib, io, json, math, sys, zipfile
ROOT=Path(__file__).resolve().parents[3]
PROTO=ROOT/'prototypes/desk'
OUT=ROOT/'art-masters/R22'
sys.path[:0]=[str(PROTO/'.geometry-tools'),str(OUT/'python-tools')]
import shapefile
import numpy as np
from PIL import Image
from pyproj import CRS, Transformer

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def reader(p):
    z=zipfile.ZipFile(p)
    member=lambda ext:io.BytesIO(z.read(next(n for n in z.namelist() if n.endswith(ext) and not n.startswith('__MACOSX'))))
    return z,shapefile.Reader(shp=member('.shp'),shx=member('.shx'),dbf=member('.dbf'),encoding='latin1')
def rounded(points):return [[round(x,5),round(y,5)] for x,y in points]

target=PROTO/'public/map-data/union-1861.json'
geometry=json.loads(target.read_text(encoding='utf8'))
original_regions=hashlib.sha256(json.dumps(geometry['regions'],sort_keys=True).encode()).hexdigest()
original_base=hashlib.sha256(json.dumps(geometry['base'],sort_keys=True).encode()).hexdigest()
z,r=reader(OUT/'sources/rail.zip')
prj=z.read(next(n for n in z.namelist() if n.endswith('.prj') and not n.startswith('__MACOSX'))).decode()
transform=Transformer.from_crs(CRS.from_wkt(prj),'EPSG:4326',always_xy=True)
rail=[];years={};minyear=9999;maxyear=0
for item in r.iterShapeRecords():
    d=item.record.as_dict();year=d['InOpBy'] or 0
    if not 0<year<=1861 or not item.shape.points:continue
    parts=list(item.shape.parts)+[len(item.shape.points)]
    lines=[]
    for start,end in zip(parts,parts[1:]):
        pts=[transform.transform(x,y) for x,y in item.shape.points[start:end]]
        # Retain all 1861 segments within the Lower 48. This is display only.
        if len(pts)>1:lines.append(rounded(pts))
    if lines:rail.append({'type':'MultiLineString','coordinates':lines});years[year]=years.get(year,0)+1
minyear=min(years);maxyear=max(years)

# Export is a 2000x1300 geographic grid, pixel centres, north at row zero.
elev=np.asarray(Image.open(OUT/'sources/etopo1.tif'),dtype=float)
assert elev.shape==(1300,2000) and np.isfinite(elev).all()
gy,gx=np.gradient(elev)
relief=[]
for row in range(3,1297,3):
    for col in range(3,1997,3):
        height=elev[row,col];slope=math.hypot(gx[row,col],gy[row,col])
        if height<75 or slope<9:continue
        lon=-105+(col+.5)*40/2000;lat=50-(row+.5)*26/1300
        # Hachure follows the DEM's downhill aspect. Position and length are
        # reproducible, with no invented ridge or learned image operation.
        length=min(.043,.008+slope/3500)
        norm=max(slope,1);dx=-gx[row,col]/norm*length;dy=gy[row,col]/norm*length
        relief.append({'a':[round(lon,5),round(lat,5)],'b':[round(lon+dx,5),round(lat+dy,5)],'strength':round(min(1,slope/110),3)})

rivers=[]
for file in ['ne_10m_rivers_lake_centerlines.zip','ne_10m_rivers_north_america.zip']:
    z,r=reader(ROOT/'art-masters/R18/sources'/file)
    for item in r.iterShapeRecords():
        name=item.record.as_dict().get('name','') or ''
        if not any(s in name for s in ['Potomac','Shenandoah','Rappahannock','York','James','Cowpasture']):continue
        if item.shape.shapeType==0:continue
        if not any(-81<x<-74 and 36<y<41 for x,y in item.shape.points):continue
        geom=item.shape.__geo_interface__
        if name=='Cowpasture':
            # NE combines the tributary and main stem. USGS WSP 126 and the
            # pack identify this downstream reach as the James near Richmond.
            pts=[p for p in item.shape.points if p[0]>-79.4]
            if len(pts)<2:continue
            geom={'type':'LineString','coordinates':pts};name='James'
        rivers.append({'name':name,'shape':geom})

geometry['cartography']={'rail':rail,'relief':relief,'rivers':rivers,'sources':'art-masters/R22/sources/manifest.json'}
target.write_text(json.dumps(geometry,sort_keys=True,separators=(',',':'),ensure_ascii=False)+'\n',encoding='utf8')
recipe_path=Path(str(target)+'.recipe.json')
recipe=json.loads(recipe_path.read_text(encoding='utf8'))
if not (OUT/'prior-geometry-recipe.json').exists():(OUT/'prior-geometry-recipe.json').write_text(json.dumps(recipe,indent=2))
credit='Jeremy Atack, “Historical Geographic Information Systems (GIS) database of U.S. Railroads for 1861” (May 2016; revised October 31, 2023).'
recipe.update(request='R22',date='2026-11-18',sha256=sha(target),actualSize=target.stat().st_size)
recipe['R22']={'scriptSha256':sha(Path(__file__)),'sources':json.loads((OUT/'sources/manifest.json').read_text()),'railCredit':credit,'railPermission':'Owner holds written permission for game and repository derivatives, per Claude R22 in CODEX.md. Raw rail data remains ignored.','railSelection':'0 < InOpBy <= 1861; annual resolution, not a claim that every segment was open on 6 March','reliefCredit':'Amante, C. and B.W. Eakins (2009), ETOPO1. NOAA National Geophysical Data Center, doi:10.7289/V5C8276M.','towns':'Only pack key_point reference points; no modern gazetteer','regionsLicence':'CC0 per Newberry written confirmation, 16 November 2026; prototype geometry remains ignored pending review','baseLicence':'Natural Earth public domain','jamesNameCorrection':'Natural Earth Cowpasture combined feature: downstream James main stem east of -79.4 only. USGS WSP 126: https://pubs.usgs.gov/wsp/0126/report.pdf; pack Richmond notes. No vertices invented.', 'processing':'NAD83 Albers to WGS84 via PROJ; DEM downhill hachures; no learned processing','regionHash':original_regions,'baseHash':original_base}
recipe_path.write_text(json.dumps(recipe,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
report=dict(railFeatures=len(rail),railYearRange=[minyear,maxyear],hachures=len(relief),namedRiverFeatures=len(rivers),names=sorted(set(r['name'] for r in rivers)),regionsPreserved=original_regions==hashlib.sha256(json.dumps(geometry['regions'],sort_keys=True).encode()).hexdigest(),basePreserved=original_base==hashlib.sha256(json.dumps(geometry['base'],sort_keys=True).encode()).hexdigest(),geometrySha256=sha(target),railCredit=credit)
(OUT/'cartography-build.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
