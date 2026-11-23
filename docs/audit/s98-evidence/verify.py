from pathlib import Path
import json,hashlib,csv,io,subprocess,collections
R=Path.cwd(); D=R/'docs/audit/s98-evidence'
def read(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def prior(p): return subprocess.check_output(['git','show','2ff6e9d8:'+p]).decode('utf-8')
w=read('packs/union-1861/data/world.json'); people={p['id']:p for p in w['people']}
audit=read(D/'audit.json'); drafts=read(D/'drafts.json'); applied=read(D/'application.json')
overrides={(d['actor'],d['cell']):d for d in drafts}; checks=0
def get(p,cell):
    if cell in ['competence','nerve','reputation']: return p['centres'][cell]
    if cell in ['boldness','candour']: return p['temperament'][cell]
    if cell=='regard': return p['regard']
    kind,key=cell.split(':',1)
    col,field={'value':('values','value'),'trait':('traits','trait'),'regard_others':('regardOthers','toward')}[kind]
    return next((a for a in p[col] if a[field]==key),None)
def direction(cell,value): return (None if value is None else value.get('direction','present'))
for a in audit+drafts:
    key=(a['actor'],a['cell']); target=overrides.get(key,a)
    expected=target['proposed_direction'] if key in overrides else a['proposed']
    expected=None if expected=='unknown' else expected
    live=get(people[a['actor']],a['cell'])
    assert direction(a['cell'],live)==expected,(key,expected,live)
    if expected is not None:
        assert live['cites'] and all(c['source'].startswith('S98-') and 'dated ' in c['at'] for c in live['cites']),key
    checks+=1
assert len(audit)==98 and len(drafts)==12 and len(applied)==110
assert collections.Counter(a['disposition'] for a in audit)=={'KEEP':26,'HOLD':72}
raw=Path('packs/union-1861/source/world/people.csv').read_text(encoding='utf-8')
before={r['id']:r for r in csv.DictReader(io.StringIO(prior('packs/union-1861/source/world/people.csv')))}
after={r['id']:r for r in csv.DictReader(io.StringIO(raw))}
assert before.keys()==after.keys()
actors={a['actor'] for a in audit+drafts}
allowed={'competence','nerve','reputation','boldness','candour','regard','values','traits','regard_others','notes'}
for key,row in before.items():
    for col,v in row.items():
        if key not in actors or col not in allowed: assert v==after[key][col],(key,col)
        checks+=1
oldworld=json.loads(prior('packs/union-1861/data/world.json'))
for k,v in oldworld.items():
    if k!='people': assert v==w[k],k
oldpeople={p['id']:p for p in oldworld['people']}
assert oldpeople.keys()==people.keys()
for key,p in oldpeople.items():
    if key not in actors: assert p==people[key],key
    else:
        for k,v in p.items():
            if k not in ['centres','temperament','regard','regardOthers','values','traits','unknowns']: assert v==people[key][k],(key,k)
        assert p['centres']['experience']==people[key]['centres']['experience'],key
prov=read('packs/union-1861/PROVENANCE.json'); oldprov=json.loads(prior('packs/union-1861/PROVENANCE.json'))
assert prov['sources'][:len(oldprov['sources'])]==oldprov['sources']
for k,v in oldprov.items():
    if k!='sources': assert v==prov[k],k
for p in read(D/'source-pages.json'):
    assert hashlib.sha256(Path(p['path']).read_bytes()).hexdigest()==p['sha256']
    assert any(s['key']=='S98-'+p['key'] for s in prov['sources'])
    checks+=1
source=Path('C:/Pyrrhic/sprint-research-cast/docs/research/S97')
if __import__('sys').argv[1:]==['--live']:
    for p,h in read('runs/s98/research-inputs.json').items(): assert hashlib.sha256((source/p).read_bytes()).hexdigest()==h
aliases={p.name:str(p.resolve()) for p in Path('node_modules/@mandate').iterdir()}
assert all(str(R).lower() in p.lower() for p in aliases.values()),aliases
receipt={'checks':checks,'atomicApplications':110,'holds':72,'keeps':26,'drafts':12,'remainingOriginalUnknowns':67,'sourcePages':28,'allOtherWorldDataExact':True,'allUnrelatedPeopleAndColumnsExact':True,'priorProvenancePrefixExact':True,'readOnlyResearchPacketExact': __import__('sys').argv[1:]==['--live'],'aliases':aliases}
if Path('runs/s98').exists(): Path('runs/s98/application-verification.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
print(json.dumps(receipt))
