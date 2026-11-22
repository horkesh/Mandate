"""Read-only S72 research package checks; no simulation or pack writes.

Run from the repository root: python docs/research/S72/verify.py
Pass --sources to verify the pinned external artifacts on the research host.
"""
from pathlib import Path
import csv,hashlib,json,re,sys

ROOT=Path(__file__).resolve().parents[3]
D=ROOT/'docs/research/S72'
def read(name):
    p=D/name
    raw=p.read_bytes()
    assert not raw.startswith(b'\xef\xbb\xbf'), f'BOM: {name}'
    assert '\ufffd' not in raw.decode('utf8'), f'Bad UTF-8: {name}'
    with p.open(encoding='utf8',newline='') as f:
        rows=list(csv.DictReader(f))
    assert rows and all(None not in r and all(v for v in r.values()) for r in rows), name
    return rows
def pages(s):
    nums=[]
    for token in re.split(r'[;,]',s):
        token=token.strip()
        if '-' in token:
            a,b=map(int,token.split('-')); nums.extend(range(a,b+1))
        else: nums.append(int(token))
    return nums
receipt=json.loads((D/'source-reading.json').read_text(encoding='utf8'))
source_pages={s['key']:{p['printed_page'] for p in s['pages']} for s in receipt['historical_sources']}
base=list(csv.DictReader((ROOT/'docs/research/2026-11-22-S66-regiment-paths.csv').open(encoding='utf8')))
base_ids={r['unit_id'] for r in base}
assert len(base)==len(base_ids)==214
obs=read('strength-observations.csv'); coverage=read('strength-coverage.csv')
assert len(obs)==len({r['observation_id'] for r in obs})==67
assert len(coverage)==428
assert {(r['unit_id'],r['month']) for r in coverage}=={(i,m) for i in base_ids for m in ['1861-06','1861-07']}
for r in obs:
    assert r['unit_id'] in base_ids, r
    assert r['date_start'][:7] in ['1861-06','1861-07']
    assert r['date_start']<=r['date_end']
    assert set(pages(r['pages']))<=source_pages[r['source']], r
    assert r['relation'] in ['equal','about','less_than']
    assert any(r[k]!='unknown' for k in ['reported_quantity','reported_officers','reported_men'])
    if r['derived_officers_plus_men']!='unknown':
        assert int(r['derived_officers_plus_men'])==int(r['reported_officers'])+int(r['reported_men'])
    else:
        assert not (r['reported_officers'].isdigit() and r['reported_men'].isdigit())
    for key in ['reported_quantity','reported_officers','reported_men','derived_officers_plus_men']:
        assert r[key]=='unknown' or (r[key].isdigit() and int(r[key])>0)
for r in coverage:
    expected={o['observation_id'] for o in obs if o['unit_id']==r['unit_id'] and o['date_start'].startswith(r['month'])}
    assert (set(r['observation_ids'].split(';')) if r['observation_ids']!='none' else set())==expected
    assert (r['status']=='observations_found')==bool(expected)
people=read('commander-identities.csv')
assert {r['held_label'] for r in people}=={'Carson','Meem','Williams','Wynkoop'}
assert sum('July_identity_HOLD' in r['disposition'] for r in people)==1
assert all('unexpanded' in r['disposition'] or r['held_label']=='Williams' for r in people)
militia=read('winchester-militia.csv')
assert len(militia)==10
assert all(r['permanent_militia_number']=='unknown' for r in militia if r['commander']=='Gilbert S. Meem')
assert all('July_HOLD' in r['status'] for r in militia if r['commander']=='James H. Carson')
assert len(read('search-dispositions.csv'))==9
assert len(read('excluded-quantities.csv'))==8
artifact_count=0
if '--sources' in sys.argv:
    def check(p,h):
        global artifact_count
        p=Path(p);assert p.is_file(),p
        assert hashlib.sha256(p.read_bytes()).hexdigest()==h,p
        artifact_count+=1
    for s in receipt['historical_sources']:
        check(s['scan_path'],s['sha256'])
        for p in s['pages']: check(p['artifact'],p['sha256'])
    for s in receipt['archival_search_aids']: check(s['file'],s['sha256'])
print(json.dumps({'result':'PASS','quantity_observations':len(obs),'S66_identifiers':len(base_ids),'quantity_identifiers':len({r['unit_id'] for r in obs}),'unit_month_dispositions':len(coverage),'unit_months_with_observations':sum(r['status']=='observations_found' for r in coverage),'held_unit_months':sum(r['status']!='observations_found' for r in coverage),'identity_joins_supported':3,'July_identity_holds':1,'militia_observations':len(militia),'external_hashes_verified':artifact_count},indent=2))
