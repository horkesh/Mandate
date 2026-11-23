"""Read-only S89 integrity audit. Run at repository root; requires retained S82/source artifacts.

Checks evidence joins, arithmetic, draft boundaries and preservation. Does not certify
historical interpretation or implement the deferred unknown-input correction.
"""
from pathlib import Path
import csv,datetime,hashlib,json,subprocess
ROOT=Path(__file__).resolve().parents[3]
D=ROOT/'docs/research/S89';count=0
def check(condition,why):
 global count
 count+=1
 if not condition:raise AssertionError(why)
def read(name):return json.loads((D/name).read_text(encoding='utf-8'))
def csvread(name):return list(csv.DictReader((D/name).open(encoding='utf-8',newline='')))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
refs=read('reference-inputs.json');check(refs['commit'].startswith('e2b98c81'),'frozen reference')
for p,r in refs['inputs'].items():check(sha(Path(p))==r['sha256'],f'reference hash {p}')
source=read('source-reading.json');keys={r['key'] for r in source['sources']}
check(len(keys)==27,'27 read locators')
for r in source['sources']:
 check(sha(Path(r['path']))==r['sha256'],r['key'])
 check(bool(r['read_scope']) and bool(r['page']),f'reading scope/page {r["key"]}')
 if r['image_inspected']:check(sha(Path(r['image']['path']))==r['image']['sha256'],f'image {r["key"]}')
for r in source['upstream']:check(sha(Path(r['path']))==r['sha256'],'upstream source')
for r in read('code-evidence.json'):
 raw=subprocess.check_output(['git','show',f'{refs["commit"]}:{r["path"]}'],cwd=ROOT)
 check(hashlib.sha256(raw).hexdigest()==r['sha256'],f'code {r["path"]}')
 lines=raw.decode().splitlines()
 for e in r['excerpts']:
  text='\n'.join(f'{n}: {lines[n-1]}' for n in range(e['first_line'],e['last_line']+1))
  check(text==e['text'],f'excerpt {r["path"]}:{e["first_line"]}')
refpath=Path('C:/Pyrrhic/sprint-july/runs/s82/references');final=json.loads((refpath/'union-1861-final-state.json').read_text())
trace=json.loads((refpath/'union-1861-trace.json').read_text());allresponses={}
for day in trace:
 for x in day['changes'].get('orderResponses',[]):
  if x['after'] is not None:allresponses[x['id']]=x['after']
records=read('response-evidence.json');calls=csvread('all-confederate-call-responses.csv');selected=csvread('objecting-governor-call-responses.csv');index=csvread('call-index.csv')
check(len(index)==49 and len(calls)==48 and len(selected)==19,'coverage counts')
check(sum(int(r['answer_count']) for r in index)==48,'index answers')
check([r['call_id'] for r in index if r['answer_count']=='0']==['cs_apr22_absolute_kentucky'],'unanswered retained')
for r in calls:
 raw=allresponses[r['response_key']];check(raw==final['orderResponses'][r['response_key']],'trace/final exact')
 check(r['actual']==raw['respActual'] and r['call_id']==raw['respCallId'] and int(r['response_day'])==raw['respDay'],'response join')
 terms={x['respTermName']:x['respTermAmount'] for x in raw['respTerms']}
 for k in ['values','temperament','regard','deterrence','capacity','disposition','grievances','judgement','practice']:check(int(r[k])==terms.get(k,0),'term '+k)
 check(sum(terms.values())==int(r['willingness']),'sum')
 check(str(datetime.date(1861,3,5)+datetime.timedelta(days=raw['respDay']))==r['response_date'],'calendar')
for r in records:
 key=r['key'];check({k:v for k,v in r.items() if k!='key'}==allresponses[key],'portable response')
check({r['actor'] for r in selected}==set(refs['all_objecting_governors']),'all objectors')
check(all(r['actual']=='object' and r['declared']=='object' for r in selected),'actual/declared')
unknown={'clark_edward','moore_thomas_o','perry_madison_s'};check(set(refs['all_unknown_objecting_governors'])==unknown,'three all-unknown')
check(sum(r['actor'] in unknown for r in selected)==13,'13 all-unknown objections')
govs=csvread('governor-inputs.csv')
for r in govs:
 b=int(r['initial_boldness']);expected=-(abs(500-b)*400//1000)
 for x in selected:
  if x['actor']==r['actor']:check(int(x['temperament'])==expected,'temperament arithmetic')
 check(int(r['initial_candour'])>=500,'object candour selector')
check(len(csvread('term-origins.csv'))==36,'six origins/selectors for each actor')
drafts=csvread('judgment-drafts.csv');check(len(drafts)==48,'48 dispositions')
check(sum(r['disposition']=='PROPOSE' for r in drafts)==6,'six proposals')
for r in drafts:
 check(set(r['sources'].split(';'))<=keys,'read-page source for draft')
 if r['disposition']=='PROPOSE':
  check(r['person']!='clark_edward' and r['inference']=='[I]' and r['basis'].startswith('[I]'),'proposal boundary/label')
  check(all(d<'1861-03-05' for d in r['document_date'].split(';')),'pre-start judgment')
 else:check(r['proposed_value']=='','hold has no default')
people=csvread('people.csv');check(len(people)==3 and {p['id'] for p in people}==unknown,'three replacement fragments')
for r in people:
 check(len(r)==28,'exact cast shape')
 check(not any(r[k] for k in ['candour','regard','faction','born','died','competence','nerve','experience','reputation','traits','practices','bloc','ranks']),'held fields empty')
check(next(p for p in people if p['id']=='clark_edward')['boldness']=='','Clark unknown')
inventory=ROOT/'runs/s89/starting-files.json'
if inventory.exists():
 for p,h in json.loads(inventory.read_text()).items():check(sha(ROOT/p)==h,f'original tracked preservation {p}')
status=subprocess.check_output(['git','status','--porcelain','--untracked-files=all'],cwd=ROOT).decode()
allowed={'docs/research/2026-11-23-S89-governor-objections.md','notes/sprint-S89-governor-objections.md'}
for line in status.splitlines():
 p=line[3:];check(p in allowed or p.startswith('docs/research/S89/'),'write scope '+p)
print(json.dumps({'status':'PASS','checks':count,'read_locators':27,'inspected_images':5,'calls':49,'answers':48,'objecting_governor_answers':19,'all_unknown_objectors':3,'draft_people':3,'proposed_cells':6,'held_cells':42,'scope':'S89 research only; no historical interpretation, runtime, timing or gate acceptance certified'},indent=2))
