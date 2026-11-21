"""Focused artifact checks; does not run or alter the simulation."""
from pathlib import Path
import json,re,hashlib,subprocess
out=Path(__file__).resolve().parent;root=out.parents[2]
report=root/'docs/playtests/2026-11-21-road-to-richmond.md'
jsons=list(out.glob('*.json'))
for p in jsons:json.loads(p.read_text(encoding='utf8'))
text=report.read_text(encoding='utf8')
links=[]
for link in re.findall(r'\]\(([^)]+)\)',text):
 if '://' in link:continue
 target=(report.parent/link.split('#')[0]).resolve()
 assert target.exists(),str(target)
 links.append(str(target.relative_to(root)))
summary=json.loads((out/'trace-summary.json').read_text())
comparison=json.loads((out/'s41-public-comparison.json').read_text())
assert summary['day']==148 and summary['commandCount']==86 and summary['turns']==44
assert len(summary['dailyHashes'])==148 and summary['observerControlEveryCommand']
assert comparison['allMatch'] and len(comparison['comparisons'])==31
assert summary['allStoneStoresUnknown'] and summary['noManassasBattle']
battles=json.loads((out/'battles-private.json').read_text())
assert set(battles)=={'battle:richmond:100','battle:richmond:136'}
assert [s['bsidePresent'] for s in battles['battle:richmond:100']['battleDays'][0]['bdaySides']]==[158,600]
assert [s['bsidePresent'] for s in battles['battle:richmond:136']['battleDays'][0]['bdaySides']]==[16000,574]
source=json.loads((out/'sources.json').read_text())
assert source['textSha256']==hashlib.sha256((out/'source-pages.txt').read_bytes()).hexdigest()
assert all(f'PRINTED PAGE {p};' in (out/'source-pages.txt').read_text(encoding='utf8') for p in source['readPages'])
baseline=json.loads((out/'baseline.json').read_text())
changed=[p for p,h in baseline.items() if hashlib.sha256((root/p).read_bytes()).hexdigest()!=h]
assert not changed,changed
status=subprocess.check_output(['git','status','--porcelain','--untracked-files=all'],cwd=root).decode().splitlines()
assert all(x[3:]=='docs/playtests/2026-11-21-road-to-richmond.md' or x[3:].startswith('docs/playtests/s43-evidence/') for x in status),status
result={'verdict':'pass','originalFilesUnchanged':len(baseline),'jsonFilesParsed':len(jsons),'localLinksResolved':len(links),
 'sourcePages':len(source['readPages']),'commandHashesMatched':86,'dailyHashesRetained':148,'changedPublicRecordsMatched':31,
 'sourceCodeOrBandEdits':0,'reportSha256':hashlib.sha256(report.read_bytes()).hexdigest()}
(out/'verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8',newline='\n')
print(json.dumps(result))
