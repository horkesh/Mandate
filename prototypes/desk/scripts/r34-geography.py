"""Static display signs only. No knowledge, State, ownership or modern land cover."""
import csv,hashlib,json,math,sys
from pathlib import Path
P=Path(__file__).resolve().parents[1];R=P.parents[1]
sys.path[:0]=[str(P/'.geometry-tools')]
from shapely.geometry import shape,LineString
from shapely.strtree import STRtree
def rows(name):
 with (R/'packs/union-1861/source/world'/name).open(encoding='utf8',newline='') as f:return list(csv.DictReader(f))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
regions=rows('regions.csv');by_id={r['id']:r for r in regions};signs=[]
with (R/'packs/union-1861/source/drafts/census/kennedy-baltimore-split-1860.csv').open(encoding='utf8',newline='') as f:
 baltimore=next(int(row['aggregate']) for row in csv.DictReader(f) if 'city: Table 3' in row['county'])
def point(r):return [float(v) for v in r['ref_point'].split()] if r['ref_point'] else None
for r in regions:
 p=point(r)
 if not p or r['kind'] in ['sea','river','off_map']:continue
 capital='capital' in r['flags'].split(';')
 if r['kind']!='key_point' and r['terrain']!='urban' and not capital:continue
 kind='capital' if capital else 'city' if r['terrain']=='urban' else 'town' if 'rail_junction' in r['flags'] else 'hamlet'
 basis='Pack capital/urban/key_point/rail_junction hints; no county total treated as town population'
 # The only explicitly separated city count in the draft: no county back-projection.
 if r['id']=='baltimore':kind='city' if baltimore>=50000 else 'town';basis=f'1860 census Table 3, Baltimore city aggregate {baltimore}; kennedy-baltimore-split-1860.csv'
 signs.append(dict(id='town:'+r['id'],region=r['id'],kind=kind,name=r['name'],point=p,source=basis,size=1))
seen=set()
for r in rows('installations.csv'):
 if r['kind']!='fort' or r['region'] in seen:continue
 region=by_id[r['region']];p=point(region)
 if not p:continue
 seen.add(r['region']);kind='earthwork' if 'works' in r['id'] or 'battery' in r['id'] else 'fort'
 signs.append(dict(id='work:'+r['id'],region=r['region'],kind=kind,name=r['name'],point=p,source='Pack installations.csv:'+r['id']+'; region anchor, not surveyed work footprint',size=.85))
g=json.loads((P/'public/map-data/union-1861.json').read_text(encoding='utf8'));c=g['cartography']
for i,p in enumerate(c.get('lod',{}).get('stations',[])):
 signs.append(dict(id=f'station:{i}',kind='station',point=p,source='Existing rail-layer station catalogue',size=.48))
# Intersections of 1861 railway linework and major rivers; no graph routing.
rivers=[r for r in c['rivers'] if r.get('rank',10)<=5 or r['name'] in ['Potomac','Shenandoah','Rappahannock','York','James']]
river_shapes=[shape(r['shape']) for r in rivers];index=STRtree(river_shapes);cells=set()
for i,rail in enumerate(c['rail']):
 line=shape(rail)
 for j in index.query(line):
  hit=line.intersection(river_shapes[j])
  if hit.is_empty:continue
  points=[hit] if hit.geom_type=='Point' else list(hit.geoms) if hit.geom_type=='MultiPoint' else []
  for p in points:
   x,y=p.x,p.y
   if not (-102<x<-66 and 25<y<50):continue
   cell=(round(x,2),round(y,2))
   if cell in cells:continue
   cells.add(cell)
   signs.append(dict(id=f'crossing:{i}:{j}:{len(cells)}',kind='bridge',point=[round(x,6),round(y,6)],source=f'1861 Atack railway feature {i} intersecting Natural Earth {rivers[j]["name"]}; approximate crossing, structure not surveyed',size=.48))
# Named bridge/ferry graph edges add an approximate crossing only where the
# edge between authored anchors actually intersects a major river.
for i,edge in enumerate(rows('edges.csv')):
 text=edge['notes'].lower()
 if 'bridge' not in text and 'ferry' not in text:continue
 a=by_id.get(edge['from']);b=by_id.get(edge['to'])
 if not a or not b or not point(a) or not point(b):continue
 if a['kind'] in ['off_map','sea','river'] or b['kind'] in ['off_map','sea','river']:continue
 line=LineString([point(a),point(b)])
 hits=[]
 for j in index.query(line):
  hit=line.intersection(river_shapes[j]);points=[hit] if hit.geom_type=='Point' else list(hit.geoms) if hit.geom_type=='MultiPoint' else []
  for p in points:
   hits.append((p.distance(line.interpolate(.5,normalized=True)),int(j),p))
 # A graph edge is schematic. Its note identifies one crossing, not a ferry
 # at every river its straight display chord happens to intersect.
 if not hits:continue
 _,j,p=min(hits,key=lambda v:(v[0],v[1],v[2].x,v[2].y))
 cell=(round(p.x,2),round(p.y,2))
 if cell in cells:continue
 cells.add(cell)
 signs.append(dict(id=f'graph-crossing:{i}:{j}',kind='ferry' if 'ferry' in text else 'bridge',point=[round(p.x,6),round(p.y,6)],source=f'Pack edges.csv row {i+2}, {edge["from"]} to {edge["to"]}: named crossing, location approximated between authored anchors',size=.48))
# Upper ends of downhill hachures are elevation isolines. Highest contour in
# each cell follows the high ground; no mountain placed on a flat cell.
peaks={}
for h in c['relief']:
 x,y=h['a'];height=h.get('contour',0)
 if not (-101<x<-67 and 28<y<49) or height<450 or h.get('slope',0)<65:continue
 cell=(math.floor(x/.65),math.floor(y/.50))
 score=(height,h['strength'])
 if cell not in peaks or score>peaks[cell][0]:peaks[cell]=(score,h)
for cell,(score,h) in sorted(peaks.items()):
 signs.append(dict(id=f'ridge:{cell[0]}:{cell[1]}',kind='mountain',point=h['a'],source='R28 continuous elevation: highest qualifying contour endpoint per 0.65 x 0.50 degree cell; >=450m, slope >=65m/km',size=1,contour=h['contour']))
data={'_comment':'R34 prototype display hints; belongs in the pack later. Geographic furniture only, never control or movement. Region anchors and crossing locations are approximate. City street plans are emblems, not invented roads.', 'pack':'union-1861','signs':signs,'stationCount':len(c.get('lod',{}).get('stations',[])),'sources':[]}
for p in [R/'packs/union-1861/source/world/regions.csv',R/'packs/union-1861/source/world/installations.csv',R/'packs/union-1861/source/world/edges.csv',R/'packs/union-1861/source/drafts/census/kennedy-baltimore-split-1860.csv',P/'public/map-data/union-1861.json']:
 data['sources'].append({'path':p.relative_to(R).as_posix(),'sha256':sha(p)})
target=P/'web/map/furniture-data.json';target.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf8')
print(json.dumps({'signs':len(signs),'byKind':{k:sum(s['kind']==k for s in signs) for k in sorted(set(s['kind'] for s in signs))},'sha256':sha(target)}))
