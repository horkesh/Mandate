"""Read-only research integrity audit; run from any cwd; --sources pins external evidence.

This checks coverage, citations, joins and preserved holds. It cannot prove a
historical interpretation; that requires reading the cited source passages.
"""
from pathlib import Path
import csv,hashlib,json,re,sys
D=Path(__file__).resolve().parent
checks=0
def check(condition,detail):
    global checks
    checks+=1
    if not condition:raise AssertionError(detail)
def rows(name):
    raw=(D/name).read_bytes()
    check(not raw.startswith(b'\xef\xbb\xbf') and '\ufffd' not in raw.decode('utf8'),name+' encoding')
    with (D/name).open(encoding='utf8',newline='') as f:r=list(csv.DictReader(f))
    check(bool(r),name+' empty')
    for x in r:check(None not in x and all(v!='' for v in x.values()),name+' malformed/blank cell')
    return r
def pages(s):
    result=set()
    for token in re.split('[;,]',s):
        nums=token.strip().split('-');a=int(nums[0]);b=int(nums[-1]);result.update(range(a,b+1))
    return result
cat=json.loads((D/'catalogue-receipt.json').read_text(encoding='utf8'))
src=json.loads((D/'source-reading.json').read_text(encoding='utf8'))
register=rows('term-register.csv');obs=rows('service-observations.csv');search=rows('search-dispositions.csv')
ids=[r['catalogue_id'] for r in register];requested=cat['requested_ids']
check(len(ids)==len(set(ids))==161 and ids==requested,'exact requested catalogue IDs/order')
check(len(cat['previously_established'])==53 and not set(ids)&{x['id'] for x in cat['previously_established']},'prior terms excluded')
check(cat['count']==214 and cat['held']==161 and cat['read_only'],'catalogue receipt')
source_keys={s['key'] for s in src['sources']}
available={k:{int(p['printed_page']) for p in src['readings'] if p['source']==k} for k in source_keys}
by_obs={o['observation_id']:o for o in obs}
check(len(by_obs)==len(obs),'unique observation IDs')
for o in obs:
    check(o['catalogue_id'] in ids,'foreign observation identity')
    check(o['source'] in source_keys and pages(o['pages'])<=available[o['source']],o['observation_id']+' unread citation')
    check(o['date_start']<=o['date_end'],o['observation_id']+' date ordering')
    check(o['event'] in {'original_term','component_term','muster_in','credited_date','organization','parent_term_context','candidate_original_term'},o['event'])
    if o['event']=='original_term':
        check(o['identity_relation']=='identified' and o['term_unit'] in {'months','years','duration'},o['observation_id']+' term scope')
        check(o['term_value'] in {'1','2','3','war'},o['observation_id']+' term value')
    if o['term_value']=='war':check(o['term_unit']=='duration',o['observation_id']+' war not finite days')
    if o['identity_relation']!='identified':check(o['event']!='original_term',o['observation_id']+' borrowed term')
for r in register:
    own=[o for o in obs if o['catalogue_id']==r['catalogue_id']]
    tt=[o for o in own if o['event']=='original_term']
    mm=[o for o in own if o['event']=='muster_in' and o['identity_relation']=='identified']
    federal=[o for o in tt if o['authority'] in {'United States','Confederate States'}]
    expected='federal_term_sourced' if federal else ('State_term_only_federal_HOLD' if tt else 'term_HOLD')
    check(r['term_status']==expected,r['catalogue_id']+' term disposition')
    for column,expected_obs in [('term_observations',tt),('muster_observations',mm),('other_observations',[o for o in own if o not in tt and o not in mm])]:
        actual=set() if r[column]=='none' else set(r[column].split(';'))
        check(actual=={o['observation_id'] for o in expected_obs},r['catalogue_id']+' '+column)
    if r['state']=='US':check(not tt,r['catalogue_id']+' regular contract guessed')
check({r['catalogue_id'] for r in register if r['muster_status']=='conflicting_sources_HOLD'}=={'ny_25_infantry','ny_27_infantry','ny_31_infantry','pa_26_infantry'},'muster conflicts retained')
check(next(r for r in register if r['catalogue_id']=='ny_13_as_printed_militia_go13_infantry')['term_status']=='term_HOLD','13th identity hold')
check({r['catalogue_id'] for r in register if r['term_status']=='State_term_only_federal_HOLD'}=={'sc_2_infantry','sc_3_infantry','sc_4_infantry'},'State/federal distinction')
flatten=[uid for r in search for uid in r['catalogue_ids'].split(';')]
check(len(flatten)==161 and set(flatten)==set(ids),'search dispositions cover exact catalogue set')
for r in search:
    check(int(r['requested_count'])==len(r['catalogue_ids'].split(';')),'group counts')
    check(sum(int(r[k]) for k in ['federal_terms','State_only','term_holds'])==int(r['requested_count']),'group dispositions')
artifacts=0
if '--sources' in sys.argv:
    for item in src['sources']+src['readings']+src['images_inspected']:
        p=Path(item['artifact']);check(p.is_file(),str(p))
        check(hashlib.sha256(p.read_bytes()).hexdigest()==item['sha256'],str(p)+' hash');artifacts+=1
    # Validate against the retained exact input, never the concurrently edited July tree.
    snapshot=D.parents[2]/'runs/s75/catalogue-input.json'
    if snapshot.exists():
        original=json.loads(snapshot.read_bytes())
        check([x['id'] for x in original if not x['termDays']]==ids,'snapshot identities')
        check([dict(id=x['id'],termDays=x['termDays']) for x in original if x['termDays']]==cat['previously_established'],'snapshot prior terms')
print(json.dumps(dict(result='PASS',checks=checks,requested=len(ids),observations=len(obs),
    federal_terms=sum(r['term_status']=='federal_term_sourced' for r in register),
    State_only=sum(r['term_status']=='State_term_only_federal_HOLD' for r in register),
    term_holds=sum(r['term_status']=='term_HOLD' for r in register),
    source_works=len(src['sources']),page_passages=len(src['readings']),external_hashes_verified=artifacts),indent=2))
