"""Publish a completed, separately measured S153 optimisation proof."""
import hashlib,json,sys
from pathlib import Path
stage,baseline=sys.argv[1:]
root=Path('runs/s153');out=Path('docs/audit/s153-evidence')
names=['history','war','testbed'];rows=[]
for name in names:
    a=json.loads((root/f'{stage}-proof/{name}.json').read_text(encoding='utf-8'))
    b=json.loads((root/f'{baseline}-proof/{name}.json').read_text(encoding='utf-8'))
    fields=['worldHash','initialHash','turns','daily','liveness','checkpoints','finalHash','logEntries','decisionPoints','rejections']
    assert all(a[k]==b[k] for k in fields),name
    rows.append(dict(reference=name,days=len(a['turns']),finalHash=a['finalHash'],equalFields=fields,everyDailyHash=a['turns']))
timings={}
for tag in [baseline,stage]:
    timings[tag]={name:json.loads((root/f'{tag}-timing/{name}.json').read_text(encoding='utf-8'))['timing'] for name in names[:2]}
inputs=json.loads((root/f'{stage}-inputs.json').read_text(encoding='utf-8'))
for r in inputs:assert hashlib.sha256(Path(r['path']).read_bytes()).hexdigest()==r['sha256'],r['path']
result=dict(stage=stage,baseline=baseline,days=sum(r['days'] for r in rows),allDailyHashesAndNonClockOutputsEqual=True,references=rows,advisoryWindowsTimings=timings,measuredInputs=inputs,linuxAcceptance='pending hosted CI; unchanged 40 ms median / 160 ms p95 for both runs')
(out/f'{stage}-proof.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8',newline='\n')
print(json.dumps(dict(stage=stage,days=result['days'],allEqual=True,timings=timings)))
