"""S97 artifact integrity, completeness, boundary and preservation checks.

Default is portable. --live additionally checks the pinned read-only July inputs,
local source receipts and all starting tracked files, without changing any file.
Historical interpretation remains the lead/reviewer’s decision.
"""
from pathlib import Path
import csv, hashlib, json, re, subprocess, sys
ROOT=Path(__file__).resolve().parents[3];D=Path(__file__).resolve().parent
checks=0
def check(test,why):
    global checks
    checks+=1
    if not test:raise AssertionError(why)
def read(name):return json.loads((D/name).read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
inputs=read('inputs.json');actors=read('actors.json');audit=read('audit.json');drafts=read('drafts.json');sources=read('source-pages.json');counts=read('counts.json')
ids=inputs['actor_order'];check(len(ids)==len(set(ids))==20,'20 named actors')
eligible={r['actor'] for v in inputs['registers'].values() for r in v['rows'] if r['status']=='eligible'}
check(eligible==set(ids),'exact eligible register actor set')
check(sum(r['status']=='eligible' for v in inputs['registers'].values() for r in v['rows'])==33,'33 obligations')
check(set(inputs['people'])==set(ids)-{'brown_george_w'},'19 live people; Baltimore Brown absent')
check([r['actor'] for r in actors]==ids,'all actors have explicit records')
expected={}
for actor,p in inputs['people'].items():
    fields=[(c,p['centres'][c]) for c in ['competence','nerve','reputation']]+list(p['temperament'].items())+[('regard',p['regard'])]
    fields += [('value:'+x['value'],dict(direction='present',cites=x['cites'])) for x in p['values']]
    fields += [('trait:'+x['trait'],dict(direction='present',cites=x['cites'])) for x in p['traits']]
    fields += [('regard_others:'+x['toward'],x) for x in p['regardOthers']]
    for c,x in fields:
        if x['direction'] is not None:expected[actor,c]=(x['direction'],x['cites'])
check(len(expected)==len(audit)==98,'98 atomic entered cells')
check({(r['actor'],r['cell']) for r in audit}==set(expected),'no omission/extra/duplicate cell')
source_by={r['key']:r for r in sources};check(len(source_by)==len(sources)==70,'unique read locators')
for s in sources:
    p=ROOT/s['path'];check(p.resolve().parent==D/'read','source path confinement')
    check(sha(p)==s['sha256'],'source excerpt '+s['key'])
    check(bool(s['page']) and bool(s['read_scope']) and bool(s['url']),'source locator/scope')
for r in audit:
    check((r['entered'],r['citations'])==expected[r['actor'],r['cell']],'exact original value/citations')
    check(r['disposition'] in ['KEEP','HOLD','CORRECT'],'disposition')
    check(bool(r['basis']) and bool(r['document_dates']) and bool(r['direction_supported']),'reason/date/direction')
    check(all(k in source_by for k in r['read_keys']),'source joins')
    policy=inputs['evidence_policy']['evidence']
    innate=r['cell'] in policy['innateStats'] or r['cell'].removeprefix('trait:') in policy['innateTraits']
    check(r['classification']==('innate' if innate else 'starting'),'exact source-policy class '+r['cell'])
    if r['disposition']=='KEEP':
        check(r['proposed']==r['entered'],'no unexplained direction correction')
        check(bool(r['read_keys']),'keep has read pages')
        check(r['pre_start_contemporary_leg']=='yes' or r['classification']=='innate','starting keep has early leg')
    if r['disposition']=='HOLD':check(r['proposed']=='unknown','hold is unknown')
    if r['cell']=='trait:candid':check(r['classification']=='starting','candid is not innate')
check(sum(r['disposition']=='KEEP' for r in audit)==26,'26 keeps')
check(sum(r['disposition']=='HOLD' for r in audit)==72,'72 holds')
check(not any(r['actor']=='mccauley_charles_s' for r in audit),'McCauley no entered judgment')
check(len(drafts)==12 and len({(r['actor'],r['cell']) for r in drafts})==12,'12 unique drafts')
for r in drafts:
    check(r['actor'] in ids,'draft actor')
    check(r['document_date'][:10]<'1861-03-05','draft is pre-start, including latest date bound')
    check(all(k in source_by for k in r['read_keys']),'draft read page joins')
    check(r['proposed_direction'] in ['present','above'],'draft is direction not numeric fit')
    if r['kind']=='alternative evidence for held cell':check(next(x for x in audit if x['actor']==r['actor'] and x['cell']==r['cell'])['disposition']=='HOLD','alternative does not silently waive hold')
check(sum(r['kind']=='new' for r in drafts)==7,'seven new cells')
check(sum(r['kind']!='new' for r in drafts)==5,'five alternative citation proposals')
legs=list(csv.DictReader((D/'citation-legs.csv').open(encoding='utf-8',newline='')))
check(len(legs)==sum(len(r['citations']) for r in audit)==159,'159 original citation legs')
for r in audit:
    ls=[x for x in legs if (x['actor'],x['cell'])==(r['actor'],r['cell'])]
    check([(x['source'],x['locator']) for x in ls]==[(x['source'],x['at']) for x in r['citations']],'exact per-leg chain')
check(counts['entered']==98 and counts['actors']==20 and counts['drafts']==12,'count receipt')
if '--live' in sys.argv:
    j=Path('C:/Pyrrhic/sprint-july')
    for rel,r in inputs['inputs'].items():check(sha(j/rel)==r['sha256'],'read-only July input preserved '+rel)
    for s in sources:check(sha(Path(s['upstream']))==s['upstream_sha256'],'retained upstream '+s['key'])
    baseline=json.loads((ROOT/'runs/s97/starting-files.json').read_text(encoding='utf-8'))
    for rel,digest in baseline.items():check(sha(ROOT/rel)==digest,'original tracked file preserved '+rel)
    branch=subprocess.check_output(['git','branch','--show-current'],cwd=ROOT).decode().strip()
    check(branch=='sprint/research-cast','correct branch')
    check(subprocess.check_output(['git','config','core.hooksPath'],cwd=ROOT).decode().strip()=='.githooks','unchanged hook configured')
print(json.dumps({'exit':0,'checks':checks,'actors':20,'entered_cells':98,'keeps':26,'holds':72,'drafts':12,'live':'--live' in sys.argv}))
