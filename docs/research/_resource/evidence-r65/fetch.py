from pathlib import Path
import urllib.request, urllib.parse, json, hashlib, concurrent.futures, sys
BASE=Path(r'C:/Pyrrhic/mandate-research-sources/r65-sources')
LOG=Path('docs/research/_resource/evidence-r65/fetch-log.jsonl')
def fetch(url,name):
 out=BASE/name
 if out.exists(): return {'url':url,'path':str(out),'reused':True,'bytes':out.stat().st_size}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'R65 historical research'})
  with urllib.request.urlopen(req,timeout=45) as r:
   data=r.read()
   out.write_bytes(data)
   result={'url':url,'path':str(out),'status':r.status,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
 except Exception as ex: result={'url':url,'path':str(out),'error':str(ex)}
 with LOG.open('a',encoding='utf-8') as f:f.write(json.dumps(result)+'\n')
 return result
if __name__=='__main__':
 jobs=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8-sig'))
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
  for r in pool.map(lambda j:fetch(*j),jobs):print(json.dumps(r))
