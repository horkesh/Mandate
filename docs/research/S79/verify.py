"""S79 research invariants. No simulation, pack generation, or cross-worktree write."""
from pathlib import Path
import csv, hashlib, json, sys

ROOT=Path(__file__).resolve().parents[3]
P=ROOT/'docs/research/S79'
E=ROOT/'runs/s79'
checks=[]
def check(label, ok):
    checks.append(dict(check=label,passed=bool(ok)))
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rows(name):
    with (P/name).open(encoding='utf-8',newline='') as f:
        reader=csv.DictReader(f); result=list(reader)
        check(name+' rectangular',all(None not in r and all(v is not None for v in r.values()) for r in result))
        return result

receipt=json.loads((P/'source-reading.json').read_text(encoding='utf-8'))
source_ledger=Path(receipt['ledger']['path'])
check('frozen S77 ledger agrees with receipt',sha(E/'s77-ledger.csv')==receipt['ledger']['sha256'])
check('live S77 ledger unchanged',sha(source_ledger)==receipt['ledger']['sha256'])
ledger=list(csv.DictReader((E/'s77-ledger.csv').open(encoding='utf-8')))
unknown={r['block'] for r in ledger if int(r['unknown_lots'])>0}
dispositions=rows('strength-dispositions.csv')
observations=rows('strength-observations.csv')
check('all 25 unknown block identities exactly once',len(dispositions)==len(unknown)==25 and {r['block'] for r in dispositions}==unknown)
check('1523 unknown day rows covered',sum(int(r['unknown_day_rows']) for r in dispositions)==1523)
obs_ids={r['id'] for r in observations}
check('10 unique observation IDs',len(obs_ids)==len(observations)==10)
for r in observations:
    check(r['id']+' date in May-July1861','1861-05-01'<=r['observation_date']<='1861-07-31')
    check(r['id']+' complete scope/measure/citation/limitation',all(r[x] for x in ['measure','source_scope','citation','limitation','match_status']))
    check(r['id']+' no phantom block',not r['block'] or r['block'] in unknown)
for r in dispositions:
    linked=set(filter(None,r['observation_ids'].split(';')))
    check(r['block']+' valid observation references',linked<=obs_ids)
    check(r['block']+' retrieval preserved',bool(r['retrieval_needed']))
    rr=[x for x in ledger if x['block']==r['block'] and int(x['unknown_lots'])]
    check(r['block']+' exact row count and day bounds',len(rr)==int(r['unknown_day_rows']) and min(int(x['day']) for x in rr)==int(r['first_unknown_day']) and max(int(x['day']) for x in rr)==int(r['last_unknown_day']))
check('only one named-force observation',sum(r['match_status']=='named_force_observation' for r in observations)==1)
check('Garland490 is dated rather than July backfill',next(r for r in observations if r['id']=='G490')['observation_date']=='1861-05-12')

commands=rows('charleston-command.csv')
check('six command observations',len(commands)==6 and len({r['id'] for r in commands})==6)
check('July coverage explicitly inferred',next(r for r in commands if r['id']=='C5')['event'].startswith('[I]'))
rails=rows('rail-register.csv')
pack_lines={r['id']:r for r in csv.DictReader((ROOT/'packs/union-1861/source/world/rail_lines.csv').open(encoding='utf-8'))}
for r in rails:check(r['line']+' exact rail_lines record',r['line'] in pack_lines and all(r['pack_'+k]==pack_lines[r['line']][k] for k in ['name','sources','notes']))
check('eight required railroad records', {r['line'] for r in rails}=={'east_tennessee_and_virginia','virginia_and_tennessee','north_carolina','wilmington_and_weldon','petersburg','richmond_and_petersburg','orange_and_alexandria','manassas_gap'})
check('all directory gauge dates qualified',all('1862' in r['date_qualification'] and '[I]' in r['date_qualification'] for r in rails))
audit=rows('rail-edge-audit.csv')
edges=list(csv.DictReader((ROOT/'packs/union-1861/source/world/edges.csv').open(encoding='utf-8')))
check('21 audited source edges',len(audit)==21)
for r in audit:
    original=edges[int(r['source_line_number'])-2]
    check('edge '+r['source_line_number']+' exact source fields',all(r[k]==v for k,v in original.items()))
check('shared Gordonsville-Charlottesville rail accounted',any(r['from']=='charlottesville' and r['to']=='culpeper_orange' and r['line']=='virginia_central' for r in audit))
topology=json.loads((P/'topology-check.json').read_text(encoding='utf-8'))
check('five topology examples explicitly limited',len(topology['paths'])==5 and 'Not transit time' in topology['scope'])
for start,path in topology['paths'].items():
    at=start;total=0
    for leg in path['legs']:
        check(start+' path continuity',at==leg['from_region'])
        found=[r for r in edges if r['type']=='rail' and r['line']==leg['line'] and {r['from'],r['to']}=={leg['from_region'],leg['to_region']}]
        check(start+' existing source rail edge',bool(found))
        if found:total+=int(found[0]['length_days'])
        at=leg['to_region']
    check(start+' reaches Manassas at source sum',at=='manassas' and total==path['sum_source_length_days'])

artifacts={}
for source in receipt['sources']:
    artifacts[source['artifact']]=source['sha256']
    for loc in source.get('locators',[]):artifacts[loc['artifact']]=loc['sha256']
for item in receipt['images_inspected']:artifacts[item['artifact']]=item['sha256']
for path,digest in artifacts.items():check('artifact '+path,Path(path).is_file() and sha(Path(path))==digest)
if (E/'baseline.json').exists():
    base=json.loads((E/'baseline.json').read_text(encoding='utf-8'))
    for path,digest in base.items():check('baseline preserved '+path,(ROOT/path).is_file() and sha(ROOT/path)==digest)
else:check('local baseline receipt available',False)
result=dict(checks=len(checks),passed=sum(r['passed'] for r in checks),failed=[r['check'] for r in checks if not r['passed']],external_artifacts=len(artifacts),scope='Research integrity and preservation only; not independent historical review or July clearance.')
if '--write' in sys.argv:(P/'validation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
(E/'research-audit.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2))
raise SystemExit(0 if not result['failed'] else 1)
