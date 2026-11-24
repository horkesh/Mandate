"""Aggregate retained V8 samples; inclusive shares overlap and are not additive."""
import json, sys
from pathlib import Path
profile_path=Path(sys.argv[1]); p=json.loads(profile_path.read_text(encoding='utf-8'))
nodes={n['id']:n for n in p['nodes']}; parents={c:n['id'] for n in p['nodes'] for c in n.get('children',[])}
self_cost={}; inclusive={}; total=0
def key(ident):
    f=nodes[ident]['callFrame']
    return (f['functionName'] or '(anonymous)',f['url'],f['lineNumber']+1,f.get('columnNumber',0))
for ident,delta in zip(p['samples'],p['timeDeltas']):
    total+=delta; k=key(ident); self_cost[k]=self_cost.get(k,0)+delta
    seen=set()
    while ident is not None:
        seen.add(key(ident))
        ident=parents.get(ident)
    for k in seen:inclusive[k]=inclusive.get(k,0)+delta
def rows(cost):
    result=[]
    for (function,file,line,column),value in sorted(cost.items(), key=lambda x:-x[1]):
        result.append(dict(function=function,file=file,line=line,column=column,ms=round(value/1000,2),share=round(value/total*100,3)))
    return result
out=dict(source=str(profile_path),sampleMs=total/1000,samples=len(p['samples']),self=rows(self_cost),inclusive=rows(inclusive))
target=profile_path.with_name('cpu-shares.json');target.write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print('Top self costs')
for r in out['self'][:18]:print(r['function'],r['share'],r['file'].split('/')[-1],r['line'])
print('Top inclusive kernel costs (overlap)')
for r in [r for r in out['inclusive'] if '/kernel/' in r['file']][:22]:print(r['function'],r['share'],r['file'].split('/')[-1],r['line'])
