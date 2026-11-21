"""S32 read-only Git inventory; writes only beneath this packet directory."""
import hashlib, json, pathlib, subprocess, datetime

ROOT = pathlib.Path(__file__).resolve().parents[4]
OUT = pathlib.Path(__file__).resolve().parent
def git(*args):
    r = subprocess.run(['git', *args], cwd=ROOT, capture_output=True)
    return r.returncode, r.stdout.decode('utf-8', 'replace'), r.stderr.decode('utf-8', 'replace')
def need(*args):
    code, out, err = git(*args)
    if code: raise RuntimeError((args, code, err))
    return out
def save(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
def main():
    if (OUT/'inventory.json').exists(): raise RuntimeError('refusing to replace the pinned inventory')
    refs = dict(line.split(' ',1) for line in need('for-each-ref','--format=%(refname:short) %(objectname)', 'refs/remotes/origin/main', 'refs/remotes/origin/sprint/').splitlines())
    base=refs['origin/main']
    baseline={p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest() for p in need('ls-files').splitlines() if (ROOT/p).is_file()}
    save('preservation-before.json',baseline)
    branches={}
    for ref, sha in refs.items():
        if ref=='origin/main': continue
        name=ref.removeprefix('origin/sprint/')
        paths=need('diff','--name-status',f'{base}...{sha}').splitlines()
        commits=need('log','--reverse','--format=%H%x09%P%x09%s',f'{base}..{sha}').splitlines()
        changed=[s.split('\t')[-1] for s in paths]
        notes=[p for p in changed if p.startswith('notes/') and p.endswith('.md')]
        extra=[p for p in need('ls-tree','-r','--name-only',sha).splitlines() if p.startswith('notes/') and ('sprint' in p.lower() or 'lane-s' in p.lower())]
        notes=sorted(set(notes+extra))
        branches[name]={'ref':ref,'sha':sha,'mergeBase':need('merge-base',base,sha).strip(),'changes':paths,'commits':commits,'handovers':notes,'stat':need('diff','--stat',f'{base}...{sha}'),'tests':[p for p in changed if '.test.' in p]}
        raw=OUT/'validation-raw'/'diffs';raw.mkdir(parents=True,exist_ok=True)
        (raw/f'{name}.diff').write_text(need('diff','--no-ext-diff','--no-color',f'{base}...{sha}'),encoding='utf-8')
        for p in notes:
            dest=OUT/'handovers'/name/p
            dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_text(need('show',f'{sha}:{p}'),encoding='utf-8')
    codex=pathlib.Path('C:/Pyrrhic/ByOrderOfThePresident/CODEX.md').read_bytes()
    text=codex.decode('utf-8-sig')
    start=text.index('### 2026-11-20 Claude → Codex: the sprint to 22 November')
    (OUT/'CODEX-sprint-snapshot.md').write_text(text[start:].replace('\r\n','\n').rstrip()+'\n',encoding='utf-8',newline='\n')
    save('inventory.json',{'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'head':need('rev-parse','HEAD').strip(),'main':base,'refs':refs,'branches':branches,'codexSha256':hashlib.sha256(codex).hexdigest(),'codexSprintStartLine':text[:start].count('\n')+1})
    print(json.dumps({k:{'sha':v['sha'][:8],'commits':len(v['commits']),'files':len(v['changes']),'handovers':v['handovers']} for k,v in branches.items()},indent=2))
    pairs=[]
    entries=[('main',base)]+[(n,b['sha']) for n,b in branches.items()]
    for i,(left,lsha) in enumerate(entries):
        for right,rsha in entries[i+1:]:
            args=['merge-tree','--write-tree','--name-only',lsha,rsha]
            code, stdout, stderr=git(*args)
            if code not in (0,1): raise RuntimeError((args,code,stderr))
            lines=stdout.splitlines()
            tree=lines[0] if lines else None
            conflicts=[]
            if code==1:
                for line in lines[1:]:
                    if not line: break
                    conflicts.append(line)
            receipt={'left':left,'right':right,'leftSha':lsha,'rightSha':rsha,'command':['git',*args],'exit':code,'tree':tree,'conflicts':conflicts,'stdout':stdout,'stderr':stderr}
            pairs.append(receipt)
    save('merge-tree.json',pairs)
    print(json.dumps({'pairs':len(pairs),'clean':sum(p['exit']==0 for p in pairs),'conflicted':sum(p['exit']==1 for p in pairs)}))
if __name__=='__main__': main()
