"""Read-only S76 provenance, exact-continuation and authority/scope audit.

This establishes structural integrity, not historical review or completion of
the missing original-record retrievals. Run --sources on the research host.
"""
from pathlib import Path
import csv,json,hashlib,re,sys
D=Path(__file__).resolve().parent;P=D.parent/'S75';checks=0
def check(ok,detail):
    global checks
    checks+=1
    if not ok:raise AssertionError(detail)
def read(p):
    b=p.read_bytes();check(not b.startswith(b'\xef\xbb\xbf') and '\ufffd' not in b.decode('utf8'),str(p)+' UTF8')
    with p.open(encoding='utf8',newline='') as f:r=list(csv.DictReader(f))
    check(bool(r),str(p)+' empty')
    for x in r:check(None not in x and all(v for v in x.values()),str(p)+' malformed row')
    return r
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def pages(s):
    out=set()
    for x in re.split('[;,]',s):
        x=x.strip()
        if re.fullmatch(r'\d+-\d+',x):
            a,b=map(int,x.split('-'));out.update(map(str,range(a,b+1)))
        else:out.add(x)
    return out
old=read(P/'term-register.csv');new=read(D/'term-register.csv');oo=read(P/'service-observations.csv');obs=read(D/'service-observations.csv');search=read(D/'search-dispositions.csv')
newobs=obs[len(oo):]
receipt=json.loads((D/'continuation-receipt.json').read_bytes());src=json.loads((D/'source-reading.json').read_bytes())
held=[x['catalogue_id'] for x in old if x['term_status']!='federal_term_sourced']
check(receipt['requested_ids']==held and len(held)==118,'exact 118 starting holds')
check([x['catalogue_id'] for x in search]==held,'118 retrieval/search dispositions in starting order')
for s in search:
    check(s['retrieval_needed_at_start']==next(x['retrieval_needed'] for x in old if x['catalogue_id']==s['catalogue_id']),s['catalogue_id']+' starting retrieval retained')
for before,after in zip(old,new):
    if before['catalogue_id'] not in held:check(before==after,before['catalogue_id']+' previously cleared row unchanged')
check(receipt['prior_register_sha256']==sha(P/'term-register.csv'),'prior register hash')
check(receipt['prior_observations_sha256']==sha(P/'service-observations.csv'),'prior observation hash')
check([x['catalogue_id'] for x in old]==[x['catalogue_id'] for x in new] and len(new)==161,'161 IDs/order unchanged')
check(obs[:len(oo)]==oo and len(oo)==150,'150 S75 observations retained exactly')
check([x for x in new if x['catalogue_id'] not in held]==[x for x in old if x['catalogue_id'] not in held],'43 S75 cleared rows unchanged')
check([x['catalogue_id'] for x in search]==held,'118 retrieval dispositions exact order')
newobs=obs[len(oo):];check(len({x['observation_id'] for x in obs})==len(obs),'observation IDs unique')
available={s['key']:set() for s in src['sources']}
for p in src['readings']:available[p['source']].add(str(p['printed_page']))
for o in obs:
    check(o['catalogue_id'] in [r['catalogue_id'] for r in new],o['observation_id']+' ID')
    check(o['source'] in available and pages(o['pages'])<=available[o['source']],o['observation_id']+' source/read-page coverage')
    if o in newobs:
        check(o['catalogue_id'] in held,o['observation_id']+' scope')
        if o['event']=='original_term':
            check(o['identity_relation']=='identified' and o['term_unit'] in {'years','months','duration'},o['observation_id']+' own-unit contract')
        if o['identity_relation']!='identified':check(o['event']!='original_term',o['observation_id']+' candidate applied')
for r in new:
    own=[o for o in obs if o['catalogue_id']==r['catalogue_id']];tt=[o for o in own if o['event']=='original_term'];mm=[o for o in own if o['event']=='muster_in' and o['identity_relation']=='identified']
    federal=[o for o in tt if o['authority'] in {'United States','Confederate States'}]
    status='federal_term_sourced' if federal else ('State_term_only_federal_HOLD' if tt else 'term_HOLD')
    check(r['term_status']==status,r['catalogue_id']+' authority disposition')
    for col,expected in [('term_observations',tt),('muster_observations',mm),('other_observations',[o for o in own if o not in tt and o not in mm])]:
        actual=set() if r[col]=='none' else set(r[col].split(';'));check(actual=={o['observation_id'] for o in expected},r['catalogue_id']+' joins '+col)
    if r['state']=='US':check(not tt,r['catalogue_id']+' no single regular volunteer term')
check({r['catalogue_id'] for r in new if r['catalogue_id'] in held and r['term_status']=='federal_term_sourced'}=={'me_3_infantry','me_4_infantry','me_5_infantry','me_6_infantry','ri_1_infantry','ri_2_infantry','la_washington_battalion_artillery'},'seven additional federal contracts')
check('or during the war' in next(r['original_terms'] for r in new if r['catalogue_id']=='ri_2_infantry'),'RI war clause retained')
check({r['catalogue_id'] for r in new if r['muster_status']=='conflicting_sources_HOLD'}=={'ny_25_infantry','ny_27_infantry','ny_31_infantry','pa_26_infantry'},'four old muster conflicts retained')
check(sum(r['term_status']!='federal_term_sourced' for r in new)==111,'111 federal terms remain unfinished')
artifact_count=0
if '--sources' in sys.argv:
    for item in src['sources']+src['readings']+src['images_inspected']:
        p=Path(item['artifact']);check(p.is_file(),str(p)+' missing');check(sha(p)==item['sha256'],str(p)+' SHA256');artifact_count+=1
print(json.dumps(dict(result='PASS',checks=checks,requested=118,rows=len(new),observations=len(obs),new_observations=len(newobs),new_federal_terms=7,federal_still_held=111,external_artifact_hashes=artifact_count),indent=2))
