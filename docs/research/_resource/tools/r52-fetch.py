"""Fetch named public-domain source OCR; cache under R52's research scope."""
from pathlib import Path
import concurrent.futures, hashlib, json, sys, urllib.request
OUT=Path(__file__).resolve().parents[1]/'evidence-r52'/'sources'
OUT.mkdir(exist_ok=True)

def fetch(identifier):
    url=f'https://archive.org/download/{identifier}/{identifier}_djvu.txt'
    p=OUT/(identifier+'.txt')
    try:
        if not p.exists():
            with urllib.request.urlopen(url,timeout=25) as r: data=r.read()
            if len(data)<10000 or b'<html' in data[:500].lower():raise ValueError('not substantive OCR')
            p.write_bytes(data)
        data=p.read_bytes()
        rec={'id':identifier,'url':url,'file':str(p),'sha256':hashlib.sha256(data).hexdigest(),'bytes':len(data),'status':'downloaded'}
    except Exception as e:
        rec={'id':identifier,'url':url,'status':'failed','error':str(e)}
    (OUT/(identifier+'.fetch.json')).write_text(json.dumps(rec,indent=2)+'\n',encoding='utf-8')
    return rec

if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
        for r in ex.map(fetch,sys.argv[1:]):print(json.dumps(r),flush=True)
