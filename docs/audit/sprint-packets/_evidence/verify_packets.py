"""Focused S32 evidence audit; no production writes or branch checkouts."""
import csv, hashlib, io, json, pathlib, re, subprocess, sys
from urllib.parse import unquote, urlparse
E=pathlib.Path(__file__).resolve().parent;P=E.parent;ROOT=E.parents[3]
d=json.loads((E/'inventory.json').read_text(encoding='utf-8'))
checks=[]
def check(name,value,detail=None):
    checks.append({'check':name,'pass':bool(value),'detail':detail})
def git(*args):
    r=subprocess.run(['git',*args],cwd=ROOT,capture_output=True)
    if r.returncode:raise RuntimeError((args,r.returncode,r.stderr.decode('utf-8','replace')))
    return r.stdout.decode('utf-8')

branches=d['branches'];names=set(branches)
check('fourteen pinned sprint branches',len(names)==14)
check('one packet per branch plus README',{f.stem for f in P.glob('*.md')}==names|{'README'})
check('own branch retained',git('branch','--show-current').strip()=='sprint/audit')
check('baseline start pinned',d['head']=='9ab0f5e7473d36685b2556c518214d6eaf8bcc95')
check('hook configured',git('config','core.hooksPath').strip()=='.githooks')

pairs=json.loads((E/'merge-tree.json').read_text(encoding='utf-8'))
expected={frozenset((a,b)) for a in names|{'main'} for b in names|{'main'} if a!=b}
actual={frozenset((x['left'],x['right'])) for x in pairs}
check('all 105 unique unordered merge pairs',len(pairs)==105 and actual==expected)
for x in pairs:
    check('merge receipt '+x['left']+'/'+x['right'],x['exit'] in (0,1) and (x['exit']==0)==(not x['conflicts']) and x['command'][1:4]==['merge-tree','--write-tree','--name-only'])
    check('merge tree object '+x['left']+'/'+x['right'],git('cat-file','-t',x['tree']).strip()=='tree')
    for side in ['left','right']:
        expected_sha=d['main'] if x[side]=='main' else branches[x[side]]['sha']
        check('merge pin '+side+' '+x['left']+'/'+x['right'],x[side+'Sha']==expected_sha)

rulings=json.loads((E/'rulings.json').read_text(encoding='utf-8'))
gates=json.loads((E/'gates.json').read_text(encoding='utf-8'))
refs=json.loads((E/'references.json').read_text(encoding='utf-8'))
queries=sorted({(x['sha'],x['path']) for x in refs})
raw=subprocess.run(['git','cat-file','--batch'],cwd=ROOT,input=''.join(f'{s}:{p}\n' for s,p in queries).encode('utf-8'),capture_output=True,check=True).stdout
blobs={};offset=0
for key in queries:
    end=raw.index(b'\n',offset);head=raw[offset:end].decode();fields=head.split();offset=end+1
    if fields[-1]=='missing':raise ValueError(key)
    size=int(fields[-1]);blobs[key]=raw[offset:offset+size].decode('utf-8');offset+=size+1
check('batch object read consumed',offset==len(raw))
for i,x in enumerate(refs):
    ls=blobs[(x['sha'],x['path'])].splitlines();line=x['line']
    ok=0<line<=len(ls)
    if x.get('needle'):ok=ok and x['needle'] in ls[line-1]
    check('source reference '+str(i),ok,x if not ok else None)

for n,b in branches.items():
    packet=(P/f'{n}.md').read_text(encoding='utf-8')
    receipt=b['diffReceipt'];rawdiff=P/receipt['path']
    check(n+' raw diff size/hash',rawdiff.is_file() and rawdiff.stat().st_size==receipt['bytes'] and hashlib.sha256(rawdiff.read_bytes()).hexdigest()==receipt['sha256'])
    check(n+' reused triple-dot equivalence',receipt['equivalentFinalComparison']['sameMergeBase'])
    for heading in ['## What changes','### Commits','### Files and areas','## Proposed rulings','## Four review lenses','## Gate items','## Conflicts','## Retained validation','## Findings outside my scope']:
        check(n+' heading '+heading,heading in packet)
    for lens in ['Canon and decisions','Determinism','History','Realism']:check(n+' lens '+lens,f'| {lens} |' in packet)
    for row in b['commits']:check(n+' commit '+row[:12],row.split('\t')[0] in packet)
    for row in b['changes']:
        f=row.split('\t')[-1];check(n+' changed path '+f,f in packet)
    for peer in (names|{'main'})-{n}:
        label='origin/main' if peer=='main' else 'sprint/'+peer
        check(n+' merge peer '+peer,f'| {label} |' in packet)
    start=packet.index('## Proposed rulings');end=packet.index('### Status and hand-over coverage')
    numbers=re.findall(r'^(\d+)\. ',packet[start:end],re.M)
    check(n+' numbered choice sequence',[int(i) for i in numbers]==list(range(1,len(rulings[n])+1)))
    for i,r in enumerate(rulings[n],1):
        check(n+' ruling source '+str(i),str(r['line']) in packet and (r['path'] in packet or r['path'].startswith('_external/')))
    for path,item,topic,state in gates[n]:check(n+' gate item '+item,item.replace('|','&#124;') in packet and (path in packet or path.startswith('_external/')))
    for target in re.findall(r'\]\(([^)]+)\)',packet):
        if target.startswith(('http:','https:','mailto:')):continue
        if target.startswith('#'):
            # Only generated D01-A01 shared-alternative anchors appear locally.
            check(n+' local anchor '+target,target[1:].removesuffix('-alternatives').upper() in packet);continue
        pathpart=unquote(target.split('#',1)[0].strip('<>'))
        if not pathpart:continue
        check(n+' local link '+target,(P/pathpart).exists())

# Exhaustive structured candidate check, independent of the generated gate JSON.
for n,count in [('research-gate',33),('situations-1862',115),('1a',7),('desk',7),('perf',7),('playtest',7)]:
    b=branches[n];candidate_paths=[]
    for row in b['changes']:
        if row.startswith('D\t'):continue
        path=row.split('\t')[-1]
        if not path.endswith('.json'):continue
        if n=='research-gate':candidate=path.endswith('.draft.json') and '/gate/drafts/' in path
        elif n=='situations-1862':candidate='/situations/drafts/' in path and path.split('/')[-1].startswith(('s13_','s28_'))
        else:candidate='/situations/' in path and '/drafts/' not in path
        if candidate:candidate_paths.append(path)
    listed={x[0] for x in gates[n]}
    check(n+' exhaustive candidate count',len(candidate_paths)==count,{'actual':len(candidate_paths),'expected':count})
    check(n+' all candidates in gate table',set(candidate_paths)<=listed)

external=json.loads((E/'external-decisions.json').read_text(encoding='utf-8'))
check('fourteen external decisions',len(external)==14)
for x in external:
    check('external draft hash '+x['file'],hashlib.sha256((E/'external-decisions'/x['file']).read_bytes()).hexdigest()==x['sha256'])
    check('external original unchanged '+x['file'],hashlib.sha256(pathlib.Path(x['path']).read_bytes()).hexdigest()==x['sha256'])

baseline=json.loads((E/'preservation-before.json').read_text(encoding='utf-8'))
for path,sha in baseline.items():check('preserve '+path,(ROOT/path).is_file() and hashlib.sha256((ROOT/path).read_bytes()).hexdigest()==sha)
status=git('status','--porcelain=v1','--untracked-files=all')
for line in status.splitlines():
    f=line[3:].strip('"').replace('\\','/')
    check('write scope '+f,f.startswith('docs/audit/sprint-packets/'))

source_status=json.loads((E/'status-source.json').read_text(encoding='utf-8'))
covered=json.loads((E/'status-coverage.json').read_text(encoding='utf-8'))
for item in covered:check('status exists '+item['branch']+'/'+item['request'],any(x['originalLine']==item['originalLine'] and x['request']==item['request'] for x in source_status))
check('S29 resumed status included',sum(x['request']=='S29' for x in covered)==2)
check('S33 not performed',not any(x['request']=='S33' for x in covered))

result={'passed':sum(x['pass'] for x in checks),'failed':sum(not x['pass'] for x in checks),'branches':len(names),'pairs':len(pairs),'sourceReferences':len(refs),'uniqueSourceBlobs':len(queries),'protectedOriginalFiles':len(baseline),'rulingEntries':{n:len(v) for n,v in rulings.items()},'gateRows':{n:len(v) for n,v in gates.items()},'checks':checks}
if '--no-write' not in sys.argv:
    (E/'packet-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:v for k,v in result.items() if k not in ['checks','rulingEntries','gateRows']},indent=2))
for x in checks:
    if not x['pass']:print(json.dumps(x,ensure_ascii=False))
raise SystemExit(1 if result['failed'] else 0)
