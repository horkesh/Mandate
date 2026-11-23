"""Bounded research integrity and preservation checks; no game or network run."""
import collections, csv, hashlib, json, pathlib, re, subprocess

R=pathlib.Path(__file__).resolve().parents[3]; P=R/'docs/research/S88'; O=R/'runs/s88'
checks=[]
def ck(value,label):
    checks.append(dict(check=label,passed=bool(value)))
    if not value: raise AssertionError(label)
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def js(p): return json.loads(p.read_text(encoding='utf-8'))
def rows(name): return list(csv.DictReader((P/name).open(encoding='utf-8')))
def put(p,x): p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8',newline='\n')

base=js(O/'baseline.json')
for name,digest in base['files'].items():
    ck((R/name).is_file() and sha(R/name)==digest,'original byte preservation: '+name)
ck(subprocess.check_output(['git','branch','--show-current'],cwd=R).decode().strip()=='sprint/pushback','branch')
ck(subprocess.check_output(['git','config','core.hooksPath'],cwd=R).decode().strip()=='.githooks','configured project hook')
for item in js(P/'input-receipts.json'):
    ck(sha(pathlib.Path(item['path']))==item['sha256'],'frozen input hash: '+item['path'])
reading=js(P/'source-reading.json')
for item in reading['sources']+reading['web_receipts']:
    ck(sha(R/item['path'])==item['sha256'],'source hash: '+item['path'])
pages=rows('source-pages.csv'); locators={x['id']:x for x in pages}
ck(len(pages)==153 and len(locators)==153,'153 unique page/document receipts')
for item in pages:
    ck(sha(R/item['path'])==item['sha256'],'read extract hash: '+item['id'])
    ck(bool(item['page'] and item['source'] and item['url'] and item['reading']),'bounded locator: '+item['id'])
main=pathlib.Path('C:/Pyrrhic/ByOrderOfThePresident/docs/decisions/0111-pushback-is-measured-by-named-acts.md')
ck((P/main.name).read_bytes()==main.read_bytes().replace(b'\r\n',b'\n'),'0111 exact LF-normalized research snapshot')

acts=rows('union-register.csv')+rows('confederate-register.csv'); by_id={x['id']:x for x in acts}
ck(len(acts)==74 and len(by_id)==74,'47 Union + 27 Confederate candidate rows')
for item in acts:
    ck(all(item[k] for k in ['actor','office','role','matter','act','date','source_refs','reason','unit']),'complete act: '+item['id'])
    ck(all(ref in locators for ref in item['source_refs'].split(';')),'read source references: '+item['id'])
    ck(item['status'] in ['eligible','qualified_source','excluded'],'explicit disposition: '+item['id'])
eligible=[a for a in acts if a['status']=='eligible']; qualified=[a for a in acts if a['status']=='qualified_source']
keys=[tuple(a[k] for k in ['side','actor','role','matter','act']) for a in eligible+qualified]
ck(len(keys)==len(set(keys)),'no duplicate named-act keys')
ck(len(eligible)==33 and len(qualified)==3,'33 proposed obligations; three separately qualified source rows')
ck(by_id['U26']['status']==by_id['C08']['status']==by_id['C13']['status']=='excluded','no invented same-request reservation')
cat=rows('catalogue-disposition.csv')
old=list(csv.DictReader((R/'docs/research/S87/catalogue-disposition.csv').open(encoding='utf-8')))
ck(len(cat)==41 and {x['catalogue_id'] for x in cat}=={x['catalogue_id'] for x in old},'exact 41 inherited catalogue IDs')
for item in cat:
    linked=[by_id[k] for k in item['rows'].split(';')]
    ck(all(item['catalogue_id'] in a['catalogue_ids'].split(';') for a in linked),'catalogue linkage: '+item['catalogue_id'])
    ck(bool(item['disposition']) and all(ref in locators for ref in item['source_refs'].split(';')),'sourced disposition: '+item['catalogue_id'])

schedule=rows('coverage-proposal.csv'); matches=rows('case-matches.csv'); coverage=rows('coverage-score.csv')
ck(len(schedule)==len(coverage)==14,'seven bands on each issuing side')
ck({m['case_id'] for m in matches}=={a['id'] for a in eligible+qualified},'every proposed/qualified act scored once')
for item in schedule:
    group=[a for a in eligible if (a['side'],a['band'])==(item['side'],item['band'])]
    ck({a['id'] for a in group}==set(filter(None,item['required_rows'].split(';'))),'required IDs: '+item['side']+'/'+item['band'])
    ck(len(group)==int(item['proposed_required']),'coverage obligation arithmetic: '+item['side']+'/'+item['band'])
raw=rows('raw-response-diagnostics.csv'); raw_ids={r['event_id'] for r in raw}
ck(len(raw)==len(raw_ids)==219,'219 distinct complete response diagnostics')
ck(sum(r['role']=='addressee' for r in raw)==208 and sum(r['role']=='relay' for r in raw)==11,'208 addressees + 11 relays')
ck(sum(int(x['count']) for x in rows('raw-counts.csv'))==219,'raw grouping total')
expected=collections.Counter((r['side'],r['actor'],r['role'],r['kind'],r['actual'],r['declared']) for r in raw)
actual={tuple(r[k] for k in ['side','actor','role','kind','actual','declared']):int(r['count']) for r in rows('raw-counts.csv')}
ck(expected==actual,'raw side/actor/role/kind/rung grouping exact')
used=[r['matched_event_id'] for r in matches if int(r['count'])]
ck(len(used)==len(set(used))==1 and set(used)<=raw_ids,'one model act, at most once')
ck([r['case_id'] for r in matches if int(r['count'])]==['U39'],'only qualified Morgan coverage')
for item in matches:
    ck(set(filter(None,item['candidate_event_ids'].split(';')))<=raw_ids,'retained candidate IDs: '+item['case_id'])
    ck(int(item['count'])==int(item['verdict']=='matched_qualified'),'verdict credit: '+item['case_id'])
s84=rows('s84-response-disposition.csv')
ck(len(s84)==34 and sum(not r['coverage_case'] for r in s84)==33,'all 34 S84 responses; 33 not coverage')
score=js(P/'score.json')
ck(score['primary_obligations']==33 and score['qualified_matches']==1 and score['no_pass_declared'],'score totals and unmet acceptance')
ck(score['verdict_counts']==dict(collections.Counter(m['verdict'] for m in matches)),'verdict totals')
ck(score['reference_final_hash']=='97fb93236a6a3af5e99ad2a0dde34f4f48b21f6597c29fb0c746585d081bff0c','frozen reference hash')

files=sorted(p for p in P.iterdir() if p.is_file())
for extra in ['docs/research/2026-11-23-S88-pushback-registers-and-coverage.md','notes/sprint-S88-pushback-registers.md']:
    if (R/extra).exists(): files.append(R/extra)
for p in files:
    content=p.read_bytes(); text=content.decode('utf-8')
    ck(not content.startswith(b'\xef\xbb\xbf') and '\ufffd' not in text,'UTF-8 without BOM/replacement: '+p.name)
    if p.suffix=='.py': compile(text,str(p),'exec')
    if p.suffix=='.md':
        for target in re.findall(r'\]\(([^)]+)\)',text):
            if '://' not in target and not target.startswith('#'):
                ck((p.parent/target.split('#')[0]).exists(),'local link: '+target)
inventory={p.relative_to(R).as_posix():dict(bytes=p.stat().st_size,sha256=sha(p)) for p in files}
put(O/'inventory.json',inventory)
put(O/'verification.json',dict(checks=checks,passed=len(checks),original_paths=len(base['files']),delivery_paths=len(files)))
print(json.dumps(dict(passed=len(checks),original_paths=len(base['files']),delivery_paths=len(files),required=33,qualified_matches=1)))
