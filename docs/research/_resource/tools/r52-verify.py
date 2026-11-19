"""Cheap read-only input/coverage/preservation checks for R52 research delivery."""
from pathlib import Path
import collections, csv, hashlib, json, subprocess

R=Path(__file__).resolve().parents[4]
E=R/'docs/research/_resource/evidence-r52'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def allowed(s):return s.startswith('docs/research/') or s=='notes/lane-1.11r3-research.md'
def split(raw,sep):
    depth=0;cur='';out=[]
    for c in raw:
        if c=='(':depth+=1
        elif c==')':depth=max(0,depth-1)
        if c==sep and depth==0:out.append(cur.strip());cur=''
        else:cur+=c
    out.append(cur.strip());return [x for x in out if x]

def main():
    baseline=json.loads((E/'baseline.json').read_text(encoding='utf-8'))
    changed=[s for s,h in baseline.items() if not allowed(s) and (not (R/s).exists() or sha(R/s)!=h)]
    new_protected=[str(p.relative_to(R)).replace('\\','/') for p in R.rglob('*') if p.is_file() and p.name!='.git' and '.git' not in p.parts and 'node_modules' not in p.parts and str(p.relative_to(R)).replace('\\','/') not in baseline and not allowed(str(p.relative_to(R)).replace('\\','/'))]
    assert not changed and not new_protected,(changed,new_protected)
    keys=sorted([x['key'] for x in json.loads((R/'packs/union-1861/PROVENANCE.json').read_text(encoding='utf-8'))['sources']],key=len,reverse=True)
    def cite(raw):
        for key in keys:
            if raw.startswith(key) and (len(raw)==len(key) or raw[len(key)] in ' \t\r\n,;('):return key,raw[len(key):].lstrip(' ,').strip() or None
        return raw,None
    got=collections.Counter()
    def add(cell,raw):
        for c in split(raw,'+'):
            s,a=cite(c);got[(cell,s,a)]+=1
    with (R/'packs/union-1861/source/world/people.csv').open(encoding='utf-8-sig',newline='') as f:
        for row in csv.DictReader(f):
            pid=row['id']
            for field in ['competence','nerve','experience','reputation','boldness','candour','regard']:
                raw=row[field]
                if ':' in raw:add(pid+'/'+field,raw.split(':',1)[1])
            for field,name in [('traits','trait'),('values','value')]:
                for item in row[field].split(';'):
                    if ':' in item:
                        key,raw=item.split(':',1);add(pid+'/'+name+':'+key.strip(),raw)
            for item in row['regard_others'].split(';'):
                parts=item.split(':',2)
                if len(parts)==3:add(pid+'/regard_others:'+parts[0].strip(),parts[2])
    expected=collections.Counter((x['cell'],c['source'],c['at']) for x in json.loads((E/'cells.json').read_text(encoding='utf-8')) for c in x['cites'])
    assert got==expected,{'source_only':list((got-expected).items())[:5],'world_only':list((expected-got).items())[:5]}
    commands={}
    for args in [['status','--short'],['log','-1','--format=%H %D'],['diff','--check'],['diff','--cached','--name-only']]:
        p=subprocess.run(['git',*args],cwd=R,capture_output=True,text=True,encoding='utf-8');commands[' '.join(args)]={'exit':p.returncode,'output':p.stdout+p.stderr}
        assert p.returncode==0
    assert commands['log -1 --format=%H %D']['output'].startswith('a2ea7c2493f11ed6e1ffc954427b6e3f121b033f')
    assert not commands['diff --cached --name-only']['output'].strip()
    results={'protected_baseline_files_unchanged':sum(not allowed(s) for s in baseline),'protected_changes':changed,'new_out_of_scope_files':new_protected,'source_world_citations_equal':sum(expected.values()),'git':commands}
    (E/'preservation.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
    inventory=[]
    for p in sorted((R/'docs/research/_resource').rglob('*')):
        if p.is_file() and ('evidence-r52' in p.parts or p.name.startswith('r52-') or p.name in ['dating.csv','dating-method.md','stone-1861.md','bulloch-1861.md']) and p.name not in ['final-inventory.json','verify.log']:
            inventory.append({'path':str(p.relative_to(R)).replace('\\','/'),'bytes':p.stat().st_size,'sha256':sha(p)})
    handover=R/'notes/lane-1.11r3-research.md'
    inventory.append({'path':'notes/lane-1.11r3-research.md','bytes':handover.stat().st_size,'sha256':sha(handover)})
    (E/'final-inventory.json').write_text(json.dumps(inventory,indent=2)+'\n',encoding='utf-8')
    print('PASS',sum(expected.values()),'source/world citations match;',results['protected_baseline_files_unchanged'],'protected files unchanged; HEAD unchanged; index empty; diff --check clean; inventory',len(inventory),'files')

if __name__=='__main__':main()
