"""Validate research delivery structure and inventory it. No pack writes."""
from pathlib import Path
from collections import Counter
import csv, hashlib, json, re

ROOT = Path(__file__).resolve().parents[4]
RESOURCE = ROOT/'docs/research/_resource'
EVIDENCE = RESOURCE/'evidence-r45'
totals=Counter()
by_field={}
for n in range(10,15):
    rows=list(csv.DictReader((RESOURCE/f'rs{n}.csv').open(encoding='utf-8',newline='')))
    c=Counter(r['decision'] for r in rows)
    note=(RESOURCE/f'rs{n}.md').read_text(encoding='utf-8')
    assert f"KEEP {c['KEEP']}, CHANGE {c['CHANGE']}, HOLD {c['HOLD']}" in note
    totals.update(c)
    for r in rows: by_field.setdefault(r['cell'].split(':')[0],Counter()).update([r['decision']])
assert dict(totals)=={'KEEP':13,'HOLD':116,'CHANGE':1}
dates=list(csv.DictReader((RESOURCE/'dating.csv').open(encoding='utf-8',newline='')))
assert len(dates)==12 and len({r['cell'] for r in dates})==9
assert all(re.fullmatch(r'\d{4}-\d{2}-\d{2}',r['date']) for r in dates)
assert all(r['source of the date'] for r in dates)
a1=(RESOURCE/'A1-registers.md').read_text(encoding='utf-8')
assert len([l for l in a1.splitlines() if l.startswith('| ') and not l.startswith('| Man ')])==23
ten=(RESOURCE/'ten-confederates.md').read_text(encoding='utf-8')
assert len([l for l in ten.splitlines() if l.startswith('| ') and not l.startswith('| Man ')])==10
handover=(ROOT/'notes/lane-1.11r3-research.md').read_text(encoding='utf-8')
assert handover.rfind('## Findings outside my scope')>handover.find('## R45 close-out')
assert '198 held judgment rows' in handover
sources=json.loads((EVIDENCE/'round2-source-files.json').read_text(encoding='utf-8'))
for s in sources: assert hashlib.sha256(Path(s['file']).read_bytes()).hexdigest()==s['sha256']
for name in ['apply.js','csvlib.js']:
    assert (RESOURCE/'tools'/name).exists()
inventory=[]
for p in sorted(RESOURCE.rglob('*')):
    if p.is_file() and (p.name.startswith('rs1') or p.name.startswith('R45') or p.name in ['A1-registers.md','ten-confederates.md','dating.csv'] or p.name.startswith('r45-') or EVIDENCE in p.parents):
        if p.name in ['final-checks.json','final-inventory.json','closeout.log']:continue
        inventory.append({'path':p.relative_to(ROOT).as_posix(),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
inventory.append({'path':'notes/lane-1.11r3-research.md','bytes':(ROOT/'notes/lane-1.11r3-research.md').stat().st_size,'sha256':hashlib.sha256((ROOT/'notes/lane-1.11r3-research.md').read_bytes()).hexdigest()})
(EVIDENCE/'final-inventory.json').write_text(json.dumps(inventory,indent=2)+'\n',encoding='utf-8')
result={'research_structure':'PASS','cells':130,'decisions':dict(totals),'by_field':{k:dict(v) for k,v in sorted(by_field.items())},'A1_men':23,'serving_confirmed':13,'former_US_Army_no_current':9,'District_exception':'Stone, not a certified no-federal-commission verdict','bloc_recommendations':10,'dating_records':12,'dating_cells':9,'required_check':{'exit':2,'tests_run':0,'reason':'missing Node type definitions'},'required_done_check':{'exit':1,'criteria_evaluated':0,'reason':'tsx missing'},'no_git_full_suite_prerequisite':'older config does not exclude staged-check tests','CSV_and_apply_harness_exit':0,'apply_mutated_pack':False,'servers_started':0,'inventory_items':len(inventory)}
(EVIDENCE/'final-checks.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,indent=2))
