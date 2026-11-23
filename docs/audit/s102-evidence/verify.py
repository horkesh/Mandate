"""Cheap application and preservation checks. No simulation or network."""
from pathlib import Path
import csv, hashlib, json, subprocess

ROOT = Path.cwd()
D = ROOT/'docs/audit/s102-evidence'
def read(p): return json.loads(Path(p).read_text(encoding='utf-8'))
def old(p): return json.loads(subprocess.check_output(['git','show','54395ef9:'+p]))
def digest(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def rows(name):
    with (D/'inputs'/name).open(encoding='utf-8',newline='') as f: return list(csv.DictReader(f))

checks = 0
def check(value, label):
    global checks
    assert value, label
    checks += 1

world = read('packs/union-1861/data/world.json')
prior = old('packs/union-1861/data/world.json')
profiles = {p['id']: p for p in world['rules']['recruitment']['callProfiles']}
mapping = {r['terms_id']: r for r in rows('value-mapping.csv')}
register = rows('call-register.csv')
for r in register:
    p = profiles[r['call_id']]
    v = mapping[r['terms_id']]
    check(p['sourceProfile']==r['terms_id'], r['call_id'])
    check(p['honours']==(v['proposed_honours'].split(';') if v['proposed_honours'] else []), 'honours')
    check(p['offends']==(v['proposed_offends'].split(';') if v['proposed_offends'] else []), 'offends')
    for c in p['conditions']: check(c['clauseText']==r[c['kind']], 'instance clause')
    check(p['callProvenance']==[dict(source=s.rsplit(':',1)[0],page=int(s.rsplit(':',1)[1])) for s in r['source_refs'].split(';')], 'pages')
    check(all(d['quantity'] is None for d in p['materialDemand']), 'no material quantity invented')
    if r['side']=='confederate': check('union' not in p['honours'] and 'duty' not in p['honours'], 'no national loyalty inferred')
check(len(register)==98 and len(profiles)==100 and len(mapping)==20, 'exact scope')
check(profiles['cs_jul01_extra_georgia']['offends']==[] and profiles['cs_jul12_brigade_demand']['offends']==['state_autonomy'], 'no backdating')
del world['rules']['recruitment']['callProfiles']
for row in world['rules']['ruleSeats']['principals']:
    for c in row['calls']:
        check(c.pop('termsId')==c['id'], 'doctrine selector')
check(world==prior, 'all other World data exact')

manifest=read('packs/union-1861/pack.json'); before=old('packs/union-1861/pack.json')
del manifest['rules']['recruitment']['callProfiles']
for row in manifest['rules']['ruleSeats']['principals']:
    for c in row['calls']: c.pop('termsId')
check(manifest==before, 'all other pack settings exact')
situation=read('packs/union-1861/situations/call_for_troops.json')
for o in situation['options']:
    for c in o['calls']: check(c.pop('termsId')=='us_apr15_'+c['to'].removeprefix('st_gov_'), 'option selector')
check(situation==old('packs/union-1861/situations/call_for_troops.json'), 'all other situation content exact')
starting=read('runs/s102/starting-inventory.json')
changed=[]
for p,h in starting.items():
    check(Path(p).exists(), 'preserved path '+p)
    if digest(p)!=h: changed.append(p)
signed=read('tools/rules/signed-inventory.json')
for p in signed: check(digest(p)==starting[p], 'signed file exact '+p)
for p in ['packs/union-1861/PROVENANCE.json','packs/union-1861/checkpoints.json','packs/union-1861/pushback-union.json','packs/union-1861/pushback-confederate.json','.githooks/pre-commit','package-lock.json']:
    check(digest(p)==starting[p], 'protected input exact '+p)
for p in (D/'inputs').iterdir():
    check(digest(p)==digest(Path('C:/Pyrrhic/sprint-research-military/docs/research/S101')/p.name), 'read-only research snapshot '+p.name)
aliases={p.name:str(p.resolve()) for p in Path('node_modules/@mandate').iterdir()}
check(len(aliases)==4 and all(str(ROOT).lower() in p.lower() for p in aliases.values()), 'local workspace aliases')
result=dict(checks=checks,startingPaths=len(starting),allStartingPathsPreserved=True,changedOriginals=changed,signedFilesExact=len(signed),sourcePacketExact=True,aliases=aliases)
Path('runs/s102/application-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
