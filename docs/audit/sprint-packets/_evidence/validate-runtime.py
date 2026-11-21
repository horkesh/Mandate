"""Bounded required validation; preserve raw logs and exit receipts locally."""
import json, os, pathlib, subprocess, time
ROOT = pathlib.Path(__file__).resolve().parents[4]
OUT = pathlib.Path(__file__).resolve().parent/'validation-raw'
OUT.mkdir(exist_ok=True)
env=dict(os.environ, VITEST_MAX_WORKERS='1')
env.pop('MANDATE_NO_GIT',None)
jobs=[('preflight',['node','--import','tsx','docs/audit/sprint-packets/_evidence/run-done.ts','--preflight'],env),
      ('check',['cmd','/c','npm run check'],dict(env, MANDATE_NO_GIT='1')),
      ('done-check',['node','--import','tsx','docs/audit/sprint-packets/_evidence/run-done.ts'],env)]
for name,args,e in jobs:
    start=time.monotonic()
    with (OUT/f'{name}.log').open('w',encoding='utf-8') as log:
        result=subprocess.run(args,cwd=ROOT,stdout=log,stderr=subprocess.STDOUT,env=e)
    receipt={'command':args,'exit':result.returncode,'seconds':time.monotonic()-start,'workers':1,'noGit':e.get('MANDATE_NO_GIT')}
    (OUT/f'{name}.json').write_text(json.dumps(receipt,indent=2)+'\n',encoding='utf-8')
    print(name,json.dumps(receipt),flush=True)
    if result.returncode and name!='done-check': break
