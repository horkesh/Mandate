"""Recover seven Eastern display areas from dated Newberry records; no political data."""
import csv, hashlib, io, json, os, sys
from datetime import date
from pathlib import Path
P=Path(__file__).resolve().parents[1]
MAIN=Path('C:/Pyrrhic/ByOrderOfThePresident')
OUT=MAIN/'art-masters/R30'
sys.path[:0]=[str(P/'.geometry-tools'),str(P/'scripts')]
import shapefile, shapely
from shapely.geometry import shape, mapping
from shapely.ops import unary_union
from map_zip import open_zip

DAY=date(1861,3,6)
TARGETS=['washington','southern_maryland','eastern_shore','peninsula','fort_monroe','norfolk','southside_tidewater']
# Publisher names, not fuzzy matches. The suffix means extinct today, not in
# 1861. Exact active record dates and IDs are retained in the build proof.
NAMES={
 "Maryland:Prince George's":'PRINCE GEORGES',
 "Maryland:Queen Anne's":'QUEEN ANNES',
 "Maryland:St. Mary's":'ST. MARYS',
 'Virginia:Elizabeth City':'ELIZABETH CITY (ext)',
 'Virginia:Norfolk':'NORFOLK (ext)',
 'Virginia:Princess Anne':'PRINCESS ANNE (ext)',
 'Virginia:Warwick':'WARWICK (ext)',
 'Virginia:Nansemond':'NANSEMOND (ext)',
}
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def dump(p,data):p.write_text(json.dumps(data,sort_keys=True,separators=(',',':'),ensure_ascii=False)+'\n',encoding='utf8')
def main():
 OUT.mkdir(parents=True,exist_ok=True)
 manifest=json.loads((MAIN/'art-masters/R24/sources/manifest.json').read_text('utf8'))
 source=next(s for s in manifest if s['file']=='US_AtlasHCB_Counties_Gen001.zip')
 archive=MAIN/'art-masters/R24/sources'/source['file']
 assert sha(archive)==source['sha256'],'Source archive changed'
 z=open_zip(archive.read_bytes())
 def member(ext):return io.BytesIO(z.read(next(n for n in z.namelist() if n.endswith(ext))))
 reader=shapefile.Reader(shp=member('.shp'),shx=member('.shx'),dbf=member('.dbf'),encoding='latin1')
 index={}
 for i,rec in enumerate(reader.iterRecords()):
  d=rec.as_dict()
  if d['START_DATE']<=DAY<=d['END_DATE'] and d['CNTY_TYPE']!='Proposal':
   index.setdefault((d['STATE_TERR'].casefold(),d['NAME'].casefold()),[]).append((i,d))
 csv_path=P.parents[1]/'packs/union-1861/source/world/regions.csv'
 with csv_path.open(encoding='utf8',newline='') as f:rows={r['id']:r for r in csv.DictReader(f)}
 areas={};proof=[]
 for region in sorted(TARGETS):
  polygons=[];matches=[]
  for expression in rows[region]['counties'].split(';'):
   state,name=expression.split(':',1)
   if expression=='District of Columbia:District of Columbia':
    # The pack names the whole District. Its sole active county is
    # dcs_washington, 1801-02-27 through 1871-02-20.
    records=[v for (s,n),vals in index.items() if s=='district of columbia' for v in vals]
    assert len(records)==1 and records[0][1]['ID']=='dcs_washington'
   else:
    records=index.get((state.casefold(),NAMES.get(expression,name).casefold()),[])
    assert len(records)==1,(region,expression,len(records))
   for i,d in records:
    geom=shape(reader.shape(i).__geo_interface__)
    if not geom.is_valid:geom=shapely.make_valid(geom)
    polygons.append(geom)
    matches.append({'expression':expression,'name':d['NAME'],'sourceId':d['ID'],'version':d['VERSION'],'start':str(d['START_DATE']),'end':str(d['END_DATE'])})
  geom=shapely.normalize(unary_union(polygons).simplify(.0003,preserve_topology=True))
  assert not geom.is_empty and geom.is_valid,region
  areas[region]=mapping(geom)
  proof.append({'region':region,'matches':matches,'bounds':list(geom.bounds),'areaDegrees2':geom.area,'valid':geom.is_valid})
 target=P/'public/map-data/union-1861-claim-areas.json'
 dump(target,areas)
 recipe={'request':'R30','brief':'CODEX.md R30, bare regions','date':'2026-11-18','asset':str(target),'sha256':sha(target),'plan':'ChatGPT Pro 100, prior confirmation in CODEX.md; no image service used','client':'Codex command-line session','model':'No image model','apiKeyUnset':not bool(os.environ.get('OPENAI_API_KEY')),'prompt':None,'requestedSize':'seven complete geographic region areas','actualSize':target.stat().st_size,'variantsMade':1,'variantChosen':1,'tool':'Python/pyshp/Shapely','mode':'Exact dated county dissolve; only missing display areas','scriptSha256':sha(Path(__file__)),'csvSha256':sha(csv_path),'boundaryDate':str(DAY),'references':[dict(source,sourceUrl=source['url'],path=str(archive))],'postProcess':['make_valid where needed','union complete region counties','topology-preserving simplify 0.0003 degrees','canonical ordering'],'provenanceMarks':'Geographic data, no image model or provenance marks generated or removed','humanEdits':[],'adjacency':'none'}
 dump(Path(str(target)+'.recipe.json'),recipe)
 dump(OUT/'area-build.json',{'pass':True,'regions':proof,'recipe':recipe})
 print(json.dumps({'pass':True,'regions':len(areas),'sha256':sha(target),'bytes':target.stat().st_size}))
if __name__=='__main__':main()
