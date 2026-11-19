"""R18: official source downloads only. No extraction outside the R18 source folder."""
import hashlib, json, sys, urllib.request, zipfile
from datetime import datetime, timezone
from pathlib import Path
from map_zip import open_zip

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'art-masters/R18/sources'
PAGES = {
    'newberry-downloads.html':'https://publications.newberry.org/ahcb/downloads/index.html',
    'newberry-us.html':'https://publications.newberry.org/ahcb/downloads/united_states.html',
    'newberry-policy.html':'https://www.newberry.org/policies',
    'natural-earth-terms.html':'https://www.naturalearthdata.com/about/terms-of-use/',
}
DATA = {'US_AtlasHCB_Counties_Gen01.zip':'https://publications.newberry.org/ahcb/downloads/gis/US_AtlasHCB_Counties_Gen01.zip'}
for name in ['coastline','land','lakes','rivers_lake_centerlines','rivers_north_america']:
    # Natural Earth's own AWS download host (the primary site identifies AWS as its host).
    DATA[f'ne_10m_{name}.zip'] = f'https://naturalearth.s3.amazonaws.com/10m_physical/ne_10m_{name}.zip'

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    previous = json.loads((OUT/'manifest.json').read_text()) if (OUT/'manifest.json').exists() else []
    records = {r['file']:r for r in previous}
    for name,url in {**PAGES,**DATA}.items():
        file = OUT/name
        if file.exists() and name in records:
            actual=hashlib.sha256(file.read_bytes()).hexdigest()
            if actual != records[name]['sha256']: raise ValueError(f'Source changed on disk: {name}')
            print('reuse',name,flush=True); continue
        try:
            if file.exists() and name.endswith('.zip'):
                data=file.read_bytes(); final=url
            else:
                req=urllib.request.Request(url,headers={'User-Agent':'R18-local-map-build/1.0'})
                with urllib.request.urlopen(req,timeout=90) as response:
                    final=response.url
                    if not (final.startswith('https://publications.newberry.org/') or final.startswith('https://www.newberry.org/') or final.startswith('https://www.naturalearthdata.com/') or final.startswith('https://naturalearth.s3.amazonaws.com/')):
                        raise ValueError(f'Non-primary redirect: {final}')
                    data=response.read()
            file.write_bytes(data)
            if name.endswith('.zip'):
                with open_zip(data) as z:
                    offset_adjustment=z.r18_offset_adjustment
            records[name]={'file':name,'url':url,'resolvedUrl':final,'date':datetime.now(timezone.utc).isoformat(),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
            if name.endswith('.zip'): records[name]['zipReaderOffsetAdjustment']=offset_adjustment
            print('saved',name,len(data),flush=True)
        except Exception as exc:
            if name != 'natural-earth-terms.html': raise
            archived=OUT/'natural-earth-pages.extracted.json'
            if not archived.exists(): raise RuntimeError('Archive Natural Earth terms from its own page, then retry') from exc
            records[archived.name]={'file':archived.name,'url':url,'date':datetime.now(timezone.utc).isoformat(),'sha256':hashlib.sha256(archived.read_bytes()).hexdigest(),'bytes':archived.stat().st_size,'method':'Primary-page text extracted by web tool after local HTTP 406','localFailure':str(exc)}
            print('using archived primary terms; local page failed:',exc,flush=True)
        (OUT/'manifest.json').write_text(json.dumps([records[k] for k in sorted(records)],indent=2)+'\n',encoding='utf8')

if __name__=='__main__': main()
