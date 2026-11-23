"""Small source, arithmetic, package and preservation audit; no simulation."""
import csv,hashlib,json,pathlib,re,subprocess
R=pathlib.Path.cwd(); P=R/'docs/research/S87'; O=R/'runs/s87'
checks=[]
def ck(condition,message):
    checks.append({'check':message,'passed':bool(condition)})
    if not condition: raise AssertionError(message)
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def rows(n): return list(csv.DictReader((P/n).open(encoding='utf-8')))
base=json.loads((O/'baseline.json').read_text())
for f,d in base['files'].items(): ck((R/f).exists() and sha(R/f)==d,'original byte preservation: '+f)
ck(subprocess.check_output(['git','branch','--show-current']).decode().strip()=='sprint/pushback','correct branch')
for manifest in ['input-receipts.json','reference-receipts.json']:
    for f,d in json.loads((P/manifest).read_text()).items(): ck(sha(pathlib.Path(f))==d['sha256'],'input hash: '+f)
for f,d in json.loads((P/'input-receipts.json').read_text()).items():
    ck(sha(P/('s84-'+pathlib.Path(f).name))==d['snapshot_sha256'],'LF-normalized input snapshot: '+f)
for source in json.loads((P/'source-reading.json').read_text())['sources']:
    ck(sha(pathlib.Path(source['path']))==source['sha256'],'read source hash: '+source['work']+' '+source['printed_pages'])
score=json.loads((P/'score.json').read_text())
ck(score['reference_final_hash']=='97fb93236a6a3af5e99ad2a0dde34f4f48b21f6597c29fb0c746585d081bff0c','pinned S82 hash')
ck(len(rows('case-register.csv'))==14,'14 source-bounded register rows, with qualifications')
ck(len(rows('catalogue-disposition.csv'))==41,'all 41 inherited catalogue claims accounted for')
raw=rows('s84-pushback-responses.csv')
ck(len(raw)==34,'34 exact S84 input rows')
for side,r,s in [('union',11,9),('confederate',5,9)]:
    for kind,count in [('comply_with_reservations',r),('slow_walk',s)]:
        ck(sum(x['side']==side and x['actual']==kind for x in raw)==count,f'raw {side} {kind}: {count}')
ck(len(rows('all-response-diagnostics.csv'))==208,'208 observed addressee response diagnostics')
ck(len(rows('relay-response-diagnostics.csv'))==11,'11 additional relay response diagnostics')
ck(sum(int(x['count']) for x in rows('raw-counts.csv'))==219,'all diagnostic groups sum to 219')
ck(score['matched_by_band']['reservations']==1 and sum(score['matched_by_band'].values())==1,'one bounded matched act')
ck(len(rows('unmatched-s84-responses.csv'))==33,'all 33 other S84 responses retained')
ck(score['no_pass_declared'],'no manufactured pass')
for c in rows('case-register.csv'):
    ck(bool(c['side'] and c['actor'] and c['role'] and c['matter'] and c['act'] and c['source_pages'] and c['unit']), 'complete register row: '+c['id'])
files=sorted([p for p in P.iterdir() if p.is_file()]+[R/'docs/research/2026-11-23-S87-proposed-pushback-measurement.md'])
note=R/'notes/sprint-S87-pushback-measurement.md'
if note.exists(): files.append(note)
for p in files:
    b=p.read_bytes(); t=b.decode('utf-8')
    ck(not b.startswith(b'\xef\xbb\xbf') and '\ufffd' not in t,'UTF-8 without BOM/replacement: '+p.name)
    if p.suffix=='.md':
        for target in re.findall(r'\]\(([^)]+)\)',t):
            if '://' not in target and not target.startswith('#'): ck((p.parent/target.split('#')[0]).exists(),'local link: '+target)
inventory={str(p.relative_to(R)).replace('\\','/'):{'bytes':p.stat().st_size,'sha256':sha(p)} for p in files}
(P/'verification.json').write_text(json.dumps({'status':'pass','checks':len(checks),
  'original_files_preserved':len(base['files']),'register_rows':14,'catalogue_claims':41,
  'runtime_changes':0,'new_campaigns':0,'scope':'Documentation/research packet only; hook evidence reported separately.'},indent=2)+'\n',encoding='utf-8',newline='\n')
(O/'verification-detail.json').write_text(json.dumps(checks,indent=2)+'\n',encoding='utf-8')
(O/'delivery-inventory.json').write_text(json.dumps(inventory,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'status':'pass','checks':len(checks),'original_files_preserved':len(base['files']),'delivery_paths':len(files)}))
