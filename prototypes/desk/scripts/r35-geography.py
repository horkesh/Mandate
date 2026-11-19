"""R35 display catalogue. No simulation input or modern land cover."""
import json,math,hashlib
from pathlib import Path
P=Path(__file__).resolve().parents[1]
old=json.loads((P/'web/map/furniture-data.json').read_text())
g=json.loads((P/'public/map-data/union-1861.json').read_text())
signs=[s for s in old['signs'] if s['kind']!='mountain']
# Broad named physiographic corridors are display hints, not surveyed ridges.
# Every actual anchor is an endpoint on R28's continuous elevation contours.
corridors=[('Blue Ridge',[-80.8,36.1,-78.1,40.0]),('Alleghenies',[-81.4,37.2,-78.4,41.5]),('southern Appalachians',[-85.6,33.4,-80.8,36.8])]
for name,(w,s,e,n) in corridors:
 cells={}
 for h in g['cartography']['relief']:
  x,y=h['a'];height=h.get('contour',0)
  if not(w<x<e and s<y<n) or height<500 or h.get('slope',0)<40:continue
  # The Blue Ridge is the eastern high ground in its corridor; Alleghenies
  # uses the western half. The selection still requires an elevation contour.
  if name=='Blue Ridge' and x < -78.45-(39.6-y)*.63:continue
  if name=='Alleghenies' and x > -79.1-(40-y)*.30:continue
  cell=math.floor(y/.32)
  score=(height,h.get('slope',0))
  if cell not in cells or score>cells[cell][0]:cells[cell]=(score,h)
 for cell,(_,h) in sorted(cells.items()):
  signs.append(dict(id=f'r35-ridge:{name}:{cell}',kind='mountain',point=h['a'],name=name,source='R28 continuous elevation, >=500m contour, >=40m/km slope; high point per latitude bin inside named broad physiographic display corridor',size=.9,contour=h['contour'],ridgeBand=name))
old.update(signs=signs,_comment=old['_comment']+' R35: silhouette bands select actual contour endpoints; corridor names are broad display hints, never a terrain boundary.')
(P/'web/map/furniture-r35.json').write_text(json.dumps(old,separators=(',',':'))+'\n')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
target=P/'web/map/furniture-r35.json'
recipe=dict(asset='web/map/furniture-r35.json',request='R35',date='2026-11-18',tool='Python standard library',mode='Deterministic geographic display catalogue; no reports or truth state',plan='Previously confirmed ChatGPT Pro 100; no image service',client='Codex',model='Procedural code, no image model',prompt='Elevation-backed silhouette bands for Blue Ridge, Alleghenies and southern Appalachians; retain sourced R34 static signs',references=[dict(path='web/map/furniture-data.json',sha256=sha(P/'web/map/furniture-data.json'),recipe='web/map/furniture-data.json.recipe.json'),dict(path='public/map-data/union-1861.json',sha256=sha(P/'public/map-data/union-1861.json'),recipe='public/map-data/union-1861.json.recipe.json')],requestedSize='Three ridge display bands',actualSize=f'{len(signs)} feature anchors',humanEdits=[],postProcess=['Broad corridor selection on actual continuous elevation contour endpoints; land-footprint and collision rejection occurs in the sign bake'],provenanceMarks='No raster model or metadata marks',sha256=sha(target),scriptSha256=sha(Path(__file__)))
(P/'web/map/furniture-r35.json.recipe.json').write_text(json.dumps(recipe,indent=2)+'\n')
print(json.dumps({'features':len(signs),'ridgeBands':{n:sum(s.get('ridgeBand')==n for s in signs) for n,_ in corridors}}))
