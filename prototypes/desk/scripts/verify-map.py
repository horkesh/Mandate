"""Cheap local integrity checks; does not infer graph links or change any map data."""
import argparse,csv,hashlib,json,math,sys
from pathlib import Path
HERE=Path(__file__).resolve().parent
PROTO=HERE.parent;ROOT=PROTO.parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--evidence-request',default='R18')
options=parser.parse_args()
sys.path.insert(0,str(PROTO/'.geometry-tools'))
from shapely.geometry import shape
from shapely.strtree import STRtree

def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
results=[]
for pack in ['union-1861','testbed']:
    file=PROTO/f'public/map-data/{pack}.json';data=json.loads(file.read_text(encoding='utf8'))
    with (ROOT/f'packs/{pack}/source/world/regions.csv').open(encoding='utf8',newline='') as f:rows=sorted(csv.DictReader(f),key=lambda r:r['id'])
    assert [r['id'] for r in data['regions']]==[r['id'] for r in rows]
    assert data['pack']==pack and data['version']==1
    assert all(set(r)=={'id','name','kind','point','shape','label'} for r in data['regions'])
    geometry=[];ids=[];vertices=0
    def inspect_coords(coords):
        global vertices
        if isinstance(coords[0],(int,float)):
            assert len(coords)==2 and all(math.isfinite(n) for n in coords)
            assert -180<=coords[0]<=180 and -90<=coords[1]<=90
            vertices+=1
        else:
            for child in coords:inspect_coords(child)
    for r,row in zip(data['regions'],rows):
        expected=[float(n) for n in row['ref_point'].split()] if row['ref_point'] else None
        assert r['point']==expected and r['name']==row['name'] and r['kind']==row['kind']
        assert r['label']['anchor']==([float(n) for n in row['label_anchor'].split()] if row['label_anchor'] else None)
        if r['shape']:
            geom=shape(r['shape']);assert geom.is_valid and not geom.is_empty
            inspect_coords(r['shape']['coordinates']);geometry.append(geom);ids.append(r['id'])
    for feature in data['base']:
        geom=shape(feature['shape']);assert geom.is_valid and not geom.is_empty
        if 'coordinates' in feature['shape']:inspect_coords(feature['shape']['coordinates'])
    intersections=[]
    if geometry:
        tree=STRtree(geometry)
        for i,g in enumerate(geometry):
            for j in tree.query(g):
                if j<=i:continue
                area=g.intersection(geometry[j]).area
                if area>.0001:intersections.append({'a':ids[i],'b':ids[j],'areaSquareDegrees':area})
    intersections.sort(key=lambda r:-r['areaSquareDegrees'])
    recipe=json.loads(Path(str(file)+'.recipe.json').read_text(encoding='utf8'))
    assert recipe['sha256']==digest(file)
    assert '/public/map-data/' in ('/'+(PROTO/'.gitignore').read_text().replace('\r',''))
    results.append({'pack':pack,'regions':len(data['regions']),'areaShapes':len(geometry),'vertices':vertices,'sha256':digest(file),'valid':True,'boundaryOverlaps':intersections})
report={'pass':True,'checks':results,'adjacencyComputed':False,'note':'Small independently simplified boundary overlaps are reported in square degrees; no movement graph uses these shapes.'}
(ROOT/'art-masters'/options.evidence_request/'geometry-checks.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='checks'}))
for result in results:print(result['pack'],result['regions'],'regions,',result['areaShapes'],'area shapes,',len(result['boundaryOverlaps']),'reported boundary overlaps')
