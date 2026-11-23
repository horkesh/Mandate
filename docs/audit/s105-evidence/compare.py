"""Compare the one S105 capture with retained pre-merge July evidence; no simulation."""
from pathlib import Path
import collections,hashlib,json,subprocess
B=Path('runs/s100/references');A=Path('runs/s105/references');D=Path('docs/audit/s105-evidence');D.mkdir(exist_ok=True)
def read(p):return json.loads(Path(p).read_text(encoding='utf-8'))
def put(name,v):(D/(name+'.json')).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def cause(m):
    group=m.split('.')[0]
    return {'orders':'Each call now carries issuer-authored per-paper values, conditions and provenance. Governors and relays read those values; the willingness formula, cast and draws remain unchanged.',
    'recruitment':'Changed actual call responses change accepted quotas and mustering under unchanged recruitment rules; structural conditions and material demand remain unscored.',
    'messages':'Calls carry immutable terms and provenance; changed responses and ordinary field consequences change correspondence volume. Routing rules are unchanged.',
    'plans':'Changed levies and received field evidence affect existing planning and proposals. S100 grammar and the 0116 own-received-threat trigger are retained.',
    'planner':'Changed raised forces and received evidence affect existing candidates and scoring contributions. No planner weight is changed.',
    'operations':'Changed mustering and plans affect ordinary assembly, movement and completion. No forced arrival or new historical order is introduced.',
    'people':'Changed actual call answers and field consequences affect grievances, service and disposition. Initial cast and random draws are preserved.',
    'reports':'Changed call answers and field activity affect ordinary reports and their receipt; no enemy truth or fabricated report is introduced.',
    'combat':'Changed actual levies and movement affect battle participants and losses under unchanged combat rules.',
    'forces':'Changed levy volumes and physical paths affect stores, attrition and losses; original strengths and force rules are unchanged.'}.get(group,'Downstream of per-paper call responses, changed actual levies and their ordinary field/received-paper consequences; this mechanism is unchanged.')+' [I] Combined causal path, not an isolated additive attribution; exact days, responses and events are retained.'
summary={};inputs={}
def differences(b,a,path=''):
    if type(b)!=type(a):return [dict(path=path,before=b,after=a)]
    if isinstance(b,dict):
        return [r for k in sorted(b.keys()|a.keys()) for r in differences(b.get(k),a.get(k),path+'/'+k)]
    if isinstance(b,list):
        if len(b)!=len(a):return [dict(path=path,before=b,after=a)]
        return [r for i,(x,y) in enumerate(zip(b,a,strict=True)) for r in differences(x,y,path+'/'+str(i))]
    return [] if b==a else [dict(path=path,before=b,after=a)]
for pack in ['testbed','union-1861']:
    b=read(B/f'{pack}-summary.json');a=read(A/f'{pack}-summary.json')
    inputs[str(B/f'{pack}-summary.json')]=hashlib.sha256((B/f'{pack}-summary.json').read_bytes()).hexdigest()
    hh=[dict(day=y['turn'],before=x['hash'],after=y['hash'],changed=x['hash']!=y['hash'],cause=(cause('orders') if x['hash']!=y['hash'] else 'unchanged')) for x,y in zip(b['turns'],a['turns'],strict=True)]
    old={r['mechanic']:r for r in b['liveness']};new={r['mechanic']:r for r in a['liveness']};cc=[]
    for m in sorted(old.keys()|new.keys()):
        dd=[dict(day=y['day'],before=x['fires'].get(m,0),after=y['fires'].get(m,0)) for x,y in zip(b['daily'],a['daily'],strict=True) if x['fires'].get(m,0)!=y['fires'].get(m,0)]
        cc.append(dict(mechanic=m,before=old.get(m),after=new.get(m),changed=old.get(m)!=new.get(m),changedDays=dd,cause=cause(m) if old.get(m)!=new.get(m) or dd else 'unchanged'))
    cp=[dict(day=y['day'],before=x['scores'],after=y['scores'],changed=x['scores']!=y['scores'],cause=cause('recruitment') if x['scores']!=y['scores'] else 'unchanged') for x,y in zip(b['checkpoints'],a['checkpoints'],strict=True)]
    put(pack+'-hashes',hh);put(pack+'-counters',cc);put(pack+'-checkpoints',cp)
    put(pack+'-summary-differences',dict(cause=cause('orders'),fields=differences(b,a)))
    summary[pack]=dict(hashes=len(hh),changedHashes=sum(r['changed'] for r in hh),firstChangedDay=next((r['day'] for r in hh if r['changed']),None),changedCounters=sum(r['changed'] for r in cc),rowsWithDailyChanges=sum(bool(r['changedDays']) for r in cc),changedCheckpointScores=sum(r['changed'] for r in cp),initialHashBefore=b['initialHash'],initialHashAfter=a['initialHash'],finalHashBefore=b['finalHash'],finalHashAfter=a['finalHash'],replay=a['replay'],resume=a['resume'],rejections=a['rejections'])
bc=read(B/'coverage.json');ac=read(A/'coverage.json');bi={r['id']:r for r in bc['rows']}
put('coverage',ac);put('coverage-changes',[dict(id=r['id'],before=bi[r['id']],after=r,changed=bi[r['id']]!=r) for r in ac['rows']])
put('raw-pushback-diagnostics',dict(before=bc['diagnostics'],after=ac['diagnostics'],countsBefore=bc['counts'],countsAfter=ac['counts'],mechanicsBefore=bc['mechanics'],mechanicsAfter=ac['mechanics']))
def idx(rows):return {(r['respOrder'],r['respPerson'],r['respRole'],r['respDay']):r for r in rows}
br=idx(read(B/'union-1861-responses.json'));ar=idx(read(A/'union-1861-responses.json'))
rc=[dict(identity=k,before=br.get(k),after=ar.get(k),cause=cause('orders')) for k in sorted(br.keys()|ar.keys()) if br.get(k)!=ar.get(k)]
put('response-changes',rc);put('call-packets',read(A/'union-1861-calls.json'))
bs=read(B/'union-1861-final-state.json');ast=read(A/'union-1861-final-state.json')
def strength(s):
    blocks=[b for b in s['forceBlockStates'].values() if s['departmentFactions'].get(b['fbDepartment'])=='confederate']
    return dict(known=sum(sum(l['lotMen'] for l in b['fbLots']) for b in blocks if all(l['lotMen'] is not None for l in b['fbLots'])),unknownBlocks=sum(any(l['lotMen'] is None for l in b['fbLots']) for b in blocks))
def origins(s):
    out=collections.Counter()
    for b in s['forceBlockStates'].values():
        if s['departmentFactions'].get(b['fbDepartment'])!='confederate' or any(l['lotMen'] is None for l in b['fbLots']):continue
        for lot in b['fbLots']:
            service=lot.get('lotService') or {};out[service.get('enlCallId') or service.get('enlSourceAct') or service.get('enlCall') or 'initial.forces']+=lot['lotMen']
    return out
bo,ao=origins(bs),origins(ast);sr=[dict(origin=k,before=bo[k],after=ao[k],delta=ao[k]-bo[k],cause=cause('recruitment')) for k in sorted(bo.keys()|ao.keys())]
assert sum(r['before'] for r in sr)==strength(bs)['known'];assert sum(r['after'] for r in sr)==strength(ast)['known']
put('strength-reconciliation',sr);put('battles',dict(before=bs['battleRecords'],after=ast['battleRecords']));put('scores',read(A/'scores.json'))
summary.update(coverageBefore=dict(collections.Counter(r['verdict'] for r in bc['rows'])),coverageAfter=dict(collections.Counter(r['verdict'] for r in ac['rows'])),rawActsBefore=len(bc['diagnostics']),rawActsAfter=len(ac['diagnostics']),changedResponses=len(rc),strengthBefore=strength(bs),strengthAfter=strength(ast),failedBands=sum(len(r['gates']) for r in read(A/'result.json')['result']))
put('comparison',summary)
inputs['basis']='S100 final capture repeats all 268 hashes/non-clock summary fields in its single final done check. S103 changes only done-check reporting, workflow, tests and decision links; no simulation/pack input changes. Baseline is reused, never rerun.'
put('baseline-reuse',inputs)
print(json.dumps(summary))
