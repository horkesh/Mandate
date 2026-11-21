"""Refresh only changed remote-object evidence; retain the earlier receipt."""
import datetime, hashlib, json, pathlib, re
from collect import OUT, ROOT, git, need, save

p=OUT/'inventory.json';d=json.loads(p.read_text(encoding='utf-8'))
refs=dict(line.split(' ',1) for line in need('for-each-ref','--format=%(refname:short) %(objectname)','refs/remotes/origin/main','refs/remotes/origin/sprint/').splitlines())
changed={k:(d['refs'].get(k),v) for k,v in refs.items() if d['refs'].get(k)!=v}
if changed:
    initial_main=d['main']
    stamp=d['utc'].replace(':','-')
    save('inventory-initial.json',d)
    prior=json.loads((OUT/'merge-tree.json').read_text(encoding='utf-8'))
    save('merge-tree-initial.json',prior)
    base=refs['origin/main']
    for ref,sha in refs.items():
        if ref=='origin/main':continue
        n=ref.removeprefix('origin/sprint/')
        rows=need('diff','--name-status',f'{base}...{sha}').splitlines()
        files=[s.split('\t')[-1] for s in rows]
        notes=[f for f in files if f.startswith('notes/') and f.endswith('.md')]
        d['branches'][n]={'ref':ref,'sha':sha,'mergeBase':need('merge-base',base,sha).strip(),'changes':rows,'commits':need('log','--reverse','--format=%H%x09%P%x09%s',f'{base}..{sha}').splitlines(),'handovers':notes,'stat':need('diff','--stat',f'{base}...{sha}'),'tests':[f for f in files if '.test.' in f]}
        if ref in changed:
            raw=OUT/'validation-raw'/'diffs';raw.mkdir(parents=True,exist_ok=True)
            (raw/f'{n}.diff').write_text(need('diff','--no-ext-diff','--no-color',f'{base}...{sha}'),encoding='utf-8')
        for f in notes:
            dest=OUT/'handovers'/n/f;dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_text(need('show',f'{sha}:{f}'),encoding='utf-8')
    entries=[('main',base)]+[(n,b['sha']) for n,b in d['branches'].items()]
    lookup={(x['leftSha'],x['rightSha']):x for x in prior};pairs=[];ran=0;reused=0
    for i,(left,lsha) in enumerate(entries):
        for right,rsha in entries[i+1:]:
            if (lsha,rsha) in lookup:
                pairs.append(lookup[(lsha,rsha)]);reused+=1;continue
            args=['merge-tree','--write-tree','--name-only',lsha,rsha]
            code,stdout,stderr=git(*args)
            if code not in (0,1):raise RuntimeError((args,code,stderr))
            ls=stdout.splitlines();conflicts=[]
            if code==1:
                for line in ls[1:]:
                    if not line:break
                    conflicts.append(line)
            pairs.append({'left':left,'right':right,'leftSha':lsha,'rightSha':rsha,'command':['git',*args],'exit':code,'tree':ls[0],'conflicts':conflicts,'stdout':stdout,'stderr':stderr});ran+=1
    save('merge-tree.json',pairs)
    d.update(refs=refs,main=base,utc=datetime.datetime.now(datetime.timezone.utc).isoformat())
    save('refresh-receipt.json',{'changed':changed,'rerunPairs':ran,'reusedPairs':reused,'mainChanges':need('diff','--name-only',initial_main,base).splitlines()})
raw=pathlib.Path('C:/Pyrrhic/ByOrderOfThePresident/CODEX.md').read_bytes();text=raw.decode('utf-8-sig')
start=text.index('### 2026-11-20 Claude → Codex: the sprint to 22 November')
(OUT/'CODEX-sprint-snapshot.md').write_text(text[start:].replace('\r\n','\n').rstrip()+'\n',encoding='utf-8',newline='\n')
d['codexSha256']=hashlib.sha256(raw).hexdigest();d['codexSprintStartLine']=text[:start].count('\n')+1
ls=text.splitlines();starts=[i for i,l in enumerate(ls) if l.startswith('### ')]+[len(ls)];blocks=[]
for a,z in zip(starts,starts[1:]):
    head=ls[a]
    if re.search(r'Codex\s*[→?]\s*Claude:',head):
        m=re.search(r': (S\d+|R\d+)\b',head)
        if m and (m.group(1).startswith('S') or int(m.group(1)[1:]) in [84,89,90,91,92,93,94,95,96,97,98]):blocks.append({'request':m.group(1),'originalLine':a+1,'lines':ls[a:z]})
save('status-source.json',blocks);save('inventory.json',d)
print(json.dumps({'changed':changed,'branches':len(d['branches']),'pairs':len(json.loads((OUT/'merge-tree.json').read_text()))},indent=2))
