"""Dissolve exact dated Newberry county matches; render geography never supplies adjacency."""
import argparse, csv, hashlib, io, json, sys
from datetime import date
from pathlib import Path

HERE=Path(__file__).resolve().parent
PROTO=HERE.parent
ROOT=PROTO.parents[1]
sys.path.insert(0,str(PROTO/'.geometry-tools'))
import shapefile
import shapely
from shapely.geometry import shape, mapping, box
from shapely.ops import unary_union
from map_zip import open_zip

SOURCES=ROOT/'art-masters/R18/sources'
OUT=PROTO/'public/map-data'
DAY=date(1861,3,6)
# This geographic source box encloses the renderer's entire allowed canvas,
# not just the authored war regions. Its edge is never drawn as a coast.
BASE_COVERAGE={'geographicBox':[-170,-30,0,75],'worldBounds':[-900,-350,1300,650]}
CLIP=box(*BASE_COVERAGE['geographicBox'])
ARGS=argparse.ArgumentParser()
ARGS.add_argument('--base-only',action='store_true',help='Preserve existing regions and testbed byte-for-byte')
ARGS.add_argument('--evidence-request',default='R18')
OPTIONS=ARGS.parse_args()
EVIDENCE=ROOT/'art-masters'/OPTIONS.evidence_request
TOLERANCE=.008  # about 0.9 km latitude, below one display pixel over most of the range

def sha(file): return hashlib.sha256(file.read_bytes()).hexdigest()
def read_zip(name):
    archive=open_zip((SOURCES/name).read_bytes())
    def member(ext):
        found=[n for n in archive.namelist() if n.endswith(ext)]
        if len(found)!=1: raise ValueError(f'Expected one {ext} member: {name}')
        return io.BytesIO(archive.read(found[0]))
    reader=shapefile.Reader(shp=member('.shp'),dbf=member('.dbf'),shx=member('.shx'),encoding='latin1')
    return reader,archive

def point(text):
    return [float(v) for v in text.strip().split()] if text.strip() else None
def rows(pack):
    with (ROOT/f'packs/{pack}/source/world/regions.csv').open(encoding='utf8',newline='') as f:
        return sorted(csv.DictReader(f),key=lambda r:r['id'])
def region(row,geom=None):
    return {'id':row['id'],'name':row['name'],'kind':row['kind'],'point':point(row['ref_point']),
            'shape': mapping(geom) if geom is not None else None,
            'label':{'anchor':point(row['label_anchor']),'spine':[point(p) for p in row['label_spine'].split(';') if p.strip()],
                     'size':row['label_size'] or None,'minZoom':int(row['label_min_zoom']) if row['label_min_zoom'] else None}}
def dump(path,data): path.write_text(json.dumps(data,sort_keys=True,separators=(',',':'),ensure_ascii=False)+'\n',encoding='utf8')
def clean(geom):
    if not geom.is_valid: geom=shapely.make_valid(geom)
    geom=shapely.normalize(geom.simplify(TOLERANCE,preserve_topology=True))
    if geom.is_empty or not geom.is_valid: raise ValueError('Empty or invalid derived geometry')
    return geom

def build_base():
    base=[]; base_counts={}; null_shapes=[]
    for name,kind in [('land','land'),('coastline','coast'),('lakes','lake'),('rivers_lake_centerlines','river'),('rivers_north_america','river')]:
        r,z=read_zip(f'ne_10m_{name}.zip'); count=0
        for item in r.iterShapeRecords():
            d=item.record.as_dict()
            if item.shape.shapeType==0:
                null_shapes.append({'source':name,'record':item.record.oid}); continue
            # Reservoirs are modern surface features, not an assertion about 1861.
            if kind=='lake' and 'reservoir' in str(d.get('featurecla','')).lower(): continue
            geom=shape(item.shape.__geo_interface__)
            if not geom.intersects(CLIP): continue
            clipped=clean(geom.intersection(CLIP))
            base.append({'kind':kind,'shape':mapping(clipped),'rank':int(d.get('scalerank',8) or 0)})
            count+=1
        base_counts[name]=count; z.close()
    return base,base_counts,null_shapes

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    manifest=json.loads((SOURCES/'manifest.json').read_text(encoding='utf8'))
    for entry in manifest:
        if sha(SOURCES/entry['file'])!=entry['sha256']: raise ValueError(f"Source hash mismatch: {entry['file']}")
    EVIDENCE.mkdir(parents=True,exist_ok=True)
    if OPTIONS.base_only:
        target=OUT/'union-1861.json'
        original=json.loads(target.read_text(encoding='utf8'))
        old_hash=sha(target)
        base,counts,nulls=build_base()
        # No Newberry processing in this mode: keep every region value intact.
        original['base']=base
        original['baseCoverage']=BASE_COVERAGE
        dump(target,original)
        recipe_file=Path(str(target)+'.recipe.json')
        prior=json.loads(recipe_file.read_text(encoding='utf8'))
        dump(EVIDENCE/'prior-geometry-recipe.json',prior)
        recipe={**prior,'request':OPTIONS.evidence_request,'date':'2026-11-18',
                'sha256':sha(target),'actualSize':target.stat().st_size,
                'baseLayerUpdate':{'priorSha256':old_hash,'scriptSha256':sha(Path(__file__)),
                    'sourceBox':BASE_COVERAGE,'sources':[m for m in manifest if m['file'].startswith('ne_')],
                    'mode':'Natural Earth base only; existing regions unchanged',
                    'evidence':str(EVIDENCE.relative_to(ROOT))+'/base-build.json'}}
        dump(recipe_file,recipe)
        report={'request':OPTIONS.evidence_request,'pass':True,'priorSha256':old_hash,
                'sha256':sha(target),'baseFeatures':counts,'nullBaseShapesOmitted':nulls,
                'coverage':BASE_COVERAGE,'regionCount':len(original['regions']),
                'regionsPreserved':True,'scriptSha256':sha(Path(__file__)),
                'sourceManifestSha256':sha(SOURCES/'manifest.json')}
        dump(EVIDENCE/'base-build.json',report)
        print(json.dumps(report));return
    reader,archive=read_zip('US_AtlasHCB_Counties_Gen01.zip')
    prj=archive.read(next(n for n in archive.namelist() if n.endswith('.prj'))).decode()
    if 'GCS_WGS_1984' not in prj: raise ValueError('County CRS is not WGS84 longitude/latitude')
    index={}
    selected=0
    for i,record in enumerate(reader.iterRecords()):
        d=record.as_dict()
        if d['START_DATE']<=DAY<=d['END_DATE'] and d['CNTY_TYPE']!='Proposal':
            key=(d['STATE_TERR'].strip().casefold(),d['NAME'].strip().casefold())
            index.setdefault(key,[]).append((i,d)); selected+=1
    unmatched=[]; ambiguous=[]; matched=[]; no_counties=[]; invalid_inputs=[]; result=[]; used={}; incomplete=[]; expansions=[]
    authored=rows('union-1861')
    explicit={tuple(p.strip().casefold() for p in n.strip().split(':',1)) for r in authored for n in r['counties'].split(';') if ':' in n and '*' not in n}
    for row in authored:
        names=[n.strip() for n in row['counties'].split(';') if n.strip()]
        if not names:
            no_counties.append({'id':row['id'],'name':row['name'],'kind':row['kind'],'role':row['off_map_role'],'treatment':'no area; reference point only, or omitted if outside map'})
            result.append(region(row)); continue
        polys=[]; failed=False
        for name in names:
            parts=name.split(':',1)
            if len(parts)==2 and parts[1]=='*':
                state=parts[0].strip().casefold()
                # The pack notes explicitly define * as the whole state or its unnamed remainder.
                wildcard=[(key,records) for key,records in sorted(index.items()) if key[0]==state and key not in explicit]
                if not wildcard:
                    unmatched.append({'region':row['id'],'county':name});failed=True;continue
                expansions.append({'region':row['id'],'expression':name,'sourceCountyNames':[key[1] for key,_ in wildcard],'rule':'all dated counties of this exact state, except counties explicitly assigned elsewhere in the pack'})
                for key,records in wildcard:
                    if len(records)!=1: raise ValueError(f'Ambiguous wildcard member: {key}')
                    i,d=records[0];polys.append(shape(reader.shape(i).__geo_interface__))
                continue
            records=index.get(tuple(p.strip().casefold() for p in parts),[]) if len(parts)==2 else []
            if not records:
                unmatched.append({'region':row['id'],'county':name}); failed=True; continue
            if len(records)!=1:
                ambiguous.append({'region':row['id'],'county':name,'records':[x[1] for x in records]}); failed=True; continue
            i,d=records[0]
            geom=shape(reader.shape(i).__geo_interface__)
            if not geom.is_valid:
                invalid_inputs.append({'county':name,'action':'Shapely make_valid before union'})
                geom=shapely.make_valid(geom)
            polys.append(geom)
            used.setdefault(name,[]).append(row['id'])
            matched.append({'region':row['id'],'county':name,'sourceId':d['ID'],'version':d['VERSION'],'start':str(d['START_DATE']),'end':str(d['END_DATE'])})
        # Never draw a partial boundary as if it were the whole region.
        if failed: incomplete.append(row['id']); result.append(region(row)); continue
        dissolved=clean(unary_union(polys))
        result.append(region(row,dissolved))
    base,base_counts,null_shapes=build_base()
    union={'version':1,'pack':'union-1861','schematic':False,'regions':result,'base':base,'baseCoverage':BASE_COVERAGE}
    dump(OUT/'union-1861.json',union)
    # Testbed has invented counties, so show authored reference nodes on blank linen, never faux real boundaries.
    dump(OUT/'testbed.json',{'version':1,'pack':'testbed','schematic':True,'regions':[region(r) for r in rows('testbed')],'base':[]})
    diagnostics={'date':str(DAY),'crs':'WGS84 EPSG:4326 longitude,latitude','countySourceGeneralizationDegrees':.01,'simplificationDegrees':TOLERANCE,'shapely':shapely.__version__,
                 'selectedDatedCountyRecords':selected,'regions':len(result),'regionsWithShapes':sum(r['shape'] is not None for r in result),
                 'unmatched':unmatched,'ambiguous':ambiguous,'incompleteRegions':incomplete,'noCounties':no_counties,'matched':matched,'wildcardExpansions':expansions,
                 'countySharedByRegions':{k:v for k,v in sorted(used.items()) if len(v)>1},'invalidInputsRepaired':invalid_inputs,'baseFeatures':base_counts,'nullBaseShapesOmitted':null_shapes,
                 'outputs':{name:sha(OUT/name) for name in ['union-1861.json','testbed.json']},
                 'sourceArchiveOffsetAdjustment':archive.r18_offset_adjustment,'adjacency':'none; shapes never create graph edges',
                 'historicalLimit':'Natural Earth hydrography is modern, without period river corrections; reservoirs excluded. No rail, roads or relief invented.'}
    dump(EVIDENCE/'geometry-report.json',diagnostics)
    # Locally ignored provenance accompanies every geometry asset, including the public point-only testbed.
    for name in ['union-1861.json','testbed.json']:
        dump(OUT/(name+'.recipe.json'),{'asset':'prototypes/desk/public/map-data/'+name,'request':'R18','date':'2026-11-17','boundaryDate':str(DAY),'tool':'Python/pyshp/Shapely','mode':'deterministic county dissolve and simplify' if name.startswith('union') else 'authored fictional reference points only',
             'plan':'owner previously recorded ChatGPT Pro 100','client':'Codex command-line session','model':'not exposed by this tool','humanEdits':[],
             'prompt':None,'references':[{'sourceUrl':m['url'],'sha256':m['sha256'],'archive':'art-masters/R18/sources/'+m['file']} for m in manifest],
             'scriptSha256':sha(Path(__file__)),'inputCsvSha256':sha(ROOT/f"packs/{'union-1861' if name.startswith('union') else 'testbed'}/source/world/regions.csv"),
             'requestedSize':'geographic vector','actualSize':(OUT/name).stat().st_size,'sha256':sha(OUT/name),'postProcess':['casefold and whitespace normalization only; no alias matching','no partial boundaries when county match fails','topology-preserving simplify; canonical ordering'],
             'provenanceMarks':'No image model or provenance marks involved','publication':'locally ignored pending Newberry written confirmation'})
    print(json.dumps({k:diagnostics[k] for k in ['regions','regionsWithShapes','baseFeatures','outputs']}))
    print('Unmatched county references:',len(unmatched),'ambiguous:',len(ambiguous),'no-counties regions:',len(no_counties))

if __name__=='__main__': main()
