"""S86 evidence-integrity audit, not a validator of historical interpretation.

Run from this checkout with: python docs/research/S86/verify.py
Original-file preservation is checked against this session's ignored baseline.
"""
from pathlib import Path
import json,csv,hashlib,re,subprocess
R=Path(__file__).resolve().parents[3]; O=Path(__file__).resolve().parent
checks=[]
def check(name,value):
 checks.append({'check':name,'pass':bool(value)})
 if not value:raise AssertionError(name)
def load(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def rows(f):return list(csv.DictReader((O/f).open(encoding='utf-8',newline='')))
sources=load(O/'source-reading.json')['sources'];keys={x['key'] for x in sources}
for s in load(O/'source-reading.json').get('upstream_artifacts',[]):check('upstream '+s['artifact'],sha(Path(s['artifact']))==s['sha256'])
check('unique source locators',len(keys)==len(sources))
for s in sources:
 check('source artifact '+s['key'],sha(Path(s['artifact']))==s['sha256'])
 check('printed locator '+s['key'],s['printed_page'].isdigit() and '/page/n' in s['url'])
 if Path(s['artifact']).suffix=='.txt':
  t=Path(s['artifact']).read_text(encoding='utf-8')[:260]
  check('running-head number '+s['key'],bool(re.search(r'\b'+s['printed_page']+r'\b',t)))
for x in load(O/'model-inputs.json')['inputs']:check('model input '+x['path'],sha(Path(x['path']))==x['sha256'])
tables={'virginia-units.csv':49,'virginia-area-crosswalk.csv':14,'louisiana-acceptances.csv':24,'later-pairs.csv':10}
for f,n in tables.items():
 rr=rows(f);check('row count '+f,len(rr)==n)
 identity='case' if f=='later-pairs.csv' else 'observation_id'
 check('unique observations '+f,len({r[identity] for r in rr})==n)
 for r in rr:
  check('citation '+r[identity],bool(r.get('citation') or r.get('citations')))
  check('source-key closure '+r[identity],all(k in keys for k in r['source_keys'].split(';')))
  check('explicit limitation '+r[identity],bool(r['limitation']))
v=rows('virginia-units.csv');go=[r for r in v if r['observation_id'].startswith('VA-GO24')]
check('18 formed;18 prospective',sum(r['observation_kind']=='formed in field/garrison' for r in go)==18 and sum(r['observation_kind'].startswith('prospective') for r in go)==18)
check('no assigned GO headcounts',all(r['headcount_text']=='unknown' for r in go))
check('Garland observation retained once',sum(r['headcount_text']=='490' for r in v)==1)
check('company observations cannot authorize application',all('no additive' in r['disposition'] for r in v if r['observation_id'].startswith('VA-MAY14')))
l={r['observation_id']:r for r in rows('louisiana-acceptances.csv')}
for key,day in [('LA-VOL-06','1861-06-04'),('LA-VOL-07','1861-06-05'),('LA-VOL-08','1861-06-15'),('LA-VOL-09','1861-07-06'),('LA-VOL-10','1861-07-22'),('LA-VOL-11','1861-08-18'),('LA-WHEAT','1861-06-06')]:check('dated LA observation '+key,l[key]['event_date']==day)
check('Kelly acceptance separate from muster',l['LA-KELLY-ACCEPT']['event_date']=='1861-06-12' and l['LA-VOL-08']['event_date']=='1861-06-15')
check('LA November total not backdated',l['LA-NOV-TOTAL']['report_date']=='1861-11-22' and l['LA-NOV-TOTAL']['headcount_text']=='23577')
p={r['case']:r for r in rows('later-pairs.csv')}
check('all requested later states',{'South Carolina','Texas','Arkansas','Tennessee','Georgia'}<={r['state'] for r in p.values()})
check('AR unknown explicit','HOLD' in p['AR-PAIR']['status'] and p['AR-PAIR']['named_units']=='unknown')
check('Tennessee dated pair and overlap',p['TN-LATER-PAIR']['call_date']=='1861-07-22' and 'Eighth' in p['TN-LATER-PAIR']['later_number_join'] and 'Sixteenth' in p['TN-LATER-PAIR']['later_number_join'] and 'overlap' in p['TN-LATER-PAIR']['candidate_existing_identity_or_lot'])
check('Georgia distinct new pair and brigade',p['GA-EXTRA-TWO']['call_date']=='1861-07-01' and 'August2' in p['GA-BRIGADE']['limitation'])
check('no pair supplies a fitted strength',all(r['headcount_application']=='none' for r in p.values()))
baseline=R/'runs/s86/baseline.json'
if baseline.exists():
 original=load(baseline)['files']
 for f,h in original.items():check('original preserved '+f,(R/f).is_file() and sha(R/f)==h)
for a in (R/'node_modules/@mandate').iterdir():check('own-worktree dependency '+a.name,a.resolve().is_relative_to(R))
check('correct branch',subprocess.check_output(['git','branch','--show-current'],cwd=R,text=True).strip()=='sprint/research-military')
for f in O.iterdir():
 if f.suffix in ['.csv','.json','.py']:check('UTF8 no BOM '+f.name,not f.read_bytes().startswith(b'\xef\xbb\xbf'))
result={'pass':True,'checks':len(checks),'baseline_paths':len(original) if baseline.exists() else None,'table_rows':tables,'source_locators':len(sources),'new_headcounts_applied':0,'historical_interpretation':'for lead review; no independent review/signature claimed'}
(R/'runs/s86/source-audit.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
