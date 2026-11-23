import json,subprocess
from pathlib import Path
R=Path.cwd();D=R/'docs/audit/s105-evidence'
read=lambda p:json.loads(Path(p).read_text(encoding='utf-8'))
rows=read(D.parent/'s102-evidence/governor-answers.json')
before=read('runs/s100/references/union-1861-responses.json');after=read('runs/s105/references/union-1861-responses.json')
pack=json.loads(subprocess.check_output(['git','show','97c85037:packs/union-1861/pack.json']))
fallback=pack['rules']['recruitment']['callTerms'];calls=read('runs/s105/references/union-1861-calls.json')
def entries(row,responses,current):
    byorder={e['response']['respOrder']:e for e in row['before']+row['after']}
    out=[]
    for r in responses:
        if r['respPerson']!=row['actor'] or r['respRole']!='addressee' or r['respKind']!='call':continue
        source=byorder.get(r['respOrder'])
        if source is None:continue
        cid=source['callId']
        paper=calls.get(r['respOrder'])
        profile=next((p for p in json.loads((R/'packs/union-1861/pack.json').read_text(encoding='utf-8'))['rules']['recruitment']['callProfiles'] if p['id']==cid),None)
        assert profile is not None
        out.append(dict(callId=cid,response=r,callTerms=dict(boldness=fallback['boldness'],**profile) if current else fallback,capturedPaper=paper))
    return out
result=[dict(id=r['id'],actor=r['actor'],status=r['status'],historicalReply=r['historicalReply'],before=entries(r,before,False),after=entries(r,after,True),sourceLimit='Historical reply and page locators reused from accepted S101/S102 receipts; no new primary-source reread claimed.') for r in rows]
assert sum(len(r['after']) for r in result)>0
(D/'governor-answers.json').write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'dispositions':len(result),'beforeResponses':sum(len(r['before']) for r in result),'afterResponses':sum(len(r['after']) for r in result)}))
