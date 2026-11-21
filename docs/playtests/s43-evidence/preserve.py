from pathlib import Path
import subprocess,hashlib,json,sys
root=Path(__file__).resolve().parents[3]
out=Path(__file__).resolve().parent
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
paths=subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0')
paths=[p for p in paths if p]
snapshot={p:sha(root/p) for p in paths}
if '--before' in sys.argv:
 (out/'baseline.json').write_text(json.dumps(snapshot,indent=2)+'\n',encoding='utf-8')
 print('baseline',len(snapshot))
else:
 before=json.loads((out/'baseline.json').read_text())
 changed=[p for p,h in before.items() if not (root/p).exists() or sha(root/p)!=h]
 result={'originalTrackedFiles':len(before),'unchanged':len(before)-len(changed),'changed':changed,
 'head':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode().strip(),
 'status':subprocess.check_output(['git','status','--short'],cwd=root).decode()}
 (out/'preservation.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(result))
 if changed:sys.exit(1)
